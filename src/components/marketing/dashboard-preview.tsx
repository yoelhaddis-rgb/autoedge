import { ArrowUpRight, GaugeCircle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockRows = [
  {
    vehicle: "BMW 320d Touring",
    asking: "EUR 18,950",
    profit: "EUR 2,250",
    score: 88,
    tag: "High Potential"
  },
  {
    vehicle: "Toyota Yaris Hybrid",
    asking: "EUR 15,400",
    profit: "EUR 1,800",
    score: 90,
    tag: "High Potential"
  },
  {
    vehicle: "Mercedes C220d Estate",
    asking: "EUR 17,400",
    profit: "EUR -800",
    score: 45,
    tag: "Moderate"
  }
];

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/15 bg-card shadow-glow">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-sm text-foreground/60">Dealer Dashboard Preview</p>
          <p className="font-heading text-xl text-foreground">Opportunity Feed</p>
        </div>
        <Badge className="border-accent/40 bg-accent/20 text-accent">Live scoring</Badge>
      </div>

      <div className="grid gap-3 border-b border-white/10 px-5 py-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs text-foreground/55">Avg expected profit</p>
          <p className="mt-1 text-xl font-semibold text-success">EUR 1,690</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs text-foreground/55">High score deals</p>
          <p className="mt-1 text-xl font-semibold text-foreground">11</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs text-foreground/55">Risk alerts</p>
          <p className="mt-1 inline-flex items-center gap-2 text-xl font-semibold text-warning">
            <ShieldAlert className="h-5 w-5" /> 4
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {mockRows.map((row) => (
          <div key={row.vehicle} className="grid gap-2 px-5 py-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] sm:items-center">
            <p className="font-medium text-foreground">{row.vehicle}</p>
            <p className="text-foreground/70">{row.asking}</p>
            <p className="font-semibold text-success">{row.profit}</p>
            <p className="inline-flex items-center gap-2 text-foreground/80">
              <GaugeCircle className="h-4 w-4 text-accent" /> {row.score}
            </p>
            <button className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent/80">
              {row.tag}
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
