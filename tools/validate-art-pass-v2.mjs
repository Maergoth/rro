import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const REQUIRE_COMPLETE = process.argv.includes("--require-complete");
const VERBOSE = process.argv.includes("--verbose");
const read = (path) => JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
const contract = read("planning/character-art-catalog.json");
const production = read("planning/art-production.json");
const pass = read("planning/art-pass-v2.json");
const construction = read("packages/game-data/core/construction.json");
const roleEquipment = read("packages/game-data/core/role-equipment.json");
const activities = read("packages/game-data/core/activities.json").activities;
const furnitureRuntimeContract = read("apps/client-godot/furniture-art-runtime.json");
const furnitureDefinitions = [
  ...read("packages/game-data/core/furniture.json"),
  ...read("packages/game-data/core/furniture-production.json"),
];
const furnitureDefinitionByAssetId = new Map(furnitureDefinitions.map((item) => [item.assetId ?? item.id, item]));
const runtimeCompositeAcceptedAssetIds = new Set(furnitureRuntimeContract.runtimeCompositeAcceptedAssetIds ?? []);
const runtimeCompositeBlockedAssetIds = new Set(furnitureRuntimeContract.runtimeCompositeBlockedAssetIds ?? []);
const runtimeCompositePendingAssetIds = new Set(furnitureRuntimeContract.runtimeCompositePendingAssetIds ?? []);
const cameraConformantAssetIds = new Set(furnitureRuntimeContract.cameraConformantAssetIds ?? []);
const cameraConformancePendingAssetIds = new Set(furnitureRuntimeContract.cameraConformancePendingAssetIds ?? []);
const directionalSelectionBound = furnitureRuntimeContract.capability.directionalTextureSelection === true;
const latestFurnitureRuntimeQa = [...(pass.runtimeQaAttempts ?? [])].reverse().find((attempt) => Array.isArray(attempt.acceptedAssetIds));
const reviewIsRemoteVerified = (attempt) => Boolean(
  attempt?.evidence
    && file(attempt.evidence)
    && /^[0-9a-f]{40}$/.test(attempt.reviewPreservation?.commit ?? "")
    && /^[0-9a-f]{40}$/.test(attempt.reviewPreservation?.tree ?? "")
    && /^https:\/\/github\.com\/Maergoth\/rro\/actions\/runs\/\d+$/.test(attempt.reviewPreservation?.ci ?? ""),
);
const runtimeReviewRemoteVerified = reviewIsRemoteVerified(latestFurnitureRuntimeQa);
const latestDurableFurnitureRuntimeQa = [...(pass.runtimeQaAttempts ?? [])].reverse().find((attempt) =>
  Array.isArray(attempt.acceptedAssetIds) && reviewIsRemoteVerified(attempt));
const contractFurnitureRuntimeQa = runtimeReviewRemoteVerified ? latestFurnitureRuntimeQa : latestDurableFurnitureRuntimeQa;
const missingCoverage = [];
const invalid = [];
const hashes = new Map();

function png(path, label, expected = null) {
  const absolute = resolve(ROOT, path);
  if (!existsSync(absolute)) return false;
  const data = readFileSync(absolute);
  if (data.length < 32 || data.toString("ascii", 1, 4) !== "PNG") { invalid.push(`${path}: not a PNG`); return false; }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (expected && (width !== expected[0] || height !== expected[1])) invalid.push(`${path}: expected ${expected[0]}x${expected[1]}, got ${width}x${height}`);
  const digest = createHash("sha256").update(data).digest("hex");
  const prior = hashes.get(digest);
  if (prior && prior !== label) invalid.push(`${path}: duplicates ${prior}`);
  else hashes.set(digest, label);
  return true;
}

function file(path) {
  return existsSync(resolve(ROOT, path));
}

