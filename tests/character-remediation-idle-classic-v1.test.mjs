import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(import.meta.dirname, "..");
const QA_ROOT = "planning/art-qa/character-remediation-idle-classic-v1";
const BODY_METRICS_PATH = `${QA_ROOT}/normalized-bodies-metrics.json`;
const CLASSIC_METRICS_PATH = `${QA_ROOT}/classic-composites-metrics.json`;
const BODIES = ["base-a", "base-b"];
const DIRECTIONS = [
  "north",
  "north_east",
  "east",
  "south_east",
  "south",
  "south_west",
  "west",
  "north_west",
];
const CANVAS = [384, 512];
const PIVOT = [192, 472];
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// These fingerprints bind the test to the reviewed batch, rather than allowing
// an asset and its adjacent JSON hash to be silently replaced together.
const EXPECTED_CURRENT_RECORDS_FINGERPRINT =
  "3850ee498cbe52fece8bab67c027fa0b7ec8132917ddb2cca0bf306eef2ef753";
const EXPECTED_RUNTIME_FINGERPRINT =
  "e41828b9ef1dd6c5a05acb5be8713287cbfcd38393d52ee8692d400ecea16e9e";

const EXPECTED_CONTACT_SHEETS = new Map([
  [
    `${QA_ROOT}/normalized-bodies-full.png`,
    {
      width: 1616,
      height: 2278,
      sha256: "5bbccb23e37830c55aed3cf1728cd7724089a3d0e4b76a7d960f2a3066c5f70e",
    },
  ],
  [
    `${QA_ROOT}/classic-composites-full.png`,
    {
      width: 1616,
      height: 2278,
      sha256: "2e8c581eeade06ec57681cd27300154ea3db6ed7cf52d9dfd9018f942b246cdc",
    },
  ],
  [
    `${QA_ROOT}/classic-composites-gameplay.png`,
    {
      width: 1008,
      height: 322,
      sha256: "594f1079bf7ea3472126111e9f8ce0cbb470a4220e1c431e6ef4f46654666d2b",
    },
  ],
]);

const digestCache = new Map();

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
}

