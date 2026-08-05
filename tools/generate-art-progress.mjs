import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUTPUT = resolve(ROOT, "docs/ART_PROGRESS.md");
const CHECK = process.argv.includes("--check");
const readJson = (path) => JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
const pass = readJson("planning/art-pass-v2.json");
const production = readJson("planning/art-production.json");
const characters = readJson("planning/character-art-catalog.json");
const characterApplicability = readJson("planning/character-launch-applicability-v1.json");
const construction = readJson("packages/game-data/core/construction.json");
const furnitureDefinitions = [
  ...readJson("packages/game-data/core/furniture.json"),
  ...readJson("packages/game-data/core/furniture-production.json"),
];
const furnitureDefinitionByAssetId = new Map(furnitureDefinitions.map((item) => [item.assetId ?? item.id, item]));
const roleEquipment = readJson("packages/game-data/core/role-equipment.json");
const activities = readJson("packages/game-data/core/activities.json").activities;
const furnitureDirections = pass.artDirection.furnitureDirections;
const characterDirections = pass.artDirection.characterDirections;
const runtimeFloor = readFileSync(resolve(ROOT, "apps/client-godot/scripts/restaurant_floor.gd"), "utf8");
const runtimeInventory = readFileSync(resolve(ROOT, "apps/client-godot/scripts/inventory_panel.gd"), "utf8");
const furnitureRuntimeContract = existsSync(resolve(ROOT, "apps/client-godot/furniture-art-runtime.json"))
  ? readJson("apps/client-godot/furniture-art-runtime.json")
  : { capability: {} };

const relative = (path) => resolve(ROOT, path);
const present = (path) => existsSync(relative(path));
const canonicalArtifactBytes = (path) => {
  const data = readFileSync(relative(path));
  return /\.(svg)$/i.test(path) ? Buffer.from(data.toString("utf8").replace(/\r\n/g, "\n"), "utf8") : data;
};
const hash = (path) => present(path) ? createHash("sha256").update(canonicalArtifactBytes(path)).digest("hex") : null;
const files = (paths) => paths.map((path) => ({ path, present: present(path), sha256: hash(path) }));
const allPresent = (entries) => entries.length > 0 && entries.every((entry) => entry.present);
const percent = (part, whole) => whole ? `${(part / whole * 100).toFixed(1)}%` : "n/a";
const yes = (value) => value ? "yes" : "no";

const batches = pass.batches.map((batch) => {
  const qaEvidencePresent = Boolean(batch.qaEvidence && present(batch.qaEvidence));
  return {
    ...batch,
    qaEvidencePresent,
    remoteVerified: qaEvidencePresent
      && /^[0-9a-f]{40}$/.test(batch.remoteCommit ?? "")
      && /^[0-9a-f]{40}$/.test(batch.remoteTree ?? ""),
  };
});
const pendingBatches = (pass.pendingBatches ?? []).map((batch) => ({
  ...batch,
  qaEvidencePresent: Boolean(batch.qaEvidence && present(batch.qaEvidence)),
  remoteVerified: false,
  preservationPending: true,
}));
const runtimeQaAttempts = (pass.runtimeQaAttempts ?? []).map((attempt) => ({
  ...attempt,
  evidencePresent: Boolean(attempt.evidence && present(attempt.evidence)),
  reviewRemoteVerified: Boolean(
    attempt.evidence
      && present(attempt.evidence)
      && /^[0-9a-f]{40}$/.test(attempt.reviewPreservation?.commit ?? "")
      && /^[0-9a-f]{40}$/.test(attempt.reviewPreservation?.tree ?? "")
      && /^https:\/\/github\.com\/Maergoth\/rro\/actions\/runs\/\d+$/.test(attempt.reviewPreservation?.ci ?? ""),
  ),
}));
const reviewBatches = [...batches, ...pendingBatches];

