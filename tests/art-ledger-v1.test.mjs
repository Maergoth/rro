import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
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

test("Git checks out checksum-bearing art evidence with canonical LF endings", () => {
  const paths = [
    "planning/art-qa/character-remediation-idle-classic-v1/classic-composites-metrics.json",
    "planning/art-qa/character-remediation-idle-classic-v1/normalized-bodies-metrics.json",
    "planning/art-qa/character-remediation-idle-classic-v1/qa.json",
    "tools/normalize-character-idle-v1.py",
    "tools/process-character-classic-edited-v1.py",
    "tools/validate-character-remediation-idle-classic-v1.py",
  ];
  const attributes = execFileSync("git", ["check-attr", "eol", "--", ...paths], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim().split(/\r?\n/);
  assert.equal(attributes.length, paths.length);
  for (const [index, line] of attributes.entries()) {
    assert.equal(line, `${paths[index]}: eol: lf`);
  }
});

test("the authoritative art ledger cannot hide missing, failed, local-only, or unbound art", () => {
  const document = readFileSync(resolve(ROOT, "docs/ART_PROGRESS.md"), "utf8");
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
  assert.ok(art.characters.prototypeOutfits.filter((entry) => entry.outfit === "classic").every((entry) => entry.status === "source_accepted_runtime_blocked"));
  assert.ok(art.characters.prototypeOutfits.filter((entry) => entry.outfit === "apron").every((entry) => entry.status === "qa_failed_needs_remediation"));
  assert.equal(art.pendingBatches.length, 0);
  const equipmentSummary = art.summaries.find((entry) => entry.lane === "Equipment inventory icons");
  const furnitureSummary = art.summaries.find((entry) => entry.lane === "Furniture directional sets");
  assert.equal(equipmentSummary.present, 40);
  assert.equal(equipmentSummary.sourceAccepted, 40);
  assert.equal(equipmentSummary.remoteVerified, 40);
  assert.equal(equipmentSummary.productionComplete, 40);
  assert.equal(furnitureSummary.present, 4);
  assert.equal(furnitureSummary.sourceAccepted, 4);
  assert.equal(furnitureSummary.remoteVerified, 4);
  assert.equal(furnitureSummary.productionComplete, 0);
  assert.equal(art.runtimeCapabilities.directionalFurniture.directionalTextureSelection, true);
  assert.equal(art.runtimeCapabilities.directionalFurniture.projectionAligned, false);
  assert.equal(art.runtimeCapabilities.directionalFurniture.runtimeCompositeAccepted, false);
  assert.ok(art.furniture.filter((entry) => entry.present).every((entry) => entry.directionalSelectionBound === true && entry.runtimeBound === false));
  assert.equal(art.summaries.find((entry) => entry.lane === "Body animation sets (body × animation)").productionComplete, 0);
  assert.equal(art.summaries.find((entry) => entry.lane === "Character body source foundations").remoteVerified, 2);
  assert.ok(art.reviewedBatches.every((entry) => entry.qaEvidencePresent && entry.remoteVerified));
  assert.equal(art.equipmentIcons.filter((entry) => entry.productionComplete).length, 40);
  const incompleteEquipment = art.equipmentIcons.filter((entry) => !entry.productionComplete);
  const incompleteLine = document.match(/^- Equipment icons \((\d+)\): (.+)$/m);
  assert.ok(incompleteLine, "the human-readable tracker must enumerate incomplete equipment");
  assert.equal(Number(incompleteLine[1]), incompleteEquipment.length);
  assert.deepEqual(
    [...incompleteLine[2].matchAll(/`([^`]+)`/g)].map((match) => match[1]),
    incompleteEquipment.map((entry) => entry.id),
  );
  for (const item of [...art.furniture, ...art.equipmentIcons]) {
    if (!item.productionComplete) continue;
    assert.equal(item.present, true);
    assert.equal(item.qaEvidencePresent, true);
    assert.equal(item.remoteVerified, true);
    assert.equal(item.runtimeBound, true);
  }
});
