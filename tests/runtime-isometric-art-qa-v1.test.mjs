import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const reviewPath = "planning/art-qa/runtime-isometric-integration-001/attempt-001/review.json";
const review = JSON.parse(read(reviewPath).toString("utf8"));

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

test("native isometric attempt 001 preserves the exact remote evidence and failed verdict", () => {
  assert.equal(review.source.remoteCommit, "00f9a36dccf35ca2c82dbf2689d982749ab27f5c");
  assert.equal(review.source.remoteTree, "7c95a33e679232e99cfc9cb472abfbb478fa3ae9");
  assert.equal(review.source.artifactId, 8927474963);
  assert.equal(review.source.artifactSha256, "933842483b6a38a31eb9da837b665bd1799a320e343adb59b126564f815edbfd");
  assert.equal(review.visualReview.status, "failed-needs-remediation");
  assert.equal(review.visualReview.productionComplete, false);
  assert.deepEqual(review.visualReview.acceptedAssetIds, []);
  assert.equal(review.visualReview.provisionalFloorAssetPasses.length, 16);
  assert.deepEqual(review.visualReview.blockers.map((entry) => entry.id), ["mounted-object-anchor-contract", "world-label-collision"]);
});

test("every durable native capture has exact bytes and the required gameplay viewport", () => {
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
});
