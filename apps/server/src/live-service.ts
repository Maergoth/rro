import { EventEmitter } from "node:events";
import type { ContentRegistry } from "./content.js";
import { newId, transaction } from "./database.js";
import { ensureLayout, getLayout } from "./layout-service.js";
import { ApiError, type AuthenticatedAccount, type CommandEnvelope, type Database, type Snapshot } from "./types.js";

const SHIFT_DURATION_MS = 4 * 60 * 60 * 1000;
const PARTY_INTERVAL_MS = 30_000;
const TASK_DUE_MS = 75_000;
const ROLE_SLOT_COUNTS: Record<string, number> = {
  manager: 1,
  owner: 1,
  server: 2,
  dishwasher: 1,
  chef: 1,
  cook: 2,
  "host-busser": 2,
};

const PARTY_CHAIN = [
  "host-busser-arrival-dialogue",
  "server-contextual-greeting",
  "server-beverage-discovery",
  "server-menu-interview",
  "server-seat-order",
  "cook-heat-control",
  "chef-plate-inspection",
  "server-delivery-seat-match",
  "server-two-bite-check",
  "server-dessert-check-read",
  "server-split-payment",
  "host-busser-reset-sequence",
];

const DIMENSION_BY_ROLE: Record<string, string> = {
  manager: "service",
  owner: "value",
  server: "service",
  dishwasher: "cleanliness",
  chef: "food",
  cook: "food",
  "host-busser": "ambience",
};

type MoveIntent = { shiftId: string; characterId: string; x: number; y: number; at: number };