const acceptedAssets = new Map();
for (const batch of pass.batches) {
  if (!/^[0-9a-f]{40}$/.test(batch.remoteCommit ?? "")) invalid.push(`${batch.id}: missing exact remote commit`);
  if (!/^[0-9a-f]{40}$/.test(batch.remoteTree ?? "")) invalid.push(`${batch.id}: missing exact remote tree`);
  if (!batch.qaEvidence || !png(batch.qaEvidence, `qa:${batch.id}`)) invalid.push(`${batch.id}: missing durable QA contact sheet`);
  if (batch.qaManifest) {
    if (!file(batch.qaManifest)) invalid.push(`${batch.id}: missing QA manifest ${batch.qaManifest}`);
    else {
      const manifest = read(batch.qaManifest);
      const manifestStatus = String(manifest.status ?? manifest.artReviewStatus ?? "");
      if ((manifest.batchId ?? manifest.batch) !== batch.id || !manifestStatus.startsWith("accepted")) invalid.push(`${batch.id}: QA manifest identity/status mismatch`);
      const manifestAssets = (manifest.assets ?? (manifest.items ?? []).map((item) => item.catalogId)).toSorted();
      const batchAssets = [...batch.assets].sort();
      if (JSON.stringify(manifestAssets) !== JSON.stringify(batchAssets)) invalid.push(`${batch.id}: QA manifest assets do not exactly match the batch`);
      const visualEvidence = [...(manifest.contactSheets ?? []), ...(manifest.visualEvidence ?? [])];
      if (!visualEvidence.some((sheet) => sheet.path === batch.qaEvidence)) invalid.push(`${batch.id}: primary QA evidence is absent from its manifest`);
      for (const sheet of visualEvidence) {
        if (!sheet.path || !file(sheet.path)) { invalid.push(`${batch.id}: missing visual evidence ${sheet.path ?? "<unnamed>"}`); continue; }
        if (sheet.sha256) {
          const digest = createHash("sha256").update(readFileSync(resolve(ROOT, sheet.path))).digest("hex");
          if (digest !== sheet.sha256) invalid.push(`${batch.id}: visual evidence hash mismatch for ${sheet.path}`);
        }
      }
      if (manifest.promotionScope?.totalFiles !== undefined && manifest.promotionScope.totalFiles !== batch.files) {
        invalid.push(`${batch.id}: QA promotion file count does not match batch.files`);
      }
      if (manifest.remotePreservation) {
        if (manifest.remotePreservation.commit !== batch.remoteCommit || manifest.remotePreservation.tree !== batch.remoteTree || manifest.remotePreservation.ci !== batch.ci) {
          invalid.push(`${batch.id}: QA remote preservation does not match the reviewed batch checkpoint`);
        }
      }
      for (const item of manifest.items ?? []) {
        const runtimeFiles = item.runtimePath
          ? [{ path: item.runtimePath, sha256: item.sha256 ?? item.runtimeSha256, label: item.catalogId }]
          : (item.directions ?? []).map((direction) => ({
              path: direction.path,
              sha256: direction.sha256,
              label: `${item.catalogId}:${direction.direction}`,
            }));
        if (runtimeFiles.length === 0) invalid.push(`${batch.id}: QA manifest has no runtime files for ${item.catalogId}`);
        for (const runtime of runtimeFiles) {
          if (!file(runtime.path)) { invalid.push(`${batch.id}: QA runtime file is missing: ${runtime.path}`); continue; }
          const digest = createHash("sha256").update(readFileSync(resolve(ROOT, runtime.path))).digest("hex");
          if (digest !== runtime.sha256) invalid.push(`${batch.id}: QA hash mismatch for ${runtime.label}`);
        }
      }
      const checksumIndex = manifest.runtimeFiles?.checksumIndex;
      if (checksumIndex) {
        if (!file(checksumIndex)) invalid.push(`${batch.id}: missing checksum index ${checksumIndex}`);
        else for (const line of readFileSync(resolve(ROOT, checksumIndex), "utf8").trim().split(/\r?\n/)) {
          const match = line.match(/^([0-9a-f]{64})  (.+)$/);
          if (!match || !file(match[2])) { invalid.push(`${batch.id}: invalid checksum entry ${line}`); continue; }
          const digest = createHash("sha256").update(readFileSync(resolve(ROOT, match[2]))).digest("hex");
          if (digest !== match[1]) invalid.push(`${batch.id}: checksum mismatch for ${match[2]}`);
        }
      }
    }
  }
  for (const asset of batch.assets) acceptedAssets.set(asset, batch.assetReviews?.[asset] ?? batch.qa);
}

