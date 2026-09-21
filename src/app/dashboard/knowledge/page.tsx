"use client";

import { FormEvent, useEffect, useState } from "react";
import type { KnowledgeArticle } from "@/lib/types";

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/knowledge");
    const data = await res.json();
    setArticles(data.articles || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, content }),
    });
    setTitle("");
    setContent("");
    setBusy(false);
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="font-serif text-4xl">Knowledge base</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Articles are retrieved for every AI reply. With an OpenAI key they are embedded for vector
          search; otherwise lexical ranking still runs.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            required
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Source content the model may cite"
            rows={8}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            required
          />
          <button
            disabled={busy}
            className="rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-[#05261c]"
          >
            {busy ? "Indexing…" : "Add & index"}
          </button>
        </form>
      </div>
      <div className="space-y-3">
        {articles.map((a) => (
          <article key={a.id} className="rounded-2xl border border-white/8 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[var(--accent)]">{a.category}</p>
                <h2 className="font-semibold">{a.title}</h2>
              </div>
              <button type="button" onClick={() => void remove(a.id)} className="text-xs text-[var(--danger)]">
                Remove
              </button>
            </div>
            <p className="mt-2 line-clamp-4 text-sm text-[var(--muted)]">{a.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
