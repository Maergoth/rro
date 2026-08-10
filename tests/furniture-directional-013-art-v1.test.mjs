import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const QA_ROOT = "planning/art-qa/furniture-core-directional-013";
const QA_PATH = `${QA_ROOT}/qa.json`;
const QA_SHA256 = "706003f18b520ac2edc843f906b37336666538014faa5065f1963b3798960c77";
const ASSETS = ["furniture-office-desk", "furniture-manager-console", "furniture-essential-cafe-two-top"];
const DIRECTIONS = ["north", "east", "south", "west"];
const PLACEMENT = { mount: "floor", occupancy: "blocking", serviceAccess: "adjacent" };
const CATALOG = {
  "office-desk": { name: "Owner's Operations Desk", category: "Office", style: "Modern", width: 3, height: 2 },
  "manager-console": { name: "Live Operations Console", category: "Office", style: "Modern", width: 3, height: 2 },
  "essential-cafe-two-top": { name: "Essential Cafe Two-Top", category: "Dining", style: "Modern", width: 2, height: 2 },
};

const absolute = (path) => resolve(ROOT, path);
const bytes = (path) => readFileSync(absolute(path));
const json = (path) => JSON.parse(readFileSync(absolute(path), "utf8"));
const sha256 = (input) => createHash("sha256").update(input).digest("hex");
const fileSha256 = (path) => sha256(bytes(path));

function repositoryFiles(path) {
  const files = [];
  for (const entry of readdirSync(absolute(path), { withFileTypes: true })) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) files.push(...repositoryFiles(child));
    else files.push(child);
  }
  return files.sort();
}

function paeth(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const dl = Math.abs(estimate - left);
  const du = Math.abs(estimate - up);
  const dul = Math.abs(estimate - upperLeft);
  return dl <= du && dl <= dul ? left : du <= dul ? up : upperLeft;
}

