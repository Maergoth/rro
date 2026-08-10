# Furniture Core Directional 011 — Fixed-Camera Correction Log

Generator: OpenAI built-in image generation. Use case: `stylized-concept`. This correction supersedes the original batch 011 atlas perspectives, which did not prove one fixed camera and genuine object-only quarter turns.

## Mandatory camera contract

Every accepted sprite uses one fixed true orthographic camera: azimuth `315°`, elevation `26.565°`, perspective disabled. World X projects down-right and World Y down-left at a `2 horizontal : 1 vertical` ratio; uprights remain screen-vertical. Only the object rotates.

- NORTH: front + physical right; the long footprint axis follows its north/south diagonal.
- EAST: physical right + rear; long and short projected footprint axes physically swap.
- SOUTH: rear + physical left; same projected-axis family as NORTH.
- WEST: physical left + front; same swapped-axis family as EAST.

Direction labels or changed face details are insufficient. A view fails if the footprint axes do not rotate, if the camera moves, or if identity-locked details appear on the wrong physical face.

## Locked Chemical Cabinet

Identity lock: one Modern 2×1 brushed-stainless cabinet; exactly two deep-teal front doors, one centered aged-brass padlock hasp, two amber hazard diamonds without text, black toe kick, one physical-right grille, plain physical-left side, two rear rails, and four adjustable feet.

North was rebuilt first. East attempts 001 and 002 were rejected because they relabeled faces without swapping the 2×1 footprint axes. East attempt 003 established the correct rotated silhouette but placed rear/right details on incorrect proportional faces; a targeted correction produced the accepted east. South attempt 001 was rejected for the wrong projected axis; the corrected rear/left source was horizontally reoriented without altering identity detail. West was a targeted face edit on the accepted east geometry. Final N/E/S/W identity and geometry pass.

## High-Temperature Dish Machine

Identity lock: one Modern 4×3 pass-through hood dishwasher; open rack bay, teal hood handle, right-side two-button control and teal rinse pipe, two lower front access doors, plain physical left, one broad rear louvered grille, and four adjustable feet.

North was rebuilt under the fixed camera. East established the physically swapped 4×3 footprint and exposes right pipe + rear grille. South preserves the north/south footprint family and exposes rear + plain left. West retains east/west geometry while restoring the front bay, handle, controls, and two access doors on the correct face. Final N/E/S/W identity and geometry pass.

## Three-Compartment Sink

Identity lock: one Modern 4×2 stainless warewashing sink; exactly three basins, two ribbed end drainboards, one centered high-arc teal pre-rinse hose with brass valves, three black front access doors, one physical-right teal wire basket, plain physical-left end, three rear brackets, six-leg construction, and lower brace rails.

North was rebuilt under the fixed camera. The first east generation retained the north/south diagonal despite the geometry guide, so it was mechanically reoriented to the required swapped axis; its right-end basket and broad rear remain physically correct. South attempt 001 was rejected because it invented a fourth rear bracket; a single-change edit restored exactly three. West retained east/west geometry and restored the front doors while removing the hidden right basket and rear brackets. Final N/E/S/W identity and geometry pass.

## Processing and review

- Every accepted raw direction was chroma-processed with the official image-generation helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Each identity uses one shared proportional scale across all four directions.
- Runtime and alpha-source candidates are normalized to 627×627 sRGBA, centered on pivot X `313.5`, exclusive baseline Y `590`, with 37 transparent pixels below.
- All twelve outer borders are transparent; zero visible magenta-key fringe pixels survive above alpha 2.
- The full-resolution dark contact and 128px light contact were inspected. Counts, physical-side assignments, footprint-axis rotation, silhouette, baseline, transparency, and gameplay legibility pass.
- Runtime-composite acceptance remains pending until the corrected files are remotely preserved, hosted CI is green, and exact four-direction native captures receive human review.
