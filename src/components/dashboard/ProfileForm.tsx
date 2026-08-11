"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { CITIES } from "@/lib/constants";

export function ProfileForm({
  initial,
}: {
  initial: { name: string; city: string | null; bio: string | null };
}) {
  const router = useRouter();
  const { show } = useToast();
  const [name, setName] = useState(initial.name);
  const [city, setCity] = useState(initial.city ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, bio }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      show("Profile updated");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Couldn't update profile", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Full name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">City</label>
        <Select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Select city</option>
          {CITIES.map((c) => (
            <option key={c.name} value={c.name}>{c.name}, {c.state}</option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Bio (optional)</label>
        <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell renters or owners a little about yourself" />
      </div>
      <Button type="submit" loading={loading}>Save changes</Button>
    </form>
  );
}
