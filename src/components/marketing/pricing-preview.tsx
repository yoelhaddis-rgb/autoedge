import Link from "next/link";
import { Check } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "EUR 99/mo",
    description: "For independent dealers entering deal intelligence.",
    features: ["Up to 2 dealer users", "Daily listing updates", "Deal scoring + notes"]
  },
  {
    name: "Growth",
    price: "EUR 249/mo",
    description: "For dealer groups that need speed and workflow depth.",
    features: ["Up to 10 users", "Priority refresh windows", "Status workflow + saved boards"],
    highlighted: true
  },
  {
    name: "Scale",
    price: "Custom",
    description: "For larger groups and aggregator workflows.",
    features: ["Custom source adapters", "Dedicated onboarding", "API + export integrations"]
  }
];

export function PricingPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={plan.highlighted ? "border-accent/40 bg-accent/5" : "border-white/10 bg-card/95"}
        >
          <p className="font-heading text-2xl text-foreground">{plan.name}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{plan.price}</p>
          <p className="mt-2 text-sm text-foreground/60">{plan.description}</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/75">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link
              href="/sign-up"
              className={buttonClassName({
                variant: plan.highlighted ? "primary" : "secondary",
                fullWidth: true
              })}
            >
              Start now
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
