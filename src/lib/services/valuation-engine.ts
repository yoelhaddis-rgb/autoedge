import type { Listing, Valuation } from "@/types/domain";
import { calculateProfit } from "@/lib/utils/deal";
import { dutchMarketBaselineEstimate } from "@/lib/utils/dutch-market-baseline";

/** Discriminates how the resale estimate was derived. */
export type ValuationSource = "comparable_based" | "model_based";

export type ComparableInput = {
  listing: Listing;
  referenceValue: number;
  strictMatch: boolean;
  similarityScore: number;
};

export type DealerCostOverrides = {
  /** Base reconditioning cost in EUR (engine default: 620). */
  reconCostBase?: number;
  /** Base daily holding cost in EUR (engine default: 12/day + 0.06% of price). */
  dailyHoldingCost?: number;
  /** Base risk buffer in EUR (engine default: 220). */
  riskBufferBase?: number;
};

export type ValuationCostBreakdownInput = {
  listing: Listing;
  estimatedResaleValue: number;
  lowEstimate: number;
  highEstimate: number;
  comparableCount: number;
  strictMatchCount: number;
  averageSimilarityScore?: number;
  targetExpectedCosts?: number;
  costOverrides?: DealerCostOverrides;
};

export type ValuationCostBreakdown = {
  estimatedResaleValue: number;
  acquisitionPrice: number;
  reconCosts: number;
  holdingCost: number;
  riskBuffer: number;
  expectedCosts: number;
  expectedProfit: number;
  projectedDaysToSell: number;
  spreadRatio: number;
  comparableCount: number;
  strictMatchCount: number;
};

export type ComputedValuation = {
  lowEstimate: number;
  medianEstimate: number;
  highEstimate: number;
  expectedCosts: number;
  expectedProfit: number;
  reconCosts: number;
  holdingCost: number;
  riskBuffer: number;
  projectedDaysToSell: number;
  estimatedResaleValue: number;
  acquisitionPrice: number;
  confidenceScore: number;
  dealScore: number;
  reasons: string[];
  risks: string[];
  selectedComparables: ComparableInput[];
  /** How the resale estimate was derived. "model_based" means no comparables
   *  were found; estimates come from the Dutch market heuristic baseline. */
  valuationSource: ValuationSource;
};

export type ValuationEngine = {
  estimate(listing: Listing, candidates: ComparableInput[], overrides?: DealerCostOverrides): Promise<ComputedValuation>;
};

type CostBuckets = {
  reconCosts: number;
  holdingCost: number;
  riskBuffer: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function percentile(values: number[], targetPercentile: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const index = (values.length - 1) * targetPercentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return values[lower];
  const ratio = index - lower;
  return Math.round(values[lower] + (values[upper] - values[lower]) * ratio);
}

function estimateReconCosts(listing: Listing, overrides?: DealerCostOverrides): number {
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - listing.year);
  const mileageOver = Math.max(0, listing.mileage - 80000);
  const mileageFactor = mileageOver / 10000;

  const fuelAdjustment =
    listing.fuel === "Diesel" ? 140 : listing.fuel === "Hybrid" ? 110 : listing.fuel === "Electric" ? 90 : 120;
  const transmissionAdjustment = listing.transmission === "Automatic" ? 100 : 70;
  const powerAdjustment = listing.powerHp >= 220 ? 160 : listing.powerHp >= 160 ? 90 : 0;

  const base = overrides?.reconCostBase ?? 620;
  const raw = base + ageYears * 95 + mileageFactor * 145 + fuelAdjustment + transmissionAdjustment + powerAdjustment;
  return clamp(Math.round(raw), 480, 7200);
}

