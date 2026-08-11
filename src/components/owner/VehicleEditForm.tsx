"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface EditableVehicle {
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  securityDeposit: number;
  includedKmPerDay: number;
  extraKmCharge: number;
  odometerKm: number;
  description: string | null;
  status: string;
}

export function VehicleEditForm({ vehicleId, initial }: { vehicleId: string; initial: EditableVehicle }) {
  const router = useRouter();
  const { show } = useToast();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof EditableVehicle>(key: K, value: EditableVehicle[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      show("Listing updated");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Couldn't save changes", "error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus() {
    const next = form.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      update("status", next);
      show(next === "ACTIVE" ? "Listing is now live" : "Listing paused");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Couldn't update status", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] p-4">
        <div>
          <p className="text-sm font-semibold">Listing status</p>
          <p className="text-xs text-[var(--muted)]">
            {form.status === "ACTIVE" ? "Visible to renters and bookable" : form.status === "SUSPENDED" ? "Paused — hidden from search" : "Pending admin review"}
          </p>
        </div>
        {(form.status === "ACTIVE" || form.status === "SUSPENDED") && (
          <button
            onClick={toggleStatus}
            disabled={loading}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              form.status === "ACTIVE" ? "bg-[var(--success)]" : "bg-gray-300"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                form.status === "ACTIVE" ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberField label="Price per hour (₹)" value={form.pricePerHour} onChange={(v) => update("pricePerHour", v)} />
        <NumberField label="Price per day (₹)" value={form.pricePerDay} onChange={(v) => update("pricePerDay", v)} />
        <NumberField label="Price per week (₹)" value={form.pricePerWeek} onChange={(v) => update("pricePerWeek", v)} />
        <NumberField label="Security deposit (₹)" value={form.securityDeposit} onChange={(v) => update("securityDeposit", v)} />
        <NumberField label="Included km/day" value={form.includedKmPerDay} onChange={(v) => update("includedKmPerDay", v)} />
        <NumberField label="Extra km charge (₹/km)" value={form.extraKmCharge} onChange={(v) => update("extraKmCharge", v)} />
        <NumberField label="Current odometer (km)" value={form.odometerKm} onChange={(v) => update("odometerKm", v)} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Description</label>
        <Textarea rows={4} value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} />
      </div>

      <Button onClick={save} loading={loading}>Save changes</Button>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={0} />
    </div>
  );
}
