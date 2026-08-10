# Production art contract

This file defines the replacement production-art contract. [ART_PROGRESS.md](ART_PROGRESS.md) is the single authoritative status ledger. An asset is not complete until every ledger gate passes and its final runtime files are present on the remote `agent/complete-production-art` branch.

## Checkpoint policy

- Generate one source sheet per catalog item or modular character layer.
- Review identity, direction, clipping, chroma removal, scale, and attachment pivots.
- Commit and upload every accepted batch before beginning the next substantial batch.
- Regenerate and commit `docs/ART_PROGRESS.md` with every art checkpoint; CI rejects a stale ledger.
- Count production completion only after processing, raster validation, visual approval, runtime binding, remote tree verification, and green CI. Raw, temporary, metadata-only, fallback, and quarantined work does not count.
- Keep all runtime art external under `apps/client-godot/assets/`.

## Furniture and placed objects

- Semi-realistic, orthographic isometric restaurant-management style.
- One 2x2 source sheet per item: north, east, south, west.
- Four transparent runtime PNGs with a common ground-contact pivot and consistent scale.
- Store durable contact-sheet and gameplay-scale evidence for each reviewed set.
- The four views must depict one construction, not four variants or recolors.
- Relevant later state sheets use the same camera and pivot: empty, active, dirty, damaged, and broken.

## Modular characters

Characters are composited in this order:

1. body and selected skin tone;
2. face details;
3. hair or headwear;
4. base outfit;
5. apron, jacket, or role layer;
6. footwear;
7. accessory;
8. carried object and effects.

Every swappable layer shares the same canvas, character origin, direction order, frame timing, and hand/foot anchors. Shirts, pants, aprons, role layers, footwear, face details, hair/headwear, eyewear, accessories, and carried equipment are independently compositable. Skin tone and two outfit color channels use masks rather than recolor-only duplicate art.

The launch animation floor is eight-direction idle and walk plus task-tag animations for carrying, greeting, ordering/POS, pouring, delivering, clearing, wiping, sweeping, mopping, scrubbing, scraping, racking, loading, unloading, polishing, chopping, stirring, flipping, plating, inspecting, opening, picking up, putting down, and reacting. Animation selection is driven by task tags, not role IDs.

## Construction, environment, world, and UI

- Twelve floor materials and six wall materials come from `packages/game-data/core/construction.json`.
- Shared opening geometry covers solid wall, door, service door, window, and arch in north/east/south/west directions; materials are applied independently.
- In-world utility overlays cover power, gas, water, drain, and ventilation.
- The launch environment set covers contact shadow, selection ring, steam puff, and service sparkles.
- The launch UI set covers thirteen builder controls, the login hero, and the RRO mark. The world lane requires the illustrated world atlas.
- These assets must replace—not merely sit beside—the current color, line, polygon, text, and badge fallbacks before completion.

## Acceptance gates

- no missing catalog bindings or procedural production fallback;
- transparent corners and at least one fully opaque subject pixel;
- no clipped silhouette, chroma fringe, text, watermark, or baked room/floor;
- unique diffuse art for distinct catalog IDs unless the manifest explicitly declares a shared asset;
- all four furniture directions and all eight character directions present;
- masks and wearable layers align to the base body at every required frame;
- visual QA includes a durable full-resolution contact sheet and a gameplay-scale runtime-order composite;
- a generated coverage ledger is reproducible from files and bindings in the committed tree;
- `npm run validate:art-complete` passes with zero procedural production fallback.
