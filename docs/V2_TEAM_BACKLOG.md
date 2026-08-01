# V2 AAA team backlog

> Generated from `tools/generate-v2-backlog.mjs`. Edit the generator, not this file. The JSON companion is suitable for import into an issue tracker.

**Inventory:** 240 assignable tasks across 28 categories — 152 Must, 61 Should, 27 Could.

Each task has a discipline, MoSCoW priority, target, rough size, dependencies, and a testable acceptance statement. XL items must be decomposed during planning; estimates are not commitments.

## Production & Direction

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| PROD-001 | Must | V2.0 | M | V2 pillars and kill criteria | Ratify the AAA hospitality, shared-crew, persistent-world, and fair-guest-conflict pillars with measurable kill criteria. |
| PROD-002 | Must | V2.0 | L | Vertical-slice budget | Cost the eight-player dinner-rush vertical slice by discipline, vendor, hardware, and contingency. |
| PROD-003 | Must | V2.0 | M | Feature ownership map | Assign a directly responsible owner and backup for every runtime, content, and operational domain. |
| PROD-004 | Must | V2.0 | XL | Milestone exit reviews | Create evidence-based concept, pre-production, alpha, beta, launch, and live gates. |
| PROD-005 | Must | V2.0 | S | Risk register cadence | Maintain weekly technical, staffing, content, licensing, and schedule risks with triggers and mitigations. |
| PROD-006 | Should | V2.1 | L | External playtest council | Recruit restaurant veterans and MMO raid leaders for recurring compensated reviews. |
| PROD-007 | Should | V2.1 | M | Vendor and outsourcing plan | Define briefs, source-control boundaries, review SLAs, and acceptance standards for external teams. |
| PROD-008 | Could | V2.x | L | Post-launch capacity model | Staff a 24/7 live game, moderation, SRE, support, content, and economy operation. |

## Architecture & Developer Platform

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| ARCH-001 | Must | V2.0 | M | Service boundary ADRs | Split identity, world, shift, economy, social, content, and telemetry responsibilities with versioned contracts. |
| ARCH-002 | Must | V2.0 | L | Repository ownership rules | Add CODEOWNERS, package boundaries, dependency rules, and architectural linting. |
| ARCH-003 | Must | V2.0 | M | Schema evolution framework | Replace clean-start schema creation with forward-only migrations, verification, rollback drills, and compatibility windows. |
| ARCH-004 | Must | V2.0 | XL | Content schema compiler | Generate typed server and Godot bindings from versioned content schemas with actionable diagnostics. |
| ARCH-005 | Must | V2.0 | S | Deterministic simulation harness | Run recorded shift inputs against pinned seeds and compare state hashes across builds. |
| ARCH-006 | Should | V2.1 | L | Feature flag service | Target flags by environment, cohort, region, restaurant, and account with audited changes. |
| ARCH-007 | Should | V2.1 | M | Plugin SDK | Publish sandboxed extension points for subclasses, furniture packs, events, minigames, and server rules. |
| ARCH-008 | Could | V2.x | L | Developer world snapshots | Create scrubbed, shareable world snapshots and one-click scenario restores for team debugging. |

## Networking & Scale

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| NET-001 | Must | V2.0 | M | Gateway and session routing | Route authenticated clients to region and shift authorities while preserving reconnect state. |
| NET-002 | Must | V2.0 | L | Interest management | Replicate only relevant restaurant rooms, entities, cues, and work queues at bounded bandwidth. |
| NET-003 | Must | V2.0 | M | Input sequencing | Add server tick numbers, client sequence IDs, acknowledgement windows, and duplicate suppression. |
| NET-004 | Must | V2.0 | XL | Prediction and reconciliation | Predict top-down locomotion locally and reconcile against authoritative collision without rubber-banding. |
| NET-005 | Must | V2.0 | S | Snapshot delta codec | Replace full JSON snapshots with measured binary deltas, baselines, and recovery snapshots. |
| NET-006 | Must | V2.0 | L | Reconnect and role handoff | Restore presence, duty ownership, minigame phase, and queued intent after transient disconnects. |
| NET-007 | Should | V2.1 | M | Shift process isolation | Host busy restaurants in isolated workers with health transfer and crash containment. |
| NET-008 | Should | V2.1 | L | Regional shard orchestration | Place countries and regions across capacity pools while keeping travel and economy identities stable. |
| NET-009 | Should | V2.1 | XL | Load-shed policies | Protect active service by degrading noncritical social, analytics, and browsing traffic first. |
| NET-010 | Could | V2.x | M | Mass concurrency soak | Sustain target concurrent users, shifts, guests, and NPC roles through a 24-hour automated soak. |

