"use server";

import { revalidatePath } from "next/cache";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDealerPreferences, upsertDealerPreferences } from "@/lib/services/preferences";
import type { MonitoringIntensity } from "@/types/domain";

function parseNumber(
  value: FormDataEntryValue | null,
  fallback: number,
  constraints?: { min?: number; max?: number }
): number {
  if (value === null) return fallback;

  const raw = String(value).trim();
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;

  const min = constraints?.min;
  const max = constraints?.max;

  if (typeof min === "number" && parsed < min) return min;
  if (typeof max === "number" && parsed > max) return max;
  return parsed;
}

function parseOptionalNumber(
  value: FormDataEntryValue | null,
  constraints?: { min?: number; max?: number }
): number | null {
  if (value === null) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;

  const min = constraints?.min;
  const max = constraints?.max;

  if (typeof min === "number" && parsed < min) return min;
  if (typeof max === "number" && parsed > max) return max;
  return parsed;
}

function normalizePriceRange(minPrice: number | null, maxPrice: number | null): [number | null, number | null] {
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return [maxPrice, minPrice];
  }
  return [minPrice, maxPrice];
}

function parseMultiValue(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMonitoringIntensity(value: FormDataEntryValue | null, fallback: MonitoringIntensity): MonitoringIntensity {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "low" || normalized === "balanced" || normalized === "high") {
    return normalized;
  }
  return fallback;
}

export async function updatePreferencesAction(formData: FormData) {
  const context = await getCurrentDealerContext();
  const current = await getDealerPreferences(context.dealerId);
  const currentYear = new Date().getFullYear();
  const parsedMinPrice = parseOptionalNumber(formData.get("minPrice"), { min: 0, max: 500000 });
  const parsedMaxPrice = parseOptionalNumber(formData.get("maxPrice"), { min: 0, max: 500000 });
  const [minPrice, maxPrice] = normalizePriceRange(parsedMinPrice, parsedMaxPrice);

  const next = {
    ...current,
    dealerId: context.dealerId,
    preferredBrands: parseMultiValue(formData.get("preferredBrands")),
    preferredModels: parseMultiValue(formData.get("preferredModels")),
    minYear: parseNumber(formData.get("minYear"), current.minYear, { min: 1995, max: currentYear + 1 }),
    maxMileage: parseNumber(formData.get("maxMileage"), current.maxMileage, { min: 0, max: 450000 }),
    minPrice,
    maxPrice,
    minExpectedProfit: parseNumber(formData.get("minExpectedProfit"), current.minExpectedProfit, { min: 0, max: 200000 }),
    fuelTypes: parseMultiValue(formData.get("fuelTypes")) as typeof current.fuelTypes,
    transmissions: parseMultiValue(formData.get("transmissions")) as typeof current.transmissions,
    monitoringIntensity: parseMonitoringIntensity(formData.get("monitoringIntensity"), current.monitoringIntensity),
    selectedSourceGroups: parseMultiValue(formData.get("selectedSourceGroups")),
    reconCostBaseOverride: parseOptionalNumber(formData.get("reconCostBaseOverride"), { min: 0, max: 10000 }),
    dailyHoldingCostOverride: parseOptionalNumber(formData.get("dailyHoldingCostOverride"), { min: 0, max: 500 }),
    riskBufferBaseOverride: parseOptionalNumber(formData.get("riskBufferBaseOverride"), { min: 0, max: 10000 }),
    updatedAt: new Date().toISOString()
  };

  await upsertDealerPreferences(next);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
