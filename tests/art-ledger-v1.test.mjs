import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(import.meta.dirname, "..");

function parseLedger(document) {
  const match = document.match(/<!-- ART_LEDGER_JSON_BEGIN -->\r?\n```json\r?\n([\s\S]+?)\r?\n```\r?\n<!-- ART_LEDGER_JSON_END -->/);
  assert.ok(match, "ART_PROGRESS.md must contain its machine-readable ledger block");
  return JSON.parse(match[1]);
}

function ledger() {
  return parseLedger(readFileSync(resolve(ROOT, "docs/ART_PROGRESS.md"), "utf8"));
}

test("the art ledger parser accepts Windows CRLF checkouts", () => {
  const document = readFileSync(resolve(ROOT, "docs/ART_PROGRESS.md"), "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "\r\n");
  assert.equal(parseLedger(document).authoritativeProgressDocument, "docs/ART_PROGRESS.md");
});

test("text-art evidence hashes are stable across Git line-ending conversion", () => {
  const art = ledger();
  const mark = art.ui.find((entry) => entry.id === "rro-mark");
  const svg = readFileSync(resolve(ROOT, mark.path), "utf8").replace(/\r\n/g, "\n");
  assert.equal(mark.sha256, createHash("sha256").update(svg, "utf8").digest("hex"));
});

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
  const equipmentSummary = art.summaries.find((entry) => entry.lane === "Equipment inventory icons");
  assert.equal(equipmentSummary.productionComplete, 8);
  assert.equal(art.summaries.find((entry) => entry.lane === "Furniture directional sets").productionComplete, 0);
  assert.equal(art.summaries.find((entry) => entry.lane === "Body animation sets (body × animation)").productionComplete, 0);
  assert.ok(art.reviewedBatches.every((entry) => entry.qaEvidencePresent && entry.remoteVerified));
  assert.equal(art.equipmentIcons.filter((entry) => entry.productionComplete).length, 8);
  for (const item of [...art.furniture, ...art.equipmentIcons]) {
    if (!item.productionComplete) continue;
    assert.equal(item.present, true);
    assert.equal(item.qaEvidencePresent, true);
    assert.equal(item.remoteVerified, true);
    assert.equal(item.runtimeBound, true);
  }
});