## Persistence & Data Integrity

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| DATA-001 | Must | V2.0 | M | Production datastore selection | Benchmark and select transactional, cache, queue, object-store, and search technologies against MMO workloads. |
| DATA-002 | Must | V2.0 | L | World event journal | Persist append-only economic and shift facts that can reconstruct disputed outcomes. |
| DATA-003 | Must | V2.0 | M | Atomic cross-service ledger | Guarantee idempotent player and restaurant money movements across retries and partial failures. |
| DATA-004 | Must | V2.0 | XL | Backup and point-in-time restore | Automate encrypted backups and prove region-level recovery within RPO and RTO targets. |
| DATA-005 | Must | V2.0 | S | Data retention policy | Classify account, gameplay, chat, moderation, telemetry, and payment records with deletion workflows. |
| DATA-006 | Should | V2.1 | L | Corruption detector | Continuously validate referential, ledger, inventory, layout, and progression invariants. |
| DATA-007 | Should | V2.1 | M | Hot/cold world storage | Archive dormant restaurant histories without breaking visits, reviews, or reactivation. |
| DATA-008 | Could | V2.x | L | Player data export | Deliver authenticated portable account, character, purchase, and moderation-history exports. |

## Restaurant Simulation

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| SIM-001 | Must | V2.0 | M | Canonical service state machine | Model arrival through departure with branches for courses, bar service, takeout, recovery, and abandonment. |
| SIM-002 | Must | V2.0 | L | Menu item dependency graph | Resolve recipes, prep, equipment, station capacity, allergens, garnishes, holds, and substitutions. |
| SIM-003 | Must | V2.0 | M | Ticket rail authority | Simulate seat-numbered modifiers, all-day counts, firing, holding, refires, and pickup synchronization. |
| SIM-004 | Must | V2.0 | XL | Physical inventory lots | Track quantity, unit, lot, expiration, storage location, temperature, and ownership for every product. |
| SIM-005 | Must | V2.0 | S | Food safety simulation | Model time-temperature control, cross-contact, handwashing, sanitizer, pests, and corrective actions. |
| SIM-006 | Must | V2.0 | L | Wear and maintenance | Degrade equipment by use, soil, heat, misuse, and maintenance quality with causal failures. |
| SIM-007 | Should | V2.1 | M | Guest perception model | Convert observable moments and expectations into patience, satisfaction, memory, review, and return behavior. |
| SIM-008 | Should | V2.1 | L | Urgency director | Pace recoverable incidents so every staffed role has pressure without manufactured impossibility. |
| SIM-009 | Should | V2.1 | XL | Shift settlement | Reconcile covers, checks, tips, wages, comps, waste, purchasing, utilities, reviews, and cash variance. |
| SIM-010 | Could | V2.x | M | Four-timescale audit | Verify every recipe, turn, break, delivery, decay, and session rule against the 4× clock and one-hour target. |

## Manager Role

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| MGR-001 | Must | V2.0 | M | Manager operations board | Turn staffing, queues, breaks, 86s, incidents, and guest risk into a spatial triage interface. |
| MGR-002 | Must | V2.0 | L | Labor and break paperwork | Model availability, labor targets, break law, call-outs, approvals, and signed exceptions. |
| MGR-003 | Must | V2.0 | M | Comp and void audit | Require evidence, authority limits, reason codes, guest follow-up, and drawer reconciliation. |
| MGR-004 | Must | V2.0 | XL | Inspection walk | Build HACCP, restroom, ingress, temperature, chemical, and corrective-action rounds. |
| MGR-005 | Must | V2.0 | S | Coaching conversations | Branch feedback by evidence, tone, timing, skill gap, stress, and follow-through. |
| MGR-006 | Should | V2.1 | L | Incident command | Coordinate containment, guest care, documentation, vendor calls, and reopening decisions. |
| MGR-007 | Could | V2.x | M | Manager specialization pass | Add flow, people, and compliance subclasses with active techniques and team synergies. |

## Owner Role

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| OWN-001 | Must | V2.0 | M | Owner financial statements | Create playable P&L, cash flow, balance sheet, prime cost, and variance review. |
| OWN-002 | Must | V2.0 | L | Lease and insurance desk | Negotiate clauses, renewals, claims, deductibles, inspections, and coverage tradeoffs. |
| OWN-003 | Must | V2.0 | M | Capital portfolio | Compare equipment, decor, maintenance, debt, marketing, and expansion by risk-adjusted return. |
| OWN-004 | Must | V2.0 | XL | Vendor negotiation | Use volume, terms, quality, reliability, seasonality, and relationship history in contracts. |
| OWN-005 | Must | V2.0 | S | Menu engineering | Balance contribution margin, popularity, station load, waste, identity, and guest expectations. |
| OWN-006 | Should | V2.1 | L | Multi-unit governance | Delegate standards, budgets, leaders, transfers, and interventions across a restaurant group. |
| OWN-007 | Could | V2.x | M | Ownership succession | Support partnerships, buyouts, inheritance, receivership, closure, and sale without deleting history. |

