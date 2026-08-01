import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const endpoint = "http://127.0.0.1:8788";
const markers = [resolve(ROOT, "run/rro-server.pid"), resolve(ROOT, "run/rro-control.token")];
const temporary = mkdtempSync(join(tmpdir(), "rro-v1-smoke-"));
const configPath = resolve(temporary, "server.v1.json");

async function isHealthy() {
  try { return (await fetch(`${endpoint}/health`)).ok; } catch { return false; }
}

if (await isHealthy()) throw new Error("Port 8788 already has a healthy RRO server. Stop it before running the smoke test.");
for (const marker of markers) if (existsSync(marker)) unlinkSync(marker);
writeFileSync(configPath, `${JSON.stringify({ host: "127.0.0.1", port: 8788, database: resolve(temporary, "smoke.sqlite"), tickRate: 10, snapshotRate: 5, autoOpenNpcShifts: true, logLevel: "info" }, null, 2)}\n`, "utf8");

const child = spawn(process.execPath, ["--no-warnings", "dist/server/index.js"], {
  cwd: ROOT,
  env: { ...process.env, RRO_V1_CONFIG: configPath },
  stdio: ["ignore", "pipe", "pipe"],
});
let stdout = "";
let stderr = "";
child.stdout.on("data", (value) => { stdout += value; });
child.stderr.on("data", (value) => { stderr += value; });

try {
  let health;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 125));
    try {
      const response = await fetch(`${endpoint}/health`);
      if (response.ok) { health = await response.json(); break; }
    } catch {}
  }
  assert.ok(health, `The server failed its health window.\n${stdout}\n${stderr}`);
  assert.equal(health.protocol, "rro.v1");
  assert.equal(health.schemaVersion, 1);
  const token = readFileSync(resolve(ROOT, "run/rro-control.token"), "utf8").trim();
  assert.ok(token.length >= 32);
  const response = await fetch(`${endpoint}/v1/local-admin/shutdown`, { method: "POST", headers: { "x-rro-control-token": token, "content-type": "application/json" }, body: "{}" });
  assert.equal(response.status, 202);
  const body = await response.json();
  const [code, signal] = await once(child, "exit");
  assert.equal(code, 0, `Server exit failed (${signal ?? "no signal"}).\n${stdout}\n${stderr}`);
  assert.equal(await isHealthy(), false);
  for (const marker of markers) assert.equal(existsSync(marker), false, `${marker} survived graceful shutdown.`);
  console.log(JSON.stringify({ ok: true, health, shutdown: body, exitCode: code, persistentDatabaseCreated: existsSync(resolve(temporary, "smoke.sqlite")), markersRemoved: true }, null, 2));
} finally {
  if (child.exitCode == null) child.kill("SIGTERM");
  for (const marker of markers) if (existsSync(marker)) unlinkSync(marker);
  rmSync(temporary, { recursive: true, force: true });
}
