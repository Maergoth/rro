import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(import.meta.dirname, "..");
const readBytes = (path) => readFileSync(resolve(ROOT, path));
const readJson = (path) => JSON.parse(readBytes(path).toString("utf8"));
const sorted = (values) => [...values].sort();
const unique = (values, label) => {
  assert.equal(new Set(values).size, values.length, `${label} must not contain duplicates`);
  return values;
};

const matrix = readJson("planning/character-launch-applicability-v1.json");
const character = readJson("planning/character-art-catalog.json");
const activities = readJson("packages/game-data/core/activities.json").activities;
const roleEquipment = readJson("packages/game-data/core/role-equipment.json").items;
const appearance = readJson("packages/game-data/core/appearance.json");
const roles = readJson("packages/game-data/core/roles.json");
const artPass = readJson("planning/art-pass-v2.json");

const bodyCount = character.bodyPresentations.length;
const directionCount = character.directions.length;
const finalFrames = character.animations.reduce((sum, animation) => sum + animation.frames, 0);
const sourcePoseFrames = character.animations.reduce((sum, animation) => sum + animation.sourcePoseFrames, 0);
const bodyFinalPoseCells = bodyCount * directionCount * finalFrames;
const bodySourcePoseCells = bodyCount * directionCount * sourcePoseFrames;

function lockFor(path) {
  return matrix.catalogLocks.find((entry) => entry.path === path);
}

function sourceChoices(source) {
  if (source.startsWith("slotCatalogs.")) return character.slotCatalogs[source.slice("slotCatalogs.".length)];
  return character[source];
}

function nonApplicable(id) {
  const entry = matrix.nonApplicableCombinations.find((candidate) => candidate.id === id);
  assert.ok(entry, `missing non-applicable classification ${id}`);
  return entry;
}

test("character launch matrix is locked to the exact authoritative catalogs", () => {
  assert.equal(matrix.schemaVersion, 1);
  assert.equal(matrix.id, "character-launch-applicability-v1");
  assert.equal(matrix.status, "binding-launch-denominator");

  const expectedLocks = [
    "planning/character-art-catalog.json",
    "packages/game-data/core/activities.json",
    "packages/game-data/core/role-equipment.json",
    "packages/game-data/core/appearance.json",
    "packages/game-data/core/roles.json",
  ];
  assert.deepEqual(sorted(matrix.catalogLocks.map(({ path }) => path)), sorted(expectedLocks));
  for (const path of expectedLocks) {
    const lock = lockFor(path);
    assert.ok(lock, `missing catalog lock for ${path}`);
    const actual = createHash("sha256").update(readBytes(path)).digest("hex");
    assert.equal(lock.sha256, actual, `${path} changed; regenerate and review the applicability matrix`);
  }

  assert.deepEqual(matrix.axes.bodyPresentations, character.bodyPresentations);
  assert.deepEqual(matrix.axes.directions, character.directions);
  assert.deepEqual(matrix.axes.animations, character.animations);
  assert.deepEqual(character.roleLayers, roles.map(({ id }) => id));
  unique(matrix.axes.bodyPresentations, "body presentations");
  unique(matrix.axes.directions, "directions");
  unique(matrix.axes.animations.map(({ id }) => id), "animations");
  unique(matrix.axes.anchorNames, "anchor names");

  assert.equal(matrix.totals.bodyPresentationCount, bodyCount);
  assert.equal(matrix.totals.directionCount, directionCount);
  assert.equal(matrix.totals.animationClipCount, character.animations.length);
  assert.equal(matrix.totals.animationSetDesignUnits, bodyCount * character.animations.length);
  assert.equal(matrix.totals.finalFramesPerBodyDirection, finalFrames);
  assert.equal(matrix.totals.sourcePoseFramesPerBodyDirection, sourcePoseFrames);
  assert.equal(matrix.totals.baseBodySourcePoseCells, bodySourcePoseCells);
  assert.equal(matrix.totals.baseBodyFinalPoseCells, bodyFinalPoseCells);
  assert.equal(
    matrix.totals.baseBodyRuntimeRasterCells,
    bodyFinalPoseCells * matrix.axes.bodyRuntimeChannels.length,
  );
  assert.equal(matrix.totals.anchorNamesPerBodyPoseCell, matrix.axes.anchorNames.length);
  assert.equal(matrix.totals.requiredAnchorRecords, bodyFinalPoseCells * matrix.axes.anchorNames.length);
});

