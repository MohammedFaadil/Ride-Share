"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

export function AcceptRejectActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function accept() {
    setLoading("accept");
    try {
      await post(`/api/bookings/${bookingId}/accept`);
      show("Booking accepted! Waiting for renter payment.");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to accept", "error");
    } finally {
      setLoading(null);
    }
  }

  async function reject() {
    setLoading("reject");
    try {
      await post(`/api/bookings/${bookingId}/reject`, { reason });
      show("Booking request declined", "info");
      setRejectOpen(false);
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to decline", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={() => setRejectOpen(true)} loading={loading === "reject"} fullWidth>
        Decline
      </Button>
      <Button onClick={accept} loading={loading === "accept"} fullWidth>
        Accept request
      </Button>
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Decline booking request">
        <p className="text-sm text-[var(--muted)] mb-3">Let the renter know why (optional).</p>
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Vehicle needed for personal use during this period" />
        <Button onClick={reject} loading={loading === "reject"} fullWidth className="mt-4" variant="danger">
          Confirm decline
        </Button>
      </Modal>
    </div>
  );
}

export function PayAction({ bookingId, amount }: { bookingId: string; amount: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    try {
      await post(`/api/bookings/${bookingId}/pay`);
      show("Payment successful! Your booking is confirmed.");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Payment failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={pay} loading={loading} fullWidth size="lg">
      Pay {amount} (Demo payment)
    </Button>
  );
}

export function CancelAction({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function cancel() {
    setLoading(true);
    try {
      await post(`/api/bookings/${bookingId}/cancel`, { reason });
      show("Booking cancelled", "info");
      setOpen(false);
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to cancel", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="!text-[var(--danger)]">
        Cancel booking
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Cancel this booking?">
        <p className="text-sm text-[var(--muted)] mb-3">
          Any completed payments will be refunded to your demo wallet. This can&apos;t be undone.
        </p>
        <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" />
        <Button onClick={cancel} loading={loading} fullWidth className="mt-4" variant="danger">
          Confirm cancellation
        </Button>
      </Modal>
    </>
  );
}

export function SignAgreementAction({ bookingId, alreadySigned }: { bookingId: string; alreadySigned: boolean }) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function sign() {
    setLoading(true);
    try {
      await post(`/api/bookings/${bookingId}/sign`);
      show("Agreement signed");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to sign", "error");
    } finally {
      setLoading(false);
    }
  }

  if (alreadySigned) {
    return (
      <div className="rounded-[var(--radius-sm)] bg-[var(--success-bg)] px-4 py-3 text-sm font-medium text-[var(--success)]">
        You&apos;ve signed this agreement.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-4" />
        I have read and agree to the rental terms, cancellation policy, and damage policy above.
      </label>
      <Button onClick={sign} loading={loading} disabled={!agreed} fullWidth size="lg">
        Sign agreement
      </Button>
    </div>
  );
}
