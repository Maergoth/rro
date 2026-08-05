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
  const definitions = [...capture.matchAll(/\{"id": "([^"]+)", "assetId": "([^"]+)", "name": "([^"]+)", "category": "([^"]+)", "width": (\d+), "height": (\d+)\}/g)]
    .map((match) => ({ id: match[1], assetId: match[2], name: match[3], category: match[4], width: Number(match[5]), height: Number(match[6]) }));
  const fixtureIds = definitions.map((definition) => definition.assetId);
  const positionBlock = capture.match(/var positions := \[([\s\S]*?)\n\t\]/);
  assert.ok(positionBlock, "the native fixture must declare reviewed positions");
  const positions = [...positionBlock[1].matchAll(/Vector2i\((\d+), (\d+)\)/g)]
    .map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
  assert.deepEqual(fixtureIds, contract.acceptedDirectionalAssetIds);
  assert.equal(new Set(fixtureIds).size, fixtureIds.length);
  assert.equal(positions.length, definitions.length, "every accepted identity needs one explicit native-fixture position");
  for (const [index, definition] of definitions.entries()) {
    const catalogDefinition = furnitureCatalog.find((item) => item.id === definition.id);
    assert.ok(catalogDefinition, `${definition.id}: native fixture definition is not in the catalog`);
    assert.deepEqual(definition, {
      id: catalogDefinition.id,
      assetId: catalogDefinition.assetId ?? catalogDefinition.id,
      name: catalogDefinition.name,
      category: catalogDefinition.category,
      width: catalogDefinition.width,
      height: catalogDefinition.height,
    });
    const position = positions[index];
    assert.ok(position.x >= 1 && position.y >= 1, `${definition.assetId}: fixture footprint crosses the north/west perimeter`);
    assert.ok(position.x + definition.width <= 29 && position.y + definition.height <= 22, `${definition.assetId}: fixture footprint crosses the south/east perimeter`);
  }
  for (let left = 0; left < definitions.length; left += 1) {
    for (let right = left + 1; right < definitions.length; right += 1) {
      const a = { ...definitions[left], ...positions[left] };
      const b = { ...definitions[right], ...positions[right] };
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
