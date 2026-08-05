import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { expandRestaurant, foundRestaurant, getFurnitureEffects, getLayout, moveObject, paintFloor, placeObject, redoLayout, repairObject, sellObject, undoLayout, upsertWall } from "../dist/server/layout-service.js";

function comparableLayout(db, registry, restaurantId) {
  const layout = getLayout(db, registry, restaurantId);
  const restaurant = db.prepare("SELECT treasury_cents AS treasuryCents FROM restaurants WHERE id = ?").get(restaurantId);
  return {
    width: layout.width,
    height: layout.height,
    treasuryCents: restaurant.treasuryCents,
    cells: layout.cells,
    walls: layout.walls,
    objects: layout.objects,
  };
}

test("layout undo and redo survive restart, restore treasury atomically, and discard divergent redo", () => {
  const directory = mkdtempSync(join(tmpdir(), "rro-layout-history-"));
  const databasePath = join(directory, "world.sqlite");
  const registry = loadContent();
  let db = createDatabase(databasePath, registry);
  const stamp = Date.now().toString(36).slice(-8);
  const auth = signup(db, registry, { username: `history_${stamp}`, email: `history_${stamp}@test.invalid`, displayName: "History Owner", password: "Production!234" });
  const outsider = signup(db, registry, { username: `history_guest_${stamp}`, email: `history_guest_${stamp}@test.invalid`, displayName: "History Guest", password: "Production!234" });
  const founded = foundRestaurant(db, registry, auth.account, { regionId: "us-mid-atlantic", name: "History Test House", concept: registry.content.concepts[0], style: registry.content.styles[0] });
  try {
    const baseline = comparableLayout(db, registry, founded.id);
    paintFloor(db, registry, auth.account, founded.id, { surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] });
    const afterPaint = comparableLayout(db, registry, founded.id);
    const placed = placeObject(db, registry, auth.account, founded.id, { definitionId: "table-two", x: 12, y: 2, rotation: 90, primaryColor: "#123456", secondaryColor: "#abcdef" });
    const afterPlace = comparableLayout(db, registry, founded.id);
    assert.equal(getLayout(db, registry, founded.id).history.canUndo, true);
    assert.equal(getLayout(db, registry, founded.id).history.canRedo, false);

    db.close();
    db = createDatabase(databasePath, registry);
    assert.deepEqual(comparableLayout(db, registry, founded.id), afterPlace, "committed layout history must survive a server restart");
    assert.throws(() => undoLayout(db, registry, outsider.account, founded.id), (error) => error.status === 403);
    const now = Date.now();
    db.prepare("INSERT INTO service_shifts (id, restaurant_id, opened_by_character_id, state, opened_at, closes_at) VALUES (?, ?, ?, 'open', ?, ?)")
      .run("shift_history_lock", founded.id, auth.account.characterId, now, now + 60_000);
    assert.throws(() => undoLayout(db, registry, auth.account, founded.id), (error) => error.status === 409 && /layout is locked/i.test(error.message));
    assert.throws(() => moveObject(db, registry, auth.account, founded.id, placed.id, { x: 13, y: 3, rotation: 0 }), (error) => error.status === 409 && /layout is locked/i.test(error.message));
    db.prepare("UPDATE service_shifts SET state = 'closed', closed_at = ? WHERE id = 'shift_history_lock'").run(Date.now());

    const undoPlace = undoLayout(db, registry, auth.account, founded.id);
    assert.equal(undoPlace.action, "place object");
    assert.deepEqual(comparableLayout(db, registry, founded.id), afterPaint);
    assert.equal(undoPlace.layout.history.canRedo, true);
    assert.ok(!undoPlace.layout.objects.some((object) => object.id === placed.id));

    const undoPaint = undoLayout(db, registry, auth.account, founded.id);
    assert.equal(undoPaint.action, "paint floor");
    assert.deepEqual(comparableLayout(db, registry, founded.id), baseline);

    db.close();
    db = createDatabase(databasePath, registry);
    const redoPaint = redoLayout(db, registry, auth.account, founded.id);
    assert.equal(redoPaint.action, "paint floor");
    assert.deepEqual(comparableLayout(db, registry, founded.id), afterPaint);

    upsertWall(db, registry, auth.account, founded.id, { x: 5, y: 5, edge: "north", wallStyleId: "subway-tile", openingType: "arch", rotation: 0 });
    assert.equal(getLayout(db, registry, founded.id).history.canRedo, false, "a divergent edit must invalidate the redo branch");
    assert.throws(() => redoLayout(db, registry, auth.account, founded.id), (error) => error.status === 409 && /no layout action to redo/i.test(error.message));
    const audit = db.prepare("SELECT category, amount_cents AS amountCents FROM ledger_entries WHERE reference_type = 'layout-history' ORDER BY created_at").all();
    assert.equal(audit.length, 3);
    assert.ok(audit.some((entry) => entry.category === "construction-undo" && entry.amountCents > 0));
    assert.ok(audit.some((entry) => entry.category === "construction-redo" && entry.amountCents < 0));
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

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
    assert.ok(layout.furnitureEffects.inventory.placedCount > 0);
    const paint = paintFloor(db, registry, auth.account, founded.id, { surfaceId: "quarry-tile", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] });
    assert.equal(paint.changed, 2);
    const wall = upsertWall(db, registry, auth.account, founded.id, { x: 5, y: 5, edge: "north", wallStyleId: "subway-tile", openingType: "door", rotation: 0 });
    assert.ok(wall.costCents > 0);
    const placed = placeObject(db, registry, auth.account, founded.id, { definitionId: "table-two", x: 12, y: 2, rotation: 0 });
    assert.ok(placed.id.startsWith("object_"));
    assert.equal(placed.layout.furnitureEffects.inventory.placedCount, layout.furnitureEffects.inventory.placedCount + 1);
    const moved = moveObject(db, registry, auth.account, founded.id, placed.id, { x: 13, y: 3, rotation: 90 });
    assert.equal(moved.id, placed.id);
    const sold = sellObject(db, registry, auth.account, founded.id, placed.id);
    assert.ok(sold.refundCents > 0);
    assert.equal(sold.layout.furnitureEffects.inventory.placedCount, layout.furnitureEffects.inventory.placedCount);
    const expanded = expandRestaurant(db, registry, auth.account, founded.id, { addWidth: 1, addHeight: 0 });
    assert.equal(expanded.width, 25);
    assert.equal(expanded.height, 16);
    layout = getLayout(db, registry, founded.id);
    assert.equal(layout.cells.length, 400);
  } finally {
    db.close();
  }
});

