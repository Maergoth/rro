# V1 release gate

**Baseline:** `1.0.0-alpha.2`
**Protocol/database line:** clean `rro.v1` / schema 1  
**Decision:** production-foundation source alpha and Linux native launch are verified; Windows binary 1.0 is not yet signed off

This gate prevents “source exists” from being confused with “production game is shipped.” A row is **Pass** only when its evidence exists in the repository or an automated check. **Runtime required** means a platform-specific execution/export still needs evidence. **Production required** means a staffed operational capability is still missing.

## Current evidence

| Gate | Status | Evidence | Exit requirement |
|---|---|---|---|
| Clean V1 boundary | Pass | No V0 imports/routes/schema; release filter excludes `legacy/` | Keep compatibility tests explicitly negative |
| TypeScript server build | Pass | Strict `tsc`; declarations/source maps emitted | Keep Node 24 matrix green |
| Authentication | Pass (local alpha) | scrypt signup/login, digested tokens, expiry, logout, protected endpoints | Email verification, recovery, MFA, breach and security review for production |
| V1 database | Pass (local alpha) | 30+ normalized tables, foreign keys, WAL, prepared statements, persistent character inventory/loadouts and audit events | Forward migrations, backups, restore drills, retention, corruption repair |
| World seed | Pass | 6 countries, 13 regions, 115 capacity, 23 NPC houses; validator asserts 20% | World-design and cultural review before public launch |
| Seasonal content | Pass | Pack manifest, dated event, active demand/resource modifiers, temporary furniture | Live schedule/rollback/entitlement tooling |
| Shared shifts | Pass | Public discovery, employee/guest join, duty slots, NPC handoff, authoritative snapshot | Multi-machine concurrency, reconnect, prediction and large soak |
| Role workload | Pass (breadth baseline) | 7 roles, 196 skills, 89 activities, four lanes, three phases per activity | Expert-authentic depth, more activity variants, balance and certification |
| Task authority | Pass | Server validates claim, owner role, phase action, timing, score, idempotency and reward | Exploit/automation detection and binary protocol |
| Failure/consequence | Pass (slice) | Risky choices, lateness, off-role penalty, spill, sanitation, patience, furniture wear/breakage and evidence review | Full food/ticket/ingredient/safety/maintenance propagation |
| Guest rivalry | Pass (targeted slice) | Visiting local rivals spend earned cash to choose a live party task, one of five difficulty dimensions and three intensities; telegraphing, cooldown/caps, counterplay and upside are server-owned | Consent tiers, moderation, matchmaking, collusion controls and competition balance |
| Character creation | Pass | Two strengths, two weaknesses, mixed stats, role-fit calculation, outfit colors | Production avatar breadth, animation, accessibility and persistence QA |
| Skill trees | Pass (data/runtime) | 28 nodes per base role, prerequisites, cost, unlock endpoint | Skill-effect integration, loadouts, respec economy and subclasses |
| Role equipment | Pass (slice) | 45 purchasable tools/consumables, role/level eligibility, four-slot loadouts, persistent quantities, shop/inventory UI and audited personal-cash actions | Bind all effects into minigames, equipment wear/repair, balance, and 45 bespoke icons |
| Furniture economy | Pass (slice) | 229 inventory definitions with non-linear price/stat tradeoffs; live rating, happiness, workload, role/task, revenue/upkeep, wear, broken-state and owner repair effects | Balance/telemetry, utilities, placement storage, maintenance staffing and full art coverage |
| Modular layout | Pass (slice) | 24×16 cells; authoritative native room-tag brush; operational assignment/dining/kitchen/egress/circulation/service-clearance checklist; one canonical authority per physical wall segment; walls/openings; floor, wall and ceiling objects; mount-aware drag/rotation; local staged preview with atomic commit/cancel; collision; path/egress validation; sale/repair; expansion that relocates perimeter openings and wall mounts; monotonic optimistic revisions; persistent audited undo/redo | Routed utilities/ventilation, jurisdiction-specific code policy, richer collaboration and nav/flow heatmap |
| Modular art | Partial (authoritative ledger) | Elevated orthographic-isometric directional runtime is integrated; legacy direct-overhead furniture files are reference-only; the generated [production art ledger](ART_PROGRESS.md) records per-asset visual QA, runtime binding, remote preservation, and CI evidence | Complete every unresolved ledger lane, including directional furniture, construction/world/UI art, modular character layers and animation; audio/VFX remain separate production work |
| Godot parse/type quality | Pass | Godot 4 engine-model GDScript analyzer reports 0 errors and 0 warnings | Keep as CI gate; CI also imports with a real editor |
| Godot native execution | Pass (Linux headless) | Godot 4.4.1 imported all assets, registered the inventory UI and launched the main scene with exit code 0 | Complete graphical/two-client acceptance on target Windows hardware |
| Windows client export | Runtime required | Tagged workflow installs Godot/templates and exports preset | Produce, hash and launch real EXE on Windows; no source-only substitution |
| Windows server controller | Source pass / runtime required | Hidden start, health, graceful loopback-token stop, exact-PID fallback | Execute start/stop/delete/restart tests on supported Windows versions |
| Standalone server artifact | Pass after release | Pinned Node 24.14.0 PE runtime with SHA-512 verification, app/data/config/control, separate ZIP | Windows runtime smoke and malware/signature pipeline |
| Separate distribution | Pass | Server, GitHub source, planning and client runtime/source artifacts have distinct names/manifests | Preserve separation in CI publishing |
| Automated server tests | Pass | Full content, furniture, inventory, canonical-wall/expansion, mount, layout-history, live simulation, rivalry, persistence and HTTP/WebSocket regression suite | Add chaos, persistence-upgrade, security, load, broader property and replay tests |
| Accessibility | Production required | Non-color cues and data-driven input concept only | Requirements, remapping, screen reader, timing alternatives, disabled-player tests |
| Localization | Production required | Strings are not yet fully externalized | Localization architecture, fonts, RTL, terminology and functional QA |
| Security/trust | Production required | Local authority and rate/body limits exist | Threat model, MFA, signing, moderation, anti-cheat, pen test, privacy/compliance |
| Operations/SRE | Production required | Health and graceful local stop exist | Hosted SLOs, deployment, observability, on-call, DR, status and support tools |
| AAA content volume | Production required | Vertical-slice data and modular art foundation | Staff and ship the V2 art, audio, role, region, menu and seasonal program |

