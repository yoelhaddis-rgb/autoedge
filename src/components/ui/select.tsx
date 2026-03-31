import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border border-white/15 bg-[#10151f] px-3 text-sm text-foreground outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/30",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
