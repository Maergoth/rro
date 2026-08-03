import type { ContentRegistry } from "./content.js";
import { newId, transaction } from "./database.js";
import { aggregateFurnitureEffects, type FurnitureEffectsSummary } from "./furniture-effects.js";
import { ApiError, type AuthenticatedAccount, type Database, type FurnitureDefinition } from "./types.js";

type CellInput = { x: number; y: number };

function integer(value: unknown, label: string): number {
  const result = Number(value);
  if (!Number.isInteger(result)) throw new ApiError(400, `${label} must be an integer.`);
  return result;
}

function normalizeRotation(value: unknown): number {
  const result = integer(value ?? 0, "rotation");
  if (![0, 90, 180, 270].includes(result)) throw new ApiError(400, "Rotation must be 0, 90, 180, or 270 degrees.");
  return result;
}

function dimensions(definition: FurnitureDefinition, rotation: number): { width: number; height: number } {
  return rotation === 90 || rotation === 270
    ? { width: definition.height, height: definition.width }
    : { width: definition.width, height: definition.height };
}

function restaurantRow(db: Database, restaurantId: string): any {
  const row = db.prepare("SELECT * FROM restaurants WHERE id = ? AND status = 'active'").get(restaurantId);
  if (!row) throw new ApiError(404, "Restaurant not found.");
  return row;
}

function assertOwner(db: Database, restaurantId: string, account: AuthenticatedAccount): any {
  const row = restaurantRow(db, restaurantId);
  if (row.owner_character_id !== account.characterId) throw new ApiError(403, "Only this restaurant's owner can change its layout.");
  return row;
}

function ensureInside(row: any, x: number, y: number, width = 1, height = 1): void {
  if (x < 0 || y < 0 || x + width > row.build_width || y + height > row.build_height) {
    throw new ApiError(400, "The placement must remain inside the restaurant footprint.");
  }
}

function occupiedCells(db: Database, registry: ContentRegistry, restaurantId: string, exceptId?: string): Set<string> {
  const occupied = new Set<string>();
  const rows = db.prepare("SELECT * FROM object_instances WHERE restaurant_id = ? AND id <> ?").all(restaurantId, exceptId ?? "") as any[];
  for (const row of rows) {
    const definition = registry.furnitureById.get(row.definition_id);
    if (!definition) continue;
    const size = dimensions(definition, row.rotation);
    for (let y = row.grid_y; y < row.grid_y + size.height; y += 1) {
      for (let x = row.grid_x; x < row.grid_x + size.width; x += 1) occupied.add(`${x}:${y}`);
    }
  }
  return occupied;
}

function assertClear(db: Database, registry: ContentRegistry, restaurantId: string, x: number, y: number, width: number, height: number, exceptId?: string): void {
  const occupied = occupiedCells(db, registry, restaurantId, exceptId);
  for (let cy = y; cy < y + height; cy += 1) {
    for (let cx = x; cx < x + width; cx += 1) {
      if (occupied.has(`${cx}:${cy}`)) throw new ApiError(409, "That footprint overlaps another object.");
    }
  }
}