for (const batch of pass.pendingBatches ?? []) {
  if (batch.remoteCommit || batch.remoteTree || batch.ci) invalid.push(`${batch.id}: pending batch must not claim remote verification or hosted CI`);
  if (!batch.qaEvidence || !png(batch.qaEvidence, `pending-qa:${batch.id}`)) invalid.push(`${batch.id}: pending batch is missing durable QA evidence`);
  if (!batch.qaManifest || !file(batch.qaManifest)) { invalid.push(`${batch.id}: pending batch is missing its QA manifest`); continue; }
  const manifest = read(batch.qaManifest);
  const manifestStatus = String(manifest.status ?? manifest.artReviewStatus ?? "");
  if ((manifest.batchId ?? manifest.batch) !== batch.id || !manifestStatus.startsWith("accepted")) invalid.push(`${batch.id}: pending QA identity/status mismatch`);
  if (manifest.repositoryPromotion?.status !== "local-verified-pending-remote") invalid.push(`${batch.id}: pending QA must declare local verification with remote preservation still pending`);
  if (manifest.remotePreservation !== null) invalid.push(`${batch.id}: pending QA must not claim remote preservation`);
  if (manifest.promotionScope?.totalFiles !== batch.files) invalid.push(`${batch.id}: pending QA promotion file count does not match batch.files`);
  if (JSON.stringify(manifest).includes("/tmp/")) invalid.push(`${batch.id}: pending durable QA contains a transient /tmp path`);
  const manifestAssets = [...(manifest.assets ?? [])].sort();
  if (JSON.stringify(manifestAssets) !== JSON.stringify([...batch.assets].sort())) invalid.push(`${batch.id}: pending QA assets do not exactly match the batch`);
  const visualEvidence = [...(manifest.contactSheets ?? []), ...(manifest.visualEvidence ?? [])];
  if (!visualEvidence.some((sheet) => sheet.path === batch.qaEvidence)) invalid.push(`${batch.id}: pending primary QA evidence is absent from its manifest`);
  for (const sheet of visualEvidence) {
    if (!sheet.path || !file(sheet.path)) { invalid.push(`${batch.id}: missing pending visual evidence ${sheet.path ?? "<unnamed>"}`); continue; }
    if (sheet.sha256) {
      const digest = createHash("sha256").update(readFileSync(resolve(ROOT, sheet.path))).digest("hex");
      if (digest !== sheet.sha256) invalid.push(`${batch.id}: pending visual evidence hash mismatch for ${sheet.path}`);
    }
  }
  for (const item of manifest.items ?? []) {
    const runtimeFiles = item.runtimePath
      ? [{ path: item.runtimePath, sha256: item.sha256 ?? item.runtimeSha256, label: item.catalogId }]
      : (item.directions ?? []).map((direction) => ({
          path: direction.path,
          sha256: direction.sha256,
          label: `${item.catalogId}:${direction.direction}`,
        }));
    if (runtimeFiles.length === 0) invalid.push(`${batch.id}: pending QA manifest has no runtime files for ${item.catalogId}`);
    for (const runtime of runtimeFiles) {
      if (!file(runtime.path)) { invalid.push(`${batch.id}: pending QA runtime file is missing: ${runtime.path}`); continue; }
      const digest = createHash("sha256").update(readFileSync(resolve(ROOT, runtime.path))).digest("hex");
      if (digest !== runtime.sha256) invalid.push(`${batch.id}: pending QA hash mismatch for ${runtime.label}`);
    }
  }
  for (const asset of batch.assets) acceptedAssets.set(asset, batch.assetReviews?.[asset] ?? batch.qa);
}

const expectedFurniture = new Set(production.furniture.map((item) => item.assetId));
const directionalRoot = resolve(ROOT, "apps/client-godot/assets/objects/directional");
const actualFurniture = existsSync(directionalRoot) ? readdirSync(directionalRoot).filter((name) => statSync(resolve(directionalRoot, name)).isDirectory()) : [];
for (const id of actualFurniture) if (!expectedFurniture.has(id)) invalid.push(`unknown directional furniture directory: ${id}`);

