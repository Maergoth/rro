# Content packs, subclasses, seasons, and furniture

Rush & Revenue Online treats stable content IDs as part of the persistent world contract. The V1 compiler reads enabled packs from `packages/game-data/manifest.json`, resolves their definitions into one deterministic registry, and publishes a SHA-256 content hash to clients.

This is the current V1 authoring contract and the safe extension boundary. It is intentionally narrower than the V2 plugin SDK in the roadmap.

## Current capabilities

| Content type | V1 status |
|---|---|
| Core base roles | Loaded from `core/roles.json` |
| Base-role progression | Generated as 28 nodes per base role in `core/role-progression.json` |
| Activities/minigame phases | Generated in `core/activities.json`; 89 activities, 12 grammars |
| Furniture/decor | Additive pack definitions; persistent stable IDs |
| Construction surfaces/walls | Core data in `core/construction.json` |
| Appearance | Core silhouettes/palettes in `core/appearance.json` |
| Seasonal events | Additive dated modifiers loaded from enabled packs |
| Subclass inheritance | Server resolver supports parent role permissions/tags/skills/activities |
| Hot activation | Not supported; restart and content-hash change required |
| Signed downloadable packs | V2 work |
| Pack assets/localization/entitlements | V2 work |
| Save/content migrations | V2 work; V1 is a clean schema line |

## Manifest

`packages/game-data/manifest.json` is the activation list:

```json
{
  "schemaVersion": 1,
  "packs": [
    { "id": "core-hospitality", "directory": "core", "enabled": true },
    { "id": "summer-street-fair", "directory": "seasonal/summer-street-fair", "enabled": true }
  ]
}
```

Each directory has a descriptive `pack.json`:

```json
{
  "id": "summer-street-fair",
  "label": "Summer Street Fair",
  "version": "1.0.0",
  "type": "seasonal",
  "schemaVersion": 1,
  "priority": 20
}
```

V1 reads the activation directory and validates the global manifest schema. Pack priority is documentation for the forthcoming compiler; the current resolver follows manifest order and uses stable-ID replacement for pack-contributed furniture/events. Do not depend on an accidental replacement: duplicate-ID policy and explicit override declarations are V2 compiler tasks.

## Stable-ID rules

1. Use lowercase kebab-case IDs with a clear namespace when a pack may be third-party.
2. Never use array position, filename order, display label, or translated text as identity.
3. Do not repurpose an existing ID for a mechanically different item.
4. Do not silently remove an ID that a character, layout, shift, or ledger can reference.
5. Keep dimensions and rotations compatible with existing saved placements unless a migration is supplied.
6. Treat permission, price, modifier, and event changes as balance changes requiring release notes and tests.
7. A content hash change is an explicit client/server compatibility change even when protocol remains `rro.v1`.

## Furniture or decoration pack

Add `furniture.json` to an enabled pack directory. A current definition looks like:

```json
{
  "id": "pastry-display-marble",
  "name": "Marble Pastry Display",
  "category": "Decor",
  "style": "Heritage",
  "tier": "premium",
  "costCents": 185000,
  "width": 3,
  "height": 1,
  "symbol": "P",
  "assetId": "pastry-display",
  "upkeepCents": 740,
  "durability": 90,
  "utilities": ["power"],
  "stats": { "ambience": 8, "revenue": 4, "storage": 2 },
  "tags": ["pastry", "display", "guest-facing"],
  "contentPackId": "pastry-house"
}
```

Required runtime fields are `id`, `name`, `category`, `style`, `costCents`, `width`, `height`, `symbol`, and `stats`. Production definitions should also provide `assetId`, tier, upkeep, durability, utilities, tags, and pack provenance.

Price and power should generally rise together, but not as a single linear “best item” ladder. Premium equipment can buy throughput, precision, comfort, durability, energy efficiency, storage, safety, or ambience. It should also have an operational footprint, upkeep, utility, cleaning, or maintenance tradeoff. Decor is a first-class category and may influence ambience, acoustics, comfort, identity, traffic, or cleaning without pretending to cook food.

The Godot client currently maps common `assetId` values to individual modular SVGs and falls back to a procedural object card/symbol. Production packs must ship an asset bundle, thumbnail, collision shape, pivots/sockets, states, localization, and license metadata through the V2 pipeline.

## Seasonal event pack

An event definition is dated and data-driven:

```json
{
  "id": "harvest-week-2027",
  "label": "Harvest Week",
  "description": "Regional demand rises while local produce supply improves.",
  "startsAt": "2027-09-20T00:00:00-04:00",
  "endsAt": "2027-09-28T23:59:59-04:00",
  "accent": "#d98945",
  "modifiers": {
    "demand": 6,
    "produce": 10,
    "labor": -2,
    "sanitation": -1
  },
  "tags": ["autumn", "market"],
  "contentPackId": "harvest-week"
}
```

