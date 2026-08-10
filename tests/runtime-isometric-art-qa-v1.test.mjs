import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const reviewPaths = [
  "planning/art-qa/runtime-isometric-integration-001/attempt-001/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-002/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-003/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-004/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-005/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-006/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-007/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-008/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-009/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-010/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-011/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-012/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-013/review.json",
];
const [attempt001, attempt002, attempt003, attempt004, attempt005, attempt006, attempt007, attempt008, attempt009, attempt010, attempt011, attempt012, attempt013] = reviewPaths.map((path) => JSON.parse(read(path).toString("utf8")));

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

test("native isometric attempt 001 preserves the exact remote evidence and failed verdict", () => {
  assert.equal(attempt001.source.remoteCommit, "00f9a36dccf35ca2c82dbf2689d982749ab27f5c");
  assert.equal(attempt001.source.remoteTree, "7c95a33e679232e99cfc9cb472abfbb478fa3ae9");
  assert.equal(attempt001.source.artifactId, 8927474963);
  assert.equal(attempt001.source.artifactSha256, "933842483b6a38a31eb9da837b665bd1799a320e343adb59b126564f815edbfd");
  assert.equal(attempt001.visualReview.status, "failed-needs-remediation");
  assert.equal(attempt001.visualReview.productionComplete, false);
  assert.deepEqual(attempt001.visualReview.acceptedAssetIds, []);
  assert.equal(attempt001.visualReview.provisionalFloorAssetPasses.length, 16);
  assert.deepEqual(attempt001.visualReview.blockers.map((entry) => entry.id), ["mounted-object-anchor-contract", "world-label-collision"]);
});

test("native isometric attempt 002 accepts exactly sixteen floor assets without hiding mounted blockers", () => {
  assert.equal(attempt002.source.remoteCommit, "24781e2f08acc97c0189d05af3b6a72285f2cfbd");
  assert.equal(attempt002.source.remoteTree, "8e9eba95e0c54de9e4513bc6474ff5c5c9722778");
  assert.equal(attempt002.source.artifactId, 8927966443);
  assert.equal(attempt002.source.artifactSha256, "fba441164880464b7a240bcc10ce1a02e70f688092c7e38e4d713214013ebca8");
  assert.equal(attempt002.visualReview.status, "passed-partial-floor-assets");
  assert.equal(attempt002.visualReview.productionComplete, false);
  assert.equal(attempt002.visualReview.acceptedAssetIds.length, 16);
  assert.deepEqual(attempt002.visualReview.rejectedAssetIds, ["local-art", "pendants", "plants"]);
  assert.deepEqual(attempt002.visualReview.blockers.map((entry) => entry.id), ["mounted-object-anchor-contract"]);
});

test("native isometric attempt 003 accepts exactly nineteen floor assets without hiding mounted blockers", () => {
  assert.equal(attempt003.source.remoteCommit, "98e479eaa5afed6c95e0abe1026dfcf8e09e062a");
  assert.equal(attempt003.source.remoteTree, "bcfcb076d26c1d3b8a973dbe601c6a921563348b");
  assert.equal(attempt003.source.artifactId, 8929624396);
  assert.equal(attempt003.source.artifactSha256, "ee92f4309c99bd6b580550e1c5f31c91f45f2107c8e053e49ffc980788a80cd8");
  assert.equal(attempt003.visualReview.status, "passed-partial-floor-assets");
  assert.equal(attempt003.visualReview.productionComplete, false);
  assert.equal(attempt003.visualReview.acceptedAssetIds.length, 19);
  assert.ok(attempt003.visualReview.acceptedAssetIds.includes("furniture-banquette-section"));
  assert.ok(attempt003.visualReview.acceptedAssetIds.includes("furniture-commercial-chair"));
  assert.ok(attempt003.visualReview.acceptedAssetIds.includes("furniture-premium-chair"));
  assert.deepEqual(attempt003.visualReview.rejectedAssetIds, ["local-art", "pendants", "plants"]);
  assert.deepEqual(attempt003.visualReview.blockers.map((entry) => entry.id), ["mounted-object-anchor-contract"]);
});