function estimateProjectedDaysToSell(input: {
  listing: Listing;
  comparableCount: number;
  strictMatchCount: number;
  spreadRatio: number;
  askingVsMedianRatio: number;
  averageSimilarityScore?: number;
}): number {
  const { listing, comparableCount, strictMatchCount, spreadRatio, askingVsMedianRatio, averageSimilarityScore } =
    input;
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - listing.year);

  let projectedDays = 24;

  if (comparableCount < 4) projectedDays += 6;
  if (comparableCount < 2) projectedDays += 6;
  if (strictMatchCount <= 1) projectedDays += 5;

  if (listing.mileage >= 170000) projectedDays += 6;
  else if (listing.mileage >= 140000) projectedDays += 3;

  if (ageYears >= 11) projectedDays += 7;
  else if (ageYears >= 8) projectedDays += 4;

  if (spreadRatio > 0.2) projectedDays += 7;
  else if (spreadRatio > 0.14) projectedDays += 4;
  else if (spreadRatio < 0.08) projectedDays -= 3;

  if (askingVsMedianRatio >= 1.03) projectedDays += 4;
  else if (askingVsMedianRatio <= 0.94) projectedDays -= 3;

  if (typeof averageSimilarityScore === "number") {
    if (averageSimilarityScore <= 45) projectedDays -= 2;
    if (averageSimilarityScore >= 95) projectedDays += 3;
  }

  if (strictMatchCount >= 4 && comparableCount >= 6 && spreadRatio < 0.1) {
    projectedDays -= 4;
  }

  return clamp(Math.round(projectedDays), 10, 65);
}

function estimateHoldingCost(listing: Listing, projectedDaysToSell: number, overrides?: DealerCostOverrides): number {
  const dailyBase = overrides?.dailyHoldingCost ?? 12;
  const dailyCost = clamp(Math.round(dailyBase + listing.askingPrice * 0.0006), dailyBase, Math.max(dailyBase, 42));
  return clamp(Math.round(projectedDaysToSell * dailyCost), 180, 3600);
}

function estimateRiskBuffer(input: {
  listing: Listing;
  comparableCount: number;
  strictMatchCount: number;
  spreadRatio: number;
  projectedDaysToSell: number;
  overrides?: DealerCostOverrides;
}): number {
  const { listing, comparableCount, strictMatchCount, spreadRatio, projectedDaysToSell, overrides } = input;
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - listing.year);

  let riskBuffer = overrides?.riskBufferBase ?? 220;

  if (comparableCount < 4) riskBuffer += (4 - comparableCount) * 100;
  if (strictMatchCount < 2) riskBuffer += (2 - strictMatchCount) * 75;
  if (spreadRatio > 0.15) riskBuffer += Math.round((spreadRatio - 0.15) * 3800);
  if (listing.mileage >= 170000) riskBuffer += 260;
  else if (listing.mileage >= 140000) riskBuffer += 140;
  if (ageYears >= 11) riskBuffer += 220;
  else if (ageYears >= 8) riskBuffer += 120;
  if (projectedDaysToSell > 30) riskBuffer += Math.round((projectedDaysToSell - 30) * 9);

  return clamp(Math.round(riskBuffer), 120, 3200);
}

function normalizeCostBucketsToTarget(rawBuckets: CostBuckets, targetExpectedCosts: number): CostBuckets {
  const target = Math.max(0, Math.round(targetExpectedCosts));
  if (target === 0) {
    return { reconCosts: 0, holdingCost: 0, riskBuffer: 0 };
  }

  const rawSum = rawBuckets.reconCosts + rawBuckets.holdingCost + rawBuckets.riskBuffer;
  if (rawSum <= 0) {
    const reconCosts = Math.round(target * 0.45);
    const holdingCost = Math.round(target * 0.3);
    const riskBuffer = Math.max(0, target - reconCosts - holdingCost);
    return { reconCosts, holdingCost, riskBuffer };
  }

  const reconCosts = Math.max(0, Math.round((rawBuckets.reconCosts / rawSum) * target));
  const holdingCost = Math.max(0, Math.round((rawBuckets.holdingCost / rawSum) * target));
  const riskBuffer = Math.max(0, target - reconCosts - holdingCost);

  return { reconCosts, holdingCost, riskBuffer };
}

