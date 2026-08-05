import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { FURNITURE_WALL_EDGE_BY_ROTATION, loadContent, normalizeFurniturePlacement } from "../dist/server/content.js";

const root = new URL("../", import.meta.url);
const readJson = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const rawFurniture = [
  ...readJson("packages/game-data/core/furniture.json"),
  ...readJson("packages/game-data/core/furniture-production.json"),
  ...readJson("packages/game-data/seasonal/summer-street-fair/furniture.json"),
];
const runtimeContract = readJson("apps/client-godot/furniture-art-runtime.json");

test("every source-accepted furniture identity has one explicit reviewed placement contract", () => {
  const acceptedAssetIds = new Set(runtimeContract.acceptedDirectionalAssetIds);
  const acceptedDefinitions = rawFurniture.filter((item) => acceptedAssetIds.has(item.assetId ?? item.id));
  const explicitDefinitions = rawFurniture.filter((item) => item.placement !== undefined);

  assert.equal(acceptedDefinitions.length, 25);
  assert.deepEqual(
    explicitDefinitions.map((item) => item.id).sort(),
    acceptedDefinitions.map((item) => item.id).sort(),
    "placement declarations must neither omit accepted art nor pre-accept an unreviewed identity",
  );
  assert.deepEqual(
    explicitDefinitions.filter((item) => item.placement.mount === "wall").map((item) => item.id).sort(),
    ["local-art", "plants"],
  );
  assert.deepEqual(
    explicitDefinitions.filter((item) => item.placement.mount === "ceiling").map((item) => item.id),
    ["pendants"],
  );
  assert.equal(explicitDefinitions.filter((item) => item.placement.mount === "floor").length, 22);
  const expectedFloorPlacement = { mount: "floor", occupancy: "blocking", serviceAccess: "adjacent" };
  for (const id of ["banquette-section", "commercial-chair", "premium-chair", "host-stand-pro", "server-station-pro", "pos-terminal"]) {
    assert.deepEqual(rawFurniture.find((item) => item.id === id)?.placement, expectedFloorPlacement, `${id} explicit placement`);
  }
  assert.ok(explicitDefinitions.filter((item) => item.placement.mount !== "floor").every((item) => item.placement.occupancy === "nonblocking"));
  assert.ok(explicitDefinitions.filter((item) => item.placement.mount !== "floor").every((item) => item.placement.serviceAccess === "none"));
});

test("undeclared catalog furniture receives a backward-compatible authoritative default", () => {
  const registry = loadContent();
  const expected = { mount: "floor", occupancy: "blocking", serviceAccess: "adjacent" };
  assert.deepEqual(registry.furnitureById.get("floor-drain")?.placement, expected, "floor-drain remains intentionally unclassified in this accepted-art slice");
  assert.deepEqual(normalizeFurniturePlacement({ id: "legacy-fixture", height: 3 }), expected);
});

test("explicit wall placement defines rotation-as-edge support without permitting invalid contracts", () => {
  assert.deepEqual(FURNITURE_WALL_EDGE_BY_ROTATION, { 0: "north", 90: "east", 180: "south", 270: "west" });
  const validWall = {
    mount: "wall",
    occupancy: "nonblocking",
    serviceAccess: "adjacent",
    allowedWallOpenings: ["solid", "window"],
  };
  assert.deepEqual(normalizeFurniturePlacement({ id: "valid-wall", height: 1, placement: validWall }), validWall);

  const validFloor = { mount: "floor", occupancy: "blocking", serviceAccess: "adjacent" };
  const validCeiling = { mount: "ceiling", occupancy: "nonblocking", serviceAccess: "none" };
  assert.deepEqual(normalizeFurniturePlacement({ id: "valid-floor", height: 2, placement: validFloor }), validFloor);
  assert.deepEqual(normalizeFurniturePlacement({ id: "valid-ceiling", height: 2, placement: validCeiling }), validCeiling);

  const invalid = [
    [null, /placement must be an object/],
    [{ mount: "counter", occupancy: "blocking", serviceAccess: "adjacent" }, /invalid mount/],
    [{ mount: "floor", occupancy: "ghost", serviceAccess: "adjacent" }, /invalid occupancy/],
    [{ mount: "floor", occupancy: "blocking", serviceAccess: "remote" }, /invalid serviceAccess/],
    [{ mount: "floor", occupancy: "blocking", serviceAccess: "adjacent", typo: true }, /unknown field typo/],
    [{ mount: "floor", occupancy: "blocking", serviceAccess: "adjacent", allowedWallOpenings: ["solid"] }, /only valid for wall/],
    [{ mount: "ceiling", occupancy: "blocking", serviceAccess: "none" }, /ceiling placement must be nonblocking/],
    [{ mount: "wall", occupancy: "blocking", serviceAccess: "none", allowedWallOpenings: ["solid"] }, /wall placement must be nonblocking/],
    [{ mount: "wall", occupancy: "nonblocking", serviceAccess: "none" }, /requires at least one allowedWallOpening/],
    [{ mount: "wall", occupancy: "nonblocking", serviceAccess: "none", allowedWallOpenings: ["door"] }, /invalid opening door/],
    [{ mount: "wall", occupancy: "nonblocking", serviceAccess: "none", allowedWallOpenings: ["solid", "solid"] }, /duplicate allowedWallOpenings/],
  ];
  for (const [placement, pattern] of invalid) {
    assert.throws(() => normalizeFurniturePlacement({ id: "invalid-fixture", height: 1, placement }), pattern);
  }
  assert.throws(
    () => normalizeFurniturePlacement({ id: "tall-wall", height: 2, placement: validWall }),
    /wall placement must have height 1/,
  );
});
