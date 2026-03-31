import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  }
>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white border border-accent/70 shadow-glow hover:bg-accent/90 disabled:bg-accent/40 disabled:shadow-none",
  secondary: "bg-white/10 text-foreground border border-white/20 hover:bg-white/15",
  ghost: "bg-transparent text-foreground border border-transparent hover:bg-white/10",
  danger: "bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30"
};

export function buttonClassName({
  variant = "primary",
  fullWidth = false,
  className
}: {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
    variantStyles[variant],
    fullWidth && "w-full",
    className
  );
}

export function Button({ children, className, variant = "primary", fullWidth = false, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonClassName({ variant, fullWidth, className }), props.disabled && "cursor-not-allowed")}
      {...props}
    >
      {children}
    </button>
  );
}
