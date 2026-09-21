import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getConversation, listMessages, updateConversation } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const conversation = await getConversation(id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const messages = await listMessages(id);
  await updateConversation(id, { unreadCount: 0 });
  return NextResponse.json({ conversation, messages });
}
