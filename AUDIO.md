# Pond quacks

All four production quacks are Curran Hill's own recorded voice, supplied as `quacks.mp3`. The source recording is preserved outside the website; only the four selected calls are included in the public assets. The previous third-party mallard recording and its credit link/file have been removed from this version.

## Editing

The four calls were cut at sample precision using the installed FFmpeg Skill. Audio Cleanup guidance informed the conservative edit: the source has a quiet background, so broadband denoise, hum notching, speech EQ, compression and speech loudness normalization were unnecessary. Each call retains its original pitch, speed and expression.

| Production file | Source in–out | Gain before mono export | Length |
|---|---|---|---|
| `public/audio/quack-01.mp3` | 0.877–1.369 s | +7.26 dB | 0.492 s |
| `public/audio/quack-02.mp3` | 2.987–3.582 s | +9.30 dB | 0.595 s |
| `public/audio/quack-03.mp3` | 5.827–6.319 s | +10.59 dB | 0.492 s |
| `public/audio/quack-04.mp3` | 7.600–8.286 s | +6.57 dB | 0.686 s |

Each cut includes 80 ms of space before the detected call and 160 ms after it. A 12 ms opening fade and 35 ms closing fade occur in that quiet padding to avoid abrupt edges. Small linear gain adjustments balance the calls; the fourth keeps additional transient headroom. Mono 44.1 kHz MP3s use LAME’s highest-quality VBR setting (`-q:a 0`, measured average rates of 131–161 kbps) and total approximately 45 KB. Edits/encoding use PCM intermediates, with one final lossy encode. The voice is not synthesized, pitch-shifted or time-stretched.

Source SHA-256 is recorded in the separate editing report delivered alongside the WAV masters. The raw recording is not required for a site build.

## Playback

`src/lib/quacks.ts` is the shared asset list. `PondQuacks` randomly chooses another real take, excludes the last successfully played take, prevents overlap, and retains the eight-second interaction cooldown. Scheduled calls stay 35–60 seconds apart with silence between them and 30% HTML audio volume. Recorded peaks leave headroom before that quiet playback gain.

Only the selected clip loads when sound is needed (`preload="none"`). Enabling sound plays one immediate preview; the first pond interaction also unlocks/retries playback inside a real gesture. Preview actions bypass the ambient cooldown, while scheduled/discovery calls retain it. Other preference changes do not request a preview. Remembered mute, visibility and directory pause remain in place. A blocked or failed explicit preview reports a short contextual message. No playback controls, synthetic pitch changes, background bed or music have been added.

## Checks

All clips fully decode, retain the intended cut lengths, have quiet opening/closing edges and remain well below full scale. Gain-adjusted active RMS levels are within approximately 1.5 dB across the four takes. The MP3/PCM comparison measured 30–39 dB encoding SNR. These are technical checks, not a claim of subjective listening by the agent; a human can compare the delivered clips with the original recording. Browser playback checks are recorded in `VERIFICATION.md`.
