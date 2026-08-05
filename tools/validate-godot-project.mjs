import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import { AnalysisHandle } from "@gdscript-analyzer/core";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const CLIENT = resolve(ROOT, "apps/client-godot");
const walk = (directory) => readdirSync(directory).flatMap((name) => {
  const path = resolve(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

assert.ok(existsSync(resolve(CLIENT, "project.godot")), "Godot project.godot is missing.");
assert.ok(existsSync(resolve(CLIENT, "main.tscn")), "Godot main scene is missing.");
const project = readFileSync(resolve(CLIENT, "project.godot"), "utf8");
assert.match(project, /run\/main_scene="res:\/\/main\.tscn"/);
assert.match(project, /config\/features=PackedStringArray\("4\.4"/);
assert.doesNotMatch(project, /WebView|JavaScript|browser/i);

const scripts = walk(resolve(CLIENT, "scripts")).filter((path) => extname(path) === ".gd");
const required = ["main.gd", "api_client.gd", "realtime_client.gd", "world_globe.gd", "restaurant_floor.gd", "task_panel.gd", "minigame_stage.gd", "builder_palette.gd", "inventory_panel.gd"];
for (const name of required) assert.ok(scripts.some((p) => p.endsWith(`/${name}`) || p.endsWith(`\\${name}`)), `Missing ${name}.`);

function validateBalanced(source, label) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const opening = new Set(Object.values(pairs));
  const stack = [];
  let quote = "";
  let escaped = false;
  let comment = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (comment) { if (character === "\n") comment = false; continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (character === "\\") { escaped = true; continue; }
      if (character === quote) quote = "";
      continue;
    }
    if (character === "#") { comment = true; continue; }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (opening.has(character)) stack.push({ character, index });
    else if (pairs[character]) {
      const found = stack.pop();
      assert.equal(found?.character, pairs[character], `${label} has an unbalanced ${character} near byte ${index}.`);
    }
  }
  assert.equal(quote, "", `${label} has an unterminated string.`);
  assert.equal(stack.length, 0, `${label} has unclosed delimiters.`);
}

const classNames = [];
const analyzer = new AnalysisHandle();
analyzer.setProjectConfig(project);
for (const path of scripts) {
  const label = relative(ROOT, path);
  const source = readFileSync(path, "utf8");
  validateBalanced(source, label);
  assert.doesNotMatch(source, /\b(eval|OS\.execute|JavaScriptBridge)\b/, `${label} uses a disallowed dynamic/browser escape hatch.`);
  assert.doesNotMatch(source, /\t +\S/, `${label} mixes tabs and spaces at indentation boundaries.`);
  for (const match of source.matchAll(/^class_name\s+([A-Za-z_][A-Za-z0-9_]*)/gm)) classNames.push(match[1]);
  analyzer.openDocument(pathToFileURL(path).href, source, `res://${relative(CLIENT, path).replaceAll("\\", "/")}`);
}
assert.equal(new Set(classNames).size, classNames.length, "Godot global class names must be unique.");
const diagnostics = scripts.flatMap((path) => analyzer.diagnostics(pathToFileURL(path).href).map((diagnostic) => ({ file: relative(CLIENT, path), ...diagnostic })));
const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === "warning");
assert.deepEqual(errors, [], `GDScript analyzer errors:\n${errors.map((error) => `${error.file}: ${error.code} — ${error.message}`).join("\n")}`);
assert.deepEqual(warnings, [], `GDScript analyzer warnings:\n${warnings.map((warning) => `${warning.file}: ${warning.code} — ${warning.message}`).join("\n")}`);

const main = readFileSync(resolve(CLIENT, "scripts/main.gd"), "utf8");
for (const capability of ["show_login", "show_home", "show_find_work", "show_shift", "show_my_restaurant", "show_character", "show_skills", "show_inventory", "send_guest_challenge", "targetTaskId", "dimension", "intensity", "repair_selected_builder_object", "guest.challenge"]) assert.ok(main.includes(capability), `Native client is missing ${capability}.`);
const floor = readFileSync(resolve(CLIENT, "scripts/restaurant_floor.gd"), "utf8");
for (const interaction of ["MOUSE_BUTTON_RIGHT", "MOUSE_BUTTON_MIDDLE", "build_action_requested", "movement_input", "draw_incident", "draw_avatar"]) assert.ok(floor.includes(interaction), `Floor implementation is missing ${interaction}.`);
const builder = readFileSync(resolve(CLIENT, "scripts/builder_palette.gd"), "utf8");
for (const interaction of ["repair_selected_requested", "wear", "state"]) assert.ok(builder.includes(interaction), `Builder implementation is missing ${interaction}.`);
const minigames = readFileSync(resolve(CLIENT, "scripts/minigame_stage.gd"), "utf8");
for (const grammar of ["dialogue", "orchestration", "allocation", "scheduling", "evidence", "diagnosis", "memory", "precision", "packing", "route", "process", "construction"]) assert.ok(minigames.includes(`draw_${grammar}`), `Minigame grammar ${grammar} is missing.`);

const svgs = walk(resolve(CLIENT, "assets")).filter((path) => extname(path) === ".svg");
assert.ok(svgs.length >= 10, "At least ten individual native SVG assets are required.");
const rasterAssets = walk(resolve(CLIENT, "assets")).filter((path) => /\.(png|jpe?g|webp)$/i.test(path));
const approvedRasterRoots = [
  resolve(CLIENT, "assets/objects/generated"),
  resolve(CLIENT, "assets/objects/directional"),
  resolve(CLIENT, "assets/characters"),
  resolve(CLIENT, "assets/construction"),
  resolve(CLIENT, "assets/environment"),
  resolve(CLIENT, "assets/items"),
  resolve(CLIENT, "assets/ui"),
  resolve(CLIENT, "assets/world"),
];
const unscopedRasters = rasterAssets.filter((path) => !approvedRasterRoots.some((root) => path.startsWith(`${root}/`) || path.startsWith(`${root}\\`)));
assert.deepEqual(unscopedRasters, [], "Raster art must remain inside an explicit modular object, character, construction, environment, item, UI, or world-art root; baked restaurant backgrounds are forbidden.");
const coreFurniture = JSON.parse(readFileSync(resolve(ROOT, "packages/game-data/core/furniture.json"), "utf8"));
for (const item of coreFurniture) {
  assert.ok(existsSync(resolve(CLIENT, "assets/objects/generated", `${item.id}.png`)), `Core furniture ${item.id} is missing its individual production sprite.`);
}

const dataRoot = resolve(ROOT, "packages/game-data");
const contentManifest = JSON.parse(readFileSync(resolve(dataRoot, "manifest.json"), "utf8"));
const furnitureById = new Map();
for (const pack of contentManifest.packs.filter((entry) => entry.enabled)) {
  const directory = resolve(dataRoot, pack.directory);
  for (const fileName of ["furniture.json", "furniture-production.json"]) {
    const path = resolve(directory, fileName);
    if (!existsSync(path)) continue;
    for (const item of JSON.parse(readFileSync(path, "utf8"))) furnitureById.set(item.id, item);
  }
}
const generatedFurnitureRoot = resolve(CLIENT, "assets/objects/generated");
const furnitureWithArtwork = [...furnitureById.values()].filter((item) => {
  const candidates = [...new Set([item.assetId, item.id].filter(Boolean))];
  return candidates.some((candidate) => existsSync(resolve(generatedFurnitureRoot, `${candidate}.png`)));
});
const roleEquipment = JSON.parse(readFileSync(resolve(dataRoot, "core/role-equipment.json"), "utf8"));
const roleEquipmentWithArtwork = roleEquipment.items.filter((item) => {
  const fileName = String(item.iconId).replaceAll(".", "-").replaceAll("/", "-");
  return existsSync(resolve(CLIENT, "assets/items", `${fileName}.png`));
});

const progressDocument = readFileSync(resolve(ROOT, "docs/ART_PROGRESS.md"), "utf8");
const progressMatch = progressDocument.match(/<!-- ART_LEDGER_JSON_BEGIN -->\r?\n```json\r?\n([\s\S]+?)\r?\n```\r?\n<!-- ART_LEDGER_JSON_END -->/);
assert.ok(progressMatch, "ART_PROGRESS.md is missing its machine-readable ledger block.");
const artLedger = JSON.parse(progressMatch[1]);
const furnitureSummary = artLedger.summaries.find((entry) => entry.lane === "Furniture directional sets");
const equipmentSummary = artLedger.summaries.find((entry) => entry.lane === "Equipment inventory icons");
assert.ok(furnitureSummary && equipmentSummary, "ART_PROGRESS.md is missing required furniture/equipment summaries.");

const furnitureArtwork = {
  catalogTotal: furnitureById.size,
  legacyReferenceSprites: furnitureWithArtwork.length,
  directionalSetsPresent: furnitureSummary.present,
  directionalSelectionBound: artLedger.runtimeCapabilities.directionalFurniture.directionalTextureSelection,
  projectionAligned: artLedger.runtimeCapabilities.directionalFurniture.projectionAligned,
  runtimeCompositeAccepted: artLedger.runtimeCapabilities.directionalFurniture.runtimeCompositeAccepted,
  sourceAccepted: furnitureSummary.sourceAccepted,
  remoteVerified: furnitureSummary.remoteVerified,
  productionComplete: furnitureSummary.productionComplete,
  remainingDirectionalSets: furnitureById.size - furnitureSummary.present,
  remainingProductionComplete: furnitureById.size - furnitureSummary.productionComplete,
};
const roleEquipmentArtwork = {
  catalogTotal: roleEquipment.items.length,
  filesPresent: roleEquipmentWithArtwork.length,
  sourceAccepted: equipmentSummary.sourceAccepted,
  remoteVerified: equipmentSummary.remoteVerified,
  productionComplete: equipmentSummary.productionComplete,
  remainingProductionComplete: roleEquipment.items.length - equipmentSummary.productionComplete,
  proceduralFallbacks: roleEquipment.items.length - roleEquipmentWithArtwork.length,
};

const artProduction = JSON.parse(readFileSync(resolve(ROOT, "planning/art-production.json"), "utf8"));
assert.equal(artProduction.schemaVersion, 1, "Art-production queue has an unsupported schema.");
assert.equal(artProduction.furniture.length, furnitureById.size, "Art-production queue must cover every furniture ID.");
assert.equal(artProduction.roleItems.length, roleEquipment.items.length, "Art-production queue must cover every role-item icon ID.");
assert.equal(artProduction.counts.furniture.generated, furnitureArtwork.legacyReferenceSprites, "Art-production furniture reference status is stale; run npm run generate:art.");
assert.equal(artProduction.counts.furniture.remaining, furnitureArtwork.catalogTotal - furnitureArtwork.legacyReferenceSprites, "Art-production furniture reference queue is stale; run npm run generate:art.");
assert.equal(artProduction.counts.roleItems.generated, roleEquipmentArtwork.filesPresent, "Art-production role-item file status is stale; run npm run generate:art.");
assert.equal(artProduction.counts.roleItems.remaining, roleEquipmentArtwork.catalogTotal - roleEquipmentArtwork.filesPresent, "Art-production role-item file queue is stale; run npm run generate:art.");

console.log(JSON.stringify({ ok: true, engine: "Godot 4.4+", scripts: scripts.length, globalClasses: classNames.length, analyzerErrors: errors.length, analyzerWarnings: warnings.length, modularSvgAssets: svgs.length, modularRasterAssets: rasterAssets.length, coreFurnitureSprites: coreFurniture.length, furnitureArtwork, roleEquipmentArtwork, artProductionQueue: artProduction.furniture.length + artProduction.roleItems.length, minigameGrammars: 12, bakedBackgrounds: 0 }, null, 2));