test("native isometric attempt 004 accepts exactly twenty-two floor assets without hiding mounted blockers", () => {
  assert.equal(attempt004.source.remoteCommit, "9749406830ce8fa0139ff479c98a67d5d38c6882");
  assert.equal(attempt004.source.remoteTree, "4c0becd361bc5c6fa722caa3252f7588e512f898");
  assert.equal(attempt004.source.artifactId, 8931752495);
  assert.equal(attempt004.source.artifactSha256, "25f2b0e993ad9c283d5be84dd2e08a5763d5b1c1931ed704a8dc8daa27a25332");
  assert.equal(attempt004.visualReview.status, "passed-partial-floor-assets");
  assert.equal(attempt004.visualReview.productionComplete, false);
  assert.equal(attempt004.visualReview.acceptedAssetIds.length, 22);
  assert.ok(attempt004.visualReview.acceptedAssetIds.includes("furniture-host-stand-pro"));
  assert.ok(attempt004.visualReview.acceptedAssetIds.includes("furniture-pos-terminal"));
  assert.ok(attempt004.visualReview.acceptedAssetIds.includes("furniture-server-station-pro"));
  assert.deepEqual(attempt004.visualReview.rejectedAssetIds, ["local-art", "pendants", "plants"]);
  assert.deepEqual(attempt004.visualReview.blockers.map((entry) => entry.id), ["mounted-object-anchor-contract"]);
});

test("native isometric attempt 005 preserves the failed mounted-context verdict", () => {
  assert.equal(attempt005.source.remoteCommit, "f6014d2e647ba8b6333279075cfbace0d7857bec");
  assert.equal(attempt005.source.remoteTree, "f9284c2bc7202a410b3d00399791b635ffdefe6e");
  assert.equal(attempt005.source.artifactId, 8933468440);
  assert.equal(attempt005.source.artifactSha256, "953e1ec3f134cfef827e7f97afd0750c942521244dfcf3ec84004f9b1b8aa74e");
  assert.equal(attempt005.visualReview.status, "failed-mounted-visual-context");
  assert.equal(attempt005.visualReview.productionComplete, false);
  assert.equal(attempt005.visualReview.acceptedAssetIds.length, 22);
  assert.deepEqual(attempt005.visualReview.rejectedAssetIds, ["local-art", "pendants", "plants"]);
  assert.deepEqual(attempt005.visualReview.blockers.map((entry) => entry.id), ["visible-wall-plane-and-room-facing-depth", "ceiling-context-and-elevation"]);
});

test("native isometric attempt 006 accepts twenty-seven present assets and isolates the oven occlusion", () => {
  assert.equal(attempt006.source.remoteCommit, "cb1cd7f5c29d953abe94cb27a70891ede9d842c8");
  assert.equal(attempt006.source.remoteTree, "f73c8171ba200f58eac682e4fc7cfb43f6825200");
  assert.equal(attempt006.source.artifactId, 8934792593);
  assert.equal(attempt006.source.artifactSha256, "663b165ee0b1622924d2c9ae5df3c76e451432690b38f6e41f4205b38bb404cb");
  assert.equal(attempt006.visualReview.status, "passed-partial-present-assets");
  assert.equal(attempt006.visualReview.productionComplete, false);
  assert.equal(attempt006.visualReview.acceptedAssetIds.length, 27);
  assert.deepEqual(attempt006.visualReview.rejectedAssetIds, ["furniture-convection-oven"]);
  assert.deepEqual(attempt006.visualReview.blockers.map((entry) => entry.id), ["convection-oven-foreground-wall-occlusion"]);
});

test("native isometric attempt 007 accepts all twenty-eight present assets without blockers", () => {
  assert.equal(attempt007.source.remoteCommit, "f2cc4afc3dca51ae468d9c95e2b036dedd8c3ee5");
  assert.equal(attempt007.source.remoteTree, "3307f0ba9abf9505af1e3410895da28a890d7cdf");
  assert.equal(attempt007.source.artifactId, 8935706427);
  assert.equal(attempt007.source.artifactSha256, "640bc60b9e699dbe3ce84c05ce5258f2a60336f6d97d1d0b95849636fd1d2376");
  assert.equal(attempt007.visualReview.status, "passed-all-present-assets");
  assert.equal(attempt007.visualReview.productionComplete, false, "the whole-game art catalog remains incomplete");
  assert.equal(attempt007.visualReview.acceptedAssetIds.length, 28);
  assert.deepEqual(attempt007.visualReview.rejectedAssetIds, []);
  assert.deepEqual(attempt007.visualReview.blockers, []);
});

