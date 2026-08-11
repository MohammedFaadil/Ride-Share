"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function RatingStars({
  value,
  count,
  size = 14,
  showValue = true,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star size={size} className="fill-[var(--star)] text-[var(--star)]" />
      {showValue && <span className="text-sm font-semibold">{value.toFixed(1)}</span>}
      {count !== undefined && (
        <span className="text-sm text-[var(--muted)]">({count})</span>
      )}
    </span>
  );
}

export function RatingInput({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star
            size={size}
            className={cn(
              (hover || value) >= n
                ? "fill-[var(--star)] text-[var(--star)]"
                : "text-[var(--border-strong)]"
            )}
          />
        </button>
      ))}
    </div>
  );
}
