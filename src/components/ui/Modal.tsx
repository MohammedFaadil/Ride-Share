"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in-up"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full bg-white rounded-[var(--radius-lg)] shadow-2xl animate-fade-in-up max-h-[85vh] overflow-y-auto",
          maxWidth
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] sticky top-0 bg-white z-10">
            <h3 className="text-base font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--foreground)] p-1 rounded-full hover:bg-gray-100"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
