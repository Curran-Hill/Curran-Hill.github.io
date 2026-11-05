import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolink from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import { codeToHtml } from "shiki";

export type Category = "htb" | "ctf" | "blog";
export type Post = {
  title: string;
  date: string;
  category: Category;
  url: string;
  tags: string[];
  difficulty?: string;
  os?: string;
  event?: string;
  ctf_category?: string;
  thumbnail?: string;
  draft: boolean;
  html: string;
  excerpt: string;
  headings: { depth: number; slug: string; text: string }[];
  source: string;
};
const root = process.cwd();
const ignored = new Set([".obsidian", "Templates", "Attachments", "_site"]);
export function filesBelow(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      ignored.has(e.name) || e.name.startsWith(".")
        ? []
        : e.isDirectory()
          ? filesBelow(path.join(dir, e.name))
          : [path.join(dir, e.name)],
    );
}
export function validateMetadata(data: Record<string, any>, filename: string) {
  const fail = (message: string): never => {
    throw new Error(`${filename}: ${message}`);
  };
  if (typeof data.title !== "string" || !data.title.trim())
    fail("title must be a non-empty string");
  const category = Array.isArray(data.categories)
    ? data.categories[0]
    : data.categories;
  if (!["htb", "ctf", "blog"].includes(category))
    fail("categories must be htb, ctf, or blog");
  const date =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date ?? "");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    fail("date must be a real calendar date in YYYY-MM-DD format");
  if (
    data.tags != null &&
    (!Array.isArray(data.tags) ||
      data.tags.some((t: unknown) => typeof t !== "string"))
  )
    fail("tags must be a list of strings");
  if (data.published !== undefined && typeof data.published !== "boolean")
    fail("published must be true or false (without quotes)");
  if (
    data.difficulty &&
    !["Easy", "Medium", "Hard", "Insane"].includes(data.difficulty)
  )
    fail("unrecognized HTB difficulty");
  if (data.os && !["Linux", "Windows"].includes(data.os))
    fail("os must be Linux or Windows");
  const match = path.basename(filename).match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
  if (!match) fail("post filename must be YYYY-MM-DD-title.md");
  const slug = match![1];
  const url =
    data.permalink || `/${category}/${date.replaceAll("-", "/")}/${slug}/`;
  if (typeof url !== "string" || !url.startsWith("/") || url.includes(".."))
    fail("permalink must be an absolute site path");
  return { category: category as Category, date, url };
}

