"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { analyzeVehicle } from "@/lib/services/analysis-service";
import type { FuelType, TransmissionType } from "@/types/domain";

export type AnalyzeVehicleActionState = { error: string } | null;

function getString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getNumber(formData: FormData, key: string): number {
  const value = Number(formData.get(key));
  return Number.isNaN(value) ? 0 : value;
}

function getOptionalNumber(formData: FormData, key: string): number | undefined {
  const rawValue = formData.get(key);
  if (rawValue === null) return undefined;

  const value = String(rawValue).trim();
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseFuel(value: string): FuelType {
  const allowed: FuelType[] = ["Diesel", "Petrol", "Hybrid", "Electric"];
  return allowed.includes(value as FuelType) ? (value as FuelType) : "Petrol";
}

function parseTransmission(value: string): TransmissionType {
  const allowed: TransmissionType[] = ["Manual", "Automatic"];
  return allowed.includes(value as TransmissionType) ? (value as TransmissionType) : "Manual";
}

function isRedirectErrorLike(error: unknown): error is { digest: string } {
  if (!error || typeof error !== "object") {
    return false;
  }

  const digest = Reflect.get(error, "digest");
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

// prevState is required by useActionState but unused here.
export async function analyzeVehicleAction(
  _prevState: AnalyzeVehicleActionState,
  formData: FormData
): Promise<AnalyzeVehicleActionState> {
  const context = await getCurrentDealerContext();

  try {
    const result = await analyzeVehicle(context.dealerId, {
      brand: getString(formData, "brand"),
      model: getString(formData, "model"),
      variant: getString(formData, "variant"),
      year: getNumber(formData, "year"),
      mileage: getNumber(formData, "mileage"),
      askingPrice: getNumber(formData, "askingPrice"),
      powerHp: getOptionalNumber(formData, "powerHp"),
      fuel: parseFuel(getString(formData, "fuel")),
      transmission: parseTransmission(getString(formData, "transmission")),
      location: getString(formData, "location"),
      sourceUrl: getString(formData, "sourceUrl"),
      imageUrl: getString(formData, "imageUrl"),
      notes: getString(formData, "notes")
    });

    revalidatePath("/dashboard");
    revalidatePath("/deals");
    revalidatePath("/saved");
    revalidatePath(`/deals/${result.listingId}`);

    redirect(`/deals/${result.listingId}?created=1`);
  } catch (error) {
    if (isRedirectErrorLike(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Vehicle analysis failed.";
    return { error: message };
  }
}
