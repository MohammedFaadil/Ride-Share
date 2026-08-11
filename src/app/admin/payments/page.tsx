import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Wallet, Landmark } from "lucide-react";
import { formatINR, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAYMENT_STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
};

export default async function AdminPaymentsPage() {
  const [payments, payouts, collected, refunded, payoutsTotal] = await Promise.all([
    prisma.payment.findMany({
      include: { booking: { include: { vehicle: true, renter: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.payout.findMany({
      include: { owner: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.payment.aggregate({
      where: { type: { in: ["RENTAL", "EXTRA_CHARGE", "DEPOSIT"] }, status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { type: "REFUND" },
      _sum: { amount: true },
    }),
    prisma.payout.aggregate({ _sum: { amount: true } }),
  ]);

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Read-only view of platform payments and owner payouts.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryStat icon={<Wallet className="size-4" />} label="Total collected" value={formatINR(collected._sum.amount ?? 0)} />
        <SummaryStat icon={<Wallet className="size-4" />} label="Total refunded" value={formatINR(refunded._sum.amount ?? 0)} />
        <SummaryStat icon={<Landmark className="size-4" />} label="Total owner payouts" value={formatINR(payoutsTotal._sum.amount ?? 0)} />
      </div>

      <div className="mt-8">
        <h2 className="text-base font-bold mb-3">Payments</h2>
        {payments.length === 0 ? (
          <EmptyState icon={<Wallet className="size-6" />} title="No payments yet" />
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {p.booking.vehicle.brand} {p.booking.vehicle.model}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{p.booking.renter.name}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{p.type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">{formatINR(p.amount)}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{p.method}</td>
                    <td className="px-4 py-3">
                      <Badge tone={PAYMENT_STATUS_TONE[p.status] ?? "neutral"}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{formatDateTime(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-base font-bold mb-3">Owner payouts</h2>
        {payouts.length === 0 ? (
          <EmptyState icon={<Landmark className="size-6" />} title="No payouts yet" />
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-medium">{p.owner.name}</td>
                    <td className="px-4 py-3">{formatINR(p.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.status === "COMPLETED" ? "success" : "warning"}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{formatDateTime(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
      <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-[var(--muted)]">{icon}</div>
      <p className="mt-2.5 text-lg font-bold">{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
