"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function FavoriteButton({
  vehicleId,
  initialFavorited,
  isAuthenticated,
  size = "sm",
}: {
  vehicleId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
  size?: "sm" | "lg";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { show } = useToast();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setLoading(true);
    const next = !favorited;
    setFavorited(next);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFavorited(data.favorited);
      show(data.favorited ? "Added to favorites" : "Removed from favorites", "info");
    } catch {
      setFavorited(!next);
      show("Couldn't update favorites. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm transition-transform active:scale-90",
        size === "sm" ? "size-8" : "size-10"
      )}
    >
      <Heart
        className={cn(size === "sm" ? "size-4" : "size-5", favorited ? "fill-[var(--danger)] text-[var(--danger)]" : "text-[var(--foreground)]")}
      />
    </button>
  );
}
