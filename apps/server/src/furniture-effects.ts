/**
 * Pure furniture simulation.  Persistence and placement stay in the layout
 * service; this module turns the current inventory condition into restaurant
 * effects without touching a database or clock.
 */

export interface FurnitureEffectsDefinition {
  id: string;
  category?: string;
  costCents: number;
  width: number;
  height: number;
  durability?: number;
  upkeepCents?: number;
  breakageHorizonShifts?: number;
  repairCostCents?: number;
  stats: Readonly<Record<string, number>>;
  roleEffects?: Readonly<Record<string, number>>;
}

export interface PlacedFurnitureInstance {
  definitionId: string;
  wear: number;
  state?: string;
}

export interface FurnitureEffectsSummary {
  restaurantRating: number;
  customerHappiness: number;
  cleaningWorkload: number;
  reliabilityRisk: number;
  serviceModifiers: {
    frontOfHouse: number;
    kitchenThroughput: number;
    foodQuality: number;
    sanitation: number;
    turnover: number;
    revenue: number;
    seats: number;
    storage: number;
  };
  roleModifiers: Record<string, number>;
  dimensions: {
    comfort: number;
    appearance: number;
    cleanability: number;
    reliability: number;
  };
  inventory: {
    placedCount: number;
    wornCount: number;
    brokenCount: number;
    replacementValueCents: number;
    upkeepCentsPerShift: number;
    repairReserveCentsPerShift: number;
  };
  unknownDefinitionIds: string[];
}

const clamp = (value: number, minimum: number, maximum: number): number => Math.max(minimum, Math.min(maximum, value));
const round = (value: number, precision = 1): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};
const finite = (value: number | undefined, fallback = 0): number => Number.isFinite(value) ? Number(value) : fallback;
const stat = (definition: FurnitureEffectsDefinition, key: string): number => finite(definition.stats[key]);
const softCap = (value: number, cap = 45): number => cap * Math.tanh(value / cap);

function positiveConditionMultiplier(wear: number, broken: boolean): number {
  if (broken) return 0.06;
  return clamp(1 - 0.78 * (wear / 100) ** 1.4, 0.12, 1);
}

function contribution(value: number, repeatMultiplier: number, conditionMultiplier: number): number {
  // Duplicate benefits taper; drawbacks do not. This makes a mixed room more
  // useful than filling every tile with the current best-stat object.
  return value >= 0
    ? value * repeatMultiplier * conditionMultiplier
    : value * (1 + (1 - conditionMultiplier) * 0.5);
}

function operationalValue(definition: FurnitureEffectsDefinition, weights: Readonly<Record<string, number>>): number {
  return Object.entries(weights).reduce((sum, [key, weight]) => sum + stat(definition, key) * weight, 0);
}

/**
 * Aggregate placed restaurant inventory into bounded simulation modifiers.
 * All results are deterministic and depend only on the supplied definitions
 * and instances. Wear is clamped to 0..100; `broken` state always wins.
 */
