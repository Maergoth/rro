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
    const headers = { authorization: `Bearer ${auth.sessionToken}`, "content-type": "application/json" };
    const shifts = await fetch(`${base}/v1/shifts`, { headers }).then((value) => value.json());
    const shift = shifts.shifts[0];
    const invalidRole = await fetch(`${base}/v1/restaurants/${shift.restaurantId}/apply`, { method: "POST", headers, body: JSON.stringify({ roleId: "owner" }) });
    assert.equal(invalidRole.status, 400);
    const firstHireResponse = await fetch(`${base}/v1/restaurants/${shift.restaurantId}/apply`, { method: "POST", headers, body: JSON.stringify({ roleId: "server" }) });
    assert.equal(firstHireResponse.status, 201);
    const firstHire = await firstHireResponse.json();
    assert.equal((await fetch(`${base}/v1/character/quit-job`, { method: "POST", headers, body: "{}" })).status, 200);
    const rehireResponse = await fetch(`${base}/v1/restaurants/${shift.restaurantId}/apply`, { method: "POST", headers, body: JSON.stringify({ roleId: "manager" }) });
    assert.equal(rehireResponse.status, 201);
    const rehire = await rehireResponse.json();
    assert.equal(rehire.employment.id, firstHire.employment.id);
    const joinResponse = await fetch(`${base}/v1/shifts/${shift.id}/join`, { method: "POST", headers, body: JSON.stringify({ kind: "employee", roleId: "manager" }) });
    assert.equal(joinResponse.status, 200);
    socket = new WebSocket(`ws://127.0.0.1:${address.port}/v1/realtime`);
    await once(socket, "open");
    const readyPromise = nextMessage(socket, "ready");
    socket.send(JSON.stringify({ type: "auth", token: auth.sessionToken }));
    const ready = await readyPromise;
    assert.equal(ready.protocol, "rro.v1");
    const snapshotPromise = nextMessage(socket, "snapshot");
    socket.send(JSON.stringify({ type: "subscribe", shiftId: shift.id }));
    const snapshot = await snapshotPromise;
    assert.equal(snapshot.data.protocol, "rro.v1");
    assert.ok(snapshot.data.tasks.length > 0);
    assert.ok(snapshot.data.layout.cells.length > 0);
    socket.close();
    await once(socket, "close");
    socket = undefined;
    const released = db.prepare("SELECT left_at FROM shift_presences WHERE service_shift_id = ? AND character_id = ?").get(shift.id, auth.account.characterId);
    assert.ok(released.left_at, "closing realtime must release presence instead of leaving a ghost player");
  } finally {
    socket?.close();
    await realtime.close();
    await new Promise((resolve) => server.close(resolve));
    live.stop();
    db.close();
  }
});
