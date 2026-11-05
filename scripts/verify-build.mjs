import fs from "node:fs";
import path from "node:path";
const root = path.resolve("dist"),
  origin = "https://www.duckp0nd.com";
const files = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : [path.join(dir, e.name)],
    );
let checks = 0;
const failures = [];
for (const file of files(root).filter((f) => f.endsWith(".html"))) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file).split(path.sep).join("/");
  const page =
    relative === "index.html"
      ? "/"
      : relative.endsWith("/index.html")
        ? "/" + relative.slice(0, -10)
        : "/" + relative;
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll("&amp;", "&"), origin + page);
    if (url.origin !== origin) continue;
    const pathname = decodeURIComponent(url.pathname);
    const candidates = [
      path.join(root, pathname),
      path.join(root, pathname, "index.html"),
    ];
    const target = candidates.find(
      (p) => fs.existsSync(p) && fs.statSync(p).isFile(),
    );
    checks++;
    if (!target) {
      failures.push(`${page}: missing ${url.pathname}`);
      continue;
    }
    if (url.hash && target.endsWith(".html")) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!fs.readFileSync(target, "utf8").includes(`id="${id}"`))
        failures.push(`${page}: missing anchor ${url.pathname}${url.hash}`);
    }
  }
}
for (const name of ["admin", "__editor", "_posts", "_data", ".editor-backups"])
  if (fs.existsSync(path.join(root, name)))
    failures.push(
      `Private editor/content folder leaked into production: ${name}`,
    );
for (const name of ["htb", "ctf", "blog"])
  if (!fs.statSync(path.join(root, `${name}.html`)).isFile())
    failures.push(`${name}.html must be a file`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `Verified ${checks} local page, asset, and anchor references in the production build.`,
);
