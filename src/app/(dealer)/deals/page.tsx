import Link from "next/link";
import { LayoutGrid, PlusCircle, Rows3, SearchX, SlidersHorizontal } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { DealsFilters } from "@/components/deals/deals-filters";
import { DealsTable } from "@/components/deals/deals-table";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDeals, type DealFilters } from "@/lib/services/deals";
import type { Listing } from "@/types/domain";

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

  const parsedFilters: DealFilters = {
    search: toStringValue(params.search),
    source: toStringValue(params.source),
    fuel: toStringValue(params.fuel),
    transmission: toStringValue(params.transmission),
    status: toStatusValue(params.status),
    sort: (toStringValue(params.sort) as DealFilters["sort"]) ?? "score_desc",
    minScore: toStringValue(params.minScore) ? Number(toStringValue(params.minScore)) : undefined
  };

  const view = toStringValue(params.view) === "cards" ? "cards" : "table";

  const allDeals = await getDeals(context.dealerId);
  const deals = await getDeals(context.dealerId, parsedFilters);
  const highPotential = deals.filter((deal) => deal.valuation.dealScore >= 80).length;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-foreground/60">Valuation opportunities</p>
          <h1 className="font-heading text-3xl text-foreground">Deal Analysis Queue</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Scan listing value gaps, confidence levels, and expected profit in one operational view.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/deals/analyze" className={buttonClassName({ variant: "secondary" })}>
            Analyze vehicle
          </Link>
          <Badge className="border-success/35 bg-success/15 text-success">{highPotential} high potential</Badge>
          <Badge className="border-white/20 bg-white/10 text-foreground/75">{deals.length} total results</Badge>
        </div>
      </div>

      <DealsFilters
        sources={sourceOptions}
        fuels={fuelOptions}
        transmissions={transmissionOptions}
        statuses={statusOptions}
        current={currentValues}
      />

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-foreground/65">
          <SlidersHorizontal className="h-4 w-4" />
          Use filters to prioritize profitable and fresh opportunities.
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={tableHref}
            className={buttonClassName({
              variant: view === "table" ? "primary" : "secondary",
              className: "gap-2"
            })}
          >
            <Rows3 className="h-4 w-4" /> Table
          </Link>
          <Link
            href={cardsHref}
            className={buttonClassName({
              variant: view === "cards" ? "primary" : "secondary",
              className: "gap-2"
            })}
          >
            <LayoutGrid className="h-4 w-4" /> Cards
          </Link>
        </div>
      </Card>

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {deals.map((deal) => (
            <DealCard key={deal.listing.id} deal={deal} />
          ))}
        </div>
      ) : (
        <DealsTable deals={deals} />
      )}
    </div>
  );
}
