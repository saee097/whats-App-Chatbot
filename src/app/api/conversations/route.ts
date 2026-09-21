import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/auth";
import { createConversation, listConversations, updateConversation } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const conversations = await listConversations();
  return NextResponse.json({ conversations });
}

const createSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  channel: z.enum(["website", "whatsapp"]).default("website"),
});

export async function POST(req: Request) {
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid conversation payload" }, { status: 400 });
  }
  const conversation = await createConversation(parsed.data);
  return NextResponse.json({ conversation });
}

export async function PATCH(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = z
    .object({
      id: z.string(),
      status: z.enum(["open", "pending", "ai", "human", "closed"]).optional(),
      botPaused: z.boolean().optional(),
    })
    .safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const conversation = await updateConversation(body.data.id, {
    status: body.data.status,
    botPaused: body.data.botPaused,
    assignedAgentId: body.data.status === "human" ? session.id : undefined,
    assignedAgentName: body.data.status === "human" ? session.name : undefined,
  });
  return NextResponse.json({ conversation });
}
