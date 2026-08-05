import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const QA_ROOT = "planning/art-qa/furniture-core-directional-006";
const QA_PATH = `${QA_ROOT}/qa.json`;
const EXPECTED_QA_SHA256 = "02002ebb88b9235d27ae5f04fd09c7008f0593aa706c9e73659ca1f6d2ef73e8";
const DIRECTIONS = ["north", "east", "south", "west"];
const ASSETS = ["local-art", "furniture-oak-two-top", "furniture-walnut-four-top"];
const EXPECTED_CATALOG = {
  "local-art": { name: "Local Print Set", category: "Decor", style: "Heritage", width: 2, height: 1 },
  "oak-two-top": { name: "Oak Two-Top", category: "Dining", style: "Modern", width: 2, height: 2 },
  "walnut-four-top": { name: "Walnut Four-Top", category: "Dining", style: "Modern", width: 3, height: 3 },
};
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
        width: payload.readUInt32BE(0), height: payload.readUInt32BE(4), bitDepth: payload[8], colorType: payload[9],
        compression: payload[10], filter: payload[11], interlace: payload[12],
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
  const stride = header.width * 4;
  assert.equal(scanlines.length, (stride + 1) * header.height, `${path}: unexpected scanline length`);
  const rgba = Buffer.alloc(stride * header.height);
  for (let y = 0; y < header.height; y += 1) {
    const inputOffset = y * (stride + 1);
    const filter = scanlines[inputOffset];
    assert.ok(filter >= 0 && filter <= 4, `${path}: unsupported PNG filter ${filter}`);
    for (let x = 0; x < stride; x += 1) {
      const raw = scanlines[inputOffset + 1 + x];
      const outputOffset = y * stride + x;
      const left = x >= 4 ? rgba[outputOffset - 4] : 0;
      const up = y > 0 ? rgba[outputOffset - stride] : 0;
      const upperLeft = y > 0 && x >= 4 ? rgba[outputOffset - stride - 4] : 0;
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
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20), bitDepth: data[24], colorType: data[25] };
}