export function ensureLayout(db: Database, registry: ContentRegistry, restaurantId: string): void {
  const row = restaurantRow(db, restaurantId);
  const existing = db.prepare("SELECT 1 FROM floor_cells WHERE restaurant_id = ? LIMIT 1").get(restaurantId);
  if (existing) return;
  const now = Date.now();
  const floor = db.prepare("INSERT INTO floor_cells (restaurant_id, grid_x, grid_y, surface_id, room_tag, walkable, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?)");
  const wall = db.prepare("INSERT INTO wall_edges (id, restaurant_id, grid_x, grid_y, edge, wall_style_id, opening_type, rotation, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const object = db.prepare("INSERT INTO object_instances (id, restaurant_id, definition_id, grid_x, grid_y, rotation, placed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  transaction(db, () => {
    for (let y = 0; y < row.build_height; y += 1) {
      for (let x = 0; x < row.build_width; x += 1) {
        const kitchen = x >= Math.floor(row.build_width * 0.62);
        const storage = kitchen && y >= Math.floor(row.build_height * 0.68);
        floor.run(restaurantId, x, y, kitchen ? "rubber-kitchen" : "sealed-concrete", storage ? "storage" : kitchen ? "kitchen" : "dining", now);
      }
    }
    for (let x = 0; x < row.build_width; x += 1) {
      wall.run(newId("wall"), restaurantId, x, 0, "north", "painted-plaster", x === 2 ? "door" : "solid", 0, now);
      wall.run(newId("wall"), restaurantId, x, row.build_height - 1, "south", "painted-plaster", "solid", 180, now);
    }
    for (let y = 0; y < row.build_height; y += 1) {
      wall.run(newId("wall"), restaurantId, 0, y, "west", "painted-plaster", "solid", 270, now);
      wall.run(newId("wall"), restaurantId, row.build_width - 1, y, "east", "painted-plaster", y === 2 ? "service-door" : "solid", 90, now);
    }
    const starter: Array<[string, number, number, number]> = [
      ["host-stand", 2, 2, 0], ["table-two", 3, 6, 0], ["table-four", 8, 5, 0], ["table-two", 4, 11, 0],
      ["service-station", 11, 10, 0], ["range", row.build_width - 8, 3, 0], ["prep", row.build_width - 8, 8, 0],
      ["pass", row.build_width - 9, 12, 0], ["dish-machine", row.build_width - 4, 11, 90], ["plants", 1, row.build_height - 3, 0],
    ];
    for (const [definitionId, x, y, rotation] of starter) {
      if (!registry.furnitureById.has(definitionId)) continue;
      object.run(newId("object"), restaurantId, definitionId, x, y, rotation, now, now);
    }
  });
}

export function getLayout(db: Database, registry: ContentRegistry, restaurantId: string): Record<string, unknown> {
  ensureLayout(db, registry, restaurantId);
  const restaurant = restaurantRow(db, restaurantId);
  return {
    width: restaurant.build_width,
    height: restaurant.build_height,
    cellMeters: registry.content.construction.grid.cellMeters,
    cells: db.prepare("SELECT grid_x AS x, grid_y AS y, surface_id AS surfaceId, room_tag AS roomTag, walkable FROM floor_cells WHERE restaurant_id = ? ORDER BY grid_y, grid_x").all(restaurantId),
    walls: db.prepare("SELECT id, grid_x AS x, grid_y AS y, edge, wall_style_id AS wallStyleId, opening_type AS openingType, rotation FROM wall_edges WHERE restaurant_id = ? ORDER BY grid_y, grid_x").all(restaurantId),
    objects: db.prepare("SELECT id, definition_id AS definitionId, grid_x AS x, grid_y AS y, rotation, state, wear, primary_color AS primaryColor, secondary_color AS secondaryColor FROM object_instances WHERE restaurant_id = ? ORDER BY placed_at").all(restaurantId),
    furnitureEffects: getFurnitureEffects(db, registry, restaurantId),
  };
}

export function getFurnitureEffects(db: Database, registry: ContentRegistry, restaurantId: string): FurnitureEffectsSummary {
  restaurantRow(db, restaurantId);
  const instances = db.prepare("SELECT definition_id AS definitionId, wear, state FROM object_instances WHERE restaurant_id = ? ORDER BY placed_at").all(restaurantId) as Array<{ definitionId: string; wear: number; state: string }>;
  return aggregateFurnitureEffects(registry.content.furniture, instances);
}

export function foundRestaurant(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, body: Record<string, unknown>): Record<string, unknown> {
  if (db.prepare("SELECT 1 FROM restaurants WHERE owner_character_id = ? AND status = 'active'").get(account.characterId)) throw new ApiError(409, "This character already owns an active restaurant.");
  const regionId = String(body.regionId ?? "");
  const region = db.prepare("SELECT * FROM regions WHERE id = ?").get(regionId) as any;
  if (!region) throw new ApiError(404, "Region not found.");
  const active = (db.prepare("SELECT COUNT(*) AS count FROM restaurants WHERE region_id = ? AND status = 'active'").get(regionId) as any).count as number;
  if (active >= region.capacity) throw new ApiError(409, "This region has no available restaurant licenses.");
  const name = String(body.name ?? "").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, 48);
  if (name.length < 3) throw new ApiError(400, "Restaurant name must be at least three characters.");
  const concept = registry.content.concepts.includes(String(body.concept)) ? String(body.concept) : (registry.content.concepts[0] ?? "Independent Restaurant");
  const style = registry.content.styles.includes(String(body.style)) ? String(body.style) : (registry.content.styles[0] ?? "Modern");
  const cost = 1_000_000;
  const character = db.prepare("SELECT cash_cents FROM characters WHERE id = ?").get(account.characterId) as any;
  if (character.cash_cents < cost) throw new ApiError(409, "You need $10,000 to found a restaurant.");
  const id = newId("restaurant");
  const now = Date.now();
  transaction(db, () => {
    db.prepare("UPDATE characters SET cash_cents = cash_cents - ? WHERE id = ?").run(cost, account.characterId);
    db.prepare(`INSERT INTO restaurants
      (id, region_id, owner_character_id, name, concept, style, rating, sanitation, treasury_cents, build_width, build_height, generation, is_npc, opened_at)
      VALUES (?, ?, ?, ?, ?, ?, 3.5, 100, 800000, ?, ?, 1, 0, ?)`)
      .run(id, regionId, account.characterId, name, concept, style, registry.content.construction.grid.defaultWidth, registry.content.construction.grid.defaultHeight, now);
  });
  ensureLayout(db, registry, id);
  return { id, name, regionId, concept, style, foundingCostCents: cost };
}

export function paintFloor(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): Record<string, unknown> {
  const restaurant = assertOwner(db, restaurantId, account);
  const surfaceId = String(body.surfaceId ?? "");
  const surface = registry.content.construction.surfaces.find((item) => item.id === surfaceId);
  if (!surface) throw new ApiError(400, "Unknown floor surface.");
  const input = Array.isArray(body.cells) ? body.cells.slice(0, 512) : [];
  const unique = new Map<string, CellInput>();
  for (const value of input as any[]) {
    const cell = { x: integer(value.x, "cell x"), y: integer(value.y, "cell y") };
    ensureInside(restaurant, cell.x, cell.y);
    unique.set(`${cell.x}:${cell.y}`, cell);
  }
  if (!unique.size) throw new ApiError(400, "Select at least one floor cell.");
  const cost = surface.costCents * unique.size;
  if (restaurant.treasury_cents < cost) throw new ApiError(409, "Restaurant treasury cannot cover this floor purchase.");
  const now = Date.now();
  transaction(db, () => {
    const update = db.prepare("UPDATE floor_cells SET surface_id = ?, room_tag = COALESCE(?, room_tag), updated_at = ? WHERE restaurant_id = ? AND grid_x = ? AND grid_y = ?");
    for (const cell of unique.values()) update.run(surfaceId, body.roomTag ? String(body.roomTag).slice(0, 20) : null, now, restaurantId, cell.x, cell.y);
    db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents - ? WHERE id = ?").run(cost, restaurantId);
    db.prepare("INSERT INTO ledger_entries (id, restaurant_id, character_id, category, amount_cents, reference_type, reference_id, created_at) VALUES (?, ?, ?, 'construction', ?, 'surface', ?, ?)")
      .run(newId("ledger"), restaurantId, account.characterId, -cost, surfaceId, now);
  });
  return { costCents: cost, changed: unique.size, layout: getLayout(db, registry, restaurantId) };
}

export function upsertWall(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): Record<string, unknown> {
  const restaurant = assertOwner(db, restaurantId, account);
  const x = integer(body.x, "x");
  const y = integer(body.y, "y");
  ensureInside(restaurant, x, y);
  const edge = String(body.edge ?? "");
  if (!["north", "east", "south", "west"].includes(edge)) throw new ApiError(400, "Unknown wall edge.");
  const styleId = String(body.wallStyleId ?? "");
  const style = registry.content.construction.wallStyles.find((item) => item.id === styleId);
  if (!style) throw new ApiError(400, "Unknown wall style.");
  const opening = String(body.openingType ?? "solid");
  if (!["solid", "door", "service-door", "window", "arch"].includes(opening)) throw new ApiError(400, "Unknown wall opening.");
  if (restaurant.treasury_cents < style.costCents) throw new ApiError(409, "Restaurant treasury cannot cover this wall purchase.");
  const now = Date.now();
  transaction(db, () => {
    db.prepare(`INSERT INTO wall_edges (id, restaurant_id, grid_x, grid_y, edge, wall_style_id, opening_type, rotation, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(restaurant_id, grid_x, grid_y, edge) DO UPDATE SET wall_style_id = excluded.wall_style_id, opening_type = excluded.opening_type, rotation = excluded.rotation, updated_at = excluded.updated_at`)
      .run(newId("wall"), restaurantId, x, y, edge, styleId, opening, normalizeRotation(body.rotation), now);
    db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents - ? WHERE id = ?").run(style.costCents, restaurantId);
  });
  return { costCents: style.costCents, layout: getLayout(db, registry, restaurantId) };
}

export function placeObject(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): Record<string, unknown> {
  const restaurant = assertOwner(db, restaurantId, account);
  const definition = registry.furnitureById.get(String(body.definitionId ?? ""));
  if (!definition) throw new ApiError(400, "Unknown furniture definition.");
  const x = integer(body.x, "x");
  const y = integer(body.y, "y");
  const rotation = normalizeRotation(body.rotation);
  const size = dimensions(definition, rotation);
  ensureInside(restaurant, x, y, size.width, size.height);
  assertClear(db, registry, restaurantId, x, y, size.width, size.height);
  if (restaurant.treasury_cents < definition.costCents) throw new ApiError(409, "Restaurant treasury cannot cover this purchase.");
  const id = newId("object");
  const now = Date.now();
  transaction(db, () => {
    db.prepare(`INSERT INTO object_instances
      (id, restaurant_id, definition_id, grid_x, grid_y, rotation, primary_color, secondary_color, placed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, restaurantId, definition.id, x, y, rotation, body.primaryColor ? String(body.primaryColor) : null, body.secondaryColor ? String(body.secondaryColor) : null, now, now);
    db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents - ? WHERE id = ?").run(definition.costCents, restaurantId);
    db.prepare("INSERT INTO ledger_entries (id, restaurant_id, character_id, category, amount_cents, reference_type, reference_id, created_at) VALUES (?, ?, ?, 'furniture', ?, 'object', ?, ?)")
      .run(newId("ledger"), restaurantId, account.characterId, -definition.costCents, id, now);
  });
  return { id, costCents: definition.costCents, layout: getLayout(db, registry, restaurantId) };
}

export function moveObject(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, objectId: string, body: Record<string, unknown>): Record<string, unknown> {
  const restaurant = assertOwner(db, restaurantId, account);
  const object = db.prepare("SELECT * FROM object_instances WHERE id = ? AND restaurant_id = ?").get(objectId, restaurantId) as any;
  if (!object) throw new ApiError(404, "Placed object not found.");
  const definition = registry.furnitureById.get(object.definition_id);
  if (!definition) throw new ApiError(409, "This object's content definition is unavailable.");
  const x = integer(body.x, "x");
  const y = integer(body.y, "y");
  const rotation = normalizeRotation(body.rotation);
  const size = dimensions(definition, rotation);
  ensureInside(restaurant, x, y, size.width, size.height);
  assertClear(db, registry, restaurantId, x, y, size.width, size.height, objectId);
  db.prepare("UPDATE object_instances SET grid_x = ?, grid_y = ?, rotation = ?, updated_at = ? WHERE id = ?").run(x, y, rotation, Date.now(), objectId);
  return { id: objectId, layout: getLayout(db, registry, restaurantId) };
}

export function repairObject(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, objectId: string): Record<string, unknown> {
  const restaurant = assertOwner(db, restaurantId, account);
  const object = db.prepare("SELECT * FROM object_instances WHERE id = ? AND restaurant_id = ?").get(objectId, restaurantId) as any;
  if (!object) throw new ApiError(404, "Placed object not found.");
  const definition = registry.furnitureById.get(object.definition_id);
  if (!definition) throw new ApiError(409, "This object's content definition is unavailable.");
  const wear = Math.max(0, Math.min(100, Number(object.wear) || 0));
  const broken = object.state === "broken" || wear >= 100;
  if (!broken && wear <= 0 && object.state === "operational") throw new ApiError(409, "This object does not need repair.");
  const fullRepairCost = Math.max(1, Math.round(definition.repairCostCents ?? definition.costCents * 0.22));
  const repairFraction = broken ? 1 : Math.max(0.05, wear / 100);
  const cost = Math.max(1, Math.round(fullRepairCost * repairFraction));
  if (restaurant.treasury_cents < cost) throw new ApiError(409, "Restaurant treasury cannot cover this repair.");
  const now = Date.now();
  transaction(db, () => {
    db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents - ? WHERE id = ?").run(cost, restaurantId);
    db.prepare("UPDATE object_instances SET state = 'operational', wear = 0, updated_at = ? WHERE id = ? AND restaurant_id = ?").run(now, objectId, restaurantId);
    db.prepare("INSERT INTO ledger_entries (id, restaurant_id, character_id, category, amount_cents, reference_type, reference_id, created_at) VALUES (?, ?, ?, 'furniture-repair', ?, 'object', ?, ?)")
      .run(newId("ledger"), restaurantId, account.characterId, -cost, objectId, now);
  });
  return { id: objectId, costCents: cost, state: "operational", wear: 0, layout: getLayout(db, registry, restaurantId) };
}

export function sellObject(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, objectId: string): Record<string, unknown> {
  assertOwner(db, restaurantId, account);
  const object = db.prepare("SELECT * FROM object_instances WHERE id = ? AND restaurant_id = ?").get(objectId, restaurantId) as any;
  if (!object) throw new ApiError(404, "Placed object not found.");
  const definition = registry.furnitureById.get(object.definition_id);
  const refund = Math.max(0, Math.round((definition?.costCents ?? 0) * 0.4 * (1 - object.wear / 150)));
  transaction(db, () => {
    db.prepare("DELETE FROM object_instances WHERE id = ?").run(objectId);
    db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents + ? WHERE id = ?").run(refund, restaurantId);
  });
  return { refundCents: refund, layout: getLayout(db, registry, restaurantId) };
}

export function expandRestaurant(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): Record<string, unknown> {
  const restaurant = assertOwner(db, restaurantId, account);
  const addWidth = integer(body.addWidth ?? 0, "addWidth");
  const addHeight = integer(body.addHeight ?? 0, "addHeight");
  if (addWidth < 0 || addHeight < 0 || addWidth + addHeight < 1 || addWidth > 12 || addHeight > 12) throw new ApiError(400, "An add-on may extend width and/or height by 1–12 cells.");
  const width = restaurant.build_width + addWidth;
  const height = restaurant.build_height + addHeight;
  if (width > 64 || height > 64) throw new ApiError(400, "V1 restaurants are limited to a 64×64 footprint.");
  const newCells = width * height - restaurant.build_width * restaurant.build_height;
  const cost = newCells * 25_000;
  if (restaurant.treasury_cents < cost) throw new ApiError(409, "Restaurant treasury cannot cover this add-on.");
  const now = Date.now();
  transaction(db, () => {
    db.prepare("UPDATE restaurants SET build_width = ?, build_height = ?, treasury_cents = treasury_cents - ? WHERE id = ?").run(width, height, cost, restaurantId);
    const insert = db.prepare("INSERT INTO floor_cells (restaurant_id, grid_x, grid_y, surface_id, room_tag, walkable, updated_at) VALUES (?, ?, ?, 'sealed-concrete', 'unassigned', 1, ?)");
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (x >= restaurant.build_width || y >= restaurant.build_height) insert.run(restaurantId, x, y, now);
      }
    }
  });
  return { width, height, costCents: cost, layout: getLayout(db, registry, restaurantId) };
}
