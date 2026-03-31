import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-card/95 p-5 shadow-panel backdrop-blur", className)}>
      {children}
    </div>
  );
}
