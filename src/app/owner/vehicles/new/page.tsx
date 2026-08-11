import { ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { VehicleWizard } from "./VehicleWizard";

export const dynamic = "force-dynamic";

export default async function NewVehiclePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (user.identityVerified !== "VERIFIED") {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--warning-bg)] text-[var(--warning)] mb-4">
          <ShieldAlert className="size-6" />
        </div>
        <h1 className="text-lg font-bold">Identity verification required</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Complete identity verification (KYC) before you can list a vehicle. It only takes a minute.
        </p>
        <Button href="/dashboard/profile" className="mt-5">
          Complete verification
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">List your vehicle</h1>
      <p className="mt-1 text-sm text-[var(--muted)] mb-6">
        Add your vehicle&apos;s details, set your own pricing, and start receiving requests.
      </p>
      <VehicleWizard />
    </div>
  );
}
