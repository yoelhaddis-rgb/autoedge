import { createClient as createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { asUpsertTable } from "@/lib/supabase/untyped";
import { mapListingRow, mapValuationRow } from "@/lib/data/mappers";
import {
  ComparableInventoryValuationEngine,
  type ComparableInput,
  type ComputedValuation
} from "@/lib/services/valuation-engine";
import { ensureDealerProfileExists } from "@/lib/services/dealer-profile";
import type { FuelType, Listing, TransmissionType, Valuation } from "@/types/domain";

export type AnalyzeVehicleInput = {
  brand: string;
  model: string;
  variant: string;
  year: number;
  mileage: number;
  askingPrice: number;
  powerHp?: number;
  fuel: FuelType;
  transmission: TransmissionType;
  location: string;
  sourceUrl?: string;
  imageUrl?: string;
  notes?: string;
};

export type AnalyzeVehicleResult = {
  listingId: string;
  valuation: ComputedValuation;
  comparableCount: number;
};

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function parseSourceName(sourceUrl?: string): string {
  if (!sourceUrl) return "Manual Entry";

  try {
    const hostname = new URL(sourceUrl).hostname.replace(/^www\./, "");
    if (!hostname) return "Manual Entry";

    return hostname
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(".");
  } catch {
    return "Manual Entry";
  }
}

function buildExternalId(): string {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateInput(input: AnalyzeVehicleInput): void {
  const currentYear = new Date().getFullYear();

  if (!input.brand || !input.model || !input.location) {
    throw new Error("Brand, model, and location are required.");
  }

  if (input.year < 1995 || input.year > currentYear + 1) {
    throw new Error("Year is outside the supported range.");
  }

  if (input.mileage < 0 || input.mileage > 450000) {
    throw new Error("Mileage is outside the supported range.");
  }

  if (input.askingPrice < 500 || input.askingPrice > 500000) {
    throw new Error("Asking price is outside the supported range.");
  }

  if (typeof input.powerHp === "number" && (input.powerHp < 0 || input.powerHp > 1500)) {
    throw new Error("Power (HP) is outside the supported range.");
  }

  if (input.imageUrl) {
    try {
      const parsed = new URL(input.imageUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error();
      }
    } catch {
      throw new Error("Image URL is invalid.");
    }
  }
}

function getSimilarityScore(target: Listing, candidate: Listing): number {
  const yearDistance = Math.abs(target.year - candidate.year) * 9;
  const mileageDistance = Math.abs(target.mileage - candidate.mileage) / 2500;
  const priceDistance = Math.abs(target.askingPrice - candidate.askingPrice) / 250;
  const fuelPenalty = target.fuel === candidate.fuel ? 0 : 12;
  const transmissionPenalty = target.transmission === candidate.transmission ? 0 : 8;
  const locationPenalty =
    target.location.trim().toLowerCase() === candidate.location.trim().toLowerCase() ? 0 : 1;

  // Location is a soft context factor only; nationwide comparables remain the default.
  return yearDistance + mileageDistance + priceDistance + fuelPenalty + transmissionPenalty + locationPenalty;
}

async function fetchComparableListings(target: Listing): Promise<Listing[]> {
  const supabase = await createServerClient();
  if (!supabase) return [];

  // Nationwide default: keep selection broad and avoid city-level hard filtering.
  const strictYearWindow = 2;
  const strictMileageWindow = 50000;

  const strictQuery = supabase
    .from("listings")
    .select("*")
    .neq("id", target.id)
    .eq("brand", target.brand)
    .eq("model", target.model)
    .eq("fuel", target.fuel)
    .eq("transmission", target.transmission)
    .gte("year", target.year - strictYearWindow)
    .lte("year", target.year + strictYearWindow)
    .gte("mileage", Math.max(0, target.mileage - strictMileageWindow))
    .lte("mileage", target.mileage + strictMileageWindow)
    .gte("asking_price", Math.max(1000, Math.round(target.askingPrice * 0.55)))
    .lte("asking_price", Math.round(target.askingPrice * 1.45))
    .limit(30);

  const { data: strictRows, error: strictError } = await strictQuery;
  if (strictError) return [];

  const strictListings = strictRows.map(mapListingRow);
  if (strictListings.length >= 4) {
    return strictListings;
  }

  const relaxedQuery = supabase
    .from("listings")
    .select("*")
    .neq("id", target.id)
    .eq("brand", target.brand)
    .eq("model", target.model)
    .gte("year", target.year - 4)
    .lte("year", target.year + 4)
    .gte("mileage", Math.max(0, target.mileage - 85000))
    .lte("mileage", target.mileage + 85000)
    .gte("asking_price", Math.max(1000, Math.round(target.askingPrice * 0.5)))
    .lte("asking_price", Math.round(target.askingPrice * 1.55))
    .limit(50);

  const { data: relaxedRows, error: relaxedError } = await relaxedQuery;
  if (relaxedError) {
    return strictListings;
  }

  const merged = [...strictListings, ...relaxedRows.map(mapListingRow)];
  const uniqueMap = new Map(merged.map((listing) => [listing.id, listing]));
  return [...uniqueMap.values()];
}

async function fetchValuationMap(listingIds: string[]): Promise<Map<string, Valuation>> {
  if (listingIds.length === 0) return new Map();

  const supabase = await createServerClient();
  if (!supabase) return new Map();

  const { data, error } = await supabase.from("valuations").select("*").in("listing_id", listingIds);
  if (error || !data) return new Map();

  return new Map(data.map((row) => {
    const valuation = mapValuationRow(row);
    return [valuation.listingId, valuation] as const;
  }));
}

async function buildComparableInputs(target: Listing): Promise<ComparableInput[]> {
  const comparables = await fetchComparableListings(target);
  const valuationMap = await fetchValuationMap(comparables.map((listing) => listing.id));

  return comparables.map((listing) => {
    const strictMatch = listing.fuel === target.fuel && listing.transmission === target.transmission;
    return {
      listing,
      referenceValue: valuationMap.get(listing.id)?.medianEstimate ?? listing.askingPrice,
      strictMatch,
      similarityScore: getSimilarityScore(target, listing)
    };
  });
}

export async function analyzeVehicle(
  dealerId: string,
  rawInput: AnalyzeVehicleInput
): Promise<AnalyzeVehicleResult> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local."
    );
  }

  const supabase = await createServerClient();
  if (!supabase) {
    throw new Error("Supabase client is unavailable.");
  }

  const input: AnalyzeVehicleInput = {
    ...rawInput,
    brand: normalizeText(rawInput.brand),
    model: normalizeText(rawInput.model),
    variant: normalizeText(rawInput.variant),
    location: normalizeText(rawInput.location),
    notes: normalizeText(rawInput.notes ?? ""),
    sourceUrl: normalizeText(rawInput.sourceUrl ?? ""),
    imageUrl: normalizeText(rawInput.imageUrl ?? ""),
    powerHp:
      typeof rawInput.powerHp === "number" && Number.isFinite(rawInput.powerHp)
        ? Math.round(rawInput.powerHp)
        : undefined
  };

  validateInput(input);

  const listingId = crypto.randomUUID();
  const externalId = buildExternalId();
  const sourceUrl = input.sourceUrl || `https://manual.autoedge.local/analysis/${externalId}`;
  const source = parseSourceName(input.sourceUrl);
  const title = [input.brand, input.model, input.variant].filter(Boolean).join(" ");

  const listingInsertResult = await asUpsertTable(supabase.from("listings")).upsert(
    {
      id: listingId,
      source,
      external_id: externalId,
      source_url: sourceUrl,
      title,
      brand: input.brand,
      model: input.model,
      variant: input.variant || "",
      year: input.year,
      mileage: input.mileage,
      asking_price: input.askingPrice,
      fuel: input.fuel,
      transmission: input.transmission,
      power_hp: input.powerHp ?? 0,
      location: input.location,
      seller_type: "Unknown",
      description: input.notes || "Manual valuation submission",
      image_urls: input.imageUrl ? [input.imageUrl] : [],
      first_seen_at: new Date().toISOString()
    },
    {
      onConflict: "id"
    }
  );
  if (listingInsertResult.error) {
    throw new Error(listingInsertResult.error.message);
  }

  const { data: insertedRow, error: insertReadError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (insertReadError || !insertedRow) {
    throw new Error(insertReadError?.message ?? "Failed to save listing.");
  }

  const listing = mapListingRow(insertedRow);

  // Future hook: source connectors / selective monitoring can push candidate listings
  // through this same analysis pipeline instead of direct manual form input.
  const comparableInputs = await buildComparableInputs(listing);
  const valuationEngine = new ComparableInventoryValuationEngine();
  const computed = await valuationEngine.estimate(listing, comparableInputs);

  const valuationRow = {
    listing_id: listing.id,
    low_estimate: computed.lowEstimate,
    median_estimate: computed.medianEstimate,
    high_estimate: computed.highEstimate,
    expected_costs: computed.expectedCosts,
    expected_profit: computed.expectedProfit,
    confidence_score: computed.confidenceScore,
    deal_score: computed.dealScore,
    reasons: computed.reasons,
    risks: computed.risks
  };

  const valuationWriteResult = await asUpsertTable(supabase.from("valuations")).upsert(valuationRow, {
    onConflict: "listing_id"
  });
  if (valuationWriteResult.error) {
    throw new Error(valuationWriteResult.error.message);
  }

  const { error: comparableDeleteError } = await supabase.from("comparables").delete().eq("listing_id", listing.id);
  if (comparableDeleteError) {
    throw new Error(comparableDeleteError.message);
  }

  const comparableRows = computed.selectedComparables.map((item) => ({
    listing_id: listing.id,
    comparable_title: item.listing.title,
    comparable_price: item.referenceValue,
    comparable_year: item.listing.year,
    comparable_mileage: item.listing.mileage,
    comparable_source: item.listing.source,
    comparable_url: item.listing.sourceUrl
  }));

  if (comparableRows.length > 0) {
    const comparableWriteResult = await asUpsertTable(supabase.from("comparables")).upsert(comparableRows);
    if (comparableWriteResult.error) {
      throw new Error(comparableWriteResult.error.message);
    }
  }

  await ensureDealerProfileExists(supabase, dealerId);

  const statusWriteResult = await asUpsertTable(supabase.from("deal_statuses")).upsert(
    {
      dealer_id: dealerId,
      listing_id: listing.id,
      status: "new",
      note: input.notes || "",
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "dealer_id,listing_id"
    }
  );
  if (statusWriteResult.error) {
    throw new Error(statusWriteResult.error.message);
  }

  return {
    listingId: listing.id,
    valuation: computed,
    comparableCount: computed.selectedComparables.length
  };
}
