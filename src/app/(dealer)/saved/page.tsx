import { Bookmark } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { Card } from "@/components/ui/card";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDeals } from "@/lib/services/deals";

export default async function SavedDealsPage() {
  const context = await getCurrentDealerContext();
  const savedDeals = await getDeals(context.dealerId, {
    status: "saved",
    sort: "score_desc"
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-foreground/60">Shortlist</p>
        <h1 className="font-heading text-3xl text-foreground">Saved analyses</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Comparable-driven opportunities your team marked for follow-up.
        </p>
      </div>

      {savedDeals.length === 0 ? (
        <Card>
          <p className="inline-flex items-center gap-2 font-heading text-xl text-foreground">
            <Bookmark className="h-5 w-5 text-accent" /> No saved analyses yet
          </p>
          <p className="mt-2 text-sm text-foreground/60">
            Open any valuation opportunity and use &quot;Save deal&quot; to build your shortlist.
          </p>
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
