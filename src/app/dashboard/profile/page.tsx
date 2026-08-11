import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { KycUpload } from "@/components/dashboard/KycUpload";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Member since {formatDate(user.createdAt)}</p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold mb-4">Basic information</h2>
        <ProfileForm initial={{ name: user.name, city: user.city, bio: user.bio }} />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold mb-1">
          <ShieldCheck className="size-4" /> Identity verification (KYC)
        </h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Required before you can book or list a vehicle. This is a demo flow — no real document
          verification provider is connected.
        </p>
        <div className="space-y-3">
          <KycUpload type="AADHAAR" label="Aadhaar / government ID" status={user.identityVerified} />
          <KycUpload type="DRIVING_LICENCE" label="Driving licence" status={user.licenceVerified} />
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] bg-gray-50 p-4 text-xs text-[var(--muted)]">
        Contact details: {user.email} · {user.phone ?? "No phone on file"}
      </div>
    </div>
  );
}
