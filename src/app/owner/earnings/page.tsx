import { Wallet, TrendingUp, Landmark } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { WithdrawButton } from "@/components/owner/WithdrawButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR, formatDate } from "@/lib/format";
import { OWNER_COMMISSION_RATE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const vehicleIds = (await prisma.vehicle.findMany({ where: { ownerId: user.id }, select: { id: true } })).map((v) => v.id);

  const [payments, payouts] = await Promise.all([
    prisma.payment.findMany({
      where: { booking: { vehicleId: { in: vehicleIds } }, type: { in: ["RENTAL", "EXTRA_CHARGE"] }, status: "SUCCESS" },
      include: { booking: { include: { vehicle: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payout.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const grossEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
  const netEarnings = Math.round(grossEarnings * (1 - OWNER_COMMISSION_RATE));
  const commission = grossEarnings - netEarnings;
  const paidOut = payouts.reduce((sum, p) => sum + p.amount, 0);
  const available = Math.max(0, netEarnings - paidOut);

  const monthly = new Map<string, number>();
  for (const p of payments) {
    const key = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(p.createdAt);
    monthly.set(key, (monthly.get(key) ?? 0) + Math.round(p.amount * (1 - OWNER_COMMISSION_RATE)));
  }
  const monthlyEntries = Array.from(monthly.entries()).slice(0, 6).reverse();
  const maxMonthly = Math.max(...monthlyEntries.map(([, v]) => v), 1);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Track your revenue and manage payouts.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <div className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-[var(--muted)]"><Wallet className="size-4" /></div>
          <p className="mt-2.5 text-xl font-bold">{formatINR(available)}</p>
          <p className="text-xs text-[var(--muted)]">Available balance</p>
          <div className="mt-3">
            <WithdrawButton available={available} />
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <div className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-[var(--muted)]"><TrendingUp className="size-4" /></div>
          <p className="mt-2.5 text-xl font-bold">{formatINR(netEarnings)}</p>
          <p className="text-xs text-[var(--muted)]">Net lifetime earnings (after {Math.round(OWNER_COMMISSION_RATE * 100)}% platform commission of {formatINR(commission)})</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <div className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-[var(--muted)]"><Landmark className="size-4" /></div>
          <p className="mt-2.5 text-xl font-bold">{formatINR(paidOut)}</p>
          <p className="text-xs text-[var(--muted)]">Already withdrawn</p>
        </div>
      </div>

      {monthlyEntries.length > 0 && (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold mb-4">Monthly net earnings</h2>
          <div className="flex items-end gap-3 h-32">
            {monthlyEntries.map(([label, value]) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className="w-8 rounded-t-md bg-[var(--primary)]"
                    style={{ height: `${Math.max(6, (value / maxMonthly) * 100)}%` }}
                    title={formatINR(value)}
                  />
                </div>
                <span className="text-[10px] text-[var(--muted-2)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-base font-bold mb-3">Transaction history</h2>
        {payments.length === 0 ? (
          <EmptyState icon={<Wallet className="size-6" />} title="No earnings yet" description="Completed rentals will appear here." />
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
            {payments.slice(0, 20).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <div>
                  <p className="font-medium">{p.booking.vehicle.brand} {p.booking.vehicle.model}</p>
                  <p className="text-xs text-[var(--muted-2)]">{formatDate(p.createdAt)} · {p.type.replace("_", " ")}</p>
                </div>
                <span className="font-semibold">{formatINR(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
