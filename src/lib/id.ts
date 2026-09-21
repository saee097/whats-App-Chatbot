import { randomBytes } from "crypto";

export function id(prefix = "") {
  const raw = randomBytes(9).toString("hex");
  return prefix ? `${prefix}_${raw}` : raw;
}

export function nowIso() {
  return new Date().toISOString();
}
