import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-[var(--muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[var(--muted)]">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Button href={actionHref} className="mt-5" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
