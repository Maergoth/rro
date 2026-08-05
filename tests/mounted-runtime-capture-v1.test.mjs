import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const capture = read("apps/client-godot/tests/isometric_runtime_capture.gd");
const runtime = read("apps/client-godot/scripts/restaurant_floor.gd");
const binding = read("apps/client-godot/scripts/furniture_art_binding.gd");
const helper = read("apps/client-godot/scripts/furniture_mount_placement.gd");
const catalog = JSON.parse(read("packages/game-data/core/furniture.json"));

const definitionBlock = capture.match(/const DEFINITIONS := \[([\s\S]*?)\n\]/);
assert.ok(definitionBlock);
const definitions = definitionBlock[1].trim().split("\n")
  .map((line) => JSON.parse(line.trim().replace(/,$/, "")));
const definitionsByAsset = new Map(definitions.map((definition) => [definition.assetId, definition]));

const floorPositionBlock = capture.match(/const FLOOR_POSITIONS := \{([\s\S]*?)\n\}/);
assert.ok(floorPositionBlock);
const floorPositions = new Map([...floorPositionBlock[1].matchAll(/"([^"]+)": Vector2i\((\d+), (\d+)\)/g)]
  .map((match) => [match[1], { x: Number(match[2]), y: Number(match[3]) }]));

const mountedPositionBlock = capture.match(/const MOUNTED_POSITIONS_BY_ROTATION := \{([\s\S]*?)\n\}/);
assert.ok(mountedPositionBlock);
const mountedPositions = new Map([...mountedPositionBlock[1].matchAll(/\n\t(\d+): \{([^}]+)\}/g)].map((rotationMatch) => [
  Number(rotationMatch[1]),
  new Map([...rotationMatch[2].matchAll(/"([^"]+)": Vector2i\((\d+), (\d+)\)/g)]
    .map((positionMatch) => [positionMatch[1], { x: Number(positionMatch[2]), y: Number(positionMatch[3]) }])),
]));

const edgeByRotation = { 0: "north", 90: "east", 180: "south", 270: "west" };
const footprintSize = (definition, rotation) => {
  if (definition.placement.mount === "wall") {
    return ["north", "south"].includes(edgeByRotation[rotation])
      ? { width: definition.width, height: 1 }
      : { width: 1, height: definition.width };
  }
  return [90, 270].includes(rotation)
    ? { width: definition.height, height: definition.width }
    : { width: definition.width, height: definition.height };
};
const cellsFor = (definition, position, rotation) => {
  const size = footprintSize(definition, rotation);
  return Array.from({ length: size.height }, (_, y) => Array.from({ length: size.width }, (__, x) => ({
    x: position.x + x,
    y: position.y + y,
  }))).flat();
};
const wallKey = (x, y, edge) => `${x}:${y}:${edge}`;
const walls = new Map();
for (let x = 0; x < 30; x += 1) {
  walls.set(wallKey(x, 0, "north"), "solid");
  walls.set(wallKey(x, 22, "south"), [14, 15].includes(x) ? "arch" : "solid");
}
for (let y = 0; y < 23; y += 1) {
  walls.set(wallKey(0, y, "west"), "solid");
  walls.set(wallKey(29, y, "east"), [8, 9].includes(y) ? "service-door" : "solid");
}
const mirroredWallKey = (x, y, edge) => {
  if (edge === "north") return wallKey(x, y - 1, "south");
  if (edge === "east") return wallKey(x + 1, y, "west");
  if (edge === "south") return wallKey(x, y + 1, "north");
  return wallKey(x - 1, y, "east");
};

test("native mounted review uses exactly the published nonblocking placement contracts", () => {
  const mounted = definitions.filter((definition) => (definition.placement?.mount ?? "floor") !== "floor");
  assert.deepEqual(mounted.map(({ assetId }) => assetId).sort(), ["local-art", "pendants", "plants"]);
  for (const definition of mounted) {
    const catalogDefinition = catalog.find(({ id }) => id === definition.id);
    assert.deepEqual(definition.placement, catalogDefinition.placement);
    assert.equal(definition.placement.occupancy, "nonblocking");
    assert.equal(definition.placement.serviceAccess, "none");
  }
  assert.match(capture, /const MOUNTED_ASSET_IDS := \["local-art", "pendants", "plants"\]/);
  assert.match(capture, /mounted_fixture_failure\(restaurant_view, objects\)/);
  assert.match(capture, /placement_preview_is_valid\(object, definition, str\(object\.get\("id", ""\)\)\)/);
});

