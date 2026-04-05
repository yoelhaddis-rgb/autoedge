"use server";

import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDealerPreferences } from "@/lib/services/preferences";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { runMonitoringScan } from "@/lib/services/monitoring-runner";

export type { MonitoringScanResult } from "@/lib/services/monitoring-runner";

export type MonitoringScanState =
  | { success: true; result: import("@/lib/services/monitoring-runner").MonitoringScanResult }
  | { success: false; error: string }
  | null;

export async function runMonitoringScanAction(
  _prevState: MonitoringScanState, // eslint-disable-line @typescript-eslint/no-unused-vars
  _formData: FormData // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<MonitoringScanState> {
  const { dealerId, isDemo } = await getCurrentDealerContext();
  if (isDemo) return { success: false, error: "Not available in demo mode." };

  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Database unavailable." };

  const preferences = await getDealerPreferences(dealerId, supabase);
  if (!preferences.preferredBrands.length && !preferences.preferredModels.length) {
    return { success: false, error: "Set preferred brands and models in Settings first." };
  }

  try {
    const result = await runMonitoringScan(dealerId, preferences, supabase);
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Scan failed." };
  }
}
