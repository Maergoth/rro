import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { createHttpServer } from "../dist/server/http-server.js";
import { foundRestaurant, getLayout, paintFloor, placeObject, redoLayout, undoLayout } from "../dist/server/layout-service.js";
import { LiveService } from "../dist/server/live-service.js";

function layoutAudit(db, restaurantId) {
  const restaurant = db.prepare("SELECT treasury_cents AS treasuryCents, layout_revision AS revision FROM restaurants WHERE id = ?").get(restaurantId);
  return {
    ...restaurant,
    historyCount: db.prepare("SELECT COUNT(*) AS count FROM layout_history WHERE restaurant_id = ?").get(restaurantId).count,
    ledgerCount: db.prepare("SELECT COUNT(*) AS count FROM ledger_entries WHERE restaurant_id = ?").get(restaurantId).count,
  };
}

test("database startup upgrades a clean-V1 restaurants table with a zero revision", () => {
  const directory = mkdtempSync(join(tmpdir(), "rro-layout-revision-migration-"));
  const databasePath = join(directory, "world.sqlite");
  const legacy = new DatabaseSync(databasePath);
  legacy.exec(`CREATE TABLE restaurants (
    id TEXT PRIMARY KEY,
    region_id TEXT NOT NULL REFERENCES regions(id),
    owner_character_id TEXT REFERENCES characters(id),
    name TEXT NOT NULL,
    concept TEXT NOT NULL,
    style TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    rating REAL NOT NULL DEFAULT 3.8,
    sanitation INTEGER NOT NULL DEFAULT 88,
    treasury_cents INTEGER NOT NULL DEFAULT 1200000,
    build_width INTEGER NOT NULL DEFAULT 24,
    build_height INTEGER NOT NULL DEFAULT 16,
    generation INTEGER NOT NULL DEFAULT 1,
    is_npc INTEGER NOT NULL DEFAULT 1,
    opened_at INTEGER NOT NULL,
    closed_at INTEGER
  )`);
  legacy.close();
  const registry = loadContent();
  const db = createDatabase(databasePath, registry);
  try {
    const columns = db.prepare("PRAGMA table_info(restaurants)").all();
    assert.ok(columns.some((column) => column.name === "layout_revision" && column.notnull === 1 && column.dflt_value === "0"));
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM restaurants WHERE layout_revision = 0").get().count, 23);
    assert.equal(db.prepare("SELECT value FROM application_meta WHERE key = 'layout_revision_version'").get().value, "1");
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("layout revision is monotonic, restart-safe, and stale edits are side-effect free", () => {
  const directory = mkdtempSync(join(tmpdir(), "rro-layout-revision-"));
  const databasePath = join(directory, "world.sqlite");
  const registry = loadContent();
  let db = createDatabase(databasePath, registry);
  const stamp = Date.now().toString(36);
  const auth = signup(db, registry, {
    username: `revision_${stamp}`,
    email: `revision_${stamp}@test.invalid`,
    displayName: "Revision Owner",
    password: "Production!234",
  });
  const founded = foundRestaurant(db, registry, auth.account, {
    regionId: "us-mid-atlantic",
    name: "Revision Test House",
    concept: registry.content.concepts[0],
    style: registry.content.styles[0],
  });
  try {
    assert.equal(getLayout(db, registry, founded.id).revision, 0);
    const placed = placeObject(db, registry, auth.account, founded.id, {
      expectedRevision: 0,
      definitionId: "table-two",
      x: 12,
      y: 2,
      rotation: 0,
    });
    assert.equal(placed.layout.revision, 1);
    assert.equal(placed.layout.history.revision, 1);

    const beforeConflict = layoutAudit(db, founded.id);
    assert.throws(
      () => paintFloor(db, registry, auth.account, founded.id, {
        expectedRevision: 0,
        surfaceId: "quarry-tile",
        cells: [{ x: 0, y: 0 }],
      }),
      (error) => error.status === 409
        && error.code === "layout-revision-conflict"
        && error.details.expectedRevision === 0
        && error.details.currentRevision === 1,
    );
    assert.deepEqual(layoutAudit(db, founded.id), beforeConflict, "a stale editor cannot spend treasury or append history/ledger rows");

    const painted = paintFloor(db, registry, auth.account, founded.id, {
      expectedRevision: 1,
      surfaceId: "quarry-tile",
      cells: [{ x: 0, y: 0 }],
    });
    assert.equal(painted.layout.revision, 2);
    const undone = undoLayout(db, registry, auth.account, founded.id, { expectedRevision: 2 });
    assert.equal(undone.layout.revision, 3, "undo advances rather than rewinds the collaboration token");
    assert.throws(
      () => redoLayout(db, registry, auth.account, founded.id, { expectedRevision: 2 }),
      (error) => error.status === 409 && error.code === "layout-revision-conflict" && error.details.currentRevision === 3,
    );
    const redone = redoLayout(db, registry, auth.account, founded.id, { expectedRevision: 3 });
    assert.equal(redone.layout.revision, 4);
    assert.ok(redone.layout.objects.some((object) => object.id === placed.id));

    db.close();
    db = createDatabase(databasePath, registry);
    assert.equal(getLayout(db, registry, founded.id).revision, 4, "revision survives a server restart");
    assert.equal(db.prepare("SELECT value FROM application_meta WHERE key = 'layout_revision_version'").get().value, "1");
    assert.ok(db.prepare("PRAGMA table_info(restaurants)").all().some((column) => column.name === "layout_revision"));
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("HTTP builder mutations require a revision and return a machine-readable conflict", async () => {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const live = new LiveService(db, registry, 10, 5);
  const stamp = Date.now().toString(36);
  const auth = signup(db, registry, {
    username: `revision_http_${stamp}`,
    email: `revision_http_${stamp}@test.invalid`,
    displayName: "HTTP Revision Owner",
    password: "Production!234",
  });
  const founded = foundRestaurant(db, registry, auth.account, {
    regionId: "us-mid-atlantic",
    name: "HTTP Revision House",
    concept: registry.content.concepts[0],
    style: registry.content.styles[0],
  });
  const placed = placeObject(db, registry, auth.account, founded.id, {
    expectedRevision: 0,
    definitionId: "table-two",
    x: 12,
    y: 2,
    rotation: 0,
  });
  const server = createHttpServer(db, registry, live);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const root = `http://127.0.0.1:${address.port}`;
  const headers = { authorization: `Bearer ${auth.sessionToken}`, "content-type": "application/json" };
  const request = (method, path, body = {}) => fetch(`${root}${path}`, { method, headers, body: JSON.stringify(body) });
  try {
    const routes = [
      ["PATCH", `/v1/restaurants/${founded.id}/layout/floor`, { surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }] }],
      ["PUT", `/v1/restaurants/${founded.id}/layout/walls`, { x: 5, y: 5, edge: "north", wallStyleId: "subway-tile", openingType: "solid", rotation: 0 }],
      ["POST", `/v1/restaurants/${founded.id}/layout/objects`, { definitionId: "table-two", x: 15, y: 2, rotation: 0 }],
      ["PATCH", `/v1/restaurants/${founded.id}/layout/objects/${placed.id}`, { x: 13, y: 2, rotation: 0 }],
      ["DELETE", `/v1/restaurants/${founded.id}/layout/objects/${placed.id}`, {}],
      ["POST", `/v1/restaurants/${founded.id}/layout/objects/${placed.id}/repair`, {}],
      ["POST", `/v1/restaurants/${founded.id}/layout/expand`, { addWidth: 1, addHeight: 0 }],
      ["POST", `/v1/restaurants/${founded.id}/layout/undo`, {}],
      ["POST", `/v1/restaurants/${founded.id}/layout/redo`, {}],
    ];
    const beforeMissing = layoutAudit(db, founded.id);
    for (const [method, path, body] of routes) {
      const response = await request(method, path, body);
      assert.equal(response.status, 428, `${method} ${path}`);
      const payload = await response.json();
      assert.equal(payload.error.code, "layout-revision-required");
    }
    assert.deepEqual(layoutAudit(db, founded.id), beforeMissing, "precondition failures are side-effect free");

    const stale = await request("POST", `/v1/restaurants/${founded.id}/layout/undo`, { expectedRevision: 0 });
    assert.equal(stale.status, 409);
    const stalePayload = await stale.json();
    assert.deepEqual(
      { code: stalePayload.error.code, expectedRevision: stalePayload.error.expectedRevision, currentRevision: stalePayload.error.currentRevision },
      { code: "layout-revision-conflict", expectedRevision: 0, currentRevision: 1 },
    );
    assert.deepEqual(layoutAudit(db, founded.id), beforeMissing, "stale HTTP mutations cannot change authoritative state");

    const accepted = await request("POST", `/v1/restaurants/${founded.id}/layout/undo`, { expectedRevision: 1 });
    assert.equal(accepted.status, 200);
    assert.equal((await accepted.json()).layout.revision, 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    live.stop();
    db.close();
  }
});

test("Godot builder sends revisions on every mutation and refreshes only revision conflicts", () => {
  const root = resolve(import.meta.dirname, "..");
  const main = readFileSync(resolve(root, "apps/client-godot/scripts/main.gd"), "utf8");
  const api = readFileSync(resolve(root, "apps/client-godot/scripts/api_client.gd"), "utf8");
  const nextSteps = JSON.parse(readFileSync(resolve(root, "planning/next-steps.json"), "utf8"));
  assert.match(main, /payload = builder_revision_payload\(payload\)/);
  assert.match(main, /layout\/%s" % \[current_restaurant_id, direction\], builder_revision_payload\(\)/);
  assert.match(main, /delete_json\([^\n]+builder_revision_payload\(\)/);
  assert.match(main, /\/repair[^\n]+builder_revision_payload\(\)/);
  assert.match(main, /layout\/expand[^\n]+builder_revision_payload\(/);
  assert.match(main, /error\.get\("code", ""\)\) != "layout-revision-conflict"/);
  assert.match(main, /api\.get_json\("\/v1\/restaurants\/%s\/layout"/);
  assert.match(api, /request_body := "" if method == HTTPClient\.METHOD_GET else JSON\.stringify\(payload\)/);
  const task = nextSteps.tasks.find((entry) => entry.id === "RRO-403");
  assert.equal(task.status, "in-progress");
  assert.ok(task.acceptance.some((value) => /stale layout revision/i.test(value)));
});
