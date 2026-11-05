# DuckP0nd

A detailed 16-bit pixel-art pond and Markdown field journal for Curran Hill. Static Astro output, TypeScript, and a small Canvas2D game. Journal pages and landmark links work without JavaScript.

## Run locally

Use Node 24 or newer. From this folder:

```sh
npm ci
npm run dev
```

Open the printed Local URL (normally http://127.0.0.1:4321). The project launcher disables Astro telemetry. Fonts and artwork are hosted with the site.

```sh
npm run check
npm test
npm run build
npm run preview
```

Production output is `dist/`. `npm run preview` serves that output.

## Edit in a browser

Run `npm run admin` and open the printed **Pond keeper** URL. Edit posts, About/awards, Contact, homepage text and quack settings in the local browser panel. Upload images, preview Markdown and save to the existing files. Backups and external-edit conflict checks protect your work. Nothing publishes until you use the GitHub workflow.

See [EDITING.md](EDITING.md) for the complete guide, draft behavior and recovery. Obsidian remains available alongside the panel.

## Write a post

Keep `_posts` as your Obsidian vault. Screenshots now save to `Attachments/`; templates remain in `Templates/`.

```sh
npm run new -- htb "Box Name"
npm run new -- ctf "Challenge Name"
npm run new -- blog "A field note"
```

New posts start with `published: false`. They appear locally with a draft label and are excluded from production, RSS, and sitemap. Set `published: true` when ready. Future-dated posts also stay unpublished until their date.

Paste screenshots normally. Both `![Description](Attachments/image.png)` and `![[image.png]]` work, including spaces. Obsidian image-size suffixes are accepted; the journal keeps images responsive. Missing or ambiguous images report the source file and image name. Use a vault-relative path to distinguish duplicate filenames. Keep images inside the vault, or use an existing `/assets/images/...` URL.

Existing frontmatter remains compatible: title, date, categories, tags, difficulty, os, event, ctf_category, thumbnail, published. Article URLs derive from the date and exact filename suffix, preserving capitalization. An optional absolute `permalink` overrides this. Keep existing filenames and dates stable to preserve links. Dates must be valid YYYY-MM-DD values; categories are htb, ctf, or blog.

## Pond controls

The pond fills the homepage. Choose **Open field journal** for a text directory and recent posts, or click a landmark. The directory uses a native HTML disclosure and works without JavaScript. Phones start with the whole pond and all five destinations visible. **Overview** returns to that view; movement automatically zooms toward the duck. Overview changes the camera without disabling movement. Only the compact destination labels are links; the scenery has no surrounding hit rectangles or outlines. The hunt is a smaller secondary control.

The bright yellow rubber duck responds immediately to clicks/taps, WASD/arrow keys, and the mobile thumb control. There is no exploration mode or activation toggle. The other wandering ducks are mallards with green heads, brown chests, and gray bodies. Use WASD/arrows and E/Enter; Escape closes the directory or hunt panel, or cancels current movement; the next input works immediately. Click or tap water to swim there; the route stays in water, goes around the dock and reeds, and marks the destination with a ripple. All ducks share shoreline, dock, reeds and mailbox collision. A compact rounded footprint follows the lower body at the waterline; raised heads and decorative wakes do not create extra invisible padding. You can swim close to the visible shore and dock. On contact, movement glides along the shoreline tangent and responds immediately when you steer away. Mallards and the player draw in depth order. Hunt locations float in reachable water; saved discovery IDs remain unchanged. Phones also have a compact draggable thumb control. Keyboard movement interrupts a route. The journal and hunt panel stop pending routes. Find five small rubber ducks to unlock a colorful propeller hat. The hunt panel has hints and reset. Returning from a journal page restores the duck and camera view when session storage is available.

The directory and reading pages share paper, ink, and chapter styling, with a brief opening transition that respects reduced motion and the animation preference. Reading pages use one row of chapter tabs, a persistent **Return to pond** link, larger text, and collapsed filters with an active-filter count. Search remains visible and works alongside the filters.

Day/night, sound, animation, and discoveries save to this browser. If storage is unavailable, the site remains usable with page-session state. Night is the initial theme. Sound uses four short recordings of Curran's own quacks at 30% playback volume, scheduled every 35–60 seconds; collecting a duck can also trigger one with an eight-second cooldown. Turning sound on plays one immediate preview. The first pond interaction unlocks or retries playback when needed. Another real take plays each time, with silence between calls and no overlap or pitch changes. Playback pauses when the directory opens, outside the pond, and when the page is hidden. Browser autoplay restrictions are handled without errors. No accounts, external APIs, music, or server storage are required. Editing and asset details are in `AUDIO.md`; the previous third-party clip and sound-credit link are removed.

Pause stops ambient motion while retaining deliberate duck movement. Reduced-motion preferences disable ambient motion initially. Every journal section is accessible without playing.

## Deploy and roll back

Use [PUBLISHING.md](PUBLISHING.md) for the audited release checkout, exact GitHub push/merge steps, everyday editing and rollback. [FINAL-AUDIT.md](FINAL-AUDIT.md) records the final checks and limitations. The connected release checkout is on a local `duckpond-16bit` branch; nothing has been pushed.


GitHub Actions checks and builds pull requests, then deploys pushes or manual runs on `main` through GitHub Pages. Keep Pages set to GitHub Actions and preserve existing domain settings. `public/CNAME` contains `www.duckp0nd.com`; no DNS changes are required.

The original isolated `duckpond` review copy has no remote configured. The separately prepared `duckpond-release` checkout is connected to the existing repository and preserves its history. The earlier review copy has a baseline commit of the supplied Jekyll source; the release checkout retains the production repository’s full existing history. The sibling `duckpond-original.tar.gz` preserves the complete original directory, including local edits. Restore that source and its Jekyll workflow to roll back.

## Design polish

The mandatory 16-bit direction and skill roles are in [AGENTS.md](AGENTS.md). The complete UI/UX Pro Max / Vercel Web Design Guidelines / Frontend UI Engineering / Pixel Design / Unslop / Pixel Art CSS workflow, installation verification and design source map are in [design/WORKFLOW.md](design/WORKFLOW.md). Run `npm run design:skills` to verify all six through Codex's local discovery API. Native 20px UI icons, shaded nine-slice frames, Pixelify headings and integer-scaled duck sprites share the forest/water/paper palette. Body text and article screenshots remain readable.

The latest audit and screen contracts are in [design/UX-AUDIT.md](design/UX-AUDIT.md). Archives keep search and combined filters in their URLs and retain that context when returning from articles. Reading tools provide keyboard-scrollable code with a separate copy toolbar and image dialogs with loading/error/retry states. Hunt resets require confirmation.

The earlier focused Unslop pass is retained as history in [UNSLOP.md](UNSLOP.md); the current 16-bit rules supersede its modern-icon and serif-heading choices.

## Artwork

Aligned day/night dioramas were created with the built-in image generation tool; prompts are in `ARTWORK.md`. Ducks, ripples, and fireflies are drawn in code. Landmarks and collectibles are accessible HTML over the scene.
