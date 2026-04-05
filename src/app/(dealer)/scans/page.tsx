import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DealsTable } from "@/components/deals/deals-table";
import { buttonClassName } from "@/components/ui/button";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDeals } from "@/lib/services/deals";
import { formatCurrency } from "@/lib/utils/format";

export default async function ScansPage() {
  const context = await getCurrentDealerContext();
  const deals = await getDeals(context.dealerId, { sort: "profit_desc", scanOnly: true });

  const profitable = deals.filter((d) => d.valuation.expectedProfit > 0);
  const unprofitable = deals.filter((d) => d.valuation.expectedProfit <= 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/60">Monitoring</p>
          <h1 className="font-display mt-1 text-5xl tracking-wide text-foreground">MARKET SCANS</h1>
          <p className="mt-2 text-sm text-foreground/45">
            Auto-discovered candidates from your last scan · sorted by expected profit
          </p>
        </div>
        <Link href="/dashboard" className={buttonClassName({ variant: "secondary" })}>
          ← Dashboard
        </Link>
      </div>

      {deals.length === 0 ? (
        <Card>
          <p className="text-sm text-foreground/50">No scan results yet.</p>
          <p className="mt-1 text-xs text-foreground/35">
            Run a scan from the dashboard to populate this page.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent/70 hover:text-accent transition-colors"
          >
            Go to dashboard
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      ) : (
        <>
          {/* Summary strip */}
          <div className="flex flex-wrap gap-6 rounded-xl border border-border/40 bg-white/[0.02] px-5 py-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-foreground/35">Total found</p>
              <p className="mt-0.5 font-semibold text-foreground">{deals.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-foreground/35">Profitable</p>
              <p className="mt-0.5 font-semibold text-success">{profitable.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-foreground/35">Best profit</p>
              <p className="mt-0.5 font-semibold text-foreground">
                {profitable.length > 0
                  ? formatCurrency(profitable[0].valuation.expectedProfit)
                  : "—"}
              </p>
            </div>
          </div>

          {profitable.length > 0 && (
            <Card>
              <div className="mb-4">
                <p className="font-heading text-xl text-foreground">Profitable opportunities</p>
                <p className="text-sm text-foreground/50">Expected profit &gt; 0 · sorted highest first</p>
              </div>
              <DealsTable deals={profitable} />
            </Card>
          )}

          {unprofitable.length > 0 && (
            <Card>
              <div className="mb-4">
                <p className="font-heading text-xl text-foreground/50">Below break-even</p>
                <p className="text-sm text-foreground/35">These candidates did not meet a positive profit threshold</p>
              </div>
              <DealsTable deals={unprofitable} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
