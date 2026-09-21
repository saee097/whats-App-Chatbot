"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not register");
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="glass w-full max-w-md rounded-3xl p-8">
        <h1 className="font-serif text-4xl">Create agent</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Join the Harbor & Co support desk.</p>
        <label className="mt-6 block text-xs text-[var(--muted)]">Name</label>
        <input
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label className="mt-4 block text-xs text-[var(--muted)]">Email</label>
        <input
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <label className="mt-4 block text-xs text-[var(--muted)]">Password</label>
        <input
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          minLength={8}
          required
        />
        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        <button
          disabled={busy}
          className="mt-6 w-full rounded-2xl bg-white py-3 font-semibold text-black"
          type="submit"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Already staff?{" "}
          <Link href="/login" className="text-white">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
