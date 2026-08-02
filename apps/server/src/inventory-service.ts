import type { ContentRegistry } from "./content.js";
import { newId, transaction } from "./database.js";
import { ApiError, type AuthenticatedAccount, type Database, type RoleEquipmentDefinition } from "./types.js";

const MAX_PURCHASE_QUANTITY = 99;
const MAX_USE_QUANTITY = 20;

function requiredString(body: Record<string, unknown>, key: string): string {
  const value = typeof body[key] === "string" ? body[key].trim() : "";
  if (!value) throw new ApiError(400, `${key} is required.`);
  return value;
}

function positiveInteger(body: Record<string, unknown>, key: string, fallback: number, maximum: number): number {
  const raw = body[key] ?? fallback;
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 1 || raw > maximum) {
    throw new ApiError(400, `${key} must be a whole number from 1 to ${maximum}.`);
  }
  return raw;
}

function itemDefinition(registry: ContentRegistry, itemId: string): RoleEquipmentDefinition {
  const item = registry.roleEquipmentById.get(itemId);
  if (!item) throw new ApiError(404, "Inventory item not found.");
  return item;
}

function assertRoleEligibility(
  db: Database,
  registry: ContentRegistry,
  account: AuthenticatedAccount,
  item: RoleEquipmentDefinition,
  roleId: string,
): number {
  if (!registry.roleById.has(roleId)) throw new ApiError(404, "Restaurant role not found.");
  if (!item.allowedRoleIds.includes(roleId)) throw new ApiError(403, `${item.name} cannot be used by that role.`);
  const progress = db.prepare("SELECT level FROM role_progress WHERE character_id = ? AND role_id = ?").get(account.characterId, roleId) as { level: number } | undefined;
  if (!progress) throw new ApiError(409, "Role progression is not initialized for this character.");
  if (progress.level < item.requiredRoleLevel) {
    throw new ApiError(409, `${item.name} requires ${registry.roleById.get(roleId)?.label ?? roleId} level ${item.requiredRoleLevel}.`);
  }
  return progress.level;
}

