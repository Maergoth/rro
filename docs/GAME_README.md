# Rush & Revenue Online — native game client

Rush & Revenue Online is a native Godot 4 desktop client for the separate `rro.v1` world server. It is not a browser page, Electron wrapper, or pre-rendered restaurant. Mouse and keyboard input belongs to the game viewport: there is no browser context menu or whole-page drag behavior.

## Know which package you have

| Archive | Contains | Player-ready? |
|---|---|---|
| `RRO-Game-Client-<version>-windows-x64.zip` | A real Godot Windows export plus graphical launcher | Yes, after the separate server is started |
| `RRO-Godot-Client-Source-<version>.zip` | Godot project, GDScript, scenes, modular SVG/PNG assets, export preset | No; export it with Godot 4.4.1+ |

The release tool never renames source into a fake executable. Tagged GitHub release CI installs the pinned Godot export templates and creates the native game-client archive.

## Play the Windows build

1. Extract the standalone server ZIP and start it with **RRO Server Control.hta**.
2. Extract the game-client ZIP to a separate folder.
3. Double-click **Rush and Revenue Launcher.hta**.
4. Confirm that the local world indicator is online, then select **Play**.
5. Sign up to create a randomized character or log into an existing local account.
6. Use **Leave shift** before changing restaurants or roles. Closing the client does not stop or erase the server world.

The launcher can start a co-located server package for development convenience, but the supported player release keeps game and server in separate extracted folders and starts the server explicitly.

## What the current V1 client supports

- signup, login, persisted session, logout, and expired-session recovery;
- a tactical globe with country selection, regions, finite licenses/resources, demand, and live shift counts;
- restaurant lists with concept, style, rating, sanitation, generation, public status, and applications;
- public employee or guest entry into any open shift;
- NPC duty coverage and visible handoff when a player takes a role;
- server-authoritative top-down movement and collision;
- role workboards that distinguish owned, coworker-owned, and off-role tasks;
- three-phase work interactions rendered through 12 minigame grammars;
- emergent incidents, visible spills, satisfaction/patience, sanitation, failure, and recovery;
- paid local-rival guest requests with manual live-task, difficulty-dimension and intensity selection, visible counterplay and server caps;
- randomized aptitudes, calculated role fit, seven independent 28-node skill trees;
- a persistent personal shop/inventory with 45 role-specific tools and consumables, four equipment slots per role, stable icons and session-to-session loadouts;
- outfit silhouette plus primary and secondary color customization;
- restaurant founding and a persistent modular design studio;
- floor painting/zoning, snapped walls/doors/arches, object placement, drag/move, four rotations, sale, repair, and add-on area;
- a 229-item furniture economy whose condition and mixed stat portfolio affect rating, happiness, role work, cleanliness, revenue, upkeep and breakdown risk.

This is a source alpha/vertical-slice foundation. It is not yet a content-complete or operated AAA MMO. See `V1_RELEASE_GATE.md` for the exact boundary and `V2_AAA_ROADMAP.md` for the production program.

## Controls

| Context | Input |
|---|---|
| Restaurant movement | `WASD` or arrow keys |
| Zoom | Mouse wheel, centered around the pointer |
| Camera pan | Middle-button drag |
| Choose navigation/UI action | Left click |
| Paint floor | Choose a surface, then left-drag across cells |
| Draw wall/opening | Choose wall, door, or arch, then click a cell edge |
| Place furniture/decor | Choose an item, rotate if needed, then click/drag on the grid |
| Select/move object | Pointer tool, then drag a placed object |
| Rotate preview/selection | Right click or `R` |
| Sell selected object | **Sell selected** in the builder palette |
| Add area | **Add 4×4 area** in the builder palette |
| Leave service | **Leave shift**; NPC coverage resumes |
| Close client | **Quit** or the operating-system close control |

Right click is handled only inside the restaurant canvas. It does not open an unrelated context menu. Furniture placement and movement remain provisional until accepted by the server; rejected overlap, bounds, ownership, or funding does not mutate the saved layout.

## First-session path

1. Create an account. The character receives two stronger aptitudes, two weaker aptitudes, and mixed middle values.
2. Open **Character** to review role fit and choose outfit colors. Fit is advice, never a class lock.
3. Open **Globe**, choose a country and region, then inspect local restaurants and resources.
4. Apply for a selected role or enter a live shift immediately where a public duty is available.
5. Claim work marked for your role. Off-role work remains possible but is visibly labeled and carries a small performance penalty.
6. Complete each phase by reading the live state and choosing a controlled or riskier response.
7. Recover spills, late work, sanitation problems, or guest dissatisfaction before they cascade into review evidence.
8. Spend earned money on role tools/consumables, or visit another local restaurant and add a bounded visible modifier to one of your party's minigames.
9. Founding unlocks the design studio, where furniture mix, condition and layout affect ratings, workload, shift economics and movement rather than decorating a flat image.

