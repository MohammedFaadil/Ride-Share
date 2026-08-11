"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="text-xl font-bold tracking-tight">{group.title}</h2>
          <div className="mt-4 divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
            {group.items.map((item, i) => {
              const key = `${group.title}-${i}`;
              const open = openKey === key;
              return (
                <div key={key}>
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : key)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="text-sm font-semibold">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-[var(--muted)] transition-transform duration-200",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 -mt-1">
                      <p className="text-sm leading-relaxed text-[var(--muted)]">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
