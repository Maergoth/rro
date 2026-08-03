import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const read = (path) => JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
const contract = read("planning/character-art-catalog.json");
const production = read("planning/art-production.json");
const pass = read("planning/art-pass-v2.json");
const missing = [];
const invalid = [];
const hashes = new Map();

function png(path, label, expected = [384, 512]) {
  const absolute = resolve(ROOT, path);
  if (!existsSync(absolute)) { missing.push(path); return; }
  const data = readFileSync(absolute);
  if (data.length < 32 || data.toString("ascii", 1, 4) !== "PNG") invalid.push(`${path}: not a PNG`);
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width !== expected[0] || height !== expected[1]) invalid.push(`${path}: expected ${expected[0]}x${expected[1]}, got ${width}x${height}`);
  const hash = createHash("sha256").update(data).digest("hex");
  const prior = hashes.get(hash);
  if (prior && prior !== label) invalid.push(`${path}: duplicates ${prior}`);
  else hashes.set(hash, label);
}

for (const body of contract.bodyPresentations) {
  for (const direction of contract.directions) png(`apps/client-godot/assets/characters/body/${body}/idle/${direction}.png`, `body:${body}:idle:${direction}`);
}

for (const entry of pass.acceptedBatches) {
  if (entry.qa !== "passed") invalid.push(`${entry.id}: accepted batch is not marked passed`);
}

const directionalRoot = resolve(ROOT, "apps/client-godot/assets/objects/directional");
const furnitureSets = existsSync(directionalRoot) ? readdirSync(directionalRoot).filter((name) => statSync(resolve(directionalRoot, name)).isDirectory()) : [];
for (const id of furnitureSets) for (const direction of ["north", "east", "south", "west"]) png(`apps/client-godot/assets/objects/directional/${id}/${direction}.png`, `furniture:${id}:${direction}`, [627, 627]);

for (const body of contract.bodyPresentations) {
  for (const direction of contract.directions) {
    png(`apps/client-godot/assets/characters/body/${body}/idle/skin-diffuse/${direction}.png`, `skin-diffuse:${body}:${direction}`);
    png(`apps/client-godot/assets/characters/body/${body}/idle/skin-mask/${direction}.png`, `skin-mask:${body}:${direction}`);
  }
}

const outfitRoot = resolve(ROOT, "apps/client-godot/assets/characters/outfits");
const outfitVariants = [];
if (existsSync(outfitRoot)) {
  for (const outfit of readdirSync(outfitRoot)) {
    const outfitPath = resolve(outfitRoot, outfit);
    if (!statSync(outfitPath).isDirectory()) continue;
    for (const body of readdirSync(outfitPath)) {
      const bodyPath = resolve(outfitPath, body);
      if (!statSync(bodyPath).isDirectory()) continue;
      outfitVariants.push(`${outfit}/${body}`);
      for (const direction of contract.directions) for (const kind of ["diffuse", "primary-mask", "secondary-mask"]) {
        png(`apps/client-godot/assets/characters/outfits/${outfit}/${body}/idle/${kind}/${direction}.png`, `outfit:${outfit}:${body}:${kind}:${direction}`);
      }
    }
  }
}

const result = {
  ok: missing.length === 0 && invalid.length === 0,
  contract: {
    furniture: production.furniture.length,
    equipmentIcons: production.roleItems.length,
    bodyPresentations: contract.bodyPresentations.length,
    directions: contract.directions.length,
    animations: contract.animations.length,
    baseOutfits: contract.baseOutfits.length,
    roleLayers: contract.roleLayers.length,
    hairStyles: contract.hairStyles.length,
    facialHair: contract.facialHair.length,
    skinTones: contract.skinTones.length
  },
  present: { furnitureSets: furnitureSets.length, outfitVariants: outfitVariants.length, checkedUniquePngs: hashes.size },
  missing,
  invalid
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
