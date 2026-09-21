import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReply } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";
import {
  addMessage,
  createConversation,
  getConversation,
  listMessages,
  updateConversation,
} from "@/lib/store";

export const runtime = "nodejs";

const schema = z.object({
  conversationId: z.string().optional(),
  customerName: z.string().default("Website visitor"),
  customerEmail: z.string().email().optional(),
  message: z.string().min(1).max(4000),
  channel: z.enum(["website", "whatsapp"]).default("website"),
});

export async function POST(req: Request) {
  const limited = rateLimit(`chat:${req.headers.get("x-forwarded-for") || "local"}`, 30);
  if (!limited.ok) {
    return NextResponse.json({ error: "Slow down — too many messages." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  let conversation = parsed.data.conversationId
    ? await getConversation(parsed.data.conversationId)
    : null;
  if (!conversation) {
    conversation = await createConversation({
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      channel: parsed.data.channel,
    });
  }

  const userMessage = await addMessage({
    conversationId: conversation.id,
    sender: "customer",
    senderName: conversation.customerName,
    body: parsed.data.message.trim(),
    messageType: "text",
    status: "delivered",
  });

  if (conversation.botPaused || conversation.status === "human") {
    const latest = await getConversation(conversation.id);
    return NextResponse.json({
      conversation: latest,
      messages: [userMessage],
      bot: null,
      queuedForHuman: true,
    });
  }

  const history = await listMessages(conversation.id);
  const reply = await generateReply({
    conversation,
    history,
    userText: parsed.data.message,
  });

  if (reply.handoff) {
    await updateConversation(conversation.id, {
      status: "human",
      botPaused: true,
    });
    const system = await addMessage({
      conversationId: conversation.id,
      sender: "system",
      senderName: "System",
      body: "Bot paused. Waiting for a human agent.",
      messageType: "text",
      status: "sent",
    });
    const bot = await addMessage({
      conversationId: conversation.id,
      sender: "bot",
      senderName: "Aether",
      body: reply.body,
      messageType: "text",
      status: "sent",
    });
    return NextResponse.json({
      conversation: await getConversation(conversation.id),
      messages: [userMessage, system, bot],
      bot,
      queuedForHuman: true,
    });
  }

  await updateConversation(conversation.id, { status: "ai" });
  const bot = await addMessage({
    conversationId: conversation.id,
    sender: "bot",
    senderName: "Aether",
    body: reply.body,
    messageType: "text",
    status: "sent",
  });

  return NextResponse.json({
    conversation: await getConversation(conversation.id),
    messages: [userMessage, bot],
    bot,
    queuedForHuman: false,
  });
}