## Server Role

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| SRV-001 | Must | V2.0 | M | Contextual greeting matrix | Branch greeting dialogue by reservation, occasion, wait, regular status, accessibility, and table mood. |
| SRV-002 | Must | V2.0 | L | Beverage discovery | Model preference questions, responsible alcohol service, pacing, pairings, and refill attention. |
| SRV-003 | Must | V2.0 | M | Seat-number order entry | Test memory, modifiers, allergy confirmation, coursing, POS navigation, and verbal readback. |
| SRV-004 | Must | V2.0 | XL | Section attention model | Make gaze, menus, glass levels, course state, conversation, and check cues readable without icons alone. |
| SRV-005 | Must | V2.0 | S | Tray and route mastery | Simulate weight, balance, hot/cold separation, seat delivery, hazards, and full-hands routing. |
| SRV-006 | Should | V2.1 | L | Two-bite check and recovery | Time check-ins, diagnose the actual problem, offer bounded remedies, and verify satisfaction. |
| SRV-007 | Should | V2.1 | M | Payment and checkout | Handle split methods, gift cards, cash, tips, fraud cues, receipts, side work, and declared cash. |
| SRV-008 | Could | V2.x | L | Server specialization pass | Add fine-dining captain, high-volume server, sommelier, and banquet subclasses. |

## Dishwasher Role

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| DSH-001 | Must | V2.0 | M | Pit intake topology | Prioritize ware by downstream shortage, soil, material, breakage risk, and landing-zone congestion. |
| DSH-002 | Must | V2.0 | L | Rack geometry game | Pack compatible pieces for spray exposure, drainage, capacity, and safe unloading. |
| DSH-003 | Must | V2.0 | M | Chemistry control | Test concentration, temperature, contact time, water condition, and corrective dosing. |
| DSH-004 | Must | V2.0 | XL | Cycle cadence | Coordinate scrape, soak, load, machine state, inspection, drying, and distribution without idle gaps. |
| DSH-005 | Must | V2.0 | S | Pot and specialty ware | Add carbonized cookware, knives, wood, glass, silver, allergen tools, and fragile finishes. |
| DSH-006 | Should | V2.1 | L | Machine maintenance | Diagnose arms, strainers, booster heat, pumps, scale, leaks, and safe lockout. |
| DSH-007 | Could | V2.x | M | Dish specialization pass | Add pit lead, steward, sanitation technician, and utility subclasses. |

## Chef Role

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| CHF-001 | Must | V2.0 | M | Chef line check | Inspect pars, labels, taste baselines, tools, safety, 86 risk, and station readiness. |
| CHF-002 | Must | V2.0 | L | All-day rail control | Call, acknowledge, pace, hold, sell, refire, and synchronize an entire kitchen rail. |
| CHF-003 | Must | V2.0 | M | Plate inspection | Judge temperature, doneness, portion, seasoning, garnish, allergen marking, and table completeness. |
| CHF-004 | Must | V2.0 | XL | Taste calibration | Compare samples against recipe intent while accounting for palate fatigue and product variance. |
| CHF-005 | Must | V2.0 | S | Yield and ordering | Reconcile forecast, edible yield, trim, waste, on-hand lots, lead time, and safety stock. |
| CHF-006 | Should | V2.1 | L | Kitchen coaching | Diagnose technique versus system failures and choose real-time or post-shift intervention. |
| CHF-007 | Could | V2.x | M | Chef specialization pass | Add executive chef, sous chef, pastry chef, and chef de cuisine subclasses. |

## Cook Role

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| COK-001 | Must | V2.0 | M | FIFO product rotation | Receive, date, rotate, consolidate, flag, discard, and document lots by real storage rules. |
| COK-002 | Must | V2.0 | L | Mise dependency plan | Sequence prep by downstream recipes, equipment, chilling, proofing, yield, and station par. |
| COK-003 | Must | V2.0 | M | Knife and prep craft | Score safety, uniformity, yield, speed, tool care, and ergonomics across ingredients. |
| COK-004 | Must | V2.0 | XL | Multi-pan heat control | Manage burners, pan recovery, carryover, basting, resting, and simultaneous pickups. |
| COK-005 | Must | V2.0 | S | Doneness sensory read | Combine time, touch, sound, aroma, visual state, and thermometer evidence. |
| COK-006 | Should | V2.1 | L | Modifier and allergy lane | Separate tools, product, surfaces, communication, and verification for exceptional tickets. |
| COK-007 | Should | V2.1 | M | Clean-as-you-go | Make wiping, tool reset, waste, floor hazards, and sanitizer part of station tempo. |
| COK-008 | Could | V2.x | L | Cook specialization pass | Add grill, sauté, garde manger, baker, prep, and production-cook subclasses. |

