import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock3 } from "lucide-react";
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

type DealCardProps = {
  deal: DealOverview;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1400&q=80";

export function DealCard({ deal }: DealCardProps) {
  const primaryImage = deal.listing.imageUrls[0] ?? FALLBACK_IMAGE;
  const profitPositive = deal.valuation.expectedProfit >= 0;

  return (
    <Link
      href={`/deals/${deal.listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel transition-all duration-200 hover:border-accent/30 hover:shadow-glow-sm"
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={primaryImage}
          alt={deal.listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

        {/* Score badge over image */}
        <div className="absolute bottom-3 left-3">
          <DealScoreBadge score={deal.valuation.dealScore} label={deal.scoreLabel} />
        </div>

        {/* Freshness */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-foreground/60 backdrop-blur-sm">
          <Clock3 className="h-3 w-3" />
          {deal.freshnessHours}h ago
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-heading font-semibold text-foreground group-hover:text-accent/90 transition-colors">
              {deal.listing.title}
            </p>
            <p className="mt-0.5 text-xs text-foreground/45">
              {deal.listing.year} · {formatMileage(deal.listing.mileage)} · {deal.listing.location}
            </p>
          </div>
          <Badge className={getDealStatusClass(deal.status)}>{getDealStatusLabel(deal.status)}</Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border/50 bg-border/30 text-sm">
          <div className="bg-card px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.1em] text-foreground/35">Asking</p>
            <p className="mt-0.5 font-semibold text-foreground">{formatCurrency(deal.listing.askingPrice)}</p>
          </div>
          <div className="bg-card px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.1em] text-foreground/35">Profit</p>
            <p className={`mt-0.5 font-semibold ${profitPositive ? "text-success" : "text-danger"}`}>
              {formatCurrency(deal.valuation.expectedProfit)}
            </p>
          </div>
          <div className="bg-card px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.1em] text-foreground/35">Median</p>
            <p className="mt-0.5 font-semibold text-foreground">{formatCurrency(deal.valuation.medianEstimate)}</p>
          </div>
        </div>

        {/* Confidence + heuristic */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={getConfidenceClass(deal.valuation.confidenceScore)}>
            {getConfidenceLabel(deal.valuation.confidenceScore)} · {deal.valuation.confidenceScore}/100
          </Badge>
          {deal.valuation.valuationSource === "model_based" && (
            <Badge className="border-amber-500/30 bg-amber-500/8 text-amber-400/80">Heuristic</Badge>
          )}
        </div>

        {deal.note && (
          <p className="truncate text-xs text-foreground/40 italic">"{deal.note}"</p>
        )}

        {/* CTA */}
        <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-accent/70 group-hover:text-accent transition-colors">
          Open analysis
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
