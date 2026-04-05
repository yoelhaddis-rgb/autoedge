import { createClient as createServerClient } from "@/lib/supabase/server";
import { asUpsertTable } from "@/lib/supabase/untyped";
import {
  DEMO_DEALER_ID,
  getDefaultNote,
  getDefaultStatus,
  mockComparables,
  mockDealStatuses,
  mockListings,
  mockValuations
} from "@/lib/data/mock";
import {
  mapComparableRow,
  mapDealStatusRow,
  mapListingRow,
  mapValuationRow
} from "@/lib/data/mappers";
import { getDealScoreLabel } from "@/lib/utils/deal";
import { ensureDealerProfileExists } from "@/lib/services/dealer-profile";
import type {
  Comparable,
  DealDetail,
  DealerPreference,
  DealLifecycleStatus,
  DealOverview,
  DealStatus,
  DealStatusHistoryEntry,
  Listing,
  Valuation
} from "@/types/domain";

// Valuation-first repository for opportunity analysis.
// This service intentionally works with inventory snapshots (mock or Supabase)
// and avoids assumptions about full-market real-time scraping.
export type DealSort = "score_desc" | "profit_desc" | "fresh" | "price_asc" | "price_desc";

export const SCAN_NOTE_MARKER = "Auto-discovered via monitoring scan.";

export type DealFilters = {
  search?: string;
  source?: string;
  fuel?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
  status?: DealLifecycleStatus | "all";
  sort?: DealSort;
  minProfit?: number;
  // Preference-derived filters — applied as soft defaults when no URL param overrides them.
  minYear?: number;
  maxMileage?: number;
  brands?: string[];
  // When true, only return deals created by the monitoring scan.
  scanOnly?: boolean;
};

export type DashboardSummary = {
  totalOpportunities: number;
  highPotentialDeals: number;
  highConfidenceDeals: number;
  savedAnalyses: number;
  averageExpectedProfit: number;
  recentComparableOpportunities: DealOverview[];
};

function getFreshnessHours(dateValue: string): number {
  const createdAt = new Date(dateValue).getTime();
  const diff = Date.now() - createdAt;
  return Math.max(1, Math.round(diff / (1000 * 60 * 60)));
}

function composeOverview(
  listing: Listing,
  valuation: Valuation,
  status: DealLifecycleStatus,
  note: string
): DealOverview {
  return {
    listing,
    valuation,
    status,
    note,
    freshnessHours: getFreshnessHours(listing.firstSeenAt),
    scoreLabel: getDealScoreLabel(valuation.dealScore)
  };
}

function buildMockOverviews(dealerId: string): DealOverview[] {
  const statusMap = new Map(
    mockDealStatuses
      .filter((status) => status.dealerId === dealerId || status.dealerId === DEMO_DEALER_ID)
      .map((status) => [status.listingId, status])
  );

  return mockListings
    .map((listing) => {
      const valuation = mockValuations.find((item) => item.listingId === listing.id);
      if (!valuation) return null;

      const status = statusMap.get(listing.id);
      return composeOverview(
        listing,
        valuation,
        status?.status ?? getDefaultStatus(listing.id),
        status?.note ?? getDefaultNote(listing.id)
      );
    })
    .filter((item): item is DealOverview => Boolean(item));
}

async function buildSupabaseOverviews(dealerId: string): Promise<DealOverview[] | null> {
  const supabase = await createServerClient();
  if (!supabase) return null;

  const [listingsRes, valuationsRes, statusesRes] = await Promise.all([
    supabase.from("listings").select("*").order("first_seen_at", { ascending: false }),
    supabase.from("valuations").select("*"),
    supabase.from("deal_statuses").select("*").eq("dealer_id", dealerId)
  ]);

  if (listingsRes.error || valuationsRes.error || statusesRes.error) {
    console.error("AutoEdge: failed to load Supabase deals", {
      listingsError: listingsRes.error?.message,
      valuationsError: valuationsRes.error?.message,
      statusesError: statusesRes.error?.message
    });
    // Supabase is configured but data retrieval failed.
    // Return an empty real state instead of blending mock data into production flows.
    return [];
  }

  const listings = listingsRes.data.map(mapListingRow);
  const valuations = valuationsRes.data.map(mapValuationRow);
  const statuses = statusesRes.data.map(mapDealStatusRow);

  const valuationMap = new Map(valuations.map((valuation) => [valuation.listingId, valuation]));
  const statusMap = new Map(statuses.map((status) => [status.listingId, status]));

  return listings
    .map((listing) => {
      const valuation = valuationMap.get(listing.id);
      if (!valuation) return null;

      const status = statusMap.get(listing.id);
      return composeOverview(listing, valuation, status?.status ?? "new", status?.note ?? "");
    })
    .filter((item): item is DealOverview => Boolean(item));
}

