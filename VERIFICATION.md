# Verification — November 4, 2026

## Automated checks

- `npm run check`: 38 files, 0 errors, warnings, or hints.
- `npm test`: 29 passing tests covering original permalinks and images, metadata errors, YAML calendar dates, Obsidian and Markdown attachments, missing images, heading anchors, HTML/tables/code, draft creation and exclusion, overwrite protection, water-only boundaries, body clearance, swept movement, landmark and collectible reachability, corrupted saves, blocked storage/reduced-motion defaults, quiet-quack scheduling/cancellation/autoplay rejection, and tap-to-swim routes around the dock and to every landmark/discovery, and a full mallard motion cycle without crossing banks or dock. Five UX regressions cover portable combined filter state, invalid filter fallback, multiword search, semantic heading normalization, and native non-nested screenshot links. Three design tests additionally cover every native sprite frame/palette, integer CSS scaling and animation pause/initial timing, and native 20px icon geometry.
- `npm run build`: succeeds, including 266 local page, asset, and anchor references. Legacy archive URLs are emitted as actual HTML files.
- Production HTTP checks: home, About, Contact, all three archives, both original article URLs, RSS, sitemap, and both artwork assets return 200.
- RSS and sitemap parse as XML and contain the two published posts and eight public routes respectively.
- Built HTML contains content and navigation independently of JavaScript.

## Earlier browser checks

Tested the production output at 320 × 740 and 390 × 844 portrait viewports and a 1280 × 800 desktop viewport, plus the browser's default desktop size.

- The reward is now a colorful propeller hat, shared by the Canvas player and SVG portraits. A pre-existing five-duck save shows the new hat after reload and on journal pages.
- All five ducks can be collected by clicking or tapping. Progress survives a reload; all five unlock the propeller hat; reset restores the initial state.
- On phones, the overview shows the whole pond and all five labels at 320 × 740 and 390 × 844. Keyboard, click/tap, and joystick movement work immediately and zoom toward the duck. Overview changes only the camera framing. Landmark labels stay inside the screen.
- The compact destination labels are clickable. All five labels open their expected chapters, and Return to pond works from each.
- Exploration has no activation toggle or disabled mode. Fresh-page arrow/WASD input moves the duck; movement also works after Overview and Escape. The mobile joystick is visible immediately and stays in place when a nearby prompt appears.
- Click/tap water selects a destination ripple and moves the duck. The compact thumb control moves it and resets on release. Returning from a chapter restores the position and camera view.
- The homepage is a full-height pond with an overlaid notebook directory. All five chapter links and recent notes are available in the directory. Opening it stops sound; close, Escape, and clicking outside dismiss it. A chapter opens its independent journal page, and browser Back returns to the pond.
- The player is a bright yellow rubber duck with no YOU marker. Other swimming ducks are green-headed mallards. Shared pixel artwork keeps the player, header portrait, and propeller-hat reward consistent; native-size raster sprites avoid fractional pixel seams.
- The continuous synthesized ambience has been removed. The replacement media is 0.504 seconds long, plays once rather than looping, and stops after the call. Its playback volume is 6%, with 35–60 seconds between scheduled calls. The remembered sound toggle and directory pause work.
- All swimmers use water boundaries traced to the artwork, including the dock, posts, banks, and reeds. Keyboard and touch movement stop before the player’s body reaches them. Tapping a bank is rejected with a helpful message. A tap route from above the dock to the lower pond goes around the dock; E still opens its journal from reachable water. Player/mallard overlap uses depth order. Existing five-duck progress and the propeller hat survive this change.
- Swimming into a collectible increments progress. Keyboard and held touch controls move the duck. Approaching the noticeboard and pressing E opens HTB write-ups.
- Reading pages share the directory’s parchment palette and chapter tabs. Duplicate header navigation is removed. The first HTB article starts at about 426px in a 390 × 844 viewport, with search visible and filters initially collapsed. The Return to pond link stays visible while reading long articles.
- HTB title/tag search, difficulty, and OS filters combine correctly, including no-results states. The collapsed filter summary reports the number of active groups and Clear resets them. CTF search, category, and event filters combine correctly and clear correctly.
- Both existing article URLs render correctly. Image expansion opens a modal and Escape closes it. Code copies to the clipboard. The contents list and heading links work; browser Back/Forward preserve navigation.
- Night/day changes the artwork and interface. Theme stays consistent when returning from the journal. Sound and animation settings persist across reloads.
- The blog has an honest empty state. About includes the newer CTF@CIT and September 2026 CyberHawks achievements from the live site. Contact retains the existing profile and email links.
- No browser console errors were reported during the final production checks.

