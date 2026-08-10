import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const DATA = resolve(ROOT, "packages/game-data");
const CLIENT = resolve(ROOT, "apps/client-godot");
const OUTPUT = resolve(ROOT, "planning/art-production.json");
const read = (path) => JSON.parse(readFileSync(resolve(DATA, path), "utf8"));

const manifest = read("manifest.json");
const furnitureById = new Map();
for (const pack of manifest.packs.filter((entry) => entry.enabled)) {
  for (const fileName of ["furniture.json", "furniture-production.json"]) {
    const relativePath = `${pack.directory}/${fileName}`;
    const path = resolve(DATA, relativePath);
    if (!existsSync(path)) continue;
    for (const item of read(relativePath)) furnitureById.set(item.id, { ...item, sourcePack: pack.id });
  }
}

const furniture = [...furnitureById.values()].map((item, sequence) => {
  const assetId = item.assetId ?? item.id;
  const legacyReferencePath = `apps/client-godot/assets/objects/generated/${assetId}.png`;
  const legacyReferencePresent = existsSync(resolve(ROOT, legacyReferencePath));
  return {
    sequence: sequence + 1,
    id: item.id,
    name: item.name,
    assetId,
    sourcePack: item.sourcePack,
    category: item.category,
    style: item.style,
    tier: item.tier ?? "core",
    footprint: { width: item.width, height: item.height },
    stats: item.stats,
    legacyReference: {
      path: legacyReferencePath,
      status: legacyReferencePresent ? "legacy-reference-only" : "not-preserved",
      excludedFromProductionCompletion: true,
    },
  };
});

const roleEquipment = read("core/role-equipment.json");
const roleItems = roleEquipment.items.map((item, sequence) => {
  const fileName = String(item.iconId).replaceAll(".", "-").replaceAll("/", "-");
  const relativeOutput = `apps/client-godot/assets/items/${fileName}.png`;
  return {
    sequence: sequence + 1,
    id: item.id,
    name: item.name,
    iconId: item.iconId,
    kind: item.kind,
    qualityTier: item.qualityTier,
    allowedRoleIds: item.allowedRoleIds,
    output: relativeOutput,
  };
});

const result = {
  schemaVersion: 2,
  generatorRevision: 2,
  product: "Rush & Revenue Online",
  purpose: "catalog-and-legacy-reference-index",
  authoritativeProgress: {
    document: "docs/ART_PROGRESS.md",
    rule: "This file contains no live art-completion counters. Production status comes only from the generated authoritative art ledger.",
  },
  productionContract: {
    furnitureCamera: "elevated orthographic-isometric",
    furnitureDirections: ["north", "east", "south", "west"],
    characterDirections: ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"],
    runtimeRule: "Furniture must use true independently authored quarter-turn views aligned to the elevated orthographic-isometric restaurant floor. Direct-overhead files are identity/material references only.",
    completionRule: "Files count only through docs/ART_PROGRESS.md after visual QA at gameplay scale, runtime binding, remote preservation, and green CI.",
  },
  standingAuthorization: {
    productionArtGeneration: true,
    publicRepositoryPublication: true,
    repository: "Maergoth/rro",
    branch: "agent/complete-production-art",
    pullRequest: "https://github.com/Maergoth/rro/pull/2",
    workflow: "Generate, review, and publish small reversible production-art checkpoints without requesting repeated permission.",
  },
  legacyReferencePolicy: {
    root: "apps/client-godot/assets/objects/generated",
    view: "legacy direct-overhead",
    status: "reference-only",
    allowedUses: ["identity reference", "material reference"],
    forbiddenUses: ["runtime production art", "production-completion evidence", "directional-set substitution"],
  },
  furniture,
  roleItems,
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ok: true, output: "planning/art-production.json", purpose: result.purpose }, null, 2));
