import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { canonicalWallSegmentKey } from "../dist/server/layout-geometry.js";
import { expandRestaurant, foundRestaurant, getLayout, placeObject, redoLayout, undoLayout, upsertWall, validateLayout } from "../dist/server/layout-service.js";
import { LiveService } from "../dist/server/live-service.js";

function fixture(databasePath = ":memory:") {
  const registry = loadContent();
  const db = createDatabase(databasePath, registry);
  const token = randomUUID().slice(0, 8);
  const auth = signup(db, registry, {
    username: `topology_${token}`,
    email: `topology_${token}@test.invalid`,
    displayName: "Topology Owner",
    password: "Production!234",
  });
  const founded = foundRestaurant(db, registry, auth.account, {
    regionId: "us-mid-atlantic",
    name: `Topology House ${token}`,
    concept: registry.content.concepts[0],
    style: registry.content.styles[0],
  });
  return { registry, db, account: auth.account, restaurantId: founded.id };
}

function wallRows(db, restaurantId) {
  return db.prepare("SELECT * FROM wall_edges WHERE restaurant_id = ? ORDER BY grid_y, grid_x, edge, id").all(restaurantId);
}

function physicalKey(wall) {
  return canonicalWallSegmentKey(Number(wall.grid_x), Number(wall.grid_y), String(wall.edge));
}

function physicalWall(db, restaurantId, key) {
  return wallRows(db, restaurantId).filter((wall) => physicalKey(wall) === key);
}

function comparableLayout(db, registry, restaurantId) {
  const layout = getLayout(db, registry, restaurantId);
  const treasury = db.prepare("SELECT treasury_cents AS cents FROM restaurants WHERE id = ?").get(restaurantId).cents;
  return {
    width: layout.width,
    height: layout.height,
    treasury,
    cells: layout.cells,
    walls: layout.walls,
    objects: layout.objects,
  };
}

test("mirrored cell-edge edits share one physical wall authority", () => {
  const { registry, db, account, restaurantId } = fixture();
  const live = new LiveService(db, registry, 10, 5);
  try {
    db.prepare("UPDATE restaurants SET treasury_cents = 100000000 WHERE id = ?").run(restaurantId);
    upsertWall(db, registry, account, restaurantId, {
      x: 8, y: 8, edge: "north", wallStyleId: "painted-plaster", openingType: "arch", rotation: 0,
    });
    const segmentKey = canonicalWallSegmentKey(8, 8, "north");
    const first = physicalWall(db, restaurantId, segmentKey);
    assert.equal(first.length, 1);
    assert.equal(live.blockingWallBetween(restaurantId, 8, 8, "north"), false, "the shared arch is traversable from either cell side");

    upsertWall(db, registry, account, restaurantId, {
      x: 8, y: 7, edge: "south", wallStyleId: "subway-tile", openingType: "solid", rotation: 180,
    });
    const updated = physicalWall(db, restaurantId, segmentKey);
    assert.equal(updated.length, 1, "the mirrored edit must update rather than duplicate the segment");
    assert.equal(updated[0].id, first[0].id, "physical wall identity survives a mirrored edit");
    assert.deepEqual(
      { x: updated[0].grid_x, y: updated[0].grid_y, edge: updated[0].edge, style: updated[0].wall_style_id, opening: updated[0].opening_type },
      { x: 8, y: 7, edge: "south", style: "subway-tile", opening: "solid" },
    );
    assert.equal(live.blockingWallBetween(restaurantId, 8, 8, "north"), true, "movement consumes the same canonical authority");

    assert.throws(
      () => db.prepare(`INSERT INTO wall_edges
        (id, restaurant_id, grid_x, grid_y, edge, wall_style_id, opening_type, rotation, updated_at)
        VALUES (?, ?, 8, 8, 'north', 'painted-plaster', 'door', 0, ?)`)
        .run(randomUUID(), restaurantId, Date.now()),
      /UNIQUE constraint failed/i,
      "the database index must reject a second row for the physical segment",
    );
  } finally {
    live.stop();
    db.close();
  }
});

