import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(import.meta.dirname, "..");
const read = (path) => JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
const runtime = read("apps/client-godot/furniture-art-runtime.json");
const batch013 = read("planning/art-qa/furniture-core-directional-013/qa.json");

test("directional furniture uses one explicit fixed elevated-isometric camera", () => {
  assert.deepEqual(runtime.cameraProjection, {
    type: "elevated-orthographic-isometric",
    fixedCamera: true,
    rotationStepDegrees: 90,
    azimuthDegrees: 315,
    elevationDegrees: 26.565,
    basisX: [0.5, 0.25],
    basisY: [-0.5, 0.25],
    groundEdgeScreenSlopes: [-0.5, 0.5],
    verticalEdges: "screen-vertical",
    perspective: false,
  });
  assert.deepEqual(batch013.cameraContract, {
    ...runtime.cameraProjection,
    adjacentFacesByDirection: {
      north: ["front", "right"],
      east: ["right", "rear"],
      south: ["rear", "left"],
      west: ["left", "front"],
    },
  });
  assert.match(batch013.gates.cameraConformance, /^pass:/);
  assert.match(batch013.gates.visualReviewAtFullScale, /fixed elevated orthographic-isometric camera/);
});

test("camera-conformant and pending assets exactly partition source-accepted furniture", () => {
  const accepted = [...runtime.acceptedDirectionalAssetIds].sort();
  const conformant = [...runtime.cameraConformantAssetIds].sort();
  const pending = [...runtime.cameraConformancePendingAssetIds].sort();
  assert.deepEqual(conformant, [
    "furniture-chemical-cabinet",
    "furniture-dish-machine-high-temp",
    "furniture-essential-cafe-two-top",
    "furniture-linen-storage",
    "furniture-manager-console",
    "furniture-office-desk",
    "furniture-three-comp-sink",
    "furniture-water-station",
    "furniture-wet-floor-station",
  ]);
  assert.deepEqual([...conformant, ...pending].sort(), accepted);
  assert.equal(new Set([...conformant, ...pending]).size, accepted.length);
  assert.equal(pending.length, 31);
  assert.equal(runtime.capability.cameraConformanceValidated, false);
  assert.equal(runtime.capability.productionComplete, false);
});

test("rejected batch013 atlases can never be mistaken for accepted fixed-camera evidence", () => {
  assert.equal(batch013.rejectedAttempts.length, 5);
  assert.ok(batch013.rejectedAttempts.some((entry) => /straight-on elevations/.test(entry.reason)));
  assert.ok(batch013.rejectedAttempts.some((entry) => /completing a quarter turn/.test(entry.reason)));
  assert.ok(batch013.rejectedAttempts.some((entry) => /chair diagonal/.test(entry.reason)));
  assert.equal(batch013.gates.proceduralOrDeterministicStandIn, false);
});