let furnitureSetsPresent = 0;
let furnitureSourceAccepted = 0;
let furnitureRuntimeBoundSets = 0;
let furnitureProductionCompleteSets = 0;
const sourceAcceptedDirectionalAssetIds = [];
for (const item of production.furniture) {
  const paths = pass.artDirection.furnitureDirections.map((direction) => `apps/client-godot/assets/objects/directional/${item.assetId}/${direction}.png`);
  const count = paths.filter((path, index) => png(path, `furniture:${item.assetId}:${pass.artDirection.furnitureDirections[index]}`, [627, 627])).length;
  if (count === paths.length) furnitureSetsPresent += 1;
  else missingCoverage.push({ lane: "furniture", id: item.assetId, missingFiles: paths.filter((path) => !file(path)) });
  const sourceAccepted = count === paths.length && acceptedAssets.get(item.assetId) === "passed";
  if (sourceAccepted && !furnitureDefinitionByAssetId.get(item.assetId)?.placement) {
    invalid.push(`${item.assetId}: source-accepted furniture requires an explicit reviewed placement contract`);
  }
  if (sourceAccepted) {
    furnitureSourceAccepted += 1;
    sourceAcceptedDirectionalAssetIds.push(item.assetId);
  }
  const runtimeBound = count === paths.length
    && directionalSelectionBound
    && furnitureRuntimeContract.capability.projectionAligned === true
    && cameraConformantAssetIds.has(item.assetId)
    && runtimeCompositeAcceptedAssetIds.has(item.assetId);
  if (runtimeBound) furnitureRuntimeBoundSets += 1;
  if (sourceAccepted && furnitureDefinitionByAssetId.get(item.assetId)?.placement && runtimeBound && runtimeReviewRemoteVerified) furnitureProductionCompleteSets += 1;
}

for (const assetId of runtimeCompositeAcceptedAssetIds) {
  if (!furnitureRuntimeContract.acceptedDirectionalAssetIds.includes(assetId)) invalid.push(`${assetId}: runtime composite acceptance is not a directional source-accepted asset`);
  if (runtimeCompositeBlockedAssetIds.has(assetId)) invalid.push(`${assetId}: cannot be both runtime-composite accepted and blocked`);
  if (runtimeCompositePendingAssetIds.has(assetId)) invalid.push(`${assetId}: cannot be both runtime-composite accepted and pending`);
}
for (const assetId of runtimeCompositeBlockedAssetIds) {
  if (!furnitureRuntimeContract.acceptedDirectionalAssetIds.includes(assetId)) invalid.push(`${assetId}: runtime composite blocker is not a directional source-accepted asset`);
  if (runtimeCompositePendingAssetIds.has(assetId)) invalid.push(`${assetId}: cannot be both runtime-composite blocked and pending`);
}
for (const assetId of runtimeCompositePendingAssetIds) {
  if (!furnitureRuntimeContract.acceptedDirectionalAssetIds.includes(assetId)) invalid.push(`${assetId}: runtime composite pending review is not a directional source-accepted asset`);
}
const runtimeStateAssetIds = new Set([
  ...runtimeCompositeAcceptedAssetIds,
  ...runtimeCompositeBlockedAssetIds,
  ...runtimeCompositePendingAssetIds,
]);
if (runtimeStateAssetIds.size !== furnitureRuntimeContract.acceptedDirectionalAssetIds.length
    || [...runtimeStateAssetIds].some((assetId) => !furnitureRuntimeContract.acceptedDirectionalAssetIds.includes(assetId))) {
  invalid.push("directional furniture runtime-composite accepted, blocked, and pending sets must exactly partition acceptedDirectionalAssetIds");
}
const cameraStateAssetIds = new Set([
  ...cameraConformantAssetIds,
  ...cameraConformancePendingAssetIds,
]);
if ([...cameraConformantAssetIds].some((assetId) => cameraConformancePendingAssetIds.has(assetId))) {
  invalid.push("directional furniture cannot be both camera-conformant and pending camera review");
}
if (cameraStateAssetIds.size !== furnitureRuntimeContract.acceptedDirectionalAssetIds.length
    || [...cameraStateAssetIds].some((assetId) => !furnitureRuntimeContract.acceptedDirectionalAssetIds.includes(assetId))) {
  invalid.push("camera-conformant and camera-pending sets must exactly partition acceptedDirectionalAssetIds");
}
const cameraConformanceCoversEverySourceAcceptedSet = cameraConformantAssetIds.size === sourceAcceptedDirectionalAssetIds.length
  && JSON.stringify([...cameraConformantAssetIds].sort()) === JSON.stringify([...sourceAcceptedDirectionalAssetIds].sort())
  && cameraConformancePendingAssetIds.size === 0;
