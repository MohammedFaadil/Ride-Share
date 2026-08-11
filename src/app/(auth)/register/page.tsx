"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, ShieldCheck, Zap, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME, CITIES } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { show } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }
      show(`Welcome to ${APP_NAME}, ${data.name.split(" ")[0]}!`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 relative bg-[var(--primary)] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-md px-10 text-white">
          <h2 className="text-3xl font-bold leading-tight">
            One account. Rent vehicles, or list your own.
          </h2>
          <div className="mt-8 space-y-5">
            <Feature icon={<ShieldCheck className="size-5" />} title="Verified community">
              Identity and vehicle verification keep every rental safe.
            </Feature>
            <Feature icon={<Zap className="size-5" />} title="Book in minutes">
              Hourly, daily, or weekly — flexible pricing set by owners.
            </Feature>
            <Feature icon={<HandCoins className="size-5" />} title="Earn from your vehicle">
              List your car or bike and earn when it&apos;s not in use.
            </Feature>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Car className="size-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-[15px] font-bold tracking-tight">{APP_NAME}</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Takes less than a minute. Verify your identity later before booking or listing.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-[var(--radius-sm)] bg-[var(--danger-bg)] px-3.5 py-2.5 text-sm text-[var(--danger)]">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Full name
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Aditya Rao"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Email
              </label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Mobile number
              </label>
              <Input
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                maxLength={10}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                City
              </label>
              <Select required value={form.city} onChange={(e) => update("city", e.target.value)}>
                <option value="">Select your city</option>
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}, {c.state}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Password
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <Button type="submit" fullWidth loading={loading} size="lg">
              Create account
            </Button>
            <p className="text-center text-xs text-[var(--muted-2)] leading-relaxed">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline">Terms</Link> and{" "}
              <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--foreground)] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-sm text-white/60">{children}</p>
      </div>
    </div>
  );
}