export function buildConfidenceScore(input: {
  comparableCount: number;
  strictMatchCount: number;
  spreadRatio: number;
  projectedDaysToSell: number;
}): number {
  const { comparableCount, strictMatchCount, spreadRatio, projectedDaysToSell } = input;
  const countScore = clamp(comparableCount * 8, 4, 40);
  const strictScore = clamp(strictMatchCount * 6, 0, 24);
  const spreadScore = clamp(34 - Math.round(spreadRatio * 120), 6, 34);
  const turnoverScore = clamp(20 - Math.round((projectedDaysToSell - 14) / 2), 3, 20);
  return clamp(countScore + strictScore + spreadScore + turnoverScore, 20, 96);
}

export function buildDealScore(breakdown: ValuationCostBreakdown, confidenceScore: number): number {
  const profitRatio = breakdown.expectedProfit / Math.max(1, breakdown.acquisitionPrice);
  const marginScore = clamp(Math.round(50 + profitRatio * 150), 0, 100);

  const turnoverAdjustment =
    breakdown.projectedDaysToSell > 42
      ? -14
      : breakdown.projectedDaysToSell > 32
        ? -7
        : breakdown.projectedDaysToSell <= 18
          ? 4
          : 0;

  const riskAdjustment = breakdown.riskBuffer >= 1200 ? -8 : breakdown.riskBuffer <= 380 ? 3 : 0;
  const negativeMarginPenalty = breakdown.expectedProfit < -500 ? -16 : breakdown.expectedProfit < 0 ? -6 : 0;

  return clamp(
    Math.round(marginScore * 0.65 + confidenceScore * 0.35 + turnoverAdjustment + riskAdjustment + negativeMarginPenalty),
    0,
    100
  );
}

function buildReasons(input: {
  listing: Listing;
  breakdown: ValuationCostBreakdown;
  confidenceScore: number;
  valuationSource: ValuationSource;
}): string[] {
  const { listing, breakdown, confidenceScore, valuationSource } = input;
  const reasons: string[] = [];
  const valueGap = breakdown.estimatedResaleValue - listing.askingPrice;

  if (valuationSource === "model_based") {
    // Be explicit that this is a heuristic estimate, not market-derived.
    reasons.push("resale estimate is model-based (heuristic) — no comparable listings found in the database");
  }

  if (valuationSource === "comparable_based" && valueGap >= 1200) {
    reasons.push("asking price sits below the comparable median resale estimate");
  }

  if (valuationSource === "comparable_based" && breakdown.comparableCount >= 2 && breakdown.spreadRatio <= 0.1) {
    reasons.push("tight comparable spread supports stronger resale confidence");
  }

  if (breakdown.strictMatchCount >= 3 && breakdown.comparableCount >= 6) {
    reasons.push("multiple close comparables strengthen the resale benchmark");
  }

  if (breakdown.projectedDaysToSell <= 24) {
    reasons.push("projected days-to-sell suggests lower holding exposure");
  }

  if (breakdown.expectedProfit >= 1500) {
    reasons.push("expected margin remains attractive after recon, holding and risk buffer");
  }

  if (valuationSource === "comparable_based" && confidenceScore >= 78) {
    reasons.push("comparable quality supports stronger confidence in resale pricing");
  }

  if (reasons.length === 0) {
    reasons.push("valuation built from available comparable inventory and risk-adjusted costs");
  }

  return reasons.slice(0, 4);
}

