import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const DATA = resolve(ROOT, "packages/game-data");
const read = (path) => JSON.parse(readFileSync(resolve(DATA, path), "utf8"));
const unique = (values, label) => assert.equal(new Set(values).size, values.length, `${label} ids must be unique.`);
const furnitureMounts = new Set(["floor", "wall", "ceiling"]);
const furnitureOccupancies = new Set(["blocking", "nonblocking"]);
const furnitureServiceAccess = new Set(["adjacent", "none"]);
const furnitureWallOpenings = new Set(["solid", "window"]);
const furniturePlacementKeys = new Set(["mount", "occupancy", "serviceAccess", "allowedWallOpenings"]);

function validateFurniturePlacement(item) {
  if (item.placement === undefined) return;
  assert.ok(item.placement && typeof item.placement === "object" && !Array.isArray(item.placement), `${item.id} placement must be an object`);
  for (const key of Object.keys(item.placement)) assert.ok(furniturePlacementKeys.has(key), `${item.id} placement has unknown field ${key}`);
  const { mount, occupancy, serviceAccess } = item.placement;
  assert.ok(furnitureMounts.has(mount), `${item.id} placement mount`);
  assert.ok(furnitureOccupancies.has(occupancy), `${item.id} placement occupancy`);
  assert.ok(furnitureServiceAccess.has(serviceAccess), `${item.id} placement serviceAccess`);
  if (mount !== "floor") assert.equal(occupancy, "nonblocking", `${item.id} ${mount} placement must be nonblocking`);
  const hasWallOpenings = Object.hasOwn(item.placement, "allowedWallOpenings");
  if (mount === "wall") {
    assert.equal(item.height, 1, `${item.id} wall placement height`);
    assert.ok(Array.isArray(item.placement.allowedWallOpenings) && item.placement.allowedWallOpenings.length > 0, `${item.id} wall placement openings`);
    assert.ok(item.placement.allowedWallOpenings.every((opening) => furnitureWallOpenings.has(opening)), `${item.id} wall placement opening value`);
    unique(item.placement.allowedWallOpenings, `${item.id} wall placement opening`);
  } else {
    assert.equal(hasWallOpenings, false, `${item.id} allowedWallOpenings is only valid for wall placement`);
  }
}

const manifest = read("manifest.json");
assert.equal(manifest.schemaVersion, 1);
assert.ok(manifest.packs.some((pack) => pack.id === "core-hospitality" && pack.enabled));
for (const pack of manifest.packs.filter((entry) => entry.enabled)) assert.ok(existsSync(resolve(DATA, pack.directory, "pack.json")), `${pack.id} is missing pack.json.`);

const world = read("core/world.json");
const rules = read("core/world-rules.json");
const roles = read("core/roles.json");
const progression = read("core/role-progression.json");
const activities = read("core/activities.json").activities;
const coreFurniture = read("core/furniture.json");
const productionFurniture = read("core/furniture-production.json");
const seasonalFurniture = read("seasonal/summer-street-fair/furniture.json");
const furniture = [...coreFurniture, ...productionFurniture, ...seasonalFurniture];
const roleEquipment = read("core/role-equipment.json");
const construction = read("core/construction.json");
const appearance = read("core/appearance.json");
const attributes = read("core/attributes.json");

const regions = world.flatMap((country) => country.regions);
const restaurants = regions.flatMap((region) => region.restaurants);
const capacity = regions.reduce((sum, region) => sum + region.capacity, 0);
assert.equal(restaurants.length / capacity, 0.2, "Fresh-world NPC occupancy must be exactly 20%.");
assert.equal(rules.simulation.timeScale, 4);
assert.equal(rules.simulation.restaurantDayRealMinutes, 240);
assert.equal(rules.simulation.recommendedSessionMinutes, 60);
assert.equal((rules.simulation.closesAtGameMinute - rules.simulation.opensAtGameMinute) / rules.simulation.timeScale, rules.simulation.restaurantDayRealMinutes);
assert.equal(construction.grid.defaultWidth, rules.restaurant.gridWidth);
assert.equal(construction.grid.defaultHeight, rules.restaurant.gridHeight);
assert.deepEqual(construction.grid.rotations, [0, 90, 180, 270]);

