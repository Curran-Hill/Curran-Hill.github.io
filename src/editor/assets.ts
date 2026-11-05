import fs from "node:fs";
import path from "node:path";
import { stripTypeScriptTypes } from "node:module";
/** Serve an isolated editor client: site HMR must never discard unsaved forms. */
export function editorAsset(
  root: string,
  name: string,
): { type: string; body: string | Buffer } | undefined {
  const modules: Record<string, string> = {
    "main.js": "src/editor/main.ts",
    "ui.js": "src/editor/ui.ts",
    "posts.js": "src/editor/posts.ts",
    "settings.js": "src/editor/settings.ts",
    "icons.js": "src/lib/pixel-icons.ts",
    "calendar.js": "src/lib/calendar.ts",
  };
  if (modules[name]) {
    const code = stripTypeScriptTypes(
      fs.readFileSync(path.join(root, modules[name]), "utf8"),
      { mode: "strip" },
    )
      .replace(/^import ["']\.\/editor\.css["'];?\s*/m, "")
      .replace(
        /from ["']\.\/(ui|posts|settings)["']/g,
        'from "/__editor/assets/$1.js"',
      )
      .replace(
        /from ["']\.\.\/lib\/pixel-icons["']/g,
        'from "/__editor/assets/icons.js"',
      );
    return {
      type: "text/javascript; charset=utf-8",
      body: code.replace(
        /from ["']\.\.\/lib\/calendar["']/g,
        'from "/__editor/assets/calendar.js"',
      ),
    };
  }
  if (name === "editor.css") {
    const fonts = `@font-face{font-family:'DM Sans Variable';font-style:normal;font-weight:100 1000;font-display:swap;src:url('/__editor/assets/body.woff2') format('woff2')}@font-face{font-family:'Pixelify Sans Variable';font-style:normal;font-weight:400 700;font-display:swap;src:url('/__editor/assets/heading.woff2') format('woff2')}`;
    return {
      type: "text/css; charset=utf-8",
      body:
        fonts +
        fs.readFileSync(path.join(root, "src/styles/pixel.css"), "utf8") +
        fs
          .readFileSync(path.join(root, "src/editor/editor.css"), "utf8")
          .replace(/^@import[^;]+;\s*/gm, ""),
    };
  }
  const fonts: Record<string, string> = {
    "body.woff2": "dm-sans/files/dm-sans-latin-wght-normal.woff2",
    "heading.woff2":
      "pixelify-sans/files/pixelify-sans-latin-wght-normal.woff2",
  };
  if (fonts[name])
    return {
      type: "font/woff2",
      body: fs.readFileSync(
        path.join(root, "node_modules/@fontsource-variable", fonts[name]),
      ),
    };
}
