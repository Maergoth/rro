import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  auditDirectionalAsset,
  cameraGeometryReasons,
  CAMERA_GEOMETRY_CONTRACT,
} from "../tools/lib/furniture-camera-geometry-v1.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const read = (path) => JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
const runtime = read("apps/client-godot/furniture-art-runtime.json");
const pass = read("planning/art-pass-v2.json");
const evidence = read("planning/art-qa/furniture-camera-geometry-audit-001.json");
const packageJson = read("package.json");

test("the executable furniture camera cage encodes exact orthographic axes and strict tolerances", () => {
  assert.deepEqual(CAMERA_GEOMETRY_CONTRACT.expectedGroundSlopes, [-0.5, 0.5]);
  assert.deepEqual(CAMERA_GEOMETRY_CONTRACT.expectedGroundAnglesDegrees, [-26.56505117707799, 26.56505117707799]);
  assert.equal(CAMERA_GEOMETRY_CONTRACT.groundAngleToleranceDegrees, 1.25);
  assert.equal(CAMERA_GEOMETRY_CONTRACT.groundSlopeTolerance, 0.03);
  assert.equal(CAMERA_GEOMETRY_CONTRACT.expectedVerticalAngleDegrees, 90);
  assert.equal(CAMERA_GEOMETRY_CONTRACT.verticalAngleToleranceDegrees, 1.25);
  assert.deepEqual(runtime.cameraGeometryGate, {
    schemaVersion: 1,
    algorithm: "rgba-sobel-orientation-constrained-hough-v1",
    validator: "tools/validate-furniture-camera-geometry-v1.mjs",
    auditEvidence: "planning/art-qa/furniture-camera-geometry-audit-001.json",
    expectedGroundSlopes: [-0.5, 0.5],
    expectedGroundAnglesDegrees: [-26.56505117707799, 26.56505117707799],
    groundAngleToleranceDegrees: 1.25,
    groundSlopeTolerance: 0.03,
    expectedVerticalAngleDegrees: 90,
    verticalAngleToleranceDegrees: 1.25,
  });
  assert.match(packageJson.scripts["validate:art-pass"], /validate:furniture-camera/);
  assert.match(packageJson.scripts["validate:art-complete"], /validate:furniture-camera/);

  const line = (angleDegrees, slope) => ({ angleDegrees, slope, score: 12 });
  assert.deepEqual(cameraGeometryReasons({
    positiveGround: line(26.56505117707799, 0.5),
    negativeGround: line(-26.56505117707799, -0.5),
    vertical: { angleDegrees: 90, score: 12 },
  }), []);
  assert.match(cameraGeometryReasons({
    positiveGround: line(19.5, 0.354119),
    negativeGround: line(-26.56505117707799, -0.5),
    vertical: { angleDegrees: 90, score: 12 },
  })[0], /positive ground axis 19\.5°.*outside/);
});

test("audit 001 reproducibly rejects all 36 batch 011-013 source frames", () => {
  assert.equal(evidence.id, "furniture-camera-geometry-audit-001");
  assert.deepEqual(evidence.contract, CAMERA_GEOMETRY_CONTRACT);
  assert.equal(evidence.auditedAssets.length, 9);
  assert.deepEqual(evidence.measuredConformantAssetIds, []);
  assert.deepEqual([...evidence.retractedAssetIds].sort(), [...evidence.previouslyCreditedAssetIds].sort());
  assert.deepEqual(runtime.cameraConformantAssetIds, []);
  assert.deepEqual([...runtime.cameraConformancePendingAssetIds].sort(), [...runtime.acceptedDirectionalAssetIds].sort());
  assert.deepEqual(pass.cameraGeometryAudits.at(-1).measuredConformantAssetIds, []);

  let failedDirectionCount = 0;
  for (const preserved of evidence.auditedAssets) {
    const directions = Object.fromEntries(Object.entries(preserved.measurements).map(([direction, measurement]) => [
      direction,
      resolve(ROOT, measurement.path),
    ]));
    const current = auditDirectionalAsset(preserved.assetId, directions);
    assert.equal(current.passed, false, `${preserved.assetId} must not regain camera credit without replacement pixels`);
    assert.deepEqual(current.failedDirections, ["north", "east", "south", "west"]);
    failedDirectionCount += current.failedDirections.length;
    for (const direction of CAMERA_GEOMETRY_CONTRACT.requiredDirections) {
      assert.deepEqual(current.measurements[direction].dominantLines, preserved.measurements[direction].dominantLines);
      assert.deepEqual(current.measurements[direction].reasons, preserved.measurements[direction].reasons);
    }
  }
  assert.equal(failedDirectionCount, 36);
});

test("the flagged manager console is measurably inconsistent rather than a valid quarter-turn set", () => {
  const manager = evidence.auditedAssets.find((asset) => asset.assetId === "furniture-manager-console");
  assert.ok(manager);
  assert.deepEqual(manager.failedDirections, ["north", "east", "south", "west"]);
  assert.deepEqual(Object.fromEntries(Object.entries(manager.measurements).map(([direction, measurement]) => [
    direction,
    {
      positiveSlope: measurement.dominantLines.positiveGround.slope,
      negativeSlope: measurement.dominantLines.negativeGround.slope,
      uprightAngle: measurement.dominantLines.vertical.angleDegrees,
    },
  ])), {
    north: { positiveSlope: 0.354119, negativeSlope: -0.487733, uprightAngle: 89.5 },
    east: { positiveSlope: 0.39391, negativeSlope: -0.565773, uprightAngle: 89.5 },
    south: { positiveSlope: 0.434812, negativeSlope: -0.520567, uprightAngle: 89.5 },
    west: { positiveSlope: 0.373885, negativeSlope: -0.39391, uprightAngle: 75.5 },
  });
});