test("native isometric attempt 008 accepts all thirty-one present assets without blockers", () => {
  assert.equal(attempt008.source.remoteCommit, "0a6e36b40dada458e9f3c2af70d73f58477f494b");
  assert.equal(attempt008.source.remoteTree, "90d89bc60d20bb2fe287e2e03320c371d71ddc29");
  assert.equal(attempt008.source.artifactId, 8987205444);
  assert.equal(attempt008.source.artifactSha256, "62bfb9f325aedb59180ccaef9d5483007ed6926c364860b4901dadf850314913");
  assert.equal(attempt008.visualReview.status, "passed-all-present-assets");
  assert.equal(attempt008.visualReview.productionComplete, false, "the review evidence is not remotely preserved yet");
  assert.equal(attempt008.visualReview.acceptedAssetIds.length, 31);
  assert.ok(attempt008.visualReview.acceptedAssetIds.includes("furniture-prep-table-refrigerated"));
  assert.ok(attempt008.visualReview.acceptedAssetIds.includes("furniture-walkin-rack"));
  assert.ok(attempt008.visualReview.acceptedAssetIds.includes("furniture-dry-storage-rack"));
  assert.deepEqual(attempt008.visualReview.rejectedAssetIds, []);
  assert.deepEqual(attempt008.visualReview.blockers, []);
});

test("native isometric attempt 009 accepts all thirty-four present assets without blockers", () => {
  assert.equal(attempt009.source.remoteCommit, "d0d4f9111e23b488c8886bd773f75eb81c2dac38");
  assert.equal(attempt009.source.remoteTree, "858d1f601b278e59ce34187fd68374ef9a076c88");
  assert.equal(attempt009.source.artifactId, 8996352192);
  assert.equal(attempt009.source.artifactSha256, "3b9f431c59473ccf9524de03454859928b7430601ef1c7c73c29ff11f353e072");
  assert.equal(attempt009.visualReview.status, "passed-all-present-assets");
  assert.equal(attempt009.visualReview.productionComplete, false, "the review evidence is not remotely preserved yet");
  assert.equal(attempt009.visualReview.acceptedAssetIds.length, 34);
  assert.ok(attempt009.visualReview.acceptedAssetIds.includes("furniture-chemical-cabinet"));
  assert.ok(attempt009.visualReview.acceptedAssetIds.includes("furniture-dish-machine-high-temp"));
  assert.ok(attempt009.visualReview.acceptedAssetIds.includes("furniture-three-comp-sink"));
  assert.deepEqual(attempt009.visualReview.rejectedAssetIds, []);
  assert.deepEqual(attempt009.visualReview.blockers, []);
});

test("native isometric attempt 010 accepts all thirty-seven present assets without blockers", () => {
  assert.equal(attempt010.source.remoteCommit, "dd542537e372b7d726a375e48540c7ca066caaf4");
  assert.equal(attempt010.source.remoteTree, "51db0b01d7719e0d4474afeb4f5bc0484cbccc84");
  assert.equal(attempt010.source.artifactId, 9014716339);
  assert.equal(attempt010.source.artifactSha256, "6ac765908a7871ee29e06f4407ef7e2b74ffcdbccace6e0ab5ac634e8774e310");
  assert.equal(attempt010.visualReview.status, "passed-all-present-assets");
  assert.equal(attempt010.visualReview.productionComplete, false, "the review evidence is not remotely preserved yet");
  assert.equal(attempt010.visualReview.acceptedAssetIds.length, 37);
  assert.ok(attempt010.visualReview.acceptedAssetIds.includes("furniture-linen-storage"));
  assert.ok(attempt010.visualReview.acceptedAssetIds.includes("furniture-water-station"));
  assert.ok(attempt010.visualReview.acceptedAssetIds.includes("furniture-wet-floor-station"));
  assert.deepEqual(attempt010.visualReview.rejectedAssetIds, []);
  assert.deepEqual(attempt010.visualReview.blockers, []);
});

