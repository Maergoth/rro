import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const RELEASE = resolve(ROOT, "release");
const packageJson = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
const VERSION = packageJson.version;
const NODE_VERSION = "24.14.0";
const NODE_PACKAGE = `node-win-x64@${NODE_VERSION}`;
const NODE_TARBALL_SHA512 = "VoFmvlulNWUmmYT33kTbeuREV2EeFHeurPj25c4g+t9hdUoeUlpHhkwc4ULsZGYB7oDo5TaFFMhqwFDO5NEj4w==";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: options.capture ? "pipe" : "inherit", ...options });
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}.\n${result.stderr ?? ""}`);
  return result;
}

function ensureFile(path, label) {
  if (!existsSync(path) || !statSync(path).isFile()) throw new Error(`${label} is missing: ${path}`);
}

function copy(source, destination, filter) {
  cpSync(source, destination, { recursive: true, force: true, filter });
}

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, "utf8");
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function acquireWindowsNode(temp) {
  const provided = process.env.RRO_WINDOWS_NODE_EXE;
  if (provided) {
    ensureFile(provided, "RRO_WINDOWS_NODE_EXE");
    return resolve(provided);
  }
  const cached = resolve(ROOT, "vendor/runtime/windows-x64/node.exe");
  if (existsSync(cached)) return cached;
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = run(npm, ["pack", NODE_PACKAGE, "--pack-destination", temp, "--json", "--ignore-scripts", "--cache", resolve(tmpdir(), "rro-release-npm-cache")], { capture: true });
  const packed = JSON.parse(result.stdout);
  const tarball = resolve(temp, packed[0].filename);
  const digest = createHash("sha512").update(readFileSync(tarball)).digest("base64");
  if (digest !== NODE_TARBALL_SHA512) throw new Error("Pinned Windows Node runtime integrity check failed.");
  const extract = resolve(temp, "node-runtime");
  mkdirSync(extract, { recursive: true });
  run("tar", ["-xzf", tarball, "-C", extract]);
  const nodeExe = resolve(extract, "package/bin/node.exe");
  ensureFile(nodeExe, "Extracted Windows Node runtime");
  const header = readFileSync(nodeExe).subarray(0, 2).toString("ascii");
  if (header !== "MZ" || statSync(nodeExe).size < 50_000_000) throw new Error("Pinned Windows runtime is not a plausible PE executable.");
  return nodeExe;
}

function zipDirectory(parent, folderName, output) {
  rmSync(output, { force: true });
  if (process.platform === "win32") {
    const escapedSource = resolve(parent, folderName).replaceAll("'", "''");
    const escapedOutput = output.replaceAll("'", "''");
    run("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", `Compress-Archive -LiteralPath '${escapedSource}' -DestinationPath '${escapedOutput}' -CompressionLevel Optimal -Force`]);
  } else {
    run("zip", ["-qr", output, folderName], { cwd: parent });
  }
}

function sourceFilter(path) {
  const rel = relative(ROOT, path).replaceAll("\\", "/");
  if (!rel) return true;
  const blockedRoots = ["node_modules", "dist", "release", "data", "run", "logs", "legacy", "recovered", "deliverables"];
  if (blockedRoots.some((root) => rel === root || rel.startsWith(`${root}/`))) return false;
  if (rel === "apps/client-godot/build" || rel.startsWith("apps/client-godot/build/") || rel === "apps/client-godot/export" || rel.startsWith("apps/client-godot/export/") || rel === "apps/client-godot/.godot" || rel.startsWith("apps/client-godot/.godot/")) return false;
  if (rel.includes("/build/") || rel.endsWith(".sqlite") || rel.endsWith(".sqlite-shm") || rel.endsWith(".sqlite-wal")) return false;
  return true;
}

function clientSourceFilter(path) {
  const rel = relative(resolve(ROOT, "apps/client-godot"), path).replaceAll("\\", "/");
  return !(["build", "export", ".godot"].some((directory) => rel === directory || rel.startsWith(`${directory}/`)));
}

rmSync(RELEASE, { recursive: true, force: true });
mkdirSync(RELEASE, { recursive: true });
const temp = mkdtempSync(join(tmpdir(), "rro-v1-release-"));
const artifacts = [];

try {
  ensureFile(resolve(ROOT, "dist/server/index.js"), "Compiled V1 server");
  ensureFile(resolve(ROOT, "apps/client-godot/project.godot"), "Godot V1 project");
  const windowsNode = acquireWindowsNode(temp);

  const serverParent = resolve(temp, "server-package");
  const serverName = "Rush-Revenue-Online-Server";
  const serverRoot = resolve(serverParent, serverName);
  mkdirSync(serverRoot, { recursive: true });
  copy(resolve(ROOT, "dist/server"), resolve(serverRoot, "app/server"));
  copy(resolve(ROOT, "packages/game-data"), resolve(serverRoot, "packages/game-data"));
  copy(resolve(ROOT, "node_modules/ws"), resolve(serverRoot, "node_modules/ws"));
  copy(resolve(ROOT, "config/server.v1.json"), resolve(serverRoot, "config/server.v1.json"));
  copy(windowsNode, resolve(serverRoot, "runtime/node.exe"));
  for (const launcher of ["Start RRO Server.vbs", "Stop RRO Server.vbs", "RRO Server Control.hta"]) copy(resolve(ROOT, "launchers/windows-v1", launcher), resolve(serverRoot, launcher));
  copy(resolve(ROOT, "docs/SERVER_README.md"), resolve(serverRoot, "SERVER_README.md"));
  copy(resolve(ROOT, "THIRD_PARTY_NOTICES.md"), resolve(serverRoot, "THIRD_PARTY_NOTICES.md"));
  write(resolve(serverRoot, "package.json"), `${JSON.stringify({ name: "rush-revenue-online-server", version: VERSION, private: true, type: "module", engines: { node: ">=24.0.0" } }, null, 2)}\n`);
  write(resolve(serverRoot, "data/README.txt"), "Persistent rro-v1.sqlite world data is created here. Back up this folder while the server is stopped.\r\n");
  write(resolve(serverRoot, "run/README.txt"), "Runtime PID and one-time local-control token files are created here and removed on graceful shutdown.\r\n");
  write(resolve(serverRoot, "runtime/RUNTIME_SOURCE.txt"), `Pinned Node.js ${NODE_VERSION} Windows x64 runtime.\r\nSource package: https://www.npmjs.com/package/node-win-x64/v/${NODE_VERSION}\r\nTarball SHA-512 (base64): ${NODE_TARBALL_SHA512}\r\n`);
  const serverZip = resolve(RELEASE, `RRO-Standalone-Server-${VERSION}-windows-x64.zip`);
  zipDirectory(serverParent, serverName, serverZip);
  artifacts.push({ kind: "standalone-server", path: serverZip, runnable: true, runtime: `Node.js ${NODE_VERSION} win-x64` });

  const sourceParent = resolve(temp, "source-package");
  const sourceName = `Rush-Revenue-Online-Source-${VERSION}`;
  const sourceRoot = resolve(sourceParent, sourceName);
  mkdirSync(sourceRoot, { recursive: true });
  for (const name of [".github", "apps", "config", "docs", "launchers", "packages", "planning", "tests", "tools", ".gitignore", "package.json", "package-lock.json", "README.md", "THIRD_PARTY_NOTICES.md"]) {
    const path = resolve(ROOT, name);
    if (existsSync(path)) copy(path, resolve(sourceRoot, name), sourceFilter);
  }
  const sourceZip = resolve(RELEASE, `RRO-GitHub-Source-${VERSION}.zip`);
  zipDirectory(sourceParent, sourceName, sourceZip);
  artifacts.push({ kind: "github-source", path: sourceZip, runnable: false, excludesLegacyV0: true });

  const planningParent = resolve(temp, "planning-package");
  const planningName = `RRO-V2-AAA-Production-Plan-${VERSION}`;
  const planningRoot = resolve(planningParent, planningName);
  mkdirSync(planningRoot, { recursive: true });
  for (const name of ["docs/GAME_DESIGN_DOCUMENT.md", "docs/PRODUCTION_READINESS_AND_ROADMAP.md", "docs/ROLE_GAMEPLAY_OPEN_SHIFTS.md", "docs/V1_RELEASE_GATE.md", "docs/V2_AAA_ROADMAP.md", "docs/V2_TEAM_BACKLOG.md", "planning/v2-backlog.json", "README.md"]) {
    const source = resolve(ROOT, name);
    if (existsSync(source)) copy(source, resolve(planningRoot, basename(source)));
  }
  const planningZip = resolve(RELEASE, `RRO-V2-AAA-Production-Plan-${VERSION}.zip`);
  zipDirectory(planningParent, planningName, planningZip);
  artifacts.push({ kind: "production-plan", path: planningZip, runnable: false });

  const gameExe = resolve(ROOT, "apps/client-godot/build/windows/Rush & Revenue Online.exe");
  if (existsSync(gameExe)) {
    const gameParent = resolve(temp, "game-package");
    const gameName = "Rush-Revenue-Online-Client";
    const gameRoot = resolve(gameParent, gameName);
    mkdirSync(gameRoot, { recursive: true });
    copy(gameExe, resolve(gameRoot, "Rush & Revenue Online.exe"));
    for (const launcher of ["Play Rush and Revenue Online.vbs", "Rush and Revenue Launcher.hta"]) copy(resolve(ROOT, "launchers/windows-v1", launcher), resolve(gameRoot, launcher));
    copy(resolve(ROOT, "docs/GAME_README.md"), resolve(gameRoot, "GAME_README.md"));
    copy(resolve(ROOT, "THIRD_PARTY_NOTICES.md"), resolve(gameRoot, "THIRD_PARTY_NOTICES.md"));
    const gameZip = resolve(RELEASE, `RRO-Game-Client-${VERSION}-windows-x64.zip`);
    zipDirectory(gameParent, gameName, gameZip);
    artifacts.push({ kind: "native-game-client", path: gameZip, runnable: true, runtime: "Godot Windows Desktop" });
  } else {
    const clientParent = resolve(temp, "client-source-package");
    const clientName = `Rush-Revenue-Online-Godot-Client-Source-${VERSION}`;
    const clientRoot = resolve(clientParent, clientName);
    mkdirSync(clientRoot, { recursive: true });
    copy(resolve(ROOT, "apps/client-godot"), resolve(clientRoot, "client-source"), clientSourceFilter);
    for (const launcher of ["Play Rush and Revenue Online.vbs", "Rush and Revenue Launcher.hta"]) copy(resolve(ROOT, "launchers/windows-v1", launcher), resolve(clientRoot, launcher));
    copy(resolve(ROOT, "docs/GAME_README.md"), resolve(clientRoot, "GAME_README.md"));
    write(resolve(clientRoot, "NATIVE_EXPORT_REQUIRED.txt"), "No Godot executable was available in the build environment, so this archive is deliberately labeled source. It is not a fake runtime build. Use Godot 4.4.1+ and the included Windows Desktop export preset, or run the tagged GitHub release workflow.\r\n");
    const clientZip = resolve(RELEASE, `RRO-Godot-Client-Source-${VERSION}.zip`);
    zipDirectory(clientParent, clientName, clientZip);
    artifacts.push({ kind: "godot-client-source", path: clientZip, runnable: false, reason: "Godot export binary unavailable in this build environment" });
  }

  for (const artifact of artifacts) {
    artifact.file = basename(artifact.path);
    artifact.bytes = statSync(artifact.path).size;
    artifact.sha256 = sha256(artifact.path);
    delete artifact.path;
  }
  const checksums = artifacts.map((artifact) => `${artifact.sha256}  ${artifact.file}`).join("\n") + "\n";
  write(resolve(RELEASE, "SHA256SUMS.txt"), checksums);
  write(resolve(RELEASE, "release-manifest.json"), `${JSON.stringify({ product: "Rush & Revenue Online", version: VERSION, protocol: "rro.v1", generatedAt: new Date().toISOString(), cleanBreakFromV0: true, artifacts }, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, release: RELEASE, artifacts }, null, 2));
} finally {
  rmSync(temp, { recursive: true, force: true });
}
