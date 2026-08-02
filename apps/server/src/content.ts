import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ActivityDefinition, FurnitureDefinition, GameContent, RoleDefinition, RoleEquipmentCatalog, RoleEquipmentDefinition, RoleEquipmentSlotDefinition, SeasonalEventDefinition, SkillDefinition } from "./types.js";

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
  roleEquipmentById: Map<string, RoleEquipmentDefinition>;
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
  const roleEquipment = new Map<string, RoleEquipmentDefinition>();
  const roleEquipmentSlots = new Map<string, RoleEquipmentSlotDefinition>();
  const roleEquipmentRoleSlots = new Map<string, Set<string>>();
  const events = new Map<string, SeasonalEventDefinition>();
  for (const pack of manifest.packs.filter((entry) => entry.enabled)) {
    const directory = resolve(dataRoot, pack.directory);
    for (const role of readOptional<Array<Record<string, unknown>>>(resolve(directory, "roles.json"), [])) rawRoles.set(String(role.id), role);
    for (const item of readOptional<FurnitureDefinition[]>(resolve(directory, "furniture.json"), [])) furniture.set(item.id, item);
    for (const item of readOptional<FurnitureDefinition[]>(resolve(directory, "furniture-production.json"), [])) furniture.set(item.id, item);
    const equipmentCatalog = readOptional<RoleEquipmentCatalog>(resolve(directory, "role-equipment.json"), { schemaVersion: 1, slots: [], roleSlots: {}, items: [] });
    if (equipmentCatalog.schemaVersion !== 1) throw new Error(`${pack.id} has an unsupported role-equipment schema.`);
    for (const slot of equipmentCatalog.slots) roleEquipmentSlots.set(slot.id, slot);
    for (const [roleId, slotIds] of Object.entries(equipmentCatalog.roleSlots)) {
      const merged = roleEquipmentRoleSlots.get(roleId) ?? new Set<string>();
      for (const slotId of slotIds) merged.add(slotId);
      roleEquipmentRoleSlots.set(roleId, merged);
    }
    for (const item of equipmentCatalog.items) roleEquipment.set(item.id, item);
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

  const roleEquipmentCatalog: RoleEquipmentCatalog = {
    schemaVersion: 1,
    slots: [...roleEquipmentSlots.values()],
    roleSlots: Object.fromEntries([...roleEquipmentRoleSlots.entries()].map(([roleId, slots]) => [roleId, [...slots]])),
    items: [...roleEquipment.values()],
  };
  const iconIds = new Set<string>();
  for (const [roleId, slotIds] of Object.entries(roleEquipmentCatalog.roleSlots)) {
    if (!resolved.has(roleId)) throw new Error(`Role-equipment loadout references unknown role ${roleId}.`);
    for (const slotId of slotIds) if (!roleEquipmentSlots.has(slotId)) throw new Error(`${roleId} loadout references unknown slot ${slotId}.`);
  }
  for (const item of roleEquipmentCatalog.items) {
    if (!item.id || !item.name || !item.iconId) throw new Error("Role-equipment items require stable ids, names, and iconIds.");
    if (!/^[a-z0-9][a-z0-9.-]*$/.test(item.iconId)) throw new Error(`${item.id} has an invalid stable iconId.`);
    if (iconIds.has(item.iconId)) throw new Error(`Duplicate role-equipment iconId ${item.iconId}.`);
    iconIds.add(item.iconId);
    if (item.kind !== "equipment" && item.kind !== "consumable") throw new Error(`${item.id} has an invalid role-equipment kind.`);
    if (!["basic", "professional", "specialist", "premium"].includes(item.qualityTier)) throw new Error(`${item.id} has an invalid quality tier.`);
    if (!Number.isInteger(item.priceCents) || item.priceCents < 0) throw new Error(`${item.id} has an invalid personal-cash price.`);
    if (!Number.isInteger(item.stackLimit) || item.stackLimit < 1 || item.stackLimit > 999) throw new Error(`${item.id} has an invalid stack limit.`);
    if (!Number.isInteger(item.requiredRoleLevel) || item.requiredRoleLevel < 1) throw new Error(`${item.id} has an invalid role-level requirement.`);
    if (item.kind === "equipment" && (!Number.isInteger(item.durability) || item.durability! < 1 || item.durability! > 100)) throw new Error(`${item.id} equipment needs durability from 1 to 100.`);
    if (item.kind === "equipment" && item.stackLimit !== 1) throw new Error(`${item.id} durable equipment must have an ownership limit of one.`);
    if (!item.allowedRoleIds.length) throw new Error(`${item.id} must allow at least one role.`);
    for (const roleId of item.allowedRoleIds) if (!resolved.has(roleId)) throw new Error(`${item.id} references unknown role ${roleId}.`);
    for (const slotId of item.equipSlots) if (!roleEquipmentSlots.has(slotId)) throw new Error(`${item.id} references unknown equipment slot ${slotId}.`);
    if (item.kind === "equipment" && !item.equipSlots.length) throw new Error(`${item.id} equipment needs a compatible loadout slot.`);
    if (item.kind === "consumable" && (item.equipSlots.length || !item.useEffects || !Object.keys(item.useEffects).length)) throw new Error(`${item.id} consumables need use effects and cannot occupy a slot.`);
    for (const [modifier, value] of Object.entries(item.modifiers)) if (!modifier || !Number.isFinite(value)) throw new Error(`${item.id} has an invalid modifier.`);
    for (const [effect, value] of Object.entries(item.useEffects ?? {})) if (!effect || !Number.isFinite(value)) throw new Error(`${item.id} has an invalid use effect.`);
    for (const roleId of item.allowedRoleIds) {
      const compatibleSlots = roleEquipmentCatalog.roleSlots[roleId] ?? [];
      if (item.kind === "equipment" && !item.equipSlots.some((slotId) => compatibleSlots.includes(slotId))) throw new Error(`${item.id} has no compatible slot for ${roleId}.`);
    }
  }

  const conceptsAndStyles = readJson<{ concepts: string[]; styles: string[] }>(resolve(dataRoot, "core/concepts-styles.json"));
  const content: GameContent = {
    roles: [...resolved.values()],
    activities,
    furniture: [...furniture.values()],
    roleEquipment: roleEquipmentCatalog,
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
    const equipmentCoverage = content.roleEquipment.items.filter((item) => item.allowedRoleIds.includes(role.id)).length;
    if (equipmentCoverage < 8) throw new Error(`${role.id} needs at least eight role-equipment choices; got ${equipmentCoverage}.`);
  }
  const canonical = JSON.stringify(content);
  return {
    content,
    roleById: new Map(content.roles.map((item) => [item.id, item])),
    activityById: new Map(content.activities.map((item) => [item.id, item])),
    furnitureById: new Map(content.furniture.map((item) => [item.id, item])),
    roleEquipmentById: new Map(content.roleEquipment.items.map((item) => [item.id, item])),
    manifest: {
      protocol: "rro.v1",
      schemaVersion: 1,
      contentHash: createHash("sha256").update(canonical).digest("hex"),
      counts: { roles: content.roles.length, skills: content.roles.reduce((sum, role) => sum + role.skills.length, 0), activities: content.activities.length, furniture: content.furniture.length, roleEquipment: content.roleEquipment.items.length, events: content.events.length, contentPacks: content.contentPacks.length },
      capabilities: [
        "godot-native-only", "authoritative-actions", "shared-live-shifts", "open-call-duty-slots", "guest-presence",
        "modular-layouts", "four-way-rotation", "causal-incidents", "evidence-reviews", "data-driven-skills", "persistent-role-loadouts", "personal-equipment-economy", "subclass-packs",
      ],
    },
  };
}
