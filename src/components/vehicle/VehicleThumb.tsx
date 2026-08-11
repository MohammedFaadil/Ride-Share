import { Car, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { gradientForVehicle } from "@/lib/constants";

/**
 * Demo vehicles have no real photography (to avoid using stock images of actual
 * car models without rights). This renders a consistent, premium gradient
 * placeholder instead. Real owner-uploaded listings use actual photos via
 * VehicleImage records and never hit this component.
 */
export function VehicleThumb({
  type,
  brand,
  model,
  seed,
  className,
  iconClassName,
}: {
  type: "CAR" | "BIKE";
  brand: string;
  model: string;
  seed: string;
  className?: string;
  iconClassName?: string;
}) {
  const gradient = gradientForVehicle(seed);
  const Icon = type === "CAR" ? Car : Bike;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <Icon
        strokeWidth={1.1}
        className={cn("relative text-white/90 drop-shadow-sm", iconClassName ?? "size-16")}
      />
      <div className="absolute bottom-2 right-3 text-[10px] font-medium tracking-wide text-white/60 uppercase">
        {brand} {model}
      </div>
    </div>
  );
}
