import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { loadContent } from "../dist/server/content.js";

test("V1 content compiles to the production baseline", () => {
  const registry = loadContent();
  const baseRoles = registry.content.roles.filter((role) => role.kind === "base");
  assert.equal(registry.manifest.protocol, "rro.v1");
  assert.equal(baseRoles.length, 7);
  assert.equal(baseRoles.reduce((sum, role) => sum + role.skills.length, 0), 196);
  assert.equal(registry.content.activities.length, 89);
  assert.equal(registry.content.furniture.length, 229);
  assert.equal(registry.content.roleEquipment.items.length, 45);
  assert.equal(registry.manifest.counts.roleEquipment, 45);
  assert.ok(registry.content.construction.surfaces.length >= 12);
  assert.ok(registry.content.events.length >= 1);
  for (const role of baseRoles) {
    assert.equal(role.skills.length, 28, `${role.id} progression depth`);
    assert.ok(role.activityIds.length >= 10, `${role.id} continuous activity breadth`);
  }
  for (const activity of registry.content.activities) {
    assert.equal(activity.phases.length, 3);
    assert.equal(activity.successActions.length, 3);
    assert.equal(activity.riskActions.length, 3);
    assert.ok(activity.phases.every((phase) => phase.actions.length === 2));
  }
});

test("the persistent world starts at exactly twenty percent NPC occupancy", () => {
  const world = JSON.parse(readFileSync(new URL("../packages/game-data/core/world.json", import.meta.url), "utf8"));
  let capacity = 0;
  let seededRestaurants = 0;
  let regions = 0;
  for (const country of world) {
    for (const region of country.regions) {
      regions += 1;
      capacity += region.capacity;
      seededRestaurants += region.restaurants.length;
    }
  }
  assert.equal(world.length, 6);
  assert.equal(regions, 13);
  assert.equal(seededRestaurants / capacity, 0.2);
});
