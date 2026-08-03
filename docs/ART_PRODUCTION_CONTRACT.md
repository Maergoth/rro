# Production art contract

This file is the source of truth for the replacement production-art pass. An asset is not complete until its final runtime files are committed and present on the remote `agent/complete-production-art` branch.

## Checkpoint policy

- Generate one source sheet per catalog item or modular character layer.
- Review identity, direction, clipping, chroma removal, scale, and attachment pivots.
- Commit and upload every accepted batch before beginning the next substantial batch.
- Count only final runtime files on GitHub. Raw or temporary generations do not count.
- Keep all runtime art external under `apps/client-godot/assets/`.

## Furniture and placed objects

- Semi-realistic, orthographic isometric restaurant-management style.
- One 2x2 source sheet per item: north, east, south, west.
- Four transparent runtime PNGs with a common ground-contact pivot and consistent scale.
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

Every swappable layer shares the same canvas, character origin, direction order, frame timing, and hand/foot anchors. Skin tone and two outfit color channels use masks rather than recolor-only duplicate art.

The launch animation floor is eight-direction idle and walk plus task-tag animations for carrying, greeting, ordering/POS, pouring, delivering, clearing, wiping, sweeping, mopping, scrubbing, scraping, racking, loading, unloading, polishing, chopping, stirring, flipping, plating, inspecting, opening, picking up, putting down, and reacting. Animation selection is driven by task tags, not role IDs.

## Acceptance gates

- no missing catalog bindings or procedural production fallback;
- transparent corners and at least one fully opaque subject pixel;
- no clipped silhouette, chroma fringe, text, watermark, or baked room/floor;
- unique diffuse art for distinct catalog IDs unless the manifest explicitly declares a shared asset;
- all four furniture directions and all eight character directions present;
- masks and wearable layers align to the base body at every required frame;
- a generated coverage manifest is reproducible from files in the committed tree.
