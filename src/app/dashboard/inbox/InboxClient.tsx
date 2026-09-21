"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChannelMark, StatusPill, timeAgo } from "@/components/dashboard/ui";
import type { Conversation, ConversationStatus, Message } from "@/lib/types";

export function InboxClient() {
  const params = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(params.get("c"));
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<"all" | ChannelFilter>("all");
  const scroller = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => conversations.filter((c) => (filter === "all" ? true : c.channel === filter)),
    [conversations, filter],
  );
  const active = conversations.find((c) => c.id === activeId) || null;

  async function loadList() {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    setConversations(data.conversations || []);
    if (!activeId && data.conversations?.[0]) setActiveId(data.conversations[0].id);
  }

  async function loadThread(id: string) {
    const res = await fetch(`/api/conversations/${id}`);
    const data = await res.json();
    setMessages(data.messages || []);
    if (data.conversation) {
      setConversations((rows) => rows.map((r) => (r.id === id ? data.conversation : r)));
    }
  }

  useEffect(() => {
    void loadList();
  }, []);

  useEffect(() => {
    if (activeId) void loadThread(activeId);
  }, [activeId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (!activeId) return;
    const timer = setInterval(() => void loadThread(activeId), 4000);
    return () => clearInterval(timer);
  }, [activeId]);

  async function sendAgent() {
    if (!activeId || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, body }),
    });
    await loadThread(activeId);
    await loadList();
  }

  async function setStatus(status: ConversationStatus) {
    if (!activeId) return;
    await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: activeId,
        status,
        botPaused: status === "human",
      }),
    });
    await loadList();
    await loadThread(activeId);
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-2rem)] overflow-hidden">
      <section className="w-80 shrink-0 border-r border-white/8">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="font-serif text-2xl">Inbox</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ChannelFilter)}
            className="rounded-full bg-white/8 px-2 py-1 text-xs"
          >
            <option value="all">All</option>
            <option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div className="overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={`w-full border-t border-white/6 px-4 py-3 text-left ${
                c.id === activeId ? "bg-white/8" : "hover:bg-white/4"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{c.customerName}</p>
                {c.unreadCount > 0 && (
                  <span className="rounded-full bg-[var(--accent)] px-1.5 text-[10px] text-[#05261c]">
                    {c.unreadCount}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <ChannelMark channel={c.channel} />
                <StatusPill status={c.status} />
              </div>
              <p className="mt-1 truncate text-xs text-[var(--muted)]">{c.lastMessage}</p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">{timeAgo(c.lastMessageAt)}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="flex min-w-0 flex-1 flex-col">
        {active ? (
          <>
            <header className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">{active.customerName}</h2>
                <p className="text-xs text-[var(--muted)]">
                  {active.customerEmail || active.customerPhone || "No contact"} ·{" "}
                  {active.assignedAgentName || "Unassigned"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void setStatus("human")}
                  className="rounded-full bg-violet-500/20 px-3 py-1.5 text-xs"
                >
                  Join as human
                </button>
                <button
                  type="button"
                  onClick={() => void setStatus("ai")}
                  className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs"
                >
                  Resume bot
                </button>
                <button
                  type="button"
                  onClick={() => void setStatus("closed")}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs"
                >
                  Close
                </button>
              </div>
            </header>
            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${
                    m.sender === "customer"
                      ? "bg-white/8"
                      : m.sender === "bot"
                        ? "ml-auto bg-emerald-400/10"
                        : m.sender === "agent"
                          ? "ml-auto bg-[var(--accent-2)]/20"
                          : "bg-white/5 text-[var(--muted)]"
                  }`}
                >
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-[var(--muted)]">
                    {m.senderName}
                  </p>
                  {m.body}
                </div>
              ))}
            </div>
            <form
              className="border-t border-white/8 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                void sendAgent();
              }}
            >
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Reply as the assigned agent…"
                  className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <button type="submit" className="rounded-2xl bg-[var(--accent)] px-5 font-semibold text-[#05261c]">
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[var(--muted)]">
            Select a conversation
          </div>
        )}
      </section>
    </div>
  );
}

type ChannelFilter = "website" | "whatsapp";