function buildRisks(input: {
  listing: Listing;
  breakdown: ValuationCostBreakdown;
  valuationSource: ValuationSource;
}): string[] {
  const { listing, breakdown, valuationSource } = input;
  const risks: string[] = [];
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - listing.year);

  if (valuationSource === "model_based") {
    // The strongest risk on this path: there is no market evidence backing the estimate.
    risks.push("no comparable listings found — estimate is heuristic-only; verify against live market prices before deciding");
  }

  if (breakdown.projectedDaysToSell > 30) {
    risks.push("holding cost risk increases if expected time-to-sell exceeds 30 days");
  }

  // Only emit the generic comparable-coverage risk when some (but few) comparables exist.
  if (valuationSource === "comparable_based" && breakdown.comparableCount < 4) {
    risks.push("limited comparable coverage increases pricing uncertainty");
  }

  if (listing.mileage >= 150000) {
    risks.push("high mileage may slow retail turnover");
  }

  if (ageYears >= 10) {
    risks.push("older model year can require heavier discounting to close");
  }

  if (breakdown.spreadRatio > 0.2) {
    risks.push("wide valuation spread signals uncertain resale positioning");
  }

  if (breakdown.riskBuffer >= 900) {
    risks.push("elevated risk buffer reduces margin headroom");
  }

  if (breakdown.expectedProfit <= 0) {
    risks.push("estimated profit is negative after full cost buckets");
  }

  if (risks.length === 0) {
    risks.push("no major structural risks detected in the current model");
  }

  return risks.slice(0, 4);
}

export function buildValuationCostBreakdown(input: ValuationCostBreakdownInput): ValuationCostBreakdown {
  const estimatedResaleValue = Math.max(1000, Math.round(input.estimatedResaleValue));
  const acquisitionPrice = Math.max(500, Math.round(input.listing.askingPrice));
  const spreadRatio = (Math.max(input.highEstimate, input.lowEstimate) - Math.min(input.highEstimate, input.lowEstimate)) / Math.max(1, estimatedResaleValue);
  const askingVsMedianRatio = acquisitionPrice / Math.max(1, estimatedResaleValue);

  const projectedDaysToSell = estimateProjectedDaysToSell({
    listing: input.listing,
    comparableCount: input.comparableCount,
    strictMatchCount: input.strictMatchCount,
    spreadRatio,
    askingVsMedianRatio,
    averageSimilarityScore: input.averageSimilarityScore
  });

  const rawBuckets: CostBuckets = {
    reconCosts: estimateReconCosts(input.listing, input.costOverrides),
    holdingCost: estimateHoldingCost(input.listing, projectedDaysToSell, input.costOverrides),
    riskBuffer: estimateRiskBuffer({
      listing: input.listing,
      comparableCount: input.comparableCount,
      strictMatchCount: input.strictMatchCount,
      spreadRatio,
      projectedDaysToSell,
      overrides: input.costOverrides
    })
  };

  const normalizedBuckets =
    typeof input.targetExpectedCosts === "number"
      ? normalizeCostBucketsToTarget(rawBuckets, input.targetExpectedCosts)
      : rawBuckets;

  const expectedCosts = normalizedBuckets.reconCosts + normalizedBuckets.holdingCost + normalizedBuckets.riskBuffer;
  const expectedProfit = calculateProfit(estimatedResaleValue, acquisitionPrice, expectedCosts);

  return {
    estimatedResaleValue,
    acquisitionPrice,
    reconCosts: normalizedBuckets.reconCosts,
    holdingCost: normalizedBuckets.holdingCost,
    riskBuffer: normalizedBuckets.riskBuffer,
    expectedCosts,
    expectedProfit,
    projectedDaysToSell,
    spreadRatio,
    comparableCount: input.comparableCount,
    strictMatchCount: input.strictMatchCount
  };
}

