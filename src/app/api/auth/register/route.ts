import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, signSession } from "@/lib/auth";
import { registerUser } from "@/lib/store";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Name, email, and 8+ character password required" }, { status: 400 });
  }
  try {
    const user = await registerUser(parsed.data);
    const session = { id: user.id, name: user.name, email: user.email, role: user.role };
    const res = NextResponse.json({ user: session });
    res.cookies.set(SESSION_COOKIE, signSession(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not register" },
      { status: 409 },
    );
  }
}
