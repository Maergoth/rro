# RRO production art progress

> This is the single authoritative art-status document referenced by every art check-in. It is generated from catalogs, reviewed-batch evidence, committed files, and runtime bindings. Run `npm run art:ledger` after an art change; CI runs `npm run art:ledger:check` and fails if this document is stale.

## What counts

`generated → processed → raster validated → visually accepted → runtime bound → remote verified → CI green`

Only the final state is production-complete. Existing files, historical narrative approval, metadata-only animation aliases, procedural fallback art, and local/quarantined commits are tracked without inflating completion.

## Durable baseline

- Branch: `agent/complete-production-art`
- Draft PR: https://github.com/Maergoth/rro/pull/2
- Last verified remote head before this ledger check-in: `e750f74c69de2808908dca7153577d781c565020`
- Verified tree: `a08373acc7673332eece94786505e988ebd88572`
- CI: https://github.com/Maergoth/rro/actions/runs/31006966202

## Launch coverage

| Lane | Required units | Files/sets present | Source accepted | Remote verified | Production complete |
|---|---:|---:|---:|---:|---:|
| Furniture directional sets | 229 | 25 | 25 | 22 | 19 |
| Equipment inventory icons | 45 | 45 | 45 | 45 | 45 |
| Construction material textures | 18 | 0 | 0 | 0 | 0 |
| Opening geometry sets (4 directions each) | 5 | 0 | 0 | 0 | 0 |
| Utility overlays | 5 | 0 | 0 | 0 | 0 |
| World atlas | 1 | 0 | 0 | 0 | 0 |
| Environment helpers | 4 | 0 | 0 | 0 | 0 |
| Launch UI assets | 15 | 1 | 0 | 0 | 0 |
| Character body source foundations | 2 | 2 | 2 | 2 | 0 |
| Body animation sets (body × animation) | 52 | 0 | 0 | 0 | 0 |
| Split modular layer body-fits | 126 | 0 | 0 | 0 | 0 |
| Equipment attachment body-fits | 62 | 0 | 0 | 0 | 0 |
| Activity → animation bindings | 89 | 0 | 0 | 0 | 0 |

45 equipment icons and 19 furniture directional sets are production-complete because their exact reviewed bytes are visually accepted, runtime-bound, remotely verified, and CI-green. Character art and the other missing lanes remain explicit below.
Directional furniture texture selection is yes and projection alignment is yes. Latest native review `runtime-isometric-integration-001-attempt-003` accepted 19/25 present sets; its durable review checkpoint is remote-verified: yes. `local-art`, `pendants`, `plants` remain blocked on legal wall/ceiling mounting. `furniture-host-stand-pro`, `furniture-pos-terminal`, `furniture-server-station-pro` are source-accepted but pending their first native four-rotation gameplay composite.

## Character truth

- Durable character files: 144 PNGs.
- Body source poses: 16/1344 (1.2%).
- Final body animation frame cells: 0/2720; even idle requires four frames and currently has one still per direction.
- Final runtime raster-channel cells: 0/443,776 across body, modular-layer, mask, and equipment channels; the corresponding authored-source denominator is 219,488.
- Source foundations: 2/2 accepted with a normalized `(192,472)` ground pivot and clean skin channels; 2/2 reflect the currently reviewed bytes on a verified remote checkpoint.
- Split swappable layer body-fits: 0/126; required catalogs are frozen below.
- Equipment attachment body-fits: 0/62 from 31 equippable items.
- Activity-animation bindings: 0/89.
- Applicability is frozen in `planning/character-launch-applicability-v1.json`: 63 visible modular choices, 2 footwear aliases, 3 deforming worn items, 26 rigid anchored items, and 14 nonpersistent consumables.
- Classic idle outfit body-fits: 2/2 source-accepted and 2/2 remote-verified after full-resolution/gameplay composite remediation; they remain production-incomplete until split-layer catalog coverage, animation frames, and runtime compositing pass.
- Apron prototypes remain durable but QA-failed for silhouette/foot leakage and are not counted.

| Modular slot | Required visible choices | IDs |
|---|---:|---|
| faces | 6 | `warm`, `angular`, `round`, `mature`, `soft`, `freckled` |
| shirts | 6 | `classic-button-up`, `service-polo`, `chef-coat`, `manager-jacket`, `utility-shirt`, `casual-tee` |
| pants | 6 | `service-slacks`, `chef-check-trousers`, `utility-cargo`, `dark-jeans`, `tailored-skirt`, `service-shorts` |
| aprons | 4 | `waist-apron`, `bib-apron`, `cross-back-apron`, `waterproof-apron` |
| shoes | 4 | `economy-nonslip`, `compression-service`, `kitchen-clog`, `utility-boot` |
| hair | 11 | `buzz`, `short`, `side-part`, `curly`, `coily`, `locs`, `braids`, `bob`, `ponytail`, `bun`, `long` |
| facialHair | 5 | `stubble`, `mustache`, `goatee`, `short-beard`, `full-beard` |
| headwear | 5 | `chef-toque`, `cook-cap`, `service-visor`, `hairnet`, `head-scarf` |
| eyewear | 4 | `rectangular-glasses`, `round-glasses`, `sunglasses`, `safety-glasses` |
| accessories | 5 | `name-badge`, `earpiece`, `wristwatch`, `neck-scarf`, `bracelet` |
| roleLayers | 7 | `manager`, `owner`, `server`, `dishwasher`, `chef`, `cook`, `host-busser` |

## Native runtime art QA attempts

A native capture is evidence, not automatic acceptance. Failed attempts remain durable here so projection, placement, and legibility defects cannot be forgotten or silently relabeled as complete.

| Attempt | Result | Remote commit | CI/artifact | Passed gates | Blocking defects | Durable review |
|---|---|---|---|---|---|---|
| runtime-isometric-integration-001-attempt-001 | failed-needs-remediation | `00f9a36` | https://github.com/Maergoth/rro/actions/runs/30999133497/artifacts/8927474963 | native-four-rotation-capture, elevated-projection, directional-selection, floor-contact-pivots, mixed-world-depth | mounted-object-anchor-contract, world-label-collision | planning/art-qa/runtime-isometric-integration-001/attempt-001/review.json |
| runtime-isometric-integration-001-attempt-002 | passed-partial-floor-assets | `24781e2` | https://github.com/Maergoth/rro/actions/runs/31000326415/artifacts/8927966443 | native-four-rotation-capture, elevated-projection, directional-selection, floor-contact-pivots, mixed-world-depth, gameplay-legibility, sixteen-floor-assets | mounted-object-anchor-contract | planning/art-qa/runtime-isometric-integration-001/attempt-002/review.json |
| runtime-isometric-integration-001-attempt-003 | passed-partial-floor-assets | `98e479e` | https://github.com/Maergoth/rro/actions/runs/31004267533/artifacts/8929624396 | native-four-rotation-capture, elevated-projection, directional-selection, floor-contact-pivots, mixed-world-depth, gameplay-legibility, nineteen-floor-assets | mounted-object-anchor-contract | planning/art-qa/runtime-isometric-integration-001/attempt-003/review.json |

## Reviewed batches and durable evidence

| Batch | Files | Source QA | Runtime/composite QA | Remote commit | Contact sheet |
|---|---:|---|---|---|---|
| furniture-pilot-001 | 4 | passed | passed-native-gameplay-composite-attempt-002 | `1977c47` | planning/art-qa/furniture-pilot-001.png |
| character-foundation-001 | 8 | passed | blocked-anchor-and-chroma-normalization | `8f450ae` | planning/art-qa/character-foundation-001.png |
| character-foundation-002 | 8 | passed | blocked-anchor-and-chroma-normalization | `027c5c5` | planning/art-qa/character-foundation-002.png |
| character-modular-classic-001 | 80 | mixed | failed-needs-remediation | `d99c458` | planning/art-qa/character-modular-classic-001.png |
| character-modular-apron-001 | 48 | failed | failed-needs-remediation | `f01c1e1` | planning/art-qa/character-modular-apron-001.png |
| equipment-icons-shared-manager-001 | 19 | passed | passed-full-and-gameplay-scale | `c2158fc` | planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png |
| furniture-core-directional-001 | 20 | passed | passed-native-gameplay-composite-attempt-002 | `9daba41` | planning/art-qa/furniture-core-directional-001/contact-627-dark.png |
| equipment-icons-owner-server-002 | 19 | passed | passed-full-and-gameplay-scale | `0eec73b` | planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png |
| character-remediation-idle-classic-v1 | 109 | passed | blocked-static-idle-and-no-runtime-compositor | `7b2caaf` | planning/art-qa/character-remediation-idle-classic-v1/classic-composites-full.png |
| equipment-icons-server-dish-003 | 20 | passed | passed-full-gameplay-and-cross-batch-scale | `f3408b8` | planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png |
| equipment-icons-dish-chef-004 | 20 | passed | passed-full-gameplay-and-cross-batch-scale | `961fc31` | planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png |
| equipment-icons-chef-cook-host-005 | 20 | passed | passed-full-gameplay-and-cross-batch-scale | `e15aa00` | planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png |
| equipment-icons-host-006 | 14 | passed | passed-full-gameplay-and-cross-batch-scale | `dd8c059` | planning/art-qa/equipment-icons-host-006/contact-128-dark.png |
| furniture-core-directional-002 | 28 | passed | passed-native-gameplay-composite-attempt-002 | `daef2aa` | planning/art-qa/furniture-core-directional-002/contact-627-dark.png |
| furniture-core-directional-003 | 28 | passed | passed-native-gameplay-composite-attempt-002 | `998a2e5` | planning/art-qa/furniture-core-directional-003/contact-627-dark.png |
| furniture-core-directional-004 | 28 | passed | passed-native-gameplay-composite-attempt-002 | `708642f` | planning/art-qa/furniture-core-directional-004/contact-627-dark.png |
| furniture-core-directional-005 | 28 | passed | mixed-native-gameplay-composite-attempt-002-mount-blocked | `565869f` | planning/art-qa/furniture-core-directional-005/contact-627-dark.png |
| furniture-core-directional-006 | 28 | passed | mixed-native-gameplay-composite-attempt-002-mount-blocked | `185ca50` | planning/art-qa/furniture-core-directional-006/contact-627-dark.png |
| furniture-core-directional-007 | 28 | passed | passed-native-gameplay-composite-attempt-003 | `98e479e` | planning/art-qa/furniture-core-directional-007/contact-627-dark.png |

## Accepted locally, remote checkpoint pending

These batches have passed source/composite QA but deliberately do not count as remotely verified or production-complete until their immutable GitHub commit and hosted CI are recorded.

| Batch | Files | Source QA | Runtime/composite QA | Evidence |
|---|---:|---|---|---|
| furniture-core-directional-008 | 28 | passed | pending-native-gameplay-composite | planning/art-qa/furniture-core-directional-008/contact-627-dark.png |

## Missing furniture directional sets

25 of 229 elevated four-direction sets are present. The 20 attractive overhead singles are preserved as references but do not satisfy this camera contract.

### Kitchen — 46 missing

`furniture-expo-pass-heated`, `furniture-plancha-commercial`, `furniture-convection-oven`, `furniture-prep-table-refrigerated`, `furniture-essential-restaurant-range`, `furniture-craftsman-restaurant-range`, `furniture-endurance-restaurant-range`, `furniture-hospitality-restaurant-range`, `furniture-precision-restaurant-range`, `furniture-reclaimed-restaurant-range`, `furniture-essential-convection-oven-line`, `furniture-craftsman-convection-oven-line`, `furniture-endurance-convection-oven-line`, `furniture-hospitality-convection-oven-line`, `furniture-precision-convection-oven-line`, `furniture-reclaimed-convection-oven-line`, `furniture-essential-plancha-griddle`, `furniture-craftsman-plancha-griddle`, `furniture-endurance-plancha-griddle`, `furniture-hospitality-plancha-griddle`, `furniture-precision-plancha-griddle`, `furniture-reclaimed-plancha-griddle`, `furniture-essential-fry-station`, `furniture-craftsman-fry-station`, `furniture-endurance-fry-station`, `furniture-hospitality-fry-station`, `furniture-precision-fry-station`, `furniture-reclaimed-fry-station`, `furniture-essential-prep-counter`, `furniture-craftsman-prep-counter`, `furniture-endurance-prep-counter`, `furniture-hospitality-prep-counter`, `furniture-precision-prep-counter`, `furniture-reclaimed-prep-counter`, `furniture-essential-expo-pass`, `furniture-craftsman-expo-pass`, `furniture-endurance-expo-pass`, `furniture-hospitality-expo-pass`, `furniture-precision-expo-pass`, `furniture-reclaimed-expo-pass`, `furniture-essential-combi-oven`, `furniture-craftsman-combi-oven`, `furniture-endurance-combi-oven`, `furniture-hospitality-combi-oven`, `furniture-precision-combi-oven`, `furniture-reclaimed-combi-oven`

### Storage — 20 missing

`furniture-walkin-rack`, `furniture-dry-storage-rack`, `furniture-essential-dry-rack-line`, `furniture-craftsman-dry-rack-line`, `furniture-endurance-dry-rack-line`, `furniture-hospitality-dry-rack-line`, `furniture-precision-dry-rack-line`, `furniture-reclaimed-dry-rack-line`, `furniture-essential-cold-rack`, `furniture-craftsman-cold-rack`, `furniture-endurance-cold-rack`, `furniture-hospitality-cold-rack`, `furniture-precision-cold-rack`, `furniture-reclaimed-cold-rack`, `furniture-essential-linen-cabinet`, `furniture-craftsman-linen-cabinet`, `furniture-endurance-linen-cabinet`, `furniture-hospitality-linen-cabinet`, `furniture-precision-linen-cabinet`, `furniture-reclaimed-linen-cabinet`

### Utility — 36 missing

`furniture-chemical-cabinet`, `furniture-dish-machine-high-temp`, `furniture-three-comp-sink`, `furniture-glass-rack-system`, `furniture-floor-drain`, `furniture-wet-floor-station`, `furniture-essential-dish-machine`, `furniture-craftsman-dish-machine`, `furniture-endurance-dish-machine`, `furniture-hospitality-dish-machine`, `furniture-precision-dish-machine`, `furniture-reclaimed-dish-machine`, `furniture-essential-pot-wash-sink`, `furniture-craftsman-pot-wash-sink`, `furniture-endurance-pot-wash-sink`, `furniture-hospitality-pot-wash-sink`, `furniture-precision-pot-wash-sink`, `furniture-reclaimed-pot-wash-sink`, `furniture-essential-mop-basin`, `furniture-craftsman-mop-basin`, `furniture-endurance-mop-basin`, `furniture-hospitality-mop-basin`, `furniture-precision-mop-basin`, `furniture-reclaimed-mop-basin`, `furniture-essential-waste-sorter`, `furniture-craftsman-waste-sorter`, `furniture-endurance-waste-sorter`, `furniture-hospitality-waste-sorter`, `furniture-precision-waste-sorter`, `furniture-reclaimed-waste-sorter`, `furniture-essential-spill-cart`, `furniture-craftsman-spill-cart`, `furniture-endurance-spill-cart`, `furniture-hospitality-spill-cart`, `furniture-precision-spill-cart`, `furniture-reclaimed-spill-cart`

### Decor — 24 missing

`furniture-oak-partition`, `furniture-large-planter`, `furniture-wall-art-local`, `furniture-acoustic-panel`, `furniture-pendant-light`, `furniture-essential-room-divider`, `furniture-craftsman-room-divider`, `furniture-endurance-room-divider`, `furniture-hospitality-room-divider`, `furniture-precision-room-divider`, `furniture-reclaimed-room-divider`, `furniture-essential-planter-feature`, `furniture-craftsman-planter-feature`, `furniture-endurance-planter-feature`, `furniture-hospitality-planter-feature`, `furniture-precision-planter-feature`, `furniture-reclaimed-planter-feature`, `furniture-essential-acoustic-light`, `furniture-craftsman-acoustic-light`, `furniture-endurance-acoustic-light`, `furniture-hospitality-acoustic-light`, `furniture-precision-acoustic-light`, `furniture-reclaimed-acoustic-light`, `summer-canopy`

### Service — 33 missing

`furniture-linen-storage`, `furniture-water-station`, `furniture-essential-host-podium`, `furniture-craftsman-host-podium`, `furniture-endurance-host-podium`, `furniture-hospitality-host-podium`, `furniture-precision-host-podium`, `furniture-reclaimed-host-podium`, `furniture-essential-server-console`, `furniture-craftsman-server-console`, `furniture-endurance-server-console`, `furniture-hospitality-server-console`, `furniture-precision-server-console`, `furniture-reclaimed-server-console`, `furniture-essential-beverage-station`, `furniture-craftsman-beverage-station`, `furniture-endurance-beverage-station`, `furniture-hospitality-beverage-station`, `furniture-precision-beverage-station`, `furniture-reclaimed-beverage-station`, `furniture-essential-pos-workstation`, `furniture-craftsman-pos-workstation`, `furniture-endurance-pos-workstation`, `furniture-hospitality-pos-workstation`, `furniture-precision-pos-workstation`, `furniture-reclaimed-pos-workstation`, `furniture-essential-bussing-station`, `furniture-craftsman-bussing-station`, `furniture-endurance-bussing-station`, `furniture-hospitality-bussing-station`, `furniture-precision-bussing-station`, `furniture-reclaimed-bussing-station`, `summer-lemonade`

### Office — 14 missing

`furniture-office-desk`, `furniture-manager-console`, `furniture-essential-manager-desk-line`, `furniture-craftsman-manager-desk-line`, `furniture-endurance-manager-desk-line`, `furniture-hospitality-manager-desk-line`, `furniture-precision-manager-desk-line`, `furniture-reclaimed-manager-desk-line`, `furniture-essential-scheduling-board`, `furniture-craftsman-scheduling-board`, `furniture-endurance-scheduling-board`, `furniture-hospitality-scheduling-board`, `furniture-precision-scheduling-board`, `furniture-reclaimed-scheduling-board`

### Dining — 31 missing

`furniture-essential-cafe-two-top`, `furniture-craftsman-cafe-two-top`, `furniture-endurance-cafe-two-top`, `furniture-hospitality-cafe-two-top`, `furniture-precision-cafe-two-top`, `furniture-reclaimed-cafe-two-top`, `furniture-essential-family-four-top`, `furniture-craftsman-family-four-top`, `furniture-endurance-family-four-top`, `furniture-hospitality-family-four-top`, `furniture-precision-family-four-top`, `furniture-reclaimed-family-four-top`, `furniture-essential-communal-table`, `furniture-craftsman-communal-table`, `furniture-endurance-communal-table`, `furniture-hospitality-communal-table`, `furniture-precision-communal-table`, `furniture-reclaimed-communal-table`, `furniture-essential-dining-chair`, `furniture-craftsman-dining-chair`, `furniture-endurance-dining-chair`, `furniture-hospitality-dining-chair`, `furniture-precision-dining-chair`, `furniture-reclaimed-dining-chair`, `furniture-essential-dining-booth`, `furniture-craftsman-dining-booth`, `furniture-endurance-dining-booth`, `furniture-hospitality-dining-booth`, `furniture-precision-dining-booth`, `furniture-reclaimed-dining-booth`, `summer-patio-two`

## Other exact incomplete catalogs

- Equipment icons (0): none
- Construction materials (18): `floor-sealed-concrete`, `floor-quarry-tile`, `floor-white-hex`, `floor-slate-tile`, `floor-oak-plank`, `floor-walnut-plank`, `floor-terrazzo`, `floor-pattern-cement`, `floor-commercial-vinyl`, `floor-rubber-kitchen`, `floor-entry-mat`, `floor-outdoor-paver`, `wall-painted-plaster`, `wall-subway-tile`, `wall-exposed-brick`, `wall-oak-panel`, `wall-glass-partition`, `wall-stainless-kitchen`
- Opening geometry (5 × 4 directions): `solid`, `door`, `service-door`, `window`, `arch`
- Utility overlays (5): `power`, `gas`, `water`, `drain`, `ventilation`
- World (1): `world-atlas`
- Environment (4): `contact-shadow`, `selection-ring`, `steam-puff`, `service-sparkles`
- UI (15 incomplete: 14 absent, 1 present but unreviewed): `builder-pointer`, `builder-floor`, `builder-wall`, `builder-furniture`, `builder-rotate`, `builder-repair`, `builder-sell`, `builder-expand`, `builder-power`, `builder-gas`, `builder-water`, `builder-drain`, `builder-ventilation`, `login-hero`, `rro-mark`

## Preserved and quarantined work

- Preserved: 20 high-quality direct-overhead furniture PNGs remain in `apps/client-godot/assets/objects/generated` for identity/material reference.
- Quarantined: local commit `5714bb8` contains 1,473 deterministic Pillow placeholder PNGs. It is not on PR #2, is not production art, and remains recorded so future runs neither count nor rediscover it.

## Contract gaps blocking a truthful 100% denominator

- Freeze furniture shadow and operational-state requirements (active, dirty, damaged, broken) per catalog item before those states can receive a completion denominator.
- Remotely preserve the batch-008 source package with green hosted CI and pass its three pending floor assets through exact four-rotation native gameplay-composite review; complete mounted-object server placement, builder snapping, runtime anchors, and depth before re-reviewing local-art, plants, and pendants.
- Implement character animation storage/rigging and phase-level task choreography against the frozen launch applicability matrix; static direction art and metadata-only aliases do not satisfy its raster-cell contract.
- Enumerate production minigame presentation art and regional/world overlays beyond the single launch atlas before whole-game art can be called complete.

## Machine-readable ledger

This JSON block is part of this same authoritative document and contains every catalog ID, expected runtime path, file hash, review state, and durability gate.