## Automated command gate

The following must pass from a clean dependency install:

```bash
npm ci
npm run verify
```

`verify` performs:

1. production-data validation, including exact world occupancy, 229 furniture items and the 4× clock;
2. full GDScript parse/type diagnostics with zero errors/warnings plus explicit furniture/item artwork coverage;
3. strict TypeScript type checking;
4. deterministic content generation and server compilation;
5. the full Node suite for content, furniture effects/wear/repair, persistent role equipment, canonical wall topology and expansion, building history, role work, targeted rivalry, HTTP auth, and WebSockets.

The release build additionally requires:

```bash
npm run smoke:server
godot --headless --path apps/client-godot --editor --quit
godot --headless --path apps/client-godot --export-release "Windows Desktop" "build/windows/Rush & Revenue Online.exe"
npm run release
```

The release tool will not create a runtime-named client ZIP if the EXE is absent.

## Native acceptance session

Before promoting alpha to beta, record one complete test with at least two client processes:

1. start and stop the standalone server through the Windows control UI;
2. create two accounts and verify persistent relogin;
3. select a country and region and compare restaurant stats/resources;
4. apply to a restaurant;
5. join the same live shift in two roles and observe NPC handoffs;
6. move, collide with equipment, claim owned work, and complete all three phases;
7. deliberately perform a risky route/process choice and recover the resulting incident;
8. leave/rejoin without duplicating rewards or claims;
9. visit a local rival as a guest, target a visible party task, choose its difficulty dimension/intensity, and verify telegraphing, counterplay, caps, rewards and review evidence;
10. buy, equip, unequip and use role inventory; restart and confirm the persistent loadout and quantities;
11. found a restaurant, paint and room-zone, confirm the operational opening checklist, wall, door, place mixed furniture, verify rating/workload/economy changes, advance wear, repair, drag, rotate, sell and expand;
12. close client and server, restart, and verify the same account/world/layout/inventory;
13. stop gracefully and immediately rename/delete the extracted old folder.

## Promotion policy

- **V1 source alpha:** current `alpha.2` baseline when `npm run verify` and the recorded headless Godot import/launch pass.
- **V1 native alpha:** requires a real exported client and the native acceptance session.
- **V1 beta:** requires migrations/backups, reconnect, utility/inventory depth, accessibility pass, multi-client soak and external restaurant-role tests.
- **V1 production 1.0:** requires signing/updating, security and privacy review, full licenses/SBOM, crash/support/observability, platform certification and resolved launch blockers.
- **V2:** the team-scale AAA program in `docs/V2_AAA_ROADMAP.md`; it is not a label applied to unfinished V1 work.
