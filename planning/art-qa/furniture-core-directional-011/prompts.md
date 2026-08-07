# Furniture Core Directional 011 — Prompt and Review Log

Generator: OpenAI built-in image generation. Use case: `stylized-concept`. Each accepted source was generated as a separately prompted rigid 2×2 atlas, held in workspace quarantine, chroma-processed, normalized, and inspected at full and 128px gameplay scale before repository promotion.

## Shared atlas contract

Create one exact rigid commercial restaurant object as a 2×2 atlas on a perfectly flat `#FF00FF` field. Cell order: top-left NORTH, top-right EAST, bottom-left SOUTH, bottom-right WEST. Use one fixed elevated orthographic semi-isometric camera approximately 35 degrees downward, with ground-plane edges on the two isometric diagonals and no perspective convergence. Rotate only the object by genuine 90-degree ground-plane turns; never mirror it or move the camera. Preserve scale, proportions, construction, component counts, physical side assignments, illumination, and white balance in all cells.

NORTH presents the operational front with physical-right receding; EAST presents physical-right with rear receding; SOUTH presents rear with physical-left receding; WEST presents physical-left with front receding. Exactly four complete objects, generous padding, no clipping, floor, horizon, dividers, labels, shadows, people, loose props, logos, text, symbols, or watermark. No magenta on the object.

## Locked Chemical Cabinet

One Modern 2×1 brushed-stainless locked cabinet with exactly two deep-teal front doors, one centered aged-brass padlock hasp, two amber hazard diamonds without text, black toe kick, one physical-right grille, plain physical-left side, two rear mounting rails, and four adjustable feet.

Outcome: accepted on attempt 001. The operational front, right-side grille, plain left side, and two-rail rear are distinct and coherent through all four rotations.

## High-Temperature Dish Machine

One Modern 4×3 pass-through hood dishwasher with one tall wash hood, open central rack bay, teal hood handle, one physical-right control panel with one amber indicator and one brass button, two lower service panels, one physical-right teal rinse pipe, plain physical-left side, one rear louvered grille with two horizontal braces, and four feet. No racks, dishes, steam, or water.

Outcome: accepted on attempt 001. The front control/handle, physical-right pipe, plain side, and rear service grille preserve a single machine identity and four distinct facings.

## Three-Compartment Sink

One Modern 4×2 stainless warewashing sink with exactly three equal basins, two drainboards, one centered high-arc teal pre-rinse hose and brass handle, three front access panels, one physical-right empty teal soap cage, plain physical-left side, three rear brackets, six legs, and one lower brace.

Outcome: accepted on attempt 001. Basin count, front access panels, right-side cage, rear brackets, faucet, legs, and drainboards remain coherent and gameplay-readable through the four quarter turns.

## Processing outcomes

- Initial official-helper mattes were rejected when strict validation found isolated low-alpha magenta-key pixels.
- The official helper was rerun with its documented one-pixel edge contraction; final runtime normalization applies a narrow key-color alpha cleanup using the same visible-fringe predicate enforced by QA.
- Final result: 12 unique 627×627 sRGBA candidates, one proportional scale per identity, pivot `(313.5,590)`, exclusive baseline `y=590`, transparent borders, zero visible magenta fringe, and no exact file/pixel/perceptual collision against the 124 previously committed directional PNGs.
- Full and 128px contact sheets were inspected at original resolution. All component counts, material identities, N/E/S/W semantics, silhouettes, alpha edges, floor contact, and gameplay legibility pass.