unique(world.map((value) => value.id), "Country");
unique(regions.map((value) => value.id), "Region");
unique(restaurants.map((value) => value.id), "Restaurant");
unique(roles.map((value) => value.id), "Role");
unique(activities.map((value) => value.id), "Activity");
unique(furniture.map((value) => value.id), "Furniture");
unique(roleEquipment.items.map((value) => value.id), "Role equipment");
unique(roleEquipment.items.map((value) => value.iconId), "Role equipment icon");
unique(roleEquipment.slots.map((value) => value.id), "Role equipment slot");
unique(construction.surfaces.map((value) => value.id), "Surface");
unique(attributes.map((value) => value.id), "Attribute");

const baseRoles = roles.filter((role) => role.kind === "base");
assert.deepEqual(baseRoles.map((role) => role.id).sort(), ["chef", "cook", "dishwasher", "host-busser", "manager", "owner", "server"]);
for (const role of baseRoles) {
  const tree = progression.roles.find((entry) => entry.roleId === role.id);
  assert.ok(tree, `${role.id} needs generated progression.`);
  const skills = tree.fundamentals.length + Object.values(tree.branches).flat().length;
  assert.equal(skills, 28, `${role.id} needs 28 skill nodes.`);
  const roleActivities = activities.filter((activity) => activity.roleId === role.id);
  assert.ok(roleActivities.length >= 10, `${role.id} needs at least ten continuous activities.`);
  const equipmentChoices = roleEquipment.items.filter((item) => item.allowedRoleIds.includes(role.id));
  assert.ok(equipmentChoices.length >= 9, `${role.id} needs at least nine personal equipment/consumable choices.`);
  assert.equal((roleEquipment.roleSlots[role.id] ?? []).length, 4, `${role.id} needs four persistent loadout slots.`);
}
assert.equal(baseRoles.length, 7);
assert.equal(progression.roles.reduce((sum, role) => sum + role.fundamentals.length + Object.values(role.branches).flat().length, 0), 196);
assert.equal(activities.length, 89);
assert.equal(roleEquipment.schemaVersion, 1);
assert.equal(roleEquipment.items.length, 45);
assert.equal(roleEquipment.items.filter((item) => item.kind === "equipment").length, 31);
assert.equal(roleEquipment.items.filter((item) => item.kind === "consumable").length, 14);
for (const activity of activities) {
  assert.equal(activity.phases.length, 3, `${activity.id} must be multi-phase.`);
  assert.ok(activity.phases.every((phase) => Array.isArray(phase.actions) && phase.actions.length === 2));
  assert.ok(["now", "next", "prevent", "admin"].includes(activity.lane));
}
for (const item of furniture) {
  assert.ok(Number.isInteger(item.costCents) && item.costCents >= 0, `${item.id} price`);
  assert.ok(Number.isInteger(item.width) && item.width > 0 && Number.isInteger(item.height) && item.height > 0, `${item.id} footprint`);
  validateFurniturePlacement(item);
  assert.ok(item.stats && Object.keys(item.stats).length > 0, `${item.id} modifiers`);
  assert.ok(Object.values(item.stats).every((value) => Number.isFinite(value)), `${item.id} modifiers must be finite numbers`);
}
assert.ok(furniture.length >= 200, `Production catalog must expose at least 200 total furniture definitions; got ${furniture.length}.`);
assert.ok(productionFurniture.length >= 180, `Generated production furniture must contain at least 180 definitions; got ${productionFurniture.length}.`);
unique(productionFurniture.map((item) => item.name), "Production furniture name");
unique(productionFurniture.map((item) => item.assetId), "Production furniture asset");

