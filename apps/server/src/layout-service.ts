import { FURNITURE_WALL_EDGE_BY_ROTATION, type ContentRegistry } from "./content.js";
import { newId, transaction } from "./database.js";
import { aggregateFurnitureEffects, type FurnitureEffectsSummary } from "./furniture-effects.js";
import { canonicalWallSegment, canonicalWallSegmentKey, isCardinalEdge, type CardinalEdge } from "./layout-geometry.js";
import { ApiError, type AuthenticatedAccount, type Database, type FurnitureDefinition } from "./types.js";

type CellInput = { x: number; y: number };
type PlacedObjectRow = {
  id: string;
  definition_id: string;
  grid_x: number;
  grid_y: number;
  rotation: number;
};
type WallRow = {
  id: string;
  restaurant_id: string;
  grid_x: number;
  grid_y: number;
  edge: CardinalEdge;
  wall_style_id: string;
  opening_type: string;
  rotation: number;
  updated_at: number;
};
type LayoutState = {
  width: number;
  height: number;
  treasuryCents: number;
  cells: any[];
  walls: any[];
  objects: any[];
};
type AppliedLayoutOperation = {
  type: "floor" | "wall" | "place" | "move";
  costCents: number;
  changed?: number;
  id?: string;
  clientId?: string;
};

const MAX_STAGED_LAYOUT_OPERATIONS = 128;

function integer(value: unknown, label: string): number {
  const result = Number(value);
  if (!Number.isInteger(result)) throw new ApiError(400, `${label} must be an integer.`);
  return result;
}

function optionalExpectedRevision(body: Record<string, unknown>): number | undefined {
  if (!("expectedRevision" in body)) return undefined;
  const revision = integer(body.expectedRevision, "expectedRevision");
  if (revision < 0) throw new ApiError(400, "expectedRevision must be zero or greater.");
  return revision;
}

function currentLayoutRevision(db: Database, restaurantId: string): number {
  const row = db.prepare("SELECT layout_revision FROM restaurants WHERE id = ? AND status = 'active'").get(restaurantId) as { layout_revision?: number } | undefined;
  if (!row) throw new ApiError(404, "Restaurant not found.");
  return Number(row.layout_revision ?? 0);
}

function assertLayoutRevision(db: Database, restaurantId: string, expectedRevision: number | undefined): number {
  const currentRevision = currentLayoutRevision(db, restaurantId);
  if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
    throw new ApiError(
      409,
      "The restaurant layout changed in another editor. Refresh before applying this action.",
      "layout-revision-conflict",
      { expectedRevision, currentRevision },
    );
  }
  return currentRevision;
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

function wallMountEdge(rotation: number): CardinalEdge {
  const edge = FURNITURE_WALL_EDGE_BY_ROTATION[rotation as keyof typeof FURNITURE_WALL_EDGE_BY_ROTATION];
  if (!edge) throw new ApiError(409, "A wall-mounted object has an invalid persisted rotation.");
  return edge;
}

function footprintCells(definition: FurnitureDefinition, x: number, y: number, rotation: number): CellInput[] {
  if (definition.placement.mount === "wall") {
    const edge = wallMountEdge(rotation);
    const horizontal = edge === "north" || edge === "south";
    return Array.from({ length: definition.width }, (_, offset) => ({
      x: x + (horizontal ? offset : 0),
      y: y + (horizontal ? 0 : offset),
    }));
  }
  const size = dimensions(definition, rotation);
  const cells: CellInput[] = [];
  for (let cy = y; cy < y + size.height; cy += 1) {
    for (let cx = x; cx < x + size.width; cx += 1) cells.push({ x: cx, y: cy });
  }
  return cells;
}

function wallMapForRestaurant(db: Database, restaurantId: string): Map<string, string> {
  const walls = db.prepare("SELECT grid_x, grid_y, edge, opening_type FROM wall_edges WHERE restaurant_id = ?").all(restaurantId) as any[];
  return new Map(walls.map((wall) => [canonicalWallSegmentKey(Number(wall.grid_x), Number(wall.grid_y), String(wall.edge) as CardinalEdge), String(wall.opening_type)]));
}

function wallRowForSegment(db: Database, restaurantId: string, x: number, y: number, edge: CardinalEdge): WallRow | undefined {
  const key = canonicalWallSegmentKey(x, y, edge);
  return (db.prepare("SELECT * FROM wall_edges WHERE restaurant_id = ?").all(restaurantId) as WallRow[])
    .find((wall) => canonicalWallSegmentKey(wall.grid_x, wall.grid_y, wall.edge) === key);
}

