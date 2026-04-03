import Link from "next/link";
import { ArrowUpRight, CircleDollarSign, Flame, ShieldCheck, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DealsTable } from "@/components/deals/deals-table";
import { buttonClassName } from "@/components/ui/button";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDashboardSummary, getDeals } from "@/lib/services/deals";
import { getDealStatusClass, getDealStatusLabel } from "@/lib/utils/deal";
import { formatCurrency } from "@/lib/utils/format";
import type { DealLifecycleStatus } from "@/types/domain";

const LIFECYCLE_STATUSES: DealLifecycleStatus[] = ["new", "saved", "contacted", "bought", "ignored"];

export default async function DashboardPage() {
  const context = await getCurrentDealerContext();
  const [summary, topDeals, profitDeals] = await Promise.all([
    getDashboardSummary(context.dealerId),
    getDeals(context.dealerId, { sort: "score_desc" }),
    getDeals(context.dealerId, { sort: "profit_desc" })
  ]);

  const filteredTopDeals = topDeals.slice(0, 10);

  // Compute lifecycle counts from all deals
  const lifecycleCounts = LIFECYCLE_STATUSES.reduce<Record<DealLifecycleStatus, number>>(
    (acc, s) => ({ ...acc, [s]: topDeals.filter((d) => d.status === s).length }),
    {} as Record<DealLifecycleStatus, number>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/60">Welcome back</p>
          <h1 className="font-display mt-1 text-5xl tracking-wide text-foreground">VALUATION DASHBOARD</h1>
          <p className="mt-2 text-sm text-foreground/45">
            Monitor opportunities, compare spreads, and prioritize profitable inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/deals/analyze" className={buttonClassName({ variant: "secondary" })}>
            Analyze vehicle
          </Link>
          <Link href="/deals" className={buttonClassName({ className: "gap-2" })}>
            Open opportunities
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* KPI grid */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total opportunities"
          value={String(summary.totalOpportunities)}
          hint="Active valuation candidates"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <MetricCard
          label="High potential"
          value={String(summary.highPotentialDeals)}
          hint="Deal score ≥ 80"
          icon={<Flame className="h-4 w-4" />}
          accent
        />
        <MetricCard
          label="High confidence"
          value={String(summary.highConfidenceDeals)}
          hint="Confidence score ≥ 80"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Avg expected profit"
          value={formatCurrency(summary.averageExpectedProfit)}
          hint="After recon, holding & risk"
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
      </section>

      {/* Lifecycle snapshot */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-heading text-base font-semibold text-foreground">Lifecycle snapshot</p>
            <p className="text-sm text-foreground/45">Deal pipeline by current status.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {LIFECYCLE_STATUSES.map((s) => (
              <Link key={s} href={`/deals?status=${s}`} className="group flex items-center gap-2">
                <Badge className={`${getDealStatusClass(s)} transition-opacity group-hover:opacity-80`}>
                  {getDealStatusLabel(s)}
                </Badge>
                <span className="text-sm font-semibold text-foreground/70">{lifecycleCounts[s]}</span>
              </Link>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/40 bg-white/[0.02] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-foreground/30 mr-2">Quick filters</p>
        <Link href="/deals?minScore=80" className={buttonClassName({ variant: "secondary", className: "text-xs h-8" })}>
          High Potential
        </Link>
        <Link href="/deals?sort=fresh" className={buttonClassName({ variant: "secondary", className: "text-xs h-8" })}>
          Fresh Listings
        </Link>
        <Link href="/deals?sort=profit_desc" className={buttonClassName({ variant: "secondary", className: "text-xs h-8" })}>
          Highest Profit
        </Link>
        <Link href="/saved" className={buttonClassName({ variant: "secondary", className: "text-xs h-8" })}>
          Saved Deals
        </Link>
      </div>

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
          <p className="font-heading text-xl text-foreground">Highest return opportunities</p>
          <p className="mt-1 text-sm text-foreground/60">Deals with the greatest expected profit margin.</p>
          <div className="mt-4 space-y-3">
            {profitDeals.slice(0, 6).map((deal) => (
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
