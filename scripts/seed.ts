import { createClient } from "@supabase/supabase-js";
import {
  mockComparables,
  mockDealerPreferences,
  mockDealStatuses,
  mockListings,
  mockValuations
} from "../src/lib/data/mock";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const DEMO_EMAIL = "demo@autoedge.app";
const DEMO_PASSWORD = "AutoEdgeDemo123!";

async function resetTables() {
  const tableOrder = [
    "deal_statuses",
    "comparables",
    "valuations",
    "listings",
    "dealer_preferences",
    "profiles"
  ] as const;

  for (const table of tableOrder) {
    const { error } = await supabase.from(table).delete().neq("id", "");
    if (error) {
      throw new Error(`Failed clearing table ${table}: ${error.message}`);
    }
  }
}

async function seed() {
  await resetTables();

  const usersPage = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (usersPage.error) {
    throw new Error(`Failed loading users: ${usersPage.error.message}`);
  }

  const existingDemoUser = usersPage.data.users.find((user) => user.email === DEMO_EMAIL);
  if (existingDemoUser) {
    const { error } = await supabase.auth.admin.updateUserById(existingDemoUser.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: "Demo Dealer",
        company_name: "AutoEdge Demo Garage"
      }
    });
    if (error) {
      throw new Error(`Failed updating demo auth user: ${error.message}`);
    }
  }

  const createdDemoUser = existingDemoUser
    ? null
    : await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: "Demo Dealer",
          company_name: "AutoEdge Demo Garage"
        }
      });

  if (createdDemoUser?.error) {
    throw new Error(`Failed creating demo auth user: ${createdDemoUser.error.message}`);
  }

  const dealerId = existingDemoUser?.id ?? createdDemoUser?.data.user?.id;

  if (!dealerId) {
    throw new Error("Unable to resolve dealer id for seed.");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: dealerId,
    full_name: "Demo Dealer",
    company_name: "AutoEdge Demo Garage",
    email: DEMO_EMAIL
  });

  if (profileError) {
    throw new Error(`Failed seeding profiles: ${profileError.message}`);
  }

  const { error: preferenceError } = await supabase.from("dealer_preferences").insert({
    dealer_id: dealerId,
    preferred_brands: mockDealerPreferences.preferredBrands,
    preferred_models: mockDealerPreferences.preferredModels,
    min_year: mockDealerPreferences.minYear,
    max_mileage: mockDealerPreferences.maxMileage,
    min_price: mockDealerPreferences.minPrice,
    max_price: mockDealerPreferences.maxPrice,
    min_expected_profit: mockDealerPreferences.minExpectedProfit,
    fuel_types: mockDealerPreferences.fuelTypes,
    transmissions: mockDealerPreferences.transmissions,
    monitoring_intensity: mockDealerPreferences.monitoringIntensity,
    selected_source_groups: mockDealerPreferences.selectedSourceGroups
  });

  if (preferenceError) {
    throw new Error(`Failed seeding preferences: ${preferenceError.message}`);
  }

  const { error: listingsError } = await supabase.from("listings").insert(
    mockListings.map((listing) => ({
      id: listing.id,
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
      first_seen_at: listing.firstSeenAt
    }))
  );

  if (listingsError) {
    throw new Error(`Failed seeding listings: ${listingsError.message}`);
  }

  const { error: valuationsError } = await supabase.from("valuations").insert(
    mockValuations.map((valuation) => ({
      listing_id: valuation.listingId,
      low_estimate: valuation.lowEstimate,
      median_estimate: valuation.medianEstimate,
      high_estimate: valuation.highEstimate,
      expected_costs: valuation.expectedCosts,
      expected_profit: valuation.expectedProfit,
      confidence_score: valuation.confidenceScore,
      deal_score: valuation.dealScore,
      reasons: valuation.reasons,
      risks: valuation.risks
    }))
  );

  if (valuationsError) {
    throw new Error(`Failed seeding valuations: ${valuationsError.message}`);
  }

  const { error: comparablesError } = await supabase.from("comparables").insert(
    mockComparables.map((item) => ({
      listing_id: item.listingId,
      comparable_title: item.comparableTitle,
      comparable_price: item.comparablePrice,
      comparable_year: item.comparableYear,
      comparable_mileage: item.comparableMileage,
      comparable_source: item.comparableSource,
      comparable_url: item.comparableUrl
    }))
  );

  if (comparablesError) {
    throw new Error(`Failed seeding comparables: ${comparablesError.message}`);
  }

  const { error: statusesError } = await supabase.from("deal_statuses").insert(
    mockDealStatuses.map((status) => ({
      dealer_id: dealerId,
      listing_id: status.listingId,
      status: status.status,
      note: status.note
    }))
  );

  if (statusesError) {
    throw new Error(`Failed seeding statuses: ${statusesError.message}`);
  }

  console.log(`Seed complete: ${mockListings.length} listings, ${mockValuations.length} valuations.`);
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
