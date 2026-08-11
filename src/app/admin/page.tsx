import Link from "next/link";
import {
  Users,
  BadgeCheck,
  Car,
  CheckCircle2,
  Clock3,
  CalendarCheck,
  Activity,
  Wallet,
  Landmark,
  ShieldAlert,
  Scale,
  UserX,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR, formatNumber, timeAgo } from "@/lib/format";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    verifiedUsers,
    totalVehicles,
    activeVehicles,
    pendingVehicles,
    totalBookings,
    activeRentals,
    grossRevenue,
    platformFeeRevenue,
    openDamageClaims,
    openDisputes,
    suspendedUsers,
    recentBookings,
    recentTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { identityVerified: "VERIFIED" } }),
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
    prisma.vehicle.count({ where: { status: { in: ["PENDING_VERIFICATION", "DRAFT"] } } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: { in: ["ACTIVE", "RETURN_PENDING"] } } }),
    prisma.payment.aggregate({
      where: { type: { in: ["RENTAL", "EXTRA_CHARGE"] }, status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.booking.aggregate({
      where: { status: { notIn: ["CANCELLED_BY_RENTER", "CANCELLED_BY_OWNER", "OWNER_REJECTED"] } },
      _sum: { platformFee: true },
    }),
    prisma.damageClaim.count({ where: { status: { notIn: ["RESOLVED"] } } }),
    prisma.dispute.count({ where: { status: { not: "RESOLVED" } } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.booking.findMany({
      include: { vehicle: true, renter: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { icon: <Users className="size-4" />, label: "Total users", value: formatNumber(totalUsers) },
    { icon: <BadgeCheck className="size-4" />, label: "Verified users", value: formatNumber(verifiedUsers) },
    { icon: <Car className="size-4" />, label: "Total vehicles", value: formatNumber(totalVehicles) },
    { icon: <CheckCircle2 className="size-4" />, label: "Active vehicles", value: formatNumber(activeVehicles) },
    { icon: <Clock3 className="size-4" />, label: "Pending listings", value: formatNumber(pendingVehicles) },
    { icon: <CalendarCheck className="size-4" />, label: "Total bookings", value: formatNumber(totalBookings) },
    { icon: <Activity className="size-4" />, label: "Active rentals", value: formatNumber(activeRentals) },
    { icon: <Wallet className="size-4" />, label: "Gross revenue", value: formatINR(grossRevenue._sum.amount ?? 0) },
    { icon: <Landmark className="size-4" />, label: "Platform fee revenue", value: formatINR(platformFeeRevenue._sum.platformFee ?? 0) },
    { icon: <ShieldAlert className="size-4" />, label: "Open damage claims", value: formatNumber(openDamageClaims) },
    { icon: <Scale className="size-4" />, label: "Open disputes", value: formatNumber(openDisputes) },
    { icon: <UserX className="size-4" />, label: "Suspended users", value: formatNumber(suspendedUsers) },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Platform-wide metrics across users, vehicles, bookings and payments.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-base font-bold">Recent bookings</h2>
            <Link href="/admin/bookings" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-0.5">
              View all <ChevronRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {recentBookings.length === 0 ? (
              <p className="p-5 text-sm text-[var(--muted)]">No bookings yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {recentBookings.map((b) => (
                  <li key={b.id}>
                    <Link href={`/booking/${b.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {b.vehicle.brand} {b.vehicle.model}
                        </p>
                        <p className="truncate text-xs text-[var(--muted)]">
                          {b.renter.name} &middot; {timeAgo(b.createdAt)}
                        </p>
                      </div>
                      <Badge tone={BOOKING_STATUS_TONE[b.status] ?? "neutral"}>
                        {BOOKING_STATUS_LABEL[b.status] ?? b.status}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-bold">Recent support tickets</h2>
          </CardHeader>
          <CardBody className="p-0">
            {recentTickets.length === 0 ? (
              <p className="p-5 text-sm text-[var(--muted)]">No support tickets yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {recentTickets.map((t) => (
                  <li key={t.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{t.subject}</p>
                      <Badge tone={t.status === "OPEN" ? "warning" : "neutral"}>{t.status}</Badge>
                    </div>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {t.name} &middot; {t.category} &middot; {timeAgo(t.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
      <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-[var(--muted)]">{icon}</div>
      <p className="mt-2.5 text-lg font-bold">{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
