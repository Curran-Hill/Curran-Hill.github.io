import { test } from "node:test";
import assert from "node:assert/strict";
import {
  rubberDuck,
  mallardDuck,
  duckHeadroom,
} from "../src/lib/duck-sprite.ts";
import { pixelIcons } from "../src/lib/pixel-icons.ts";
import { spriteScale, spriteFrame } from "../src/lib/sprite-rendering.ts";

test("native sprite frames stay on their integer grid and retain distinct colors", () => {
  for (let frame = 0; frame < 48; frame++) {
    for (const runs of [
      rubberDuck(false, frame),
      rubberDuck(true, frame),
      mallardDuck(frame),
    ]) {
      assert(runs.length > 40);
      for (const p of runs) {
        assert(
          Number.isInteger(p.x) &&
            Number.isInteger(p.y) &&
            Number.isInteger(p.width),
        );
        assert(
          p.x >= 0 && p.x + p.width <= 36 && p.y >= -duckHeadroom && p.y < 32,
        );
        assert.match(p.color, /^#[a-f0-9]{6}$/i);
      }
    }
  }
  assert(rubberDuck().some((p) => p.color === "#ffd653"));
  assert(mallardDuck().some((p) => p.color === "#287659"));
  assert(!rubberDuck().some((p) => p.y < 0));
  assert(rubberDuck(true).some((p) => p.y < 0));
  assert.notDeepEqual(rubberDuck(true, 0), rubberDuck(true, 1));
  assert.notDeepEqual(rubberDuck(false, 0), rubberDuck(false, 38));
});

test("sprites scale by integer CSS pixels and ambient animation freezes when paused", () => {
  for (const width of [320, 390, 768, 960, 1280, 1440, 1920, 2560]) {
    const scale = spriteScale(width);
    assert(Number.isInteger(scale) && scale >= 1);
  }
  assert.equal(spriteScale(320), 1);
  assert.equal(spriteScale(1280), 2);
  assert.equal(spriteFrame(0.124, false), 0);
  assert.equal(spriteFrame(0.125, false), 1);
  assert.equal(spriteFrame(999, true), 0);
  assert.equal(spriteFrame(-0.01, false), 0);
});

test("every shared UI icon uses native 20px integer bounds", () => {
  for (const [name, runs] of Object.entries(pixelIcons)) {
    assert(runs.length > 0, name);
    for (const p of runs) {
      assert(
        Number.isInteger(p.x) &&
          Number.isInteger(p.y) &&
          Number.isInteger(p.width),
        name,
      );
      assert(p.x >= 0 && p.x + p.width <= 20 && p.y >= 0 && p.y < 20, name);
    }
  }
});
