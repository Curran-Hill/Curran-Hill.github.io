import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import {
  filesBelow,
  validateMetadata,
  renderMarkdown,
  imageUrl,
} from "../lib/content.ts";
import { validateSiteData } from "../lib/site-schema.ts";
import { prepareSiteAssets } from "../lib/site-images.ts";

export class EditorError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
const hash = (value: string | Buffer) =>
  crypto.createHash("sha256").update(value).digest("hex");
const postFields = [
  "title",
  "date",
  "categories",
  "tags",
  "published",
  "difficulty",
  "os",
  "event",
  "ctf_category",
  "thumbnail",
];
export function createEditorStore(root: string) {
  root = fs.realpathSync(root);
  const vault = path.join(root, "_posts"),
    siteFile = path.join(root, "_data/site.json");
  function inside(file: string, parent = vault) {
    if (!file.startsWith(parent + path.sep))
      throw new EditorError(400, "That file is outside the content folder.");
    let existing = file;
    while (!fs.existsSync(existing)) existing = path.dirname(existing);
    const resolved = fs.realpathSync(existing),
      allowed = fs.realpathSync(parent);
    if (
      !allowed.startsWith(root + path.sep) ||
      (resolved !== allowed && !resolved.startsWith(allowed + path.sep))
    )
      throw new EditorError(
        400,
        "Linked files outside the content folder cannot be edited.",
      );
    return file;
  }
  function postPath(id: string) {
    if (
      typeof id !== "string" ||
      id.includes("\\") ||
      id.split("/").some((p) => p.startsWith("."))
    )
      throw new EditorError(400, "Choose a valid post.");
    const file = inside(path.resolve(vault, id));
    if (!filesBelow(vault).includes(file) || !file.endsWith(".md"))
      throw new EditorError(404, "Post not found.");
    return file;
  }
  function parse(
    file: string,
    strict = true,
  ): {
    file: string;
    revision: string;
    data: Record<string, unknown> & {
      title: string;
      date: string;
      categories: string;
      published: boolean;
    };
    body: string;
    url: string;
    raw: string;
  } {
    const raw = fs.readFileSync(file, "utf8");
    let parsed;
    try {
      parsed = matter(raw);
    } catch (error) {
      throw new EditorError(
        400,
        path.relative(root, file) + ": " + (error as Error).message,
      );
    }
    if (parsed.data.date instanceof Date) {
      const authored = parsed.matter.match(/^[ \t]*date:[ \t]*(.+)$/m);
      parsed.data.date = authored
        ? authored[1].split(/\s+#/)[0].trim()
        : parsed.data.date.toISOString().slice(0, 10);
    }
    let meta;
    try {
      meta = validateMetadata(parsed.data, file);
    } catch (error) {
      if (strict) throw error;
      meta = {
        date: String(parsed.data.date || ""),
        category: String(
          Array.isArray(parsed.data.categories)
            ? parsed.data.categories[0]
            : parsed.data.categories || "blog",
        ),
        url: "",
      };
    }
    return {
      file: path.relative(vault, file).replaceAll(path.sep, "/"),
      revision: hash(raw),
      data: {
        ...parsed.data,
        title: String(parsed.data.title || ""),
        date: meta.date,
        categories: meta.category,
        published: parsed.data.published !== false,
      },
      body: parsed.content,
      url: meta.url,
      raw,
    };
  }
  function backup(file: string, raw: string) {
    const dir = path.join(root, ".editor-backups");
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    if (fs.realpathSync(dir) !== dir)
      throw new EditorError(
        400,
        "The backup folder must be inside the project.",
      );
    const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${path.basename(file)}`;
    fs.writeFileSync(path.join(dir, name), raw, { flag: "wx", mode: 0o600 });
  }
  function write(file: string, text: string, revision: string) {
    const before = fs.readFileSync(file, "utf8");
    if (!revision || hash(before) !== revision)
      throw new EditorError(
        409,
        "This file changed outside the editor. Reload it before saving; your unsaved text is still here.",
      );
    backup(file, before);
    const temporary =
      file + `.editor-${crypto.randomBytes(6).toString("hex")}.tmp`;
    try {
      fs.writeFileSync(temporary, text, {
        flag: "wx",
        mode: fs.statSync(file).mode,
      });
      fs.renameSync(temporary, file);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }
  async function preview(
    data: Record<string, unknown>,
    body: string,
    file: string,
  ) {
    if (typeof body !== "string" || body.length > 1_000_000)
      throw new EditorError(400, "The post must be text under 1 MB.");
    validateMetadata(data, file);
    if (data.thumbnail) imageUrl(String(data.thumbnail), file, root);
    return (await renderMarkdown(body, file, root)).html;
  }
  return {
    list() {
      return filesBelow(vault)
        .filter((f) => f.endsWith(".md"))
        .map((f) => {
          try {
            const doc = parse(inside(f));
            return {
              file: doc.file,
              title: doc.data.title,
              date: doc.data.date,
              category: doc.data.categories,
              draft:
                !doc.data.published ||
                doc.data.date > new Date().toISOString().slice(0, 10),
              url: doc.url,
            };
          } catch (error) {
            return {
              file: path.relative(vault, f),
              title: path.basename(f),
              error: (error as Error).message,
              draft: true,
              category: "invalid",
              date: "",
            };
          }
        })
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    read(id: string) {
      const { raw, ...doc } = parse(postPath(id), false);
      return doc;
    },
    site() {
      inside(siteFile, path.dirname(siteFile));
      const raw = fs.readFileSync(siteFile, "utf8");
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new EditorError(
          400,
          "_data/site.json: invalid JSON. Correct this file in a text editor, then reload.",
        );
      }
      return { data: validateSiteData(data), revision: hash(raw) };
    },
    async saveSite(data: unknown, revision: string) {
      inside(siteFile, path.dirname(siteFile));
      const checked = validateSiteData(data);
      if (hash(fs.readFileSync(siteFile, "utf8")) !== revision)
        throw new EditorError(
          409,
          "Site settings changed outside the editor. Reload before saving; your unsaved text is still here.",
        );
      await prepareSiteAssets(checked, root);
      write(siteFile, JSON.stringify(checked, null, 2) + "\n", revision);
      return this.site();
    },
    async save(input: {
      file?: string;
      revision?: string;
      data: Record<string, unknown>;
      body: string;
    }) {
      let file: string, data: Record<string, unknown>;
      if (input.file) {
        file = postPath(input.file);
        const old = parse(file, false);
        data = { ...old.data };
        if (old.revision !== input.revision)
          throw new EditorError(
            409,
            "This post changed outside the editor. Reload it before saving; your unsaved text is still here.",
          );
        for (const key of postFields)
          if (Object.hasOwn(input.data, key)) data[key] = input.data[key];
        const next = validateMetadata(data, file);
        if (old.url && next.url !== old.url) data.permalink = old.url;
      } else {
        data = Object.fromEntries(
          postFields
            .filter((k) => Object.hasOwn(input.data, k))
            .map((k) => [k, input.data[k]]),
        );
        const slug = String(data.title || "")
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        if (!slug)
          throw new EditorError(
            400,
            "Give this post a title with at least one letter or number.",
          );
        if (!["htb", "ctf", "blog"].includes(String(data.categories)))
          throw new EditorError(400, "Choose HTB, CTF or Blog.");
        // Validate the date before using it in a filesystem path.
        validateMetadata(data, `2000-01-01-${slug}.md`);
        file = inside(
          path.join(vault, String(data.categories), `${data.date}-${slug}.md`),
        );
        fs.mkdirSync(path.dirname(file), { recursive: true });
        inside(path.dirname(file) + path.sep + "new.md");
      }
      await preview(data, input.body, file);
      const text = matter.stringify(input.body, data);
      if (input.file) write(file, text, input.revision!);
      else {
        try {
          fs.writeFileSync(file, text, { flag: "wx" });
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "EEXIST")
            throw new EditorError(
              409,
              "A post with that title and date already exists. Choose another title.",
            );
          throw error;
        }
      }
      return this.read(path.relative(vault, file).replaceAll(path.sep, "/"));
    },
    async preview(input: {
      file?: string;
      data: Record<string, unknown>;
      body: string;
    }) {
      const file = input.file
        ? postPath(input.file)
        : path.join(vault, "blog", "2000-01-01-preview.md");
      return { html: await preview(input.data, input.body, file) };
    },
    upload(name: string, encoded: string) {
      if (
        typeof name !== "string" ||
        typeof encoded !== "string" ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)
      )
        throw new EditorError(400, "Choose an image file.");
      const clean = path
        .basename(name.replaceAll("\\", "/"))
        .normalize("NFC")
        .replace(/[\x00-\x1f<>:"|?*]/g, "_");
      if (!clean || clean.length > 180 || clean.startsWith("."))
        throw new EditorError(
          400,
          "Use an image filename under 180 characters.",
        );
      const bytes = Buffer.from(encoded, "base64"),
        ext = path.extname(clean).toLowerCase();
      const signature =
        (ext === ".png" &&
          bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
        ([".jpg", ".jpeg"].includes(ext) &&
          bytes[0] === 255 &&
          bytes[1] === 216 &&
          bytes[2] === 255) ||
        (ext === ".gif" && /^GIF8[79]a$/.test(bytes.toString("ascii", 0, 6))) ||
        (ext === ".webp" &&
          bytes.toString("ascii", 0, 4) === "RIFF" &&
          bytes.toString("ascii", 8, 12) === "WEBP");
      if (!signature || !bytes.length || bytes.length > 12 * 1024 * 1024)
        throw new EditorError(
          400,
          "Use a PNG, JPEG, WebP or GIF image up to 12 MB.",
        );
      const dir = path.join(vault, "Attachments");
      fs.mkdirSync(dir, { recursive: true });
      if (!fs.realpathSync(dir).startsWith(fs.realpathSync(vault) + path.sep))
        throw new EditorError(400, "Attachments must stay inside the vault.");
      let target = path.join(dir, clean);
      if (fs.existsSync(target)) {
        inside(target);
        if (hash(fs.readFileSync(target)) !== hash(bytes))
          target = path.join(
            dir,
            `${path.basename(clean, ext)}-${hash(bytes).slice(0, 8)}${ext}`,
          );
      }
      if (!fs.existsSync(target))
        fs.writeFileSync(target, bytes, { flag: "wx" });
      const reference = "Attachments/" + path.basename(target);
      return {
        reference,
        url: imageUrl(reference, path.join(vault, "profile.md"), root),
        name: path.basename(target),
      };
    },
  };
}
