import { promises as fs } from "fs";
import path from "path";
import { compareSync } from "bcryptjs";
import { id, nowIso } from "./id";
import {
  seedAgents,
  seedConversations,
  seedKnowledge,
  seedMessages,
  seedOrders,
  seedProducts,
  seedUsers,
} from "./seed";
import type {
  Agent,
  Conversation,
  ConversationStatus,
  DashboardStats,
  KnowledgeArticle,
  Message,
  Order,
  Product,
  User,
} from "./types";

export interface DbShape {
  users: User[];
  conversations: Conversation[];
  messages: Message[];
  knowledge: KnowledgeArticle[];
  products: Product[];
  orders: Order[];
  agents: Agent[];
}

const filePath = path.join(process.cwd(), ".data", "db.json");

let cache: DbShape | null = null;
let writeChain: Promise<void> = Promise.resolve();

function fresh(): DbShape {
  return {
    users: structuredClone(seedUsers),
    conversations: structuredClone(seedConversations),
    messages: structuredClone(seedMessages),
    knowledge: structuredClone(seedKnowledge),
    products: structuredClone(seedProducts),
    orders: structuredClone(seedOrders),
    agents: structuredClone(seedAgents),
  };
}

async function load(): Promise<DbShape> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(filePath, "utf8");
    cache = JSON.parse(raw) as DbShape;
    return cache;
  } catch {
    cache = fresh();
    await persist(cache);
    return cache;
  }
}

async function persist(db: DbShape) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(db, null, 2), "utf8");
}

function mutate<T>(fn: (db: DbShape) => T | Promise<T>): Promise<T> {
  const job = writeChain.then(async () => {
    const db = await load();
    const result = await fn(db);
    cache = db;
    await persist(db);
    return result;
  });
  writeChain = job.then(
    () => undefined,
    () => undefined,
  );
  return job;
}

export async function listConversations() {
  const db = await load();
  return [...db.conversations].sort((a, b) =>
    b.lastMessageAt.localeCompare(a.lastMessageAt),
  );
}

export async function getConversation(idValue: string) {
  const db = await load();
  return db.conversations.find((c) => c.id === idValue) ?? null;
}

export async function createConversation(input: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  channel: Conversation["channel"];
  customerId?: string;
}) {
  return mutate((db) => {
    const conversation: Conversation = {
      id: id("cnv"),
      customerId: input.customerId || id("cst"),
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      channel: input.channel,
      status: "open",
      lastMessage: "",
      lastMessageAt: nowIso(),
      unreadCount: 0,
      botPaused: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.conversations.unshift(conversation);
    return conversation;
  });
}

export async function updateConversation(
  idValue: string,
  patch: Partial<Conversation>,
) {
  return mutate((db) => {
    const row = db.conversations.find((c) => c.id === idValue);
    if (!row) return null;
    Object.assign(row, patch, { updatedAt: nowIso() });
    return row;
  });
}

export async function listMessages(conversationId: string) {
  const db = await load();
  return db.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function addMessage(input: Omit<Message, "id" | "createdAt"> & { createdAt?: string }) {
  return mutate((db) => {
    const message: Message = {
      ...input,
      id: id("msg"),
      createdAt: input.createdAt || nowIso(),
    };
    db.messages.push(message);
    const conv = db.conversations.find((c) => c.id === input.conversationId);
    if (conv) {
      conv.lastMessage = input.body.slice(0, 140);
      conv.lastMessageAt = message.createdAt;
      conv.updatedAt = message.createdAt;
      if (input.sender === "customer") conv.unreadCount += 1;
    }
    return message;
  });
}

export async function listKnowledge(publishedOnly = false) {
  const db = await load();
  return db.knowledge.filter((k) => (publishedOnly ? k.status === "published" : true));
}

export async function upsertKnowledge(article: Partial<KnowledgeArticle> & { title: string; content: string }) {
  return mutate((db) => {
    if (article.id) {
      const existing = db.knowledge.find((k) => k.id === article.id);
      if (existing) {
        Object.assign(existing, article, { updatedAt: nowIso() });
        return existing;
      }
    }
    const row: KnowledgeArticle = {
      id: article.id || id("kb"),
      title: article.title,
      content: article.content,
      category: article.category || "General",
      status: article.status || "published",
      embedding: article.embedding,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.knowledge.unshift(row);
    return row;
  });
}

export async function deleteKnowledge(idValue: string) {
  return mutate((db) => {
    db.knowledge = db.knowledge.filter((k) => k.id !== idValue);
    return true;
  });
}

export async function listProducts() {
  const db = await load();
  return db.products;
}

export async function listOrders() {
  const db = await load();
  return db.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderByRef(ref: string) {
  const db = await load();
  const needle = ref.replace(/^#/, "").toLowerCase();
  return (
    db.orders.find(
      (o) =>
        o.id.toLowerCase() === needle ||
        o.id.toLowerCase().endsWith(needle) ||
        o.id.replace("ord_", "") === needle,
    ) ?? null
  );
}

export async function listAgents() {
  const db = await load();
  return db.agents;
}

export async function findUserByEmail(email: string) {
  const db = await load();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function verifyUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user?.passwordHash) return null;
  if (!compareSync(password, user.passwordHash)) return null;
  return user;
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const { hashSync } = await import("bcryptjs");
  return mutate((db) => {
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("Email already registered");
    }
    const user: User = {
      id: id("usr"),
      name: input.name,
      email: input.email,
      role: "agent",
      status: "active",
      passwordHash: hashSync(input.password, 10),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.users.push(user);
    db.agents.push({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "agent",
      status: "active",
      activeChats: 0,
      resolvedToday: 0,
    });
    return user;
  });
}

export async function stats(): Promise<DashboardStats> {
  const db = await load();
  const total = db.conversations.length;
  const website = db.conversations.filter((c) => c.channel === "website").length;
  const whatsapp = db.conversations.filter((c) => c.channel === "whatsapp").length;
  const aiResolved = db.conversations.filter((c) => c.status === "closed" || c.status === "ai").length;
  const human = db.conversations.filter((c) => c.status === "human").length;
  const openNow = db.conversations.filter((c) => c.status !== "closed").length;
  return {
    totalConversations: total,
    websiteConversations: website,
    whatsappConversations: whatsapp,
    aiResolved,
    humanSupport: human,
    openNow,
    avgFirstResponseSec: 12,
    csat: 4.8,
  };
}

export async function setStatus(conversationId: string, status: ConversationStatus, agent?: { id: string; name: string }) {
  return updateConversation(conversationId, {
    status,
    botPaused: status === "human",
    assignedAgentId: agent?.id,
    assignedAgentName: agent?.name,
  });
}
