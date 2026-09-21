import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Database,
  Globe,
  MessageCircle,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="grid-fade pointer-events-none absolute inset-0 opacity-40" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Aether</p>
          <p className="font-serif text-2xl">Support</p>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-full px-4 py-2 text-[var(--muted)] hover:text-white">
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-[var(--accent)] px-4 py-2 font-semibold text-[#05261c]"
          >
            Open inbox
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-10 pt-8 md:pt-16">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--muted)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
          Website widget · WhatsApp Cloud API · RAG · human handoff
        </p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
          Production support that answers on the site and on WhatsApp.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
          Aether is an omnichannel desk for Harbor & Co — AI with retrieval, live agent takeover,
          knowledge embeddings, and order-aware replies. Built on Next.js, Node, and Supabase.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            Launch dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-[var(--muted)]"
          >
            See the stack
          </a>
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Demo login: emma.t@example.net / demo1234
        </p>
      </section>

      <section className="relative mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
        {[
          {
            icon: Globe,
            title: "Website chatbot",
            body: "Embeddable widget with typing state, session continuity, and rate-limited /api/chat.",
          },
          {
            icon: MessageCircle,
            title: "WhatsApp auto-reply",
            body: "Verified Cloud API webhooks, signature checks, and the same RAG brain as the site.",
          },
          {
            icon: Bot,
            title: "Human handoff",
            body: "Say “agent” and the bot pauses. Inbox assigns a specialist; resume only when closed.",
          },
        ].map((card) => (
          <article key={card.title} className="glass rounded-3xl p-6">
            <card.icon className="mb-4 h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{card.body}</p>
          </article>
        ))}
      </section>

      <section id="architecture" className="relative mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-serif text-4xl">How a message is answered</h2>
        <ol className="mt-8 grid gap-3 md:grid-cols-5">
          {[
            "Customer writes",
            "Intent detect",
            "Retrieve knowledge",
            "LLM + orders",
            "Reply or handoff",
          ].map((step, i) => (
            <li key={step} className="glass rounded-2xl p-4 text-sm">
              <span className="text-[var(--accent)]">0{i + 1}</span>
              <p className="mt-2 font-medium">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="glass rounded-3xl p-6">
            <Database className="mb-3 h-5 w-5 text-[var(--accent-2)]" />
            <h3 className="font-semibold">Supabase PostgreSQL</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Users, conversations, messages, knowledge with pgvector, products, and orders. Demo mode
              ships with a local store so you can run before wiring keys.
            </p>
          </article>
          <article className="glass rounded-3xl p-6">
            <Shield className="mb-3 h-5 w-5 text-[var(--accent)]" />
            <h3 className="font-semibold">Production controls</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              JWT sessions, Zod validation, rate limits, Helmet-ready Express companion, WhatsApp HMAC
              verification, and env-based secrets.
            </p>
          </article>
          <article className="glass rounded-3xl p-6">
            <Workflow className="mb-3 h-5 w-5 text-[var(--warn)]" />
            <h3 className="font-semibold">Business automation</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Order lookups, catalog answers, and subscription policy from the knowledge base — the
              same APIs agents use in the desk.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
