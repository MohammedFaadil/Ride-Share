"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";

export interface AvailabilityBlockData {
  id: string;
  startAt: string;
  endAt: string;
  reason: string;
}

export function AvailabilityManager({ vehicleId, blocks }: { vehicleId: string; blocks: AvailabilityBlockData[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  async function addBlock() {
    if (!start || !end) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt: new Date(start).toISOString(), endAt: new Date(end).toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      show("Dates blocked");
      setStart("");
      setEnd("");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Couldn't block dates", "error");
    } finally {
      setLoading(false);
    }
  }

  async function removeBlock(blockId: string) {
    try {
      await fetch(`/api/vehicles/${vehicleId}/availability/${blockId}`, { method: "DELETE" });
      show("Dates unblocked", "info");
      router.refresh();
    } catch {
      show("Couldn't unblock dates", "error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Block from</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-3 py-2 text-sm outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Until</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-3 py-2 text-sm outline-none" />
        </div>
        <Button size="sm" onClick={addBlock} loading={loading} disabled={!start || !end} icon={<Plus className="size-3.5" />}>
          Block dates
        </Button>
      </div>

      {blocks.length === 0 ? (
        <p className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
          <CalendarOff className="size-4" /> No dates blocked — your vehicle is available whenever it&apos;s not booked.
        </p>
      ) : (
        <div className="space-y-2">
          {blocks.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] px-4 py-2.5 text-sm">
              <span>{formatDate(b.startAt)} → {formatDate(b.endAt)}</span>
              <button onClick={() => removeBlock(b.id)} className="text-[var(--muted-2)] hover:text-[var(--danger)]">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