function applyFilters(deals: DealOverview[], filters: DealFilters = {}): DealOverview[] {
  let result = [...deals];

  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter((deal) => {
      const text = `${deal.listing.title} ${deal.listing.brand} ${deal.listing.model} ${deal.listing.location}`.toLowerCase();
      return text.includes(query);
    });
  }

  if (filters.source) {
    result = result.filter((deal) => deal.listing.source === filters.source);
  }

  if (filters.fuel) {
    result = result.filter((deal) => deal.listing.fuel === filters.fuel);
  }

  if (filters.transmission) {
    result = result.filter((deal) => deal.listing.transmission === filters.transmission);
  }

  const rangeMin = filters.minPrice;
  const rangeMax = filters.maxPrice;
  const [minPrice, maxPrice] =
    typeof rangeMin === "number" && typeof rangeMax === "number" && rangeMin > rangeMax
      ? [rangeMax, rangeMin]
      : [rangeMin, rangeMax];

  if (typeof minPrice === "number") {
    result = result.filter((deal) => deal.listing.askingPrice >= minPrice);
  }

  if (typeof maxPrice === "number") {
    result = result.filter((deal) => deal.listing.askingPrice <= maxPrice);
  }

  const minScore = filters.minScore;
  if (typeof minScore === "number") {
    result = result.filter((deal) => deal.valuation.dealScore >= minScore);
  }

  const minProfit = filters.minProfit;
  if (typeof minProfit === "number") {
    result = result.filter((deal) => deal.valuation.expectedProfit >= minProfit);
  }

  if (filters.status && filters.status !== "all") {
    result = result.filter((deal) => deal.status === filters.status);
  }

  if (typeof filters.minYear === "number") {
    result = result.filter((deal) => deal.listing.year >= (filters.minYear as number));
  }

  if (typeof filters.maxMileage === "number") {
    result = result.filter((deal) => deal.listing.mileage <= (filters.maxMileage as number));
  }

  if (filters.brands && filters.brands.length > 0) {
    const brandSet = new Set(filters.brands.map((b) => b.toLowerCase()));
    result = result.filter((deal) => brandSet.has(deal.listing.brand.toLowerCase()));
  }

  if (filters.scanOnly) {
    result = result.filter((deal) => deal.note.startsWith(SCAN_NOTE_MARKER));
  }

  switch (filters.sort) {
    case "profit_desc":
      result.sort((a, b) => b.valuation.expectedProfit - a.valuation.expectedProfit);
      break;
    case "fresh":
      result.sort((a, b) => a.freshnessHours - b.freshnessHours);
      break;
    case "price_asc":
      result.sort((a, b) => a.listing.askingPrice - b.listing.askingPrice);
      break;
    case "price_desc":
      result.sort((a, b) => b.listing.askingPrice - a.listing.askingPrice);
      break;
    case "score_desc":
    default:
      result.sort((a, b) => b.valuation.dealScore - a.valuation.dealScore);
      break;
  }

  return result;
}

export async function getDeals(
  dealerId: string = DEMO_DEALER_ID,
  filters: DealFilters = {}
): Promise<DealOverview[]> {
  const supabaseDeals = await buildSupabaseOverviews(dealerId);
  const baseDeals = supabaseDeals ?? buildMockOverviews(dealerId);
  return applyFilters(baseDeals, filters);
}

export async function getDashboardSummary(dealerId: string = DEMO_DEALER_ID): Promise<DashboardSummary> {
  const deals = await getDeals(dealerId);

  return {
    totalOpportunities: deals.length,
    highPotentialDeals: deals.filter((deal) => deal.valuation.dealScore >= 80).length,
    highConfidenceDeals: deals.filter((deal) => deal.valuation.confidenceScore >= 80).length,
    savedAnalyses: deals.filter((deal) => deal.status === "saved").length,
    averageExpectedProfit:
      deals.length > 0
        ? Math.round(deals.reduce((acc, item) => acc + item.valuation.expectedProfit, 0) / deals.length)
        : 0,
    recentComparableOpportunities: [...deals]
      .sort((a, b) => a.freshnessHours - b.freshnessHours)
      .slice(0, 6)
  };
}

