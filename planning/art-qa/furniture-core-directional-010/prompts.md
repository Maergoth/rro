# Furniture Core Directional 010 — Prompt and Review Log

Generator: OpenAI built-in image generation. Use cases: `stylized-concept` and targeted `precise-object-edit`. No generated image was written directly into the repository. Every accepted source was first held in quarantine, chroma-processed, normalized, raster-validated, and inspected at full and 128px gameplay scale.

## Shared camera and atlas contract

Create one exact rigid commercial restaurant object as a 2×2 atlas on a uniform `#FF00FF` field. Cell order is top-left NORTH, top-right EAST, bottom-left SOUTH, bottom-right WEST. Use one fixed elevated orthographic semi-isometric camera, approximately 35 degrees downward, with ground-plane edges on the two isometric diagonals and no perspective convergence. Rotate only the object by genuine 90-degree ground-plane turns; never mirror it or move the camera. Preserve scale, proportions, materials, construction, component counts, physical side assignments, illumination, and white balance in all four cells.

NORTH presents the operational front with physical-right receding; EAST presents physical-right with rear receding; SOUTH presents rear with physical-left receding; WEST presents physical-left with front receding. Use exactly four complete objects, generous clear padding, no clipping, floor, horizon, dividers, labels, shadows, people, food, loose props, logos, text, symbols, or watermark. Do not use magenta on the object.

## Refrigerated Prep Table — attempt 001

Create one Modern 4×2 refrigerated prep table: long brushed-stainless cabinet; raised rear ingredient rail; exactly six black rectangular ingredient wells in one row; white cutting-board ledge; operational front with exactly two stacked stainless drawers at physical-left and exactly two deep-teal doors with brass pulls; physical-right side with one black ventilation grille and one small amber indicator; operational rear with exactly two large black louvered grilles; four short black feet. Preserve every count and physical side through all rotations.

Avoid extra wells, doors, drawers, vents, feet, controls, duplicated indicators, open containers, food, utensils, or repeated/mirrored facings.

Outcome: rejected. The generated atlas did not preserve exactly six wells consistently across its four rotations.

## Refrigerated Prep Table — targeted correction

Edit only the ingredient-well row in the supplied atlas. Make every cell show the same exact six wells—no more, no fewer—while leaving the table body, doors, drawers, vents, indicator, scale, camera, lighting, silhouette, and flat chroma background unchanged.

Outcome: accepted after full semantic and alpha review. The corrected atlas preserves six wells, the drawer/door front, two-grille rear, right-side vent/indicator, and distinct coherent quarter turns.

## Walk-In Storage Rack — attempt 001

Create one Modern 3×1 walk-in storage rack: tall open stainless frame with four posts; exactly five thin deep-teal removable shelf mats at five distinct levels; small round thermometer/dial attached only to the physical-right front post; operational rear with a slim diagonal X brace; open sides; four small adjustable feet. Preserve five shelf levels, the single right-side dial, rear brace, proportions, and materials in all rotations.

Avoid four or six shelves, extra dials, solid cabinets, doors, bins, stored food, duplicated braces, labels, or repeated/mirrored facings.

Outcome: rejected. The generated atlas preserved only four shelf levels instead of five.

## Walk-In Storage Rack — targeted correction

Edit only the shelf count in the supplied atlas. Add the missing shelf level so every cell shows exactly five evenly spaced teal shelf mats. Preserve the frame, single physical-right dial, rear bracing, feet, camera, scale, lighting, and flat chroma background unchanged.

Outcome: accepted after semantic review and the documented two-pixel alpha edge contraction. Exactly five shelves, one side dial, and rear bracing remain coherent at full and gameplay scale.

## Dry Storage Rack — attempt 001

Create one Modern 3×1 dry-storage rack: sturdy dark charcoal four-post frame; exactly four solid brushed-stainless shelves; aged-brass safety lips only along the operational front edges; operational rear with a centered dark V brace; a single small teal inventory plate on the physical-right side; four adjustable feet. Preserve four shelves, front lips, rear brace, right-side plate, proportions, and materials in all rotations.

Avoid wire shelving, extra shelves, bins, stored goods, duplicated plates, extra braces, labels, or repeated/mirrored facings.

Outcome: accepted on attempt 001. Four solid shelves, front brass lips, rear V brace, right-side plate, and all four quarter turns remain distinct and legible.

## Processing outcomes

- Initial prep-table and walk-in official-helper mattes were rejected when strict raster validation found low-alpha chroma-key edge pixels.
- Prep passed after the documented one-pixel alpha edge contraction.
- Walk-in still retained low-alpha key contamination after one pixel and passed after a two-pixel alpha edge contraction; both failed alpha atlases remain preserved with exact hashes.
- Final result: 12 unique 627×627 sRGBA candidates, shared pivot `(313.5,590)`, exclusive baseline `y=590`, 37 transparent rows below, zero border alpha, zero visible magenta fringe, zero detached low-alpha matte, one uniform scale per identity, and no file/pixel/perceptual collision against all 112 previously committed directional PNGs.
- Both final contact sheets were independently inspected at original resolution. The three identities, component counts, N/E/S/W semantics, clean alpha, complete silhouettes, and 128px legibility passed.
