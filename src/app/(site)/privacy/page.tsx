import { AlertTriangle, Mail } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
};

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-6 border-b border-[var(--border)] last:border-b-0">
      <h2 className="text-xl font-bold tracking-tight">
        {number}. {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--muted)]">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--muted-2)]">Last updated: 11 August 2026</p>

      <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--warning)]/30 bg-[var(--warning-bg)] p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
        <p className="text-sm text-[var(--warning)]">
          {APP_NAME} is a demo/prototype product. This policy describes the data handling
          implemented in this prototype for illustrative purposes and has <strong>not</strong>{" "}
          been reviewed by legal counsel for real-world compliance (e.g. India&apos;s DPDP Act,
          GDPR, or other applicable regulation).
        </p>
      </div>

      <div className="mt-4">
        <Section number={1} title="What data we collect">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-[var(--foreground)]">Account information</strong> — name, email address, phone number, city, and password (stored as a salted hash, never in plain text).</li>
            <li><strong className="text-[var(--foreground)]">Identity verification (KYC) documents</strong> — government ID and driving licence images you upload to verify your account.</li>
            <li><strong className="text-[var(--foreground)]">Location data</strong> — city and, where provided, approximate coordinates used to show nearby vehicles and estimate distance.</li>
            <li><strong className="text-[var(--foreground)]">Vehicle data</strong> — details and photos of vehicles you list, including registration number, odometer reading, and pricing.</li>
            <li><strong className="text-[var(--foreground)]">Booking & payment metadata</strong> — booking dates, amounts, fee breakdowns, and payment status. We do <strong className="text-[var(--foreground)]">not</strong> collect or store card numbers, CVVs, or bank account details — this prototype uses a simulated Demo Wallet rather than a real payment gateway.</li>
            <li><strong className="text-[var(--foreground)]">Usage data</strong> — pages visited, searches performed, and messages exchanged with support or other users through the Platform.</li>
          </ul>
        </Section>

        <Section number={2} title="How we use your data">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To create and secure your account, and authenticate your sessions.</li>
            <li>To verify your identity before enabling bookings or vehicle listings.</li>
            <li>To match renters with nearby available vehicles and calculate pricing.</li>
            <li>To process bookings, generate rental agreements, and communicate booking status.</li>
            <li>To respond to support requests submitted through our Contact page.</li>
            <li>To maintain safety and trust on the Platform, including investigating disputes and damage claims.</li>
          </ul>
        </Section>

        <Section number={3} title="Data sharing">
          <p>
            We share the minimum data necessary between a renter and an owner to complete a
            booking — such as name, profile photo, verification status, and contact details once
            a booking is confirmed. We do not sell personal data to third parties. Identity
            verification documents are never shared with other users and are visible only for
            internal verification purposes.
          </p>
        </Section>

        <Section number={4} title="Data retention">
          <p>
            Account and booking data is retained for as long as your account remains active, and
            for a reasonable period afterward to resolve disputes, honour legal obligations, and
            maintain platform integrity. You may request deletion of your account and associated
            data at any time, subject to records we are required to retain.
          </p>
        </Section>

        <Section number={5} title="Your rights">
          <p>
            You can access, review, and update most of your personal information directly from
            your account profile. To request a full export of your data, or to request deletion
            of your account, contact us through the{" "}
            <a href="/contact" className="font-medium text-[var(--foreground)] hover:underline">
              Contact page
            </a>{" "}
            with the category set to &quot;Technical issue&quot;.
          </p>
        </Section>

        <Section number={6} title="Cookies">
          <p>
            We use a single essential session cookie to keep you signed in. This prototype does
            not use third-party advertising or tracking cookies.
          </p>
        </Section>

        <Section number={7} title="Security measures">
          <p>
            Passwords are hashed before storage and never stored or transmitted in plain text.
            Session tokens are signed and stored in an HTTP-only cookie. Access to identity
            verification documents is restricted to what the verification flow requires. As with
            any prototype, this implementation has not undergone a formal third-party security
            audit.
          </p>
        </Section>

        <Section number={8} title="Contact us about privacy">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0" />
            <p>
              For any privacy-related question or request, reach us via the{" "}
              <a href="/contact" className="font-medium text-[var(--foreground)] hover:underline">
                Contact page
              </a>{" "}
              or email <span className="text-[var(--foreground)]">privacy@roamly.example</span>.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
