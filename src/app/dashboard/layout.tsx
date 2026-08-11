import { redirect } from "next/navigation";
import { LayoutGrid, CalendarCheck, Heart, Bell, UserCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutGrid className="size-4" />, exact: true },
  { href: "/dashboard/bookings", label: "My Bookings", icon: <CalendarCheck className="size-4" /> },
  { href: "/dashboard/favorites", label: "Favorites", icon: <Heart className="size-4" /> },
  { href: "/dashboard/notifications", label: "Notifications", icon: <Bell className="size-4" /> },
  { href: "/dashboard/profile", label: "Profile & KYC", icon: <UserCircle className="size-4" /> },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <DashboardShell
      title="Renter Dashboard"
      navItems={NAV}
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
    >
      {children}
    </DashboardShell>
  );
}
