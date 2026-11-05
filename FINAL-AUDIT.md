# Final release audit — November 4, 2026

Ready for the user's GitHub review and release. No commit, push, PR, merge, GitHub setting change or production deployment was performed.

## Release source

Use `outputs/duckpond-release`, connected to `https://github.com/Curran-Hill/Curran-Hill.github.io.git`. Its local `duckpond-16bit` branch begins at existing `main` commit `b2c222a6cf2ab71e1c2d108c49891bf2270bc482`; all migration changes remain uncommitted and reviewable. Full existing history and a local `before-pond-2026-11-04` tag are retained. The earlier `outputs/duckpond` source, original `/home/ducky/Site` edits and `duckpond-original.tar.gz` rollback archive are preserved.

The editor at http://127.0.0.1:4323/admin/ now saves into this release checkout. The production preview at http://127.0.0.1:4322/ serves its current `dist/`. Saved editor changes appear immediately in the development site; a production preview needs a new build. Use [PUBLISHING.md](PUBLISHING.md) for the exact initial-release, later-update and rollback commands; [EDITING.md](EDITING.md) covers everyday editing and recovery.

## Findings fixed

- Restored the existing 2026 UND CyberHawks finalist certificate from GitHub's newer main into `public/assets/images/UND-2026-Finalist.png`, and connected it to the existing award in `_data/site.json`. It loads at its original 409×409 resolution and expands correctly. Both original article Markdown files and all 40 canonical public images match current main byte for byte.
- New editor drafts and the post-creation command use the local calendar date. A Chicago evening no longer defaults to tomorrow because UTC has advanced. Production future-date exclusion remains explicitly documented as UTC and requires a build on/after the post date.
- The Pages deploy job now requires `refs/heads/main`, including manual dispatch. PRs validate/build without deployment. Verified current official checkout/setup-node v7 action tags; CI uses Node 24. Old Jekyll presentation, build workflow and generated copies are removed from the working tree; original history remains available.
- Disabled library search/filter controls during a pending save, alongside other editing controls, to keep navigation and save feedback consistent.
- Excluded generated `_site` and Python cache directories, personal Obsidian workspace state, dependencies and local backups from release material.

## Automated validation

| Check | Result |
| --- | --- |
| Fresh dependency installation | `npm ci --offline --no-audit --no-fund`, 358 packages installed |
| Installed design skills | All six valid, enabled and discovered |
| Astro / TypeScript | 52 files; 0 errors, 0 warnings, 0 hints |
| Node tests | 41 passed, including local-calendar and main-only release regression tests |
| Production build | 9 HTML pages; 268 local page, asset and anchor references verified |
| Draft exclusion | Browser-created draft and its sole uploaded attachment absent from production; fixtures removed afterward |
| Private editor exclusion | Admin/API, source settings and backup directories absent from `dist/` |
| Static reading content | All eight content routes contain semantic text and real navigation before scripts execute |
| Content preservation | Both original article bodies/frontmatter and 40 original canonical images identical to current GitHub main |

There is no separate lint command. Checks ran sequentially; the final clean build followed disposable-fixture removal. The production patch is based on the verified GitHub main, rather than the older review-copy baseline, and passes `git apply --check` in a clean checkout of that exact commit. See `duckpond-production.patch` beside the source/build archives; use the prepared checkout directly for the normal release flow.

## Actual browser verification

- Opened all five landmarks to the correct journal sections. Tested journal open/Escape, immediate keyboard movement, discovery-reset cancellation, and the existing 5/5 reward. No hunt progress was reset.
- Enabled sound and observed immediate actual playback with loaded audio, then restored mute. Tested day mode and restored night. Restored ambient animations to running after still captures. Quiet voice assets and normal playback rate are unchanged.
- Tested HTB search with combined Easy/Linux filters, a Windows no-results case, clearing filters, and the original Outbound permalink. Tested CTF Misc/event filters, Peel Carefully, and Back/Forward with preserved query parameters.
- Tested article heading links, contents, successful code copy, image expansion/close, certificate expansion, archive return, empty Blog and Contact navigation. Restored the clipboard after the copy test.
- Captured all nine routes (including 404) at 1280×900, 768×1024, 390×844 and 320×740: **36 route/viewport checks**, with no horizontal document overflow and production canonical URLs. Reviewed representative screenshots for the pond, About, both archives/articles, Contact and Blog. The mobile Overview keeps all five destination links visible with 48px-high hit areas; close-up intentionally pans with the player. Also checked the 844×390 landscape pond.
- In the release editor, created a draft with Markdown/code and a PNG filename containing spaces; previewed it, saved via Ctrl+S, and loaded its full local article with the image's actual 240px native width. Confirmed the date was the local November 4. Tested unsaved-change Escape and discard; saved content remained intact. Removed only the owned disposable draft/upload afterward.
- Rechecked editor Contact layout at 1280, 768, 390 and 320 widths, with no document overflow and a 44px Save control. Previous editor QA covered external-file conflict rejection, field errors, settings/image editing, quack preview and backups; its regression tests remain passing.
- No browser warning/error logs were captured in the final QA tab. The public site and clean editor remain open; temporary QA tab closed and viewport restored.

Screenshots and measured route results are in the sibling `final-audit/` output directory. `duckpond-final-desktop.png` and `duckpond-final-certificate.png` show the final site and restored award.

## Limits and release follow-up

No known local blocker remains. This is desktop-browser viewport emulation, not physical-device, full screen-reader, speaker calibration or formal WCAG certification. Reduced-motion/storage/autoplay failure paths have code and automated coverage; no OS preference switching or browser-storage fault injection was repeated in this final pass. Static HTML was inspected for reading without scripts; a JavaScript-disabled browser session was not run. Audio playback was verified technically; subjective voice listening is not claimed.

The actual hosted GitHub Actions run, repository Pages permissions, custom-domain/HTTPS settings and live-domain behavior after migration still need confirmation when the user publishes. Existing public-repository drafts remain readable on GitHub if committed, even when excluded from the website. The editor is local only, and saving does not deploy. No new credentials or external services were introduced.
