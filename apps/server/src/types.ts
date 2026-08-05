import type { DatabaseSync } from "node:sqlite";

export type Database = DatabaseSync;
export type PresenceKind = "employee" | "guest";
export type ShiftState = "crew-call" | "open" | "closing" | "closed" | "emergency-closed";
export type WorkLane = "now" | "next" | "prevent" | "admin";

export interface SkillEffect {
  type: string;
  value: number;
  roleId: string;
  branchId?: string;
}

export interface SkillDefinition {
  id: string;
  branch?: string;
  label: string;
  cost: number;
  requires: string | null;
  description: string;
  effect: SkillEffect;
}

export interface RoleDefinition {
  id: string;
  label: string;
  color: string;
  icon: string;
  fantasy: string;
  kind: "base" | "subclass";
  parentRoleId: string | null;
  employmentMode: "job" | "ownership";
  permissions: string[];
  tags: string[];
  attributeWeights: Record<string, number>;
  branches: Array<{ id: string; label: string; description: string }>;
  skills: SkillDefinition[];
  activityIds: string[];
}

export interface ActivityPhase {
  id: string;
  prompt: string;
  actions: [string, string];
}

export interface ActivityDefinition {
  id: string;
  roleId: string;
  label: string;
  grammar: string;
  lane: WorkLane;
  priority: number;
  description: string;
  phases: ActivityPhase[];
  successActions: string[];
  riskActions: string[];
  tags: string[];
}

export type FurnitureMount = "floor" | "wall" | "ceiling";
export type FurnitureOccupancy = "blocking" | "nonblocking";
export type FurnitureServiceAccess = "adjacent" | "none";
export type FurnitureWallOpening = "solid" | "window";

export interface FurniturePlacement {
  mount: FurnitureMount;
  occupancy: FurnitureOccupancy;
  serviceAccess: FurnitureServiceAccess;
  allowedWallOpenings?: FurnitureWallOpening[];
}

export interface FurnitureDefinition {
  id: string;
  name: string;
  category: string;
  style: string;
  tier?: string;
  costCents: number;
  width: number;
  height: number;
  /**
   * Authoritative mounting and spatial behavior. Legacy definitions without
   * this field are normalized to floor/blocking/adjacent when content loads.
   *
   * For wall-mounted instances, rotation selects the room-side mount edge:
   * 0=north, 90=east, 180=south, 270=west. The eventual renderer must face
   * the artwork inward, opposite that edge; rotation is not a second wall
   * coordinate and does not require a persistence migration.
   */
  placement: FurniturePlacement;
  symbol: string;
  assetId?: string;
  legacyAssetId?: string;
  inventoryScope?: "restaurant";
  upkeepCents?: number;
  durability?: number;
  breakageHorizonShifts?: number;
  wearPerShift?: number;
  repairCostCents?: number;
  roleEffects?: Record<string, number>;
  utilities?: string[];
  stats: Record<string, number>;
  tags?: string[];
}

export type RoleEquipmentKind = "equipment" | "consumable";
export type RoleEquipmentTier = "basic" | "professional" | "specialist" | "premium";

export interface RoleEquipmentSlotDefinition {
  id: string;
  label: string;
  description: string;
}

export interface RoleEquipmentDefinition {
  id: string;
  name: string;
  description: string;
  iconId: string;
  category: string;
  kind: RoleEquipmentKind;
  qualityTier: RoleEquipmentTier;
  priceCents: number;
  stackLimit: number;
  allowedRoleIds: string[];
  requiredRoleLevel: number;
  equipSlots: string[];
  modifiers: Record<string, number>;
  useEffects?: Record<string, number>;
  durability?: number;
  tags: string[];
}

export interface RoleEquipmentCatalog {
  schemaVersion: 1;
  slots: RoleEquipmentSlotDefinition[];
  roleSlots: Record<string, string[]>;
  items: RoleEquipmentDefinition[];
}

export interface ConstructionContent {
  schemaVersion: number;
  grid: { defaultWidth: number; defaultHeight: number; cellMeters: number; rotations: number[] };
  surfaces: Array<{ id: string; label: string; costCents: number; stats: Record<string, number>; assetId: string }>;
  wallStyles: Array<{ id: string; label: string; costCents: number; assetId: string }>;
  utilityTypes: string[];
}

export interface SeasonalEventDefinition {
  id: string;
  label: string;
  description: string;
  startsAt: string;
  endsAt: string;
  accent: string;
  modifiers: Record<string, number>;
  tags: string[];
  contentPackId: string;
}

export interface GameContent {
  roles: RoleDefinition[];
  activities: ActivityDefinition[];
  furniture: FurnitureDefinition[];
  roleEquipment: RoleEquipmentCatalog;
  construction: ConstructionContent;
  appearance: {
    schemaVersion: number;
    outfitSilhouettes: string[];
    defaultPrimary: string;
    defaultSecondary: string;
    palettes: Array<{ id: string; primary: string; secondary: string }>;
  };
  world: Array<Record<string, unknown>>;
  attributes: Array<Record<string, unknown>>;
  concepts: string[];
  styles: string[];
  events: SeasonalEventDefinition[];
  contentPacks: Array<{ id: string; enabled: boolean; directory: string }>;
}

export interface AuthenticatedAccount {
  id: string;
  username: string;
  displayName: string;
  characterId: string;
}

export interface ServerConfig {
  host: string;
  port: number;
  database: string;
  tickRate: number;
  snapshotRate: number;
  autoOpenNpcShifts: boolean;
  logLevel: string;
}

export interface CommandEnvelope {
  id: string;
  type: string;
  shiftId?: string;
  payload?: Record<string, unknown>;
}

export interface Snapshot {
  protocol: "rro.v1";
  shift: Record<string, unknown>;
  restaurant: Record<string, unknown>;
  layout: Record<string, unknown>;
  dutySlots: Array<Record<string, unknown>>;
  presences: Array<Record<string, unknown>>;
  parties: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  incidents: Array<Record<string, unknown>>;
  serverTime: number;
  version: number;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