function reviewFor(assetId) {
  for (const batch of [...reviewBatches].reverse()) {
    if (!batch.assets.includes(assetId)) continue;
    const review = batch.assetReviews?.[assetId] ?? batch.qa;
    return { batchId: batch.id, review, runtimeQa: batch.runtimeQa, remoteVerified: batch.remoteVerified, qaEvidence: batch.qaEvidence, qaEvidencePresent: batch.qaEvidencePresent };
  }
  return { batchId: null, review: "unreviewed", runtimeQa: "not-reviewed", remoteVerified: false, qaEvidence: null, qaEvidencePresent: false };
}

function status({ isPresent, review, remoteVerified, runtimeBound, productionComplete = false }) {
  if (productionComplete) return "production_complete";
  if (String(review).startsWith("failed") || review === "mixed") return "qa_failed_needs_remediation";
  if (review === "passed" || String(review).startsWith("passed-source")) return remoteVerified ? "source_accepted_runtime_blocked" : "source_accepted_local_only";
  if (isPresent && runtimeBound) return "runtime_bound_unreviewed";
  if (isPresent) return "present_unreviewed";
  return "missing";
}

const directionalSelectionBound = furnitureRuntimeContract.capability.directionalTextureSelection === true;
const runtimeCompositeAcceptedAssetIds = new Set(furnitureRuntimeContract.runtimeCompositeAcceptedAssetIds ?? []);
const runtimeCompositeBlockedAssetIds = new Set(furnitureRuntimeContract.runtimeCompositeBlockedAssetIds ?? []);
const runtimeCompositePendingAssetIds = new Set(furnitureRuntimeContract.runtimeCompositePendingAssetIds ?? []);
const projectionAligned = furnitureRuntimeContract.capability.projectionAligned === true;
const latestFurnitureRuntimeQa = [...runtimeQaAttempts].reverse().find((attempt) => Array.isArray(attempt.acceptedAssetIds));
const runtimeReviewRemoteVerified = latestFurnitureRuntimeQa?.reviewRemoteVerified === true;
const equipmentRuntimeLoader = runtimeInventory.includes("res://assets/items/%s.png");
const characterRuntimeBound = runtimeFloor.includes("assets/characters") && !runtimeFloor.includes("draw_circle(draw_position, 10, primary)");

const furniture = production.furniture.map((item) => {
  const runtimeFiles = files(furnitureDirections.map((direction) => `apps/client-godot/assets/objects/directional/${item.assetId}/${direction}.png`));
  const review = reviewFor(item.assetId);
  const definition = furnitureDefinitionByAssetId.get(item.assetId);
  const placementDeclared = Boolean(definition?.placement);
  const isPresent = allPresent(runtimeFiles);
  const sourceAccepted = isPresent && placementDeclared && review.review === "passed" && review.qaEvidencePresent;
  const runtimeBound = isPresent && directionalSelectionBound && projectionAligned && runtimeCompositeAcceptedAssetIds.has(item.assetId);
  const productionComplete = sourceAccepted && review.remoteVerified && runtimeBound && runtimeReviewRemoteVerified;
  return {
    id: item.id, assetId: item.assetId, name: item.name, category: item.category, sourcePack: item.sourcePack,
    requiredDirections: furnitureDirections, files: runtimeFiles, present: isPresent, ...review,
    placement: definition?.placement ?? null, placementDeclared, sourceAccepted,
    directionalSelectionBound: isPresent && directionalSelectionBound,
    runtimeCompositeAccepted: runtimeCompositeAcceptedAssetIds.has(item.assetId),
    runtimeCompositeBlocked: runtimeCompositeBlockedAssetIds.has(item.assetId),
    runtimeCompositePending: runtimeCompositePendingAssetIds.has(item.assetId),
    runtimeBound, productionComplete,
    status: status({ isPresent, review: review.review, remoteVerified: review.remoteVerified, runtimeBound, productionComplete }),
  };
});

const equipmentIcons = production.roleItems.map((item) => {
  const runtimeFiles = files([item.output]);
  const review = reviewFor(item.id);
  const isPresent = allPresent(runtimeFiles);
  const runtimeBound = isPresent && equipmentRuntimeLoader;
  const productionComplete = isPresent && review.review === "passed" && review.qaEvidencePresent && review.remoteVerified && runtimeBound;
  return {
    id: item.id, name: item.name, kind: item.kind, roles: item.allowedRoleIds, files: runtimeFiles, present: isPresent,
    ...review, runtimeBound, productionComplete,
    status: status({ isPresent, review: review.review, remoteVerified: review.remoteVerified, runtimeBound, productionComplete }),
  };
});

