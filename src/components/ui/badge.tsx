import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeProps = PropsWithChildren<{
  className?: string;
}>;

export function Badge({ className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-foreground/90",
        className
      )}
    >
      {children}
    </span>
  );
}
