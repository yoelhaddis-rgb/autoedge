import Link from "next/link";
import { LayoutGrid, PlusCircle, Rows3, SearchX, SlidersHorizontal } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { DealsFilters } from "@/components/deals/deals-filters";
import { DealsTable } from "@/components/deals/deals-table";
import { PaginationControls } from "@/components/deals/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDeals, type DealFilters } from "@/lib/services/deals";
import { getDealerPreferences } from "@/lib/services/preferences";
import type { Listing } from "@/types/domain";

const PAGE_SIZE = 20;

type DealsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toStringValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toStatusValue(value: string | string[] | undefined): DealFilters["status"] | undefined {
  const raw = toStringValue(value);
  const allowed: Array<NonNullable<DealFilters["status"]>> = [
    "new",
    "saved",
    "ignored",
    "contacted",
    "bought",
    "all"
  ];
  if (!raw) return undefined;
  return allowed.includes(raw as NonNullable<DealFilters["status"]>)
    ? (raw as NonNullable<DealFilters["status"]>)
    : undefined;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;
  const context = await getCurrentDealerContext();
  const preferences = await getDealerPreferences(context.dealerId);

  // URL params override preference defaults. Preference filters are only applied
  // when the dealer has not explicitly set that param in the URL.
  const urlMinYear = toStringValue(params.minYear) ? Number(toStringValue(params.minYear)) : undefined;
  const urlMaxMileage = toStringValue(params.maxMileage) ? Number(toStringValue(params.maxMileage)) : undefined;
  const urlBrands = toStringValue(params.brands)
    ? toStringValue(params.brands)!.split(",").map((b) => b.trim()).filter(Boolean)
    : undefined;

  // Determine which preference filters are active (not overridden by URL).
  const prefMinYear = urlMinYear === undefined ? preferences.minYear : undefined;
  const prefMaxMileage = urlMaxMileage === undefined ? preferences.maxMileage : undefined;
  const prefBrands =
    urlBrands === undefined && preferences.preferredBrands.length > 0
      ? preferences.preferredBrands
      : undefined;

  const preferencesActive = Boolean(prefMinYear || prefMaxMileage || prefBrands);

  const parsedFilters: DealFilters = {
    search: toStringValue(params.search),
    source: toStringValue(params.source),
    fuel: toStringValue(params.fuel),
    transmission: toStringValue(params.transmission),
    status: toStatusValue(params.status),
    sort: (toStringValue(params.sort) as DealFilters["sort"]) ?? "score_desc",
    minScore: toStringValue(params.minScore) ? Number(toStringValue(params.minScore)) : undefined,
    // Preference-derived soft defaults
    minYear: urlMinYear ?? prefMinYear,
    maxMileage: urlMaxMileage ?? prefMaxMileage,
    brands: urlBrands ?? prefBrands
  };

  const view = toStringValue(params.view) === "cards" ? "cards" : "table";
  const page = Math.max(1, Number(toStringValue(params.page) ?? "1") || 1);

  const allDeals = await getDeals(context.dealerId);
  const deals = await getDeals(context.dealerId, parsedFilters);
  const highPotential = deals.filter((deal) => deal.valuation.dealScore >= 80).length;
  const pagedDeals = deals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sourceOptions = [...new Set(allDeals.map((deal) => deal.listing.source))].sort();
  const fuelOptions = [...new Set(allDeals.map((deal) => deal.listing.fuel))].sort() as Listing["fuel"][];
  const transmissionOptions = [...new Set(allDeals.map((deal) => deal.listing.transmission))].sort() as Listing["transmission"][];
  const statusOptions: NonNullable<DealFilters["status"]>[] = [
    "new",
    "saved",
    "contacted",
    "ignored",
    "bought"
  ];

  const currentValues = {
    search: parsedFilters.search,
    source: parsedFilters.source,
    fuel: parsedFilters.fuel,
    transmission: parsedFilters.transmission,
    status: parsedFilters.status,
    minScore: parsedFilters.minScore ? String(parsedFilters.minScore) : undefined,
    sort: parsedFilters.sort
  };

  const hasActiveFilters =
    Boolean(parsedFilters.search) ||
    Boolean(parsedFilters.source) ||
    Boolean(parsedFilters.fuel) ||
    Boolean(parsedFilters.transmission) ||
    Boolean(parsedFilters.status) ||
    typeof parsedFilters.minScore === "number";

  const query = new URLSearchParams();
  Object.entries(currentValues).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });
  const tableHref = `/deals?${new URLSearchParams({ ...Object.fromEntries(query.entries()), view: "table" }).toString()}`;
  const cardsHref = `/deals?${new URLSearchParams({ ...Object.fromEntries(query.entries()), view: "cards" }).toString()}`;
  const buildPageHref = (p: number) =>
    `/deals?${new URLSearchParams({ ...Object.fromEntries(query.entries()), view, page: String(p) }).toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/60">Valuation opportunities</p>
          <h1 className="font-display mt-1 text-5xl tracking-wide text-foreground">DEAL ANALYSIS QUEUE</h1>
          <p className="mt-2 text-sm text-foreground/45">
            Scan listing value gaps, confidence levels, and expected profit in one operational view.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/deals/analyze" className={buttonClassName({ variant: "secondary" })}>
            Analyze vehicle
          </Link>
          <Badge className="border-success/35 bg-success/10 text-success">{highPotential} high potential</Badge>
          <Badge className="border-border/60 bg-white/[0.04] text-foreground/60">{deals.length} results</Badge>
        </div>
      </div>

      <DealsFilters
        sources={sourceOptions}
        fuels={fuelOptions}
        transmissions={transmissionOptions}
        statuses={statusOptions}
        current={currentValues}
        preferencesActive={preferencesActive}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-white/[0.02] px-4 py-3">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground/30">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter to prioritize profitable opportunities
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={tableHref}
            className={buttonClassName({
              variant: view === "table" ? "primary" : "ghost",
              className: "gap-1.5 h-8 text-xs"
            })}
          >
            <Rows3 className="h-3.5 w-3.5" /> Table
          </Link>
          <Link
            href={cardsHref}
            className={buttonClassName({
              variant: view === "cards" ? "primary" : "ghost",
              className: "gap-1.5 h-8 text-xs"
            })}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </Link>
        </div>
      </div>

      {deals.length === 0 ? (
        <Card className="border-white/15 bg-white/[0.02]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm text-foreground/60">
                {hasActiveFilters ? <SearchX className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                {hasActiveFilters ? "No matches with current filters" : "No analyzed opportunities yet"}
              </p>
              <p className="mt-2 font-heading text-xl text-foreground">
                {hasActiveFilters ? "No deals found" : "Start with your first vehicle analysis"}
              </p>
              <p className="mt-1 text-sm text-foreground/60">
                {hasActiveFilters
                  ? "Try broader filters or reset search criteria to view the full queue."
                  : "Analyze a listing manually to create your first valuation, score and comparable set."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Link href="/deals" className={buttonClassName({ variant: "secondary" })}>
                  Clear filters
                </Link>
              )}
              <Link href="/deals/analyze" className={buttonClassName({ className: "gap-2" })}>
                <PlusCircle className="h-4 w-4" />
                Analyze vehicle
              </Link>
            </div>
          </div>
        </Card>
      ) : view === "cards" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagedDeals.map((deal) => (
              <DealCard key={deal.listing.id} deal={deal} />
            ))}
          </div>
          <PaginationControls page={page} pageSize={PAGE_SIZE} total={deals.length} buildHref={buildPageHref} />
        </>
      ) : (
        <>
          <DealsTable deals={pagedDeals} />
          <PaginationControls page={page} pageSize={PAGE_SIZE} total={deals.length} buildHref={buildPageHref} />
        </>
      )}
    </div>
  );
}
