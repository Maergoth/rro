import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const helper = read("apps/client-godot/scripts/furniture_mount_placement.gd");
const runtime = read("apps/client-godot/scripts/restaurant_floor.gd");
const palette = read("apps/client-godot/scripts/builder_palette.gd");
const serverContent = read("apps/server/src/content.ts");
const serverLayout = read("apps/server/src/layout-service.ts");
const furniture = JSON.parse(read("packages/game-data/core/furniture.json"));

const edgeByRotation = { 0: "north", 90: "east", 180: "south", 270: "west" };
const rotationByEdge = Object.fromEntries(Object.entries(edgeByRotation).map(([rotation, edge]) => [edge, Number(rotation)]));
const canonicalRotation = (rotation) => {
  const normalized = ((rotation % 360) + 360) % 360;
  return Object.hasOwn(edgeByRotation, normalized) ? normalized : 0;
};
const mountFor = (definition) => definition.placement?.mount ?? "floor";
const footprintSize = (definition, rotation) => {
  const width = Math.max(1, definition.width ?? 1);
  const height = Math.max(1, definition.height ?? 1);
  const canonical = canonicalRotation(rotation);
  if (mountFor(definition) === "wall") {
    return ["north", "south"].includes(edgeByRotation[canonical]) ? { width, height: 1 } : { width: 1, height: width };
  }
  return [90, 270].includes(canonical) ? { width: height, height: width } : { width, height };
};
const footprintCells = (definition, placement) => {
  const size = footprintSize(definition, placement.rotation);
  return Array.from({ length: size.height }, (_, yOffset) =>
    Array.from({ length: size.width }, (_, xOffset) => ({ x: placement.x + xOffset, y: placement.y + yOffset }))).flat();
};
const wallAnchor = (cell, edge, span, gridSize) => {
  const safeSpan = Math.max(1, span);
  const beforeCenter = Math.floor((safeSpan - 1) / 2);
  const anchor = { ...cell };
  if (["north", "south"].includes(edge)) anchor.x = Math.max(0, Math.min(gridSize.x - safeSpan, cell.x - beforeCenter));
  else anchor.y = Math.max(0, Math.min(gridSize.y - safeSpan, cell.y - beforeCenter));
  return anchor;
};
const wallPlacement = (definition, cell, edge, gridSize) => ({
  ...wallAnchor(cell, edge, definition.width, gridSize),
  rotation: rotationByEdge[edge],
});
const wallSegment = (definition, placement) => {
  const { x, y } = placement;
  switch (edgeByRotation[placement.rotation]) {
    case "north": return [{ x, y }, { x: x + definition.width, y }];
    case "east": return [{ x: x + 1, y }, { x: x + 1, y: y + definition.width }];
    case "south": return [{ x, y: y + 1 }, { x: x + definition.width, y: y + 1 }];
    case "west": return [{ x, y }, { x, y: y + definition.width }];
    default: throw new Error("unreachable rotation");
  }
};

