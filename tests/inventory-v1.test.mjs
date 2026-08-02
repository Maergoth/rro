import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { signup } from "../dist/server/auth.js";
import { loadContent } from "../dist/server/content.js";
import { createDatabase } from "../dist/server/database.js";
import { createHttpServer } from "../dist/server/http-server.js";
import {
  equipInventoryItem,
  getInventoryState,
  purchaseInventoryItem,
  useInventoryItem,
} from "../dist/server/inventory-service.js";

function expectApiError(status, operation) {
  assert.throws(operation, (error) => error && error.status === status);
}

test("the role-equipment catalog has durable icon identities and broad role coverage", () => {
  const registry = loadContent();
  const catalog = registry.content.roleEquipment;
  const baseRoles = registry.content.roles.filter((role) => role.kind === "base");
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.items.length, 45);
  assert.equal(new Set(catalog.items.map((item) => item.iconId)).size, catalog.items.length);
  for (const role of baseRoles) {
    assert.ok(catalog.roleSlots[role.id]?.length >= 4, `${role.id} has a complete loadout`);
    assert.ok(catalog.items.filter((item) => item.allowedRoleIds.includes(role.id)).length >= 8, `${role.id} has shop breadth`);
    assert.ok(catalog.items.some((item) => item.kind === "consumable" && item.allowedRoleIds.includes(role.id)), `${role.id} has consumables`);
  }
});

