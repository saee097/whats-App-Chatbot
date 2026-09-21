"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Conversation, Message } from "@/lib/types";

type ChatLine = Pick<Message, "id" | "sender" | "body" | "createdAt">;

export function ChatWidget() {
  const pathname = usePathname();
  const hide = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login") || pathname?.startsWith("/register");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatLine[]>([
    {
      id: "hello",
      sender: "bot",
      body: "Hi, I'm Aether for Harbor & Co. Ask about shipping, subscriptions, or order 88421 — or type “human” to reach a person.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const queued = useMemo(
    () => conversation?.botPaused || conversation?.status === "human",
    [conversation],
  );

  if (hide) return null;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [
      ...m,
      {
        id: `local_${Date.now()}`,
        sender: "customer",
        body: text,
        createdAt: new Date().toISOString(),
      },
    ]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation?.id,
          customerName: "Website visitor",
          message: text,
          channel: "website",
        }),
      });
      const data = await res.json();
      if (data.conversation) setConversation(data.conversation);
      const incoming = (data.messages as Message[] | undefined)?.filter((m: Message) => m.sender !== "customer") || [];
      if (incoming.length) {
        setMessages((m) => [...m, ...incoming]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `err_${Date.now()}`,
          sender: "system",
          body: "Connection issue. Try again in a moment.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-[#06281d] shadow-[0_12px_40px_rgba(62,224,176,0.35)]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            className="glass fixed bottom-24 right-6 z-50 flex h-[min(640px,78vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Aether · Harbor & Co</p>
                  <p className="text-xs text-[var(--muted)]">
                    {queued ? "Human support queued" : "AI online · usually replies instantly"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-[var(--muted)] hover:bg-white/5"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2 ${m.sender === "customer" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender !== "customer" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8">
                      {m.sender === "bot" ? <Bot className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.sender === "customer"
                        ? "bg-[var(--accent)] text-[#06281d]"
                        : m.sender === "system"
                          ? "bg-white/5 text-[var(--muted)]"
                          : "bg-[var(--bg-soft)]"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              ))}
              {busy && (
                <p className="pl-9 text-xs text-[var(--muted)]">Aether is writing…</p>
              )}
            </div>

            <form
              className="border-t border-white/10 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <div className="flex items-end gap-2 rounded-2xl bg-black/25 px-3 py-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  rows={1}
                  placeholder={queued ? "Message the team…" : "Ask about orders, beans, shipping…"}
                  className="max-h-28 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-[var(--muted)]"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[#06281d] disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
