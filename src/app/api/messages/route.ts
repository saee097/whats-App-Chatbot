import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/auth";
import { addMessage, getConversation, listMessages } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const conversationId = new URL(req.url).searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  const messages = await listMessages(conversationId);
  return NextResponse.json({ messages });
}

const schema = z.object({
  conversationId: z.string(),
  body: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  const conversation = await getConversation(parsed.data.conversationId);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const message = await addMessage({
    conversationId: parsed.data.conversationId,
    sender: "agent",
    senderName: session.name,
    body: parsed.data.body,
    messageType: "text",
    status: "sent",
  });
  return NextResponse.json({ message });
}