The V1 world projection applies active event modifiers to regional demand/resource values and can expose event furniture. Dates are absolute timestamps; use explicit offsets or `Z`. Ensure `endsAt` follows `startsAt`.

V1 does not yet include a live calendar service, cohort targeting, recurrence, rewards, quests, rollback, or hotfix signing. Avoid deleting event definitions immediately after the window, because saved furniture and historical evidence may retain their IDs.

## Subclass definition

The role compiler resolves parent-first inheritance. A subclass can inherit permissions, tags, attribute weights, branch metadata, skills, and activities, then add its own values:

```json
{
  "id": "pastry-cook",
  "label": "Pastry Cook",
  "icon": "✦",
  "color": "#d99ab8",
  "fantasy": "Control fermentation, lamination, bake curves, finish, and dessert pickup.",
  "kind": "subclass",
  "parentRoleId": "cook",
  "employmentMode": "job",
  "permissions": ["use-pastry-station"],
  "tags": ["pastry", "baking"],
  "skills": [
    {
      "id": "pastry-fermentation-log",
      "branch": "pastry-production",
      "label": "Fermentation Log",
      "cost": 1,
      "requires": null,
      "description": "Read and correct proofing drift before it reaches service.",
      "effect": { "type": "process-window", "value": 6, "roleId": "pastry-cook" }
    }
  ]
}
```

Place subclass roles in a pack `roles.json`. Add subclass activities through the activity compiler/data path before enabling the pack. The resolver prevents cyclic inheritance and fails an unknown parent.

Important V1 limitation: generated activities and 28-node base progression currently come from core files, not arbitrary per-pack activity/progression manifests. The inheritance resolver is the runtime hook; the pack compiler, Godot bindings, animations, equipment requirements, role-selection presentation, matchmaking tags, respec/migration, and full validation suite are explicit V2 tasks. Do not market an untested JSON subclass as a shipped production class.

## Activity definition

Every whole work task is multi-phase and fallible:

```json
{
  "id": "pastry-proofing-log",
  "roleId": "pastry-cook",
  "label": "Proofing and Rotation Log",
  "grammar": "evidence",
  "lane": "prevent",
  "priority": 62,
  "description": "Inspect lots, age, temperature, and proof state before choosing a correction.",
  "phases": [
    { "id": "inspect", "prompt": "Read the lot evidence.", "actions": ["verify-lots", "assume-oldest"] },
    { "id": "correct", "prompt": "Choose a safe correction.", "actions": ["adjust-and-label", "hide-drift"] },
    { "id": "handoff", "prompt": "Close the production loop.", "actions": ["log-and-brief", "leave-unspoken"] }
  ],
  "successActions": ["verify-lots", "adjust-and-label", "log-and-brief"],
  "riskActions": ["assume-oldest", "hide-drift", "leave-unspoken"],
  "tags": ["pastry", "paperwork", "rotation", "recoverable"]
}
```

`grammar` must be one of the supported reusable presentations. The authoritative server consumes actions by ID; labels and visuals must not become the scoring authority. A production activity also needs consequence bindings, accessibility variants, deterministic scenarios, localization, telemetry, networking, and expert acceptance.

## Development workflow

1. Add or edit definitions under `packages/game-data/`.
2. Preserve all existing persistent IDs.
3. If editing generated core data, edit `tools/generate-production-data.mjs`, not only the output.
4. Run:

```bash
npm run generate:data
npm run validate:data
npm test
```

5. Open the Godot client against a fresh test world and inspect the content manifest/hash.
6. Verify older V1 worlds do not receive orphaned references before promoting a pack.
7. Include source/license provenance for every art, audio, font, and code asset.

## V2 production compiler requirements

The team backlog requires a real content platform with:

- versioned JSON schemas and generated TypeScript/GDScript bindings;
- pack identity, semantic version, dependencies, conflicts, and explicit overrides;
- server, client, asset, localization, entitlement, and jurisdiction bundles;
- signed manifests and downgrade/substitution protection;
- staged activation, region/cohort targeting, preview, pause, rollback, recurrence, and archive;
- forward content migrations and compatibility windows;
- reference/dependency scanning across saves, layouts, skills, events, and assets;
- deterministic authoring previews and certification tests;
- moderation, licensing, cultural review, accessibility, and performance metadata;
- hotfix and release channels with audited ownership.

Until those gates exist, packs are repository-authored V1 content, not an unrestricted mod marketplace or hot-loaded plugin system.
