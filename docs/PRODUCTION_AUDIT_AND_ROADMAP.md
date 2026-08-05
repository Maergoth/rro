# Rush & Revenue Online: Production Audit and Roadmap

**Audit date:** 2026-08-02

**Authoritative baseline:** `1.0.0-alpha.2` recovery plus the reliable-first-shift patch

**Product status:** playable source alpha / proof of concept, not a production-ready MMO

## Executive assessment

Rush & Revenue Online has a useful server-authoritative foundation: local accounts, SQLite persistence, a regional world, seven roles, shared restaurant shifts, modular construction, furniture economics, personal inventory, skills, guest rivalry, and a native Godot client. The happy path is testable, but most systems remain shallow and several advertised loops are only partially connected.

The completed Alpha 3 art pass previously reported in chat is **not present in this source tree, saved artifacts, or GitHub** and is not current product coverage. Preserved direct-overhead furniture files are identity/material references only. The production camera is now elevated orthographic-isometric, and standing authorization covers generation plus public publication of small reversible batches. All live counts, blockers, and evidence come only from the generated [production art ledger](ART_PROGRESS.md).

This audit prioritizes a polished, dependable vertical slice before broad content growth. A reliable one-hour restaurant session is the proof point; every system that does not strengthen that loop is sequenced after it.

## Current verified baseline

| Area | Working now | Important boundary |
|---|---|---|
| Accounts and persistence | Signup/login/logout, hashed passwords, bearer sessions, SQLite state | Local-alpha security only; no recovery, MFA, TLS, migration program, or session cleanup |
| World | 6 countries, 13 regions, 23 seeded NPC restaurants, capacity and regional resources | World presentation is shallow; no hosted shard or travel/social loop |
| Roles and work | 7 roles, 89 activities, task claim/action, XP and cash rewards | Twelve animated presentations sit over binary safe/risky buttons; no spatial station or authentic minigame input |
| Progression | 196 skill nodes, 45 purchasable role items, persistent loadouts | Skills/equipment/consumables are not resolved into authoritative task outcomes; skill points do not replenish |
| Restaurant simulation | Parties, tasks, incidents, reviews, duty slots, NPC completion, settlement | Physical tickets, recipes, ingredients, table paths, station dependencies, and per-slot NPC behavior are absent |
| Builder | Persistent floor/wall/object editing, canonical shared edges, mount-aware placement, legal expansion, path/egress validation, durable undo/redo, repair, wear and sale | No routed utilities/ventilation, code-clearance solver, native room-tag workflow, optimistic revision conflict handling, commit/cancel staging, or collaborative editing |
| Multiplayer | Authenticated WebSocket snapshots/commands and shared shifts | No reconnect/resume; current patch cleans up immediately on disconnect; snapshots are full-state and unscaled |
| Art | Elevated orthographic-isometric directional runtime, modular asset roots, and durable review evidence | The generated [production art ledger](ART_PROGRESS.md) is authoritative for incomplete furniture, construction/world/UI, character-layer and animation work; legacy overhead files never count |
| Delivery | Strict TypeScript, zero-warning static GDScript analysis, the full Node integration/regression suite, and release tooling | No graphical Godot E2E, two-client Windows acceptance, signing, installer/updater, or production operations |

## Reliable-first-shift patch in this branch

- Door-adjacent, walkable, furniture-free authoritative spawn selection.
- Swept movement checks against furniture, solid walls, non-walkable floors, diagonals, and bounds; doors and arches remain traversable.
- Explicit zero-vector movement on key release, focus loss, and scene exit; server clears the retained intent immediately.
- Per-item bound callbacks for task, action, builder, region, and catalog controls.
- Commands queue until the WebSocket receives the server `ready` message.
- Realtime subscriptions require a joined presence; closed sockets release presence, duty slots, movement, and claimed tasks.
- Outbound WebSocket backpressure guard.
- Packaged server binds to `127.0.0.1` as documented.
- Restaurant founding and guest visits are reachable from the client.
- Immediate-hire UI is labeled honestly; role validation and rehire-after-quit are correct.
- Appearance editing preserves the saved outfit.
- Failed leave requests no longer display a false success summary.
- Shift settlement, furniture wear, ledger writes, close state, duty cleanup, and presence cleanup commit atomically and remain retryable after failure.
- Shared north/south and east/west descriptions resolve to one physical wall authority, with startup repair plus a database uniqueness guard for legacy mirrored rows.
- Width/height add-ons relocate existing east/south perimeter walls, openings, and supported wall mounts; new runs receive a closed perimeter and the whole change remains one restart-safe undo/redo mutation.

These fixes make the proof of concept more dependable. They do not make it feature-complete.

## Dependency-ordered milestones

### M0 — Durable source truth and recovery boundary (P0)

**Goal:** no completed work exists only in a transient workspace again.

- Publish this exact recovered baseline and audit on an `agent/*` branch and draft PR.
- Preserve an immutable recovery commit and release hashes.
- Require a remote branch plus downloadable artifact before reporting any future production pass complete.
- Keep Alpha 3 and the lost full-art claims explicitly outside current coverage unless independently recovered and validated.

**Exit gate:** a clean clone reproduces the automated gates and the generated [production art ledger](ART_PROGRESS.md); GitHub shows the branch and draft PR.

### M1 — Reliable multiplayer first shift (P0)

**Goal:** two players can always enter, control, disconnect from, and recover a shared shift without corrupting state.

