import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import type { ContentRegistry } from "./content.js";
import { authenticateRequest, login, logout, signup } from "./auth.js";
import { expandRestaurant, foundRestaurant, getLayout, moveObject, paintFloor, placeObject, sellObject, upsertWall } from "./layout-service.js";
import type { LiveService } from "./live-service.js";
import { ApiError, type AuthenticatedAccount, type Database } from "./types.js";

const MAX_BODY_BYTES = 256 * 1024;

function send(res: ServerResponse, status: number, payload: unknown): void {
  const encoded = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(encoded),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(encoded);
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new ApiError(413, "Request body is too large.");
    chunks.push(buffer);
  }
  if (!chunks.length) return {};
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("object expected");
    return parsed as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "Request body must be a JSON object.");
  }
}

function bearer(req: IncomingMessage): string {
  const authorization = String(req.headers.authorization ?? "");
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function characterPayload(db: Database, registry: ContentRegistry, account: AuthenticatedAccount): Record<string, unknown> {
  const character = db.prepare("SELECT * FROM characters WHERE id = ?").get(account.characterId) as any;
  const attributes = db.prepare("SELECT attribute_id AS attributeId, value, potential FROM character_attributes WHERE character_id = ? ORDER BY attribute_id").all(account.characterId);
  const roleProgress = db.prepare("SELECT role_id AS roleId, level, xp, tasks_completed AS tasksCompleted, failures_recovered AS failuresRecovered FROM role_progress WHERE character_id = ? ORDER BY role_id").all(account.characterId);
  const skills = db.prepare("SELECT role_id AS roleId, skill_id AS skillId, unlocked_at AS unlockedAt FROM skill_unlocks WHERE character_id = ? ORDER BY unlocked_at").all(account.characterId);
  return {
    id: character.id,
    name: character.name,
    level: character.level,
    xp: character.xp,
    cashCents: character.cash_cents,
    reputation: character.reputation,
    skillPoints: character.skill_points,
    homeCountryId: character.home_country_id,
    activeRoleId: character.active_role_id,
    appearance: { outfit: character.outfit, primaryColor: character.primary_color, secondaryColor: character.secondary_color, skinTone: character.skin_tone, hairStyle: character.hair_style, hairColor: character.hair_color },
    attributes,
    roleProgress,
    unlockedSkills: skills,
    recommendedRoles: registry.content.roles.filter((role) => role.kind === "base").map((role) => {
      let score = 0;
      let total = 0;
      for (const attribute of attributes as any[]) {
        const weight = role.attributeWeights[attribute.attributeId] ?? 0;
        score += attribute.value * weight;
        total += weight;
      }
      return { roleId: role.id, fit: total ? Math.round(score / total) : 50 };
    }).sort((a, b) => b.fit - a.fit),
  };
}

function updateAppearance(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, body: Record<string, unknown>): Record<string, unknown> {
  const color = (value: unknown, fallback: string): string => /^#[0-9A-Fa-f]{6}$/.test(String(value ?? "")) ? String(value) : fallback;
  const current = db.prepare("SELECT * FROM characters WHERE id = ?").get(account.characterId) as any;
  const outfit = registry.content.appearance.outfitSilhouettes.includes(String(body.outfit)) ? String(body.outfit) : current.outfit;
  const primary = color(body.primaryColor, current.primary_color);
  const secondary = color(body.secondaryColor, current.secondary_color);
  const skinTone = color(body.skinTone, current.skin_tone);
  const hairColor = color(body.hairColor, current.hair_color);
  const hairStyle = String(body.hairStyle ?? current.hair_style).replace(/[^a-z0-9-]/gi, "").slice(0, 24) || current.hair_style;
  db.prepare("UPDATE characters SET outfit = ?, primary_color = ?, secondary_color = ?, skin_tone = ?, hair_style = ?, hair_color = ? WHERE id = ?")
    .run(outfit, primary, secondary, skinTone, hairStyle, hairColor, account.characterId);
  return characterPayload(db, registry, account);
}

function unlockSkill(db: Database, registry: ContentRegistry, account: AuthenticatedAccount, body: Record<string, unknown>): Record<string, unknown> {
  const roleId = String(body.roleId ?? "");
  const skillId = String(body.skillId ?? "");
  const role = registry.roleById.get(roleId);
  const skill = role?.skills.find((entry) => entry.id === skillId);
  if (!role || !skill) throw new ApiError(404, "Skill node not found for that role.");
  if (db.prepare("SELECT 1 FROM skill_unlocks WHERE character_id = ? AND skill_id = ?").get(account.characterId, skillId)) throw new ApiError(409, "That skill is already unlocked.");
  if (skill.requires && !db.prepare("SELECT 1 FROM skill_unlocks WHERE character_id = ? AND skill_id = ?").get(account.characterId, skill.requires)) throw new ApiError(409, "Unlock the prerequisite first.");
  const character = db.prepare("SELECT skill_points FROM characters WHERE id = ?").get(account.characterId) as any;
  if (character.skill_points < skill.cost) throw new ApiError(409, "You do not have enough skill points.");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("UPDATE characters SET skill_points = skill_points - ? WHERE id = ?").run(skill.cost, account.characterId);
    db.prepare("INSERT INTO skill_unlocks (character_id, role_id, skill_id, unlocked_at) VALUES (?, ?, ?, ?)").run(account.characterId, roleId, skillId, Date.now());
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { roleId, skillId, remainingSkillPoints: character.skill_points - skill.cost };
}

export function createHttpServer(db: Database, registry: ContentRegistry, live: LiveService, localControl?: { token: string; shutdown: () => void }) {
  return createServer(async (req, res) => {
    const requestId = randomUUID();
    res.setHeader("x-rro-request-id", requestId);
    try {
      const url = new URL(req.url ?? "/", "http://local.rro");
      const method = req.method ?? "GET";
      if (method === "GET" && url.pathname === "/health") return send(res, 200, { ok: true, protocol: registry.manifest.protocol, schemaVersion: registry.manifest.schemaVersion, contentHash: registry.manifest.contentHash, uptimeSeconds: Math.floor(process.uptime()) });
      if (method === "POST" && url.pathname === "/v1/local-admin/shutdown") {
        const remote = String(req.socket.remoteAddress ?? "");
        const loopback = remote === "127.0.0.1" || remote === "::1" || remote === "::ffff:127.0.0.1";
        const supplied = String(req.headers["x-rro-control-token"] ?? "");
        if (!localControl || !loopback || supplied.length < 32 || supplied !== localControl.token) throw new ApiError(403, "Local server control authorization failed.");
        send(res, 202, { ok: true, message: "Graceful shutdown accepted." });
        setImmediate(localControl.shutdown);
        return;
      }
      if (method === "POST" && url.pathname === "/v1/auth/signup") return send(res, 201, signup(db, registry, await readBody(req)));
      if (method === "POST" && url.pathname === "/v1/auth/login") return send(res, 200, login(db, await readBody(req)));
      if (method === "POST" && url.pathname === "/v1/auth/logout") { logout(db, bearer(req)); return send(res, 200, { ok: true }); }
      if (method === "GET" && url.pathname === "/v1/content/manifest") return send(res, 200, registry.manifest);

      const account = authenticateRequest(db, req);
      if (method === "GET" && url.pathname === "/v1/bootstrap") {
        const ownedRestaurants = db.prepare("SELECT id, name, region_id AS regionId, rating, sanitation, treasury_cents AS treasuryCents FROM restaurants WHERE owner_character_id = ? AND status = 'active'").all(account.characterId);
        const applications = db.prepare("SELECT id, restaurant_id AS restaurantId, role_id AS roleId, note, status, submitted_at AS submittedAt FROM employment_applications WHERE character_id = ? ORDER BY submitted_at DESC").all(account.characterId);
        return send(res, 200, { protocol: "rro.v1", account, character: characterPayload(db, registry, account), content: registry.content, contentManifest: registry.manifest, world: live.listWorld(), ownedRestaurants, applications, realtimePath: "/v1/realtime" });
      }
      if (method === "PATCH" && url.pathname === "/v1/character/appearance") return send(res, 200, updateAppearance(db, registry, account, await readBody(req)));
      if (method === "POST" && url.pathname === "/v1/character/skills/unlock") return send(res, 200, unlockSkill(db, registry, account, await readBody(req)));
      if (method === "GET" && url.pathname === "/v1/world") return send(res, 200, live.listWorld());
      if (method === "GET" && url.pathname === "/v1/shifts") return send(res, 200, { shifts: live.listShifts(url.searchParams.get("regionId") ?? undefined) });
      if (method === "POST" && url.pathname === "/v1/restaurants") return send(res, 201, foundRestaurant(db, registry, account, await readBody(req)));

      let match = url.pathname.match(/^\/v1\/regions\/([^/]+)\/restaurants$/);
      if (method === "GET" && match) return send(res, 200, { restaurants: live.listRestaurants(decodeURIComponent(match[1]!)) });
      match = url.pathname.match(/^\/v1\/restaurants\/([^/]+)$/);
      if (method === "GET" && match) return send(res, 200, live.getRestaurant(decodeURIComponent(match[1]!)));
      match = url.pathname.match(/^\/v1\/restaurants\/([^/]+)\/applications$/);
      if (method === "POST" && match) return send(res, 201, live.apply(account, decodeURIComponent(match[1]!), await readBody(req)));
      match = url.pathname.match(/^\/v1\/restaurants\/([^/]+)\/layout$/);
      if (method === "GET" && match) return send(res, 200, getLayout(db, registry, decodeURIComponent(match[1]!)));
      match = url.pathname.match(/^\/v1\/restaurants\/([^/]+)\/layout\/floor$/);
      if (method === "PATCH" && match) return send(res, 200, paintFloor(db, registry, account, decodeURIComponent(match[1]!), await readBody(req)));
      match = url.pathname.match(/^\/v1\/restaurants\/([^/]+)\/layout\/walls$/);
      if (method === "PUT" && match) return send(res, 200, upsertWall(db, registry, account, decodeURIComponent(match[1]!), await readBody(req)));
      match = url.pathname.match(/^\/v1\/restaurants\/([^/]+)\/layout\/objects$/);
      if (method === "POST" && match) return send(res, 201, placeObject(db, registry, account, decodeURIComponent(match[1]!), await readBody(req)));
      match = url.pathname.match(/^\/v1\/restaurants\/([^/]+)\/layout\/objects\/([^/]+)$/);
      if (method === "PATCH" && match) return send(res, 200, moveObject(db, registry, account, decodeURIComponent(match[1]!), decodeURIComponent(match[2]!), await readBody(req)));
      if (method === "DELETE" && match) return send(res, 200, sellObject(db, registry, account, decodeURIComponent(match[1]!), decodeURIComponent(match[2]!)));
      match = url.pathname.match(/^\/v1\/restaurants\/([^/]+)\/layout\/expand$/);
      if (method === "POST" && match) return send(res, 200, expandRestaurant(db, registry, account, decodeURIComponent(match[1]!), await readBody(req)));
      match = url.pathname.match(/^\/v1\/restaurants\/([^/]+)\/shifts$/);
      if (method === "POST" && match) return send(res, 201, live.openShift(decodeURIComponent(match[1]!), account));
      match = url.pathname.match(/^\/v1\/shifts\/([^/]+)$/);
      if (method === "GET" && match) return send(res, 200, live.shiftSummary(decodeURIComponent(match[1]!)));
      match = url.pathname.match(/^\/v1\/shifts\/([^/]+)\/snapshot$/);
      if (method === "GET" && match) return send(res, 200, live.snapshot(decodeURIComponent(match[1]!)));
      match = url.pathname.match(/^\/v1\/shifts\/([^/]+)\/join$/);
      if (method === "POST" && match) return send(res, 200, live.join(account, decodeURIComponent(match[1]!), await readBody(req)));
      match = url.pathname.match(/^\/v1\/shifts\/([^/]+)\/leave$/);
      if (method === "POST" && match) { live.leave(account, decodeURIComponent(match[1]!)); return send(res, 200, { ok: true }); }

      throw new ApiError(404, "API route not found.");
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      const message = error instanceof Error ? error.message : "Unexpected server error.";
      if (status >= 500) console.error(`[${requestId}]`, error);
      send(res, status, { error: { status, message, requestId } });
    }
  });
}
