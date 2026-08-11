import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

export function VehicleCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-white">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}
