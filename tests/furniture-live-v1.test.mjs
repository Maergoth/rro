import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { getFurnitureEffects } from "../dist/server/layout-service.js";
import { LiveService } from "../dist/server/live-service.js";

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const round = (value, precision = 1) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

function fixture() {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const live = new LiveService(db, registry, 10, 5);
  live.ensureNpcShifts();
  const shift = live.listShifts()[0];
  const restaurant = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(shift.restaurantId);
  return { registry, db, live, shift, restaurant };
}

function signupAccount(db, registry, label) {
  const token = randomUUID().slice(0, 8);
  return signup(db, registry, {
    username: `${label.replace(/\W/g, "").slice(0, 8)}_${token}`,
    email: `${label.replace(/\W/g, "").toLowerCase()}_${token}@test.invalid`,
    displayName: label,
    password: "Production!234",
  }).account;
}

function expectedReviewDimensions(effects) {
  const baseline = (primary, secondary, primaryScale, secondaryScale) => round(clamp(3.55 + primary / primaryScale + secondary / secondaryScale, 2.7, 4.5), 2);
  return {
    food: baseline(effects.serviceModifiers.foodQuality, effects.serviceModifiers.kitchenThroughput, 75, 150),
    service: baseline(effects.serviceModifiers.frontOfHouse, effects.dimensions.comfort, 70, 180),
    cleanliness: baseline(effects.dimensions.cleanability, effects.serviceModifiers.sanitation, 75, 100),
    value: baseline(effects.dimensions.comfort, effects.dimensions.reliability, 130, 180),
    ambience: baseline(effects.dimensions.appearance, effects.dimensions.comfort, 65, 180),
  };
}

test("restaurant, shift, snapshot, and party surfaces expose live furniture effects and effective ratings", () => {
  const { registry, db, live, shift, restaurant } = fixture();
  try {
    const effects = getFurnitureEffects(db, registry, restaurant.id);
    const expectedRating = round(clamp(restaurant.rating * 0.72 + effects.restaurantRating * 0.28, 1, 5));
    const expectedHappiness = Math.round(clamp(45 + effects.customerHappiness * 0.5, 45, 95));

    const shiftSurface = live.listShifts().find((entry) => entry.id === shift.id);
    assert.equal(shiftSurface.reviewRating, restaurant.rating);
    assert.equal(shiftSurface.furnitureRating, effects.restaurantRating);
    assert.equal(shiftSurface.rating, expectedRating);
    assert.deepEqual(shiftSurface.furnitureEffects, effects);

    const listSurface = live.listRestaurants(restaurant.region_id).find((entry) => entry.id === restaurant.id);
    const detailSurface = live.getRestaurant(restaurant.id);
    const snapshot = live.snapshot(shift.id);
    for (const surface of [listSurface, detailSurface, snapshot.restaurant]) {
      assert.equal(surface.reviewRating, restaurant.rating);
      assert.equal(surface.furnitureRating, effects.restaurantRating);
      assert.equal(surface.rating, expectedRating);
      assert.deepEqual(surface.furnitureEffects, effects);
    }
    assert.deepEqual(snapshot.layout.furnitureEffects, effects);
    assert.ok(snapshot.parties.length >= 2);
    assert.ok(snapshot.parties.every((party) => party.satisfaction === expectedHappiness));
    assert.ok(snapshot.tasks.some((task) => task.context.arrivalFurnitureHappiness === expectedHappiness));
  } finally {
    live.stop();
    db.close();
  }
});

test("cleanability, reliability, wear, and breakage change visible duty workload and maintenance task volume", () => {
  const { registry, db, live, shift, restaurant } = fixture();
  try {
    const freshSnapshot = live.snapshot(shift.id);
    const freshDishwasher = freshSnapshot.dutySlots.find((slot) => slot.roleId === "dishwasher");
    const freshDishTasks = freshSnapshot.tasks.filter((task) => task.ownerRoleId === "dishwasher").length;
    assert.ok(freshDishwasher);
    assert.ok(Number.isFinite(freshDishwasher.furniturePressure));

    db.prepare("UPDATE object_instances SET wear = 100, state = 'broken' WHERE restaurant_id = ?").run(restaurant.id);
    live.fillRoleQueues(shift.id);
    const brokenSnapshot = live.snapshot(shift.id);
    const brokenDishwasher = brokenSnapshot.dutySlots.find((slot) => slot.roleId === "dishwasher");
    const brokenDishTasks = brokenSnapshot.tasks.filter((task) => task.ownerRoleId === "dishwasher").length;
    assert.ok(brokenDishwasher.workload > freshDishwasher.workload);
    assert.ok(brokenDishwasher.furniturePressure > freshDishwasher.furniturePressure);
    assert.ok(brokenDishTasks > freshDishTasks, "Broken, hard-to-clean inventory should create more role-authentic maintenance work.");
    assert.ok(brokenSnapshot.tasks.some((task) => task.context.furnitureWorkload?.brokenCount > 0));
  } finally {
    live.stop();
    db.close();
  }
});

