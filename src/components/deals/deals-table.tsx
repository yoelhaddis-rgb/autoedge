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
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d131f]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 text-foreground/60">
          <tr>
            <th className="px-4 py-3 font-medium">Vehicle</th>
            <th className="px-4 py-3 font-medium">Asking</th>
            <th className="px-4 py-3 font-medium">Market Range</th>
            <th className="px-4 py-3 font-medium">Profit</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Confidence</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Freshness</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.listing.id} className="border-b border-white/5 text-foreground/85">
              <td className="px-4 py-4">
                <p className="font-semibold text-foreground">{deal.listing.title}</p>
                <p className="text-xs text-foreground/55">
                  {deal.listing.year} • {formatMileage(deal.listing.mileage)} • {deal.listing.fuel} • {deal.listing.transmission}
                </p>
                <p className="text-xs text-foreground/55">
                  {deal.listing.location} • {deal.listing.source}
                </p>
              </td>
              <td className="px-4 py-4 font-semibold">{formatCurrency(deal.listing.askingPrice)}</td>
              <td className="px-4 py-4 text-foreground/70">
                {formatCurrency(deal.valuation.lowEstimate)} - {formatCurrency(deal.valuation.highEstimate)}
              </td>
              <td
                className={`px-4 py-4 font-semibold ${
                  deal.valuation.expectedProfit >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {formatCurrency(deal.valuation.expectedProfit)}
              </td>
              <td className="px-4 py-4">
                <DealScoreBadge score={deal.valuation.dealScore} label={deal.scoreLabel} />
              </td>
              <td className="px-4 py-4">
                <Badge className={getConfidenceClass(deal.valuation.confidenceScore)}>
                  {getConfidenceLabel(deal.valuation.confidenceScore)} • {deal.valuation.confidenceScore}/100
                </Badge>
              </td>
              <td className="px-4 py-4">
                <Badge className={getDealStatusClass(deal.status)}>{getDealStatusLabel(deal.status)}</Badge>
                {deal.note && <p className="mt-1 max-w-[220px] truncate text-xs text-foreground/55">{deal.note}</p>}
              </td>
              <td className="px-4 py-4 text-foreground/60">{deal.freshnessHours}h ago</td>
              <td className="px-4 py-4">
                <Link href={`/deals/${deal.listing.id}`} className="inline-flex items-center gap-1 text-accent hover:text-accent/80">
                  Open
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
