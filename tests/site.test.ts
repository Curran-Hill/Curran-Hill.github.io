import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import {
  getPosts,
  renderMarkdown,
  validateMetadata,
  imageUrl,
} from "../src/lib/content.ts";
import {
  lostDucks,
  landmarks,
  swimmable,
  inWater,
  mallardsAt,
  move,
  distance,
  cleanCollected,
  findPath,
  clearPath,
} from "../src/lib/game.ts";

test("legacy article addresses and image references survive independently of new posts and draft status", async () => {
  const legacyFiles = ["2025-11-24-Outbound.md", "2026-04-21-PeelCarefully.md"];
  const posts = (await getPosts(true)).filter((p) =>
    legacyFiles.includes(path.basename(p.source)),
  );
  assert.deepEqual(posts.map((p) => p.url).sort(), [
    "/ctf/2026/04/21/PeelCarefully/",
    "/htb/2025/11/24/Outbound/",
  ]);
  for (const p of posts)
    for (const m of p.html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      if (m[1].startsWith("/"))
        assert(
          fs.existsSync(
            path.join(process.cwd(), "public", decodeURIComponent(m[1])),
          ),
          m[1],
        );
    }
});
test("invalid metadata reports the source and rejects impossible dates", () => {
  const base = {
    title: "Example",
    date: "2026-04-21",
    categories: "ctf",
    tags: [],
  };
  assert.throws(
    () =>
      validateMetadata({ ...base, date: "2026-02-30" }, "2026-04-21-Bad.md"),
    /2026-04-21-Bad.md: date/,
  );
  assert.throws(
    () => validateMetadata({ ...base, tags: "crypto" }, "2026-04-21-Bad.md"),
    /tags/,
  );
  assert.throws(
    () => validateMetadata({ ...base, title: "" }, "2026-04-21-Bad.md"),
    /title/,
  );
  assert.throws(
    () =>
      validateMetadata({ ...base, categories: "unknown" }, "2026-04-21-Bad.md"),
    /categories/,
  );
});
test("explicit permalinks and legacy filename capitalization remain stable", () => {
  assert.equal(
    validateMetadata(
      {
        title: "A changed display title",
        date: "2025-11-24",
        categories: ["htb"],
      },
      "2025-11-24-Outbound.md",
    ).url,
    "/htb/2025/11/24/Outbound/",
  );
  assert.equal(
    validateMetadata(
      {
        title: "Title",
        date: "2025-11-24",
        categories: "blog",
        permalink: "/old-post/",
      },
      "2025-11-24-title.md",
    ).url,
    "/old-post/",
  );
});
test("an invalid date in actual YAML reports its filename instead of normalizing silently", async () => {
  const file = path.join(
    process.cwd(),
    "_posts/blog/2026-02-30-invalid-calendar-fixture.md",
  );
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    "---\ntitle: Bad date\ndate: 2026-02-30\ncategories: blog\n---\nExample.",
  );
  try {
    await assert.rejects(
      () => getPosts(),
      /2026-02-30-invalid-calendar-fixture.md: date/,
    );
  } finally {
    fs.unlinkSync(file);
  }
});
test("Obsidian and Markdown image embeds with spaces resolve to identical public attachments", async () => {
  const dir = path.join(process.cwd(), "_posts/Attachments/__fixture");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "a pasted screenshot.png");
  fs.writeFileSync(
    file,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aNm0AAAAASUVORK5CYII=",
      "base64",
    ),
  );
  const source = path.join(process.cwd(), "_posts/blog/2026-01-01-fixture.md");
  try {
    const a = await renderMarkdown(
      "![[Attachments/__fixture/a pasted screenshot.png|320]]",
      source,
    );
    const b = await renderMarkdown(
      "![A screenshot](../Attachments/__fixture/a%20pasted%20screenshot.png)",
      source,
    );
    assert.equal(
      a.html.match(/src="([^"]+)"/)![1],
      b.html.match(/src="([^"]+)"/)![1],
    );
    const url = a.html.match(/src="([^"]+)"/)![1];
    assert(
      fs.existsSync(
        path.join(process.cwd(), "public", decodeURIComponent(url)),
      ),
    );
    assert.match(a.html, /loading="lazy"/);
    fs.unlinkSync(path.join(process.cwd(), "public", decodeURIComponent(url)));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
