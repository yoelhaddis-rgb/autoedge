import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  BadgeEuro,
  CalendarClock,
  CircleGauge,
  ExternalLink,
  Fuel,
  Gauge,
  MapPin,
  ShieldAlert,
  Wrench
} from "lucide-react";
import { DealScoreBadge } from "@/components/deals/deal-score-badge";
import { DealStatusActions } from "@/components/deals/deal-status-actions";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDealDetail, getDealStatusHistory } from "@/lib/services/deals";
import { buildValuationCostBreakdown } from "@/lib/services/valuation-engine";
import { getDealStatusClass, getDealStatusLabel } from "@/lib/utils/deal";
import { formatCurrency, formatMileage } from "@/lib/utils/format";

type DealDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1400&q=80";

function getComparableRelevanceLabels(
  targetYear: number,
  targetMileage: number,
  comparableYear: number,
  comparableMileage: number
): string[] {
  const labels: string[] = [];

  const yearDiff = Math.abs(targetYear - comparableYear);
  const mileageDiff = Math.abs(targetMileage - comparableMileage);

  if (yearDiff <= 1) labels.push("Close year match");
  if (mileageDiff <= 20000) labels.push("Close mileage match");
  if (labels.length === 0) labels.push("Relaxed match");

  return labels;
}

export default async function DealDetailPage({ params, searchParams }: DealDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const context = await getCurrentDealerContext();
  const [deal, statusHistory] = await Promise.all([
    getDealDetail(id, context.dealerId),
    getDealStatusHistory(id, context.dealerId)
  ]);

  if (!deal) {
    notFound();
  }

  const galleryImages = deal.listing.imageUrls.length > 0 ? deal.listing.imageUrls : [FALLBACK_IMAGE];
  const strictComparableCount = deal.comparables.filter(
    (item) =>
      Math.abs(item.comparableYear - deal.listing.year) <= 2 &&
      Math.abs(item.comparableMileage - deal.listing.mileage) <= 50000
  ).length;
  const relaxedComparableCount = Math.max(0, deal.comparables.length - strictComparableCount);
  const profitBreakdown = buildValuationCostBreakdown({
    listing: deal.listing,
    estimatedResaleValue: deal.valuation.medianEstimate,
    lowEstimate: deal.valuation.lowEstimate,
    highEstimate: deal.valuation.highEstimate,
    comparableCount: deal.comparables.length,
    strictMatchCount: strictComparableCount,
    targetExpectedCosts: deal.valuation.expectedCosts
  });
  const expectedProfitClass = deal.valuation.expectedProfit >= 0 ? "text-success" : "text-danger";

  return (
    <div className="space-y-6">
      {query.created === "1" && (
        <Card className="border-success/35 bg-success/10">
          <p className="text-sm text-success">Vehicle analysis created and saved to Supabase.</p>
        </Card>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/60">Deal detail</p>
          <h1 className="font-display mt-1 text-4xl tracking-wide text-foreground">{deal.listing.title.toUpperCase()}</h1>
          <p className="mt-2 text-sm text-foreground/40">
            {deal.listing.source} · {deal.listing.location} · listed {deal.freshnessHours}h ago
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DealScoreBadge score={deal.valuation.dealScore} label={deal.scoreLabel} />
          <Badge className={getDealStatusClass(deal.status)}>{getDealStatusLabel(deal.status)}</Badge>
          <a
            href={deal.listing.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({ className: "gap-2" })}
          >
            Open original listing
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="relative h-[340px] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={galleryImages[0]}
                alt={deal.listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 60vw"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {galleryImages.slice(0, 4).map((url, index) => (
                <div key={`${url}-${index}`} className="relative h-24 overflow-hidden rounded-xl border border-white/10">
                  <Image src={url} alt={`${deal.listing.title} ${index + 1}`} fill className="object-cover" sizes="200px" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="mb-3 font-heading text-xl text-foreground">Vehicle details</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-foreground/55">Asking price</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(deal.listing.askingPrice)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-foreground/55">Year</p>
                <p className="text-lg font-semibold text-foreground">{deal.listing.year}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-foreground/55">Mileage</p>
                <p className="text-lg font-semibold text-foreground">{formatMileage(deal.listing.mileage)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-foreground/55">Fuel</p>
                <p className="text-lg font-semibold text-foreground">{deal.listing.fuel}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-foreground/55">Transmission</p>
                <p className="text-lg font-semibold text-foreground">{deal.listing.transmission}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-foreground/55">Seller type</p>
                <p className="text-lg font-semibold text-foreground">{deal.listing.sellerType}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-foreground/55">Power</p>
                <p className="text-lg font-semibold text-foreground">
                  {deal.listing.powerHp > 0 ? `${deal.listing.powerHp} hp` : "Unknown"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-foreground/55">Location</p>
                <p className="text-lg font-semibold text-foreground">{deal.listing.location}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-foreground/55">Current status</p>
                <Badge className={`mt-1 ${getDealStatusClass(deal.status)}`}>{getDealStatusLabel(deal.status)}</Badge>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="mb-2 text-sm uppercase tracking-[0.14em] text-foreground/55">Description</p>
              <p className="text-sm leading-relaxed text-foreground/75">{deal.listing.description}</p>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-heading text-xl text-foreground">Comparable dealer listings</p>
              <Link href="/deals" className="text-sm text-accent hover:text-accent/80">
                Back to all deals
              </Link>
            </div>
            <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-foreground/55">Comparable coverage</p>
              <p className="mt-1 text-sm text-foreground/75">
                {deal.comparables.length} total comparables • {strictComparableCount} close match
                {strictComparableCount === 1 ? "" : "es"} • {relaxedComparableCount} relaxed match
              </p>
              <p className="mt-1 text-xs text-foreground/55">
                Confidence score is weighted by close comparable count and valuation spread.
              </p>
            </div>
            <div className="space-y-2">
              {deal.comparables.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-foreground/70">
                  No comparables stored for this listing yet. The valuation used fallback baseline logic.
                </div>
              )}
              {deal.comparables.map((item) => {
                const labels = getComparableRelevanceLabels(
                  deal.listing.year,
                  deal.listing.mileage,
                  item.comparableYear,
                  item.comparableMileage
                );
                const yearDelta = Math.abs(deal.listing.year - item.comparableYear);
                const mileageDelta = Math.abs(deal.listing.mileage - item.comparableMileage);

                return (
                  <a
                    key={item.id}
                    href={item.comparableUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-accent/40"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.comparableTitle}</p>
                      <p className="text-xs text-foreground/55">
                        {item.comparableYear} • {formatMileage(item.comparableMileage)} • {item.comparableSource}
                      </p>
                      <p className="mt-1 text-xs text-foreground/55">
                        Year Δ {yearDelta} • Mileage Δ {formatMileage(mileageDelta)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {labels.map((label) => (
                          <Badge
                            key={`${item.id}-${label}`}
                            className="border-white/20 bg-white/10 px-2 py-0.5 text-[11px] text-foreground/80"
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 font-semibold text-foreground">
                      {formatCurrency(item.comparablePrice)}
                      <ArrowUpRight className="h-4 w-4 text-accent" />
                    </div>
                  </a>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <p className="mb-4 font-heading text-xl text-foreground">Analysis panel</p>

            {deal.valuation.valuationSource === "model_based" && (
              <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
                <p className="font-semibold">Heuristische schatting</p>
                <p className="mt-0.5 text-amber-300/80">
                  Er zijn geen vergelijkbare listings gevonden. De waardebepaling is berekend op basis van een heuristisch
                  NL-marktmodel — geen marktdata. Verifieer de prijs via een live bron voordat je een beslissing neemt.
                </p>
              </div>
            )}
            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <BadgeEuro className="h-4 w-4" /> Market value range
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(deal.valuation.lowEstimate)} - {formatCurrency(deal.valuation.highEstimate)}
                </span>
              </div>

              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <Gauge className="h-4 w-4" /> Median resale value
                </span>
                <span className="font-semibold text-foreground">{formatCurrency(deal.valuation.medianEstimate)}</span>
              </div>

              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <BadgeEuro className="h-4 w-4" /> Estimated resale value
                </span>
                <span className="font-semibold text-foreground">{formatCurrency(profitBreakdown.estimatedResaleValue)}</span>
              </div>

              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <BadgeEuro className="h-4 w-4" /> Acquisition price
                </span>
                <span className="font-semibold text-foreground">-{formatCurrency(profitBreakdown.acquisitionPrice)}</span>
              </div>

              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <Wrench className="h-4 w-4" /> Recon costs
                </span>
                <span className="font-semibold text-warning">-{formatCurrency(profitBreakdown.reconCosts)}</span>
              </div>

              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <CalendarClock className="h-4 w-4" /> Holding cost ({profitBreakdown.projectedDaysToSell} days)
                </span>
                <span className="font-semibold text-warning">-{formatCurrency(profitBreakdown.holdingCost)}</span>
              </div>

              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <ShieldAlert className="h-4 w-4" /> Risk buffer
                </span>
                <span className="font-semibold text-warning">-{formatCurrency(profitBreakdown.riskBuffer)}</span>
              </div>

              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <Wrench className="h-4 w-4" /> Total expected costs
                </span>
                <span className="font-semibold text-warning">-{formatCurrency(profitBreakdown.expectedCosts)}</span>
              </div>

              <div
                className={`flex items-start justify-between rounded-xl border p-3 ${
                  deal.valuation.expectedProfit >= 0
                    ? "border-success/30 bg-success/10"
                    : "border-danger/30 bg-danger/10"
                }`}
              >
                <span
                  className={`inline-flex items-center gap-2 ${
                    deal.valuation.expectedProfit >= 0 ? "text-success/90" : "text-danger/90"
                  }`}
                >
                  <CircleGauge className="h-4 w-4" /> Expected profit
                </span>
                <span className={`font-semibold ${expectedProfitClass}`}>{formatCurrency(deal.valuation.expectedProfit)}</span>
              </div>

              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <CalendarClock className="h-4 w-4" /> Confidence score
                </span>
                <span className="font-semibold text-foreground">{deal.valuation.confidenceScore}/100</span>
              </div>

              <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="inline-flex items-center gap-2 text-foreground/65">
                  <Fuel className="h-4 w-4" /> Deal score
                </span>
                <span className="font-semibold text-foreground">{deal.valuation.dealScore}/100</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm uppercase tracking-[0.14em] text-foreground/55">Why this looks interesting</p>
              <ul className="mt-2 space-y-2 text-sm text-foreground/75">
                {deal.valuation.reasons.map((reason) => (
                  <li key={reason} className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-4">
              <p className="text-sm uppercase tracking-[0.14em] text-danger/90">Main risks</p>
              <ul className="mt-2 space-y-2 text-sm text-foreground/80">
                {deal.valuation.risks.map((risk) => (
                  <li key={risk} className="inline-flex items-start gap-2">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <p className="mb-3 font-heading text-xl text-foreground">Dealer notes & actions</p>
            <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-1 text-xs uppercase tracking-[0.14em] text-foreground/55">Current note</p>
              <p className="text-sm text-foreground/75">
                {deal.note || "No notes yet. Add context for your team below."}
              </p>
            </div>
            <DealStatusActions listingId={deal.listing.id} note={deal.note} status={deal.status} />

            {statusHistory.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="mb-3 text-xs uppercase tracking-[0.14em] text-foreground/55">Status history</p>
                <ol className="space-y-2">
                  {statusHistory.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-foreground/30" />
                      <div>
                        <p className="text-foreground/75">
                          {entry.oldStatus ? (
                            <>
                              <span className="font-medium text-foreground">{entry.oldStatus}</span>
                              {" → "}
                            </>
                          ) : null}
                          <span className="font-medium text-foreground">{entry.newStatus}</span>
                        </p>
                        <p className="text-xs text-foreground/45">
                          {new Date(entry.changedAt).toLocaleString("nl-NL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
