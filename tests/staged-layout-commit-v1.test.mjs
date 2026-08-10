import assert from "node:assert/strict";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { createHttpServer } from "../dist/server/http-server.js";
import { commitStagedLayout, foundRestaurant, getLayout, undoLayout } from "../dist/server/layout-service.js";
import { LiveService } from "../dist/server/live-service.js";

function fixture(label) {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const stamp = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const auth = signup(db, registry, {
    username: `staged_${label}_${stamp}`,
    email: `staged_${label}_${stamp}@test.invalid`,
    displayName: "Staged Builder Owner",
    password: "Production!234",
  });
  const restaurant = foundRestaurant(db, registry, auth.account, {
    regionId: "us-mid-atlantic",
    name: `Staged ${label} House`,
    concept: registry.content.concepts[0],
    style: registry.content.styles[0],
  });
  return { registry, db, auth, restaurant };
}

function audit(db, restaurantId) {
  const restaurant = db.prepare("SELECT treasury_cents AS treasuryCents, layout_revision AS revision FROM restaurants WHERE id = ?").get(restaurantId);
  return {
    ...restaurant,
    historyCount: db.prepare("SELECT COUNT(*) AS count FROM layout_history WHERE restaurant_id = ?").get(restaurantId).count,
    ledgerCount: db.prepare("SELECT COUNT(*) AS count FROM ledger_entries WHERE restaurant_id = ?").get(restaurantId).count,
    quarryCells: db.prepare("SELECT COUNT(*) AS count FROM floor_cells WHERE restaurant_id = ? AND surface_id = 'quarry-tile'").get(restaurantId).count,
    subwayWalls: db.prepare("SELECT COUNT(*) AS count FROM wall_edges WHERE restaurant_id = ? AND wall_style_id = 'subway-tile'").get(restaurantId).count,
    objectCount: db.prepare("SELECT COUNT(*) AS count FROM object_instances WHERE restaurant_id = ?").get(restaurantId).count,
  };
}

test("a staged builder batch commits atomically with one revision and one durable undo entry", () => {
  const { registry, db, auth, restaurant } = fixture("atomic");
  try {
    const before = audit(db, restaurant.id);
    const starter = db.prepare("SELECT id FROM object_instances WHERE restaurant_id = ? AND definition_id = 'table-two' ORDER BY placed_at, id LIMIT 1").get(restaurant.id);
    const committed = commitStagedLayout(db, registry, auth.account, restaurant.id, {
      expectedRevision: 0,
      operations: [
        { type: "floor", surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }] },
        { type: "wall", x: 5, y: 5, edge: "north", wallStyleId: "subway-tile", openingType: "solid", rotation: 0 },
        { type: "place", clientId: "staged-object-1", definitionId: "table-two", x: 12, y: 2, rotation: 0 },
        { type: "move", id: starter.id, x: 14, y: 5, rotation: 90 },
      ],
    });
    assert.equal(committed.operationCount, 4);
    assert.equal(committed.costCents, 2_200 + 6_500 + 36_000);
    assert.equal(committed.layout.revision, 1);
    assert.deepEqual(committed.results.map(({ type }) => type), ["floor", "wall", "place", "move"]);
    assert.equal(committed.results[2].clientId, "staged-object-1");
    const after = audit(db, restaurant.id);
    assert.deepEqual(after, {
      treasuryCents: before.treasuryCents - committed.costCents,
      revision: 1,
      historyCount: before.historyCount + 1,
      ledgerCount: before.ledgerCount + 2,
      quarryCells: before.quarryCells + 1,
      subwayWalls: before.subwayWalls + 1,
      objectCount: before.objectCount + 1,
    });
    const history = db.prepare("SELECT action FROM layout_history WHERE restaurant_id = ? ORDER BY id DESC LIMIT 1").get(restaurant.id);
    assert.equal(history.action, "commit 4 staged edits");

    const undone = undoLayout(db, registry, auth.account, restaurant.id, { expectedRevision: 1 });
    assert.equal(undone.layout.revision, 2);
    const afterUndo = audit(db, restaurant.id);
    assert.deepEqual(
      { treasuryCents: afterUndo.treasuryCents, quarryCells: afterUndo.quarryCells, subwayWalls: afterUndo.subwayWalls, objectCount: afterUndo.objectCount },
      { treasuryCents: before.treasuryCents, quarryCells: before.quarryCells, subwayWalls: before.subwayWalls, objectCount: before.objectCount },
      "one undo restores the complete staged layout and treasury state",
    );
    assert.equal(afterUndo.historyCount, before.historyCount + 1, "undo marks the single durable entry rather than deleting its audit trail");
    assert.equal(afterUndo.ledgerCount, before.ledgerCount + 3, "financial audit entries remain durable, including the compensating undo entry");
  } finally {
    db.close();
  }
});

