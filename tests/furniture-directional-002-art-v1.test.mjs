import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const QA_PATH = "planning/art-qa/furniture-core-directional-002/qa.json";
const QA_ROOT = "planning/art-qa/furniture-core-directional-002";
const EXPECTED_QA_SHA256 = "c56c619e037c228c735c7e0f95113eb1aaa9e4e4572179a7f887a93a8c4ea63a";
const DIRECTIONS = ["north", "east", "south", "west"];
const ASSETS = ["banquette", "booth", "service-station"];
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const absolute = (path) => resolve(ROOT, path);
const bytes = (path) => readFileSync(absolute(path));
const json = (path) => JSON.parse(readFileSync(absolute(path), "utf8"));
const sha256 = (input) => createHash("sha256").update(input).digest("hex");
const fileSha256 = (path) => sha256(bytes(path));

function repositoryFiles(path) {
  const output = [];
  for (const entry of readdirSync(absolute(path), { withFileTypes: true })) {
    const relative = `${path}/${entry.name}`;
    if (entry.isDirectory()) output.push(...repositoryFiles(relative));
    else output.push(relative);
  }
  return output.sort();
}

function paeth(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  if (upDistance <= upperLeftDistance) return up;
  return upperLeft;
}

function decodeRgbaPng(path) {
  const data = bytes(path);
  assert.deepEqual(data.subarray(0, 8), PNG_SIGNATURE, `${path}: invalid PNG signature`);

  let offset = 8;
  let header = null;
  const compressed = [];
  while (offset < data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.toString("ascii", offset + 4, offset + 8);
    const payload = data.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      header = {
        width: payload.readUInt32BE(0),
        height: payload.readUInt32BE(4),
        bitDepth: payload[8],
        colorType: payload[9],
        compression: payload[10],
        filter: payload[11],
        interlace: payload[12],
      };
    } else if (type === "IDAT") compressed.push(payload);
    offset += length + 12;
    if (type === "IEND") break;
  }

  assert.ok(header, `${path}: missing IHDR`);
  assert.deepEqual(
    { bitDepth: header.bitDepth, colorType: header.colorType, compression: header.compression, filter: header.filter, interlace: header.interlace },
    { bitDepth: 8, colorType: 6, compression: 0, filter: 0, interlace: 0 },
    `${path}: expected non-interlaced 8-bit RGBA`,
  );

  const scanlines = inflateSync(Buffer.concat(compressed));
  const bytesPerPixel = 4;
  const stride = header.width * bytesPerPixel;
  assert.equal(scanlines.length, (stride + 1) * header.height, `${path}: unexpected scanline length`);
  const rgba = Buffer.alloc(stride * header.height);

  for (let y = 0; y < header.height; y += 1) {
    const inputOffset = y * (stride + 1);
    const filter = scanlines[inputOffset];
    assert.ok(filter >= 0 && filter <= 4, `${path}: unsupported PNG filter ${filter}`);
    for (let x = 0; x < stride; x += 1) {
      const raw = scanlines[inputOffset + 1 + x];
      const outputOffset = y * stride + x;
      const left = x >= bytesPerPixel ? rgba[outputOffset - bytesPerPixel] : 0;
      const up = y > 0 ? rgba[outputOffset - stride] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? rgba[outputOffset - stride - bytesPerPixel] : 0;
      const predictor = filter === 0 ? 0
        : filter === 1 ? left
          : filter === 2 ? up
            : filter === 3 ? Math.floor((left + up) / 2)
              : paeth(left, up, upperLeft);
      rgba[outputOffset] = (raw + predictor) & 0xff;
    }
  }

  return { ...header, rgba };
}

function pngHeader(path) {
  const data = bytes(path);
  assert.deepEqual(data.subarray(0, 8), PNG_SIGNATURE, `${path}: invalid PNG signature`);
  assert.equal(data.toString("ascii", 12, 16), "IHDR", `${path}: IHDR must be first`);
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    bitDepth: data[24],
    colorType: data[25],
  };
}

