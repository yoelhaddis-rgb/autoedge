import { SelectiveMonitoringService } from "@/lib/services/monitoring-service";
import { analyzeVehicle, type AnalyzeVehicleInput } from "@/lib/services/analysis-service";
import type { MonitoringCandidate } from "@/lib/services/monitoring-service";
import type { DealerPreference } from "@/types/domain";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type MonitoringScanResult = {
  total: number;
  analyzed: number;
  skipped: number;
  errors: number;
  overCap: number;
};

const MAX_NEW_PER_SCAN = 15;

function getIntensityLimit(intensity: string): number {
  if (intensity === "low") return 20;
  if (intensity === "high") return 100;
  return 50;
}

function candidateToInput(candidate: MonitoringCandidate): AnalyzeVehicleInput {
  const l = candidate.listing;
  return {
    brand: l.brand,
    model: l.model,
    variant: l.variant,
    year: l.year,
    mileage: l.mileage,
    askingPrice: l.askingPrice,
    fuel: l.fuel,
    transmission: l.transmission,
    location: l.location,
    sourceUrl: l.sourceUrl,
    imageUrl: l.imageUrls[0] ?? undefined,
    notes: "Auto-discovered via monitoring scan."
  };
}

export async function runMonitoringScan(
  dealerId: string,
  preferences: DealerPreference,
  supabase: SupabaseClient<Database>
): Promise<MonitoringScanResult> {
  const service = new SelectiveMonitoringService();
  let snapshot;
  try {
    snapshot = await service.runSelectiveScan(preferences);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Scan failed.");
  }

  const intensityLimit = getIntensityLimit(preferences.monitoringIntensity);
  const candidates = snapshot.candidates.slice(0, intensityLimit);
  const total = candidates.length;

  let analyzed = 0, skipped = 0, errors = 0, overCap = 0, newCount = 0;

  for (const candidate of candidates) {
    if (newCount >= MAX_NEW_PER_SCAN) {
      overCap++;
      continue;
    }

    const { data: existingDeal } = await supabase
      .from("listings")
      .select("id")
      .eq("source_url", candidate.listing.sourceUrl)
      .eq("listing_type", "deal")
      .maybeSingle();
    if (existingDeal) { skipped++; continue; }

    const { count: mdCount } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("brand", candidate.listing.brand)
      .eq("model", candidate.listing.model)
      .eq("listing_type", "market_data");
    if ((mdCount ?? 0) === 0) { skipped++; continue; }

    try {
      await analyzeVehicle(dealerId, candidateToInput(candidate), supabase);
      analyzed++;
      newCount++;
    } catch {
      errors++;
    }
  }

  supabase
    .from("dealer_preferences")
    .update({
      last_scan_at: new Date().toISOString(),
      last_scan_analyzed: analyzed
    })
    .eq("dealer_id", dealerId)
    .then(({ error }) => {
      if (error) console.error("AutoEdge: failed to persist scan metadata", error.message);
    });

  return { total, analyzed, skipped, errors, overCap };
}
