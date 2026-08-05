import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(ROOT, path), "utf8");
const readJson = (path) => JSON.parse(read(path));

const secondaryArtDocuments = [
  "README.md",
  "docs/GAME_README.md",
  "docs/V1_RELEASE_GATE.md",
  "docs/PRODUCTION_READINESS_AND_ROADMAP.md",
  "docs/PRODUCTION_AUDIT_AND_ROADMAP.md",
  "docs/GAME_DESIGN_DOCUMENT.md",
];

const staleProgressClaims = [
  /\b20\s*\/\s*229\b/i,
  /\b20\s+of\s+229\b/i,
  /\bremaining\s+209\s+(?:furniture\s+)?sprites?\b/i,
  /\b0\s+of\s+45\b/i,
  /\b20\s+unique\s+top-down\b/i,
  /\b20\s+furniture\s+rasters?\b/i,
  /bulk art generation must not resume/i,
];

test("secondary art documents defer live progress to the authoritative generated ledger", () => {
  for (const path of secondaryArtDocuments) {
    const source = read(path);
    assert.match(source, /ART_PROGRESS\.md/, `${path} must link to the authoritative art ledger.`);
    for (const pattern of staleProgressClaims) {
      assert.doesNotMatch(source, pattern, `${path} duplicates an obsolete art-progress claim: ${pattern}`);
    }
  }
});

test("secondary documents never make direct-overhead the production runtime contract", () => {
  for (const path of secondaryArtDocuments) {
    const source = read(path);
    for (const line of source.split(/\r?\n/).filter((entry) => /direct-overhead/i.test(entry))) {
      assert.match(line, /legacy|obsolete|preserv|reference-only|references only/i, `${path} mentions direct-overhead without its reference-only boundary.`);
      assert.doesNotMatch(line, /production (?:camera|art(?:work)?) (?:is|uses?) (?:an? )?direct-overhead/i, `${path} restores the obsolete direct-overhead runtime contract.`);
    }
  }
  assert.match(read("docs/GAME_DESIGN_DOCUMENT.md"), /elevated orthographic-isometric camera/i);
});

test("the generated art-production index is non-authoritative and legacy-reference-only", () => {
  const production = readJson("planning/art-production.json");
  assert.equal(production.schemaVersion, 2);
  assert.equal(production.purpose, "catalog-and-legacy-reference-index");
  assert.equal(production.authoritativeProgress.document, "docs/ART_PROGRESS.md");
  assert.equal(production.productionContract.furnitureCamera, "elevated orthographic-isometric");
  assert.equal(production.legacyReferencePolicy.status, "reference-only");
  assert.deepEqual(production.legacyReferencePolicy.forbiddenUses, [
    "runtime production art",
    "production-completion evidence",
    "directional-set substitution",
  ]);
  assert.equal(Object.hasOwn(production, "counts"), false, "Live counters belong only in docs/ART_PROGRESS.md.");
  assert.ok(production.furniture.length > 0);
  for (const item of production.furniture) {
    const isPreserved = existsSync(resolve(ROOT, item.legacyReference.path));
    assert.equal(item.legacyReference.status, isPreserved ? "legacy-reference-only" : "not-preserved", item.assetId);
    assert.equal(item.legacyReference.excludedFromProductionCompletion, true, item.assetId);
  }
});

test("planning records the standing art generation and public publication authorization", () => {
  const production = readJson("planning/art-production.json");
  const nextSteps = readJson("planning/next-steps.json");
  assert.equal(production.standingAuthorization.productionArtGeneration, true);
  assert.equal(production.standingAuthorization.publicRepositoryPublication, true);
  assert.equal(production.standingAuthorization.repository, "Maergoth/rro");
  assert.equal(production.standingAuthorization.branch, "agent/complete-production-art");
  assert.equal(nextSteps.artRecoveryStatus.bulkGenerationAuthorized, true);
  assert.equal(nextSteps.artRecoveryStatus.publicRepositoryPublicationAuthorized, true);
  assert.equal(nextSteps.artRecoveryStatus.authoritativeProgressDocument, "docs/ART_PROGRESS.md");
  assert.equal(nextSteps.artRecoveryStatus.runtimeCamera, "elevated orthographic-isometric");
});
