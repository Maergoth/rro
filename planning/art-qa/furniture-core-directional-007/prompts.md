# Furniture Core Directional 007 — Source Prompts

Generator: OpenAI built-in image generation. The legacy sprites and authoritative catalog were identity/material references only. Accepted furniture batches 002–006 define the elevated orthographic-isometric camera, common scale, directional presentation, and production finish. Every source used a flat `#FF00FF` chroma field for removal with the official image-generation helper.

## Shared production contract

Create the same rigid object in an invisible 2×2 atlas ordered north/east/south/west at top-left/top-right/bottom-left/bottom-right. Keep one fixed elevated orthographic semi-isometric camera approximately 35 degrees downward, no perspective convergence, identical scale and lighting, generous padding, and no screen-horizontal or screen-vertical ground axes. Rotate only the furniture by true 90-degree ground-plane increments. Preserve component counts, materials, front/back construction, and asymmetric ordering. Use a perfectly flat `#FF00FF` background with no floor, shadow, gradient, room, text, labels, dividers, logos, watermarks, or unrelated props.

## `furniture-banquette-section` — Upholstered Banquette

Identity request: one iconic 4×2 four-seat dining assembly with exactly two opposing high-backed deep-burgundy button-tufted leather benches, two seats per bench, dark-walnut frames, restrained aged-brass corner accents, exactly one narrow rectangular dark-brown marble table centered between them, and exactly one dark pedestal. Preserve counts, spacing, construction, materials, and visible tabletop in every direction.

Rejected atlas v1 requested a conventional four-direction rotation but placed north/south on a screen-horizontal axis. Rejected atlas v2 explicitly removed horizontal axes but collapsed to two repeated orientations.

Accepted correction request: rebuild four genuinely distinct directions under the fixed camera. North uses a falling diagonal with the nearer plain outer-back bench at lower-left and the opposite tufted inner bench at upper-right. East uses the other diagonal with the nearer outer-back bench at lower-right and tufted inner bench at upper-left. South and west are exact 180-degree reversals of north and east, respectively. One complete centered set per quadrant, identical apparent scale, with no repeated facing, mirrored camera, count drift, missing table, extra bench/chair, top-down view, or eye-level view.

## `furniture-commercial-chair` — Commercial Dining Chair

Identity request: exactly one durable armless stackable restaurant chair with one gently curved charcoal-black solid backrest, one simple charcoal powder-coated tubular-steel frame, exactly four slender legs, and one square rust-orange textured vinyl seat cushion with rounded corners and dark piping. No arms, crossbars, loose cushions, or extra pieces.

Directional request: north front faces lower-left/backrest upper-right; east front faces lower-right/backrest upper-left; south front faces upper-right/outer backrest lower-left; west front faces upper-left/outer backrest lower-right. Preserve one fixed elevated camera, diagonal ground axes, complete feet, identical scale and materials, and four distinct coherent quarter-turns. The first atlas passed source review.

## `furniture-premium-chair` — Premium Dining Chair

Identity request: exactly one refined armless premium restaurant dining chair with a dark American-walnut frame, exactly four tapered legs, one thick deep-teal velvet seat cushion with subtle piping, one tall gently curved deep-teal upholstered back panel edged in walnut with three restrained vertical stitched divisions, and brushed-brass ferrules on all four feet. Elegant upright dining proportions; not an armchair, lounge chair, throne, or office chair.

Directional request: north front faces lower-left/backrest upper-right; east front faces lower-right/backrest upper-left; south front faces upper-right/outer backrest lower-left; west front faces upper-left/outer backrest lower-right. Preserve the same three-channel back, cushion, piping, frame, four legs, ferrules, proportions, fixed elevated camera, diagonal axes, and four distinct quarter-turns. The first atlas passed source review.
