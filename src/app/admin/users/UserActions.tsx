"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
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

export function VerifyButton({
  userId,
  action,
  label,
}: {
  userId: string;
  action: "verify_identity" | "verify_licence";
  label: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      await patch(`/api/admin/users/${userId}`, { action });
      show(`${label} complete`);
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to verify", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={run} loading={loading}>
      {label}
    </Button>
  );
}

export function SuspendToggle({ userId, suspended }: { userId: string; suspended: boolean }) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function run() {
    setLoading(true);
    try {
      await patch(`/api/admin/users/${userId}`, { action: suspended ? "unsuspend" : "suspend" });
      show(suspended ? "User reinstated" : "User suspended");
      setConfirmOpen(false);
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to update user", "error");
    } finally {
      setLoading(false);
    }
  }

  if (suspended) {
    return (
      <Button size="sm" variant="secondary" onClick={run} loading={loading}>
        Reinstate
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
        Suspend
      </Button>
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Suspend this user?">
        <p className="text-sm text-[var(--muted)] mb-4">
          They will be signed out and won&apos;t be able to log in until reinstated. This action can be reversed.
        </p>
        <Button onClick={run} loading={loading} fullWidth variant="danger">
          Confirm suspend
        </Button>
      </Modal>
    </>
  );
}
