import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Undo2, CheckCircle2, Circle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { InspectionForm } from "@/components/booking/InspectionForm";

export const dynamic = "force-dynamic";

export default async function ReturnPage({ params }: PageProps<"/booking/[id]/return">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/booking/${id}/return`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { vehicle: true, renter: true, handover: true, returnInspection: true },
  });
  if (!booking) notFound();

  const isRenter = booking.renterId === user.id;
  const isOwner = booking.vehicle.ownerId === user.id;
  if (!isRenter && !isOwner && user.role !== "ADMIN") notFound();
  if (!["ACTIVE", "RETURN_PENDING", "COMPLETED"].includes(booking.status)) notFound();

  const myConfirmed = isOwner ? !!booking.returnInspection?.ownerConfirmed : !!booking.returnInspection?.renterConfirmed;
  const bothConfirmed = !!booking.returnInspection?.ownerConfirmed && !!booking.returnInspection?.renterConfirmed;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/booking/${id}`} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-4">
        <ArrowLeft className="size-4" /> Back to booking
      </Link>
      <div className="flex items-center gap-2 mb-1">
        <Undo2 className="size-5" />
        <h1 className="text-xl font-bold tracking-tight">Vehicle Return</h1>
      </div>
      <p className="text-sm text-[var(--muted)] mb-6">
        {booking.vehicle.year} {booking.vehicle.brand} {booking.vehicle.model} · Included distance:{" "}
        {booking.includedKm} km. Extra usage is billed at ₹{booking.extraKmCharge}/km.
      </p>

      <div className="mb-5 flex gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
        <ConfirmStatus label="Owner" confirmed={!!booking.returnInspection?.ownerConfirmed} />
        <ConfirmStatus label="Renter" confirmed={!!booking.returnInspection?.renterConfirmed} />
      </div>

      <InspectionForm
        bookingId={booking.id}
        kind="return"
        defaultOdometer={booking.handover?.odometerKm ?? booking.vehicle.odometerKm}
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
