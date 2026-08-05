import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(import.meta.dirname, "..");

function ledger() {
  const document = readFileSync(resolve(ROOT, "docs/ART_PROGRESS.md"), "utf8");
  const match = document.match(/<!-- ART_LEDGER_JSON_BEGIN -->\n```json\n([\s\S]+?)\n```\n<!-- ART_LEDGER_JSON_END -->/);
  assert.ok(match, "ART_PROGRESS.md must contain its machine-readable ledger block");
  return JSON.parse(match[1]);
}

test("the authoritative art ledger cannot hide missing, failed, local-only, or unbound art", () => {
  const art = ledger();
  assert.equal(art.authoritativeProgressDocument, "docs/ART_PROGRESS.md");
  assert.equal(art.furniture.length, 229);
  assert.equal(art.equipmentIcons.length, 45);
  assert.equal(art.characters.bodyPresentations.length, 2);
  assert.equal(art.characters.animationCount, 26);
  assert.equal(art.characters.requiredBodySourcePoses, 1344);
  assert.equal(art.characters.requiredBodyFinalFrameCells, 2720);
  assert.equal(art.characters.presentActivityBindings, 0);
  assert.ok(art.quarantinedWork.some((entry) => entry.localCommit === "5714bb8" && entry.status === "local-only-rejected"));
  assert.ok(art.preservedReferences.some((entry) => entry.productionStatus === "preserved-reference-wrong-camera"));
  assert.ok(art.characters.prototypeOutfits.every((entry) => entry.status === "qa_failed_needs_remediation"));
  assert.ok(art.summaries.every((entry) => entry.productionComplete === 0));
  assert.ok(art.reviewedBatches.every((entry) => entry.qaEvidencePresent && entry.remoteVerified));
  for (const item of [...art.furniture, ...art.equipmentIcons]) {
    if (!item.productionComplete) continue;
    assert.equal(item.present, true);
    assert.equal(item.qaEvidencePresent, true);
    assert.equal(item.remoteVerified, true);
    assert.equal(item.runtimeBound, true);
  }
});
