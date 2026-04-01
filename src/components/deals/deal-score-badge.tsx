import { cn } from "@/lib/utils/cn";

type DealScoreBadgeProps = {
  score: number;
  label: string;
};

export function DealScoreBadge({ score, label }: DealScoreBadgeProps) {
  const colorClass =
    score >= 80
      ? "border-success/40 bg-success/10 text-success"
      : score >= 60
        ? "border-accent/40 bg-accent/10 text-accent"
        : score >= 40
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-danger/40 bg-danger/10 text-danger";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-wide",
        colorClass
      )}
    >
      <span className="font-display text-sm leading-none">{score}</span>
      <span className="opacity-60">·</span>
      {label}
    </span>
  );
}