test("missing images identify the broken reference and source post", () => {
  assert.throws(
    () =>
      imageUrl(
        "Attachments/nonexistent-screenshot.png",
        path.join(process.cwd(), "_posts/blog/2026-01-01-fixture.md"),
      ),
    /2026-01-01-fixture.md: missing image "Attachments\/nonexistent-screenshot.png"/,
  );
});
test("headings receive unique anchors; raw HTML, tables, and fenced code survive rendering", async () => {
  const out = await renderMarkdown(
    "# Repeat\n\n# Repeat\n\n<div>HTML survives</div>\n\n|a|b|\n|-|-|\n|1|2|\n\n```bash\necho pond\n```",
    path.join(process.cwd(), "_posts/blog/2026-01-01-fixture.md"),
  );
  assert.deepEqual(
    out.headings.map((h) => h.slug),
    ["repeat", "repeat-1"],
  );
  assert.match(out.html, /<table>/);
  assert.match(out.html, /HTML survives/);
  assert.match(out.html, /shiki/);
  assert.match(out.html, /heading-anchor/);
});
test("new-post command creates a previewable draft and never overwrites it", async () => {
  const title = `Automated authoring fixture ${process.pid}`,
    dir = path.join(process.cwd(), "_posts/blog");
  let file: string | undefined;
  try {
    execFileSync(process.execPath, ["scripts/new-post.mjs", "blog", title]);
    file = fs
      .readdirSync(dir)
      .find((f) =>
        f.endsWith(`-automated-authoring-fixture-${process.pid}.md`),
      )!;
    assert.match(
      fs.readFileSync(path.join(dir, file), "utf8"),
      /published: false/,
    );
    assert(!(await getPosts()).some((p) => p.title === title));
    assert((await getPosts(true)).some((p) => p.title === title && p.draft));
    assert.notEqual(
      spawnSync(process.execPath, ["scripts/new-post.mjs", "blog", title])
        .status,
      0,
    );
  } finally {
    file ||= fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .find((f) =>
            f.endsWith(`-automated-authoring-fixture-${process.pid}.md`),
          )
      : undefined;
    if (file) fs.unlinkSync(path.join(dir, file));
  }
});
test("swimmers stay in water when pushing against every bank and the dock", () => {
  for (const [dx, dy] of [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ]) {
    let p = { x: 0.48, y: 0.55 };
    for (let i = 0; i < 400; i++) {
      p = move(p, dx * 0.003, dy * 0.003);
      assert(swimmable(p), `Unsafe movement toward ${dx}, ${dy}`);
    }
  }
  for (const p of [
    { x: 0, y: 0 },
    { x: 0.25, y: 0.2 }, // outside/cabin
    { x: 0.23, y: 0.45 },
    { x: 0.2, y: 0.58 }, // mailbox overhang
    { x: 0.51, y: 0.84 }, // banks
    { x: 0.65, y: 0.65 },
    { x: 0.72, y: 0.69 },
    { x: 0.785, y: 0.69 }, // dock
  ])
    assert(!swimmable(p), `Must not swim at ${JSON.stringify(p)}`);
});
test("collision keeps the body clear even when its center is still over water", () => {
  const besideDock = { x: 0.57, y: 0.65 };
  assert(inWater(besideDock));
  assert(!swimmable(besideDock), "The body would overlap the dock's left post");
  const besideBank = { x: 0.32, y: 0.415 };
  assert(inWater(besideBank));
  assert(!swimmable(besideBank), "The body would overlap the northern bank");
  assert(!swimmable({ x: NaN, y: 0.5 }));
  assert(!swimmable({ x: Infinity, y: 0.5 }));
});
test("visible shallows beside the cabin, dock and southern lilies remain reachable", () => {
  const start = { x: 0.48, y: 0.55 };
  // Art-referenced water that the old 140×80px padded rectangle rejected.
  const shallows = [
    { x: 0.32, y: 0.45 }, // below the cabin steps
    { x: 0.38, y: 0.435 }, // along the north bank
    { x: 0.58, y: 0.58 }, // above the dock's left post
    { x: 0.56, y: 0.65 }, // beside that post
    { x: 0.53, y: 0.76 }, // southern lily pads
    { x: 0.6, y: 0.745 }, // below the dock, reached by going around it
  ];
  for (const target of shallows) {
    assert(inWater(target));
    assert(
      swimmable(target),
      `Invisible wall in open water at ${JSON.stringify(target)}`,
    );
    const route = findPath(start, target);
    assert(route.length > 0);
    let position = start;
    for (const waypoint of route) {
      position = move(
        position,
        waypoint.x - position.x,
        waypoint.y - position.y,
      );
      assert(
        distance(position, waypoint) < 0.0001,
        "Actual movement must follow the planned shoreline route",
      );
    }
    assert(distance(position, target) < 0.0001);
  }
});
test("held movement glides along diagonal banks and can immediately steer away", () => {
  let p = { x: 0.35, y: 0.47 };
  for (let frame = 0; frame < 180; frame++) {
    p = move(p, 0, -0.002);
    assert(swimmable(p));
  }
  // Upward input should flow right along this sloping northern shore. The
  // previous axis-only response stayed at x=.35 after hitting the first edge.
  assert(
    p.x > 0.38 && p.y < 0.4,
    "The duck should make progress along the bank",
  );
  const contact = p;
  for (let frame = 0; frame < 30; frame++) {
    p = move(p, 0, 0.002);
    assert(swimmable(p));
  }
  assert(
    p.y - contact.y > 0.05,
    "Steering back into the pond must work immediately",
  );
});