function writeWallSegment(
  db: Database,
  restaurantId: string,
  location: { x: number; y: number; edge: CardinalEdge },
  wall: { wallStyleId: string; openingType: string; rotation: number; updatedAt: number },
): { id: string; created: boolean } {
  const existing = wallRowForSegment(db, restaurantId, location.x, location.y, location.edge);
  if (existing) {
    db.prepare(`UPDATE wall_edges
      SET grid_x = ?, grid_y = ?, edge = ?, wall_style_id = ?, opening_type = ?, rotation = ?, updated_at = ?
      WHERE id = ?`)
      .run(location.x, location.y, location.edge, wall.wallStyleId, wall.openingType, wall.rotation, wall.updatedAt, existing.id);
    return { id: existing.id, created: false };
  }
  const id = newId("wall");
  db.prepare(`INSERT INTO wall_edges
    (id, restaurant_id, grid_x, grid_y, edge, wall_style_id, opening_type, rotation, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, restaurantId, location.x, location.y, location.edge, wall.wallStyleId, wall.openingType, wall.rotation, wall.updatedAt);
  return { id, created: true };
}

function wallSupportFailure(
  definition: FurnitureDefinition,
  x: number,
  y: number,
  rotation: number,
  wallMap: Map<string, string>,
): { kind: "missing" | "opening"; x: number; y: number; edge: CardinalEdge; opening?: string } | null {
  if (definition.placement.mount !== "wall") return null;
  const edge = wallMountEdge(rotation);
  const allowed = new Set<string>(definition.placement.allowedWallOpenings ?? []);
  for (const cell of footprintCells(definition, x, y, rotation)) {
    const opening = wallMap.get(canonicalWallSegmentKey(cell.x, cell.y, edge));
    if (opening === undefined) return { kind: "missing", x: cell.x, y: cell.y, edge };
    if (!allowed.has(opening)) return { kind: "opening", x: cell.x, y: cell.y, edge, opening };
  }
  return null;
}

function assertLegalMountSupport(
  db: Database,
  restaurantId: string,
  definition: FurnitureDefinition,
  x: number,
  y: number,
  rotation: number,
): void {
  const failure = wallSupportFailure(definition, x, y, rotation, wallMapForRestaurant(db, restaurantId));
  if (!failure) return;
  if (failure.kind === "missing") {
    throw new ApiError(409, "A wall-mounted object requires a supporting wall along its full span.");
  }
  throw new ApiError(409, `A ${failure.opening} opening cannot support this wall-mounted object.`);
}

function wallSupportKeys(definition: FurnitureDefinition, x: number, y: number, rotation: number): Set<string> {
  if (definition.placement.mount !== "wall") return new Set();
  const edge = wallMountEdge(rotation);
  return new Set(footprintCells(definition, x, y, rotation)
    .map((cell) => canonicalWallSegmentKey(cell.x, cell.y, edge)));
}

function assertWallChangePreservesMountedObjects(
  db: Database,
  registry: ContentRegistry,
  restaurantId: string,
  x: number,
  y: number,
  edge: CardinalEdge,
  opening: string,
): void {
  const changedKey = canonicalWallSegmentKey(x, y, edge);
  const wallMap = wallMapForRestaurant(db, restaurantId);
  wallMap.set(changedKey, opening);
  const objects = db.prepare("SELECT id, definition_id, grid_x, grid_y, rotation FROM object_instances WHERE restaurant_id = ?").all(restaurantId) as PlacedObjectRow[];
  for (const object of objects) {
    const definition = registry.furnitureById.get(object.definition_id);
    if (!definition || definition.placement.mount !== "wall") continue;
    if (!wallSupportKeys(definition, object.grid_x, object.grid_y, object.rotation).has(changedKey)) continue;
    if (wallSupportFailure(definition, object.grid_x, object.grid_y, object.rotation, wallMap)) {
      throw new ApiError(409, "That wall change would leave a mounted object without legal support.");
    }
  }
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

function assertLayoutEditable(db: Database, restaurantId: string): void {
  const live = db.prepare("SELECT 1 FROM service_shifts WHERE restaurant_id = ? AND state IN ('crew-call', 'open', 'closing') LIMIT 1").get(restaurantId);
  if (live) throw new ApiError(409, "Restaurant layout is locked while a live shift is active.");
}

function uniqueWallRows(rows: WallRow[]): WallRow[] {
  const bySegment = new Map<string, WallRow>();
  for (const row of rows) {
    const key = canonicalWallSegmentKey(Number(row.grid_x), Number(row.grid_y), row.edge);
    const current = bySegment.get(key);
    if (!current
      || Number(row.updated_at) > Number(current.updated_at)
      || (Number(row.updated_at) === Number(current.updated_at) && row.id.localeCompare(current.id) > 0)) {
      bySegment.set(key, row);
    }
  }
  return [...bySegment.values()].sort((left, right) => (
    Number(left.grid_y) - Number(right.grid_y)
    || Number(left.grid_x) - Number(right.grid_x)
    || String(left.edge).localeCompare(String(right.edge))
  ));
}

function captureLayoutState(db: Database, restaurantId: string): LayoutState {
  const restaurant = restaurantRow(db, restaurantId);
  return {
    width: restaurant.build_width,
    height: restaurant.build_height,
    treasuryCents: restaurant.treasury_cents,
    cells: db.prepare("SELECT * FROM floor_cells WHERE restaurant_id = ? ORDER BY grid_y, grid_x").all(restaurantId) as any[],
    walls: uniqueWallRows(db.prepare("SELECT * FROM wall_edges WHERE restaurant_id = ? ORDER BY grid_y, grid_x, edge").all(restaurantId) as WallRow[]),
    objects: db.prepare("SELECT * FROM object_instances WHERE restaurant_id = ? ORDER BY placed_at, id").all(restaurantId) as any[],
  };
}

function restoreLayoutState(db: Database, restaurantId: string, state: LayoutState): void {
  db.prepare("DELETE FROM object_instances WHERE restaurant_id = ?").run(restaurantId);
  db.prepare("DELETE FROM wall_edges WHERE restaurant_id = ?").run(restaurantId);
  db.prepare("DELETE FROM floor_cells WHERE restaurant_id = ?").run(restaurantId);
  db.prepare("UPDATE restaurants SET build_width = ?, build_height = ?, treasury_cents = ? WHERE id = ?")
    .run(state.width, state.height, state.treasuryCents, restaurantId);
  const insertCell = db.prepare("INSERT INTO floor_cells (restaurant_id, grid_x, grid_y, surface_id, room_tag, walkable, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
  for (const row of state.cells) insertCell.run(restaurantId, row.grid_x, row.grid_y, row.surface_id, row.room_tag, row.walkable, row.updated_at);
  const insertWall = db.prepare("INSERT INTO wall_edges (id, restaurant_id, grid_x, grid_y, edge, wall_style_id, opening_type, rotation, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  for (const row of uniqueWallRows(state.walls as WallRow[])) insertWall.run(row.id, restaurantId, row.grid_x, row.grid_y, row.edge, row.wall_style_id, row.opening_type, row.rotation, row.updated_at);
  const insertObject = db.prepare(`INSERT INTO object_instances
    (id, restaurant_id, definition_id, grid_x, grid_y, rotation, state, wear, primary_color, secondary_color, placed_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const row of state.objects) insertObject.run(row.id, restaurantId, row.definition_id, row.grid_x, row.grid_y, row.rotation, row.state, row.wear, row.primary_color, row.secondary_color, row.placed_at, row.updated_at);
}

function historyState(db: Database, restaurantId: string): Record<string, unknown> {
  const undo = db.prepare("SELECT id, action FROM layout_history WHERE restaurant_id = ? AND undone_at IS NULL ORDER BY id DESC LIMIT 1").get(restaurantId) as any;
  const redo = db.prepare("SELECT id, action FROM layout_history WHERE restaurant_id = ? AND undone_at IS NOT NULL ORDER BY id ASC LIMIT 1").get(restaurantId) as any;
  return {
    canUndo: Boolean(undo),
    canRedo: Boolean(redo),
    undoAction: undo?.action ?? null,
    redoAction: redo?.action ?? null,
    revision: currentLayoutRevision(db, restaurantId),
  };
}

const PASSABLE_OPENINGS = new Set(["door", "service-door", "arch"]);
const CARDINAL_STEPS = [
  { dx: 0, dy: -1, edge: "north" },
  { dx: 1, dy: 0, edge: "east" },
  { dx: 0, dy: 1, edge: "south" },
  { dx: -1, dy: 0, edge: "west" },
] as const;

function validateLayoutState(db: Database, registry: ContentRegistry, restaurantId: string): Record<string, unknown> {
  const restaurant = restaurantRow(db, restaurantId);
  const walls = db.prepare("SELECT grid_x, grid_y, edge, opening_type FROM wall_edges WHERE restaurant_id = ?").all(restaurantId) as any[];
  const objects = db.prepare("SELECT id, definition_id, grid_x, grid_y, rotation FROM object_instances WHERE restaurant_id = ?").all(restaurantId) as PlacedObjectRow[];
  const wallMap = new Map(walls.map((wall) => [canonicalWallSegmentKey(Number(wall.grid_x), Number(wall.grid_y), String(wall.edge) as CardinalEdge), String(wall.opening_type)]));
  const blocked = new Set<string>();
  const objectFootprints = new Map<string, Set<string>>();
  const invalidMountObjectIds: string[] = [];
  const overlappingObjectIds = new Set<string>();
  const occupiedByMount = new Map<string, Map<string, string>>();
  for (const object of objects) {
    const definition = registry.furnitureById.get(object.definition_id);
    if (!definition) continue;
    const footprint = new Set<string>();
    const mountOccupancy = occupiedByMount.get(definition.placement.mount) ?? new Map<string, string>();
    occupiedByMount.set(definition.placement.mount, mountOccupancy);
    for (const cell of footprintCells(definition, object.grid_x, object.grid_y, object.rotation)) {
      const key = `${cell.x}:${cell.y}`;
      if (definition.placement.mount === "floor" && definition.placement.occupancy === "blocking") blocked.add(key);
      const previousObjectId = mountOccupancy.get(key);
      if (previousObjectId) {
        overlappingObjectIds.add(previousObjectId);
        overlappingObjectIds.add(object.id);
      } else {
        mountOccupancy.set(key, object.id);
      }
      footprint.add(key);
    }
    objectFootprints.set(object.id, footprint);
    if (wallSupportFailure(definition, object.grid_x, object.grid_y, object.rotation, wallMap)) invalidMountObjectIds.push(object.id);
  }

  const missingPerimeter: string[] = [];
  const exits: Array<{ x: number; y: number; edge: string; openingType: string; blocked: boolean }> = [];
  const checkBoundary = (x: number, y: number, edge: CardinalEdge): void => {
    const openingType = wallMap.get(canonicalWallSegmentKey(x, y, edge));
    if (!openingType) missingPerimeter.push(`${x}:${y}:${edge}`);
    else if (PASSABLE_OPENINGS.has(openingType)) exits.push({ x, y, edge, openingType, blocked: blocked.has(`${x}:${y}`) });
  };
  for (let x = 0; x < restaurant.build_width; x += 1) {
    checkBoundary(x, 0, "north");
    checkBoundary(x, restaurant.build_height - 1, "south");
  }
  for (let y = 0; y < restaurant.build_height; y += 1) {
    checkBoundary(0, y, "west");
    checkBoundary(restaurant.build_width - 1, y, "east");
  }

  const usableExits = exits.filter((exit) => !exit.blocked);
  const reachable = new Set<string>();
  const queue: Array<{ x: number; y: number }> = usableExits.map(({ x, y }) => ({ x, y }));
  const crossingBlocked = (x: number, y: number, edge: CardinalEdge): boolean => {
    const opening = wallMap.get(canonicalWallSegmentKey(x, y, edge));
    return opening !== undefined && !PASSABLE_OPENINGS.has(opening);
  };
  while (queue.length) {
    const current = queue.shift()!;
    const key = `${current.x}:${current.y}`;
    if (reachable.has(key) || blocked.has(key)) continue;
    if (current.x < 0 || current.y < 0 || current.x >= restaurant.build_width || current.y >= restaurant.build_height) continue;
    reachable.add(key);
    for (const step of CARDINAL_STEPS) {
      const nx = current.x + step.dx;
      const ny = current.y + step.dy;
      if (nx < 0 || ny < 0 || nx >= restaurant.build_width || ny >= restaurant.build_height) continue;
      if (!crossingBlocked(current.x, current.y, step.edge)) queue.push({ x: nx, y: ny });
    }
  }

  const walkableCells = restaurant.build_width * restaurant.build_height - blocked.size;
  const inaccessibleObjects = objects.filter((object) => {
    const definition = registry.furnitureById.get(object.definition_id);
    if (!definition || definition.placement.serviceAccess === "none") return false;
    const footprint = objectFootprints.get(object.id) ?? new Set<string>();
    for (const key of footprint) {
      const [x = 0, y = 0] = key.split(":").map(Number);
      for (const step of CARDINAL_STEPS) if (reachable.has(`${x + step.dx}:${y + step.dy}`)) return false;
    }
    return true;
  }).map((object) => object.id);
  const errors: Array<{ code: string; message: string; count?: number }> = [];
  const warnings: Array<{ code: string; message: string; count?: number }> = [];
  if (missingPerimeter.length) errors.push({ code: "open-perimeter", message: "The restaurant perimeter has unbuilt wall edges.", count: missingPerimeter.length });
  if (!exits.length) errors.push({ code: "no-egress", message: "Add at least one exterior door or arch." });
  else if (!usableExits.length) errors.push({ code: "blocked-egress", message: "Every exterior exit is blocked by furniture." });
  else if (usableExits.length < 2) warnings.push({ code: "single-egress", message: "Only one usable exterior exit remains." });
  if (reachable.size < walkableCells) errors.push({ code: "unreachable-floor", message: "Some unoccupied floor cells cannot reach an exterior exit.", count: walkableCells - reachable.size });
  if (inaccessibleObjects.length) errors.push({ code: "inaccessible-object", message: "Some placed objects have no reachable interaction edge.", count: inaccessibleObjects.length });
  if (invalidMountObjectIds.length) errors.push({ code: "invalid-object-mount", message: "Some mounted objects have missing or incompatible support.", count: invalidMountObjectIds.length });
  if (overlappingObjectIds.size) errors.push({ code: "overlapping-object", message: "Some objects overlap another object in the same mount layer.", count: overlappingObjectIds.size });
  return {
    validForService: errors.length === 0,
    errors,
    warnings,
    usableExits: usableExits.length,
    exteriorOpenings: exits.length,
    reachableCells: reachable.size,
    walkableCells,
    missingPerimeterEdges: missingPerimeter.length,
    inaccessibleObjectIds: inaccessibleObjects,
    invalidMountObjectIds,
    overlappingObjectIds: [...overlappingObjectIds],
  };
}

export function validateLayout(db: Database, registry: ContentRegistry, restaurantId: string): Record<string, unknown> {
  ensureLayout(db, registry, restaurantId);
  return validateLayoutState(db, registry, restaurantId);
}

function recordLayoutMutation<T>(db: Database, restaurantId: string, account: AuthenticatedAccount, action: string, expectedRevision: number | undefined, work: () => T): T {
  return transaction(db, () => {
    const revision = assertLayoutRevision(db, restaurantId, expectedRevision);
    const before = captureLayoutState(db, restaurantId);
    db.prepare("DELETE FROM layout_history WHERE restaurant_id = ? AND undone_at IS NOT NULL").run(restaurantId);
    const result = work();
    const after = captureLayoutState(db, restaurantId);
    db.prepare("INSERT INTO layout_history (restaurant_id, character_id, action, before_json, after_json, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(restaurantId, account.characterId, action, JSON.stringify(before), JSON.stringify(after), Date.now());
    const advanced = db.prepare("UPDATE restaurants SET layout_revision = layout_revision + 1 WHERE id = ? AND layout_revision = ?").run(restaurantId, revision);
    if (advanced.changes !== 1) {
      throw new ApiError(409, "The restaurant layout changed in another editor. Refresh before applying this action.", "layout-revision-conflict", { expectedRevision: revision });
    }
    return result;
  });
}

function ensureInside(row: any, x: number, y: number, width = 1, height = 1): void {
  if (x < 0 || y < 0 || x + width > row.build_width || y + height > row.build_height) {
    throw new ApiError(400, "The placement must remain inside the restaurant footprint.");
  }
}

function occupiedCells(db: Database, registry: ContentRegistry, restaurantId: string, mount: FurnitureDefinition["placement"]["mount"], exceptId?: string): Set<string> {
  const occupied = new Set<string>();
  const rows = db.prepare("SELECT * FROM object_instances WHERE restaurant_id = ? AND id <> ?").all(restaurantId, exceptId ?? "") as PlacedObjectRow[];
  for (const row of rows) {
    const definition = registry.furnitureById.get(row.definition_id);
    if (!definition || definition.placement.mount !== mount) continue;
    for (const cell of footprintCells(definition, row.grid_x, row.grid_y, row.rotation)) occupied.add(`${cell.x}:${cell.y}`);
  }
  return occupied;
}

function assertClear(db: Database, registry: ContentRegistry, restaurantId: string, definition: FurnitureDefinition, x: number, y: number, rotation: number, exceptId?: string): void {
  const occupied = occupiedCells(db, registry, restaurantId, definition.placement.mount, exceptId);
  for (const cell of footprintCells(definition, x, y, rotation)) {
    if (occupied.has(`${cell.x}:${cell.y}`)) throw new ApiError(409, `That ${definition.placement.mount}-mount footprint overlaps another object.`);
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
      ["pass", row.build_width - 9, 12, 0], ["dish-machine", row.build_width - 4, 11, 90], ["plants", 3, 0, 0],
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
    walls: db.prepare("SELECT id, grid_x AS x, grid_y AS y, edge, wall_style_id AS wallStyleId, opening_type AS openingType, rotation FROM wall_edges WHERE restaurant_id = ? ORDER BY grid_y, grid_x, edge, id").all(restaurantId),
    objects: db.prepare("SELECT id, definition_id AS definitionId, grid_x AS x, grid_y AS y, rotation, state, wear, primary_color AS primaryColor, secondary_color AS secondaryColor FROM object_instances WHERE restaurant_id = ? ORDER BY placed_at, id").all(restaurantId),
    furnitureEffects: getFurnitureEffects(db, registry, restaurantId),
    revision: Number(restaurant.layout_revision ?? 0),
    history: historyState(db, restaurantId),
    validation: validateLayoutState(db, registry, restaurantId),
  };
}

export function getFurnitureEffects(db: Database, registry: ContentRegistry, restaurantId: string): FurnitureEffectsSummary {
  restaurantRow(db, restaurantId);
  const instances = db.prepare("SELECT definition_id AS definitionId, wear, state FROM object_instances WHERE restaurant_id = ? ORDER BY placed_at, id").all(restaurantId) as Array<{ definitionId: string; wear: number; state: string }>;
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
  assertOwner(db, restaurantId, account);
  const expectedRevision = optionalExpectedRevision(body);
  const result = recordLayoutMutation(db, restaurantId, account, "paint floor", expectedRevision, () => applyFloorOperation(db, registry, account, restaurantId, body));
  return { ...result, layout: getLayout(db, registry, restaurantId) };
}

function applyFloorOperation(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): AppliedLayoutOperation {
  const restaurant = assertOwner(db, restaurantId, account);
  assertLayoutEditable(db, restaurantId);
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
  const update = db.prepare("UPDATE floor_cells SET surface_id = ?, room_tag = COALESCE(?, room_tag), updated_at = ? WHERE restaurant_id = ? AND grid_x = ? AND grid_y = ?");
  for (const cell of unique.values()) update.run(surfaceId, body.roomTag ? String(body.roomTag).slice(0, 20) : null, now, restaurantId, cell.x, cell.y);
  db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents - ? WHERE id = ?").run(cost, restaurantId);
  db.prepare("INSERT INTO ledger_entries (id, restaurant_id, character_id, category, amount_cents, reference_type, reference_id, created_at) VALUES (?, ?, ?, 'construction', ?, 'surface', ?, ?)")
    .run(newId("ledger"), restaurantId, account.characterId, -cost, surfaceId, now);
  return { type: "floor", costCents: cost, changed: unique.size };
}

export function upsertWall(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): Record<string, unknown> {
  assertOwner(db, restaurantId, account);
  const expectedRevision = optionalExpectedRevision(body);
  const opening = String(body.openingType ?? "solid");
  const result = recordLayoutMutation(db, restaurantId, account, opening === "solid" ? "build wall" : `build ${opening}`, expectedRevision, () => applyWallOperation(db, registry, account, restaurantId, body));
  return { ...result, layout: getLayout(db, registry, restaurantId) };
}

function applyWallOperation(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): AppliedLayoutOperation {
  const restaurant = assertOwner(db, restaurantId, account);
  assertLayoutEditable(db, restaurantId);
  const x = integer(body.x, "x");
  const y = integer(body.y, "y");
  ensureInside(restaurant, x, y);
  const edgeValue = String(body.edge ?? "");
  if (!isCardinalEdge(edgeValue)) throw new ApiError(400, "Unknown wall edge.");
  const edge = edgeValue;
  const styleId = String(body.wallStyleId ?? "");
  const style = registry.content.construction.wallStyles.find((item) => item.id === styleId);
  if (!style) throw new ApiError(400, "Unknown wall style.");
  const opening = String(body.openingType ?? "solid");
  if (!["solid", "door", "service-door", "window", "arch"].includes(opening)) throw new ApiError(400, "Unknown wall opening.");
  const rotation = normalizeRotation(body.rotation);
  assertWallChangePreservesMountedObjects(db, registry, restaurantId, x, y, edge, opening);
  if (restaurant.treasury_cents < style.costCents) throw new ApiError(409, "Restaurant treasury cannot cover this wall purchase.");
  const now = Date.now();
  writeWallSegment(db, restaurantId, { x, y, edge }, {
    wallStyleId: styleId,
    openingType: opening,
    rotation,
    updatedAt: now,
  });
  db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents - ? WHERE id = ?").run(style.costCents, restaurantId);
  return { type: "wall", costCents: style.costCents };
}

export function placeObject(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): Record<string, unknown> {
  assertOwner(db, restaurantId, account);
  const expectedRevision = optionalExpectedRevision(body);
  const result = recordLayoutMutation(db, restaurantId, account, "place object", expectedRevision, () => applyPlaceOperation(db, registry, account, restaurantId, body));
  return { ...result, layout: getLayout(db, registry, restaurantId) };
}

function applyPlaceOperation(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): AppliedLayoutOperation {
  const restaurant = assertOwner(db, restaurantId, account);
  assertLayoutEditable(db, restaurantId);
  const definition = registry.furnitureById.get(String(body.definitionId ?? ""));
  if (!definition) throw new ApiError(400, "Unknown furniture definition.");
  const x = integer(body.x, "x");
  const y = integer(body.y, "y");
  const rotation = normalizeRotation(body.rotation);
  for (const cell of footprintCells(definition, x, y, rotation)) ensureInside(restaurant, cell.x, cell.y);
  assertClear(db, registry, restaurantId, definition, x, y, rotation);
  assertLegalMountSupport(db, restaurantId, definition, x, y, rotation);
  if (restaurant.treasury_cents < definition.costCents) throw new ApiError(409, "Restaurant treasury cannot cover this purchase.");
  const id = newId("object");
  const now = Date.now();
  db.prepare(`INSERT INTO object_instances
    (id, restaurant_id, definition_id, grid_x, grid_y, rotation, primary_color, secondary_color, placed_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, restaurantId, definition.id, x, y, rotation, body.primaryColor ? String(body.primaryColor) : null, body.secondaryColor ? String(body.secondaryColor) : null, now, now);
  db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents - ? WHERE id = ?").run(definition.costCents, restaurantId);
  db.prepare("INSERT INTO ledger_entries (id, restaurant_id, character_id, category, amount_cents, reference_type, reference_id, created_at) VALUES (?, ?, ?, 'furniture', ?, 'object', ?, ?)")
    .run(newId("ledger"), restaurantId, account.characterId, -definition.costCents, id, now);
  const clientId = body.clientId ? String(body.clientId).slice(0, 64) : undefined;
  return clientId
    ? { type: "place", id, clientId, costCents: definition.costCents }
    : { type: "place", id, costCents: definition.costCents };
}

export function moveObject(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, objectId: string, body: Record<string, unknown>): Record<string, unknown> {
  assertOwner(db, restaurantId, account);
  const expectedRevision = optionalExpectedRevision(body);
  const result = recordLayoutMutation(db, restaurantId, account, "move object", expectedRevision, () => applyMoveOperation(db, registry, account, restaurantId, objectId, body));
  return { ...result, layout: getLayout(db, registry, restaurantId) };
}

function applyMoveOperation(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, objectId: string, body: Record<string, unknown>): AppliedLayoutOperation {
  const restaurant = assertOwner(db, restaurantId, account);
  assertLayoutEditable(db, restaurantId);
  const object = db.prepare("SELECT * FROM object_instances WHERE id = ? AND restaurant_id = ?").get(objectId, restaurantId) as any;
  if (!object) throw new ApiError(404, "Placed object not found.");
  const definition = registry.furnitureById.get(object.definition_id);
  if (!definition) throw new ApiError(409, "This object's content definition is unavailable.");
  const x = integer(body.x, "x");
  const y = integer(body.y, "y");
  const rotation = normalizeRotation(body.rotation);
  for (const cell of footprintCells(definition, x, y, rotation)) ensureInside(restaurant, cell.x, cell.y);
  assertClear(db, registry, restaurantId, definition, x, y, rotation, objectId);
  assertLegalMountSupport(db, restaurantId, definition, x, y, rotation);
  db.prepare("UPDATE object_instances SET grid_x = ?, grid_y = ?, rotation = ?, updated_at = ? WHERE id = ?").run(x, y, rotation, Date.now(), objectId);
  return { type: "move", id: objectId, costCents: 0 };
}

export function commitStagedLayout(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): Record<string, unknown> {
  assertOwner(db, restaurantId, account);
  const expectedRevision = optionalExpectedRevision(body);
  const rawOperations = body.operations;
  if (!Array.isArray(rawOperations) || rawOperations.length < 1) throw new ApiError(400, "Stage at least one layout edit before committing.");
  if (rawOperations.length > MAX_STAGED_LAYOUT_OPERATIONS) throw new ApiError(400, `A staged commit is limited to ${MAX_STAGED_LAYOUT_OPERATIONS} edits.`);
  const operations = rawOperations.map((operation, index) => {
    if (!operation || typeof operation !== "object" || Array.isArray(operation)) throw new ApiError(400, `Staged edit ${index + 1} must be an object.`);
    return operation as Record<string, unknown>;
  });
  const results = recordLayoutMutation(db, restaurantId, account, `commit ${operations.length} staged edits`, expectedRevision, () => operations.map((operation, index) => {
    const type = String(operation.type ?? "");
    if (type === "floor") return applyFloorOperation(db, registry, account, restaurantId, operation);
    if (type === "wall") return applyWallOperation(db, registry, account, restaurantId, operation);
    if (type === "place") return applyPlaceOperation(db, registry, account, restaurantId, operation);
    if (type === "move") {
      const objectId = String(operation.id ?? "");
      if (!objectId) throw new ApiError(400, `Staged move ${index + 1} requires an object id.`);
      return applyMoveOperation(db, registry, account, restaurantId, objectId, operation);
    }
    throw new ApiError(400, `Unknown staged layout edit type at position ${index + 1}.`);
  }));
  return {
    operationCount: results.length,
    costCents: results.reduce((total, result) => total + result.costCents, 0),
    results,
    layout: getLayout(db, registry, restaurantId),
  };
}

export function repairObject(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, objectId: string, body: Record<string, unknown> = {}): Record<string, unknown> {
  const restaurant = assertOwner(db, restaurantId, account);
  const expectedRevision = optionalExpectedRevision(body);
  assertLayoutRevision(db, restaurantId, expectedRevision);
  assertLayoutEditable(db, restaurantId);
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
  recordLayoutMutation(db, restaurantId, account, "repair object", expectedRevision, () => {
    db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents - ? WHERE id = ?").run(cost, restaurantId);
    db.prepare("UPDATE object_instances SET state = 'operational', wear = 0, updated_at = ? WHERE id = ? AND restaurant_id = ?").run(now, objectId, restaurantId);
    db.prepare("INSERT INTO ledger_entries (id, restaurant_id, character_id, category, amount_cents, reference_type, reference_id, created_at) VALUES (?, ?, ?, 'furniture-repair', ?, 'object', ?, ?)")
      .run(newId("ledger"), restaurantId, account.characterId, -cost, objectId, now);
  });
  return { id: objectId, costCents: cost, state: "operational", wear: 0, layout: getLayout(db, registry, restaurantId) };
}

export function sellObject(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, objectId: string, body: Record<string, unknown> = {}): Record<string, unknown> {
  assertOwner(db, restaurantId, account);
  const expectedRevision = optionalExpectedRevision(body);
  assertLayoutRevision(db, restaurantId, expectedRevision);
  assertLayoutEditable(db, restaurantId);
  const object = db.prepare("SELECT * FROM object_instances WHERE id = ? AND restaurant_id = ?").get(objectId, restaurantId) as any;
  if (!object) throw new ApiError(404, "Placed object not found.");
  const definition = registry.furnitureById.get(object.definition_id);
  const refund = Math.max(0, Math.round((definition?.costCents ?? 0) * 0.4 * (1 - object.wear / 150)));
  recordLayoutMutation(db, restaurantId, account, "sell object", expectedRevision, () => {
    db.prepare("DELETE FROM object_instances WHERE id = ?").run(objectId);
    db.prepare("UPDATE restaurants SET treasury_cents = treasury_cents + ? WHERE id = ?").run(refund, restaurantId);
  });
  return { refundCents: refund, layout: getLayout(db, registry, restaurantId) };
}

export function expandRestaurant(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown>): Record<string, unknown> {
  const restaurant = assertOwner(db, restaurantId, account);
  const expectedRevision = optionalExpectedRevision(body);
  assertLayoutRevision(db, restaurantId, expectedRevision);
  assertLayoutEditable(db, restaurantId);
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
  let relocatedWalls = 0;
  let addedPerimeterWalls = 0;
  let relocatedMounts = 0;
  recordLayoutMutation(db, restaurantId, account, "expand restaurant", expectedRevision, () => {
    const oldWidth = Number(restaurant.build_width);
    const oldHeight = Number(restaurant.build_height);
    const walls = db.prepare("SELECT * FROM wall_edges WHERE restaurant_id = ?").all(restaurantId) as WallRow[];
    const segments = walls.map((wall) => ({ wall, segment: canonicalWallSegment(wall.grid_x, wall.grid_y, wall.edge) }));

    if (addWidth > 0) {
      for (const { wall, segment } of segments) {
        if (segment.axis !== "vertical" || segment.x !== oldWidth || segment.y < 0 || segment.y >= oldHeight) continue;
        db.prepare("UPDATE wall_edges SET grid_x = ?, grid_y = ?, edge = 'east', rotation = 90, updated_at = ? WHERE id = ?")
          .run(width - 1, segment.y, now, wall.id);
        relocatedWalls += 1;
      }
    }
    if (addHeight > 0) {
      for (const { wall, segment } of segments) {
        if (segment.axis !== "horizontal" || segment.y !== oldHeight || segment.x < 0 || segment.x >= oldWidth) continue;
        db.prepare("UPDATE wall_edges SET grid_x = ?, grid_y = ?, edge = 'south', rotation = 180, updated_at = ? WHERE id = ?")
          .run(segment.x, height - 1, now, wall.id);
        relocatedWalls += 1;
      }
    }

    const perimeterStyle = (x: number, y: number, edge: CardinalEdge): string => (
      wallRowForSegment(db, restaurantId, x, y, edge)?.wall_style_id ?? "painted-plaster"
    );
    const addSolidPerimeter = (x: number, y: number, edge: CardinalEdge, styleSource: { x: number; y: number; edge: CardinalEdge }): void => {
      const result = writeWallSegment(db, restaurantId, { x, y, edge }, {
        wallStyleId: perimeterStyle(styleSource.x, styleSource.y, styleSource.edge),
        openingType: "solid",
        rotation: edge === "north" ? 0 : edge === "east" ? 90 : edge === "south" ? 180 : 270,
        updatedAt: now,
      });
      if (result.created) addedPerimeterWalls += 1;
    };
    if (addWidth > 0) {
      for (let x = oldWidth; x < width; x += 1) {
        addSolidPerimeter(x, 0, "north", { x: oldWidth - 1, y: 0, edge: "north" });
        addSolidPerimeter(x, height - 1, "south", { x: oldWidth - 1, y: height - 1, edge: "south" });
      }
    }
    if (addHeight > 0) {
      for (let y = oldHeight; y < height; y += 1) {
        addSolidPerimeter(0, y, "west", { x: 0, y: oldHeight - 1, edge: "west" });
        addSolidPerimeter(width - 1, y, "east", { x: width - 1, y: oldHeight - 1, edge: "east" });
      }
    }

    const objects = db.prepare("SELECT id, definition_id, grid_x, grid_y, rotation FROM object_instances WHERE restaurant_id = ?").all(restaurantId) as PlacedObjectRow[];
    for (const object of objects) {
      const definition = registry.furnitureById.get(object.definition_id);
      if (!definition || definition.placement.mount !== "wall") continue;
      const edge = wallMountEdge(object.rotation);
      const footprint = footprintCells(definition, object.grid_x, object.grid_y, object.rotation);
      const moveEast = addWidth > 0 && edge === "east" && footprint.every((cell) => cell.x === oldWidth - 1);
      const moveSouth = addHeight > 0 && edge === "south" && footprint.every((cell) => cell.y === oldHeight - 1);
      if (!moveEast && !moveSouth) continue;
      const nextX = object.grid_x + (moveEast ? addWidth : 0);
      const nextY = object.grid_y + (moveSouth ? addHeight : 0);
      db.prepare("UPDATE object_instances SET grid_x = ?, grid_y = ?, updated_at = ? WHERE id = ?")
        .run(nextX, nextY, now, object.id);
      relocatedMounts += 1;
    }

    db.prepare("UPDATE restaurants SET build_width = ?, build_height = ?, treasury_cents = treasury_cents - ? WHERE id = ?").run(width, height, cost, restaurantId);
    const insert = db.prepare("INSERT INTO floor_cells (restaurant_id, grid_x, grid_y, surface_id, room_tag, walkable, updated_at) VALUES (?, ?, ?, 'sealed-concrete', 'unassigned', 1, ?)");
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (x >= restaurant.build_width || y >= restaurant.build_height) insert.run(restaurantId, x, y, now);
      }
    }
    const updatedWallMap = wallMapForRestaurant(db, restaurantId);
    const mountedObjects = db.prepare("SELECT id, definition_id, grid_x, grid_y, rotation FROM object_instances WHERE restaurant_id = ?").all(restaurantId) as PlacedObjectRow[];
    for (const object of mountedObjects) {
      const definition = registry.furnitureById.get(object.definition_id);
      if (!definition || definition.placement.mount !== "wall") continue;
      if (wallSupportFailure(definition, object.grid_x, object.grid_y, object.rotation, updatedWallMap)) {
        throw new ApiError(409, "Expansion could not preserve legal support for every wall-mounted object.");
      }
    }
  });
  return { width, height, costCents: cost, relocatedWalls, addedPerimeterWalls, relocatedMounts, layout: getLayout(db, registry, restaurantId) };
}

function applyHistoryState(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, direction: "undo" | "redo", body: Record<string, unknown>): Record<string, unknown> {
  assertOwner(db, restaurantId, account);
  const expectedRevision = optionalExpectedRevision(body);
  assertLayoutRevision(db, restaurantId, expectedRevision);
  assertLayoutEditable(db, restaurantId);
  const order = direction === "undo" ? "DESC" : "ASC";
  const condition = direction === "undo" ? "undone_at IS NULL" : "undone_at IS NOT NULL";
  return transaction(db, () => {
    const revision = assertLayoutRevision(db, restaurantId, expectedRevision);
    const entry = db.prepare(`SELECT * FROM layout_history WHERE restaurant_id = ? AND ${condition} ORDER BY id ${order} LIMIT 1`).get(restaurantId) as any;
    if (!entry) throw new ApiError(409, direction === "undo" ? "There is no layout action to undo." : "There is no layout action to redo.");
    const before = captureLayoutState(db, restaurantId);
    const target = JSON.parse(direction === "undo" ? entry.before_json : entry.after_json) as LayoutState;
    restoreLayoutState(db, restaurantId, target);
    const now = Date.now();
    if (direction === "undo") db.prepare("UPDATE layout_history SET undone_at = ? WHERE id = ?").run(now, entry.id);
    else db.prepare("UPDATE layout_history SET undone_at = NULL WHERE id = ?").run(entry.id);
    const treasuryDelta = target.treasuryCents - before.treasuryCents;
    db.prepare("INSERT INTO ledger_entries (id, restaurant_id, character_id, category, amount_cents, reference_type, reference_id, created_at) VALUES (?, ?, ?, ?, ?, 'layout-history', ?, ?)")
      .run(newId("ledger"), restaurantId, account.characterId, `construction-${direction}`, treasuryDelta, String(entry.id), now);
    const advanced = db.prepare("UPDATE restaurants SET layout_revision = layout_revision + 1 WHERE id = ? AND layout_revision = ?").run(restaurantId, revision);
    if (advanced.changes !== 1) {
      throw new ApiError(409, "The restaurant layout changed in another editor. Refresh before applying this action.", "layout-revision-conflict", { expectedRevision: revision });
    }
    return {
      action: entry.action,
      direction,
      treasuryDeltaCents: treasuryDelta,
      layout: getLayout(db, registry, restaurantId),
    };
  });
}

export function undoLayout(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown> = {}): Record<string, unknown> {
  return applyHistoryState(db, registry, account, restaurantId, "undo", body);
}

export function redoLayout(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, restaurantId: string, body: Record<string, unknown> = {}): Record<string, unknown> {
  return applyHistoryState(db, registry, account, restaurantId, "redo", body);
}