if ((furnitureRuntimeContract.capability.cameraConformanceValidated === true) !== cameraConformanceCoversEverySourceAcceptedSet) {
  invalid.push("directional furniture capability.cameraConformanceValidated must be true iff every source-accepted set passes the fixed-camera contract");
}
const runtimeAcceptedIds = furnitureRuntimeContract.runtimeCompositeAcceptedAssetIds ?? [];
const runtimeCompositeCoversEverySourceAcceptedSet = runtimeAcceptedIds.length === sourceAcceptedDirectionalAssetIds.length
  && JSON.stringify([...runtimeAcceptedIds].sort()) === JSON.stringify([...sourceAcceptedDirectionalAssetIds].sort())
  && runtimeCompositeBlockedAssetIds.size === 0
  && runtimeCompositePendingAssetIds.size === 0;
if ((furnitureRuntimeContract.capability.runtimeCompositeAccepted === true) !== runtimeCompositeCoversEverySourceAcceptedSet) {
  invalid.push("directional furniture capability.runtimeCompositeAccepted must be true iff runtime acceptance exactly covers every source-accepted directional set with no blocked or pending identities");
}
if (!latestFurnitureRuntimeQa?.evidence || !file(latestFurnitureRuntimeQa.evidence)) {
  invalid.push("directional furniture runtime-composite acceptance requires durable native-review evidence");
} else {
  const nativeReview = read(latestFurnitureRuntimeQa.evidence);
  if (nativeReview.id !== latestFurnitureRuntimeQa.id) invalid.push("latest durable native-review evidence identity does not match art-pass-v2");
  if (nativeReview.source?.remoteCommit !== latestFurnitureRuntimeQa.remoteCommit
      || nativeReview.source?.remoteTree !== latestFurnitureRuntimeQa.remoteTree
      || nativeReview.source?.ci !== latestFurnitureRuntimeQa.ci
      || nativeReview.source?.artifactId !== latestFurnitureRuntimeQa.artifactId
      || nativeReview.source?.artifactSha256 !== latestFurnitureRuntimeQa.artifactSha256) {
    invalid.push("latest durable native-review source does not match art-pass-v2");
  }
  const acceptedFromEvidence = [...(nativeReview.visualReview?.acceptedAssetIds ?? [])].sort();
  const blockedFromEvidence = [...(nativeReview.visualReview?.rejectedAssetIds ?? [])].sort();
  if (JSON.stringify(acceptedFromEvidence) !== JSON.stringify([...(latestFurnitureRuntimeQa.acceptedAssetIds ?? [])].sort())
      || JSON.stringify(blockedFromEvidence) !== JSON.stringify([...(latestFurnitureRuntimeQa.rejectedAssetIds ?? [])].sort())) {
    invalid.push("latest durable native-review verdict does not match art-pass-v2");
  }
  if ((nativeReview.captures ?? []).length !== 5) invalid.push("latest durable native review must preserve four captures plus qa.json");
  for (const capture of nativeReview.captures ?? []) {
    if (!capture.path || !file(capture.path)) { invalid.push(`latest durable native-review capture is missing: ${capture.path ?? "<unnamed>"}`); continue; }
    const digest = createHash("sha256").update(readFileSync(resolve(ROOT, capture.path))).digest("hex");
    if (digest !== capture.sha256) invalid.push(`latest durable native-review capture hash mismatch: ${capture.path}`);
  }
  const contractNativeReview = contractFurnitureRuntimeQa?.evidence && file(contractFurnitureRuntimeQa.evidence)
    ? read(contractFurnitureRuntimeQa.evidence)
    : null;
  const acceptedFromContractEvidence = [...(contractNativeReview?.visualReview?.acceptedAssetIds ?? [])].sort();
  const blockedFromContractEvidence = [...(contractNativeReview?.visualReview?.rejectedAssetIds ?? [])].sort();
  if (JSON.stringify(acceptedFromContractEvidence) !== JSON.stringify([...runtimeCompositeAcceptedAssetIds].sort())) {
    invalid.push("runtimeCompositeAcceptedAssetIds do not match the latest durable native review");
  }
  if (JSON.stringify(blockedFromContractEvidence) !== JSON.stringify([...runtimeCompositeBlockedAssetIds].sort())) {
    invalid.push("runtimeCompositeBlockedAssetIds do not match the latest durable native review");
  }
  const pendingFromEvidence = furnitureRuntimeContract.acceptedDirectionalAssetIds
    .filter((assetId) => !acceptedFromContractEvidence.includes(assetId) && !blockedFromContractEvidence.includes(assetId))
    .sort();
  if (JSON.stringify(pendingFromEvidence) !== JSON.stringify([...runtimeCompositePendingAssetIds].sort())) {
    invalid.push("runtimeCompositePendingAssetIds must contain exactly the source-accepted assets absent from the latest durable native review");
  }
}

