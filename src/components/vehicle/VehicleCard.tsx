import Link from "next/link";
import { BadgeCheck, Gauge, Users, Fuel } from "lucide-react";
import { VehicleThumb } from "@/components/vehicle/VehicleThumb";
import { FavoriteButton } from "@/components/vehicle/FavoriteButton";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatINR } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";

export interface VehicleCardData {
  id: string;
  type: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuelType: string;
  seats: number | null;
  pricePerDay: number;
  pricePerHour: number;
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
  city: string;
  area: string | null;
  distanceKm?: number;
  imageUrl?: string | null;
  lat?: number;
  lng?: number;
}

export function VehicleCard({
  vehicle,
  favorited = false,
  isAuthenticated = false,
}: {
  vehicle: VehicleCardData;
  favorited?: boolean;
  isAuthenticated?: boolean;
}) {
  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white transition-shadow hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative h-44 w-full">
        {vehicle.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-cover" />
        ) : (
          <VehicleThumb
            type={vehicle.type as "CAR" | "BIKE"}
            brand={vehicle.brand}
            model={vehicle.model}
            seed={vehicle.id}
            className="h-full w-full"
          />
        )}
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {vehicle.distanceKm !== undefined && (
            <span className="rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-medium text-[var(--foreground)] shadow-sm">
              {vehicle.distanceKm < 1 ? "<1 km" : `${vehicle.distanceKm.toFixed(1)} km`} away
            </span>
          )}
        </div>
        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton
            vehicleId={vehicle.id}
            initialFavorited={favorited}
            isAuthenticated={isAuthenticated}
          />
        </div>
        {vehicle.verified && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--success)]">
              <BadgeCheck className="size-3" />
              Verified
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-tight">
              {vehicle.year} {vehicle.brand} {vehicle.model}
            </h3>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {categoryLabel(vehicle.category)} · {vehicle.area ?? vehicle.city}
            </p>
          </div>
          <RatingStars value={vehicle.ratingAvg} count={vehicle.ratingCount} size={12} className="shrink-0 pt-0.5" />
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <Gauge className="size-3.5" /> {vehicle.transmission === "AUTOMATIC" ? "Auto" : "Manual"}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="size-3.5" /> {vehicle.fuelType.charAt(0) + vehicle.fuelType.slice(1).toLowerCase()}
          </span>
          {vehicle.seats && (
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {vehicle.seats}
            </span>
          )}
        </div>

        <div className="mt-3.5 flex items-end justify-between border-t border-[var(--border)] pt-3">
          <div>
            <span className="text-base font-bold">{formatINR(vehicle.pricePerDay)}</span>
            <span className="text-xs text-[var(--muted)]"> /day</span>
            <p className="text-[11px] text-[var(--muted-2)]">{formatINR(vehicle.pricePerHour)}/hour</p>
          </div>
          <span className="rounded-[var(--radius-sm)] bg-gray-100 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}
