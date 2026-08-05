import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const capture = read("apps/client-godot/tests/isometric_runtime_capture.gd");
const workflow = read(".github/workflows/ci.yml");
const contract = JSON.parse(read("apps/client-godot/furniture-art-runtime.json"));
const validator = read("tools/validate-godot-project.mjs");
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
  assert.equal(floorPositions.size, 22, "the 22 accepted floor identities retain explicit positions");
  assert.deepEqual(Object.fromEntries(floorPositions), {
    banquette: { x: 2, y: 2 },
    booth: { x: 9, y: 2 },
    "dish-machine": { x: 15, y: 2 },
    espresso: { x: 21, y: 2 },
    "furniture-banquette-section": { x: 4, y: 6 },
    "furniture-commercial-chair": { x: 10, y: 6 },
    "furniture-host-stand-pro": { x: 16, y: 6 },
    "furniture-oak-two-top": { x: 22, y: 6 },
    "furniture-pos-terminal": { x: 2, y: 12 },
    "furniture-premium-chair": { x: 8, y: 12 },
    "furniture-server-station-pro": { x: 14, y: 12 },
    "furniture-six-burner-range": { x: 20, y: 12 },
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
    const mount = definition.placement?.mount ?? "floor";
    if (mount !== "floor") {
      assert.deepEqual(definition.placement, catalogDefinition.placement, `${definition.assetId}: fixture mount contract must match the catalog exactly`);
      assert.equal(floorPositions.has(definition.assetId), false, `${definition.assetId}: mounted review identity must not have a floor placeholder`);
      continue;
    }
    const position = floorPositions.get(definition.assetId);
    assert.ok(position, `${definition.assetId}: accepted floor identity lost its reviewed position`);
    assert.ok(position.x >= 1 && position.y >= 1, `${definition.assetId}: fixture footprint crosses the north/west perimeter`);
    assert.ok(position.x + definition.width <= 29 && position.y + definition.height <= 22, `${definition.assetId}: fixture footprint crosses the south/east perimeter`);
  }
  const floorDefinitions = definitions.filter((definition) => (definition.placement?.mount ?? "floor") === "floor");
  for (let left = 0; left < floorDefinitions.length; left += 1) {
    for (let right = left + 1; right < floorDefinitions.length; right += 1) {
      const a = { ...floorDefinitions[left], ...floorPositions.get(floorDefinitions[left].assetId) };
      const b = { ...floorDefinitions[right], ...floorPositions.get(floorDefinitions[right].assetId) };
      const overlaps = a.x < b.x + b.width && b.x < a.x + a.width
        && a.y < b.y + b.height && b.y < a.y + a.height;
      assert.equal(overlaps, false, `${a.assetId} overlaps ${b.assetId} in the native fixture`);
    }
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