let equipmentIconsPresent = 0;
for (const item of production.roleItems) {
  if (png(item.output, `equipment:${item.id}`, [128, 128])) equipmentIconsPresent += 1;
  else missingCoverage.push({ lane: "equipment-icon", id: item.id, missingFiles: [item.output] });
}

let constructionMaterialsPresent = 0;
for (const item of construction.surfaces) {
  const path = `apps/client-godot/assets/construction/floors/${item.assetId}.png`;
  if (png(path, `construction-floor:${item.id}`)) constructionMaterialsPresent += 1;
  else missingCoverage.push({ lane: "construction-floor", id: item.assetId, missingFiles: [path] });
}
for (const item of construction.wallStyles) {
  const path = `apps/client-godot/assets/construction/walls/${item.assetId}.png`;
  if (png(path, `construction-wall:${item.id}`)) constructionMaterialsPresent += 1;
  else missingCoverage.push({ lane: "construction-wall", id: item.assetId, missingFiles: [path] });
}

let openingSetsPresent = 0;
for (const opening of pass.launchScope.construction.openingTypes) {
  const paths = pass.launchScope.construction.openingDirections.map((direction) => `apps/client-godot/assets/construction/openings/${opening}/${direction}.png`);
  const count = paths.filter((path, index) => png(path, `opening:${opening}:${pass.launchScope.construction.openingDirections[index]}`)).length;
  if (count === paths.length) openingSetsPresent += 1;
  else missingCoverage.push({ lane: "opening", id: opening, missingFiles: paths.filter((path) => !file(path)) });
}

let utilityOverlaysPresent = 0;
for (const utility of pass.launchScope.construction.utilityOverlays) {
  const path = `apps/client-godot/assets/construction/utilities/${utility}.png`;
  if (png(path, `utility:${utility}`)) utilityOverlaysPresent += 1;
  else missingCoverage.push({ lane: "utility", id: utility, missingFiles: [path] });
}

let worldAssetsPresent = 0;
for (const id of pass.launchScope.world) {
  const path = `apps/client-godot/assets/world/${id}.png`;
  if (png(path, `world:${id}`)) worldAssetsPresent += 1;
  else missingCoverage.push({ lane: "world", id, missingFiles: [path] });
}

let environmentAssetsPresent = 0;
for (const id of pass.launchScope.environment) {
  const path = `apps/client-godot/assets/environment/${id}.png`;
  if (png(path, `environment:${id}`)) environmentAssetsPresent += 1;
  else missingCoverage.push({ lane: "environment", id, missingFiles: [path] });
}

let uiAssetsPresent = 0;
for (const id of pass.launchScope.ui) {
  const path = id === "rro-mark" ? "apps/client-godot/assets/ui/rro-mark.svg" : id === "login-hero" ? "apps/client-godot/assets/ui/login-hero.png" : `apps/client-godot/assets/ui/builder/${id.replace(/^builder-/, "")}.png`;
  if (file(path)) {
    uiAssetsPresent += 1;
    if (path.endsWith(".png")) png(path, `ui:${id}`);
  } else missingCoverage.push({ lane: "ui", id, missingFiles: [path] });
}