export function imageUrl(
  reference: string,
  source: string,
  baseRoot = root,
): string {
  if (/^(https?:|data:)/i.test(reference)) return reference;
  let decoded: string;
  try {
    decoded = decodeURIComponent(reference);
  } catch {
    decoded = reference;
  }
  decoded = decoded.replace(/\\/g, "/");
  if (decoded.startsWith("/assets/") || decoded.startsWith("assets/")) {
    const relative = decoded.replace(/^\//, "");
    if (!fs.existsSync(path.join(baseRoot, "public", relative)))
      throw new Error(`${source}: missing image "${reference}"`);
    return "/" + relative.split("/").map(encodeURIComponent).join("/");
  }
  const vault = path.join(baseRoot, "_posts");
  const relative = decoded.replace(/^\//, "");
  const candidates = [
    path.resolve(path.dirname(source), relative),
    path.join(vault, relative),
    path.join(vault, "Attachments", relative),
  ];
  let found = candidates.find(
    (p) =>
      p.startsWith(vault + path.sep) &&
      fs.existsSync(p) &&
      fs.statSync(p).isFile(),
  );
  if (!found) {
    const all = [
      ...filesBelow(vault),
      ...filesBelow(path.join(vault, "Attachments")),
    ];
    const matches = all.filter(
      (p) => path.basename(p) === path.basename(relative),
    );
    if (matches.length > 1)
      throw new Error(
        `${source}: ambiguous image "${reference}"; use a vault-relative path`,
      );
    found = matches[0];
  }
  if (!found) throw new Error(`${source}: missing image "${reference}"`);
  if (!fs.realpathSync(found).startsWith(fs.realpathSync(vault) + path.sep))
    throw new Error(`${source}: image must stay inside the vault`);
  const bytes = fs.readFileSync(found);
  const name = `${crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 12)}-${path.basename(found)}`;
  const dest = path.join(baseRoot, "public", "attachments", name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) fs.writeFileSync(dest, bytes);
  return "/attachments/" + encodeURIComponent(name);
}

export async function renderMarkdown(
  body: string,
  source: string,
  baseRoot = root,
) {
  const headings: Post["headings"] = [];
  // Obsidian image embeds stay portable without touching the authored Markdown.
  const normalized = body.replace(
    /!\[\[([^\]\n]+)\]\]/g,
    (_, inner: string) => {
      const [file, alias] = inner.split("|");
      const alt =
        alias && !/^\d+(x\d+)?$/.test(alias)
          ? alias
          : path.basename(file, path.extname(file));
      return `![${alt.replace(/[\[\]]/g, "")}](${encodeURI(file).replaceAll("(", "%28").replaceAll(")", "%29")})`;
    },
  );
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(() => async (tree: any) => {
      const codes: any[] = [];
      const outline = [{ source: 0, depth: 1 }];
      visit(tree, "heading", (node: any) => {
        const source = node.depth;
        while (outline.length > 1 && outline.at(-1)!.source >= source)
          outline.pop();
        node.depth = Math.min(outline.at(-1)!.depth + 1, 6);
        outline.push({ source, depth: node.depth });
      });
      visit(tree, "image", (node: any) => {
        node.url = imageUrl(node.url, source, baseRoot);
        if (node.url.startsWith("/")) {
          const bytes = fs.readFileSync(
            path.join(baseRoot, "public", decodeURIComponent(node.url)),
          );
          if (bytes.length > 24 && bytes.toString("ascii", 1, 4) === "PNG") {
            node.data = {
              ...node.data,
              hProperties: {
                width: bytes.readUInt32BE(16),
                height: bytes.readUInt32BE(20),
              },
            };
          }
        }
      });
      visit(tree, "code", (node: any) => {
        codes.push(node);
      });
      for (const node of codes) {
        let html: string;
        try {
          html = await codeToHtml(node.value, {
            lang: node.lang || "text",
            themes: { dark: "github-dark", light: "github-light" },
          });
        } catch {
          html = await codeToHtml(node.value, {
            lang: "text",
            themes: { dark: "github-dark", light: "github-light" },
          });
        }
        node.type = "html";
        node.value = html;
      }
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(() => (tree: any) => {
      visit(
        tree,
        "element",
        (node: any, index: number | undefined, parent: any) => {
          if (/^h[1-6]$/.test(node.tagName))
            headings.push({
              depth: Number(node.tagName[1]),
              slug: String(node.properties.id),
              text: toString(node),
            });
          if (node.tagName === "img") {
            node.properties.loading = "lazy";
            node.properties.decoding = "async";
            // A real link also opens screenshots when JavaScript is unavailable.
            if (parent && parent.tagName !== "a" && index !== undefined) {
              parent.children[index] = {
                type: "element",
                tagName: "a",
                properties: {
                  href: node.properties.src,
                  className: ["image-expand"],
                  "data-expand-image": "",
                  "data-alt": node.properties.alt || "Screenshot",
                  ariaLabel: `Expand image: ${node.properties.alt || "Screenshot"}`,
                },
                children: [node],
              };
            }
          }
          if (
            node.tagName === "a" &&
            /^([a-z0-9-]+\.)+[a-z]{2,}\//i.test(String(node.properties.href))
          )
            node.properties.href = "https://" + node.properties.href;
        },
      );
    })
    .use(rehypeAutolink, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to this section",
      },
      content: { type: "text", value: "#" },
    })
    .use(() => (tree: any) => {
      visit(tree, "element", (node: any) => {
        if (!/^h[1-6]$/.test(node.tagName)) return;
        const anchor = node.children.find(
          (child: any) =>
            child.tagName === "a" &&
            child.properties?.className?.includes("heading-anchor"),
        );
        if (anchor)
          anchor.properties.ariaLabel = `Link to section: ${toString(node).replace(/#$/, "").trim()}`;
      });
    })
    .use(rehypeStringify);
  return { html: String(await processor.process(normalized)), headings };
}

export async function getPosts(includeDrafts = false): Promise<Post[]> {
  const posts = await Promise.all(
    filesBelow(path.join(root, "_posts"))
      .filter((f) => f.endsWith(".md"))
      .map(async (source) => {
        let parsed;
        try {
          parsed = matter(fs.readFileSync(source, "utf8"));
        } catch (error) {
          throw new Error(`${source}: ${(error as Error).message}`);
        }
        const { data, content } = parsed;
        // YAML's implicit Date conversion normalizes impossible dates; validate the authored value.
        if (data.date instanceof Date) {
          const authored = parsed.matter.match(/^[ \t]*date:[ \t]*(.+)$/m);
          if (authored) data.date = authored[1].split(/\s+#/)[0].trim();
        }
        const meta = validateMetadata(data, source);
        const draft =
          data.published === false ||
          meta.date > new Date().toISOString().slice(0, 10);
        if (draft && !includeDrafts) return null;
        const rendered = await renderMarkdown(content, source);
        if (data.thumbnail) imageUrl(data.thumbnail, source);
        return {
          ...meta,
          ...rendered,
          title: data.title.trim(),
          tags: data.tags || [],
          difficulty: data.difficulty,
          os: data.os,
          event: data.event,
          ctf_category: data.ctf_category,
          thumbnail: data.thumbnail,
          draft,
          source,
          excerpt: `${meta.category === "htb" ? [data.difficulty, data.os].filter(Boolean).join(" · ") : data.event || "Notes from the pond"}${data.tags?.length ? " — " + data.tags.join(", ") : ""}`,
        } as Post;
      }),
  );
  const visible = posts
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  const urls = new Set<string>();
  for (const p of visible) {
    if (urls.has(p.url))
      throw new Error(`${p.source}: duplicate permalink ${p.url}`);
    urls.add(p.url);
  }
  return visible;
}
export const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
