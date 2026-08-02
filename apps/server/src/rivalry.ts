export const RIVALRY_DIMENSION_IDS = [
  "timing-window",
  "precision",
  "memory-order",
  "coordination-handoff",
  "interruptions",
] as const;

export type RivalryDimensionId = typeof RIVALRY_DIMENSION_IDS[number];
export type RivalryIntensityId = "light" | "focused" | "expert";
export type RivalryChallengeId =
  | "special-request"
  | "allergy-declaration"
  | "split-check"
  | "impatient-pace"
  | "tasting-menu";

export interface RivalryDimensionDefinition {
  id: RivalryDimensionId;
  label: string;
  telegraph: string;
  counterplay: string;
  scorePressurePerRank: number;
  dueWindowReductionMsPerRank: number;
  priorityBoostPerRank: number;
  handoffPenaltyPerRank: number;
  addedComplexityPerRank: number;
}

export interface RivalryIntensityDefinition {
  id: RivalryIntensityId;
  rank: 1 | 2 | 3;
  label: string;
  costMultiplier: number;
  overcomeScore: number;
  bonusCashCents: number;
  bonusXp: number;
  reviewBonus: number;
}

export interface RivalryChallengeDefinition {
  id: RivalryChallengeId;
  label: string;
  baseCostCents: number;
  activityId: string;
  priority: number;
  defaultDimension: RivalryDimensionId;
  allowedDimensions: readonly RivalryDimensionId[];
}

export interface RivalryDifficultyEffect {
  scorePressure: number;
  dueWindowReductionMs: number;
  priorityBoost: number;
  handoffPenalty: number;
  addedComplexity: number;
}

export interface RivalrySelection {
  ok: true;
  challenge: RivalryChallengeDefinition;
  dimension: RivalryDimensionDefinition;
  intensity: RivalryIntensityDefinition;
  costCents: number;
  effect: RivalryDifficultyEffect;
}

export interface RivalrySource {
  characterId: string;
  displayName: string;
  partyId: string;
  originRestaurantId: string;
  originRestaurantName: string;
  targetRestaurantId: string;
  targetRestaurantName: string;
}

export interface RivalryTarget {
  taskId: string;
  activityId: string;
  activityLabel: string;
  ownerRoleId: string;
}

export interface RivalryResolution {
  overcome: boolean;
  averageScore: number;
  controlledActions: number;
  totalActions: number;
  requiredScore: number;
  bonusCashCents: number;
  bonusXp: number;
  reviewBonus: number;
}

export interface RivalryMetadata {
  schemaVersion: 1;
  status: "active" | "overcome" | "pressure-landed";
  challengeId: RivalryChallengeId;
  challengeLabel: string;
  dimension: RivalryDimensionId;
  dimensionLabel: string;
  intensity: RivalryIntensityId;
  intensityRank: 1 | 2 | 3;
  costCents: number;
  appliedAt: number;
  source: RivalrySource;
  target: RivalryTarget;
  effect: RivalryDifficultyEffect;
  telegraph: {
    visible: true;
    title: string;
    message: string;
  };
  counterplay: {
    strategy: string;
    overcomeScore: number;
  };
  rewards: {
    bonusCashCents: number;
    bonusXp: number;
    reviewBonus: number;
  };
  resolution?: RivalryResolution & { resolvedAt: number };
}

export interface RivalryRuleFailure {
  ok: false;
  code: string;
  message: string;
  retryAt?: number;
}

export interface RivalryRuleSuccess {
  ok: true;
}

export type RivalryRuleDecision = RivalryRuleSuccess | RivalryRuleFailure;

export const RIVALRY_LIMITS = Object.freeze({
  cooldownMs: 45_000,
  perVisit: 2,
  perParty: 3,
  perShift: 8,
});

const ALL_DIMENSIONS: readonly RivalryDimensionId[] = RIVALRY_DIMENSION_IDS;