test("visible modular choices partition catalog choices and derive exact fit and raster totals", () => {
  const expectedSources = [
    ...Object.keys(character.slotCatalogs).map((id) => `slotCatalogs.${id}`),
    "roleLayers",
    "hairStyles",
    "facialHair",
  ];
  assert.deepEqual(sorted(matrix.modularVisibleLayers.map(({ source }) => source)), sorted(expectedSources));
  unique(matrix.modularVisibleLayers.map(({ id }) => id), "modular layer ids");

  let visibleChoices = 0;
  let emptyChoices = 0;
  let bodyFitUnits = 0;
  let sourcePoseCells = 0;
  let finalPoseCells = 0;
  let runtimeRasterCells = 0;

  for (const layer of matrix.modularVisibleLayers) {
    unique(layer.choices, `${layer.id} visible choices`);
    unique(layer.noRasterChoices, `${layer.id} empty choices`);
    assert.deepEqual(
      sorted([...layer.choices, ...layer.noRasterChoices]),
      sorted(sourceChoices(layer.source)),
      `${layer.id} must exactly partition its source catalog`,
    );
    assert.equal(
      layer.choices.some((choice) => layer.noRasterChoices.includes(choice)),
      false,
      `${layer.id} choices and no-raster choices must not overlap`,
    );
    assert.equal(layer.requiresEveryAnimationFrame, true, `${layer.id} must cover every frame`);
    assert.equal(layer.requiresEveryDirection, true, `${layer.id} must cover every direction`);
    assert.ok(layer.runtimeChannels.includes("diffuse"), `${layer.id} needs a diffuse channel`);
    unique(layer.runtimeChannels, `${layer.id} runtime channels`);

    const expectedFits = layer.choices.length * bodyCount;
    const expectedSourceCells = expectedFits * directionCount * sourcePoseFrames;
    const expectedFinalCells = expectedFits * directionCount * finalFrames;
    const expectedRuntimeCells = expectedFinalCells * layer.runtimeChannels.length;
    assert.equal(layer.bodyFitUnits, expectedFits, `${layer.id} body-fit units`);
    assert.equal(layer.finalPoseCells, expectedFinalCells, `${layer.id} final pose cells`);
    assert.equal(layer.runtimeRasterCells, expectedRuntimeCells, `${layer.id} runtime raster cells`);

    visibleChoices += layer.choices.length;
    emptyChoices += layer.noRasterChoices.length;
    bodyFitUnits += expectedFits;
    sourcePoseCells += expectedSourceCells;
    finalPoseCells += expectedFinalCells;
    runtimeRasterCells += expectedRuntimeCells;
  }

  assert.equal(matrix.totals.visibleModularChoiceCount, visibleChoices);
  assert.equal(matrix.totals.intentionalEmptyModularChoiceCount, emptyChoices);
  assert.equal(matrix.totals.modularBodyFitDesignUnits, bodyFitUnits);
  assert.equal(matrix.totals.modularSourcePoseCells, sourcePoseCells);
  assert.equal(matrix.totals.modularFinalPoseCells, finalPoseCells);
  assert.equal(matrix.totals.modularRuntimeRasterCells, runtimeRasterCells);

  const absence = nonApplicable("absence-layer-cells");
  const expectedAbsenceChoices = matrix.modularVisibleLayers.flatMap((layer) =>
    layer.noRasterChoices.map((choice) => `${layer.id}:${choice}`),
  );
  assert.deepEqual(sorted(absence.choices), sorted(expectedAbsenceChoices));
  assert.equal(absence.excludedPoseCells, emptyChoices * bodyFinalPoseCells);
});

