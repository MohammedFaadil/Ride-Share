"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";

export interface MaintenanceLogData {
  id: string;
  type: string;
  note: string | null;
  dueAt: string | null;
  completedAt: string | null;
  vehicle: { id: string; brand: string; model: string };
}

const TYPES = ["Service", "Oil change", "Tyre replacement", "Insurance renewal", "Pollution certificate", "Battery", "Other"];

export function MaintenanceBoard({
  vehicles,
  logs,
}: {
  vehicles: { id: string; brand: string; model: string }[];
  logs: MaintenanceLogData[];
}) {
  const router = useRouter();
  const { show } = useToast();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [type, setType] = useState(TYPES[0]);
  const [note, setNote] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function addLog() {
    if (!vehicleId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, type, note, dueAt: dueAt || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      show("Reminder added");
      setNote("");
      setDueAt("");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Couldn't add reminder", "error");
    } finally {
      setLoading(false);
    }
  }

  async function complete(id: string) {
    try {
      await fetch(`/api/maintenance/${id}`, { method: "PATCH" });
      show("Marked as done", "info");
      router.refresh();
    } catch {
      show("Something went wrong", "error");
    }
  }

  return (
    <div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">Add a maintenance reminder</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model}</option>)}
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
        </div>
        <Button size="sm" className="mt-3" onClick={addLog} loading={loading} disabled={!vehicleId} icon={<Plus className="size-3.5" />}>
          Add reminder
        </Button>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={<Wrench className="size-6" />} title="No maintenance reminders" description="Track servicing, insurance renewals, and more for your vehicles." />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => !log.completedAt && complete(log.id)} disabled={!!log.completedAt}>
                  {log.completedAt ? (
                    <CheckCircle2 className="size-5 text-[var(--success)]" />
                  ) : (
                    <Circle className="size-5 text-[var(--muted-2)]" />
                  )}
                </button>
                <div>
                  <p className={`text-sm font-medium ${log.completedAt ? "line-through text-[var(--muted-2)]" : ""}`}>
                    {log.type} — {log.vehicle.brand} {log.vehicle.model}
                  </p>
                  <p className="text-xs text-[var(--muted-2)]">
                    {log.note && `${log.note} · `}
                    {log.dueAt ? `Due ${formatDate(log.dueAt)}` : "No due date"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
