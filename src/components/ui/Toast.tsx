"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

const ToastContext = createContext<{
  show: (message: string, kind?: ToastKind) => void;
} | null>(null);

let idCounter = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = idCounter++;
    setItems((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2.5rem))]">
        {items.map((t) => (
          <div
            key={t.id}
            className="animate-fade-in-up flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3 shadow-lg"
          >
            {t.kind === "success" && (
              <CheckCircle2 className="size-5 shrink-0 text-[var(--success)]" />
            )}
            {t.kind === "error" && (
              <XCircle className="size-5 shrink-0 text-[var(--danger)]" />
            )}
            {t.kind === "info" && <Info className="size-5 shrink-0 text-[var(--accent)]" />}
            <p className="text-sm text-[var(--foreground)] flex-1">{t.message}</p>
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-[var(--muted-2)] hover:text-[var(--foreground)]"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
