"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Map, List } from "lucide-react";
import { VehicleCard, type VehicleCardData } from "@/components/vehicle/VehicleCard";
import { VehicleCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPanel } from "@/components/vehicle/MapPanel";
import { SearchX } from "lucide-react";

export function ExploreResults({
  vehicles,
  favoriteIds,
  isAuthenticated,
  total,
  loading = false,
}: {
  vehicles: VehicleCardData[];
  favoriteIds: string[];
  isAuthenticated: boolean;
  total: number;
  loading?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMap, setShowMap] = useState(false);
  const favoriteSet = new Set(favoriteIds);

  const sort = searchParams.get("sort") ?? "recommended";

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-sm text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">{total}</span> vehicles to rent
        </p>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white px-3 py-1.5 text-sm font-medium outline-none"
          >
            <option value="recommended">Recommended</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest rated</option>
            <option value="newest">Newest listed</option>
          </select>
          <button
            onClick={() => setShowMap((v) => !v)}
            className="hidden sm:flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white px-3 py-1.5 text-sm font-medium"
          >
            {showMap ? <List className="size-4" /> : <Map className="size-4" />}
            {showMap ? "Hide map" : "Show map"}
          </button>
        </div>
      </div>

      <div className={showMap ? "grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6" : ""}>
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={<SearchX className="size-6" />}
              title="No vehicles match your filters"
              description="Try widening your price range, choosing a different category, or resetting filters."
            />
          ) : (
            <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${showMap ? "xl:grid-cols-2" : "xl:grid-cols-3"}`}>
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} favorited={favoriteSet.has(v.id)} isAuthenticated={isAuthenticated} />
              ))}
            </div>
          )}
        </div>
        {showMap && (
          <div className="hidden xl:block sticky top-20 h-[calc(100vh-6rem)]">
            <MapPanel
              vehicles={vehicles.map((v) => ({
                id: v.id,
                brand: v.brand,
                model: v.model,
                lat: v.lat ?? 0,
                lng: v.lng ?? 0,
                pricePerDay: v.pricePerDay,
                ratingAvg: v.ratingAvg,
                ratingCount: v.ratingCount,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
