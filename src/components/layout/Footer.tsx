import Link from "next/link";
import { Car, Globe, MessageCircle, Share2, Users } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Cars for rent", href: "/explore?type=CAR" },
      { label: "Bikes for rent", href: "/explore?type=BIKE" },
      { label: "Popular cities", href: "/explore" },
      { label: "How it works", href: "/how-it-works" },
    ],
  },
  {
    title: "Owners",
    links: [
      { label: "List your vehicle", href: "/list-vehicle" },
      { label: "Owner dashboard", href: "/owner" },
      { label: "Pricing guide", href: "/how-it-works#pricing" },
      { label: "Owner policies", href: "/cancellation-policy" },
    ],
  },
  {
    title: "Renters",
    links: [
      { label: "How renting works", href: "/how-it-works" },
      { label: "Safety", href: "/safety" },
      { label: "FAQs", href: "/faq" },
      { label: "Cancellation policy", href: "/cancellation-policy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help center", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Damage policy", href: "/damage-policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-1 pr-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--primary)]">
                <Car className="size-4 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[15px] font-bold tracking-tight">{APP_NAME}</span>
            </Link>
            <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
              Verified vehicles, transparent pricing, and simple bookings — from people near you.
            </p>
            <div className="mt-4 flex gap-2">
              {[Globe, MessageCircle, Share2, Users].map((Icon, i) => (
                <div
                  key={i}
                  className="flex size-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)]"
                >
                  <Icon className="size-3.5" />
                </div>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
                {col.title}
              </h4>
              <ul className="mt-3.5 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
          <p className="text-xs text-[var(--muted-2)]">
            © {new Date().getFullYear()} {APP_NAME} Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted-2)]">
            Demo product prototype — not a licensed rental, payment, insurance, or KYC provider.
          </p>
        </div>
      </div>
    </footer>
  );
}
