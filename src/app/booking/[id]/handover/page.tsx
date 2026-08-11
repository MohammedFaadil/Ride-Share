import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, CheckCircle2, Circle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { InspectionForm } from "@/components/booking/InspectionForm";

export const dynamic = "force-dynamic";

export default async function HandoverPage({ params }: PageProps<"/booking/[id]/handover">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/booking/${id}/handover`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { vehicle: true, renter: true, handover: true },
  });
  if (!booking) notFound();

  const isRenter = booking.renterId === user.id;
  const isOwner = booking.vehicle.ownerId === user.id;
  if (!isRenter && !isOwner && user.role !== "ADMIN") notFound();
  if (!["HANDOVER_PENDING", "ACTIVE"].includes(booking.status)) notFound();

  const myConfirmed = isOwner ? !!booking.handover?.ownerConfirmed : !!booking.handover?.renterConfirmed;
  const bothConfirmed = !!booking.handover?.ownerConfirmed && !!booking.handover?.renterConfirmed;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/booking/${id}`} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-4">
        <ArrowLeft className="size-4" /> Back to booking
      </Link>
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="size-5" />
        <h1 className="text-xl font-bold tracking-tight">Vehicle Handover</h1>
      </div>
      <p className="text-sm text-[var(--muted)] mb-6">
        {booking.vehicle.year} {booking.vehicle.brand} {booking.vehicle.model} · Both the owner and renter must confirm to start the rental.
      </p>

      <div className="mb-5 flex gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
        <ConfirmStatus label="Owner" confirmed={!!booking.handover?.ownerConfirmed} />
        <ConfirmStatus label="Renter" confirmed={!!booking.handover?.renterConfirmed} />
      </div>

      <InspectionForm
        bookingId={booking.id}
        kind="handover"
        defaultOdometer={booking.vehicle.odometerKm}
        alreadyConfirmedByMe={myConfirmed}
        bothConfirmed={bothConfirmed}
        myRole={isOwner ? "owner" : "renter"}
      />
    </div>
  );
}

function ConfirmStatus({ label, confirmed }: { label: string; confirmed: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {confirmed ? (
        <CheckCircle2 className="size-4 text-[var(--success)]" />
      ) : (
        <Circle className="size-4 text-[var(--muted-2)]" />
      )}
      <span className={confirmed ? "font-medium" : "text-[var(--muted)]"}>{label} confirmed</span>
    </div>
  );
}
