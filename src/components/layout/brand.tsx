import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type BrandProps = {
  compact?: boolean;
  className?: string;
};

export function Brand({ compact = false, className }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
        <Gauge className="h-5 w-5" />
      </div>
      {!compact && (
        <div>
          <p className="font-heading text-lg font-semibold tracking-wide text-foreground">AutoEdge</p>
          <p className="text-xs text-foreground/60">Dealer Intelligence</p>
        </div>
      )}
    </div>
  );
}
