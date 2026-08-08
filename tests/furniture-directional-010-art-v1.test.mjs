import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const QA_ROOT = "planning/art-qa/furniture-core-directional-010";
const QA_PATH = `${QA_ROOT}/qa.json`;
const EXPECTED_QA_SHA256 = "36baa714480b45a90b5940fd9925aaf3e0b858172139333850de0695f4ea7ea0";
const DIRECTIONS = ["north", "east", "south", "west"];
const ASSETS = ["furniture-prep-table-refrigerated", "furniture-walkin-rack", "furniture-dry-storage-rack"];
const PLACEMENT = { mount: "floor", occupancy: "blocking", serviceAccess: "adjacent" };
const EXPECTED_CATALOG = {
  "prep-table-refrigerated": { name: "Refrigerated Prep Table", category: "Kitchen", style: "Modern", width: 4, height: 2 },
  "walkin-rack": { name: "Walk-In Storage Rack", category: "Storage", style: "Modern", width: 3, height: 1 },
  "dry-storage-rack": { name: "Dry Storage Rack", category: "Storage", style: "Modern", width: 3, height: 1 },
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

test("furniture directional batch 010 has exact remote source and runtime-review provenance", () => {
  const qa = json(QA_PATH);
  const artPass = json("planning/art-pass-v2.json");
  const batch = artPass.batches.find((entry) => entry.id === "furniture-core-directional-010");
  assert.equal(fileSha256(QA_PATH), EXPECTED_QA_SHA256);
  assert.equal(qa.batchId, "furniture-core-directional-010");
  assert.deepEqual(qa.assets, ASSETS);
  assert.equal(qa.artReviewStatus, "accepted");
  assert.equal(qa.productionComplete, true);
  assert.deepEqual(qa.repositoryPromotion, {
    status: "remote-verified-production-complete",
    runtimeFiles: 12,
    alphaSourceFiles: 12,
    contactSheets: 2,
    provenanceDocuments: 2,
    totalFiles: 28,
  });
  assert.deepEqual(qa.remotePreservation, {
    commit: "0a6e36b40dada458e9f3c2af70d73f58477f494b",
    tree: "90d89bc60d20bb2fe287e2e03320c371d71ddc29",
    ci: "https://github.com/Maergoth/rro/actions/runs/31161334873",
    artifactId: 8987205444,
    artifactSha256: "62bfb9f325aedb59180ccaef9d5483007ed6926c364860b4901dadf850314913",
  });
  assert.deepEqual(batch, {
    id: "furniture-core-directional-010",
    assets: ASSETS,
    files: 28,
    qa: "passed",
    runtimeQa: "passed-native-gameplay-composite-attempt-008",
    sourcePromptMode: "built-in image generation; three separately prompted rigid elevated-isometric four-direction prep/storage atlases with two semantic corrections, strict chroma remediation, common-pivot normalization, and full/gameplay-scale contact review",
    remoteCommit: "0a6e36b40dada458e9f3c2af70d73f58477f494b",
    remoteTree: "90d89bc60d20bb2fe287e2e03320c371d71ddc29",
    ci: "https://github.com/Maergoth/rro/actions/runs/31161334873",
    artifactId: 8987205444,
    artifactSha256: "62bfb9f325aedb59180ccaef9d5483007ed6926c364860b4901dadf850314913",
    qaEvidence: "planning/art-qa/furniture-core-directional-010/contact-627-dark.png",
    qaManifest: QA_PATH,
    notes: "Refrigerated prep table, walk-in storage rack, and dry-storage rack are source-accepted, remotely preserved, visually accepted in native four-rotation gameplay review attempt 008, and backed by an exact remote review-evidence checkpoint with green hosted CI.",
  });
  assert.deepEqual(qa.promotionScope, {
    runtimeFiles: 12, alphaSourceFiles: 12, contactSheets: 2, provenanceDocuments: 2, totalFiles: 28,
  });
  assert.deepEqual(qa.productionCompletionBlockers, []);
  assert.doesNotMatch(JSON.stringify(qa), /\/tmp\/|\/workspace\//, "durable QA must not reference transient storage");
  assert.equal(fileSha256(qa.source.promptLog), qa.source.promptLogSha256);
  assert.equal(qa.source.chromaHelperSha256, "3f7b9b14ad5c90f37618bc1c16a039a2076abca12ddc41b3ae470e2b1cad6c0e");
  assert.deepEqual(qa.source.rawSha256, {
    "furniture-prep-table-refrigerated": "8e10e1e42b53e38b912f97a4698aaa8c4b3a4eb0a2738c2f945553631ae95c70",
    "furniture-walkin-rack": "a17fd1c8770312a9681a924f63a720115d8443ee1bbf52d334a270e451d02a00",
    "furniture-dry-storage-rack": "6704e7848e83ad0906db9fca63d0bbc42d7e6678809941e55f4119b41551802f",
  });
  assert.deepEqual(qa.source.alphaAtlasSha256, {
    "furniture-prep-table-refrigerated": "76b45eaf5583288bc6cc332ae102a8b4344f757c5846f5716367bd5d4d35f2ca",
    "furniture-walkin-rack": "e6c644be81eedf68def4533c5ea7965506222898a2af5a1e75b615f2b22419ba",
    "furniture-dry-storage-rack": "de39d1304f1430e80cbd714c7c8efe496caf8e331186e92047a018495501799c",
  });
  assert.deepEqual(qa.rejectedAttempts.map((entry) => entry.generatorOutputSha256), [
    "4b54042fbc248c81afe855299ea074eacd533c9d185dd2192e6446599e423f89",
    "b9816b19fc5f6f321f641c7f2658d09d0871508df3eb406ac07352c377959969",
    "ff1f0b39c43fb327c009c0c6fa1ed38f7583e1d097772274e038e81fdec285b8",
    "1bc2f82da9a87433aad7df2c88ac35744e1f42d9cb3cfc205ee0af74aff8efe7",
    "e057ec020e81e289af9890ba6f1302e1a610d8a5ab5bc053ad650f0b4546a8fc",
  ]);
  for (const rejection of qa.rejectedAttempts) assert.match(rejection.reason, /^Rejected/);
  const expectedEvidence = [
    `${QA_ROOT}/contact-128-light.png`, `${QA_ROOT}/contact-627-dark.png`, `${QA_ROOT}/prompts.md`, `${QA_ROOT}/qa.json`,
    ...ASSETS.flatMap((asset) => DIRECTIONS.map((direction) => `${QA_ROOT}/alpha-source/${asset}-${direction}.png`)),
  ].sort();
  assert.deepEqual(repositoryFiles(QA_ROOT), expectedEvidence, "only accepted evidence may enter the QA directory");
});

test("furniture directional batch 010 matches catalog, placement, raster, pivot, and uniqueness contracts", () => {
  const qa = json(QA_PATH);
  const catalog = [
    ...json("packages/game-data/core/furniture.json"),
    ...json("packages/game-data/core/furniture-production.json"),
  ];
  const runtimeHashes = new Set();
  const runtimePixelHashes = new Set();
  const runtimePerceptualHashes = new Set();
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
      assert.equal(sourcePixelHash, direction.sourceAlphaPixelSha256, `${direction.sourceAlphaPath}: decoded pixel hash drift`);
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
      assert.ok(!runtimePerceptualHashes.has(direction.dHash16), `${direction.path}: duplicate perceptual hash`);
      runtimeHashes.add(direction.sha256);
      runtimePixelHashes.add(direction.pixelSha256);
      runtimePerceptualHashes.add(direction.dHash16);
    }
  }
  assert.equal(runtimeHashes.size, 12);
  assert.equal(runtimePixelHashes.size, 12);
  assert.equal(runtimePerceptualHashes.size, 12);
  assert.equal(alphaHashes.size, 12);
  assert.equal(alphaPixelHashes.size, 12);

  const batchPrefixes = ASSETS.map((asset) => `apps/client-godot/assets/objects/directional/${asset}/`);
  const otherPaths = repositoryFiles("apps/client-godot/assets/objects/directional")
    .filter((path) => path.endsWith(".png") && !batchPrefixes.some((prefix) => path.startsWith(prefix)));
  assert.equal(otherPaths.length, 136, "repository comparison set drift");
  const otherFileHashes = new Set(otherPaths.map(fileSha256));
  const otherPixelHashes = new Set(otherPaths.map((path) => sha256(decodeRgbaPng(path).rgba)));
  for (const hash of runtimeHashes) assert.ok(!otherFileHashes.has(hash), `runtime file hash duplicates earlier art: ${hash}`);
  for (const hash of runtimePixelHashes) assert.ok(!otherPixelHashes.has(hash), `runtime pixels duplicate earlier art: ${hash}`);
});

