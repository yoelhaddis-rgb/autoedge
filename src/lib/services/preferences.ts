import { createClient as createServerClient } from "@/lib/supabase/server";
import { DEMO_DEALER_ID, mockDealerPreferences } from "@/lib/data/mock";
import { mapPreferenceRow } from "@/lib/data/mappers";
import { asUpsertTable } from "@/lib/supabase/untyped";
import { ensureDealerProfileExists } from "@/lib/services/dealer-profile";
import type { DealerPreference } from "@/types/domain";

function buildDefaultPreferences(dealerId: string): DealerPreference {
  const now = new Date().toISOString();
  return {
    ...mockDealerPreferences,
    id: `default-${dealerId}`,
    dealerId,
    createdAt: now,
    updatedAt: now
  };
}

export async function getDealerPreferences(
  dealerId: string = DEMO_DEALER_ID
): Promise<DealerPreference> {
  const supabase = await createServerClient();
  if (!supabase) return mockDealerPreferences;

  const { data, error } = await supabase
    .from("dealer_preferences")
    .select("*")
    .eq("dealer_id", dealerId)
    .single();

  if (error || !data) {
    if (error) {
      console.error("AutoEdge: failed to load dealer preferences", {
        dealerId,
        error: error.message
      });
    }
    return buildDefaultPreferences(dealerId);
  }
  return mapPreferenceRow(data);
}

export async function upsertDealerPreferences(preferences: DealerPreference): Promise<void> {
  const supabase = await createServerClient();
  if (!supabase) return;

  await ensureDealerProfileExists(supabase, preferences.dealerId);

  await asUpsertTable(supabase.from("dealer_preferences")).upsert(
    {
      dealer_id: preferences.dealerId,
      preferred_brands: preferences.preferredBrands,
      preferred_models: preferences.preferredModels,
      min_year: preferences.minYear,
      max_mileage: preferences.maxMileage,
      min_price: preferences.minPrice,
      max_price: preferences.maxPrice,
      min_expected_profit: preferences.minExpectedProfit,
      fuel_types: preferences.fuelTypes,
      transmissions: preferences.transmissions,
      monitoring_intensity: preferences.monitoringIntensity,
      selected_source_groups: preferences.selectedSourceGroups,
      recon_cost_base_override: preferences.reconCostBaseOverride,
      daily_holding_cost_override: preferences.dailyHoldingCostOverride,
      risk_buffer_base_override: preferences.riskBufferBaseOverride,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "dealer_id"
    }
  );
}
