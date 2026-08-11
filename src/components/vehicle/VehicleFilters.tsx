"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import {
  CAR_CATEGORIES,
  BIKE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSIONS,
  CAR_FEATURES,
  BIKE_FEATURES,
} from "@/lib/constants";

export function VehicleFilters({
  priceHistogram,
  priceBounds,
}: {
  priceHistogram: number[];
  priceBounds: { min: number; max: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const type = searchParams.get("type") ?? "";
  const categories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const fuels = searchParams.get("fuel")?.split(",").filter(Boolean) ?? [];
  const transmission = searchParams.get("transmission") ?? "";
  const features = searchParams.get("features")?.split(",").filter(Boolean) ?? [];
  const minPrice = Number(searchParams.get("minPrice") ?? priceBounds.min);
  const maxPrice = Number(searchParams.get("maxPrice") ?? priceBounds.max);

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  function toggleListParam(key: string, current: string[], value: string) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setParams({ [key]: next.length ? next.join(",") : null });
  }

  function resetAll() {
    router.push(pathname, { scroll: false });
  }

  const categoryOptions = type === "BIKE" ? BIKE_CATEGORIES : type === "CAR" ? CAR_CATEGORIES : [...CAR_CATEGORIES, ...BIKE_CATEGORIES];
  const featureOptions = type === "BIKE" ? BIKE_FEATURES : CAR_FEATURES;

  const activeCount =
    categories.length +
    fuels.length +
    features.length +
    (transmission ? 1 : 0) +
    (searchParams.get("minPrice") || searchParams.get("maxPrice") ? 1 : 0);

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Filter by</h3>
        {activeCount > 0 && (
          <button onClick={resetAll} className="flex items-center gap-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
            <X className="size-3" /> Reset all
          </button>
        )}
      </div>

      <FilterSection title="Vehicle type">
        <div className="flex gap-1.5 rounded-[var(--radius-sm)] bg-gray-100 p-1">
          {[
            { v: "", label: "Any" },
            { v: "CAR", label: "Cars" },
            { v: "BIKE", label: "Bikes" },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setParams({ type: opt.v || null, category: null })}
              className={cn(
                "flex-1 rounded-[6px] py-1.5 text-xs font-semibold transition-colors",
                type === opt.v ? "bg-white shadow-sm" : "text-[var(--muted)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price range / day">
        <div>
          <div className="flex h-14 items-end gap-[2px]">
            {priceHistogram.map((h, i) => {
              const bucketMin = priceBounds.min + ((priceBounds.max - priceBounds.min) * i) / priceHistogram.length;
              const inRange = bucketMin >= minPrice && bucketMin <= maxPrice;
              const maxH = Math.max(...priceHistogram, 1);
              return (
                <div
                  key={i}
                  style={{ height: `${Math.max(8, (h / maxH) * 100)}%` }}
                  className={cn("flex-1 rounded-t-sm", inRange ? "bg-[var(--primary)]" : "bg-gray-200")}
                />
              );
            })}
          </div>
          <div className="relative mt-3 h-4">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--border-strong)]" />
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={minPrice}
              onChange={(e) => {
                const v = Math.min(Number(e.target.value), maxPrice - 1);
                setParams({ minPrice: String(v) });
              }}
              className="absolute inset-x-0 top-0 w-full pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
            />
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={maxPrice}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), minPrice + 1);
                setParams({ maxPrice: String(v) });
              }}
              className="absolute inset-x-0 top-0 w-full pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-3 py-1.5">
              <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">From</p>
              <p className="text-sm font-semibold">{formatINR(minPrice)}</p>
            </div>
            <div className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-3 py-1.5">
              <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">To</p>
              <p className="text-sm font-semibold">{formatINR(maxPrice)}</p>
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Vehicle category">
        <div className="space-y-2">
          {categoryOptions.map((c) => (
            <Checkbox
              key={c.value}
              checked={categories.includes(c.value)}
              onChange={() => toggleListParam("category", categories, c.value)}
              label={c.label}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Transmission">
        <div className="flex gap-1.5 rounded-[var(--radius-sm)] bg-gray-100 p-1">
          {([{ value: "", label: "Any" }, ...TRANSMISSIONS] as { value: string; label: string }[]).map((opt) => (
            <button
              key={opt.value || "any"}
              onClick={() => setParams({ transmission: opt.value || null })}
              className={cn(
                "flex-1 rounded-[6px] py-1.5 text-xs font-semibold transition-colors",
                transmission === opt.value ? "bg-white shadow-sm" : "text-[var(--muted)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Fuel type">
        <div className="space-y-2">
          {FUEL_TYPES.map((f) => (
            <Checkbox
              key={f.value}
              checked={fuels.includes(f.value)}
              onChange={() => toggleListParam("fuel", fuels, f.value)}
              label={f.label}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Features">
        <div className="space-y-2">
          {featureOptions.slice(0, 8).map((f) => (
            <Checkbox
              key={f}
              checked={features.includes(f)}
              onChange={() => toggleListParam("features", features, f)}
              label={f}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white px-3.5 py-2 text-sm font-medium"
      >
        <SlidersHorizontal className="size-4" />
        Filters {activeCount > 0 && `(${activeCount})`}
      </button>

      <aside className="hidden lg:block w-72 shrink-0">{content}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[var(--radius-xl)] bg-white p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="mx-auto h-1 w-10 rounded-full bg-gray-300" />
            </div>
            {content}
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full rounded-[var(--radius-sm)] bg-[var(--primary)] py-3 text-sm font-semibold text-white"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--border)] pt-5 first:border-0 first:pt-0">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</h4>
      {children}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-[var(--border-strong)] text-[var(--primary)] focus:ring-[var(--primary)]/30"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
