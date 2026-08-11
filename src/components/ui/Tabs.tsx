"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
}: {
  tabs: { label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex gap-1 border-b border-[var(--border)] overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={cn(
              "relative shrink-0 px-4 py-3 text-sm font-medium transition-colors",
              active === i ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {tab.label}
            {active === i && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[var(--primary)]" />
            )}
          </button>
        ))}
      </div>
      <div className="py-6">{tabs[active].content}</div>
    </div>
  );
}