test("personal inventory purchases, loadouts, uses, and sessions persist across server instances", async () => {
  const directory = mkdtempSync(join(tmpdir(), "rro-inventory-"));
  const databasePath = join(directory, "inventory.sqlite");
  const registry = loadContent();
  let db = createDatabase(databasePath, registry);
  const auth = signup(db, registry, {
    username: "inventory_tester",
    email: "inventory@test.invalid",
    displayName: "Inventory Tester",
    password: "Production!234",
  });

  try {
    const initial = getInventoryState(db, auth.account);
    assert.equal(initial.cashCents, 3_500_000);

    const penPurchase = purchaseInventoryItem(db, registry, auth.account, { itemId: "server-click-pen", roleId: "server", quantity: 1 });
    assert.equal(penPurchase.cashCents, 3_499_100);
    assert.equal(penPurchase.quantity, 1);
    const equipped = equipInventoryItem(db, registry, auth.account, { itemId: "server-click-pen", roleId: "server", slotId: "server-order" });
    assert.equal(equipped.slotId, "server-order");

    db.prepare("UPDATE role_progress SET level = 2 WHERE character_id = ? AND role_id = 'server'").run(auth.account.characterId);
    purchaseInventoryItem(db, registry, auth.account, { itemId: "server-waterproof-order-pad", roleId: "server" });
    expectApiError(409, () => equipInventoryItem(db, registry, auth.account, { itemId: "server-waterproof-order-pad", roleId: "server", slotId: "server-order" }));

    expectApiError(403, () => equipInventoryItem(db, registry, auth.account, { itemId: "server-click-pen", roleId: "cook", slotId: "cook-station" }));
    expectApiError(409, () => purchaseInventoryItem(db, registry, auth.account, { itemId: "manager-incident-seal-kit", roleId: "manager" }));
    expectApiError(403, () => purchaseInventoryItem(db, registry, auth.account, { itemId: "server-palate-mints", roleId: "cook" }));
    expectApiError(400, () => purchaseInventoryItem(db, registry, auth.account, { itemId: "server-palate-mints", roleId: "server", quantity: "3" }));
    expectApiError(404, () => purchaseInventoryItem(db, registry, auth.account, { itemId: "not-a-real-item", roleId: "server" }));

    purchaseInventoryItem(db, registry, auth.account, { itemId: "server-palate-mints", roleId: "server", quantity: 3 });
    const used = useInventoryItem(db, registry, auth.account, { itemId: "server-palate-mints", roleId: "server", quantity: 2 });
    assert.equal(used.remainingQuantity, 1);
    assert.deepEqual(used.appliedEffects, { guestPresentation: 5, serverComposure: 2 });
    expectApiError(409, () => useInventoryItem(db, registry, auth.account, { itemId: "server-click-pen", roleId: "server" }));
    expectApiError(409, () => useInventoryItem(db, registry, auth.account, { itemId: "server-palate-mints", roleId: "server", quantity: 2 }));

    const validBalance = db.prepare("SELECT cash_cents AS cashCents FROM characters WHERE id = ?").get(auth.account.characterId).cashCents;
    db.prepare("UPDATE characters SET cash_cents = 100 WHERE id = ?").run(auth.account.characterId);
    expectApiError(409, () => purchaseInventoryItem(db, registry, auth.account, { itemId: "owner-networking-cards", roleId: "owner" }));
    assert.equal(db.prepare("SELECT cash_cents AS cashCents FROM characters WHERE id = ?").get(auth.account.characterId).cashCents, 100);
    db.prepare("UPDATE characters SET cash_cents = ? WHERE id = ?").run(validBalance, auth.account.characterId);

    db.close();
    db = createDatabase(databasePath, registry);
    const restored = getInventoryState(db, auth.account);
    assert.equal(restored.cashCents, 3_494_250);
    assert.deepEqual(restored.ownedItems.map(({ itemId, quantity }) => ({ itemId, quantity })), [
      { itemId: "server-click-pen", quantity: 1 },
      { itemId: "server-palate-mints", quantity: 1 },
      { itemId: "server-waterproof-order-pad", quantity: 1 },
    ]);
    assert.deepEqual(restored.loadouts.map(({ roleId, slotId, itemId }) => ({ roleId, slotId, itemId })), [
      { roleId: "server", slotId: "server-order", itemId: "server-click-pen" },
    ]);

    const server = createHttpServer(db, registry, {}, undefined);
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    try {
      const address = server.address();
      assert.ok(address && typeof address === "object");
      const root = `http://127.0.0.1:${address.port}`;
      const denied = await fetch(`${root}/v1/character/inventory`);
      assert.equal(denied.status, 401);
      const headers = { authorization: `Bearer ${auth.sessionToken}` };
      const inventoryResponse = await fetch(`${root}/v1/character/inventory`, { headers });
      assert.equal(inventoryResponse.status, 200);
      const inventory = await inventoryResponse.json();
      assert.equal(inventory.ownedItems.length, 3);
      const catalogResponse = await fetch(`${root}/v1/character/inventory/catalog`, { headers });
      assert.equal(catalogResponse.status, 200);
      const catalog = await catalogResponse.json();
      assert.equal(catalog.items.length, 45);
      assert.equal(catalog.items.find((item) => item.id === "server-palate-mints").ownedQuantity, 1);

      const post = (path, body) => fetch(`${root}${path}`, {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const purchaseResponse = await post("/v1/character/inventory/purchase", { itemId: "host-sanitizer-caddy-refill", roleId: "host-busser", quantity: 2 });
      assert.equal(purchaseResponse.status, 201);
      const unequipResponse = await post("/v1/character/inventory/unequip", { roleId: "server", slotId: "server-order" });
      assert.equal(unequipResponse.status, 200);
      const equipResponse = await post("/v1/character/inventory/equip", { itemId: "server-click-pen", roleId: "server", slotId: "server-order" });
      assert.equal(equipResponse.status, 200);
      const useResponse = await post("/v1/character/inventory/use", { itemId: "server-palate-mints", roleId: "server" });
      assert.equal(useResponse.status, 200);
      assert.equal((await useResponse.json()).remainingQuantity, 0);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  } finally {
    try { db.close(); } catch { /* The first instance may already be closed during reopen testing. */ }
    rmSync(directory, { recursive: true, force: true });
  }
});
