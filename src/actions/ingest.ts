"use server";

import { getCurrentDealerContext } from "@/lib/services/auth";
import { ingestMarketListings, type IngestResult } from "@/lib/services/market-ingest";

export type IngestActionState =
  | { success: true; result: IngestResult }
  | { success: false; error: string }
  | null;

export async function ingestListingsAction(
  _prevState: IngestActionState,
  formData: FormData
): Promise<IngestActionState> {
  const { isDemo } = await getCurrentDealerContext();
  if (isDemo) {
    return { success: false, error: "Market ingestion is not available in demo mode." };
  }

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();

  if (!brand || !model) {
    return { success: false, error: "Brand and model are required." };
  }

  try {
    const result = await ingestMarketListings(brand, model);
    return { success: true, result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingestion failed.";
    return { success: false, error: message };
  }
}
