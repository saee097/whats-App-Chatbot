import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";

/**
 * Optional companion API for WhatsApp + Socket.io.
 * Next.js already hosts the same routes under /api.
 * Run: npm run server  (after installing deps)
 */
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.APP_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "aether-api" });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.APP_ORIGIN || "http://localhost:3000" },
});

io.on("connection", (socket) => {
  socket.on("join", (conversationId: string) => {
    if (typeof conversationId === "string") socket.join(conversationId);
  });
  socket.on("agent:typing", (conversationId: string) => {
    socket.to(conversationId).emit("typing", { source: "agent" });
  });
});

const port = Number(process.env.API_PORT || 4000);
httpServer.listen(port, () => {
  console.log(`Aether realtime API on :${port}`);
});
