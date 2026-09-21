import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";

function secret() {
  return process.env.AUTH_SECRET || "aether-dev-secret-change-me";
}

export function signSession(user: SessionUser) {
  return jwt.sign(user, secret(), { expiresIn: "7d" });
}

export async function readSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get("aether_session")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret()) as SessionUser;
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "aether_session";
