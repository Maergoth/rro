import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { auditDirectionalAsset, CAMERA_GEOMETRY_CONTRACT } from "./lib/furniture-camera-geometry-v1.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const read = (path) => JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
const runtime = read("apps/client-godot/furniture-art-runtime.json");
const pass = read("planning/art-pass-v2.json");
const invalid = [];

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const sorted = (values) => [...values].sort();
const declaredGate = runtime.cameraGeometryGate ?? {};
for (const [field, expected] of Object.entries({
  schemaVersion: CAMERA_GEOMETRY_CONTRACT.schemaVersion,
  algorithm: CAMERA_GEOMETRY_CONTRACT.algorithm,
  validator: "tools/validate-furniture-camera-geometry-v1.mjs",
  auditEvidence: "planning/art-qa/furniture-camera-geometry-audit-001.json",
  groundAngleToleranceDegrees: CAMERA_GEOMETRY_CONTRACT.groundAngleToleranceDegrees,
  groundSlopeTolerance: CAMERA_GEOMETRY_CONTRACT.groundSlopeTolerance,
  expectedVerticalAngleDegrees: CAMERA_GEOMETRY_CONTRACT.expectedVerticalAngleDegrees,
  verticalAngleToleranceDegrees: CAMERA_GEOMETRY_CONTRACT.verticalAngleToleranceDegrees,
})) {
  if (declaredGate[field] !== expected) invalid.push(`cameraGeometryGate.${field} must equal ${JSON.stringify(expected)}`);
}
for (const [field, expected] of Object.entries({
  expectedGroundSlopes: CAMERA_GEOMETRY_CONTRACT.expectedGroundSlopes,
  expectedGroundAnglesDegrees: CAMERA_GEOMETRY_CONTRACT.expectedGroundAnglesDegrees,
})) {
  if (!same(declaredGate[field], expected)) invalid.push(`cameraGeometryGate.${field} must equal ${JSON.stringify(expected)}`);
}

const auditPath = declaredGate.auditEvidence ?? "";
const auditExists = Boolean(auditPath && existsSync(resolve(ROOT, auditPath)));
if (!auditExists) invalid.push("cameraGeometryGate.auditEvidence is missing");
const evidence = auditExists ? read(auditPath) : null;
const latestAudit = (pass.cameraGeometryAudits ?? []).at(-1);
if (!latestAudit) invalid.push("art-pass-v2 must declare its latest measured camera-geometry audit");
if (latestAudit?.evidence !== auditPath) invalid.push("art-pass-v2 latest camera audit must match cameraGeometryGate.auditEvidence");
if (evidence) {
  if (evidence.id !== latestAudit?.id) invalid.push("camera audit evidence identity does not match art-pass-v2");
  if (evidence.validator !== declaredGate.validator) invalid.push("camera audit evidence validator does not match the runtime gate");
  if (evidence.algorithm !== CAMERA_GEOMETRY_CONTRACT.algorithm) invalid.push("camera audit evidence algorithm does not match the executable contract");
  if (!same(evidence.contract, CAMERA_GEOMETRY_CONTRACT)) invalid.push("camera audit evidence contract is stale");
}

const sourceDirectionsByAsset = new Map();
for (const batch of pass.batches ?? []) {
  if (!batch.qaManifest || !existsSync(resolve(ROOT, batch.qaManifest))) continue;
  const qa = read(batch.qaManifest);
  for (const item of qa.items ?? []) {
    const directions = Object.fromEntries((item.directions ?? []).map((direction) => [
      direction.direction,
      resolve(ROOT, direction.sourceAlphaPath ?? direction.path),
    ]));
    sourceDirectionsByAsset.set(item.assetId, directions);
  }
}

const expectedAuditedAssetIds = sorted(latestAudit?.auditedAssetIds ?? []);
const evidenceAuditedAssetIds = sorted((evidence?.auditedAssets ?? []).map((asset) => asset.assetId));
if (!same(expectedAuditedAssetIds, evidenceAuditedAssetIds)) invalid.push("camera audit asset identities do not match art-pass-v2");
if (!same(sorted(latestAudit?.retractedAssetIds ?? []), sorted(evidence?.retractedAssetIds ?? []))) {
  invalid.push("camera audit retracted identities do not match art-pass-v2");
}
if (!same(sorted(latestAudit?.measuredConformantAssetIds ?? []), sorted(evidence?.measuredConformantAssetIds ?? []))) {
  invalid.push("camera audit conformant identities do not match art-pass-v2");
}

const auditedAssets = [];
for (const assetId of expectedAuditedAssetIds) {
  const directions = sourceDirectionsByAsset.get(assetId);
  if (!directions) {
    invalid.push(`${assetId}: measured camera audit has no exact alpha-source evidence`);
    continue;
  }
  const measured = auditDirectionalAsset(assetId, directions);
  const preserved = evidence?.auditedAssets?.find((asset) => asset.assetId === assetId);
  auditedAssets.push(measured);
  if (!preserved) {
    invalid.push(`${assetId}: measured camera audit evidence is missing`);
    continue;
  }
  if (measured.status !== preserved.status || measured.passed !== preserved.passed
      || !same(measured.failedDirections, preserved.failedDirections)) {
    invalid.push(`${assetId}: measured camera verdict no longer matches durable audit evidence`);
  }
  for (const direction of CAMERA_GEOMETRY_CONTRACT.requiredDirections) {
    const current = measured.measurements[direction];
    const recorded = preserved.measurements?.[direction];
    if (!recorded) {
      invalid.push(`${assetId}:${direction}: durable measurement is missing`);
      continue;
    }
    if (!same(current.dominantLines, recorded.dominantLines)
        || !same(current.reasons, recorded.reasons)
        || current.passed !== recorded.passed
        || current.strongEdgeThreshold !== recorded.strongEdgeThreshold
        || current.strongEdgePixels !== recorded.strongEdgePixels) {
      invalid.push(`${assetId}:${direction}: source pixels no longer reproduce durable camera measurement`);
    }
  }
}

const measuredConformantAssetIds = sorted(auditedAssets.filter((asset) => asset.passed).map((asset) => asset.assetId));
const declaredConformantAssetIds = sorted(runtime.cameraConformantAssetIds ?? []);
if (!same(measuredConformantAssetIds, sorted(evidence?.measuredConformantAssetIds ?? []))) {
  invalid.push("current source measurements do not match the durable conformant-asset verdict");
}
if (!same(declaredConformantAssetIds, sorted(latestAudit?.measuredConformantAssetIds ?? []))) {
  invalid.push("runtime camera-conformant credits must exactly match the latest measured audit");
}
const pending = new Set(runtime.cameraConformancePendingAssetIds ?? []);
for (const assetId of latestAudit?.retractedAssetIds ?? []) {
  if (!pending.has(assetId)) invalid.push(`${assetId}: retracted camera credit must remain camera-pending`);
}

const result = {
  ok: invalid.length === 0,
  contract: CAMERA_GEOMETRY_CONTRACT,
  audit: {
    id: evidence?.id ?? null,
    evidence: auditPath,
    auditedAssetIds: expectedAuditedAssetIds,
    reproducedFailedAssetIds: auditedAssets.filter((asset) => !asset.passed).map((asset) => asset.assetId),
    reproducedFailedDirectionCount: auditedAssets.reduce((count, asset) => count + asset.failedDirections.length, 0),
  },
  declaredCameraConformantAssetIds: runtime.cameraConformantAssetIds ?? [],
  measuredCameraConformantAssetIds: measuredConformantAssetIds,
  invalid,
};
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