## Host & Busser Role

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| HST-001 | Must | V2.0 | M | Reservation graph | Fit promises, durations, table combinations, accessibility, server load, and walk-in reserve. |
| HST-002 | Must | V2.0 | L | Wait forecast | Quote honest ranges from turn state, party constraints, no-shows, congestion, and kitchen pace. |
| HST-003 | Must | V2.0 | M | Arrival dialogue | Handle names, delays, special occasions, seating needs, frustration, and expectation resets. |
| HST-004 | Must | V2.0 | XL | Seating topology | Balance sections and route cost while honoring table fit, fairness, and guest preference. |
| HST-005 | Must | V2.0 | S | Pre-bus circuit | Read course state, conversation, hand signals, stack risk, and server handoff while routing. |
| HST-006 | Should | V2.1 | L | Reset sequence | Clear, sanitize, dry, inspect, set, align, and release tables with material-specific rules. |
| HST-007 | Could | V2.x | M | Host/busser specialization pass | Add maître d’, reservationist, dining-room attendant, and banquet support subclasses. |

## Minigame Platform

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| MINI-001 | Must | V2.0 | M | Grammar runtime | Turn dialogue, orchestration, allocation, scheduling, evidence, diagnosis, memory, precision, packing, route, process, and construction into reusable runtime modules. |
| MINI-002 | Must | V2.0 | L | Difficulty composition | Scale cue density, simultaneity, ambiguity, motor demand, consequence, and recovery independently. |
| MINI-003 | Must | V2.0 | M | Failure taxonomy | Standardize partial failure, unsafe failure, recoverable failure, cascading failure, and abort outcomes. |
| MINI-004 | Must | V2.0 | XL | World-context binding | Feed minigames actual guests, tickets, items, tools, layouts, paperwork, and causal history. |
| MINI-005 | Must | V2.0 | S | Multiplayer handoff | Let coworkers observe, assist, take over, or receive the result without duplicating authority. |
| MINI-006 | Must | V2.0 | L | Accessibility transforms | Offer motor, timing, color, reading, audio, and cognitive alternatives without removing decisions. |
| MINI-007 | Should | V2.1 | M | Authoring preview | Give designers hot reload, seeded scenarios, input recording, scoring traces, and consequence inspection. |
| MINI-008 | Should | V2.1 | L | Minigame telemetry | Measure choice, hesitation, retries, abandonment, accessibility mode, outcome, and downstream effect. |
| MINI-009 | Should | V2.1 | XL | Anti-repetition director | Rotate equivalent activity variants while preserving role workload and operational truth. |
| MINI-010 | Could | V2.x | M | Certification suite | Require deterministic, network, save/load, accessibility, localization, and exploit tests for every new minigame. |

## Restaurant Construction

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| BUILD-001 | Must | V2.0 | M | Room and lease parcels | Represent irregular shells, lease lines, exterior access, easements, columns, windows, and expansion parcels. |
| BUILD-002 | Must | V2.0 | L | Utility network solver | Route power, gas, water, drain, ventilation, grease, data, and fire systems with capacity and code checks. |
| BUILD-003 | Must | V2.0 | M | Flow simulation heatmap | Preview staff routes, crossings, congestion, travel time, noise, sightlines, and guest exposure. |
| BUILD-004 | Must | V2.0 | XL | Code and clearance validator | Enforce exits, aisle width, accessibility, hood, hand sink, chemical, restroom, and occupancy requirements. |
| BUILD-005 | Must | V2.0 | S | Construction phases | Schedule demolition, rough-in, inspection, delivery, install, punch list, downtime, and cost overrun. |
| BUILD-006 | Must | V2.0 | L | Blueprint collaboration | Support co-owner cursors, proposals, comments, permissions, diff, vote, and rollback. |
| BUILD-007 | Should | V2.1 | M | Furniture socket system | Snap chairs, table combinations, shelving, smallwares, decor, lighting, and service accessories. |
| BUILD-008 | Should | V2.1 | L | Material wear and cleaning | Connect surfaces to slip, stain, noise, sanitation, maintenance, and replacement behavior. |
| BUILD-009 | Should | V2.1 | XL | Prefab and template library | Save, tag, share, validate, and version player-authored room modules and layouts. |
| BUILD-010 | Could | V2.x | M | Builder controller parity | Deliver precise mouse, keyboard, controller, touchpad, undo, multiselect, copy, and accessibility workflows. |

## Economy, Markets & Logistics

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| ECON-001 | Must | V2.0 | M | Regional supply pools | Clear finite produce, seafood, meat, dry goods, labor, fuel, sanitation, and contractor capacity by region. |
| ECON-002 | Must | V2.0 | L | Supplier catalog | Model quality, consistency, minimums, lead times, substitutions, recalls, terms, and relationship reputation. |
| ECON-003 | Must | V2.0 | M | Purchase order workflow | Forecast, draft, approve, transmit, receive, reconcile, dispute, and pay real orders. |
| ECON-004 | Must | V2.0 | XL | Delivery routing | Simulate docks, delivery windows, cold chain, missed drops, traffic, fuel, and receiving labor. |
| ECON-005 | Must | V2.0 | S | Labor market | Price role skill, availability, scheduling preference, commute, reputation, benefits, and regional scarcity. |
| ECON-006 | Must | V2.0 | L | Dynamic demand | Generate covers from concept, price, capacity, reviews, season, events, competition, weather, and loyalty. |
| ECON-007 | Should | V2.1 | M | Inflation and sinks | Balance wages, ingredients, leases, utilities, maintenance, taxes, fees, decor, travel, and luxury visits. |
| ECON-008 | Should | V2.1 | L | Market abuse controls | Detect collusion, wash trades, mule accounts, price manipulation, duplication, and refund fraud. |
| ECON-009 | Should | V2.1 | XL | Economy simulation lab | Run millions of agent-days with cohort dashboards, inequality measures, and sink/source attribution. |
| ECON-010 | Could | V2.x | M | Receivership and bankruptcy | Create fair warning, restructuring, sale, closure, creditor, employee, and historical-record outcomes. |