test("varied furniture placement and sale immediately change restaurant effects", () => {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const stamp = Date.now().toString(36).slice(-8);
  const auth = signup(db, registry, { username: `effects_${stamp}`, email: `effects_${stamp}@test.invalid`, displayName: "Effects Owner", password: "Production!234" });
  try {
    const founded = foundRestaurant(db, registry, auth.account, { regionId: "us-mid-atlantic", name: "Effects Test House", concept: registry.content.concepts[0], style: registry.content.styles[0] });
    db.prepare("DELETE FROM object_instances WHERE restaurant_id = ?").run(founded.id);
    const empty = getFurnitureEffects(db, registry, founded.id);
    assert.equal(empty.inventory.placedCount, 0);
    assert.equal(empty.customerHappiness, 50);
    assert.equal(empty.cleaningWorkload, 0);

    const booth = placeObject(db, registry, auth.account, founded.id, { definitionId: "hospitality-dining-booth", x: 1, y: 1, rotation: 0 });
    const furnished = booth.layout.furnitureEffects;
    assert.equal(furnished.inventory.placedCount, 1);
    assert.ok(furnished.customerHappiness > empty.customerHappiness);
    assert.ok(furnished.restaurantRating > empty.restaurantRating);
    assert.ok(furnished.cleaningWorkload > empty.cleaningWorkload);
    assert.ok(furnished.serviceModifiers.seats > 0);

    const basin = placeObject(db, registry, auth.account, founded.id, { definitionId: "essential-mop-basin", x: 8, y: 1, rotation: 0 });
    const varied = basin.layout.furnitureEffects;
    assert.equal(varied.inventory.placedCount, 2);
    assert.ok(varied.serviceModifiers.sanitation > furnished.serviceModifiers.sanitation);
    assert.notEqual(varied.cleaningWorkload, furnished.cleaningWorkload);

    const sold = sellObject(db, registry, auth.account, founded.id, booth.id);
    assert.equal(sold.layout.furnitureEffects.inventory.placedCount, 1);
    assert.ok(sold.layout.furnitureEffects.customerHappiness < varied.customerHappiness);
  } finally {
    db.close();
  }
});

