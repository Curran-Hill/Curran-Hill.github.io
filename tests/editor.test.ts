import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createServer, request } from "node:http";
import { createEditorStore, EditorError } from "../src/editor/server.ts";
import { editorPlugin } from "../src/editor/plugin.ts";
import { validateSiteData } from "../src/lib/site-schema.ts";
import type { SiteData } from "../src/lib/site-schema.ts";
const original = JSON.parse(
  fs.readFileSync("_data/site.json", "utf8"),
) as SiteData;
const metadata = {
  title: "Editor test",
  date: "2026-01-01",
  categories: "blog",
  tags: [],
  published: false,
};
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "duckpond-editor-"));
  fs.mkdirSync(path.join(root, "_posts"));
  fs.mkdirSync(path.join(root, "_data"));
  const site = structuredClone(original);
  for (const row of [...site.about.awards, ...site.about.certifications])
    delete row.image;
  site.about.body = "An introduction.";
  fs.writeFileSync(path.join(root, "_data/site.json"), JSON.stringify(site));
  return {
    root,
    store: createEditorStore(root),
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}
test("editor creates drafts and preserves extra frontmatter and original URLs when dates/categories change", async () => {
  const f = fixture();
  try {
    let post = await f.store.save({
      data: metadata,
      body: "## A draft\n\nHello.",
    });
    assert.equal(post.file, "blog/2026-01-01-editor-test.md");
    assert.equal(post.data.published, false);
    const filename = path.join(f.root, "_posts", post.file);
    fs.writeFileSync(
      filename,
      fs
        .readFileSync(filename, "utf8")
        .replace(
          "title: Editor test",
          "layout: post\ncustom_field: keep-me\ntitle: Editor test",
        ),
    );
    post = f.store.read(post.file);
    const next = await f.store.save({
      ...post,
      data: {
        ...post.data,
        categories: "ctf",
        date: "2026-02-01",
        title: "Changed display title",
      },
    });
    assert.equal(next.url, post.url);
    assert.equal(next.data.custom_field, "keep-me");
    assert.equal(next.data.layout, "post");
    const backup = fs.readdirSync(path.join(f.root, ".editor-backups"));
    assert.equal(backup.length, 1);
    assert.match(
      fs.readFileSync(path.join(f.root, ".editor-backups", backup[0]), "utf8"),
      /keep-me/,
    );
  } finally {
    f.cleanup();
  }
});
test("editor refuses stale post and site saves without changing newer disk content", async () => {
  const f = fixture();
  try {
    const post = await f.store.save({ data: metadata, body: "First body" });
    const filename = path.join(f.root, "_posts", post.file);
    fs.appendFileSync(filename, "\nExternal Obsidian edit");
    await assert.rejects(
      () => f.store.save({ ...post, body: "Overwrite" }),
      (e) => e instanceof EditorError && e.status === 409,
    );
    assert.match(fs.readFileSync(filename, "utf8"), /External Obsidian edit/);
    const site = f.store.site();
    const saved = await f.store.saveSite(
      { ...site.data, homeSubtitle: "Fresh subtitle" },
      site.revision,
    );
    await assert.rejects(
      () => f.store.saveSite(site.data, site.revision),
      /changed outside/,
    );
    assert.equal(f.store.site().revision, saved.revision);
  } finally {
    f.cleanup();
  }
});
test("editor rejects paths outside its vault, unsafe dates, and linked category folders", async () => {
  const f = fixture(),
    outside = fs.mkdtempSync(path.join(os.tmpdir(), "duckpond-outside-"));
  try {
    assert.throws(() => f.store.read("../_data/site.json"), /valid post/);
    assert.throws(
      () => f.store.read(path.join(outside, "private.md")),
      /outside/,
    );
    await assert.rejects(
      () =>
        f.store.save({
          data: { ...metadata, date: "../../escape" },
          body: "No",
        }),
      /date/,
    );
    fs.symlinkSync(outside, path.join(f.root, "_posts/blog"));
    await assert.rejects(
      () => f.store.save({ data: metadata, body: "No" }),
      /outside/,
    );
    assert.equal(fs.readdirSync(outside).length, 0);
  } finally {
    f.cleanup();
    fs.rmSync(outside, { recursive: true });
  }
});
test("editor refuses duplicate new posts and preserves the first file", async () => {
  const f = fixture();
  try {
    const p = await f.store.save({ data: metadata, body: "First" });
    await assert.rejects(
      () => f.store.save({ data: metadata, body: "Second" }),
      (e) => e instanceof EditorError && e.status === 409,
    );
    assert.match(f.store.read(p.file).body, /First/);
  } finally {
    f.cleanup();
  }
});
test("invalid metadata and missing images identify the source, and valid metadata can repair an existing post", async () => {
  const f = fixture();
  try {
    await assert.rejects(
      () =>
        f.store.save({
          data: { ...metadata, date: "2026-02-30" },
          body: "Bad",
        }),
      /date must be a real/,
    );
    await assert.rejects(
      () => f.store.save({ data: metadata, body: "![Image](missing.png)" }),
      /editor-test.md: missing image/,
    );
    const file = path.join(f.root, "_posts/2026-01-01-bad.md");
    fs.writeFileSync(
      file,
      "---\ntitle: Bad\ndate: 2026-02-30\ncategories: blog\n---\nBody",
    );
    assert.match(
      f.store.list().find((p) => p.file.endsWith("bad.md"))!.error!,
      /date/,
    );
    const bad = f.store.read("2026-01-01-bad.md");
    await f.store.save({ ...bad, data: { ...bad.data, date: "2026-02-28" } });
    assert.equal(
      f.store.list().find((p) => p.file.endsWith("bad.md"))!.error,
      undefined,
    );
  } finally {
    f.cleanup();
  }
});
test("image uploads preserve spaces, deduplicate bytes, suffix conflicts, and reject disguised files", async () => {
  const f = fixture();
  try {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aNm0AAAAASUVORK5CYII=",
      "base64",
    );
    const a = f.store.upload("pasted image.png", png.toString("base64"));
    assert.equal(a.reference, "Attachments/pasted image.png");
    assert.equal(
      f.store.upload("pasted image.png", png.toString("base64")).reference,
      a.reference,
    );
    const b = f.store.upload(
      "pasted image.png",
      Buffer.concat([png, Buffer.from("different")]).toString("base64"),
    );
    assert.notEqual(b.reference, a.reference);
    assert.match(b.url, /%20/);
    assert.throws(
      () => f.store.upload("image.png", Buffer.from("HTML").toString("base64")),
      /Use a PNG/,
    );
    assert.throws(
      () => f.store.upload("image.svg", png.toString("base64")),
      /Use a PNG/,
    );
    const preview = await f.store.preview({
      data: metadata,
      body: "![[pasted image.png]]",
    });
    assert.match(preview.html, /attachments/);
  } finally {
    f.cleanup();
  }
});
test("site settings reject unsafe links, empty credentials, and inverted quack timing", () => {
  assert.equal(validateSiteData(original), original);
  assert.throws(
    () =>
      validateSiteData({
        ...original,
        pond: { ...original.pond, quackIntervalMax: 5 },
      }),
    /quackIntervalMax/,
  );
  const bad = structuredClone(original);
  bad.contact.links = [
    { name: "Test", label: "Test", href: "javascript:alert(1)", icon: "mail" },
  ];
  assert.throws(() => validateSiteData(bad), /contact.links.0.href/);
  const empty = structuredClone(original);
  empty.about.certifications = [
    { name: "", completed: "May 2026", expires: "" },
  ];
  assert.throws(() => validateSiteData(empty), /certifications.0.name/);
});
test("preview renders headings and highlighted code while writes reject missing required metadata", async () => {
  const f = fixture();
  try {
    const out = await f.store.preview({
      data: metadata,
      body: "## Title\n\n```bash\necho pond\n```",
    });
    assert.match(out.html, /id="title"/);
    assert.match(out.html, /shiki/);
    await assert.rejects(
      () => f.store.save({ data: { ...metadata, title: "" }, body: "Body" }),
      /title/,
    );
  } finally {
    f.cleanup();
  }
});
test("local API denies foreign hosts, origins, missing tokens and non-JSON writes", async () => {
  let middleware: any;
  const fake = {
    middlewares: {
      use(fn: unknown) {
        middleware = fn;
      },
    },
    httpServer: { once() {} },
  };
  const plugin = editorPlugin();
  (plugin.configureServer as Function)(fake);
  const server = createServer((req, res) =>
    middleware(req, res, () => {
      res.statusCode = 404;
      res.end();
    }),
  );
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address() as { port: number };
  const call = (headers: Record<string, string>, method = "GET") =>
    new Promise<number>((resolve, reject) => {
      const req = request(
        {
          host: "127.0.0.1",
          port: address.port,
          path: "/__editor/state",
          method,
          headers,
        },
        (res) => {
          res.resume();
          res.on("end", () => resolve(res.statusCode!));
        },
      );
      req.on("error", reject);
      req.end(method === "POST" ? "{}" : undefined);
    });
  try {
    assert.equal(await call({ Host: `evil.example:${address.port}` }), 403);
    assert.equal(
      await call({
        Host: `127.0.0.1:${address.port}`,
        Origin: "https://other.example",
      }),
      403,
    );
    assert.equal(
      await call(
        {
          Host: `127.0.0.1:${address.port}`,
          Origin: `http://127.0.0.1:${address.port}`,
        },
        "POST",
      ),
      403,
    );
    assert.equal(await call({ Host: `127.0.0.1:${address.port}` }), 200);
  } finally {
    await new Promise<void>((r, j) => server.close((e) => (e ? j(e) : r())));
  }
});

test("broken YAML and site JSON name the file that needs repair", () => {
  const f = fixture();
  try {
    fs.writeFileSync(
      path.join(f.root, "_posts/2026-01-01-syntax.md"),
      "---\ntitle: [unterminated\n---\nBody",
    );
    assert.throws(
      () => f.store.read("2026-01-01-syntax.md"),
      /2026-01-01-syntax.md/,
    );
    fs.writeFileSync(path.join(f.root, "_data/site.json"), "{broken");
    assert.throws(() => f.store.site(), /_data\/site.json: invalid JSON/);
  } finally {
    f.cleanup();
  }
});
