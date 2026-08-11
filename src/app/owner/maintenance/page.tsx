import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MaintenanceBoard } from "@/components/owner/MaintenanceBoard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Car } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: user.id },
    select: { id: true, brand: true, model: true },
  });

  const logs = await prisma.maintenanceLog.findMany({
    where: { vehicle: { ownerId: user.id } },
    include: { vehicle: { select: { id: true, brand: true, model: true } } },
    orderBy: [{ completedAt: "asc" }, { dueAt: "asc" }],
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
      <p className="mt-1 text-sm text-[var(--muted)] mb-6">Track servicing and document renewals for your vehicles.</p>

      {vehicles.length === 0 ? (
        <EmptyState icon={<Car className="size-6" />} title="No vehicles listed" description="List a vehicle to start tracking its maintenance." actionLabel="List a vehicle" actionHref="/owner/vehicles/new" />
      ) : (
        <MaintenanceBoard
          vehicles={vehicles}
          logs={logs.map((l) => ({
            id: l.id,
            type: l.type,
            note: l.note,
            dueAt: l.dueAt ? l.dueAt.toISOString() : null,
            completedAt: l.completedAt ? l.completedAt.toISOString() : null,
            vehicle: l.vehicle,
          }))}
        />
      )}
    </div>
  );
}
