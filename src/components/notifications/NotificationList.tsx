"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  AlertTriangle,
  MessageSquare,
  Star,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BOOKING_REQUEST: CalendarCheck,
  BOOKING_ACCEPTED: CheckCircle2,
  BOOKING_REJECTED: AlertTriangle,
  PAYMENT_SUCCESS: CreditCard,
  KYC_UPDATE: FileCheck2,
  AGREEMENT_READY: FileCheck2,
  RENTAL_STARTING: CalendarCheck,
  RETURN_REMINDER: CalendarCheck,
  DAMAGE_CLAIM: AlertTriangle,
  DISPUTE_UPDATE: AlertTriangle,
  REVIEW_REQUEST: Star,
  MESSAGE: MessageSquare,
  GENERAL: Info,
};

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string | Date;
}

export function NotificationList({ initial }: { initial: NotificationItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const unreadCount = items.filter((n) => !n.read).length;

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", { method: "PATCH" });
    router.refresh();
  }

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Bell className="size-6" />} title="No notifications yet" description="We'll let you know when something needs your attention." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Info;
            const content = (
              <div
                className={cn(
                  "flex gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors",
                  n.read ? "border-[var(--border)] bg-white" : "border-blue-200 bg-blue-50/50"
                )}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--muted)] border border-[var(--border)]">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.read && <span className="size-2 shrink-0 rounded-full bg-[var(--accent)]" />}
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">{n.body}</p>
                  <p className="mt-1 text-xs text-[var(--muted-2)]">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} onClick={() => markRead(n.id)}>
                {content}
              </Link>
            ) : (
              <div key={n.id} onClick={() => markRead(n.id)} className="cursor-pointer">
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
