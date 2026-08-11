import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { DamageReportForm, DamageResponseActions } from "@/components/booking/DamageActions";
import { formatINR, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  REPORTED: "warning",
  RENTER_NOTIFIED: "warning",
  ACCEPTED: "success",
  DISPUTED: "danger",
  RESOLVED: "neutral",
};

export default async function DamagePage({ params }: PageProps<"/booking/[id]/damage">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/booking/${id}/damage`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      vehicle: true,
      damageClaims: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!booking) notFound();

  const isRenter = booking.renterId === user.id;
  const isOwner = booking.vehicle.ownerId === user.id;
  if (!isRenter && !isOwner && user.role !== "ADMIN") notFound();

  const activeClaim = booking.damageClaims[0];
  const canReport = isOwner && ["ACTIVE", "RETURN_PENDING", "COMPLETED"].includes(booking.status) && (!activeClaim || activeClaim.status === "RESOLVED");
  const canRespond = isRenter && activeClaim?.status === "RENTER_NOTIFIED";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/booking/${id}`} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-4">
        <ArrowLeft className="size-4" /> Back to booking
      </Link>
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="size-5" />
        <h1 className="text-xl font-bold tracking-tight">Damage Claim</h1>
      </div>
      <p className="text-sm text-[var(--muted)] mb-6">
        {booking.vehicle.year} {booking.vehicle.brand} {booking.vehicle.model}
      </p>

      {activeClaim && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Claim details</h3>
            <Badge tone={STATUS_TONE[activeClaim.status] ?? "neutral"}>{activeClaim.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-sm text-[var(--muted)]">{activeClaim.description}</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">Estimated repair cost</span>
            <span className="font-semibold">{formatINR(activeClaim.estimatedCost)}</span>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-2)]">Reported {formatDateTime(activeClaim.createdAt)}</p>
          {activeClaim.renterResponse && (
            <div className="mt-3 rounded-[var(--radius-sm)] bg-gray-50 p-3 text-sm">
              <p className="text-xs font-semibold text-[var(--muted)] mb-1">Renter response</p>
              {activeClaim.renterResponse}
            </div>
          )}
        </div>
      )}

      {canRespond && <DamageResponseActions bookingId={booking.id} />}
      {canReport && <DamageReportForm bookingId={booking.id} />}

      {!activeClaim && !canReport && (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] p-8 text-center text-sm text-[var(--muted)]">
          No damage has been reported for this rental.
        </div>
      )}

      <div className="mt-6 rounded-[var(--radius-md)] bg-blue-50 p-4 text-xs text-blue-900">
        Damage must be reported within the platform&apos;s configured claim window after return, with
        supporting evidence. Approved charges are settled from the security deposit; unused deposit is
        released to the renter.
      </div>
    </div>
  );
}