test("controlled minigame actions receive bounded role and operational furniture support", () => {
  const { registry, db, live, shift, restaurant } = fixture();
  try {
    const account = signupAccount(db, registry, "Furniture Cook");
    db.prepare("INSERT INTO employments (id, character_id, restaurant_id, region_id, role_id, hired_at) VALUES (?, ?, ?, ?, 'cook', ?)")
      .run(randomUUID(), account.characterId, restaurant.id, restaurant.region_id, Date.now());
    const joined = live.join(account, shift.id, { kind: "employee", roleId: "cook" });
    const task = joined.snapshot.tasks.find((entry) => entry.ownerRoleId === "cook");
    assert.ok(task);
    live.handleCommand(account, { id: "furniture-claim", type: "task.claim", shiftId: shift.id, payload: { taskId: task.id } });
    const current = live.snapshot(shift.id).tasks.find((entry) => entry.id === task.id);
    const result = live.handleCommand(account, {
      id: "furniture-action",
      type: "task.action",
      shiftId: shift.id,
      payload: { taskId: task.id, action: current.phase.actions[0] },
    });
    assert.ok(Number.isInteger(result.furnitureModifier));
    assert.ok(result.furnitureModifier >= -10 && result.furnitureModifier <= 10);
    assert.ok(result.furnitureModifier > 0, "Starter kitchen equipment should support cook work.");
    const row = db.prepare("SELECT context_json, history_json FROM service_tasks WHERE id = ?").get(task.id);
    const context = JSON.parse(row.context_json);
    const history = JSON.parse(row.history_json);
    assert.equal(context.furnitureSupport.scoreModifier, result.furnitureModifier);
    assert.ok(context.furnitureSupport.kitchenThroughput > 0);
    assert.equal(history[0].furnitureModifier, result.furnitureModifier);
  } finally {
    live.stop();
    db.close();
  }
});

test("review baselines deterministically reflect ambience, comfort, cleanability, food, and service furniture condition", () => {
  const { registry, db, live, shift, restaurant } = fixture();
  try {
    const parties = db.prepare("SELECT id FROM parties WHERE service_shift_id = ? ORDER BY created_at, id LIMIT 2").all(shift.id);
    assert.equal(parties.length, 2);
    const freshEffects = getFurnitureEffects(db, registry, restaurant.id);
    live.finalizeReview(parties[0].id);
    const freshReview = db.prepare("SELECT dimensions_json FROM restaurant_reviews WHERE party_id = ?").get(parties[0].id);
    assert.deepEqual(JSON.parse(freshReview.dimensions_json), expectedReviewDimensions(freshEffects));

    db.prepare("UPDATE object_instances SET wear = 100, state = 'broken' WHERE restaurant_id = ?").run(restaurant.id);
    const brokenEffects = getFurnitureEffects(db, registry, restaurant.id);
    live.finalizeReview(parties[1].id);
    const brokenReview = db.prepare("SELECT dimensions_json FROM restaurant_reviews WHERE party_id = ?").get(parties[1].id);
    const brokenDimensions = JSON.parse(brokenReview.dimensions_json);
    assert.deepEqual(brokenDimensions, expectedReviewDimensions(brokenEffects));
    const freshDimensions = JSON.parse(freshReview.dimensions_json);
    assert.ok(brokenDimensions.ambience < freshDimensions.ambience);
    assert.ok(brokenDimensions.service < freshDimensions.service);
    assert.ok(brokenDimensions.cleanliness < freshDimensions.cleanliness);
    assert.ok(brokenDimensions.food < freshDimensions.food);
  } finally {
    live.stop();
    db.close();
  }
});