const constructionMaterials = [
  ...construction.surfaces.map((item) => ({ id: item.assetId, type: "floor", path: `apps/client-godot/assets/construction/floors/${item.assetId}.png` })),
  ...construction.wallStyles.map((item) => ({ id: item.assetId, type: "wall-material", path: `apps/client-godot/assets/construction/walls/${item.assetId}.png` })),
].map((item) => ({ ...item, present: present(item.path), sha256: hash(item.path), status: present(item.path) ? "present_unreviewed" : "missing" }));

const openingModules = pass.launchScope.construction.openingTypes.map((id) => {
  const runtimeFiles = files(pass.launchScope.construction.openingDirections.map((direction) => `apps/client-godot/assets/construction/openings/${id}/${direction}.png`));
  return { id, requiredDirections: pass.launchScope.construction.openingDirections, files: runtimeFiles, present: allPresent(runtimeFiles), status: allPresent(runtimeFiles) ? "present_unreviewed" : "missing" };
});

const utilityOverlays = pass.launchScope.construction.utilityOverlays.map((id) => {
  const path = `apps/client-godot/assets/construction/utilities/${id}.png`;
  return { id, path, present: present(path), sha256: hash(path), status: present(path) ? "present_unreviewed" : "missing" };
});

const world = pass.launchScope.world.map((id) => {
  const path = `apps/client-godot/assets/world/${id}.png`;
  return { id, path, present: present(path), sha256: hash(path), status: present(path) ? "present_unreviewed" : "missing" };
});

const environment = pass.launchScope.environment.map((id) => {
  const path = `apps/client-godot/assets/environment/${id}.png`;
  return { id, path, present: present(path), sha256: hash(path), status: present(path) ? "present_unreviewed" : "missing" };
});

const ui = pass.launchScope.ui.map((id) => {
  const path = id === "rro-mark" ? "apps/client-godot/assets/ui/rro-mark.svg" : id === "login-hero" ? "apps/client-godot/assets/ui/login-hero.png" : `apps/client-godot/assets/ui/builder/${id.replace(/^builder-/, "")}.png`;
  const isPresent = present(path);
  const runtimeBound = id === "rro-mark" && readFileSync(resolve(ROOT, "apps/client-godot/export_presets.cfg"), "utf8").includes("rro-mark.svg");
  return { id, path, present: isPresent, sha256: hash(path), runtimeBound, status: status({ isPresent, review: "unreviewed", remoteVerified: false, runtimeBound }) };
});

const bodyFoundations = characters.bodyPresentations.map((body) => {
  const runtimeFiles = files(characterDirections.map((direction) => `apps/client-godot/assets/characters/body/${body}/idle/${direction}.png`));
  const review = reviewFor(`body-${body}-idle-isometric`);
  const isPresent = allPresent(runtimeFiles);
  return { body, files: runtimeFiles, present: isPresent, ...review, runtimeBound: characterRuntimeBound, productionComplete: false, status: status({ isPresent, review: review.review, remoteVerified: review.remoteVerified, runtimeBound: characterRuntimeBound }) };
});

const skinFoundations = characters.bodyPresentations.map((body) => {
  const runtimeFiles = files(characterDirections.flatMap((direction) => [
    `apps/client-godot/assets/characters/body/${body}/idle/skin-diffuse/${direction}.png`,
    `apps/client-godot/assets/characters/body/${body}/idle/skin-mask/${direction}.png`,
  ]));
  const review = reviewFor(`body-skin-masks-${body}`);
  const isPresent = allPresent(runtimeFiles);
  return { body, files: runtimeFiles, present: isPresent, ...review, runtimeBound: characterRuntimeBound, productionComplete: false, status: status({ isPresent, review: review.review, remoteVerified: review.remoteVerified, runtimeBound: characterRuntimeBound }) };
});