- Cache the new swept collision/occupancy data and add dense-layout property tests so correctness remains affordable at multiplayer scale.
- Replace immediate disconnect cleanup with a short server lease/grace period, then add client reconnect, re-authentication, resubscription, full snapshot recovery, and ownership restoration.
- Couple non-movement command mutations and idempotency records in one transaction; reject reused IDs with different payloads.
- Make NPC coverage per vacant duty slot rather than per role.
- Preserve task selection/focus while applying snapshot deltas rather than rebuilding the panel five times per second.
- Add a two-client lifecycle test and executable Godot scene smoke.

**Exit gate:** automated join/move/stop/collision/disconnect/reconnect tests pass; a Windows two-client run completes without ghost presence, stuck claims, or duplicated rewards.

### M2 — One authentic restaurant vertical slice (P0/P1)

**Goal:** one party journey demonstrates the actual game, not menu-driven placeholders.

- Model arrival, seating, order/ticket, preparation, pass, delivery, check-back, payment, clearing, dish flow, and review as physical, server-owned state.
- Require proximity and a valid station/tool for relevant actions.
- Implement 2–3 genuinely interactive minigames with accessibility alternatives and server-verifiable results.
- Ensure all seven roles contribute meaningful actions or decisions to the same party chain.
- Make shift length configurable for testing and provide a real departure summary without calling an early exit “shift complete.”

**Exit gate:** a new account can complete one accelerated end-to-end service with observable cross-role causality, failure recovery, settlement, and persistence after restart.

### M3 — Progression and economy integrity (P1)

**Goal:** every purchase and unlock has a visible, bounded gameplay consequence.

- Resolve attributes, unlocked skills, equipped items, wear, and timed consumable effects in one authoritative modifier service.
- Award skill points once at documented role/character thresholds.
- Add wages, tips, deductions, and useful shift-summary deltas to the ledger.
- Add conditional debits and idempotency keys to construction, inventory, founding, repair, and progression mutations.
- Balance sources/sinks around a one-hour session and a four-hour maximum shift.

**Exit gate:** deterministic tests prove exact bounded effects, once-only threshold awards, nonnegative/authorized spending, and replay-safe rewards.

### M4 — Owner and builder vertical slice (P1)

**Goal:** opening and operating a restaurant is a complete game loop.

- Ratify immediate hiring versus pending applications; implement one coherent owner/worker flow.
- Add staffing, scheduling, menu/pricing, purchasing, sanitation, utilities, maintenance, and daily operating decisions.
- **Implemented:** canonical shared wall authority plus expansion-safe perimeter, opening, and wall-mount relocation with restart-safe undo/redo coverage.
- **Implemented foundation:** mount-aware placement previews, path/egress validation, and audited construction history. Add commit/cancel staging, optimistic revision conflicts, and collaboration semantics.
- Add restaurant open/close readiness checks and actionable failure messages.

**Exit gate:** a new owner can found, build a legal layout, staff it, run an accelerated day, settle, repair/reinvest, restart, and continue.

### M5 — Renderer and art contract (P1)

**Goal:** restore visual production without repeating the lost-work failure.

- Preserve the ratified elevated orthographic-isometric runtime and true authored directional sprites.
- Decide embedded PCK assets versus a versioned external `Artwork` tree.
- Freeze furniture/equipment/avatar manifests, IDs, pivots, scale, tint masks, and fallback rules.
- Generate, review, and publish small remotely committed batches under the recorded standing authorization.
- Add RGBA, transparency, uniqueness, direction, pivot, binding, scale, and package-boundary gates.

**Exit gate:** every claimed asset is in GitHub or a durable linked artifact, has a manifest/hash, renders correctly in-game, and survives a clean release build. Current missing art is not silently counted complete.

### M6 — Beta quality and operations (P2)

**Goal:** make the vertical slices safe to operate and pleasant to play repeatedly.

- Ordered schema/content migrations, automated backups, restore drills, corruption handling, and downgrade refusal.
- Structured rotated logs, readiness/health depth, tick lag, connected-player, database, and snapshot-bandwidth metrics.
- Keyboard/controller remapping, scalable UI, screen-reader-friendly structure, non-color cues, reduced motion, and localization foundations.
- Audio, animation, VFX, onboarding, confirmations, loading/retry/offline states, and diagnostics export.
- Load/soak at 2, 8, and 50 clients with explicit tick, memory, bandwidth, and database-growth budgets.

**Exit gate:** beta checklist passes on supported Windows configurations, including accessibility and recovery drills.

### M7 — Social MMO and commercial launch foundation (P3)

**Goal:** evolve the validated game into an operated online product.

- Friends, crews, shift finder, invitations, chat, permissions, reporting, blocking, moderation, rivalry consent, and anti-collusion.
- Hosted gateway/shard topology, scalable persistence, account recovery/MFA, TLS, rate limits, privacy/compliance, anti-abuse, SLOs, on-call, and disaster recovery.
- Signed installer/updater, repair, rollback, crash reporting, SBOM, provenance, artifact attestation, antivirus review, and support tooling.

**Exit gate:** security review, operational readiness review, disaster-recovery exercise, and staged launch all pass.

## Next execution order

1. Merge the durable recovery/stability PR.
2. Implement M1 swept collision and reconnect leases as the next engineering slice.
3. Maintain the elevated orthographic-isometric renderer/art contract while generating and publishing reversible reviewed batches.
4. Build the M2 physical party journey and one true minigame.
5. Wire progression/equipment effects only after the authoritative action model exists.
6. Expand content and visuals after the vertical slice is fun, observable, and stable.

The assignable task inventory for these milestones is in `planning/next-steps.json`.
