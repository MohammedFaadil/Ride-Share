"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const STATUS_META: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; className: string }> = {
  NOT_SUBMITTED: { icon: Upload, label: "Not submitted", className: "text-[var(--muted)]" },
  PENDING: { icon: Clock, label: "Pending review", className: "text-[var(--warning)]" },
  VERIFIED: { icon: CheckCircle2, label: "Verified", className: "text-[var(--success)]" },
  REJECTED: { icon: XCircle, label: "Rejected — resubmit", className: "text-[var(--danger)]" },
};

export function KycUpload({
  type,
  label,
  status,
}: {
  type: "AADHAAR" | "DRIVING_LICENCE";
  label: string;
  status: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const meta = STATUS_META[status] ?? STATUS_META.NOT_SUBMITTED;
  const Icon = meta.icon;
  const canSubmit = status === "NOT_SUBMITTED" || status === "REJECTED";

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      show("Document submitted for review");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className={`mt-0.5 flex items-center gap-1.5 text-xs ${meta.className}`}>
          <Icon className="size-3.5" /> {meta.label}
        </p>
      </div>
      {canSubmit && (
        <Button size="sm" variant="secondary" onClick={submit} loading={loading} icon={<Upload className="size-3.5" />}>
          Upload (demo)
        </Button>
      )}
    </div>
  );
}
