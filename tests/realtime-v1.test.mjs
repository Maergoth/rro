import assert from "node:assert/strict";
import test from "node:test";
import { once } from "node:events";
import WebSocket from "ws";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { createHttpServer } from "../dist/server/http-server.js";
import { LiveService } from "../dist/server/live-service.js";
import { attachRealtime } from "../dist/server/realtime.js";

function nextMessage(socket, expectedType, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${expectedType}`)), timeoutMs);
    const handler = (raw) => {
      const message = JSON.parse(raw.toString());
      if (message.type !== expectedType) return;
      clearTimeout(timeout);
      socket.off("message", handler);
      resolve(message);
    };
    socket.on("message", handler);
  });
}

test("HTTP authentication upgrades into an authenticated realtime snapshot stream", async () => {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const live = new LiveService(db, registry, 10, 5);
  live.ensureNpcShifts();
  const server = createHttpServer(db, registry, live);
  const realtime = attachRealtime(server, db, live);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  let socket;
  try {
    const suffix = `${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    const response = await fetch(`${base}/v1/auth/signup`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: `ws_${suffix}`, email: `ws_${suffix}@test.invalid`, displayName: "Realtime Tester", password: "Production!234" }) });
    assert.equal(response.status, 201);
    const auth = await response.json();
    const shifts = await fetch(`${base}/v1/shifts`, { headers: { authorization: `Bearer ${auth.sessionToken}` } }).then((value) => value.json());
    socket = new WebSocket(`ws://127.0.0.1:${address.port}/v1/realtime`);
    await once(socket, "open");
    const readyPromise = nextMessage(socket, "ready");
    socket.send(JSON.stringify({ type: "auth", token: auth.sessionToken }));
    const ready = await readyPromise;
    assert.equal(ready.protocol, "rro.v1");
    const snapshotPromise = nextMessage(socket, "snapshot");
    socket.send(JSON.stringify({ type: "subscribe", shiftId: shifts.shifts[0].id }));
    const snapshot = await snapshotPromise;
    assert.equal(snapshot.data.protocol, "rro.v1");
    assert.ok(snapshot.data.tasks.length > 0);
    assert.ok(snapshot.data.layout.cells.length > 0);
  } finally {
    socket?.close();
    await realtime.close();
    await new Promise((resolve) => server.close(resolve));
    live.stop();
    db.close();
  }
});