let bodyFoundationFiles = 0;
let skinFoundationFiles = 0;
for (const body of contract.bodyPresentations) {
  for (const direction of contract.directions) {
    if (png(`apps/client-godot/assets/characters/body/${body}/idle/${direction}.png`, `body:${body}:idle:${direction}`, [384, 512])) bodyFoundationFiles += 1;
    for (const kind of ["skin-diffuse", "skin-mask"]) {
      if (png(`apps/client-godot/assets/characters/body/${body}/idle/${kind}/${direction}.png`, `${kind}:${body}:${direction}`, [384, 512])) skinFoundationFiles += 1;
    }
  }
}

let prototypeOutfitFiles = 0;
let remediatedOutfitVariants = 0;
for (const outfit of contract.prototypeOutfitFamilies) {
  for (const body of contract.bodyPresentations) {
    const assetId = `outfit-${outfit}-${body}`;
    let variantFiles = 0;
    for (const direction of contract.directions) for (const kind of ["diffuse", "primary-mask", "secondary-mask"]) {
      if (png(`apps/client-godot/assets/characters/outfits/${outfit}/${body}/idle/${kind}/${direction}.png`, `outfit:${outfit}:${body}:${kind}:${direction}`, [384, 512])) variantFiles += 1;
    }
    prototypeOutfitFiles += variantFiles;
    if (variantFiles === contract.directions.length * 3 && acceptedAssets.get(assetId) === "passed") remediatedOutfitVariants += 1;
  }
}

const runtimeFloor = readFileSync(resolve(ROOT, "apps/client-godot/scripts/restaurant_floor.gd"), "utf8");
const directionalRuntimeBound = directionalSelectionBound
  && furnitureRuntimeContract.capability.projectionAligned === true
  && furnitureRuntimeContract.capability.runtimeCompositeAccepted === true;
const characterRuntimeBound = runtimeFloor.includes("assets/characters") && !runtimeFloor.includes("draw_circle(draw_position, 10, primary)");
const inventoryRuntime = readFileSync(resolve(ROOT, "apps/client-godot/scripts/inventory_panel.gd"), "utf8");
const equipmentRuntimeBound = inventoryRuntime.includes("res://assets/items/%s.png");
const slotChoiceCount = Object.values(contract.slotCatalogs).reduce((sum, entries) => sum + entries.length, 0)
  + contract.roleLayers.length + contract.hairStyles.filter((id) => id !== "bald").length + contract.facialHair.filter((id) => id !== "none").length;
const equippableCount = roleEquipment.items.filter((item) => item.kind === "equipment").length;
const requiredBodyFinalFrameCells = contract.bodyPresentations.length * contract.directions.length * contract.animations.reduce((sum, animation) => sum + animation.frames, 0);

