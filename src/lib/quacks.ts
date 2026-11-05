import { siteData } from "./site-data.ts";
/** Curran's four recorded takes. Keep the same voice, pitch and playback rate. */
export const quackSources = [
  "/audio/quack-01.mp3",
  "/audio/quack-02.mp3",
  "/audio/quack-03.mp3",
  "/audio/quack-04.mp3",
] as const;

// These recordings have plenty of headroom; 6% made their body nearly inaudible.
export const quackVolume = siteData.pond.quackVolume;
export const quackInterval = [
  siteData.pond.quackIntervalMin,
  siteData.pond.quackIntervalMax,
] as const;