test("equipment groups exactly partition equipment and distinguish fit, frame, rigid, and alias units", () => {
  const equippableIds = roleEquipment.filter(({ kind }) => kind === "equipment").map(({ id }) => id);
  const consumableIds = roleEquipment.filter(({ kind }) => kind === "consumable").map(({ id }) => id);
  const groups = matrix.equipmentAttachments.groups;
  const groupedIds = groups.flatMap(({ itemIds }) => itemIds);
  unique(groupedIds, "equipment attachment items");
  assert.deepEqual(sorted(groupedIds), sorted(equippableIds));
  assert.deepEqual(sorted(matrix.equipmentAttachments.nonPersistentCatalogItemIds), sorted(consumableIds));

  let aliasItems = 0;
  let deformingItems = 0;
  let rigidItems = 0;
  let deformingSourceRasterCells = 0;
  let deformingFinalRasterCells = 0;
  let rigidRuntimeRasterCells = 0;
  const shoeChoices = new Set(character.slotCatalogs.shoes);

  for (const group of groups) {
    unique(group.itemIds, `${group.id} item ids`);
    unique(group.anchors, `${group.id} anchors`);
    for (const anchor of group.anchors) assert.ok(matrix.axes.anchorNames.includes(anchor), `${group.id}: unknown anchor ${anchor}`);

    if (group.rasterRule === "alias-existing-layer") {
      aliasItems += group.itemIds.length;
      assert.deepEqual(sorted(Object.keys(group.aliases)), sorted(group.itemIds));
      for (const target of Object.values(group.aliases)) assert.ok(shoeChoices.has(target), `${group.id}: unknown shoe alias ${target}`);
      assert.deepEqual(group.runtimeChannels, []);
    } else if (group.rasterRule === "full-frame-deforming") {
      deformingItems += group.itemIds.length;
      assert.ok(group.runtimeChannels.length > 0);
      deformingSourceRasterCells += group.itemIds.length * bodySourcePoseCells * group.runtimeChannels.length;
      deformingFinalRasterCells += group.itemIds.length * bodyFinalPoseCells * group.runtimeChannels.length;
    } else if (group.rasterRule === "directional-rigid-anchor-reuse") {
      rigidItems += group.itemIds.length;
      assert.ok(group.runtimeChannels.length > 0);
      rigidRuntimeRasterCells += group.itemIds.length * bodyCount * directionCount * group.runtimeChannels.length;
    } else {
      assert.fail(`${group.id}: unsupported raster rule ${group.rasterRule}`);
    }
  }

  assert.equal(matrix.totals.equippableItemCount, equippableIds.length);
  assert.equal(matrix.totals.consumableNoPersistentAttachmentCount, consumableIds.length);
  assert.equal(matrix.totals.equipmentAttachmentBodyFitUnits, equippableIds.length * bodyCount);
  assert.equal(matrix.totals.equipmentFrameBindingCombinations, equippableIds.length * bodyFinalPoseCells);
  assert.equal(matrix.totals.equipmentAliasItemCount, aliasItems);
  assert.equal(matrix.totals.equipmentDeformingItemCount, deformingItems);
  assert.equal(matrix.totals.equipmentRigidItemCount, rigidItems);
  assert.equal(matrix.totals.equipmentDeformingRuntimeRasterCells, deformingFinalRasterCells);
  assert.equal(matrix.totals.equipmentRigidRuntimeRasterCells, rigidRuntimeRasterCells);
  assert.equal(matrix.totals.equipmentRuntimeRasterCells, deformingFinalRasterCells + rigidRuntimeRasterCells);

  const consumables = nonApplicable("consumable-persistent-attachments");
  assert.equal(consumables.choiceCount, consumableIds.length);
  assert.equal(consumables.excludedBodyFitUnits, consumableIds.length * bodyCount);
  const aliases = nonApplicable("footwear-equipment-duplicate-raster");
  assert.equal(aliases.choiceCount, aliasItems);
  assert.equal(aliases.excludedDirectionalRasterCells, aliasItems * bodyCount * directionCount);
  const rigid = nonApplicable("rigid-equipment-frame-raster-duplicates");
  assert.equal(rigid.choiceCount, rigidItems);
  assert.equal(
    rigid.excludedPerFrameRasterCells,
    rigidItems * bodyFinalPoseCells,
    "rigid equipment frame combinations must be explicitly excluded from raster production",
  );

  const expectedSourceRuntimeRasterCells = matrix.totals.baseBodySourcePoseCells * matrix.axes.bodyRuntimeChannels.length
    + matrix.modularVisibleLayers.reduce(
      (sum, layer) => sum + layer.choices.length * bodyCount * directionCount * sourcePoseFrames * layer.runtimeChannels.length,
      0,
    )
    + deformingSourceRasterCells
    + rigidRuntimeRasterCells;
  const expectedFinalRuntimeRasterCells = matrix.totals.baseBodyRuntimeRasterCells
    + matrix.totals.modularRuntimeRasterCells
    + matrix.totals.equipmentRuntimeRasterCells;
  assert.equal(matrix.totals.totalSourceRuntimeRasterCells, expectedSourceRuntimeRasterCells);
  assert.equal(matrix.totals.totalFinalRuntimeRasterCells, expectedFinalRuntimeRasterCells);
});

