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

function signupAccount(db, registry, label) {
  const token = randomUUID().slice(0, 8);
  const slug = label.replace(/\W/g, "").slice(0, 8);
  return signup(db, registry, {
    username: `${slug}_${token}`,
    email: `${slug.toLowerCase()}_${token}@test.invalid`,
    displayName: label,
    password: "Production!234",
  }).account;
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

test("off-role work is explicit and legacy guest challenges remain compatible", () => {
  const { registry, db, live, account, shift } = fixture();
  try {
    const joined = live.join(account, shift.id, { kind: "employee", roleId: "cook" });
    const serverTask = joined.snapshot.tasks.find((value) => value.ownerRoleId === "server");
    const claim = live.handleCommand(account, { id: "off-role-claim", type: "task.claim", shiftId: shift.id, payload: { taskId: serverTask.id } });
    assert.equal(claim.offRole, true);
    assert.equal(claim.rolePenalty, 18);

    const target = db.prepare("SELECT restaurant_id, region_id FROM service_shifts s JOIN restaurants r ON r.id = s.restaurant_id WHERE s.id = ?").get(shift.id);
    const origin = db.prepare("SELECT id FROM restaurants WHERE region_id = ? AND id <> ? AND status = 'active' ORDER BY id LIMIT 1").get(target.region_id, target.restaurant_id);
    assert.ok(origin);
    const guest = signupAccount(db, registry, "Rival Guest");
    db.prepare("INSERT INTO employments (id, character_id, restaurant_id, region_id, role_id, hired_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(randomUUID(), guest.characterId, origin.id, target.region_id, "server", Date.now());
    live.join(guest, shift.id, { kind: "guest", partySize: 2 });
    const before = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(guest.characterId).cash_cents;
    const challenge = live.handleCommand(guest, { id: "guest-challenge", type: "guest.challenge", shiftId: shift.id, payload: { challenge: "allergy-declaration" } });
    const after = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(guest.characterId).cash_cents;
    assert.equal(challenge.costCents, 500);
    assert.equal(before - after, 500);
    const challengeTask = db.prepare("SELECT priority, context_json FROM service_tasks WHERE id = ?").get(challenge.taskId);
    assert.equal(challengeTask.priority, 100);
    assert.equal(JSON.parse(challengeTask.context_json).rivalry.challengeId, "allergy-declaration");
    assert.equal(challenge.targetMode, "created-task");
  } finally {
    live.stop();
    db.close();
  }
});

test("joining chooses a walkable spawn outside furniture and zero input stops movement immediately", () => {
  const { registry, db, live, account, shift } = fixture();
  try {
    const joined = live.join(account, shift.id, { kind: "employee", roleId: "server" });
    const presence = joined.snapshot.presences.find((value) => value.characterId === account.characterId);
    assert.ok(presence);
    const restaurantId = joined.restaurantId;
    const restaurant = db.prepare("SELECT build_width, build_height FROM restaurants WHERE id = ?").get(restaurantId);
    assert.ok(presence.x >= 0.35 && presence.x <= restaurant.build_width - 0.35);
    assert.ok(presence.y >= 0.35 && presence.y <= restaurant.build_height - 0.35);
    const floor = db.prepare("SELECT walkable FROM floor_cells WHERE restaurant_id = ? AND grid_x = ? AND grid_y = ?")
      .get(restaurantId, Math.floor(presence.x), Math.floor(presence.y));
    assert.equal(floor?.walkable, 1);
    const objects = db.prepare("SELECT * FROM object_instances WHERE restaurant_id = ?").all(restaurantId);
    for (const object of objects) {
      const definition = registry.furnitureById.get(object.definition_id);
      const width = object.rotation === 90 || object.rotation === 270 ? definition.height : definition.width;
      const height = object.rotation === 90 || object.rotation === 270 ? definition.width : definition.height;
      const overlaps = presence.x > object.grid_x - 0.2 && presence.x < object.grid_x + width + 0.2
        && presence.y > object.grid_y - 0.2 && presence.y < object.grid_y + height + 0.2;
      assert.equal(overlaps, false, `spawn overlapped ${object.definition_id}`);
    }

    live.handleCommand(account, { id: "move-start", type: "move", shiftId: shift.id, payload: { x: 1, y: 0 } });
    live.applyMovement(0.1);
    const moved = db.prepare("SELECT position_x AS x, position_y AS y FROM shift_presences WHERE service_shift_id = ? AND character_id = ?")
      .get(shift.id, account.characterId);
    assert.ok(moved.x > presence.x, "a normal movement tick should leave the safe spawn");
    live.handleCommand(account, { id: "move-stop", type: "move", shiftId: shift.id, payload: { x: 0, y: 0 } });
    live.applyMovement(0.1);
    const stopped = db.prepare("SELECT position_x AS x, position_y AS y, direction_x AS directionX, direction_y AS directionY FROM shift_presences WHERE service_shift_id = ? AND character_id = ?")
      .get(shift.id, account.characterId);
    assert.equal(stopped.x, moved.x);
    assert.equal(stopped.y, moved.y);
    assert.equal(stopped.directionX, 0);
    assert.equal(stopped.directionY, 0);

    db.prepare(`INSERT INTO wall_edges
      (id, restaurant_id, grid_x, grid_y, edge, wall_style_id, opening_type, rotation, updated_at)
      VALUES (?, ?, ?, ?, 'east', 'painted-plaster', 'solid', 0, ?)`)
      .run(randomUUID(), restaurantId, Math.floor(stopped.x), Math.floor(stopped.y), Date.now());
    live.handleCommand(account, { id: "move-wall", type: "move", shiftId: shift.id, payload: { x: 1, y: 0 } });
    live.applyMovement(0.2);
    const wallBlocked = db.prepare("SELECT position_x AS x FROM shift_presences WHERE service_shift_id = ? AND character_id = ?").get(shift.id, account.characterId);
    assert.ok(wallBlocked.x < Math.floor(stopped.x) + 1, "a solid shared edge must block movement");
    db.prepare("UPDATE wall_edges SET opening_type = 'door' WHERE restaurant_id = ? AND grid_x = ? AND grid_y = ? AND edge = 'east'")
      .run(restaurantId, Math.floor(stopped.x), Math.floor(stopped.y));
    live.applyMovement(0.2);
    const doorPassed = db.prepare("SELECT position_x AS x, position_y AS y FROM shift_presences WHERE service_shift_id = ? AND character_id = ?").get(shift.id, account.characterId);
    assert.ok(doorPassed.x > Math.floor(stopped.x) + 1, "a door opening must allow movement");

    live.handleCommand(account, { id: "move-floor-stop", type: "move", shiftId: shift.id, payload: { x: 0, y: 0 } });
    db.prepare("UPDATE floor_cells SET walkable = 0 WHERE restaurant_id = ? AND grid_x = ? AND grid_y = ?")
      .run(restaurantId, Math.floor(doorPassed.x) + 1, Math.floor(doorPassed.y));
    live.handleCommand(account, { id: "move-floor", type: "move", shiftId: shift.id, payload: { x: 1, y: 0 } });
    live.applyMovement(0.2);
    const floorBlocked = db.prepare("SELECT position_x AS x FROM shift_presences WHERE service_shift_id = ? AND character_id = ?").get(shift.id, account.characterId);
    assert.ok(floorBlocked.x < Math.floor(doorPassed.x) + 1, "a non-walkable floor cell must block movement");
  } finally {
    live.stop();
    db.close();
  }
});
