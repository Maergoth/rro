import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { ContentRegistry } from "./content.js";
import { newId, transaction } from "./database.js";
import { ApiError, type AuthenticatedAccount, type Database } from "./types.js";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function passwordHash(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function clean(value: unknown, max: number): string {
  return String(value ?? "").replace(/[<>\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function accountPayload(row: any): AuthenticatedAccount {
  return { id: row.account_id ?? row.id, username: row.username, displayName: row.name, characterId: row.character_id };
}

function issueSession(db: Database, accountId: string): string {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  db.prepare("INSERT INTO sessions (id, account_id, token_hash, created_at, expires_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(newId("session"), accountId, sha256(token), now, now + SESSION_MS, now);
  return token;
}

export function signup(db: Database, registry: ContentRegistry, body: Record<string, unknown>): { account: AuthenticatedAccount; sessionToken: string } {
  const username = clean(body.username, 20);
  const email = clean(body.email, 100).toLowerCase();
  const name = clean(body.displayName, 40);
  const password = String(body.password ?? "");
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(username)) throw new ApiError(400, "Username must be 3–20 letters, numbers, dashes, or underscores.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "Enter a valid email address.");
  if (name.length < 2) throw new ApiError(400, "Character name must be at least two characters.");
  if (password.length < 10 || password.length > 128) throw new ApiError(400, "Password must be 10–128 characters.");
  if (db.prepare("SELECT 1 FROM accounts WHERE username = ? OR email = ?").get(username, email)) throw new ApiError(409, "That username or email is already registered.");

  const accountId = newId("account");
  const characterId = newId("character");
  const salt = randomBytes(16).toString("hex");
  const now = Date.now();
  transaction(db, () => {
    db.prepare("INSERT INTO accounts (id, username, email, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(accountId, username, email, salt, passwordHash(password, salt), now);
    db.prepare(`INSERT INTO characters
      (id, account_id, name, primary_color, secondary_color, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(characterId, accountId, name, registry.content.appearance.defaultPrimary, registry.content.appearance.defaultSecondary, now);
    const attributes = [...registry.content.attributes].sort(() => randomInt(-1, 2));
    const insertAttribute = db.prepare("INSERT INTO character_attributes (character_id, attribute_id, value, potential) VALUES (?, ?, ?, 100)");
    attributes.forEach((attribute: any, index) => {
      const value = index < 2 ? randomInt(72, 87) : index >= attributes.length - 2 ? randomInt(28, 46) : randomInt(44, 69);
      insertAttribute.run(characterId, attribute.id, value);
    });
    const insertProgress = db.prepare("INSERT INTO role_progress (character_id, role_id) VALUES (?, ?)");
    for (const role of registry.content.roles) insertProgress.run(characterId, role.id);
  });
  const sessionToken = issueSession(db, accountId);
  return { account: { id: accountId, username, displayName: name, characterId }, sessionToken };
}

export function login(db: Database, body: Record<string, unknown>): { account: AuthenticatedAccount; sessionToken: string } {
  const loginValue = clean(body.login, 100);
  const password = String(body.password ?? "");
  const row = db.prepare(`
    SELECT a.*, c.id AS character_id, c.name
    FROM accounts a JOIN characters c ON c.account_id = a.id
    WHERE a.username = ? OR a.email = ?
  `).get(loginValue, loginValue.toLowerCase()) as any;
  if (!row) throw new ApiError(401, "Username/email or password is incorrect.");
  const candidate = Buffer.from(passwordHash(password, row.password_salt), "hex");
  const expected = Buffer.from(row.password_hash, "hex");
  if (candidate.length !== expected.length || !timingSafeEqual(candidate, expected)) throw new ApiError(401, "Username/email or password is incorrect.");
  return { account: accountPayload(row), sessionToken: issueSession(db, row.id) };
}

export function authenticateToken(db: Database, token: string): AuthenticatedAccount {
  if (!token) throw new ApiError(401, "Authentication is required.");
  const row = db.prepare(`
    SELECT a.id AS account_id, a.username, c.id AS character_id, c.name, s.id AS session_id
    FROM sessions s JOIN accounts a ON a.id = s.account_id JOIN characters c ON c.account_id = a.id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(sha256(token), Date.now()) as any;
  if (!row) throw new ApiError(401, "The session is invalid or expired.");
  db.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").run(Date.now(), row.session_id);
  return accountPayload(row);
}

export function authenticateRequest(db: Database, req: IncomingMessage): AuthenticatedAccount {
  const authorization = String(req.headers.authorization ?? "");
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  return authenticateToken(db, token);
}

export function logout(db: Database, token: string): void {
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
}