test("Godot freezes the same canonical wall-edge rotation contract as server authority", () => {
  assert.match(serverContent, /0: "north",\s*90: "east",\s*180: "south",\s*270: "west"/s);
  assert.match(serverLayout, /function wallMountEdge\(rotation: number\)/);
  assert.match(serverLayout, /FURNITURE_WALL_EDGE_BY_ROTATION\[rotation/);
  assert.match(helper, /const WALL_EDGE_BY_ROTATION := \{\s*0: "north",\s*90: "east",\s*180: "south",\s*270: "west"/s);
  assert.match(helper, /const WALL_ROTATION_BY_EDGE := \{\s*"north": 0,\s*"east": 90,\s*"south": 180,\s*"west": 270/s);
  for (const [rotation, edge] of Object.entries(edgeByRotation)) {
    assert.equal(rotationByEdge[edge], Number(rotation));
    assert.equal(edgeByRotation[canonicalRotation(Number(rotation) + 360)], edge);
  }
});

test("wall and ceiling footprints match persisted anchor/rotation semantics at every direction", () => {
  const byId = new Map(furniture.map((definition) => [definition.id, definition]));
  assert.deepEqual([...byId.values()].filter((definition) => mountFor(definition) === "wall").map(({ id }) => id).sort(), ["local-art", "plants"]);
  assert.deepEqual([...byId.values()].filter((definition) => mountFor(definition) === "ceiling").map(({ id }) => id), ["pendants"]);

  const localArt = byId.get("local-art");
  const expectedWallCells = [
    [{ x: 4, y: 0, rotation: 0 }, [{ x: 4, y: 0 }, { x: 5, y: 0 }], [{ x: 4, y: 0 }, { x: 6, y: 0 }]],
    [{ x: 23, y: 4, rotation: 90 }, [{ x: 23, y: 4 }, { x: 23, y: 5 }], [{ x: 24, y: 4 }, { x: 24, y: 6 }]],
    [{ x: 4, y: 15, rotation: 180 }, [{ x: 4, y: 15 }, { x: 5, y: 15 }], [{ x: 4, y: 16 }, { x: 6, y: 16 }]],
    [{ x: 0, y: 4, rotation: 270 }, [{ x: 0, y: 4 }, { x: 0, y: 5 }], [{ x: 0, y: 4 }, { x: 0, y: 6 }]],
  ];
  for (const [placement, cells, segment] of expectedWallCells) {
    assert.deepEqual(footprintCells(localArt, placement), cells);
    assert.deepEqual(wallSegment(localArt, placement), segment);
  }

  const pendants = byId.get("pendants");
  assert.deepEqual(footprintSize(pendants, 0), { width: 2, height: 1 });
  assert.deepEqual(footprintSize(pendants, 90), { width: 1, height: 2 });
  assert.deepEqual(footprintSize(pendants, 180), { width: 2, height: 1 });
  assert.deepEqual(footprintSize(pendants, 270), { width: 1, height: 2 });
  assert.match(helper, /if mount_for\(definition\) == "wall":/);
  assert.match(helper, /if rotation in \[90, 270\]:/);
});

test("wall snapping produces a canonical minimum-cell anchor and clamps the complete span", () => {
  const byId = new Map(furniture.map((definition) => [definition.id, definition]));
  const localArt = byId.get("local-art");
  const plants = byId.get("plants");
  const gridSize = { x: 24, y: 16 };

  assert.deepEqual(wallPlacement(localArt, { x: 4, y: 0 }, "north", gridSize), { x: 4, y: 0, rotation: 0 });
  assert.deepEqual(wallPlacement(localArt, { x: 23, y: 4 }, "east", gridSize), { x: 23, y: 4, rotation: 90 });
  assert.deepEqual(wallPlacement(plants, { x: 8, y: 0 }, "north", gridSize), { x: 7, y: 0, rotation: 0 });
  assert.deepEqual(wallPlacement(plants, { x: 0, y: 7 }, "west", gridSize), { x: 0, y: 6, rotation: 270 });
  assert.deepEqual(wallPlacement(plants, { x: 23, y: 15 }, "south", gridSize), { x: 21, y: 15, rotation: 180 });
  assert.deepEqual(wallPlacement(plants, { x: 23, y: 15 }, "east", gridSize), { x: 23, y: 13, rotation: 90 });
  assert.match(helper, /floori\(float\(safe_span - 1\) \/ 2\.0\)/);
  assert.match(helper, /clampi\(cell\.x - before_center, 0, maxi\(0, grid_size\.x - safe_span\)\)/);
  assert.match(helper, /clampi\(cell\.y - before_center, 0, maxi\(0, grid_size\.y - safe_span\)\)/);
});

test("restaurant builder integrates mount-aware preview, support picking, and unchanged authority payload fields", () => {
  assert.match(runtime, /return FurnitureMountPlacement\.footprint\(object, definition\)/);
  assert.match(runtime, /var edge := nearest_cell_edge\(cell, screen_point\)/);
  assert.match(runtime, /FurnitureMountPlacement\.wall_placement_for_cell\(cell, edge, definition, layout_grid_size\(\)\)/);
  assert.match(runtime, /func placement_preview_is_valid\(/);
  assert.match(runtime, /allowedWallOpenings/);
  assert.match(runtime, /wall_opening_at\(cell\.x, cell\.y, edge\)/);
  assert.match(runtime, /FurnitureMountPlacement\.mount_for\(placed_definition\) != mount/);
  assert.match(runtime, /distance_to_segment\(screen_point, segment\[0\], segment\[1\]\)/);
  assert.match(runtime, /"definitionId": selected_catalog_id,\s*"x": int\(placement\.get\("x", cell\.x\)\),\s*"y": int\(placement\.get\("y", cell\.y\)\),\s*"rotation": int\(placement\.get\("rotation", build_rotation\)\)/s);
  assert.match(runtime, /build_action_requested\.emit\("move", \{\s*"id": dragging_object\.get\("id", ""\),\s*"x": int\(placement\.get\("x", cell\.x\)\),\s*"y": int\(placement\.get\("y", cell\.y\)\),\s*"rotation": int\(placement\.get\("rotation", build_rotation\)\)/s);
  assert.match(runtime, /server still prices, validates,[\s\S]*accepts or rejects every unchanged placement payload/);
  assert.match(palette, /Wall decor snaps to the pointed cell edge/);
  assert.match(palette, /ceiling footprint/);
});

test("floor geometry and rendering retain the legacy rectangular rotation path", () => {
  const floorDefinition = { id: "legacy-floor", width: 2, height: 3 };
  assert.equal(mountFor(floorDefinition), "floor");
  assert.deepEqual(footprintSize(floorDefinition, 0), { width: 2, height: 3 });
  assert.deepEqual(footprintSize(floorDefinition, 90), { width: 3, height: 2 });
  assert.deepEqual(footprintCells(floorDefinition, { x: 5, y: 7, rotation: 0 }), [
    { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 9 }, { x: 6, y: 9 },
  ]);
  assert.match(helper, /return str\(placement\.get\("mount", "floor"\)\)/);
  assert.match(runtime, /if mount == "floor":\s*draw_colored_polygon\(polygon, color\)\s*draw_polyline\(closed_polygon\(polygon\), Color\(color\)\.lightened\(\.25\), 2\.0, true\)/s);
  assert.match(runtime, /var floor_contact := IsometricGridProjection\.floor_contact_target\(footprint, camera_offset, cell_pixels\)/);
  assert.match(runtime, /if mount != "floor":\s*floor_contact = object_art_contact_screen/s);
});