test("every launch activity has one valid primary clip and every task clip is reachable", () => {
  const activityIds = activities.map(({ id }) => id);
  const animationIds = character.animations.map(({ id }) => id);
  unique(activityIds, "activity ids");
  assert.deepEqual(sorted(Object.keys(matrix.activityPrimaryClips)), sorted(activityIds));
  for (const [activityId, clip] of Object.entries(matrix.activityPrimaryClips)) {
    assert.ok(animationIds.includes(clip), `${activityId}: unknown primary clip ${clip}`);
  }

  assert.equal(matrix.totals.activityCount, activities.length);
  assert.equal(matrix.totals.activityPrimaryBindingCount, Object.keys(matrix.activityPrimaryClips).length);
  assert.equal(matrix.globalStateBindings.stationary, "idle");
  assert.equal(matrix.globalStateBindings.navigation, "walk");
  assert.ok(animationIds.includes(matrix.globalStateBindings.stationary));
  assert.ok(animationIds.includes(matrix.globalStateBindings.navigation));

  const boundTaskClips = new Set(Object.values(matrix.activityPrimaryClips));
  for (const clip of animationIds.filter((id) => id !== "idle")) {
    assert.ok(boundTaskClips.has(clip), `animation clip ${clip} has no launch activity or global task binding`);
  }
});

test("shader, recipe, consumable, alias, role, and effect exclusions remain explicit", () => {
  const skin = nonApplicable("skin-tone-raster-duplicates");
  assert.equal(skin.choiceCount, character.skinTones.length);
  assert.equal(skin.excludedDuplicatePoseCells, character.skinTones.length * bodyFinalPoseCells);

  const palettes = nonApplicable("appearance-palette-raster-duplicates");
  assert.equal(palettes.choiceCount, appearance.palettes.length);
  assert.deepEqual(
    sorted(nonApplicable("prototype-outfit-composite-duplicates").choices),
    sorted(character.prototypeOutfitFamilies),
  );
  assert.deepEqual(
    sorted(nonApplicable("appearance-outfit-silhouette-duplicates").choices),
    sorted(appearance.outfitSilhouettes),
  );
  assert.deepEqual(
    sorted(nonApplicable("generic-effects-body-frame-duplicates").choices),
    sorted(artPass.launchScope.environment),
  );
  assert.ok(nonApplicable("role-specific-body-or-layer-raster-duplicates"));
});
