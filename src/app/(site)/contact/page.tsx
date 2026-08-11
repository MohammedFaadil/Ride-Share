import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ContactForm } from "@/components/contact/ContactForm";
import { APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Contact us</h1>
        <p className="mt-3 text-base text-[var(--muted)]">
          Questions about a booking, a listing, or your account? Send us a message and our
          support team will get back to you.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm
            defaultCategory={first(sp.category)}
            defaultSubject={first(sp.subject)}
            defaultName={user?.name ?? undefined}
            defaultEmail={user?.email ?? undefined}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-sm font-semibold">Other ways to reach us</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-[var(--muted)]" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-[var(--muted)]">support@roamly.example</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-[var(--muted)]" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-[var(--muted)]">+91 44 4000 1234</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--muted)]" />
                <div>
                  <p className="font-medium">Office</p>
                  <p className="text-[var(--muted)]">Chennai, Tamil Nadu, India</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-[var(--muted)]" />
                <div>
                  <p className="font-medium">Support hours</p>
                  <p className="text-[var(--muted)]">Mon–Sat, 9:00 AM – 8:00 PM IST</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-gray-50 p-6">
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {APP_NAME} is a demo marketplace prototype. Contact details and support responses
              on this site are for demonstration purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
