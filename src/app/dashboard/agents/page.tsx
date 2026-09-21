import { listAgents } from "@/lib/store";

export default async function AgentsPage() {
  const agents = await listAgents();
  return (
    <div>
      <h1 className="font-serif text-4xl">Agents</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {agents.map((a) => (
          <article key={a.id} className="rounded-3xl border border-white/8 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{a.name}</h2>
              <span className="text-xs uppercase text-[var(--accent)]">{a.status}</span>
            </div>
            <p className="text-sm text-[var(--muted)]">{a.email}</p>
            <p className="mt-3 text-sm">
              {a.activeChats} live chats · {a.resolvedToday} resolved today · {a.role}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
