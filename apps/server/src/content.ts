import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ActivityDefinition, FurnitureDefinition, GameContent, RoleDefinition, SeasonalEventDefinition, SkillDefinition } from "./types.js";

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function readOptional<T>(path: string, fallback: T): T {
  return existsSync(path) ? readJson<T>(path) : fallback;
}

export interface ContentRegistry {
  content: GameContent;
  roleById: Map<string, RoleDefinition>;
  activityById: Map<string, ActivityDefinition>;
  furnitureById: Map<string, FurnitureDefinition>;
  manifest: {
    protocol: "rro.v1";
    schemaVersion: 1;
    contentHash: string;
    counts: Record<string, number>;
    capabilities: string[];
  };
}

export function loadContent(dataRoot = resolve(process.cwd(), "packages/game-data")): ContentRegistry {
  const manifest = readJson<{ schemaVersion: number; packs: Array<{ id: string; directory: string; enabled: boolean }> }>(resolve(dataRoot, "manifest.json"));
  if (manifest.schemaVersion !== 1) throw new Error("Unsupported game-data manifest.");

  const rawRoles = new Map<string, Record<string, unknown>>();
  const furniture = new Map<string, FurnitureDefinition>();
  const events = new Map<string, SeasonalEventDefinition>();
  for (const pack of manifest.packs.filter((entry) => entry.enabled)) {
    const directory = resolve(dataRoot, pack.directory);
    for (const role of readOptional<Array<Record<string, unknown>>>(resolve(directory, "roles.json"), [])) rawRoles.set(String(role.id), role);
    for (const item of readOptional<FurnitureDefinition[]>(resolve(directory, "furniture.json"), [])) furniture.set(item.id, item);
    for (const item of readOptional<FurnitureDefinition[]>(resolve(directory, "furniture-production.json"), [])) furniture.set(item.id, item);
    for (const event of readOptional<SeasonalEventDefinition[]>(resolve(directory, "events.json"), [])) events.set(event.id, event);
  }

  const progression = readJson<{ schemaVersion: number; roles: Array<{ roleId: string; fundamentals: SkillDefinition[]; branches: Record<string, SkillDefinition[]> }> }>(resolve(dataRoot, "core/role-progression.json"));
  const progressionByRole = new Map(progression.roles.map((entry) => [entry.roleId, entry]));
  const activities = readJson<{ schemaVersion: number; activities: ActivityDefinition[] }>(resolve(dataRoot, "core/activities.json")).activities;
  const activitiesByRole = new Map<string, string[]>();
  for (const activity of activities) activitiesByRole.set(activity.roleId, [...(activitiesByRole.get(activity.roleId) ?? []), activity.id]);

  const resolved = new Map<string, RoleDefinition>();
  const resolving = new Set<string>();
  const resolveRole = (id: string): RoleDefinition => {
    const cached = resolved.get(id);
    if (cached) return cached;
    const raw = rawRoles.get(id);
    if (!raw) throw new Error(`Unknown role ${id}`);
    if (resolving.has(id)) throw new Error(`Cyclic role inheritance at ${id}`);
    resolving.add(id);
    const parentId = raw.parentRoleId ? String(raw.parentRoleId) : null;
    const parent = parentId ? resolveRole(parentId) : null;
    const expansion = progressionByRole.get(id);
    const expandedSkills = expansion
      ? [
          ...expansion.fundamentals.map((skill) => ({ ...skill, branch: "fundamentals" })),
          ...Object.entries(expansion.branches).flatMap(([branch, skills]) => skills.map((skill) => ({ ...skill, branch }))),
        ]
      : [];
    const ownSkills = (raw.skills as SkillDefinition[] | undefined) ?? [];
    const skills = expansion ? expandedSkills : [...(parent?.skills ?? []), ...ownSkills];
    const role: RoleDefinition = {
      id,
      label: String(raw.label ?? id),
      color: String(raw.color ?? "#ffffff"),
      icon: String(raw.icon ?? "•"),
      fantasy: String(raw.fantasy ?? ""),
      kind: parent ? "subclass" : "base",
      parentRoleId: parentId,
      employmentMode: raw.employmentMode === "ownership" ? "ownership" : (parent?.employmentMode ?? "job"),
      permissions: [...new Set([...(parent?.permissions ?? []), ...((raw.permissions as string[] | undefined) ?? [])])],
      tags: [...new Set([...(parent?.tags ?? []), ...((raw.tags as string[] | undefined) ?? [])])],
      attributeWeights: (raw.attributeWeights as Record<string, number> | undefined) ?? parent?.attributeWeights ?? {},
      branches: (raw.branches as RoleDefinition["branches"] | undefined) ?? parent?.branches ?? [],
      skills,
      activityIds: activitiesByRole.get(id) ?? parent?.activityIds ?? [],
    };
    resolving.delete(id);
    resolved.set(id, role);
    return role;
  };
  for (const id of rawRoles.keys()) resolveRole(id);

  const conceptsAndStyles = readJson<{ concepts: string[]; styles: string[] }>(resolve(dataRoot, "core/concepts-styles.json"));
  const content: GameContent = {
    roles: [...resolved.values()],
    activities,
    furniture: [...furniture.values()],
    construction: readJson(resolve(dataRoot, "core/construction.json")),
    appearance: readJson(resolve(dataRoot, "core/appearance.json")),
    world: readJson(resolve(dataRoot, "core/world.json")),
    attributes: readJson(resolve(dataRoot, "core/attributes.json")),
    concepts: conceptsAndStyles.concepts,
    styles: conceptsAndStyles.styles,
    events: [...events.values()],
    contentPacks: manifest.packs.map((pack) => ({ id: pack.id, enabled: pack.enabled, directory: pack.directory })),
  };

  for (const role of content.roles.filter((item) => item.kind === "base")) {
    if (role.skills.length !== 28) throw new Error(`${role.id} must compile to exactly 28 V1 skills; got ${role.skills.length}.`);
    if (role.activityIds.length < 10) throw new Error(`${role.id} needs at least ten continuous-work activities.`);
  }
  const canonical = JSON.stringify(content);
  return {
    content,
    roleById: new Map(content.roles.map((item) => [item.id, item])),
    activityById: new Map(content.activities.map((item) => [item.id, item])),
    furnitureById: new Map(content.furniture.map((item) => [item.id, item])),
    manifest: {
      protocol: "rro.v1",
      schemaVersion: 1,
      contentHash: createHash("sha256").update(canonical).digest("hex"),
      counts: { roles: content.roles.length, skills: content.roles.reduce((sum, role) => sum + role.skills.length, 0), activities: content.activities.length, furniture: content.furniture.length, events: content.events.length, contentPacks: content.contentPacks.length },
      capabilities: [
        "godot-native-only", "authoritative-actions", "shared-live-shifts", "open-call-duty-slots", "guest-presence",
        "modular-layouts", "four-way-rotation", "causal-incidents", "evidence-reviews", "data-driven-skills", "subclass-packs",
      ],
    },
  };
}
