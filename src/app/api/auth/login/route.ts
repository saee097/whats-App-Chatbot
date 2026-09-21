import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession, SESSION_COOKIE, signSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { verifyUser } from "@/lib/store";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const limited = rateLimit(`login:${req.headers.get("x-forwarded-for") || "local"}`, 12);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  const body = loginSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid credentials payload" }, { status: 400 });
  }
  const user = await verifyUser(body.data.email, body.data.password);
  if (!user || (user.role !== "admin" && user.role !== "agent")) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = signSession(session);
  const res = NextResponse.json({ user: session });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: session });
}
