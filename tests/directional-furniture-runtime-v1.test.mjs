import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const contract = JSON.parse(read("apps/client-godot/furniture-art-runtime.json"));
const runtime = read("apps/client-godot/scripts/restaurant_floor.gd");
const binding = read("apps/client-godot/scripts/furniture_art_binding.gd");
const validator = read("tools/validate-art-pass-v2.mjs");
const exportPreset = read("apps/client-godot/export_presets.cfg");
const artPass = JSON.parse(read("planning/art-pass-v2.json"));
const furnitureBatch002Qa = JSON.parse(read("planning/art-qa/furniture-core-directional-002/qa.json"));
const furnitureBatch003Qa = JSON.parse(read("planning/art-qa/furniture-core-directional-003/qa.json"));
const furnitureBatch004Qa = JSON.parse(read("planning/art-qa/furniture-core-directional-004/qa.json"));
const furnitureBatch005Qa = JSON.parse(read("planning/art-qa/furniture-core-directional-005/qa.json"));
const furnitureBatch006Qa = JSON.parse(read("planning/art-qa/furniture-core-directional-006/qa.json"));
const furnitureBatch007Qa = JSON.parse(read("planning/art-qa/furniture-core-directional-007/qa.json"));
const furnitureBatch008Qa = JSON.parse(read("planning/art-qa/furniture-core-directional-008/qa.json"));
const furnitureBatch009Qa = JSON.parse(read("planning/art-qa/furniture-core-directional-009/qa.json"));

const canonicalRotation = (rotation) => ((rotation % 360) + 360) % 360;
const directionForRotation = (rotation) => contract.directionsByRotation[String(canonicalRotation(rotation))] ?? "";
const directionalPath = (assetId, rotation) => {
  if (!contract.acceptedDirectionalAssetIds.includes(assetId)) return "";
  const direction = directionForRotation(rotation);
  return direction ? `${contract.directionalRoot}/${assetId}/${direction}.png` : "";
};

test("accepted furniture resolves exact directional paths for canonical rotations", () => {
  assert.equal(contract.schemaVersion, 1);
  assert.deepEqual(contract.directionsByRotation, { "0": "north", "90": "east", "180": "south", "270": "west" });
  assert.deepEqual(contract.acceptedDirectionalAssetIds, ["banquette", "booth", "dish-machine", "espresso", "furniture-banquette-section", "furniture-commercial-chair", "furniture-convection-oven", "furniture-expo-pass-heated", "furniture-host-stand-pro", "furniture-oak-two-top", "furniture-plancha-commercial", "furniture-pos-terminal", "furniture-premium-chair", "furniture-server-station-pro", "furniture-six-burner-range", "furniture-walnut-four-top", "host-stand", "local-art", "mop-sink", "pass", "pendants", "plants", "prep", "range", "recycling", "service-station", "table-four", "table-two"]);

  const expectedDirections = [[0, "north"], [90, "east"], [180, "south"], [270, "west"]];
  for (const assetId of contract.acceptedDirectionalAssetIds) {
    for (const [rotation, direction] of expectedDirections) {
      const resourcePath = `res://assets/objects/directional/${assetId}/${direction}.png`;
      assert.equal(directionalPath(assetId, rotation), resourcePath);
      const repositoryPath = resourcePath.replace("res://", "apps/client-godot/");
      assert.ok(existsSync(new URL(repositoryPath, root)), `${repositoryPath} is missing`);
      const png = readFileSync(new URL(repositoryPath, root));
      assert.equal(png.readUInt32BE(16), 627, `${repositoryPath} width`);
      assert.equal(png.readUInt32BE(20), 627, `${repositoryPath} height`);
    }
  }

  assert.equal(directionForRotation(-90), "west");
  assert.equal(directionForRotation(450), "east");
  assert.equal(directionForRotation(45), "");
  assert.equal(directionalPath("unsupported-furniture", 0), "");
  assert.match(binding, /const CONTRACT_PATH := "res:\/\/furniture-art-runtime\.json"/);
  assert.match(binding, /directions\.get\(str\(canonical_rotation\(rotation_degrees\)\), ""\)/);
  assert.match(binding, /not accepted_assets\.has\(asset_id\)/);
  assert.match(binding, /return "%s\/%s\/%s\.png" % \[str\(contract\(\)\.get\("directionalRoot", ""\)\), asset_id, direction\]/);
  assert.match(exportPreset, /include_filter="furniture-art-runtime\.json"/, "the runtime contract must be included in packaged clients");
});

