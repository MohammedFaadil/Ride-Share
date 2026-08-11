"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea, Select, Label } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

const STATUS_OPTIONS = [
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "WAITING_ON_OWNER", label: "Waiting on owner" },
  { value: "WAITING_ON_RENTER", label: "Waiting on renter" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "ESCALATED", label: "Escalated" },
];

export function DisputeResolveForm({ disputeId, currentStatus, currentResolution }: { disputeId: string; currentStatus: string; currentResolution: string | null }) {
  const router = useRouter();
  const { show } = useToast();
  const [status, setStatus] = useState(currentStatus === "OPEN" ? "UNDER_REVIEW" : currentStatus);
  const [resolution, setResolution] = useState(currentResolution ?? "");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolution }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update dispute");
      show("Dispute updated");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to update dispute", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-gray-50 p-4">
      <div>
        <Label htmlFor={`status-${disputeId}`}>New status</Label>
        <Select id={`status-${disputeId}`} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor={`resolution-${disputeId}`}>Resolution notes</Label>
        <Textarea
          id={`resolution-${disputeId}`}
          rows={3}
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Explain how this dispute was resolved..."
        />
      </div>
      <Button size="sm" onClick={submit} loading={loading}>
        Update dispute
      </Button>
    </div>
  );
}