test("every mounted four-rotation fixture placement is in bounds, wall-supported, and collision-free in its own mount layer", () => {
  assert.deepEqual([...mountedPositions.keys()], [0, 90, 180, 270]);
  for (const [rotation, positions] of mountedPositions) {
    assert.deepEqual([...positions.keys()].sort(), ["local-art", "pendants", "plants"]);
    const occupiedByMount = new Map();
    for (const [assetId, position] of positions) {
      const definition = definitionsByAsset.get(assetId);
      const cells = cellsFor(definition, position, rotation);
      for (const cell of cells) {
        assert.ok(cell.x >= 0 && cell.y >= 0 && cell.x < 30 && cell.y < 23, `${assetId}/${rotation}: out of bounds`);
        const occupied = occupiedByMount.get(definition.placement.mount) ?? new Set();
        assert.equal(occupied.has(`${cell.x}:${cell.y}`), false, `${assetId}/${rotation}: same-mount overlap`);
        occupied.add(`${cell.x}:${cell.y}`);
        occupiedByMount.set(definition.placement.mount, occupied);
        if (definition.placement.mount === "wall") {
          const edge = edgeByRotation[rotation];
          const opening = walls.get(wallKey(cell.x, cell.y, edge)) ?? walls.get(mirroredWallKey(cell.x, cell.y, edge));
          assert.equal(opening, "solid", `${assetId}/${rotation}: incomplete or illegal supporting wall`);
        }
      }
    }
  }
  assert.match(capture, /"mountedPlacements": mounted_placement_records\(objects\)/);
  assert.match(capture, /"supportEdge"/);
});

test("mounted directional rendering never takes the floor-contact target path", () => {
  const branch = runtime.match(/if mount == "floor":([\s\S]*?)\n\t\t\telse:([\s\S]*?)\n\t\t\tdraw_texture_rect/);
  assert.ok(branch, "runtime must have explicit floor and mounted directional branches");
  assert.match(branch[1], /IsometricGridProjection\.floor_contact_target/);
  assert.match(branch[1], /draw_rect_for_floor_contact_target/);
  assert.doesNotMatch(branch[2], /floor_contact|draw_rect_for_floor_contact/);
  assert.match(branch[2], /object_art_mount_anchor_screen/);
  assert.match(branch[2], /object_art_mount_visual_extent/);
  assert.match(branch[2], /draw_rect_for_mount_anchor/);
  assert.match(binding, /separate entry point prevents mounted objects from silently falling back/);
});

test("wall-plane and ceiling anchors use mount footprints for scale and deterministic depth", () => {
  assert.match(runtime, /return FurnitureMountPlacement\.mount_depth_anchor_grid\(object, definition\)/);
  assert.match(runtime, /var grid_anchor := FurnitureMountPlacement\.mount_anchor_grid\(object, definition\)/);
  assert.match(runtime, /FurnitureMountPlacement\.wall_room_anchor_grid\(object, definition, WALL_ART_ROOM_INSET_CELLS\)/);
  assert.match(runtime, /cell_pixels \* WALL_ART_ELEVATION_CELLS/);
  assert.match(runtime, /cell_pixels \* CEILING_ART_ELEVATION_CELLS/);
  assert.match(runtime, /segment\[0\]\.distance_to\(segment\[1\]\)/);
  assert.match(runtime, /polygon_bounds\(footprint_polygon\(footprint\)\)\.size/);
  assert.match(helper, /if mount == "wall":[\s\S]*wall_edge_segment/);
  assert.match(helper, /if mount == "ceiling":\s*return footprint_value\.get_center\(\)/);

  const basisLength = Math.hypot(20, 10);
  for (const assetId of ["local-art", "plants"]) {
    const definition = definitionsByAsset.get(assetId);
    const projectedSpans = [0, 90, 180, 270].map(() => definition.width * basisLength);
    assert.ok(projectedSpans.every((span) => Math.abs(span - projectedSpans[0]) < 1e-9), `${assetId}: wall scale changed by rotation`);
  }
  const pendants = definitionsByAsset.get("pendants");
  assert.deepEqual([0, 90, 180, 270].map((rotation) => footprintSize(pendants, rotation)), [
    { width: 2, height: 1 },
    { width: 1, height: 2 },
    { width: 2, height: 1 },
    { width: 1, height: 2 },
  ]);
});

