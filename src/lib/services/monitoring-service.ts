import type { DealerPreference, Listing } from "@/types/domain";
import { sourceConnectorRegistry } from "@/lib/services/source-connectors";

export type MonitoringCandidate = {
  listing: Listing;
  trigger: string;
  priorityScore: number;
};

export type MonitoringSnapshot = {
  runAt: string;
  mode: DealerPreference["monitoringIntensity"];
  candidates: MonitoringCandidate[];
};

export interface MonitoringService {
  runSelectiveScan(preferences: DealerPreference): Promise<MonitoringSnapshot>;
}

function getIntensityLimit(intensity: DealerPreference["monitoringIntensity"]): number {
  switch (intensity) {
    case "low":
      return 20;
    case "high":
      return 100;
    case "balanced":
    default:
      return 50;
  }
}

function normalizePriceRange(minPrice: number | null, maxPrice: number | null): [number | null, number | null] {
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return [maxPrice, minPrice];
  }
  return [minPrice, maxPrice];
}

function matchesPriceRange(price: number, minPrice: number | null, maxPrice: number | null): boolean {
  if (minPrice !== null && price < minPrice) return false;
  if (maxPrice !== null && price > maxPrice) return false;
  return true;
}

export class SelectiveMonitoringService implements MonitoringService {
  async runSelectiveScan(preferences: DealerPreference): Promise<MonitoringSnapshot> {
    const [minPrice, maxPrice] = normalizePriceRange(preferences.minPrice, preferences.maxPrice);

    const rawListings = await sourceConnectorRegistry.pullTargetedInventory({
      preferredBrands: preferences.preferredBrands,
      preferredModels: preferences.preferredModels,
      minYear: preferences.minYear,
      maxMileage: preferences.maxMileage,
      minAskingPrice: minPrice,
      maxAskingPrice: maxPrice,
      fuelTypes: preferences.fuelTypes,
      transmissions: preferences.transmissions,
      selectedSourceGroups: preferences.selectedSourceGroups,
      limit: getIntensityLimit(preferences.monitoringIntensity)
    });

    const priceFilteredListings = rawListings.filter((listing) =>
      matchesPriceRange(listing.askingPrice, minPrice, maxPrice)
    );

    const candidates = priceFilteredListings.map((listing) => ({
      listing,
      trigger: "preference_match",
      priorityScore: 50
    }));

    return {
      runAt: new Date().toISOString(),
      mode: preferences.monitoringIntensity,
      candidates
    };
  }
}
