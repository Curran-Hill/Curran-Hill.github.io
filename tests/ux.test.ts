import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readArchiveState,
  archiveParams,
  matchesArchiveSearch,
} from "../src/lib/archive-state.ts";
import { renderMarkdown } from "../src/lib/content.ts";
import path from "node:path";

const options = {
  difficulty: ["", "Easy".toLowerCase(), "hard"],
  os: ["", "linux", "windows"],
};
test("search matches multiple words across title and tags regardless of case or order", () => {
  const text = "Outbound CVE SQL Cryptography Easy Linux";
  assert(matchesArchiveSearch(text, " linux  OUTBOUND "));
  assert(matchesArchiveSearch(text, "crypto sql"));
  assert(matchesArchiveSearch(text, "  "));
  assert(!matchesArchiveSearch(text, "outbound windows"));
});
test("archive search and combined filters round-trip without losing unrelated URL state", () => {
  const params = archiveParams(
    new URLSearchParams("ref=journal&difficulty=invalid"),
    {
      query: "  Outbound SQL  ",
      filters: { difficulty: "easy", os: "linux" },
    },
    options,
  );
  assert.equal(params.get("ref"), "journal");
  assert.deepEqual(readArchiveState(params, options), {
    query: "Outbound SQL",
    filters: { difficulty: "easy", os: "linux" },
  });
  const cleared = archiveParams(params, { query: "", filters: {} }, options);
  assert.equal(cleared.toString(), "ref=journal");
});
test("invalid or foreign archive filters never hide all content silently", () => {
  const state = readArchiveState(
    new URLSearchParams("difficulty=impossible&os=linux&event=other&q=SQL"),
    options,
  );
  assert.deepEqual(state, { query: "SQL", filters: { os: "linux" } });
  assert.equal(
    archiveParams(
      new URLSearchParams(),
      { query: "", filters: { difficulty: "impossible" } },
      options,
    ).toString(),
    "",
  );
});
test("authored heading gaps become a usable outline while text and existing anchors survive", async () => {
  const output = await renderMarkdown(
    "# Description\n\n#### Difficulty\n\n#### Operating system\n\n# Enumeration\n\n## Ports",
    path.join(process.cwd(), "_posts/blog/2026-01-01-fixture.md"),
  );
  assert.deepEqual(
    output.headings.map((h) => [h.depth, h.slug]),
    [
      [2, "description"],
      [3, "difficulty"],
      [3, "operating-system"],
      [2, "enumeration"],
      [3, "ports"],
    ],
  );
  assert.match(output.html, /aria-label="Link to section: Operating system"/);
});
test("screenshots retain native asset links and image semantics without nested anchors", async () => {
  const src = "/assets/images/HTM-SW16-cert.png";
  const output = await renderMarkdown(
    `![Certificate](${src})\n\n[![Linked certificate](${src})](${src})`,
    path.join(process.cwd(), "_posts/blog/2026-01-01-fixture.md"),
  );
  assert.equal((output.html.match(/<a /g) || []).length, 2);
  assert.match(output.html, /data-expand-image/);
  assert.match(output.html, /width="2339" height="1654"/);
  assert(!output.html.includes('role="button"'));
});
