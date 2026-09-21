import { NextResponse } from "next/server";
import { generateReply } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";
import { sendWhatsAppText, verifyWhatsAppSignature } from "@/lib/whatsapp";
import {
  addMessage,
  createConversation,
  listConversations,
  listMessages,
  updateConversation,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN || "aether-verify";
  if (mode === "subscribe" && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  if (!verifyWhatsAppSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const limited = rateLimit("whatsapp-webhook", 120, 60_000);
  if (!limited.ok) return NextResponse.json({ ok: true });

  let payload: WhatsAppPayload;
  try {
    payload = JSON.parse(raw) as WhatsAppPayload;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const messages = payload.entry?.flatMap((e) => e.changes || []) || [];
  for (const change of messages) {
    const inbound = change.value?.messages?.[0];
    const contact = change.value?.contacts?.[0];
    if (!inbound?.text?.body || !inbound.from) continue;

    const phone = inbound.from;
    const name = contact?.profile?.name || `WhatsApp • +${phone}`;
    const existing = (await listConversations()).find(
      (c) => c.channel === "whatsapp" && c.customerPhone === phone,
    );
    const conversation =
      existing ||
      (await createConversation({
        customerName: name,
        customerPhone: phone,
        channel: "whatsapp",
      }));

    await addMessage({
      conversationId: conversation.id,
      sender: "customer",
      senderName: name,
      body: inbound.text.body,
      messageType: "text",
      whatsappMessageId: inbound.id,
      status: "delivered",
    });

    if (conversation.botPaused) continue;

    const history = await listMessages(conversation.id);
    const reply = await generateReply({
      conversation,
      history,
      userText: inbound.text.body,
    });
    if (reply.handoff) {
      await updateConversation(conversation.id, { status: "human", botPaused: true });
    } else {
      await updateConversation(conversation.id, { status: "ai" });
    }
    await addMessage({
      conversationId: conversation.id,
      sender: "bot",
      senderName: "Aether",
      body: reply.body,
      messageType: "text",
      status: "sent",
    });
    await sendWhatsAppText(phone, reply.body);
  }

  return NextResponse.json({ ok: true });
}

interface WhatsAppPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{ id: string; from: string; text?: { body: string } }>;
        contacts?: Array<{ profile?: { name?: string } }>;
      };
    }>;
  }>;
}
