import { AlertTriangle } from "lucide-react";
import { APP_NAME, PLATFORM_FEE_RATE } from "@/lib/constants";

export const metadata = {
  title: `Terms of Service — ${APP_NAME}`,
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

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-[var(--muted-2)]">Last updated: 11 August 2026</p>

      <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--warning)]/30 bg-[var(--warning-bg)] p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
        <p className="text-sm text-[var(--warning)]">
          {APP_NAME} is a demo/prototype product built for illustrative purposes. This document
          is written in a professional legal-document style but has <strong>not</strong> been
          reviewed by legal counsel and must not be relied upon for an actual commercial
          deployment.
        </p>
      </div>

      <div className="mt-4">
        <Section number={1} title="Acceptance of terms">
          <p>
            By creating an account, listing a vehicle, or booking a rental on {APP_NAME} (the
            &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do
            not agree to these Terms, do not use the Platform.
          </p>
        </Section>

        <Section number={2} title="Eligibility">
          <p>
            You must be at least 18 years old and hold a valid government-issued ID to create an
            account. To rent a vehicle, you must additionally hold a valid driving licence
            appropriate to the vehicle category (two-wheeler or four-wheeler) and complete the
            Platform&apos;s identity verification process.
          </p>
        </Section>

        <Section number={3} title="Account responsibilities">
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activity that occurs under your account. You agree to provide accurate,
            current, and complete information during registration and identity verification, and
            to keep that information up to date.
          </p>
        </Section>

        <Section number={4} title="Bookings & payments">
          <p>
            A booking request does not constitute a confirmed rental until the vehicle owner
            accepts it and payment is successfully completed. The total payable amount includes
            the base rental fare, a platform fee of {Math.round(PLATFORM_FEE_RATE * 100)}% of the
            base fare, applicable taxes, and the vehicle&apos;s security deposit, all of which are
            itemised before checkout.
          </p>
          <p>
            The security deposit is held for the duration of the rental and refunded after a
            satisfactory return, less any accepted damage claims, extra-kilometre charges, or
            late-return fees as described in these Terms and the Platform&apos;s Cancellation and
            Damage policies.
          </p>
        </Section>

        <Section number={5} title="Owner obligations">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Ensure listed vehicles are roadworthy, accurately described, and legally registered.</li>
            <li>Maintain valid vehicle documentation (registration, pollution certificate, insurance where applicable) and disclose the vehicle&apos;s actual insurance coverage on the listing.</li>
            <li>Honour accepted bookings and make the vehicle available at the agreed time and location.</li>
            <li>Report any damage discovered after a rental through the Platform&apos;s damage claim process, within the applicable claim window.</li>
          </ul>
        </Section>

        <Section number={6} title="Renter obligations">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Hold a valid driving licence for the vehicle category booked, and drive only within the terms of that licence.</li>
            <li>Use the vehicle lawfully, return it on time, and in the condition it was received, ordinary wear and tear excepted.</li>
            <li>Bear responsibility for traffic violations, tolls, and fines incurred during the rental period.</li>
            <li>Not permit any person not named on the booking to operate the vehicle.</li>
          </ul>
        </Section>

        <Section number={7} title="Prohibited uses">
          <p>You agree not to use the Platform to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide false, misleading, or fraudulent information during registration, verification, listing, or booking.</li>
            <li>Circumvent the Platform&apos;s payment or booking process, including arranging payment outside the app for a Platform-sourced rental.</li>
            <li>Use a rented vehicle for illegal purposes, racing, driving instruction, or further sub-renting.</li>
            <li>Harass, threaten, or discriminate against other users.</li>
          </ul>
        </Section>

        <Section number={8} title="Liability limitations">
          <p>
            {APP_NAME} operates as a marketplace connecting vehicle owners and renters and is not
            itself a party to the rental agreement between them. To the maximum extent permitted
            by law, {APP_NAME} disclaims liability for the condition of listed vehicles, the
            conduct of users, or losses arising from a rental transaction, except where such
            liability cannot be excluded under applicable Indian law.
          </p>
          <p>
            {APP_NAME} does not provide or arrange insurance coverage for rentals. Any insurance
            protecting a vehicle during a rental is solely the responsibility of, and as declared
            by, the vehicle owner.
          </p>
        </Section>

        <Section number={9} title="Dispute resolution">
          <p>
            Disputes between a renter and owner (such as damage claims) are first handled through
            the Platform&apos;s in-app dispute process, including the ability for a renter to
            accept or dispute a damage claim. Disputes not resolved through this process, or
            disputes concerning the Platform itself, will be subject to the exclusive jurisdiction
            of the courts of Chennai, Tamil Nadu, India.
          </p>
        </Section>

        <Section number={10} title="Termination">
          <p>
            {APP_NAME} may suspend or terminate a user&apos;s account for violation of these
            Terms, fraudulent activity, or repeated policy breaches, with or without notice where
            reasonably necessary to protect the Platform or its users.
          </p>
        </Section>

        <Section number={11} title="Changes to these terms">
          <p>
            {APP_NAME} may update these Terms from time to time. Material changes will be
            reflected by an updated &quot;Last updated&quot; date on this page. Continued use of
            the Platform after changes take effect constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section number={12} title="Governing law">
          <p>
            These Terms are governed by the laws of India, without regard to conflict-of-law
            principles.
          </p>
        </Section>
      </div>
    </div>
  );
}
