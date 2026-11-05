# Pond artwork

Created with the built-in image generation tool. The final assets live in `public/art/pond-night.png` and `public/art/pond-day.png`. Their dimensions are 1536 × 1024. Character sprites, collectibles, ripples, and animated fireflies are rendered separately in code.

## Night prompt

Use case: stylized-concept. Asset type: background artwork for an interactive pixel-art website, landscape 3:2. Create an exceptionally beautiful detailed original pixel-art ISOMETRIC DIORAMA of a cozy duck pond at NIGHT, like an artisanal 1990s adventure game. Entire floating diamond-shaped island visible with generous solid very dark navy background around it. Island centered, no text or interface whatsoever, no labels, no letters. Crisp visibly square pixels, limited harmonious palette, no smooth 3D rendering or blur. Large calm deep teal pond in center occupying most of island; varied mossy banks, stepping stones, clusters of cattails and reeds, lily pads, tiny warm firefly dots. Five distinctive landmarks around edges: a cozy wooden cabin with glowing amber windows on upper-left bank; a wooden noticeboard on upper-right bank; a pair of tiny purple and golden competition pennants near right bank; a small red mailbox on lower-left bank; wooden dock projecting from lower-right bank into water with a small open notebook and lantern. A few lush conifer trees at back and island edges, rounded bushes and pixel wildflowers. Water takes up roughly half island interior and stays visibly open for movable duck sprites that will be added in code; do not draw ducks or any other characters. Warm amber lighting against rich indigo forest and muted mint highlights. Rich layered details but calm uncluttered composition. Island fills about 85% width and 85% height, centered. Pixel-perfect edges, atmospheric handcrafted environmental storytelling, inviting and sophisticated. No moon in sky, no stars outside island, no gradients outside island, solid background #0b1520. Avoid any typography, buttons, frames, interface, numbers, logos, watermark.

## Day edit prompt

Use case: lighting-weather. Edit this exact pixel-art isometric pond diorama into the sunny DAY version for a day/night website toggle. Preserve the exact composition, geometry, island silhouette, all landmark positions, image dimensions, objects, water layout, and crisp pixel-art style. Change only lighting and palette: lush sage green grass, sunlit teal water, warmly colored wooden cabin, soft bright late-morning natural light, lively foliage, gentle pale highlights. Turn off lantern/window glows and remove firefly glows. Keep the empty background around the island a uniform muted very pale sage #e5eee3, with no text or sky objects. No new objects or characters. Absolutely no layout changes.

## Original 16-bit UI and sprites

The existing aligned day/night art is retained. `public/art/ui/frame-{night,day,paper,gold}.svg` are original native 16×16 shaded frames, cut into four-pixel nine-slices. Use their palette ramps instead of blurred shadows or rounded glass panels. The native 20×20 rect-run atlas in `src/lib/pixel-icons.ts` supplies all interface icons.

`src/lib/duck-sprite.ts` supplies the yellow rubber duck and gray/brown/green mallards at native 36×32, with 10px headroom for the colorful propeller hat. They share body waterlines and draw anchors. The player uses golden shadows and cream highlights; mallards use green head, white collar, brown chest, gray feather ramps and a small violet speculum. Blink and propeller poses are pre-rasterized discrete frames. SVG portraits and Canvas players share the same source.

Sprites render at integer scales on a canvas matching CSS scene dimensions, with smoothing disabled. The detailed map scales responsively, while article/award screenshots retain standard rendering. These are original project assets inspired by the quality of 16-bit-era art, not copied game sprites.

## Existing portfolio images

The original certifications and article screenshots remain unchanged under `public/assets/images/`, preserving their public paths. `UND-2026-Finalist.png` was restored from the owner's current GitHub main (`b2c222a6cf2ab71e1c2d108c49891bf2270bc482`) during the final audit; it is the existing 409×409 certificate, not generated artwork. All 40 canonical image files match that source byte for byte.
