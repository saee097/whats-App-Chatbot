import OpenAI from "openai";
import { getOrderByRef, listKnowledge, listProducts } from "./store";
import type { Conversation, KnowledgeArticle, Message } from "./types";

function cosine(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function lexicalScore(query: string, article: KnowledgeArticle) {
  const q = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const hay = `${article.title} ${article.content} ${article.category}`.toLowerCase();
  let hits = 0;
  for (const word of q) {
    if (hay.includes(word)) hits += 1;
  }
  return q.length ? hits / q.length : 0;
}

export function wantsHuman(text: string) {
  return /\b(human|agent|person|someone|operator|representative|manager)\b/i.test(text);
}

export function detectIntent(text: string) {
  const t = text.toLowerCase();
  if (wantsHuman(text)) return "handoff";
  if (/\b(order|tracking|shipment|where is)\b/.test(t)) return "order_status";
  if (/\b(price|cost|stock|buy|product|ethiopia|colombia|subscription)\b/.test(t))
    return "catalog";
  if (/\b(ship|delivery|return|refund|pause|skip)\b/.test(t)) return "policy";
  return "general";
}

export async function retrieveKnowledge(query: string, k = 3) {
  const articles = await listKnowledge(true);
  const client = getOpenAI();
  if (client) {
    try {
      const embedding = await client.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
        input: query,
      });
      const vector = embedding.data[0]?.embedding;
      if (vector) {
        return articles
          .map((article) => ({
            article,
            score: article.embedding?.length
              ? cosine(vector, article.embedding)
              : lexicalScore(query, article),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, k);
      }
    } catch {
      // Fall through to lexical retrieval when embeddings are unavailable.
    }
  }
  return articles
    .map((article) => ({ article, score: lexicalScore(query, article) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function generateReply(input: {
  conversation: Conversation;
  history: Message[];
  userText: string;
}) {
  const intent = detectIntent(input.userText);
  if (intent === "handoff") {
    return {
      intent,
      body: "I'm connecting you with a specialist now. The bot will pause until they close this session. Someone from Harbor & Co will pick this up shortly.",
      handoff: true,
    };
  }

  const retrieved = await retrieveKnowledge(input.userText);
  const knowledgeBlock = retrieved
    .filter((r) => r.score > 0.08)
    .map((r) => `### ${r.article.title}\n${r.article.content}`)
    .join("\n\n");

  let businessBlock = "";
  const orderMatch = input.userText.match(/#?\s*(ord[_-]?)?(\d{4,})/i);
  if (intent === "order_status" || orderMatch) {
    const ref = orderMatch?.[2] ? `ord_${orderMatch[2]}` : "";
    const order = ref ? await getOrderByRef(ref) : await getOrderByRef(input.userText);
    if (order) {
      businessBlock = `Order ${order.id} for ${order.customerName} is ${order.status}. Total $${order.totalAmount}. Ship to ${order.deliveryAddress}.`;
    }
  }
  if (intent === "catalog") {
    const products = await listProducts();
    businessBlock = products
      .map((p) => `${p.name} ($${p.price}) — ${p.description} Stock: ${p.stock}. SKU ${p.sku}`)
      .join("\n");
  }

  const client = getOpenAI();
  if (client) {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are Aether, the Harbor & Co support assistant. Be concise, warm, and accurate. Never invent order data. If knowledge is missing, say so and offer a human. Knowledge:\n${knowledgeBlock}\n${businessBlock}`,
        },
        ...input.history.slice(-8).map((m) => ({
          role: (m.sender === "customer" ? "user" : "assistant") as "user" | "assistant",
          content: m.body,
        })),
        { role: "user", content: input.userText },
      ],
    });
    const body =
      completion.choices[0]?.message?.content?.trim() ||
      "I can help with orders, shipping, and our coffees. Could you rephrase that?";
    return { intent, body, handoff: false };
  }

  if (businessBlock) {
    return {
      intent,
      body: `${businessBlock}\n\nNeed anything else — roast advice, a pause, or a tracking link?`,
      handoff: false,
    };
  }
  if (knowledgeBlock) {
    const top = retrieved[0]?.article;
    return {
      intent,
      body: top
        ? `${top.content}\n\nI can also look up an order number or connect you with a person.`
        : "How else can I help?",
      handoff: false,
    };
  }
  return {
    intent,
    body: "I can help with shipping, subscriptions, products, and order tracking. Share an order number, or ask for a human anytime.",
    handoff: false,
  };
}

export async function embedText(text: string) {
  const client = getOpenAI();
  if (!client) return undefined;
  const res = await client.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    input: text,
  });
  return res.data[0]?.embedding;
}
