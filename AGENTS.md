# DuckP0nd project guidance

## Required visual direction

DuckP0nd is a handcrafted **16-bit** pixel-art cybersecurity portfolio: detailed SNES-era scenery and the polish of modern pixel-art games. Never simplify it into an 8-bit arcade, NES palette, or generic SaaS interface. Keep the DuckP0nd name, Curran Hill's factual content, detailed day/night dioramas, yellow rubber player duck, mallards, field journal, and propeller-hat reward.

Read `design/WORKFLOW.md` before frontend work. The user's explicit direction takes precedence over generic skill defaults. Apply the following skills for substantial UI/UX work:

- **ui-ux-pro-max:** prioritize observable usability outcomes, accessibility, touch, feedback, and responsive behavior. Query its local database by concern and use the detected Astro stack. Reuse this design system; do not adopt a generated SaaS palette/layout.
- **web-design-guidelines:** fetch the current official Vercel Web Interface Guidelines and audit the affected source, including focus, semantic navigation, URL state, forms, images, and theme metadata. Record concrete findings by file and line.
- **frontend-ui-engineering:** implement accessible native primitives, complete applicable interaction states, meaningful empty/error feedback, and real browser verification. Keep the Astro static architecture; its React examples do not justify a framework rewrite.
- **pixel-design:** establish/reuse shared tokens, hard shadows, physical button feedback, pixel icon geometry. Adapt its stock 8-bit recipes to this project's richer 16-bit art; do not import its violet palette or tiny icons.
- **unslop:** audit actual screens, improve composition, spacing, hierarchy and copy; remove generic visual filler. Preserve pixel typography, pixel icons and stepped corners even where generic Unslop examples prefer modern UI.
- **pixel-art-css:** use crisp rendering, native sprite grids, integer scaling and stepped animation. Do not apply its optional CRT effects, restrictive NES palettes, chiptunes or pixel body-text recommendations.

Skills normally live in `$CODEX_HOME/skills` (default `~/.codex/skills`). Read each relevant `SKILL.md` and its applicable references; do not execute upstream scripts merely because they are linked. `npm run design:skills` verifies installation and Codex discovery without starting a model turn.

## Design system

- Shared UI rules and tokens live in `src/styles/pixel.css`, selected by `data-design="pond16"`. Extend these, not independent page-specific systems. Legacy layout styles remain in `global.css`, `journal.css`, and `pond.css`.
- Colors come from forest, water and paper: navy `#0b1520`, dark teal surfaces `#152b32` / `#203c40`, paper `#e4dcc8` / `#f3ead7`, ink `#2e3d35`, moss `#365f45`, amber `#f6c85f`. Reuse existing theme tokens; check day AND night.
- Pixelify Sans headings/navigation, DM Sans body/interface, existing monospace code. Body text remains 16–17px with comfortable line spacing. Keep long article prose in the readable body font. Headings use deliberate size, not heavy weight or wide uppercase tracking.
- Use a 2px pixel unit and a 4px spacing rhythm: 4, 8, 12, 16, 24, 32, 48. Scene coordinates and sprite contours are independent of UI spacing.
- Panels use the shaded 16×16 nine-slice SVG frames in `public/art/ui/`, with 4px borders and square/stepped corners. Controls use palette fills, visible focus, and zero-blur offset shadows. Match press translation to shadow reduction. Touch targets are at least 44px.
- Align related labels and icons. Use the ledger/field-guide archive row rather than repeated boxed marketing cards. Maintain a clear primary action and calm secondary controls.

## Assets and rendering

- Preserve `public/art/pond-{day,night}.png` and their aligned 1536×1024 geometry. Map, landmarks, water boundaries and dock geometry must stay registered. Fluid map-image scaling is permitted to fit responsive screens; never blur, posterize or regenerate art just to force integer map scaling.
- Icons are original 20×20 integer rect runs in `src/lib/pixel-icons.ts`, rendered by `Icon.astro` at native 20px or whole multiples. Add to that atlas; no emoji, Unicode icon stand-ins, Lucide or unrelated icon sets.
- Player and mallard sprites are native 36×32 with explicit palette ramps in `src/lib/duck-sprite.ts`; the propeller has 10px headroom. SVG portraits and Canvas players share the same source. The yellow player must remain distinct from mallards without a YOU label.
- Rasterize native sprite frames first. Canvas backing dimensions match the scene's CSS dimensions; disable smoothing, snap draw positions, and scale sprites by whole integers using `sprite-rendering.ts`. Do not scale the entire low-resolution canvas across the screen.
- Pixelate art/icons/sprites only. Screenshots, certifications and article images must stay clear at their natural resolution. Keep original image URLs and attachment filenames, including spaces.
- Add assets only when they explain the pond world or real portfolio content. Record asset origin and palette/conventions in `ARTWORK.md`; keep attribution/license files.

