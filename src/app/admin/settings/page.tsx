import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SettingsForm, type SettingMeta } from "./SettingsForm";

export const dynamic = "force-dynamic";

const LABELS: Record<string, { label: string; hint?: string }> = {
  platform_commission_rate: { label: "Platform commission (%)", hint: "Applied to each booking" },
  min_rental_hours: { label: "Minimum rental duration (hours)" },
  max_rental_days: { label: "Maximum rental duration (days)" },
  damage_claim_window_hours: { label: "Damage claim window (hours)", hint: "After return" },
  cancellation_free_window_hours: { label: "Free cancellation window (hours)", hint: "Before trip start" },
  kyc_required_documents: { label: "Required KYC documents", hint: "JSON array" },
};

function prettify(key: string) {
  return key
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function AdminSettingsPage() {
  const rows = await prisma.platformSetting.findMany({ orderBy: { key: "asc" } });
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const meta: SettingMeta[] = rows.map((r) => ({
    key: r.key,
    label: LABELS[r.key]?.label ?? prettify(r.key),
    hint: LABELS[r.key]?.hint,
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Platform settings</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Edit platform-wide configuration values.</p>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-base font-bold">Configuration</h2>
        </CardHeader>
        <CardBody>
          <SettingsForm settings={settings} meta={meta} />
        </CardBody>
      </Card>
    </div>
  );
}
