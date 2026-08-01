# V2 AAA roadmap

## Product objective

V2 turns the V1 native vertical slice into a long-lived restaurant MMORPG operated by a full development and live-service organization. It must preserve the unusual center of the game: authentic restaurant competence and interdependent crew play. Scale, content volume, graphics, and monetization are supporting systems; they cannot replace that center.

The planning inventory contains **240 assignable tasks across 28 categories**. The human-readable table is in `V2_TEAM_BACKLOG.md`; the importable source is `planning/v2-backlog.json`.

## MoSCoW scope

### Must have for V2.0

- scalable authoritative gateways, interest management, prediction/reconciliation, reconnect, isolated shift workers, and regional shard placement;
- forward database migrations, event journal, atomic ledger, backup/restore, corruption detection, retention, and player data export;
- physical guests, orders, tickets, recipes, inventory lots, allergens, food safety, equipment wear, maintenance, and complete shift settlement;
- full-shift authentic gameplay for every base role, including real paperwork, product rotation, station dependencies, handoffs, failure, and recovery;
- composable minigame runtime bound to live world objects, with difficulty dimensions, failure taxonomy, multiplayer handoff, accessibility transforms, and certification;
- irregular restaurant shells, utilities, code/clearance, flow simulation, construction phases, collaborative blueprints, modular sockets, and controller parity;
- regional supply, vendors, purchasing, delivery, labor, demand, inflation, market-abuse controls, and receivership;
- NPC role agents, guest memory, restaurant birth/death, competitor strategy, crew relationships, explainability, and offline fidelity tiers;
- friends, crews, communication, shift finder, mentorship, reputation, moderation evidence, and privacy controls;
- bounded guest competition with consent, fair requests, staff counterplay, review integrity, tournaments, and abuse response;
- production Godot scenes, input abstraction, 3D tactical globe, restaurant camera, cue language, customizable HUD, tutorial/certification and low-spec tiers;
- cohesive art target, modular inclusive characters, locomotion and role animation, modular environments, food states, urgency VFX, lighting and LOD pipeline;
- soundscape, operational callouts, role interaction audio, adaptive score, captions and dynamic-range controls;
- accessibility requirements, timing alternatives, contrast, screen reader structure, localization, RTL and paid accessibility tests;
- signed launcher/updater/installer, differential patching, crash reports, signed builds/content, release rollback, SBOM/licenses and store integration;
- threat model, hardened identity/authorization, server-side anti-cheat, key management, moderation cases and external penetration testing;
- automated scenarios, chaos, economy fuzzing, performance/hardware/save matrices, expert acceptance, localization QA and launch certification;
- SLOs, end-to-end observability, on-call, runbooks, capacity, disaster recovery, status, support and postmortem practice.

### Should have for V2.1

- deeper subclasses and concept packs beyond the launch certification set;
- multi-unit ownership, partnerships, buyouts, auctions and sophisticated regional associations;
- spectator/replay teaching tools and structured community events;
- broader player-authored prefab sharing with curation and versioned dependencies;
- richer weather, travel, language and jurisdiction differentiation;
- advanced research, experimentation, explainable restaurant-health and accessibility-outcome dashboards;
- seasonal recurrence, archive, player calendar and live-balance forecasting;
- more low-frequency role specialties such as pastry, banquets, beverage, maintenance and receiving.

### Could have after V2.1

- mobile companion views for schedules, applications, purchasing and social coordination—not live twitch work;
- curated creator marketplace for approved cosmetic construction packs;
- asynchronous culinary schools, historical restaurant museums and spectator leagues;
- additional world travel presentation and region-specific business formats;
- private dedicated-world tooling for communities and training organizations;
- advanced procedural building parcels and neighborhood visual evolution.

### Won’t have in V2