## Earlier focused Unslop polish

The approved polish retains the artwork, fonts, paper journal, game behavior, and content. Interface labels use sentence case and larger type; landmark glows are replaced with quiet outlines. That historical pass used Lucide; the subsequent 16-bit pass below replaces it with an original pixel atlas. Active filters show a count only when needed, with a matching accessible name. Settings icons follow day/night, mute, and pause state across reloads.

## Delivery state

This is an isolated local implementation. The original `/home/ducky/Site` was not edited; its existing local modifications remain intact. The original site is also saved in the sibling `duckpond-original.tar.gz` archive. The supplied article Markdown files are unchanged.

The GitHub Pages workflow and existing custom domain are prepared, but no public deployment or DNS change was performed. Local preview is on port 4322. To restart later, run `npm run preview -- --port 4322` from this folder, or `npm run dev` for authoring and live preview.

Browser autoplay restrictions can delay the default-enabled occasional quacks until an interaction permits playback. Game saves remain local to a browser; blocked storage uses page-session state. These are intentional behaviors.


## 16-bit workflow and visual QA

All three requested skills are installed: Pixel Design and Pixel Art CSS were newly installed after reading their upstream instructions/source structure; existing Unslop was retained. `npm run design:skills` successfully validated their metadata and received enabled entries for all three from Codex's local `skills/list` API with a forced reload. It does not start a model turn. `AGENTS.md` and `design/WORKFLOW.md` persist the mandatory 16-bit direction and how to adapt each skill.

The pass adds a shared shaded-frame/token layer, original native 20px pixel icons, Pixelify headings/navigation, field-guide archive rows, coherent forest/paper day/night controls, physical stepped press feedback, touch-sized article controls, richer shared duck/mallard sprites and native-grid animation. No new frontend dependency was added; Lucide was removed. Detailed pond assets and article content remain unchanged. Canvas sprites now draw at integer CSS scales on a backing grid matched to the scene, rather than stretching a low-resolution canvas. A browser-discovered first-frame timing error was fixed with nonnegative elapsed-time/frame guards.

Actual production-output screenshots were reviewed iteratively at 1280×900, 768×1024, 390×844 and 320×740. The pre-change journal screenshot is retained for comparison. This review covered pond overview and close-up, the directory, About/certifications/awards, HTB, CTF, empty Blog, Contact, both article permalinks and 404. Portrait tablets now receive the overview/touch layout. Narrow-phone label/joystick overlap, a clipped desktop label, a lightbox horizontal scrollbar and header contrast over day trees were corrected after visual review.

Interaction checks in this pass included:

- Combined HTB difficulty/OS/search and CTF category/event/search, no results, reset and active-filter labels.
- Article contents anchors, expandable screenshots/close, syntax-highlighted code and actual Copy → Copied feedback. Contents links and Copy controls are 44px or taller. Expanded images have no horizontal overflow on phone.
- Back/Forward, direct article refresh and persisted day/mute settings. Final state restored to night, muted, ambient animations running; existing 5/5 progress retained.
- Immediate arrow movement, a held mobile joystick, tap-to-swim, movement while ambient animation is paused, and stopping before the dock. Game/pathfinding tests additionally cover all banks, reeds, dock, landmarks and collectibles. The hunt was not reset during this pass.
- Shared SVG portraits and Canvas player both retain the propeller hat. Mallards remain distinct. Screenshots/certification assets retain normal image rendering, while icons/map/sprites use crisp pixel rendering.
- Shared focus outlines, reduced-motion CSS and pause behavior, semantic navigation, and server-rendered journal content remain present. Blocked storage, reduced-motion defaults and autoplay rejection are covered by automated tests. This pass did not use a physical phone/tablet or a screen reader; responsive QA used browser viewport emulation. JavaScript-disabled behavior is supported by static HTML/native disclosures and checked at build/source level; no browser JavaScript-disable capability was available in this session.