const coverage = {
  furniture: {
    requiredSets: production.furniture.length,
    presentSets: furnitureSetsPresent,
    sourceAcceptedSets: furnitureSourceAccepted,
    directionalSelectionBound,
    projectionAligned: furnitureRuntimeContract.capability.projectionAligned === true,
    runtimeBoundSets: furnitureRuntimeBoundSets,
    runtimeReviewRemoteVerified,
    productionCompleteSets: furnitureProductionCompleteSets,
    runtimeBound: directionalRuntimeBound,
  },
  equipmentIcons: { required: production.roleItems.length, present: equipmentIconsPresent, runtimeLoaderReady: equipmentRuntimeBound },
  construction: { requiredMaterials: construction.surfaces.length + construction.wallStyles.length, presentMaterials: constructionMaterialsPresent, requiredOpeningSets: pass.launchScope.construction.openingTypes.length, presentOpeningSets: openingSetsPresent, requiredUtilityOverlays: pass.launchScope.construction.utilityOverlays.length, presentUtilityOverlays: utilityOverlaysPresent },
  world: { required: pass.launchScope.world.length, present: worldAssetsPresent },
  environment: { required: pass.launchScope.environment.length, present: environmentAssetsPresent },
  ui: { required: pass.launchScope.ui.length, present: uiAssetsPresent, sourceAccepted: 0 },
  characters: {
    requiredBodyFoundationFiles: contract.bodyPresentations.length * contract.directions.length,
    presentBodyFoundationFiles: bodyFoundationFiles,
    requiredSkinFoundationFiles: contract.bodyPresentations.length * contract.directions.length * 2,
    presentSkinFoundationFiles: skinFoundationFiles,
    requiredFinalBodyFrameCells: requiredBodyFinalFrameCells,
    presentFinalBodyFrameCells: 0,
    requiredSplitLayerBodyFits: slotChoiceCount * contract.bodyPresentations.length,
    presentSplitLayerBodyFits: 0,
    requiredEquipmentAttachmentBodyFits: equippableCount * contract.bodyPresentations.length,
    presentEquipmentAttachmentBodyFits: 0,
    prototypeOutfitFilesPreserved: prototypeOutfitFiles,
    remediatedOutfitVariants,
    requiredActivityBindings: activities.length,
    presentActivityBindings: 0,
    runtimeBound: characterRuntimeBound,
  },
  reviewedBatches: pass.batches.length,
  uniqueCheckedPngs: hashes.size,
};

const declaredFurnitureCoverage = pass.coverage?.furniture ?? {};
const expectedFurnitureCoverage = {
  catalogTotal: production.furniture.length,
  acceptedSets: furnitureSourceAccepted,
  acceptedDirectionalFiles: furnitureSourceAccepted * pass.artDirection.furnitureDirections.length,
  runtimeCompositeAcceptedSets: runtimeCompositeAcceptedAssetIds.size,
};
if (JSON.stringify(declaredFurnitureCoverage) !== JSON.stringify(expectedFurnitureCoverage)) {
  invalid.push(`declared furniture coverage does not match validated files/reviews/runtime state: expected ${JSON.stringify(expectedFurnitureCoverage)}`);
}

const productionComplete = furnitureSetsPresent === production.furniture.length
  && furnitureSourceAccepted === production.furniture.length
  && directionalRuntimeBound
  && equipmentIconsPresent === production.roleItems.length
  && constructionMaterialsPresent === construction.surfaces.length + construction.wallStyles.length
  && openingSetsPresent === pass.launchScope.construction.openingTypes.length
  && utilityOverlaysPresent === pass.launchScope.construction.utilityOverlays.length
  && worldAssetsPresent === pass.launchScope.world.length
  && environmentAssetsPresent === pass.launchScope.environment.length
  && uiAssetsPresent === pass.launchScope.ui.length
  && characterRuntimeBound
  && coverage.characters.presentFinalBodyFrameCells === coverage.characters.requiredFinalBodyFrameCells
  && coverage.characters.presentSplitLayerBodyFits === coverage.characters.requiredSplitLayerBodyFits
  && coverage.characters.presentEquipmentAttachmentBodyFits === coverage.characters.requiredEquipmentAttachmentBodyFits
  && coverage.characters.presentActivityBindings === coverage.characters.requiredActivityBindings;

if (REQUIRE_COMPLETE && !productionComplete) invalid.push("production art is not complete; see docs/ART_PROGRESS.md for exact missing coverage");
const missingFilesByLane = Object.fromEntries(Object.entries(Object.groupBy(missingCoverage, (entry) => entry.lane)).map(([lane, entries]) => [lane, entries.length]));
const incompleteUnitsByLane = {
  ...missingFilesByLane,
  "character-animation-set": contract.bodyPresentations.length * contract.animations.length,
  "character-split-layer-body-fit": slotChoiceCount * contract.bodyPresentations.length,
  "character-equipment-attachment-body-fit": equippableCount * contract.bodyPresentations.length,
  "activity-animation-binding": activities.length,
};
const result = { ok: invalid.length === 0, productionComplete, requireComplete: REQUIRE_COMPLETE, coverage, missingFileRequirementCount: missingCoverage.length, missingFilesByLane, incompleteUnitsByLane, ...(VERBOSE ? { missingCoverage } : {}), invalid };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
