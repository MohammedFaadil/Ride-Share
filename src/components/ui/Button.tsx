import { cn } from "@/lib/utils";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-black shadow-sm",
  secondary:
    "bg-white text-[var(--foreground)] border border-[var(--border-strong)] hover:bg-gray-50",
  outline:
    "bg-transparent text-[var(--foreground)] border border-[var(--border-strong)] hover:bg-gray-50",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-gray-100",
  danger: "bg-[var(--danger)] text-white hover:bg-red-800",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-[var(--radius-sm)]",
  md: "text-sm px-4 py-2.5 gap-2 rounded-[var(--radius-sm)]",
  lg: "text-[15px] px-6 py-3.5 gap-2 rounded-[var(--radius-md)]",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

interface ButtonProps
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  href?: undefined;
}

interface LinkButtonProps extends BaseProps {
  href: string;
  target?: string;
}

export function Button(props: ButtonProps | LinkButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading,
    icon,
    fullWidth,
    className,
    children,
  } = props;

  const classes = cn(
    "inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap select-none",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} target={props.target} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonProps;
  const { disabled, type = "button", ...domProps } = buttonProps;
  const { onClick, form, name, value } = domProps;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      form={form}
      name={name}
      value={value}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
