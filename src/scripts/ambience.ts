import { state } from "./state.ts";
import { quackSources, quackVolume, quackInterval } from "../lib/quacks.ts";

/** Silence between short, quiet calls. No continuous source or audio loop. */
export class PondQuacks {
  private audio: HTMLAudioElement;
  private timer?: ReturnType<typeof setTimeout>;
  private active = false;
  private lastPlayed = -Infinity;
  private lastClip = -1;
  private interactionNeeded = true;
  constructor() {
    this.audio = document.querySelector<HTMLAudioElement>("#pond-quack")!;
    this.audio.volume = quackVolume;
  }
  start() {
    if (!state.sound || document.hidden || this.active) return;
    this.active = true;
    this.schedule();
  }
  private schedule() {
    clearTimeout(this.timer);
    if (!this.active) return;
    this.timer = setTimeout(
      () => {
        void this.quack();
        this.schedule();
      },
      (quackInterval[0] + Math.random() * (quackInterval[1]-quackInterval[0])) * 1000,
    );
  }
  /** Retry inside a real gesture, rather than leaving blocked autoplay on a timer. */
  async unlock() {
    if (this.interactionNeeded) return this.quack({ preview: true });
    return "skipped";
  }
  async quack({ preview = false } = {}) {
    if (
      !this.active ||
      !state.sound ||
      document.hidden ||
      (!preview && performance.now() - this.lastPlayed < 8000) ||
      !this.audio.paused
    )
      return "skipped";
    this.lastPlayed = performance.now();
    // Pick another real take instead of changing the pitch or speed of one clip.
    const choices =
      this.lastClip < 0 ? quackSources.length : quackSources.length - 1;
    let clip = Math.floor(Math.random() * choices);
    if (this.lastClip >= 0 && clip >= this.lastClip) clip++;
    try {
      this.audio.src = quackSources[clip];
      this.audio.currentTime = 0;
      await this.audio.play();
      this.lastClip = clip;
      this.interactionNeeded = false;
      return "played";
    } catch (error) {
      this.interactionNeeded = true;
      const name = error instanceof Error ? error.name : "";
      if (name === "AbortError") return "skipped";
      return name === "NotAllowedError" ? "blocked" : "unavailable";
    }
  }
  pause() {
    this.active = false;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.audio.pause();
    try {
      this.audio.currentTime = 0;
    } catch {}
  }
  destroy() {
    this.pause();
  }
}
