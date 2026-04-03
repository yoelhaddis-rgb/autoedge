import { createClient as createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { asUpsertTable } from "@/lib/supabase/untyped";
import { AutoScout24Connector } from "@/lib/services/connectors/autoscout24-connector";
import type { Listing } from "@/types/domain";

export type IngestResult = {
  inserted: number;
  updated: number;
  skipped: number;
};

const BATCH_SIZE = 20;

function toRow(listing: Listing) {
  return {
    source: listing.source,
    external_id: listing.externalId,
    source_url: listing.sourceUrl,
    title: listing.title,
    brand: listing.brand,
    model: listing.model,
    variant: listing.variant,
    year: listing.year,
    mileage: listing.mileage,
    asking_price: listing.askingPrice,
    fuel: listing.fuel,
    transmission: listing.transmission,
    power_hp: listing.powerHp,
    location: listing.location,
    seller_type: listing.sellerType,
    description: listing.description,
    image_urls: listing.imageUrls,
    first_seen_at: listing.firstSeenAt,
    listing_type: listing.listingType
  };
}

export async function ingestMarketListings(brand: string, model: string): Promise<IngestResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase client unavailable.");

  const connector = new AutoScout24Connector();
  const listings = await connector.fetchInventory({
    preferredBrands: [brand],
    preferredModels: [model],
    minYear: 2000,
    maxMileage: 500_000,
    minAskingPrice: null,
    maxAskingPrice: null,
    fuelTypes: [],
    transmissions: [],
    selectedSourceGroups: ["AutoScout24"]
  });

  if (listings.length === 0) {
    return { inserted: 0, updated: 0, skipped: 0 };
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  // Batch upsert — 20 rows per call
  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = listings.slice(i, i + BATCH_SIZE);
    const rows = batch.map(toRow);

    // Fetch existing external_ids in this batch to distinguish insert vs update
    const externalIds = batch.map((l) => l.externalId);
    const { data: existingRowsRaw } = await supabase
      .from("listings")
      .select("external_id")
      .eq("source", "AutoScout24")
      .in("external_id", externalIds);

    const existingRows = (existingRowsRaw ?? []) as { external_id: string }[];
    const existingSet = new Set(existingRows.map((r) => r.external_id));

    const { error } = await asUpsertTable(supabase.from("listings")).upsert(rows, {
      onConflict: "external_id,source"
    });

    if (error) {
      skipped += batch.length;
      continue;
    }

    for (const listing of batch) {
      if (existingSet.has(listing.externalId)) {
        updated++;
      } else {
        inserted++;
      }
    }
  }

  return { inserted, updated, skipped };
}
