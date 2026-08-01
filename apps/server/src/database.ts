import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { ContentRegistry } from "./content.js";
import type { Database } from "./types.js";

const SCHEMA = `
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS application_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  cash_cents INTEGER NOT NULL DEFAULT 3500000,
  reputation INTEGER NOT NULL DEFAULT 50,
  skill_points INTEGER NOT NULL DEFAULT 5,
  home_country_id TEXT NOT NULL DEFAULT 'us',
  home_region_id TEXT,
  active_role_id TEXT NOT NULL DEFAULT 'host-busser',
  outfit TEXT NOT NULL DEFAULT 'classic',
  primary_color TEXT NOT NULL DEFAULT '#2f684f',
  secondary_color TEXT NOT NULL DEFAULT '#d6a84b',
  skin_tone TEXT NOT NULL DEFAULT '#b9825c',
  hair_style TEXT NOT NULL DEFAULT 'short',
  hair_color TEXT NOT NULL DEFAULT '#30231d',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS character_attributes (
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  attribute_id TEXT NOT NULL,
  value INTEGER NOT NULL,
  potential INTEGER NOT NULL DEFAULT 100,
  PRIMARY KEY(character_id, attribute_id)
);

CREATE TABLE IF NOT EXISTS role_progress (
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  failures_recovered INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(character_id, role_id)
);

CREATE TABLE IF NOT EXISTS skill_unlocks (
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL,
  PRIMARY KEY(character_id, skill_id)
);

CREATE TABLE IF NOT EXISTS countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  flag TEXT NOT NULL,
  map_x REAL NOT NULL,
  map_y REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES countries(id),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  demand INTEGER NOT NULL,
  cost_index INTEGER NOT NULL,
  resources_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL REFERENCES regions(id),
  owner_character_id TEXT REFERENCES characters(id),
  name TEXT NOT NULL,
  concept TEXT NOT NULL,
  style TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  rating REAL NOT NULL DEFAULT 3.8,
  sanitation INTEGER NOT NULL DEFAULT 88,
  treasury_cents INTEGER NOT NULL DEFAULT 1200000,
  build_width INTEGER NOT NULL DEFAULT 24,
  build_height INTEGER NOT NULL DEFAULT 16,
  generation INTEGER NOT NULL DEFAULT 1,
  is_npc INTEGER NOT NULL DEFAULT 1,
  opened_at INTEGER NOT NULL,
  closed_at INTEGER
);

CREATE TABLE IF NOT EXISTS floor_cells (
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  surface_id TEXT NOT NULL,
  room_tag TEXT NOT NULL DEFAULT 'dining',
  walkable INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(restaurant_id, grid_x, grid_y)
);

CREATE TABLE IF NOT EXISTS wall_edges (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  edge TEXT NOT NULL,
  wall_style_id TEXT NOT NULL,
  opening_type TEXT NOT NULL DEFAULT 'solid',
  rotation INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  UNIQUE(restaurant_id, grid_x, grid_y, edge)
);

CREATE TABLE IF NOT EXISTS object_instances (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  definition_id TEXT NOT NULL,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  rotation INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'operational',
  wear INTEGER NOT NULL DEFAULT 0,
  primary_color TEXT,
  secondary_color TEXT,
  placed_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS service_shifts (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  opened_by_character_id TEXT REFERENCES characters(id),
  state TEXT NOT NULL,
  service_mode TEXT NOT NULL DEFAULT 'open',
  opened_at INTEGER NOT NULL,
  closes_at INTEGER NOT NULL,
  closed_at INTEGER,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS employment_applications (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at INTEGER NOT NULL,
  decided_at INTEGER,
  UNIQUE(restaurant_id, character_id, role_id)
);

CREATE TABLE IF NOT EXISTS employments (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  region_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  hired_at INTEGER NOT NULL,
  quit_at INTEGER,
  UNIQUE(character_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS duty_slots (
  id TEXT PRIMARY KEY,
  service_shift_id TEXT NOT NULL REFERENCES service_shifts(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,
  slot_index INTEGER NOT NULL,
  label TEXT NOT NULL,
  occupant_character_id TEXT REFERENCES characters(id),
  staffing TEXT NOT NULL DEFAULT 'npc',
  handoff_state TEXT NOT NULL DEFAULT 'steady',
  workload INTEGER NOT NULL DEFAULT 50,
  joined_at INTEGER,
  updated_at INTEGER NOT NULL,
  UNIQUE(service_shift_id, role_id, slot_index)
);

CREATE TABLE IF NOT EXISTS shift_presences (
  service_shift_id TEXT NOT NULL REFERENCES service_shifts(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  role_id TEXT,
  duty_slot_id TEXT REFERENCES duty_slots(id),
  position_x REAL NOT NULL DEFAULT 2.5,
  position_y REAL NOT NULL DEFAULT 2.5,
  direction_x REAL NOT NULL DEFAULT 0,
  direction_y REAL NOT NULL DEFAULT 1,
  joined_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  left_at INTEGER,
  PRIMARY KEY(service_shift_id, character_id)
);

CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  service_shift_id TEXT NOT NULL REFERENCES service_shifts(id) ON DELETE CASCADE,
  guest_character_id TEXT REFERENCES characters(id),
  party_kind TEXT NOT NULL DEFAULT 'npc',
  size INTEGER NOT NULL,
  state TEXT NOT NULL,
  service_phase TEXT NOT NULL,
  table_label TEXT,
  satisfaction INTEGER NOT NULL DEFAULT 70,
  patience INTEGER NOT NULL DEFAULT 100,
  occasion TEXT,
  traits_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  departed_at INTEGER
);

CREATE TABLE IF NOT EXISTS service_tasks (
  id TEXT PRIMARY KEY,
  service_shift_id TEXT NOT NULL REFERENCES service_shifts(id) ON DELETE CASCADE,
  party_id TEXT REFERENCES parties(id) ON DELETE CASCADE,
  incident_id TEXT,
  activity_id TEXT NOT NULL,
  owner_role_id TEXT NOT NULL,
  lane TEXT NOT NULL,
  priority INTEGER NOT NULL,
  state TEXT NOT NULL,
  phase_index INTEGER NOT NULL DEFAULT 0,
  claimed_by_character_id TEXT REFERENCES characters(id),
  score_total INTEGER NOT NULL DEFAULT 0,
  action_count INTEGER NOT NULL DEFAULT 0,
  context_json TEXT NOT NULL DEFAULT '{}',
  history_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  due_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  service_shift_id TEXT NOT NULL REFERENCES service_shifts(id) ON DELETE CASCADE,
  party_id TEXT REFERENCES parties(id),
  incident_type TEXT NOT NULL,
  state TEXT NOT NULL,
  severity INTEGER NOT NULL,
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,
  cause_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  resolved_at INTEGER
);

CREATE TABLE IF NOT EXISTS review_evidence (
  id TEXT PRIMARY KEY,
  service_shift_id TEXT NOT NULL REFERENCES service_shifts(id) ON DELETE CASCADE,
  party_id TEXT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL,
  delta INTEGER NOT NULL,
  fact TEXT NOT NULL,
  source_task_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurant_reviews (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  party_id TEXT NOT NULL UNIQUE REFERENCES parties(id),
  verified INTEGER NOT NULL DEFAULT 1,
  rating REAL NOT NULL,
  dimensions_json TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  character_id TEXT REFERENCES characters(id),
  category TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS command_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_shift_id TEXT,
  character_id TEXT,
  command_id TEXT NOT NULL,
  command_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(character_id, command_id)
);

CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS restaurants_region_idx ON restaurants(region_id, status);
CREATE INDEX IF NOT EXISTS service_shifts_state_idx ON service_shifts(state, closes_at);
CREATE INDEX IF NOT EXISTS employment_restaurant_idx ON employment_applications(restaurant_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS one_live_shift_per_restaurant ON service_shifts(restaurant_id) WHERE state IN ('crew-call', 'open', 'closing');
CREATE INDEX IF NOT EXISTS duty_slots_shift_idx ON duty_slots(service_shift_id, role_id);
CREATE INDEX IF NOT EXISTS presences_shift_idx ON shift_presences(service_shift_id, left_at);
CREATE INDEX IF NOT EXISTS tasks_shift_idx ON service_tasks(service_shift_id, state, owner_role_id, priority);
CREATE INDEX IF NOT EXISTS evidence_party_idx ON review_evidence(party_id, dimension);
`;

