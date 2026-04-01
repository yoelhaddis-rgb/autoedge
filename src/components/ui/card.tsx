import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/60 bg-card p-5 shadow-panel",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-card-shine",
        className
      )}
    >
      {children}
    </div>
  );
}
