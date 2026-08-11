import Link from "next/link";
import { Scale } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardBody } from "@/components/ui/Card";
import { formatDateTime, formatINR } from "@/lib/format";
import { DisputeResolveForm } from "./DisputeResolveForm";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral" | "info"> = {
  OPEN: "warning",
  UNDER_REVIEW: "info",
  WAITING_ON_OWNER: "warning",
  WAITING_ON_RENTER: "warning",
  RESOLVED: "success",
  ESCALATED: "danger",
};

export default async function AdminDisputesPage() {
  const disputes = await prisma.dispute.findMany({
    include: {
      booking: {
        include: {
          vehicle: { include: { owner: true } },
          renter: true,
          damageClaims: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Disputes</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Review and resolve renter/owner disputes and damage claims.</p>

      {disputes.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<Scale className="size-6" />} title="No disputes" description="There are no disputes on the platform right now." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {disputes.map((d) => (
            <Card key={d.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone={STATUS_TONE[d.status] ?? "neutral"}>{d.status.replace(/_/g, " ")}</Badge>
                      <span className="text-xs uppercase tracking-wide text-[var(--muted-2)]">{d.category}</span>
                    </div>
                    <Link href={`/booking/${d.bookingId}`} className="mt-1.5 block text-sm font-semibold hover:underline">
                      {d.booking.vehicle.brand} {d.booking.vehicle.model}
                    </Link>
                    <p className="text-xs text-[var(--muted)]">
                      Renter: {d.booking.renter.name} &middot; Owner: {d.booking.vehicle.owner.name}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--muted-2)]">Opened {formatDateTime(d.createdAt)}</p>
                </div>

                <p className="mt-3 text-sm text-[var(--foreground)]">{d.description}</p>

                {d.resolution && (
                  <div className="mt-3 rounded-[var(--radius-sm)] bg-[var(--success-bg)] px-3 py-2 text-sm text-[var(--success)]">
                    <span className="font-semibold">Resolution: </span>
                    {d.resolution}
                  </div>
                )}

                {d.booking.damageClaims.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Linked damage claims</p>
                    {d.booking.damageClaims.map((c) => (
                      <div key={c.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span>{c.description}</span>
                          <span className="font-semibold">{formatINR(c.estimatedCost)}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                          <span>Status: {c.status.replace(/_/g, " ")}</span>
                          {c.renterResponse && <span>Renter said: {c.renterResponse}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {d.status !== "RESOLVED" && (
                  <DisputeResolveForm disputeId={d.id} currentStatus={d.status} currentResolution={d.resolution} />
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
