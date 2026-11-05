import { localCalendarDate } from "../src/lib/calendar.ts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [category, ...words] = process.argv.slice(2),
  title = words.join(" ").trim();
if (!["htb", "ctf", "blog"].includes(category) || !title) {
  console.error('Usage: npm run new -- htb|ctf|blog "Post title"');
  process.exit(1);
}
const slug = title
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
if (!slug) {
  console.error("Include at least one letter or number in the title.");
  process.exit(1);
}
const date = localCalendarDate(),
  directory = path.join(root, "_posts", category),
  file = path.join(directory, `${date}-${slug}.md`);
fs.mkdirSync(directory, { recursive: true });
const extra =
  category === "htb"
    ? "difficulty: Easy\nos: Linux\n"
    : category === "ctf"
      ? 'event: ""\nctf_category: Misc\n'
      : "";
const body = `---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\ncategories: ${category}\npublished: false\ntags: []\n${extra}---\n\n## Overview\n\n## Walkthrough\n\n## What I learned\n`;
try {
  fs.writeFileSync(file, body, { flag: "wx" });
} catch (error) {
  console.error(
    error.code === "EEXIST"
      ? `A post already exists at ${file}`
      : error.message,
  );
  process.exit(1);
}
console.log(
  `Created draft: ${file}\nPreview with npm run dev. Set published: true when it is ready.`,
);
