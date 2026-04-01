import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  accent?: boolean;
};

export function MetricCard({ label, value, hint, icon, accent = false }: MetricCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200",
        accent
          ? "border-accent/30 bg-accent/5 hover:border-accent/50 hover:bg-accent/8"
          : "border-border/60 bg-card hover:border-accent/20 shadow-panel"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-foreground/45">{label}</p>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            accent ? "bg-accent/20 text-accent" : "bg-white/[0.06] text-foreground/50 group-hover:text-accent/70"
          )}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <p
        className={cn(
          "font-display mt-3 text-5xl leading-none tracking-wide",
          accent ? "text-accent" : "text-foreground"
        )}
      >
        {value}
      </p>

      {/* Hint */}
      <p className="mt-2 text-xs text-foreground/40">{hint}</p>

      {/* Decorative bottom line */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-px w-full transition-all duration-300",
          accent
            ? "bg-gradient-to-r from-accent/60 via-accent/20 to-transparent"
            : "bg-gradient-to-r from-accent/0 via-accent/0 to-transparent group-hover:from-accent/30 group-hover:via-accent/10"
        )}
      />
    </div>
  );
}
