import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const capture = read("apps/client-godot/tests/isometric_runtime_capture.gd");
const workflow = read(".github/workflows/ci.yml");
const contract = JSON.parse(read("apps/client-godot/furniture-art-runtime.json"));
const validator = read("tools/validate-godot-project.mjs");

test("native Godot QA fixture renders every accepted directional furniture identity in all four rotations", () => {
  const fixtureIds = [...capture.matchAll(/"assetId": "([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(fixtureIds, contract.acceptedDirectionalAssetIds);
  assert.equal(new Set(fixtureIds).size, fixtureIds.length);
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
