"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export interface SettingMeta {
  key: string;
  label: string;
  hint?: string;
}

export function SettingsForm({ settings, meta }: { settings: Record<string, string>; meta: SettingMeta[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [values, setValues] = useState(settings);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save settings");
      show("Settings saved");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {meta.map((m) => (
        <div key={m.key}>
          <Label htmlFor={m.key} hint={m.hint}>
            {m.label}
          </Label>
          <Input
            id={m.key}
            value={values[m.key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [m.key]: e.target.value }))}
          />
        </div>
      ))}
      <Button onClick={submit} loading={loading}>
        Save settings
      </Button>
    </div>
  );
}