## NPCs & World Ecology

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| NPC-001 | Must | V2.0 | M | NPC role agents | Give every role perception, work selection, skill, stress, handoff, failure, and learning behavior. |
| NPC-002 | Must | V2.0 | L | Human handoff policy | Transfer NPC duty state to joining players without resets, duplicate work, or silent consequences. |
| NPC-003 | Must | V2.0 | M | Guest population | Generate grounded preferences, budgets, schedules, occasions, cultures, accessibility needs, and memory. |
| NPC-004 | Must | V2.0 | XL | Restaurant birth director | Seed new NPC concepts from regional gaps, available parcels, capital, trends, and founder traits. |
| NPC-005 | Must | V2.0 | S | Restaurant failure ecology | Let weak NPC businesses restructure, close permanently, sell assets, and leave discoverable history. |
| NPC-006 | Must | V2.0 | L | Competitor strategy | Allow NPC owners to alter menu, price, staffing, marketing, sourcing, hours, and expansion based on evidence. |
| NPC-007 | Should | V2.1 | M | Crew relationships | Model trust, conflict, mentoring, regular shifts, turnover, references, and poaching across restaurants. |
| NPC-008 | Should | V2.1 | L | AI explainability | Expose why an NPC chose, failed, quit, reviewed, purchased, or closed through inspectable facts. |
| NPC-009 | Could | V2.x | XL | Offline world budget | Simulate dormant regions at lower fidelity while preserving economically equivalent outcomes. |

## Social & MMO Systems

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| SOC-001 | Must | V2.0 | M | Friends and presence | Support privacy-aware friends, recent crew, blocks, rich presence, join permissions, and invitations. |
| SOC-002 | Must | V2.0 | L | Restaurant crews | Create persistent rosters, ranks, schedules, standards, shared goals, applications, and audit history. |
| SOC-003 | Must | V2.0 | M | Voice and text chat | Add spatial, party, crew, region, and direct channels with moderation, transcription controls, and accessibility. |
| SOC-004 | Must | V2.0 | XL | Shift finder | Match role, skill, time, language, style, mentorship, latency, and accessibility preferences. |
| SOC-005 | Must | V2.0 | S | Reputation references | Let verified coworkers and employers issue bounded, appealable endorsements grounded in shared shifts. |
| SOC-006 | Must | V2.0 | L | Mentorship contracts | Reward structured teaching without boosting, coercion, or exploitative unpaid-role play. |
| SOC-007 | Should | V2.1 | M | Regional associations | Enable restaurant groups to coordinate events, standards, purchasing, and competitions under antitrust limits. |
| SOC-008 | Should | V2.1 | L | Player events calendar | Schedule tastings, openings, tournaments, training, and private services with capacity and reminders. |
| SOC-009 | Should | V2.1 | XL | Spectator and replay | Watch consented shifts with delayed data, role overlays, privacy controls, and teachable bookmarks. |
| SOC-010 | Could | V2.x | M | Community governance | Define report, vote, ownership dispute, inactive leader, name, and shared-asset procedures. |

## Guest Influence & Competition

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| PVP-001 | Must | V2.0 | M | Guest challenge budget | Price legitimate complexity by character economy, visit context, cooldown, and staff reward. |
| PVP-002 | Must | V2.0 | L | Consent and matchmaking | Let restaurants opt into challenge tiers, events, and private practice without enabling harassment. |
| PVP-003 | Must | V2.0 | M | Fair request catalog | Author allergies, celebrations, pacing, splits, pairings, accessibility, tasting, and recovery scenarios. |
| PVP-004 | Must | V2.0 | XL | Guest objective deck | Give visitors positive goals such as discovery, hospitality testing, collecting, socializing, and spending. |
| PVP-005 | Must | V2.0 | S | Staff counterplay | Surface request intent, authority, timing, collaboration, recovery, and bounded refusal options. |
| PVP-006 | Should | V2.1 | L | Review integrity | Prevent revenge reviews, brigading, self-review, undisclosed collusion, and unverifiable claims. |
| PVP-007 | Should | V2.1 | M | Regional competitions | Score service leagues and restaurant cups on normalized demand, complexity, quality, safety, and profit. |
| PVP-008 | Could | V2.x | L | Abuse response | Detect repeated targeting, slurs, grief patterns, stalking, economic transfer, and coordinated disruption. |

