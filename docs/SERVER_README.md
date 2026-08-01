# Rush & Revenue Online — standalone server

This package is the separate authoritative local-world server for protocol `rro.v1`. It includes a pinned Windows x64 Node.js 24.14.0 runtime, compiled server source, the production WebSocket dependency, game data, configuration, and graphical controls. A player does not install Node or run `npm`.

It does not include the Godot client. It does not load or migrate a V0 world.

## Start and stop on Windows

1. Extract the complete ZIP to a normal writable folder. Do not run it inside the ZIP viewer.
2. Double-click **RRO Server Control.hta**.
3. Select **Start server**. The runtime starts hidden and the status changes to online.
4. Leave the server running while playing; the control window itself may be closed.
5. Select **Stop gracefully** before backing up, moving, updating, or deleting the folder.

`Start RRO Server.vbs` and `Stop RRO Server.vbs` provide the same console-free actions. The normal stop path uses a loopback-only, per-process control token. It closes the live simulation, WebSockets, HTTP listener, and SQLite before exiting. Only if that endpoint cannot be reached does the stop script target the exact PID recorded by this installation.

Do not end every `node.exe` process on the machine. The supplied fallback targets only `run\rro-server.pid`.

## Files created at runtime

| Path | Meaning | Backup? |
|---|---|---|
| `data\rro-v1.sqlite` | Persistent accounts, characters, world, restaurants, shifts, layouts, progression, and economy | Yes |
| `data\rro-v1.sqlite-wal` / `-shm` | SQLite write-ahead state while the server is running | Never copy alone |
| `logs\server.log` | Timestamped startup, shutdown, and runtime diagnostics | Optional |
| `run\rro-server.pid` | Exact process ID for this run | No |
| `run\rro-control.token` | Random local graceful-control secret for this run | No; never share |

To back up, stop gracefully and copy the whole `data` folder. To restore this alpha line, stop the server, keep a safety copy, and restore a complete mutually consistent `data` folder from the same V1 schema/content line.

Deleting `data\rro-v1.sqlite` while stopped intentionally creates a brand-new world on the next start. There is no V0 importer.

## Configuration

The packaged configuration is `config\server.v1.json`:

```json
{
  "host": "127.0.0.1",
  "port": 8788,
  "database": "data/rro-v1.sqlite",
  "tickRate": 10,
  "snapshotRate": 5,
  "autoOpenNpcShifts": true,
  "logLevel": "info"
}
```

- Keep `host` on `127.0.0.1` for a private local world.
- `tickRate` accepts 2–30 Hz.
- `snapshotRate` must be at least 1 and no greater than `tickRate`.
- A port change also requires a client configuration/code change in this alpha.
- `autoOpenNpcShifts` ensures each seeded region has a public NPC-covered shift.

The standalone package is designed for one trusted player machine. Binding it to a LAN or public interface is not a supported hosted-MMO deployment: TLS, firewall policy, account recovery, moderation, distributed storage, gateway routing, rate protection, and security review remain V2 work.

## Health and diagnosis

The controller checks:

```text
http://127.0.0.1:8788/health
```

A healthy response contains `ok: true`, protocol `rro.v1`, schema version, content hash, and uptime. If startup fails:

1. confirm the ZIP was fully extracted;
2. confirm `runtime\node.exe`, `app\server\index.js`, `packages\game-data`, and `config\server.v1.json` exist;
3. confirm another process is not using port 8788;
4. read the final entries in `logs\server.log`;
5. use **Stop gracefully**, then start once more;
6. keep `data` and re-extract the remaining package if runtime files are damaged.

After a successful stop, the health endpoint must be unreachable and the two files under `run\` must disappear. At that point the old extracted folder can be renamed or deleted.

## Developer operation

From the GitHub source tree, with Node.js 24+:

```bash
npm ci
npm run verify
npm run dev:server
```

The developer process uses the same config, protocol, data packs, and database rules as the packaged server. Set `RRO_V1_CONFIG` to an alternate JSON file for an isolated development world. Use `:memory:` for tests through the server APIs rather than the player config.

## Security boundary

- Passwords use salted scrypt derivation.
- Raw session tokens are returned only to the authenticated client; SQLite stores their SHA-256 digests.
- Sessions expire and logout revokes the token.
- Gameplay APIs require a bearer session except health, signup, login, and the content manifest.
- JSON bodies are limited to 256 KiB; WebSocket messages to 64 KiB.
- Realtime clients must authenticate within five seconds and are limited to 40 messages per second.
- Money, movement resolution, layout legality, tasks, scores, incidents, reviews, and progression remain server-owned.

These are strong local-alpha defaults, not a completed internet threat model. See `V1_RELEASE_GATE.md` and the security section of the V2 backlog before any public hosting.

## Distribution integrity

The release manifest and `SHA256SUMS.txt` identify the server ZIP. `runtime\RUNTIME_SOURCE.txt` records the pinned Node runtime source package and verified tarball SHA-512. Production 1.0 still requires code signing, an installer/uninstaller, SBOM generation, and supported Windows runtime acceptance.
