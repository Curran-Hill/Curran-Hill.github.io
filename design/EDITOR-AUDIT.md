# Pond keeper: local editing desk

## Observed problem and direction

Posts already had a workable Obsidian/Markdown workflow, but About, credentials, awards, contact links and pond sound settings were embedded in source components. There was no browser editing interface, and a static GitHub Pages deployment cannot write back to those local files. The user explicitly selected a local admin on this computer.

The editor extends the woodland field journal: numbered chapter navigation, a parchment editing surface, forest controls, the existing Pixelify Sans / DM Sans pairing, original 20px icon atlas and shaded paper frame. It uses a searchable ledger of real posts rather than dashboard cards or fabricated analytics. The reading preview and real Markdown files are the central interaction. Existing pond artwork, sprites, branding, gameplay and visitor navigation are preserved. The 16-bit direction overrides generic 8-bit/modern SaaS skill examples.

Applied the installed Frontend UI Engineering, UI/UX Pro Max, Pixel Design, Unslop and Pixel Art CSS guidance, plus the current [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md). UI/UX searches covered local content editing, unsaved changes/validation and Astro Markdown. Existing project tokens, fonts, frames and icons took precedence over unrelated generated design suggestions. All six skills remain enabled/discoverable; no installation or frontend dependency was needed for this addition.

## Concrete findings and changes

- `src/pages/about/index.astro` and `src/pages/contact/index.astro`: extracted factual text, credential/award lists and contact links into validated `_data/site.json`. Pages still render semantic static HTML; screenshots and certificate links retain their URLs and interaction tools.
- `src/editor/ui.ts:75`: contextual error announcement, filename/field messages and invalid-field indication. Loading disables the affected form/actions and successful saves announce their result. `ui.ts:109` provides a native dialog with Escape/cancel protection, including repeated use after a previous discard.
- `src/editor/main.ts:30`: discarded post forms do not return with stale unsaved metadata. Keyboard saving uses the real form's native validity checks; browser navigation gets the normal unsaved-change guard.
- `src/editor/posts.ts`: visibly labeled Markdown/metadata fields, draft inclusion wording distinct from deployment, image upload/paste, an accessible result count, empty search feedback, section filtering, optional reading preview and a separate real-site link. Extra frontmatter and exact existing article addresses are retained.
- `src/editor/settings.ts`: editable credentials, awards and contacts with add/remove controls. Certificate/image metadata is tucked into native disclosures to reduce form clutter. Quack volume has a labeled slider, visible percentage and a real sample; interval values include units and validation.
- `src/editor/editor.css:769`: sticky Save toolbar on long forms. Small screens stack fields; tablet toolbars use a deliberate second row rather than wrapping headings and buttons into competing columns. The narrow header remains readable, and mobile publishing guidance is compact. Explicit teal focus rings on paper and amber on the dark header retain contrast.
- `src/editor/server.ts:141`: revision checks, backups and atomic file saves prevent silent overwrites of concurrent Obsidian edits. Traversal/linked-folder writes, duplicate new files, invalid metadata, broken images and disguised uploads are refused. Malformed YAML/JSON identifies the file needing repair.
- `src/editor/assets.ts:5`: isolated native editor modules avoid Astro/Vite reloads discarding forms after a settings save. Markdown preview is sandboxed without scripts or same-origin privileges. Loopback/origin/token restrictions apply to the local API; static builds contain neither editor routes nor backend.
- `scripts/verify-build.mjs`: a permanent production gate rejects private editor/content folders. Generated attachments are rebuilt from publishable content so draft-only uploads do not leak into `dist/`.
- `tests/site.test.ts`: migration invariants no longer assume there can only ever be two posts, force current article wording, or freeze the user's configurable quack level/timing. Legacy URLs and functionality remain checked.

## Browser verification and iterations

Used the actual in-app browser, native forms, dialogs, file chooser and keyboard controls. Checked 1280×900 desktop, 768×1024 tablet, 390×844 phone and 320×740 narrow phone (the scrollbar reduces available content width by 15px). No horizontal document overflow was observed. The final screenshots are sibling output files `duckpond-admin-{desktop,tablet,mobile,320}.png`.

Created and saved a disposable draft, uploaded `editor upload example.png`, rendered code and the image in preview, and opened the saved post in the real journal. The 240px image loaded correctly. A disk edit made while the form was dirty produced a conflict and retained the unsaved body. Tested missing/invalid settings feedback, native cancel/discard, Escape after an earlier discard, Ctrl+S, award/contact add/remove, filtering/no results and sample audio playback. Removed only the disposable draft/upload afterward and preserved factual content/settings.

Iterated on three observed issues: full-page reload after settings saves, awkward tablet toolbar wrapping, and an overlong phone header/publishing note. Also replaced low-contrast inherited amber focus on paper with teal.

Checked all eight public page/article destinations in the browser for their rendered titles and document overflow; the two original article addresses still work. Reviewed the data-driven About page at phone size and used its Contact navigation. Existing published content, image references, empty Blog and five-duck reward remain. No visitor saves were reset. Full screen-reader, hardware phone and subjective speaker/listening tests were not performed in this pass; prior project QA is retained separately in `VERIFICATION.md`.

Unslop workflow attribution remains in `design/WORKFLOW.md` (Damir Sokolovsky, CC BY 4.0).
