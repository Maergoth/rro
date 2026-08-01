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
const required = ["main.gd", "api_client.gd", "realtime_client.gd", "world_globe.gd", "restaurant_floor.gd", "task_panel.gd", "minigame_stage.gd", "builder_palette.gd"];
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
for (const capability of ["show_login", "show_world", "show_live_shifts", "show_shift", "show_my_restaurant", "show_character", "show_skills", "guest.challenge"]) assert.ok(main.includes(capability), `Native client is missing ${capability}.`);
const floor = readFileSync(resolve(CLIENT, "scripts/restaurant_floor.gd"), "utf8");
for (const interaction of ["MOUSE_BUTTON_RIGHT", "MOUSE_BUTTON_MIDDLE", "build_action_requested", "movement_input", "draw_incident", "draw_avatar"]) assert.ok(floor.includes(interaction), `Floor implementation is missing ${interaction}.`);
const minigames = readFileSync(resolve(CLIENT, "scripts/minigame_stage.gd"), "utf8");
for (const grammar of ["dialogue", "orchestration", "allocation", "scheduling", "evidence", "diagnosis", "memory", "precision", "packing", "route", "process", "construction"]) assert.ok(minigames.includes(`draw_${grammar}`), `Minigame grammar ${grammar} is missing.`);

const svgs = walk(resolve(CLIENT, "assets")).filter((path) => extname(path) === ".svg");
assert.ok(svgs.length >= 10, "At least ten individual native SVG assets are required.");
assert.equal(walk(CLIENT).filter((path) => /\.(png|jpe?g|webp)$/i.test(path)).length, 0, "The V1 client must not ship a baked restaurant/world background.");

console.log(JSON.stringify({ ok: true, engine: "Godot 4.4+", scripts: scripts.length, globalClasses: classNames.length, analyzerErrors: errors.length, analyzerWarnings: warnings.length, modularSvgAssets: svgs.length, minigameGrammars: 12, bakedBackgrounds: 0 }, null, 2));
