# DuckP0nd UI/UX refinement

Audit date: November 4, 2026. Scope: all nine public HTML pages, shared controls, archive/search flow, article reading tools, mobile directory, and pond input. The original source/artwork/content and accepted gameplay remain in place. Source architecture is Astro static output with plain TypeScript enhancements and Canvas2D; existing `_posts` Markdown, image URLs and routes stay intact.

## Direction

- Product: Curran Hill's cybersecurity portfolio and practical write-ups, with an optional pond to explore.
- Character: curious, precise, playful.
- World: a woodland pond and a paper field guide.
- Moments: the detailed 16-bit diorama and readable screenshots/field notes.
- Signature: the yellow rubber duck and locally earned propeller hat.

This is a focused polish of a real existing identity. Keep the Pixelify Sans/DM Sans pairing, forest/teal/paper palette, shaded pixel frames, sprite atlas, and detailed day/night artwork. Quiet chrome gives content and the pond room to carry the character. No replacement theme or new runtime dependency.

## Audit findings → resolution

Locations identify the components responsible; line numbers below are the final implementation's entry points rather than historical diff coordinates.

- `src/scripts/journal.ts:1` / `src/scripts/archive.ts:1` — archive selections were transient; URL query state now preserves combined filters/search across refresh and article return; multiword queries match across title/tags, with safe parsing, selected-filter summary and clear actions.
- `src/components/Archive.astro:18` — search only had a visually hidden label; added visible “Search write-ups”, a useful example placeholder and a named input. Empty Blog now points to real write-ups instead of only sending readers home.
- `src/layouts/Journal.astro:12` — long articles offered only a sticky return to the pond; added a contextual archive return with preserved filter state. Section selection uses text underline as well as color.
- `src/scripts/journal.ts:1` — copy button was inside horizontally scrolling code, success was visual-only, and screenshot dialogs lacked loading/error recovery. Shared reading enhancements now provide a separate toolbar, scrollable named code regions, status feedback, loading/error/retry and original image access.
- `src/lib/content.ts:1` — legacy Markdown heading gaps rendered H2→H5; normalize the rendered outline without changing text or anchor IDs. Screenshots become real native links instead of images assigned button roles. Heading-link names identify the section.
- `src/pages/about/index.astro:1` — certificate buttons did nothing without JavaScript and lacked dimensions; native links now enhance to the same dialog, reserve actual PNG dimensions, and show “View certificate”. Interface dates use sentence case.
- `src/pages/contact/index.astro:1` / `src/styles/pixel.css:1` — repeated boxes squeezed narrow-screen email text; replaced with one quiet directory ledger and wider text columns. External destinations announce new tabs.
- `src/components/Preferences.astro:1` / `src/scripts/preferences.ts:1` — pressed-toggle names changed with state and theme-color stayed night after switching day. Stable toggle names and matching theme metadata now communicate state consistently.
- `src/pages/index.astro:1` / `src/scripts/pond.ts:1` — directory labels wrapped on narrow phones, the open trigger still said Open, panels could obscure keyboard focus, discoveries had no explicit close, and reset erased progress immediately. Labels are compact, trigger state is explicit, Escape/focus dismissal works, discoveries have a close button, and reset requires a cancelable second step.
- `src/styles/pixel.css:1` — contents used nested scrolling and some navigation/heading-link targets were too small. Contents now follows the document scroll; standalone actions use 44px targets, visible focus, and consistent palette feedback. Fixed controls account for safe areas; short landscape views put the control cluster beside a usable map and use a readable journal sheet. Small tag text and selected-tab keyboard focus were independently checked for contrast. Compact tabs retain their full text and at least 44px targets at 320px.

## Screen contracts

| Screen | Visitor's job / primary action | Required behavior |
| --- | --- | --- |
| Pond | Explore or open a portfolio destination | Immediate movement, compact POIs, accessible directory, preserved hunt/preferences, no modal trap |
| About | Understand experience and achievements | Readable sections, real certificate links, same journal navigation |
| HTB / CTF | Find and read a write-up | Visible search, combined filters, selected context, count/no-results, refresh and return continuity |
| Blog | Understand why no posts are listed | Honest empty state with links to existing writing |
| Contact | Reach Curran | Legible address, large links, clear new-tab behavior |
| Both articles | Read, navigate, inspect and copy | Logical outline, contents/anchors, stable copy toolbar, keyboard scrolling, image dialog, archive/pond exits |
| 404 | Recover from a missing URL | Real navigation and a prominent pond return |

## State and accessibility contract

Use native links/buttons/details/dialog, semantic heading order, visible focus and labeled controls. Non-modal pond panels dismiss on Escape/outside focus, not a focus trap. Image dialogs trap focus natively and return it to the source link. All asynchronous reading controls have contextual feedback and recovery. Hover, focus, press, selected and applicable disabled/loading/error states share existing tokens. No fake loaders on static pages.

Target 44px standalone controls, normal text contrast of at least 4.5:1, readable 16px phone prose, no page overflow, and supported reduced-motion/pause states. Body/code/screenshot text remains readable rather than forcing a pixel font or pixelation. Preserve browser shortcuts and modified link clicks. Hunt QA cancels resets and never changes the visitor's saved reward.

## Verification record

See `VERIFICATION.md` for actual viewport/page/interaction coverage and limitations. Automated checks supplement browser review and do not establish full WCAG conformance or physical-device/screen-reader certification.
