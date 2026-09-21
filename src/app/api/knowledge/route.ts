import { NextResponse } from "next/server";
import { z } from "zod";
import { embedText } from "@/lib/ai";
import { readSession } from "@/lib/auth";
import { deleteKnowledge, listKnowledge, upsertKnowledge } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ articles: await listKnowledge() });
}

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  content: z.string().min(8),
  category: z.string().default("General"),
  status: z.enum(["draft", "published"]).default("published"),
});

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid article" }, { status: 400 });
  const embedding = await embedText(`${parsed.data.title}\n${parsed.data.content}`).catch(() => undefined);
  const article = await upsertKnowledge({ ...parsed.data, embedding });
  return NextResponse.json({ article });
}

export async function DELETE(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteKnowledge(id);
  return NextResponse.json({ ok: true });
}
