"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, Mail, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const next = params.get("next") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      show(`Welcome back, ${data.name.split(" ")[0]}!`);
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("demo@roamly.in");
    setPassword("Password123");
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Car className="size-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-[15px] font-bold tracking-tight">{APP_NAME}</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Log in to book vehicles or manage your listings.
          </p>

          <button
            onClick={fillDemo}
            type="button"
            className="mt-5 flex w-full items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-[var(--border-strong)] bg-gray-50 px-3.5 py-2.5 text-left text-xs text-[var(--muted)] hover:bg-gray-100"
          >
            <Info className="size-3.5 shrink-0" />
            Use demo account — click to autofill (demo@roamly.in)
          </button>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="rounded-[var(--radius-sm)] bg-[var(--danger-bg)] px-3.5 py-2.5 text-sm text-[var(--danger)]">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-2)]" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-2)]" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" fullWidth loading={loading} size="lg">
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[var(--foreground)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-[var(--primary)] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-md px-10 text-white">
          <Car className="size-12 mb-6 text-white/80" strokeWidth={1.2} />
          <h2 className="text-3xl font-bold leading-tight">
            Find a vehicle nearby, or earn from the one sitting idle.
          </h2>
          <p className="mt-4 text-white/70 text-sm leading-relaxed">
            Verified owners, transparent pricing, and digital handovers — built for
            renters and owners across India.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
