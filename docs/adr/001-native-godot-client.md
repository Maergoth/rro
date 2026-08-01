# ADR-001: Native Godot Client with an Authoritative Node/TypeScript Server

**Status:** Accepted and implemented for the V1 source line  
**Date:** 2026-07-31  
**Decision owners:** Product and engineering  
**Applies to:** Gameplay client, live restaurant simulation boundary and release packaging

## Context

At the time of this decision, the game client was a React/Vite browser application. That was effective for proving account, globe, region, role, furniture and minigame concepts, but it worked against core requirements:

- the page itself can be selected or dragged;
- right-click invokes browser behavior unless every surface suppresses it;
- the restaurant is a static image with DOM markers rather than a tile/object world;
- movement, collision, navigation, animation and spatial input need custom browser infrastructure;
- NPCs and work stations are presentation elements rather than agents and entities;
- desktop packaging still exposes web-runtime behavior.

CSS rules such as `user-select: none`, `draggable=false`, pointer capture and `preventDefault()` can reduce immediate symptoms. They do not supply a production world editor, character controller, navigation system, animation graph or native input model.

The game also already has useful Node server, SQLite persistence and JSON content-pack work. The engine decision should not force an unnecessary database/world rewrite.

## Decision

Build the moment-to-moment game client in **Godot 4.4.1+** and retain/refactor the server as an authoritative Node/TypeScript application.

- Use Godot for the globe presentation, region map, modular restaurant builder, live floor, characters, animation, audio, task interactions and game UI.
- Use HTTP for authentication, bootstrap and content manifests.
- Add WebSocket transport for presence, commands, snapshots and domain events.
- Keep time, random seeds, movement validation, construction, guests, tasks, rewards, reviews and economy authoritative on the server.
- Keep SQLite as the local one-player adapter and introduce a production database adapter behind repository interfaces.
- Retain React only for optional operator/content administration tools. It is not the production gameplay floor.
- Ship a separate native launcher/updater and a separate standalone server package. Neither requires a command prompt for normal use.

The source/CI baseline pins Godot 4.4.1 while permitting compatible later 4.x editors. Godot's official APIs provide layered tile maps, 2D character movement/collision, 2D navigation, animation playback and high-level multiplayer primitives: [TileMapLayer](https://docs.godotengine.org/en/stable/classes/class_tilemaplayer.html), [CharacterBody2D](https://docs.godotengine.org/en/stable/classes/class_characterbody2d.html), [NavigationServer2D](https://docs.godotengine.org/en/stable/classes/class_navigationserver2d.html), [AnimationPlayer](https://docs.godotengine.org/en/stable/classes/class_animationplayer.html), [high-level multiplayer](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html).

Godot's scene replication/RPC system is not the MMO persistence contract. Because the server remains Node/TypeScript, the production protocol is an engine-neutral, versioned command/event schema over WebSockets. Godot networking helpers may still be used for client-side transport and local test harnesses.

## Why Godot

### Native input and camera ownership

Right-click, drag, pointer capture, keyboard focus and camera movement are game input events rather than browser defaults. The builder can explicitly separate pan, marquee, object move and rotate modes. This directly resolves the current page-drag/context-menu class of problems.

### Suitable 2D world primitives

Godot provides the parts needed to build, rather than fake, the restaurant:

- layered tile rendering for floors, walls and overlays;
- physics bodies/collision for characters and obstacles;
- 2D navigation maps/regions for routes and dynamic layout updates;
- animation players/trees for layered work states;
- native window/export pipeline for the intended desktop game.

These APIs do not solve game design automatically, but they remove the need to create a bespoke DOM/canvas engine before implementing the restaurant.

### Data-driven compatibility

Godot can consume JSON definitions and asset manifests. Stable IDs and versioned schemas allow the existing role/world/furniture concepts to survive. The server remains the source of truth, so new clients and operator tools can coexist as long as they implement the protocol.

### Appropriate scope

The game is a top-down 2D simulation, not a photorealistic 3D title. Godot supplies the required editor/runtime without the larger production footprint of a full 3D-first stack.

## Alternatives considered