export const RIVALRY_DIMENSIONS: Readonly<Record<RivalryDimensionId, RivalryDimensionDefinition>> = Object.freeze({
  "timing-window": {
    id: "timing-window",
    label: "Timing window",
    telegraph: "The service window is shorter and lateness matters sooner.",
    counterplay: "Claim early, use the controlled action, and finish each phase before the shortened due time.",
    scorePressurePerRank: 2,
    dueWindowReductionMsPerRank: 8_000,
    priorityBoostPerRank: 2,
    handoffPenaltyPerRank: 0,
    addedComplexityPerRank: 0,
  },
  precision: {
    id: "precision",
    label: "Precision",
    telegraph: "Mistakes carry extra score pressure and exact execution is rewarded.",
    counterplay: "Use the controlled action in every phase and verify the result before advancing.",
    scorePressurePerRank: 5,
    dueWindowReductionMsPerRank: 0,
    priorityBoostPerRank: 1,
    handoffPenaltyPerRank: 0,
    addedComplexityPerRank: 0,
  },
  "memory-order": {
    id: "memory-order",
    label: "Memory and order",
    telegraph: "The request carries extra ordered details that must remain intact.",
    counterplay: "Follow the displayed phase order and use the controlled action without skipping a verification step.",
    scorePressurePerRank: 4,
    dueWindowReductionMsPerRank: 0,
    priorityBoostPerRank: 1,
    handoffPenaltyPerRank: 0,
    addedComplexityPerRank: 1,
  },
  "coordination-handoff": {
    id: "coordination-handoff",
    label: "Coordination and handoff",
    telegraph: "Off-role handoffs are less forgiving for this request.",
    counterplay: "Keep the task with its owning role and use controlled actions through the handoff.",
    scorePressurePerRank: 1,
    dueWindowReductionMsPerRank: 0,
    priorityBoostPerRank: 2,
    handoffPenaltyPerRank: 5,
    addedComplexityPerRank: 0,
  },
  interruptions: {
    id: "interruptions",
    label: "Interruptions",
    telegraph: "The request moves up the queue and adds visible interruption pressure.",
    counterplay: "Assign an owner promptly and keep choosing controlled actions instead of rushing the interruption.",
    scorePressurePerRank: 3,
    dueWindowReductionMsPerRank: 0,
    priorityBoostPerRank: 5,
    handoffPenaltyPerRank: 0,
    addedComplexityPerRank: 1,
  },
});

export const RIVALRY_INTENSITIES: Readonly<Record<RivalryIntensityId, RivalryIntensityDefinition>> = Object.freeze({
  light: { id: "light", rank: 1, label: "Light", costMultiplier: 1, overcomeScore: 72, bonusCashCents: 150, bonusXp: 10, reviewBonus: 1 },
  focused: { id: "focused", rank: 2, label: "Focused", costMultiplier: 1.6, overcomeScore: 76, bonusCashCents: 325, bonusXp: 22, reviewBonus: 1 },
  expert: { id: "expert", rank: 3, label: "Expert", costMultiplier: 2.4, overcomeScore: 80, bonusCashCents: 550, bonusXp: 36, reviewBonus: 2 },
});

export const RIVALRY_CHALLENGES: Readonly<Record<RivalryChallengeId, RivalryChallengeDefinition>> = Object.freeze({
  "special-request": { id: "special-request", label: "Off-menu preference", baseCostCents: 800, activityId: "server-menu-interview", priority: 92, defaultDimension: "memory-order", allowedDimensions: ALL_DIMENSIONS },
  "allergy-declaration": { id: "allergy-declaration", label: "Allergy protocol", baseCostCents: 500, activityId: "server-allergy-confirmation", priority: 100, defaultDimension: "precision", allowedDimensions: ALL_DIMENSIONS },
  "split-check": { id: "split-check", label: "Complex split check", baseCostCents: 1200, activityId: "server-split-payment", priority: 86, defaultDimension: "memory-order", allowedDimensions: ALL_DIMENSIONS },
  "impatient-pace": { id: "impatient-pace", label: "Accelerated pacing request", baseCostCents: 1800, activityId: "manager-guest-recovery", priority: 96, defaultDimension: "timing-window", allowedDimensions: ALL_DIMENSIONS },
  "tasting-menu": { id: "tasting-menu", label: "Chef-guided tasting request", baseCostCents: 2500, activityId: "chef-taste-calibration", priority: 88, defaultDimension: "precision", allowedDimensions: ALL_DIMENSIONS },
});

const DIMENSION_ALIASES: Readonly<Record<string, RivalryDimensionId>> = Object.freeze({
  timing: "timing-window",
  "timing-window": "timing-window",
  precision: "precision",
  memory: "memory-order",
  order: "memory-order",
  "order-complexity": "memory-order",
  "memory-order": "memory-order",
  coordination: "coordination-handoff",
  handoff: "coordination-handoff",
  "coordination-handoff": "coordination-handoff",
  interruption: "interruptions",
  interruptions: "interruptions",
});

