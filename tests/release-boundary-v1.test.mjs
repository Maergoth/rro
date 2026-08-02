import assert from "node:assert/strict";
import { once } from "node:events";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { createHttpServer } from "../dist/server/http-server.js";
import { LiveService } from "../dist/server/live-service.js";

const text = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("local server control requires the per-run token and accepts graceful shutdown", async () => {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const live = new LiveService(db, registry, 10, 5);
  const token = "v1-control-token-".padEnd(40, "x");
  let shutdownRequests = 0;
  const server = createHttpServer(db, registry, live, { token, shutdown: () => { shutdownRequests += 1; } });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const endpoint = `http://127.0.0.1:${address.port}/v1/local-admin/shutdown`;
  try {
    const rejected = await fetch(endpoint, { method: "POST", headers: { "x-rro-control-token": "wrong-token" }, body: "{}" });
    assert.equal(rejected.status, 403);
    assert.equal(shutdownRequests, 0);

    const accepted = await fetch(endpoint, { method: "POST", headers: { "x-rro-control-token": token }, body: "{}" });
    assert.equal(accepted.status, 202);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(shutdownRequests, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    live.stop();
    db.close();
  }
});

test("V1 player controls are graphical, separable, and stop only their recorded server", () => {
  const start = text("launchers/windows-v1/Start RRO Server.vbs");
  const stop = text("launchers/windows-v1/Stop RRO Server.vbs");
  const game = text("launchers/windows-v1/Rush and Revenue Launcher.hta");
  const control = text("launchers/windows-v1/RRO Server Control.hta");

  assert.match(start, /shell\.Run command, 0, False/);
  assert.match(stop, /\/v1\/local-admin\/shutdown/);
  assert.match(stop, /taskkill\.exe \/PID/);
  assert.doesNotMatch(stop, /taskkill\.exe \/IM/i);
  assert.match(game, /fso\.FileExists\(controlPath\)/);
  assert.match(game, /separate packages/i);
  assert.match(control, /Replace\(document\.location\.pathname, "%20", " "\)/);
});

test("release tooling preserves the clean V1 artifact boundary", () => {
  const packageJson = JSON.parse(text("package.json"));
  const release = text("tools/make-v1-release.mjs");
  const rootReadme = text("README.md");
  const gdd = text("docs/GAME_DESIGN_DOCUMENT.md");

  assert.equal(packageJson.version, "1.0.0-alpha.2");
  assert.doesNotMatch(JSON.stringify(packageJson.scripts), /legacy|apps\/client(?!-godot)/);
  assert.match(release, /"legacy"/);
  assert.match(release, /RRO-Standalone-Server/);
  assert.match(release, /RRO-GitHub-Source/);
  assert.match(release, /RRO-Godot-Client-Source/);
  assert.match(release, /PRODUCTION_AUDIT_AND_ROADMAP/);
  assert.match(release, /planning\/next-steps\.json/);
  assert.match(release, /if \(existsSync\(gameExe\)\)/);
  assert.match(rootReadme, /comprehensive design document/i);
  assert.match(gdd, /Document version:\*\* 2\.0/);
  assert.match(gdd, /exactly 115 regional license slots: 20% world occupancy/i);
});

test("generated V2 backlog is deterministic and assignable", () => {
  const before = text("planning/v2-backlog.json");
  const result = spawnSync(process.execPath, ["tools/generate-v2-backlog.mjs"], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const after = text("planning/v2-backlog.json");
  assert.equal(createHash("sha256").update(after).digest("hex"), createHash("sha256").update(before).digest("hex"));
  const backlog = JSON.parse(after);
  assert.equal(backlog.generatorRevision, 1);
  assert.equal(backlog.counts.categories, 28);
  assert.equal(backlog.counts.tasks, 240);
  assert.equal(backlog.tasks.length, 240);
  for (const task of backlog.tasks) {
    assert.match(task.id, /^[A-Z]+-\d{3}$/);
    assert.ok(["Must", "Should", "Could"].includes(task.priority));
    assert.ok(task.discipline && task.description && task.acceptance);
  }
});