test("furniture directional batch 010 contact sheets are the exact reviewed evidence", () => {
  const qa = json(QA_PATH);
  assert.deepEqual(qa.contactSheets, [
    { path: `${QA_ROOT}/contact-627-dark.png`, purpose: "Exact 627px runtime candidates on a dark checkerboard", sha256: "2f626c728bf724a0d509eefecb6219bc3fbb29b7c4dd5def51047f1d3c778e94" },
    { path: `${QA_ROOT}/contact-128-light.png`, purpose: "Same runtime candidates reduced to 128px on a light checkerboard", sha256: "a250546037f9e9ac080ad84e378df1104aef4d71c883d40e5e938d3de09a7c7b" },
  ]);
  for (const contact of qa.contactSheets) assert.equal(fileSha256(contact.path), contact.sha256);
  assert.deepEqual(pngHeader(`${QA_ROOT}/contact-627-dark.png`), { width: 2508, height: 1989, bitDepth: 8, colorType: 2 });
  assert.deepEqual(pngHeader(`${QA_ROOT}/contact-128-light.png`), { width: 512, height: 450, bitDepth: 8, colorType: 2 });
  assert.match(qa.gates.visualReviewAtFullScale, /^pass:/);
  assert.match(qa.gates.visualReviewAtGameplayScale128px, /^pass:/);
  assert.equal(qa.gates.samePhysicalObjectAcrossDirections, "pass");
  assert.equal(qa.gates.fixedElevatedOrthographicIsometricCamera, "pass");
  assert.equal(qa.gates.repositoryDirectionalPngsCompared, 112);
  assert.equal(qa.gates.exactFileCollisionsAgainstRepository, 0);
  assert.equal(qa.gates.exactPixelCollisionsAgainstRepository, 0);
  assert.equal(qa.gates.exactPerceptualHashCollisionsAgainstRepository, 0);
  assert.equal(qa.gates.proceduralOrDeterministicStandIn, false);
});
