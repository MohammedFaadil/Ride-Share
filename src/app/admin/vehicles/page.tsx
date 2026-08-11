import Link from "next/link";
import { Car as CarIcon, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { VehicleActions } from "./VehicleActions";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "all", label: "All", statuses: [] as string[] },
  { key: "active", label: "Active", statuses: ["ACTIVE"] },
  { key: "pending", label: "Pending", statuses: ["PENDING_VERIFICATION", "DRAFT"] },
  { key: "suspended", label: "Suspended", statuses: ["SUSPENDED"] },
  { key: "rejected", label: "Rejected", statuses: ["REJECTED"] },
];

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  DRAFT: "neutral",
  PENDING_VERIFICATION: "warning",
  ACTIVE: "success",
  SUSPENDED: "danger",
  REJECTED: "danger",
};

export default async function AdminVehiclesPage({ searchParams }: PageProps<"/admin/vehicles">) {
  const sp = await searchParams;
  const tabKey = typeof sp.status === "string" ? sp.status : "all";
  const tab = TABS.find((t) => t.key === tabKey) ?? TABS[0];

  const vehicles = await prisma.vehicle.findMany({
    where: tab.statuses.length ? { status: { in: tab.statuses as never[] } } : undefined,
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{formatNumber(vehicles.length)} shown &middot; review and moderate listings.</p>

      <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-[var(--radius-sm)] bg-gray-100 p-1 w-fit">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/vehicles" : `/admin/vehicles?status=${t.key}`}
            className={cn(
              "rounded-[6px] px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              tab.key === t.key ? "bg-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {vehicles.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<CarIcon className="size-6" />} title="No vehicles here" description="Try a different filter." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Price/day</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {v.brand} {v.model}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {v.year} &middot; {v.type} {v.verified && <span className="text-[var(--success)]">&middot; Verified</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{v.owner.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{v.city}</td>
                  <td className="px-4 py-3">{formatINR(v.pricePerDay)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {v.ratingAvg > 0 ? v.ratingAvg.toFixed(1) : "—"}
                      <span className="text-xs text-[var(--muted-2)]">({v.ratingCount})</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[v.status]}>{v.status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <VehicleActions vehicleId={v.id} status={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
