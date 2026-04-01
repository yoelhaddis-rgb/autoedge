import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DealScoreBadge } from "@/components/deals/deal-score-badge";
import {
  getConfidenceClass,
  getConfidenceLabel,
  getDealStatusClass,
  getDealStatusLabel
} from "@/lib/utils/deal";
import { formatCurrency, formatMileage } from "@/lib/utils/format";
import type { DealOverview } from "@/types/domain";

type DealsTableProps = {
  deals: DealOverview[];
};

export function DealsTable({ deals }: DealsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 bg-background">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border/50">
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/35">Vehicle</th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/35">Asking</th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/35">Range</th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/35">Profit</th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/35">Score</th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/35">Confidence</th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/35">Status</th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/35">Age</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {deals.map((deal, i) => (
            <tr
              key={deal.listing.id}
              className="group border-b border-border/30 transition-colors last:border-0 hover:bg-accent/[0.03]"
            >
              <td className="px-4 py-3.5">
                <p className="font-medium text-foreground group-hover:text-accent/90 transition-colors">
                  {deal.listing.title}
                </p>
                <p className="mt-0.5 text-xs text-foreground/40">
                  {deal.listing.year} · {formatMileage(deal.listing.mileage)} · {deal.listing.fuel}
                </p>
                <p className="text-xs text-foreground/30">{deal.listing.location} · {deal.listing.source}</p>
              </td>
              <td className="px-4 py-3.5 font-semibold text-foreground">
                {formatCurrency(deal.listing.askingPrice)}
              </td>
              <td className="px-4 py-3.5 text-xs text-foreground/50">
                {formatCurrency(deal.valuation.lowEstimate)}
                <span className="mx-1 text-foreground/25">–</span>
                {formatCurrency(deal.valuation.highEstimate)}
              </td>
              <td className={`px-4 py-3.5 font-semibold ${deal.valuation.expectedProfit >= 0 ? "text-success" : "text-danger"}`}>
                {formatCurrency(deal.valuation.expectedProfit)}
              </td>
              <td className="px-4 py-3.5">
                <DealScoreBadge score={deal.valuation.dealScore} label={deal.scoreLabel} />
              </td>
              <td className="px-4 py-3.5">
                <Badge className={getConfidenceClass(deal.valuation.confidenceScore)}>
                  {getConfidenceLabel(deal.valuation.confidenceScore)} · {deal.valuation.confidenceScore}
                </Badge>
              </td>
              <td className="px-4 py-3.5">
                <Badge className={getDealStatusClass(deal.status)}>{getDealStatusLabel(deal.status)}</Badge>
                {deal.note && (
                  <p className="mt-1 max-w-[200px] truncate text-xs text-foreground/35 italic">
                    {deal.note}
                  </p>
                )}
              </td>
              <td className="px-4 py-3.5 text-xs text-foreground/35">{deal.freshnessHours}h</td>
              <td className="px-4 py-3.5">
                <Link
                  href={`/deals/${deal.listing.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent/60 transition-colors hover:text-accent"
                >
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