- V0 browser client, V0 database, V0 route or save compatibility;
- pay-to-win stats, purchasable role mastery, loot boxes, or paid economic rescue;
- blockchain, NFT ownership, speculative tokens, or cash-out player currency;
- arbitrary guest sabotage, fake allergies as a prank, vandalism, stalking, or unearned reviews;
- unsafe food-handling shortcuts rewarded as optimal play;
- forced four-hour sessions or progression available only through marathon shifts;
- client authority over money, movement outcome, task score, inventory, reviews, or restaurant failure;
- unmoderated public voice/text or opaque automated permanent sanctions;
- first-person photoreal scope that sacrifices top-down operational readability;
- generative replacement of credited writers, artists, actors, cultural reviewers, or restaurant experts without an explicit ethical production policy.

## Delivery sequence

| Phase | Proof required | Principal workstreams |
|---|---|---|
| 0. V1 native closure | Signed V1 gate; two-client native acceptance | Client export, migrations, backup, accessibility baseline, launcher, security review |
| 1. Pre-production | Eight-player dinner rush greybox with deterministic replay | Architecture, networking, simulation, role expert cells, content compiler, art target |
| 2. Vertical slice | One complete restaurant concept and region at near-final quality | Seven roles, guests/orders, builder/utilities, social crew, audio/art, operations |
| 3. Production alpha | Persistent multi-region service with representative content | Shards, economy, NPC ecology, progression, live tools, moderation, telemetry |
| 4. Closed beta | Progression/economy wipe rehearsal and external scale | Load, security, accessibility, localization, support, balance, hardware matrix |
| 5. Open beta | No planned wipe after announced checkpoint | Store/launcher, anti-abuse, live calendar, incident response, content cadence |
| 6. V2.0 launch | Launch gate and rollback drill pass | Certification, signed artifacts, SRE/support staffing, status/comms, launch content |
| 7. V2.1 live expansion | Healthy retention, economy, crew and safety guardrails | Should-have scope, new regions/concepts/subclasses, creator and spectator tools |

## Team topology

A plausible production organization uses stable cross-functional groups rather than one giant feature team:

- **World platform:** identity, persistence, gateways, shards, ledgers, tools and SRE;
- **Restaurant simulation:** guests, orders, inventory, safety, equipment, incidents and NPCs;
- **Role crews:** two or three pods covering service, kitchen, sanitation, management and ownership, each paired with paid domain experts;
- **Construction/economy:** builder, utilities, logistics, regional markets and ownership;
- **Social/trust:** crews, chat/voice, guest competition, moderation, anti-abuse and privacy;
- **Native client:** camera, input, UI, accessibility, performance and platform integration;
- **Content production:** world/quest/live design, art, animation, VFX, audio, localization and cultural review;
- **Release/quality:** automation, compatibility, certification, launcher/updater, security and release management;
- **Live organization:** liveops, economy, analytics, community, support, moderation, SRE and incident communication.

Every group owns runtime metrics, tests, runbooks and content authoring—not only feature code.

## Program guardrails

1. A role expert can veto an unsafe or fundamentally false workflow; design then finds a playable truthful abstraction.
2. Every new system names its server authority, persistence record, failure path, recovery path, accessibility alternative and operational owner.
3. No MoSCoW item enters production without acceptance evidence and telemetry proportional to its risk.
4. XL backlog items must be decomposed before sprint commitment.
5. Economy and guest-competition changes require abuse analysis before experiment exposure.
6. Content packs cannot mutate old stable IDs in place or silently invalidate layouts/progression.
7. The one-hour session remains the balance baseline even when long sessions, events and ownership support four hours.
8. Employment mastery remains a complete endgame; ownership is not mandatory vertical progression.

## Backlog usage

`planning/v2-backlog.json` is the canonical import format. Each task includes:

- stable ID and category;
- responsible discipline;
- Must/Should/Could priority;
- V2.0/V2.1/V2.x target;
- S/M/L/XL rough size;
- dependencies;
- concise description;
- acceptance statement;
- unscheduled initial status.

Importers may add assignee, sprint, estimate points, links and state, but should preserve IDs and acceptance text. Edit `tools/generate-v2-backlog.mjs` and regenerate both representations so Markdown and JSON do not drift.
