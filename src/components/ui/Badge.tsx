import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "success" | "warning" | "danger" | "neutral" | "info" | "dark";

const toneClasses: Record<Tone, string> = {
  success: "bg-[var(--success-bg)] text-[var(--success)]",
  warning: "bg-[var(--warning-bg)] text-[var(--warning)]",
  danger: "bg-[var(--danger-bg)] text-[var(--danger)]",
  neutral: "bg-gray-100 text-gray-600",
  info: "bg-blue-50 text-blue-700",
  dark: "bg-[var(--primary)] text-white",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