test("the runtime contract covers every source-accepted directional set without inflating production completion", () => {
  const accepted = new Set();
  const sourceAcceptedBatches = [...artPass.batches, ...(artPass.pendingBatches ?? [])];
  for (const qa of [furnitureBatch002Qa, furnitureBatch003Qa, furnitureBatch004Qa, furnitureBatch005Qa, furnitureBatch006Qa, furnitureBatch007Qa, furnitureBatch008Qa, furnitureBatch009Qa]) {
    if (sourceAcceptedBatches.some((batch) => batch.id === qa.batchId)) continue;
    sourceAcceptedBatches.push({
      id: qa.batchId,
      assets: qa.assets,
      qa: qa.artReviewStatus,
    });
  }
  for (const batch of sourceAcceptedBatches) {
    for (const assetId of batch.assets ?? []) {
      const review = batch.assetReviews?.[assetId] ?? batch.qa;
      if (review !== "passed" && !String(review).startsWith("accepted")) continue;
      const completeSet = Object.values(contract.directionsByRotation).every((direction) =>
        existsSync(new URL(`apps/client-godot/assets/objects/directional/${assetId}/${direction}.png`, root)));
      if (completeSet) accepted.add(assetId);
    }
  }
  assert.deepEqual([...contract.acceptedDirectionalAssetIds].sort(), [...accepted].sort());
  assert.equal(contract.capability.directionalTextureSelection, true);
  assert.equal(contract.capability.runtimeProjection, "elevated-orthographic-isometric-grid");
  assert.equal(contract.capability.projectionIntegrated, true);
  assert.equal(contract.capability.projectionAligned, true);
  assert.equal(contract.capability.runtimeCompositeAccepted, true);
  assert.equal(contract.capability.productionComplete, false);
  assert.deepEqual(contract.runtimeCompositeAcceptedAssetIds, contract.acceptedDirectionalAssetIds);
  assert.deepEqual(contract.runtimeCompositeBlockedAssetIds, []);
  assert.deepEqual(contract.runtimeCompositePendingAssetIds, []);
  assert.deepEqual(
    [...contract.runtimeCompositeAcceptedAssetIds, ...contract.runtimeCompositeBlockedAssetIds, ...contract.runtimeCompositePendingAssetIds].sort(),
    [...contract.acceptedDirectionalAssetIds].sort(),
  );
  assert.equal(new Set([
    ...contract.runtimeCompositeAcceptedAssetIds,
    ...contract.runtimeCompositeBlockedAssetIds,
    ...contract.runtimeCompositePendingAssetIds,
  ]).size, contract.acceptedDirectionalAssetIds.length, "runtime states must be pairwise disjoint");
  assert.match(contract.capability.remainingVisualGate, /no runtime visual blocker.*twenty-eight present source-accepted.*other 201 catalog identities/i);
  assert.match(validator, /runtimeCompositeAccepted must be true iff runtime acceptance exactly covers every source-accepted directional set with no blocked or pending identities/);
});

test("common floor-contact anchoring uses uniform scale and never stretches directional textures", () => {
  const { width, height, floorContactPivot } = contract.sourceCanvas;
  assert.deepEqual({ width, height, floorContactPivot }, { width: 627, height: 627, floorContactPivot: { x: 313.5, y: 590 } });

  for (const footprint of [{ x: 100, y: 80, width: 64, height: 32 }, { x: 12, y: 20, width: 96, height: 64 }]) {
    const scale = Math.max(footprint.width, footprint.height) / Math.max(width, height);
    const targetPivot = { x: footprint.x + footprint.width / 2, y: footprint.y + footprint.height };
    const drawRect = {
      x: targetPivot.x - floorContactPivot.x * scale,
      y: targetPivot.y - floorContactPivot.y * scale,
      width: width * scale,
      height: height * scale,
    };
    assert.equal(drawRect.width / width, drawRect.height / height, "x/y scales must be identical");
    assert.ok(Math.abs(drawRect.x + floorContactPivot.x * scale - targetPivot.x) < 1e-9);
    assert.ok(Math.abs(drawRect.y + floorContactPivot.y * scale - targetPivot.y) < 1e-9);
  }

  assert.match(binding, /footprint_rect\.get_center\(\)\.x, footprint_rect\.end\.y/);
  assert.match(binding, /draw_rect_for_floor_contact_target\(texture_size, Vector2\(footprint_rect\.get_center\(\)\.x, footprint_rect\.end\.y\), footprint_rect\.size\)/);
  assert.match(binding, /draw_rect_for_mount_anchor\(texture_size: Vector2, mount_anchor: Vector2, visual_extent: Vector2\)/);
  assert.match(binding, /screen_anchor - source_pivot \* uniform_scale/);
  assert.match(binding, /texture_size \* uniform_scale/);
  assert.doesNotMatch(binding, /Vector2\([^\n]*\/ canvas_width[^\n]*\/ canvas_height/);
});

test("directional textures are not rotated and legacy generated/SVG fallback remains intact", () => {
  const directionalBranch = runtime.match(/if bool\(texture_binding\.get\("directional", false\)\):([\s\S]+?)\n\t\telse:([\s\S]+?)\n\tvar symbol/);
  assert.ok(directionalBranch, "directional and legacy draw branches are missing");
  assert.doesNotMatch(directionalBranch[1], /draw_set_transform|deg_to_rad/, "directional texture must not be rotated again");
  assert.match(directionalBranch[1], /FurnitureArtBinding\.draw_rect_for_floor_contact_target/);
  assert.match(directionalBranch[1], /FurnitureArtBinding\.draw_rect_for_mount_anchor/);
  assert.match(directionalBranch[1], /IsometricGridProjection\.floor_contact_target/);
  assert.match(directionalBranch[2], /draw_set_transform\(bounds\.get_center\(\), deg_to_rad\(float\(item_rotation\)\)/);
  assert.match(runtime, /res:\/\/assets\/objects\/generated\/%s\.png/);
  assert.match(runtime, /res:\/\/assets\/objects\/%s\.svg/);
  assert.match(runtime, /return \{"texture": texture_for\(definition\), "directional": false/);
  assert.ok(runtime.indexOf("directional_texture_path(definition, item_rotation)") < runtime.indexOf("return {\"texture\": texture_for(definition)"));
});

test("walls, furniture, incidents, parties, and avatars share deterministic isometric depth ordering", () => {
  assert.match(runtime, /world_items\.sort_custom\(world_item_draws_before\)/);
  assert.match(runtime, /IsometricGridProjection\.depth_key\(/);
  assert.match(runtime, /IsometricGridProjection\.depth_key_draws_before\(/);
  for (const kind of ["wall", "object", "object-preview", "incident", "party", "avatar"]) {
    assert.match(runtime, new RegExp(`"${kind}"`));
  }
});