Final checks: Astro/TypeScript: 34 files, zero errors/warnings/hints; 21 tests passing; static build successful with 232 local page/image/anchor references verified. Fifteen final HTTP route/feed/frame checks returned 200, and the final browser run recorded no console errors. No separate lint script exists. No production deployment or DNS changes were made. The local preview remains on port 4322.

Screenshot artifacts beside this source folder: `duckpond-16bit-{desktop,tablet,mobile,narrow-mobile}.png`, `duckpond-16bit-journal-desktop.png`, `duckpond-16bit-directory-mobile.png`, and `duckpond-16bit-day-closeup.png`.


## Shoreline movement refinement

The old collision footprint was a 140×80 art-pixel rectangle around each swimmer, including its wake. It rejected visibly open shallows and made banks/dock feel farther away than they appeared. It is now a 72×24 art-pixel rounded ellipse centered at the duck's waterline. The existing shoreline/dock/reed traces are retained; a small polygon follows the mailbox box/post where it projects over the water. Heads and decorative wakes do not add collision padding.

A new regression test swims actual planned routes into six art-referenced shallow-water locations beside the cabin, north bank, dock and southern lilies. Bank/post overlap, swept collision, routes around the dock, the complete mallard cycle and all hunt/landmark reachability tests still pass. 22 tests total; Astro checking has no errors/warnings/hints and the static build verifies 232 local references. Browser checks cover before/after taps on the same cabin shallows, pushing into the bank, approaching the dock, and responsive movement. On narrow phones the close-up scene and movement controls are raised 32px so the newly reachable southern water and joystick stay above the taller journal control. Preferences and 5/5 progress were preserved. Updated browser proof is saved beside the project as `duckpond-boundaries-desktop.png` and `duckpond-boundaries-mobile.png`.


## Smooth shoreline movement and compact POIs

Movement now sweeps to the contact point and projects the remaining motion along the actual bank/obstacle tangent in artwork pixel coordinates. It handles successive contacts around corners and uses a tiny sub-pixel clearance to avoid repeatedly catching the same edge. This replaces the horizontal-then-vertical fallback; the waterline footprint and solid objects are unchanged.

Two new regressions verify continued progress along a diagonal northern bank, immediate steering back into open water, and consistent results at 15/30/60/120fps. All 24 tests pass, including collision safety, long movements, dock routes, the mallard cycle and every hunt/landmark route. Astro checking remains clean; the production build verifies 232 local references.

POI anchors now match only their visible destination labels. Removed full-object hit rectangles and proximity/hover pseudo-element outlines. Compact label highlights and keyboard focus remain. Browser geometry confirms link and label sizes match for all five destinations, with no outer pseudo-element. Clicking water inside a former dock hit rectangle stays on the pond and starts a swim. Keyboard label navigation opens the About chapter and browser Back restores the pond. Responsive review covers desktop, tablet, and both phone widths; saved night/mute/motion/hunt state is preserved.


## Current UI/UX refinement and final QA

All six skills are installed, enabled and discoverable through Codex for this project: UI/UX Pro Max, Vercel Web Design Guidelines, Frontend UI Engineering, Pixel Design, Unslop and Pixel Art CSS. The first three were missing and installed only after inspecting their official instructions. Standalone reference/command paths were configured and re-verified. See `design/WORKFLOW.md` for provenance and `design/UX-AUDIT.md` for findings, direction, screen contracts and resolutions. `AGENTS.md` retains the prior guidance and adds permanent usability/accessibility rules.

Final automated results: **37 files checked with zero errors/warnings/hints; 29 tests passing; 9 HTML pages built; 267 local page/asset/anchor references verified.** There is no separate lint command. Game, sprite, content and authoring tests still pass. Original article Markdown and detailed artwork are unchanged. No frontend runtime dependency was added.

### Rendered pages and viewport coverage

Actual browser screenshots reviewed for all nine HTML pages at desktop 1280×900, portrait tablet 768×1024, phone 390×844 and narrow phone 320×740. These include home, About, HTB, CTF, empty Blog, Contact, both exact article permalinks and 404. An additional all-page check at 375×812 also found no horizontal overflow and exactly one H1 per page. Representative 1024×768 tablet, 844×390 landscape phone, and wide desktop views were checked. Screenshot proof and the 45 page/viewport measurements are in the sibling `duckpond-ux-qa/` directory.

