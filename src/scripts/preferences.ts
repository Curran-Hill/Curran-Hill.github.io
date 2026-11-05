import { quackInterval } from "../lib/quacks";
import {
  state,
  writeStored,
  changed,
  updateHuntUI,
  refreshState,
} from "./state";
function update() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.motion = state.paused ? "paused" : "running";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", state.theme === "night" ? "#0b1520" : "#e5eee3");
  document
    .querySelectorAll<HTMLButtonElement>(".theme-toggle")
    .forEach((button) => {
      const name =
        state.theme === "night" ? "Switch to day" : "Switch to night";
      button.setAttribute("aria-label", name);
      button.title = name;
      button.querySelector(".setting-label")!.textContent =
        state.theme === "night" ? "Night" : "Day";
    });
  document.querySelectorAll(".night-day-label").forEach((n) => {
    n.textContent = state.theme === "night" ? "Night" : "Day";
  });
  document
    .querySelectorAll<HTMLButtonElement>(".sound-toggle")
    .forEach((button) => {
      button.setAttribute("aria-pressed", String(state.sound));
      button.title = state.sound
        ? `Quiet quacks every ${quackInterval[0]}–${quackInterval[1]} seconds; click to mute`
        : "Play a quack and enable occasional quacks";
      button.querySelector(".sound-label")!.textContent = state.sound
        ? "Quacks on"
        : "Quacks off";
    });
  document
    .querySelectorAll<HTMLButtonElement>(".motion-toggle")
    .forEach((button) => {
      button.setAttribute("aria-pressed", String(state.paused));
      button.title = state.paused ? "Resume animations" : "Pause animations";
      button.querySelector(".motion-label")!.textContent = state.paused
        ? "Animations paused"
        : "Animations running";
    });
  updateHuntUI();
}
document.querySelectorAll(".theme-toggle").forEach((n) =>
  n.addEventListener("click", () => {
    state.theme = state.theme === "night" ? "day" : "night";
    writeStored("theme", state.theme);
    changed();
  }),
);
document.querySelectorAll(".sound-toggle").forEach((n) =>
  n.addEventListener("click", () => {
    state.sound = !state.sound;
    writeStored("sound", state.sound ? "on" : "off");
    changed();
    window.dispatchEvent(new Event("duckpond:sound-toggle"));
  }),
);
document.querySelectorAll(".motion-toggle").forEach((n) =>
  n.addEventListener("click", () => {
    state.paused = !state.paused;
    writeStored("motion", state.paused ? "paused" : "running");
    changed();
  }),
);
matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
  "change",
  (e) => {
    if (!readMotionPreference()) {
      state.paused = e.matches;
      changed();
    }
  },
);
function readMotionPreference() {
  try {
    return localStorage.getItem("duckpond:motion");
  } catch {
    return null;
  }
}
window.addEventListener("duckpond:change", update);
window.addEventListener("storage", refreshState);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) refreshState();
});
update();
