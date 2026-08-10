import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { commitStagedLayout, expandRestaurant, foundRestaurant, getLayout, ROOM_TAGS, validateLayout } from "../dist/server/layout-service.js";

function ownerFixture(db, registry, suffix) {
  const auth = signup(db, registry, {
    username: `room_${suffix}`,
    email: `room_${suffix}@test.invalid`,
    displayName: "Room Planner",
    password: "Production!234",
  });
  const restaurant = foundRestaurant(db, registry, auth.account, {
    regionId: "us-mid-atlantic",
    name: `Room ${suffix} House`,
    concept: registry.content.concepts[0],
    style: registry.content.styles[0],
  });
  return { auth, restaurant };
}

test("authoritative room tags stage at zero cost, persist, undo as one batch, and expose opening checks", () => {
  const directory = mkdtempSync(join(tmpdir(), "rro-room-tags-"));
  const databasePath = join(directory, "world.sqlite");
  const registry = loadContent();
  let db = createDatabase(databasePath, registry);
  const suffix = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const { auth, restaurant } = ownerFixture(db, registry, suffix);
  try {
    const initial = getLayout(db, registry, restaurant.id);
    assert.deepEqual(initial.roomTags, ROOM_TAGS);
    assert.equal(initial.validation.openingReady, true);
    assert.equal(initial.validation.operationalChecks.length, 6);
    const treasuryBefore = db.prepare("SELECT treasury_cents AS cents FROM restaurants WHERE id = ?").get(restaurant.id).cents;
    const committed = commitStagedLayout(db, registry, auth.account, restaurant.id, {
      expectedRevision: 0,
      operations: [
        { type: "room-tag", roomTag: "entry", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
        { type: "room-tag", roomTag: "service", cells: [{ x: 10, y: 10 }] },
      ],
    });
    assert.equal(committed.costCents, 0);
    assert.equal(committed.operationCount, 2);
    assert.deepEqual(committed.results.map(({ type, changed }) => ({ type, changed })), [
      { type: "room-tag", changed: 2 },
      { type: "room-tag", changed: 1 },
    ]);
    assert.equal(committed.layout.revision, 1);
    assert.equal(committed.layout.validation.roomTagCounts.entry, 2);
    assert.equal(committed.layout.validation.roomTagCounts.service, 1);
    assert.equal(db.prepare("SELECT treasury_cents AS cents FROM restaurants WHERE id = ?").get(restaurant.id).cents, treasuryBefore);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM ledger_entries WHERE restaurant_id = ?").get(restaurant.id).count, 0, "room zoning does not create a financial entry");
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM layout_history WHERE restaurant_id = ?").get(restaurant.id).count, 1, "the room-tag batch creates one durable undo entry");

    db.close();
    db = createDatabase(databasePath, registry);
    const restored = getLayout(db, registry, restaurant.id);
    assert.equal(restored.revision, 1);
    assert.equal(restored.cells.find((cell) => cell.x === 0 && cell.y === 0).roomTag, "entry");
    assert.equal(restored.cells.find((cell) => cell.x === 10 && cell.y === 10).roomTag, "service");
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("unknown room tags roll back the complete staged batch without spend or history", () => {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const suffix = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const { auth, restaurant } = ownerFixture(db, registry, suffix);
  try {
    const before = {
      treasury: db.prepare("SELECT treasury_cents AS cents FROM restaurants WHERE id = ?").get(restaurant.id).cents,
      revision: getLayout(db, registry, restaurant.id).revision,
      floor: db.prepare("SELECT surface_id AS surfaceId, room_tag AS roomTag FROM floor_cells WHERE restaurant_id = ? AND grid_x = 0 AND grid_y = 0").get(restaurant.id),
    };
    assert.throws(
      () => commitStagedLayout(db, registry, auth.account, restaurant.id, {
        expectedRevision: 0,
        operations: [
          { type: "floor", surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }] },
          { type: "room-tag", roomTag: "secret-vip-tax-zone", cells: [{ x: 0, y: 0 }] },
        ],
      }),
      (error) => error.status === 400 && /Unknown room tag/.test(error.message),
    );
    assert.equal(db.prepare("SELECT treasury_cents AS cents FROM restaurants WHERE id = ?").get(restaurant.id).cents, before.treasury);
    assert.equal(getLayout(db, registry, restaurant.id).revision, before.revision);
    assert.deepEqual(db.prepare("SELECT surface_id AS surfaceId, room_tag AS roomTag FROM floor_cells WHERE restaurant_id = ? AND grid_x = 0 AND grid_y = 0").get(restaurant.id), before.floor);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM layout_history WHERE restaurant_id = ?").get(restaurant.id).count, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM ledger_entries WHERE restaurant_id = ?").get(restaurant.id).count, 0);
  } finally {
    db.close();
  }
});

