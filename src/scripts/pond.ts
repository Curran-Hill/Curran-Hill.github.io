import { state, saveCollected, updateHuntUI } from "./state";
import {
  lostDucks,
  landmarks,
  move,
  swimmable,
  inWater,
  mallardsAt,
  distance,
  findPath,
  type Point,
} from "../lib/game";
import { PondQuacks } from "./ambience";
import {
  rubberDuck,
  mallardDuck,
  duckHeadroom,
  type PixelRun,
} from "../lib/duck-sprite";
import { spriteScale, spriteFrame } from "../lib/sprite-rendering";

const canvas = document.querySelector<HTMLCanvasElement>("#pond-canvas")!;
const ctx = canvas.getContext("2d");
const viewport = document.querySelector<HTMLElement>(".scene-viewport")!;
viewport.setAttribute(
  "aria-label",
  "Pond map. Choose a place, or tap the water to swim. Explore with WASD or arrow keys.",
);
const interactButton =
  document.querySelector<HTMLButtonElement>(".interact-button")!;
const scene = document.querySelector<HTMLElement>(".scene")!;
const directory =
  document.querySelector<HTMLDetailsElement>(".pond-directory")!;
const overviewButton =
  document.querySelector<HTMLButtonElement>(".overview-toggle")!;
const joystick = document.querySelector<HTMLButtonElement>(".joystick")!;
const mobile = matchMedia("(max-width:900px)");
let overview = mobile.matches;
let route: Point[] = [];
let destination: Point | null = null;
let stick = { x: 0, y: 0 };
const audio = new PondQuacks();
// Rasterize at native pixel size before scaling to keep every sprite edge crisp.
function rasterSprite(runs: PixelRun[], headroom = 0) {
  const sprite = document.createElement("canvas");
  sprite.width = 36;
  sprite.height = 32 + headroom;
  const brush = sprite.getContext("2d")!;
  for (const p of runs) {
    brush.fillStyle = p.color;
    brush.fillRect(p.x, p.y + headroom, p.width, 1);
  }
  return sprite;
}
const playerFrames = Array.from({ length: 40 }, (_, f) => ({
  plain: rasterSprite(rubberDuck(false, f), duckHeadroom),
  propeller: rasterSprite(rubberDuck(true, f), duckHeadroom),
}));
const mallardFrames = [
  rasterSprite(mallardDuck()),
  rasterSprite(mallardDuck(46)),
];
let player: Point = { x: 0.48, y: 0.55 };
try {
  const p = JSON.parse(sessionStorage.getItem("duckpond:position") || "null");
  if (p && typeof p.x === "number" && typeof p.y === "number" && swimmable(p))
    player = p;
} catch {}
let facing = 1,
  time = 0,
  previous = performance.now(),
  frame = 0,
  disposed = false;
const keys = new Set<string>();
const ripples: { x: number; y: number; age: number }[] = [];
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const node = document.querySelector<HTMLElement>(".toast")!;
  node.textContent = message;
  node.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("visible"), 4000);
}
function collect(id: string) {
  if (state.collected.includes(id)) return;
  state.collected.push(id);
  saveCollected();
  void audio.quack();
  const found = lostDucks.find((d) => d.id === id)!;
  ripples.push({ x: found.x, y: found.y, age: 0 });
  toast(
    state.collected.length === 5
      ? "All five ducks are home. Propeller hat earned."
      : `A little duck found. ${state.collected.length} of 5 are home.`,
  );
  render();
}
function closest() {
  const duck = lostDucks
    .filter((d) => !state.collected.includes(d.id))
    .map((d) => ({ ...d, kind: "duck" as const, dist: distance(player, d) }))
    .sort((a, b) => a.dist - b.dist)[0];
  if (duck && duck.dist < 0.055) return duck;
  const landmark = landmarks
    .map((d) => ({
      ...d,
      kind: "landmark" as const,
      dist: distance(player, d),
    }))
    .sort((a, b) => a.dist - b.dist)[0];
  return landmark?.dist < 0.095 ? landmark : null;
}
function updatePrompt() {
  const near = closest();
  interactButton.disabled = !near;
  interactButton.querySelector(".interact-label")!.textContent = near
    ? near.kind === "duck"
      ? "Bring this duck home"
      : near.action
    : "Swim toward a landmark";
  document
    .querySelectorAll<HTMLElement>("[data-landmark]")
    .forEach((n) =>
      n.classList.toggle(
        "is-near",
        near?.kind === "landmark" && near.id === n.dataset.landmark,
      ),
    );
}
function interact() {
  const near = closest();
  if (!near) return;
  if (near.kind === "duck") collect(near.id);
  else window.location.assign(near.href);
}
function clearRoute() {
  route = [];
  destination = null;
}
function setView() {
  document.body.dataset.view = overview ? "overview" : "close-up";
  overviewButton.setAttribute("aria-pressed", String(overview));
  if (overview) viewport.scrollLeft = 0;
  else centerPlayer();
}
// Camera framing follows movement; it never enables or disables the controls.
function followDuck(focus = false) {
  if (overview) {
    overview = false;
    setView();
  }
  if (focus) viewport.focus({ preventScroll: true });
  centerPlayer();
}
function centerPlayer() {
  if (!overview && scene.clientWidth > viewport.clientWidth)
    viewport.scrollLeft = Math.round(
      Math.max(0, player.x * scene.clientWidth - viewport.clientWidth / 2),
    );
}
overviewButton.addEventListener("click", () => {
  overview = true;
  setView();
  render();
});
interactButton.addEventListener("click", interact);
document
  .querySelectorAll<HTMLElement>("[data-duck]")
  .forEach((n) => n.addEventListener("click", () => collect(n.dataset.duck!)));
