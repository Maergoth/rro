import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("client bindings preserve each rendered item and movement sends an explicit stop", () => {
  const taskPanel = read("apps/client-godot/scripts/task_panel.gd");
  const builder = read("apps/client-godot/scripts/builder_palette.gd");
  const main = read("apps/client-godot/scripts/main.gd");
  const floor = read("apps/client-godot/scripts/restaurant_floor.gd");
  assert.match(taskPanel, /select_task\.bind\(task\.duplicate\(true\)\)/);
  assert.doesNotMatch(taskPanel, /pressed\.connect\(func\(\) -> void: select_task\(task\)\)/);
  assert.match(builder, /select_catalog\.bind\("object", item_id/);
  assert.match(main, /set_home_region\.bind\(rid\)/);
  assert.match(main, /open_region\.bind\(selected_region\)/);
  assert.match(main, /Visit live shift as a guest/);
  assert.match(main, /Found a Restaurant/);
  assert.match(floor, /movement_input\.emit\(Vector2\.ZERO\)/);
  assert.match(floor, /direction != last_sent_direction/);
});

test("packaged local server remains loopback-only", () => {
  const config = JSON.parse(read("config/server.v1.json"));
  assert.equal(config.host, "127.0.0.1");
});