export function createDatabase(path: string, registry: ContentRegistry): Database {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(SCHEMA);
  try {
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA synchronous = NORMAL;");
  } catch {
    // In-memory test databases do not support every persistent pragma.
  }
  const current = db.prepare("SELECT value FROM application_meta WHERE key = 'schema_version'").get() as { value?: string } | undefined;
  if (current && current.value !== "1") throw new Error(`This server only supports the clean V1 database schema; found ${current.value}.`);
  db.prepare("INSERT OR IGNORE INTO application_meta (key, value) VALUES ('schema_version', '1')").run();
  db.prepare("INSERT OR REPLACE INTO application_meta (key, value) VALUES ('content_hash', ?)").run(registry.manifest.contentHash);
  seedWorld(db, registry);
  return db;
}

function seedWorld(db: Database, registry: ContentRegistry): void {
  const now = Date.now();
  const insertCountry = db.prepare("INSERT OR IGNORE INTO countries (id, name, code, flag, map_x, map_y) VALUES (?, ?, ?, ?, ?, ?)");
  const insertRegion = db.prepare("INSERT OR IGNORE INTO regions (id, country_id, name, capacity, demand, cost_index, resources_json) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertRestaurant = db.prepare(`
    INSERT OR IGNORE INTO restaurants
    (id, region_id, name, concept, style, rating, sanitation, treasury_cents, build_width, build_height, generation, is_npc, opened_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
  `);
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const countryValue of registry.content.world) {
      const country = countryValue as any;
      insertCountry.run(country.id, country.name, country.code, country.flag, country.x, country.y);
      for (const region of country.regions as any[]) {
        insertRegion.run(region.id, country.id, region.name, region.capacity, region.demand, region.costIndex, JSON.stringify(region.resources));
        for (const restaurant of region.restaurants as any[]) {
          insertRestaurant.run(
            restaurant.id,
            region.id,
            restaurant.name,
            restaurant.concept,
            restaurant.style,
            restaurant.rating,
            restaurant.sanitation,
            1_200_000,
            registry.content.construction.grid.defaultWidth,
            registry.content.construction.grid.defaultHeight,
            now - Math.abs(String(restaurant.id).length * 86_400_000),
          );
        }
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function transaction<T>(db: Database, work: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}
