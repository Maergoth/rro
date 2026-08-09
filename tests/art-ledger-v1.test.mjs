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
  assert.deepEqual(art.durableBaseline, {
    branch: "agent/complete-production-art",
    pullRequest: "https://github.com/Maergoth/rro/pull/2",
    commit: "1f5f585cd8565a3e97c4519c54d7e86f1ca44acb",
    tree: "c3f932f96eb4775716ba54cf96355862c6d3a94b",
    ci: "https://github.com/Maergoth/rro/actions/runs/31253942201",
  });
  assert.equal(art.furniture.length, 229);
  assert.equal(art.equipmentIcons.length, 45);
  assert.equal(art.characters.bodyPresentations.length, 2);
  assert.equal(art.characters.animationCount, 26);
  assert.equal(art.characters.requiredBodySourcePoses, 1344);
  assert.equal(art.characters.requiredBodyFinalFrameCells, 2720);
  assert.equal(art.characters.launchApplicability.id, "character-launch-applicability-v1");
  assert.equal(art.characters.launchApplicability.totals.totalFinalRuntimeRasterCells, 443776);
  assert.equal(art.characters.launchApplicability.totals.activityPrimaryBindingCount, 89);
  assert.equal(art.characters.presentActivityBindings, 0);
  assert.ok(art.quarantinedWork.some((entry) => entry.localCommit === "5714bb8" && entry.status === "local-only-rejected"));
  assert.ok(art.preservedReferences.some((entry) => entry.productionStatus === "preserved-reference-wrong-camera"));
  assert.ok(art.characters.prototypeOutfits.filter((entry) => entry.outfit === "classic").every((entry) => entry.status === "source_accepted_runtime_blocked"));
  assert.ok(art.characters.prototypeOutfits.filter((entry) => entry.outfit === "apron").every((entry) => entry.status === "qa_failed_needs_remediation"));
  assert.equal(art.pendingBatches.length, 1);
  assert.ok(art.pendingBatches.some((entry) => entry.id === "furniture-core-directional-013"
    && entry.qaEvidencePresent && !entry.remoteVerified
    && entry.runtimeQa === "pending-native-gameplay-composite"));
  assert.ok(art.reviewedBatches.some((entry) => entry.id === "furniture-core-directional-012"
    && entry.qaEvidencePresent && entry.remoteVerified
    && entry.runtimeQa === "passed-native-gameplay-composite-attempt-010"));
  assert.ok(art.reviewedBatches.some((entry) => entry.id === "furniture-core-directional-011"
    && entry.qaEvidencePresent && entry.remoteVerified
    && entry.runtimeQa === "passed-native-gameplay-composite-attempt-009"));
  assert.ok(art.reviewedBatches.some((entry) => entry.id === "furniture-core-directional-010"
    && entry.qaEvidencePresent && entry.remoteVerified
    && entry.runtimeQa === "passed-native-gameplay-composite-attempt-008"));
  assert.ok(art.reviewedBatches.some((entry) => entry.id === "furniture-core-directional-006" && entry.remoteVerified));
  assert.ok(art.reviewedBatches.some((entry) => entry.id === "furniture-core-directional-007"
    && entry.qaEvidencePresent && entry.remoteVerified));
  assert.ok(art.reviewedBatches.some((entry) => entry.id === "furniture-core-directional-008"
    && entry.qaEvidencePresent && entry.remoteVerified));
  assert.ok(art.reviewedBatches.some((entry) => entry.id === "furniture-core-directional-009"
    && entry.qaEvidencePresent && entry.remoteVerified
    && entry.runtimeQa === "passed-native-gameplay-composite-attempt-007"));
  assert.deepEqual(art.runtimeQaAttempts.map((entry) => entry.id), [
    "runtime-isometric-integration-001-attempt-001",
    "runtime-isometric-integration-001-attempt-002",
    "runtime-isometric-integration-001-attempt-003",
    "runtime-isometric-integration-001-attempt-004",
    "runtime-isometric-integration-001-attempt-005",
    "runtime-isometric-integration-001-attempt-006",
    "runtime-isometric-integration-001-attempt-007",
    "runtime-isometric-integration-001-attempt-008",
    "runtime-isometric-integration-001-attempt-009",
    "runtime-isometric-integration-001-attempt-010",
  ]);
  assert.equal(art.runtimeQaAttempts[0].status, "failed-needs-remediation");
  assert.equal(art.runtimeQaAttempts[0].evidencePresent, true);
  assert.deepEqual(art.runtimeQaAttempts[0].blockers, ["mounted-object-anchor-contract", "world-label-collision"]);
  assert.equal(art.runtimeQaAttempts[1].status, "passed-partial-floor-assets");
  assert.equal(art.runtimeQaAttempts[1].evidencePresent, true);
  assert.equal(art.runtimeQaAttempts[1].acceptedAssetIds.length, 16);
  assert.deepEqual(art.runtimeQaAttempts[1].rejectedAssetIds, ["local-art", "pendants", "plants"]);
  assert.deepEqual(art.runtimeQaAttempts[1].blockers, ["mounted-object-anchor-contract"]);
  assert.equal(art.runtimeQaAttempts[2].status, "passed-partial-floor-assets");
  assert.equal(art.runtimeQaAttempts[2].evidencePresent, true);
  assert.equal(art.runtimeQaAttempts[2].acceptedAssetIds.length, 19);
  assert.deepEqual(art.runtimeQaAttempts[2].rejectedAssetIds, ["local-art", "pendants", "plants"]);
  assert.deepEqual(art.runtimeQaAttempts[2].blockers, ["mounted-object-anchor-contract"]);
  assert.equal(art.runtimeQaAttempts[2].reviewRemoteVerified, true);
  assert.equal(art.runtimeQaAttempts[3].status, "passed-partial-floor-assets");
  assert.equal(art.runtimeQaAttempts[3].evidencePresent, true);
  assert.equal(art.runtimeQaAttempts[3].acceptedAssetIds.length, 22);
  assert.deepEqual(art.runtimeQaAttempts[3].rejectedAssetIds, ["local-art", "pendants", "plants"]);
  assert.deepEqual(art.runtimeQaAttempts[3].blockers, ["mounted-object-anchor-contract"]);
  assert.equal(art.runtimeQaAttempts[3].reviewRemoteVerified, true);
  assert.equal(art.runtimeQaAttempts[4].status, "failed-mounted-visual-context");
  assert.equal(art.runtimeQaAttempts[4].evidencePresent, true);
  assert.equal(art.runtimeQaAttempts[4].acceptedAssetIds.length, 22);
  assert.deepEqual(art.runtimeQaAttempts[4].rejectedAssetIds, ["local-art", "pendants", "plants"]);
  assert.deepEqual(art.runtimeQaAttempts[4].blockers, ["visible-wall-plane-and-room-facing-depth", "ceiling-context-and-elevation"]);
  assert.equal(art.runtimeQaAttempts[4].reviewRemoteVerified, true);
  assert.equal(art.runtimeQaAttempts[5].status, "passed-partial-present-assets");
  assert.equal(art.runtimeQaAttempts[5].evidencePresent, true);
  assert.equal(art.runtimeQaAttempts[5].acceptedAssetIds.length, 27);
  assert.deepEqual(art.runtimeQaAttempts[5].rejectedAssetIds, ["furniture-convection-oven"]);
  assert.deepEqual(art.runtimeQaAttempts[5].blockers, ["convection-oven-foreground-wall-occlusion"]);
  assert.equal(art.runtimeQaAttempts[5].reviewRemoteVerified, true);
  assert.equal(art.runtimeQaAttempts[6].status, "passed-all-present-assets");
  assert.equal(art.runtimeQaAttempts[6].evidencePresent, true);
  assert.equal(art.runtimeQaAttempts[6].acceptedAssetIds.length, 28);
  assert.deepEqual(art.runtimeQaAttempts[6].rejectedAssetIds, []);
  assert.deepEqual(art.runtimeQaAttempts[6].blockers, []);
  assert.equal(art.runtimeQaAttempts[6].reviewRemoteVerified, true);
  assert.equal(art.runtimeQaAttempts[7].status, "passed-all-present-assets");
  assert.equal(art.runtimeQaAttempts[7].evidencePresent, true);
  assert.equal(art.runtimeQaAttempts[7].acceptedAssetIds.length, 31);
  assert.deepEqual(art.runtimeQaAttempts[7].rejectedAssetIds, []);
  assert.deepEqual(art.runtimeQaAttempts[7].blockers, []);
  assert.equal(art.runtimeQaAttempts[7].reviewRemoteVerified, true);
  assert.equal(art.runtimeQaAttempts[8].status, "passed-all-present-assets");
  assert.equal(art.runtimeQaAttempts[8].evidencePresent, true);
  assert.equal(art.runtimeQaAttempts[8].acceptedAssetIds.length, 34);
  assert.deepEqual(art.runtimeQaAttempts[8].rejectedAssetIds, []);
  assert.deepEqual(art.runtimeQaAttempts[8].blockers, []);
  assert.equal(art.runtimeQaAttempts[8].reviewRemoteVerified, true);
  assert.equal(art.runtimeQaAttempts[9].status, "passed-all-present-assets");
  assert.equal(art.runtimeQaAttempts[9].evidencePresent, true);
  assert.equal(art.runtimeQaAttempts[9].acceptedAssetIds.length, 37);
  assert.deepEqual(art.runtimeQaAttempts[9].rejectedAssetIds, []);
  assert.deepEqual(art.runtimeQaAttempts[9].blockers, []);
  assert.equal(art.runtimeQaAttempts[9].reviewRemoteVerified, true);
  const equipmentSummary = art.summaries.find((entry) => entry.lane === "Equipment inventory icons");
  const furnitureSummary = art.summaries.find((entry) => entry.lane === "Furniture directional sets");
  assert.equal(equipmentSummary.present, 45);
  assert.equal(equipmentSummary.sourceAccepted, 45);
  assert.equal(equipmentSummary.remoteVerified, 45);
  assert.equal(equipmentSummary.productionComplete, 45);
  assert.equal(furnitureSummary.present, 40);
  assert.equal(furnitureSummary.sourceAccepted, 40);
  assert.equal(furnitureSummary.remoteVerified, 37);
  assert.equal(furnitureSummary.productionComplete, 0);
  assert.equal(art.runtimeCapabilities.directionalFurniture.directionalTextureSelection, true);
  assert.equal(art.runtimeCapabilities.directionalFurniture.projectionAligned, true);
  assert.equal(art.runtimeCapabilities.directionalFurniture.cameraConformanceValidated, false);
  assert.equal(art.runtimeCapabilities.directionalFurniture.runtimeCompositeAccepted, false);
  assert.equal(art.runtimeCapabilities.directionalFurniture.runtimeCompositeAcceptedAssetIds.length, 37);
  assert.deepEqual(art.runtimeCapabilities.directionalFurniture.runtimeCompositeBlockedAssetIds, []);
  assert.deepEqual(art.runtimeCapabilities.directionalFurniture.runtimeCompositePendingAssetIds, ["furniture-essential-cafe-two-top", "furniture-manager-console", "furniture-office-desk"]);
  assert.deepEqual(art.runtimeCapabilities.directionalFurniture.cameraConformantAssetIds, ["furniture-essential-cafe-two-top", "furniture-manager-console", "furniture-office-desk"]);
  assert.equal(art.runtimeCapabilities.directionalFurniture.cameraConformancePendingAssetIds.length, 37);
  assert.equal(art.runtimeCapabilities.directionalFurniture.runtimeReviewRemoteVerified, true);
  const runtimeAcceptedFurnitureIds = new Set(
    art.runtimeCapabilities.directionalFurniture.runtimeCompositeAcceptedAssetIds,
  );
  const fullyRuntimeAcceptedFurnitureBatches = art.reviewedBatches.filter((entry) =>
    entry.id.startsWith("furniture-core-directional-")
      && entry.assets.every((assetId) => runtimeAcceptedFurnitureIds.has(assetId)));
  assert.ok(fullyRuntimeAcceptedFurnitureBatches.length > 0);
  for (const batch of fullyRuntimeAcceptedFurnitureBatches) {
    assert.match(batch.runtimeQa, /^passed-/, `${batch.id} must record a passed current runtime review`);
    assert.doesNotMatch(
      batch.notes,
      /remain blocking|remains required|lacks a wall-mount contract|rejected production completion/i,
      `${batch.id} notes must not claim a resolved runtime blocker is current`,
    );
  }
  assert.equal(art.runtimeCapabilities.directionalFurniture.productionComplete, false, "the complete 229-item furniture catalog and other art lanes remain unfinished");
  assert.match(document, /Latest native review `runtime-isometric-integration-001-attempt-010` accepted 37\/40 present sets; its durable review checkpoint is remote-verified: yes\./);
  assert.ok(art.furniture.filter((entry) => entry.present).every((entry) => entry.directionalSelectionBound === true && entry.placementDeclared === true));
  assert.equal(art.furniture.filter((entry) => entry.runtimeBound).length, 0);
  assert.equal(art.furniture.filter((entry) => entry.productionComplete).length, 0);
  assert.equal(art.furniture.filter((entry) => entry.present && !entry.runtimeBound).length, 40);
  assert.deepEqual(art.furniture.filter((entry) => entry.cameraConformant).map((entry) => entry.assetId), ["furniture-office-desk", "furniture-manager-console", "furniture-essential-cafe-two-top"]);
  const pendingAssetIds = ["furniture-office-desk", "furniture-manager-console", "furniture-essential-cafe-two-top"];
  assert.deepEqual(art.furniture.filter((entry) => entry.runtimeCompositePending).map((entry) => entry.assetId), pendingAssetIds);
  assert.ok(art.furniture.filter((entry) => entry.runtimeCompositeAccepted).every((entry) =>
    entry.sourceAccepted && entry.remoteVerified && entry.cameraConformancePending
      && !entry.runtimeBound && !entry.productionComplete));
  assert.equal(art.summaries.find((entry) => entry.lane === "Body animation sets (body × animation)").productionComplete, 0);
  assert.equal(art.summaries.find((entry) => entry.lane === "Character body source foundations").remoteVerified, 2);
  assert.ok(art.reviewedBatches.every((entry) => entry.qaEvidencePresent && entry.remoteVerified));
  assert.equal(art.equipmentIcons.filter((entry) => entry.productionComplete).length, 45);
  const incompleteEquipment = art.equipmentIcons.filter((entry) => !entry.productionComplete);
  const incompleteLine = document.match(/^- Equipment icons \((\d+)\): (.+)$/m);
  assert.ok(incompleteLine, "the human-readable tracker must enumerate incomplete equipment");
  assert.equal(Number(incompleteLine[1]), incompleteEquipment.length);
  if (incompleteEquipment.length === 0) assert.equal(incompleteLine[2], "none");
  else assert.deepEqual(
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
