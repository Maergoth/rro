import assert from "node:assert/strict";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { LiveService } from "../dist/server/live-service.js";
import { randomUUID } from "node:crypto";

function fixture() {
  const registry = loadContent();
  const db = createDatabase(":memory:", registry);
  const live = new LiveService(db, registry, 10, 5);
  live.ensureNpcShifts();
  const auth = signup(db, registry, { username: `crew_${Date.now()}_${Math.floor(Math.random() * 9999)}`, email: `crew_${Date.now()}_${Math.floor(Math.random() * 9999)}@test.invalid`, displayName: "Crew Tester", password: "Production!234" });
  const shift = live.listShifts()[0];
  const restaurant = db.prepare("SELECT id, region_id FROM restaurants WHERE id = (SELECT restaurant_id FROM service_shifts WHERE id = ?)").get(shift.id);
  db.prepare("INSERT INTO employments (id, character_id, restaurant_id, region_id, role_id, hired_at) VALUES (?, ?, ?, ?, ?, ?)").run(randomUUID(), auth.account.characterId, restaurant.id, restaurant.region_id, "server", Date.now());
  return { registry, db, live, account: auth.account, shift };
}

test("a player takes an NPC duty, performs a three-phase role task, and earns progression", () => {
  const { db, live, account, shift } = fixture();
  try {
    const joined = live.join(account, shift.id, { kind: "employee", roleId: "server" });
    assert.equal(joined.roleId, "server");
    assert.equal(joined.kind, "employee");
    const task = joined.snapshot.tasks.find((value) => value.ownerRoleId === "server");
    assert.ok(task);
    const claim = live.handleCommand(account, { id: "claim-1", type: "task.claim", shiftId: shift.id, payload: { taskId: task.id } });
    assert.equal(claim.offRole, false);
    for (let phase = 0; phase < 3; phase += 1) {
      const snapshot = live.snapshot(shift.id);
      const current = snapshot.tasks.find((value) => value.id === task.id);
      assert.ok(current);
      const result = live.handleCommand(account, { id: `action-${phase}`, type: "task.action", shiftId: shift.id, payload: { taskId: task.id, action: current.phase.actions[0] } });
      assert.ok(result.score >= 70);
      assert.equal(result.completed, phase === 2);
    }
    const completed = db.prepare("SELECT state, action_count, score_total FROM service_tasks WHERE id = ?").get(task.id);
    assert.equal(completed.state, "completed");
    assert.equal(completed.action_count, 3);
    const progress = db.prepare("SELECT xp, tasks_completed FROM role_progress WHERE character_id = ? AND role_id = 'server'").get(account.characterId);
    assert.ok(progress.xp > 0);
    assert.equal(progress.tasks_completed, 1);
  } finally {
    live.stop();
    db.close();
  }
});

test("off-role work is explicit and guest PvP spends money to add fair queue pressure", () => {
  const { db, live, account, shift } = fixture();
  try {
    const joined = live.join(account, shift.id, { kind: "employee", roleId: "cook" });
    const serverTask = joined.snapshot.tasks.find((value) => value.ownerRoleId === "server");
    const claim = live.handleCommand(account, { id: "off-role-claim", type: "task.claim", shiftId: shift.id, payload: { taskId: serverTask.id } });
    assert.equal(claim.offRole, true);
    assert.equal(claim.rolePenalty, 18);
    live.leave(account, shift.id);
    live.join(account, shift.id, { kind: "guest", partySize: 2 });
    const before = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(account.characterId).cash_cents;
    const challenge = live.handleCommand(account, { id: "guest-challenge", type: "guest.challenge", shiftId: shift.id, payload: { challenge: "allergy-declaration" } });
    const after = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(account.characterId).cash_cents;
    assert.equal(challenge.costCents, 500);
    assert.equal(before - after, 500);
    assert.ok(db.prepare("SELECT 1 FROM service_tasks WHERE id = ? AND priority = 100").get(challenge.taskId));
  } finally {
    live.stop();
    db.close();
  }
});