<!-- ART_LEDGER_JSON_BEGIN -->
```json
{
  "schemaVersion": 1,
  "product": "Rush & Revenue Online",
  "authoritativeProgressDocument": "docs/ART_PROGRESS.md",
  "generatedFrom": [
    "packages/game-data/** art-bearing catalogs",
    "planning/art-pass-v2.json",
    "planning/art-production.json",
    "planning/character-art-catalog.json",
    "planning/character-launch-applicability-v1.json",
    "apps/client-godot/assets/**",
    "current Godot runtime bindings"
  ],
  "durableBaseline": {
    "branch": "agent/complete-production-art",
    "pullRequest": "https://github.com/Maergoth/rro/pull/2",
    "commit": "e750f74c69de2808908dca7153577d781c565020",
    "tree": "a08373acc7673332eece94786505e988ebd88572",
    "ci": "https://github.com/Maergoth/rro/actions/runs/31006966202"
  },
  "completionPipeline": [
    "generated",
    "processed",
    "raster_validated",
    "visual_accepted",
    "runtime_bound",
    "remote_verified",
    "ci_green"
  ],
  "completionRule": "An asset is production-complete only when every pipeline gate passes. Mere existence, metadata bindings, procedural fallbacks, and quarantined/local-only files never count.",
  "runtimeCapabilities": {
    "directionalFurniture": {
      "directionalTextureSelection": true,
      "commonFloorContactPivot": true,
      "uniformScaleWithoutStretching": true,
      "stableFurnitureDrawOrder": true,
      "runtimeProjection": "elevated-orthographic-isometric-grid",
      "projectionIntegrated": true,
      "projectionAligned": true,
      "runtimeCompositeAccepted": false,
      "productionComplete": false,
      "remainingVisualGate": "Pass an exact four-rotation native Godot gameplay capture for furniture-host-stand-pro, furniture-pos-terminal, and furniture-server-station-pro; implement legal wall and ceiling mounting plus mount-specific anchors and depth for local-art, plants, and pendants, then pass a second exact four-rotation native Godot gameplay capture for those mounted assets.",
      "acceptedDirectionalAssetIds": [
        "banquette",
        "booth",
        "dish-machine",
        "espresso",
        "furniture-banquette-section",
        "furniture-commercial-chair",
        "furniture-host-stand-pro",
        "furniture-oak-two-top",
        "furniture-pos-terminal",
        "furniture-premium-chair",
        "furniture-server-station-pro",
        "furniture-six-burner-range",
        "furniture-walnut-four-top",
        "host-stand",
        "local-art",
        "mop-sink",
        "pass",
        "pendants",
        "plants",
        "prep",
        "range",
        "recycling",
        "service-station",
        "table-four",
        "table-two"
      ],
      "runtimeCompositeAcceptedAssetIds": [
        "banquette",
        "booth",
        "dish-machine",
        "espresso",
        "furniture-banquette-section",
        "furniture-commercial-chair",
        "furniture-oak-two-top",
        "furniture-premium-chair",
        "furniture-six-burner-range",
        "furniture-walnut-four-top",
        "host-stand",
        "mop-sink",
        "pass",
        "prep",
        "range",
        "recycling",
        "service-station",
        "table-four",
        "table-two"
      ],
      "runtimeCompositeBlockedAssetIds": [
        "local-art",
        "pendants",
        "plants"
      ],
      "runtimeCompositePendingAssetIds": [
        "furniture-host-stand-pro",
        "furniture-pos-terminal",
        "furniture-server-station-pro"
      ],
      "runtimeReviewRemoteVerified": true
    }
  },
  "summaries": [
    {
      "lane": "Furniture directional sets",
      "required": 229,
      "present": 25,
      "sourceAccepted": 25,
      "remoteVerified": 22,
      "productionComplete": 19
    },
    {
      "lane": "Equipment inventory icons",
      "required": 45,
      "present": 45,
      "sourceAccepted": 45,
      "remoteVerified": 45,
      "productionComplete": 45
    },
    {
      "lane": "Construction material textures",
      "required": 18,
      "present": 0,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    },
    {
      "lane": "Opening geometry sets (4 directions each)",
      "required": 5,
      "present": 0,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    },
    {
      "lane": "Utility overlays",
      "required": 5,
      "present": 0,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    },
    {
      "lane": "World atlas",
      "required": 1,
      "present": 0,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    },
    {
      "lane": "Environment helpers",
      "required": 4,
      "present": 0,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    },
    {
      "lane": "Launch UI assets",
      "required": 15,
      "present": 1,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    },
    {
      "lane": "Character body source foundations",
      "required": 2,
      "present": 2,
      "sourceAccepted": 2,
      "remoteVerified": 2,
      "productionComplete": 0
    },
    {
      "lane": "Body animation sets (body × animation)",
      "required": 52,
      "present": 0,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    },
    {
      "lane": "Split modular layer body-fits",
      "required": 126,
      "present": 0,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    },
    {
      "lane": "Equipment attachment body-fits",
      "required": 62,
      "present": 0,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    },
    {
      "lane": "Activity → animation bindings",
      "required": 89,
      "present": 0,
      "sourceAccepted": 0,
      "remoteVerified": 0,
      "productionComplete": 0
    }
  ],
  "furniture": [
    {
      "id": "table-two",
      "assetId": "table-two",
      "name": "Walnut Two-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/table-two/north.png",
          "present": true,
          "sha256": "5a2eda2886a111e11e618383827e7a2e44bde330db5e0140c5fd60f655e6b362"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/table-two/east.png",
          "present": true,
          "sha256": "d4e676f5ff109355d0c3caabae9868f1c449347ed693c2f47beb9987cfc79d33"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/table-two/south.png",
          "present": true,
          "sha256": "436b3a7eb27e1ae72cdefa2217e8be8cc49e0e823fae036eddec5183515ca55f"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/table-two/west.png",
          "present": true,
          "sha256": "e6543e3a20b778040d8d9e82455693a8ab9c88c0501bb2f2118b4f3ad059cb7f"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-001",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-001/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "table-four",
      "assetId": "table-four",
      "name": "Oak Four-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/table-four/north.png",
          "present": true,
          "sha256": "04633f182087398908585dcf67deac7214a7fdebb6309b2dc4f2b776eb0455cd"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/table-four/east.png",
          "present": true,
          "sha256": "a92a0956061de546977e54006aacfec6a2bbac5af6449a0dc009c63b54a4a71f"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/table-four/south.png",
          "present": true,
          "sha256": "3cb53f39cbaa4c11b6b194dd268de2b774ad936fbd8835af0d1e1829426d2ef8"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/table-four/west.png",
          "present": true,
          "sha256": "c41006be11bfc852e44ae2ba585dce5b6e1465d1d7b964b88d92d2458a709b22"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-001",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-001/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "booth",
      "assetId": "booth",
      "name": "Tomato Vinyl Booth",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/booth/north.png",
          "present": true,
          "sha256": "b0ea56b7f2c11cad354b4e3dc838b1a459ee47c97795fbd9223f63031151ebc6"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/booth/east.png",
          "present": true,
          "sha256": "24ef2c3f2821d492dadd72ce0a8bb1c614c84b23c897d36b6802dc979712343c"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/booth/south.png",
          "present": true,
          "sha256": "63f7754e39f35732fb02a12967c5f2444d5b8af4c1f7b6969dc89e8d8c8bcbf0"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/booth/west.png",
          "present": true,
          "sha256": "387090ed5b540df3f6ca081df1ae7cec60c77af4ad0e515b0b3d4256dab3883c"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-002",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-002/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "banquette",
      "assetId": "banquette",
      "name": "Deep Teal Banquette",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/banquette/north.png",
          "present": true,
          "sha256": "a21e42b601571b10deeed71cf090b6ab9fbfd00ca531ac978aac5d78e0c89fb5"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/banquette/east.png",
          "present": true,
          "sha256": "39ae6dbc6cc713e6a533c7ac4ca31f9485792ed67ba5beeebad88e0567bdadcc"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/banquette/south.png",
          "present": true,
          "sha256": "4f9fa2548188412a7de94148436ae575a47d7638c4f8a75d0c97f3203c62b496"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/banquette/west.png",
          "present": true,
          "sha256": "db18c25657058a3d8fdb9d8369e314e2154de7e3cd8f5870be65262241d21531"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-002",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-002/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "host-stand",
      "assetId": "host-stand",
      "name": "Host Stand",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/host-stand/north.png",
          "present": true,
          "sha256": "9170859b113b10161089d274ba7cae9f251ea440afdf72554d72155ee25b717a"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/host-stand/east.png",
          "present": true,
          "sha256": "0fd01a4beb5dd1db9f79d9f022618c74d9d7ad74c0ffab2bb8dfea856791f209"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/host-stand/south.png",
          "present": true,
          "sha256": "25a2277f0b9736c0cef7a6aa6af6ffc0e98b4a1ea1db1ca585302bc00ca9fa71"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/host-stand/west.png",
          "present": true,
          "sha256": "03df9612c109fdd356b7935ef8b4c4bdf63399d42e0aae2a99743f62af2962e7"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-001",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-001/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "service-station",
      "assetId": "service-station",
      "name": "Service Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/service-station/north.png",
          "present": true,
          "sha256": "7ed54a74f524fed8265367a2ed7936bf8e8517618fb3b9a87cb9c0ade4672c87"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/service-station/east.png",
          "present": true,
          "sha256": "d3887b8a518c53887a2b722dfe945d2ce9ed00633c8de7a5efeec51be7462b37"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/service-station/south.png",
          "present": true,
          "sha256": "8f0a4884ee2e1ebfed93cba9fc9220caee4f7583721877b8e683f628c82eecd9"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/service-station/west.png",
          "present": true,
          "sha256": "4f9b0325d47257ea2de8ba666216bd885e4134ab8518b88babd4a9bf3bf6b3eb"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-002",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-002/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "espresso",
      "assetId": "espresso",
      "name": "Espresso Machine",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/espresso/north.png",
          "present": true,
          "sha256": "356eef483e0f37755bd632557ef09d32d746d38baeec2a7c562839f82a97baa4"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/espresso/east.png",
          "present": true,
          "sha256": "f138a521f1ef46e2587b7b0e270779e5c091ff3e135cc41462236b2574229d7e"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/espresso/south.png",
          "present": true,
          "sha256": "003657cc1b84db2902d0873c0713d86afe98ec857ecd8c67636032f58edc8f20"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/espresso/west.png",
          "present": true,
          "sha256": "80da2f442c7ec271aca2c1f42c65c0d04bc0efb06596e33d6e0f82b68cda9ed9"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-004",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-004/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "range",
      "assetId": "range",
      "name": "Six-Burner Range",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/range/north.png",
          "present": true,
          "sha256": "a176cc672131b13c95505e168ffd25ca9528b66d2011ebcdf62d2996adea437d"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/range/east.png",
          "present": true,
          "sha256": "de992dcb255c731a1976cbf3aaed3bb804cde66c92318e814852a9cb633bbd15"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/range/south.png",
          "present": true,
          "sha256": "187e51b1ec23af1670072ae7b7decccfb6a04006dd4be9defda41e3801dbc809"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/range/west.png",
          "present": true,
          "sha256": "66e930305412aee7b8feb2b005a9c9099216b913e254ec055a9bc2e97a63ac04"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-003",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-003/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "prep",
      "assetId": "prep",
      "name": "Cold Prep Table",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/prep/north.png",
          "present": true,
          "sha256": "34441736681b75c28c087a513fb95500965d8ed2b7a0cb20cb8bd2b657854c2d"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/prep/east.png",
          "present": true,
          "sha256": "c7b9c5c932d3d8278cd1d09f5424ece7b57b40e6c67dcfb46952bbf96762df9f"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/prep/south.png",
          "present": true,
          "sha256": "bccf615fae62b1df44811a87a2f439b933ffc58fdcb441cefef5b34c4f82fc20"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/prep/west.png",
          "present": true,
          "sha256": "add69ee4158a5f45d168d012366765bf6211a259a38228a1d6596952f4e041c5"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-003",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-003/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "pass",
      "assetId": "pass",
      "name": "Heated Pass",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/pass/north.png",
          "present": true,
          "sha256": "da834099de8fa75c97192327fb3ca0cebbee43c4db70b9d6ec97903801a93771"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/pass/east.png",
          "present": true,
          "sha256": "534a2e83475a9cbf426f88aa50405755ca00bd837a93e354ad9da1e52cae00ff"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/pass/south.png",
          "present": true,
          "sha256": "6e75b82365438e266729129fe145b4eab4aaa6c75c328a5a17093ae558a273a6"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/pass/west.png",
          "present": true,
          "sha256": "f69607e3a51722f6aba9da39951fbd2e9f0acf1d5dee4c9f044b769660653bec"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-003",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-003/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "dish-machine",
      "assetId": "dish-machine",
      "name": "High-Temp Dish Machine",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/dish-machine/north.png",
          "present": true,
          "sha256": "4be474558ba5fbba9135d9a6e1b5f7cfc97e4be4cb455601265876301d329a70"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/dish-machine/east.png",
          "present": true,
          "sha256": "2306dbabc3d331d8d73ada747112ed25296440d55d6774bc6d011cd69f3f7850"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/dish-machine/south.png",
          "present": true,
          "sha256": "3271bdf4fbd70e9cbabf90807eb1459d37e1002579b30c83a2cb8f5f9bd4c059"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/dish-machine/west.png",
          "present": true,
          "sha256": "8f220010ff0cf66422e2a74c43fb730f6caa851aece30d368f638efa83397967"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-004",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-004/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "mop-sink",
      "assetId": "mop-sink",
      "name": "Utility Sink",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/mop-sink/north.png",
          "present": true,
          "sha256": "3bcee68c724833225b3a5d9d3ca6281045bb21d82aa2c939b83bf73aee664fcc"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/mop-sink/east.png",
          "present": true,
          "sha256": "a85c4b492c9a1b56392170baf32231b8aa8fba053e8d3c4820b7c11de2b89de4"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/mop-sink/south.png",
          "present": true,
          "sha256": "98221fc9813031c9018e6df7073c90cff01b18f2f9cb4d6113170818eec90365"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/mop-sink/west.png",
          "present": true,
          "sha256": "f9169db3054301dec5854e72924651a82c62b9b7ed492f3bfb67f6f66584486c"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-004",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-004/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "recycling",
      "assetId": "recycling",
      "name": "Sorting Station",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/recycling/north.png",
          "present": true,
          "sha256": "bf7e5c521e20feab7316bcaeda1c42950e4242bfefee1e9a56ec8e1063858f03"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/recycling/east.png",
          "present": true,
          "sha256": "e42fbcc7593f3e178d627ba3386c23fd308efea86c704ec9fa88c0dc9896c316"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/recycling/south.png",
          "present": true,
          "sha256": "c9f7739ff2e3391511a6014710414d3f0314d1d544b725a0d3292cb33020081d"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/recycling/west.png",
          "present": true,
          "sha256": "73e2e9a7d6d95689f15ce1f7de882c20f3643290e240579f16b1b1896ee0dbe3"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-005",
      "review": "passed",
      "runtimeQa": "mixed-native-gameplay-composite-attempt-002-mount-blocked",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-005/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "pendants",
      "assetId": "pendants",
      "name": "Mustard Pendant Lights",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/pendants/north.png",
          "present": true,
          "sha256": "231af1cfc1ed6e73130c90b99553dc6c3f4448216828e65877b56254dc0525d2"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/pendants/east.png",
          "present": true,
          "sha256": "1e762a03ad26d160960f0012444d5581dc1f619fb1c5f4499bf6106e9ed3ceb8"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/pendants/south.png",
          "present": true,
          "sha256": "36ceb7759dc6c6b5b313acc3cd10ff7a12d178e89eabc4beeff7618aa0b1f456"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/pendants/west.png",
          "present": true,
          "sha256": "998e38d0ba72e32c7dc643b22da508947f08010d16034533d02ff8065213930d"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-005",
      "review": "passed",
      "runtimeQa": "mixed-native-gameplay-composite-attempt-002-mount-blocked",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-005/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "ceiling",
        "occupancy": "nonblocking",
        "serviceAccess": "none"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": true,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "source_accepted_runtime_blocked"
    },
    {
      "id": "plants",
      "assetId": "plants",
      "name": "Window Herb Wall",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/plants/north.png",
          "present": true,
          "sha256": "f7fe5524710b3a50fa9a250d90bd47560879007e33e2a98e79a983d04c836799"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/plants/east.png",
          "present": true,
          "sha256": "a92fd8bcb2db27804fff4b4a187633daa63edb55f3ae60014484dedcd946282a"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/plants/south.png",
          "present": true,
          "sha256": "64928227775721d6566ca26c0f292545c5ce5402b7157ccb9d767630cfe10429"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/plants/west.png",
          "present": true,
          "sha256": "3f13140bad7621759144860efefbd50fd84c607596601fc38a0b8157ee2d49b1"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-005",
      "review": "passed",
      "runtimeQa": "mixed-native-gameplay-composite-attempt-002-mount-blocked",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-005/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "wall",
        "occupancy": "nonblocking",
        "serviceAccess": "none",
        "allowedWallOpenings": [
          "solid"
        ]
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": true,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "source_accepted_runtime_blocked"
    },
    {
      "id": "local-art",
      "assetId": "local-art",
      "name": "Local Print Set",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/local-art/north.png",
          "present": true,
          "sha256": "15517f5f05092075c2f753fb5e1f23cf4d6025aade0f0d8bf92ee0fbb06f906c"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/local-art/east.png",
          "present": true,
          "sha256": "08f153340927cee22f31c0358135b2a5b4947fff8d677bbad2f0cd5cc3b020e8"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/local-art/south.png",
          "present": true,
          "sha256": "9218d12571ef3779288f09ed39d964fc11a353a4ef293c1017fc29d1312f0545"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/local-art/west.png",
          "present": true,
          "sha256": "9653242d5e91293d42e0b55ddd96ddabc91141b52e207e2c3dbecbbefa655847"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-006",
      "review": "passed",
      "runtimeQa": "mixed-native-gameplay-composite-attempt-002-mount-blocked",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-006/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "wall",
        "occupancy": "nonblocking",
        "serviceAccess": "none",
        "allowedWallOpenings": [
          "solid"
        ]
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": true,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "source_accepted_runtime_blocked"
    },
    {
      "id": "oak-two-top",
      "assetId": "furniture-oak-two-top",
      "name": "Oak Two-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-oak-two-top/north.png",
          "present": true,
          "sha256": "d6a5abc9e7306b0d8cf4f9ed5ebf2e8bf63e78a98c75d6455f948ff4589eca76"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-oak-two-top/east.png",
          "present": true,
          "sha256": "59354c68b6f1eb9d57aaefe6718d5d5334e7aaa87e903b01c16401dbda6dbb24"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-oak-two-top/south.png",
          "present": true,
          "sha256": "fb19a998f3a331f8224cb8debeaadd1efbace08f5835543ce1bf9cf2911711be"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-oak-two-top/west.png",
          "present": true,
          "sha256": "748b1d5cddebcd450ae757db353eafd5c187a0525d3a9aad24a42a4e4a9408fd"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-006",
      "review": "passed",
      "runtimeQa": "mixed-native-gameplay-composite-attempt-002-mount-blocked",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-006/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "walnut-four-top",
      "assetId": "furniture-walnut-four-top",
      "name": "Walnut Four-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-walnut-four-top/north.png",
          "present": true,
          "sha256": "34ffe15db9881dc44c3e8268ce291574b677d8c211274b5e5c4eb0c423f46ca5"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-walnut-four-top/east.png",
          "present": true,
          "sha256": "1b4c0ea9182885f63f34d98c877203fbe16f5eb07a5962b2029e95ae6df31774"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-walnut-four-top/south.png",
          "present": true,
          "sha256": "bd11b2dbce979698820a2e33251efccc22ea91c49d1ac285ce2f7b1d971a6dcf"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-walnut-four-top/west.png",
          "present": true,
          "sha256": "ca6949890089823f1987e68c2ed8407a8f6f29b186a8ef7ba84e136819b5674c"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-006",
      "review": "passed",
      "runtimeQa": "mixed-native-gameplay-composite-attempt-002-mount-blocked",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-006/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "banquette-section",
      "assetId": "furniture-banquette-section",
      "name": "Upholstered Banquette",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-banquette-section/north.png",
          "present": true,
          "sha256": "d937914dcb32264e8e723e0c0328ecf26de92697d9bce15065ab483f945d6fa0"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-banquette-section/east.png",
          "present": true,
          "sha256": "f7949286866ec30801a108662e07cb7371f0de4f0d49111b33b558cd369e63b7"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-banquette-section/south.png",
          "present": true,
          "sha256": "84a9bf4870b8d78d7aece2b878c97bec7eb15df6de186dd033b1fb70da86cb53"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-banquette-section/west.png",
          "present": true,
          "sha256": "8b5929a6981b4ffa341e055b571dc8dbb3ccb4b5d210ee4355ef1937f1c8b693"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-007",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-003",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-007/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "commercial-chair",
      "assetId": "furniture-commercial-chair",
      "name": "Commercial Dining Chair",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-commercial-chair/north.png",
          "present": true,
          "sha256": "0d261ce08b2631d480a91ef2273676449542fa00cc3a3bb032910c3e87cf6c8c"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-commercial-chair/east.png",
          "present": true,
          "sha256": "be3a2dc2a277ed916638bdbc3dc5110961b33775e086eacbe252dee52f230de9"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-commercial-chair/south.png",
          "present": true,
          "sha256": "aef6b7508f0954a9ad19b66475d5e985c71c4186cec9fbed5b618db378fb0997"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-commercial-chair/west.png",
          "present": true,
          "sha256": "e16f1e98fe0ff708a4e503e02a57ad340c1df03c5193f2c510cf2f9f62d4892d"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-007",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-003",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-007/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "premium-chair",
      "assetId": "furniture-premium-chair",
      "name": "Premium Dining Chair",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-premium-chair/north.png",
          "present": true,
          "sha256": "3a73aaea575414ee3cb1f0aa31152786ffee7b6c7b67f855ba82fc12ed178377"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-premium-chair/east.png",
          "present": true,
          "sha256": "02be7d1338faa6f69cc07cb49d8b156faa995be65bde9fc92bbb4004ba6d46bc"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-premium-chair/south.png",
          "present": true,
          "sha256": "087a230b15866c590a00c301dfb6a3d9671dfac420952528a01954beaebe2239"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-premium-chair/west.png",
          "present": true,
          "sha256": "aea1e2a84edc667480935766281ed0c168aa4ad7ac054b4a6cb12c6bb7863a85"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-007",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-003",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-core-directional-007/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "host-stand-pro",
      "assetId": "furniture-host-stand-pro",
      "name": "Reservation Host Stand",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-host-stand-pro/north.png",
          "present": true,
          "sha256": "92f8936bf796d1d1e55deec4f2cddefda9202f008bfcb5421c2365f3de137100"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-host-stand-pro/east.png",
          "present": true,
          "sha256": "e68292749515678c17d336b8ba66e484941981e108451148904eb0728408fe26"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-host-stand-pro/south.png",
          "present": true,
          "sha256": "680f52e985eb1a48e365e9be7184be4805eb00361ef62b7a43c1b5861188596c"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-host-stand-pro/west.png",
          "present": true,
          "sha256": "b95a8f0df9db5b28833de9f03e0185b2cd7b64310b64ce33f9b05008f167a4d6"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-008",
      "review": "passed",
      "runtimeQa": "pending-native-gameplay-composite",
      "remoteVerified": false,
      "qaEvidence": "planning/art-qa/furniture-core-directional-008/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": true,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "source_accepted_local_only"
    },
    {
      "id": "server-station-pro",
      "assetId": "furniture-server-station-pro",
      "name": "Integrated Server Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-server-station-pro/north.png",
          "present": true,
          "sha256": "4fbc1eecae3cbe91ce2ecf53c7b4ccdeb72bbb4b41a0f288b7e886dd7e10af25"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-server-station-pro/east.png",
          "present": true,
          "sha256": "7b1657cf4502784216409ccc10901ef4182a54dac24fa5587d7860624d2b2115"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-server-station-pro/south.png",
          "present": true,
          "sha256": "5f581537686642934a455cedbdfdf0af861e9d47507e81c364ca6a6185fbed6d"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-server-station-pro/west.png",
          "present": true,
          "sha256": "0196a97f0f00f9776d775683c8a16fa818868e4400a4bd96651da2989ad6b5bc"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-008",
      "review": "passed",
      "runtimeQa": "pending-native-gameplay-composite",
      "remoteVerified": false,
      "qaEvidence": "planning/art-qa/furniture-core-directional-008/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": true,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "source_accepted_local_only"
    },
    {
      "id": "pos-terminal",
      "assetId": "furniture-pos-terminal",
      "name": "Commercial POS Terminal",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-pos-terminal/north.png",
          "present": true,
          "sha256": "9f89cf0e131992489204d26d449d28d1bd9b78e58bc0f7b63b88eb3ae048f6a2"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-pos-terminal/east.png",
          "present": true,
          "sha256": "a74388aaa4822ff0bc3fcb8c09ce29d78830324d3a36e2e878bd49e696bfba04"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-pos-terminal/south.png",
          "present": true,
          "sha256": "1ae82455331cb0a48f538455b3d351b7fbbc13fec57a80498e95ca2cbd4f4849"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-pos-terminal/west.png",
          "present": true,
          "sha256": "1434d8ae74f649b087e3b2c6476f159cdcf8f60a99ca14b7a99f34bf957e3771"
        }
      ],
      "present": true,
      "batchId": "furniture-core-directional-008",
      "review": "passed",
      "runtimeQa": "pending-native-gameplay-composite",
      "remoteVerified": false,
      "qaEvidence": "planning/art-qa/furniture-core-directional-008/contact-627-dark.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": true,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "source_accepted_local_only"
    },
    {
      "id": "expo-pass-heated",
      "assetId": "furniture-expo-pass-heated",
      "name": "Heated Expo Pass",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-expo-pass-heated/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-expo-pass-heated/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-expo-pass-heated/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-expo-pass-heated/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "six-burner-range",
      "assetId": "furniture-six-burner-range",
      "name": "Six-Burner Range",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-six-burner-range/north.png",
          "present": true,
          "sha256": "7298d87bfda5c78ee14f2313e6f3335ff4edff16af278ebe52b964e3875f67c8"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-six-burner-range/east.png",
          "present": true,
          "sha256": "460e24edc767a6381a6aea8a253b651abb7043303a7518b07d92dd7924112dfe"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-six-burner-range/south.png",
          "present": true,
          "sha256": "6ef993128b10de31de700e003a9a3aef505cb9524c011c6a3431eedb43b788d3"
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-six-burner-range/west.png",
          "present": true,
          "sha256": "f3fcad7323bfef73e59f6baa954c91e74954e3a985ef7712a15c1d11bbfad0ea"
        }
      ],
      "present": true,
      "batchId": "furniture-pilot-001",
      "review": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/furniture-pilot-001.png",
      "qaEvidencePresent": true,
      "placement": {
        "mount": "floor",
        "occupancy": "blocking",
        "serviceAccess": "adjacent"
      },
      "placementDeclared": true,
      "sourceAccepted": true,
      "directionalSelectionBound": true,
      "runtimeCompositeAccepted": true,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "plancha-commercial",
      "assetId": "furniture-plancha-commercial",
      "name": "Commercial Plancha",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-plancha-commercial/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-plancha-commercial/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-plancha-commercial/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-plancha-commercial/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "convection-oven",
      "assetId": "furniture-convection-oven",
      "name": "Convection Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-convection-oven/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-convection-oven/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-convection-oven/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-convection-oven/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "prep-table-refrigerated",
      "assetId": "furniture-prep-table-refrigerated",
      "name": "Refrigerated Prep Table",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-prep-table-refrigerated/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-prep-table-refrigerated/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-prep-table-refrigerated/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-prep-table-refrigerated/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "walkin-rack",
      "assetId": "furniture-walkin-rack",
      "name": "Walk-In Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-walkin-rack/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-walkin-rack/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-walkin-rack/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-walkin-rack/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "dry-storage-rack",
      "assetId": "furniture-dry-storage-rack",
      "name": "Dry Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-dry-storage-rack/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-dry-storage-rack/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-dry-storage-rack/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-dry-storage-rack/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "chemical-cabinet",
      "assetId": "furniture-chemical-cabinet",
      "name": "Locked Chemical Cabinet",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-chemical-cabinet/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-chemical-cabinet/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-chemical-cabinet/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-chemical-cabinet/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "dish-machine-high-temp",
      "assetId": "furniture-dish-machine-high-temp",
      "name": "High-Temperature Dish Machine",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-dish-machine-high-temp/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-dish-machine-high-temp/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-dish-machine-high-temp/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-dish-machine-high-temp/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "three-comp-sink",
      "assetId": "furniture-three-comp-sink",
      "name": "Three-Compartment Sink",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-three-comp-sink/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-three-comp-sink/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-three-comp-sink/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-three-comp-sink/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "glass-rack-system",
      "assetId": "furniture-glass-rack-system",
      "name": "Glass Rack System",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-glass-rack-system/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-glass-rack-system/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-glass-rack-system/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-glass-rack-system/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "floor-drain",
      "assetId": "furniture-floor-drain",
      "name": "Floor Drain",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-floor-drain/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-floor-drain/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-floor-drain/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-floor-drain/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "oak-partition",
      "assetId": "furniture-oak-partition",
      "name": "Oak Dining Partition",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-oak-partition/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-oak-partition/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-oak-partition/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-oak-partition/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "large-planter",
      "assetId": "furniture-large-planter",
      "name": "Large Indoor Planter",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-large-planter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-large-planter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-large-planter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-large-planter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "wall-art-local",
      "assetId": "furniture-wall-art-local",
      "name": "Local Artist Feature",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-wall-art-local/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-wall-art-local/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-wall-art-local/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-wall-art-local/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "acoustic-panel",
      "assetId": "furniture-acoustic-panel",
      "name": "Decorative Acoustic Panel",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-acoustic-panel/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-acoustic-panel/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-acoustic-panel/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-acoustic-panel/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "pendant-light",
      "assetId": "furniture-pendant-light",
      "name": "Dining Pendant Light",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-pendant-light/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-pendant-light/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-pendant-light/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-pendant-light/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "wet-floor-station",
      "assetId": "furniture-wet-floor-station",
      "name": "Spill Response Station",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-wet-floor-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-wet-floor-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-wet-floor-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-wet-floor-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "linen-storage",
      "assetId": "furniture-linen-storage",
      "name": "Linen and Reset Cabinet",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-linen-storage/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-linen-storage/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-linen-storage/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-linen-storage/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "water-station",
      "assetId": "furniture-water-station",
      "name": "Filtered Water Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-water-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-water-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-water-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-water-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "office-desk",
      "assetId": "furniture-office-desk",
      "name": "Owner's Operations Desk",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-office-desk/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-office-desk/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-office-desk/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-office-desk/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "manager-console",
      "assetId": "furniture-manager-console",
      "name": "Live Operations Console",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-manager-console/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-manager-console/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-manager-console/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-manager-console/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-cafe-two-top",
      "assetId": "furniture-essential-cafe-two-top",
      "name": "Essential Cafe Two-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-cafe-two-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-cafe-two-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-cafe-two-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-cafe-two-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-cafe-two-top",
      "assetId": "furniture-craftsman-cafe-two-top",
      "name": "Craftsman Cafe Two-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-cafe-two-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-cafe-two-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-cafe-two-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-cafe-two-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-cafe-two-top",
      "assetId": "furniture-endurance-cafe-two-top",
      "name": "Endurance Cafe Two-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-cafe-two-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-cafe-two-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-cafe-two-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-cafe-two-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-cafe-two-top",
      "assetId": "furniture-hospitality-cafe-two-top",
      "name": "Hospitality Cafe Two-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-cafe-two-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-cafe-two-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-cafe-two-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-cafe-two-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-cafe-two-top",
      "assetId": "furniture-precision-cafe-two-top",
      "name": "Precision Cafe Two-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-cafe-two-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-cafe-two-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-cafe-two-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-cafe-two-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-cafe-two-top",
      "assetId": "furniture-reclaimed-cafe-two-top",
      "name": "Reclaimed Cafe Two-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-cafe-two-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-cafe-two-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-cafe-two-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-cafe-two-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-family-four-top",
      "assetId": "furniture-essential-family-four-top",
      "name": "Essential Family Four-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-family-four-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-family-four-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-family-four-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-family-four-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-family-four-top",
      "assetId": "furniture-craftsman-family-four-top",
      "name": "Craftsman Family Four-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-family-four-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-family-four-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-family-four-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-family-four-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-family-four-top",
      "assetId": "furniture-endurance-family-four-top",
      "name": "Endurance Family Four-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-family-four-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-family-four-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-family-four-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-family-four-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-family-four-top",
      "assetId": "furniture-hospitality-family-four-top",
      "name": "Hospitality Family Four-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-family-four-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-family-four-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-family-four-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-family-four-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-family-four-top",
      "assetId": "furniture-precision-family-four-top",
      "name": "Precision Family Four-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-family-four-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-family-four-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-family-four-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-family-four-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-family-four-top",
      "assetId": "furniture-reclaimed-family-four-top",
      "name": "Reclaimed Family Four-Top",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-family-four-top/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-family-four-top/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-family-four-top/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-family-four-top/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-communal-table",
      "assetId": "furniture-essential-communal-table",
      "name": "Essential Communal Table",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-communal-table/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-communal-table/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-communal-table/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-communal-table/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-communal-table",
      "assetId": "furniture-craftsman-communal-table",
      "name": "Craftsman Communal Table",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-communal-table/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-communal-table/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-communal-table/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-communal-table/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-communal-table",
      "assetId": "furniture-endurance-communal-table",
      "name": "Endurance Communal Table",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-communal-table/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-communal-table/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-communal-table/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-communal-table/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-communal-table",
      "assetId": "furniture-hospitality-communal-table",
      "name": "Hospitality Communal Table",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-communal-table/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-communal-table/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-communal-table/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-communal-table/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-communal-table",
      "assetId": "furniture-precision-communal-table",
      "name": "Precision Communal Table",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-communal-table/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-communal-table/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-communal-table/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-communal-table/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-communal-table",
      "assetId": "furniture-reclaimed-communal-table",
      "name": "Reclaimed Communal Table",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-communal-table/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-communal-table/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-communal-table/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-communal-table/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-dining-chair",
      "assetId": "furniture-essential-dining-chair",
      "name": "Essential Dining Chair",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dining-chair/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dining-chair/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dining-chair/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dining-chair/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-dining-chair",
      "assetId": "furniture-craftsman-dining-chair",
      "name": "Craftsman Dining Chair",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dining-chair/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dining-chair/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dining-chair/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dining-chair/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-dining-chair",
      "assetId": "furniture-endurance-dining-chair",
      "name": "Endurance Dining Chair",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dining-chair/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dining-chair/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dining-chair/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dining-chair/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-dining-chair",
      "assetId": "furniture-hospitality-dining-chair",
      "name": "Hospitality Dining Chair",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dining-chair/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dining-chair/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dining-chair/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dining-chair/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-dining-chair",
      "assetId": "furniture-precision-dining-chair",
      "name": "Precision Dining Chair",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dining-chair/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dining-chair/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dining-chair/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dining-chair/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-dining-chair",
      "assetId": "furniture-reclaimed-dining-chair",
      "name": "Reclaimed Dining Chair",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dining-chair/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dining-chair/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dining-chair/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dining-chair/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-dining-booth",
      "assetId": "furniture-essential-dining-booth",
      "name": "Essential Dining Booth",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dining-booth/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dining-booth/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dining-booth/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dining-booth/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-dining-booth",
      "assetId": "furniture-craftsman-dining-booth",
      "name": "Craftsman Dining Booth",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dining-booth/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dining-booth/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dining-booth/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dining-booth/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-dining-booth",
      "assetId": "furniture-endurance-dining-booth",
      "name": "Endurance Dining Booth",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dining-booth/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dining-booth/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dining-booth/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dining-booth/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-dining-booth",
      "assetId": "furniture-hospitality-dining-booth",
      "name": "Hospitality Dining Booth",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dining-booth/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dining-booth/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dining-booth/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dining-booth/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-dining-booth",
      "assetId": "furniture-precision-dining-booth",
      "name": "Precision Dining Booth",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dining-booth/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dining-booth/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dining-booth/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dining-booth/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-dining-booth",
      "assetId": "furniture-reclaimed-dining-booth",
      "name": "Reclaimed Dining Booth",
      "category": "Dining",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dining-booth/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dining-booth/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dining-booth/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dining-booth/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-host-podium",
      "assetId": "furniture-essential-host-podium",
      "name": "Essential Host Podium",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-host-podium/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-host-podium/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-host-podium/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-host-podium/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-host-podium",
      "assetId": "furniture-craftsman-host-podium",
      "name": "Craftsman Host Podium",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-host-podium/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-host-podium/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-host-podium/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-host-podium/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-host-podium",
      "assetId": "furniture-endurance-host-podium",
      "name": "Endurance Host Podium",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-host-podium/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-host-podium/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-host-podium/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-host-podium/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-host-podium",
      "assetId": "furniture-hospitality-host-podium",
      "name": "Hospitality Host Podium",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-host-podium/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-host-podium/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-host-podium/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-host-podium/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-host-podium",
      "assetId": "furniture-precision-host-podium",
      "name": "Precision Host Podium",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-host-podium/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-host-podium/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-host-podium/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-host-podium/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-host-podium",
      "assetId": "furniture-reclaimed-host-podium",
      "name": "Reclaimed Host Podium",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-host-podium/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-host-podium/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-host-podium/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-host-podium/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-server-console",
      "assetId": "furniture-essential-server-console",
      "name": "Essential Server Console",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-server-console/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-server-console/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-server-console/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-server-console/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-server-console",
      "assetId": "furniture-craftsman-server-console",
      "name": "Craftsman Server Console",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-server-console/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-server-console/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-server-console/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-server-console/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-server-console",
      "assetId": "furniture-endurance-server-console",
      "name": "Endurance Server Console",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-server-console/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-server-console/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-server-console/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-server-console/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-server-console",
      "assetId": "furniture-hospitality-server-console",
      "name": "Hospitality Server Console",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-server-console/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-server-console/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-server-console/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-server-console/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-server-console",
      "assetId": "furniture-precision-server-console",
      "name": "Precision Server Console",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-server-console/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-server-console/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-server-console/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-server-console/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-server-console",
      "assetId": "furniture-reclaimed-server-console",
      "name": "Reclaimed Server Console",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-server-console/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-server-console/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-server-console/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-server-console/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-beverage-station",
      "assetId": "furniture-essential-beverage-station",
      "name": "Essential Beverage Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-beverage-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-beverage-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-beverage-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-beverage-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-beverage-station",
      "assetId": "furniture-craftsman-beverage-station",
      "name": "Craftsman Beverage Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-beverage-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-beverage-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-beverage-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-beverage-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-beverage-station",
      "assetId": "furniture-endurance-beverage-station",
      "name": "Endurance Beverage Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-beverage-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-beverage-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-beverage-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-beverage-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-beverage-station",
      "assetId": "furniture-hospitality-beverage-station",
      "name": "Hospitality Beverage Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-beverage-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-beverage-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-beverage-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-beverage-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-beverage-station",
      "assetId": "furniture-precision-beverage-station",
      "name": "Precision Beverage Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-beverage-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-beverage-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-beverage-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-beverage-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-beverage-station",
      "assetId": "furniture-reclaimed-beverage-station",
      "name": "Reclaimed Beverage Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-beverage-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-beverage-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-beverage-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-beverage-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-pos-workstation",
      "assetId": "furniture-essential-pos-workstation",
      "name": "Essential POS Workstation",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-pos-workstation/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-pos-workstation/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-pos-workstation/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-pos-workstation/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-pos-workstation",
      "assetId": "furniture-craftsman-pos-workstation",
      "name": "Craftsman POS Workstation",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-pos-workstation/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-pos-workstation/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-pos-workstation/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-pos-workstation/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-pos-workstation",
      "assetId": "furniture-endurance-pos-workstation",
      "name": "Endurance POS Workstation",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-pos-workstation/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-pos-workstation/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-pos-workstation/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-pos-workstation/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-pos-workstation",
      "assetId": "furniture-hospitality-pos-workstation",
      "name": "Hospitality POS Workstation",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-pos-workstation/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-pos-workstation/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-pos-workstation/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-pos-workstation/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-pos-workstation",
      "assetId": "furniture-precision-pos-workstation",
      "name": "Precision POS Workstation",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-pos-workstation/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-pos-workstation/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-pos-workstation/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-pos-workstation/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-pos-workstation",
      "assetId": "furniture-reclaimed-pos-workstation",
      "name": "Reclaimed POS Workstation",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-pos-workstation/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-pos-workstation/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-pos-workstation/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-pos-workstation/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-bussing-station",
      "assetId": "furniture-essential-bussing-station",
      "name": "Essential Bussing Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-bussing-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-bussing-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-bussing-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-bussing-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-bussing-station",
      "assetId": "furniture-craftsman-bussing-station",
      "name": "Craftsman Bussing Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-bussing-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-bussing-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-bussing-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-bussing-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-bussing-station",
      "assetId": "furniture-endurance-bussing-station",
      "name": "Endurance Bussing Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-bussing-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-bussing-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-bussing-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-bussing-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-bussing-station",
      "assetId": "furniture-hospitality-bussing-station",
      "name": "Hospitality Bussing Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-bussing-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-bussing-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-bussing-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-bussing-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-bussing-station",
      "assetId": "furniture-precision-bussing-station",
      "name": "Precision Bussing Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-bussing-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-bussing-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-bussing-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-bussing-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-bussing-station",
      "assetId": "furniture-reclaimed-bussing-station",
      "name": "Reclaimed Bussing Station",
      "category": "Service",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-bussing-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-bussing-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-bussing-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-bussing-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-restaurant-range",
      "assetId": "furniture-essential-restaurant-range",
      "name": "Essential Restaurant Range",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-restaurant-range/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-restaurant-range/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-restaurant-range/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-restaurant-range/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-restaurant-range",
      "assetId": "furniture-craftsman-restaurant-range",
      "name": "Craftsman Restaurant Range",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-restaurant-range/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-restaurant-range/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-restaurant-range/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-restaurant-range/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-restaurant-range",
      "assetId": "furniture-endurance-restaurant-range",
      "name": "Endurance Restaurant Range",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-restaurant-range/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-restaurant-range/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-restaurant-range/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-restaurant-range/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-restaurant-range",
      "assetId": "furniture-hospitality-restaurant-range",
      "name": "Hospitality Restaurant Range",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-restaurant-range/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-restaurant-range/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-restaurant-range/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-restaurant-range/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-restaurant-range",
      "assetId": "furniture-precision-restaurant-range",
      "name": "Precision Restaurant Range",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-restaurant-range/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-restaurant-range/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-restaurant-range/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-restaurant-range/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-restaurant-range",
      "assetId": "furniture-reclaimed-restaurant-range",
      "name": "Reclaimed Restaurant Range",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-restaurant-range/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-restaurant-range/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-restaurant-range/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-restaurant-range/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-convection-oven-line",
      "assetId": "furniture-essential-convection-oven-line",
      "name": "Essential Convection Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-convection-oven-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-convection-oven-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-convection-oven-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-convection-oven-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-convection-oven-line",
      "assetId": "furniture-craftsman-convection-oven-line",
      "name": "Craftsman Convection Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-convection-oven-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-convection-oven-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-convection-oven-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-convection-oven-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-convection-oven-line",
      "assetId": "furniture-endurance-convection-oven-line",
      "name": "Endurance Convection Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-convection-oven-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-convection-oven-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-convection-oven-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-convection-oven-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-convection-oven-line",
      "assetId": "furniture-hospitality-convection-oven-line",
      "name": "Hospitality Convection Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-convection-oven-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-convection-oven-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-convection-oven-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-convection-oven-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-convection-oven-line",
      "assetId": "furniture-precision-convection-oven-line",
      "name": "Precision Convection Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-convection-oven-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-convection-oven-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-convection-oven-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-convection-oven-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-convection-oven-line",
      "assetId": "furniture-reclaimed-convection-oven-line",
      "name": "Reclaimed Convection Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-convection-oven-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-convection-oven-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-convection-oven-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-convection-oven-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-plancha-griddle",
      "assetId": "furniture-essential-plancha-griddle",
      "name": "Essential Plancha Griddle",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-plancha-griddle/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-plancha-griddle/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-plancha-griddle/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-plancha-griddle/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-plancha-griddle",
      "assetId": "furniture-craftsman-plancha-griddle",
      "name": "Craftsman Plancha Griddle",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-plancha-griddle/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-plancha-griddle/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-plancha-griddle/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-plancha-griddle/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-plancha-griddle",
      "assetId": "furniture-endurance-plancha-griddle",
      "name": "Endurance Plancha Griddle",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-plancha-griddle/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-plancha-griddle/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-plancha-griddle/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-plancha-griddle/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-plancha-griddle",
      "assetId": "furniture-hospitality-plancha-griddle",
      "name": "Hospitality Plancha Griddle",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-plancha-griddle/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-plancha-griddle/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-plancha-griddle/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-plancha-griddle/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-plancha-griddle",
      "assetId": "furniture-precision-plancha-griddle",
      "name": "Precision Plancha Griddle",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-plancha-griddle/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-plancha-griddle/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-plancha-griddle/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-plancha-griddle/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-plancha-griddle",
      "assetId": "furniture-reclaimed-plancha-griddle",
      "name": "Reclaimed Plancha Griddle",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-plancha-griddle/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-plancha-griddle/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-plancha-griddle/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-plancha-griddle/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-fry-station",
      "assetId": "furniture-essential-fry-station",
      "name": "Essential Fry Station",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-fry-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-fry-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-fry-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-fry-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-fry-station",
      "assetId": "furniture-craftsman-fry-station",
      "name": "Craftsman Fry Station",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-fry-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-fry-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-fry-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-fry-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-fry-station",
      "assetId": "furniture-endurance-fry-station",
      "name": "Endurance Fry Station",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-fry-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-fry-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-fry-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-fry-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-fry-station",
      "assetId": "furniture-hospitality-fry-station",
      "name": "Hospitality Fry Station",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-fry-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-fry-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-fry-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-fry-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-fry-station",
      "assetId": "furniture-precision-fry-station",
      "name": "Precision Fry Station",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-fry-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-fry-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-fry-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-fry-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-fry-station",
      "assetId": "furniture-reclaimed-fry-station",
      "name": "Reclaimed Fry Station",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-fry-station/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-fry-station/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-fry-station/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-fry-station/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-prep-counter",
      "assetId": "furniture-essential-prep-counter",
      "name": "Essential Prep Counter",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-prep-counter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-prep-counter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-prep-counter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-prep-counter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-prep-counter",
      "assetId": "furniture-craftsman-prep-counter",
      "name": "Craftsman Prep Counter",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-prep-counter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-prep-counter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-prep-counter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-prep-counter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-prep-counter",
      "assetId": "furniture-endurance-prep-counter",
      "name": "Endurance Prep Counter",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-prep-counter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-prep-counter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-prep-counter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-prep-counter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-prep-counter",
      "assetId": "furniture-hospitality-prep-counter",
      "name": "Hospitality Prep Counter",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-prep-counter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-prep-counter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-prep-counter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-prep-counter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-prep-counter",
      "assetId": "furniture-precision-prep-counter",
      "name": "Precision Prep Counter",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-prep-counter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-prep-counter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-prep-counter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-prep-counter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-prep-counter",
      "assetId": "furniture-reclaimed-prep-counter",
      "name": "Reclaimed Prep Counter",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-prep-counter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-prep-counter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-prep-counter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-prep-counter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-expo-pass",
      "assetId": "furniture-essential-expo-pass",
      "name": "Essential Expo Pass",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-expo-pass/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-expo-pass/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-expo-pass/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-expo-pass/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-expo-pass",
      "assetId": "furniture-craftsman-expo-pass",
      "name": "Craftsman Expo Pass",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-expo-pass/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-expo-pass/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-expo-pass/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-expo-pass/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-expo-pass",
      "assetId": "furniture-endurance-expo-pass",
      "name": "Endurance Expo Pass",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-expo-pass/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-expo-pass/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-expo-pass/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-expo-pass/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-expo-pass",
      "assetId": "furniture-hospitality-expo-pass",
      "name": "Hospitality Expo Pass",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-expo-pass/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-expo-pass/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-expo-pass/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-expo-pass/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-expo-pass",
      "assetId": "furniture-precision-expo-pass",
      "name": "Precision Expo Pass",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-expo-pass/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-expo-pass/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-expo-pass/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-expo-pass/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-expo-pass",
      "assetId": "furniture-reclaimed-expo-pass",
      "name": "Reclaimed Expo Pass",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-expo-pass/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-expo-pass/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-expo-pass/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-expo-pass/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-combi-oven",
      "assetId": "furniture-essential-combi-oven",
      "name": "Essential Combi Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-combi-oven/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-combi-oven/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-combi-oven/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-combi-oven/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-combi-oven",
      "assetId": "furniture-craftsman-combi-oven",
      "name": "Craftsman Combi Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-combi-oven/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-combi-oven/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-combi-oven/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-combi-oven/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-combi-oven",
      "assetId": "furniture-endurance-combi-oven",
      "name": "Endurance Combi Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-combi-oven/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-combi-oven/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-combi-oven/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-combi-oven/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-combi-oven",
      "assetId": "furniture-hospitality-combi-oven",
      "name": "Hospitality Combi Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-combi-oven/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-combi-oven/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-combi-oven/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-combi-oven/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-combi-oven",
      "assetId": "furniture-precision-combi-oven",
      "name": "Precision Combi Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-combi-oven/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-combi-oven/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-combi-oven/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-combi-oven/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-combi-oven",
      "assetId": "furniture-reclaimed-combi-oven",
      "name": "Reclaimed Combi Oven",
      "category": "Kitchen",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-combi-oven/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-combi-oven/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-combi-oven/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-combi-oven/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-dish-machine",
      "assetId": "furniture-essential-dish-machine",
      "name": "Essential Dish Machine",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dish-machine/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dish-machine/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dish-machine/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dish-machine/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-dish-machine",
      "assetId": "furniture-craftsman-dish-machine",
      "name": "Craftsman Dish Machine",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dish-machine/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dish-machine/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dish-machine/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dish-machine/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-dish-machine",
      "assetId": "furniture-endurance-dish-machine",
      "name": "Endurance Dish Machine",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dish-machine/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dish-machine/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dish-machine/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dish-machine/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-dish-machine",
      "assetId": "furniture-hospitality-dish-machine",
      "name": "Hospitality Dish Machine",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dish-machine/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dish-machine/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dish-machine/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dish-machine/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-dish-machine",
      "assetId": "furniture-precision-dish-machine",
      "name": "Precision Dish Machine",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dish-machine/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dish-machine/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dish-machine/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dish-machine/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-dish-machine",
      "assetId": "furniture-reclaimed-dish-machine",
      "name": "Reclaimed Dish Machine",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dish-machine/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dish-machine/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dish-machine/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dish-machine/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-pot-wash-sink",
      "assetId": "furniture-essential-pot-wash-sink",
      "name": "Essential Pot-Wash Sink",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-pot-wash-sink/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-pot-wash-sink/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-pot-wash-sink/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-pot-wash-sink/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-pot-wash-sink",
      "assetId": "furniture-craftsman-pot-wash-sink",
      "name": "Craftsman Pot-Wash Sink",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-pot-wash-sink/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-pot-wash-sink/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-pot-wash-sink/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-pot-wash-sink/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-pot-wash-sink",
      "assetId": "furniture-endurance-pot-wash-sink",
      "name": "Endurance Pot-Wash Sink",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-pot-wash-sink/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-pot-wash-sink/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-pot-wash-sink/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-pot-wash-sink/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-pot-wash-sink",
      "assetId": "furniture-hospitality-pot-wash-sink",
      "name": "Hospitality Pot-Wash Sink",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-pot-wash-sink/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-pot-wash-sink/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-pot-wash-sink/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-pot-wash-sink/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-pot-wash-sink",
      "assetId": "furniture-precision-pot-wash-sink",
      "name": "Precision Pot-Wash Sink",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-pot-wash-sink/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-pot-wash-sink/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-pot-wash-sink/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-pot-wash-sink/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-pot-wash-sink",
      "assetId": "furniture-reclaimed-pot-wash-sink",
      "name": "Reclaimed Pot-Wash Sink",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-pot-wash-sink/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-pot-wash-sink/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-pot-wash-sink/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-pot-wash-sink/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-mop-basin",
      "assetId": "furniture-essential-mop-basin",
      "name": "Essential Mop Basin",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-mop-basin/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-mop-basin/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-mop-basin/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-mop-basin/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-mop-basin",
      "assetId": "furniture-craftsman-mop-basin",
      "name": "Craftsman Mop Basin",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-mop-basin/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-mop-basin/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-mop-basin/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-mop-basin/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-mop-basin",
      "assetId": "furniture-endurance-mop-basin",
      "name": "Endurance Mop Basin",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-mop-basin/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-mop-basin/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-mop-basin/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-mop-basin/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-mop-basin",
      "assetId": "furniture-hospitality-mop-basin",
      "name": "Hospitality Mop Basin",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-mop-basin/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-mop-basin/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-mop-basin/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-mop-basin/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-mop-basin",
      "assetId": "furniture-precision-mop-basin",
      "name": "Precision Mop Basin",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-mop-basin/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-mop-basin/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-mop-basin/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-mop-basin/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-mop-basin",
      "assetId": "furniture-reclaimed-mop-basin",
      "name": "Reclaimed Mop Basin",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-mop-basin/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-mop-basin/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-mop-basin/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-mop-basin/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-waste-sorter",
      "assetId": "furniture-essential-waste-sorter",
      "name": "Essential Waste Sorter",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-waste-sorter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-waste-sorter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-waste-sorter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-waste-sorter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-waste-sorter",
      "assetId": "furniture-craftsman-waste-sorter",
      "name": "Craftsman Waste Sorter",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-waste-sorter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-waste-sorter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-waste-sorter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-waste-sorter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-waste-sorter",
      "assetId": "furniture-endurance-waste-sorter",
      "name": "Endurance Waste Sorter",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-waste-sorter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-waste-sorter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-waste-sorter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-waste-sorter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-waste-sorter",
      "assetId": "furniture-hospitality-waste-sorter",
      "name": "Hospitality Waste Sorter",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-waste-sorter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-waste-sorter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-waste-sorter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-waste-sorter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-waste-sorter",
      "assetId": "furniture-precision-waste-sorter",
      "name": "Precision Waste Sorter",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-waste-sorter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-waste-sorter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-waste-sorter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-waste-sorter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-waste-sorter",
      "assetId": "furniture-reclaimed-waste-sorter",
      "name": "Reclaimed Waste Sorter",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-waste-sorter/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-waste-sorter/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-waste-sorter/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-waste-sorter/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-spill-cart",
      "assetId": "furniture-essential-spill-cart",
      "name": "Essential Spill Cart",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-spill-cart/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-spill-cart/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-spill-cart/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-spill-cart/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-spill-cart",
      "assetId": "furniture-craftsman-spill-cart",
      "name": "Craftsman Spill Cart",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-spill-cart/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-spill-cart/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-spill-cart/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-spill-cart/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-spill-cart",
      "assetId": "furniture-endurance-spill-cart",
      "name": "Endurance Spill Cart",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-spill-cart/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-spill-cart/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-spill-cart/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-spill-cart/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-spill-cart",
      "assetId": "furniture-hospitality-spill-cart",
      "name": "Hospitality Spill Cart",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-spill-cart/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-spill-cart/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-spill-cart/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-spill-cart/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-spill-cart",
      "assetId": "furniture-precision-spill-cart",
      "name": "Precision Spill Cart",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-spill-cart/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-spill-cart/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-spill-cart/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-spill-cart/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-spill-cart",
      "assetId": "furniture-reclaimed-spill-cart",
      "name": "Reclaimed Spill Cart",
      "category": "Utility",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-spill-cart/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-spill-cart/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-spill-cart/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-spill-cart/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-dry-rack-line",
      "assetId": "furniture-essential-dry-rack-line",
      "name": "Essential Dry Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dry-rack-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dry-rack-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dry-rack-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-dry-rack-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-dry-rack-line",
      "assetId": "furniture-craftsman-dry-rack-line",
      "name": "Craftsman Dry Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dry-rack-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dry-rack-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dry-rack-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-dry-rack-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-dry-rack-line",
      "assetId": "furniture-endurance-dry-rack-line",
      "name": "Endurance Dry Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dry-rack-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dry-rack-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dry-rack-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-dry-rack-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-dry-rack-line",
      "assetId": "furniture-hospitality-dry-rack-line",
      "name": "Hospitality Dry Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dry-rack-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dry-rack-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dry-rack-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-dry-rack-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-dry-rack-line",
      "assetId": "furniture-precision-dry-rack-line",
      "name": "Precision Dry Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dry-rack-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dry-rack-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dry-rack-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-dry-rack-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-dry-rack-line",
      "assetId": "furniture-reclaimed-dry-rack-line",
      "name": "Reclaimed Dry Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dry-rack-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dry-rack-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dry-rack-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-dry-rack-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-cold-rack",
      "assetId": "furniture-essential-cold-rack",
      "name": "Essential Cold Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-cold-rack/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-cold-rack/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-cold-rack/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-cold-rack/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-cold-rack",
      "assetId": "furniture-craftsman-cold-rack",
      "name": "Craftsman Cold Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-cold-rack/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-cold-rack/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-cold-rack/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-cold-rack/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-cold-rack",
      "assetId": "furniture-endurance-cold-rack",
      "name": "Endurance Cold Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-cold-rack/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-cold-rack/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-cold-rack/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-cold-rack/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-cold-rack",
      "assetId": "furniture-hospitality-cold-rack",
      "name": "Hospitality Cold Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-cold-rack/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-cold-rack/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-cold-rack/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-cold-rack/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-cold-rack",
      "assetId": "furniture-precision-cold-rack",
      "name": "Precision Cold Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-cold-rack/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-cold-rack/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-cold-rack/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-cold-rack/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-cold-rack",
      "assetId": "furniture-reclaimed-cold-rack",
      "name": "Reclaimed Cold Storage Rack",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-cold-rack/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-cold-rack/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-cold-rack/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-cold-rack/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-linen-cabinet",
      "assetId": "furniture-essential-linen-cabinet",
      "name": "Essential Linen Cabinet",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-linen-cabinet/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-linen-cabinet/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-linen-cabinet/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-linen-cabinet/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-linen-cabinet",
      "assetId": "furniture-craftsman-linen-cabinet",
      "name": "Craftsman Linen Cabinet",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-linen-cabinet/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-linen-cabinet/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-linen-cabinet/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-linen-cabinet/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-linen-cabinet",
      "assetId": "furniture-endurance-linen-cabinet",
      "name": "Endurance Linen Cabinet",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-linen-cabinet/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-linen-cabinet/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-linen-cabinet/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-linen-cabinet/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-linen-cabinet",
      "assetId": "furniture-hospitality-linen-cabinet",
      "name": "Hospitality Linen Cabinet",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-linen-cabinet/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-linen-cabinet/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-linen-cabinet/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-linen-cabinet/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-linen-cabinet",
      "assetId": "furniture-precision-linen-cabinet",
      "name": "Precision Linen Cabinet",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-linen-cabinet/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-linen-cabinet/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-linen-cabinet/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-linen-cabinet/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-linen-cabinet",
      "assetId": "furniture-reclaimed-linen-cabinet",
      "name": "Reclaimed Linen Cabinet",
      "category": "Storage",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-linen-cabinet/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-linen-cabinet/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-linen-cabinet/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-linen-cabinet/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-room-divider",
      "assetId": "furniture-essential-room-divider",
      "name": "Essential Room Divider",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-room-divider/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-room-divider/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-room-divider/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-room-divider/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-room-divider",
      "assetId": "furniture-craftsman-room-divider",
      "name": "Craftsman Room Divider",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-room-divider/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-room-divider/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-room-divider/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-room-divider/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-room-divider",
      "assetId": "furniture-endurance-room-divider",
      "name": "Endurance Room Divider",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-room-divider/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-room-divider/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-room-divider/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-room-divider/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-room-divider",
      "assetId": "furniture-hospitality-room-divider",
      "name": "Hospitality Room Divider",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-room-divider/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-room-divider/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-room-divider/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-room-divider/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-room-divider",
      "assetId": "furniture-precision-room-divider",
      "name": "Precision Room Divider",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-room-divider/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-room-divider/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-room-divider/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-room-divider/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-room-divider",
      "assetId": "furniture-reclaimed-room-divider",
      "name": "Reclaimed Room Divider",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-room-divider/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-room-divider/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-room-divider/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-room-divider/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-planter-feature",
      "assetId": "furniture-essential-planter-feature",
      "name": "Essential Planter Feature",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-planter-feature/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-planter-feature/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-planter-feature/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-planter-feature/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-planter-feature",
      "assetId": "furniture-craftsman-planter-feature",
      "name": "Craftsman Planter Feature",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-planter-feature/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-planter-feature/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-planter-feature/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-planter-feature/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-planter-feature",
      "assetId": "furniture-endurance-planter-feature",
      "name": "Endurance Planter Feature",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-planter-feature/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-planter-feature/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-planter-feature/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-planter-feature/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-planter-feature",
      "assetId": "furniture-hospitality-planter-feature",
      "name": "Hospitality Planter Feature",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-planter-feature/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-planter-feature/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-planter-feature/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-planter-feature/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-planter-feature",
      "assetId": "furniture-precision-planter-feature",
      "name": "Precision Planter Feature",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-planter-feature/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-planter-feature/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-planter-feature/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-planter-feature/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-planter-feature",
      "assetId": "furniture-reclaimed-planter-feature",
      "name": "Reclaimed Planter Feature",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-planter-feature/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-planter-feature/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-planter-feature/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-planter-feature/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-acoustic-light",
      "assetId": "furniture-essential-acoustic-light",
      "name": "Essential Acoustic Light",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-acoustic-light/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-acoustic-light/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-acoustic-light/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-acoustic-light/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-acoustic-light",
      "assetId": "furniture-craftsman-acoustic-light",
      "name": "Craftsman Acoustic Light",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-acoustic-light/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-acoustic-light/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-acoustic-light/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-acoustic-light/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-acoustic-light",
      "assetId": "furniture-endurance-acoustic-light",
      "name": "Endurance Acoustic Light",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-acoustic-light/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-acoustic-light/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-acoustic-light/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-acoustic-light/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-acoustic-light",
      "assetId": "furniture-hospitality-acoustic-light",
      "name": "Hospitality Acoustic Light",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-acoustic-light/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-acoustic-light/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-acoustic-light/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-acoustic-light/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-acoustic-light",
      "assetId": "furniture-precision-acoustic-light",
      "name": "Precision Acoustic Light",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-acoustic-light/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-acoustic-light/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-acoustic-light/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-acoustic-light/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-acoustic-light",
      "assetId": "furniture-reclaimed-acoustic-light",
      "name": "Reclaimed Acoustic Light",
      "category": "Decor",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-acoustic-light/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-acoustic-light/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-acoustic-light/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-acoustic-light/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-manager-desk-line",
      "assetId": "furniture-essential-manager-desk-line",
      "name": "Essential Manager Desk",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-manager-desk-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-manager-desk-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-manager-desk-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-manager-desk-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-manager-desk-line",
      "assetId": "furniture-craftsman-manager-desk-line",
      "name": "Craftsman Manager Desk",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-manager-desk-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-manager-desk-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-manager-desk-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-manager-desk-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-manager-desk-line",
      "assetId": "furniture-endurance-manager-desk-line",
      "name": "Endurance Manager Desk",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-manager-desk-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-manager-desk-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-manager-desk-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-manager-desk-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-manager-desk-line",
      "assetId": "furniture-hospitality-manager-desk-line",
      "name": "Hospitality Manager Desk",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-manager-desk-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-manager-desk-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-manager-desk-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-manager-desk-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-manager-desk-line",
      "assetId": "furniture-precision-manager-desk-line",
      "name": "Precision Manager Desk",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-manager-desk-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-manager-desk-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-manager-desk-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-manager-desk-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-manager-desk-line",
      "assetId": "furniture-reclaimed-manager-desk-line",
      "name": "Reclaimed Manager Desk",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-manager-desk-line/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-manager-desk-line/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-manager-desk-line/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-manager-desk-line/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "essential-scheduling-board",
      "assetId": "furniture-essential-scheduling-board",
      "name": "Essential Scheduling Board",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-scheduling-board/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-scheduling-board/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-scheduling-board/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-essential-scheduling-board/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "craftsman-scheduling-board",
      "assetId": "furniture-craftsman-scheduling-board",
      "name": "Craftsman Scheduling Board",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-scheduling-board/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-scheduling-board/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-scheduling-board/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-craftsman-scheduling-board/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "endurance-scheduling-board",
      "assetId": "furniture-endurance-scheduling-board",
      "name": "Endurance Scheduling Board",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-scheduling-board/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-scheduling-board/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-scheduling-board/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-endurance-scheduling-board/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "hospitality-scheduling-board",
      "assetId": "furniture-hospitality-scheduling-board",
      "name": "Hospitality Scheduling Board",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-scheduling-board/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-scheduling-board/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-scheduling-board/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-hospitality-scheduling-board/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "precision-scheduling-board",
      "assetId": "furniture-precision-scheduling-board",
      "name": "Precision Scheduling Board",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-scheduling-board/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-scheduling-board/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-scheduling-board/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-precision-scheduling-board/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "reclaimed-scheduling-board",
      "assetId": "furniture-reclaimed-scheduling-board",
      "name": "Reclaimed Scheduling Board",
      "category": "Office",
      "sourcePack": "core-hospitality",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-scheduling-board/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-scheduling-board/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-scheduling-board/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/furniture-reclaimed-scheduling-board/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "summer-patio-two",
      "assetId": "summer-patio-two",
      "name": "Tomato Patio Two-Top",
      "category": "Dining",
      "sourcePack": "summer-street-fair",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/summer-patio-two/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/summer-patio-two/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/summer-patio-two/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/summer-patio-two/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "summer-lemonade",
      "assetId": "summer-lemonade",
      "name": "Street-Fair Drinks Cart",
      "category": "Service",
      "sourcePack": "summer-street-fair",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/summer-lemonade/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/summer-lemonade/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/summer-lemonade/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/summer-lemonade/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    },
    {
      "id": "summer-canopy",
      "assetId": "summer-canopy",
      "name": "Mustard Market Canopy",
      "category": "Decor",
      "sourcePack": "summer-street-fair",
      "requiredDirections": [
        "north",
        "east",
        "south",
        "west"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/objects/directional/summer-canopy/north.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/summer-canopy/east.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/summer-canopy/south.png",
          "present": false,
          "sha256": null
        },
        {
          "path": "apps/client-godot/assets/objects/directional/summer-canopy/west.png",
          "present": false,
          "sha256": null
        }
      ],
      "present": false,
      "batchId": null,
      "review": "unreviewed",
      "runtimeQa": "not-reviewed",
      "remoteVerified": false,
      "qaEvidence": null,
      "qaEvidencePresent": false,
      "placement": null,
      "placementDeclared": false,
      "sourceAccepted": false,
      "directionalSelectionBound": false,
      "runtimeCompositeAccepted": false,
      "runtimeCompositeBlocked": false,
      "runtimeCompositePending": false,
      "runtimeBound": false,
      "productionComplete": false,
      "status": "missing"
    }
  ],
  "equipmentIcons": [
    {
      "id": "economy-nonslip-shoes",
      "name": "Economy Nonslip Shoes",
      "kind": "equipment",
      "roles": [
        "manager",
        "owner",
        "server",
        "dishwasher",
        "chef",
        "cook",
        "host-busser"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-shared-economy-nonslip-shoes.png",
          "present": true,
          "sha256": "19085b0b94220e310b84a4ea1d2e85aee736d2a67435affe1e585ad35957ab69"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-shared-manager-001",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "compression-service-shoes",
      "name": "Compression Service Shoes",
      "kind": "equipment",
      "roles": [
        "manager",
        "owner",
        "server",
        "dishwasher",
        "chef",
        "cook",
        "host-busser"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-shared-compression-service-shoes.png",
          "present": true,
          "sha256": "56d7f5a838a412dbc76458206111ef78244bfebc95de3f5960685a7a211da906"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-shared-manager-001",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "magnetic-pocket-flashlight",
      "name": "Magnetic Pocket Flashlight",
      "kind": "equipment",
      "roles": [
        "manager",
        "owner",
        "server",
        "dishwasher",
        "chef",
        "cook",
        "host-busser"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-shared-magnetic-pocket-flashlight.png",
          "present": true,
          "sha256": "67f655abe4a576309b336956fd3b6bfdfc4f0c377b86138bce7845d6fcb2c1c4"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-shared-manager-001",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "manager-service-clipboard",
      "name": "Service Grid Clipboard",
      "kind": "equipment",
      "roles": [
        "manager"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-manager-service-grid-clipboard.png",
          "present": true,
          "sha256": "34cd52e77abbabb83bc9d74b0c62bccf38e7732647853a2f9122a53ebc4a71e1"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-shared-manager-001",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "manager-radio-headset",
      "name": "Single-Ear Floor Radio",
      "kind": "equipment",
      "roles": [
        "manager"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-manager-single-ear-floor-radio.png",
          "present": true,
          "sha256": "4f3eb1a3f230b81772b7d3724b03857f9e3c988027a2f71a0f6f18ab372f3862"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-shared-manager-001",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "manager-floor-plan-folio",
      "name": "Floor Plan Folio",
      "kind": "equipment",
      "roles": [
        "manager"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-manager-floor-plan-folio.png",
          "present": true,
          "sha256": "7bc1d0c8bc9e7318e342772a0135eb2ed98b5671a9c4a8e163cd1dc75c9b5226"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-shared-manager-001",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "manager-recovery-cards",
      "name": "Service Recovery Cards",
      "kind": "equipment",
      "roles": [
        "manager"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-manager-service-recovery-cards.png",
          "present": true,
          "sha256": "5ba08d3e287685633c058bdb6c278a20c7f96cd06e102d4c06a6018a4fbea266"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-shared-manager-001",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "manager-morale-candy-tin",
      "name": "Morale Candy Tin",
      "kind": "consumable",
      "roles": [
        "manager"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-manager-morale-candy-tin.png",
          "present": true,
          "sha256": "f44512d4e194adf5aec40346ad0be93723f3ab6adcd1635fe44dfa9475eff2ce"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-shared-manager-001",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "manager-incident-seal-kit",
      "name": "Incident Seal Kit",
      "kind": "consumable",
      "roles": [
        "manager"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-manager-incident-seal-kit.png",
          "present": true,
          "sha256": "3a607cb861a42bb30f2bfbde0226d5be2c9b85a8ca7159c3a376b16375b17cf9"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-owner-server-002",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "owner-leather-ledger",
      "name": "House Leather Ledger",
      "kind": "equipment",
      "roles": [
        "owner"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-owner-house-leather-ledger.png",
          "present": true,
          "sha256": "40d3b20a2a24d382236c552b187802771d1e06fe745f988c52804d9beaa792a3"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-owner-server-002",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "owner-operations-tablet",
      "name": "Operations Tablet",
      "kind": "equipment",
      "roles": [
        "owner"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-owner-operations-tablet.png",
          "present": true,
          "sha256": "2d23dd64eb1cd9bcf62cdc0f0d01887515990b32b5a11ea57eb11d286ff0263f"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-owner-server-002",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "owner-lease-calculator",
      "name": "Lease Scenario Calculator",
      "kind": "equipment",
      "roles": [
        "owner"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-owner-lease-scenario-calculator.png",
          "present": true,
          "sha256": "125d69f59ab9f60c8b89ca1149eac4bf1e581d23b0306c28a6065c198c0f8bec"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-owner-server-002",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "owner-tasting-notebook",
      "name": "Concept Tasting Notebook",
      "kind": "equipment",
      "roles": [
        "owner"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-owner-concept-tasting-notebook.png",
          "present": true,
          "sha256": "b8047276996dc00b4e3c0b7c480dd8cc2e3ff242f364caa1321a9eb4503dd5a4"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-owner-server-002",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "owner-networking-cards",
      "name": "Letterpress Networking Cards",
      "kind": "consumable",
      "roles": [
        "owner"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-owner-letterpress-networking-cards.png",
          "present": true,
          "sha256": "806bc291c8d74a404a59cacb5e645070b0196a04e2495691b2b282f1d9d5899f"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-owner-server-002",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "owner-market-scout-pass",
      "name": "Local Market Scout Pass",
      "kind": "consumable",
      "roles": [
        "owner"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-owner-local-market-scout-pass.png",
          "present": true,
          "sha256": "6932f89e63dda4ea3df5efa4e3e093ec77faee229833c298cb40425c60b96902"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-owner-server-002",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "server-click-pen",
      "name": "Balanced Service Pen",
      "kind": "equipment",
      "roles": [
        "server"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-server-balanced-service-pen.png",
          "present": true,
          "sha256": "25641232bc12ec8cef64fe794af3d58631aaaf34aca34c197affc91309b0a278"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-owner-server-002",
      "review": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "server-waterproof-order-pad",
      "name": "Waterproof Order Pad",
      "kind": "equipment",
      "roles": [
        "server"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-server-waterproof-order-pad.png",
          "present": true,
          "sha256": "b30e478815b774e489256d06d5ff2e04cba119b8d21cb9b3dcecfac0ae199338"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-server-dish-003",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "server-waiters-corkscrew",
      "name": "Double-Hinge Waiter's Corkscrew",
      "kind": "equipment",
      "roles": [
        "server"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-server-double-hinge-corkscrew.png",
          "present": true,
          "sha256": "0a55e0705d726c7193644684f870080aaba4544b91cc26e6c702e22bb4853ed5"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-server-dish-003",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "server-cork-tray",
      "name": "High-Grip Cork Tray",
      "kind": "equipment",
      "roles": [
        "server"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-server-high-grip-cork-tray.png",
          "present": true,
          "sha256": "170a12efed157285234d2db2cbae04c11705a8562226cc8e1f36722410cd97a1"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-server-dish-003",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "server-palate-mints",
      "name": "Unscented Palate Mints",
      "kind": "consumable",
      "roles": [
        "server"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-server-unscented-palate-mints.png",
          "present": true,
          "sha256": "6323f47afcff7ac1dd54a36005283ae9d7800a45306c79e37f5eb2f7d2035797"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-server-dish-003",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "server-stain-rescue-pen",
      "name": "Tablecloth Rescue Pen",
      "kind": "consumable",
      "roles": [
        "server"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-server-tablecloth-rescue-pen.png",
          "present": true,
          "sha256": "f6b75ea619c8f7cdd3844ff308b54a3dcfd5148c663021f3fa7c0b4ce79bcd0a"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-server-dish-003",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "dish-high-pressure-nozzle",
      "name": "Focused Pre-Rinse Nozzle",
      "kind": "equipment",
      "roles": [
        "dishwasher"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-dish-focused-pre-rinse-nozzle.png",
          "present": true,
          "sha256": "1975869aae276527b0496b56ede3ad12a66b56dcdeacbdd331772fedd5827cbe"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-server-dish-003",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "dish-silicone-rack-hook",
      "name": "Silicone Rack Hook",
      "kind": "equipment",
      "roles": [
        "dishwasher"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-dish-silicone-rack-hook.png",
          "present": true,
          "sha256": "7cc09e53b1e2988e8209bc9cbe67226f85157f0537f24c5b79ce6686b92f9fed"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-server-dish-003",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "dish-digital-test-reader",
      "name": "Digital Sanitizer Test Reader",
      "kind": "equipment",
      "roles": [
        "dishwasher"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-dish-digital-sanitizer-test-reader.png",
          "present": true,
          "sha256": "8fc81d4560511d34b25d94e7977eff232f5544b2f156a6c6afd0e8c8d9f4e8e9"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-server-dish-003",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "dish-steam-gauntlets",
      "name": "Steam-Shell Gauntlets",
      "kind": "equipment",
      "roles": [
        "dishwasher"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-dish-steam-shell-gauntlets.png",
          "present": true,
          "sha256": "288ff1897ad3b052ee2b00257d4244e6715a36e4acedce21eae0c0faca005970"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-dish-chef-004",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "dish-enzymatic-detergent",
      "name": "Enzymatic Detergent Dose",
      "kind": "consumable",
      "roles": [
        "dishwasher"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-dish-enzymatic-detergent-dose.png",
          "present": true,
          "sha256": "647e8adbc1b486e9da93d5f66e3088f98f5d5c16dd8b1756af4051df5b0ada2d"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-dish-chef-004",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "dish-deliming-pouch",
      "name": "Quick Deliming Pouch",
      "kind": "consumable",
      "roles": [
        "dishwasher"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-dish-quick-deliming-pouch.png",
          "present": true,
          "sha256": "f6bf31fd1e80323f3790ce3ee91cd227ae2a0da5ac9ad2566e7f3c0810793ae3"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-dish-chef-004",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "chef-forged-knife",
      "name": "Forged Eight-Inch Chef Knife",
      "kind": "equipment",
      "roles": [
        "chef"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-chef-forged-eight-inch-knife.png",
          "present": true,
          "sha256": "0fbe164fac85773629382c06a2b4ee6dffa564e45cd5875e0c7584ed8f66a137"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-dish-chef-004",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "chef-folding-thermometer",
      "name": "Fast-Read Folding Thermometer",
      "kind": "equipment",
      "roles": [
        "chef"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-chef-fast-read-folding-thermometer.png",
          "present": true,
          "sha256": "2f0ce609519ffe2af9c51cedf3e48bfe094835b333f28b6990a2ed0cc3ff0bb3"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-dish-chef-004",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "chef-plating-tweezers",
      "name": "Offset Plating Tweezers",
      "kind": "equipment",
      "roles": [
        "chef"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-chef-offset-plating-tweezers.png",
          "present": true,
          "sha256": "617ab3a4e356b1885f3044291eec59d71e0ffca71ac8de0cecd23e2d31ad3c4f"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-dish-chef-004",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "chef-tasting-spoon-wallet",
      "name": "Tasting Spoon Wallet",
      "kind": "equipment",
      "roles": [
        "chef"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-chef-tasting-spoon-wallet.png",
          "present": true,
          "sha256": "3df934e161f6ce480bc20e2850688e00a356e0a5e442c56a373954bce4583d35"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-dish-chef-004",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "chef-diamond-sharpening-strip",
      "name": "Diamond Sharpening Strip",
      "kind": "consumable",
      "roles": [
        "chef"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-chef-diamond-sharpening-strip.png",
          "present": true,
          "sha256": "72d7a77ad63446098014da58dfa2ef3bf02f60ca53302b7efe04113b39d6a300"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-dish-chef-004",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "chef-palate-rinse",
      "name": "Neutral Palate Rinse",
      "kind": "consumable",
      "roles": [
        "chef"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-chef-neutral-palate-rinse.png",
          "present": true,
          "sha256": "a4d2c9c77a6c5fba89c3afbc898602b8b65fa00726acef4d2a15eaf864c34249"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-chef-cook-host-005",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "cook-fish-turner",
      "name": "Flexible Fish Turner",
      "kind": "equipment",
      "roles": [
        "cook"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-cook-flexible-fish-turner.png",
          "present": true,
          "sha256": "51e24b8dbf782c0c5e41eeac67505f1b3cac5e226754fc38a7467bfbb34e286f"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-chef-cook-host-005",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "cook-four-channel-timer",
      "name": "Four-Channel Station Timer",
      "kind": "equipment",
      "roles": [
        "cook"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-cook-four-channel-station-timer.png",
          "present": true,
          "sha256": "b40a79d11508d3fcc86fdc7ce1c1ef826bf936f8a5d10277cbbce1613ad49eb6"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-chef-cook-host-005",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "cook-bottle-holster",
      "name": "Color-Coded Bottle Holster",
      "kind": "equipment",
      "roles": [
        "cook"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-cook-color-coded-bottle-holster.png",
          "present": true,
          "sha256": "0e3533394cccd33c8fce3bfd2cb9836d938364cb42ba5993e5a93f1d8d74c8e6"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-chef-cook-host-005",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "cook-chainmail-cut-glove",
      "name": "Fine-Mesh Cut Glove",
      "kind": "equipment",
      "roles": [
        "cook"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-cook-fine-mesh-cut-glove.png",
          "present": true,
          "sha256": "f6b32043e69aa42448c341e54a6a97f5c27d1def69bed276f268c08f8d267c43"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-chef-cook-host-005",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "cook-pan-seasoning-wipe",
      "name": "Pan Seasoning Wipe",
      "kind": "consumable",
      "roles": [
        "cook"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-cook-pan-seasoning-wipe.png",
          "present": true,
          "sha256": "8d6ecbb91fbc0eb2652e15d85c398a0a1e01c9bb9b6f19dbaae661b44c9da8ff"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-chef-cook-host-005",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "cook-burn-gel-sachet",
      "name": "Kitchen Burn Gel Sachet",
      "kind": "consumable",
      "roles": [
        "cook"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-cook-kitchen-burn-gel-sachet.png",
          "present": true,
          "sha256": "4eaa169272b0691c47ec977e1f13aff1f9bb543ec3a04f94a7128ca0aa73d9eb"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-chef-cook-host-005",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "host-reservation-book",
      "name": "Tabbed Reservation Book",
      "kind": "equipment",
      "roles": [
        "host-busser"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-host-tabbed-reservation-book.png",
          "present": true,
          "sha256": "0d772216b75c0959fea830a30211f4d0b2de1b68b4fd506316659a28e2a44dd2"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-chef-cook-host-005",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "host-seating-tablet",
      "name": "Glare-Free Seating Tablet",
      "kind": "equipment",
      "roles": [
        "host-busser"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-host-glare-free-seating-tablet.png",
          "present": true,
          "sha256": "6163ae12181aae851526dc199854ad5ae56bc2e4b784e441b1d47b740a56da94"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-host-006",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-host-006/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "host-brass-crumb-scraper",
      "name": "Brass Crumb Scraper",
      "kind": "equipment",
      "roles": [
        "host-busser"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-host-brass-crumb-scraper.png",
          "present": true,
          "sha256": "5340011fbe46d884a870d7701659ec0b83ab7c73f804783ee1cd48c1f8a54844"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-host-006",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-host-006/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "host-bus-tub-harness",
      "name": "Balanced Bus-Tub Harness",
      "kind": "equipment",
      "roles": [
        "host-busser"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-host-balanced-bus-tub-harness.png",
          "present": true,
          "sha256": "e244fa9f9478c8724ae91e8ebf5c84575ecda9c150f69a3fab24ae9c078251d7"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-host-006",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-host-006/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "host-sanitizer-caddy-refill",
      "name": "Reset Caddy Refill",
      "kind": "consumable",
      "roles": [
        "host-busser"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-host-reset-caddy-refill.png",
          "present": true,
          "sha256": "365fbba68161f0691b8055b61358da738d51086eb688109a6417219426a29237"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-host-006",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-host-006/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    },
    {
      "id": "host-guest-activity-pack",
      "name": "Little Guest Activity Pack",
      "kind": "consumable",
      "roles": [
        "host-busser"
      ],
      "files": [
        {
          "path": "apps/client-godot/assets/items/role-equipment-host-little-guest-activity-pack.png",
          "present": true,
          "sha256": "af90f3a94ba26bbd319ca9761adc198bed011d94fd25ebfcd03d8e56060c2b7d"
        }
      ],
      "present": true,
      "batchId": "equipment-icons-host-006",
      "review": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "remoteVerified": true,
      "qaEvidence": "planning/art-qa/equipment-icons-host-006/contact-128-dark.png",
      "qaEvidencePresent": true,
      "runtimeBound": true,
      "productionComplete": true,
      "status": "production_complete"
    }
  ],
  "construction": {
    "materials": [
      {
        "id": "floor-sealed-concrete",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-sealed-concrete.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-quarry-tile",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-quarry-tile.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-white-hex",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-white-hex.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-slate-tile",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-slate-tile.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-oak-plank",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-oak-plank.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-walnut-plank",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-walnut-plank.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-terrazzo",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-terrazzo.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-pattern-cement",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-pattern-cement.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-commercial-vinyl",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-commercial-vinyl.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-rubber-kitchen",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-rubber-kitchen.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-entry-mat",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-entry-mat.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "floor-outdoor-paver",
        "type": "floor",
        "path": "apps/client-godot/assets/construction/floors/floor-outdoor-paver.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "wall-painted-plaster",
        "type": "wall-material",
        "path": "apps/client-godot/assets/construction/walls/wall-painted-plaster.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "wall-subway-tile",
        "type": "wall-material",
        "path": "apps/client-godot/assets/construction/walls/wall-subway-tile.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "wall-exposed-brick",
        "type": "wall-material",
        "path": "apps/client-godot/assets/construction/walls/wall-exposed-brick.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "wall-oak-panel",
        "type": "wall-material",
        "path": "apps/client-godot/assets/construction/walls/wall-oak-panel.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "wall-glass-partition",
        "type": "wall-material",
        "path": "apps/client-godot/assets/construction/walls/wall-glass-partition.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "wall-stainless-kitchen",
        "type": "wall-material",
        "path": "apps/client-godot/assets/construction/walls/wall-stainless-kitchen.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      }
    ],
    "openings": [
      {
        "id": "solid",
        "requiredDirections": [
          "north",
          "east",
          "south",
          "west"
        ],
        "files": [
          {
            "path": "apps/client-godot/assets/construction/openings/solid/north.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/solid/east.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/solid/south.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/solid/west.png",
            "present": false,
            "sha256": null
          }
        ],
        "present": false,
        "status": "missing"
      },
      {
        "id": "door",
        "requiredDirections": [
          "north",
          "east",
          "south",
          "west"
        ],
        "files": [
          {
            "path": "apps/client-godot/assets/construction/openings/door/north.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/door/east.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/door/south.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/door/west.png",
            "present": false,
            "sha256": null
          }
        ],
        "present": false,
        "status": "missing"
      },
      {
        "id": "service-door",
        "requiredDirections": [
          "north",
          "east",
          "south",
          "west"
        ],
        "files": [
          {
            "path": "apps/client-godot/assets/construction/openings/service-door/north.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/service-door/east.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/service-door/south.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/service-door/west.png",
            "present": false,
            "sha256": null
          }
        ],
        "present": false,
        "status": "missing"
      },
      {
        "id": "window",
        "requiredDirections": [
          "north",
          "east",
          "south",
          "west"
        ],
        "files": [
          {
            "path": "apps/client-godot/assets/construction/openings/window/north.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/window/east.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/window/south.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/window/west.png",
            "present": false,
            "sha256": null
          }
        ],
        "present": false,
        "status": "missing"
      },
      {
        "id": "arch",
        "requiredDirections": [
          "north",
          "east",
          "south",
          "west"
        ],
        "files": [
          {
            "path": "apps/client-godot/assets/construction/openings/arch/north.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/arch/east.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/arch/south.png",
            "present": false,
            "sha256": null
          },
          {
            "path": "apps/client-godot/assets/construction/openings/arch/west.png",
            "present": false,
            "sha256": null
          }
        ],
        "present": false,
        "status": "missing"
      }
    ],
    "utilities": [
      {
        "id": "power",
        "path": "apps/client-godot/assets/construction/utilities/power.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "gas",
        "path": "apps/client-godot/assets/construction/utilities/gas.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "water",
        "path": "apps/client-godot/assets/construction/utilities/water.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "drain",
        "path": "apps/client-godot/assets/construction/utilities/drain.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      },
      {
        "id": "ventilation",
        "path": "apps/client-godot/assets/construction/utilities/ventilation.png",
        "present": false,
        "sha256": null,
        "status": "missing"
      }
    ]
  },
  "world": [
    {
      "id": "world-atlas",
      "path": "apps/client-godot/assets/world/world-atlas.png",
      "present": false,
      "sha256": null,
      "status": "missing"
    }
  ],
  "environment": [
    {
      "id": "contact-shadow",
      "path": "apps/client-godot/assets/environment/contact-shadow.png",
      "present": false,
      "sha256": null,
      "status": "missing"
    },
    {
      "id": "selection-ring",
      "path": "apps/client-godot/assets/environment/selection-ring.png",
      "present": false,
      "sha256": null,
      "status": "missing"
    },
    {
      "id": "steam-puff",
      "path": "apps/client-godot/assets/environment/steam-puff.png",
      "present": false,
      "sha256": null,
      "status": "missing"
    },
    {
      "id": "service-sparkles",
      "path": "apps/client-godot/assets/environment/service-sparkles.png",
      "present": false,
      "sha256": null,
      "status": "missing"
    }
  ],
  "ui": [
    {
      "id": "builder-pointer",
      "path": "apps/client-godot/assets/ui/builder/pointer.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-floor",
      "path": "apps/client-godot/assets/ui/builder/floor.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-wall",
      "path": "apps/client-godot/assets/ui/builder/wall.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-furniture",
      "path": "apps/client-godot/assets/ui/builder/furniture.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-rotate",
      "path": "apps/client-godot/assets/ui/builder/rotate.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-repair",
      "path": "apps/client-godot/assets/ui/builder/repair.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-sell",
      "path": "apps/client-godot/assets/ui/builder/sell.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-expand",
      "path": "apps/client-godot/assets/ui/builder/expand.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-power",
      "path": "apps/client-godot/assets/ui/builder/power.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-gas",
      "path": "apps/client-godot/assets/ui/builder/gas.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-water",
      "path": "apps/client-godot/assets/ui/builder/water.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-drain",
      "path": "apps/client-godot/assets/ui/builder/drain.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "builder-ventilation",
      "path": "apps/client-godot/assets/ui/builder/ventilation.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "login-hero",
      "path": "apps/client-godot/assets/ui/login-hero.png",
      "present": false,
      "sha256": null,
      "runtimeBound": false,
      "status": "missing"
    },
    {
      "id": "rro-mark",
      "path": "apps/client-godot/assets/ui/rro-mark.svg",
      "present": true,
      "sha256": "ad4f45e089a2176d2e482e554912183a0a63721158c718c3cbb8ff844478b43c",
      "runtimeBound": true,
      "status": "runtime_bound_unreviewed"
    }
  ],
  "characters": {
    "directions": [
      "north",
      "north_east",
      "east",
      "south_east",
      "south",
      "south_west",
      "west",
      "north_west"
    ],
    "bodyPresentations": [
      "base-a",
      "base-b"
    ],
    "skinTones": [
      {
        "id": "porcelain",
        "color": "#f4d7c5"
      },
      {
        "id": "fair",
        "color": "#eac0a2"
      },
      {
        "id": "light",
        "color": "#dca37f"
      },
      {
        "id": "golden",
        "color": "#c98a5b"
      },
      {
        "id": "olive",
        "color": "#b77b52"
      },
      {
        "id": "tan",
        "color": "#a96843"
      },
      {
        "id": "brown",
        "color": "#875034"
      },
      {
        "id": "deep",
        "color": "#653a2b"
      },
      {
        "id": "ebony",
        "color": "#43281f"
      },
      {
        "id": "umber",
        "color": "#2d1c18"
      }
    ],
    "animationCount": 26,
    "animations": [
      {
        "id": "idle",
        "frames": 4,
        "sourcePoseFrames": 1,
        "loop": true
      },
      {
        "id": "walk",
        "frames": 8,
        "sourcePoseFrames": 4,
        "loop": true
      },
      {
        "id": "carry",
        "frames": 4,
        "sourcePoseFrames": 2,
        "loop": true
      },
      {
        "id": "greet",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "order-pos",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "pour",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "deliver",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "clear",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "wipe",
        "frames": 8,
        "sourcePoseFrames": 4,
        "loop": true
      },
      {
        "id": "sweep",
        "frames": 8,
        "sourcePoseFrames": 4,
        "loop": true
      },
      {
        "id": "mop",
        "frames": 8,
        "sourcePoseFrames": 4,
        "loop": true
      },
      {
        "id": "scrub",
        "frames": 8,
        "sourcePoseFrames": 4,
        "loop": true
      },
      {
        "id": "scrape",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": true
      },
      {
        "id": "rack",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": true
      },
      {
        "id": "load",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "unload",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "polish",
        "frames": 8,
        "sourcePoseFrames": 4,
        "loop": true
      },
      {
        "id": "chop",
        "frames": 8,
        "sourcePoseFrames": 4,
        "loop": true
      },
      {
        "id": "stir",
        "frames": 8,
        "sourcePoseFrames": 4,
        "loop": true
      },
      {
        "id": "flip",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "plate",
        "frames": 8,
        "sourcePoseFrames": 4,
        "loop": true
      },
      {
        "id": "inspect",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "open",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "pick-up",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "put-down",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      },
      {
        "id": "react",
        "frames": 6,
        "sourcePoseFrames": 3,
        "loop": false
      }
    ],
    "framesPerDirection": 170,
    "sourcePosesPerDirection": 84,
    "requiredBodySourcePoses": 1344,
    "requiredBodyFinalFrameCells": 2720,
    "presentStaticBodyPoses": 16,
    "bodyFoundations": [
      {
        "body": "base-a",
        "files": [
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/north.png",
            "present": true,
            "sha256": "cd5b4408bef68aea28c59fc4e532d1c25426b51e5f7333cd020b71f7bc341357"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/north_east.png",
            "present": true,
            "sha256": "e0344851c62e316bbcdcdef6d043b46652296dd7c319e3f0f28bf84f720ff4b5"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/east.png",
            "present": true,
            "sha256": "9b5f09e15d2e26ade4558ec47caa9400313e606ecdde300e89aadb6176ba0e35"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/south_east.png",
            "present": true,
            "sha256": "d14c717abb21d7f38fa251d1f969e3d42d50f4b3be171d54e9ca764525c31b46"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/south.png",
            "present": true,
            "sha256": "164752e457b0a9a190c19220c6a0d19c90f14791c0ef64d0d4b7ed254a442759"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/south_west.png",
            "present": true,
            "sha256": "ebdf1d813d186e8f228bb92d69fa8d86001bb2cd069552b72991c25e1357c7ce"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/west.png",
            "present": true,
            "sha256": "8db85cbe50f0863a316ef446aac219917b0ffb90566339b0e3a4edf7403175f8"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/north_west.png",
            "present": true,
            "sha256": "08f9e5e90a40b61d5fe0877f3ad036daf847ccda8d3f294230db315aecfa359a"
          }
        ],
        "present": true,
        "batchId": "character-remediation-idle-classic-v1",
        "review": "passed",
        "runtimeQa": "blocked-static-idle-and-no-runtime-compositor",
        "remoteVerified": true,
        "qaEvidence": "planning/art-qa/character-remediation-idle-classic-v1/classic-composites-full.png",
        "qaEvidencePresent": true,
        "runtimeBound": false,
        "productionComplete": false,
        "status": "source_accepted_runtime_blocked"
      },
      {
        "body": "base-b",
        "files": [
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/north.png",
            "present": true,
            "sha256": "e4cc3b8b9bdb474ef14d169318b4f6ba530389b5c98162f4bdee75acc8767007"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/north_east.png",
            "present": true,
            "sha256": "f5ffb5cf79e1b7a834e6217c4abd99196dff7837ed70a8223ea2a0ade52cfb07"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/east.png",
            "present": true,
            "sha256": "032790d1c65156412d5ecbaf6569ecd0bd564857401f05fae89646d37aae579f"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/south_east.png",
            "present": true,
            "sha256": "08b80520d332fa6e7e428aa02fb29c3d1872f74e0d52e1c2ade710da96120e66"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/south.png",
            "present": true,
            "sha256": "d139afee6de151b2755fc3e0101cfcedb36ee982d442b6a4786a316dafeb0f94"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/south_west.png",
            "present": true,
            "sha256": "5193017bb29dd57e784826cfbcf46be03cd54df097e3a272056dbcede54678c1"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/west.png",
            "present": true,
            "sha256": "08502cdd3e0b99ae2cbf02c18d543271b6350ea983e5f272c13e2e8d37ed5e8b"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/north_west.png",
            "present": true,
            "sha256": "a6cc7f48496c04d36e1fffe2258716fa6604742a92de56bd42938d6283409ef7"
          }
        ],
        "present": true,
        "batchId": "character-remediation-idle-classic-v1",
        "review": "passed",
        "runtimeQa": "blocked-static-idle-and-no-runtime-compositor",
        "remoteVerified": true,
        "qaEvidence": "planning/art-qa/character-remediation-idle-classic-v1/classic-composites-full.png",
        "qaEvidencePresent": true,
        "runtimeBound": false,
        "productionComplete": false,
        "status": "source_accepted_runtime_blocked"
      }
    ],
    "skinFoundations": [
      {
        "body": "base-a",
        "files": [
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-diffuse/north.png",
            "present": true,
            "sha256": "7f87b161f649b6bda5d2a9717fe469b51befa1608c9369b9fec93436c9d59ba9"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-mask/north.png",
            "present": true,
            "sha256": "f86aaafbbdf74b1764cbdd89fcd74863b058ccb7d48bd651536969b43871c034"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-diffuse/north_east.png",
            "present": true,
            "sha256": "c45ca8a41604d4ec0e65d7cc673009e9ae357e67f97a9dcd44514fd0ff135e5e"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-mask/north_east.png",
            "present": true,
            "sha256": "bb090830d878f48984ecf7f0b52b45b891c731d17da69bf5aa59670f10152ea9"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-diffuse/east.png",
            "present": true,
            "sha256": "ce860ed2daae2ee480881e49a8745d77293139ea1f877361c7fc5bbb582c5961"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-mask/east.png",
            "present": true,
            "sha256": "f78fde572591ce4391b9cabb3e9c896128915eaf2cb9bb1b2ad9973a4862b1b7"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-diffuse/south_east.png",
            "present": true,
            "sha256": "5bf57ea22ad9855a5c01311c026bf7658089a7cda365b2bd9b03631fa39ec840"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-mask/south_east.png",
            "present": true,
            "sha256": "f90b84cc0073194a8e2a4f59e4a9fa83f3ed0ea42d339563ccdfd86ca298c632"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-diffuse/south.png",
            "present": true,
            "sha256": "e0d0b7d8a167c34b79feda63252447a5d7d3a253afae30dbdcdf12c65daf6826"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-mask/south.png",
            "present": true,
            "sha256": "c664cae847030a011e503b4ff6359857dd937bac396b0c74e47109bf47e5bc4d"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-diffuse/south_west.png",
            "present": true,
            "sha256": "ea105574ca2317eddee550c366f8fbbf7a095103f5e844e2db0ca1b39273d86b"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-mask/south_west.png",
            "present": true,
            "sha256": "d4f4add6cf640504da710661a84aadc6fbbe328df337a8ea2afca2bd9b49a026"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-diffuse/west.png",
            "present": true,
            "sha256": "c159996359ecc1f4098f3cbd4cc4fee15ee765becc7c905e5932cd33faaee160"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-mask/west.png",
            "present": true,
            "sha256": "61d88d0c960372052a2c574fc529e22f4908ad1d22b5ab42b03535841683ef46"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-diffuse/north_west.png",
            "present": true,
            "sha256": "fe34f729882e5a4c22d345b33ce6a710622a126d2e1b57e12ed5dc3ad60513f4"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-a/idle/skin-mask/north_west.png",
            "present": true,
            "sha256": "c60a44cf799faf5ce0d70bf370c0d0101031e5d4e72e71f0230ac96dd83b4b93"
          }
        ],
        "present": true,
        "batchId": "character-remediation-idle-classic-v1",
        "review": "passed",
        "runtimeQa": "blocked-static-idle-and-no-runtime-compositor",
        "remoteVerified": true,
        "qaEvidence": "planning/art-qa/character-remediation-idle-classic-v1/classic-composites-full.png",
        "qaEvidencePresent": true,
        "runtimeBound": false,
        "productionComplete": false,
        "status": "source_accepted_runtime_blocked"
      },
      {
        "body": "base-b",
        "files": [
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-diffuse/north.png",
            "present": true,
            "sha256": "f82c5492eb955d78b8a1700ba2f49e892d5e788059a603b5ad7e465d7aa80c03"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-mask/north.png",
            "present": true,
            "sha256": "8068c9b86f3ad8d21a8a45391d312d98e2c5d7aad0cfa30ca2f072478e5403d6"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-diffuse/north_east.png",
            "present": true,
            "sha256": "f685951a7e1ae67367ae18193f0ac191c6b4fe36a679c8bc50b613659ef44a43"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-mask/north_east.png",
            "present": true,
            "sha256": "1d9f88b3b1b2ed28ca9e4ae4429c1d977f22f6204adcf6458ed2a2ce4034cfb7"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-diffuse/east.png",
            "present": true,
            "sha256": "6bfb5babb36486a91fec8439d8c7d05e0a3c3ad4922ec0a80cb721988769da4f"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-mask/east.png",
            "present": true,
            "sha256": "cafc3c4d9bbb75c37ab833783b1c220b5aabcc8fd7d9aed711084b233725d257"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-diffuse/south_east.png",
            "present": true,
            "sha256": "36b10221d31b1ae2b775c13b1fa006d57875f34f9108c8f43bf8e025efcedd2a"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-mask/south_east.png",
            "present": true,
            "sha256": "82d0114c36b2070ab174dddd9defc2a769b0596fd65e95b8b7235e237ac8c2a9"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-diffuse/south.png",
            "present": true,
            "sha256": "a19448e5e595ba3f748660a9dddac74b8e4d1871c1f33bbbb19da73dee15b4cf"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-mask/south.png",
            "present": true,
            "sha256": "05837f0d502bfbabffc4ee905762c35003cbcb27b1677216738f13db8d33094a"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-diffuse/south_west.png",
            "present": true,
            "sha256": "a3ca3723e3e403501f55f53be576937c4b785af9a79ddaa42a24e5697acd2b02"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-mask/south_west.png",
            "present": true,
            "sha256": "35fa6b7b8b34b2ee839605312a9d2b6143eb6ccb758c6d1f610c91ef0598d5d5"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-diffuse/west.png",
            "present": true,
            "sha256": "e39fe11acf1d39c645513a7a8fbc3aeed109bddb607fc84f6c3b5eff755b6374"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-mask/west.png",
            "present": true,
            "sha256": "522b5cea0ea655c1d9cce63a0fad4bcc87fc9f7850cd666099ab04e02fca0531"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-diffuse/north_west.png",
            "present": true,
            "sha256": "a0c922029d289aa04c9ee0a8e714377f1604ef9ee550858fb8e5e169b74e0e8f"
          },
          {
            "path": "apps/client-godot/assets/characters/body/base-b/idle/skin-mask/north_west.png",
            "present": true,
            "sha256": "118e78422673627cfb577355e2e0927a00c27344918b6de6bac5fafc7ae95b4e"
          }
        ],
        "present": true,
        "batchId": "character-remediation-idle-classic-v1",
        "review": "passed",
        "runtimeQa": "blocked-static-idle-and-no-runtime-compositor",
        "remoteVerified": true,
        "qaEvidence": "planning/art-qa/character-remediation-idle-classic-v1/classic-composites-full.png",
        "qaEvidencePresent": true,
        "runtimeBound": false,
        "productionComplete": false,
        "status": "source_accepted_runtime_blocked"
      }
    ],
    "prototypeOutfits": [
      {
        "outfit": "classic",
        "body": "base-a",
        "files": [
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/diffuse/north.png",
            "present": true,
            "sha256": "baaaae166b8cb0e304217bee47dd636425d99e3a06ab8146d5926fd2bf1c7832"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/primary-mask/north.png",
            "present": true,
            "sha256": "f543e23670a4b7ca684ad0a46abda7d34d2539d45fa2aaf5fd78192e228e7563"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/secondary-mask/north.png",
            "present": true,
            "sha256": "1e3ca0f14acac124031508c6593b48bb44f9dc4b90a750b38b5163be558358f1"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/diffuse/north_east.png",
            "present": true,
            "sha256": "cec6dc6bc6c91e30a28bf08b5f7ab9686c2f688918a53b4a5f573f5beb7c8f0d"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/primary-mask/north_east.png",
            "present": true,
            "sha256": "cf726a3210ae57e8e4d83edf85063cd44686adcf6c0eae23ba4193193e325990"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/secondary-mask/north_east.png",
            "present": true,
            "sha256": "d2f6cb21a8dce26ed87c839bfc20b6dfa2202f80651a041061ca26a2f37643d0"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/diffuse/east.png",
            "present": true,
            "sha256": "8c6b2b92e57f3081e73ca31225c826070ca46ac92bb528fce9390f7157a45dba"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/primary-mask/east.png",
            "present": true,
            "sha256": "a7e29cfab3b8ab19d2168b6919e024039fa7a66d4eacd1b541d749eca2635401"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/secondary-mask/east.png",
            "present": true,
            "sha256": "8ef829608730b7221690a2d3ad77b80dc99717e4cf9411b8c252e9885bd1ba83"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/diffuse/south_east.png",
            "present": true,
            "sha256": "c3c30d0e780db143c427e74e92a707435a2d977f78dd9dcb123cf9cec9a930cb"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/primary-mask/south_east.png",
            "present": true,
            "sha256": "9a8ec14eed6843980a535227546cb41d298027b04a026440c60bde233d1710eb"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/secondary-mask/south_east.png",
            "present": true,
            "sha256": "28e5fde1b0453115ec64c10f82ff58731c2271a01fcb342e1c535e04f50d099c"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/diffuse/south.png",
            "present": true,
            "sha256": "60a55bee510bb7369d1f988298e7e851641b2531d418f5ff38b10f61e413053f"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/primary-mask/south.png",
            "present": true,
            "sha256": "f96e65b3b4292434d6f9918afa63b5665139faf166a9d7be62c77ae827e1678a"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/secondary-mask/south.png",
            "present": true,
            "sha256": "00275595253722c9477338e22d8881d00ce6e748e4dc4b09dfebea88d4775715"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/diffuse/south_west.png",
            "present": true,
            "sha256": "3fdcd997850cb800f6307f604e9840db476b3a9f356d74ce2c9fa487a067d018"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/primary-mask/south_west.png",
            "present": true,
            "sha256": "5c9fc2d72570300b56848cfa4e5c0ca8ac1638e7da569bfd19abe9c68e420727"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/secondary-mask/south_west.png",
            "present": true,
            "sha256": "d5f5126a2626762834ce83c20b410f67d4387970f6974c2b43701bb0789469c6"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/diffuse/west.png",
            "present": true,
            "sha256": "74d22503ad46787d463a2ffd03ef192d158c505daf0a6756515381363775152b"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/primary-mask/west.png",
            "present": true,
            "sha256": "c348f5568818962999caa2e12e6db5511f83e885dd3f267ba4e357dd1aaa0ab6"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/secondary-mask/west.png",
            "present": true,
            "sha256": "a7574a1101ec7c09fcc19f7548499573d5a3b550391cf13b3454743eb60d05e2"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/diffuse/north_west.png",
            "present": true,
            "sha256": "5b97e00d1f0c41acd2a296e3356612aaa32364b8f36a9e95408ef0f0fad5944e"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/primary-mask/north_west.png",
            "present": true,
            "sha256": "b10314ea392bc0f2202bca9326d2a9c66a794d427e782dca093f5f46f81db3b3"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-a/idle/secondary-mask/north_west.png",
            "present": true,
            "sha256": "a4ad2781207aa19fadd336721bb5b536af68e0168d9843b0734f14a86bf4aa25"
          }
        ],
        "present": true,
        "batchId": "character-remediation-idle-classic-v1",
        "review": "passed",
        "runtimeQa": "blocked-static-idle-and-no-runtime-compositor",
        "remoteVerified": true,
        "qaEvidence": "planning/art-qa/character-remediation-idle-classic-v1/classic-composites-full.png",
        "qaEvidencePresent": true,
        "runtimeBound": false,
        "productionComplete": false,
        "status": "source_accepted_runtime_blocked"
      },
      {
        "outfit": "classic",
        "body": "base-b",
        "files": [
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/diffuse/north.png",
            "present": true,
            "sha256": "2ba7210a3d7290978937f2e66f2e238829473ad39bed13fafa7d533e067bae76"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/primary-mask/north.png",
            "present": true,
            "sha256": "f2a001597dc6d070b0dd574264107add0a1731484b26f10645d8a3e77dd3ecf9"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/secondary-mask/north.png",
            "present": true,
            "sha256": "9d34b7500fabd097d1d5bb3f06f84e37fb535fd836ab437d7661950ca102805c"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/diffuse/north_east.png",
            "present": true,
            "sha256": "0c58f7a8970cacc24649fa6883ccf54e8028cb18619509ad824d886ee2925e35"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/primary-mask/north_east.png",
            "present": true,
            "sha256": "a6353780818992ec5f7a9fccb64a61f6a2d3e37eebae6fb63278002db68b0169"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/secondary-mask/north_east.png",
            "present": true,
            "sha256": "f5dcef97d5338b5da41f2eadffd1019483718089a425238ca204944870c5250f"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/diffuse/east.png",
            "present": true,
            "sha256": "5d55dba8d106609399a009d87b5089ddd98cebd41ebe662fbf21015c016f9443"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/primary-mask/east.png",
            "present": true,
            "sha256": "e6203518b05e20c8ab4a3e43d819b503f2094d01cfd6ea64598e10929ba7a1f0"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/secondary-mask/east.png",
            "present": true,
            "sha256": "44f7c97cb5f34f3061e7c57b5f426607a213e978be2f48bc48b2708f69e7404d"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/diffuse/south_east.png",
            "present": true,
            "sha256": "088288eaf7ec0a46df2c6d3e0e94d28d15e1e3443a290464a5b5663109e02ab6"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/primary-mask/south_east.png",
            "present": true,
            "sha256": "40b80a6ff6c5d3b0e2cbda12dccd8f9f05651e660aadc6a10355b9e7057cc4f6"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/secondary-mask/south_east.png",
            "present": true,
            "sha256": "cb71b480f1a8fd318588c68905b455d9f950a86bca3c976eca6160c087c1347e"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/diffuse/south.png",
            "present": true,
            "sha256": "3fa0848efc0022ffbb1090bdfee6b5efb34dd2d2f12ee60973e1574bf43c1d62"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/primary-mask/south.png",
            "present": true,
            "sha256": "970d70cb6ec2501ce974aa5c0d797db31648505e32ef09fd1f8636380667d324"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/secondary-mask/south.png",
            "present": true,
            "sha256": "840738d1db5192a310ef38c0b2c96e2f7a90dfc5602d47f7c32a071a841f1664"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/diffuse/south_west.png",
            "present": true,
            "sha256": "d27cfaaa85215e4625a1689cd44685427f97bb4198af71718faa029027df6a8e"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/primary-mask/south_west.png",
            "present": true,
            "sha256": "3a84e2928109cda6b3175eb71fffb4f96ffcf83c66b0829d13f0bad898d800c3"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/secondary-mask/south_west.png",
            "present": true,
            "sha256": "2d11664b23fe8857ca29aec5d7a4e75686300b770ddfaee5fcba179e33c1dfc9"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/diffuse/west.png",
            "present": true,
            "sha256": "7deefe73207ad29b7850474f568d2ea073c7dfaf67f3fb5951a46c164f6c6bb0"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/primary-mask/west.png",
            "present": true,
            "sha256": "cb24d4af9fe905b5bf36304b471860ff2e35472ee1f7a31e2a51dbcb729ca721"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/secondary-mask/west.png",
            "present": true,
            "sha256": "8a0b7ef85ef3adfeeb13f97f3c1337c812fe13042c7ce185c161d8725f8d98f2"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/diffuse/north_west.png",
            "present": true,
            "sha256": "1eda852352e07f6fc40ab7ef52af3ddd4537a1d81e71a25732ecc582fcb05ef7"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/primary-mask/north_west.png",
            "present": true,
            "sha256": "e157283e86cd7c7cf2174b4b5f9038bcb37426ede55f9b52c4e0acbca76d38c1"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/classic/base-b/idle/secondary-mask/north_west.png",
            "present": true,
            "sha256": "d9327acbf8f1deaad670a29067fe1d6623f59325ea903eabec0ce8a46eabad5d"
          }
        ],
        "present": true,
        "batchId": "character-remediation-idle-classic-v1",
        "review": "passed",
        "runtimeQa": "blocked-static-idle-and-no-runtime-compositor",
        "remoteVerified": true,
        "qaEvidence": "planning/art-qa/character-remediation-idle-classic-v1/classic-composites-full.png",
        "qaEvidencePresent": true,
        "runtimeBound": false,
        "productionComplete": false,
        "status": "source_accepted_runtime_blocked"
      },
      {
        "outfit": "apron",
        "body": "base-a",
        "files": [
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/diffuse/north.png",
            "present": true,
            "sha256": "f142b72a0a98717ba18c187d37eed94f72f0e6f1991194f5057ecb72d533ff22"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/primary-mask/north.png",
            "present": true,
            "sha256": "38bd03915e857ce01e672549d22e1faef7708a0d938a9c62ba503ed70da4b9e3"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/secondary-mask/north.png",
            "present": true,
            "sha256": "518e0ff2a1da32903eae73f0412770933ef2e13138160a41a99769e8536f90a9"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/diffuse/north_east.png",
            "present": true,
            "sha256": "58d183b4459d6f055997886649a228c4060db6e5253da109cb51ad2b6a3ea092"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/primary-mask/north_east.png",
            "present": true,
            "sha256": "6eddecdd16a48a520ae41a078ad303b22364f0d172417aa6af62f56787223916"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/secondary-mask/north_east.png",
            "present": true,
            "sha256": "8a4605c2f6df28a0782e448537f98d198a4e133d526abe95d82f837c0209066c"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/diffuse/east.png",
            "present": true,
            "sha256": "dd3606aa550df92e396a1063e924bbba9ee0695a87c6ac2b7a12d3eaa618b8b5"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/primary-mask/east.png",
            "present": true,
            "sha256": "b2909d1ffc2ce60e1637276e7eecea84778ed46e24f9c14b448bc1cee3c4d986"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/secondary-mask/east.png",
            "present": true,
            "sha256": "beffc97b3347e34f292d18b605bbfb28e3af9eb748647a0eab2fda6f3402d86b"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/diffuse/south_east.png",
            "present": true,
            "sha256": "f36ba57aa6fd293ae3a8ce72283522414676ffded377790fc2ffeac61ed153c3"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/primary-mask/south_east.png",
            "present": true,
            "sha256": "3b2793c44d238498888b4ec0e1ab16861bae4c2844e2999d446d138f8d1fabe3"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/secondary-mask/south_east.png",
            "present": true,
            "sha256": "d1c56d1a9f140eabc181ab2869d9223229889c8ddca624c697d50868c05d6c1c"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/diffuse/south.png",
            "present": true,
            "sha256": "d5721dd59a91e2c9361e70215d4a2b73fb7f9c1c043fe2cc334935c8fda4a0bb"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/primary-mask/south.png",
            "present": true,
            "sha256": "fc3a426c5d7814120e834d99983ab2f501089554023b9cffb9a3cddcf605f3b0"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/secondary-mask/south.png",
            "present": true,
            "sha256": "eb9bce70359ef53153dff5cf3114730d0db58340553b9dc974d056f21e7158c2"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/diffuse/south_west.png",
            "present": true,
            "sha256": "853719f8f41f23bf50bde9d218d65dfac38c55ab312e5168ca822f6c7f5444be"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/primary-mask/south_west.png",
            "present": true,
            "sha256": "82091cb1ebfd6166081e120e38db6e91953e70ad4a49218db61dd760eefc25b2"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/secondary-mask/south_west.png",
            "present": true,
            "sha256": "4d54bc56dfb5c6a518a39ecc649bb3d5166986f9044eb683f278b73ccf039d2b"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/diffuse/west.png",
            "present": true,
            "sha256": "d9c23f8105fb22a8907744b45d2f21ef8994fbb06baa2946797cf25aea34b3ec"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/primary-mask/west.png",
            "present": true,
            "sha256": "576453e44a4df4ac6417164137e61ead36351080fd22c541cf4b0103c6f12a30"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/secondary-mask/west.png",
            "present": true,
            "sha256": "d9f174785f3118435f96806a9defbc6c999892c1aa0e19d7ee4d41421da432cb"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/diffuse/north_west.png",
            "present": true,
            "sha256": "32820dddf044f00a2982f00cdac789f3aceb54b740ad7849cacbf01d90185aaa"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/primary-mask/north_west.png",
            "present": true,
            "sha256": "7c986bada0707fb2cc7ee165fb0a2367ccaee391c45aec2b43d4f8d582f9f04a"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-a/idle/secondary-mask/north_west.png",
            "present": true,
            "sha256": "829dbf8166385cdeec8f656a3b34bce971d3e7c2b953975c5ea21a71c49d72b5"
          }
        ],
        "present": true,
        "batchId": "character-modular-apron-001",
        "review": "failed-silhouette-and-foot-leakage",
        "runtimeQa": "failed-needs-remediation",
        "remoteVerified": true,
        "qaEvidence": "planning/art-qa/character-modular-apron-001.png",
        "qaEvidencePresent": true,
        "runtimeBound": false,
        "productionComplete": false,
        "status": "qa_failed_needs_remediation"
      },
      {
        "outfit": "apron",
        "body": "base-b",
        "files": [
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/diffuse/north.png",
            "present": true,
            "sha256": "a7fb0acd4e73c4f9bcc4a06b7e7c0dcdb955b71f24976edf825192bf85acd728"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/primary-mask/north.png",
            "present": true,
            "sha256": "36376669d39e8ec7681f2e8a776285d806085f453327859e84c675e4c917cf25"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/secondary-mask/north.png",
            "present": true,
            "sha256": "45d51485a658a5bc009d5fd7cc25ae3be117081fcbf1c90e137be2c7857788a3"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/diffuse/north_east.png",
            "present": true,
            "sha256": "5ffa582a67e53fb6fcd01e6d0bd517c15c9f2b1ae89b65f6b0c6ace23f9b7bca"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/primary-mask/north_east.png",
            "present": true,
            "sha256": "eca495e15492bd73d83e5a429f9bbb102364493b6f683d9df7cd40806ff49703"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/secondary-mask/north_east.png",
            "present": true,
            "sha256": "34c2fcc6c197e181d206a5e8d5b8f20446bd1141b941df0bede62dfc5fcc9700"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/diffuse/east.png",
            "present": true,
            "sha256": "81834ab10a6ea03519426d794a9337049dc233c60a0a81c44965c4b20a921dd0"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/primary-mask/east.png",
            "present": true,
            "sha256": "32f3425bf1f4525187f18d67b31a34c5d0b0cc4e0dc135a65880f61e89dd51c0"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/secondary-mask/east.png",
            "present": true,
            "sha256": "281913c0f5e37a4ae33330317d80dd26445c36664b8656365e46eec77feb1eca"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/diffuse/south_east.png",
            "present": true,
            "sha256": "3d081de50190227dbd508d96ba7b417556d02ea442b971f12404b096fe608ab3"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/primary-mask/south_east.png",
            "present": true,
            "sha256": "064a7eb3f68472a95081ce4c25f31accffb7fc3d5802551dacc3736433b27747"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/secondary-mask/south_east.png",
            "present": true,
            "sha256": "c91472bf322bbaec5fda132e881f5cbd5a1b23b95b7f218522b4d43d936dedf1"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/diffuse/south.png",
            "present": true,
            "sha256": "677b241b48ae14306256e9aca47d9667387c155d92dea964c37bf75f1be25462"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/primary-mask/south.png",
            "present": true,
            "sha256": "9d6925ed4c4b3224986a4c6552eb03c9075ef04ce669ace0dab407b7e37c5f31"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/secondary-mask/south.png",
            "present": true,
            "sha256": "33978b124381ab720385d2a22292b9e8016f2a54bf3d9d3a5b89228f1a92afbc"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/diffuse/south_west.png",
            "present": true,
            "sha256": "3c3b9eb6002b90903449bbf7600e5e0508280dd829013d10b67212e2bfa2a6fb"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/primary-mask/south_west.png",
            "present": true,
            "sha256": "72406c8553a3763af7e2a05eeead46b1804fdd9549eb2ab978c86d49b2fa16b7"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/secondary-mask/south_west.png",
            "present": true,
            "sha256": "c7799d815451176341d73882199837a207c12946aa82650d569e129363a27d02"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/diffuse/west.png",
            "present": true,
            "sha256": "875ce9a94d2af4aa5b4a41387d11df2d0ea750ba8adbf0b0f7f2c690a665d5a0"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/primary-mask/west.png",
            "present": true,
            "sha256": "3aa0e5d26822a3edb381681332ea734547ec61f7c3b1f987b3d3f5440a23849b"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/secondary-mask/west.png",
            "present": true,
            "sha256": "b4587ee69863273832576836c670c790a84b9384ad998793b2e14a7f5eab62ff"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/diffuse/north_west.png",
            "present": true,
            "sha256": "fe8de0497442e77e03d049ba8c5ae5fe83e6b0caac23f96ee42e5db442979e72"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/primary-mask/north_west.png",
            "present": true,
            "sha256": "ba01aa16fbb687d4912990aeddb6ab036fe9901f523189decc8630e492c81055"
          },
          {
            "path": "apps/client-godot/assets/characters/outfits/apron/base-b/idle/secondary-mask/north_west.png",
            "present": true,
            "sha256": "99e36ce67e0ee80a0489316f4436105a1853aee1e6041b611425e8c7078357ae"
          }
        ],
        "present": true,
        "batchId": "character-modular-apron-001",
        "review": "failed-silhouette-and-foot-leakage",
        "runtimeQa": "failed-needs-remediation",
        "remoteVerified": true,
        "qaEvidence": "planning/art-qa/character-modular-apron-001.png",
        "qaEvidencePresent": true,
        "runtimeBound": false,
        "productionComplete": false,
        "status": "qa_failed_needs_remediation"
      }
    ],
    "productionSlotCatalogs": {
      "faces": [
        "warm",
        "angular",
        "round",
        "mature",
        "soft",
        "freckled"
      ],
      "shirts": [
        "classic-button-up",
        "service-polo",
        "chef-coat",
        "manager-jacket",
        "utility-shirt",
        "casual-tee"
      ],
      "pants": [
        "service-slacks",
        "chef-check-trousers",
        "utility-cargo",
        "dark-jeans",
        "tailored-skirt",
        "service-shorts"
      ],
      "aprons": [
        "waist-apron",
        "bib-apron",
        "cross-back-apron",
        "waterproof-apron"
      ],
      "shoes": [
        "economy-nonslip",
        "compression-service",
        "kitchen-clog",
        "utility-boot"
      ],
      "hair": [
        "buzz",
        "short",
        "side-part",
        "curly",
        "coily",
        "locs",
        "braids",
        "bob",
        "ponytail",
        "bun",
        "long"
      ],
      "facialHair": [
        "stubble",
        "mustache",
        "goatee",
        "short-beard",
        "full-beard"
      ],
      "headwear": [
        "chef-toque",
        "cook-cap",
        "service-visor",
        "hairnet",
        "head-scarf"
      ],
      "eyewear": [
        "rectangular-glasses",
        "round-glasses",
        "sunglasses",
        "safety-glasses"
      ],
      "accessories": [
        "name-badge",
        "earpiece",
        "wristwatch",
        "neck-scarf",
        "bracelet"
      ],
      "roleLayers": [
        "manager",
        "owner",
        "server",
        "dishwasher",
        "chef",
        "cook",
        "host-busser"
      ]
    },
    "requiredSplitLayerBodyFits": 126,
    "equippableAttachmentIds": [
      "economy-nonslip-shoes",
      "compression-service-shoes",
      "magnetic-pocket-flashlight",
      "manager-service-clipboard",
      "manager-radio-headset",
      "manager-floor-plan-folio",
      "manager-recovery-cards",
      "owner-leather-ledger",
      "owner-operations-tablet",
      "owner-lease-calculator",
      "owner-tasting-notebook",
      "server-click-pen",
      "server-waterproof-order-pad",
      "server-waiters-corkscrew",
      "server-cork-tray",
      "dish-high-pressure-nozzle",
      "dish-silicone-rack-hook",
      "dish-digital-test-reader",
      "dish-steam-gauntlets",
      "chef-forged-knife",
      "chef-folding-thermometer",
      "chef-plating-tweezers",
      "chef-tasting-spoon-wallet",
      "cook-fish-turner",
      "cook-four-channel-timer",
      "cook-bottle-holster",
      "cook-chainmail-cut-glove",
      "host-reservation-book",
      "host-seating-tablet",
      "host-brass-crumb-scraper",
      "host-bus-tub-harness"
    ],
    "requiredEquipmentAttachmentBodyFits": 62,
    "requiredActivityBindings": 89,
    "presentActivityBindings": 0,
    "runtimeBound": false,
    "launchApplicability": {
      "schemaVersion": 1,
      "id": "character-launch-applicability-v1",
      "status": "binding-launch-denominator",
      "purpose": "Freeze every launch character-art applicability axis so body animation cells, modular design fits, runtime raster channels, equipment attachments, and activity bindings can be tracked without an inferred or moving denominator.",
      "catalogLocks": [
        {
          "path": "planning/character-art-catalog.json",
          "sha256": "7ac538bf8889e7c1c8cf7e8873e37dbcefdc4871c1450d7eb935bb3b0028067f"
        },
        {
          "path": "packages/game-data/core/activities.json",
          "sha256": "bf1d441c53576f7d15f3ca777f2db1d40c7a4fab2c9bd4ba33b1ffec389b3b47"
        },
        {
          "path": "packages/game-data/core/role-equipment.json",
          "sha256": "3a683fe70e1ba0e04c2212d44b85492c6777d70c0acff5e8b0cb678dd22337a1"
        },
        {
          "path": "packages/game-data/core/appearance.json",
          "sha256": "4f24bb7d0a73bfdb371f113625eb3a9d66ad7ceb17c7a82d781447ab23f046c0"
        },
        {
          "path": "packages/game-data/core/roles.json",
          "sha256": "9b29b0e265b150c53ab461087b71a9e908bc49bd387f862bc88b685eb8544fd4"
        }
      ],
      "countingSemantics": {
        "animationSet": "One body-presentation plus animation-clip design unit. This is not a raster count.",
        "poseCell": "One visible design at one body presentation, animation clip, final frame, and direction before diffuse or mask channels are split.",
        "runtimeRasterCell": "One pose cell in one required runtime channel. Diffuse and each mask are separate raster cells.",
        "bodyFitUnit": "One visible modular design or equippable item fitted to one body presentation. It is a design and QA unit, not a raster count.",
        "sourcePoseCell": "One authored key/source pose before the required in-between final frames are authored. Source poses never satisfy final-frame completion.",
        "requiredOccludedCell": "A direction/frame remains required even when the layer is fully self-occluded; the reviewed cell may be transparent, but it may not be omitted or counted as completed merely because a file exists.",
        "nonApplicable": "A combination deliberately outside raster production. Each such exclusion is listed explicitly below and must not enter a completion denominator."
      },
      "axes": {
        "bodyPresentations": [
          "base-a",
          "base-b"
        ],
        "directions": [
          "north",
          "north_east",
          "east",
          "south_east",
          "south",
          "south_west",
          "west",
          "north_west"
        ],
        "animations": [
          {
            "id": "idle",
            "frames": 4,
            "sourcePoseFrames": 1,
            "loop": true
          },
          {
            "id": "walk",
            "frames": 8,
            "sourcePoseFrames": 4,
            "loop": true
          },
          {
            "id": "carry",
            "frames": 4,
            "sourcePoseFrames": 2,
            "loop": true
          },
          {
            "id": "greet",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "order-pos",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "pour",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "deliver",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "clear",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "wipe",
            "frames": 8,
            "sourcePoseFrames": 4,
            "loop": true
          },
          {
            "id": "sweep",
            "frames": 8,
            "sourcePoseFrames": 4,
            "loop": true
          },
          {
            "id": "mop",
            "frames": 8,
            "sourcePoseFrames": 4,
            "loop": true
          },
          {
            "id": "scrub",
            "frames": 8,
            "sourcePoseFrames": 4,
            "loop": true
          },
          {
            "id": "scrape",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": true
          },
          {
            "id": "rack",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": true
          },
          {
            "id": "load",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "unload",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "polish",
            "frames": 8,
            "sourcePoseFrames": 4,
            "loop": true
          },
          {
            "id": "chop",
            "frames": 8,
            "sourcePoseFrames": 4,
            "loop": true
          },
          {
            "id": "stir",
            "frames": 8,
            "sourcePoseFrames": 4,
            "loop": true
          },
          {
            "id": "flip",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "plate",
            "frames": 8,
            "sourcePoseFrames": 4,
            "loop": true
          },
          {
            "id": "inspect",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "open",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "pick-up",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "put-down",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          },
          {
            "id": "react",
            "frames": 6,
            "sourcePoseFrames": 3,
            "loop": false
          }
        ],
        "bodyRuntimeChannels": [
          "skin-diffuse",
          "skin-mask"
        ],
        "anchorNames": [
          "floor-origin",
          "head",
          "torso",
          "dominant-hand",
          "off-hand",
          "waist",
          "left-foot",
          "right-foot"
        ]
      },
      "globalStateBindings": {
        "stationary": "idle",
        "navigation": "walk",
        "rule": "Idle and walk are global movement-state bindings. Every activity has one separate primary task clip below."
      },
      "modularVisibleLayers": [
        {
          "id": "faces",
          "source": "slotCatalogs.faces",
          "choices": [
            "warm",
            "angular",
            "round",
            "mature",
            "soft",
            "freckled"
          ],
          "noRasterChoices": [],
          "runtimeChannels": [
            "diffuse",
            "skin-mask"
          ],
          "anchorRegion": "head",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 12,
          "finalPoseCells": 16320,
          "runtimeRasterCells": 32640
        },
        {
          "id": "shirts",
          "source": "slotCatalogs.shirts",
          "choices": [
            "classic-button-up",
            "service-polo",
            "chef-coat",
            "manager-jacket",
            "utility-shirt",
            "casual-tee"
          ],
          "noRasterChoices": [],
          "runtimeChannels": [
            "diffuse",
            "primary-mask",
            "secondary-mask"
          ],
          "anchorRegion": "torso-and-arms",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 12,
          "finalPoseCells": 16320,
          "runtimeRasterCells": 48960
        },
        {
          "id": "pants",
          "source": "slotCatalogs.pants",
          "choices": [
            "service-slacks",
            "chef-check-trousers",
            "utility-cargo",
            "dark-jeans",
            "tailored-skirt",
            "service-shorts"
          ],
          "noRasterChoices": [],
          "runtimeChannels": [
            "diffuse",
            "primary-mask",
            "secondary-mask"
          ],
          "anchorRegion": "waist-and-legs",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 12,
          "finalPoseCells": 16320,
          "runtimeRasterCells": 48960
        },
        {
          "id": "aprons",
          "source": "slotCatalogs.aprons",
          "choices": [
            "waist-apron",
            "bib-apron",
            "cross-back-apron",
            "waterproof-apron"
          ],
          "noRasterChoices": [],
          "runtimeChannels": [
            "diffuse",
            "primary-mask",
            "secondary-mask"
          ],
          "anchorRegion": "torso-waist-and-legs",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 8,
          "finalPoseCells": 10880,
          "runtimeRasterCells": 32640
        },
        {
          "id": "shoes",
          "source": "slotCatalogs.shoes",
          "choices": [
            "economy-nonslip",
            "compression-service",
            "kitchen-clog",
            "utility-boot"
          ],
          "noRasterChoices": [],
          "runtimeChannels": [
            "diffuse",
            "primary-mask",
            "secondary-mask"
          ],
          "anchorRegion": "feet",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 8,
          "finalPoseCells": 10880,
          "runtimeRasterCells": 32640
        },
        {
          "id": "headwear",
          "source": "slotCatalogs.headwear",
          "choices": [
            "chef-toque",
            "cook-cap",
            "service-visor",
            "hairnet",
            "head-scarf"
          ],
          "noRasterChoices": [],
          "runtimeChannels": [
            "diffuse",
            "primary-mask",
            "secondary-mask"
          ],
          "anchorRegion": "head",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 10,
          "finalPoseCells": 13600,
          "runtimeRasterCells": 40800
        },
        {
          "id": "eyewear",
          "source": "slotCatalogs.eyewear",
          "choices": [
            "rectangular-glasses",
            "round-glasses",
            "sunglasses",
            "safety-glasses"
          ],
          "noRasterChoices": [],
          "runtimeChannels": [
            "diffuse",
            "primary-mask"
          ],
          "anchorRegion": "head",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 8,
          "finalPoseCells": 10880,
          "runtimeRasterCells": 21760
        },
        {
          "id": "accessories",
          "source": "slotCatalogs.accessories",
          "choices": [
            "name-badge",
            "earpiece",
            "wristwatch",
            "neck-scarf",
            "bracelet"
          ],
          "noRasterChoices": [],
          "runtimeChannels": [
            "diffuse",
            "primary-mask"
          ],
          "anchorRegion": "choice-specific",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 10,
          "finalPoseCells": 13600,
          "runtimeRasterCells": 27200
        },
        {
          "id": "roleLayers",
          "source": "roleLayers",
          "choices": [
            "manager",
            "owner",
            "server",
            "dishwasher",
            "chef",
            "cook",
            "host-busser"
          ],
          "noRasterChoices": [],
          "runtimeChannels": [
            "diffuse",
            "primary-mask",
            "secondary-mask"
          ],
          "anchorRegion": "torso-waist-and-limbs",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 14,
          "finalPoseCells": 19040,
          "runtimeRasterCells": 57120
        },
        {
          "id": "hairStyles",
          "source": "hairStyles",
          "choices": [
            "buzz",
            "short",
            "side-part",
            "curly",
            "coily",
            "locs",
            "braids",
            "bob",
            "ponytail",
            "bun",
            "long"
          ],
          "noRasterChoices": [
            "bald"
          ],
          "runtimeChannels": [
            "diffuse",
            "primary-mask"
          ],
          "anchorRegion": "head-and-shoulders",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 22,
          "finalPoseCells": 29920,
          "runtimeRasterCells": 59840
        },
        {
          "id": "facialHair",
          "source": "facialHair",
          "choices": [
            "stubble",
            "mustache",
            "goatee",
            "short-beard",
            "full-beard"
          ],
          "noRasterChoices": [
            "none"
          ],
          "runtimeChannels": [
            "diffuse",
            "primary-mask"
          ],
          "anchorRegion": "head",
          "requiresEveryAnimationFrame": true,
          "requiresEveryDirection": true,
          "bodyFitUnits": 10,
          "finalPoseCells": 13600,
          "runtimeRasterCells": 27200
        }
      ],
      "equipmentAttachments": {
        "policy": "Every kind=equipment catalog item requires a binding for both body presentations. Deforming worn items require every animation frame; rigid items reuse one reviewed directional raster through per-frame anchors; footwear aliases reuse the independently swappable shoe layer. Consumables have no persistent avatar attachment.",
        "groups": [
          {
            "id": "footwear-layer-alias",
            "rasterRule": "alias-existing-layer",
            "anchors": [
              "left-foot",
              "right-foot"
            ],
            "runtimeChannels": [],
            "itemIds": [
              "economy-nonslip-shoes",
              "compression-service-shoes"
            ],
            "aliases": {
              "economy-nonslip-shoes": "economy-nonslip",
              "compression-service-shoes": "compression-service"
            }
          },
          {
            "id": "deforming-worn-hands",
            "rasterRule": "full-frame-deforming",
            "anchors": [
              "dominant-hand",
              "off-hand"
            ],
            "runtimeChannels": [
              "diffuse"
            ],
            "itemIds": [
              "dish-steam-gauntlets",
              "cook-chainmail-cut-glove"
            ]
          },
          {
            "id": "deforming-worn-harness",
            "rasterRule": "full-frame-deforming",
            "anchors": [
              "torso",
              "dominant-hand",
              "off-hand"
            ],
            "runtimeChannels": [
              "diffuse"
            ],
            "itemIds": [
              "host-bus-tub-harness"
            ]
          },
          {
            "id": "rigid-head",
            "rasterRule": "directional-rigid-anchor-reuse",
            "anchors": [
              "head"
            ],
            "runtimeChannels": [
              "diffuse"
            ],
            "itemIds": [
              "manager-radio-headset"
            ]
          },
          {
            "id": "rigid-torso-waist",
            "rasterRule": "directional-rigid-anchor-reuse",
            "anchors": [
              "torso",
              "waist"
            ],
            "runtimeChannels": [
              "diffuse"
            ],
            "itemIds": [
              "magnetic-pocket-flashlight",
              "chef-tasting-spoon-wallet",
              "cook-four-channel-timer",
              "cook-bottle-holster"
            ]
          },
          {
            "id": "rigid-handheld",
            "rasterRule": "directional-rigid-anchor-reuse",
            "anchors": [
              "dominant-hand",
              "off-hand"
            ],
            "runtimeChannels": [
              "diffuse"
            ],
            "itemIds": [
              "manager-service-clipboard",
              "manager-floor-plan-folio",
              "manager-recovery-cards",
              "owner-leather-ledger",
              "owner-operations-tablet",
              "owner-lease-calculator",
              "owner-tasting-notebook",
              "server-click-pen",
              "server-waterproof-order-pad",
              "server-waiters-corkscrew",
              "server-cork-tray",
              "dish-high-pressure-nozzle",
              "dish-silicone-rack-hook",
              "dish-digital-test-reader",
              "chef-forged-knife",
              "chef-folding-thermometer",
              "chef-plating-tweezers",
              "cook-fish-turner",
              "host-reservation-book",
              "host-seating-tablet",
              "host-brass-crumb-scraper"
            ]
          }
        ],
        "nonPersistentCatalogItemIds": [
          "manager-morale-candy-tin",
          "manager-incident-seal-kit",
          "owner-networking-cards",
          "owner-market-scout-pass",
          "server-palate-mints",
          "server-stain-rescue-pen",
          "dish-enzymatic-detergent",
          "dish-deliming-pouch",
          "chef-diamond-sharpening-strip",
          "chef-palate-rinse",
          "cook-pan-seasoning-wipe",
          "cook-burn-gel-sachet",
          "host-sanitizer-caddy-refill",
          "host-guest-activity-pack"
        ]
      },
      "activityPrimaryClips": {
        "manager-lineup-deployment": "order-pos",
        "manager-operations-board": "inspect",
        "manager-seating-throttle": "order-pos",
        "manager-labor-breaks": "order-pos",
        "manager-guest-recovery": "greet",
        "manager-comp-void-control": "order-pos",
        "manager-sanitation-walk": "inspect",
        "manager-incident-command": "react",
        "manager-incident-reconstruction": "inspect",
        "manager-coaching-intervention": "greet",
        "manager-close-control": "inspect",
        "owner-cash-runway": "order-pos",
        "owner-capital-portfolio": "order-pos",
        "owner-vendor-negotiation": "greet",
        "owner-purchase-authorization": "order-pos",
        "owner-menu-engineering": "inspect",
        "owner-brand-watch": "inspect",
        "owner-policy-desk": "order-pos",
        "owner-maintenance-portfolio": "inspect",
        "owner-community-hosting": "greet",
        "owner-insurance-lease": "order-pos",
        "owner-site-expansion": "inspect",
        "server-party-pre-read": "inspect",
        "server-contextual-greeting": "greet",
        "server-beverage-discovery": "greet",
        "server-pour-setup": "pour",
        "server-menu-interview": "greet",
        "server-seat-order": "order-pos",
        "server-allergy-confirmation": "order-pos",
        "server-course-conductor": "react",
        "server-tray-route": "carry",
        "server-delivery-seat-match": "deliver",
        "server-two-bite-check": "greet",
        "server-attention-circuit": "walk",
        "server-recovery-conversation": "greet",
        "server-dessert-check-read": "greet",
        "server-split-payment": "order-pos",
        "server-checkout-handoff": "order-pos",
        "dishwasher-intake-triage": "inspect",
        "dishwasher-scrape-waste": "scrape",
        "dishwasher-soil-treatment": "scrub",
        "dishwasher-rack-geometry": "rack",
        "dishwasher-machine-setup": "load",
        "dishwasher-cycle-cadence": "rack",
        "dishwasher-clean-inspection": "inspect",
        "dishwasher-pit-priority": "order-pos",
        "dishwasher-clean-distribution": "carry",
        "dishwasher-specialty-ware": "polish",
        "dishwasher-breakage-containment": "react",
        "dishwasher-preventative-maintenance": "open",
        "dishwasher-pit-close": "unload",
        "chef-line-check": "inspect",
        "chef-ticket-rail": "order-pos",
        "chef-call-acknowledgment": "react",
        "chef-pickup-orchestration": "deliver",
        "chef-plate-inspection": "inspect",
        "chef-taste-calibration": "inspect",
        "chef-refire-recovery": "react",
        "chef-availability-control": "order-pos",
        "chef-haccp-decision": "inspect",
        "chef-yield-order-guide": "order-pos",
        "chef-waste-review": "inspect",
        "chef-kitchen-coaching": "greet",
        "cook-product-rotation": "inspect",
        "cook-mise-plan": "order-pos",
        "cook-knife-prep": "chop",
        "cook-batch-scaling": "stir",
        "cook-station-setup": "put-down",
        "cook-heat-control": "flip",
        "cook-doneness-read": "inspect",
        "cook-allergy-lane": "order-pos",
        "cook-pickup-sync": "react",
        "cook-plating-assembly": "plate",
        "cook-clean-as-you-go": "wipe",
        "cook-equipment-anomaly": "open",
        "cook-station-handoff": "greet",
        "host-busser-reservation-graph": "order-pos",
        "host-busser-wait-forecast": "inspect",
        "host-busser-arrival-dialogue": "greet",
        "host-busser-seating-graph": "order-pos",
        "host-busser-escort-handoff": "walk",
        "host-busser-table-combine": "pick-up",
        "host-busser-room-scan": "inspect",
        "host-busser-prebus-circuit": "clear",
        "host-busser-stack-balance": "carry",
        "host-busser-reset-sequence": "put-down",
        "host-busser-spill-containment": "mop",
        "host-busser-restroom-entry-standard": "inspect",
        "host-busser-closing-room": "sweep"
      },
      "nonApplicableCombinations": [
        {
          "id": "skin-tone-raster-duplicates",
          "classification": "shader-only",
          "choiceCount": 10,
          "excludedDuplicatePoseCells": 27200,
          "reason": "Ten catalog skin tones are shader palettes applied through the required skin mask; they do not create ten copies of each body raster."
        },
        {
          "id": "appearance-palette-raster-duplicates",
          "classification": "shader-only",
          "choiceCount": 6,
          "reason": "Six appearance palettes drive primary and secondary masks; they are not separate garment raster designs."
        },
        {
          "id": "absence-layer-cells",
          "classification": "intentional-empty-selection",
          "choices": [
            "hairStyles:bald",
            "facialHair:none"
          ],
          "excludedPoseCells": 5440,
          "reason": "Bald and no-facial-hair are valid selections represented by the absence of a visible layer."
        },
        {
          "id": "prototype-outfit-composite-duplicates",
          "classification": "composite-recipe-only",
          "choices": [
            "classic",
            "apron"
          ],
          "excludedBodyFitUnits": 4,
          "reason": "Prototype combined outfit silhouettes are preservation evidence, not additional independently swappable launch layers."
        },
        {
          "id": "appearance-outfit-silhouette-duplicates",
          "classification": "composite-recipe-only",
          "choices": [
            "classic",
            "apron",
            "chef-coat",
            "manager-jacket",
            "utility"
          ],
          "reason": "Appearance silhouettes are recipes assembled from split layers and do not add raster choices to the split-layer denominator."
        },
        {
          "id": "consumable-persistent-attachments",
          "classification": "non-persistent-item",
          "choiceCount": 14,
          "excludedBodyFitUnits": 28,
          "reason": "Kind=consumable items can trigger generic effects but are not persistently equipped on the avatar."
        },
        {
          "id": "footwear-equipment-duplicate-raster",
          "classification": "existing-layer-alias",
          "choiceCount": 2,
          "excludedDirectionalRasterCells": 32,
          "reason": "The two equipment footwear items bind to their matching shoe-layer designs rather than duplicating equipment attachment rasters."
        },
        {
          "id": "rigid-equipment-frame-raster-duplicates",
          "classification": "anchor-reused",
          "choiceCount": 26,
          "excludedPerFrameRasterCells": 70720,
          "reason": "Rigid equipment has one body-fitted raster per direction. The base body supplies reviewed per-frame anchors, so duplicating the rigid bitmap for every animation frame is non-applicable."
        },
        {
          "id": "role-specific-body-or-layer-raster-duplicates",
          "classification": "runtime-selection-only",
          "reason": "Body presentations and shared modular choices do not duplicate by role. Role permissions select combinations at runtime; the seven role-layer designs are already counted once per body fit."
        },
        {
          "id": "generic-effects-body-frame-duplicates",
          "classification": "separate-environment-lane",
          "choices": [
            "contact-shadow",
            "selection-ring",
            "steam-puff",
            "service-sparkles"
          ],
          "reason": "Generic effects are tracked as reusable environment assets and runtime bindings, not duplicated across character bodies, directions, or frames."
        }
      ],
      "contractBoundary": {
        "activityBindingGranularity": "Exactly one primary task clip per current activity, plus global idle/navigation bindings. The current activity schema has no phase-level animation-tag field, so phase choreography is not part of this launch denominator.",
        "runtimePackaging": "Atlas versus per-frame file packaging does not change any cell total. Every cell and channel must still be authored, visually reviewed in a runtime composite at gameplay scale, runtime-bound, remotely verified, and CI-green.",
        "effects": "The four generic effect rasters remain in the environment-art lane; character runtime tests must bind them without duplicating them by appearance combination.",
        "occlusion": "No direction is silently removed for face, hair, clothing, or accessories. Fully self-occluded cells remain required and are accepted only after composite review."
      },
      "totals": {
        "bodyPresentationCount": 2,
        "directionCount": 8,
        "animationClipCount": 26,
        "animationSetDesignUnits": 52,
        "finalFramesPerBodyDirection": 170,
        "sourcePoseFramesPerBodyDirection": 84,
        "baseBodySourcePoseCells": 1344,
        "baseBodyFinalPoseCells": 2720,
        "baseBodyRuntimeRasterCells": 5440,
        "anchorNamesPerBodyPoseCell": 8,
        "requiredAnchorRecords": 21760,
        "visibleModularChoiceCount": 63,
        "intentionalEmptyModularChoiceCount": 2,
        "modularBodyFitDesignUnits": 126,
        "modularSourcePoseCells": 84672,
        "modularFinalPoseCells": 171360,
        "modularRuntimeRasterCells": 429760,
        "equippableItemCount": 31,
        "consumableNoPersistentAttachmentCount": 14,
        "equipmentAttachmentBodyFitUnits": 62,
        "equipmentFrameBindingCombinations": 84320,
        "equipmentAliasItemCount": 2,
        "equipmentDeformingItemCount": 3,
        "equipmentRigidItemCount": 26,
        "equipmentDeformingRuntimeRasterCells": 8160,
        "equipmentRigidRuntimeRasterCells": 416,
        "equipmentRuntimeRasterCells": 8576,
        "activityCount": 89,
        "activityPrimaryBindingCount": 89,
        "totalSourceRuntimeRasterCells": 219488,
        "totalFinalRuntimeRasterCells": 443776
      }
    }
  },
  "reviewedBatches": [
    {
      "id": "furniture-pilot-001",
      "assets": [
        "furniture-six-burner-range"
      ],
      "files": 4,
      "qa": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "sourcePromptMode": "built-in image generation; one combined 2x2 sheet",
      "remoteCommit": "1977c47e13190e639ec5f12b8bfec2cb5a44c540",
      "remoteTree": "ead4914a85cb1bde218300f85c2a196acf51a47f",
      "qaEvidence": "planning/art-qa/furniture-pilot-001.png",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "character-foundation-001",
      "assets": [
        "body-base-a-idle-isometric"
      ],
      "files": 8,
      "qa": "passed",
      "runtimeQa": "blocked-anchor-and-chroma-normalization",
      "sourcePromptMode": "built-in image generation; one combined 4x2 elevated eight-direction atlas",
      "remoteCommit": "8f450ae29adc0005a81359466c36c5b24465589a",
      "remoteTree": "81a48b83d643db5abe8f3e4b8ef5a5e45b242e9c",
      "qaEvidence": "planning/art-qa/character-foundation-001.png",
      "notes": "Accepted as an elevated source foundation, not a complete animated runtime body. Feet/origin normalization and every required animation remain open.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "character-foundation-002",
      "assets": [
        "body-base-b-idle-isometric"
      ],
      "files": 8,
      "qa": "passed",
      "runtimeQa": "blocked-anchor-and-chroma-normalization",
      "sourcePromptMode": "built-in image generation; one combined 4x2 elevated eight-direction atlas",
      "remoteCommit": "027c5c5a7b9e966e5a9de07f832d40a83cfae516",
      "remoteTree": "d2a78376f22e3bcae200e1ec707884e3d5c2bf0e",
      "qaEvidence": "planning/art-qa/character-foundation-002.png",
      "notes": "Accepted as an elevated source foundation, not a complete animated runtime body. Feet/origin normalization and every required animation remain open.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "character-modular-classic-001",
      "assets": [
        "body-skin-masks-base-a",
        "body-skin-masks-base-b",
        "outfit-classic-base-a",
        "outfit-classic-base-b"
      ],
      "files": 80,
      "qa": "mixed",
      "runtimeQa": "failed-needs-remediation",
      "assetReviews": {
        "body-skin-masks-base-a": "passed-source-foundation",
        "body-skin-masks-base-b": "passed-source-foundation",
        "outfit-classic-base-a": "failed-silhouette-leakage",
        "outfit-classic-base-b": "failed-silhouette-leakage"
      },
      "sourcePromptMode": "built-in image generation; identity-preserving 4x2 edits with local chroma removal, direction correction, body-anchor fitting, and red/blue tint extraction",
      "remoteCommit": "d99c458cadf3534299bada040d235d07980ed477",
      "remoteTree": "28a0d13faf87a59a2684ec4727dfe849809b07e8",
      "qaEvidence": "planning/art-qa/character-modular-classic-001.png",
      "notes": "Preserved as a pose-locked prototype outfit family. It does not satisfy the final independently swappable shirt/pants/apron slot matrix or animated-frame contract until composite QA and skin-protection gates pass.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "character-modular-apron-001",
      "assets": [
        "outfit-apron-base-a",
        "outfit-apron-base-b"
      ],
      "files": 48,
      "qa": "failed",
      "runtimeQa": "failed-needs-remediation",
      "assetReviews": {
        "outfit-apron-base-a": "failed-silhouette-and-foot-leakage",
        "outfit-apron-base-b": "failed-silhouette-and-foot-leakage"
      },
      "sourcePromptMode": "built-in image generation; identity-preserving 4x2 edits with local chroma removal, body-anchor fitting, and red/blue tint extraction",
      "remoteCommit": "f01c1e1f9b73e9dfe30c18d38f0bfc3c7979e2a8",
      "remoteTree": "ec7814a6bde1517746831dab8d43e6d61ed2b70c",
      "qaEvidence": "planning/art-qa/character-modular-apron-001.png",
      "notes": "Preserved as a pose-locked prototype outfit family. It does not satisfy the final independently swappable shirt/pants/apron slot matrix or animated-frame contract until composite QA and skin-protection gates pass.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "equipment-icons-shared-manager-001",
      "assets": [
        "economy-nonslip-shoes",
        "compression-service-shoes",
        "magnetic-pocket-flashlight",
        "manager-service-clipboard",
        "manager-radio-headset",
        "manager-floor-plan-folio",
        "manager-recovery-cards",
        "manager-morale-candy-tin"
      ],
      "files": 19,
      "qa": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "sourcePromptMode": "built-in image generation; eight bespoke isolated item generations with chroma removal, alpha cleanup, and centered 128x128 runtime processing",
      "remoteCommit": "c2158fc261b1ebff9fb5cf2cbff932254593a914",
      "remoteTree": "e533bccc199ea14378258d58da49d31d43be18a9",
      "qaEvidence": "planning/art-qa/equipment-icons-shared-manager-001/contact-128-dark.png",
      "qaManifest": "planning/art-qa/equipment-icons-shared-manager-001/qa.json",
      "notes": "Eight distinct icons passed full-size and 66px review, exact catalog mapping, unique-content hashing, sRGBA/alpha validation, and a minimum six-pixel transparent margin. High-resolution accepted sources are preserved in the same remote checkpoint.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "furniture-core-directional-001",
      "assets": [
        "table-two",
        "table-four",
        "host-stand"
      ],
      "files": 20,
      "qa": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "sourcePromptMode": "built-in image generation; identity-referenced rigid four-direction elevated isometric sets with chroma removal and common-pivot normalization",
      "remoteCommit": "9daba41c16eb4803f90a9792535129ddb4844b7c",
      "remoteTree": "9127f0d6644894f6e87714cc51c33f1b08281504",
      "qaEvidence": "planning/art-qa/furniture-core-directional-001/contact-627-dark.png",
      "qaManifest": "planning/art-qa/furniture-core-directional-001/qa.json",
      "notes": "Three source-accepted sets share a 627x627 canvas, common y=590 floor-contact baseline, four coherent directions, unique hashes, transparent corners, and full/gameplay-scale review. Runtime directional binding remains required before production completion.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "equipment-icons-owner-server-002",
      "assets": [
        "manager-incident-seal-kit",
        "owner-leather-ledger",
        "owner-operations-tablet",
        "owner-lease-calculator",
        "owner-tasting-notebook",
        "owner-networking-cards",
        "owner-market-scout-pass",
        "server-click-pen"
      ],
      "files": 19,
      "qa": "passed",
      "runtimeQa": "passed-full-and-gameplay-scale",
      "sourcePromptMode": "built-in image generation; eight bespoke isolated item generations with chroma removal, alpha cleanup, and centered 128x128 runtime processing",
      "remoteCommit": "0eec73ba38ba302728893459f39421580e82c78f",
      "remoteTree": "217a1407d5f573286531c36abd6ef03fedfbf769",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30971460656",
      "qaEvidence": "planning/art-qa/equipment-icons-owner-server-002/contact-128-dark.png",
      "qaManifest": "planning/art-qa/equipment-icons-owner-server-002/qa.json",
      "notes": "Eight distinct manager, owner, and server icons passed full-size and 66px review, exact catalog mapping, unique-content and cross-batch hashing, sRGBA/alpha validation, and a minimum six-pixel transparent margin. High-resolution accepted sources are preserved in the same remote checkpoint.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "character-remediation-idle-classic-v1",
      "assets": [
        "body-base-a-idle-isometric",
        "body-base-b-idle-isometric",
        "body-skin-masks-base-a",
        "body-skin-masks-base-b",
        "outfit-classic-base-a",
        "outfit-classic-base-b"
      ],
      "files": 109,
      "qa": "passed",
      "runtimeQa": "blocked-static-idle-and-no-runtime-compositor",
      "sourcePromptMode": "pose-locked built-in image edits plus deterministic alpha extraction, pivot normalization, tint-mask reconstruction, and byte-reproducible processing",
      "remoteCommit": "7b2caaf6843e2d1b895870a80103eff57227d15e",
      "remoteTree": "3892dcc335490ff767d8e17d39a4b5b8b9236a6a",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30973906887",
      "qaEvidence": "planning/art-qa/character-remediation-idle-classic-v1/classic-composites-full.png",
      "qaManifest": "planning/art-qa/character-remediation-idle-classic-v1/qa.json",
      "notes": "Two elevated body presentations, normalized skin foundations, and two classic idle outfit body-fits pass exact raster hashes, byte reproduction, a common (192,472) pivot, zero leakage/occlusion gates, and full/gameplay composite review. Static idle art, combined classic clothing, and absent Godot character compositing/animation keep production completion at zero.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "equipment-icons-server-dish-003",
      "assets": [
        "server-waterproof-order-pad",
        "server-waiters-corkscrew",
        "server-cork-tray",
        "server-palate-mints",
        "server-stain-rescue-pen",
        "dish-high-pressure-nozzle",
        "dish-silicone-rack-hook",
        "dish-digital-test-reader"
      ],
      "files": 20,
      "qa": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "sourcePromptMode": "built-in image generation; eight bespoke isolated item generations with chroma removal, alpha cleanup, and centered 128x128 runtime processing",
      "remoteCommit": "f3408b8f5896f19a7f0a6ffb93843ea818af5ede",
      "remoteTree": "5a12a7d1bc622ca2e45c8c3e99b3b6449e5a8b75",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30975812146",
      "qaEvidence": "planning/art-qa/equipment-icons-server-dish-003/contact-128-dark.png",
      "qaManifest": "planning/art-qa/equipment-icons-server-dish-003/qa.json",
      "notes": "Eight distinct server and dish icons pass full-size, 66px, semantic, exact-catalog, alpha, margin, unique-content, and all-24 cross-batch comparison gates. Their exact 20-file package is remotely verified with green Windows and Ubuntu CI.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "equipment-icons-dish-chef-004",
      "assets": [
        "dish-steam-gauntlets",
        "dish-enzymatic-detergent",
        "dish-deliming-pouch",
        "chef-forged-knife",
        "chef-folding-thermometer",
        "chef-plating-tweezers",
        "chef-tasting-spoon-wallet",
        "chef-diamond-sharpening-strip"
      ],
      "files": 20,
      "qa": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "sourcePromptMode": "built-in image generation; eight bespoke isolated item generations with chroma removal, alpha cleanup, and centered 128x128 runtime processing",
      "remoteCommit": "961fc31230a900ccc7c028a3ae312809b2960b93",
      "remoteTree": "d2887339e7fc63c52d4549a1e6c6f8b8dfea41e6",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30976714776",
      "qaEvidence": "planning/art-qa/equipment-icons-dish-chef-004/contact-128-dark.png",
      "qaManifest": "planning/art-qa/equipment-icons-dish-chef-004/qa.json",
      "notes": "Eight distinct dish and chef icons pass full-size, 66px, semantic, exact-catalog, alpha, margin, unique-content, and all-32 cross-batch comparison gates. Their exact 20-file package is remotely verified with green Windows and Ubuntu CI.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "equipment-icons-chef-cook-host-005",
      "assets": [
        "chef-palate-rinse",
        "cook-fish-turner",
        "cook-four-channel-timer",
        "cook-bottle-holster",
        "cook-chainmail-cut-glove",
        "cook-pan-seasoning-wipe",
        "cook-burn-gel-sachet",
        "host-reservation-book"
      ],
      "files": 20,
      "qa": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "sourcePromptMode": "built-in image generation; eight bespoke isolated item generations with chroma removal, alpha cleanup, and centered 128x128 runtime processing",
      "remoteCommit": "e15aa0031a8477be68b022f5fcfbd6d30309fe9e",
      "remoteTree": "27350dbb6138e1e75d1fa56219a2509e3bf72924",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30977634704",
      "qaEvidence": "planning/art-qa/equipment-icons-chef-cook-host-005/contact-128-dark.png",
      "qaManifest": "planning/art-qa/equipment-icons-chef-cook-host-005/qa.json",
      "notes": "Eight distinct chef, cook, and host icons pass full-size, 66px, semantic, exact-catalog, alpha, margin, unique-content, and all-40 cross-batch comparison gates. Their exact 20-file package is remotely verified with green Windows and Ubuntu CI.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "equipment-icons-host-006",
      "assets": [
        "host-seating-tablet",
        "host-brass-crumb-scraper",
        "host-bus-tub-harness",
        "host-sanitizer-caddy-refill",
        "host-guest-activity-pack"
      ],
      "files": 14,
      "qa": "passed",
      "runtimeQa": "passed-full-gameplay-and-cross-batch-scale",
      "sourcePromptMode": "built-in image generation; five bespoke isolated item generations with chroma removal, alpha cleanup, and centered 128x128 runtime processing",
      "remoteCommit": "dd8c05995b39649132ff5ce8fad29a432f15cebc",
      "remoteTree": "7231193527236af6538c1d9fcd6e1d11184bdb7b",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30979027528",
      "qaEvidence": "planning/art-qa/equipment-icons-host-006/contact-128-dark.png",
      "qaManifest": "planning/art-qa/equipment-icons-host-006/qa.json",
      "notes": "The final five host icons pass full-size, 66px, semantic, exact-catalog, alpha, margin, unique-content, and all-45 cross-batch comparison gates. Their exact 14-file package is remotely verified with green Windows and Ubuntu CI.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "furniture-core-directional-002",
      "assets": [
        "booth",
        "banquette",
        "service-station"
      ],
      "files": 28,
      "qa": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "sourcePromptMode": "built-in image generation; identity-locked elevated four-direction sets with chroma removal, common-pivot normalization, rigid-count review, and full/gameplay-scale contact sheets",
      "remoteCommit": "daef2aa572f0f855ac95d92402b9af19cc76bc9f",
      "remoteTree": "36fbf6d8740e2f07f29527ff6e506cf541684b51",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30980689257",
      "qaEvidence": "planning/art-qa/furniture-core-directional-002/contact-627-dark.png",
      "qaManifest": "planning/art-qa/furniture-core-directional-002/qa.json",
      "notes": "Booth, banquette, and service-station each pass exact catalog identity, coherent quarter-turns, 627x627 sRGBA, common y=590 floor-contact pivot, transparent-border, unique-content, full-scale, and 128px review. Their exact 28-file art/evidence package and runtime-contract integration are remotely verified with green Windows and Ubuntu CI. The elevated-isometric runtime is integrated; native gameplay capture and composite acceptance remain blocking.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "furniture-core-directional-003",
      "assets": [
        "range",
        "prep",
        "pass"
      ],
      "files": 28,
      "qa": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "sourcePromptMode": "built-in image generation; three separately prompted rigid 2x2 elevated-direction atlases with chroma removal, common-pivot normalization, exact feature-count review, and full/gameplay-scale contact sheets",
      "remoteCommit": "998a2e5bf5914debaa1a997de1fc19a275f0ff69",
      "remoteTree": "c95cdd7d0825bdbf6769a10a329aa5dc08ce8457",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30982693857",
      "qaEvidence": "planning/art-qa/furniture-core-directional-003/contact-627-dark.png",
      "qaManifest": "planning/art-qa/furniture-core-directional-003/qa.json",
      "notes": "Range, prep, and pass each pass exact catalog identity, coherent quarter-turns, 627x627 sRGBA, common y=590 floor-contact pivot, transparent-border, unique-content, full-scale, and 128px review. One rejected prep attempt remains hash-recorded but excluded. Their exact 28-file art/evidence package and runtime-contract integration are remotely verified with green Windows and Ubuntu CI. The elevated-isometric runtime is integrated; native gameplay capture and composite acceptance remain blocking.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "furniture-core-directional-004",
      "assets": [
        "espresso",
        "dish-machine",
        "mop-sink"
      ],
      "files": 28,
      "qa": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-002",
      "sourcePromptMode": "built-in image generation; three separately prompted identity-locked elevated four-direction atlases with chroma removal, common-pivot normalization, exact feature-count review, and full/gameplay-scale contact sheets",
      "remoteCommit": "708642ffce26407b44daa47d4029e434e6166368",
      "remoteTree": "9ee2f7817c4e9f11aae59bcf2ae469a6e126d4d4",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30985234904",
      "qaEvidence": "planning/art-qa/furniture-core-directional-004/contact-627-dark.png",
      "qaManifest": "planning/art-qa/furniture-core-directional-004/qa.json",
      "notes": "Espresso machine, dish machine, and mop sink each pass exact catalog identity, coherent quarter-turns, 627x627 sRGBA, common y=590 floor-contact pivot, transparent-border, unique-content, full-scale, and 128px review. Their exact 28-file art/evidence package and runtime-contract integration are remotely verified with green Windows and Ubuntu CI. The elevated-isometric runtime is integrated; native gameplay capture and composite acceptance remain blocking.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "furniture-core-directional-005",
      "assets": [
        "recycling",
        "pendants",
        "plants"
      ],
      "files": 28,
      "qa": "passed",
      "runtimeQa": "mixed-native-gameplay-composite-attempt-002-mount-blocked",
      "sourcePromptMode": "built-in image generation; identity-locked elevated four-direction atlases with targeted retries, chroma removal, common-pivot normalization, exact feature-count review, and full/gameplay-scale contact sheets",
      "remoteCommit": "565869f5c09529d5da7dc30c0a31c042669c5291",
      "remoteTree": "5bdfdc178b6ebf5ce9f7719f63a417391f4b9ef6",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30996475549",
      "qaEvidence": "planning/art-qa/furniture-core-directional-005/contact-627-dark.png",
      "qaManifest": "planning/art-qa/furniture-core-directional-005/qa.json",
      "notes": "Recycling station, pendant-light set, and herb wall each pass exact catalog identity, coherent quarter-turns, 627x627 sRGBA, common y=590 floor-contact pivot, transparent-border, unique-content, full-scale, and 128px review. Three rejected generator attempts remain hash-recorded but excluded. Their exact art, evidence, runtime-contract, and ledger bytes are remotely verified with green Windows and Ubuntu CI. The elevated-isometric runtime is integrated; native gameplay capture and composite acceptance remain blocking.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "furniture-core-directional-006",
      "assets": [
        "local-art",
        "furniture-oak-two-top",
        "furniture-walnut-four-top"
      ],
      "files": 28,
      "qa": "passed",
      "runtimeQa": "mixed-native-gameplay-composite-attempt-002-mount-blocked",
      "sourcePromptMode": "built-in image generation; three identity-locked elevated four-direction atlases with targeted camera/count corrections, chroma removal, common-pivot normalization, exact identity review, and full/gameplay-scale contact sheets",
      "remoteCommit": "185ca509f0d52aa3421686880ed94187ae77b35e",
      "remoteTree": "ef75c179d6c16b0159baa7d675fa870699721bd0",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30998050059",
      "qaEvidence": "planning/art-qa/furniture-core-directional-006/contact-627-dark.png",
      "qaManifest": "planning/art-qa/furniture-core-directional-006/qa.json",
      "notes": "Local print set, oak two-top, and walnut four-top each pass exact source identity, coherent quarter-turns, raster gates, and full/gameplay-scale contact review. Their 28-file source package is remotely verified with green Windows and Ubuntu CI. Native attempt 001 confirmed the floor furniture projection but rejected production completion because local-art lacks a wall-mount contract and always-on world labels collided with art.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    },
    {
      "id": "furniture-core-directional-007",
      "assets": [
        "furniture-banquette-section",
        "furniture-commercial-chair",
        "furniture-premium-chair"
      ],
      "files": 28,
      "qa": "passed",
      "runtimeQa": "passed-native-gameplay-composite-attempt-003",
      "sourcePromptMode": "built-in image generation; identity-referenced rigid four-direction elevated isometric sets with chroma removal and common-pivot normalization",
      "remoteCommit": "98e479eaa5afed6c95e0abe1026dfcf8e09e062a",
      "remoteTree": "bcfcb076d26c1d3b8a973dbe601c6a921563348b",
      "ci": "https://github.com/Maergoth/rro/actions/runs/31004267533",
      "qaEvidence": "planning/art-qa/furniture-core-directional-007/contact-627-dark.png",
      "qaManifest": "planning/art-qa/furniture-core-directional-007/qa.json",
      "notes": "Banquette section, commercial chair, and premium chair pass exact raster hashes, catalog identity, unique-content, alpha, common-pivot, full-resolution, 128px, and native four-rotation gameplay-composite review. Their exact 28-file source package and the attempt-003 review package are remotely verified with exact GitHub trees and green Windows and Ubuntu CI.",
      "qaEvidencePresent": true,
      "remoteVerified": true
    }
  ],
  "pendingBatches": [
    {
      "id": "furniture-core-directional-008",
      "assets": [
        "furniture-host-stand-pro",
        "furniture-server-station-pro",
        "furniture-pos-terminal"
      ],
      "files": 28,
      "qa": "passed",
      "runtimeQa": "pending-native-gameplay-composite",
      "sourcePromptMode": "built-in image generation; one separately prompted 2x2 rigid elevated-isometric rotation atlas per identity, with one targeted host-stand correction, chroma removal, common-pivot normalization, and full/gameplay-scale contact review",
      "qaEvidence": "planning/art-qa/furniture-core-directional-008/contact-627-dark.png",
      "qaManifest": "planning/art-qa/furniture-core-directional-008/qa.json",
      "notes": "Reservation host stand, integrated server station, and commercial POS terminal are source-accepted floor furniture sets with exact catalog identity, raster hashes, unique alpha content, common floor-contact pivots, and full-resolution plus 128px visual review. Remote preservation and an exact native Godot four-rotation gameplay composite remain required before runtime or production completion.",
      "qaEvidencePresent": true,
      "remoteVerified": false,
      "preservationPending": true
    }
  ],
  "runtimeQaAttempts": [
    {
      "id": "runtime-isometric-integration-001-attempt-001",
      "status": "failed-needs-remediation",
      "remoteCommit": "00f9a36dccf35ca2c82dbf2689d982749ab27f5c",
      "remoteTree": "7c95a33e679232e99cfc9cb472abfbb478fa3ae9",
      "ci": "https://github.com/Maergoth/rro/actions/runs/30999133497",
      "artifactId": 8927474963,
      "artifactSha256": "933842483b6a38a31eb9da837b665bd1799a320e343adb59b126564f815edbfd",
      "evidence": "planning/art-qa/runtime-isometric-integration-001/attempt-001/review.json",
      "passed": [
        "native-four-rotation-capture",
        "elevated-projection",
        "directional-selection",
        "floor-contact-pivots",
        "mixed-world-depth"
      ],
      "blockers": [
        "mounted-object-anchor-contract",
        "world-label-collision"
      ],
      "productionComplete": false,
      "evidencePresent": true,
      "reviewRemoteVerified": false
    },
    {
      "id": "runtime-isometric-integration-001-attempt-002",
      "status": "passed-partial-floor-assets",
      "remoteCommit": "24781e2f08acc97c0189d05af3b6a72285f2cfbd",
      "remoteTree": "8e9eba95e0c54de9e4513bc6474ff5c5c9722778",
      "ci": "https://github.com/Maergoth/rro/actions/runs/31000326415",
      "artifactId": 8927966443,
      "artifactSha256": "fba441164880464b7a240bcc10ce1a02e70f688092c7e38e4d713214013ebca8",
      "evidence": "planning/art-qa/runtime-isometric-integration-001/attempt-002/review.json",
      "passed": [
        "native-four-rotation-capture",
        "elevated-projection",
        "directional-selection",
        "floor-contact-pivots",
        "mixed-world-depth",
        "gameplay-legibility",
        "sixteen-floor-assets"
      ],
      "blockers": [
        "mounted-object-anchor-contract"
      ],
      "acceptedAssetIds": [
        "banquette",
        "booth",
        "dish-machine",
        "espresso",
        "furniture-oak-two-top",
        "furniture-six-burner-range",
        "furniture-walnut-four-top",
        "host-stand",
        "mop-sink",
        "pass",
        "prep",
        "range",
        "recycling",
        "service-station",
        "table-four",
        "table-two"
      ],
      "rejectedAssetIds": [
        "local-art",
        "pendants",
        "plants"
      ],
      "reviewPreservation": {
        "commit": "1eb321395d7c9562e79fcf7a39a5c334ce3e05f9",
        "tree": "e2d69e0f8c39e4dd1f372e5abec2b66c4d4d0c1a",
        "ci": "https://github.com/Maergoth/rro/actions/runs/31001558391"
      },
      "productionComplete": false,
      "evidencePresent": true,
      "reviewRemoteVerified": true
    },
    {
      "id": "runtime-isometric-integration-001-attempt-003",
      "status": "passed-partial-floor-assets",
      "remoteCommit": "98e479eaa5afed6c95e0abe1026dfcf8e09e062a",
      "remoteTree": "bcfcb076d26c1d3b8a973dbe601c6a921563348b",
      "ci": "https://github.com/Maergoth/rro/actions/runs/31004267533",
      "artifactId": 8929624396,
      "artifactSha256": "ee92f4309c99bd6b580550e1c5f31c91f45f2107c8e053e49ffc980788a80cd8",
      "evidence": "planning/art-qa/runtime-isometric-integration-001/attempt-003/review.json",
      "passed": [
        "native-four-rotation-capture",
        "elevated-projection",
        "directional-selection",
        "floor-contact-pivots",
        "mixed-world-depth",
        "gameplay-legibility",
        "nineteen-floor-assets"
      ],
      "blockers": [
        "mounted-object-anchor-contract"
      ],
      "acceptedAssetIds": [
        "banquette",
        "booth",
        "dish-machine",
        "espresso",
        "furniture-banquette-section",
        "furniture-commercial-chair",
        "furniture-oak-two-top",
        "furniture-premium-chair",
        "furniture-six-burner-range",
        "furniture-walnut-four-top",
        "host-stand",
        "mop-sink",
        "pass",
        "prep",
        "range",
        "recycling",
        "service-station",
        "table-four",
        "table-two"
      ],
      "rejectedAssetIds": [
        "local-art",
        "pendants",
        "plants"
      ],
      "reviewPreservation": {
        "commit": "10a0f705af46ae9737b27830af59fc5b1fa3b5bf",
        "tree": "6cb40312461f9afc5f2624b797dd6b2dc5915c0e",
        "ci": "https://github.com/Maergoth/rro/actions/runs/31006311867"
      },
      "productionComplete": false,
      "evidencePresent": true,
      "reviewRemoteVerified": true
    }
  ],
  "preservedReferences": [
    {
      "id": "alpha2-overhead-furniture",
      "files": [
        "apps/client-godot/assets/objects/generated/banquette.png",
        "apps/client-godot/assets/objects/generated/booth.png",
        "apps/client-godot/assets/objects/generated/dish-machine.png",
        "apps/client-godot/assets/objects/generated/espresso.png",
        "apps/client-godot/assets/objects/generated/furniture-banquette-section.png",
        "apps/client-godot/assets/objects/generated/furniture-commercial-chair.png",
        "apps/client-godot/assets/objects/generated/furniture-oak-two-top.png",
        "apps/client-godot/assets/objects/generated/furniture-walnut-four-top.png",
        "apps/client-godot/assets/objects/generated/host-stand.png",
        "apps/client-godot/assets/objects/generated/local-art.png",
        "apps/client-godot/assets/objects/generated/mop-sink.png",
        "apps/client-godot/assets/objects/generated/pass.png",
        "apps/client-godot/assets/objects/generated/pendants.png",
        "apps/client-godot/assets/objects/generated/plants.png",
        "apps/client-godot/assets/objects/generated/prep.png",
        "apps/client-godot/assets/objects/generated/range.png",
        "apps/client-godot/assets/objects/generated/recycling.png",
        "apps/client-godot/assets/objects/generated/service-station.png",
        "apps/client-godot/assets/objects/generated/table-four.png",
        "apps/client-godot/assets/objects/generated/table-two.png"
      ],
      "count": 20,
      "productionStatus": "preserved-reference-wrong-camera"
    }
  ],
  "quarantinedWork": [
    {
      "id": "alpha3-deterministic-placeholder-pass",
      "localCommit": "5714bb8",
      "status": "local-only-rejected",
      "reason": "Catalog-complete deterministic Pillow stand-ins and metadata-only animation reuse; useful only as scope/provenance evidence and never counted as accepted production art."
    }
  ],
  "contractGaps": [
    "Freeze furniture shadow and operational-state requirements (active, dirty, damaged, broken) per catalog item before those states can receive a completion denominator.",
    "Remotely preserve the batch-008 source package with green hosted CI and pass its three pending floor assets through exact four-rotation native gameplay-composite review; complete mounted-object server placement, builder snapping, runtime anchors, and depth before re-reviewing local-art, plants, and pendants.",
    "Implement character animation storage/rigging and phase-level task choreography against the frozen launch applicability matrix; static direction art and metadata-only aliases do not satisfy its raster-cell contract.",
    "Enumerate production minigame presentation art and regional/world overlays beyond the single launch atlas before whole-game art can be called complete."
  ]
}
```
<!-- ART_LEDGER_JSON_END -->
