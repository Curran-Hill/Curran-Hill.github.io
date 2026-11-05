# DuckP0nd 16-bit design workflow

## Direction and audit

The direction is a woodland adventure field guide: detailed pond scenery, a distinctive yellow rubber duck, forest/teal controls, amber accents and shaded parchment. The journal should look like it belongs to this pond. Preserve the existing original dioramas and factual content. 16-bit is an art direction, not a technical color-depth restriction.

The pre-change audit covered Astro layouts/components, global/journal/pond CSS, sprites, aligned day/night art and actual rendered screens. It found thin modern line icons and serif headings beside detailed pixel scenery, mixed rounded frames, residual glass effects, inconsistent control surfaces, a generic boxed archive entry, fractionally scaled sprites, and portrait tablets treated as desktop. Narrow-phone visual review additionally found a label close to the right edge and a mailbox label touching the joystick; both were repositioned.

The solution retains the static Astro architecture and content pipeline. `pixel.css` provides one explicit shared UI layer rather than a new framework. Native icon and sprite sources replace mixed rendering conventions. No frontend dependency was added; the unused Lucide package was removed.

## Skills installed and configured

| Skill | Upstream | Status / role |
| --- | --- | --- |
| UI/UX Pro Max | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Installed; prioritized UX/accessibility outcomes and Astro implementation guidance |
| Vercel Web Design Guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | Installed; current interface rules and source audit |
| Frontend UI Engineering | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/main/skills/frontend-ui-engineering) | Installed; native semantics, interaction states and browser verification |
| Pixel Design | [umfhero/skills, Skills/pixel-design](https://github.com/umfhero/skills/tree/main/Skills/pixel-design) | Installed; shared formulas, native icon construction and press states |
| Unslop | [heydamir/unslop, skills/unslop](https://github.com/heydamir/unslop/tree/main/skills/unslop) | Already installed, retained; composition, spacing, hierarchy and removal of generic patterns |
| Pixel Art CSS | [noodelskun/test-skill, skills/pixel-art-css](https://github.com/noodelskun/test-skill/tree/main/skills/pixel-art-css) | Installed; crisp rendering, integer sprite scaling and discrete animation |

Installation instructions/source structure were inspected first. Pixel Design's README explicitly lists Codex's `~/.codex/skills` convention. Unslop's README includes Codex installation. Pixel Art CSS has no separate README/install guide; its ordinary `SKILL.md` directory with references is Codex-compatible. The official bundled skill-installer installed the two missing directories. Existing Unslop was not overwritten. Their frontmatter/instructions were read and their applicable assets/references inspected.

Default paths are `~/.codex/skills/{pixel-design,unslop,pixel-art-css}/SKILL.md`. `$CODEX_HOME` overrides the base directory. The project `AGENTS.md` makes their roles and project-specific adaptations persistent; the skills themselves remain reusable global installations.

Run:

```sh
npm run design:skills
```

This validates all six frontmatter files and uses the local Codex app-server `skills/list` API with `forceReload:true` for this project. It requires an installed `codex` CLI and its normal access to Codex's local state directory. It creates no chat and runs no model turn. All six were verified as enabled/discoverable on November 4, 2026. New Codex sessions can load them normally; this session explicitly loaded and applied their instructions.

### Resolve generic-skill conflicts deliberately

The user's mandatory 16-bit direction wins over generic defaults. Pixel Design's stock 8-bit/violet palette, tiny 7×7 icons, and rounded formulas are adapted to forest colors, 20×20 icons and shaded stepped frames. Pixel Art CSS's optional CRT/NES constraints and pixel body-font examples are excluded. Unslop's modern smooth-icon/radius examples do not replace the pixel identity. Preserve punctuation in factual content and Markdown; generic copy restrictions do not justify rewriting articles.

## Implementation map

| Concern | Source of truth |
| --- | --- |
| Theme palette / font families | `src/styles/global.css`, shared paper tokens in `journal.css` |
| 16-bit UI tokens, frames, hierarchy, responsive rules | `src/styles/pixel.css` |
| Pixel borders | `public/art/ui/frame-{night,day,paper,gold}.svg` (native 16×16, nine-slice4) |
| UI sprites | `src/lib/pixel-icons.ts` → `src/components/Icon.astro` (native 20×20) |
| Rubber duck / mallards | `src/lib/duck-sprite.ts` (native 36×32,10px cosmetic headroom) |
| Sprite scale and animation sampling | `src/lib/sprite-rendering.ts`; `src/scripts/pond.ts` |
| Detailed map art and origin | `public/art/pond-{night,day}.png`; `ARTWORK.md` |
| Functional and design invariants | `tests/site.test.ts`, `tests/design.test.ts` |

The Canvas backing grid matches the scene's CSS dimensions. Sprites are pre-rasterized, positions snapped and scaled by integers with smoothing off. Responsive map images are allowed fractional scale so the whole island fits a phone; the map is not recreated as a coarse low-resolution canvas. Article screenshots remain normally rendered. Sprite motion uses 8fps pose sampling, blink frames, a two-frame propeller, and discrete pixel wakes. Ambient pause/reduced motion freeze these frames while deliberate movement still works.

## Repeatable design loop

1. Read `AGENTS.md` and the relevant skill instructions. Inspect the current layout, assets, routes and existing local edits.
2. Run `npm ci` if needed, then `npm run dev` for one local preview command. Save a baseline screenshot. Identify concrete visual issues in the actual page.
3. Extend the shared tokens/components. Keep game geometry and authoring concerns separate from presentation. Build small original pixel assets in code when they belong to the shared atlas; use image generation only for substantial new bitmap art if requested/needed.
4. Capture and compare desktop 1280×900, portrait tablet 768×1024, phone 390×844 and narrow 320×740. Check pond, directory, About, HTB, CTF, empty Blog, Contact and both article URLs. Inspect day and night. Iterate based on rendered problems.
5. Check keyboard focus, 44px touch controls, no overflow, combined filters/no results, screenshot expansion, readable code/copy, contents links, Back/Forward and direct refresh. Verify immediate movement, dock/bank collision and saved propeller reward. Do not reset the user's save.
6. Run checks sequentially:

```sh
npm run design:skills
npm run check
npm test
npm run build
```

Astro/TypeScript checking is the available source check; there is no separate lint setup. Tests validate authoring, content compatibility, collision/pathfinding, preferences/audio, integer sprite geometry, icon bounds and animation sampling. The production verifier checks local page/image/anchor references. Browser screenshots are still required; tests cannot judge art direction. Record actual results and limits in `VERIFICATION.md`.

7. Restore QA-changed preferences/viewport, leave the local preview usable, and package reviewable source/static output. Keep the original rollback archive. Deploy only when the user requests it.

## Credits

Workflow adapted from [Unslop by Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream skills remain in their own installation directories with supplied references/assets. New project UI frames, icons and duck sprite edits are original code-native assets; they do not copy Stardew Valley/Celeste/SNES game assets.

## UI/UX refinement skill setup (November 4, 2026)

Before installing, checked the existing skill directories and each official upstream README and SKILL.md. UI/UX Pro Max documents `ui-ux-pro-max-cli init --ai codex` and a standard skill directory with Python-only local search tools. Vercel documents `npx skills add vercel-labs/agent-skills`; Frontend UI Engineering documents its native Codex plugin and plain Markdown skill format. To install only the three requested missing skills without a new package dependency or unrelated plugin pack, used Codex's bundled `install-skill-from-github.py` on:

- `nextlevelbuilder/ui-ux-pro-max-skill`, `.claude/skills/ui-ux-pro-max` (complete scripts/data/references included)
- `vercel-labs/agent-skills`, `skills/web-design-guidelines`
- `addyosmani/agent-skills`, `skills/frontend-ui-engineering`

All reside in `~/.codex/skills/<name>` alongside the existing three, which were retained. `design:skills` verifies frontmatter plus enabled Codex discovery for all six. New skills appear normally on the next turn; this run explicitly read/applied them. Frontend UI Engineering's shared accessibility checklist was copied from its upstream `references/accessibility-checklist.md` into the standalone skill's `references/` directory and the relative link adjusted. UI/UX Pro Max's Claude plugin-root command prefixes were adapted to `${CODEX_HOME:-$HOME/.codex}/skills/ui-ux-pro-max` so its documented search commands work in Codex. Each installation has an `INSTALLATION.md` recording these small portability changes; Vercel's skill requires a fresh read of `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` for each review.

Applied UI/UX Pro Max's verified local matches for “focus not obscured” (UX) and static no-JavaScript navigation (Astro). The existing pond palette, fonts, frames, sprites, and layout remain the design source of truth; a stock generated visual theme is neither needed nor applied. Skill examples suggesting Lucide, rounded cards, smooth springs, CRT, or 8-bit art do not override DuckP0nd's explicit direction.

The resulting audit, decisions, and acceptance contracts are in `design/UX-AUDIT.md`. Browser proof and exact test scope are in `VERIFICATION.md`.

## Pond keeper local editor

The local browser editor uses the same 16-bit field-journal identity and existing icon/frame sources. Its content contracts, observed problems, iterations and browser checks are in [EDITOR-AUDIT.md](EDITOR-AUDIT.md). The author-facing instructions are in [../EDITING.md](../EDITING.md). `npm run admin` is the single launch command. Keep editor assets/API dev-only and preserve its independence from public-site hot reload.
