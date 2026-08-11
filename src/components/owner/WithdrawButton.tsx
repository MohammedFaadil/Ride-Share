"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/format";

export function WithdrawButton({ available }: { available: number }) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  async function withdraw() {
    setLoading(true);
    try {
      const res = await fetch("/api/payouts", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      show(`${formatINR(data.payout.amount)} withdrawn to your demo bank account`);
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Withdrawal failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={withdraw} loading={loading} disabled={available <= 0}>
      Withdraw {formatINR(available)}
    </Button>
  );
}
