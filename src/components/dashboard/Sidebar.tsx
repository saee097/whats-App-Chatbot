"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Users,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/dashboard/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/agents", label: "Agents", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="glass flex w-64 shrink-0 flex-col rounded-3xl p-4">
      <Link href="/" className="mb-6 px-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Aether</p>
        <p className="font-serif text-2xl">Support</p>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-[var(--muted)] transition",
                active && "bg-white/8 text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="px-2 text-sm font-medium">{name}</p>
        <p className="px-2 text-xs text-[var(--muted)]">{email}</p>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-3 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-[var(--muted)] hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
