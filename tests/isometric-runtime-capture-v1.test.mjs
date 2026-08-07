import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const capture = read("apps/client-godot/tests/isometric_runtime_capture.gd");
const workflow = read(".github/workflows/ci.yml");
const contract = JSON.parse(read("apps/client-godot/furniture-art-runtime.json"));
const validator = read("tools/validate-godot-project.mjs");
const restaurantFloor = read("apps/client-godot/scripts/restaurant_floor.gd");
const projection = read("apps/client-godot/scripts/isometric_grid_projection.gd");
const furnitureCatalog = [
  ...JSON.parse(read("packages/game-data/core/furniture.json")),
  ...JSON.parse(read("packages/game-data/core/furniture-production.json")),
];

test("native Godot QA fixture renders every accepted directional furniture identity in all four rotations", () => {
  const definitionBlock = capture.match(/const DEFINITIONS := \[([\s\S]*?)\n\]/);
  assert.ok(definitionBlock, "the native fixture must declare reviewed definitions");
  const definitions = definitionBlock[1].trim().split("\n")
    .map((line) => JSON.parse(line.trim().replace(/,$/, "")));
  const fixtureIds = definitions.map((definition) => definition.assetId);
  const floorPositionBlock = capture.match(/const FLOOR_POSITIONS := \{([\s\S]*?)\n\}/);
  assert.ok(floorPositionBlock, "the native fixture must preserve reviewed floor positions");
  const floorPositions = new Map([...floorPositionBlock[1].matchAll(/"([^"]+)": Vector2i\((\d+), (\d+)\)/g)]
    .map((match) => [match[1], { x: Number(match[2]), y: Number(match[3]) }]));
  assert.deepEqual(fixtureIds, contract.acceptedDirectionalAssetIds);
  assert.equal(new Set(fixtureIds).size, fixtureIds.length);
  assert.equal(floorPositions.size, 28, "all source-accepted floor identities retain explicit positions");
  assert.deepEqual(Object.fromEntries(floorPositions), {
    banquette: { x: 2, y: 2 },
    booth: { x: 9, y: 2 },
    "dish-machine": { x: 15, y: 2 },
    espresso: { x: 21, y: 2 },
    "furniture-banquette-section": { x: 4, y: 6 },
    "furniture-commercial-chair": { x: 10, y: 6 },
    "furniture-convection-oven": { x: 14, y: 16 },
    "furniture-dry-storage-rack": { x: 24, y: 8 },
    "furniture-expo-pass-heated": { x: 3, y: 14 },
    "furniture-host-stand-pro": { x: 16, y: 6 },
    "furniture-oak-two-top": { x: 22, y: 6 },
    "furniture-plancha-commercial": { x: 18, y: 1 },
    "furniture-pos-terminal": { x: 2, y: 12 },
    "furniture-premium-chair": { x: 8, y: 12 },
    "furniture-prep-table-refrigerated": { x: 14, y: 8 },
    "furniture-server-station-pro": { x: 14, y: 12 },
    "furniture-six-burner-range": { x: 20, y: 12 },
    "furniture-walkin-rack": { x: 1, y: 8 },
    "furniture-walnut-four-top": { x: 5, y: 16 },
    "host-stand": { x: 11, y: 16 },
    "mop-sink": { x: 23, y: 16 },
    pass: { x: 8, y: 20 },
    prep: { x: 2, y: 20 },
    range: { x: 1, y: 16 },
    recycling: { x: 25, y: 12 },
    "service-station": { x: 26, y: 2 },
    "table-four": { x: 26, y: 6 },
    "table-two": { x: 27, y: 16 },
  });
  for (const definition of definitions) {
    const catalogDefinition = furnitureCatalog.find((item) => item.id === definition.id);
    assert.ok(catalogDefinition, `${definition.id}: native fixture definition is not in the catalog`);
    assert.deepEqual({
      id: definition.id,
      assetId: definition.assetId,
      name: definition.name,
      category: definition.category,
      width: definition.width,
      height: definition.height,
    }, {
      id: catalogDefinition.id,
      assetId: catalogDefinition.assetId ?? catalogDefinition.id,
      name: catalogDefinition.name,
      category: catalogDefinition.category,
      width: catalogDefinition.width,
      height: catalogDefinition.height,
    });
    const fixturePlacement = definition.placement ?? { mount: "floor", occupancy: "blocking", serviceAccess: "adjacent" };
    assert.deepEqual(fixturePlacement, catalogDefinition.placement, `${definition.assetId}: fixture placement contract must match the catalog exactly`);
    const mount = fixturePlacement.mount;
    if (mount !== "floor") {
      assert.equal(floorPositions.has(definition.assetId), false, `${definition.assetId}: mounted review identity must not have a floor placeholder`);
      continue;
    }
    const position = floorPositions.get(definition.assetId);
    assert.ok(position, `${definition.assetId}: accepted floor identity lost its reviewed position`);
    assert.ok(position.x >= 1 && position.y >= 1, `${definition.assetId}: fixture footprint crosses the north/west perimeter`);
    assert.ok(position.x + definition.width <= 29 && position.y + definition.height <= 22, `${definition.assetId}: fixture footprint crosses the south/east perimeter`);
  }
  const floorDefinitions = definitions.filter((definition) => (definition.placement?.mount ?? "floor") === "floor");
  const acceptedRuntimeIds = new Set(contract.runtimeCompositeAcceptedAssetIds);
  for (const rotation of [0, 90, 180, 270]) {
    const rotated = floorDefinitions.map((definition) => {
      const position = floorPositions.get(definition.assetId);
      const quarterTurn = rotation === 90 || rotation === 270;
      return {
        ...definition,
        ...position,
        width: quarterTurn ? definition.height : definition.width,
        height: quarterTurn ? definition.width : definition.height,
      };
    });
    for (const definition of rotated.filter((item) => acceptedRuntimeIds.has(item.assetId))) {
      assert.ok(definition.x >= 0 && definition.y >= 0, `${definition.assetId}/${rotation}: fixture footprint crosses the north/west grid boundary`);
      assert.ok(definition.x + definition.width <= 30 && definition.y + definition.height <= 23, `${definition.assetId}/${rotation}: fixture footprint crosses the south/east grid boundary`);
    }
    for (let left = 0; left < rotated.length; left += 1) {
      for (let right = left + 1; right < rotated.length; right += 1) {
        const a = rotated[left];
        const b = rotated[right];
        const overlaps = a.x < b.x + b.width && b.x < a.x + a.width
          && a.y < b.y + b.height && b.y < a.y + a.height;
        assert.equal(overlaps, false, `${a.assetId} overlaps ${b.assetId} in the native fixture at rotation ${rotation}`);
      }
    }
  }
  const gridSizeMatch = capture.match(/"width": (\d+),\s*\n\s*"height": (\d+)/);
  const wallHeightMatch = restaurantFloor.match(/const WALL_PLANE_HEIGHT_CELLS := ([\d.]+)/);
  const halfHeightRatioMatch = projection.match(/const HALF_HEIGHT_RATIO := ([\d.]+)/);
  assert.ok(gridSizeMatch, "the native fixture must declare its review-grid dimensions");
  assert.ok(wallHeightMatch, "the renderer must declare its wall-plane height");
  assert.ok(halfHeightRatioMatch, "the isometric projection must declare its vertical basis ratio");
  const gridSize = { width: Number(gridSizeMatch[1]), height: Number(gridSizeMatch[2]) };
  const wallHeightCells = Number(wallHeightMatch[1]);
  const halfHeightRatio = Number(halfHeightRatioMatch[1]);
  // At a fixed screen x, one cell toward either foreground edge advances both
  // grid axes, so its projected ground depth is twice the vertical basis ratio.
  const minimumForegroundClearanceCells = Math.floor(wallHeightCells / (2 * halfHeightRatio)) + 1;
  const ovenDefinition = floorDefinitions.find((definition) => definition.assetId === "furniture-convection-oven");
  const ovenPosition = floorPositions.get("furniture-convection-oven");
  assert.ok(ovenDefinition && ovenPosition, "the convection oven must remain in the native review fixture");
  assert.equal(minimumForegroundClearanceCells, 4, "the current wall height and isometric basis require four cells of foreground clearance");
  for (const rotation of [0, 90, 180, 270]) {
    const quarterTurn = rotation === 90 || rotation === 270;
    const ovenWidth = quarterTurn ? ovenDefinition.height : ovenDefinition.width;
    const ovenHeight = quarterTurn ? ovenDefinition.width : ovenDefinition.height;
    assert.ok(
      gridSize.width - (ovenPosition.x + ovenWidth) >= minimumForegroundClearanceCells,
      `the convection oven must remain clear of the camera-facing east wall plane at rotation ${rotation}`,
    );
    assert.ok(
      gridSize.height - (ovenPosition.y + ovenHeight) >= minimumForegroundClearanceCells,
      `the convection oven must remain clear of the camera-facing south wall plane at rotation ${rotation}`,
    );
  }
  assert.match(capture, /const ROTATIONS := \[0, 90, 180, 270\]/);
  assert.match(capture, /restaurant-%s\.png/);
  assert.match(capture, /image\.get_size\(\) != VIEWPORT_SIZE or colors < 16/);
  assert.match(capture, /FileAccess\.get_sha256\(path\)/);
  assert.match(capture, /get_root\(\)\.content_scale_size = VIEWPORT_SIZE/);
  assert.match(capture, /RRO_RUNTIME_CAPTURE_WAIT rotation=/);
  assert.match(capture, /RRO_RUNTIME_CAPTURE_SAVED rotation=/);
  assert.match(capture, /await RenderingServer\.frame_post_draw/);
  assert.doesNotMatch(capture, /RenderingServer\.force_draw/);
  assert.match(capture, /const WATCHDOG_SECONDS := 45\.0/);
  assert.match(capture, /watchdog\.timeout\.connect\(capture_timed_out\)/);
  assert.match(capture, /func finish_capture\(exit_code: int\)/);
  assert.match(capture, /"mountedPlacements": mounted_placement_records\(objects\)/);
  assert.match(capture, /"runtimeCompositeAcceptedAssetIds": FurnitureArtBinding\.contract\(\)\.runtimeCompositeAcceptedAssetIds/);
  assert.match(capture, /"runtimeCompositeBlockedAssetIds": FurnitureArtBinding\.contract\(\)\.runtimeCompositeBlockedAssetIds/);
  assert.match(capture, /"runtimeCompositePendingAssetIds": FurnitureArtBinding\.contract\(\)\.runtimeCompositePendingAssetIds/);
  assert.match(capture, /"fixture": "%d source-accepted directional identities \(%d floor and %d mounted\).*DEFINITIONS\.size\(\), FLOOR_POSITIONS\.size\(\), MOUNTED_ASSET_IDS\.size\(\)/);
  assert.doesNotMatch(capture, /previously native-accepted|pending this capture/);
  assert.match(capture, /"productionComplete": false/);
  assert.match(capture, /Human visual acceptance.*native Godot captures.*durable repository preservation/);
  assert.match(validator, /resolve\(CLIENT, "tests"\)/, "the capture harness must pass the same analyzer as runtime GDScript");
});

test("CI captures and preserves the native isometric evidence without weakening cross-platform verification", () => {
  assert.match(workflow, /os: \[ubuntu-latest, windows-latest\]/);
  assert.match(workflow, /timeout --foreground --kill-after=10s 120s xvfb-run -a -s '-screen 0 1800x1100x24' godot --path apps\/client-godot --display-driver x11 --rendering-method gl_compatibility/);
  assert.match(workflow, /LIBGL_ALWAYS_SOFTWARE=1/);
  assert.match(workflow, /timeout-minutes: 3/);
  assert.match(workflow, /test "\$\(find artifacts\/isometric-runtime[^\n]+\)" -eq 4/);
  assert.match(workflow, /uses: actions\/upload-artifact@v4/);
  assert.match(workflow, /name: elevated-isometric-runtime-qa/);
  assert.match(workflow, /if-no-files-found: error/);
});
