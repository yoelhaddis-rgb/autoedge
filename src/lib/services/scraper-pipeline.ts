import type { Listing } from "@/types/domain";

// Legacy compatibility wrapper.
// Keep this orchestrator for jobs that still invoke "scraper" semantics,
// but new development should prefer source connectors + selective monitoring.
export type ListingSourceSyncResult = {
  source: string;
  pulledAt: string;
  count: number;
};

export interface ListingSourceAdapter {
  pullListings(): Promise<Listing[]>;
  sourceName: string;
}

export class ScraperOrchestrator {
  constructor(private readonly adapters: ListingSourceAdapter[]) {}

  async syncAllSources(): Promise<ListingSourceSyncResult[]> {
    const results = await Promise.all(
      this.adapters.map(async (adapter) => {
        const listings = await adapter.pullListings();
        return {
          source: adapter.sourceName,
          pulledAt: new Date().toISOString(),
          count: listings.length
        };
      })
    );

    return results;
  }
}
