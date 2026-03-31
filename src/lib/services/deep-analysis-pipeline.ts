import type { DealOverview } from "@/types/domain";

export type AnalysisPipelineResult = {
  dealId: string;
  enrichedReasons: string[];
  enrichedRisks: string[];
  confidenceAdjustment: number;
};

export interface DeepAnalysisPipeline {
  run(deal: DealOverview): Promise<AnalysisPipelineResult>;
}

export class PlaceholderDeepAnalysisPipeline implements DeepAnalysisPipeline {
  async run(deal: DealOverview): Promise<AnalysisPipelineResult> {
    return {
      dealId: deal.listing.id,
      enrichedReasons: deal.valuation.reasons,
      enrichedRisks: deal.valuation.risks,
      confidenceAdjustment: 0
    };
  }
}