async function getSupabaseComparables(listingId: string): Promise<Comparable[] | null> {
  const supabase = await createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("comparables")
    .select("*")
    .eq("listing_id", listingId)
    .order("comparable_price", { ascending: true });

  if (error) {
    console.error("AutoEdge: failed to load Supabase comparables", {
      listingId,
      error: error.message
    });
    return [];
  }
  return data.map(mapComparableRow);
}

export async function getDealDetail(
  listingId: string,
  dealerId: string = DEMO_DEALER_ID
): Promise<DealDetail | null> {
  const deals = await getDeals(dealerId);
  const baseDeal = deals.find((deal) => deal.listing.id === listingId);

  if (!baseDeal) return null;

  const supabaseComparables = await getSupabaseComparables(listingId);
  const comparables = supabaseComparables ?? mockComparables.filter((item) => item.listingId === listingId);

  return {
    ...baseDeal,
    comparables
  };
}

export async function getDealStatuses(dealerId: string = DEMO_DEALER_ID): Promise<DealStatus[]> {
  const supabase = await createServerClient();

  if (!supabase) {
    return mockDealStatuses.filter((item) => item.dealerId === dealerId || item.dealerId === DEMO_DEALER_ID);
  }

  const { data, error } = await supabase.from("deal_statuses").select("*").eq("dealer_id", dealerId);

  if (error) {
    console.error("AutoEdge: failed to load Supabase deal statuses", {
      dealerId,
      error: error.message
    });
    return [];
  }

  return data.map(mapDealStatusRow);
}

export async function getDealStatusHistory(
  listingId: string,
  dealerId: string = DEMO_DEALER_ID
): Promise<DealStatusHistoryEntry[]> {
  const supabase = await createServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("deal_status_history")
    .select("*")
    .eq("listing_id", listingId)
    .eq("dealer_id", dealerId)
    .order("changed_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("AutoEdge: failed to load deal status history", { listingId, error: error.message });
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    dealerId: row.dealer_id,
    listingId: row.listing_id,
    oldStatus: (row.old_status as DealLifecycleStatus) ?? null,
    newStatus: row.new_status as DealLifecycleStatus,
    note: row.note,
    changedAt: row.changed_at
  }));
}

export type ScanSummary = {
  lastScanAt: string | null;
  lastScanAnalyzed: number | null;
  profitableCount: number;
  topProfit: number | null;
};

export async function getScanSummary(
  dealerId: string,
  preferences: DealerPreference
): Promise<ScanSummary> {
  const scanDeals = await getDeals(dealerId, { scanOnly: true });
  const profitable = scanDeals.filter((d) => d.valuation.expectedProfit > 0);
  const topProfit =
    profitable.length > 0 ? Math.max(...profitable.map((d) => d.valuation.expectedProfit)) : null;

  return {
    lastScanAt: preferences.lastScanAt ?? null,
    lastScanAnalyzed: preferences.lastScanAnalyzed ?? null,
    profitableCount: profitable.length,
    topProfit
  };
}

export async function upsertDealStatus(payload: {
  dealerId: string;
  listingId: string;
  status: DealLifecycleStatus;
  note: string;
}): Promise<void> {
  const supabase = await createServerClient();

  if (!supabase) {
    return;
  }

  const { dealerId, listingId, status, note } = payload;
  const normalizedNote = note.trim().slice(0, 2000);

  await ensureDealerProfileExists(supabase, dealerId);

  // Fetch the current status before upserting (for history).
  const { data: existing } = await supabase
    .from("deal_statuses")
    .select("status")
    .eq("dealer_id", dealerId)
    .eq("listing_id", listingId)
    .maybeSingle();

  const oldStatus = existing?.status ?? null;

  const statusWriteResult = await asUpsertTable(supabase.from("deal_statuses")).upsert(
    {
      dealer_id: dealerId,
      listing_id: listingId,
      status,
      note: normalizedNote,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "dealer_id,listing_id"
    }
  );

  if (statusWriteResult.error) {
    throw new Error(statusWriteResult.error.message);
  }

  // Record history entry (fire-and-forget — a history write failure must not block the main action).
  supabase
    .from("deal_status_history")
    .insert({
      dealer_id: dealerId,
      listing_id: listingId,
      old_status: oldStatus,
      new_status: status,
      note: normalizedNote
    })
    .then(({ error: histError }) => {
      if (histError) {
        console.error("AutoEdge: failed to write deal status history", { listingId, error: histError.message });
      }
    });
}
