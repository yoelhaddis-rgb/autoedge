import type { Listing } from "@/types/domain";
import type { DealerInventoryQuery, DealerSourceConnector } from "@/lib/services/source-connectors";

const SOURCE_NAME = "AutoScout24";
const SOURCE_GROUP = "AutoScout24";
const BASE_URL = "https://www.autoscout24.nl";
const PAGE_DELAY_MS = 800;
const MAX_PAGES = 3;
const MAX_PRICE_THRESHOLD = 200_000;

const FUEL_MAP: Record<string, Listing["fuel"]> = {
  benzine: "Petrol",
  diesel: "Diesel",
  elektrisch: "Electric",
  hybride: "Hybrid",
  "plug-in hybride": "Hybrid"
};

const TRANSMISSION_MAP: Record<string, Listing["transmission"]> = {
  handgeschakeld: "Manual",
  automaat: "Automatic"
};

function toBrandSlug(brand: string): string {
  return brand.toLowerCase().replace(/\s+/g, "-");
}

function toModelSlug(model: string): string {
  return model.toLowerCase().replace(/\s+/g, "-");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeFuel(raw: string | undefined): Listing["fuel"] | null {
  if (!raw) return null;
  return FUEL_MAP[raw.toLowerCase()] ?? null;
}

function normalizeTransmission(raw: string | undefined): Listing["transmission"] | null {
  if (!raw) return null;
  return TRANSMISSION_MAP[raw.toLowerCase()] ?? null;
}

// Extract the listing array from AutoScout24's __NEXT_DATA__ JSON blob.
// The path has changed a few times; try the most recent known paths in order.
function extractListingsFromNextData(nextData: Record<string, unknown>): unknown[] {
  try {
    // Path 1 (current as of 2026): props.pageProps.listings
    const pageProps = (nextData as { props?: { pageProps?: { listings?: unknown[] } } })
      ?.props?.pageProps;
    if (pageProps?.listings && Array.isArray(pageProps.listings)) {
      return pageProps.listings;
    }

    // Path 2: props.pageProps.searchResponse.listings
    const searchResponse = (
      pageProps as { searchResponse?: { listings?: unknown[] } } | undefined
    )?.searchResponse;
    if (searchResponse?.listings && Array.isArray(searchResponse.listings)) {
      return searchResponse.listings;
    }

    // Path 3: props.pageProps.data.listings
    const data = (pageProps as { data?: { listings?: unknown[] } } | undefined)?.data;
    if (data?.listings && Array.isArray(data.listings)) {
      return data.listings;
    }
  } catch {
    // Malformed JSON — return empty
  }
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeListing(raw: any, brandSlug: string, modelSlug: string): Listing | null {
  // Required fields
  const askingPrice: number = raw.price ?? raw.priceParts?.[0]?.value ?? raw.priceValue;
  const year: number = raw.year ?? raw.firstRegistration?.split("/")?.[1] ?? raw.registrationDate?.split("/")?.[1];
  const mileage: number = raw.mileage ?? raw.km;
  const brand: string = raw.make ?? raw.brand ?? brandSlug;
  const model: string = raw.model ?? modelSlug;

  if (!askingPrice || !year || mileage == null || !brand || !model) return null;
  if (typeof askingPrice !== "number" || askingPrice <= 0 || askingPrice > MAX_PRICE_THRESHOLD) return null;
  if (typeof year !== "number" || year < 1990 || year > new Date().getFullYear() + 1) return null;
  if (typeof mileage !== "number" || mileage < 0) return null;

  const rawFuel: string | undefined = raw.fuel ?? raw.fuelType ?? raw.fuelCategory;
  const fuel = normalizeFuel(rawFuel);
  if (!fuel) return null;

  const rawTransmission: string | undefined = raw.transmission ?? raw.gearbox;
  const transmission = normalizeTransmission(rawTransmission) ?? "Manual";

  const externalId: string = String(raw.id ?? raw.guid ?? raw.listingId ?? "");
  if (!externalId) return null;

  const sourceUrl: string = raw.url
    ? raw.url.startsWith("http")
      ? raw.url
      : `${BASE_URL}${raw.url}`
    : `${BASE_URL}/auto-details/${externalId}`;

  const sellerType: string =
    raw.seller?.type === "private" || raw.isPrivate ? "Private" : "Trader";

  const powerKw: number | undefined = raw.powerKw ?? raw.power?.kw;
  const powerHp = powerKw ? Math.round(powerKw * 1.36) : (raw.powerHp ?? raw.power?.hp ?? 0);

  const firstImage: string | undefined =
    raw.images?.[0]?.url ?? raw.imageUrl ?? raw.thumbnail ?? undefined;

  const location: string = raw.location?.city ?? raw.city ?? raw.location ?? "";
  const variant: string = raw.version ?? raw.variant ?? "";
  const title: string = raw.title ?? `${brand} ${model}${variant ? ` ${variant}` : ""}`;
  const description: string = raw.description ?? raw.shortDescription ?? "";

  return {
    id: `autoscout24-${externalId}`,
    source: SOURCE_NAME,
    externalId,
    sourceUrl,
    title,
    brand: brand.charAt(0).toUpperCase() + brand.slice(1),
    model: model.charAt(0).toUpperCase() + model.slice(1),
    variant,
    year: Number(year),
    mileage: Number(mileage),
    askingPrice: Number(askingPrice),
    fuel,
    transmission,
    powerHp: Number(powerHp),
    location,
    sellerType,
    description,
    imageUrls: firstImage ? [firstImage] : [],
    firstSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    listingType: "market_data"
  };
}

async function fetchPage(brand: string, model: string, page: number): Promise<Listing[]> {
  const brandSlug = toBrandSlug(brand);
  const modelSlug = toModelSlug(model);
  const url = `${BASE_URL}/lst/${brandSlug}/${modelSlug}?sort=price&atype=C&ustate=N%2CU&size=20&page=${page}`;

  let html: string;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
        Accept: "text/html,application/xhtml+xml"
      }
    });
    if (!response.ok) return [];
    html = await response.text();
  } catch {
    return [];
  }

  // Extract __NEXT_DATA__ JSON
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match?.[1]) return [];

  let nextData: Record<string, unknown>;
  try {
    nextData = JSON.parse(match[1]);
  } catch {
    return [];
  }

  const rawListings = extractListingsFromNextData(nextData);
  const results: Listing[] = [];
  for (const raw of rawListings) {
    const listing = normalizeListing(raw, brandSlug, modelSlug);
    if (listing) results.push(listing);
  }
  return results;
}