function alphaBounds(image) {
  let left = image.width;
  let top = image.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (image.rgba[(y * image.width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  assert.ok(right >= left && bottom >= top, "sprite must contain opaque pixels");
  return { left, top, right: right + 1, bottom: bottom + 1 };
}

function manifestBounds(value) {
  const match = value.match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/);
  assert.ok(match, `invalid bounds: ${value}`);
  const [, width, height, left, top] = match.map(Number);
  return { left, top, right: left + width, bottom: top + height };
}

test("furniture directional batch 002 has durable exact provenance", () => {
  const qa = json(QA_PATH);
  assert.equal(fileSha256(QA_PATH), EXPECTED_QA_SHA256);
  assert.equal(qa.batchId, "furniture-core-directional-002");
  assert.deepEqual([...qa.assets].sort(), ASSETS);
  assert.equal(qa.artReviewStatus, "accepted");
  assert.equal(qa.productionComplete, false);
  assert.equal(qa.repositoryPromotion, "remote-verified");
  assert.deepEqual(qa.remotePreservation, {
    commit: "daef2aa572f0f855ac95d92402b9af19cc76bc9f",
    tree: "36fbf6d8740e2f07f29527ff6e506cf541684b51",
    ci: "https://github.com/Maergoth/rro/actions/runs/30980689257",
  });
  assert.deepEqual(
    {
      runtimeFiles: qa.promotionScope.runtimeFiles,
      alphaSourceFiles: qa.promotionScope.alphaSourceFiles,
      contactSheets: qa.promotionScope.contactSheets,
      provenanceDocuments: qa.promotionScope.provenanceDocuments,
      totalFiles: qa.promotionScope.totalFiles,
    },
    { runtimeFiles: 12, alphaSourceFiles: 12, contactSheets: 2, provenanceDocuments: 2, totalFiles: 28 },
  );
  assert.doesNotMatch(JSON.stringify(qa), /\/tmp\//, "QA provenance must never reference transient storage");
  assert.equal(fileSha256(qa.source.promptLog), qa.source.promptLogSha256);

  const expectedEvidence = [
    `${QA_ROOT}/contact-128-light.png`,
    `${QA_ROOT}/contact-627-dark.png`,
    `${QA_ROOT}/prompts.md`,
    `${QA_ROOT}/qa.json`,
    ...ASSETS.flatMap((asset) => DIRECTIONS.map((direction) => `${QA_ROOT}/alpha-source/${asset}-${direction}.png`)),
  ].sort();
  assert.deepEqual(repositoryFiles(QA_ROOT), expectedEvidence, "only accepted evidence may enter the batch QA directory");
});

test("furniture directional batch 002 matches the authoritative catalog and common-pivot contract", () => {
  const qa = json(QA_PATH);
  const catalog = json("packages/game-data/core/furniture.json");
  const runtimeContract = json("apps/client-godot/furniture-art-runtime.json");
  assert.deepEqual(runtimeContract.acceptedDirectionalAssetIds, [
    "banquette",
    "booth",
    "dish-machine",
    "espresso",
    "furniture-banquette-section",
    "furniture-chemical-cabinet",
    "furniture-commercial-chair",
    "furniture-convection-oven",
    "furniture-dish-machine-high-temp",
    "furniture-dry-storage-rack",
    "furniture-essential-cafe-two-top",
    "furniture-expo-pass-heated",
    "furniture-host-stand-pro",
    "furniture-linen-storage",
    "furniture-manager-console",
    "furniture-oak-two-top",
    "furniture-office-desk",
    "furniture-plancha-commercial",
    "furniture-pos-terminal",
    "furniture-premium-chair",
    "furniture-prep-table-refrigerated",
    "furniture-server-station-pro",
    "furniture-six-burner-range",
    "furniture-three-comp-sink",
    "furniture-walkin-rack",
    "furniture-walnut-four-top",
    "furniture-water-station",
    "furniture-wet-floor-station",
    "host-stand",
    "local-art",
    "mop-sink",
    "pass",
    "pendants",
    "plants",
    "prep",
    "range",
    "recycling",
    "service-station",
    "table-four",
    "table-two",
  ]);
  assert.equal(runtimeContract.capability.projectionIntegrated, true);
  assert.equal(runtimeContract.capability.projectionAligned, true);
  assert.equal(runtimeContract.capability.cameraConformanceValidated, false);
  assert.equal(runtimeContract.capability.runtimeCompositeAccepted, true);
  assert.equal(runtimeContract.capability.productionComplete, false);
  assert.deepEqual(qa.gates.requiredDirections, DIRECTIONS);
  assert.deepEqual(qa.gates.commonCanvasPivot, [313.5, 590]);

  const runtimeHashes = new Set();
  for (const item of qa.items) {
    const definition = catalog.find((entry) => entry.id === item.catalogId);
    assert.ok(definition, `${item.catalogId}: missing catalog entry`);
    assert.equal(item.assetId, definition.id);
    assert.equal(item.name, definition.name);
    assert.deepEqual(item.footprint, [definition.width, definition.height]);
    assert.deepEqual(item.directions.map((entry) => entry.direction), DIRECTIONS);

    for (const direction of item.directions) {
      assert.equal(direction.path, `apps/client-godot/assets/objects/directional/${item.assetId}/${direction.direction}.png`);
      assert.equal(direction.sourceAlphaPath, `${QA_ROOT}/alpha-source/${item.assetId}-${direction.direction}.png`);
      assert.ok(existsSync(absolute(direction.path)));
      assert.ok(existsSync(absolute(direction.sourceAlphaPath)));
      assert.equal(fileSha256(direction.path), direction.sha256, `${direction.path}: runtime hash drift`);
      assert.equal(fileSha256(direction.sourceAlphaPath), direction.sourceAlphaSha256, `${direction.sourceAlphaPath}: source hash drift`);
      assert.equal(pngHeader(direction.sourceAlphaPath).colorType, 6, `${direction.sourceAlphaPath}: source must have alpha`);

      const image = decodeRgbaPng(direction.path);
      assert.deepEqual([image.width, image.height], [627, 627]);
      assert.equal(sha256(image.rgba), direction.pixelSha256, `${direction.path}: decoded pixel hash drift`);
      assert.deepEqual(alphaBounds(image), manifestBounds(direction.opaqueBounds), `${direction.path}: alpha bounds drift`);
      assert.deepEqual(direction.canvasPivot, [313.5, 590]);
      assert.equal(direction.floorContactBaselineY, 590);
      assert.equal(manifestBounds(direction.opaqueBounds).bottom, 590);
      assert.equal(direction.transparentMargins.bottom, 37);
      assert.ok(Math.abs(direction.transparentMargins.left - direction.transparentMargins.right) <= 1, `${direction.path}: horizontal pivot drift`);
      for (const [x, y] of [[0, 0], [626, 0], [0, 626], [626, 626]]) {
        assert.equal(image.rgba[(y * image.width + x) * 4 + 3], 0, `${direction.path}: opaque corner`);
      }
      assert.ok(!runtimeHashes.has(direction.sha256), `${direction.path}: duplicate runtime hash`);
      runtimeHashes.add(direction.sha256);
    }
  }
  assert.equal(runtimeHashes.size, 12);
});

test("furniture directional batch 002 contact sheets are exact reviewed evidence", () => {
  const qa = json(QA_PATH);
  const expectedDimensions = new Map([
    [`${QA_ROOT}/contact-627-dark.png`, [2508, 1989]],
    [`${QA_ROOT}/contact-128-light.png`, [512, 450]],
  ]);
  assert.equal(qa.contactSheets.length, 2);
  for (const sheet of qa.contactSheets) {
    assert.equal(fileSha256(sheet.path), sheet.sha256, `${sheet.path}: contact hash drift`);
    const header = pngHeader(sheet.path);
    assert.deepEqual([header.width, header.height], expectedDimensions.get(sheet.path));
    assert.deepEqual([header.bitDepth, header.colorType], [8, 2], `${sheet.path}: contact sheet must be opaque RGB`);
  }
});