const prototypeOutfits = characters.prototypeOutfitFamilies.flatMap((outfit) => characters.bodyPresentations.map((body) => {
  const runtimeFiles = files(characterDirections.flatMap((direction) => ["diffuse", "primary-mask", "secondary-mask"].map((kind) => `apps/client-godot/assets/characters/outfits/${outfit}/${body}/idle/${kind}/${direction}.png`)));
  const review = reviewFor(`outfit-${outfit}-${body}`);
  const isPresent = allPresent(runtimeFiles);
  return { outfit, body, files: runtimeFiles, present: isPresent, ...review, runtimeBound: false, productionComplete: false, status: status({ isPresent, review: review.review, remoteVerified: review.remoteVerified, runtimeBound: false }) };
}));

const renderedHair = characters.hairStyles.filter((id) => id !== "bald");
const renderedFacialHair = characters.facialHair.filter((id) => id !== "none");
const slotCatalogs = {
  faces: characters.slotCatalogs.faces,
  shirts: characters.slotCatalogs.shirts,
  pants: characters.slotCatalogs.pants,
  aprons: characters.slotCatalogs.aprons,
  shoes: characters.slotCatalogs.shoes,
  hair: renderedHair,
  facialHair: renderedFacialHair,
  headwear: characters.slotCatalogs.headwear,
  eyewear: characters.slotCatalogs.eyewear,
  accessories: characters.slotCatalogs.accessories,
  roleLayers: characters.roleLayers,
};
const slotChoiceCount = Object.values(slotCatalogs).reduce((sum, entries) => sum + entries.length, 0);
const equippableItems = roleEquipment.items.filter((item) => item.kind === "equipment");
const totalAnimationFrames = characters.animations.reduce((sum, animation) => sum + animation.frames, 0);
const totalSourcePoses = characters.animations.reduce((sum, animation) => sum + animation.sourcePoseFrames, 0);

const legacyObjectRoot = relative("apps/client-godot/assets/objects/generated");
const legacyObjectPngs = existsSync(legacyObjectRoot) ? readdirSync(legacyObjectRoot).filter((name) => name.endsWith(".png") && statSync(resolve(legacyObjectRoot, name)).isFile()).sort() : [];

