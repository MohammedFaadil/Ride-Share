"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Gauge, Fuel } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

const CHECKLIST_ITEMS = [
  "Front & rear bumper",
  "Left & right side panels",
  "Windshield & mirrors",
  "Tyres & wheels",
  "Interior & seats",
  "Accessories present",
];

export function InspectionForm({
  bookingId,
  kind,
  defaultOdometer,
  alreadyConfirmedByMe,
  bothConfirmed,
  myRole,
}: {
  bookingId: string;
  kind: "handover" | "return";
  defaultOdometer: number;
  alreadyConfirmedByMe: boolean;
  bothConfirmed: boolean;
  myRole: "owner" | "renter";
}) {
  const router = useRouter();
  const { show } = useToast();
  const [odometer, setOdometer] = useState(defaultOdometer);
  const [fuel, setFuel] = useState(90);
  const [notes, setNotes] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const allChecked = CHECKLIST_ITEMS.every((item) => checked[item]);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ odometerKm: odometer, fuelLevelPct: fuel, notes, photos: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      show(kind === "handover" ? "Handover confirmed" : "Return confirmed");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  if (bothConfirmed) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--success)]/30 bg-[var(--success-bg)]/40 p-5 text-sm text-[var(--success)]">
        {kind === "handover" ? "Handover complete. The rental is now active." : "Return complete. This rental has been settled."}
      </div>
    );
  }

  if (alreadyConfirmedByMe) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 text-sm text-[var(--muted)]">
        You&apos;ve confirmed your part of the {kind}. Waiting for the {myRole === "owner" ? "renter" : "owner"} to confirm their side.
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 space-y-5">
      <div>
        <h3 className="text-sm font-semibold mb-3">Inspection checklist</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item} className="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={!!checked[item]}
                onChange={(e) => setChecked((c) => ({ ...c, [item]: e.target.checked }))}
                className="size-4"
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <Gauge className="size-3.5" /> Odometer reading (km)
          </label>
          <input
            type="number"
            value={odometer}
            onChange={(e) => setOdometer(Number(e.target.value))}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <Fuel className="size-3.5" /> Fuel / charge level: {fuel}%
          </label>
          <input type="range" min={0} max={100} value={fuel} onChange={(e) => setFuel(Number(e.target.value))} className="w-full mt-3" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Notes (optional)</label>
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any observations about the vehicle's condition..." />
      </div>

      <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-[var(--border-strong)] bg-gray-50 px-3.5 py-3 text-xs text-[var(--muted)]">
        <Camera className="size-4 shrink-0" />
        Timestamped photo upload is simulated in this demo — in production, photos of each angle would be required here.
      </div>

      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" checked={allChecked} onChange={() => {}} disabled className="mt-0.5 size-4" />
        <span className={allChecked ? "" : "text-[var(--muted-2)]"}>
          I have inspected the vehicle and confirm the details above are accurate.
        </span>
      </label>

      <Button onClick={submit} loading={loading} disabled={!allChecked} fullWidth size="lg">
        Confirm {kind === "handover" ? "handover" : "return"}
      </Button>
    </div>
  );
}
