import { Activity, BadgeDollarSign, Filter, Gauge, Link2, TimerReset } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Deal score engine",
    description: "Highlight the listings with the highest margin potential using confidence-weighted scoring.",
    icon: Gauge
  },
  {
    title: "Profit-first analysis",
    description: "See asking price, resale range, expected costs and net upside in one view.",
    icon: BadgeDollarSign
  },
  {
    title: "Selective monitoring ready",
    description: "Prioritize targeted watchlists instead of costly full-market continuous scraping.",
    icon: TimerReset
  },
  {
    title: "Preference-based filtering",
    description: "Align opportunities to your preferred brands, models and budget instantly.",
    icon: Filter
  },
  {
    title: "Comparable checks",
    description: "Inspect nearby market comparables to validate spread and risk quickly.",
    icon: Activity
  },
  {
    title: "One-click source handoff",
    description: "Jump directly to the original marketplace listing to contact sellers faster.",
    icon: Link2
  }
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Card key={feature.title}>
            <div className="mb-4 inline-flex rounded-xl border border-white/15 bg-white/[0.03] p-2 text-accent">
              <Icon className="h-5 w-5" />
            </div>
            <p className="font-heading text-xl text-foreground">{feature.title}</p>
            <p className="mt-2 text-sm text-foreground/65">{feature.description}</p>
          </Card>
        );
      })}
    </div>
  );
}
