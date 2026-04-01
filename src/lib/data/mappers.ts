import type { Database } from "@/types/database";
import type {
  Comparable,
  DealStatus,
  DealerPreference,
  Listing,
  Valuation
} from "@/types/domain";
import type { ValuationSource } from "@/lib/services/valuation-engine";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
type ValuationRow = Database["public"]["Tables"]["valuations"]["Row"];
type ComparableRow = Database["public"]["Tables"]["comparables"]["Row"];
type DealStatusRow = Database["public"]["Tables"]["deal_statuses"]["Row"];
type PreferenceRow = Database["public"]["Tables"]["dealer_preferences"]["Row"];

export function mapListingRow(row: ListingRow): Listing {
  return {
    id: row.id,
    source: row.source,
    externalId: row.external_id,
    sourceUrl: row.source_url,
    title: row.title,
    brand: row.brand,
    model: row.model,
    variant: row.variant,
    year: row.year,
    mileage: row.mileage,
    askingPrice: row.asking_price,
    fuel: row.fuel as Listing["fuel"],
    transmission: row.transmission as Listing["transmission"],
    powerHp: row.power_hp,
    location: row.location,
    sellerType: row.seller_type,
    description: row.description,
    imageUrls: row.image_urls,
    firstSeenAt: row.first_seen_at,
    createdAt: row.created_at
  };
}

export function mapValuationRow(row: ValuationRow): Valuation {
  const source = row.valuation_source as ValuationSource;
  return {
    id: row.id,
    listingId: row.listing_id,
    lowEstimate: row.low_estimate,
    medianEstimate: row.median_estimate,
    highEstimate: row.high_estimate,
    expectedCosts: row.expected_costs,
    expectedProfit: row.expected_profit,
    confidenceScore: row.confidence_score,
    dealScore: row.deal_score,
    reasons: row.reasons,
    risks: row.risks,
    createdAt: row.created_at,
    valuationSource: source === "model_based" ? "model_based" : "comparable_based"
  };
}

export function mapComparableRow(row: ComparableRow): Comparable {
  return {
    id: row.id,
    listingId: row.listing_id,
    comparableTitle: row.comparable_title,
    comparablePrice: row.comparable_price,
    comparableYear: row.comparable_year,
    comparableMileage: row.comparable_mileage,
    comparableSource: row.comparable_source,
    comparableUrl: row.comparable_url
  };
}

export function mapDealStatusRow(row: DealStatusRow): DealStatus {
  return {
    id: row.id,
    dealerId: row.dealer_id,
    listingId: row.listing_id,
    status: row.status as DealStatus["status"],
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapPreferenceRow(row: PreferenceRow): DealerPreference {
  return {
    id: row.id,
    dealerId: row.dealer_id,
    preferredBrands: row.preferred_brands,
    preferredModels: row.preferred_models,
    minYear: row.min_year,
    maxMileage: row.max_mileage,
    minPrice: row.min_price,
    maxPrice: row.max_price,
    minExpectedProfit: row.min_expected_profit,
    fuelTypes: row.fuel_types as DealerPreference["fuelTypes"],
    transmissions: row.transmissions as DealerPreference["transmissions"],
    monitoringIntensity: row.monitoring_intensity as DealerPreference["monitoringIntensity"],
    selectedSourceGroups: row.selected_source_groups,
    reconCostBaseOverride: row.recon_cost_base_override,
    dailyHoldingCostOverride: row.daily_holding_cost_override,
    riskBufferBaseOverride: row.risk_buffer_base_override,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
