import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../apps/client-godot/scripts/isometric_grid_projection.gd", import.meta.url), "utf8");

const DESIGN_CELL_PIXELS = 64;
const HALF_HEIGHT_RATIO = 0.25;
const EPSILON = 1e-9;

const add = (left, right) => ({ x: left.x + right.x, y: left.y + right.y });
const scale = (point, factor) => ({ x: point.x * factor, y: point.y * factor });
const near = (left, right, message) => {
  assert.ok(Math.abs(left.x - right.x) <= EPSILON, `${message}: x ${left.x} != ${right.x}`);
  assert.ok(Math.abs(left.y - right.y) <= EPSILON, `${message}: y ${left.y} != ${right.y}`);
};
const basisX = (cellPixels = DESIGN_CELL_PIXELS) => ({ x: cellPixels / 2, y: cellPixels * HALF_HEIGHT_RATIO });
const basisY = (cellPixels = DESIGN_CELL_PIXELS) => ({ x: -cellPixels / 2, y: cellPixels * HALF_HEIGHT_RATIO });
const gridToScreen = (point, origin = { x: 0, y: 0 }, cellPixels = DESIGN_CELL_PIXELS) =>
  add(origin, add(scale(basisX(cellPixels), point.x), scale(basisY(cellPixels), point.y)));
const screenToGridFractional = (point, origin = { x: 0, y: 0 }, cellPixels = DESIGN_CELL_PIXELS) => {
  const local = { x: point.x - origin.x, y: point.y - origin.y };
  return {
    x: local.x / cellPixels + local.y / (cellPixels * 0.5),
    y: -local.x / cellPixels + local.y / (cellPixels * 0.5),
  };
};
const screenToCell = (point, origin, cellPixels) => {
  const grid = screenToGridFractional(point, origin, cellPixels);
  return { x: Math.floor(grid.x), y: Math.floor(grid.y) };
};
const screenToCellInBounds = (point, gridSize, origin, cellPixels) => {
  const cell = screenToCell(point, origin, cellPixels);
  return cell.x < 0 || cell.y < 0 || cell.x >= gridSize.x || cell.y >= gridSize.y ? { x: -1, y: -1 } : cell;
};
const corners = (footprint, origin = { x: 0, y: 0 }, cellPixels = DESIGN_CELL_PIXELS) => [
  gridToScreen({ x: footprint.x, y: footprint.y }, origin, cellPixels),
  gridToScreen({ x: footprint.x + footprint.width, y: footprint.y }, origin, cellPixels),
  gridToScreen({ x: footprint.x + footprint.width, y: footprint.y + footprint.height }, origin, cellPixels),
  gridToScreen({ x: footprint.x, y: footprint.y + footprint.height }, origin, cellPixels),
];
const depthKey = (footprint, stableId) => {
  const x = footprint.x + footprint.width;
  const y = footprint.y + footprint.height;
  return { groundDepth: x + y, screenLateral: x - y, stableId };
};
const compareDepth = (left, right) =>
  left.groundDepth - right.groundDepth || left.screenLateral - right.screenLateral || left.stableId.localeCompare(right.stableId);

test("projection helper freezes the elevated 64x32 orthographic camera basis and complete API", () => {
  assert.match(source, /class_name IsometricGridProjection/);
  assert.match(source, /const DESIGN_CELL_PIXELS := 64\.0/);
  assert.match(source, /const HALF_HEIGHT_RATIO := 0\.25/);
  for (const method of [
    "basis_x", "basis_y", "grid_to_screen", "screen_to_grid_fractional", "screen_to_cell",
    "screen_to_cell_in_bounds", "footprint_corners", "cell_polygon", "floor_contact_target",
    "depth_key", "depth_key_draws_before",
  ]) assert.match(source, new RegExp(`static func ${method}\\(`), `missing ${method}`);
  assert.match(source, /64x32 pixel \(2:1\) ground diamond/);
  assert.match(source, /World \+X \(east\).*\(32, 16\)/s);
  assert.match(source, /world \+Y \(south\).*\(-32, 16\)/s);
  assert.match(source, /common source pivot at \(313\.5,[\s\S]*590\)/);
  assert.match(source, /return grid_to_screen\(footprint\.end, screen_origin, cell_pixels\)/);
});

test("grid and screen conversions round-trip exhaustively across positions, fractions, origins, and zooms", () => {
  const origins = [{ x: 0, y: 0 }, { x: 55, y: 55 }, { x: -127.25, y: 913.5 }];
  const zooms = [18, 34, 64, 76, 128];
  const fractions = [0, 0.125, 0.25, 0.5, 0.875, 0.999];
  for (const origin of origins) {
    for (const zoom of zooms) {
      for (let x = -20; x <= 20; x += 1) {
        for (let y = -20; y <= 20; y += 1) {
          for (const fraction of fractions) {
            const grid = { x: x + fraction, y: y + fractions[fractions.length - 1 - fractions.indexOf(fraction)] };
            const screen = gridToScreen(grid, origin, zoom);
            near(screenToGridFractional(screen, origin, zoom), grid, `round trip ${JSON.stringify({ origin, zoom, grid })}`);
          }
        }
      }
    }
  }
});

