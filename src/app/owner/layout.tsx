import { redirect } from "next/navigation";
import { LayoutGrid, Car, CalendarCheck, CalendarDays, Wallet, Star, Wrench } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";

const NAV: NavItem[] = [
  { href: "/owner", label: "Overview", icon: <LayoutGrid className="size-4" />, exact: true },
  { href: "/owner/vehicles", label: "My Vehicles", icon: <Car className="size-4" /> },
  { href: "/owner/bookings", label: "Booking Requests", icon: <CalendarCheck className="size-4" /> },
  { href: "/owner/calendar", label: "Availability", icon: <CalendarDays className="size-4" /> },
  { href: "/owner/earnings", label: "Earnings", icon: <Wallet className="size-4" /> },
  { href: "/owner/reviews", label: "Reviews", icon: <Star className="size-4" /> },
  { href: "/owner/maintenance", label: "Maintenance", icon: <Wrench className="size-4" /> },
];

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/owner");

  return (
    <DashboardShell
      title="Owner Dashboard"
      navItems={NAV}
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
    >
      {children}
    </DashboardShell>
  );
}
