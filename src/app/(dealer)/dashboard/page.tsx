import Link from "next/link";
import { ArrowUpRight, Bookmark, CircleDollarSign, Flame, ShieldCheck, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Card } from "@/components/ui/card";
import { DealsTable } from "@/components/deals/deals-table";
import { buttonClassName } from "@/components/ui/button";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDashboardSummary, getDeals } from "@/lib/services/deals";
import { formatCurrency } from "@/lib/utils/format";

export default async function DashboardPage() {
  const context = await getCurrentDealerContext();
  const summary = await getDashboardSummary(context.dealerId);
  const topDeals = await getDeals(context.dealerId, {
    sort: "score_desc"
  });

  const filteredTopDeals = topDeals.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-foreground/60">Welcome back</p>
          <h1 className="font-heading text-3xl text-foreground">Valuation Dashboard</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Monitor valuation opportunities, compare spreads, and prioritize profitable inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/deals/analyze" className={buttonClassName({ variant: "secondary" })}>
            Analyze vehicle
          </Link>
          <Link href="/deals" className={buttonClassName({ className: "gap-2" })}>
            Open valuation opportunities
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total opportunities"
          value={String(summary.totalOpportunities)}
          hint="Active valuation candidates"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <MetricCard
          label="High potential"
          value={String(summary.highPotentialDeals)}
          hint="Deal score 80+"
          icon={<Flame className="h-4 w-4" />}
        />
        <MetricCard
          label="High confidence"
          value={String(summary.highConfidenceDeals)}
          hint="Confidence score 80+"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Average expected profit"
          value={formatCurrency(summary.averageExpectedProfit)}
          hint="Median estimate - asking price - costs"
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Saved analyses"
          value={String(summary.savedAnalyses)}
          hint="Opportunities saved for follow-up"
          icon={<Bookmark className="h-4 w-4" />}
        />
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-heading text-lg text-foreground">Selective monitoring ready</p>
            <p className="text-sm text-foreground/60">
              Watchlist-driven monitoring can be plugged into `MonitoringService`.
            </p>
          </div>
          <Link href="/settings" className={buttonClassName({ variant: "secondary" })}>
            Tweak settings
          </Link>
        </Card>
      </section>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/65">Quick filters:</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/deals?minScore=80" className={buttonClassName({ variant: "secondary" })}>
            High Potential
          </Link>
          <Link href="/deals?sort=fresh" className={buttonClassName({ variant: "secondary" })}>
            Fresh Listings
          </Link>
          <Link href="/deals?sort=profit_desc" className={buttonClassName({ variant: "secondary" })}>
            Highest Profit
          </Link>
          <Link href="/saved" className={buttonClassName({ variant: "secondary" })}>
            Saved Deals
          </Link>
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-heading text-xl text-foreground">Recent comparable-based opportunities</p>
              <p className="text-sm text-foreground/60">Newest candidates with valuation and comparable context.</p>
            </div>
            <Link href="/deals" className="text-sm text-accent hover:text-accent/80">
              View all
            </Link>
          </div>
          <DealsTable deals={summary.recentComparableOpportunities} />
        </Card>

        <Card>
          <p className="font-heading text-xl text-foreground">Top score queue</p>
          <p className="mt-1 text-sm text-foreground/60">Highest-ranked deals across all sources.</p>
          <div className="mt-4 space-y-3">
            {filteredTopDeals.slice(0, 6).map((deal) => (
              <Link
                key={deal.listing.id}
                href={`/deals/${deal.listing.id}`}
                className="block rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-accent/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{deal.listing.title}</p>
                    <p className="text-xs text-foreground/55">
                      {deal.listing.location} • {deal.listing.source}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      deal.valuation.expectedProfit >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatCurrency(deal.valuation.expectedProfit)}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-foreground/60">
                  <span>Score: {deal.valuation.dealScore}</span>
                  <span>Confidence: {deal.valuation.confidenceScore}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-xl text-foreground">Deals overview</p>
          <Link href="/deals" className="text-sm text-accent hover:text-accent/80">
            Open advanced filters
          </Link>
        </div>
        <DealsTable deals={filteredTopDeals} />
      </Card>
    </div>
  );
}