function decodeRgbaPng(path) {
  const data = bytes(path);
  assert.deepEqual([...data.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${path}: PNG signature`);
  let offset = 8;
  let header;
  const compressed = [];
  while (offset < data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.toString("ascii", offset + 4, offset + 8);
    const payload = data.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") header = { width: payload.readUInt32BE(0), height: payload.readUInt32BE(4), bitDepth: payload[8], colorType: payload[9], interlace: payload[12] };
    if (type === "IDAT") compressed.push(payload);
    offset += length + 12;
    if (type === "IEND") break;
  }
  assert.deepEqual(header, { width: 627, height: 627, bitDepth: 8, colorType: 6, interlace: 0 }, `${path}: raster contract`);
  const scanlines = inflateSync(Buffer.concat(compressed));
  const stride = header.width * 4;
  const rgba = Buffer.alloc(stride * header.height);
  for (let y = 0; y < header.height; y += 1) {
    const input = y * (stride + 1);
    const filter = scanlines[input];
    assert.ok(filter >= 0 && filter <= 4, `${path}: PNG filter`);
    for (let x = 0; x < stride; x += 1) {
      const index = y * stride + x;
      const left = x >= 4 ? rgba[index - 4] : 0;
      const up = y ? rgba[index - stride] : 0;
      const upperLeft = y && x >= 4 ? rgba[index - stride - 4] : 0;
      const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, upperLeft);
      rgba[index] = (scanlines[input + 1 + x] + predictor) & 255;
    }
  }
  return { ...header, rgba };
}

function boundsAndDefects(image) {
  let left = image.width;
  let top = image.height;
  let right = -1;
  let bottom = -1;
  let magenta = 0;
  for (let y = 0; y < image.height; y += 1) for (let x = 0; x < image.width; x += 1) {
    const index = (y * image.width + x) * 4;
    const [red, green, blue, alpha] = image.rgba.subarray(index, index + 4);
    if (!alpha) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
    if (alpha > 2 && red > 150 && blue > 150 && green < 135 && red + blue > green * 2.6) magenta += 1;
  }
  return { bounds: [left, top, right, bottom], magenta };
}

function assertTransparentBorder(image, path) {
  for (let x = 0; x < image.width; x += 1) {
    assert.equal(image.rgba[x * 4 + 3], 0, `${path}: top border`);
    assert.equal(image.rgba[((image.height - 1) * image.width + x) * 4 + 3], 0, `${path}: bottom border`);
  }
  for (let y = 0; y < image.height; y += 1) {
    assert.equal(image.rgba[y * image.width * 4 + 3], 0, `${path}: left border`);
    assert.equal(image.rgba[(y * image.width + image.width - 1) * 4 + 3], 0, `${path}: right border`);
  }
}

test("furniture directional batch 013 preserves exact source and camera-retraction evidence", () => {
  const qa = json(QA_PATH);
  assert.equal(fileSha256(QA_PATH), QA_SHA256);
  assert.equal(qa.batchId, "furniture-core-directional-013");
  assert.deepEqual(qa.assets, ASSETS);
  assert.equal(qa.artReviewStatus, "accepted-source-camera-retracted");
  assert.equal(qa.productionComplete, false);
  assert.equal(qa.repositoryPromotion.status, "remote-verified-source-accepted-camera-retracted");
  assert.equal(qa.productionCompletionBlockers.length, 2);
  assert.match(qa.productionCompletionBlockers[0], /audit 001 rejects every asset/);
  assert.deepEqual(qa.remotePreservation, {
    commit: "a22e5055646184cef0d4d34ebb2a66cc5435c052",
    tree: "1a42c3e55c04b03b4a0e14c0189395195f35d8d7",
    ci: "https://github.com/Maergoth/rro/actions/runs/31289514663",
    artifactId: 9030941364,
    artifactSha256: "41c3b80ed02da62ff97fcb9b781fb3bd7087fac96bd0800538817c096a371cb3",
  });
  assert.deepEqual(qa.cameraContract, {
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
    adjacentFacesByDirection: {
      north: ["front", "right"],
      east: ["right", "rear"],
      south: ["rear", "left"],
      west: ["left", "front"],
    },
  });
  assert.match(qa.gates.cameraConformance, /^fail:/);
  assert.match(qa.gates.nativeGameplayCompositeReview, /^historical source-stage status superseded:/);
  assert.equal(qa.cameraGeometryMeasurement.status, "failed-measured-camera-geometry");
  assert.deepEqual(qa.cameraGeometryMeasurement.retractedAssetIds, ASSETS);
  assert.deepEqual(qa.promotionScope, { runtimeFiles: 12, alphaSourceFiles: 12, contactSheets: 2, provenanceDocuments: 2, totalFiles: 28 });
  assert.doesNotMatch(JSON.stringify(qa), /\/tmp\/|\/workspace\//);
  assert.equal(fileSha256(qa.source.promptLog), qa.source.promptLogSha256);
  assert.equal(qa.rejectedAttempts.length, 5);
  assert.ok(qa.rejectedAttempts.every((entry) => entry.generatorOutputSha256 && entry.reason.startsWith("Rejected source:")));
  const expected = [
    `${QA_ROOT}/contact-128-light.png`, `${QA_ROOT}/contact-627-dark.png`, `${QA_ROOT}/prompts.md`, `${QA_ROOT}/qa.json`,
    ...ASSETS.flatMap((asset) => DIRECTIONS.map((direction) => `${QA_ROOT}/alpha-source/${asset}-${direction}.png`)),
  ].sort();
  assert.deepEqual(repositoryFiles(QA_ROOT), expected);
});

test("furniture directional batch 013 matches catalog, placement, pivot, alpha, and uniqueness contracts", () => {
  const qa = json(QA_PATH);
  const catalog = [...json("packages/game-data/core/furniture.json"), ...json("packages/game-data/core/furniture-production.json")];
  const runtimeHashes = new Set();
  const runtimePixelHashes = new Set();
  const sourceHashes = new Set();
  for (const item of qa.items) {
    const definition = catalog.find((entry) => entry.id === item.catalogId);
    assert.ok(definition, `${item.catalogId}: catalog entry`);
    assert.deepEqual({ name: definition.name, category: definition.category, style: definition.style, width: definition.width, height: definition.height }, CATALOG[item.catalogId]);
    assert.equal(item.assetId, definition.assetId);
    assert.deepEqual(item.footprint, [definition.width, definition.height]);
    assert.deepEqual(item.placement, PLACEMENT);
    assert.deepEqual(definition.placement, PLACEMENT);
    assert.deepEqual(item.directions.map((entry) => entry.direction), DIRECTIONS);
    for (const direction of item.directions) {
      assert.equal(fileSha256(direction.path), direction.sha256);
      assert.equal(fileSha256(direction.sourceAlphaPath), direction.sourceAlphaSha256);
      const source = decodeRgbaPng(direction.sourceAlphaPath);
      const runtime = decodeRgbaPng(direction.path);
      assert.equal(sha256(runtime.rgba), direction.pixelSha256);
      const { bounds, magenta } = boundsAndDefects(runtime);
      assert.deepEqual(bounds, direction.alphaBoundingBox);
      assert.equal(direction.alphaBaselineY, 590);
      assert.equal(bounds[3], 589);
      assert.equal(627 - 1 - bounds[3], 37);
      assert.ok(Math.abs(bounds[0] + bounds[2] - 626) <= 1, `${direction.path}: pivot centering`);
      assertTransparentBorder(runtime, direction.path);
      assert.equal(magenta, 0, `${direction.path}: magenta fringe`);
      assert.ok(!runtimeHashes.has(direction.sha256));
      assert.ok(!runtimePixelHashes.has(direction.pixelSha256));
      assert.ok(!sourceHashes.has(direction.sourceAlphaSha256));
      runtimeHashes.add(direction.sha256); runtimePixelHashes.add(direction.pixelSha256); sourceHashes.add(direction.sourceAlphaSha256);
      assertTransparentBorder(source, direction.sourceAlphaPath);
    }
  }
  assert.equal(runtimeHashes.size, 12);
  assert.equal(runtimePixelHashes.size, 12);
  assert.equal(sourceHashes.size, 12);
  const prefixes = ASSETS.map((asset) => `apps/client-godot/assets/objects/directional/${asset}/`);
  const previous = repositoryFiles("apps/client-godot/assets/objects/directional").filter((path) => path.endsWith(".png") && !prefixes.some((prefix) => path.startsWith(prefix)));
  assert.equal(previous.length, 148);
  const previousHashes = new Set(previous.map(fileSha256));
  const previousPixelHashes = new Set(previous.map((path) => sha256(decodeRgbaPng(path).rgba)));
  assert.ok([...runtimeHashes].every((hash) => !previousHashes.has(hash)));
  assert.ok([...runtimePixelHashes].every((hash) => !previousPixelHashes.has(hash)));
});

test("furniture directional batch 013 contact sheets are exact reviewed full and gameplay evidence", () => {
  const qa = json(QA_PATH);
  assert.deepEqual(qa.contactSheets.map(({ path, sha256: hash }) => ({ path, sha256: hash })), [
    { path: `${QA_ROOT}/contact-627-dark.png`, sha256: "37a78b29316a7b98820534d55ff47edcf2ae31a995eff6f5ebd7d41a1e6a0c36" },
    { path: `${QA_ROOT}/contact-128-light.png`, sha256: "da64e08069214dcd7afd1b2a6488791ee49d732e8d2ed34306f84703898f4f6c" },
  ]);
  for (const contact of qa.contactSheets) assert.equal(fileSha256(contact.path), contact.sha256);
  assert.match(qa.gates.visualReviewAtFullScale, /^superseded:/);
  assert.match(qa.gates.visualReviewAtGameplayScale128px, /^pass for identity\/legibility only:/);
  assert.equal(qa.gates.repositoryDirectionalPngsCompared, 148);
  assert.equal(qa.gates.exactFileCollisionsAgainstRepository, 0);
  assert.equal(qa.gates.exactPixelCollisionsAgainstRepository, 0);
  assert.equal(qa.gates.exactPerceptualHashCollisionsAgainstRepository, 0);
  assert.equal(qa.gates.proceduralOrDeterministicStandIn, false);
});
