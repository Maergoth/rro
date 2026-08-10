# Furniture Core Directional 008 — Prompt Log

Generator: OpenAI built-in image generation. Every call requested a flat `#FF00FF` chroma field for the official chroma-removal helper. These accepted sources are locally promoted but remain pending remote preservation and native-runtime review.

## Shared contract

Create one rigid object in a 2×2 atlas ordered north/east/south/west at top-left/top-right/bottom-left/bottom-right. Use a fixed elevated orthographic semi-isometric camera approximately 35 degrees downward, identical scale and illumination, and no perspective convergence. Preserve component count, physical side assignment, front/rear state, and proportions through every quarter turn. Exactly four objects total; no clipping, people, text, logos, symbols, watermarks, room, floor, cast/contact shadow, dividers, labels, borders, or unrelated props. Use a perfectly uniform `#FF00FF` field and no magenta in the furniture.

## `furniture-host-stand-pro` — Reservation Host Stand

Initial prompt: premium modern 2×2 floor podium with a rounded dark-walnut carcass, charcoal stone top, aged-brass toe kick and guest rail, deep-teal guest-front inset, one blank angled staff-side reservation tablet, one staff-rear shelf and centered drawer pull, and exactly one physical-right circular cable port. The first atlas was rejected because the cable port appeared on both side views (`921c9482…`).

Targeted edit prompt: change only the bottom-right west cell; remove the duplicate circular cable port and restore matching uninterrupted walnut grain. Preserve the top-right east port and every other pixel-level identity invariant. The edited atlas passed semantic review.

Accepted identity contract: one front teal panel and brass rail; one rear shelf and drawer pull; one tablet; exactly one east/physical-right cable port; west/physical-left side plain.

## `furniture-server-station-pro` — Integrated Server Station

Attempt 1 prompt: premium 3×2 floor console with dark walnut, one stainless worktop, brass toe kick, two teal guest-front doors, two rear cubbies, one recessed nonslip tray, one physical-left waste opening, and one physical-right towel rail. Rejected because three cells repeated the guest front and the waste opening mirrored across incompatible sides (`f2f09f77…`).

Attempt 2 prompt: same identity with an explicit primary-face schedule and an exact single waste opening/rail. Rejected because the waste opening replicated into three cells (`e0b5dc36…`).

Accepted prompt: render one exact rigid station with top-left north showing the broad guest front, top-right east showing the plain side with a front edge, bottom-left south showing the broad staff rear, and bottom-right west showing the opposite plain side. The accepted simplified physical design intentionally removes side hardware: one rounded dark-walnut carcass, one continuous brushed-stainless top, one continuous brass toe kick; front has exactly two deep-teal inset doors with one brass pull each; rear has exactly two equal open cubbies and one long recessed black nonslip tray; both end panels are plain uninterrupted walnut. No loose objects or added side details.

## `furniture-pos-terminal` — Commercial POS Terminal

Accepted first prompt: compact self-standing 1×1 commercial POS kiosk with exactly one low square charcoal-metal weighted pedestal and brushed-brass toe cap, one short central brass neck, one blank dark touchscreen in a deep-teal bezel, exactly one physical-right card reader with a brass accent, exactly one front receipt slot, exactly one rear ventilation grille, and a plain physical-left side. No keyboard, loose paper, cash drawer, cable, icon, text, logo, or tabletop-only form. Preserve the card reader on the same physical side through all four rotations.

## Matte and normalization

The official image-generation helper removed the flat magenta field with border auto-keying, soft matte, thresholds 12/220, and despill. Host/POS were retried once with `--edge-contract 1`, as prescribed by the skill. After Lanczos normalization, only effectively invisible magenta-key resampling remnants at alpha `<=12` were cleared to transparent by the quarantined fringe sanitizer; 215 pixels across twelve 627px canvases were affected, with no opaque or meaningful antialiased pixels changed.

Each accepted 1254×1254 alpha atlas was split into exact 627×627 north/east/south/west cells. One shared scale per identity was applied, each silhouette was horizontally centered, and its bottommost visible row was placed at y=589 so the exclusive floor-contact baseline is y=590 and exactly 37 transparent rows remain below.
