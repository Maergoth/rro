import type { Server as HttpServer, IncomingMessage } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { authenticateToken } from "./auth.js";
import type { LiveService } from "./live-service.js";
import { ApiError, type AuthenticatedAccount, type CommandEnvelope, type Database, type Snapshot } from "./types.js";

type SessionSocket = WebSocket & {
  account?: AuthenticatedAccount;
  subscribedShiftId?: string;
  isAlive?: boolean;
  windowStartedAt?: number;
  windowMessages?: number;
};

function transmit(socket: WebSocket, payload: unknown): void {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}

export function attachRealtime(server: HttpServer, db: Database, live: LiveService): { close: () => Promise<void> } {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
  const upgrade = (req: IncomingMessage, socket: any, head: Buffer): void => {
    const url = new URL(req.url ?? "/", "http://local.rro");
    if (url.pathname !== "/v1/realtime") { socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  };
  server.on("upgrade", upgrade);

  wss.on("connection", (rawSocket) => {
    const socket = rawSocket as SessionSocket;
    socket.isAlive = true;
    socket.windowStartedAt = Date.now();
    socket.windowMessages = 0;
    const authTimeout = setTimeout(() => {
      if (!socket.account) socket.close(4401, "Authentication timeout");
    }, 5000);
    socket.on("pong", () => { socket.isAlive = true; });
    socket.on("message", (data) => {
      try {
        const now = Date.now();
        if (now - (socket.windowStartedAt ?? 0) > 1000) { socket.windowStartedAt = now; socket.windowMessages = 0; }
        socket.windowMessages = (socket.windowMessages ?? 0) + 1;
        if (socket.windowMessages > 40) throw new ApiError(429, "Realtime message rate exceeded.");
        const message = JSON.parse(data.toString()) as any;
        if (!socket.account) {
          if (message.type !== "auth") throw new ApiError(401, "Authenticate before using realtime commands.");
          socket.account = authenticateToken(db, String(message.token ?? ""));
          clearTimeout(authTimeout);
          transmit(socket, { type: "ready", protocol: "rro.v1", account: socket.account, serverTime: now });
          return;
        }
        if (message.type === "subscribe") {
          socket.subscribedShiftId = String(message.shiftId ?? "");
          transmit(socket, { type: "snapshot", data: live.snapshot(socket.subscribedShiftId) });
          return;
        }
        if (message.type === "command") {
          const command = message.command as CommandEnvelope;
          const result = live.handleCommand(socket.account, command);
          transmit(socket, { type: "command.ack", commandId: command.id, result, serverTime: now });
          return;
        }
        throw new ApiError(400, "Unknown realtime message type.");
      } catch (error) {
        const status = error instanceof ApiError ? error.status : 400;
        transmit(socket, { type: "error", error: { status, message: error instanceof Error ? error.message : "Invalid realtime message." } });
        if (status === 401 || status === 429) socket.close(status === 401 ? 4401 : 4429, "Realtime policy violation");
      }
    });
    socket.on("close", () => clearTimeout(authTimeout));
  });

  const snapshotListener = (shiftId: string, snapshot: Snapshot): void => {
    for (const client of wss.clients) {
      const socket = client as SessionSocket;
      if (socket.subscribedShiftId === shiftId) transmit(socket, { type: "snapshot", data: snapshot });
    }
  };
  const closedListener = (shiftId: string): void => {
    for (const client of wss.clients) {
      const socket = client as SessionSocket;
      if (socket.subscribedShiftId === shiftId) transmit(socket, { type: "shift.closed", shiftId });
    }
  };
  const errorListener = (error: unknown): void => console.error("Realtime snapshot error", error);
  live.on("snapshot", snapshotListener);
  live.on("shift-closed", closedListener);
  live.on("error", errorListener);

  const heartbeat = setInterval(() => {
    for (const client of wss.clients) {
      const socket = client as SessionSocket;
      if (socket.isAlive === false) { socket.terminate(); continue; }
      socket.isAlive = false;
      socket.ping();
    }
  }, 20_000);
  heartbeat.unref?.();

  return {
    close: () => new Promise((resolve) => {
      clearInterval(heartbeat);
      live.off("snapshot", snapshotListener);
      live.off("shift-closed", closedListener);
      live.off("error", errorListener);
      server.off("upgrade", upgrade);
      for (const client of wss.clients) client.close(1001, "Server shutting down");
      wss.close(() => resolve());
    }),
  };
}
