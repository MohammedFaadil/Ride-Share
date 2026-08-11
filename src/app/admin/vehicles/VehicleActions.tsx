"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

async function patch(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

export function VehicleActions({ vehicleId, status }: { vehicleId: string; status: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [reasonOpen, setReasonOpen] = useState<"reject" | "suspend" | null>(null);
  const [reason, setReason] = useState("");

  async function run(action: string, extra?: Record<string, unknown>) {
    setLoading(action);
    try {
      await patch(`/api/admin/vehicles/${vehicleId}`, { action, ...extra });
      show("Listing updated");
      setReasonOpen(null);
      setReason("");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to update listing", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {(status === "PENDING_VERIFICATION" || status === "DRAFT") && (
        <>
          <Button size="sm" onClick={() => run("approve")} loading={loading === "approve"}>
            Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => setReasonOpen("reject")}>
            Reject
          </Button>
        </>
      )}
      {status === "ACTIVE" && (
        <Button size="sm" variant="danger" onClick={() => setReasonOpen("suspend")}>
          Suspend
        </Button>
      )}
      {status === "SUSPENDED" && (
        <Button size="sm" variant="secondary" onClick={() => run("reactivate")} loading={loading === "reactivate"}>
          Reactivate
        </Button>
      )}

      <Modal
        open={reasonOpen !== null}
        onClose={() => setReasonOpen(null)}
        title={reasonOpen === "reject" ? "Reject this listing?" : "Suspend this listing?"}
      >
        <p className="text-sm text-[var(--muted)] mb-3">
          The owner will be notified. You can add an optional reason below.
        </p>
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" />
        <Button
          onClick={() => run(reasonOpen === "reject" ? "reject" : "suspend", { reason })}
          loading={loading === reasonOpen}
          fullWidth
          className="mt-4"
          variant="danger"
        >
          Confirm {reasonOpen === "reject" ? "reject" : "suspend"}
        </Button>
      </Modal>
    </div>
  );
}
