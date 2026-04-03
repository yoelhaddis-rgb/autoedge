/**
 * One-off ingestion test: Volkswagen Golf via AutoScout24 NL
 *
 * Run:
 *   npx tsx --env-file .env.local scripts/ingest-golf.ts
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { AutoScout24Connector } from "../src/lib/services/connectors/autoscout24-connector";
import type { Listing } from "../src/types/domain";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// ── 1. Fetch ──────────────────────────────────────────────────────────────────

console.log("⏳  Fetching Volkswagen Golf listings from AutoScout24 NL (up to 3 pages)…\n");

const connector = new AutoScout24Connector();
let listings: Listing[];
try {
  listings = await connector.fetchInventory({
    preferredBrands: ["Volkswagen"],
    preferredModels: ["Golf"],
    minYear: 2000,
    maxMileage: 500_000,
    minAskingPrice: null,
    maxAskingPrice: null,
    fuelTypes: [],
    transmissions: [],
    selectedSourceGroups: ["AutoScout24"]
  });
} catch (err) {
  console.error("❌  Fetch failed:", err);
  process.exit(1);
}

console.log(`✅  Fetched ${listings.length} listings after field validation.\n`);

if (listings.length === 0) {
  console.error(
    "❌  Zero listings returned. Likely causes:\n" +
    "    • AutoScout24 changed __NEXT_DATA__ structure\n" +
    "    • Rate-limited / blocked\n" +
    "    • Brand/model slug mismatch (expected: volkswagen/golf)"
  );
  process.exit(1);
}

// ── 2. Sample ─────────────────────────────────────────────────────────────────

console.log("── Sample (first 3 listings) ───────────────────────────────────────────────");
for (const l of listings.slice(0, 3)) {
  console.log(
    `  ${l.year} ${l.brand} ${l.model} ${l.variant}`.padEnd(45),
    `€${l.askingPrice.toLocaleString("nl-NL")}`.padStart(10),
    ` | ${l.fuel} / ${l.transmission}`.padEnd(22),
    `| ${l.mileage.toLocaleString("nl-NL")} km`.padStart(12),
    `| ${l.location}`
  );
}
console.log();

// ── 3. Upsert ─────────────────────────────────────────────────────────────────

console.log("⏳  Upserting to Supabase listings table…");

const BATCH = 20;
let inserted = 0;
let updated = 0;
let skipped = 0;

for (let i = 0; i < listings.length; i += BATCH) {
  const batch = listings.slice(i, i + BATCH);

  // Check which external_ids already exist
  const externalIds = batch.map((l) => l.externalId);
  const { data: existing } = await supabase
    .from("listings")
    .select("external_id")
    .eq("source", "AutoScout24")
    .in("external_id", externalIds);

  const existingSet = new Set(((existing ?? []) as { external_id: string }[]).map((r) => r.external_id));

  const rows = batch.map((l) => ({
    source: l.source,
    external_id: l.externalId,
    source_url: l.sourceUrl,
    title: l.title,
    brand: l.brand,
    model: l.model,
    variant: l.variant,
    year: l.year,
    mileage: l.mileage,
    asking_price: l.askingPrice,
    fuel: l.fuel,
    transmission: l.transmission,
    power_hp: l.powerHp,
    location: l.location,
    seller_type: l.sellerType,
    description: l.description,
    image_urls: l.imageUrls,
    first_seen_at: l.firstSeenAt,
    listing_type: l.listingType
  }));

  const { error } = await supabase
    .from("listings")
    .upsert(rows, { onConflict: "external_id,source" });

  if (error) {
    console.error(`  ⚠️  Batch ${Math.floor(i / BATCH) + 1} upsert error:`, error.message);
    skipped += batch.length;
    continue;
  }

  for (const l of batch) {
    if (existingSet.has(l.externalId)) updated++;
    else inserted++;
  }
}

console.log(`✅  Upsert complete: ${inserted} inserted, ${updated} updated, ${skipped} skipped.\n`);

// ── 4. Verify in DB ───────────────────────────────────────────────────────────

const { data: dbRows, error: verifyError } = await supabase
  .from("listings")
  .select("id, brand, model, year, mileage, asking_price, fuel, transmission, listing_type")
  .eq("source", "AutoScout24")
  .eq("brand", "Volkswagen")
  .eq("model", "Golf")
  .order("asking_price", { ascending: true })
  .limit(5);

if (verifyError) {
  console.error("❌  Verification query failed:", verifyError.message);
  process.exit(1);
}

const rows = (dbRows ?? []) as {
  id: string; brand: string; model: string; year: number;
  mileage: number; asking_price: number; fuel: string;
  transmission: string; listing_type: string;
}[];

console.log(`── Supabase verification (cheapest 5 VW Golf market_data rows) ──────────────`);
if (rows.length === 0) {
  console.error("❌  No rows found in DB. Upsert may have silently failed.");
} else {
  for (const r of rows) {
    console.log(
      `  ${r.year} ${r.brand} ${r.model}`.padEnd(25),
      `€${r.asking_price.toLocaleString("nl-NL")}`.padStart(10),
      ` | ${r.fuel}/${r.transmission}`.padEnd(20),
      `| ${r.mileage.toLocaleString("nl-NL")} km`.padStart(12),
      `| type=${r.listing_type}`
    );
  }
  console.log();
  const allMarketData = rows.every((r) => r.listing_type === "market_data");
  if (allMarketData) {
    console.log("✅  All rows have listing_type = 'market_data'");
  } else {
    console.error("❌  Some rows have wrong listing_type — check mapping.");
  }
}

// ── 5. Total count ────────────────────────────────────────────────────────────

const { count } = await supabase
  .from("listings")
  .select("id", { count: "exact", head: true })
  .eq("source", "AutoScout24");

console.log(`\n📊  Total AutoScout24 rows in DB: ${count ?? 0}`);
console.log(`\n── Next step ───────────────────────────────────────────────────────────────`);
console.log(`   Go to /deals/analyze and submit:`);
console.log(`     Brand: Volkswagen`);
console.log(`     Model: Golf`);
console.log(`     Year: 2020, Mileage: 80000, Price: €17500`);
console.log(`     Fuel: Petrol, Transmission: Manual`);
console.log(`   Expected: valuation_source = comparable_based, comparableCount >= 5`);