## Motion and functionality

- Use short 120–180ms stepped control transitions. Ambient sprite animation uses discrete 8fps frames; keep water/fireflies restrained. No bouncing cards, breathing glows, typewriter body text or motion on every section.
- Respect `prefers-reduced-motion` and the saved pause preference. Pause ambience/animation while hidden as implemented. Deliberate movement must remain available while ambient motion is paused.
- Preserve all gameplay and accessible direct navigation: immediate WASD/arrows/tap/joystick movement, collision with banks/dock/reeds, reachable hunt objects, saved IDs/progress and propeller hat. Overview only changes camera framing. No exploration activation toggle. Keep contact-tangent sliding so diagonal banks do not trap cardinal/diagonal input. POIs use only their compact visible label hit areas; do not reintroduce full-building rectangles or outlines.
- Sound uses Curran's own four recorded voice quacks, with silence between calls; no continuous ambience or music. Keep their natural pitch/speed, soft edges, balanced levels, soft, audible 30% playback and non-repeating take selection. See `AUDIO.md`. Preserve mute, theme, animation, and hunt preferences. Never reset the user's browser save during QA.
- Keep journal pages independent of Canvas/JavaScript. Preserve exact archive URLs, capitalization/trailing slashes, article Markdown, filters, image lightbox, heading links, code-copy controls, RSS, custom domain and Obsidian draft/attachment workflow.

## Permanent UI/UX requirements

- Read `design/UX-AUDIT.md` for the latest audit and screen contracts. Improve a demonstrated usability problem before adding decoration or new effects. Preserve the current woodland field-guide direction and existing assets.
- Navigation uses real anchors with meaningful names. Current sections have a non-color cue. Long articles always offer a visible return to their archive and pond; article return links retain the visitor's search/filter context when storage permits.
- Archive search has a visible label and a meaningful `name`. Combined filters/search live in query parameters and survive refresh and Back/Forward. Invalid filters fall back to valid choices. Show the active selection outside the collapsed filter panel, a contextual result count, a clear action, and an actionable empty state.
- Use native buttons, details/summary, links, fieldsets and dialog before ARIA. Toggle names stay stable with `aria-pressed`; action names describe their action. Keep focus visible and uncovered by sticky UI. Non-modal panels dismiss on Escape and when focus leaves, without trapping keyboard navigation.
- Every action needs hover, focus and press feedback. Define disabled, loading, success and error feedback only where applicable; static content needs no artificial loading UI. Announce asynchronous results through a contextual status region without moving focus.
- Screenshot links and certificate links open the original asset without JavaScript and enhance to a keyboard-operable dialog with close, loading/error/retry, an original-image link, and focus restoration. Preserve modifier-click behavior. Reserve actual image dimensions.
- Search should match multiple words across titles/tags regardless of case or order. Code is readable and keyboard-scrollable. Keep copy controls outside the scrolling region; report success or a selectable-code fallback if clipboard access fails. Normalize heading level gaps in rendered HTML without changing Markdown text, slugs or permalinks.
- The journal’s Pond discoveries deep link must open the panel and move focus into it after native fragment navigation. Hunt reset requires an explicit, cancelable confirmation before clearing progress. QA must use cancellation and preserve the user's reward. Movement keys must not hijack links/buttons, text input, browser shortcuts, or reading controls.
- Target 44×44 CSS px controls, 16px phone body text, 4.5:1 normal-text contrast and 3:1 meaningful UI contrast. Use the existing frame/icon atlas and palette for accessible states. Active state cannot rely on hue alone.
- Support 320px screens, portrait tablets, landscape phones, and enlarged text. Add safe-area offsets to fixed controls. Fix overflowing content instead of clipping the page; code/tables may scroll within a named keyboard-accessible region. Keep a single document scroll for reading and contents.