test("solid walls render coherent vertical isometric planes while openings retain visible gaps", () => {
  const planeHeight = Number(runtime.match(/const WALL_PLANE_HEIGHT_CELLS := ([\d.]+)/)?.[1]);
  const artHeight = Number(runtime.match(/const WALL_ART_ELEVATION_CELLS := ([\d.]+)/)?.[1]);
  assert.ok(planeHeight >= 1.5, "wall plane must read as a vertical architectural surface at gameplay scale");
  assert.ok(planeHeight > artHeight, "wall-mounted art needs backing above its visual anchor");
  assert.match(runtime, /func wall_plane_point\(start: Vector2, finish: Vector2, along: float, height: float\)/);
  assert.match(runtime, /Vector2\(0\.0, cell_pixels \* WALL_PLANE_HEIGHT_CELLS/);
  assert.match(runtime, /func draw_wall_plane_section\(/);
  assert.match(runtime, /draw_colored_polygon\(panel, color\)/);
  assert.match(runtime, /if opening == "solid":\s*draw_wall_plane_section\(start, finish, 0\.0, 1\.0, 0\.0, 1\.0, plane_color\)/);
  assert.match(runtime, /draw_wall_plane_section\(start, finish, 0\.0, 0\.28, 0\.0, 1\.0, plane_color\)/);
  assert.match(runtime, /draw_wall_plane_section\(start, finish, 0\.72, 1\.0, 0\.0, 1\.0, plane_color\)/);
  assert.match(runtime, /if opening == "window":[\s\S]*0\.0, 0\.30[\s\S]*0\.72, 1\.0/);
  assert.match(runtime, /var header_bottom := 0\.62 if opening == "arch" else 0\.72/);
  assert.match(runtime, /do not claim|construction texture/i, "runtime comments must keep geometric wall planes distinct from missing construction art");

  const origin = { x: 900, y: 70 };
  const project = ({ x, y }) => ({ x: origin.x + 20 * x - 20 * y, y: origin.y + 10 * x + 10 * y });
  const edges = [
    [{ x: 3, y: 0 }, { x: 4, y: 0 }],
    [{ x: 30, y: 3 }, { x: 30, y: 4 }],
    [{ x: 3, y: 23 }, { x: 4, y: 23 }],
    [{ x: 0, y: 3 }, { x: 0, y: 4 }],
  ];
  for (const [startGrid, finishGrid] of edges) {
    const start = project(startGrid);
    const finish = project(finishGrid);
    const topStart = { x: start.x, y: start.y - 40 * planeHeight };
    const topFinish = { x: finish.x, y: finish.y - 40 * planeHeight };
    assert.equal(topStart.x, start.x);
    assert.equal(topFinish.x, finish.x);
    assert.ok(topStart.y < start.y && topFinish.y < finish.y);
    assert.ok(Math.hypot(finish.x - start.x, finish.y - start.y) > 0);
  }
});

test("wall-mounted art is inset to the room side and sorts after every supporting plane segment", () => {
  assert.match(helper, /static func wall_room_normal_grid\(rotation_degrees: int\)/);
  assert.match(helper, /"north":\s*return Vector2\(0\.0, 1\.0\)/);
  assert.match(helper, /"east":\s*return Vector2\(-1\.0, 0\.0\)/);
  assert.match(helper, /"south":\s*return Vector2\(0\.0, -1\.0\)/);
  assert.match(helper, /"west":\s*return Vector2\(1\.0, 0\.0\)/);
  assert.match(helper, /static func mount_depth_anchor_grid\(/);
  assert.match(helper, /return segment\[1\] if second_depth >= first_depth else segment\[0\]/);

  for (const [rotation, positions] of mountedPositions) {
    for (const assetId of ["local-art", "plants"]) {
      const definition = definitionsByAsset.get(assetId);
      const position = positions.get(assetId);
      const cells = cellsFor(definition, position, rotation);
      const edge = edgeByRotation[rotation];
      const supportDepths = cells.map((cell) => {
        if (edge === "north") return cell.x + 0.5 + cell.y;
        if (edge === "east") return cell.x + 1 + cell.y + 0.5;
        if (edge === "south") return cell.x + 0.5 + cell.y + 1;
        return cell.x + cell.y + 0.5;
      });
      const frontDepth = edge === "north" || edge === "south"
        ? position.x + definition.width + position.y + (edge === "south" ? 1 : 0)
        : position.x + (edge === "east" ? 1 : 0) + position.y + definition.width;
      assert.ok(supportDepths.every((depth) => frontDepth > depth), `${assetId}/${rotation}: art can sort behind its supporting plane`);
    }
  }
});

test("ceiling pendants share the walnut table footprint and render as an overhead layer", () => {
  const tablePosition = floorPositions.get("furniture-walnut-four-top");
  assert.deepEqual(tablePosition, { x: 5, y: 16 }, "accepted table position must remain frozen");
  const tableCells = new Set(Array.from({ length: 3 }, (_, y) => Array.from({ length: 3 }, (__, x) => `${tablePosition.x + x}:${tablePosition.y + y}`)).flat());
  const pendants = definitionsByAsset.get("pendants");
  for (const [rotation, positions] of mountedPositions) {
    const pendantPosition = positions.get("pendants");
    assert.deepEqual(pendantPosition, tablePosition, `pendants/${rotation}: ceiling anchor lost its table context`);
    assert.ok(cellsFor(pendants, pendantPosition, rotation).every(({ x, y }) => tableCells.has(`${x}:${y}`)));
  }
  const ceilingElevation = Number(runtime.match(/const CEILING_ART_ELEVATION_CELLS := ([\d.]+)/)?.[1]);
  const wallHeight = Number(runtime.match(/const WALL_PLANE_HEIGHT_CELLS := ([\d.]+)/)?.[1]);
  assert.ok(ceilingElevation > wallHeight, "pendant bowls must visibly clear the wall plane");
  assert.match(runtime, /return CEILING_WORLD_DRAW_LAYER if FurnitureMountPlacement\.mount_for\(definition\) == "ceiling" else 0/);
  assert.match(runtime, /if left_layer != right_layer:\s*return left_layer < right_layer/);
  assert.match(capture, /floor\/ceiling namespaces while giving the pendants/);
});
