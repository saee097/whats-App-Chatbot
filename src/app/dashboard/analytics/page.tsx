import { listConversations, stats } from "@/lib/store";

export default async function AnalyticsPage() {
  const [s, conversations] = await Promise.all([stats(), listConversations()]);
  const websiteShare = s.totalConversations
    ? Math.round((s.websiteConversations / s.totalConversations) * 100)
    : 0;
  const waShare = 100 - websiteShare;
  const byStatus = conversations.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="font-serif text-4xl">Analytics</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Channel mix and resolution split for this tenant.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/8 p-6">
          <h2 className="text-sm text-[var(--muted)]">Channels</h2>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[var(--accent)]" style={{ width: `${websiteShare}%` }} />
          </div>
          <p className="mt-3 text-sm">
            Website {websiteShare}% · WhatsApp {waShare}%
          </p>
        </article>
        <article className="rounded-3xl border border-white/8 p-6">
          <h2 className="text-sm text-[var(--muted)]">Resolution</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {Object.entries(byStatus).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="capitalize text-[var(--muted)]">{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