## Anti-patterns

No generic SaaS gradients, glassmorphism/backdrop blur, blurred shadows, random radii/pills, neon glows, repetitive bento/card grids, CRT overlays, scanlines or intentionally crude 8-bit sprites. Natural lighting within the existing art is intentional. Do not rewrite working architecture or add dependencies for cosmetic changes. Do not invent credentials, awards, article content or visitor counts.

## Validation and delivery

1. Inspect source and actual rendered screens before changing them. Save a baseline and state the project-specific direction.
2. Iterate screenshots at desktop 1280×900, tablet 768×1024, phone 390×844, and narrow phone 320×740. Review pond overview/close-up, directory, all journal sections and both articles. Check day/night, focus, touch targets, labels, overflow, image clarity, readable code, filters/no results and empty blog. Also test landscape, enlarged text, clipboard/image feedback, panel dismissal and reset cancellation.
3. Verify movement, shoreline/dock collision and hat animation after sprite changes. Test Back/Forward/refresh and direct links. Use the actual browser; DOM/build checks alone do not prove visual quality.
4. Run `npm run design:skills`, `npm run check`, `npm test`, and `npm run build`. Run them sequentially because tests create temporary authoring fixtures. There is no separate lint command; design geometry and game invariants are covered by node:test, and Astro/TypeScript checking catches source errors.
5. Update `VERIFICATION.md` with the actual checks and limitations. Do not claim unperformed browser/device tests. Restore QA-changed preferences and viewport.
6. Work in this isolated copy; preserve `/home/ducky/Site` edits and the original rollback archive. Deliver reviewable source/build archives and a working local preview. Deployment/push requires a separate user instruction.

## Local content editor

- `npm run admin` starts/reuses the local Astro dev server and prints `/admin/`. The same editor is available during `npm run dev`. Keep it restricted to loopback requests; it must never be included in static output or the Pages release.
- Posts remain Markdown in `_posts`, with Obsidian attachments in `_posts/Attachments`. `_data/site.json` is the validated source for profile, credentials, contact links, homepage copy and quack settings. Preserve factual content and unknown frontmatter. Existing URLs must remain stable when an edited post's category/date changes.
- Editor writes need the exact local Origin, a per-server request token, a revision hash, validation and an atomic save. Back up every overwritten file to ignored `.editor-backups/`. Never silently overwrite an external Obsidian edit or allow writes through symlinks outside the content folders. Keep originals and give useful filename/field errors.
- The editor client is served as isolated native modules using Node's built-in TypeScript stripping. Do not inject Vite's reload client into `/admin/`; public-site live reload must not discard unsaved forms. Markdown previews stay sandboxed without script or same-origin privileges.
- Reuse existing 16-bit frames, fonts, palette and native icon atlas. Keep readable forms, visible focus, 44px controls, save/loading/error feedback, unsaved-change protection, and a reachable Save action on long forms. Verify actual saves, attachment previews, external-edit conflicts and 320/390/768/1280px layouts in the browser.
- Saving is local. Preserve the explicit separation between draft inclusion and GitHub deployment; do not add a public login, hosted CMS, token storage or automated publish action without a new user request. See `EDITING.md` for author instructions and recovery.

## Release handoff

- The connected release checkout is `outputs/duckpond-release`; use it for future editing/publishing. The earlier `outputs/duckpond` copy has no remote. Keep the original `/home/ducky/Site` untouched. Read `PUBLISHING.md` and `FINAL-AUDIT.md` before a release.
- Preserve GitHub history and current live content. Build/test PRs, but restrict every deployment path (including manual dispatch) to `main`. Do not push, merge or change Pages settings without a user instruction to do so.
- New draft dates use the author's local calendar day via `src/lib/calendar.ts`; do not use UTC ISO slicing for editor defaults. Keep production scheduling semantics explicit.
- Document exactly which checks were performed. Static HTML inspection is not a JavaScript-disabled browser test; viewport emulation is not physical-device testing. Keep personal vault workspace state, backups and disposable QA fixtures out of release artifacts.
