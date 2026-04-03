import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition-all duration-150 focus:border-accent/50 focus:ring-2 focus:ring-accent/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
