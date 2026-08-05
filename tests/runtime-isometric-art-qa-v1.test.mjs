import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const reviewPaths = [
  "planning/art-qa/runtime-isometric-integration-001/attempt-001/review.json",
  "planning/art-qa/runtime-isometric-integration-001/attempt-002/review.json",
];
const [attempt001, attempt002] = reviewPaths.map((path) => JSON.parse(read(path).toString("utf8")));

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

test("every durable native capture has exact bytes and the required gameplay viewport", () => {
  for (const review of [attempt001, attempt002]) {
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
