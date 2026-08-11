"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowLeft, LogOut, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { APP_NAME } from "@/lib/constants";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export function DashboardShell({
  title,
  navItems,
  user,
  children,
}: {
  title: string;
  navItems: NavItem[];
  user: { name: string; email: string; avatarUrl: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  const sidebarContent = (
    <>
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--primary)]">
            <Car className="size-3.5 text-white" strokeWidth={2.2} />
          </div>
          <span className="text-sm font-bold tracking-tight">{APP_NAME}</span>
        </Link>
        <p className="mt-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">{title}</p>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item)
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted)] hover:bg-gray-100 hover:text-[var(--foreground)]"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar name={user.name} src={user.avatarUrl} size={34} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-[var(--muted-2)]">{user.email}</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--muted)] hover:bg-gray-100">
          <ArrowLeft className="size-4" /> Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--danger)] hover:bg-gray-100"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] lg:flex">
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-[var(--border)] lg:bg-white">
        {sidebarContent}
      </aside>

      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-white px-4 py-3 lg:hidden">
          <span className="text-sm font-bold">{title}</span>
          <button onClick={() => setMobileOpen(true)} className="flex size-9 items-center justify-center rounded-full hover:bg-gray-100">
            <Menu className="size-5" />
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white">
              <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-full hover:bg-gray-100">
                <X className="size-4" />
              </button>
              {sidebarContent}
            </div>
          </div>
        )}

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
