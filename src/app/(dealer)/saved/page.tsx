import Link from "next/link";
import { Bookmark, PlusCircle } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDeals } from "@/lib/services/deals";
import { formatCurrency } from "@/lib/utils/format";

export default async function SavedDealsPage() {
  const context = await getCurrentDealerContext();
  const savedDeals = await getDeals(context.dealerId, {
    status: "saved",
    sort: "score_desc"
  });

  const totalProfit = savedDeals.reduce((acc, d) => acc + d.valuation.expectedProfit, 0);
  const highPotential = savedDeals.filter((d) => d.valuation.dealScore >= 80).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/60">Shortlist</p>
          <h1 className="font-display mt-1 text-5xl tracking-wide text-foreground">SAVED ANALYSES</h1>
          <p className="mt-2 text-sm text-foreground/45">
            Comparable-driven opportunities your team marked for follow-up.
          </p>
        </div>

        {savedDeals.length > 0 && (
          <div className="flex items-center gap-2">
            {highPotential > 0 && (
              <Badge className="border-success/35 bg-success/10 text-success">{highPotential} high potential</Badge>
            )}
            <Badge className="border-border/60 bg-white/[0.04] text-foreground/60">{savedDeals.length} saved</Badge>
            <Badge className={`border-border/60 bg-white/[0.04] ${totalProfit >= 0 ? "text-success" : "text-danger"}`}>
              {formatCurrency(totalProfit)} combined upside
            </Badge>
          </div>
        )}
      </div>

      {savedDeals.length === 0 ? (
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm text-foreground/60">
                <Bookmark className="h-4 w-4" />
                No saved analyses yet
              </p>
              <p className="mt-2 font-heading text-xl text-foreground">Build your shortlist</p>
              <p className="mt-1 text-sm text-foreground/60">
                Open any deal and click &quot;Saved&quot; to add it here for follow-up.
              </p>
            </div>
            <Link href="/deals" className={buttonClassName({ className: "gap-2" })}>
              <PlusCircle className="h-4 w-4" />
              Browse opportunities
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {savedDeals.map((deal) => (
            <DealCard key={deal.listing.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