test("database startup repairs legacy mirrored duplicates before enforcing uniqueness", () => {
  const directory = mkdtempSync(join(tmpdir(), "rro-wall-topology-migration-"));
  const databasePath = join(directory, "world.sqlite");
  const state = fixture(databasePath);
  let { db } = state;
  try {
    db.exec("DROP INDEX wall_edges_physical_segment_idx");
    db.prepare(`INSERT INTO wall_edges
      (id, restaurant_id, grid_x, grid_y, edge, wall_style_id, opening_type, rotation, updated_at)
      VALUES ('legacy-old', ?, 6, 6, 'north', 'painted-plaster', 'door', 0, 100)`)
      .run(state.restaurantId);
    db.prepare(`INSERT INTO wall_edges
      (id, restaurant_id, grid_x, grid_y, edge, wall_style_id, opening_type, rotation, updated_at)
      VALUES ('legacy-new', ?, 6, 5, 'south', 'subway-tile', 'arch', 180, 200)`)
      .run(state.restaurantId);
    db.close();

    db = createDatabase(databasePath, state.registry);
    const repaired = physicalWall(db, state.restaurantId, canonicalWallSegmentKey(6, 6, "north"));
    assert.equal(repaired.length, 1);
    assert.equal(repaired[0].id, "legacy-new", "the most recently edited legacy row wins deterministically");
    assert.equal(repaired[0].opening_type, "arch");
    assert.equal(db.prepare("SELECT value FROM application_meta WHERE key = 'wall_topology_version'").get().value, "1");
    assert.ok(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'wall_edges_physical_segment_idx'").get());
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("width, height, and combined expansions relocate the perimeter without orphan shells", async (t) => {
  for (const scenario of [
    { label: "width", addWidth: 3, addHeight: 0 },
    { label: "height", addWidth: 0, addHeight: 2 },
    { label: "combined", addWidth: 3, addHeight: 2 },
  ]) {
    await t.test(scenario.label, () => {
      const { registry, db, account, restaurantId } = fixture();
      try {
        db.prepare("UPDATE restaurants SET treasury_cents = 100000000 WHERE id = ?").run(restaurantId);
        const oldWidth = 24;
        const oldHeight = 16;
        const oldEastDoor = physicalWall(db, restaurantId, `vertical:${oldWidth}:2`)[0];
        const oldSouth = physicalWall(db, restaurantId, `horizontal:5:${oldHeight}`)[0];
        assert.ok(oldEastDoor && oldSouth);
        assert.equal(validateLayout(db, registry, restaurantId).validForService, true);

        const result = expandRestaurant(db, registry, account, restaurantId, scenario);
        const width = oldWidth + scenario.addWidth;
        const height = oldHeight + scenario.addHeight;
        const walls = wallRows(db, restaurantId);
        const keys = walls.map(physicalKey);
        assert.equal(result.width, width);
        assert.equal(result.height, height);
        assert.equal(result.relocatedWalls, (scenario.addWidth ? oldHeight : 0) + (scenario.addHeight ? oldWidth : 0));
        assert.equal(result.addedPerimeterWalls, scenario.addWidth * 2 + scenario.addHeight * 2);
        assert.equal(walls.length, width * 2 + height * 2);
        assert.equal(new Set(keys).size, keys.length, "every physical perimeter segment has one row");
        assert.equal(getLayout(db, registry, restaurantId).cells.length, width * height);

        if (scenario.addWidth) {
          assert.equal(keys.some((key) => key.startsWith(`vertical:${oldWidth}:`)), false, "the former east shell is removed");
          const movedDoor = physicalWall(db, restaurantId, `vertical:${width}:2`)[0];
          assert.equal(movedDoor.id, oldEastDoor.id);
          assert.equal(movedDoor.opening_type, "service-door");
        }
        if (scenario.addHeight) {
          assert.equal(keys.some((key) => key.startsWith("horizontal:") && key.endsWith(`:${oldHeight}`)), false, "the former south shell is removed");
          const movedSouth = physicalWall(db, restaurantId, `horizontal:5:${height}`)[0];
          assert.equal(movedSouth.id, oldSouth.id);
        }
        const validation = validateLayout(db, registry, restaurantId);
        assert.equal(validation.validForService, false, "new expansion cells remain deliberately unassigned until the owner zones them");
        assert.ok(validation.errors.some((error) => error.code === "unassigned-room"));
        assert.equal(validation.missingPerimeterEdges, 0);
        assert.equal(validation.usableExits, 2, "the north door and relocated east service door remain legal");
        assert.equal(validation.reachableCells, validation.walkableCells);
      } finally {
        db.close();
      }
    });
  }
});

test("expansion relocates supported wall mounts and is exactly durable through restart, undo, and redo", () => {
  const directory = mkdtempSync(join(tmpdir(), "rro-expansion-history-"));
  const databasePath = join(directory, "world.sqlite");
  const state = fixture(databasePath);
  let { db } = state;
  try {
    db.prepare("DELETE FROM object_instances WHERE restaurant_id = ?").run(state.restaurantId);
    db.prepare("UPDATE restaurants SET treasury_cents = 100000000 WHERE id = ?").run(state.restaurantId);
    const east = placeObject(db, state.registry, state.account, state.restaurantId, { definitionId: "local-art", x: 23, y: 4, rotation: 90 });
    const south = placeObject(db, state.registry, state.account, state.restaurantId, { definitionId: "local-art", x: 4, y: 15, rotation: 180 });
    const north = placeObject(db, state.registry, state.account, state.restaurantId, { definitionId: "local-art", x: 8, y: 0, rotation: 0 });
    const ceiling = placeObject(db, state.registry, state.account, state.restaurantId, { definitionId: "pendants", x: 12, y: 10, rotation: 0 });
    const floor = placeObject(db, state.registry, state.account, state.restaurantId, { definitionId: "essential-dining-chair", x: 16, y: 10, rotation: 0 });
    const beforeExpansion = comparableLayout(db, state.registry, state.restaurantId);

    const expanded = expandRestaurant(db, state.registry, state.account, state.restaurantId, { addWidth: 2, addHeight: 3 });
    assert.equal(expanded.relocatedMounts, 2);
    assert.equal(expanded.layout.validation.validForService, false);
    assert.ok(expanded.layout.validation.errors.some((error) => error.code === "unassigned-room"));
    const positions = Object.fromEntries(expanded.layout.objects.map((object) => [object.id, { x: object.x, y: object.y, rotation: object.rotation }]));
    assert.deepEqual(positions[east.id], { x: 25, y: 4, rotation: 90 });
    assert.deepEqual(positions[south.id], { x: 4, y: 18, rotation: 180 });
    assert.deepEqual(positions[north.id], { x: 8, y: 0, rotation: 0 });
    assert.deepEqual(positions[ceiling.id], { x: 12, y: 10, rotation: 0 });
    assert.deepEqual(positions[floor.id], { x: 16, y: 10, rotation: 0 });
    const afterExpansion = comparableLayout(db, state.registry, state.restaurantId);
    db.close();

    db = createDatabase(databasePath, state.registry);
    assert.deepEqual(comparableLayout(db, state.registry, state.restaurantId), afterExpansion, "expanded topology survives restart exactly");
    const undone = undoLayout(db, state.registry, state.account, state.restaurantId);
    assert.equal(undone.action, "expand restaurant");
    assert.deepEqual(comparableLayout(db, state.registry, state.restaurantId), beforeExpansion);
    db.close();

    db = createDatabase(databasePath, state.registry);
    const redone = redoLayout(db, state.registry, state.account, state.restaurantId);
    assert.equal(redone.action, "expand restaurant");
    assert.deepEqual(comparableLayout(db, state.registry, state.restaurantId), afterExpansion);
    assert.equal(redone.layout.validation.validForService, false, "redo restores the exact unassigned expansion state");
    assert.ok(redone.layout.validation.errors.some((error) => error.code === "unassigned-room"));
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
