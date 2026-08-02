import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { LiveService } from "../dist/server/live-service.js";
import {
  RIVALRY_CHALLENGES,
  RIVALRY_LIMITS,
  assessRivalryCaps,
  assessRivalryTarget,
  assessRivalryVisit,
  calculateRivalryActionEffect,
  resolveRivalryOutcome,
  selectRivalryChallenge,
} from "../dist/server/rivalry.js";

function signupAccount(db, registry, label) {
  const token = randomUUID().slice(0, 8);
  return signup(db, registry, {
    username: `${label.replace(/\W/g, "").slice(0, 8)}_${token}`,
    email: `${label.replace(/\W/g, "").toLowerCase()}_${token}@test.invalid`,
    displayName: label,
    password: "Production!234",
  }).account;
}

function rivalryFixture({ includeStaff = false } = {}) {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const live = new LiveService(db, registry, 10, 5);
  live.ensureNpcShifts();

  const candidate = live.listShifts().map((shift) => {
    const target = db.prepare("SELECT id, name, region_id FROM restaurants WHERE id = ?").get(shift.restaurantId);
    const origin = db.prepare("SELECT id, name FROM restaurants WHERE region_id = ? AND id <> ? AND status = 'active' ORDER BY id LIMIT 1").get(target.region_id, target.id);
    return origin ? { shift, target, origin } : null;
  }).find(Boolean);
  assert.ok(candidate, "The seed must include two local restaurants for rivalry tests.");

  const guest = signupAccount(db, registry, "Visiting Rival");
  db.prepare("INSERT INTO employments (id, character_id, restaurant_id, region_id, role_id, hired_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(randomUUID(), guest.characterId, candidate.origin.id, candidate.target.region_id, "server", Date.now());
  const guestJoin = live.join(guest, candidate.shift.id, { kind: "guest", partySize: 2 });
  const targetTask = guestJoin.snapshot.tasks.find((task) => task.partyId === guestJoin.partyId);
  assert.ok(targetTask, "Joining as a guest must create a visible party task.");

  let staff = null;
  if (includeStaff) {
    staff = signupAccount(db, registry, "Home Crew");
    db.prepare("INSERT INTO employments (id, character_id, restaurant_id, region_id, role_id, hired_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(randomUUID(), staff.characterId, candidate.target.id, candidate.target.region_id, targetTask.ownerRoleId, Date.now());
    live.join(staff, candidate.shift.id, { kind: "employee", roleId: targetTask.ownerRoleId });
  }

  return {
    registry,
    db,
    live,
    shift: candidate.shift,
    targetRestaurant: candidate.target,
    originRestaurant: candidate.origin,
    guest,
    guestPartyId: guestJoin.partyId,
    targetTask,
    staff,
  };
}

function rivalryMetadata(selection) {
  return {
    schemaVersion: 1,
    status: "active",
    challengeId: selection.challenge.id,
    challengeLabel: selection.challenge.label,
    dimension: selection.dimension.id,
    dimensionLabel: selection.dimension.label,
    intensity: selection.intensity.id,
    intensityRank: selection.intensity.rank,
    costCents: selection.costCents,
    appliedAt: 1,
    source: {
      characterId: "guest",
      displayName: "Guest",
      partyId: "party",
      originRestaurantId: "origin",
      originRestaurantName: "Origin",
      targetRestaurantId: "target",
      targetRestaurantName: "Target",
    },
    target: { taskId: "task", activityId: "activity", activityLabel: "Activity", ownerRoleId: "server" },
    effect: selection.effect,
    telegraph: { visible: true, title: "Visible", message: "Visible challenge" },
    counterplay: { strategy: selection.dimension.counterplay, overcomeScore: selection.intensity.overcomeScore },
    rewards: {
      bonusCashCents: selection.intensity.bonusCashCents,
      bonusXp: selection.intensity.bonusXp,
      reviewBonus: selection.intensity.reviewBonus,
    },
  };
}

test("pure rivalry rules preserve all five challenges and bound dimensions, intensity, costs, visits, targets, and caps", () => {
  assert.deepEqual(Object.keys(RIVALRY_CHALLENGES).sort(), [
    "allergy-declaration",
    "impatient-pace",
    "special-request",
    "split-check",
    "tasting-menu",
  ]);
  const legacyCosts = {
    "special-request": 800,
    "allergy-declaration": 500,
    "split-check": 1200,
    "impatient-pace": 1800,
    "tasting-menu": 2500,
  };
  for (const [challenge, cost] of Object.entries(legacyCosts)) {
    const selection = selectRivalryChallenge(challenge, undefined, undefined);
    assert.equal(selection.ok, true);
    assert.equal(selection.costCents, cost);
    assert.equal(selection.intensity.id, "light");
  }

  const focused = selectRivalryChallenge("allergy-declaration", "memory", 2);
  assert.equal(focused.ok, true);
  assert.equal(focused.dimension.id, "memory-order");
  assert.equal(focused.intensity.id, "focused");
  assert.equal(focused.costCents, 800);
  assert.ok(focused.effect.addedComplexity > 0);
  assert.equal(selectRivalryChallenge("bogus", "precision", 1).code, "unknown-challenge");
  assert.equal(selectRivalryChallenge("allergy-declaration", "luck", 1).code, "invalid-dimension");
  assert.equal(selectRivalryChallenge("allergy-declaration", "precision", 2.5).code, "invalid-intensity");
  assert.equal(selectRivalryChallenge("allergy-declaration", "precision", 4).code, "invalid-intensity");

  assert.equal(assessRivalryVisit({ presenceKind: "guest", originRestaurantId: "a", originRegionId: "local", targetRestaurantId: "b", targetRegionId: "local", ownsTarget: false, employedAtTarget: false }).ok, true);
  assert.equal(assessRivalryVisit({ presenceKind: "employee", originRestaurantId: "a", originRegionId: "local", targetRestaurantId: "b", targetRegionId: "local", ownsTarget: false, employedAtTarget: false }).code, "not-guest");
  assert.equal(assessRivalryVisit({ presenceKind: "guest", originRestaurantId: "a", originRegionId: "local", targetRestaurantId: "b", targetRegionId: "away", ownsTarget: false, employedAtTarget: false }).code, "not-local");
  assert.equal(assessRivalryVisit({ presenceKind: "guest", originRestaurantId: "a", originRegionId: "local", targetRestaurantId: "b", targetRegionId: "local", ownsTarget: false, employedAtTarget: true }).code, "not-a-rival");

  const validTarget = { requestedTaskId: "task", taskShiftId: "shift", activeShiftId: "shift", taskPartyId: "party", sourcePartyId: "party", taskState: "open", actionCount: 0, alreadyModified: false };
  assert.equal(assessRivalryTarget(validTarget).ok, true);
  assert.equal(assessRivalryTarget({ ...validTarget, taskPartyId: "someone-else" }).code, "invalid-target");
  assert.equal(assessRivalryTarget({ ...validTarget, actionCount: 1 }).code, "challenge-in-progress");
  assert.equal(assessRivalryTarget({ ...validTarget, alreadyModified: true }).code, "challenge-stacked");

  const now = 100_000;
  assert.equal(assessRivalryCaps({ now, lastChallengeAt: now - 1, visitCount: 0, partyCount: 0, shiftCount: 0 }).code, "cooldown");
  assert.equal(assessRivalryCaps({ now, lastChallengeAt: null, visitCount: RIVALRY_LIMITS.perVisit, partyCount: 0, shiftCount: 0 }).code, "visit-cap");
  assert.equal(assessRivalryCaps({ now, lastChallengeAt: null, visitCount: 0, partyCount: RIVALRY_LIMITS.perParty, shiftCount: 0 }).code, "party-cap");
  assert.equal(assessRivalryCaps({ now, lastChallengeAt: null, visitCount: 0, partyCount: 0, shiftCount: RIVALRY_LIMITS.perShift }).code, "shift-cap");
});

test("pure counterplay reduces pressure and grants bounded rewards only when the crew overcomes it", () => {
  const selection = selectRivalryChallenge("tasting-menu", "precision", "expert");
  assert.equal(selection.ok, true);
  const metadata = rivalryMetadata(selection);
  const controlled = calculateRivalryActionEffect(metadata, { controlled: true, offRole: false });
  const risky = calculateRivalryActionEffect(metadata, { controlled: false, offRole: false });
  assert.ok(controlled.scorePenalty < risky.scorePenalty);
  assert.equal(controlled.mitigated, true);
  const win = resolveRivalryOutcome(metadata, { scores: [88, 86, 84], controlledActions: 3, totalActions: 3 });
  assert.equal(win.overcome, true);
  assert.equal(win.bonusCashCents, 550);
  assert.equal(win.reviewBonus, 2);
  const loss = resolveRivalryOutcome(metadata, { scores: [88, 86, 84], controlledActions: 2, totalActions: 3 });
  assert.equal(loss.overcome, false);
  assert.equal(loss.bonusCashCents, 0);
  assert.equal(loss.reviewBonus, 0);
});

test("a visiting rival spends personal money on a visible targeted modifier and staff can overcome it for bonus reward and review evidence", () => {
  const { db, live, shift, guest, guestPartyId, targetTask, staff, originRestaurant, targetRestaurant } = rivalryFixture({ includeStaff: true });
  try {
    const guestBefore = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(guest.characterId).cash_cents;
    const result = live.handleCommand(guest, {
      id: "targeted-rivalry",
      type: "guest.challenge",
      shiftId: shift.id,
      payload: { challenge: "allergy-declaration", targetTaskId: targetTask.id, dimension: "precision", intensity: "focused" },
    });
    const guestAfter = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(guest.characterId).cash_cents;
    assert.equal(result.costCents, 800);
    assert.equal(guestBefore - guestAfter, 800);
    assert.equal(result.taskId, targetTask.id);
    assert.equal(result.targetMode, "selected-task");
    assert.equal(result.dimension, "precision");
    assert.equal(result.intensity, "focused");
    assert.equal(result.telegraph.visible, true);
    assert.match(result.telegraph.message, new RegExp(originRestaurant.name));

    const taskRow = db.prepare("SELECT context_json, due_at, priority FROM service_tasks WHERE id = ?").get(targetTask.id);
    const context = JSON.parse(taskRow.context_json);
    assert.equal(context.rivalry.source.characterId, guest.characterId);
    assert.equal(context.rivalry.source.partyId, guestPartyId);
    assert.equal(context.rivalry.source.targetRestaurantId, targetRestaurant.id);
    assert.equal(context.rivalry.target.taskId, targetTask.id);
    assert.equal(context.rivalry.counterplay.overcomeScore, 76);
    assert.ok(context.rivalry.rewards.bonusCashCents > 0);
    assert.ok(live.snapshot(shift.id).tasks.find((task) => task.id === targetTask.id).rivalry.telegraph.visible);

    const ledger = db.prepare("SELECT * FROM ledger_entries WHERE category = 'rivalry-challenge-spend' AND reference_id = ?").get(targetTask.id);
    assert.equal(ledger.character_id, guest.characterId);
    assert.equal(ledger.restaurant_id, targetRestaurant.id);
    assert.equal(ledger.amount_cents, -800);

    const staffBefore = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(staff.characterId).cash_cents;
    live.handleCommand(staff, { id: "staff-claim", type: "task.claim", shiftId: shift.id, payload: { taskId: targetTask.id } });
    let finalResult = null;
    for (let phase = 0; phase < 3; phase += 1) {
      const current = live.snapshot(shift.id).tasks.find((task) => task.id === targetTask.id);
      assert.ok(current);
      finalResult = live.handleCommand(staff, { id: `staff-action-${phase}`, type: "task.action", shiftId: shift.id, payload: { taskId: targetTask.id, action: current.phase.actions[0] } });
      assert.equal(finalResult.rivalry.mitigated, true);
    }
    assert.equal(finalResult.completed, true);
    assert.equal(finalResult.rivalry.resolution.overcome, true);
    assert.equal(finalResult.rivalry.resolution.bonusCashCents, 325);
    const completed = db.prepare("SELECT context_json FROM service_tasks WHERE id = ?").get(targetTask.id);
    assert.equal(JSON.parse(completed.context_json).rivalry.status, "overcome");
    const staffAfter = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(staff.characterId).cash_cents;
    assert.ok(staffAfter - staffBefore >= 325);
    assert.ok(db.prepare("SELECT 1 FROM review_evidence WHERE source_task_id = ? AND fact LIKE '%overcame%'").get(targetTask.id));
  } finally {
    live.stop();
    db.close();
  }
});

test("server rejects invalid intensity, other-party targets, stacking, cooldown, visit caps, and party caps without extra spend", () => {
  const { db, live, shift, guest, guestPartyId, targetTask } = rivalryFixture();
  try {
    const startingCash = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(guest.characterId).cash_cents;
    assert.throws(() => live.handleCommand(guest, {
      id: "invalid-intensity",
      type: "guest.challenge",
      shiftId: shift.id,
      payload: { challenge: "special-request", targetTaskId: targetTask.id, dimension: "precision", intensity: 99 },
    }), /Intensity must be/);
    assert.equal(db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(guest.characterId).cash_cents, startingCash);

    const otherPartyTask = live.snapshot(shift.id).tasks.find((task) => task.partyId && task.partyId !== guestPartyId);
    assert.ok(otherPartyTask);
    assert.throws(() => live.handleCommand(guest, {
      id: "invalid-target",
      type: "guest.challenge",
      shiftId: shift.id,
      payload: { challenge: "special-request", targetTaskId: otherPartyTask.id, dimension: "precision", intensity: 1 },
    }), /own visible party request/);

    live.handleCommand(guest, {
      id: "first-valid",
      type: "guest.challenge",
      shiftId: shift.id,
      payload: { challenge: "special-request", targetTaskId: targetTask.id, dimension: "precision", intensity: 1 },
    });
    const afterFirst = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(guest.characterId).cash_cents;
    assert.throws(() => live.handleCommand(guest, {
      id: "cooldown-block",
      type: "guest.challenge",
      shiftId: shift.id,
      payload: { challenge: "split-check" },
    }), /cooldown/);
    assert.equal(db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(guest.characterId).cash_cents, afterFirst);

    db.prepare("UPDATE command_log SET created_at = 0 WHERE character_id = ? AND command_type = 'guest.challenge'").run(guest.characterId);
    db.prepare("UPDATE shift_presences SET joined_at = 0 WHERE service_shift_id = ? AND character_id = ?").run(shift.id, guest.characterId);
    assert.throws(() => live.handleCommand(guest, {
      id: "stack-block",
      type: "guest.challenge",
      shiftId: shift.id,
      payload: { challenge: "split-check", targetTaskId: targetTask.id, dimension: "interruptions", intensity: 1 },
    }), /already has a rival modifier/);
    assert.equal(db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(guest.characterId).cash_cents, afterFirst);

    live.handleCommand(guest, { id: "second-valid", type: "guest.challenge", shiftId: shift.id, payload: { challenge: "split-check" } });
    db.prepare("UPDATE command_log SET created_at = 0 WHERE character_id = ? AND command_type = 'guest.challenge'").run(guest.characterId);
    assert.throws(() => live.handleCommand(guest, { id: "visit-cap", type: "guest.challenge", shiftId: shift.id, payload: { challenge: "tasting-menu" } }), /per visit/);

    live.leave(guest, shift.id);
    live.join(guest, shift.id, { kind: "guest", partySize: 2 });
    db.prepare("UPDATE command_log SET created_at = 0 WHERE character_id = ? AND command_type = 'guest.challenge'").run(guest.characterId);
    live.handleCommand(guest, { id: "third-valid", type: "guest.challenge", shiftId: shift.id, payload: { challenge: "tasting-menu" } });
    db.prepare("UPDATE command_log SET created_at = 0 WHERE character_id = ? AND command_type = 'guest.challenge'").run(guest.characterId);
    live.leave(guest, shift.id);
    live.join(guest, shift.id, { kind: "guest", partySize: 2 });
    assert.throws(() => live.handleCommand(guest, { id: "party-cap", type: "guest.challenge", shiftId: shift.id, payload: { challenge: "impatient-pace" } }), /guest party/);
  } finally {
    live.stop();
    db.close();
  }
});

test("a worker cannot challenge their own workplace even after joining it as a guest", () => {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const live = new LiveService(db, registry, 10, 5);
  live.ensureNpcShifts();
  const shift = live.listShifts()[0];
  const target = db.prepare("SELECT id, region_id FROM restaurants WHERE id = ?").get(shift.restaurantId);
  const account = signupAccount(db, registry, "Inside Worker");
  db.prepare("INSERT INTO employments (id, character_id, restaurant_id, region_id, role_id, hired_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(randomUUID(), account.characterId, target.id, target.region_id, "server", Date.now());
  try {
    live.join(account, shift.id, { kind: "guest", partySize: 1 });
    assert.throws(() => live.handleCommand(account, { id: "self-challenge", type: "guest.challenge", shiftId: shift.id, payload: { challenge: "special-request" } }), /another local restaurant|Work at or own/);
  } finally {
    live.stop();
    db.close();
  }
});
