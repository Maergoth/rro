import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const DATA = resolve(ROOT, "packages/game-data");
const read = (path) => JSON.parse(readFileSync(resolve(DATA, path), "utf8"));
const unique = (values, label) => assert.equal(new Set(values).size, values.length, `${label} ids must be unique.`);

const manifest = read("manifest.json");
assert.equal(manifest.schemaVersion, 1);
assert.ok(manifest.packs.some((pack) => pack.id === "core-hospitality" && pack.enabled));
for (const pack of manifest.packs.filter((entry) => entry.enabled)) assert.ok(existsSync(resolve(DATA, pack.directory, "pack.json")), `${pack.id} is missing pack.json.`);

const world = read("core/world.json");
const rules = read("core/world-rules.json");
const roles = read("core/roles.json");
const progression = read("core/role-progression.json");
const activities = read("core/activities.json").activities;
const furniture = [...read("core/furniture.json"), ...read("core/furniture-production.json"), ...read("seasonal/summer-street-fair/furniture.json")];
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
}
assert.equal(baseRoles.length, 7);
assert.equal(progression.roles.reduce((sum, role) => sum + role.fundamentals.length + Object.values(role.branches).flat().length, 0), 196);
assert.equal(activities.length, 89);
for (const activity of activities) {
  assert.equal(activity.phases.length, 3, `${activity.id} must be multi-phase.`);
  assert.ok(activity.phases.every((phase) => Array.isArray(phase.actions) && phase.actions.length === 2));
  assert.ok(["now", "next", "prevent", "admin"].includes(activity.lane));
}
for (const item of furniture) {
  assert.ok(Number.isInteger(item.costCents) && item.costCents >= 0, `${item.id} price`);
  assert.ok(Number.isInteger(item.width) && item.width > 0 && Number.isInteger(item.height) && item.height > 0, `${item.id} footprint`);
  assert.ok(item.stats && Object.keys(item.stats).length > 0, `${item.id} modifiers`);
}
assert.ok(construction.surfaces.length >= 12);
assert.ok(construction.wallStyles.length >= 6);
assert.ok(appearance.outfitSilhouettes.length >= 5);

const events = manifest.packs.filter((pack) => pack.enabled && existsSync(resolve(DATA, pack.directory, "events.json"))).flatMap((pack) => read(`${pack.directory}/events.json`));
for (const event of events) {
  assert.ok(Number.isFinite(Date.parse(event.startsAt)) && Number.isFinite(Date.parse(event.endsAt)));
  assert.ok(Date.parse(event.startsAt) < Date.parse(event.endsAt));
}

console.log(JSON.stringify({ ok: true, countries: world.length, regions: regions.length, seededRestaurants: restaurants.length, capacity, occupancy: restaurants.length / capacity, roles: baseRoles.length, skills: 196, activities: activities.length, furniture: furniture.length, surfaces: construction.surfaces.length, events: events.length }, null, 2));
