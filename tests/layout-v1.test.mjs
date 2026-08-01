import assert from "node:assert/strict";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { expandRestaurant, foundRestaurant, getLayout, moveObject, paintFloor, placeObject, sellObject, upsertWall } from "../dist/server/layout-service.js";

test("an owner can found, tile, wall, furnish, rotate, sell, and expand a modular restaurant", () => {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const auth = signup(db, registry, { username: `owner_${Date.now()}`, email: `owner_${Date.now()}@test.invalid`, displayName: "Owner Tester", password: "Production!234" });
  try {
    const founded = foundRestaurant(db, registry, auth.account, { regionId: "us-mid-atlantic", name: "Test Service House", concept: registry.content.concepts[0], style: registry.content.styles[0] });
    let layout = getLayout(db, registry, founded.id);
    assert.equal(layout.width, 24);
    assert.equal(layout.height, 16);
    assert.equal(layout.cells.length, 384);
    const paint = paintFloor(db, registry, auth.account, founded.id, { surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] });
    assert.equal(paint.changed, 2);
    const wall = upsertWall(db, registry, auth.account, founded.id, { x: 5, y: 5, edge: "north", wallStyleId: "subway-tile", openingType: "door", rotation: 0 });
    assert.ok(wall.costCents > 0);
    const placed = placeObject(db, registry, auth.account, founded.id, { definitionId: "table-two", x: 12, y: 2, rotation: 0 });
    assert.ok(placed.id.startsWith("object_"));
    const moved = moveObject(db, registry, auth.account, founded.id, placed.id, { x: 13, y: 3, rotation: 90 });
    assert.equal(moved.id, placed.id);
    const sold = sellObject(db, registry, auth.account, founded.id, placed.id);
    assert.ok(sold.refundCents > 0);
    const expanded = expandRestaurant(db, registry, auth.account, founded.id, { addWidth: 1, addHeight: 0 });
    assert.equal(expanded.width, 25);
    assert.equal(expanded.height, 16);
    layout = getLayout(db, registry, founded.id);
    assert.equal(layout.cells.length, 400);
  } finally {
    db.close();
  }
});
