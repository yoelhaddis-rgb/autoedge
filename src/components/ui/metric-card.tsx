import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
};

export function MetricCard({ label, value, hint, icon }: MetricCardProps) {
  return (
    <Card className="h-full">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-foreground/60">{label}</p>
        <div className="rounded-lg bg-white/10 p-2 text-foreground/70">{icon}</div>
      </div>
      <p className="font-heading text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-foreground/55">{hint}</p>
    </Card>
  );
}
