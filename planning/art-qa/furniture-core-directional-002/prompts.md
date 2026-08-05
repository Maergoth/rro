# Furniture Core Directional 002 — Source Prompts

Generator: OpenAI built-in image generation. All outputs used a flat `#00ff00` chroma field and were processed with the installed `remove_chroma_key.py` helper.

## Shared production constraints

Use case: `stylized-concept` for the first view and `precise-object-edit` for rotational counterparts. Asset type: production game sprite for an elevated orthographic-isometric restaurant-management game. Keep one fixed camera looking down approximately 35 degrees, horizon-free orthographic projection, visible top and vertical side planes, camera-relative neutral studio illumination, painterly realistic materials, generous padding, and a complete centered silhouette. Rotate the whole physical object around world vertical; do not move or mirror components independently. No direct-overhead or eye-level view, floor plane, cast/contact shadow, environmental reflection, people, props beyond the identity contract, text, labels, logos, watermark, border, clipping, duplicated parts, or missing parts.

## `booth`

Identity reference: `apps/client-godot/assets/objects/generated/booth.png` (material and object identity only). Camera references: accepted `table-four/north.png` and `furniture-six-burner-range/north.png`.

North prompt: Re-render the exact Tomato Vinyl Booth as a clearly elevated orthographic-isometric 3/4 view. Preserve exactly two opposing red channel-tufted vinyl bench seats, cream outer end panels, chrome trim, one cream rectangular tabletop, and exactly one chrome pedestal. Long parallel bench axes run diagonally lower-left to upper-right; the tabletop is a foreshortened isometric parallelogram. Show tabletop top/rim, bench tops/fronts, pedestal shaft, and base.

East prompt: Rotate only the complete accepted north booth exactly 90 degrees clockwise around world vertical. Keep the same object, seam counts, camera, scale, center, padding, and materials. Move the bench/table long axes to the opposite isometric screen diagonal as a rigid quarter-turn.

South prompt: Preserve the north view's structural footprint and diagonal axis while treating the C2-symmetric booth as physically rotated 180 degrees. Reverse only coherent near/far material cues—leather grain, seam highlights, laminate grain, and chrome reflections—without changing geometry or part counts.

West prompt: Preserve the east view's structural footprint and diagonal axis while treating the C2-symmetric booth as physically rotated 180 degrees. Reverse only coherent near/far material cues without changing geometry or part counts.

## `banquette`

Identity reference: `apps/client-godot/assets/objects/generated/banquette.png` (material and object identity only). Camera references: accepted `table-four/north.png` and `furniture-six-burner-range/north.png`.

North prompt: Re-render the Deep Teal Banquette as an elevated orthographic-isometric 3/4 view. Preserve one continuous long deep-teal upholstered wall banquette divided into exactly three equal tufted back/seat modules with slim brass toe trim; exactly two separate rectangular dark-walnut tables on single brass pedestals; and exactly three matching deep-teal rounded aisle chairs. Keep the complete 5x2 group centered on a square canvas with every leg visible.

East prompt: Rotate the entire accepted north group exactly 90 degrees clockwise around world vertical. Preserve the one three-module banquette, two tables, three chairs, module sizes, chair design, spacing, materials, scale, and elevated camera. Move the long bench axis to the opposite isometric screen diagonal.

South prompt: Rigidly rotate the entire accepted north group exactly 180 degrees. Preserve all counts and locked spacing; chairs and banquette must trade near/far screen sides as required by a true 180-degree world rotation while the long bench remains on its cardinal-pair diagonal.

West prompt: Rigidly rotate the entire accepted east group exactly 180 degrees. Preserve all counts and locked spacing; chairs and banquette must trade near/far screen sides as required by a true 180-degree world rotation while the long bench remains on its cardinal-pair diagonal.

## `service-station`

Identity reference: `apps/client-godot/assets/objects/generated/service-station.png` (material, cabinet, and exact operational prop identity only). Camera references: accepted `host-stand/north.png` and `furniture-six-burner-range/north.png`.

North prompt: Re-render the exact compact Service Station as an elevated orthographic-isometric 3/4 view. Preserve its rectangular warm-walnut cabinet/cart body with raised top rim and two bronze side handles; on the top-left, one black tray holding exactly six identical upside-down clear tumblers in a 3x2 arrangement; on the top-right, one black three-compartment organizer containing exactly three forks, exactly three dinner knives, and exactly three spoons. Clearly show top, front, side, handles, tray, and every prop.

East prompt: Rigidly rotate the entire accepted north station exactly 90 degrees clockwise. All organizers and contents rotate with the cabinet; preserve the cabinet, handles, exact six-glass grid, and exact 3/3/3 utensil counts. Move the cabinet long axis to the opposite isometric diagonal.

South prompt: Rigidly rotate the entire accepted north station exactly 180 degrees. Keep the cabinet on the cardinal-pair diagonal, show the opposite physical end/front plane, and coherently reverse the screen order of the fixed trays while preserving exact prop counts.

West prompt: Rigidly rotate the entire accepted east station exactly 180 degrees. Keep the cabinet on the cardinal-pair diagonal, show the opposite physical end/front plane, and coherently reverse the screen order of the fixed trays while preserving exact prop counts.

## Rejected prompt outcomes

- Booth atlas attempt: requested a 2x2 N/E/S/W atlas; rejected because the camera remained overhead and cells were near-duplicates.
- Booth south attempt: requested 180 degrees; rejected because the model produced a quarter-turn axis.
- Booth west attempt: requested 180 degrees; rejected because the model drifted onto the north/south axis.
- Banquette first north: requested the full group; rejected because the third chair was clipped.
- Banquette texture-only south: rejected because the asymmetric group did not physically rotate.
- Banquette explicit 26.5-degree north correction: rejected because it duplicated the east/west axis.
