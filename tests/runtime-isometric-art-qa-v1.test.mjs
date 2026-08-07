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
];
const [attempt001, attempt002, attempt003, attempt004, attempt005, attempt006, attempt007, attempt008] = reviewPaths.map((path) => JSON.parse(read(path).toString("utf8")));

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

test("every durable native capture has exact bytes and the required gameplay viewport", () => {
  for (const review of [attempt001, attempt002, attempt003, attempt004, attempt005, attempt006, attempt007, attempt008]) {
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
