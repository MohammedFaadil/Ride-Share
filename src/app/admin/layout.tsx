import { redirect } from "next/navigation";
import { LayoutGrid, Users, Car, CalendarCheck, Scale, Wallet, Settings } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LayoutGrid className="size-4" />, exact: true },
  { href: "/admin/users", label: "Users", icon: <Users className="size-4" /> },
  { href: "/admin/vehicles", label: "Vehicles", icon: <Car className="size-4" /> },
  { href: "/admin/bookings", label: "Bookings", icon: <CalendarCheck className="size-4" /> },
  { href: "/admin/disputes", label: "Disputes", icon: <Scale className="size-4" /> },
  { href: "/admin/payments", label: "Payments", icon: <Wallet className="size-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="size-4" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <DashboardShell
      title="Admin Console"
      navItems={NAV}
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
    >
      {children}
    </DashboardShell>
  );
}