The review caught and corrected search compression, narrow email wrapping, clipped compact tab labels, small tab targets, insufficient small-tag contrast, selected-tab focus contrast, and a tiny landscape overview. Full labels now fit 320px with at least 44×48px section targets. Landscape phones keep the control cluster beside the full usable pond map and all five destination labels.

### Real interaction checks

- All five compact POI links open the correct section; Back returns to the pond. Directory chapter navigation and recent-note links remain semantic anchors. Opening/closing by mouse, keyboard, Escape and outside focus was checked. Focus is visible on close/actions and restored to the relevant trigger. The journal’s Pond discoveries deep link focuses Close discoveries after native fragment navigation completes, so keyboard users can enter the panel directly.
- HTB search plus Easy/Linux filters survives refresh, browser Back/Forward, and dedicated article return links. CTF Misc/event selections combine correctly and remain visible with Filters collapsed. Zero-result recovery clears both search and filters, restores the list and focuses Search. A multiword `linux OUTBOUND` query finds the expected entry.
- Both original article routes render and refresh. Contents opens, links navigate to unchanged heading IDs, and the outline no longer skips H2→H5. Contents uses the main document scroll. Persistent links lead to the relevant archive or pond.
- **All 30 original write-up images** were individually opened in the browser image dialog and closed with Escape, with no load failures. Certificate expansion opens the 2339px original. Dialog keyboard navigation stays inside, and closing restores the source link's focus. Original-image links remain available.
- Actual copy success produces “Copied” and a contextual status announcement. Keyboard ArrowRight scrolls a named code region while its copy toolbar remains in place. An isolated Permissions-Policy-denied clipboard test selects the code and announces the manual copy alternative. An intentionally missing image produces visible error/retry/original-image actions; Retry and Escape work. Fault injection was confined to temporary local QA servers, never the production source.
- Native browser testing with scripts disabled by a sandbox policy confirmed the journal directory, archive list, native contents disclosure, screenshot links and certificate links work. It caught a settings stylesheet ordering problem; nonfunctional settings are now hidden with JavaScript disabled and the pond map's static description offers destination navigation only. The final no-script About tree contains no dead settings controls. This supersedes the earlier source-only no-JavaScript limitation above.
- Deliberate keyboard movement works with ambient animation paused and still glides off banks. Controls do not intercept activation keys on focused links/buttons. Moving keyboard focus to a landmark cancels an in-progress route so camera movement cannot obscure focus. The saved hunt still shows 5/5 and the propeller hat.
- Reset cancellation was exercised on the main save without changing its progress. In a **separate local QA origin**, collected all five ducks, verified the saved hat after refresh, and confirmed reset restores 0/5 and all five collectible buttons. The user's save was never reset.
- Day mode updates the artwork and browser theme-color and survives refresh; night was restored. Stable sound/pause toggle names expose their pressed state. Quiet-quack timing, blocked autoplay, blocked storage and reduced-motion defaults remain covered by tests. Saved pause was used for settled screenshots; ambient motion was restored after QA.
- Representative normal-text contrast was measured in both themes. Small tag text is now **4.75:1 night / 5.31:1 day** against its fill. Selected-tab focus ink contrasts **5.34:1** against its green surface. Focus outlines and active underlines provide non-color cues.
- The main preview's browser console had no errors during final checks. Temporary fault-page network/permission errors were expected and isolated.

Browser viewport emulation is not physical-device or screen-reader testing. Native OS reduced-motion switching, a full browser zoom matrix and an axe/WCAG certification audit were not performed; CSS/default-state behavior, semantic accessibility, keyboard use, 320px reflow and saved animation pause were checked. No known functional blocker remains from this pass.

Final delivery keeps the original rollback archive and original `/home/ducky/Site` local edits intact. The reviewable source/static archives and complete patch are refreshed. Local production preview remains on port 4322; nothing was deployed publicly.

## Initial voice-quack replacement

The production audio now consists of four short calls from Curran's supplied `quacks.mp3`, replacing the third-party mallard recording. The source recording's SHA-256 remains unchanged. Sample-accurate cuts retain quiet padding, 12 ms / 35 ms edge fades, natural pitch/rate and expression. Per-take linear gains balance active RMS to within about 1.5 dB. No speech preset, denoise, EQ, compressor or time stretching was used. See `AUDIO.md` for the exact time ranges and gains.

