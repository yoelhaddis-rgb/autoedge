import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-border/70 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-foreground/30 outline-none transition-all duration-150 focus:border-accent/50 focus:ring-2 focus:ring-accent/15 focus:bg-white/[0.05]",
        className
      )}
      {...props}
    />
  );
}