test("shoreline gliding stays consistent at low and high frame rates", () => {
  const swim = (hz: number) => {
    let p = { x: 0.35, y: 0.47 };
    for (let frame = 0; frame < hz * 2; frame++) {
      p = move(p, 0, -0.195 / hz);
      assert(swimmable(p));
    }
    return p;
  };
  assert(distance(swim(15), swim(120)) < 0.003);
  assert(distance(swim(30), swim(60)) < 0.003);
});
test("large movement deltas cannot jump across the dock to valid water", () => {
  const start = { x: 0.7, y: 0.52 },
    target = { x: 0.55, y: 0.73 };
  assert(swimmable(start) && swimmable(target));
  assert(!clearPath(start, target));
  const result = move(start, target.x - start.x, target.y - start.y);
  assert(swimmable(result));
  assert(
    distance(result, target) > 0.01,
    "Movement must stop or slide before crossing the dock",
  );
  assert(move({ x: 0.53, y: 0.65 }, 0.3, 0).x < 0.57);
});
test("every collectible and landmark can be reached from the starting position", () => {
  const start = { x: 0.48, y: 0.55 },
    visited = new Set<string>(),
    queue = [start];
  const points: { x: number; y: number }[] = [];
  while (queue.length) {
    const p = queue.shift()!,
      key = `${Math.round(p.x * 100)},${Math.round(p.y * 100)}`;
    if (visited.has(key)) continue;
    visited.add(key);
    points.push(p);
    for (const [dx, dy] of [
      [0.01, 0],
      [-0.01, 0],
      [0, 0.01],
      [0, -0.01],
    ]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (
        clearPath(p, n) &&
        !visited.has(`${Math.round(n.x * 100)},${Math.round(n.y * 100)}`)
      )
        queue.push(n);
    }
  }
  for (const d of lostDucks)
    assert(
      points.some((p) => distance(p, d) < 0.022),
      `Unreachable lost duck: ${d.id}`,
    );
  for (const d of landmarks)
    assert(
      points.some((p) => distance(p, d) < 0.095),
      `Unreachable landmark: ${d.id}`,
    );
});
test("tap-to-swim routes around the dock instead of crossing its deck and posts", () => {
  const start = { x: 0.7, y: 0.52 },
    target = { x: 0.55, y: 0.73 };
  assert(swimmable(start) && swimmable(target));
  assert(!clearPath(start, target));
  const route = findPath(start, target);
  assert(route.length > 1);
  assert.deepEqual(route.at(-1), target);
  let previous = start;
  for (const waypoint of route) {
    assert(clearPath(previous, waypoint));
    previous = waypoint;
  }
  assert.deepEqual(findPath(start, { x: 0, y: 0 }), []);
  assert.deepEqual(findPath(start, { x: 0.65, y: 0.65 }), []);
});
test("tap-to-swim can reach all discoveries and landmark interaction points", () => {
  const start = { x: 0.48, y: 0.55 };
  const targets = [
    ...lostDucks,
    ...landmarks.map((landmark) => {
      assert(distance(landmark, landmark.approach) < 0.095);
      return { id: landmark.id, ...landmark.approach };
    }),
  ];
  for (const target of targets) {
    const route = findPath(start, target);
    assert(route.length > 0, `No tap route to ${target.id}`);
    let previous = start;
    for (const waypoint of route) {
      assert(clearPath(previous, waypoint));
      previous = waypoint;
    }
    assert.deepEqual(route.at(-1), target);
  }
});
test("wandering mallards stay off the banks and dock through a complete motion cycle", () => {
  let previous = mallardsAt(0);
  // The .16/.12 orbit frequencies repeat after 50π seconds.
  for (let time = 0; time <= 160; time += 0.125) {
    const flock = mallardsAt(time);
    for (let i = 0; i < flock.length; i++) {
      assert(swimmable(flock[i]), `Mallard ${i} left the water at ${time}s`);
      assert(
        clearPath(previous[i], flock[i]),
        `Mallard ${i} crossed an obstacle at ${time}s`,
      );
    }
    previous = flock;
  }
});
test("old or corrupted hunt saves cannot duplicate collectibles or unlock a fake reward", () => {
  assert.deepEqual(cleanCollected(null), []);
  assert.deepEqual(cleanCollected("five"), []);
  assert.deepEqual(
    cleanCollected(["wildflowers", "wildflowers", "fake", null, 7]),
    ["wildflowers"],
  );
  assert.equal(cleanCollected(lostDucks.map((d) => d.id)).length, 5);
});
test("blocked browser storage falls back to night, enabled sound, and reduced-motion preference", async () => {
  const savedStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const savedMedia = Object.getOwnPropertyDescriptor(globalThis, "matchMedia");
  try {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem() {
          throw new Error("Storage is blocked");
        },
        setItem() {
          throw new Error("Storage is blocked");
        },
      },
    });
    Object.defineProperty(globalThis, "matchMedia", {
      configurable: true,
      value: () => ({ matches: true }),
    });
    const module = await import("../src/scripts/state.ts");
    assert.equal(module.state.theme, "night");
    assert.equal(module.state.sound, true);
    assert.equal(module.state.paused, true);
    assert.deepEqual(module.state.collected, []);
    assert.equal(module.readStored("theme"), null);
    assert.doesNotThrow(() => module.writeStored("theme", "day"));
  } finally {
    if (savedStorage)
      Object.defineProperty(globalThis, "localStorage", savedStorage);
    else delete (globalThis as any).localStorage;
    if (savedMedia) Object.defineProperty(globalThis, "matchMedia", savedMedia);
    else delete (globalThis as any).matchMedia;
  }
});

