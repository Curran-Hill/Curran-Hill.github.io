import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import matter from "gray-matter";

const root = path.join(
  process.env.CODEX_HOME || path.join(os.homedir(), ".codex"),
  "skills",
);
const required = [
  "ui-ux-pro-max",
  "web-design-guidelines",
  "frontend-ui-engineering",
  "pixel-design",
  "unslop",
  "pixel-art-css",
];
for (const name of required) {
  const file = path.join(root, name, "SKILL.md");
  if (!fs.existsSync(file))
    throw new Error(`${name}: missing ${file}; see design/WORKFLOW.md`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  if (
    data.name !== name ||
    typeof data.description !== "string" ||
    !content.trim()
  )
    throw new Error(`${file}: invalid skill name, description or instructions`);
}
// Use the supported local API to prove Codex discovers and enables these skills.
// This is a metadata request only: it creates no chat and runs no model turn.
const discovered = await new Promise((resolve, reject) => {
  const proc = spawn("codex", ["app-server", "--listen", "stdio://"], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  let buffer = "",
    done = false;
  const timer = setTimeout(
    () => finish(new Error("Codex skill discovery timed out")),
    20000,
  );
  function finish(error, result) {
    if (done) return;
    done = true;
    clearTimeout(timer);
    proc.kill();
    if (error) reject(error);
    else resolve(result);
  }
  const send = (message) => proc.stdin.write(JSON.stringify(message) + "\n");
  proc.on("error", (e) =>
    finish(new Error(`Codex CLI unavailable: ${e.message}`)),
  );
  proc.on("exit", () => {
    if (!done) finish(new Error("Codex exited before skills/list completed"));
  });
  proc.stderr.resume();
  proc.stdout.on("data", (chunk) => {
    buffer += chunk;
    let i;
    while ((i = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, i);
      buffer = buffer.slice(i + 1);
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      if (msg.id === 1) {
        if (msg.error) {
          finish(new Error(msg.error.message));
          return;
        }
        send({ method: "initialized", params: {} });
        send({
          id: 2,
          method: "skills/list",
          params: { cwds: [process.cwd()], forceReload: true },
        });
      }
      if (msg.id === 2) {
        if (msg.error) finish(new Error(msg.error.message));
        else
          finish(
            null,
            (msg.result?.data || []).flatMap((entry) => entry.skills || []),
          );
      }
    }
  });
  send({
    id: 1,
    method: "initialize",
    params: {
      clientInfo: { name: "duckpond_design_skills", version: "1.0.0" },
      capabilities: { experimentalApi: true },
    },
  });
});
for (const name of required) {
  const skill = discovered.find(
    (skill) => skill.name === name && skill.enabled,
  );
  if (!skill)
    throw new Error(`${name}: installed but not enabled/discoverable by Codex`);
  console.log(
    `${name}: installed, valid, enabled and discovered (${skill.path})`,
  );
}