const INTENSITY_ALIASES: Readonly<Record<string, RivalryIntensityId>> = Object.freeze({
  "1": "light",
  light: "light",
  "2": "focused",
  focused: "focused",
  standard: "focused",
  "3": "expert",
  expert: "expert",
});

function failure(code: string, message: string, retryAt?: number): RivalryRuleFailure {
  return retryAt === undefined ? { ok: false, code, message } : { ok: false, code, message, retryAt };
}

export function selectRivalryChallenge(challengeValue: unknown, dimensionValue: unknown, intensityValue: unknown): RivalrySelection | RivalryRuleFailure {
  const challenge = RIVALRY_CHALLENGES[String(challengeValue ?? "") as RivalryChallengeId];
  if (!challenge) return failure("unknown-challenge", "Unknown guest challenge.");

  const dimensionId = dimensionValue === undefined || dimensionValue === null || dimensionValue === ""
    ? challenge.defaultDimension
    : DIMENSION_ALIASES[String(dimensionValue).trim().toLowerCase()];
  if (!dimensionId || !challenge.allowedDimensions.includes(dimensionId)) {
    return failure("invalid-dimension", `Choose a supported minigame dimension: ${RIVALRY_DIMENSION_IDS.join(", ")}.`);
  }

  let intensityId: RivalryIntensityId | undefined;
  if (intensityValue === undefined || intensityValue === null || intensityValue === "") {
    intensityId = "light";
  } else if (typeof intensityValue === "number") {
    intensityId = Number.isInteger(intensityValue) ? INTENSITY_ALIASES[String(intensityValue)] : undefined;
  } else {
    intensityId = INTENSITY_ALIASES[String(intensityValue).trim().toLowerCase()];
  }
  if (!intensityId) return failure("invalid-intensity", "Intensity must be light, focused, or expert (tiers 1–3).");

  const dimension = RIVALRY_DIMENSIONS[dimensionId];
  const intensity = RIVALRY_INTENSITIES[intensityId];
  const rank = intensity.rank;
  return {
    ok: true,
    challenge,
    dimension,
    intensity,
    costCents: Math.round((challenge.baseCostCents * intensity.costMultiplier) / 50) * 50,
    effect: {
      scorePressure: dimension.scorePressurePerRank * rank,
      dueWindowReductionMs: dimension.dueWindowReductionMsPerRank * rank,
      priorityBoost: dimension.priorityBoostPerRank * rank,
      handoffPenalty: dimension.handoffPenaltyPerRank * rank,
      addedComplexity: dimension.addedComplexityPerRank * rank,
    },
  };
}

export function assessRivalryVisit(input: {
  presenceKind: string;
  originRestaurantId: string | null;
  originRegionId: string | null;
  targetRestaurantId: string;
  targetRegionId: string;
  ownsTarget: boolean;
  employedAtTarget: boolean;
}): RivalryRuleDecision {
  if (input.presenceKind !== "guest") return failure("not-guest", "Only a seated guest may create a service challenge.");
  if (!input.originRestaurantId || !input.originRegionId) return failure("no-rival-origin", "Work at or own a local restaurant before issuing a rival challenge.");
  if (input.originRegionId !== input.targetRegionId) return failure("not-local", "Rival challenges are limited to restaurants in your local region.");
  if (input.originRestaurantId === input.targetRestaurantId || input.ownsTarget || input.employedAtTarget) {
    return failure("not-a-rival", "Rival challenges can only be issued while visiting another local restaurant.");
  }
  return { ok: true };
}

export function assessRivalryTarget(input: {
  requestedTaskId: string;
  taskShiftId: string;
  activeShiftId: string;
  taskPartyId: string | null;
  sourcePartyId: string;
  taskState: string;
  actionCount: number;
  alreadyModified: boolean;
}): RivalryRuleDecision {
  if (!input.requestedTaskId) return failure("invalid-target", "Choose a live service task to challenge.");
  if (input.taskShiftId !== input.activeShiftId) return failure("invalid-target", "The target task is not part of this live shift.");
  if (input.taskPartyId !== input.sourcePartyId) return failure("invalid-target", "Guests may only complicate service attached to their own visible party request.");
  if (input.taskState !== "open" && input.taskState !== "claimed") return failure("invalid-target", "Choose an open service task.");
  if (input.actionCount !== 0) return failure("challenge-in-progress", "A challenge cannot change after staff begin its minigame.");
  if (input.alreadyModified) return failure("challenge-stacked", "That task already has a rival modifier; modifiers never stack.");
  return { ok: true };
}