| Option | Strengths | Material problems for this project | Decision |
|---|---|---|---|
| Continue React DOM | Maximum reuse; fast menus/forms | Restaurant remains a page; weak spatial editor/animation/pathing ergonomics; browser input leaks; authority still must be built | Reject for gameplay; retain for admin tools |
| Phaser + Electron | JavaScript continuity; proper canvas tile map; lowest code-language migration | Still a browser runtime; more custom editor/navigation/tooling; desktop input symptoms can be suppressed but architecture remains web-centric | Viable fallback, not preferred |
| Godot | Native 2D workflow, tiles, collision, navigation, animation, desktop export; permissive engine; compact scope | New client language/editor and deliberate Node protocol integration required | Select |
| Unity | Mature 2D tilemap, animation and tooling; large ecosystem | Higher runtime/tooling complexity and production overhead than this 2D scope requires; larger migration without a decisive benefit | Do not select now |

Phaser's official tile-map API supports runtime map modification and several map orientations, so it is a credible lower-migration option, but it does not remove the web-runtime decision: [Phaser Tilemap API](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap). Unity likewise has a capable official 2D feature set and Tilemap system; capability is not the objection: [Unity 2D feature set](https://docs.unity3d.com/6000.0/Documentation/Manual/2DFeature.html), [Unity Tilemaps](https://docs.unity3d.com/6000.5/Documentation/Manual/tilemaps/tilemaps-landing.html).

## Consequences

### Positive

- Browser page drag and context menu behavior disappear from gameplay.
- The restaurant can be composed of real floors, walls, objects, collisions and work anchors.
- Animation and pathing become normal engine systems rather than CSS/DOM conventions.
- Native releases better match player expectations for an MMO.
- The server/data investment can be retained.
- Content packs stay engine-neutral and support future subclasses, seasons and furniture.

### Costs

- The React floor and minigame components become reference prototypes rather than production code.
- The team must establish Godot conventions, build/export automation and a new UI layer.
- A versioned WebSocket command/event protocol must be designed.
- Existing PNG scene art must be decomposed or replaced with modular assets.
- Native-runtime verification and production asset work remain after the source cutover.

### Risks and mitigations

| Risk | Mitigation |
|---|---|
| Big-bang rewrite stalls | Use a strangler migration with small parity gates; do not rewrite accounts/world data first |
| Client/server schemas drift | Generate validators/types from versioned contracts; compatibility handshake at login |
| Godot prototype becomes client-authoritative | Server creates tasks and validates commands from the first spike |
| Tile editing invalidates navigation during play | Rebuild only affected regions; server validates access before commit; benchmark in Milestone 0/1 |
| Art pipeline outruns code | Publish one strict object/character asset contract before bulk production |
| React prototype keeps receiving production features | Mark the web floor frozen and route new gameplay only to Godot |

## Migration record

| Milestone | V1 result |
|---|---|
| Freeze browser gameplay | Complete; V0 is audit-only and excluded from artifacts |
| Bootstrap Godot | Complete; native login, bootstrap, world screens, and modular floor exist |
| Live transport | Complete for V1; authenticated WebSocket commands and snapshots |
| Prove construction | Complete for V1; floors, walls/openings, place/drag/right-rotate/sell/expand |
| Prove agents | Foundation complete; authoritative movement, presence, NPC duty coverage, incidents |
| Party/work slice | Foundation complete; parties, role queues, multi-phase activities, guest pressure, reviews |
| Native-only cutover | Complete in the source/release boundary |
| Runtime acceptance | Pending a real Godot/Windows multi-client acceptance session |

## Acceptance test for this ADR

The decision is validated when a clean Windows machine can:

1. install/extract the standalone local server package;
2. double-click its UI/tray executable without seeing a command prompt;
3. install/extract and double-click the native launcher;
4. sign up and enter a restaurant;
5. move with collision, pan/zoom the camera, drag an object and right-click to rotate it;
6. see a second connected client move;
7. disconnect/reconnect without losing restaurant state;
8. close both applications cleanly.

If the Milestone 0 benchmarks show an unresolvable export, navigation or protocol problem, Phaser/Electron is the documented fallback. It should be selected only with measured evidence from the spike, not to avoid the client migration itself.
