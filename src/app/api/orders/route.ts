import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { listOrders } from "@/lib/store";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: await listOrders() });
}
