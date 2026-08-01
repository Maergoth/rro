import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ServerConfig } from "./types.js";

const defaults: ServerConfig = {
  host: "127.0.0.1",
  port: 8788,
  database: "data/rro-v1.sqlite",
  tickRate: 10,
  snapshotRate: 5,
  autoOpenNpcShifts: true,
  logLevel: "info",
};

export function loadConfig(path = process.env.RRO_V1_CONFIG ?? resolve(process.cwd(), "config/server.v1.json")): ServerConfig {
  const file = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) as Partial<ServerConfig> : {};
  const config = { ...defaults, ...file };
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error("Server port must be an integer from 1 to 65535.");
  if (!Number.isInteger(config.tickRate) || config.tickRate < 2 || config.tickRate > 30) throw new Error("tickRate must be from 2 through 30.");
  if (!Number.isInteger(config.snapshotRate) || config.snapshotRate < 1 || config.snapshotRate > config.tickRate) throw new Error("snapshotRate must be positive and no greater than tickRate.");
  return config;
}
