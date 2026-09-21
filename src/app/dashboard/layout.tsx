import { readSession } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await readSession();
  if (!session) redirect("/login");
  return (
    <div className="flex min-h-screen gap-4 p-4">
      <Sidebar name={session.name} email={session.email} />
      <main className="glass min-h-[calc(100vh-2rem)] flex-1 overflow-hidden rounded-3xl p-6">
        {children}
      </main>
    </div>
  );
}