const canonicalFurnitureStats = ["comfort", "ambience", "cleanability", "reliability"];
const operationalFurnitureStats = new Set([
  "seats", "turnover", "route", "accuracy", "payment", "forecast", "handoff", "accessibility", "revenue", "quality",
  "kitchen", "capacity", "recovery", "speed", "hold", "consistency", "sanitation", "storage", "organization", "rotation",
  "waste", "breakage", "spill", "safety", "privacy", "noise", "community", "visibility",
]);
const supportedFurnitureRoles = new Set(["manager", "owner", "server", "dishwasher", "chef", "cook", "host-busser"]);
for (const item of productionFurniture) {
  assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${item.id} stable id`);
  assert.equal(item.inventoryScope, "restaurant", `${item.id} persistent inventory scope`);
  assert.equal(item.assetId, `furniture-${item.id}`, `${item.id} must have a one-to-one sprite key`);
  assert.match(item.assetId, /^furniture-[a-z0-9]+(?:-[a-z0-9]+)*$/, `${item.id} asset id`);
  assert.ok(Number.isInteger(item.durability) && item.durability >= 25 && item.durability <= 100, `${item.id} durability`);
  assert.ok(Number.isInteger(item.breakageHorizonShifts) && item.breakageHorizonShifts >= 80 && item.breakageHorizonShifts <= 1200, `${item.id} breakage horizon`);
  assert.ok(Number.isFinite(item.wearPerShift) && item.wearPerShift > 0 && item.wearPerShift <= 2, `${item.id} wear rate`);
  assert.ok(Math.abs(item.wearPerShift - 100 / item.breakageHorizonShifts) <= 0.001, `${item.id} wear rate must match breakage horizon`);
  assert.ok(Number.isInteger(item.upkeepCents) && item.upkeepCents >= 0, `${item.id} upkeep`);
  assert.ok(Number.isInteger(item.repairCostCents) && item.repairCostCents >= 0 && item.repairCostCents <= item.costCents, `${item.id} repair cost`);
  for (const key of canonicalFurnitureStats) {
    assert.ok(Number.isInteger(item.stats[key]) && item.stats[key] >= -8 && item.stats[key] <= 20, `${item.id} ${key}`);
  }
  assert.ok(Object.keys(item.stats).some((key) => operationalFurnitureStats.has(key)), `${item.id} needs a role, service, kitchen, capacity, or guest-facing effect`);
  assert.ok(item.roleEffects && Object.keys(item.roleEffects).length >= 1, `${item.id} role effects`);
  for (const [roleId, value] of Object.entries(item.roleEffects)) {
    assert.ok(supportedFurnitureRoles.has(roleId), `${item.id} has unsupported role effect ${roleId}`);
    assert.ok(Number.isInteger(value) && value >= 1 && value <= 20, `${item.id}/${roleId} role effect`);
  }
}

// Price is intentionally not a one-dimensional upgrade score. Prove the data
// contains real tradeoffs: cheaper pieces can win individual axes and even
// total quality, while the range still includes genuinely stronger pieces.
const qualityTotal = (item) => canonicalFurnitureStats.reduce((sum, key) => sum + item.stats[key], 0);
const qualityTotals = productionFurniture.map(qualityTotal);
assert.ok(Math.max(...qualityTotals) - Math.min(...qualityTotals) >= 20, "Furniture must include meaningful total-quality tiers.");
assert.ok(productionFurniture.some((cheaper) => productionFurniture.some((costlier) => cheaper.costCents < costlier.costCents && cheaper.stats.cleanability > costlier.stats.cleanability)), "Cheaper furniture must sometimes be easier to clean.");
assert.ok(productionFurniture.some((cheaper) => productionFurniture.some((costlier) => cheaper.costCents < costlier.costCents && qualityTotal(cheaper) > qualityTotal(costlier))), "Furniture price must not be a linear total-stat ladder.");
assert.ok(new Set(productionFurniture.map((item) => canonicalFurnitureStats.map((key) => item.stats[key]).join(":"))).size >= 100, "Furniture needs broad canonical stat variety.");
assert.ok(construction.surfaces.length >= 12);
assert.ok(construction.wallStyles.length >= 6);
assert.ok(appearance.outfitSilhouettes.length >= 5);

const events = manifest.packs.filter((pack) => pack.enabled && existsSync(resolve(DATA, pack.directory, "events.json"))).flatMap((pack) => read(`${pack.directory}/events.json`));
for (const event of events) {
  assert.ok(Number.isFinite(Date.parse(event.startsAt)) && Number.isFinite(Date.parse(event.endsAt)));
  assert.ok(Date.parse(event.startsAt) < Date.parse(event.endsAt));
}

console.log(JSON.stringify({ ok: true, countries: world.length, regions: regions.length, seededRestaurants: restaurants.length, capacity, occupancy: restaurants.length / capacity, roles: baseRoles.length, skills: 196, activities: activities.length, furniture: furniture.length, roleEquipment: roleEquipment.items.length, surfaces: construction.surfaces.length, events: events.length }, null, 2));
