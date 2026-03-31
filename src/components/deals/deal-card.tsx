import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DealScoreBadge } from "@/components/deals/deal-score-badge";
import {
  getConfidenceClass,
  getConfidenceLabel,
  getDealStatusClass,
  getDealStatusLabel
} from "@/lib/utils/deal";
import { formatCurrency, formatMileage } from "@/lib/utils/format";
import type { DealOverview } from "@/types/domain";

type DealCardProps = {
  deal: DealOverview;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1400&q=80";

export function DealCard({ deal }: DealCardProps) {
  const primaryImage = deal.listing.imageUrls[0] ?? FALLBACK_IMAGE;

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-44 w-full">
        <Image
          src={primaryImage}
          alt={deal.listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-lg text-foreground">{deal.listing.title}</p>
            <p className="text-sm text-foreground/60">
              {deal.listing.year} • {formatMileage(deal.listing.mileage)} • {deal.listing.location}
            </p>
          </div>
          <DealScoreBadge score={deal.valuation.dealScore} label={deal.scoreLabel} />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm md:grid-cols-3">
          <div>
            <p className="text-foreground/55">Asking</p>
            <p className="font-semibold text-foreground">{formatCurrency(deal.listing.askingPrice)}</p>
          </div>
          <div>
            <p className="text-foreground/55">Expected Profit</p>
            <p className={`font-semibold ${deal.valuation.expectedProfit >= 0 ? "text-success" : "text-danger"}`}>
              {formatCurrency(deal.valuation.expectedProfit)}
            </p>
          </div>
          <div>
            <p className="text-foreground/55">Market Median</p>
            <p className="font-semibold text-foreground">{formatCurrency(deal.valuation.medianEstimate)}</p>
          </div>
          <div>
            <p className="text-foreground/55">Source</p>
            <p className="font-semibold text-foreground">{deal.listing.source}</p>
          </div>
          <div>
            <p className="text-foreground/55">Confidence</p>
            <Badge className={`${getConfidenceClass(deal.valuation.confidenceScore)} mt-1`}>
              {getConfidenceLabel(deal.valuation.confidenceScore)} • {deal.valuation.confidenceScore}/100
            </Badge>
          </div>
          <div>
            <p className="text-foreground/55">Deal score</p>
            <p className="font-semibold text-foreground">{deal.valuation.dealScore}/100</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={getDealStatusClass(deal.status)}>{getDealStatusLabel(deal.status)}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-foreground/55">
            <Clock3 className="h-3.5 w-3.5" /> {deal.freshnessHours}h ago
          </span>
        </div>

        {deal.note && <p className="max-h-9 overflow-hidden text-xs text-foreground/60">Note: {deal.note}</p>}

        <Link
          href={`/deals/${deal.listing.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80"
        >
          Open analysis
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
