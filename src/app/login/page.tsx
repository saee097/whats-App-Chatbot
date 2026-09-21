"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("emma.t@example.net");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
      setBusy(false);
      return;
    }
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="glass w-full max-w-md rounded-3xl p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">Aether</p>
        <h1 className="mt-2 font-serif text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Staff desk for Harbor & Co conversations.</p>
        <label className="mt-6 block text-xs text-[var(--muted)]">Email</label>
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
          required
        />
        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-2xl bg-[var(--accent)] py-3 font-semibold text-[#05261c] disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Enter dashboard"}
        </button>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          New teammate?{" "}
          <Link href="/register" className="text-white">
            Create an agent account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
