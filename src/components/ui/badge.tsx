import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeProps = PropsWithChildren<{
  className?: string;
}>;

export function Badge({ className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-border/60 bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium tracking-wide text-foreground/80",
        className
      )}
    >
      {children}
    </span>
  );
}