export class ComparableInventoryValuationEngine implements ValuationEngine {
  async estimate(listing: Listing, candidates: ComparableInput[], overrides?: DealerCostOverrides): Promise<ComputedValuation> {
    const selectedComparables = [...candidates]
      .sort((a, b) => a.similarityScore - b.similarityScore)
      .slice(0, 8);

    const comparableValues = selectedComparables
      .map((item) => item.referenceValue)
      .sort((a, b) => a - b);

    const valuationSource: ValuationSource =
      selectedComparables.length > 0 ? "comparable_based" : "model_based";

    let medianEstimate: number;
    let lowEstimate: number;
    let highEstimate: number;

    if (valuationSource === "comparable_based") {
      medianEstimate = percentile(comparableValues, 0.5);
      lowEstimate    = percentile(comparableValues, 0.25);
      highEstimate   = percentile(comparableValues, 0.75);
    } else {
      // No comparables in DB — fall back to the Dutch market heuristic baseline.
      // See src/lib/utils/dutch-market-baseline.ts for documented assumptions.
      const baseline = dutchMarketBaselineEstimate(
        listing.askingPrice,
        listing.year,
        listing.mileage,
        listing.fuel
      );
      medianEstimate = baseline.medianEstimate;
      lowEstimate    = baseline.lowEstimate;
      highEstimate   = baseline.highEstimate;
    }

    const strictMatchCount = selectedComparables.filter((item) => item.strictMatch).length;
    const comparableCount = selectedComparables.length;
    const averageSimilarityScore =
      comparableCount > 0
        ? selectedComparables.reduce((sum, item) => sum + item.similarityScore, 0) / comparableCount
        : undefined;

    const breakdown = buildValuationCostBreakdown({
      listing,
      estimatedResaleValue: medianEstimate,
      lowEstimate,
      highEstimate,
      comparableCount,
      strictMatchCount,
      averageSimilarityScore,
      costOverrides: overrides
    });

    const confidenceScore = buildConfidenceScore({
      comparableCount,
      strictMatchCount,
      spreadRatio: breakdown.spreadRatio,
      projectedDaysToSell: breakdown.projectedDaysToSell
    });

    const dealScore = buildDealScore(breakdown, confidenceScore);

    return {
      lowEstimate,
      medianEstimate,
      highEstimate,
      expectedCosts: breakdown.expectedCosts,
      expectedProfit: breakdown.expectedProfit,
      reconCosts: breakdown.reconCosts,
      holdingCost: breakdown.holdingCost,
      riskBuffer: breakdown.riskBuffer,
      projectedDaysToSell: breakdown.projectedDaysToSell,
      estimatedResaleValue: breakdown.estimatedResaleValue,
      acquisitionPrice: breakdown.acquisitionPrice,
      confidenceScore,
      dealScore,
      reasons: buildReasons({ listing, breakdown, confidenceScore, valuationSource }),
      risks: buildRisks({ listing, breakdown, valuationSource }),
      selectedComparables,
      valuationSource
    };
  }
}

export class SeedValuationEngine {
  async estimateFallback(listing: Listing): Promise<Valuation> {
    // Uses the same heuristic baseline as the main engine's zero-comparable path.
    const baseline = dutchMarketBaselineEstimate(
      listing.askingPrice,
      listing.year,
      listing.mileage,
      listing.fuel
    );

    const breakdown = buildValuationCostBreakdown({
      listing,
      estimatedResaleValue: baseline.medianEstimate,
      lowEstimate: baseline.lowEstimate,
      highEstimate: baseline.highEstimate,
      comparableCount: 0,
      strictMatchCount: 0
    });

    return {
      id: `generated-${listing.id}`,
      listingId: listing.id,
      lowEstimate: baseline.lowEstimate,
      medianEstimate: baseline.medianEstimate,
      highEstimate: baseline.highEstimate,
      expectedCosts: breakdown.expectedCosts,
      expectedProfit: breakdown.expectedProfit,
      confidenceScore: breakdown.comparableCount === 0 ? 22 : 58,
      dealScore: 0,
      reasons: ["resale estimate is model-based (heuristic) — no comparable listings found in the database"],
      risks: ["no comparable listings found — estimate is heuristic-only; verify against live market prices before deciding"],
      createdAt: new Date().toISOString(),
      valuationSource: "model_based" as const
    };
  }
}