test("cardinal grid steps map to fixed elevated isometric screen axes at every zoom", () => {
  const directions = {
    north: { grid: { x: 0, y: -1 }, expected: (zoom) => ({ x: zoom / 2, y: -zoom / 4 }) },
    east: { grid: { x: 1, y: 0 }, expected: (zoom) => ({ x: zoom / 2, y: zoom / 4 }) },
    south: { grid: { x: 0, y: 1 }, expected: (zoom) => ({ x: -zoom / 2, y: zoom / 4 }) },
    west: { grid: { x: -1, y: 0 }, expected: (zoom) => ({ x: -zoom / 2, y: -zoom / 4 }) },
  };
  for (const zoom of [18, 34, 64, 76]) {
    for (const [name, direction] of Object.entries(directions)) {
      near(gridToScreen(direction.grid, { x: 0, y: 0 }, zoom), direction.expected(zoom), `${name} at ${zoom}`);
    }
    near(add(basisX(zoom), basisY(zoom)), { x: 0, y: zoom / 2 }, `south corner at ${zoom}`);
  }
});

test("inverse picking selects every cell interior and applies deterministic half-open edges", () => {
  const gridSize = { x: 24, y: 18 };
  const origins = [{ x: 600, y: 72 }, { x: -21.5, y: 44.25 }];
  for (const origin of origins) {
    for (const zoom of [18, 34, 64, 76]) {
      for (let x = 0; x < gridSize.x; x += 1) {
        for (let y = 0; y < gridSize.y; y += 1) {
          for (const interior of [{ x: 0.001, y: 0.001 }, { x: 0.5, y: 0.5 }, { x: 0.999, y: 0.999 }]) {
            const screen = gridToScreen({ x: x + interior.x, y: y + interior.y }, origin, zoom);
            assert.deepEqual(screenToCell(screen, origin, zoom), { x, y });
            assert.deepEqual(screenToCellInBounds(screen, gridSize, origin, zoom), { x, y });
          }
        }
      }
      assert.deepEqual(screenToCell(gridToScreen({ x: 7, y: 11 }, origin, zoom), origin, zoom), { x: 7, y: 11 });
      assert.deepEqual(screenToCell(gridToScreen({ x: -0.001, y: 4.5 }, origin, zoom), origin, zoom), { x: -1, y: 4 });
      for (const outside of [{ x: -0.001, y: 4.5 }, { x: 24, y: 4.5 }, { x: 4.5, y: -0.001 }, { x: 4.5, y: 18 }]) {
        const screen = gridToScreen(outside, origin, zoom);
        assert.deepEqual(screenToCellInBounds(screen, gridSize, origin, zoom), { x: -1, y: -1 });
      }
    }
  }
});

test("footprint polygons preserve all projected corners, area, winding, and south floor contact", () => {
  const footprints = [
    { x: 0, y: 0, width: 1, height: 1 },
    { x: 3, y: 5, width: 2, height: 4 },
    { x: -2.5, y: 8.25, width: 7.5, height: 1.25 },
  ];
  for (const footprint of footprints) {
    for (const zoom of [18, 34, 64, 76]) {
      const polygon = corners(footprint, { x: 91, y: -13 }, zoom);
      assert.equal(polygon.length, 4);
      const crossSum = polygon.reduce((sum, point, index) => {
        const next = polygon[(index + 1) % polygon.length];
        return sum + point.x * next.y - next.x * point.y;
      }, 0);
      assert.ok(crossSum > 0, "north/east/south/west order must be clockwise in screen coordinates");
      const expectedArea = footprint.width * footprint.height * zoom * zoom / 4;
      assert.ok(Math.abs(crossSum / 2 - expectedArea) <= EPSILON, `projected footprint area ${crossSum / 2}`);
      const contact = gridToScreen({ x: footprint.x + footprint.width, y: footprint.y + footprint.height }, { x: 91, y: -13 }, zoom);
      near(polygon[2], contact, "floor-contact target must be the south/front corner");
      assert.equal(Math.max(...polygon.map((point) => point.y)), contact.y);
    }
  }
});

test("stable depth keys follow projected ground Y, then screen X, then instance ID", () => {
  const entries = [
    { footprint: { x: 4, y: 1, width: 1, height: 1 }, id: "z" },
    { footprint: { x: 1, y: 4, width: 1, height: 1 }, id: "z" },
    { footprint: { x: 2, y: 2, width: 1, height: 1 }, id: "b" },
    { footprint: { x: 2, y: 2, width: 1, height: 1 }, id: "a" },
    { footprint: { x: 0, y: 0, width: 1, height: 1 }, id: "late" },
  ];
  const sorted = entries.map((entry) => ({ ...entry, key: depthKey(entry.footprint, entry.id) })).sort((a, b) => compareDepth(a.key, b.key));
  assert.deepEqual(sorted.map((entry) => entry.id), ["late", "a", "b", "z", "z"]);
  assert.deepEqual(sorted.slice(3).map((entry) => entry.footprint.x), [1, 4], "same-depth objects draw left-to-right");
  for (const entry of entries) {
    const contact = gridToScreen({
      x: entry.footprint.x + entry.footprint.width,
      y: entry.footprint.y + entry.footprint.height,
    });
    const key = depthKey(entry.footprint, entry.id);
    assert.equal(contact.y, key.groundDepth * 16);
    assert.equal(contact.x, key.screenLateral * 32);
  }
  assert.match(source, /return left_depth < right_depth/);
  assert.match(source, /return left_lateral < right_lateral/);
  assert.match(source, /stableId.*< str\(right\.get\("stableId"/s);
});