export function assessRivalryCaps(input: {
  now: number;
  lastChallengeAt: number | null;
  visitCount: number;
  partyCount: number;
  shiftCount: number;
}): RivalryRuleDecision {
  if (input.lastChallengeAt !== null && input.now - input.lastChallengeAt < RIVALRY_LIMITS.cooldownMs) {
    const retryAt = input.lastChallengeAt + RIVALRY_LIMITS.cooldownMs;
    return failure("cooldown", `Rival challenges have a ${Math.round(RIVALRY_LIMITS.cooldownMs / 1000)} second cooldown.`, retryAt);
  }
  if (input.visitCount >= RIVALRY_LIMITS.perVisit) return failure("visit-cap", `Each guest may issue at most ${RIVALRY_LIMITS.perVisit} challenges per visit.`);
  if (input.partyCount >= RIVALRY_LIMITS.perParty) return failure("party-cap", `A guest party may issue at most ${RIVALRY_LIMITS.perParty} challenges in a shift.`);
  if (input.shiftCount >= RIVALRY_LIMITS.perShift) return failure("shift-cap", `This shift has reached its cap of ${RIVALRY_LIMITS.perShift} rival challenges.`);
  return { ok: true };
}

export function calculateRivalryActionEffect(metadata: RivalryMetadata, input: { controlled: boolean; offRole: boolean }): {
  pressure: number;
  mitigation: number;
  scorePenalty: number;
  mitigated: boolean;
  strategy: string;
} {
  const dimension = RIVALRY_DIMENSIONS[metadata.dimension];
  const rank = RIVALRY_INTENSITIES[metadata.intensity].rank;
  const basePressure = dimension.scorePressurePerRank * rank;
  const handoffPressure = input.offRole ? dimension.handoffPenaltyPerRank * rank : 0;
  const pressure = basePressure + handoffPressure;
  const mitigation = input.controlled ? Math.ceil(pressure * 0.75) : 0;
  return {
    pressure,
    mitigation,
    scorePenalty: Math.max(0, pressure - mitigation),
    mitigated: input.controlled,
    strategy: dimension.counterplay,
  };
}

export function resolveRivalryOutcome(metadata: RivalryMetadata, input: { scores: number[]; controlledActions: number; totalActions: number }): RivalryResolution {
  const averageScore = input.scores.length > 0 ? Math.round(input.scores.reduce((sum, score) => sum + score, 0) / input.scores.length) : 0;
  const intensity = RIVALRY_INTENSITIES[metadata.intensity];
  const overcome = input.totalActions > 0 && input.controlledActions === input.totalActions && averageScore >= intensity.overcomeScore;
  return {
    overcome,
    averageScore,
    controlledActions: input.controlledActions,
    totalActions: input.totalActions,
    requiredScore: intensity.overcomeScore,
    bonusCashCents: overcome ? intensity.bonusCashCents : 0,
    bonusXp: overcome ? intensity.bonusXp : 0,
    reviewBonus: overcome ? intensity.reviewBonus : 0,
  };
}

export function isRivalryMetadata(value: unknown): value is RivalryMetadata {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RivalryMetadata>;
  return candidate.schemaVersion === 1
    && (candidate.status === "active" || candidate.status === "overcome" || candidate.status === "pressure-landed")
    && candidate.challengeId !== undefined
    && RIVALRY_CHALLENGES[candidate.challengeId] !== undefined
    && candidate.dimension !== undefined
    && RIVALRY_DIMENSIONS[candidate.dimension] !== undefined
    && candidate.intensity !== undefined
    && RIVALRY_INTENSITIES[candidate.intensity] !== undefined
    && typeof candidate.costCents === "number"
    && typeof candidate.appliedAt === "number"
    && Boolean(candidate.source)
    && Boolean(candidate.target)
    && Boolean(candidate.telegraph)
    && Boolean(candidate.counterplay)
    && Boolean(candidate.rewards);
}
