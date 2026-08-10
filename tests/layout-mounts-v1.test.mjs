import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { LiveService } from "../dist/server/live-service.js";
import { foundRestaurant, moveObject, placeObject, redoLayout, undoLayout, upsertWall, validateLayout } from "../dist/server/layout-service.js";

function fixture(databasePath = ":memory:") {
  const registry = loadContent();
  const db = createDatabase(databasePath, registry);
  const token = randomUUID().slice(0, 8);
  const auth = signup(db, registry, {
    username: `mount_${token}`,
    email: `mount_${token}@test.invalid`,
    displayName: "Mount Test Owner",
    password: "Production!234",
  });
  const founded = foundRestaurant(db, registry, auth.account, {
    regionId: "us-mid-atlantic",
    name: `Mount Test ${token}`,
    concept: registry.content.concepts[0],
    style: registry.content.styles[0],
  });
  db.prepare("DELETE FROM object_instances WHERE restaurant_id = ?").run(founded.id);
  return { registry, db, account: auth.account, restaurantId: founded.id };
}

function placementError(status, pattern) {
  return (error) => error?.status === status && pattern.test(error.message);
}

test("wall-mounted width spans follow all four rotation-selected support edges", () => {
  const { registry, db, account, restaurantId } = fixture();
  try {
    const placements = [
      { x: 4, y: 0, rotation: 0 },
      { x: 23, y: 4, rotation: 90 },
      { x: 4, y: 15, rotation: 180 },
      { x: 0, y: 4, rotation: 270 },
    ];
    for (const placement of placements) {
      const placed = placeObject(db, registry, account, restaurantId, { definitionId: "local-art", ...placement });
      const row = db.prepare("SELECT grid_x AS x, grid_y AS y, rotation FROM object_instances WHERE id = ?").get(placed.id);
      assert.deepEqual({ ...row }, { x: placement.x, y: placement.y, rotation: placement.rotation });
    }

    const validation = validateLayout(db, registry, restaurantId);
    assert.equal(validation.validForService, true);
    assert.equal(validation.walkableCells, 24 * 16, "wall mounts must not consume walkable floor cells");
    assert.deepEqual(validation.inaccessibleObjectIds, [], "serviceAccess none mounts need no interaction edge");
    assert.deepEqual(validation.invalidMountObjectIds, []);
  } finally {
    db.close();
  }
});

test("wall support accepts mirrored edges and rejects incomplete spans and illegal openings", () => {
  const { registry, db, account, restaurantId } = fixture();
  try {
    assert.throws(
      () => placeObject(db, registry, account, restaurantId, { definitionId: "local-art", x: 10, y: 8, rotation: 0 }),
      placementError(409, /supporting wall.*full span/i),
    );

    upsertWall(db, registry, account, restaurantId, { x: 10, y: 7, edge: "south", wallStyleId: "subway-tile", openingType: "solid", rotation: 180 });
    assert.throws(
      () => placeObject(db, registry, account, restaurantId, { definitionId: "local-art", x: 10, y: 8, rotation: 0 }),
      placementError(409, /supporting wall.*full span/i),
      "every cell in the two-wide north span requires support",
    );
    upsertWall(db, registry, account, restaurantId, { x: 11, y: 7, edge: "south", wallStyleId: "subway-tile", openingType: "solid", rotation: 180 });
    const mirrored = placeObject(db, registry, account, restaurantId, { definitionId: "local-art", x: 10, y: 8, rotation: 0 });
    assert.ok(mirrored.id);
    assert.throws(
      () => upsertWall(db, registry, account, restaurantId, { x: 10, y: 7, edge: "south", wallStyleId: "subway-tile", openingType: "arch", rotation: 180 }),
      placementError(409, /leave a mounted object without legal support/i),
      "a later wall edit cannot invalidate a mounted object",
    );

    assert.throws(
      () => placeObject(db, registry, account, restaurantId, { definitionId: "local-art", x: 1, y: 0, rotation: 0 }),
      placementError(409, /door opening cannot support/i),
      "the default north door interrupts the requested wall span",
    );
    for (const x of [13, 14]) {
      upsertWall(db, registry, account, restaurantId, { x, y: 8, edge: "north", wallStyleId: "subway-tile", openingType: "arch", rotation: 0 });
    }
    assert.throws(
      () => placeObject(db, registry, account, restaurantId, { definitionId: "local-art", x: 13, y: 8, rotation: 0 }),
      placementError(409, /arch opening cannot support/i),
    );

    registry.furnitureById.get("local-art").placement.allowedWallOpenings = ["solid", "window"];
    for (const x of [8, 9]) {
      upsertWall(db, registry, account, restaurantId, { x, y: 0, edge: "north", wallStyleId: "painted-plaster", openingType: "window", rotation: 0 });
    }
    const windowMounted = placeObject(db, registry, account, restaurantId, { definitionId: "local-art", x: 8, y: 0, rotation: 0 });
    assert.ok(windowMounted.id);
    assert.throws(
      () => upsertWall(db, registry, account, restaurantId, { x: 8, y: 0, edge: "north", wallStyleId: "painted-plaster", openingType: "door", rotation: 0 }),
      placementError(409, /leave a mounted object without legal support/i),
    );
  } finally {
    db.close();
  }
});

