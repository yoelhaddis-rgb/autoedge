/**
 * Dutch Market Baseline Heuristic
 *
 * Produces a resale estimate when no comparable listings exist in the database.
 *
 * IMPORTANT: This is a transparent, rule-based heuristic — NOT a licensed
 * valuation source (Schwacke, Eurotax, RDW, AutoTelex, etc.). All factors
 * are documented assumptions based on publicly observable Dutch used-car
 * market behaviour. Treat the output as an orientation range, not a
 * market-verified valuation.
 *
 * The model multiplies the asking price by three independent factors:
 *   median = round(askingPrice × fuelFactor × ageFactor × mileageFactor)
 *   low    = round(median × (1 - spreadHalfWidth))
 *   high   = round(median × (1 + spreadHalfWidth))
 */

import type { FuelType } from "@/types/domain";

export type BaselineEstimate = {
  medianEstimate: number;
  lowEstimate: number;
  highEstimate: number;
  /** Fractional half-width of the uncertainty range, e.g. 0.10 means ±10%. */
  spreadHalfWidth: number;
};

/**
 * Fuel segment demand factor.
 *
 * Assumption (NL market, 2024–2025, not licensed):
 * - Electric:  0.94 — EV depreciation accelerated; asking prices frequently sit
 *                      above actual resale due to rapid residual-value decline.
 * - Diesel:    0.99 — Mild downward pressure from urban emission zone expansion
 *                      in Amsterdam, Utrecht, Rotterdam, and planned expansions.
 * - Hybrid:    1.00 — Neutral; stable demand, no major regulatory headwinds.
 * - Petrol:    1.01 — Most liquid mainstream segment; buyer pool widest.
 */
function fuelSegmentFactor(fuel: FuelType): number {
  switch (fuel) {
    case "Electric": return 0.94;
    case "Diesel":   return 0.99;
    case "Hybrid":   return 1.00;
    case "Petrol":   return 1.01;
  }
}

/**
 * Age-based asking-price credibility factor.
 *
 * Assumption: Dutch sellers price newer vehicles close to market; asking prices
 * on older vehicles (Marktplaats, local dealers) tend to be optimistic relative
 * to what a trade buyer can resell for. This factor nudges the asking price
 * toward a more realistic resale level.
 *
 * Breakpoints (age in years):
 *   ≤ 3   → 1.03  (dealer still earns a margin; market accepts slight premium)
 *   ≤ 6   → 1.01  (sweet spot; pricing close to market)
 *   ≤ 10  → 0.98  (some optimistic pricing; light downward adjustment)
 *   ≤ 15  → 0.94  (sellers frequently overestimate; moderate discount expected)
 *   > 15  → 0.90  (high variance; discount commonly required to move stock)
 */
function ageCredibilityFactor(ageYears: number): number {
  if (ageYears <= 3)  return 1.03;
  if (ageYears <= 6)  return 1.01;
  if (ageYears <= 10) return 0.98;
  if (ageYears <= 15) return 0.94;
  return 0.90;
}

/**
 * Mileage adjustment factor.
 *
 * Assumption: Average Dutch annual mileage is approximately 15,000 km.
 * Vehicles at or below 120k km are treated as neutral. Above-average mileage
 * reduces realistic resale value relative to what sellers typically ask.
 *
 * Breakpoints (total mileage):
 *   ≤ 120,000 km → 1.00  (at or below average; no adjustment)
 *   ≤ 160,000 km → 0.98  (moderately above average; minor reduction)
 *   ≤ 200,000 km → 0.95  (high mileage; buyer hesitation typical)
 *   > 200,000 km → 0.91  (very high mileage; discount commonly required)
 */
function mileageAdjustmentFactor(mileage: number): number {
  if (mileage <= 120000) return 1.00;
  if (mileage <= 160000) return 0.98;
  if (mileage <= 200000) return 0.95;
  return 0.91;
}

/**
 * Uncertainty spread (half-width of the estimate range).
 *
 * Because no comparable listings are available, the range must be honestly
 * wider than a comparable-derived estimate. The base spread is ±8%, growing
 * with vehicle age, high mileage, and EV price volatility.
 *
 * Contributions:
 *   Base:             ±8%
 *   Age ≥ 10 years:   +3%  (older cars: high price variance)
 *   Age ≥ 7 years:    +1.5% (moderate age uncertainty)
 *   Mileage ≥ 150k:   +3%  (high mileage: retail outcome uncertain)
 *   Mileage ≥ 120k:   +1.5% (above-average mileage)
 *   Electric fuel:    +4%  (EV residuals volatile; buyer pool narrower)
 *
 * Clamped to [0.08, 0.22].
 */
function uncertaintySpread(ageYears: number, mileage: number, fuel: FuelType): number {
  let spread = 0.08;

  if (ageYears >= 10)      spread += 0.03;
  else if (ageYears >= 7)  spread += 0.015;

  if (mileage >= 150000)      spread += 0.03;
  else if (mileage >= 120000) spread += 0.015;

  if (fuel === "Electric") spread += 0.04;

  return Math.min(0.22, Math.max(0.08, spread));
}

/**
 * Compute a heuristic baseline resale estimate for a Dutch market vehicle.
 *
 * Returns low/median/high estimates and the spread half-width used.
 * All values are in EUR, rounded to the nearest integer.
 */
export function dutchMarketBaselineEstimate(
  askingPrice: number,
  year: number,
  mileage: number,
  fuel: FuelType
): BaselineEstimate {
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - year);

  const medianEstimate = Math.round(
    askingPrice *
    fuelSegmentFactor(fuel) *
    ageCredibilityFactor(ageYears) *
    mileageAdjustmentFactor(mileage)
  );

  const spreadHalfWidth = uncertaintySpread(ageYears, mileage, fuel);

  return {
    medianEstimate,
    lowEstimate:  Math.round(medianEstimate * (1 - spreadHalfWidth)),
    highEstimate: Math.round(medianEstimate * (1 + spreadHalfWidth)),
    spreadHalfWidth
  };
}
