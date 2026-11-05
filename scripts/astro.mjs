import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const isEditor = process.argv[2] === "admin";
const command = isEditor ? "dev" : process.argv[2];

if (command === "build" || command === "dev") {
  try {
    if (command === "build")
      fs.rmSync(path.join(root, "public/attachments"), {
        recursive: true,
        force: true,
      });
    const { getPosts } = await import("../src/lib/content.ts");
    await getPosts(command === "dev");
    const { siteData } = await import("../src/lib/site-data.ts");
    const { prepareSiteAssets } = await import("../src/lib/site-images.ts");
    await prepareSiteAssets(siteData);
  } catch (error) {
    console.error(`\nContent check failed:\n${error.message}\n`);
    if (!isEditor) process.exit(1);
  }
}
const child = spawn(
  process.execPath,
  [
    path.join(root, "node_modules/astro/bin/astro.mjs"),
    command,
    ...process.argv.slice(3),
  ],
  {
    stdio: "inherit",
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
  },
);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  if (isEditor && code === 0) {
    try {
      const running = JSON.parse(
        fs.readFileSync(path.join(root, ".astro/dev.json"), "utf8"),
      );
      console.log(`\nPond keeper: ${running.url.replace(/\/$/, "")}/admin/\n`);
    } catch {
      /* Foreground mode prints its URL when it starts. */
    }
  }
  if (command === "build" && code === 0) {
    // GitHub Pages must serve the original .html URLs without redirecting to a directory.
    for (const name of ["htb", "ctf", "blog"]) {
      const target = path.join(root, "dist", `${name}.html`);
      if (fs.statSync(target).isDirectory()) {
        const html = fs.readFileSync(path.join(target, "index.html"));
        fs.rmSync(target, { recursive: true });
        fs.writeFileSync(target, html);
      }
    }
    const check = spawn(
      process.execPath,
      [path.join(root, "scripts/verify-build.mjs")],
      { stdio: "inherit" },
    );
    check.on("exit", (checkCode) => {
      process.exitCode = checkCode ?? 1;
    });
  }
  process.exitCode = code ?? 1;
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
