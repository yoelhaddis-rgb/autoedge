export type DealLifecycleStatus = "new" | "saved" | "ignored" | "contacted" | "bought";

export type FuelType = "Diesel" | "Petrol" | "Hybrid" | "Electric";
export type TransmissionType = "Manual" | "Automatic";
export type MonitoringIntensity = "low" | "balanced" | "high";

export interface DealerProfile {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  createdAt: string;
}

export interface DealerPreference {
  id: string;
  dealerId: string;
  preferredBrands: string[];
  preferredModels: string[];
  minYear: number;
  maxMileage: number;
  minPrice: number | null;
  maxPrice: number | null;
  minExpectedProfit: number;
  fuelTypes: FuelType[];
  transmissions: TransmissionType[];
  monitoringIntensity: MonitoringIntensity;
  selectedSourceGroups: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  source: string;
  externalId: string;
  sourceUrl: string;
  title: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  mileage: number;
  askingPrice: number;
  fuel: FuelType;
  transmission: TransmissionType;
  powerHp: number;
  location: string;
  sellerType: string;
  description: string;
  imageUrls: string[];
  firstSeenAt: string;
  createdAt: string;
}

export interface Valuation {
  id: string;
  listingId: string;
  lowEstimate: number;
  medianEstimate: number;
  highEstimate: number;
  expectedCosts: number;
  expectedProfit: number;
  confidenceScore: number;
  dealScore: number;
  reasons: string[];
  risks: string[];
  createdAt: string;
  /**
   * How the resale estimate was derived.
   * "comparable_based" — derived from real listings in the database.
   * "model_based"      — no comparables found; uses the Dutch market heuristic baseline.
   * Absent on valuations created before this field was introduced.
   */
  valuationSource?: "comparable_based" | "model_based";
}

export interface Comparable {
  id: string;
  listingId: string;
  comparableTitle: string;
  comparablePrice: number;
  comparableYear: number;
  comparableMileage: number;
  comparableSource: string;
  comparableUrl: string;
}

export interface DealStatus {
  id: string;
  dealerId: string;
  listingId: string;
  status: DealLifecycleStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealOverview {
  listing: Listing;
  valuation: Valuation;
  status: DealLifecycleStatus;
  note: string;
  freshnessHours: number;
  scoreLabel: string;
}

export interface DealDetail extends DealOverview {
  comparables: Comparable[];
}
