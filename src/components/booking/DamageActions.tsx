"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export function DamageReportForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/damage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, estimatedCost: Number(cost) || 0, evidenceUrls: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      show("Damage claim submitted");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Describe the damage
        </label>
        <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Scratch on rear bumper, approx 10cm, not present at handover" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Estimated repair cost (₹)
        </label>
        <Input type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} placeholder="2500" />
      </div>
      <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-[var(--border-strong)] bg-gray-50 px-3.5 py-3 text-xs text-[var(--muted)]">
        Photo/video evidence upload is simulated in this demo.
      </div>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <Button onClick={submit} loading={loading} disabled={description.length < 10} fullWidth>
        Submit damage claim
      </Button>
    </div>
  );
}

export function DamageResponseActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState<"ACCEPT" | "DISPUTE" | null>(null);

  async function respond(action: "ACCEPT" | "DISPUTE") {
    setLoading(action);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/damage/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, response }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      show(action === "ACCEPT" ? "Claim accepted and charge processed" : "Claim disputed — our team will review");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <Textarea rows={3} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Add a response (optional)..." />
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => respond("DISPUTE")} loading={loading === "DISPUTE"} fullWidth>
          Dispute claim
        </Button>
        <Button onClick={() => respond("ACCEPT")} loading={loading === "ACCEPT"} fullWidth>
          Accept & pay
        </Button>
      </div>
    </div>
  );
}