## Content & Live Operations

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| LIVE-001 | Must | V2.0 | M | Season calendar service | Schedule, stage, validate, preview, launch, pause, extend, and retire events by region and cohort. |
| LIVE-002 | Must | V2.0 | L | Furniture pack pipeline | Ship themed modular sets with LODs, sockets, modifiers, prices, wear, localization, and licensing metadata. |
| LIVE-003 | Must | V2.0 | M | Subclass pack pipeline | Add roles through inherited permissions, activities, skills, animations, equipment, and matchmaking tags. |
| LIVE-004 | Must | V2.0 | XL | Restaurant concept packs | Bundle menus, recipes, equipment, decor, guest expectations, supply needs, and tutorials. |
| LIVE-005 | Must | V2.0 | S | Live balance console | Adjust bounded data values with review, simulation forecast, audit log, rollback, and player-facing notes. |
| LIVE-006 | Must | V2.0 | L | Event authoring tools | Compose quests, modifiers, world props, vendors, rewards, dialogue, incidents, and success metrics. |
| LIVE-007 | Should | V2.1 | M | Content dependency scanner | Block missing assets, cyclic inheritance, expired references, schema drift, and unsafe removals. |
| LIVE-008 | Should | V2.1 | L | Hotfix channel | Deliver signed data-only fixes separately from executable patches with version pinning and rollback. |
| LIVE-009 | Could | V2.x | XL | Archive and recurrence | Preserve event provenance and safely rerun past seasons with updated rewards and rules. |

## Native Client & UX

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| CLI-001 | Must | V2.0 | M | Production scene architecture | Replace the V1 dynamic UI shell with maintainable Godot scenes, presenters, navigation, and state stores. |
| CLI-002 | Must | V2.0 | L | Input abstraction | Support remappable keyboard, mouse, controller, Steam Input, and accessibility devices in every screen. |
| CLI-003 | Must | V2.0 | M | World map production pass | Build a performant 3D tactical globe with country selection, regional overlays, events, resources, and travel. |
| CLI-004 | Must | V2.0 | XL | Restaurant camera | Deliver occlusion, zoom, room focus, floor switching, follow, free camera, and readable urgency framing. |
| CLI-005 | Must | V2.0 | S | World cue language | Communicate ownership, responsibility, risk, urgency, handoff, accessibility, and interaction range without clutter. |
| CLI-006 | Must | V2.0 | L | HUD customization | Let players resize, move, filter, save, and role-swap panels while preserving critical safety cues. |
| CLI-007 | Should | V2.1 | M | Reconnect UX | Explain network state, preserve input, show authority recovery, and avoid duplicate player actions. |
| CLI-008 | Should | V2.1 | L | Tutorial and certification | Teach restaurant truth and MMO collaboration through role-specific practice, assessment, and recertification. |
| CLI-009 | Should | V2.1 | XL | Settings account portability | Sync graphics, audio, input, accessibility, social, and privacy settings with device overrides. |
| CLI-010 | Could | V2.x | M | Low-spec scalability | Define CPU, GPU, memory, disk, and network tiers with measured visual and simulation degradation. |

## Art, Animation & VFX

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| ART-001 | Must | V2.0 | M | Visual target bible | Lock top-down proportions, materials, lighting, silhouette, readability, color, density, and cultural reference standards. |
| ART-002 | Must | V2.0 | L | Modular character system | Build inclusive bodies, faces, hair, skin, mobility aids, outfits, accessories, color zones, and role PPE. |
| ART-003 | Must | V2.0 | M | Locomotion set | Animate eight-way walk, run, carry, push, pull, turn, stop, squeeze, slip, recover, and fatigue. |
| ART-004 | Must | V2.0 | XL | Role interaction library | Create tool- and station-aware cooking, serving, washing, cleaning, paperwork, hosting, and management actions. |
| ART-005 | Must | V2.0 | S | Object modular kit | Produce grid-safe furniture, equipment, decor, walls, floors, doors, utilities, damage, soil, and upgrade states. |
| ART-006 | Must | V2.0 | L | Food presentation pipeline | Represent ingredients, prep states, cooking transitions, plating layers, defects, steam, and spoilage. |
| ART-007 | Should | V2.1 | M | Urgency VFX language | Show heat, spills, smoke, grease, water, breakage, pests, contamination, and safe containment without visual spam. |
| ART-008 | Should | V2.1 | L | Lighting and ambience | Support time, weather, fixtures, windows, emergency states, mood, visibility, and performance budgets. |
| ART-009 | Should | V2.1 | XL | LOD and atlas pipeline | Automate import, pivots, sockets, atlases, variants, LODs, collision, thumbnails, and validation. |
| ART-010 | Could | V2.x | M | Cultural art review | Review regional architecture, uniforms, food, signage, symbols, and decor with paid subject experts. |

