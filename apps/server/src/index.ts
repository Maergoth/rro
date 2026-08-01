import { appendFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";
import { inspect } from "node:util";
import { loadConfig } from "./config.js";
import { loadContent } from "./content.js";
import { createDatabase } from "./database.js";
import { createHttpServer } from "./http-server.js";
import { LiveService } from "./live-service.js";
import { attachRealtime } from "./realtime.js";

const config = loadConfig();
const logPath = resolve(process.cwd(), "logs/server.log");
mkdirSync(dirname(logPath), { recursive: true });
const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);
const writeLog = (level: "INFO" | "ERROR", values: unknown[]): void => {
  const message = values.map((value) => typeof value === "string" ? value : inspect(value, { depth: 6, breakLength: 180 })).join(" ");
  appendFileSync(logPath, `${new Date().toISOString()} ${level} ${message}\n`, "utf8");
};
console.log = (...values: unknown[]): void => { writeLog("INFO", values); originalLog(...values); };
console.error = (...values: unknown[]): void => { writeLog("ERROR", values); originalError(...values); };
const registry = loadContent();
const databasePath = config.database === ":memory:" ? ":memory:" : resolve(process.cwd(), config.database);
const db = createDatabase(databasePath, registry);
const live = new LiveService(db, registry, config.tickRate, config.snapshotRate);
const pidPath = resolve(process.cwd(), "run/rro-server.pid");
const controlTokenPath = resolve(process.cwd(), "run/rro-control.token");
const controlToken = randomBytes(32).toString("base64url");
mkdirSync(dirname(pidPath), { recursive: true });

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`RRO V1 received ${signal}; closing live simulation and database.`);
  live.stop();
  await realtime.close().catch(() => undefined);
  await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
  db.close();
  if (existsSync(pidPath)) unlinkSync(pidPath);
  if (existsSync(controlTokenPath)) unlinkSync(controlTokenPath);
}

const server = createHttpServer(db, registry, live, { token: controlToken, shutdown: () => { void shutdown("local server control").then(() => process.exit(0)); } });
const realtime = attachRealtime(server, db, live);

process.on("SIGINT", () => { void shutdown("SIGINT").then(() => process.exit(0)); });
process.on("SIGTERM", () => { void shutdown("SIGTERM").then(() => process.exit(0)); });
process.on("uncaughtException", (error) => {
  console.error("Uncaught server exception", error);
  void shutdown("uncaughtException").then(() => process.exit(1));
});
process.on("unhandledRejection", (error) => {
  console.error("Unhandled server rejection", error);
  void shutdown("unhandledRejection").then(() => process.exit(1));
});

server.listen(config.port, config.host, () => {
  writeFileSync(pidPath, String(process.pid), "utf8");
  writeFileSync(controlTokenPath, controlToken, { encoding: "utf8", mode: 0o600 });
  live.start(config.autoOpenNpcShifts);
  console.log(`Rush & Revenue Online V1 server listening at http://${config.host}:${config.port}`);
  console.log(`Protocol ${registry.manifest.protocol}; content ${registry.manifest.contentHash.slice(0, 12)}; database ${databasePath}`);
});