document.querySelector(".hunt-toggle")!.addEventListener("click", () => {
  keys.clear();
  clearRoute();
  setStick(0, 0);
  directory.open = false;
  const panel = document.querySelector<HTMLElement>("#hunt-details")!;
  panel.hidden = !panel.hidden;
  if (panel.hidden) cancelReset();
  document
    .querySelector(".hunt-toggle")!
    .setAttribute("aria-expanded", String(!panel.hidden));
});
const huntPanel = document.querySelector<HTMLElement>("#hunt-details")!;
const huntToggle = document.querySelector<HTMLButtonElement>(".hunt-toggle")!;
const resetButton = document.querySelector<HTMLButtonElement>(".reset-hunt")!;
const resetPanel = document.querySelector<HTMLElement>("#hunt-reset")!;
function cancelReset() {
  resetPanel.hidden = true;
  resetButton.hidden = false;
  resetButton.setAttribute("aria-expanded", "false");
}
function closeHunt(restoreFocus = false) {
  huntPanel.hidden = true;
  huntToggle.setAttribute("aria-expanded", "false");
  cancelReset();
  if (restoreFocus) huntToggle.focus({ preventScroll: true });
}
document
  .querySelector(".hunt-close")!
  .addEventListener("click", () => closeHunt(true));
resetButton.addEventListener("click", () => {
  resetPanel.hidden = false;
  resetButton.setAttribute("aria-expanded", "true");
  resetButton.hidden = true;
  resetPanel.querySelector<HTMLButtonElement>(".cancel-reset")!.focus();
});
document.querySelector(".cancel-reset")!.addEventListener("click", () => {
  cancelReset();
  resetButton.focus();
});
document.querySelector(".confirm-reset")!.addEventListener("click", () => {
  state.collected = [];
  saveCollected();
  cancelReset();
  resetButton.focus();
  toast("A fresh adventure. Five little ducks to find.");
  render();
});
function keydown(event: KeyboardEvent) {
  if (event.key === "Escape" && directory.open) {
    event.preventDefault();
    closeDirectory(true);
    return;
  }
  const hunt = document.querySelector<HTMLElement>("#hunt-details")!;
  if (event.key === "Escape" && !hunt.hidden) {
    event.preventDefault();
    if (!resetPanel.hidden) {
      cancelReset();
      resetButton.focus();
    } else closeHunt(true);
    return;
  }
  if (
    directory.open ||
    !hunt.hidden ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    (event.target instanceof Element &&
      event.target.closest("input,textarea,select,[contenteditable=true]"))
  )
    return;
  const key = event.key.toLowerCase();
  if (key === "escape") {
    keys.clear();
    clearRoute();
    setStick(0, 0);
    render();
    return;
  }
  const focusedControl =
    event.target instanceof Element && event.target.closest("a,button,summary");
  if (!focusedControl && (key === "e" || ["enter", " "].includes(key))) {
    event.preventDefault();
    if (!event.repeat) interact();
    return;
  }
  if (focusedControl && event.target !== joystick) return;
  if (
    [
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
    ].includes(key)
  ) {
    event.preventDefault();
    clearRoute();
    followDuck(true);
    keys.add(key);
  }
}
document.addEventListener("keydown", keydown);
document.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener("blur", () => {
  keys.clear();
  setStick(0, 0);
});
function setStick(x: number, y: number) {
  const length = Math.hypot(x, y),
    scale = Math.max(1, length);
  stick = length < 0.15 ? { x: 0, y: 0 } : { x: x / scale, y: y / scale };
  joystick.style.setProperty("--stick-x", `${stick.x * 27}px`);
  joystick.style.setProperty("--stick-y", `${stick.y * 27}px`);
}
function dragStick(event: PointerEvent) {
  const rect = joystick.getBoundingClientRect();
  setStick(
    (event.clientX - rect.left - rect.width / 2) / 30,
    (event.clientY - rect.top - rect.height / 2) / 30,
  );
}
joystick.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  clearRoute();
  keys.clear();
  followDuck(true);
  joystick.setPointerCapture(event.pointerId);
  dragStick(event);
});
joystick.addEventListener("pointermove", (event) => {
  if (joystick.hasPointerCapture(event.pointerId)) dragStick(event);
});
for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
  joystick.addEventListener(event, () => setStick(0, 0));

