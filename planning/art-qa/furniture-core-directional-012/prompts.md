# Furniture core directional batch 012 fixed-camera correction

Regenerated with OpenAI built-in image generation on 2026-08-09 after the prior 2×2 atlases failed the camera contract. The old sources mixed frontal elevations with unrelated three-quarter views even though their prompt claimed a fixed isometric camera. They are preserved by generator hashes below and no longer receive camera-conformance credit.

The correction generated twelve separate direction sources. Every request locked one immutable camera: elevated orthographic-isometric, perspective false, azimuth 315°, elevation 26.565°, basis X `(0.5, 0.25)`, basis Y `(-0.5, 0.25)`, ground-edge screen slopes `-0.5/+0.5`, and screen-vertical world-Z edges. The object alone turns in exact 90° world increments. Required adjacent faces are NORTH front/right, EAST right/rear, SOUTH rear/left, and WEST left/front. Each source used a uniform solid `#ff00ff` chroma field with no floor, shadow, reflection, text, logo, watermark, or extra prop.

## Spill Response Station

Identity lock: one compact dark-charcoal 2×1 wheeled cabinet; teal front doors and one centered amber caution panel only on the physical front; blue mop only on physical left; red wringer bucket only on physical right; plain rear with one utility rail; four casters.

- NORTH raw SHA-256: `83fa2d9c671f851523fa11c926ec65097003a2b77450502bb09713a4f3159e65`
- EAST raw SHA-256: `3473b300f3f15481cb2e612b268ac499487692e66c6e65772c08c58089fdc647`
- SOUTH raw SHA-256: `79264bacc9ed73148aa5427fb144d80da5d5866b50929651871a5b242c6c15d4`
- WEST raw SHA-256: `3c2a24924928cccc85cc6b1fdb0ba47e888871a6cb3b7702496f34a2ca233e82`

The front, rear rail, mop, and bucket follow one coherent physical quarter-turn sequence. The wide side accessories may remain visible beyond an adjacent silhouette; none is mirrored or duplicated.

## Linen and Reset Cabinet

Identity lock: one low 2×1 stainless-and-cream cabinet; cream doors and brass pulls only on the front; exactly three top linen stacks in cream, teal, gray order; black grille only on physical right; horizontal open shelving only on rear; plain physical left; four short feet.

- NORTH raw SHA-256: `59aac55d8c5b3c5978eb1d20af12e94bde37fc2ede7b86928948ad33833f25fe`
- EAST raw SHA-256: `4017b6969e27e1094e33d28930401d76e00347d00341a4260bf8e658450c3b5a`
- SOUTH raw SHA-256: `739bad46834d72afcc4bfab0405b7bd75869c8d5d6ad35eef6ae1712b445799d`
- WEST raw SHA-256: `1e4f60ba9572c08679f9634014ef8952d35295877c8ad2986abd56a8b238aefc`

The contact review confirms front/right, right/rear, rear/left, and left/front without a repeated elevation or mirrored grille.

## Filtered Water Station

Identity lock: one upright 2×2 brushed-stainless station; recessed black bay with exactly three taps, drip tray, and two teal lower doors only on front; black ventilation grille only on physical right; two blue filter housings only on rear; plain physical left; four short feet.

- NORTH raw SHA-256: `d6fe8ba77dca1537eea003c3ac01901e9b6bd7b16aacd097aca58b58de9078e4`
- EAST raw SHA-256: `3aab260d59b982b5555d0f30d902f5dc2d50448ff675d62051bdd942ff92f53f`
- SOUTH raw SHA-256: `8b35728d717c77b46aacab007a7928c6588527f5c6d937aefb96d8529ec22066`
- WEST raw SHA-256: `2a0bd0fd831732735b326ffcaa79cbf06626cd5f40575b7dbfb0d64f29c5a10e`

The three taps, front doors, right grille, rear filter housings, and plain left face remain physically coherent through all four rotations.

## Rejected prior sources

- Spill Response Station 2×2 atlas: `e0a8e151703d9f9ea69a93ec3753299503bb03b1669e41c38ee83edccc9a157d` — rejected because N/S were near frontal elevations while E/W used a different oblique camera.
- Linen and Reset Cabinet accepted-at-the-time atlas: `b5043a1c01f6c6601034fb0ba32e4076836fd591bf7f3a72ff28e0197996c794` — rejected under the corrected contract for the same arbitrary camera sequence.
- Filtered Water Station accepted-at-the-time atlas: `7d492d204834eb728e56389b28bc26dcb83f47d82a32097efb6e09667fd47fb1` — rejected under the corrected contract for the same arbitrary camera sequence.

## Processing and review

The installed image-generation chroma helper removed each magenta field with border auto-key sampling, soft matte, and despill. The batch normalizer proportionally fit each accepted source to a 627×627 sRGBA canvas, horizontally centered it on pivot x=313.5, and placed the last nontransparent row at y=589 for the contract pivot y=590 and 37-pixel bottom margin. Processing drew no replacement art. Both the exact 627px dark contact sheet and 128px light gameplay sheet were inspected for camera, face sequence, identity, alpha edge, grounding, count, and asymmetric-feature continuity.