- Production lengths: 0.492, 0.595, 0.492 and 0.686 seconds. Mono 44.1 kHz highest-quality VBR MP3s total 45,500 bytes. Full-band sample peaks measure -14.7, -15.9, -15.3 and -10.5 dBFS, leaving ample headroom before 6% site playback volume. All clips decode fully, have quiet edges and match their PCM masters with 30–39 dB encoding SNR. WAV masters and editing/analysis reports were delivered separately, outside public site assets.
- The shared four-file pool selects another real take without consecutive repeats. Existing 35–60 second intervals, eight-second cooldown, no overlap, saved mute, directory/visibility pause and caught autoplay rejection are preserved. The expanded audio regression test verifies the pool files, repeat exclusion, overlap and cooldown alongside scheduling, hidden/muted state and autoplay failure.
- Actual Chromium playback: all four clips loaded from the built site's assets and reached their ended event at 6% volume and normal playback rate. In a separate localhost QA pond, collecting a duck played `quack-03.mp3`; a subsequent discovery selected `quack-01.mp3`. Opening the directory immediately paused and rewound the second call. The main visitor's 5/5 save was preserved throughout.
- The field journal now has its RSS link without a sound-credit link. Both the old media and its public credit file are absent from current source/build. Desktop 1280×900 and tablet/phone widths 768, 390 and 320 were checked. There was no horizontal page overflow; the phone journal footer was reachable by its normal scroll.
- Required checks passed in sequence: six design skills discovered/enabled, Astro/TypeScript 38 files with zero diagnostics, 29 tests, and nine production HTML pages with 266 verified local references. Browser media playback completed without page console errors.
- Final main-preview state restored: night, muted, animations running, close-up camera, 5/5 discoveries and propeller hat, default viewport. The original recording and `/home/ducky/Site` remain untouched. Temporary audio QA tabs/server were closed after verification.

Technical playback/level/edge checks were performed; the agent did not perform a subjective listening assessment of the user's voice. The edits deliberately preserve the recorded performance. No physical device or speaker calibration is claimed.


## Current audibility and sound-control fix

The initial 6% gain made the body of these already-quiet recordings roughly -53 dBFS, so technical decode/playback success did not establish a useful listening level. Playback now uses 30% gain (about 14 dB higher), retaining the same unaltered four voice assets and long silent gaps. Their full-band peaks at that gain remain about -25 to -21 dBFS.

Enabling sound requests an immediate preview inside the toggle's click/keyboard action, instead of requiring a 35–60 second wait. The first pond gesture also attempts playback, and blocked playback is retried inside the next real gesture. This matters even with an existing 5/5 save, where visitors have no remaining collection sounds to trigger. Ordinary calls still use the eight-second cooldown; deliberate sound-on previews can bypass that cooldown and never overlap an existing call. If a sound-on request occurs while the journal/page pauses audio, the preview waits until the pond can resume. Explicit preview errors produce contextual feedback rather than silently leaving the visitor guessing.

Validation:

- Required checks passed sequentially: all six design skills enabled/discovered; Astro/TypeScript 38 files, zero diagnostics; all 29 tests; nine-page production build with 266 verified references.
- Audio tests now cover the audible gain, immediate sound-on preview inside cooldown, blocked-autoplay recovery through a gesture without a timer wait, and no repeated calls from later routine interactions. Existing mute, hidden-page, timer cancellation, take variation, asset existence, cooldown and overlap checks pass.
- Actual production preview: toggling sound off/on started a new clip immediately (playing at about 0.23 seconds when inspected). A normal keyboard gesture recovered playback after a modifier-only gesture did not start it. At a 390px phone viewport, keyboard Space on the sound toggle started a clip immediately (about 0.02 seconds when inspected). Natural playback rate stays 1.
- Clicking the sound setting while the journal was open dismissed the journal through its existing outside-click behavior and immediately played the preview. Other settings remain separate from the sound-preview event.
- The visitor's existing 5/5 progress and propeller hat remain intact. Final state is night, sound enabled as observed at the start of this fix, animations running, close-up/default viewport. No microphone recording or original audio file was changed.

This pass verifies playback, event timing and signal gain. Speaker/headphone calibration and subjective listening by the agent are not claimed.

## Local Pond keeper editor — November 4, 2026

