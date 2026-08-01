# Windows release operations

This runbook defines what the V1 release tool produces and prevents source archives from being mistaken for runnable game builds.

## Artifact contract

| Artifact | Contents | Runtime status |
|---|---|---|
| `RRO-Standalone-Server-<version>-windows-x64.zip` | Compiled authority, game data, `ws`, pinned Node 24.14.0 x64 runtime, server control, config, notices | Runnable on supported Windows after extraction |
| `RRO-Game-Client-<version>-windows-x64.zip` | Real Godot Windows Desktop export and graphical launcher | Runnable; produced only when the export exists |
| `RRO-Godot-Client-Source-<version>.zip` | Godot project, assets, export preset, launcher source | Not runnable; intentionally emitted when no export exists |
| `RRO-GitHub-Source-<version>.zip` | Dev-friendly server/client/data/tests/tools/docs/workflows | Source; excludes dependencies, builds, saves, release output, and V0 legacy |
| `RRO-V2-AAA-Production-Plan-<version>.zip` | GDD, README, V1 gate, MoSCoW roadmap, Markdown/JSON backlog | Planning material |
| `SHA256SUMS.txt` | SHA-256 for each ZIP | Integrity metadata |
| `release-manifest.json` | Protocol, clean-break flag, size, hash, kind, and runnable truth | Machine-readable release inventory |

The server and game remain separate ZIPs. Never merge their installation folders in a published player release.

## Build gate

From a clean source checkout:

```bash
npm ci
npm run verify
```

`verify` validates generated content, the exact 20% world seed, the 4× clock, GDScript with zero errors/warnings, strict server types, HTTP/WebSocket integration, role work, guest challenges, and modular construction.

The release command also runs `npm run smoke:server`, which starts the compiled entry point against a temporary SQLite world, checks health, requests the same tokenized graceful stop used by Windows controls, verifies a clean exit, and proves its PID/control markers were removed.

For a runnable Windows game client, import and export with Godot 4.4.1 plus Windows templates:

```bash
godot --headless --path apps/client-godot --editor --quit
godot --headless --path apps/client-godot --export-release "Windows Desktop" "build/windows/Rush & Revenue Online.exe"
npm run release
```

Without the export at `apps/client-godot/build/windows/Rush & Revenue Online.exe`, `npm run release` emits the clearly labeled source-client archive and an explanatory `NATIVE_EXPORT_REQUIRED.txt`. It does not fabricate, rename, or copy a placeholder EXE.

## Tagged GitHub release

`.github/workflows/release.yml` performs the supported native build on a Windows runner:

1. checkout and install Node 24 dependencies with `npm ci`;
2. run the full verification gate;
3. install Godot 4.4.1 and its export templates;
4. export the `Windows Desktop` preset;
5. package all distinct artifacts;
6. attach ZIPs and checksums to the tagged release.

The source archive includes these workflows so a team can move it into a normal GitHub repository without reverse-engineering the release process.

## Pinned server runtime

The standalone server bundles `node.exe` from `node-win-x64@24.14.0`. The packaging script downloads the exact npm tarball and refuses it unless its SHA-512 matches the pinned value. It then checks for a plausible Windows PE header and size before copying the executable.

`runtime\RUNTIME_SOURCE.txt` in the artifact records the package, version, and digest. The `ws` production module is copied beside the compiled server. No system Node installation or `npm install` is required for players.

Production promotion still requires a generated SBOM, complete per-artifact license texts/source offers, antivirus scanning, provenance attestation, and code signing.

## Graphical launch path

Server package:

- **RRO Server Control.hta** is the primary start/status/stop surface.
- **Start RRO Server.vbs** runs the pinned runtime hidden and waits for V1 health.
- **Stop RRO Server.vbs** requests token-authenticated graceful shutdown, then uses the exact recorded PID only as a fallback.

Game package:

- **Rush and Revenue Launcher.hta** checks server status and launches the game without a command prompt.
- **Play Rush and Revenue Online.vbs** launches the exported Godot executable.
- In a source-client archive, it can open a locally installed Godot editor; otherwise it explains that a native export is required.
- **Server Setup** detects a co-located development controller or directs the player to the separate server folder. It does not pretend a server control exists in the client ZIP.

HTA/VBS is a V1 console-free Windows foundation, not the final platform. The V2 backlog replaces it with a signed accessible launcher/updater, installer/uninstaller, patch repair, rollback, crash reporting, and service ownership.

## Player acceptance on Windows

Run this after packaging and before publishing:

1. extract the server and client into separate folders whose paths include spaces;
2. start the server using only the graphical controller;
3. confirm `/health` reports `rro.v1` and the expected content hash;
4. launch the real exported client from its graphical launcher;
5. sign up, relaunch, and log into the same persistent character;
6. complete a shared shift and a layout mutation;
7. close the client and confirm the server stays online;
8. stop through the controller and confirm health becomes unreachable;
9. confirm PID/control markers disappear and SQLite has no live writer;
10. immediately rename and delete a copy of the old extracted server folder;
11. restart from the retained folder and verify persistence;
12. verify ZIP hashes against `SHA256SUMS.txt`.

Do not call the client “runnable” until this native test has passed on each supported Windows version.

## Configuration and ports

The server reads `config\server.v1.json` and binds to `127.0.0.1:8788` by default. The Godot alpha defaults to the same origin. There is no V1 browser-client host and no port 4173.

Changing the bind to a public interface is outside the local-world support boundary. Public hosting requires the V2 gateway, TLS, distributed persistence, identity hardening, rate protection, trust/safety, operations, and security gates.

## Clean source boundary

The source package filter excludes:

- `node_modules/`, `dist/`, `release/`, local data/run/logs;
- Godot build output and SQLite/WAL/SHM files;
- recovered deliverables and the complete `legacy/` V0 audit tree.

This is intentional. The user requested a clean break, not old-client compatibility. Git history can preserve retired code without shipping it in the V1 developer source archive.
