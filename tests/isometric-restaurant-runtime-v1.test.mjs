import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const runtime = read("apps/client-godot/scripts/restaurant_floor.gd");
const binding = read("apps/client-godot/scripts/furniture_art_binding.gd");
const contract = JSON.parse(read("apps/client-godot/furniture-art-runtime.json"));

const basisX = (pixels) => ({ x: pixels / 2, y: pixels / 4 });
const basisY = (pixels) => ({ x: -pixels / 2, y: pixels / 4 });
const project = (point, origin, pixels) => ({
  x: origin.x + basisX(pixels).x * point.x + basisY(pixels).x * point.y,
  y: origin.y + basisX(pixels).y * point.x + basisY(pixels).y * point.y,
});
const inverse = (point, origin, pixels) => {
  const local = { x: point.x - origin.x, y: point.y - origin.y };
  return {
    x: local.x / pixels + local.y / (pixels / 2),
    y: -local.x / pixels + local.y / (pixels / 2),
  };
};
const distance = (left, right) => Math.hypot(left.x - right.x, left.y - right.y);

test("restaurant floor delegates every grid transform and pick to the elevated isometric projection", () => {
  assert.match(runtime, /var cell_pixels := 64\.0/);
  assert.match(runtime, /return IsometricGridProjection\.grid_to_screen\(point, camera_offset, cell_pixels\)/);
  assert.match(runtime, /return IsometricGridProjection\.screen_to_cell\(point, camera_offset, cell_pixels\)/);
  assert.match(runtime, /return IsometricGridProjection\.screen_to_grid_fractional\(point, camera_offset, cell_pixels\)/);
  assert.match(runtime, /IsometricGridProjection\.cell_polygon/);
  assert.match(runtime, /IsometricGridProjection\.footprint_corners/);
  assert.doesNotMatch(runtime, /camera_offset \+ point \* cell_pixels/);
  assert.doesNotMatch(runtime, /\(point - camera_offset\) \/ cell_pixels/);
  assert.equal(contract.capability.runtimeProjection, "elevated-orthographic-isometric-grid");
  assert.equal(contract.capability.projectionIntegrated, true);
  assert.equal(contract.capability.runtimeCompositeAccepted, true);
  assert.equal(contract.runtimeCompositeAcceptedAssetIds.length, 37);
  assert.deepEqual(contract.runtimeCompositeBlockedAssetIds, []);
  assert.deepEqual(contract.runtimeCompositePendingAssetIds, []);
});

test("zoom keeps the exact fractional world point under the cursor", () => {
  for (const oldPixels of [24, 64, 96, 128]) {
    for (const factor of [0.89, 1.12]) {
      const newPixels = Math.max(24, Math.min(128, oldPixels * factor));
      const origin = { x: 440, y: 55 };
      const cursor = { x: 317.25, y: 249.75 };
      const world = inverse(cursor, origin, oldPixels);
      const projectedAfterZoom = project(world, origin, newPixels);
      const nextOrigin = {
        x: origin.x + cursor.x - projectedAfterZoom.x,
        y: origin.y + cursor.y - projectedAfterZoom.y,
      };
      assert.ok(distance(project(world, nextOrigin, newPixels), cursor) < 1e-9);
    }
  }
  assert.match(runtime, /var before := screen_to_grid_fractional\(event\.position\)/);
  assert.match(runtime, /camera_offset \+= event\.position - grid_to_screen\(before\)/);
});

test("builder floor paint and wall picking use diamonds and projected edge segments", () => {
  assert.match(runtime, /draw_colored_polygon\(polygon, color\)/);
  assert.match(runtime, /func nearest_cell_edge\(cell: Vector2i, screen_point: Vector2\)/);
  assert.match(runtime, /"north": \[polygon\[0\], polygon\[1\]\]/);
  assert.match(runtime, /"east": \[polygon\[1\], polygon\[2\]\]/);
  assert.match(runtime, /"south": \[polygon\[2\], polygon\[3\]\]/);
  assert.match(runtime, /"west": \[polygon\[3\], polygon\[0\]\]/);
  assert.match(runtime, /var edge := nearest_cell_edge\(cell, event\.position\)/);
  assert.doesNotMatch(runtime, /var local: Vector2 = \(event\.position - cell_origin\) \/ cell_pixels/);
});

test("directional sprites use distinct projected floor and raised mount anchors without stretching", () => {
  assert.match(runtime, /IsometricGridProjection\.floor_contact_target\(footprint, camera_offset, cell_pixels\)/);
  assert.match(runtime, /FurnitureArtBinding\.draw_rect_for_floor_contact_target\(texture\.get_size\(\), floor_contact, bounds\.size\)/);
  assert.match(runtime, /FurnitureArtBinding\.draw_rect_for_mount_anchor\(texture\.get_size\(\), mount_anchor, mount_extent\)/);
  assert.match(runtime, /object_art_mount_anchor_screen\(object, definition\)/);
  assert.match(runtime, /object_art_mount_visual_extent\(object, definition, footprint\)/);
  assert.match(binding, /var uniform_scale := maxf\(visual_extent\.x, visual_extent\.y\) \/ maxf\(canvas_width, canvas_height\)/);
  assert.match(binding, /return Rect2\(screen_anchor - source_pivot \* uniform_scale, texture_size \* uniform_scale\)/);
  assert.doesNotMatch(binding, /Vector2\([^\n]*\/ canvas_width[^\n]*\/ canvas_height/);
});

test("avatar headings are projected through the same isometric basis and all world actors share a depth list", () => {
  assert.match(runtime, /IsometricGridProjection\.basis_x\(cell_pixels\) \* direction\.x \+ IsometricGridProjection\.basis_y\(cell_pixels\) \* direction\.y/);
  assert.match(runtime, /world_items\.sort_custom\(world_item_draws_before\)/);
  assert.match(runtime, /"wall": draw_wall\(item\.data\)/);
  assert.match(runtime, /"object": draw_object\(item\.data\)/);
  assert.match(runtime, /"incident": draw_incident\(item\.data\)/);
  assert.match(runtime, /"party": draw_party\(item\.data\)/);
  assert.match(runtime, /"avatar": draw_avatar\(item\.data\)/);
});

test("live service keeps furniture art legible while build mode retains exact object labels", () => {
  assert.match(runtime, /if build_mode and cell_pixels > 30:/);
  assert.match(runtime, /elif condition in \["worn", "broken"\]:/);
  assert.match(runtime, /var marker_color := Color\("d9a44b"\) if condition == "worn" else Color\("c6544f"\)/);
});