test("quiet quacks wait between calls, cancel on pause, and tolerate blocked autoplay", async (t) => {
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  let plays = 0,
    now = 1000;
  const clip = {
    src: "",
    volume: 1,
    paused: true,
    currentTime: 0,
    async play() {
      plays++;
      clip.paused = false;
    },
    pause() {
      clip.paused = true;
    },
  };
  const page = { hidden: false, querySelector: () => clip };
  const { state } = await import("../src/scripts/state.ts");
  const originalSound = state.sound;
  try {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: page,
    });
    t.mock.timers.enable({ apis: ["setTimeout"] });
    t.mock.method(performance, "now", () => now);
    const { PondQuacks } = await import("../src/scripts/ambience.ts");
    const { quackVolume, quackInterval } = await import("../src/lib/quacks.ts");
    const pond = new PondQuacks();
    state.sound = true;
    assert.equal(
      clip.volume,
      quackVolume,
      "recordings use the volume selected in site settings",
    );
    pond.start();
    assert.equal(plays, 0, "arrival stays quiet");
    t.mock.timers.tick(quackInterval[0] * 1000 - 1);
    assert.equal(plays, 0);
    t.mock.timers.tick((quackInterval[1] - quackInterval[0]) * 1000 + 2);
    assert.equal(plays, 1, "first call occurs within the configured interval");
    pond.pause();
    assert(clip.paused);
    t.mock.timers.tick(120000);
    assert.equal(plays, 1, "pausing cancels scheduled calls");
    state.sound = false;
    pond.start();
    t.mock.timers.tick(quackInterval[1] * 1000 + 1);
    assert.equal(plays, 1, "muted pond stays silent");
    state.sound = true;
    page.hidden = true;
    pond.start();
    t.mock.timers.tick(quackInterval[1] * 1000 + 1);
    assert.equal(plays, 1, "hidden page stays silent");
    page.hidden = false;
    now += 9000;
    clip.play = async () => {
      plays++;
      throw new DOMException("Autoplay is blocked", "NotAllowedError");
    };
    pond.start();
    await assert.doesNotReject(() => pond.quack());
    assert.equal(plays, 2);
    clip.play = async () => {
      plays++;
      clip.paused = false;
    };
    assert.equal(
      await pond.unlock(),
      "played",
      "a real gesture retries blocked autoplay immediately, without waiting for cooldown",
    );
    assert.equal(plays, 3);
    clip.paused = true;
    await pond.unlock();
    assert.equal(plays, 3, "later interactions don't repeatedly quack");
    const sources: string[] = [];
    clip.play = async () => {
      plays++;
      clip.paused = false;
      sources.push(clip.src);
    };
    let random = 0;
    t.mock.method(Math, "random", () => random);
    for (const value of [0, 0, 0.99, 0.5, 0.25, 0.99]) {
      random = value;
      now += 9000;
      clip.paused = true;
      await pond.quack();
    }
    const { quackSources } = await import("../src/lib/quacks.ts");
    assert.equal(sources.length, 6);
    assert(
      sources.every((source) =>
        quackSources.includes(source as (typeof quackSources)[number]),
      ),
    );
    assert(
      sources.every((source, i) => i === 0 || source !== sources[i - 1]),
      "real takes never repeat back to back",
    );
    for (const source of quackSources) {
      assert(
        fs.existsSync(path.join(process.cwd(), "public", source)),
        `missing recorded quack: ${source}`,
      );
    }
    const previousPlays = plays;
    await pond.quack();
    assert.equal(plays, previousPlays, "a playing clip cannot overlap another");
    clip.paused = true;
    await pond.quack();
    assert.equal(
      plays,
      previousPlays,
      "the eight-second cooldown remains in force",
    );
    assert.equal(
      await pond.quack({ preview: true }),
      "played",
      "an explicit sound-on action gives immediate feedback, even inside cooldown",
    );
    assert.equal(plays, previousPlays + 1);
    pond.destroy();
  } finally {
    state.sound = originalSound;
    if (originalDocument)
      Object.defineProperty(globalThis, "document", originalDocument);
    else delete (globalThis as any).document;
    t.mock.restoreAll();
    t.mock.timers.reset();
  }
});