const summaries = [
  { lane: "Furniture directional sets", required: furniture.length, present: furniture.filter((item) => item.present).length, sourceAccepted: furniture.filter((item) => item.sourceAccepted).length, remoteVerified: furniture.filter((item) => item.sourceAccepted && item.remoteVerified).length, productionComplete: furniture.filter((item) => item.productionComplete).length },
  { lane: "Equipment inventory icons", required: equipmentIcons.length, present: equipmentIcons.filter((item) => item.present).length, sourceAccepted: equipmentIcons.filter((item) => item.present && item.qaEvidencePresent && item.review === "passed").length, remoteVerified: equipmentIcons.filter((item) => item.present && item.qaEvidencePresent && item.remoteVerified).length, productionComplete: equipmentIcons.filter((item) => item.productionComplete).length },
  { lane: "Construction material textures", required: constructionMaterials.length, present: constructionMaterials.filter((item) => item.present).length, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
  { lane: "Opening geometry sets (4 directions each)", required: openingModules.length, present: openingModules.filter((item) => item.present).length, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
  { lane: "Utility overlays", required: utilityOverlays.length, present: utilityOverlays.filter((item) => item.present).length, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
  { lane: "World atlas", required: world.length, present: world.filter((item) => item.present).length, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
  { lane: "Environment helpers", required: environment.length, present: environment.filter((item) => item.present).length, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
  { lane: "Launch UI assets", required: ui.length, present: ui.filter((item) => item.present).length, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
  { lane: "Character body source foundations", required: bodyFoundations.length, present: bodyFoundations.filter((item) => item.present).length, sourceAccepted: bodyFoundations.filter((item) => item.present && item.qaEvidencePresent && item.review === "passed").length, remoteVerified: bodyFoundations.filter((item) => item.present && item.qaEvidencePresent && item.remoteVerified).length, productionComplete: 0 },
  { lane: "Body animation sets (body × animation)", required: characters.bodyPresentations.length * characters.animations.length, present: 0, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
  { lane: "Split modular layer body-fits", required: slotChoiceCount * characters.bodyPresentations.length, present: 0, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
  { lane: "Equipment attachment body-fits", required: equippableItems.length * characters.bodyPresentations.length, present: 0, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
  { lane: "Activity → animation bindings", required: activities.length, present: 0, sourceAccepted: 0, remoteVerified: 0, productionComplete: 0 },
];

const ledger = {
  schemaVersion: 1,
  product: "Rush & Revenue Online",
  authoritativeProgressDocument: "docs/ART_PROGRESS.md",
  generatedFrom: [
    "packages/game-data/** art-bearing catalogs",
    "planning/art-pass-v2.json",
    "planning/art-production.json",
    "planning/character-art-catalog.json",
    "planning/character-launch-applicability-v1.json",
    "apps/client-godot/assets/**",
    "current Godot runtime bindings",
  ],
  durableBaseline: { branch: pass.branch, pullRequest: pass.pullRequest, ...pass.lastVerifiedRemote },
  completionPipeline: ["generated", "processed", "raster_validated", "visual_accepted", "runtime_bound", "remote_verified", "ci_green"],
  completionRule: "An asset is production-complete only when every pipeline gate passes. Mere existence, metadata bindings, procedural fallbacks, and quarantined/local-only files never count.",
  runtimeCapabilities: {
    directionalFurniture: {
      ...furnitureRuntimeContract.capability,
      acceptedDirectionalAssetIds: furnitureRuntimeContract.acceptedDirectionalAssetIds,
      runtimeCompositeAcceptedAssetIds: furnitureRuntimeContract.runtimeCompositeAcceptedAssetIds,
      runtimeCompositeBlockedAssetIds: furnitureRuntimeContract.runtimeCompositeBlockedAssetIds,
      runtimeCompositePendingAssetIds: furnitureRuntimeContract.runtimeCompositePendingAssetIds,
      runtimeReviewRemoteVerified,
    },
  },
  summaries,
  furniture,
  equipmentIcons,
  construction: { materials: constructionMaterials, openings: openingModules, utilities: utilityOverlays },
  world,
  environment,
  ui,
  characters: {
    directions: characterDirections,
    bodyPresentations: characters.bodyPresentations,
    skinTones: characters.skinTones,
    animationCount: characters.animations.length,
    animations: characters.animations,
    framesPerDirection: totalAnimationFrames,
    sourcePosesPerDirection: totalSourcePoses,
    requiredBodySourcePoses: totalSourcePoses * characterDirections.length * characters.bodyPresentations.length,
    requiredBodyFinalFrameCells: totalAnimationFrames * characterDirections.length * characters.bodyPresentations.length,
    presentStaticBodyPoses: bodyFoundations.reduce((sum, body) => sum + body.files.filter((file) => file.present).length, 0),
    bodyFoundations,
    skinFoundations,
    prototypeOutfits,
    productionSlotCatalogs: slotCatalogs,
    requiredSplitLayerBodyFits: slotChoiceCount * characters.bodyPresentations.length,
    equippableAttachmentIds: equippableItems.map((item) => item.id),
    requiredEquipmentAttachmentBodyFits: equippableItems.length * characters.bodyPresentations.length,
    requiredActivityBindings: activities.length,
    presentActivityBindings: 0,
    runtimeBound: characterRuntimeBound,
    launchApplicability: characterApplicability,
  },
  reviewedBatches: batches,
  pendingBatches,
  runtimeQaAttempts,
  preservedReferences: [{ id: "alpha2-overhead-furniture", files: legacyObjectPngs.map((name) => `apps/client-godot/assets/objects/generated/${name}`), count: legacyObjectPngs.length, productionStatus: "preserved-reference-wrong-camera" }],
  quarantinedWork: pass.quarantinedWork,
  contractGaps: [
    "Freeze furniture shadow and operational-state requirements (active, dirty, damaged, broken) per catalog item before those states can receive a completion denominator.",
    "Run exact four-rotation native Godot composite review for furniture-banquette-section, furniture-commercial-chair, and furniture-premium-chair; complete mounted-object server placement, builder snapping, runtime anchors, and depth before re-reviewing local-art, plants, and pendants.",
    "Implement character animation storage/rigging and phase-level task choreography against the frozen launch applicability matrix; static direction art and metadata-only aliases do not satisfy its raster-cell contract.",
    "Enumerate production minigame presentation art and regional/world overlays beyond the single launch atlas before whole-game art can be called complete.",
  ],
};

const missingFurnitureByCategory = Object.groupBy(furniture.filter((item) => !item.present), (item) => item.category);
const incompleteEquipmentIcons = equipmentIcons.filter((item) => !item.productionComplete);
const lines = [];
lines.push("# RRO production art progress");
lines.push("");
lines.push("> This is the single authoritative art-status document referenced by every art check-in. It is generated from catalogs, reviewed-batch evidence, committed files, and runtime bindings. Run `npm run art:ledger` after an art change; CI runs `npm run art:ledger:check` and fails if this document is stale.");
lines.push("");
lines.push("## What counts");
lines.push("");
lines.push("`generated → processed → raster validated → visually accepted → runtime bound → remote verified → CI green`");
lines.push("");
lines.push("Only the final state is production-complete. Existing files, historical narrative approval, metadata-only animation aliases, procedural fallback art, and local/quarantined commits are tracked without inflating completion.");
lines.push("");
lines.push("## Durable baseline");
lines.push("");
lines.push(`- Branch: \`${pass.branch}\``);
lines.push(`- Draft PR: ${pass.pullRequest}`);
lines.push(`- Last verified remote head before this ledger check-in: \`${pass.lastVerifiedRemote.commit}\``);
lines.push(`- Verified tree: \`${pass.lastVerifiedRemote.tree}\``);
lines.push(`- CI: ${pass.lastVerifiedRemote.ci}`);
lines.push("");
lines.push("## Launch coverage");
lines.push("");
lines.push("| Lane | Required units | Files/sets present | Source accepted | Remote verified | Production complete |");
lines.push("|---|---:|---:|---:|---:|---:|");
for (const row of summaries) lines.push(`| ${row.lane} | ${row.required} | ${row.present} | ${row.sourceAccepted} | ${row.remoteVerified} | ${row.productionComplete} |`);
lines.push("");
lines.push(`${equipmentIcons.filter((item) => item.productionComplete).length} equipment icons and ${furniture.filter((item) => item.productionComplete).length} furniture directional sets are production-complete because their exact reviewed bytes are visually accepted, runtime-bound, remotely verified, and CI-green. Character art and the other missing lanes remain explicit below.`);
lines.push(`Directional furniture texture selection is ${yes(directionalSelectionBound)} and projection alignment is ${yes(projectionAligned)}. Native attempt 002 accepted ${runtimeCompositeAcceptedAssetIds.size}/${furniture.filter((item) => item.present).length} present sets; its durable review checkpoint is remote-verified: ${yes(runtimeReviewRemoteVerified)}. ${[...runtimeCompositeBlockedAssetIds].map((id) => `\`${id}\``).join(", ")} remain blocked on legal wall/ceiling mounting. ${[...runtimeCompositePendingAssetIds].map((id) => `\`${id}\``).join(", ")} are source-accepted but pending their first native four-rotation gameplay composite.`);
lines.push("");
lines.push("## Character truth");
lines.push("");
lines.push(`- Durable character files: ${bodyFoundations.reduce((sum, item) => sum + item.files.filter((file) => file.present).length, 0) + skinFoundations.reduce((sum, item) => sum + item.files.filter((file) => file.present).length, 0) + prototypeOutfits.reduce((sum, item) => sum + item.files.filter((file) => file.present).length, 0)} PNGs.`);
lines.push(`- Body source poses: ${ledger.characters.presentStaticBodyPoses}/${ledger.characters.requiredBodySourcePoses} (${percent(ledger.characters.presentStaticBodyPoses, ledger.characters.requiredBodySourcePoses)}).`);
lines.push(`- Final body animation frame cells: 0/${ledger.characters.requiredBodyFinalFrameCells}; even idle requires four frames and currently has one still per direction.`);
lines.push(`- Final runtime raster-channel cells: 0/${characterApplicability.totals.totalFinalRuntimeRasterCells.toLocaleString("en-US")} across body, modular-layer, mask, and equipment channels; the corresponding authored-source denominator is ${characterApplicability.totals.totalSourceRuntimeRasterCells.toLocaleString("en-US")}.`);
lines.push(`- Source foundations: ${bodyFoundations.filter((item) => item.review === "passed").length}/2 accepted with a normalized \`(192,472)\` ground pivot and clean skin channels; ${bodyFoundations.filter((item) => item.remoteVerified).length}/2 reflect the currently reviewed bytes on a verified remote checkpoint.`);
lines.push(`- Split swappable layer body-fits: 0/${ledger.characters.requiredSplitLayerBodyFits}; required catalogs are frozen below.`);
lines.push(`- Equipment attachment body-fits: 0/${ledger.characters.requiredEquipmentAttachmentBodyFits} from ${equippableItems.length} equippable items.`);
lines.push(`- Activity-animation bindings: 0/${activities.length}.`);
lines.push("- Applicability is frozen in `planning/character-launch-applicability-v1.json`: "
  + `${characterApplicability.totals.visibleModularChoiceCount} visible modular choices, `
  + `${characterApplicability.totals.equipmentAliasItemCount} footwear aliases, `
  + `${characterApplicability.totals.equipmentDeformingItemCount} deforming worn items, `
  + `${characterApplicability.totals.equipmentRigidItemCount} rigid anchored items, and `
  + `${characterApplicability.totals.consumableNoPersistentAttachmentCount} nonpersistent consumables.`);
lines.push(`- Classic idle outfit body-fits: ${prototypeOutfits.filter((item) => item.outfit === "classic" && item.review === "passed").length}/2 source-accepted and ${prototypeOutfits.filter((item) => item.outfit === "classic" && item.remoteVerified).length}/2 remote-verified after full-resolution/gameplay composite remediation; they remain production-incomplete until split-layer catalog coverage, animation frames, and runtime compositing pass.`);
lines.push("- Apron prototypes remain durable but QA-failed for silhouette/foot leakage and are not counted.");
lines.push("");
lines.push("| Modular slot | Required visible choices | IDs |");
lines.push("|---|---:|---|");
for (const [slot, ids] of Object.entries(slotCatalogs)) lines.push(`| ${slot} | ${ids.length} | ${ids.map((id) => `\`${id}\``).join(", ")} |`);
lines.push("");
lines.push("## Native runtime art QA attempts");
lines.push("");
lines.push("A native capture is evidence, not automatic acceptance. Failed attempts remain durable here so projection, placement, and legibility defects cannot be forgotten or silently relabeled as complete.");
lines.push("");
lines.push("| Attempt | Result | Remote commit | CI/artifact | Passed gates | Blocking defects | Durable review |");
lines.push("|---|---|---|---|---|---|---|");
for (const attempt of runtimeQaAttempts) {
  const artifact = attempt.artifactId ? `${attempt.ci}/artifacts/${attempt.artifactId}` : attempt.ci;
  lines.push(`| ${attempt.id} | ${attempt.status} | \`${attempt.remoteCommit.slice(0, 7)}\` | ${artifact} | ${(attempt.passed ?? []).join(", ")} | ${(attempt.blockers ?? []).join(", ")} | ${attempt.evidencePresent ? attempt.evidence : "missing"} |`);
}
lines.push("");
lines.push("## Reviewed batches and durable evidence");
lines.push("");
lines.push("| Batch | Files | Source QA | Runtime/composite QA | Remote commit | Contact sheet |");
lines.push("|---|---:|---|---|---|---|");
for (const batch of batches) lines.push(`| ${batch.id} | ${batch.files} | ${batch.qa} | ${batch.runtimeQa} | \`${batch.remoteCommit.slice(0, 7)}\` | ${batch.qaEvidencePresent ? batch.qaEvidence : "missing"} |`);
lines.push("");
if (pendingBatches.length > 0) {
  lines.push("## Accepted locally, remote checkpoint pending");
  lines.push("");
  lines.push("These batches have passed source/composite QA but deliberately do not count as remotely verified or production-complete until their immutable GitHub commit and hosted CI are recorded.");
  lines.push("");
  lines.push("| Batch | Files | Source QA | Runtime/composite QA | Evidence |");
  lines.push("|---|---:|---|---|---|");
  for (const batch of pendingBatches) lines.push(`| ${batch.id} | ${batch.files} | ${batch.qa} | ${batch.runtimeQa} | ${batch.qaEvidencePresent ? batch.qaEvidence : "missing"} |`);
  lines.push("");
}
lines.push("## Missing furniture directional sets");
lines.push("");
lines.push(`${furniture.filter((item) => item.present).length} of ${furniture.length} elevated four-direction sets are present. The ${legacyObjectPngs.length} attractive overhead singles are preserved as references but do not satisfy this camera contract.`);
lines.push("");
for (const [category, items] of Object.entries(missingFurnitureByCategory)) {
  lines.push(`### ${category} — ${items.length} missing`);
  lines.push("");
  lines.push(items.map((item) => `\`${item.assetId}\``).join(", "));
  lines.push("");
}
lines.push("## Other exact incomplete catalogs");
lines.push("");
lines.push(`- Equipment icons (${incompleteEquipmentIcons.length}): ${incompleteEquipmentIcons.length > 0 ? incompleteEquipmentIcons.map((item) => `\`${item.id}\``).join(", ") : "none"}`);
lines.push(`- Construction materials (${constructionMaterials.length}): ${constructionMaterials.map((item) => `\`${item.id}\``).join(", ")}`);
lines.push(`- Opening geometry (${openingModules.length} × 4 directions): ${openingModules.map((item) => `\`${item.id}\``).join(", ")}`);
lines.push(`- Utility overlays (${utilityOverlays.length}): ${utilityOverlays.map((item) => `\`${item.id}\``).join(", ")}`);
lines.push(`- World (${world.length}): ${world.map((item) => `\`${item.id}\``).join(", ")}`);
lines.push(`- Environment (${environment.length}): ${environment.map((item) => `\`${item.id}\``).join(", ")}`);
lines.push(`- UI (${ui.length} incomplete: ${ui.filter((item) => !item.present).length} absent, ${ui.filter((item) => item.present && item.status !== "production_complete").length} present but unreviewed): ${ui.map((item) => `\`${item.id}\``).join(", ")}`);
lines.push("");
lines.push("## Preserved and quarantined work");
lines.push("");
lines.push(`- Preserved: ${legacyObjectPngs.length} high-quality direct-overhead furniture PNGs remain in \`apps/client-godot/assets/objects/generated\` for identity/material reference.`);
lines.push("- Quarantined: local commit `5714bb8` contains 1,473 deterministic Pillow placeholder PNGs. It is not on PR #2, is not production art, and remains recorded so future runs neither count nor rediscover it.");
lines.push("");
lines.push("## Contract gaps blocking a truthful 100% denominator");
lines.push("");
for (const gap of ledger.contractGaps) lines.push(`- ${gap}`);
lines.push("");
lines.push("## Machine-readable ledger");
lines.push("");
lines.push("This JSON block is part of this same authoritative document and contains every catalog ID, expected runtime path, file hash, review state, and durability gate.");
lines.push("");
lines.push("<!-- ART_LEDGER_JSON_BEGIN -->");
lines.push("```json");
lines.push(JSON.stringify(ledger, null, 2));
lines.push("```");
lines.push("<!-- ART_LEDGER_JSON_END -->");
lines.push("");
const output = `${lines.join("\n").trimEnd()}\n`;

if (CHECK) {
  const existing = existsSync(OUTPUT) ? readFileSync(OUTPUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (existing !== output) {
    console.error("docs/ART_PROGRESS.md is stale. Run npm run art:ledger and commit the result.");
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ ok: true, output: "docs/ART_PROGRESS.md", summaries }, null, 2));
  }
} else {
  writeFileSync(OUTPUT, output, "utf8");
  console.log(JSON.stringify({ ok: true, output: "docs/ART_PROGRESS.md", summaries }, null, 2));
}