function json<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function cleanNote(value: unknown): string {
  return String(value ?? "").replace(/[<>\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, 300);
}

function activeShift(db: Database, shiftId: string): any {
  const row = db.prepare("SELECT * FROM service_shifts WHERE id = ? AND state IN ('crew-call', 'open', 'closing')").get(shiftId);
  if (!row) throw new ApiError(404, "Live shift not found.");
  return row;
}

function presence(db: Database, shiftId: string, characterId: string): any {
  const row = db.prepare("SELECT * FROM shift_presences WHERE service_shift_id = ? AND character_id = ? AND left_at IS NULL").get(shiftId, characterId);
  if (!row) throw new ApiError(403, "Join this shift before sending live commands.");
  return row;
}

function publicRestaurantRow(row: any): Record<string, unknown> {
  return {
    id: row.id,
    regionId: row.region_id,
    name: row.name,
    concept: row.concept,
    style: row.style,
    status: row.status,
    rating: row.rating,
    sanitation: row.sanitation,
    treasuryCents: row.treasury_cents,
    buildWidth: row.build_width,
    buildHeight: row.build_height,
    generation: row.generation,
    isNpc: Boolean(row.is_npc),
    ownerCharacterId: row.owner_character_id,
  };
}

export class LiveService extends EventEmitter {
  private readonly moveIntents = new Map<string, MoveIntent>();
  private timer: NodeJS.Timeout | null = null;
  private lastTick = Date.now();
  private simulationAccumulator = 0;
  private snapshotAccumulator = 0;
  private spawnAccumulator = 0;
  private ecologyAccumulator = 0;

  constructor(
    private readonly db: Database,
    private readonly registry: ContentRegistry,
    private readonly tickRate: number,
    private readonly snapshotRate: number,
  ) {
    super();
  }

  start(autoOpenNpcShifts = true): void {
    if (this.timer) return;
    if (autoOpenNpcShifts) this.ensureNpcShifts();
    this.lastTick = Date.now();
    this.timer = setInterval(() => this.tick(), Math.round(1000 / this.tickRate));
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  ensureNpcShifts(): void {
    const rows = this.db.prepare(`
      SELECT r.id FROM restaurants r
      WHERE r.status = 'active' AND r.is_npc = 1
        AND r.id = (SELECT candidate.id FROM restaurants candidate WHERE candidate.region_id = r.region_id AND candidate.status = 'active' AND candidate.is_npc = 1 ORDER BY candidate.opened_at, candidate.id LIMIT 1)
      ORDER BY r.region_id
    `).all() as any[];
    for (const row of rows) {
      const existing = this.db.prepare("SELECT id FROM service_shifts WHERE restaurant_id = ? AND state IN ('crew-call', 'open', 'closing')").get(row.id);
      if (!existing) this.openShift(row.id, null);
    }
  }

  listWorld(): Record<string, unknown> {
    const countries = this.db.prepare("SELECT * FROM countries ORDER BY name").all() as any[];
    const now = Date.now();
    const activeEvents = this.registry.content.events.filter((event) => Date.parse(event.startsAt) <= now && Date.parse(event.endsAt) >= now);
    return {
      activeEvents,
      countries: countries.map((country) => ({
        id: country.id,
        name: country.name,
        code: country.code,
        flag: country.flag,
        x: country.map_x,
        y: country.map_y,
        regions: (this.db.prepare(`
          SELECT rg.*,
            (SELECT COUNT(*) FROM restaurants rr WHERE rr.region_id = rg.id AND rr.status = 'active') AS restaurant_count,
            (SELECT COUNT(*) FROM service_shifts ss JOIN restaurants rr ON rr.id = ss.restaurant_id WHERE rr.region_id = rg.id AND ss.state IN ('crew-call','open','closing')) AS live_shifts
          FROM regions rg WHERE rg.country_id = ? ORDER BY rg.name
        `).all(country.id) as any[]).map((region) => {
          const resources = json<Record<string, number>>(region.resources_json, {});
          let demand = region.demand as number;
          for (const event of activeEvents) {
            demand += event.modifiers.demand ?? 0;
            for (const key of Object.keys(resources)) resources[key] = Math.max(0, Math.min(100, resources[key]! + (event.modifiers[key] ?? 0)));
          }
          return {
            id: region.id,
            name: region.name,
            capacity: region.capacity,
            demand: Math.max(0, Math.min(100, demand)),
            costIndex: region.cost_index,
            resources,
            restaurantCount: region.restaurant_count,
            liveShifts: region.live_shifts,
          };
        }),
      })),
    };
  }

  listRestaurants(regionId: string): Array<Record<string, unknown>> {
    const rows = this.db.prepare(`
      SELECT r.*,
        s.id AS live_shift_id, s.state AS shift_state, s.opened_at AS shift_opened_at, s.closes_at AS shift_closes_at,
        (SELECT COUNT(*) FROM duty_slots d WHERE d.service_shift_id = s.id AND d.staffing = 'npc') AS open_duty_slots,
        (SELECT COUNT(*) FROM restaurant_reviews rv WHERE rv.restaurant_id = r.id) AS review_count
      FROM restaurants r
      LEFT JOIN service_shifts s ON s.restaurant_id = r.id AND s.state IN ('crew-call','open','closing')
      WHERE r.region_id = ? AND r.status = 'active'
      ORDER BY s.id IS NOT NULL DESC, r.rating DESC, r.name
    `).all(regionId) as any[];
    return rows.map((row) => ({
      ...publicRestaurantRow(row),
      reviewCount: row.review_count,
      liveShift: row.live_shift_id ? { id: row.live_shift_id, state: row.shift_state, openedAt: row.shift_opened_at, closesAt: row.shift_closes_at, openDutySlots: row.open_duty_slots } : null,
    }));
  }

  getRestaurant(restaurantId: string): Record<string, unknown> {
    const row = this.db.prepare(`
      SELECT r.*, rg.name AS region_name, c.name AS country_name,
        s.id AS live_shift_id, s.state AS shift_state, s.opened_at AS shift_opened_at, s.closes_at AS shift_closes_at
      FROM restaurants r JOIN regions rg ON rg.id = r.region_id JOIN countries c ON c.id = rg.country_id
      LEFT JOIN service_shifts s ON s.restaurant_id = r.id AND s.state IN ('crew-call','open','closing')
      WHERE r.id = ? AND r.status = 'active'
    `).get(restaurantId) as any;
    if (!row) throw new ApiError(404, "Restaurant not found.");
    const applications = this.db.prepare("SELECT role_id, status, COUNT(*) AS count FROM employment_applications WHERE restaurant_id = ? GROUP BY role_id, status").all(restaurantId);
    const reviews = this.db.prepare("SELECT id, rating, dimensions_json AS dimensions, summary, created_at AS createdAt FROM restaurant_reviews WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 10").all(restaurantId) as any[];
    return {
      ...publicRestaurantRow(row),
      regionName: row.region_name,
      countryName: row.country_name,
      liveShift: row.live_shift_id ? { id: row.live_shift_id, state: row.shift_state, openedAt: row.shift_opened_at, closesAt: row.shift_closes_at } : null,
      applications,
      reviews: reviews.map((review) => ({ ...review, dimensions: json(review.dimensions, {}) })),
    };
  }

  apply(account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): Record<string, unknown> {
    const roleId = String(body.roleId ?? "");
    const role = this.registry.roleById.get(roleId);
    if (!role || role.employmentMode !== "job") throw new ApiError(400, "Choose an employable role.");
    if (!this.db.prepare("SELECT 1 FROM restaurants WHERE id = ? AND status = 'active'").get(restaurantId)) throw new ApiError(404, "Restaurant not found.");
    const id = newId("application");
    const now = Date.now();
    this.db.prepare(`INSERT INTO employment_applications (id, restaurant_id, character_id, role_id, note, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
      ON CONFLICT(restaurant_id, character_id, role_id) DO UPDATE SET note = excluded.note, status = 'pending', submitted_at = excluded.submitted_at, decided_at = NULL`)
      .run(id, restaurantId, account.characterId, roleId, cleanNote(body.note), now);
    return { id, restaurantId, roleId, status: "pending", submittedAt: now };
  }

  openShift(restaurantId: string, account: AuthenticatedAccount | null): Record<string, unknown> {
    const restaurant = this.db.prepare("SELECT * FROM restaurants WHERE id = ? AND status = 'active'").get(restaurantId) as any;
    if (!restaurant) throw new ApiError(404, "Restaurant not found.");
    if (account && restaurant.owner_character_id !== account.characterId) throw new ApiError(403, "Only the owner can open this restaurant's shift.");
    const existing = this.db.prepare("SELECT id FROM service_shifts WHERE restaurant_id = ? AND state IN ('crew-call','open','closing')").get(restaurantId) as any;
    if (existing) return this.shiftSummary(existing.id);
    ensureLayout(this.db, this.registry, restaurantId);
    const id = newId("shift");
    const now = Date.now();
    transaction(this.db, () => {
      this.db.prepare("INSERT INTO service_shifts (id, restaurant_id, opened_by_character_id, state, opened_at, closes_at) VALUES (?, ?, ?, 'open', ?, ?)")
        .run(id, restaurantId, account?.characterId ?? null, now, now + SHIFT_DURATION_MS);
      const insertSlot = this.db.prepare("INSERT INTO duty_slots (id, service_shift_id, role_id, slot_index, label, staffing, handoff_state, workload, updated_at) VALUES (?, ?, ?, ?, ?, 'npc', 'steady', 50, ?)");
      for (const role of this.registry.content.roles.filter((entry) => entry.kind === "base")) {
        const count = ROLE_SLOT_COUNTS[role.id] ?? 1;
        for (let index = 0; index < count; index += 1) insertSlot.run(newId("duty"), id, role.id, index, `${role.label} ${index + 1}`, now);
      }
    });
    this.createParty(id, "npc", null, 2);
    this.createParty(id, "npc", null, 3);
    this.fillRoleQueues(id);
    return this.shiftSummary(id);
  }

  listShifts(regionId?: string): Array<Record<string, unknown>> {
    const rows = (regionId ? this.db.prepare(`
      SELECT s.*, r.name AS restaurant_name, r.region_id, r.rating, r.sanitation,
        (SELECT COUNT(*) FROM duty_slots d WHERE d.service_shift_id = s.id AND d.staffing = 'npc') AS open_slots,
        (SELECT COUNT(*) FROM shift_presences p WHERE p.service_shift_id = s.id AND p.left_at IS NULL) AS players
      FROM service_shifts s JOIN restaurants r ON r.id = s.restaurant_id
      WHERE s.state IN ('crew-call','open','closing') AND r.region_id = ? ORDER BY s.opened_at DESC
    `).all(regionId) : this.db.prepare(`
      SELECT s.*, r.name AS restaurant_name, r.region_id, r.rating, r.sanitation,
        (SELECT COUNT(*) FROM duty_slots d WHERE d.service_shift_id = s.id AND d.staffing = 'npc') AS open_slots,
        (SELECT COUNT(*) FROM shift_presences p WHERE p.service_shift_id = s.id AND p.left_at IS NULL) AS players
      FROM service_shifts s JOIN restaurants r ON r.id = s.restaurant_id
      WHERE s.state IN ('crew-call','open','closing') ORDER BY s.opened_at DESC
    `).all()) as any[];
    return rows.map((row) => ({ id: row.id, restaurantId: row.restaurant_id, restaurantName: row.restaurant_name, regionId: row.region_id, state: row.state, openedAt: row.opened_at, closesAt: row.closes_at, rating: row.rating, sanitation: row.sanitation, openSlots: row.open_slots, players: row.players }));
  }

  shiftSummary(shiftId: string): Record<string, unknown> {
    const row = this.db.prepare("SELECT s.*, r.name AS restaurant_name, r.region_id FROM service_shifts s JOIN restaurants r ON r.id = s.restaurant_id WHERE s.id = ?").get(shiftId) as any;
    if (!row) throw new ApiError(404, "Shift not found.");
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      restaurantName: row.restaurant_name,
      regionId: row.region_id,
      state: row.state,
      openedAt: row.opened_at,
      closesAt: row.closes_at,
      version: row.version,
      dutySlots: this.db.prepare("SELECT id, role_id AS roleId, slot_index AS slotIndex, label, occupant_character_id AS occupantCharacterId, staffing, handoff_state AS handoffState, workload FROM duty_slots WHERE service_shift_id = ? ORDER BY role_id, slot_index").all(shiftId),
    };
  }

  join(account: AuthenticatedAccount, shiftId: string, body: Record<string, unknown>): Record<string, unknown> {
    const shift = activeShift(this.db, shiftId);
    const kind = String(body.kind ?? "employee");
    if (kind !== "employee" && kind !== "guest") throw new ApiError(400, "Join as employee or guest.");
    const now = Date.now();
    let roleId: string | null = null;
    let dutySlotId: string | null = null;
    let partyId: string | null = null;
    transaction(this.db, () => {
      const prior = this.db.prepare("SELECT * FROM shift_presences WHERE service_shift_id = ? AND character_id = ?").get(shiftId, account.characterId) as any;
      if (prior?.duty_slot_id) this.releaseDutySlot(prior.duty_slot_id);
      if (kind === "employee") {
        const selected = this.registry.roleById.get(String(body.roleId ?? ""));
        if (!selected) throw new ApiError(400, "Choose a valid role.");
        roleId = selected.parentRoleId ?? selected.id;
        const slot = this.db.prepare("SELECT * FROM duty_slots WHERE service_shift_id = ? AND role_id = ? AND staffing = 'npc' ORDER BY slot_index LIMIT 1").get(shiftId, roleId) as any;
        if (!slot) throw new ApiError(409, "Every slot for that role is currently player-staffed.");
        dutySlotId = slot.id;
        this.db.prepare("UPDATE duty_slots SET occupant_character_id = ?, staffing = 'player', handoff_state = 'joining', joined_at = ?, updated_at = ? WHERE id = ?")
          .run(account.characterId, now, now, slot.id);
        this.db.prepare("UPDATE characters SET active_role_id = ? WHERE id = ?").run(String(body.roleId), account.characterId);
      } else {
        const existingParty = this.db.prepare("SELECT id FROM parties WHERE service_shift_id = ? AND guest_character_id = ? AND departed_at IS NULL").get(shiftId, account.characterId) as any;
        partyId = existingParty?.id ?? this.createParty(shiftId, "player", account.characterId, Math.max(1, Math.min(6, Number(body.partySize) || 2)));
      }
      this.db.prepare(`INSERT INTO shift_presences
        (service_shift_id, character_id, kind, role_id, duty_slot_id, position_x, position_y, joined_at, last_seen_at, left_at)
        VALUES (?, ?, ?, ?, ?, 2.5, 2.5, ?, ?, NULL)
        ON CONFLICT(service_shift_id, character_id) DO UPDATE SET kind = excluded.kind, role_id = excluded.role_id, duty_slot_id = excluded.duty_slot_id, position_x = 2.5, position_y = 2.5, joined_at = excluded.joined_at, last_seen_at = excluded.last_seen_at, left_at = NULL`)
        .run(shiftId, account.characterId, kind, roleId, dutySlotId, now, now);
      this.bump(shiftId);
    });
    this.emitSnapshot(shiftId);
    return { shiftId, restaurantId: shift.restaurant_id, kind, roleId, dutySlotId, partyId, snapshot: this.snapshot(shiftId) };
  }

  leave(account: AuthenticatedAccount, shiftId: string): void {
    const current = presence(this.db, shiftId, account.characterId);
    transaction(this.db, () => {
      if (current.duty_slot_id) this.releaseDutySlot(current.duty_slot_id);
      this.db.prepare("UPDATE shift_presences SET left_at = ?, last_seen_at = ? WHERE service_shift_id = ? AND character_id = ?")
        .run(Date.now(), Date.now(), shiftId, account.characterId);
      this.db.prepare("UPDATE service_tasks SET claimed_by_character_id = NULL, state = 'open', updated_at = ? WHERE service_shift_id = ? AND claimed_by_character_id = ? AND state = 'claimed'")
        .run(Date.now(), shiftId, account.characterId);
      this.bump(shiftId);
    });
    this.moveIntents.delete(`${shiftId}:${account.characterId}`);
    this.emitSnapshot(shiftId);
  }

  handleCommand(account: AuthenticatedAccount, command: CommandEnvelope): Record<string, unknown> {
    if (!command.id || command.id.length > 100) throw new ApiError(400, "Every command needs a bounded idempotency id.");
    const shiftId = String(command.shiftId ?? "");
    activeShift(this.db, shiftId);
    const current = presence(this.db, shiftId, account.characterId);
    const cached = this.db.prepare("SELECT result_json FROM command_log WHERE character_id = ? AND command_id = ?").get(account.characterId, command.id) as any;
    if (cached) return json(cached.result_json, {});
    const payload = command.payload ?? {};
    let result: Record<string, unknown>;
    switch (command.type) {
      case "move": result = this.move(current, shiftId, account.characterId, payload); break;
      case "task.claim": result = this.claimTask(account, current, shiftId, payload); break;
      case "task.action": result = this.actOnTask(account, current, shiftId, payload); break;
      case "guest.challenge": result = this.guestChallenge(account, current, shiftId, payload); break;
      default: throw new ApiError(400, `Unknown command type ${command.type}.`);
    }
    if (command.type !== "move") {
      this.db.prepare("INSERT INTO command_log (service_shift_id, character_id, command_id, command_type, payload_json, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(shiftId, account.characterId, command.id, command.type, JSON.stringify(payload), JSON.stringify(result), Date.now());
    }
    return result;
  }

  snapshot(shiftId: string): Snapshot {
    const shift = this.db.prepare("SELECT * FROM service_shifts WHERE id = ?").get(shiftId) as any;
    if (!shift) throw new ApiError(404, "Shift not found.");
    const restaurant = this.db.prepare("SELECT * FROM restaurants WHERE id = ?").get(shift.restaurant_id) as any;
    return {
      protocol: "rro.v1",
      shift: { id: shift.id, restaurantId: shift.restaurant_id, state: shift.state, serviceMode: shift.service_mode, openedAt: shift.opened_at, closesAt: shift.closes_at, version: shift.version },
      restaurant: publicRestaurantRow(restaurant),
      layout: getLayout(this.db, this.registry, shift.restaurant_id),
      dutySlots: this.db.prepare("SELECT id, role_id AS roleId, slot_index AS slotIndex, label, occupant_character_id AS occupantCharacterId, staffing, handoff_state AS handoffState, workload FROM duty_slots WHERE service_shift_id = ? ORDER BY role_id, slot_index").all(shiftId) as any[],
      presences: this.db.prepare(`SELECT p.character_id AS characterId, c.name, p.kind, p.role_id AS roleId, p.duty_slot_id AS dutySlotId,
        p.position_x AS x, p.position_y AS y, p.direction_x AS directionX, p.direction_y AS directionY,
        c.primary_color AS primaryColor, c.secondary_color AS secondaryColor, c.outfit
        FROM shift_presences p JOIN characters c ON c.id = p.character_id WHERE p.service_shift_id = ? AND p.left_at IS NULL`).all(shiftId) as any[],
      parties: (this.db.prepare("SELECT * FROM parties WHERE service_shift_id = ? AND departed_at IS NULL ORDER BY created_at").all(shiftId) as any[]).map((row) => ({ id: row.id, guestCharacterId: row.guest_character_id, kind: row.party_kind, size: row.size, state: row.state, servicePhase: row.service_phase, tableLabel: row.table_label, satisfaction: row.satisfaction, patience: row.patience, occasion: row.occasion, traits: json(row.traits_json, []) })),
      tasks: (this.db.prepare("SELECT * FROM service_tasks WHERE service_shift_id = ? AND state IN ('open','claimed') ORDER BY priority DESC, due_at").all(shiftId) as any[]).map((row) => this.publicTask(row)),
      incidents: (this.db.prepare("SELECT * FROM incidents WHERE service_shift_id = ? AND state <> 'resolved' ORDER BY severity DESC, created_at").all(shiftId) as any[]).map((row) => ({ id: row.id, partyId: row.party_id, type: row.incident_type, state: row.state, severity: row.severity, x: row.position_x, y: row.position_y, cause: json(row.cause_json, {}), createdAt: row.created_at })),
      serverTime: Date.now(),
      version: shift.version,
    };
  }

  private publicTask(row: any): Record<string, unknown> {
    const activity = this.registry.activityById.get(row.activity_id);
    return {
      id: row.id,
      partyId: row.party_id,
      incidentId: row.incident_id,
      activityId: row.activity_id,
      label: activity?.label ?? row.activity_id,
      grammar: activity?.grammar ?? "process",
      ownerRoleId: row.owner_role_id,
      lane: row.lane,
      priority: row.priority,
      state: row.state,
      phaseIndex: row.phase_index,
      phase: activity?.phases[row.phase_index] ?? null,
      phaseCount: activity?.phases.length ?? 0,
      claimedByCharacterId: row.claimed_by_character_id,
      scoreTotal: row.score_total,
      actionCount: row.action_count,
      context: json(row.context_json, {}),
      createdAt: row.created_at,
      dueAt: row.due_at,
    };
  }

  private releaseDutySlot(slotId: string): void {
    this.db.prepare("UPDATE duty_slots SET occupant_character_id = NULL, staffing = 'npc', handoff_state = 'leaving', joined_at = NULL, updated_at = ? WHERE id = ?")
      .run(Date.now(), slotId);
  }

  private move(_current: any, shiftId: string, characterId: string, payload: Record<string, unknown>): Record<string, unknown> {
    let x = Number(payload.x ?? 0);
    let y = Number(payload.y ?? 0);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new ApiError(400, "Movement input must be finite.");
    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) { x /= magnitude; y /= magnitude; }
    this.moveIntents.set(`${shiftId}:${characterId}`, { shiftId, characterId, x, y, at: Date.now() });
    return { accepted: true, x, y };
  }

  private claimTask(account: AuthenticatedAccount, current: any, shiftId: string, payload: Record<string, unknown>): Record<string, unknown> {
    if (current.kind !== "employee") throw new ApiError(403, "Guests cannot claim employee work.");
    const task = this.db.prepare("SELECT * FROM service_tasks WHERE id = ? AND service_shift_id = ? AND state IN ('open','claimed')").get(String(payload.taskId ?? ""), shiftId) as any;
    if (!task) throw new ApiError(404, "Available task not found.");
    if (task.claimed_by_character_id && task.claimed_by_character_id !== account.characterId) throw new ApiError(409, "A coworker already owns this task.");
    const offRole = current.role_id !== task.owner_role_id;
    const context = { ...json(task.context_json, {}), offRole, claimedRoleId: current.role_id, rolePenalty: offRole ? 18 : 0 };
    this.db.prepare("UPDATE service_tasks SET state = 'claimed', claimed_by_character_id = ?, context_json = ?, updated_at = ? WHERE id = ?")
      .run(account.characterId, JSON.stringify(context), Date.now(), task.id);
    this.bump(shiftId);
    this.emitSnapshot(shiftId);
    return { taskId: task.id, claimed: true, offRole, rolePenalty: offRole ? 18 : 0 };
  }

  private actOnTask(account: AuthenticatedAccount, current: any, shiftId: string, payload: Record<string, unknown>): Record<string, unknown> {
    if (current.kind !== "employee") throw new ApiError(403, "Guests influence service through guest challenges, not employee task controls.");
    const task = this.db.prepare("SELECT * FROM service_tasks WHERE id = ? AND service_shift_id = ? AND state IN ('open','claimed')").get(String(payload.taskId ?? ""), shiftId) as any;
    if (!task) throw new ApiError(404, "Available task not found.");
    if (task.claimed_by_character_id && task.claimed_by_character_id !== account.characterId) throw new ApiError(409, "A coworker owns this task.");
    const activity = this.registry.activityById.get(task.activity_id);
    if (!activity) throw new ApiError(409, "The task's activity content is unavailable.");
    const phase = activity.phases[task.phase_index];
    if (!phase) throw new ApiError(409, "The task phase is invalid.");
    const action = String(payload.action ?? "");
    const actionIndex = phase.actions.indexOf(action);
    if (actionIndex < 0) throw new ApiError(400, "Choose one of the current phase actions.");
    const now = Date.now();
    const context = { ...json<Record<string, unknown>>(task.context_json, {}) };
    const offRole = current.role_id !== task.owner_role_id;
    const attributeBonus = this.attributeBonus(account.characterId, task.owner_role_id);
    const latePenalty = Math.min(28, Math.max(0, Math.floor((now - task.due_at) / 5000) * 3));
    const score = Math.max(5, Math.min(100, (actionIndex === 0 ? 88 : 43) + attributeBonus - latePenalty - (offRole ? 18 : 0)));
    const history = json<any[]>(task.history_json, []);
    history.push({ phaseId: phase.id, action, score, at: now, characterId: account.characterId, offRole });
    const finalPhase = task.phase_index + 1 >= activity.phases.length;
    transaction(this.db, () => {
      this.db.prepare(`UPDATE service_tasks SET state = ?, phase_index = ?, claimed_by_character_id = ?, score_total = score_total + ?,
        action_count = action_count + 1, context_json = ?, history_json = ?, updated_at = ?, completed_at = ? WHERE id = ?`)
        .run(finalPhase ? "completed" : "claimed", finalPhase ? task.phase_index : task.phase_index + 1, account.characterId, score, JSON.stringify({ ...context, offRole, rolePenalty: offRole ? 18 : 0 }), JSON.stringify(history), now, finalPhase ? now : null, task.id);
      if (finalPhase) this.finishTask(task, activity, account.characterId, Math.round((task.score_total + score) / (task.action_count + 1)), actionIndex > 0);
      this.bump(shiftId);
    });
    if (!finalPhase && actionIndex > 0 && ["route", "precision", "process"].includes(activity.grammar)) this.maybeCreateIncident(shiftId, task.party_id, task.id, activity.grammar, score);
    this.emitSnapshot(shiftId);
    return { taskId: task.id, phaseId: phase.id, score, outcome: actionIndex === 0 ? "controlled" : "risky", completed: finalPhase, nextPhaseIndex: finalPhase ? null : task.phase_index + 1 };
  }

  private guestChallenge(account: AuthenticatedAccount, current: any, shiftId: string, payload: Record<string, unknown>): Record<string, unknown> {
    if (current.kind !== "guest") throw new ApiError(403, "Only a seated guest may create a service challenge.");
    const party = this.db.prepare("SELECT * FROM parties WHERE service_shift_id = ? AND guest_character_id = ? AND departed_at IS NULL").get(shiftId, account.characterId) as any;
    if (!party) throw new ApiError(409, "Your guest party is not active.");
    const challenge = String(payload.challenge ?? "");
    const options: Record<string, { cost: number; activityId: string; priority: number; label: string }> = {
      "special-request": { cost: 800, activityId: "server-menu-interview", priority: 92, label: "Off-menu preference" },
      "allergy-declaration": { cost: 500, activityId: "server-allergy-confirmation", priority: 100, label: "Allergy protocol" },
      "split-check": { cost: 1200, activityId: "server-split-payment", priority: 86, label: "Complex split check" },
      "impatient-pace": { cost: 1800, activityId: "manager-guest-recovery", priority: 96, label: "Accelerated pacing request" },
      "tasting-menu": { cost: 2500, activityId: "chef-taste-calibration", priority: 88, label: "Chef-guided tasting request" },
    };
    const selected = options[challenge];
    if (!selected) throw new ApiError(400, "Unknown guest challenge.");
    const character = this.db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(account.characterId) as any;
    if (character.cash_cents < selected.cost) throw new ApiError(409, "You cannot afford this guest experience.");
    let taskId = "";
    transaction(this.db, () => {
      this.db.prepare("UPDATE characters SET cash_cents = cash_cents - ? WHERE id = ?").run(selected.cost, account.characterId);
      taskId = this.createTask(shiftId, selected.activityId, party.id, null, { guestChallenge: challenge, requestedBy: account.characterId, label: selected.label }, selected.priority);
      this.db.prepare("UPDATE parties SET patience = MAX(20, patience - 5), service_phase = 'custom-request' WHERE id = ?").run(party.id);
      this.bump(shiftId);
    });
    this.emitSnapshot(shiftId);
    return { challenge, costCents: selected.cost, taskId, message: `${selected.label} entered the crew's live service queue.` };
  }

  private attributeBonus(characterId: string, roleId: string): number {
    const role = this.registry.roleById.get(roleId);
    if (!role) return 0;
    const rows = this.db.prepare("SELECT attribute_id, value FROM character_attributes WHERE character_id = ?").all(characterId) as any[];
    let weighted = 0;
    let total = 0;
    for (const row of rows) {
      const weight = role.attributeWeights[row.attribute_id] ?? 0;
      weighted += row.value * weight;
      total += weight;
    }
    return total ? Math.round((weighted / total - 55) / 5) : 0;
  }

  private finishTask(task: any, activity: any, characterId: string | null, score: number, risky: boolean): void {
    const dimension = DIMENSION_BY_ROLE[task.owner_role_id] ?? "service";
    if (task.party_id) {
      const delta = Math.max(-8, Math.min(8, Math.round((score - 60) / 5)));
      this.db.prepare("INSERT INTO review_evidence (id, service_shift_id, party_id, dimension, delta, fact, source_task_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(newId("evidence"), task.service_shift_id, task.party_id, dimension, delta, `${activity.label}: ${score}/100${risky ? " after a risky choice" : ""}`, task.id, Date.now());
      this.db.prepare("UPDATE parties SET satisfaction = MAX(0, MIN(100, satisfaction + ?)) WHERE id = ?").run(delta, task.party_id);
      this.advanceParty(task.party_id, task.activity_id);
    }
    if (characterId) {
      const xp = Math.max(8, Math.round(score / 4));
      this.db.prepare("UPDATE role_progress SET xp = xp + ?, tasks_completed = tasks_completed + 1, level = MIN(50, 1 + CAST((xp + ?) / 500 AS INTEGER)) WHERE character_id = ? AND role_id = ?")
        .run(xp, xp, characterId, task.owner_role_id);
      this.db.prepare("UPDATE characters SET xp = xp + ?, level = MIN(100, 1 + CAST((xp + ?) / 1000 AS INTEGER)), cash_cents = cash_cents + ? WHERE id = ?")
        .run(xp, xp, 150 + Math.round(score * 3), characterId);
    }
    if (task.incident_id) {
      this.db.prepare("UPDATE incidents SET state = 'resolved', resolved_at = ? WHERE id = ?").run(Date.now(), task.incident_id);
      this.db.prepare("UPDATE restaurants SET sanitation = MIN(100, sanitation + 1) WHERE id = (SELECT restaurant_id FROM service_shifts WHERE id = ?)").run(task.service_shift_id);
    }
  }

  private advanceParty(partyId: string, completedActivityId: string): void {
    const party = this.db.prepare("SELECT * FROM parties WHERE id = ?").get(partyId) as any;
    if (!party || party.departed_at) return;
    const index = PARTY_CHAIN.indexOf(completedActivityId);
    if (index < 0) return;
    if (index + 1 < PARTY_CHAIN.length) {
      const next = PARTY_CHAIN[index + 1]!;
      this.db.prepare("UPDATE parties SET service_phase = ?, state = ? WHERE id = ?").run(next, index > 4 ? "dining" : "ordering", partyId);
      this.createTask(party.service_shift_id, next, partyId, null, { chainIndex: index + 1 });
    } else {
      this.db.prepare("UPDATE parties SET service_phase = 'departed', state = 'departed', departed_at = ? WHERE id = ?").run(Date.now(), partyId);
      this.finalizeReview(partyId);
    }
  }

  private finalizeReview(partyId: string): void {
    if (this.db.prepare("SELECT 1 FROM restaurant_reviews WHERE party_id = ?").get(partyId)) return;
    const party = this.db.prepare("SELECT * FROM parties WHERE id = ?").get(partyId) as any;
    if (!party) return;
    const evidence = this.db.prepare("SELECT dimension, SUM(delta) AS delta FROM review_evidence WHERE party_id = ? GROUP BY dimension").all(partyId) as any[];
    const dimensions: Record<string, number> = { food: 3.6, service: 3.6, cleanliness: 3.6, value: 3.6, ambience: 3.6 };
    for (const row of evidence) dimensions[row.dimension] = Math.max(1, Math.min(5, 3.6 + row.delta / 10));
    const rating = Math.round((Object.values(dimensions).reduce((sum, value) => sum + value, 0) / 5) * 10) / 10;
    const strongest = Object.entries(dimensions).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "hospitality";
    const weakest = Object.entries(dimensions).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "service";
    const summary = rating >= 4.2 ? `A confident service with standout ${strongest}.` : rating >= 3.2 ? `A solid visit; ${weakest} left the clearest opportunity.` : `The team struggled to recover ${weakest} during this visit.`;
    const restaurantId = (this.db.prepare("SELECT restaurant_id FROM service_shifts WHERE id = ?").get(party.service_shift_id) as any).restaurant_id;
    this.db.prepare("INSERT INTO restaurant_reviews (id, restaurant_id, party_id, rating, dimensions_json, summary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(newId("review"), restaurantId, partyId, rating, JSON.stringify(dimensions), summary, Date.now());
    this.db.prepare("UPDATE restaurants SET rating = ROUND((rating * 20 + ?) / 21, 2) WHERE id = ?").run(rating, restaurantId);
  }

  private maybeCreateIncident(shiftId: string, partyId: string | null, taskId: string, cause: string, score: number): void {
    if (score > 55) return;
    const shift = activeShift(this.db, shiftId);
    const id = newId("incident");
    const x = 4 + Math.floor(Math.random() * 8);
    const y = 3 + Math.floor(Math.random() * 8);
    this.db.prepare("INSERT INTO incidents (id, service_shift_id, party_id, incident_type, state, severity, position_x, position_y, cause_json, created_at) VALUES (?, ?, ?, 'spill', 'active', ?, ?, ?, ?, ?)")
      .run(id, shiftId, partyId, score < 30 ? 3 : 2, x, y, JSON.stringify({ taskId, cause, score }), Date.now());
    this.createTask(shiftId, "host-busser-spill-containment", partyId, id, { incidentType: "spill", worldPosition: { x, y } }, 100);
    this.db.prepare("UPDATE restaurants SET sanitation = MAX(0, sanitation - 2) WHERE id = ?").run(shift.restaurant_id);
  }

  private createParty(shiftId: string, partyKind: "npc" | "player", guestCharacterId: string | null, size: number): string {
    const id = newId("party");
    const occasions = ["quick meal", "business dinner", "birthday", "date night", "regular visit"];
    const traits = ["patient", "menu-curious", "time-sensitive", "quiet", "high-touch"];
    const now = Date.now();
    this.db.prepare(`INSERT INTO parties
      (id, service_shift_id, guest_character_id, party_kind, size, state, service_phase, table_label, satisfaction, patience, occasion, traits_json, created_at)
      VALUES (?, ?, ?, ?, ?, 'waiting', ?, ?, 70, 100, ?, ?, ?)`)
      .run(id, shiftId, guestCharacterId, partyKind, Math.round(size), PARTY_CHAIN[0]!, `T${1 + Math.floor(Math.random() * 18)}`, occasions[Math.floor(Math.random() * occasions.length)] ?? "regular visit", JSON.stringify([traits[Math.floor(Math.random() * traits.length)] ?? "patient"]), now);
    this.createTask(shiftId, PARTY_CHAIN[0]!, id, null, { chainIndex: 0 }, 90);
    return id;
  }

  private createTask(shiftId: string, activityId: string, partyId: string | null, incidentId: string | null, context: Record<string, unknown>, priorityOverride?: number): string {
    const activity = this.registry.activityById.get(activityId);
    if (!activity) throw new ApiError(409, `Activity ${activityId} is unavailable.`);
    const id = newId("task");
    const now = Date.now();
    this.db.prepare(`INSERT INTO service_tasks
      (id, service_shift_id, party_id, incident_id, activity_id, owner_role_id, lane, priority, state, context_json, history_json, created_at, due_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, '[]', ?, ?, ?)`)
      .run(id, shiftId, partyId, incidentId, activity.id, activity.roleId, activity.lane, priorityOverride ?? activity.priority, JSON.stringify(context), now, now + TASK_DUE_MS, now);
    return id;
  }

  private fillRoleQueues(shiftId: string): void {
    for (const role of this.registry.content.roles.filter((entry) => entry.kind === "base")) {
      const count = (this.db.prepare("SELECT COUNT(*) AS count FROM service_tasks WHERE service_shift_id = ? AND owner_role_id = ? AND state IN ('open','claimed')").get(shiftId, role.id) as any).count as number;
      const target = role.id === "server" || role.id === "host-busser" || role.id === "cook" ? 4 : 2;
      for (let index = count; index < target; index += 1) {
        const activityId = role.activityIds[(index + Math.floor(Date.now() / 10_000)) % role.activityIds.length]!;
        this.createTask(shiftId, activityId, null, null, { proactive: true, queueSlot: index });
      }
    }
  }

  private simulateNpc(shiftId: string): void {
    const playerRoles = new Set((this.db.prepare("SELECT role_id FROM shift_presences WHERE service_shift_id = ? AND kind = 'employee' AND left_at IS NULL").all(shiftId) as any[]).map((row) => row.role_id));
    for (const role of this.registry.content.roles.filter((entry) => entry.kind === "base")) {
      if (playerRoles.has(role.id)) continue;
      const task = this.db.prepare("SELECT * FROM service_tasks WHERE service_shift_id = ? AND owner_role_id = ? AND state = 'open' ORDER BY priority DESC, due_at LIMIT 1").get(shiftId, role.id) as any;
      if (!task) continue;
      const activity = this.registry.activityById.get(task.activity_id);
      if (!activity) continue;
      const score = 68 + Math.floor(Math.random() * 24);
      this.db.prepare("UPDATE service_tasks SET state = 'completed', phase_index = ?, score_total = ?, action_count = ?, history_json = ?, updated_at = ?, completed_at = ? WHERE id = ?")
        .run(Math.max(0, activity.phases.length - 1), score * activity.phases.length, activity.phases.length, JSON.stringify(activity.phases.map((phase) => ({ phaseId: phase.id, action: phase.actions[0], score, npc: true, at: Date.now() }))), Date.now(), Date.now(), task.id);
      this.finishTask(task, activity, null, score, false);
      this.bump(shiftId);
    }
  }

  private applyMovement(deltaSeconds: number): void {
    const now = Date.now();
    for (const [key, intent] of this.moveIntents) {
      if (now - intent.at > 500) { this.moveIntents.delete(key); continue; }
      const row = this.db.prepare(`SELECT p.*, r.build_width, r.build_height, s.restaurant_id
        FROM shift_presences p JOIN service_shifts s ON s.id = p.service_shift_id JOIN restaurants r ON r.id = s.restaurant_id
        WHERE p.service_shift_id = ? AND p.character_id = ? AND p.left_at IS NULL`).get(intent.shiftId, intent.characterId) as any;
      if (!row) { this.moveIntents.delete(key); continue; }
      const speed = 4.5;
      const nextX = Math.max(0.35, Math.min(row.build_width - 0.35, row.position_x + intent.x * speed * deltaSeconds));
      const nextY = Math.max(0.35, Math.min(row.build_height - 0.35, row.position_y + intent.y * speed * deltaSeconds));
      if (!this.collides(row.restaurant_id, nextX, nextY)) {
        this.db.prepare("UPDATE shift_presences SET position_x = ?, position_y = ?, direction_x = ?, direction_y = ?, last_seen_at = ? WHERE service_shift_id = ? AND character_id = ?")
          .run(nextX, nextY, intent.x, intent.y, now, intent.shiftId, intent.characterId);
      }
    }
  }

  private collides(restaurantId: string, x: number, y: number): boolean {
    const objects = this.db.prepare("SELECT * FROM object_instances WHERE restaurant_id = ?").all(restaurantId) as any[];
    for (const object of objects) {
      const definition = this.registry.furnitureById.get(object.definition_id);
      if (!definition) continue;
      const width = object.rotation === 90 || object.rotation === 270 ? definition.height : definition.width;
      const height = object.rotation === 90 || object.rotation === 270 ? definition.width : definition.height;
      if (x > object.grid_x - 0.2 && x < object.grid_x + width + 0.2 && y > object.grid_y - 0.2 && y < object.grid_y + height + 0.2) return true;
    }
    return false;
  }

  private tick(): void {
    const now = Date.now();
    const delta = Math.min(0.25, Math.max(0, (now - this.lastTick) / 1000));
    this.lastTick = now;
    this.simulationAccumulator += delta;
    this.snapshotAccumulator += delta;
    this.spawnAccumulator += delta;
    this.ecologyAccumulator += delta;
    this.applyMovement(delta);
    const expired = this.db.prepare("SELECT id FROM service_shifts WHERE state IN ('crew-call','open','closing') AND closes_at <= ?").all(now) as any[];
    for (const row of expired) this.closeShift(row.id);
    const shifts = this.db.prepare("SELECT id FROM service_shifts WHERE state IN ('crew-call','open','closing')").all() as any[];
    if (this.simulationAccumulator >= 2) {
      this.simulationAccumulator = 0;
      for (const row of shifts) {
        this.simulateNpc(row.id);
        this.db.prepare("UPDATE parties SET patience = MAX(0, patience - 1) WHERE service_shift_id = ? AND departed_at IS NULL AND EXISTS (SELECT 1 FROM service_tasks t WHERE t.party_id = parties.id AND t.state IN ('open','claimed') AND t.due_at < ?)").run(row.id, now);
        this.db.prepare("UPDATE duty_slots SET handoff_state = 'steady', updated_at = ? WHERE service_shift_id = ? AND handoff_state IN ('joining','leaving') AND updated_at < ?").run(now, row.id, now - 3000);
      }
    }
    if (this.spawnAccumulator >= 8) {
      this.spawnAccumulator = 0;
      for (const row of shifts) this.fillRoleQueues(row.id);
      for (const row of shifts) {
        const last = this.db.prepare("SELECT MAX(created_at) AS created_at FROM parties WHERE service_shift_id = ?").get(row.id) as any;
        const active = (this.db.prepare("SELECT COUNT(*) AS count FROM parties WHERE service_shift_id = ? AND departed_at IS NULL").get(row.id) as any).count as number;
        if (active < 8 && (!last.created_at || now - last.created_at >= PARTY_INTERVAL_MS)) this.createParty(row.id, "npc", null, 1 + Math.floor(Math.random() * 5));
      }
    }
    if (this.snapshotAccumulator >= 1 / this.snapshotRate) {
      this.snapshotAccumulator = 0;
      for (const row of shifts) this.emitSnapshot(row.id);
    }
    if (this.ecologyAccumulator >= 60) {
      this.ecologyAccumulator = 0;
      this.runNpcEcology();
    }
  }

  private closeShift(shiftId: string): void {
    const shift = this.db.prepare("SELECT * FROM service_shifts WHERE id = ?").get(shiftId) as any;
    if (!shift || shift.state === "closed") return;
    transaction(this.db, () => {
      this.db.prepare("UPDATE service_shifts SET state = 'closed', closed_at = ?, version = version + 1 WHERE id = ?").run(Date.now(), shiftId);
      this.db.prepare("UPDATE shift_presences SET left_at = COALESCE(left_at, ?), last_seen_at = ? WHERE service_shift_id = ?").run(Date.now(), Date.now(), shiftId);
      this.db.prepare("UPDATE duty_slots SET occupant_character_id = NULL, staffing = 'npc', handoff_state = 'steady', updated_at = ? WHERE service_shift_id = ?").run(Date.now(), shiftId);
    });
    this.settleShift(shiftId);
    this.emit("shift-closed", shiftId);
  }

  private settleShift(shiftId: string): void {
    const shift = this.db.prepare(`SELECT s.*, r.region_id, r.is_npc, r.rating, r.treasury_cents,
      rg.demand, rg.cost_index, rg.resources_json
      FROM service_shifts s JOIN restaurants r ON r.id = s.restaurant_id JOIN regions rg ON rg.id = r.region_id
      WHERE s.id = ?`).get(shiftId) as any;
    if (!shift) return;
    const covers = Number((this.db.prepare("SELECT COALESCE(SUM(size), 0) AS covers FROM parties WHERE service_shift_id = ? AND departed_at IS NOT NULL").get(shiftId) as any).covers);
    const taskQuality = Number((this.db.prepare("SELECT COALESCE(AVG(CASE WHEN action_count > 0 THEN score_total * 1.0 / action_count ELSE 55 END), 55) AS quality FROM service_tasks WHERE service_shift_id = ? AND state = 'completed'").get(shiftId) as any).quality);
    const incidents = Number((this.db.prepare("SELECT COUNT(*) AS count FROM incidents WHERE service_shift_id = ? AND state <> 'resolved'").get(shiftId) as any).count);
    const resources = json<Record<string, number>>(shift.resources_json, {});
    const supplyPressure = Math.max(0, 100 - ((resources.produce ?? 50) + (resources.labor ?? 50) + (resources.fuel ?? 50)) / 3);
    const revenue = Math.round(covers * (1700 + shift.demand * 11) * (0.75 + taskQuality / 200));
    const operatingCost = Math.round(62_000 + covers * (640 + shift.cost_index * 3 + supplyPressure * 2));
    const unresolvedCost = incidents * 18_000;
    const net = revenue - operatingCost - unresolvedCost;
    const now = Date.now();
    transaction(this.db, () => {
      this.db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents + ?, sanitation = MAX(0, sanitation - ?) WHERE id = ?").run(net, incidents * 2, shift.restaurant_id);
      this.db.prepare("INSERT INTO ledger_entries (id, restaurant_id, category, amount_cents, reference_type, reference_id, created_at) VALUES (?, ?, 'shift-revenue', ?, 'shift', ?, ?)").run(newId("ledger"), shift.restaurant_id, revenue, shiftId, now);
      this.db.prepare("INSERT INTO ledger_entries (id, restaurant_id, category, amount_cents, reference_type, reference_id, created_at) VALUES (?, ?, 'shift-costs', ?, 'shift', ?, ?)").run(newId("ledger"), shift.restaurant_id, -(operatingCost + unresolvedCost), shiftId, now);
    });
  }

  private runNpcEcology(): void {
    const doomed = this.db.prepare(`SELECT r.* FROM restaurants r
      WHERE r.is_npc = 1 AND r.status = 'active'
        AND (r.treasury_cents < -250000 OR r.rating < 2.1 OR r.sanitation < 18)
        AND NOT EXISTS (SELECT 1 FROM service_shifts s WHERE s.restaurant_id = r.id AND s.state IN ('crew-call','open','closing'))`).all() as any[];
    for (const restaurant of doomed) {
      this.db.prepare("UPDATE restaurants SET status = 'failed', closed_at = ? WHERE id = ?").run(Date.now(), restaurant.id);
      this.emit("restaurant-failed", { restaurantId: restaurant.id, regionId: restaurant.region_id, generation: restaurant.generation });
    }
    const regions = this.db.prepare(`SELECT rg.*,
      (SELECT COUNT(*) FROM restaurants r WHERE r.region_id = rg.id AND r.status = 'active' AND r.is_npc = 1) AS npc_count,
      (SELECT COUNT(*) FROM restaurants r WHERE r.region_id = rg.id AND r.status = 'active') AS active_count
      FROM regions rg`).all() as any[];
    for (const region of regions) {
      const target = Math.max(1, Math.round(region.capacity * 0.2));
      if (region.npc_count >= target || region.active_count >= region.capacity || Math.random() > 0.22) continue;
      const id = newId("restaurant");
      const generation = Number((this.db.prepare("SELECT COALESCE(MAX(generation), 0) AS generation FROM restaurants WHERE region_id = ?").get(region.id) as any).generation) + 1;
      const first = ["Lantern", "Juniper", "Copper", "Sunday", "Harbor", "Market", "Cedar", "Night"][Math.floor(Math.random() * 8)] ?? "New";
      const second = ["Table", "House", "Kitchen", "Room", "Spoon", "Grill", "Cafe", "Counter"][Math.floor(Math.random() * 8)] ?? "House";
      const concept = this.registry.content.concepts[Math.floor(Math.random() * this.registry.content.concepts.length)] ?? "Neighborhood Restaurant";
      const style = this.registry.content.styles[Math.floor(Math.random() * this.registry.content.styles.length)] ?? "Modern";
      this.db.prepare(`INSERT INTO restaurants
        (id, region_id, name, concept, style, status, rating, sanitation, treasury_cents, build_width, build_height, generation, is_npc, opened_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?, ?, 900000, ?, ?, ?, 1, ?)`)
        .run(id, region.id, `${first} ${second}`, concept, style, 3.2 + Math.random() * 0.9, 76 + Math.floor(Math.random() * 20), this.registry.content.construction.grid.defaultWidth, this.registry.content.construction.grid.defaultHeight, generation, Date.now());
      ensureLayout(this.db, this.registry, id);
      this.openShift(id, null);
      this.emit("restaurant-sprouted", { restaurantId: id, regionId: region.id, generation });
    }
  }

  private bump(shiftId: string): void {
    this.db.prepare("UPDATE service_shifts SET version = version + 1 WHERE id = ?").run(shiftId);
  }

  private emitSnapshot(shiftId: string): void {
    try { this.emit("snapshot", shiftId, this.snapshot(shiftId)); } catch (error) { this.emit("error", error); }
  }
}
