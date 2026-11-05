import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";

test("new post dates follow the author calendar on both sides of UTC midnight", () => {
  const url = pathToFileURL(path.resolve("src/lib/calendar.ts")).href;
  const script = `import {localCalendarDate} from ${JSON.stringify(url)};process.stdout.write(localCalendarDate(new Date("2026-11-05T01:30:00Z")));`;
  for (const [timezone, expected] of [
    ["America/Chicago", "2026-11-04"],
    ["Pacific/Auckland", "2026-11-05"],
  ]) {
    assert.equal(
      execFileSync(process.execPath, ["--input-type=module", "-e", script], {
        env: { ...process.env, TZ: timezone },
        encoding: "utf8",
      }),
      expected,
    );
  }
});

test("Pages workflow limits deployment to main and publishes only a checked static artifact", () => {
  const w = matter(
    "---\n" +
      fs.readFileSync(".github/workflows/deploy.yml", "utf8") +
      "\n---\n",
  ).data;
  assert.deepEqual(w.on.push.branches, ["main"]);
  assert.equal(
    w.jobs.deploy.if,
    "github.ref == 'refs/heads/main' && github.event_name != 'pull_request'",
  );
  assert.equal(w.jobs.deploy.needs, "build");
  assert.equal(w.jobs.deploy.permissions.pages, "write");
  assert.equal(w.jobs.deploy.permissions["id-token"], "write");
  assert.deepEqual(
    w.jobs.build.steps.filter((s: any) => s.run).map((s: any) => s.run),
    ["npm ci", "npm run check", "npm test", "npm run build"],
  );
  assert.equal(
    w.jobs.build.steps.find((s: any) =>
      s.uses?.startsWith("actions/setup-node@"),
    ).with["node-version"],
    "24",
  );
  assert.equal(
    w.jobs.build.steps.find((s: any) =>
      s.uses?.startsWith("actions/upload-pages-artifact@"),
    ).with.path,
    "dist",
  );
  assert.equal(
    fs.readFileSync("public/CNAME", "utf8").trim(),
    "www.duckp0nd.com",
  );
});