async function fetchBrandModel(brand: string, model: string): Promise<Listing[]> {
  const all: Listing[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const listings = await fetchPage(brand, model, page);
    all.push(...listings);
    if (listings.length === 0) break; // No more pages
    if (page < MAX_PAGES) await delay(PAGE_DELAY_MS);
  }
  return all;
}

export class AutoScout24Connector implements DealerSourceConnector {
  readonly connectorId = "autoscout24-nl";
  readonly sourceName = SOURCE_NAME;
  readonly sourceGroup = SOURCE_GROUP;

  async fetchInventory(query: DealerInventoryQuery): Promise<Listing[]> {
    const results: Listing[] = [];
    const pairs = this.buildBrandModelPairs(query);

    for (const [brand, model] of pairs) {
      const listings = await fetchBrandModel(brand, model);
      results.push(...listings);
    }

    return this.applyQueryFilters(results, query);
  }

  private buildBrandModelPairs(query: DealerInventoryQuery): [string, string][] {
    const pairs: [string, string][] = [];
    for (const brand of query.preferredBrands) {
      for (const model of query.preferredModels) {
        pairs.push([brand, model]);
      }
    }
    // If no preferences given, return empty — we don't crawl everything
    return pairs;
  }

  private applyQueryFilters(listings: Listing[], query: DealerInventoryQuery): Listing[] {
    return listings.filter((l) => {
      if (l.year < query.minYear) return false;
      if (l.mileage > query.maxMileage) return false;
      if (query.minAskingPrice != null && l.askingPrice < query.minAskingPrice) return false;
      if (query.maxAskingPrice != null && l.askingPrice > query.maxAskingPrice) return false;
      if (query.fuelTypes.length > 0 && !query.fuelTypes.includes(l.fuel)) return false;
      return true;
    });
  }
}