function safeRepoPath(path) {
  assert.equal(typeof path, "string", "recorded paths must be strings");
  assert.ok(path.length > 0, "recorded paths must not be empty");
  assert.equal(isAbsolute(path), false, `${path}: expected a repository-relative path`);
  assert.equal(path.includes("\\"), false, `${path}: expected a canonical POSIX path`);
  const absolute = resolve(ROOT, path);
  const fromRoot = relative(ROOT, absolute);
  assert.ok(
    fromRoot !== ".." && !fromRoot.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`),
    `${path}: path escapes the repository`,
  );
  return absolute;
}

function fileDigest(path) {
  if (!digestCache.has(path)) {
    const absolute = safeRepoPath(path);
    assert.ok(existsSync(absolute), `${path}: recorded file is missing`);
    digestCache.set(path, createHash("sha256").update(readFileSync(absolute)).digest("hex"));
  }
  return digestCache.get(path);
}

function verifyRecordedHashes(records, label) {
  assert.ok(Array.isArray(records), `${label}: expected an array of hash records`);
  const seen = new Set();
  for (const record of records) {
    assert.deepEqual(Object.keys(record).sort(), ["path", "sha256"], `${label}: invalid record shape`);
    assert.match(record.sha256, /^[0-9a-f]{64}$/, `${record.path}: invalid SHA-256`);
    assert.equal(seen.has(record.path), false, `${label}: duplicate path ${record.path}`);
    seen.add(record.path);
    assert.equal(fileDigest(record.path), record.sha256, `${record.path}: recorded SHA-256 mismatch`);
  }
}

function recordsFingerprint(records) {
  const canonical = [...records]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map(({ path, sha256 }) => `${path}\0${sha256}\n`)
    .join("");
  return createHash("sha256").update(canonical).digest("hex");
}

function assertExactPaths(actualRecords, expectedPaths, label) {
  assert.deepEqual(
    actualRecords.map(({ path }) => path).sort(),
    [...expectedPaths].sort(),
    `${label}: path matrix differs from the accepted contract`,
  );
}

function pngHeader(path) {
  const bytes = readFileSync(safeRepoPath(path));
  assert.ok(bytes.length >= 33, `${path}: truncated PNG`);
  assert.deepEqual(bytes.subarray(0, 8), PNG_SIGNATURE, `${path}: invalid PNG signature`);
  assert.equal(bytes.readUInt32BE(8), 13, `${path}: invalid IHDR length`);
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR", `${path}: IHDR must be first`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24],
    colorType: bytes[25],
    compression: bytes[26],
    filter: bytes[27],
    interlace: bytes[28],
  };
}

function assertPngHeader(path, expected) {
  assert.deepEqual(pngHeader(path), expected, `${path}: unexpected PNG header`);
}

function runtimePaths() {
  const paths = [];
  for (const body of BODIES) {
    for (const direction of DIRECTIONS) {
      paths.push(
        `apps/client-godot/assets/characters/body/${body}/idle/${direction}.png`,
        `apps/client-godot/assets/characters/body/${body}/idle/skin-diffuse/${direction}.png`,
        `apps/client-godot/assets/characters/body/${body}/idle/skin-mask/${direction}.png`,
        `apps/client-godot/assets/characters/outfits/classic/${body}/idle/diffuse/${direction}.png`,
        `apps/client-godot/assets/characters/outfits/classic/${body}/idle/primary-mask/${direction}.png`,
        `apps/client-godot/assets/characters/outfits/classic/${body}/idle/secondary-mask/${direction}.png`,
      );
    }
  }
  return paths;
}

function bodyInputPaths() {
  const paths = [];
  for (const body of BODIES) {
    for (const direction of DIRECTIONS) {
      paths.push(
        `apps/client-godot/assets/characters/body/${body}/idle/${direction}.png`,
        `apps/client-godot/assets/characters/body/${body}/idle/skin-mask/${direction}.png`,
      );
    }
  }
  return paths;
}

function directionKeys(records) {
  return records.map(({ body, direction }) => `${body}/${direction}`).sort();
}

const EXPECTED_DIRECTION_KEYS = BODIES.flatMap((body) =>
  DIRECTIONS.map((direction) => `${body}/${direction}`),
).sort();

test("idle body and classic outfit metrics lock the complete 96-file runtime matrix", () => {
  const bodyMetrics = loadJson(BODY_METRICS_PATH);
  const classicMetrics = loadJson(CLASSIC_METRICS_PATH);
  const expectedRuntime = runtimePaths();
  assert.equal(expectedRuntime.length, 96);
  assert.equal(new Set(expectedRuntime).size, 96);

  const bodyOutputs = bodyMetrics.outputs.filter(({ path }) => path.startsWith("apps/"));
  const classicOutputs = classicMetrics.outputs.filter(({ path }) => path.startsWith("apps/"));
  const runtimeRecords = [...bodyOutputs, ...classicOutputs];
  const expectedBodyOutputs = expectedRuntime.filter((path) => path.includes("/characters/body/"));
  const expectedClassicOutputs = expectedRuntime.filter((path) => path.includes("/outfits/classic/"));

  assert.equal(bodyOutputs.length, 48);
  assert.equal(classicOutputs.length, 48);
  assertExactPaths(bodyOutputs, expectedBodyOutputs, "normalized body outputs");
  assertExactPaths(classicOutputs, expectedClassicOutputs, "classic outfit outputs");
  assertExactPaths(runtimeRecords, expectedRuntime, "character runtime outputs");

  assertExactPaths(
    bodyMetrics.outputs.filter(({ path }) => !path.startsWith("apps/")),
    [`${QA_ROOT}/normalized-bodies-full.png`],
    "normalized body evidence",
  );
  assertExactPaths(
    classicMetrics.outputs.filter(({ path }) => !path.startsWith("apps/")),
    [
      `${QA_ROOT}/classic-composites-full.png`,
      `${QA_ROOT}/classic-composites-gameplay.png`,
    ],
    "classic outfit evidence",
  );

  verifyRecordedHashes(bodyMetrics.outputs, "normalized body outputs");
  verifyRecordedHashes(classicMetrics.outputs, "classic outfit outputs");
  verifyRecordedHashes(
    classicMetrics.sourcePreservation.generatedSources,
    "classic generated edit sources",
  );
  verifyRecordedHashes(classicMetrics.sourcePreservation.bodyInputs, "classic body inputs");
  assertExactPaths(
    classicMetrics.sourcePreservation.bodyInputs,
    bodyInputPaths(),
    "classic body inputs",
  );

  const allCurrentRecords = [
    ...bodyMetrics.outputs,
    ...classicMetrics.outputs,
    ...classicMetrics.sourcePreservation.generatedSources,
    ...classicMetrics.sourcePreservation.bodyInputs,
  ];
  assert.equal(recordsFingerprint(runtimeRecords), EXPECTED_RUNTIME_FINGERPRINT);
  assert.equal(recordsFingerprint(allCurrentRecords), EXPECTED_CURRENT_RECORDS_FINGERPRINT);

  const recordedHashes = runtimeRecords.map(({ sha256 }) => sha256);
  const actualHashes = runtimeRecords.map(({ path }) => fileDigest(path));
  assert.equal(new Set(recordedHashes).size, 96, "all recorded runtime hashes must be unique");
  assert.equal(new Set(actualHashes).size, 96, "all runtime files must be byte-distinct");

  for (const path of expectedRuntime) {
    assertPngHeader(path, {
      width: CANVAS[0],
      height: CANVAS[1],
      bitDepth: 8,
      colorType: 6,
      compression: 0,
      filter: 0,
      interlace: 0,
    });
  }
});

test("idle body and classic outfit metrics preserve their shared pivot and zero-defect gates", () => {
  const bodyMetrics = loadJson(BODY_METRICS_PATH);
  const classicMetrics = loadJson(CLASSIC_METRICS_PATH);

  for (const metrics of [bodyMetrics, classicMetrics]) {
    assert.equal(metrics.schemaVersion, 1);
    assert.equal(metrics.batch, "character-remediation-idle-classic-v1");
    assert.deepEqual(metrics.canvas, CANVAS);
    assert.deepEqual(metrics.groundContactPivot, PIVOT);
    assert.equal(metrics.sourceCommit, "20e83ef4dbac4f616686023007f4eb9ee7801445");
    assert.equal(metrics.directions.length, 16);
    assert.deepEqual(directionKeys(metrics.directions), EXPECTED_DIRECTION_KEYS);
  }

  assert.equal(bodyMetrics.component, "normalized-idle-bodies");
  assert.equal(bodyMetrics.totals.bodyDirectionFiles, 16);
  assert.equal(bodyMetrics.totals.skinRuntimeFiles, 32);
  assert.equal(bodyMetrics.totals.remainingGreenEdgePixels, 0);
  assert.equal(
    bodyMetrics.directions.reduce((total, entry) => total + entry.remainingGreenEdgePixels, 0),
    0,
  );
  assert.equal(
    bodyMetrics.directions.reduce((total, entry) => total + entry.despilledPixels, 0),
    bodyMetrics.totals.despilledPixels,
  );
  assert.equal(
    Math.min(...bodyMetrics.directions.map((entry) => entry.skinPixels)),
    bodyMetrics.totals.minimumSkinPixels,
  );
  assert.ok(bodyMetrics.totals.minimumSkinPixels > 0);

  const measuredPivotError = Math.max(
    ...bodyMetrics.directions.map((entry) => {
      assert.equal(entry.normalizedAnchor[1], PIVOT[1], `${entry.body}/${entry.direction}: pivot Y`);
      return Math.abs(entry.normalizedAnchor[0] - PIVOT[0]);
    }),
  );
  assert.ok(Math.abs(measuredPivotError - bodyMetrics.totals.maximumPivotXError) < 1e-9);
  assert.ok(measuredPivotError <= 0.51, `maximum pivot X error ${measuredPivotError}`);

  assert.equal(classicMetrics.component, "classic-outfit");
  assert.deepEqual(classicMetrics.layerOrderUnderTest, ["body", "classic-outfit"]);
  assert.equal(classicMetrics.totals.variants, 16);
  assert.equal(classicMetrics.totals.runtimeFiles, 48);
  const zeroTotals = [
    "maskOverlapPixels",
    "diffuseMaskUnionMismatchPixels",
    "uncoveredRearLegPixels",
    "garmentPixelsOnProtectedFace",
    "garmentPixelsOnProtectedHands",
    "garmentPixelsOnProtectedFeetFromEdit",
    "garmentPixelsOnProtectedScalp",
    "garmentPixelsOnProtectedFeet",
  ];
  for (const field of zeroTotals) {
    assert.equal(classicMetrics.totals[field], 0, `${field}: expected a zero batch total`);
    assert.equal(
      classicMetrics.directions.reduce((total, entry) => total + entry[field], 0),
      0,
      `${field}: expected every direction to pass`,
    );
  }
  for (const entry of classicMetrics.directions) {
    assert.ok(entry.primaryPixels > 0, `${entry.body}/${entry.direction}: empty primary mask`);
    assert.ok(entry.secondaryPixels > 0, `${entry.body}/${entry.direction}: empty secondary mask`);
    assert.ok(entry.visibleScalpPixels > 0, `${entry.body}/${entry.direction}: no visible scalp`);
    assert.ok(entry.visibleFeetPixels > 0, `${entry.body}/${entry.direction}: no visible feet`);
  }
});

test("character remediation contact sheets retain reviewed dimensions and exact bytes", () => {
  const bodyMetrics = loadJson(BODY_METRICS_PATH);
  const classicMetrics = loadJson(CLASSIC_METRICS_PATH);
  assert.equal(bodyMetrics.visualQa, `${QA_ROOT}/normalized-bodies-full.png`);
  assert.deepEqual(classicMetrics.visualQa, {
    fullResolution: `${QA_ROOT}/classic-composites-full.png`,
    gameplayScale: `${QA_ROOT}/classic-composites-gameplay.png`,
  });

  const outputRecords = new Map(
    [...bodyMetrics.outputs, ...classicMetrics.outputs].map((record) => [record.path, record]),
  );
  for (const [path, expected] of EXPECTED_CONTACT_SHEETS) {
    const record = outputRecords.get(path);
    assert.ok(record, `${path}: missing output hash record`);
    assert.equal(record.sha256, expected.sha256, `${path}: reviewed hash changed`);
    assert.equal(fileDigest(path), expected.sha256, `${path}: reviewed bytes changed`);
    assertPngHeader(path, {
      width: expected.width,
      height: expected.height,
      bitDepth: 8,
      colorType: 2,
      compression: 0,
      filter: 0,
      interlace: 0,
    });
  }
});