## Work and minigames

Every role receives concurrent work across immediate, forecast, preventative, and paperwork lanes. Current task definitions cover 89 activities and use these visual/control grammars:

| Grammar | Main decision |
|---|---|
| Dialogue | Read context, choose phrasing, confirm the loop |
| Orchestration | Sequence interdependent service/kitchen actions |
| Allocation | Assign finite people, money, or product |
| Scheduling | Fit tasks, breaks, prep, or tables against time |
| Evidence | Inspect facts and document a defensible decision |
| Diagnosis | Identify a cause before applying a correction |
| Memory | Retain seat, modifier, order, or product state |
| Precision | Execute inside a controlled quality/safety window |
| Packing | Optimize racks, trays, storage, or containers |
| Route | Choose movement order around live constraints |
| Process | Maintain a multi-step standard without skipping controls |
| Construction | Place or connect spatial primitives under cost/flow rules |

The server supplies the phase, permitted actions, deadlines, context, ownership, and consequences. The client cannot award itself a score.

## Character and role progression

All seven base roles progress separately: Manager, Owner, Server, Dishwasher, Chef, Cook, and Host/Busser. Each has 28 data-driven nodes with prerequisites and costs. Random starting stats make some roles easier at first but do not prevent mastery in any role. Each role also owns a four-slot persistent loadout and at least nine equipment/consumable choices; prices buy situational tradeoffs rather than a single linear best item.

The current data/runtime can resolve inherited subclass definitions. Production subclass animation, matchmaking, equipment, authoring, balance, and migration support are V2 tasks—not a claim that all subclasses already ship.

## Restaurant design studio

The starting shell is 24×16 cells and can expand to the configured limit. Floors, wall edges, openings, and furniture instances persist separately. The 229-item furniture catalog has a footprint, price, upkeep, repair cost, style/tier, comfort, appearance, cleanability, reliability, role/service modifiers, durability, breakage horizon, rotation, and stable one-to-one asset ID. Some expensive pieces have better total stats, but the catalog deliberately mixes strengths, drawbacks and niches; duplicate benefits taper while physical capacity remains additive.

Placed items immediately change effective restaurant rating, arriving-party happiness, visible role workload, maintenance-task volume, reliability risk, task support, review baselines and shift economics. Wear advances at settlement, transitions through worn and broken states, raises role-authentic maintenance pressure, and can be repaired by the owner with audited treasury spending.

Production furniture uses transparent north/east/south/west sprites authored for the elevated orthographic-isometric restaurant floor. Files under `assets/objects/generated/` use the obsolete direct-overhead camera and remain identity/material references only; they never count as runtime production art. Live furniture, equipment, construction, world/UI, and modular-character status is reported only by the generated [production art ledger](ART_PROGRESS.md), including every visual-review, runtime-binding, remote-preservation, and CI gate.

Current studio validation covers plot bounds, footprint overlap, owner authority, cost, four rotations, and sale. Utility routing, building-code clearance, undo/history, floor switching, collaborative blueprints, and flow heatmaps remain roadmap work.

## Run or export from source

Requirements:

- Godot 4.4.1 or newer;
- the Windows Desktop export templates for a Windows build;
- the separate V1 server running at `http://127.0.0.1:8788`.

Open `client-source/project.godot` from the source-client ZIP, or `apps/client-godot/project.godot` from the repository. Run the main scene for development.

To export from the repository:

```bash
godot --headless --path apps/client-godot --editor --quit
godot --headless --path apps/client-godot --export-release "Windows Desktop" "build/windows/Rush & Revenue Online.exe"
```

The export preset is source-controlled. The tagged GitHub workflow runs the same import/export gate before release packaging.

## Troubleshooting

- **Server unavailable:** start the separate control app and check `http://127.0.0.1:8788/health`.
- **Source package says export required:** this is expected; it contains no fabricated executable.
- **Login fails after deleting the world:** accounts live in the deleted V1 database; create a new local account or restore a stopped backup.
- **Furniture will not place:** check bounds, overlap, rotation, and restaurant treasury.
- **Furniture underperforms:** inspect its wear/broken state and the room's duplicated stat mix; owners can repair placed objects from the authoritative layout API.
- **Task cannot be claimed:** another coworker may own it, or the player is a guest.
- **Old folder cannot be deleted:** use the server package's **Stop gracefully**; the game client itself owns no background host process.