function alphaBounds(image) {
  let left = image.width;
  let top = image.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (image.rgba[(y * image.width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  assert.ok(right >= left && bottom >= top, "sprite must contain visible pixels");
  return { left, top, right: right + 1, bottom: bottom + 1 };
}

function manifestBounds(value) {
  const match = value.match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/);
  assert.ok(match, `invalid bounds: ${value}`);
  const [, width, height, left, top] = match.map(Number);
  return { left, top, right: left + width, bottom: top + height };
}

function assertTransparentOuterBorder(image, path) {
  for (let x = 0; x < image.width; x += 1) {
    assert.equal(image.rgba[x * 4 + 3], 0, `${path}: opaque top border at x=${x}`);
    assert.equal(image.rgba[((image.height - 1) * image.width + x) * 4 + 3], 0, `${path}: opaque bottom border at x=${x}`);
  }
  for (let y = 0; y < image.height; y += 1) {
    assert.equal(image.rgba[(y * image.width) * 4 + 3], 0, `${path}: opaque left border at y=${y}`);
    assert.equal(image.rgba[(y * image.width + image.width - 1) * 4 + 3], 0, `${path}: opaque right border at y=${y}`);
  }
}

test("furniture directional batch 006 has exact durable provenance and no transient payload", () => {
  const qa = json(QA_PATH);
  assert.equal(fileSha256(QA_PATH), EXPECTED_QA_SHA256);
  assert.equal(qa.batchId, "furniture-core-directional-006");
  assert.deepEqual(qa.assets, ASSETS);
  assert.equal(qa.artReviewStatus, "accepted");
  assert.equal(qa.productionComplete, false);
  assert.deepEqual(qa.repositoryPromotion, {
    status: "promoted-local-pending-remote-verification",
    runtimeFiles: 12,
    alphaSourceFiles: 12,
    contactSheets: 2,
    provenanceDocuments: 2,
    totalFiles: 28,
  });
  assert.equal(qa.remotePreservation, null);
  assert.deepEqual(qa.promotionScope, {
    runtimeFiles: 12, alphaSourceFiles: 12, contactSheets: 2, provenanceDocuments: 2, totalFiles: 28,
  });
  assert.equal(qa.productionCompletionBlockers.length, 2);
  assert.match(qa.productionCompletionBlockers[0], /elevated-isometric.*native Godot gameplay capture.*composite review/i);
  assert.match(qa.productionCompletionBlockers[1], /remote tree verification.*hosted CI.*pending/i);
  assert.doesNotMatch(JSON.stringify(qa), /\/tmp\//, "durable QA must not reference transient storage");
  assert.equal(fileSha256(qa.source.promptLog), qa.source.promptLogSha256);
  assert.equal(qa.source.promptLogSha256, "00eeb4c7c96f9f779036c309492d01e02f1da617e4f7231ca48c59245c79fed7");
  assert.equal(qa.source.processorSha256, "8bee1b015f9143e101e595f7ce04f9393242441acc5c574c609e3f6a81ec251e");
  assert.deepEqual(qa.source.rawSha256, {
    "local-art": "874c3fc6ba4cf026188cd187873a9e9f6432a220c025db50a1e359a233631c06",
    "furniture-oak-two-top": "897d9d0159323773ce93215c2f5e2101526d4ffda6d9b8d545fa31dfa8eb3059",
    "furniture-walnut-four-top": "15d38ea2af5fb40144e4bbace79b8c646ea6f3ae3efaf2d60c4c765ea8f31dc4",
  });
  assert.deepEqual(qa.source.alphaAtlasSha256, {
    "local-art": "3adc4f2baa8b6676908fe14116f0794b564fd7d2ce0a1dcc256f497c755adc25",
    "furniture-oak-two-top": "f0d5b4760e402de5067bfabd64ae2fd3bc28a41e8f5a5d929bbc2337e17f4508",
    "furniture-walnut-four-top": "0cdc6c0732de128bd35589195a7c78bcec965d5495918e3fdaeb6a471693e448",
  });
  assert.deepEqual(qa.rejectedAttempts, [
    {
      generatorOutputSha256: "8897fdaa3f4769d279678f5fb85e08dcb5c7206ea21ca9e1b7a9e5edf764b096",
      reason: "North and south placed the two-chair axis screen-horizontal instead of on either diagonal isometric ground-plane axis.",
    },
    {
      generatorOutputSha256: "13dcf7c96c24b4ce495535485b808e513d4a558814fcba5c4193e6032bd81885",
      reason: "Every cell was elevated and diagonal, but three cells repeated the same projected ground axis instead of alternating coherent north/south and east/west axes.",
    },
    {
      generatorOutputSha256: "da90162f0b2eed92a258c9a2a8a21250df88754b947851778ce03ee7d598601e",
      reason: "East/west were corrected to a falling diagonal, but north/south regressed to the rejected screen-horizontal axis.",
    },
    {
      generatorOutputSha256: "f179cf00f8b78fe72a83795178bd9a6b55d8a48862c209c0c8c6ef565e5ca0d9",
      reason: "North cell drifted toward a direct-overhead, screen-aligned tabletop while the other three cells retained the elevated isometric camera.",
    },
    {
      generatorOutputSha256: "3a09988e286d0b38cabe70c4ab1f8ba68994f9b3a48498da2d3e085913f2ffd5",
      reason: "The corrected north camera added a fifth chair, violating the fixed four-seat identity contract.",
    },
    {
      generatorOutputSha256: "9df28646f85d24fa8c21be212881bc948e54f1f18e78eaae2217db0bf9e6f477",
      reason: "The count correction restored four chairs but regressed north to the inconsistent near-overhead camera.",
    },
  ]);

  const expectedEvidence = [
    `${QA_ROOT}/contact-128-light.png`, `${QA_ROOT}/contact-627-dark.png`, `${QA_ROOT}/prompts.md`, `${QA_ROOT}/qa.json`,
    ...ASSETS.flatMap((asset) => DIRECTIONS.map((direction) => `${QA_ROOT}/alpha-source/${asset}-${direction}.png`)),
  ].sort();
  assert.deepEqual(repositoryFiles(QA_ROOT), expectedEvidence, "only accepted evidence may enter the QA directory");
});

test("furniture directional batch 006 matches catalog, alpha, pivot, and uniqueness contracts", () => {
  const qa = json(QA_PATH);
  const catalog = [
    ...json("packages/game-data/core/furniture.json"),
    ...json("packages/game-data/core/furniture-production.json"),
  ];
  const runtimeHashes = new Set();
  const runtimePixelHashes = new Set();
  for (const item of qa.items) {
    const definition = catalog.find((entry) => entry.id === item.catalogId);
    assert.ok(definition, `${item.catalogId}: missing catalog entry`);
    assert.deepEqual(
      { name: definition.name, category: definition.category, style: definition.style, width: definition.width, height: definition.height },
      EXPECTED_CATALOG[item.catalogId],
      `${item.catalogId}: catalog identity drift`,
    );
    assert.equal(item.assetId, definition.assetId ?? definition.id);
    assert.equal(item.name, definition.name);
    assert.deepEqual(item.footprint, [definition.width, definition.height]);
    assert.deepEqual(item.directions.map((entry) => entry.direction), DIRECTIONS);
    assert.equal(new Set(item.directions.map((entry) => entry.uniformScale)).size, 1, `${item.assetId}: directional scale drift`);
    for (const direction of item.directions) {
      assert.equal(direction.path, `apps/client-godot/assets/objects/directional/${item.assetId}/${direction.direction}.png`);
      assert.equal(direction.sourceAlphaPath, `${QA_ROOT}/alpha-source/${item.assetId}-${direction.direction}.png`);
      assert.ok(existsSync(absolute(direction.path)));
      assert.ok(existsSync(absolute(direction.sourceAlphaPath)));
      assert.equal(fileSha256(direction.path), direction.sha256, `${direction.path}: runtime hash drift`);
      assert.equal(fileSha256(direction.sourceAlphaPath), direction.sourceAlphaSha256, `${direction.sourceAlphaPath}: source hash drift`);
      assert.deepEqual(pngHeader(direction.sourceAlphaPath), { width: 627, height: 627, bitDepth: 8, colorType: 6 });
      const image = decodeRgbaPng(direction.path);
      assert.deepEqual([image.width, image.height], [627, 627]);
      assert.equal(sha256(image.rgba), direction.pixelSha256, `${direction.path}: decoded pixel hash drift`);
      const bounds = alphaBounds(image);
      assert.deepEqual(bounds, manifestBounds(direction.opaqueBounds), `${direction.path}: alpha bounds drift`);
      assert.deepEqual(direction.canvasPivot, [313.5, 590]);
      assert.equal(direction.floorContactBaselineY, 590);
      assert.equal(bounds.bottom, 590);
      assert.deepEqual(direction.transparentMargins, {
        left: bounds.left, right: 627 - bounds.right, top: bounds.top, bottom: 627 - bounds.bottom,
      });
      assert.equal(direction.transparentMargins.bottom, 37);
      assert.ok(Math.abs(direction.transparentMargins.left - direction.transparentMargins.right) <= 1, `${direction.path}: horizontal pivot drift`);
      assert.equal(direction.outerBorderAlphaMax, 0);
      assertTransparentOuterBorder(image, direction.path);
      assert.ok(!runtimeHashes.has(direction.sha256), `${direction.path}: duplicate runtime hash`);
      assert.ok(!runtimePixelHashes.has(direction.pixelSha256), `${direction.path}: duplicate pixel hash`);
      runtimeHashes.add(direction.sha256);
      runtimePixelHashes.add(direction.pixelSha256);
    }
  }
  assert.equal(runtimeHashes.size, 12);
  assert.equal(runtimePixelHashes.size, 12);

  const batchPrefixes = ASSETS.map((asset) => `apps/client-godot/assets/objects/directional/${asset}/`);
  const otherPaths = repositoryFiles("apps/client-godot/assets/objects/directional")
    .filter((path) => path.endsWith(".png") && !batchPrefixes.some((prefix) => path.startsWith(prefix)));
  const otherFileHashes = new Set(otherPaths.map(fileSha256));
  const otherPixelHashes = new Set(otherPaths.map((path) => sha256(decodeRgbaPng(path).rgba)));
  for (const hash of runtimeHashes) assert.ok(!otherFileHashes.has(hash), `runtime file hash duplicates earlier furniture: ${hash}`);
  for (const hash of runtimePixelHashes) assert.ok(!otherPixelHashes.has(hash), `runtime pixels duplicate earlier furniture: ${hash}`);
});

test("furniture directional batch 006 contact sheets are the exact reviewed evidence", () => {
  const qa = json(QA_PATH);
  assert.deepEqual(qa.contactSheets, [
    { path: `${QA_ROOT}/contact-627-dark.png`, purpose: "Exact 627px runtime candidates on a dark checkerboard", sha256: "9e533b4d4d5f1c7ad4b4a32ac2583d8fc205590c15feda8e20bd7c10ffe78cfc" },
    { path: `${QA_ROOT}/contact-128-light.png`, purpose: "Same runtime candidates reduced to 128px on a light checkerboard", sha256: "ac71047011fa4092b6e38517596e098ee7b14b4c8cb9c90e57a9da271d97728d" },
  ]);
  for (const contact of qa.contactSheets) assert.equal(fileSha256(contact.path), contact.sha256);
  assert.deepEqual(pngHeader(`${QA_ROOT}/contact-627-dark.png`), { width: 2508, height: 1989, bitDepth: 8, colorType: 2 });
  assert.deepEqual(pngHeader(`${QA_ROOT}/contact-128-light.png`), { width: 512, height: 450, bitDepth: 8, colorType: 2 });
  assert.match(qa.gates.visualReviewAtFullScale, /^pass:/);
  assert.match(qa.gates.visualReviewAtGameplayScale128px, /^pass:/);
  assert.equal(qa.gates.samePhysicalObjectAcrossDirections, "pass");
  assert.equal(qa.gates.fixedElevatedOrthographicIsometricCamera, "pass");
  assert.equal(qa.gates.proceduralOrDeterministicStandIn, false);
});
