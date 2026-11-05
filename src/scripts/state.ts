import { cleanCollected } from "../lib/game.ts";
export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(`duckpond:${key}`);
  } catch {
    return null;
  }
}
export function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(`duckpond:${key}`, value);
  } catch {
    /* The pond still works without persistent storage. */
  }
}
let collected: string[] = [];
try {
  collected = cleanCollected(JSON.parse(readStored("ducks") || "[]"));
} catch {
  /* Ignore an invalid old save. */
}
export const state = {
  theme: readStored("theme") === "day" ? "day" : "night",
  sound: readStored("sound") !== "off",
  paused:
    readStored("motion") === "paused" ||
    (readStored("motion") !== "running" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches),
  collected,
};
export function changed() {
  window.dispatchEvent(new Event("duckpond:change"));
}
export function saveCollected() {
  writeStored("ducks", JSON.stringify(state.collected));
  changed();
}
export function refreshState() {
  try {
    state.theme =
      localStorage.getItem("duckpond:theme") === "day" ? "day" : "night";
    state.sound = localStorage.getItem("duckpond:sound") !== "off";
    const motion = localStorage.getItem("duckpond:motion");
    state.paused =
      motion === "paused" ||
      (motion !== "running" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      state.collected = cleanCollected(
        JSON.parse(localStorage.getItem("duckpond:ducks") || "[]"),
      );
    } catch {
      state.collected = [];
    }
  } catch {
    /* A restored page retains its session state if storage is blocked. */
  }
  changed();
}
export function updateHuntUI() {
  document.documentElement.dataset.outfit =
    state.collected.length === 5 ? "propeller" : "plain";
  document
    .querySelector(".hunt-toggle")
    ?.setAttribute(
      "aria-label",
      `Pond discoveries: ${state.collected.length} of 5 ducks found`,
    );
  document.querySelectorAll("[data-hunt-count]").forEach((n) => {
    n.textContent = `${state.collected.length} / 5`;
  });
  document.querySelectorAll<HTMLElement>("[data-duck]").forEach((n) => {
    const found = state.collected.includes(n.dataset.duck!);
    n.classList.toggle("collected", found);
    n.hidden = found;
  });
  document.querySelectorAll<HTMLElement>("[data-hint]").forEach((n) => {
    const found = state.collected.includes(n.dataset.hint!);
    n.classList.toggle("found", found);
    const marker = n.querySelector("span");
    if (marker) marker.textContent = found ? "◆" : "◇";
  });
  document
    .querySelectorAll(".hunt-progress i")
    .forEach((n, i) => n.classList.toggle("found", i < state.collected.length));
  document.querySelectorAll(".reward-message").forEach((n) => {
    n.textContent =
      state.collected.length === 5
        ? "All five ducks are home. Your propeller hat is ready."
        : "";
  });
}
