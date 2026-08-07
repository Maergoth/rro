import assert from "node:assert/strict";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { createHttpServer } from "../dist/server/http-server.js";
import {
  commitStagedLayout,
  expandRestaurant,
  foundRestaurant,
  moveObject,
  paintFloor,
  placeObject,
  redoLayout,
  repairObject,
  sellObject,
  undoLayout,
  upsertWall,
} from "../dist/server/layout-service.js";
import { LiveService } from "../dist/server/live-service.js";

function fixture(label) {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const stamp = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const owner = signup(db, registry, {
    username: `owner_gate_${label}_${stamp}`,
    email: `owner_gate_${label}_${stamp}@test.invalid`,
    displayName: "Builder Owner",
    password: "Production!234",
  });
  const employee = signup(db, registry, {
    username: `employee_gate_${label}_${stamp}`,
    email: `employee_gate_${label}_${stamp}@test.invalid`,
    displayName: "Builder Employee",
    password: "Production!234",
  });
  const restaurant = foundRestaurant(db, registry, owner.account, {
    regionId: "us-mid-atlantic",
    name: `Owner Gate ${label}`,
    concept: registry.content.concepts[0],
    style: registry.content.styles[0],
  });
  const roleId = registry.content.roles.find((role) => role.employmentMode === "job").id;
  db.prepare("INSERT INTO employments (id, character_id, restaurant_id, region_id, role_id, status, hired_at) VALUES (?, ?, ?, ?, ?, 'active', ?)")
    .run(`employment_${stamp}`, employee.account.characterId, restaurant.id, "us-mid-atlantic", roleId, Date.now());
  const starter = db.prepare("SELECT id FROM object_instances WHERE restaurant_id = ? ORDER BY placed_at, id LIMIT 1").get(restaurant.id);
  return { registry, db, owner, employee, restaurant, starter };
}

function ownerState(db, restaurantId) {
  const rows = (sql) => db.prepare(sql).all(restaurantId);
  return {
    restaurant: db.prepare("SELECT treasury_cents AS treasuryCents, build_width AS width, build_height AS height, layout_revision AS revision FROM restaurants WHERE id = ?").get(restaurantId),
    floor: rows("SELECT grid_x AS x, grid_y AS y, surface_id AS surfaceId, room_tag AS roomTag, walkable, updated_at AS updatedAt FROM floor_cells WHERE restaurant_id = ? ORDER BY grid_y, grid_x"),
    walls: rows("SELECT grid_x AS x, grid_y AS y, edge, wall_style_id AS wallStyleId, opening_type AS openingType, rotation, updated_at AS updatedAt FROM wall_edges WHERE restaurant_id = ? ORDER BY grid_y, grid_x, edge"),
    objects: rows("SELECT id, definition_id AS definitionId, grid_x AS x, grid_y AS y, rotation, state, wear, updated_at AS updatedAt FROM object_instances WHERE restaurant_id = ? ORDER BY id"),
    history: rows("SELECT id, action, before_json AS beforeJson, after_json AS afterJson, undone_at AS undoneAt FROM layout_history WHERE restaurant_id = ? ORDER BY id"),
    ledger: rows("SELECT id, character_id AS characterId, category, amount_cents AS amountCents, reference_type AS referenceType, reference_id AS referenceId FROM ledger_entries WHERE restaurant_id = ? ORDER BY id"),
  };
}

function expectOwnerOnly(action) {
  assert.throws(
    action,
    (error) => error.status === 403 && /only this restaurant's owner can change its layout/i.test(error.message),
  );
}

test("an employee cannot use any authoritative builder mutation and every rejection is side-effect free", () => {
  const { registry, db, employee, restaurant, starter } = fixture("service");
  try {
    const before = ownerState(db, restaurant.id);
    const attempts = [
      () => paintFloor(db, registry, employee.account, restaurant.id, { expectedRevision: 0, surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }] }),
      () => upsertWall(db, registry, employee.account, restaurant.id, { expectedRevision: 0, x: 5, y: 5, edge: "north", wallStyleId: "subway-tile", openingType: "solid", rotation: 0 }),
      () => placeObject(db, registry, employee.account, restaurant.id, { expectedRevision: 0, definitionId: "table-two", x: 12, y: 2, rotation: 0 }),
      () => moveObject(db, registry, employee.account, restaurant.id, starter.id, { expectedRevision: 0, x: 14, y: 5, rotation: 90 }),
      () => commitStagedLayout(db, registry, employee.account, restaurant.id, {
        expectedRevision: 0,
        operations: [
          { type: "room-tag", roomTag: "dining", cells: [{ x: 0, y: 0 }] },
          { type: "floor", surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }] },
        ],
      }),
      () => repairObject(db, registry, employee.account, restaurant.id, starter.id, { expectedRevision: 0 }),
      () => sellObject(db, registry, employee.account, restaurant.id, starter.id, { expectedRevision: 0 }),
      () => expandRestaurant(db, registry, employee.account, restaurant.id, { expectedRevision: 0, addWidth: 1, addHeight: 0 }),
      () => undoLayout(db, registry, employee.account, restaurant.id, { expectedRevision: 0 }),
      () => redoLayout(db, registry, employee.account, restaurant.id, { expectedRevision: 0 }),
    ];
    for (const attempt of attempts) {
      expectOwnerOnly(attempt);
      assert.deepEqual(ownerState(db, restaurant.id), before, "a rejected employee builder action must not mutate authoritative state");
    }
  } finally {
    db.close();
  }
});

test("the HTTP builder and Godot builder entry point expose owner access only", async () => {
  const { registry, db, employee, restaurant } = fixture("http");
  const live = new LiveService(db, registry, 10, 5);
  const server = createHttpServer(db, registry, live);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const headers = { authorization: `Bearer ${employee.sessionToken}`, "content-type": "application/json" };
  const before = ownerState(db, restaurant.id);
  try {
    const bootstrap = await fetch(`${base}/v1/bootstrap`, { headers });
    assert.equal(bootstrap.status, 200);
    const bootstrapPayload = await bootstrap.json();
    assert.deepEqual(bootstrapPayload.ownedRestaurants, [], "employment never grants a restaurant owner-builder entry");
    assert.equal(bootstrapPayload.employment.restaurantId, restaurant.id);

    const response = await fetch(`${base}/v1/restaurants/${restaurant.id}/layout/commit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ expectedRevision: 0, operations: [{ type: "room-tag", roomTag: "dining", cells: [{ x: 0, y: 0 }] }] }),
    });
    assert.equal(response.status, 403);
    assert.match((await response.json()).error.message, /only this restaurant's owner can change its layout/i);
    assert.deepEqual(ownerState(db, restaurant.id), before);

    const root = resolve(import.meta.dirname, "..");
    const main = readFileSync(resolve(root, "apps/client-godot/scripts/main.gd"), "utf8");
    const ownerStudio = main.slice(main.indexOf("func show_my_restaurant()"), main.indexOf("func show_found_restaurant()"));
    const shiftView = main.slice(main.indexOf("func show_shift()"), main.indexOf("func show_shift_summary()"));
    assert.match(ownerStudio, /bootstrap\.get\("ownedRestaurants", \[\]\)/);
    assert.match(ownerStudio, /current_builder = BuilderPalette\.new\(\)/);
    assert.doesNotMatch(shiftView, /BuilderPalette\.new\(\)/, "employee shift UI must not construct a builder palette");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    live.stop();
    db.close();
  }
});