- User selected local administration. Added `npm run admin` and `/admin/` on the local Astro dev server, with native browser forms for posts, About/awards, Contact and pond/quack settings. No additional dependencies, service account or public login.
- Final `npm run design:skills`: all six design skills valid, enabled and discovered.
- Final `npm run check`: 50 files, **0 errors, 0 warnings, 0 hints**.
- Final `npm test`: **39 passing tests**. Ten editor tests cover actual file creation/saves, unknown frontmatter, URL stability, backups, stale revisions, traversal/linked folders, duplicate filenames, missing images/invalid metadata, upload signatures/deduplication/spaces, site settings, preview, API host/origin/token gates and filename errors for broken YAML/JSON. Existing gameplay/audio/design/Markdown/UI tests pass.
- Final `npm run build`: **9 pages**, **266 local page/asset/anchor references verified**. A permanent check rejects private admin/content directories in `dist/`.
- Built once with the browser-created draft and its uploaded image still present: confirmed neither the draft nor the draft-only image reached production. Also confirmed no admin/API route or `_data/site.json` output. Removed those disposable fixtures afterward; the final build has the original two public articles and empty Blog.
- Browser tests: created/previewed/saved a draft, uploaded a PNG with spaces, confirmed its real journal image loaded (240px native width), and exercised a real external file conflict. The editor retained unsaved text and rejected overwrite. Settings save stayed on the current form without a site-HMR reload. Tested award/contact add/remove, file reload, validation feedback, no-results search, CTF filtering, native keep/discard, Escape after an earlier discard, Ctrl+S, and quack sample start/completion. Restored original content and quack defaults (30%, 35–60 seconds).
- Visual QA: desktop 1280×900, tablet 768×1024, phone 390×844, narrow phone 320×740. No document overflow. Reviewed actual screenshots; refined tablet toolbar composition, phone header/copy density, optional image disclosures and focus contrast. Long forms retain a sticky Save action. Screenshot outputs: `duckpond-admin-desktop.png`, `duckpond-admin-tablet.png`, `duckpond-admin-mobile.png`, `duckpond-admin-320.png`.
- Browser regression: About, Contact, HTB, CTF, Blog, Outbound, Peel Carefully and pond rendered their expected page titles without document overflow. `duckpond-admin-public-regression.json` records that route check. Reviewed About at phone size and followed Contact navigation. Existing 5/5 visitor reward remains; browser saves were not reset.
- Documentation: `EDITING.md`, README/author workflow, `AGENTS.md` and `design/EDITOR-AUDIT.md` cover use, publishing, local-only operation, authoring limits and backup recovery. Backups are ignored and excluded from release/source archives.
- Working local editor: http://127.0.0.1:4323/admin/. Existing static review preview remains http://127.0.0.1:4322/. Original `/home/ducky/Site` edits and rollback archive preserved; nothing pushed/deployed.
- Limits: visual/browser QA used desktop browser emulation, not physical phone or full screen-reader testing. Native unsaved section dialogs were exercised; the unload guard is implemented but a browser/OS closing flow was not automated. Invalid hand-written YAML syntax or broken site JSON needs text-editor repair using the named file. Art geometry and replacing voice source files remain code/audio workflow tasks. The local editor does not publish to GitHub.

## Final production audit — November 4, 2026

See `FINAL-AUDIT.md` for the complete scope and limitations. A new connected `outputs/duckpond-release` checkout preserves current GitHub main/history and local `duckpond-16bit` changes without committing or pushing. The editor/preview now run from that same checkout.

Final checks: clean 358-package install; six installed/enabled/discovered design skills; 52 Astro/TypeScript files with no diagnostics; 41 passing tests; nine production pages and 268 validated local references. All original article Markdown and 40 canonical images match current main. Fixed the missing 2026 certificate, local-evening draft date, main-only manual deployment guard and busy-save library controls.

Browser QA covered 36 route/viewport combinations, mobile Overview, landscape, all five destinations, combined filters/no-results, article tools, Back/Forward, sound-on playback, day/night, reset cancellation, editor draft/upload/preview/Ctrl+S, unsaved Escape/discard, and editor reflow at four widths. Draft and draft-only upload were verified absent from production and removed. Visitor night/mute/animation and 5/5 progress restored; clipboard and viewport restored. `final-audit/` contains actual screenshots and responsive measurements. No known local blocker; hosted deployment and physical-device/screen-reader verification remain unperformed.