test("collision namespaces mounts while only blocking floor occupancy stops navigation", () => {
  const { registry, db, account, restaurantId } = fixture();
  const live = new LiveService(db, registry, 10, 5);
  try {
    const floor = placeObject(db, registry, account, restaurantId, { definitionId: "essential-dining-chair", x: 6, y: 6, rotation: 0 });
    const ceiling = placeObject(db, registry, account, restaurantId, { definitionId: "pendants", x: 6, y: 6, rotation: 0 });
    assert.ok(floor.id && ceiling.id, "floor and ceiling objects may share cells");
    assert.equal(live.collides(restaurantId, 6.5, 6.5), true, "blocking floor occupancy stops traversal");

    assert.throws(
      () => placeObject(db, registry, account, restaurantId, { definitionId: "pendants", x: 7, y: 6, rotation: 0 }),
      placementError(409, /ceiling-mount footprint overlaps/i),
      "same-mount overlap remains illegal",
    );
    assert.throws(
      () => placeObject(db, registry, account, restaurantId, { definitionId: "essential-dining-chair", x: 6, y: 6, rotation: 0 }),
      placementError(409, /floor-mount footprint overlaps/i),
    );

    placeObject(db, registry, account, restaurantId, { definitionId: "local-art", x: 12, y: 0, rotation: 0 });
    assert.equal(live.collides(restaurantId, 12.5, 0.5), false, "wall occupancy does not block floor navigation");

    const drain = registry.furnitureById.get("floor-drain");
    drain.placement = { mount: "floor", occupancy: "nonblocking", serviceAccess: "none" };
    placeObject(db, registry, account, restaurantId, { definitionId: "floor-drain", x: 10, y: 10, rotation: 0 });
    assert.equal(live.collides(restaurantId, 10.5, 10.5), false, "nonblocking floor occupancy does not stop traversal");

    placeObject(db, registry, account, restaurantId, { definitionId: "essential-dining-chair", x: 12, y: 0, rotation: 0 });
    assert.throws(
      () => placeObject(db, registry, account, restaurantId, { definitionId: "local-art", x: 13, y: 0, rotation: 0 }),
      placementError(409, /wall-mount footprint overlaps/i),
      "floor sharing does not weaken collision inside the wall namespace",
    );
  } finally {
    live.stop();
    db.close();
  }
});

test("readiness ignores nonblocking mounts but floor blockers still change egress", () => {
  const { registry, db, account, restaurantId } = fixture();
  try {
    const ceiling = placeObject(db, registry, account, restaurantId, { definitionId: "pendants", x: 2, y: 0, rotation: 0 });
    const wall = placeObject(db, registry, account, restaurantId, { definitionId: "local-art", x: 3, y: 0, rotation: 0 });
    const decorated = validateLayout(db, registry, restaurantId);
    assert.equal(decorated.validForService, true);
    assert.equal(decorated.usableExits, 2);
    assert.equal(decorated.walkableCells, 24 * 16);
    assert.equal(decorated.reachableCells, decorated.walkableCells);
    assert.ok(!decorated.inaccessibleObjectIds.includes(ceiling.id));
    assert.ok(!decorated.inaccessibleObjectIds.includes(wall.id));

    const northBlock = placeObject(db, registry, account, restaurantId, { definitionId: "essential-dining-chair", x: 2, y: 0, rotation: 0 });
    const oneExit = validateLayout(db, registry, restaurantId);
    assert.equal(oneExit.validForService, true);
    assert.equal(oneExit.usableExits, 1);
    assert.equal(oneExit.walkableCells, 24 * 16 - 1);
    assert.equal(oneExit.reachableCells, oneExit.walkableCells);
    assert.ok(!oneExit.inaccessibleObjectIds.includes(northBlock.id), "an exit blocker is serviceable from its interior edge");

    placeObject(db, registry, account, restaurantId, { definitionId: "essential-dining-chair", x: 23, y: 2, rotation: 0 });
    const blocked = validateLayout(db, registry, restaurantId);
    assert.equal(blocked.validForService, false);
    assert.equal(blocked.usableExits, 0);
    assert.ok(blocked.errors.some((error) => error.code === "blocked-egress"));
  } finally {
    db.close();
  }
});

test("wall mount anchor and rotation survive restart plus undo and redo", () => {
  const directory = mkdtempSync(join(tmpdir(), "rro-wall-mount-history-"));
  const databasePath = join(directory, "world.sqlite");
  const state = fixture(databasePath);
  let { db } = state;
  try {
    const placed = placeObject(db, state.registry, state.account, state.restaurantId, { definitionId: "local-art", x: 4, y: 0, rotation: 0 });
    moveObject(db, state.registry, state.account, state.restaurantId, placed.id, { x: 23, y: 4, rotation: 90 });
    db.close();

    db = createDatabase(databasePath, state.registry);
    assert.deepEqual(
      { ...db.prepare("SELECT grid_x AS x, grid_y AS y, rotation FROM object_instances WHERE id = ?").get(placed.id) },
      { x: 23, y: 4, rotation: 90 },
    );
    undoLayout(db, state.registry, state.account, state.restaurantId);
    assert.deepEqual(
      { ...db.prepare("SELECT grid_x AS x, grid_y AS y, rotation FROM object_instances WHERE id = ?").get(placed.id) },
      { x: 4, y: 0, rotation: 0 },
    );
    db.close();

    db = createDatabase(databasePath, state.registry);
    redoLayout(db, state.registry, state.account, state.restaurantId);
    assert.deepEqual(
      { ...db.prepare("SELECT grid_x AS x, grid_y AS y, rotation FROM object_instances WHERE id = ?").get(placed.id) },
      { x: 23, y: 4, rotation: 90 },
    );
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