export function aggregateFurnitureEffects(
  definitions: readonly FurnitureEffectsDefinition[],
  instances: readonly PlacedFurnitureInstance[],
): FurnitureEffectsSummary {
  const definitionById = new Map(definitions.map((definition) => [definition.id, definition]));
  const repetitions = new Map<string, number>();
  const unknown = new Set<string>();
  const roles: Record<string, number> = {};

  let comfort = 0;
  let appearance = 0;
  let cleanability = 0;
  let reliability = 0;
  let frontOfHouse = 0;
  let kitchen = 0;
  let foodQuality = 0;
  let sanitation = 0;
  let turnover = 0;
  let revenue = 0;
  let seats = 0;
  let storage = 0;
  let cleaningBase = 0;
  let reliabilityRiskTotal = 0;
  let placedCount = 0;
  let wornCount = 0;
  let brokenCount = 0;
  let replacementValueCents = 0;
  let upkeepCentsPerShift = 0;
  let repairReserveCentsPerShift = 0;

  for (const instance of instances) {
    const definition = definitionById.get(instance.definitionId);
    if (!definition) {
      unknown.add(instance.definitionId);
      continue;
    }

    const occurrence = (repetitions.get(definition.id) ?? 0) + 1;
    repetitions.set(definition.id, occurrence);
    const repeatMultiplier = 1 / Math.sqrt(occurrence);
    const wear = clamp(finite(instance.wear), 0, 100);
    const broken = instance.state === "broken" || wear >= 100;
    const worn = broken || instance.state === "worn" || wear >= 60;
    const conditionMultiplier = positiveConditionMultiplier(wear, broken);
    const wearPenalty = Math.max(0, wear - 45) / 10 + (broken ? 8 : 0);
    const apply = (value: number): number => contribution(value, repeatMultiplier, conditionMultiplier);

    comfort += apply(stat(definition, "comfort")) - wearPenalty * 0.5;
    appearance += apply(stat(definition, "ambience")) + apply(stat(definition, "community") * 0.35) - wearPenalty * 0.8;
    cleanability += apply(stat(definition, "cleanability")) - wearPenalty * 0.65;
    reliability += apply(stat(definition, "reliability")) - wearPenalty * 1.2;

    frontOfHouse += apply(operationalValue(definition, {
      service: 1, turnover: 0.65, route: 0.55, accuracy: 0.45, payment: 0.3,
      forecast: 0.3, handoff: 0.4, hospitality: 0.7, accessibility: 0.35,
    }));
    kitchen += apply(operationalValue(definition, {
      kitchen: 1, capacity: 0.35, recovery: 0.4, speed: 0.45, hold: 0.35,
      consistency: 0.5, storage: 0.2, organization: 0.2, rotation: 0.25,
    }));
    foodQuality += apply(operationalValue(definition, { quality: 1, consistency: 0.55, hold: 0.25, recovery: 0.2 }));
    sanitation += apply(operationalValue(definition, {
      sanitation: 1, cleanability: 0.35, spill: 0.45, safety: 0.25,
      waste: -0.4, breakage: -0.25,
    }));
    turnover += apply(stat(definition, "turnover"));
    revenue += apply(operationalValue(definition, { revenue: 1, payment: 0.35, quality: 0.2, community: 0.15 }));

    // Physical capacity remains additive. A second chair still seats a second
    // guest even though a second identical chair adds less novelty/ambience.
    seats += Math.max(0, stat(definition, "seats")) * (broken ? 0 : 1);
    storage += Math.max(0, stat(definition, "storage")) * conditionMultiplier;

    for (const [role, value] of Object.entries(definition.roleEffects ?? {})) {
      roles[role] = (roles[role] ?? 0) + apply(finite(value));
    }

    const area = clamp(finite(definition.width, 1), 1, 12) * clamp(finite(definition.height, 1), 1, 12);
    const ease = clamp(stat(definition, "cleanability"), -10, 20);
    cleaningBase += (2 + area * 1.35) * clamp(1.12 - ease / 45, 0.55, 1.45) * (1 + wear / 135) * (broken ? 1.18 : 1);

    const durability = clamp(finite(definition.durability, 65), 20, 100);
    const statReliability = clamp(stat(definition, "reliability"), -10, 20);
    const horizon = clamp(finite(definition.breakageHorizonShifts, 250), 20, 2000);
    const baseRisk = 900 / horizon;
    const conditionRisk = 64 * (wear / 100) ** 2 * (1 + (100 - durability) / 160) * (1 - statReliability / 80);
    reliabilityRiskTotal += broken ? 100 : clamp(baseRisk + conditionRisk, 0, 98);

    const costCents = Math.max(0, Math.round(finite(definition.costCents)));
    const repairCostCents = Math.max(0, Math.round(finite(definition.repairCostCents, costCents * 0.22)));
    replacementValueCents += costCents;
    upkeepCentsPerShift += Math.max(0, Math.round(finite(definition.upkeepCents)));
    repairReserveCentsPerShift += repairCostCents / horizon * (1 + (wear / 100) ** 2 * 4 + (broken ? 12 : 0));
    placedCount += 1;
    if (worn) wornCount += 1;
    if (broken) brokenCount += 1;
  }

  const dimensions = {
    comfort: round(softCap(comfort)),
    appearance: round(softCap(appearance)),
    cleanability: round(softCap(cleanability)),
    reliability: round(softCap(reliability)),
  };
  const serviceModifiers = {
    frontOfHouse: round(softCap(frontOfHouse, 35)),
    kitchenThroughput: round(softCap(kitchen, 35)),
    foodQuality: round(softCap(foodQuality, 30)),
    sanitation: round(softCap(sanitation, 35)),
    turnover: round(softCap(turnover, 30)),
    revenue: round(softCap(revenue, 30)),
    seats: round(seats, 0),
    storage: round(storage, 1),
  };
  const reliabilityRisk = placedCount ? round(clamp(reliabilityRiskTotal / placedCount, 0, 100)) : 0;
  const cleaningReduction = Math.max(0, serviceModifiers.sanitation) * 0.28 + Math.max(0, dimensions.cleanability) * 0.18;
  const cleaningWorkload = placedCount ? round(Math.max(0, cleaningBase - cleaningReduction)) : 0;
  const customerHappiness = round(clamp(
    50
      + dimensions.comfort * 0.34
      + dimensions.appearance * 0.42
      + serviceModifiers.frontOfHouse * 0.20
      + serviceModifiers.foodQuality * 0.18
      + serviceModifiers.sanitation * 0.11
      - reliabilityRisk * 0.13
      - brokenCount * 2.5,
    0,
    100,
  ));
  const restaurantRating = round(clamp(
    3
      + (customerHappiness - 50) / 34
      + dimensions.reliability / 115
      + serviceModifiers.kitchenThroughput / 130
      - reliabilityRisk / 170,
    1,
    5,
  ));

  return {
    restaurantRating,
    customerHappiness,
    cleaningWorkload,
    reliabilityRisk,
    serviceModifiers,
    roleModifiers: Object.fromEntries(Object.entries(roles).sort(([a], [b]) => a.localeCompare(b)).map(([role, value]) => [role, round(softCap(value, 30))])),
    dimensions,
    inventory: {
      placedCount,
      wornCount,
      brokenCount,
      replacementValueCents,
      upkeepCentsPerShift,
      repairReserveCentsPerShift: Math.round(repairReserveCentsPerShift),
    },
    unknownDefinitionIds: [...unknown].sort(),
  };
}
