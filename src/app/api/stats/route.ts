import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { stats } from "@/lib/store";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ stats: await stats() });
}
