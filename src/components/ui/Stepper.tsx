import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center w-full overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <div key={step} className="flex items-center shrink-0 last:flex-none flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-semibold shrink-0",
                  state === "done" && "bg-[var(--primary)] text-white",
                  state === "active" && "bg-[var(--primary)] text-white ring-4 ring-gray-200",
                  state === "todo" && "bg-gray-100 text-[var(--muted)]"
                )}
              >
                {state === "done" ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[11px] text-center leading-tight max-w-[80px]",
                  state === "todo" ? "text-[var(--muted-2)]" : "text-[var(--foreground)] font-medium"
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 mx-1 mb-4",
                  i < current ? "bg-[var(--primary)]" : "bg-[var(--border-strong)]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