test("only an owner can repair worn and broken furniture with audited treasury spending", () => {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const stamp = Date.now().toString(36).slice(-8);
  const owner = signup(db, registry, { username: `repair_${stamp}`, email: `repair_${stamp}@test.invalid`, displayName: "Repair Owner", password: "Production!234" });
  const outsider = signup(db, registry, { username: `guest_${stamp}`, email: `guest_${stamp}@test.invalid`, displayName: "Other Owner", password: "Production!234" });
  try {
    const founded = foundRestaurant(db, registry, owner.account, { regionId: "us-mid-atlantic", name: "Repair Test House", concept: registry.content.concepts[0], style: registry.content.styles[0] });
    db.prepare("DELETE FROM object_instances WHERE restaurant_id = ?").run(founded.id);
    const brokenPlacement = placeObject(db, registry, owner.account, founded.id, { definitionId: "essential-dining-chair", x: 1, y: 1, rotation: 0 });
    const wornPlacement = placeObject(db, registry, owner.account, founded.id, { definitionId: "craftsman-cafe-two-top", x: 4, y: 1, rotation: 0 });
    db.prepare("UPDATE object_instances SET state = 'broken', wear = 100 WHERE id = ?").run(brokenPlacement.id);
    db.prepare("UPDATE object_instances SET state = 'worn', wear = 55 WHERE id = ?").run(wornPlacement.id);

    const damaged = getFurnitureEffects(db, registry, founded.id);
    assert.equal(damaged.inventory.brokenCount, 1);
    assert.equal(damaged.inventory.wornCount, 2);
    assert.throws(() => repairObject(db, registry, outsider.account, founded.id, brokenPlacement.id), (error) => error.status === 403);

    const brokenDefinition = registry.furnitureById.get("essential-dining-chair");
    const wornDefinition = registry.furnitureById.get("craftsman-cafe-two-top");
    assert.ok(brokenDefinition?.repairCostCents && wornDefinition?.repairCostCents);
    const expectedBrokenCost = brokenDefinition.repairCostCents;
    const expectedWornCost = Math.round(wornDefinition.repairCostCents * 0.55);
    const treasuryBefore = db.prepare("SELECT treasury_cents AS treasuryCents FROM restaurants WHERE id = ?").get(founded.id).treasuryCents;

    const wornRepair = repairObject(db, registry, owner.account, founded.id, wornPlacement.id);
    assert.equal(wornRepair.costCents, expectedWornCost);
    const brokenRepair = repairObject(db, registry, owner.account, founded.id, brokenPlacement.id);
    assert.equal(brokenRepair.costCents, expectedBrokenCost);
    const treasuryAfter = db.prepare("SELECT treasury_cents AS treasuryCents FROM restaurants WHERE id = ?").get(founded.id).treasuryCents;
    assert.equal(treasuryAfter, treasuryBefore - expectedWornCost - expectedBrokenCost);

    const repairedObjects = db.prepare("SELECT id, state, wear FROM object_instances WHERE id IN (?, ?) ORDER BY id").all(brokenPlacement.id, wornPlacement.id);
    assert.ok(repairedObjects.every((object) => object.state === "operational" && object.wear === 0));
    const ledgers = db.prepare("SELECT amount_cents AS amountCents, character_id AS characterId, reference_id AS referenceId FROM ledger_entries WHERE category = 'furniture-repair' ORDER BY created_at").all();
    assert.equal(ledgers.length, 2);
    assert.equal(ledgers.reduce((sum, entry) => sum + entry.amountCents, 0), -expectedWornCost - expectedBrokenCost);
    assert.ok(ledgers.every((entry) => entry.characterId === owner.account.characterId));

    const healthy = brokenRepair.layout.furnitureEffects;
    assert.equal(healthy.inventory.brokenCount, 0);
    assert.equal(healthy.inventory.wornCount, 0);
    assert.ok(healthy.reliabilityRisk < damaged.reliabilityRisk);
    assert.ok(healthy.customerHappiness > damaged.customerHappiness);
    assert.throws(() => repairObject(db, registry, owner.account, founded.id, brokenPlacement.id), (error) => error.status === 409);
  } finally {
    db.close();
  }
});
