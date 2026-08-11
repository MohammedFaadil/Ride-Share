import { cn } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline justify-between mb-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {children}
      </span>
      {hint && <span className="text-xs text-[var(--muted-2)]">{hint}</span>}
    </label>
  );
}

const baseFieldClasses =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-2)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] disabled:bg-gray-50 disabled:text-gray-400";

export function Input({
  className,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        className={cn(baseFieldClasses, error && "border-[var(--danger)]", className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}

export function Textarea({
  className,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div>
      <textarea className={cn(baseFieldClasses, "resize-none", error && "border-[var(--danger)]", className)} {...props} />
      {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}

export function Select({
  className,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div>
      <select
        className={cn(baseFieldClasses, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22><path d=%22M5 7.5L10 12.5L15 7.5%22 stroke=%22%236b7280%22 stroke-width=%221.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center] pr-9", error && "border-[var(--danger)]", className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