let pointerStart: { x: number; y: number; blocked: boolean } | null = null;
viewport.addEventListener("pointerdown", (event) => {
  pointerStart = {
    x: event.clientX,
    y: event.clientY,
    blocked:
      directory.open ||
      !document.querySelector<HTMLElement>("#hunt-details")!.hidden ||
      event.button !== 0 ||
      !!(event.target instanceof Element && event.target.closest("a,button")),
  };
});
viewport.addEventListener("pointercancel", () => {
  pointerStart = null;
});
viewport.addEventListener("pointerup", (event) => {
  const start = pointerStart;
  pointerStart = null;
  if (
    !start ||
    start.blocked ||
    Math.hypot(start.x - event.clientX, start.y - event.clientY) > 8
  )
    return;
  const rect = scene.getBoundingClientRect();
  const target = {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
  const path = findPath(player, target);
  if (!path.length) {
    toast("Choose open water, away from the bank and dock.");
    return;
  }
  followDuck(true);
  route = path;
  destination = target;
  keys.clear();
  setStick(0, 0);
  render();
});

document
  .querySelectorAll<HTMLAnchorElement>("[data-landmark]")
  .forEach((link) =>
    link.addEventListener("focus", () => {
      keys.clear();
      clearRoute();
      setStick(0, 0);
      if (!overview && scene.clientWidth > viewport.clientWidth) {
        const label = link.querySelector<HTMLElement>(".landmark-label")!;
        const rect = label.getBoundingClientRect();
        viewport.scrollLeft +=
          rect.left + rect.width / 2 - viewport.clientWidth / 2;
      }
    }),
  );
function duck(x: number, y: number, isPlayer: boolean, flip = 1, bob = 0) {
  if (!ctx) return;
  const scale = spriteScale(canvas.width);
  const pose = spriteFrame(time, state.paused);
  ctx.save();
  ctx.translate(
    Math.round(x * canvas.width),
    Math.round(y * canvas.height) + Math.round(bob) * scale,
  );
  ctx.scale(scale * flip, scale);
  // A short, stepped waterline anchors the sprite without a blurred glow.
  ctx.fillStyle = state.theme === "night" ? "#377b7b" : "#a6cfa5";
  ctx.fillRect(-13, 4, 23, 1);
  ctx.fillRect(-10, 6, 18, 1);
  const sprite = isPlayer
    ? playerFrames[pose % 40][
        state.collected.length === 5 ? "propeller" : "plain"
      ]
    : mallardFrames[pose % 48 === 46 ? 1 : 0];
  ctx.drawImage(sprite, -18, -25 - (isPlayer ? duckHeadroom : 0));
  ctx.restore();
}
function render() {
  if (!ctx) return;
  // One backing pixel per CSS pixel, so native sprite pixels scale by integers.
  const width = Math.max(1, Math.round(scene.clientWidth));
  const height = Math.max(1, Math.round(scene.clientHeight));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  const tick = spriteFrame(time, state.paused) / 8;
  const scale = spriteScale(width);
  if (state.theme === "night") {
    for (let i = 0; i < 23; i++) {
      const x = 0.16 + ((i * 0.137) % 0.7),
        y = 0.28 + ((i * 0.073) % 0.42);
      ctx.globalAlpha = [0.2, 0.45, 0.7, 0.45][(Math.floor(tick * 2) + i) % 4];
      ctx.fillStyle = "#ffe5a0";
      ctx.fillRect(
        Math.round(x * width + Math.sin(tick * 0.5 + i) * 5),
        Math.round(y * height + Math.cos(tick * 0.7 + i) * 4),
        (i % 3 === 0 ? 2 : 1) * scale,
        scale,
      );
    }
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < 18; i++) {
    const x = 0.28 + ((i * 0.117) % 0.4),
      y = 0.43 + ((i * 0.043) % 0.23);
    if (!swimmable({ x, y })) continue;
    ctx.fillStyle = state.theme === "night" ? "#30757a" : "#a2d9bb";
    ctx.fillRect(
      Math.round(x * width + Math.sin(tick + i) * 3),
      Math.round(y * height),
      (3 + (i % 3)) * scale,
      1,
    );
  }
  const ducks = [
    ...mallardsAt(tick).map((d) => ({ ...d, player: false })),
    {
      ...player,
      player: true,
      facing,
      bob: state.paused ? 0 : Math.sin(tick * 1.5) * 0.7,
    },
  ].sort((a, b) => a.y - b.y);
  ducks.forEach((d) => duck(d.x, d.y, d.player, d.facing, d.bob));
  // A snapped pixel ring, rather than an antialiased canvas ellipse.
  function ring(x: number, y: number, radius: number) {
    const rx = Math.round(radius),
      ry = Math.max(2, Math.round(radius / 3));
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12;
      ctx!.fillRect(
        Math.round(x + Math.cos(angle) * rx),
        Math.round(y + Math.sin(angle) * ry),
        2,
        1,
      );
    }
  }
  if (destination) {
    ctx.fillStyle = state.theme === "night" ? "#ffe7a4" : "#294f3c";
    ring(
      destination.x * width,
      destination.y * height,
      9 + Math.round(Math.sin(tick * 3)) * 2,
    );
  }
  for (const r of ripples) {
    if (!inWater(r)) continue;
    ctx.globalAlpha = Math.max(0, 1 - r.age);
    ctx.fillStyle = state.theme === "night" ? "#a4d8b8" : "#42675c";
    ring(r.x * width, r.y * height, 6 + Math.floor(r.age * 8) * 2);
  }
  ctx.globalAlpha = 1;
}
function loop(now: number) {
  if (disposed) return;
  const dt = Math.max(0, Math.min((now - previous) / 1000, 0.05));
  previous = now;
  if (!document.hidden) {
    const moving =
      !directory.open &&
      document.querySelector<HTMLElement>("#hunt-details")!.hidden &&
      (keys.size > 0 || !!stick.x || !!stick.y || route.length > 0);
    if (!state.paused) {
      time += dt;
      ripples.forEach((r) => (r.age += dt));
      while (ripples[0]?.age > 1) ripples.shift();
    }
    if (moving) {
      if (route.length && !keys.size && !stick.x && !stick.y) {
        const next = route[0],
          gap = distance(player, next),
          fraction = Math.min(1, (dt * 0.13) / Math.max(gap, 0.00001));
        const dx = (next.x - player.x) * fraction,
          dy = (next.y - player.y) * fraction;
        player = move(player, dx, dy);
        if (dx) facing = dx > 0 ? 1 : -1;
        if (distance(player, next) < 0.001) {
          player = { ...next };
          route.shift();
          if (!route.length) destination = null;
        }
      } else {
        let dx =
          stick.x +
          (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
          (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
        let dy =
          stick.y +
          (keys.has("s") || keys.has("arrowdown") ? 1 : 0) -
          (keys.has("w") || keys.has("arrowup") ? 1 : 0);
        const length = Math.max(1, Math.hypot(dx, dy));
        dx = (dx / length) * dt * 0.13;
        dy = (dy / length) * dt * 0.195;
        player = move(player, dx, dy);
        if (dx) facing = dx > 0 ? 1 : -1;
      }
      for (const d of lostDucks) if (distance(player, d) < 0.022) collect(d.id);
      centerPlayer();
      updatePrompt();
    }
    if (!state.paused || moving) render();
  }
  frame = requestAnimationFrame(loop);
}
let pendingQuackPreview = false;
function syncAudio() {
  if (!state.sound) pendingQuackPreview = false;
  if (state.sound && !document.hidden && !directory.open) {
    audio.start();
    if (pendingQuackPreview) {
      pendingQuackPreview = false;
      void audio.quack({ preview: true }).then((result) => {
        if (result === "blocked")
          toast(
            "Your browser blocked sound. Turn quacks off and on to try again.",
          );
        else if (result === "unavailable")
          toast("The quack couldn't load. Try turning sound off and on again.");
      });
    }
  } else audio.pause();
}
function wake(event: Event) {
  if (
    event.target instanceof Element &&
    event.target.closest("a, summary, .preferences")
  )
    return;
  syncAudio();
  if (!directory.open) void audio.unlock();
}
document.addEventListener("pointerdown", wake);
document.addEventListener("keydown", wake);
window.addEventListener("duckpond:sound-toggle", () => {
  pendingQuackPreview = state.sound;
  if (state.sound && directory.open)
    toast("Close the field journal to hear a quack.");
  syncAudio();
});
document.addEventListener("visibilitychange", () => {
  keys.clear();
  setStick(0, 0);
  previous = performance.now();
  syncAudio();
});
window.addEventListener("duckpond:change", () => {
  syncAudio();
  render();
  updatePrompt();
});
window.addEventListener("pagehide", () => {
  try {
    sessionStorage.setItem("duckpond:position", JSON.stringify(player));
    sessionStorage.setItem("duckpond:view", JSON.stringify({ overview }));
  } catch {}
  audio.pause();
  cancelAnimationFrame(frame);
  disposed = true;
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    disposed = false;
    previous = performance.now();
    frame = requestAnimationFrame(loop);
    syncAudio();
  }
});
if (location.hash === "#hunt") {
  const panel = document.querySelector<HTMLElement>("#hunt-details")!;
  panel.hidden = false;
  document.querySelector(".hunt-toggle")!.setAttribute("aria-expanded", "true");
  // Let native fragment navigation finish before moving focus into its panel.
  requestAnimationFrame(() =>
    document
      .querySelector<HTMLButtonElement>(".hunt-close")!
      .focus({ preventScroll: true }),
  );
}
updateHuntUI();
try {
  const saved = JSON.parse(sessionStorage.getItem("duckpond:view") || "null");
  if (typeof saved?.overview === "boolean") overview = saved.overview;
} catch {}
setView();
updatePrompt();
render();
syncAudio();
centerPlayer();
frame = requestAnimationFrame(loop);
window.addEventListener("resize", () => {
  centerPlayer();
  render();
});
mobile.addEventListener("change", () => {
  overview =
    mobile.matches && !keys.size && !route.length && !stick.x && !stick.y;
  setView();
  render();
});
function closeDirectory(restoreFocus = false) {
  directory.open = false;
  if (restoreFocus) directory.querySelector("summary")!.focus();
}
document
  .querySelector(".directory-close")!
  .addEventListener("click", () => closeDirectory(true));
directory.addEventListener("toggle", () => {
  keys.clear();
  setStick(0, 0);
  clearRoute();
  if (directory.open) closeHunt();
  syncAudio();
});
document.addEventListener("pointerdown", (event) => {
  if (
    directory.open &&
    event.target instanceof Node &&
    !directory.contains(event.target)
  )
    closeDirectory();
  const hunt = document.querySelector<HTMLElement>("#hunt-details")!;
  if (
    !hunt.hidden &&
    event.target instanceof Element &&
    !event.target.closest("#hunt-details,.hunt-toggle")
  ) {
    closeHunt();
  }
});

document.addEventListener("focusin", (event) => {
  if (!(event.target instanceof Element)) return;
  if (directory.open && !directory.contains(event.target)) closeDirectory();
  if (!huntPanel.hidden && !event.target.closest("#hunt-details,.hunt-toggle"))
    closeHunt();
});
