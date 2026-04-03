import type { Listing } from "@/types/domain";
import { AutoScout24Connector } from "@/lib/services/connectors/autoscout24-connector";

export type DealerInventoryQuery = {
  preferredBrands: string[];
  preferredModels: string[];
  minYear: number;
  maxMileage: number;
  minAskingPrice: number | null;
  maxAskingPrice: number | null;
  fuelTypes: string[];
  transmissions: string[];
  selectedSourceGroups: string[];
  limit?: number;
};

export interface DealerSourceConnector {
  connectorId: string;
  sourceName: string;
  sourceGroup: string;
  fetchInventory(query: DealerInventoryQuery): Promise<Listing[]>;
}

export class SourceConnectorRegistry {
  constructor(private readonly connectors: DealerSourceConnector[]) {}

  getConnectorsByGroups(groups: string[]): DealerSourceConnector[] {
    if (groups.length === 0) {
      return this.connectors;
    }

    const normalized = new Set(groups.map((group) => group.toLowerCase()));
    return this.connectors.filter((connector) => normalized.has(connector.sourceGroup.toLowerCase()));
  }

  async pullTargetedInventory(query: DealerInventoryQuery): Promise<Listing[]> {
    const connectors = this.getConnectorsByGroups(query.selectedSourceGroups);
    const results = await Promise.all(connectors.map((connector) => connector.fetchInventory(query)));

    return results.flat();
  }
}

export const sourceConnectorRegistry = new SourceConnectorRegistry([
  new AutoScout24Connector()
]);