test("shift settlement applies furniture revenue and itemized operating costs while advancing placed, worn, and broken states", () => {
  const { registry, db, live, shift, restaurant } = fixture();
  try {
    const economicItem = registry.content.furniture
      .filter((item) => Number(item.stats.revenue ?? 0) > 0 && Number(item.upkeepCents ?? 0) > 0 && Number(item.wearPerShift ?? 0) > 0)
      .sort((a, b) => Number(b.stats.revenue) - Number(a.stats.revenue))[0];
    assert.ok(economicItem);
    const now = Date.now();
    const insert = db.prepare(`INSERT INTO object_instances
      (id, restaurant_id, definition_id, grid_x, grid_y, rotation, state, wear, placed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, 'placed', ?, ?, ?)`);
    insert.run("wear-to-worn", restaurant.id, economicItem.id, 0, 0, 59.9, now, now);
    insert.run("wear-to-broken", restaurant.id, economicItem.id, 0, 1, 99.9, now, now);
    db.prepare("UPDATE parties SET departed_at = ?, state = 'departed' WHERE service_shift_id = ?").run(now, shift.id);

    const effects = getFurnitureEffects(db, registry, restaurant.id);
    assert.ok(effects.serviceModifiers.revenue > 0);
    assert.ok(effects.inventory.upkeepCentsPerShift > 0);
    assert.ok(effects.inventory.repairReserveCentsPerShift > 0);
    const treasuryBefore = db.prepare("SELECT treasury_cents FROM restaurants WHERE id = ?").get(restaurant.id).treasury_cents;
    live.closeShift(shift.id);
    const treasuryAfter = db.prepare("SELECT treasury_cents FROM restaurants WHERE id = ?").get(restaurant.id).treasury_cents;

    const ledgers = db.prepare("SELECT category, amount_cents FROM ledger_entries WHERE reference_type = 'shift' AND reference_id = ? ORDER BY category").all(shift.id);
    const byCategory = Object.fromEntries(ledgers.map((entry) => [entry.category, entry.amount_cents]));
    assert.ok(byCategory["shift-revenue"] > 0);
    assert.equal(byCategory["furniture-upkeep"], -Math.round(effects.inventory.upkeepCentsPerShift));
    assert.equal(byCategory["furniture-cleaning"], -Math.round(clamp(effects.cleaningWorkload, 0, 500) * 30));
    assert.equal(byCategory["furniture-repair-reserve"], -Math.round(effects.inventory.repairReserveCentsPerShift));
    assert.equal(treasuryAfter - treasuryBefore, ledgers.reduce((sum, entry) => sum + entry.amount_cents, 0));

    const worn = db.prepare("SELECT state, wear FROM object_instances WHERE id = 'wear-to-worn'").get();
    const broken = db.prepare("SELECT state, wear FROM object_instances WHERE id = 'wear-to-broken'").get();
    assert.equal(worn.state, "worn");
    assert.equal(worn.wear, round(59.9 + economicItem.wearPerShift, 3));
    assert.equal(broken.state, "broken");
    assert.equal(broken.wear, 100);
    assert.ok(db.prepare("SELECT 1 FROM object_instances WHERE restaurant_id = ? AND state = 'placed'").get(restaurant.id));
  } finally {
    live.stop();
    db.close();
  }
});

test("shift close rolls back settlement and remains retryable when settlement fails", () => {
  const { db, live, shift, restaurant } = fixture();
  try {
    db.prepare("UPDATE parties SET departed_at = ?, state = 'departed' WHERE service_shift_id = ?").run(Date.now(), shift.id);
    const treasuryBefore = db.prepare("SELECT treasury_cents FROM restaurants WHERE id = ?").get(restaurant.id).treasury_cents;
    const originalAdvanceWear = live.advanceFurnitureWear.bind(live);
    live.advanceFurnitureWear = () => { throw new Error("injected settlement failure"); };
    assert.throws(() => live.closeShift(shift.id), /injected settlement failure/);
    assert.notEqual(db.prepare("SELECT state FROM service_shifts WHERE id = ?").get(shift.id).state, "closed");
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM ledger_entries WHERE reference_type = 'shift' AND reference_id = ?").get(shift.id).count, 0);
    assert.equal(db.prepare("SELECT treasury_cents FROM restaurants WHERE id = ?").get(restaurant.id).treasury_cents, treasuryBefore);

    live.advanceFurnitureWear = originalAdvanceWear;
    live.closeShift(shift.id);
    assert.equal(db.prepare("SELECT state FROM service_shifts WHERE id = ?").get(shift.id).state, "closed");
    const ledgerCount = db.prepare("SELECT COUNT(*) AS count FROM ledger_entries WHERE reference_type = 'shift' AND reference_id = ?").get(shift.id).count;
    assert.ok(ledgerCount >= 2);
    live.closeShift(shift.id);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM ledger_entries WHERE reference_type = 'shift' AND reference_id = ?").get(shift.id).count, ledgerCount);
  } finally {
    live.stop();
    db.close();
  }
});
