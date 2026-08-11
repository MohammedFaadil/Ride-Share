"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  MapPin,
  Bell,
  Heart,
  ChevronDown,
  LayoutDashboard,
  Car,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { APP_NAME, CITIES } from "@/lib/constants";

export interface NavUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

export function Navbar({
  user,
  city,
  unreadCount = 0,
}: {
  user: NavUser | null;
  city?: string;
  unreadCount?: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(city);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  async function handleCitySelect(cityName: string) {
    setSelectedCity(cityName);
    setCityOpen(false);
    // If logged in, persist city to profile silently
    if (user) {
      fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: cityName }),
      }).catch(() => {/* non-fatal */});
    }
    router.push(`/explore?city=${encodeURIComponent(cityName)}`);
  }

  const navLinks = [
    { href: "/explore?type=CAR", label: "Cars" },
    { href: "/explore?type=BIKE", label: "Bikes" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/safety", label: "Safety" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--primary)]">
                <Car className="size-4 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[15px] font-bold tracking-tight leading-none">
                {APP_NAME}
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:bg-gray-50 rounded-[var(--radius-sm)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* City selector dropdown */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setCityOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-[var(--muted)] px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors shrink-0 cursor-pointer"
            >
              <MapPin className="size-3.5" />
              <span className="font-medium text-[var(--foreground)]">
                {selectedCity ?? "Select city"}
              </span>
              <ChevronDown className={cn("size-3.5 transition-transform", cityOpen && "rotate-180")} />
            </button>

            {cityOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCityOpen(false)} />
                <div className="absolute left-1/2 -translate-x-1/2 top-11 z-20 w-56 rounded-[var(--radius-md)] border border-[var(--border)] bg-white py-1.5 shadow-xl">
                  <p className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Select your city
                  </p>
                  {CITIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleCitySelect(c.name)}
                      className={cn(
                        "flex w-full items-center justify-between px-3.5 py-2 text-sm hover:bg-gray-50 transition-colors",
                        selectedCity === c.name
                          ? "text-[var(--primary)] font-semibold"
                          : "text-[var(--foreground)]"
                      )}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-[var(--muted)]">{c.state}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button href="/list-vehicle" variant="secondary" size="sm" className="hidden sm:inline-flex">
              List your vehicle
            </Button>

            {user ? (
              <>
                <Link
                  href="/dashboard/notifications"
                  className="relative hidden sm:flex size-9 items-center justify-center rounded-full hover:bg-gray-100 text-[var(--muted)]"
                >
                  <Bell className="size-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 size-2 rounded-full bg-[var(--danger)]" />
                  )}
                </Link>
                <Link
                  href="/dashboard/favorites"
                  className="hidden sm:flex size-9 items-center justify-center rounded-full hover:bg-gray-100 text-[var(--muted)]"
                >
                  <Heart className="size-[18px]" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 hover:bg-gray-100"
                  >
                    <Avatar name={user.name} src={user.avatarUrl} size={30} />
                    <ChevronDown className="size-3.5 text-[var(--muted)]" />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-11 z-20 w-60 rounded-[var(--radius-md)] border border-[var(--border)] bg-white py-1.5 shadow-xl">
                        <div className="px-3.5 py-2.5 border-b border-[var(--border)]">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
                        </div>
                        <MenuLink href="/dashboard" icon={<LayoutDashboard className="size-4" />} onClick={() => setMenuOpen(false)}>
                          My Dashboard
                        </MenuLink>
                        <MenuLink href="/owner" icon={<Car className="size-4" />} onClick={() => setMenuOpen(false)}>
                          Owner Dashboard
                        </MenuLink>
                        {user.role === "ADMIN" && (
                          <MenuLink href="/admin" icon={<ShieldCheck className="size-4" />} onClick={() => setMenuOpen(false)}>
                            Admin Panel
                          </MenuLink>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--danger)] hover:bg-gray-50"
                        >
                          <LogOut className="size-4" />
                          Log out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button href="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button href="/register" size="sm">
                  Sign up
                </Button>
              </div>
            )}

            <button
              className="lg:hidden flex size-9 items-center justify-center rounded-full hover:bg-gray-100"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium rounded-[var(--radius-sm)] hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
          {/* City selector for mobile */}
          <div className="border-t border-[var(--border)] pt-2 mt-2">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">City</p>
            <div className="grid grid-cols-2 gap-1">
              {CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => { handleCitySelect(c.name); setMobileOpen(false); }}
                  className={cn(
                    "text-left px-3 py-2 text-sm rounded-[var(--radius-sm)] hover:bg-gray-50 transition-colors",
                    selectedCity === c.name ? "text-[var(--primary)] font-semibold bg-blue-50" : ""
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <Link
            href="/list-vehicle"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium rounded-[var(--radius-sm)] hover:bg-gray-50"
          >
            List your vehicle
          </Link>
          {!user && (
            <div className="flex gap-2 pt-2">
              <Button href="/login" variant="secondary" size="sm" fullWidth>
                Log in
              </Button>
              <Button href="/register" size="sm" fullWidth>
                Sign up
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
