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
  const relativeOutput = `apps/client-godot/assets/objects/generated/${assetId}.png`;
  const generated = existsSync(resolve(ROOT, relativeOutput));
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
    output: relativeOutput,
    status: generated ? "generated" : "missing",
    promptBrief: `Direct-overhead isolated top-down game sprite of ${item.name}, a ${item.style} ${item.category.toLowerCase()} object for an adult restaurant management sim; readable materials and operational details; ${item.width}x${item.height} footprint; no people, text, labels, floor, room, border, cast-off canvas elements, or perspective; complete centered silhouette on flat chroma green for transparent-background extraction.`,
  };
});

const roleEquipment = read("core/role-equipment.json");
const roleItems = roleEquipment.items.map((item, sequence) => {
  const fileName = String(item.iconId).replaceAll(".", "-").replaceAll("/", "-");
  const relativeOutput = `apps/client-godot/assets/items/${fileName}.png`;
  const generated = existsSync(resolve(ROOT, relativeOutput));
  return {
    sequence: sequence + 1,
    id: item.id,
    name: item.name,
    iconId: item.iconId,
    kind: item.kind,
    qualityTier: item.qualityTier,
    allowedRoleIds: item.allowedRoleIds,
    output: relativeOutput,
    status: generated ? "generated" : "procedural-fallback",
    promptBrief: `Single isolated inventory icon of ${item.name} for a polished restaurant role-equipment UI; clear silhouette at 64px, tactile professional materials, no text, letters, hands, people, border, room, or unrelated props; centered on flat chroma green for transparent-background extraction.`,
  };
});

const furnitureGenerated = furniture.filter((item) => item.status === "generated").length;
const roleItemsGenerated = roleItems.filter((item) => item.status === "generated").length;
const result = {
  schemaVersion: 1,
  generatorRevision: 1,
  product: "Rush & Revenue Online",
  artDirection: {
    mode: "built-in image generation with flat chroma-key removal",
    view: "direct overhead / orthographic top-down",
    format: "transparent PNG, trimmed with a clear margin, maximum 768x768",
    reviewCriteria: [
      "one stable content ID maps to one output file",
      "complete silhouette with no clipped edges",
      "no perspective, people, text, watermark, or baked room/background",
      "materials and operational details distinguish the item at gameplay scale",
      "sprite rotation remains aligned with the authoritative grid footprint",
    ],
  },
  counts: {
    furniture: { total: furniture.length, generated: furnitureGenerated, remaining: furniture.length - furnitureGenerated },
    coreFurniture: { total: furniture.filter((item) => item.sourcePack === "core-hospitality" && !item.assetId.startsWith("furniture-")).length, generated: furniture.filter((item) => item.sourcePack === "core-hospitality" && !item.assetId.startsWith("furniture-") && item.status === "generated").length },
    roleItems: { total: roleItems.length, generated: roleItemsGenerated, remaining: roleItems.length - roleItemsGenerated },
  },
  furniture,
  roleItems,
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ok: true, output: "planning/art-production.json", counts: result.counts }, null, 2));
