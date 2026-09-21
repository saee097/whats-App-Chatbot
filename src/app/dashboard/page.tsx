import { listConversations, stats } from "@/lib/store";
import { ChannelMark, StatusPill, timeAgo } from "@/components/dashboard/ui";
import Link from "next/link";

export default async function DashboardPage() {
  const [s, conversations] = await Promise.all([stats(), listConversations()]);
  const cards = [
    { label: "Total conversations", value: s.totalConversations },
    { label: "Website", value: s.websiteConversations },
    { label: "WhatsApp", value: s.whatsappConversations },
    { label: "AI resolved", value: s.aiResolved },
    { label: "Human support", value: s.humanSupport },
    { label: "Open now", value: s.openNow },
  ];

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Harbor & Co</p>
          <h1 className="font-serif text-4xl">Inbox overview</h1>
        </div>
        <p className="text-sm text-[var(--muted)]">CSAT {s.csat} · first reply ~{s.avgFirstResponseSec}s</p>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-xs text-[var(--muted)]">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Recent conversations
      </h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/4 text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last message</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => (
              <tr key={c.id} className="border-t border-white/6">
                <td className="px-4 py-3">
                  <p className="font-medium">{c.customerName}</p>
                  <p className="text-xs text-[var(--muted)]">{timeAgo(c.lastMessageAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <ChannelMark channel={c.channel} />
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={c.status} />
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-[var(--muted)]">{c.lastMessage}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/inbox?c=${c.id}`} className="text-[var(--accent)]">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
