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
    "bg-accent text-background border border-accent/80 shadow-glow-sm hover:bg-accent/90 hover:shadow-glow active:scale-[0.98] disabled:bg-accent/30 disabled:shadow-none disabled:text-background/50",
  secondary:
    "bg-white/[0.05] text-foreground border border-border/80 hover:bg-white/[0.09] hover:border-accent/30 active:scale-[0.98]",
  ghost:
    "bg-transparent text-foreground/70 border border-transparent hover:bg-white/[0.06] hover:text-foreground active:scale-[0.98]",
  danger:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:scale-[0.98]"
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
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150",
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
