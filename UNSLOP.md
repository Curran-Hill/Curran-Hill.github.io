# DuckP0nd design polish

Historical focused pass, November 4, 2026. The subsequent user-requested 16-bit workflow in `design/WORKFLOW.md` and `AGENTS.md` supersedes the modern Lucide/Georgia choices below. Current icons are original native20px pixel sprites, headings use Pixelify, frames are shaded stepped pixels, and UI transitions use steps().

## Direction

- Product: Curran Hill’s cybersecurity portfolio and writing.
- Character: curious, playful, woodland.
- World: moonlit water, timber, paper, and ink.
- Moments: the pond diorama and yellow rubber duck.
- Signature: matching chapter numbers on landmarks and journal entries.

This project uses Unslop in polish mode. Keep the established artwork, Pixelify wordmark, DM Sans interface, Georgia journal headings, paper palette, and full-screen pond layout when making related design changes.

## Audit

- Landmark hover/nearby states had colored glows over the scenery (`pond.css`).
- Landmark descriptions were 9px; journal labels were 10px and widely tracked (`pond.css`, `journal.css`).
- Settings, navigation, and contact links mixed unrelated Unicode glyphs (`Preferences.astro`, `index.astro`, `contact/index.astro`).
- Directory paddings and row heights used inconsistent spacing (`pond.css`).
- Journal and archive metadata repeated uppercase labels (`Journal.astro`, `Archive.astro`).
- Greeting and generic directory headings added little context (`index.astro`).
- Filter counts displayed zero as a permanent badge; active counts lacked a clear accessible name (`Archive.astro`, `journal.ts`).
- Small paper captions and day-mode footer text needed slightly stronger contrast.

## Nine passes

1. **Spacing:** regularized interface padding, gaps, and rows around a 4px rhythm. The directory uses 64px minimum rows on desktop and 56px on phones. Scene coordinates and collision geometry remain independent of interface spacing.
2. **Color:** retained the pond and paper palette. Landmark glow was replaced with a quiet outline and label state; focus rings remain visible. Small paper captions now exceed 4.5:1 contrast.
3. **Icons:** added one shared `Icon.astro` component using Lucide, 18px with 1.5px strokes. Settings, navigation, contact, archive, and image controls share that treatment. The pixel duck remains the mascot and game character.
4. **Copy:** changed interface labels to sentence case, made headings specific to the portfolio, simplified Search, and removed repeated instructions and decorative punctuation. Article Markdown and factual portfolio content are preserved.
5. **Type:** kept the existing fonts. Supporting interface labels are generally 12px or larger, with normal tracking. Chapter numbers, dates, and counters use tabular figures. Small text printed on the decorative notebook illustration is separate from readable control labels.
6. **Layout:** retained the full-screen pond, physical landmark links, notebook directory, and journal section order. Mobile keeps its overview and compact navigation.
7. **Details:** aligned SVG controls, added keyboard keycaps, regularized paper/control corners, and made filter counts appear only when active. Filter summaries announce the active count; reset clears it.
8. **Visuals:** the existing pond remains the principal visual. No new artwork was needed for this focused polish.
9. **Motion:** unified UI feedback around one easing curve and retained the short notebook entrance. Pond motion, deliberate movement, pause controls, and reduced-motion behavior remain available.

## Validation

Run `npm run check`, `npm test`, and `npm run build`. Browser review covers desktop and portrait phones, combined filters and their reset/no-results states, preference icon states and persistence, directory navigation, article image controls, and movement beside the dock. The original site remains outside this isolated implementation.

## Credits

Design process adapted from [Unslop by Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop/tree/main/skills/unslop), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The installed skill is in `/home/ducky/.codex/skills/unslop`.

The historical pass used Lucide for Astro (ISC). It has since been removed; current UI icons are original code-native project artwork.