test("native isometric attempt 011 accepts only the three fixed-camera corrected assets", () => {
  assert.equal(attempt011.source.remoteCommit, "a22e5055646184cef0d4d34ebb2a66cc5435c052");
  assert.equal(attempt011.source.remoteTree, "1a42c3e55c04b03b4a0e14c0189395195f35d8d7");
  assert.equal(attempt011.source.artifactId, 9030941364);
  assert.equal(attempt011.source.artifactSha256, "41c3b80ed02da62ff97fcb9b781fb3bd7087fac96bd0800538817c096a371cb3");
  assert.equal(attempt011.automatedGates.fixedCameraContractPresent, true);
  assert.equal(attempt011.visualReview.status, "passed-camera-conformant-assets");
  assert.equal(attempt011.visualReview.productionComplete, false, "the exact review evidence is not remotely preserved yet");
  assert.deepEqual(attempt011.visualReview.acceptedAssetIds, ["furniture-essential-cafe-two-top", "furniture-manager-console", "furniture-office-desk"]);
  assert.deepEqual(attempt011.visualReview.rejectedAssetIds, []);
  assert.deepEqual(attempt011.visualReview.blockers, []);
  assert.match(attempt011.visualReview.cameraConformancePendingAssetIds[0], /thirty-seven/);
});

test("native isometric attempt 012 accepts the corrected service-furniture perspectives", () => {
  assert.equal(attempt012.source.remoteCommit, "4ed663373440bedffcc4812618eb413adeaf484e");
  assert.equal(attempt012.source.remoteTree, "a1a257363562e05fa5526654930c0fbdda786375");
  assert.equal(attempt012.source.artifactId, 9038954590);
  assert.equal(attempt012.source.artifactSha256, "369ff4e10c48bb6efad31076c3819d3d8dc050c66eed8dd1080eba2bae9ca285");
  assert.equal(attempt012.automatedGates.fixedCameraContractPresent, true);
  assert.equal(attempt012.visualReview.status, "passed-camera-conformant-assets");
  assert.equal(attempt012.visualReview.productionComplete, false, "the complete furniture catalog remains unfinished");
  assert.deepEqual(attempt012.visualReview.acceptedAssetIds, ["furniture-linen-storage", "furniture-water-station", "furniture-wet-floor-station"]);
  assert.deepEqual(attempt012.visualReview.rejectedAssetIds, []);
  assert.deepEqual(attempt012.visualReview.blockers, []);
  assert.match(attempt012.visualReview.cameraConformancePendingAssetIds[0], /thirty-four/);
});

test("native isometric attempt 013 accepts the corrected utility-furniture rotations", () => {
  assert.equal(attempt013.source.remoteCommit, "124359a3ff083b3cf8b73dd5b387368819cf9639");
  assert.equal(attempt013.source.remoteTree, "0121cb8c82814a03426824174f9bdcb126318083");
  assert.equal(attempt013.source.artifactId, 9048282911);
  assert.equal(attempt013.source.artifactSha256, "01f19b7bfaa17af2e65644f7c83675912f63d5ab0c0a2952290c67404eac8c75");
  assert.equal(attempt013.automatedGates.fixedCameraContractPresent, true);
  assert.equal(attempt013.visualReview.status, "passed-camera-conformant-assets");
  assert.equal(attempt013.visualReview.productionComplete, false, "the complete furniture catalog remains unfinished");
  assert.deepEqual(attempt013.visualReview.acceptedAssetIds, ["furniture-chemical-cabinet", "furniture-dish-machine-high-temp", "furniture-three-comp-sink"]);
  assert.deepEqual(attempt013.visualReview.rejectedAssetIds, []);
  assert.deepEqual(attempt013.visualReview.blockers, []);
  assert.match(attempt013.visualReview.cameraConformancePendingAssetIds[0], /thirty-one/);
});

test("every durable native capture has exact bytes and the required gameplay viewport", () => {
  for (const review of [attempt001, attempt002, attempt003, attempt004, attempt005, attempt006, attempt007, attempt008, attempt009, attempt010, attempt011, attempt012, attempt013]) {
    assert.equal(review.captures.length, 5);
    for (const capture of review.captures) {
      const bytes = read(capture.path);
      assert.equal(sha256(bytes), capture.sha256, capture.path);
      if (!capture.path.endsWith(".png")) continue;
      assert.equal(bytes.toString("ascii", 1, 4), "PNG", capture.path);
      assert.equal(bytes.readUInt32BE(16), 1800, `${capture.path}: width`);
      assert.equal(bytes.readUInt32BE(20), 1100, `${capture.path}: height`);
      assert.equal(bytes[24], 8, `${capture.path}: bit depth`);
      assert.equal(bytes[25], 6, `${capture.path}: RGBA color type`);
    }
  }
});