function recordEvent(
  db: Database,
  characterId: string,
  itemId: string,
  roleId: string,
  action: "purchase" | "equip" | "unequip" | "use",
  quantityDelta: number,
  cashDeltaCents: number,
  metadata: Record<string, unknown> = {},
): void {
  db.prepare(`
    INSERT INTO character_inventory_events
      (id, character_id, item_id, role_id, action, quantity_delta, cash_delta_cents, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(newId("inventory_event"), characterId, itemId, roleId, action, quantityDelta, cashDeltaCents, JSON.stringify(metadata), Date.now());
}

export function getInventoryState(db: Database, account: AuthenticatedAccount): Record<string, unknown> {
  const character = db.prepare("SELECT cash_cents AS cashCents, active_role_id AS activeRoleId FROM characters WHERE id = ?").get(account.characterId) as { cashCents: number; activeRoleId: string } | undefined;
  if (!character) throw new ApiError(404, "Character not found.");
  const ownedItems = db.prepare(`
    SELECT item_id AS itemId, quantity, acquired_at AS acquiredAt, updated_at AS updatedAt
    FROM character_inventory
    WHERE character_id = ?
    ORDER BY item_id
  `).all(account.characterId);
  const equipped = db.prepare(`
    SELECT role_id AS roleId, slot_id AS slotId, item_id AS itemId, equipped_at AS equippedAt
    FROM character_role_loadouts
    WHERE character_id = ?
    ORDER BY role_id, slot_id
  `).all(account.characterId);
  return {
    cashCents: character.cashCents,
    activeRoleId: character.activeRoleId,
    ownedItems,
    loadouts: equipped,
  };
}

export function getInventoryCatalog(db: Database, registry: ContentRegistry, account: AuthenticatedAccount): Record<string, unknown> {
  const roleProgress = db.prepare(`
    SELECT role_id AS roleId, level
    FROM role_progress
    WHERE character_id = ?
    ORDER BY role_id
  `).all(account.characterId) as Array<{ roleId: string; level: number }>;
  const ownedRows = db.prepare("SELECT item_id AS itemId, quantity FROM character_inventory WHERE character_id = ?").all(account.characterId) as Array<{ itemId: string; quantity: number }>;
  const quantities = new Map(ownedRows.map((row) => [row.itemId, row.quantity]));
  const levels = new Map(roleProgress.map((row) => [row.roleId, row.level]));
  return {
    schemaVersion: registry.content.roleEquipment.schemaVersion,
    slots: registry.content.roleEquipment.slots,
    roleSlots: registry.content.roleEquipment.roleSlots,
    roleProgress,
    items: registry.content.roleEquipment.items.map((item) => ({
      ...item,
      ownedQuantity: quantities.get(item.id) ?? 0,
      eligibleRoleIds: item.allowedRoleIds.filter((roleId) => (levels.get(roleId) ?? 0) >= item.requiredRoleLevel),
    })),
  };
}

export function purchaseInventoryItem(
  db: Database,
  registry: ContentRegistry,
  account: AuthenticatedAccount,
  body: Record<string, unknown>,
): Record<string, unknown> {
  const itemId = requiredString(body, "itemId");
  const roleId = requiredString(body, "roleId");
  const quantity = positiveInteger(body, "quantity", 1, MAX_PURCHASE_QUANTITY);
  const item = itemDefinition(registry, itemId);
  assertRoleEligibility(db, registry, account, item, roleId);
  const totalCostCents = item.priceCents * quantity;
  if (!Number.isSafeInteger(totalCostCents)) throw new ApiError(400, "Purchase total is outside the supported range.");

  return transaction(db, () => {
    const current = db.prepare("SELECT quantity FROM character_inventory WHERE character_id = ? AND item_id = ?").get(account.characterId, itemId) as { quantity: number } | undefined;
    const nextQuantity = (current?.quantity ?? 0) + quantity;
    if (nextQuantity > item.stackLimit) throw new ApiError(409, `${item.name} has an ownership limit of ${item.stackLimit}.`);
    const debit = db.prepare("UPDATE characters SET cash_cents = cash_cents - ? WHERE id = ? AND cash_cents >= ?")
      .run(totalCostCents, account.characterId, totalCostCents);
    if (Number(debit.changes) !== 1) throw new ApiError(409, "You do not have enough personal cash for that purchase.");
    const now = Date.now();
    db.prepare(`
      INSERT INTO character_inventory (character_id, item_id, quantity, acquired_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(character_id, item_id) DO UPDATE SET quantity = excluded.quantity, updated_at = excluded.updated_at
    `).run(account.characterId, itemId, nextQuantity, now, now);
    recordEvent(db, account.characterId, itemId, roleId, "purchase", quantity, -totalCostCents, { unitPriceCents: item.priceCents });
    const balance = db.prepare("SELECT cash_cents AS cashCents FROM characters WHERE id = ?").get(account.characterId) as { cashCents: number };
    return { ok: true, itemId, roleId, purchasedQuantity: quantity, quantity: nextQuantity, totalCostCents, cashCents: balance.cashCents };
  });
}

export function equipInventoryItem(
  db: Database,
  registry: ContentRegistry,
  account: AuthenticatedAccount,
  body: Record<string, unknown>,
): Record<string, unknown> {
  const itemId = requiredString(body, "itemId");
  const roleId = requiredString(body, "roleId");
  const slotId = requiredString(body, "slotId");
  const item = itemDefinition(registry, itemId);
  if (item.kind !== "equipment") throw new ApiError(409, "Consumables cannot be equipped.");
  assertRoleEligibility(db, registry, account, item, roleId);
  if (!(registry.content.roleEquipment.roleSlots[roleId] ?? []).includes(slotId)) throw new ApiError(400, "That slot does not belong to this role's loadout.");
  if (!item.equipSlots.includes(slotId)) throw new ApiError(409, `${item.name} is not compatible with that equipment slot.`);
  const owned = db.prepare("SELECT quantity FROM character_inventory WHERE character_id = ? AND item_id = ?").get(account.characterId, itemId);
  if (!owned) throw new ApiError(409, "Purchase this item before equipping it.");

  return transaction(db, () => {
    const occupied = db.prepare("SELECT item_id AS itemId FROM character_role_loadouts WHERE character_id = ? AND role_id = ? AND slot_id = ?")
      .get(account.characterId, roleId, slotId) as { itemId: string } | undefined;
    if (occupied) throw new ApiError(409, occupied.itemId === itemId ? "That item is already equipped in this slot." : "Unequip the current item from this slot first.");
    const duplicate = db.prepare("SELECT slot_id AS slotId FROM character_role_loadouts WHERE character_id = ? AND role_id = ? AND item_id = ?")
      .get(account.characterId, roleId, itemId) as { slotId: string } | undefined;
    if (duplicate) throw new ApiError(409, `That item is already equipped in ${duplicate.slotId}.`);
    const equippedAt = Date.now();
    db.prepare("INSERT INTO character_role_loadouts (character_id, role_id, slot_id, item_id, equipped_at) VALUES (?, ?, ?, ?, ?)")
      .run(account.characterId, roleId, slotId, itemId, equippedAt);
    recordEvent(db, account.characterId, itemId, roleId, "equip", 0, 0, { slotId });
    return { ok: true, roleId, slotId, itemId, equippedAt };
  });
}

export function unequipInventoryItem(
  db: Database,
  registry: ContentRegistry,
  account: AuthenticatedAccount,
  body: Record<string, unknown>,
): Record<string, unknown> {
  const roleId = requiredString(body, "roleId");
  const slotId = requiredString(body, "slotId");
  if (!registry.roleById.has(roleId)) throw new ApiError(404, "Restaurant role not found.");
  if (!(registry.content.roleEquipment.roleSlots[roleId] ?? []).includes(slotId)) throw new ApiError(400, "That slot does not belong to this role's loadout.");
  return transaction(db, () => {
    const equipped = db.prepare("SELECT item_id AS itemId FROM character_role_loadouts WHERE character_id = ? AND role_id = ? AND slot_id = ?")
      .get(account.characterId, roleId, slotId) as { itemId: string } | undefined;
    if (!equipped) throw new ApiError(404, "That equipment slot is already empty.");
    db.prepare("DELETE FROM character_role_loadouts WHERE character_id = ? AND role_id = ? AND slot_id = ?")
      .run(account.characterId, roleId, slotId);
    recordEvent(db, account.characterId, equipped.itemId, roleId, "unequip", 0, 0, { slotId });
    return { ok: true, roleId, slotId, itemId: equipped.itemId };
  });
}

export function useInventoryItem(
  db: Database,
  registry: ContentRegistry,
  account: AuthenticatedAccount,
  body: Record<string, unknown>,
): Record<string, unknown> {
  const itemId = requiredString(body, "itemId");
  const roleId = requiredString(body, "roleId");
  const quantity = positiveInteger(body, "quantity", 1, MAX_USE_QUANTITY);
  const item = itemDefinition(registry, itemId);
  if (item.kind !== "consumable") throw new ApiError(409, "Only consumable items can be used from inventory.");
  assertRoleEligibility(db, registry, account, item, roleId);

  return transaction(db, () => {
    const owned = db.prepare("SELECT quantity FROM character_inventory WHERE character_id = ? AND item_id = ?").get(account.characterId, itemId) as { quantity: number } | undefined;
    if (!owned || owned.quantity < quantity) throw new ApiError(409, "You do not own enough of that consumable.");
    const remainingQuantity = owned.quantity - quantity;
    if (remainingQuantity === 0) {
      db.prepare("DELETE FROM character_inventory WHERE character_id = ? AND item_id = ?").run(account.characterId, itemId);
    } else {
      db.prepare("UPDATE character_inventory SET quantity = ?, updated_at = ? WHERE character_id = ? AND item_id = ?")
        .run(remainingQuantity, Date.now(), account.characterId, itemId);
    }
    recordEvent(db, account.characterId, itemId, roleId, "use", -quantity, 0, { useEffects: item.useEffects ?? {} });
    return { ok: true, itemId, roleId, usedQuantity: quantity, remainingQuantity, appliedEffects: item.useEffects ?? {} };
  });
}
