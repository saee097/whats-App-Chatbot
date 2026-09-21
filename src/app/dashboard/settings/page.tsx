export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Wire production secrets in <code className="text-[var(--accent)]">.env.local</code>. The app
        runs in demo mode without them.
      </p>
      <dl className="mt-8 space-y-4 text-sm">
        {[
          ["OPENAI_API_KEY", "Enables GPT replies and embeddings"],
          ["NEXT_PUBLIC_SUPABASE_URL", "Postgres + Auth + Realtime"],
          ["SUPABASE_SERVICE_ROLE_KEY", "Server-side writes and pgvector upserts"],
          ["WHATSAPP_ACCESS_TOKEN", "Cloud API send"],
          ["WHATSAPP_PHONE_NUMBER_ID", "Business phone id"],
          ["WHATSAPP_APP_SECRET", "Webhook HMAC verification"],
          ["WHATSAPP_VERIFY_TOKEN", "GET hub.verify_token"],
          ["AUTH_SECRET", "JWT signing for the desk"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-white/8 p-4">
            <dt className="font-mono text-xs text-[var(--accent)]">{k}</dt>
            <dd className="mt-1 text-[var(--muted)]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
