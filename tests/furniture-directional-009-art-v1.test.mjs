import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const QA_ROOT = "planning/art-qa/furniture-core-directional-009";
const QA_PATH = `${QA_ROOT}/qa.json`;
const EXPECTED_QA_SHA256 = "42f4cca63d7e15abbdd208d70f89e3da413e698611b0e9fdeacb079c32d007c2";
const DIRECTIONS = ["north", "east", "south", "west"];
const ASSETS = ["furniture-expo-pass-heated", "furniture-plancha-commercial", "furniture-convection-oven"];
const PLACEMENT = { mount: "floor", occupancy: "blocking", serviceAccess: "adjacent" };
const EXPECTED_CATALOG = {
  "expo-pass-heated": { name: "Heated Expo Pass", category: "Kitchen", style: "Modern", width: 4, height: 2 },
  "plancha-commercial": { name: "Commercial Plancha", category: "Kitchen", style: "Modern", width: 3, height: 2 },
  "convection-oven": { name: "Convection Oven", category: "Kitchen", style: "Modern", width: 3, height: 3 },
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

test("furniture directional batch 009 has exact durable remote and runtime provenance", () => {
  const qa = json(QA_PATH);
  const artPass = json("planning/art-pass-v2.json");
  const batch = artPass.batches.find((entry) => entry.id === "furniture-core-directional-009");
  assert.equal(fileSha256(QA_PATH), EXPECTED_QA_SHA256);
  assert.equal(qa.batchId, "furniture-core-directional-009");
  assert.deepEqual(qa.assets, ASSETS);
  assert.equal(qa.artReviewStatus, "accepted");
  assert.equal(qa.productionComplete, true);
  assert.deepEqual(qa.repositoryPromotion, {
    status: "remote-verified",
    runtimeFiles: 12,
    alphaSourceFiles: 12,
    contactSheets: 2,
    provenanceDocuments: 2,
    totalFiles: 28,
  });
  assert.deepEqual(qa.remotePreservation, {
    commit: "447a203e8f6d2dc1f014a49c3dc1f0b57b442e11",
    tree: "262ecc0c84e6a79dc1194d38de6cd8aa0dcd3a3f",
    ci: "https://github.com/Maergoth/rro/actions/runs/31015657101",
    artifactId: 8934364142,
    artifactSha256: "529ae6a0791f38c0fb9d9ba1522eb4c1a3044e19c81dcdf2d453ab202da8d7ce",
  });
  assert.deepEqual(batch, {
    id: "furniture-core-directional-009",
    assets: ASSETS,
    files: 28,
    qa: "passed",
    runtimeQa: "passed-native-gameplay-composite-attempt-007",
    sourcePromptMode: "built-in image generation; three separately prompted rigid elevated-isometric four-direction kitchen equipment atlases with rejected attempts quarantined, chroma removal, common-pivot normalization, and full/gameplay-scale contact review",
    remoteCommit: "447a203e8f6d2dc1f014a49c3dc1f0b57b442e11",
    remoteTree: "262ecc0c84e6a79dc1194d38de6cd8aa0dcd3a3f",
    ci: "https://github.com/Maergoth/rro/actions/runs/31015657101",
    artifactId: 8934364142,
    artifactSha256: "529ae6a0791f38c0fb9d9ba1522eb4c1a3044e19c81dcdf2d453ab202da8d7ce",
    qaEvidence: "planning/art-qa/furniture-core-directional-009/contact-627-dark.png",
    qaManifest: QA_PATH,
    notes: "Heated expo pass, commercial plancha, and convection oven are source-accepted, remotely preserved, and accepted with every other present directional identity in exact native four-rotation gameplay review attempt 007; that review evidence is also remotely preserved with green Windows and Ubuntu CI.",
  });
  assert.deepEqual(qa.promotionScope, {
    runtimeFiles: 12, alphaSourceFiles: 12, contactSheets: 2, provenanceDocuments: 2, totalFiles: 28,
  });
  assert.deepEqual(qa.productionCompletionBlockers, []);
  assert.doesNotMatch(JSON.stringify(qa), /\/tmp\/|\/workspace\//, "durable QA must not reference transient storage");
  assert.equal(qa.quarantineArchive.sha256, "489aba694c71206f91f10251d0b937a958bcb333b4907adad0f4c76122ced72e");
  assert.equal(qa.quarantineArchive.memberCount, 121);
  assert.match(qa.quarantineArchive.safetyReview, /^pass:/);
  assert.equal(fileSha256(qa.source.promptLog), qa.source.promptLogSha256);
  assert.equal(qa.source.quarantinedChromaHelperSha256, "3f7b9b14ad5c90f37618bc1c16a039a2076abca12ddc41b3ae470e2b1cad6c0e");
  assert.equal(qa.source.quarantinedProcessorSha256, "4312ccd0182280fa42ef7794dff32704102dd3998cdd991db14e93f2762d18d3");
  assert.equal(qa.source.quarantinedValidatorSha256, "b31f921fb1f01b69ac259c23480b5213060957db0a7bf8aa188530c5e87c0b04");
  assert.deepEqual(qa.source.rawSha256, {
    "furniture-expo-pass-heated": "7381c954cdcc0c8ec7642ca51355b369c4a27ff70c3d4410ba451ff196ad6dc9",
    "furniture-plancha-commercial": "b8141ba6002ae46464604ccdc7d3f31ab0f4d4229e9565e577a3a4df8cb96371",
    "furniture-convection-oven": "1c41531e61c4ca5c6be5d187ab21ea1437e526cbf5b1bee2ad1bb2d7c676d0ad",
  });
  assert.deepEqual(qa.source.alphaAtlasSha256, {
    "furniture-expo-pass-heated": "60672228bd72a5f4c7d66d04ef79736aa095b2502fc2e6656cb5047a7eb3cf9a",
    "furniture-plancha-commercial": "a5fc27b8e77e365f117048bcf46eb78bdf89a1d921c6806686e9f792253ac71a",
    "furniture-convection-oven": "de301bfb65e376b5d259cf1f89326d2eb6ad7eb8adbc2bb2f4a014b8f01863ef",
  });
  assert.deepEqual(qa.excludedQuarantinePayload, {
    rawAtlases: 3,
    rawAttemptBinaries: 6,
    alphaAtlases: 3,
    alphaAttemptBinaries: 4,
    rejectedPayloadFiles: 38,
    processScripts: 4,
    policy: "Raw, rejected, alpha-atlas, process, and validation binaries remain outside the repository; exact accepted source hashes, attempt hashes, rejection hashes, and reasons are retained above.",
  });
  assert.deepEqual(qa.rejectedAttempts.map((entry) => entry.generatorOutputSha256), [
    "603a57d27674ee1e34c379eefbbda60123528fc4eaf8c0f0d314a792a55f06b4",
    "13c88577f764bc6e398bb7be792c31c33f89749b6a285a923f37b3a36347ac67",
    "80d31153e204a8532d9753a6286388caaf7ab6121ede4a44998a0556a68ada87",
    "e3c221f724ff3046d38723ff7daebeea4d281b08c4603ceae4fe6006f74c5ced",
    "60672228bd72a5f4c7d66d04ef79736aa095b2502fc2e6656cb5047a7eb3cf9a",
  ]);
  assert.equal(sha256(Buffer.from(JSON.stringify(qa.rejectedAttempts))), "ae2167c391fed37b19fa56f5ccfea5665c12b1a85edd1f6116e315dc2cd3aef9");
  for (const rejection of qa.rejectedAttempts) assert.match(rejection.reason, /^Rejected/);
  const expectedEvidence = [
    `${QA_ROOT}/contact-128-light.png`, `${QA_ROOT}/contact-627-dark.png`, `${QA_ROOT}/prompts.md`, `${QA_ROOT}/qa.json`,
    ...ASSETS.flatMap((asset) => DIRECTIONS.map((direction) => `${QA_ROOT}/alpha-source/${asset}-${direction}.png`)),
  ].sort();
  assert.deepEqual(repositoryFiles(QA_ROOT), expectedEvidence, "only accepted evidence may enter the QA directory");
});

test("furniture directional batch 009 matches catalog, placement, raster, pivot, and uniqueness contracts", () => {
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

test("furniture directional batch 009 contact sheets are the exact reviewed evidence", () => {
  const qa = json(QA_PATH);
  assert.deepEqual(qa.contactSheets, [
    { path: `${QA_ROOT}/contact-627-dark.png`, purpose: "Exact 627px runtime candidates on a dark checkerboard", sha256: "ddb4f8d272bd5cca6388d1b745f6445ac15c71368f61eb2a9ec9de9e19351f4d" },
    { path: `${QA_ROOT}/contact-128-light.png`, purpose: "Same runtime candidates reduced to 128px on a light checkerboard", sha256: "faa186b634702657819fee597f38abcbe8fcce2d85927c1cffb67b59d35de021" },
  ]);
  for (const contact of qa.contactSheets) assert.equal(fileSha256(contact.path), contact.sha256);
  assert.deepEqual(pngHeader(`${QA_ROOT}/contact-627-dark.png`), { width: 2508, height: 1989, bitDepth: 8, colorType: 2 });
  assert.deepEqual(pngHeader(`${QA_ROOT}/contact-128-light.png`), { width: 512, height: 450, bitDepth: 8, colorType: 2 });
  assert.match(qa.gates.visualReviewAtFullScale, /^pass:/);
  assert.match(qa.gates.visualReviewAtGameplayScale128px, /^pass:/);
  assert.equal(qa.gates.samePhysicalObjectAcrossDirections, "pass");
  assert.equal(qa.gates.fixedElevatedOrthographicIsometricCamera, "pass");
  assert.equal(qa.gates.repositoryDirectionalPngsCompared, 100);
  assert.equal(qa.gates.exactFileCollisionsAgainstRepository, 0);
  assert.equal(qa.gates.exactPixelCollisionsAgainstRepository, 0);
  assert.equal(qa.gates.exactPerceptualHashCollisionsAgainstRepository, 0);
  assert.equal(qa.gates.proceduralOrDeterministicStandIn, false);
});
