import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, Circle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SignAgreementAction } from "@/components/booking/BookingActions";
import { formatINR, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AgreementPage({ params }: PageProps<"/booking/[id]/agreement">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/booking/${id}/agreement`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { vehicle: { include: { owner: true } }, renter: true, agreement: true },
  });
  if (!booking || !booking.agreement) notFound();

  const isRenter = booking.renterId === user.id;
  const isOwner = booking.vehicle.ownerId === user.id;
  if (!isRenter && !isOwner && user.role !== "ADMIN") notFound();

  const terms = JSON.parse(booking.agreement.termsSnapshot);
  const mySigned = isRenter ? !!booking.agreement.renterSignedAt : !!booking.agreement.ownerSignedAt;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/booking/${id}`} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-4">
        <ArrowLeft className="size-4" /> Back to booking
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <FileText className="size-5" />
        <h1 className="text-xl font-bold tracking-tight">Digital Rental Agreement</h1>
      </div>
      <p className="text-sm text-[var(--muted)] mb-6">
        Agreement ID: {booking.agreement.id.slice(-10).toUpperCase()} · Generated {formatDateTime(booking.agreement.createdAt)}
      </p>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 space-y-6 text-sm leading-relaxed">
        <Section title="Parties">
          <p><b>Owner:</b> {booking.vehicle.owner.name}</p>
          <p><b>Renter:</b> {booking.renter.name}</p>
        </Section>
        <Section title="Vehicle">
          <p>{booking.vehicle.year} {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.registrationNo})</p>
        </Section>
        <Section title="Rental period">
          <p>From <b>{formatDateTime(booking.startAt)}</b> to <b>{formatDateTime(booking.endAt)}</b></p>
        </Section>
        <Section title="Charges">
          <ul className="list-disc pl-5 space-y-1">
            <li>Base fare: {formatINR(booking.baseFare)}</li>
            <li>Platform fee: {formatINR(booking.platformFee)}</li>
            <li>Taxes (GST): {formatINR(booking.taxes)}</li>
            <li>Security deposit: {formatINR(terms.securityDeposit)} (refundable, subject to inspection)</li>
            <li>Included distance: {terms.includedKmTotal} km — extra usage billed at {formatINR(terms.extraKmCharge)}/km</li>
            <li>Late return fee: {formatINR(terms.lateFeePerHour)}/hour after a 30-minute grace period</li>
          </ul>
        </Section>
        <Section title="Fuel policy">
          <p>{terms.fuelPolicy}</p>
        </Section>
        <Section title="Usage restrictions">
          <ul className="list-disc pl-5 space-y-1">
            <li>The vehicle may not be sub-rented or used for commercial ride-hailing without the owner&apos;s written consent.</li>
            <li>Smoking inside the vehicle is not permitted.</li>
            <li>The renter must hold a valid driving licence for the vehicle class at all times during the rental.</li>
            <li>Racing, off-road use, or towing is prohibited unless explicitly agreed with the owner.</li>
          </ul>
        </Section>
        <Section title="Damage, accidents & disputes">
          <p>
            Any damage must be reported within 24 hours of return with supporting evidence. The renter
            will be notified and may accept or dispute the claim. Unresolved disputes are reviewed by
            Roamly&apos;s support team. In case of an accident, both parties should prioritize safety,
            document the scene, and contact Roamly support and, where required, local authorities.
          </p>
        </Section>
        <Section title="Cancellation">
          <p>
            Free cancellation is available up to the platform&apos;s configured cancellation window before
            pickup. Cancellations after this window, or after handover has begun, may be subject to
            partial charges as described in the Cancellation Policy.
          </p>
        </Section>
        <p className="text-xs text-[var(--muted-2)] pt-4 border-t border-[var(--border)]">
          This is a demo digital agreement for prototype purposes. It is not a substitute for a
          jurisdiction-reviewed legal contract or a compliant e-signature provider.
        </p>
      </div>

      <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
        <h3 className="text-sm font-semibold mb-3">Signatures</h3>
        <div className="space-y-2 mb-4">
          <SignatureRow label={`Owner — ${booking.vehicle.owner.name}`} signedAt={booking.agreement.ownerSignedAt} />
          <SignatureRow label={`Renter — ${booking.renter.name}`} signedAt={booking.agreement.renterSignedAt} />
        </div>
        <SignAgreementAction bookingId={booking.id} alreadySigned={mySigned} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-1.5">{title}</h3>
      {children}
    </div>
  );
}

function SignatureRow({ label, signedAt }: { label: string; signedAt: Date | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2">
        {signedAt ? (
          <CheckCircle2 className="size-4 text-[var(--success)]" />
        ) : (
          <Circle className="size-4 text-[var(--muted-2)]" />
        )}
        {label}
      </span>
      <span className="text-xs text-[var(--muted-2)]">{signedAt ? formatDateTime(signedAt) : "Pending"}</span>
    </div>
  );
}