## Audio

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| AUD-001 | Must | V2.0 | M | Restaurant soundscape | Layer crowd, HVAC, kitchen, dish pit, street, music, weather, and room acoustics by live state. |
| AUD-002 | Must | V2.0 | L | Role action audio | Create material-, tool-, speed-, quality-, and failure-aware sounds for every repeated interaction. |
| AUD-003 | Must | V2.0 | M | Operational callouts | Make behind, corner, hot, sharp, hands, pickup, 86, heard, and emergency calls spatial and readable. |
| AUD-004 | Must | V2.0 | XL | Adaptive score | Move between prep, open, rush, recovery, close, success, and failure without masking operational cues. |
| AUD-005 | Should | V2.1 | S | Audio accessibility | Caption directional cues, visualize critical sound classes, and expose independent dynamic-range controls. |
| AUD-006 | Should | V2.1 | L | Voice pipeline | Define casting, recording, localization, runtime assembly, consent, moderation, and AI-voice prohibitions. |

## Accessibility & Localization

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| ACC-001 | Must | V2.0 | M | Accessibility requirements | Set WCAG-informed and game-specific motor, vision, hearing, cognitive, speech, and fatigue targets. |
| ACC-002 | Must | V2.0 | L | Timing alternatives | Offer pause-safe practice, widened windows, rhythm alternatives, and decision-equivalent assist modes. |
| ACC-003 | Must | V2.0 | M | Color and contrast | Validate cues across color-vision profiles, HDR, low vision, glare, and customizable palettes. |
| ACC-004 | Must | V2.0 | XL | Screen reader semantics | Expose menus, work queues, paperwork, builder state, maps, chat, and results through accessible structure. |
| ACC-005 | Must | V2.0 | S | Localization architecture | Externalize text, units, dates, currencies, names, layouts, fonts, plural rules, and content-pack strings. |
| ACC-006 | Should | V2.1 | L | Restaurant terminology review | Use region-appropriate job, ingredient, safety, and service terminology without flattening differences. |
| ACC-007 | Should | V2.1 | M | RTL and complex scripts | Support bidirectional layout, shaping, line breaking, input, search, and mixed operational notation. |
| ACC-008 | Could | V2.x | L | Accessibility playtest lab | Run recurring paid tests with disabled players and publish issue ownership and closure evidence. |

## Platform, Launcher & Release

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| PLAT-001 | Must | V2.0 | M | Signed native launcher | Replace HTA/VBS developer controls with a signed, accessible launcher and local-world service manager. |
| PLAT-002 | Must | V2.0 | L | Differential patcher | Download signed chunk manifests, verify hashes, repair installs, resume, rollback, and limit bandwidth. |
| PLAT-003 | Must | V2.0 | M | Client crash reporter | Capture consented dumps, logs, hardware, build, and session correlation with privacy scrubbing. |
| PLAT-004 | Must | V2.0 | XL | Server deployment artifact | Build minimal signed containers and local binaries with SBOM, provenance, health, and rollback metadata. |
| PLAT-005 | Must | V2.0 | S | Code signing | Protect Windows executables, installer, updater, crash tools, and release manifests with rotated keys. |
| PLAT-006 | Must | V2.0 | L | Installer and uninstall | Install per-user safely, preserve or remove world data by explicit choice, and leave no background services. |
| PLAT-007 | Should | V2.1 | M | Environment promotion | Promote immutable builds through dev, integration, staging, certification, canary, and production. |
| PLAT-008 | Should | V2.1 | L | Store platform integration | Implement entitlements, invites, rich presence, achievements, overlay, cloud settings, and compliance per store. |
| PLAT-009 | Should | V2.1 | XL | Release rollback drill | Prove executable, content, schema, server, and economy rollback paths on a production-like environment. |
| PLAT-010 | Could | V2.x | M | Open-source notice automation | Generate complete per-artifact licenses, SBOMs, source offers, and attribution screens. |

## Security, Trust & Safety

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| SEC-001 | Must | V2.0 | M | Threat model | Model account, economy, authority, chat, modding, launcher, supply-chain, privacy, and insider threats. |
| SEC-002 | Must | V2.0 | L | Authentication hardening | Add verified email, MFA, device sessions, breach checks, recovery, revocation, and suspicious-login response. |
| SEC-003 | Must | V2.0 | M | Authorization policy | Centralize owner, manager, employee, guest, moderator, support, liveops, and service permissions. |
| SEC-004 | Must | V2.0 | XL | Anti-cheat signals | Detect impossible movement, action timing, task authority, automation, memory tampering, and replay abuse server-side. |
| SEC-005 | Must | V2.0 | S | Secure content signing | Sign manifests, packs, scripts, schemas, and hotfixes; reject downgrade and substitution attacks. |
| SEC-006 | Should | V2.1 | L | Secrets and key management | Store, rotate, audit, and least-privilege database, signing, payment, moderation, and service credentials. |
| SEC-007 | Should | V2.1 | M | Moderation case system | Unify reports, evidence, chat, replays, sanctions, appeals, privacy access, and moderator accountability. |
| SEC-008 | Could | V2.x | L | Penetration and abuse testing | Commission recurring external tests across API, client, launcher, economy, social, and operations. |

