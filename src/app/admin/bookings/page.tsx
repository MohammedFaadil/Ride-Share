import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR, formatDate, formatNumber } from "@/lib/format";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  "REQUESTED",
  "OWNER_ACCEPTED",
  "OWNER_REJECTED",
  "CONFIRMED",
  "HANDOVER_PENDING",
  "ACTIVE",
  "RETURN_PENDING",
  "COMPLETED",
  "CANCELLED_BY_RENTER",
  "CANCELLED_BY_OWNER",
  "DISPUTED",
];

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: Prisma.BookingWhereInput = {};
  if (status) where.status = status as never;
  if (q) {
    where.OR = [
      { renter: { name: { contains: q, mode: "insensitive" } } },
      { vehicle: { brand: { contains: q, mode: "insensitive" } } },
      { vehicle: { model: { contains: q, mode: "insensitive" } } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { vehicle: { include: { owner: true } }, renter: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatNumber(bookings.length)} shown across the platform.</p>
        </div>
        <form className="flex w-full gap-2 sm:w-auto" action="/admin/bookings" method="get">
          {status && <input type="hidden" name="status" value={status} />}
          <Input name="q" defaultValue={q} placeholder="Search vehicle or renter" className="w-full sm:w-64" />
        </form>
      </div>

      <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-[var(--radius-sm)] bg-gray-100 p-1 w-fit">
        <Link
          href={q ? `/admin/bookings?q=${encodeURIComponent(q)}` : "/admin/bookings"}
          className={cn(
            "rounded-[6px] px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
            !status ? "bg-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          All
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/bookings?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "rounded-[6px] px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              status === s ? "bg-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {BOOKING_STATUS_LABEL[s] ?? s}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<CalendarCheck className="size-6" />} title="No bookings found" description="Try a different filter or search." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Renter</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-[var(--border)] last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/booking/${b.id}`} className="font-medium hover:underline">
                      {b.vehicle.brand} {b.vehicle.model}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{b.renter.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{b.vehicle.owner.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {formatDate(b.startAt)} – {formatDate(b.endAt)}
                  </td>
                  <td className="px-4 py-3">{formatINR(b.totalPayable)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={BOOKING_STATUS_TONE[b.status] ?? "neutral"}>{BOOKING_STATUS_LABEL[b.status] ?? b.status}</Badge>
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
