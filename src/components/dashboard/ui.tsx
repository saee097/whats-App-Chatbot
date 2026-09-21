import { formatDistanceToNow } from "date-fns";
import type { ConversationStatus } from "@/lib/types";

export function StatusPill({ status }: { status: ConversationStatus | string }) {
  const map: Record<string, string> = {
    open: "bg-sky-400/15 text-sky-300",
    ai: "bg-emerald-400/15 text-emerald-300",
    human: "bg-violet-400/15 text-violet-300",
    pending: "bg-amber-400/15 text-amber-300",
    closed: "bg-white/10 text-[var(--muted)]",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${map[status] || map.open}`}>
      {status}
    </span>
  );
}

export function ChannelMark({ channel }: { channel: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] ${
        channel === "whatsapp" ? "bg-[#25d366]/15 text-[#25d366]" : "bg-white/10 text-[var(--muted)]"
      }`}
    >
      {channel === "whatsapp" ? "WhatsApp" : "Website"}
    </span>
  );
}

export function timeAgo(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}