## Quality, Performance & Certification

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| QA-001 | Must | V2.0 | M | Test pyramid | Define unit, property, simulation, contract, integration, client, soak, compatibility, and exploratory ownership. |
| QA-002 | Must | V2.0 | L | Restaurant scenario suite | Automate normal, rush, call-out, outage, allergy, spill, injury, inspection, closure, and recovery shifts. |
| QA-003 | Must | V2.0 | M | Role expert acceptance | Require paid role veterans to score authenticity, workload, terminology, consequence, and fun. |
| QA-004 | Must | V2.0 | XL | Network chaos lab | Inject latency, loss, duplication, reordering, disconnect, region failover, and partial service failure. |
| QA-005 | Must | V2.0 | S | Economy exploit suite | Fuzz trades, refunds, retries, inventory, closures, transfers, events, and cross-service ledger edges. |
| QA-006 | Must | V2.0 | L | Performance budgets | Gate frame, simulation, server tick, query, replication, memory, load, patch, and startup targets. |
| QA-007 | Should | V2.1 | M | Hardware compatibility | Cover supported CPU, GPU, RAM, storage, display, controller, audio, network, and OS matrices. |
| QA-008 | Should | V2.1 | L | Save upgrade matrix | Upgrade representative worlds and accounts from every supported production schema/content combination. |
| QA-009 | Should | V2.1 | XL | Localization functional QA | Verify clipping, fonts, input, sorting, units, speech, screenshots, and culturally sensitive content. |
| QA-010 | Could | V2.x | M | Launch certification war room | Track blockers, ownership, evidence, rollback, customer support, status, and executive go/no-go. |

## Analytics & Research

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| ANL-001 | Must | V2.0 | M | Event taxonomy | Define privacy-reviewed account, world, shift, role, minigame, economy, social, content, and performance events. |
| ANL-002 | Must | V2.0 | L | Experiment platform | Assign cohorts, guardrails, exposure, attribution, significance, stopping, and audit across live features. |
| ANL-003 | Must | V2.0 | M | Role workload dashboard | Measure idle time, queue pressure, off-role work, failures, recovery, handoffs, stress, and retention. |
| ANL-004 | Must | V2.0 | XL | Restaurant health model | Explain demand, margin, sanitation, reviews, staffing, logistics, capital, and closure risk without opaque punishment. |
| ANL-005 | Must | V2.0 | S | Economy source/sink dashboard | Trace currency, item, labor, ingredient, and capacity creation, transfer, hoarding, and destruction. |
| ANL-006 | Should | V2.1 | L | Accessibility outcomes | Measure adoption, completion, frustration, retention, and parity without inferring disability. |
| ANL-007 | Could | V2.x | M | Research repository | Index playtests, interviews, surveys, support, telemetry, decisions, and follow-up by feature and cohort. |

## Operations & SRE

| ID | Priority | Target | Size | Task | Brief |
|---|---|---|---:|---|---|
| OPS-001 | Must | V2.0 | M | Service-level objectives | Set availability, latency, durability, tick, reconnect, matchmaking, chat, patch, and support SLOs. |
| OPS-002 | Must | V2.0 | L | Observability standard | Correlate client, gateway, service, shift, database, queue, economy, and deploy telemetry with bounded cost. |
| OPS-003 | Must | V2.0 | M | On-call and escalation | Create rotations, severity, ownership, paging, handoff, incident command, and executive communication. |
| OPS-004 | Must | V2.0 | XL | Runbook library | Document degraded regions, stuck shifts, ledger lag, auth outage, bad content, exploit, and rollback procedures. |
| OPS-005 | Must | V2.0 | S | Capacity forecasting | Forecast concurrency, shifts, entities, bandwidth, storage, events, releases, and regional growth. |
| OPS-006 | Must | V2.0 | L | Disaster recovery exercise | Lose a region and prove traffic, state, ledger, backup, communication, and recovery objectives. |
| OPS-007 | Should | V2.1 | M | Game status service | Publish region, login, shift, social, store, patch, incident, and maintenance status independently. |
| OPS-008 | Should | V2.1 | L | Cost allocation | Attribute infrastructure and vendor cost by region, feature, environment, event, and cohort. |
| OPS-009 | Should | V2.1 | XL | Support tooling | Give least-privilege account, shift, purchase, restaurant, moderation, and recovery views with audit logs. |
| OPS-010 | Could | V2.x | M | Live incident postmortems | Publish blameless timelines, contributing factors, player impact, corrective owners, and verification. |