test("invalid and stale staged commits roll back layout, treasury, ledger, history, and revision", () => {
  const { registry, db, auth, restaurant } = fixture("rollback");
  try {
    const before = audit(db, restaurant.id);
    assert.throws(
      () => commitStagedLayout(db, registry, auth.account, restaurant.id, {
        expectedRevision: 0,
        operations: [
          { type: "floor", surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }] },
          { type: "place", definitionId: "table-two", x: 3, y: 6, rotation: 0 },
        ],
      }),
      (error) => error.status === 409 && /overlaps another object/.test(error.message),
    );
    assert.deepEqual(audit(db, restaurant.id), before, "a later invalid edit rolls back every earlier staged write");

    commitStagedLayout(db, registry, auth.account, restaurant.id, {
      expectedRevision: 0,
      operations: [{ type: "floor", surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }] }],
    });
    const afterAccepted = audit(db, restaurant.id);
    assert.throws(
      () => commitStagedLayout(db, registry, auth.account, restaurant.id, {
        expectedRevision: 0,
        operations: [{ type: "floor", surfaceId: "white-hex", cells: [{ x: 1, y: 0 }] }],
      }),
      (error) => error.status === 409 && error.code === "layout-revision-conflict" && error.details.currentRevision === 1,
    );
    assert.deepEqual(audit(db, restaurant.id), afterAccepted, "stale staged commits are side-effect free");
  } finally {
    db.close();
  }
});

test("HTTP staged commit requires a revision and publishes only the committed authoritative layout", async () => {
  const { registry, db, auth, restaurant } = fixture("http");
  const live = new LiveService(db, registry, 10, 5);
  const server = createHttpServer(db, registry, live);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/v1/restaurants/${restaurant.id}/layout/commit`;
  const headers = { authorization: `Bearer ${auth.sessionToken}`, "content-type": "application/json" };
  try {
    const missing = await fetch(url, { method: "POST", headers, body: JSON.stringify({ operations: [{ type: "floor" }] }) });
    assert.equal(missing.status, 428);
    assert.equal((await missing.json()).error.code, "layout-revision-required");
    const accepted = await fetch(url, { method: "POST", headers, body: JSON.stringify({
      expectedRevision: 0,
      operations: [{ type: "floor", surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }] }],
    }) });
    assert.equal(accepted.status, 200);
    const payload = await accepted.json();
    assert.equal(payload.operationCount, 1);
    assert.equal(payload.layout.revision, 1);
    assert.equal(getLayout(db, registry, restaurant.id).revision, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    live.stop();
    db.close();
  }
});

test("Godot stages previews locally and exposes explicit commit, cancel, and Escape workflows", () => {
  const root = resolve(import.meta.dirname, "..");
  const main = readFileSync(resolve(root, "apps/client-godot/scripts/main.gd"), "utf8");
  const floor = readFileSync(resolve(root, "apps/client-godot/scripts/restaurant_floor.gd"), "utf8");
  const palette = readFileSync(resolve(root, "apps/client-godot/scripts/builder_palette.gd"), "utf8");
  assert.match(main, /staged_builder_operations: Array\[Dictionary\]/);
  assert.match(main, /layout\/commit" % current_restaurant_id, builder_revision_payload\(\{"operations": staged_builder_operations\}\)/);
  assert.match(main, /KEY_ESCAPE and not staged_builder_operations\.is_empty\(\)/);
  assert.match(main, /authoritative_builder_layout = data\.duplicate\(true\)/);
  assert.match(main, /Commit or cancel staged edits before using history/);
  assert.doesNotMatch(main, /match action:\s*\n\s*"floor": api\.patch_json/);
  assert.match(floor, /func set_staged_layout\(authoritative: Dictionary, operations: Array\)/);
  assert.match(floor, /layout = authoritative\.duplicate\(true\)/);
  assert.match(floor, /func staged_wall_key/);
  assert.match(palette, /signal commit_staged_requested/);
  assert.match(palette, /signal cancel_staged_requested/);
  assert.match(palette, /Cancel or Escape restores the authoritative layout without spending/);
});
