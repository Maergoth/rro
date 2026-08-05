import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const QA_ROOT = "planning/art-qa/furniture-core-directional-008";
const QA_PATH = `${QA_ROOT}/qa.json`;
const EXPECTED_QA_SHA256 = "d16d7611d86829a58e761ad14eb037b0914b8f666f044fd58b521b07895a76ad";
const DIRECTIONS = ["north", "east", "south", "west"];
const ASSETS = ["furniture-host-stand-pro", "furniture-server-station-pro", "furniture-pos-terminal"];
const PLACEMENT = { mount: "floor", occupancy: "blocking", serviceAccess: "adjacent" };
const EXPECTED_CATALOG = {
  "host-stand-pro": { name: "Reservation Host Stand", category: "Service", style: "Modern", width: 2, height: 2 },
  "server-station-pro": { name: "Integrated Server Station", category: "Service", style: "Modern", width: 3, height: 2 },
  "pos-terminal": { name: "Commercial POS Terminal", category: "Service", style: "Modern", width: 1, height: 1 },
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
    `${path}: expected non-interlaced 8-bit sRGBA`,
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
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
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

function visibleMagentaFringePixels(image) {
  let count = 0;
  for (let index = 0; index < image.rgba.length; index += 4) {
    const red = image.rgba[index];
    const green = image.rgba[index + 1];
    const blue = image.rgba[index + 2];
    const alpha = image.rgba[index + 3];
    if (alpha > 2 && red > 150 && blue > 150 && green < 135 && red + blue > green * 2.6) count += 1;
  }
  return count;
}

test("furniture directional batch 008 has exact durable local provenance", () => {
  const qa = json(QA_PATH);
  assert.equal(fileSha256(QA_PATH), EXPECTED_QA_SHA256);
  assert.equal(qa.batchId, "furniture-core-directional-008");
  assert.deepEqual(qa.assets, ASSETS);
  assert.equal(qa.artReviewStatus, "accepted");
  assert.equal(qa.productionComplete, false);
  assert.deepEqual(qa.repositoryPromotion, {
    status: "local-verified-pending-remote",
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
  assert.match(qa.productionCompletionBlockers[0], /four-rotation native Godot gameplay composite review/i);
  assert.match(qa.productionCompletionBlockers[1], /remotely preserved.*GitHub.*green hosted CI/i);
  assert.doesNotMatch(JSON.stringify(qa), /\/tmp\/|\/workspace\//, "durable QA must not reference transient storage");
  assert.equal(qa.quarantineArchive.sha256, "38a0a675208916f9544909ad12f429ce4675bc7b72de60451ae913e6a357c396");
  assert.match(qa.quarantineArchive.safetyReview, /^pass:/);
  assert.equal(fileSha256(qa.source.promptLog), qa.source.promptLogSha256);
  assert.equal(qa.source.quarantinedValidatorSha256, "380227fee71ed3e2fde23d0752d2fe9671c8ea84043dcb777d61565620cadae6");
  assert.equal(qa.source.quarantinedFringeSanitizerSha256, "88c393774fd2441f10e4f4a89af810608d142cbcf9eb4808389f8765e103d339");
  assert.deepEqual(qa.excludedQuarantinePayload, {
    rawAtlases: 3,
    alphaAtlases: 3,
    rejectedBinaries: 5,
    processScripts: 2,
    policy: "Raw, rejected, and process binaries remain outside the repository; exact source, intermediate, and rejection hashes plus reasons are retained above.",
  });
  assert.deepEqual(qa.rejectedAttempts.map((entry) => entry.generatorOutputSha256), [
    "921c94820db1ad4efa432c5e9e8df89c439f26e9c7d8424402bba6c3b5604fde",
    "f2f09f778cb456ca3eff31276462093ad4db3ea42d5e5fe0bd6f105096660f19",
    "e0b5dc363914e7ab86095b04986b7cbc699936df0d686d25e96b9c4ece4bfa1a",
    "dbb40840cb35c2c2ad7aadf83eb9513310396c2152fb72651baa243f0c6bf2bd",
    "c3d9629e1bdd9a811171ace14ddcc359606adb0f937e64a0d35935afc6f8e1ef",
  ]);
  const expectedEvidence = [
    `${QA_ROOT}/contact-128-light.png`, `${QA_ROOT}/contact-627-dark.png`, `${QA_ROOT}/prompts.md`, `${QA_ROOT}/qa.json`,
    ...ASSETS.flatMap((asset) => DIRECTIONS.map((direction) => `${QA_ROOT}/alpha-source/${asset}-${direction}.png`)),
  ].sort();
  assert.deepEqual(repositoryFiles(QA_ROOT), expectedEvidence, "only accepted evidence may enter the QA directory");
});

test("furniture directional batch 008 matches catalog, placement, raster, pivot, and uniqueness contracts", () => {
  const qa = json(QA_PATH);
  const catalog = [
    ...json("packages/game-data/core/furniture.json"),
    ...json("packages/game-data/core/furniture-production.json"),
  ];
  const runtimeHashes = new Set();
  const runtimePixelHashes = new Set();
  const alphaHashes = new Set();
  const alphaPixelHashes = new Set();
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
    assert.deepEqual(item.placement, PLACEMENT);
    assert.deepEqual(definition.placement, PLACEMENT);
    assert.deepEqual(item.directions.map((entry) => entry.direction), DIRECTIONS);
    assert.equal(new Set(item.directions.map((entry) => entry.uniformScale)).size, 1, `${item.assetId}: directional scale drift`);
    for (const direction of item.directions) {
      assert.equal(direction.path, `apps/client-godot/assets/objects/directional/${item.assetId}/${direction.direction}.png`);
      assert.equal(direction.sourceAlphaPath, `${QA_ROOT}/alpha-source/${item.assetId}-${direction.direction}.png`);
      assert.ok(existsSync(absolute(direction.path)));
      assert.ok(existsSync(absolute(direction.sourceAlphaPath)));
      assert.equal(fileSha256(direction.path), direction.sha256, `${direction.path}: runtime hash drift`);
      assert.equal(fileSha256(direction.sourceAlphaPath), direction.sourceAlphaSha256, `${direction.sourceAlphaPath}: source hash drift`);
      const source = decodeRgbaPng(direction.sourceAlphaPath);
      assert.deepEqual([source.width, source.height], [627, 627], `${direction.sourceAlphaPath}: source dimensions drift`);
      const sourcePixelHash = sha256(source.rgba);
      assert.ok(!alphaHashes.has(direction.sourceAlphaSha256), `${direction.sourceAlphaPath}: duplicate source file hash`);
      assert.ok(!alphaPixelHashes.has(sourcePixelHash), `${direction.sourceAlphaPath}: duplicate source pixels`);
      alphaHashes.add(direction.sourceAlphaSha256);
      alphaPixelHashes.add(sourcePixelHash);
      const image = decodeRgbaPng(direction.path);
      assert.deepEqual([image.width, image.height], [627, 627]);
      assert.equal(sha256(image.rgba), direction.pixelSha256, `${direction.path}: decoded pixel hash drift`);
      const bounds = alphaBounds(image);
      assert.deepEqual(bounds, manifestBounds(direction.opaqueBounds), `${direction.path}: alpha bounds drift`);
      assert.equal(bounds.bottom, 590, `${direction.path}: floor-contact baseline drift`);
      assert.equal(627 - bounds.bottom, 37, `${direction.path}: transparent bottom margin drift`);
      assert.ok(Math.abs(bounds.left - (627 - bounds.right)) <= 1, `${direction.path}: horizontal pivot drift`);
      assertTransparentOuterBorder(image, direction.path);
      assert.equal(visibleMagentaFringePixels(image), 0, `${direction.path}: visible key-color fringe`);
      assert.ok(!runtimeHashes.has(direction.sha256), `${direction.path}: duplicate runtime hash`);
      assert.ok(!runtimePixelHashes.has(direction.pixelSha256), `${direction.path}: duplicate runtime pixels`);
      runtimeHashes.add(direction.sha256);
      runtimePixelHashes.add(direction.pixelSha256);
    }
  }
  assert.equal(runtimeHashes.size, 12);
  assert.equal(runtimePixelHashes.size, 12);
  assert.equal(alphaHashes.size, 12);
  assert.equal(alphaPixelHashes.size, 12);

  const batchPrefixes = ASSETS.map((asset) => `apps/client-godot/assets/objects/directional/${asset}/`);
  const otherPaths = repositoryFiles("apps/client-godot/assets/objects/directional")
    .filter((path) => path.endsWith(".png") && !batchPrefixes.some((prefix) => path.startsWith(prefix)));
  const otherFileHashes = new Set(otherPaths.map(fileSha256));
  const otherPixelHashes = new Set(otherPaths.map((path) => sha256(decodeRgbaPng(path).rgba)));
  for (const hash of runtimeHashes) assert.ok(!otherFileHashes.has(hash), `runtime file hash duplicates earlier art: ${hash}`);
  for (const hash of runtimePixelHashes) assert.ok(!otherPixelHashes.has(hash), `runtime pixels duplicate earlier art: ${hash}`);
});

test("furniture directional batch 008 contact sheets are the exact reviewed evidence", () => {
  const qa = json(QA_PATH);
  assert.deepEqual(qa.contactSheets, [
    { path: `${QA_ROOT}/contact-627-dark.png`, purpose: "Exact 627px runtime candidates on a dark checkerboard", sha256: "9bed47f479e35a458114121c024d6ed5b682b4defaa672b70a7e79eafa2a88ad" },
    { path: `${QA_ROOT}/contact-128-light.png`, purpose: "Same runtime candidates reduced to 128px on a light checkerboard", sha256: "09f1e84d5348b6c60c3bef50cdd726de1c51a55d64fc23b3675328044ca37f9e" },
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
