# Furniture core directional batch 012 prompt record

Generated with OpenAI built-in image generation on 2026-08-07. Each request used a rigid 2×2 atlas on saturated magenta: NORTH in the upper-left, EAST upper-right, SOUTH lower-left, and WEST lower-right. The camera contract was a fixed elevated orthographic-isometric view with no perspective change, one complete object per cell, no crop, text, logos, watermark, floor, scene, cast shadow, or extra prop. Materials, proportions, asymmetric details, and physical left/right were required to remain identical through true quarter turns.

## Spill Response Station — accepted attempt 1

One compact 2×1 commercial spill-response station: dark charcoal wheeled cabinet, two teal front doors, one centered amber caution panel, blue mop clipped only to the physical left side, red wringer bucket clipped only to the physical right side, rear utility rail, and four casters. Front details belong only on NORTH; EAST shows the physical right/bucket side; SOUTH shows the rear rail; WEST shows the physical left/mop side.

Accepted without source editing. Raw generator output SHA-256: `e0a8e151703d9f9ea69a93ec3753299503bb03b1669e41c38ee83edccc9a157d`.

## Linen and Reset Cabinet

### Rejected attempt 1

One low 2×1 stainless-and-cream linen/reset cabinet with two front doors and brass pulls, three distinct folded-linen stacks on top (cream, teal, gray), a ventilation grille on the physical right side, open shelving at the rear, and a plain physical left side.

Rejected because WEST repeated the front instead of showing a true rear/left-side quarter turn. Generator output SHA-256: `7d1b5db6cd824ca3b3c8d0043081c88443903cd1d3a3cda6fbd1352cfbd359ec`.

### Accepted attempt 2

Identity-preserving edit of attempt 1: change only the lower-right WEST cell to the true rear-plus-physical-left view. Preserve the same cabinet, dimensions, linen colors/counts/order, materials, elevated camera, scale, magenta background, and all other cells. Do not show front doors or pulls in WEST.

Accepted raw SHA-256: `b5043a1c01f6c6601034fb0ba32e4076836fd591bf7f3a72ff28e0197996c794`.

## Filtered Water Station

### Rejected attempt 1

One compact 2×2 premium filtered-water station: brushed stainless body, teal lower front doors, recessed black dispensing bay with three taps and drip tray, ventilation grille on the physical right, plain physical left, rear service panel with exactly two round blue filter caps, and four short feet.

Rejected because WEST repeated the front rather than showing the true rear/left-side quarter turn. Generator output SHA-256: `a1f5c2d83cf38a0345fe6396ab2950a2e4d5a24e7a7ceea48c978138a1cb82a7`.

### Accepted attempt 2

Identity-preserving edit of attempt 1: change only the lower-right WEST cell to a true rear-plus-physical-left view. Preserve the same station, dimensions, materials, camera, scale, magenta background, and other three cells. WEST must show the rear service panel with exactly two blue caps and no front taps or teal doors.

Accepted raw SHA-256: `7d492d204834eb728e56389b28bc26dcb83f47d82a32097efb6e09667fd47fb1`.

## Processing

The official image-generation chroma-key helper removed the magenta field. The batch processor then split the exact cells, applied one shared proportional scale per identity, centered each sprite on a 627×627 transparent sRGBA canvas, and aligned its exclusive alpha baseline to y=590. Processing did not draw or replace source art.