test("expanded cells block opening readiness until assigned and legacy invalid tags are diagnosed", () => {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const suffix = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const { auth, restaurant } = ownerFixture(db, registry, suffix);
  try {
    const expanded = expandRestaurant(db, registry, auth.account, restaurant.id, { expectedRevision: 0, addWidth: 1, addHeight: 0 });
    assert.equal(expanded.layout.validation.openingReady, false);
    assert.ok(expanded.layout.validation.errors.some((error) => error.code === "unassigned-room" && error.count === 16));
    const cells = Array.from({ length: 16 }, (_, y) => ({ x: 24, y }));
    const assigned = commitStagedLayout(db, registry, auth.account, restaurant.id, {
      expectedRevision: 1,
      operations: [{ type: "room-tag", roomTag: "dining", cells }],
    });
    assert.equal(assigned.layout.validation.openingReady, true);
    assert.equal(assigned.layout.validation.roomTagCounts.unassigned, undefined);

    db.prepare("UPDATE floor_cells SET room_tag = 'legacy-unknown' WHERE restaurant_id = ? AND grid_x = 24 AND grid_y = 0").run(restaurant.id);
    const invalid = validateLayout(db, registry, restaurant.id);
    assert.equal(invalid.openingReady, false);
    assert.ok(invalid.errors.some((error) => error.code === "invalid-room-tag" && error.count === 1));
    assert.equal(invalid.operationalChecks.find((check) => check.code === "room-vocabulary").passed, false);

    db.prepare("UPDATE floor_cells SET room_tag = 'dining' WHERE restaurant_id = ? AND room_tag IN ('legacy-unknown', 'kitchen')").run(restaurant.id);
    const missingKitchen = validateLayout(db, registry, restaurant.id);
    assert.equal(missingKitchen.openingReady, false);
    assert.ok(missingKitchen.errors.some((error) => error.code === "missing-kitchen-room"));
    assert.equal(missingKitchen.operationalChecks.find((check) => check.code === "kitchen-zone").passed, false);
  } finally {
    db.close();
  }
});

test("Godot exposes a dedicated staged room-tag brush and non-color opening feedback", () => {
  const root = resolve(import.meta.dirname, "..");
  const floor = readFileSync(resolve(root, "apps/client-godot/scripts/restaurant_floor.gd"), "utf8");
  const palette = readFileSync(resolve(root, "apps/client-godot/scripts/builder_palette.gd"), "utf8");
  const main = readFileSync(resolve(root, "apps/client-godot/scripts/main.gd"), "utf8");
  assert.match(palette, /func set_room_tags\(value: Array\)/);
  assert.match(palette, /select_catalog\.bind\("room-tag", room_id/);
  assert.match(palette, /Operational zone · no construction cost/);
  assert.match(palette, /Operational opening checklist/);
  assert.match(floor, /build_action_requested\.emit\("room-tag", \{"roomTag": selected_catalog_id/);
  assert.match(floor, /ROOM_TAG_COLORS/);
  assert.match(floor, /if build_tool == "room-tag"/);
  assert.match(main, /current_builder\.set_room_tags\(authoritative_builder_layout\.get\("roomTags", \[\]\)\)/);
  assert.doesNotMatch(floor, /build_action_requested\.emit\("floor", \{"surfaceId": selected_catalog_id, "roomTag"/);
});
