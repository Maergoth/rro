import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { aggregateFurnitureEffects } from "../dist/server/furniture-effects.js";

const productionFurniture = JSON.parse(readFileSync(new URL("../packages/game-data/core/furniture-production.json", import.meta.url), "utf8"));

test("production furniture is a broad, one-to-one persistent inventory catalog", () => {
  assert.equal(productionFurniture.length, 210);
  assert.equal(new Set(productionFurniture.map((item) => item.id)).size, productionFurniture.length);
  assert.equal(new Set(productionFurniture.map((item) => item.assetId)).size, productionFurniture.length);
  assert.ok(new Set(productionFurniture.map((item) => item.category)).size >= 7);
  for (const item of productionFurniture) {
    assert.equal(item.inventoryScope, "restaurant");
    assert.equal(item.assetId, `furniture-${item.id}`);
    assert.ok(item.costCents > 0);
    assert.ok(item.breakageHorizonShifts >= 80);
    assert.ok(item.repairCostCents > 0);
    assert.ok(Object.keys(item.roleEffects).length > 0);
    for (const key of ["comfort", "ambience", "cleanability", "reliability"]) assert.ok(Number.isFinite(item.stats[key]), `${item.id}/${key}`);
  }

  const total = (item) => item.stats.comfort + item.stats.ambience + item.stats.cleanability + item.stats.reliability;
  assert.ok(productionFurniture.some((cheap) => productionFurniture.some((dear) => cheap.costCents < dear.costCents && cheap.stats.cleanability > dear.stats.cleanability)));
  assert.ok(productionFurniture.some((cheap) => productionFurniture.some((dear) => cheap.costCents < dear.costCents && total(cheap) > total(dear))));
});

const definitions = [
  {
    id: "chair",
    costCents: 30_000,
    width: 1,
    height: 1,
    durability: 80,
    upkeepCents: 100,
    breakageHorizonShifts: 500,
    repairCostCents: 6_000,
    stats: { comfort: 8, ambience: 5, cleanability: 7, reliability: 9, seats: 1, turnover: 3 },
    roleEffects: { server: 5 },
  },
  {
    id: "range",
    costCents: 300_000,
    width: 3,
    height: 2,
    durability: 85,
    upkeepCents: 800,
    breakageHorizonShifts: 600,
    repairCostCents: 50_000,
    stats: { comfort: 3, ambience: 0, cleanability: 6, reliability: 11, kitchen: 12, quality: 8, capacity: 5, sanitation: 4 },
    roleEffects: { cook: 10, chef: 8 },
  },
];

test("fresh placed furniture affects ratings, happiness, workload, roles, and operating economics", () => {
  const result = aggregateFurnitureEffects(definitions, [
    { definitionId: "chair", wear: 0 },
    { definitionId: "range", wear: 0 },
  ]);

  assert.ok(result.restaurantRating > 3 && result.restaurantRating <= 5);
  assert.ok(result.customerHappiness > 50 && result.customerHappiness <= 100);
  assert.ok(result.cleaningWorkload > 0);
  assert.ok(result.reliabilityRisk >= 0 && result.reliabilityRisk < 10);
  assert.ok(result.serviceModifiers.frontOfHouse > 0);
  assert.ok(result.serviceModifiers.kitchenThroughput > result.serviceModifiers.frontOfHouse);
  assert.equal(result.serviceModifiers.seats, 1);
  assert.ok(result.roleModifiers.server > 0 && result.roleModifiers.cook > 0 && result.roleModifiers.chef > 0);
  assert.deepEqual(result.inventory, {
    placedCount: 2,
    wornCount: 0,
    brokenCount: 0,
    replacementValueCents: 330_000,
    upkeepCentsPerShift: 900,
    repairReserveCentsPerShift: 95,
  });
});

test("duplicate furniture has diminishing rating returns while physical seats remain additive", () => {
  const one = aggregateFurnitureEffects(definitions, [{ definitionId: "chair", wear: 0 }]);
  const four = aggregateFurnitureEffects(definitions, Array.from({ length: 4 }, () => ({ definitionId: "chair", wear: 0 })));

  assert.equal(one.serviceModifiers.seats, 1);
  assert.equal(four.serviceModifiers.seats, 4);
  assert.ok(four.dimensions.comfort > one.dimensions.comfort);
  assert.ok(four.dimensions.comfort < one.dimensions.comfort * 4);
  assert.ok(four.serviceModifiers.turnover < one.serviceModifiers.turnover * 4);
});

test("wear and breakage create visible penalties and repair exposure", () => {
  const fresh = aggregateFurnitureEffects(definitions, [
    { definitionId: "chair", wear: 0 },
    { definitionId: "range", wear: 0 },
  ]);
  const damaged = aggregateFurnitureEffects(definitions, [
    { definitionId: "chair", wear: 80, state: "worn" },
    { definitionId: "range", wear: 100, state: "broken" },
    { definitionId: "not-installed", wear: 20 },
  ]);

  assert.ok(damaged.restaurantRating < fresh.restaurantRating);
  assert.ok(damaged.customerHappiness < fresh.customerHappiness);
  assert.ok(damaged.cleaningWorkload > fresh.cleaningWorkload);
  assert.ok(damaged.reliabilityRisk > fresh.reliabilityRisk);
  assert.ok(damaged.serviceModifiers.kitchenThroughput < fresh.serviceModifiers.kitchenThroughput);
  assert.ok(damaged.inventory.repairReserveCentsPerShift > fresh.inventory.repairReserveCentsPerShift);
  assert.equal(damaged.inventory.wornCount, 2);
  assert.equal(damaged.inventory.brokenCount, 1);
  assert.deepEqual(damaged.unknownDefinitionIds, ["not-installed"]);
});

test("aggregation is deterministic, bounded, and does not mutate inputs", () => {
  const instances = Object.freeze([
    Object.freeze({ definitionId: "chair", wear: -50 }),
    Object.freeze({ definitionId: "range", wear: 500 }),
  ]);
  const first = aggregateFurnitureEffects(definitions, instances);
  const second = aggregateFurnitureEffects(definitions, instances);
  assert.deepEqual(first, second);
  assert.ok(first.restaurantRating >= 1 && first.restaurantRating <= 5);
  assert.ok(first.customerHappiness >= 0 && first.customerHappiness <= 100);
  assert.ok(first.reliabilityRisk >= 0 && first.reliabilityRisk <= 100);
});
