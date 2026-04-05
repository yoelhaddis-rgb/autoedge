import type { Listing } from "@/types/domain";
import type { DealerInventoryQuery, DealerSourceConnector } from "@/lib/services/source-connectors";

const SOURCE_NAME = "Marktplaats";
const SOURCE_GROUP = "Marktplaats NL";
const BASE_URL = "https://www.marktplaats.nl";
const PAGE_DELAY_MS = 600;
const MAX_PAGES = 3;
const PAGE_SIZE = 30;
const MAX_PRICE_THRESHOLD = 200_000;

// Price types treated as valid asking prices.
// "MIN_BID" is an auction floor — included but treated as asking price.
// "NOTK" / "FREE" / "SEE_DESCRIPTION" have no numeric price → skipped via priceCents <= 0.
const VALID_PRICE_TYPES = new Set(["FIXED", "NEGOTIABLE", "MIN_BID"]);

const TRANSMISSION_MAP: Record<string, Listing["transmission"]> = {
  handgeschakeld: "Manual",
  automaat: "Automatic"
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toSearchSlug(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "+");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// Infer fuel type from listing title/description — Marktplaats search results
// don't expose a structured fuel attribute in the search response.
function inferFuel(title: string, description: string): Listing["fuel"] {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes("elektrisch") ||
    text.includes("full electric") ||
    /\bev\b/.test(text) ||
    /\bbev\b/.test(text)
  )
    return "Electric";

  if (text.includes("hybride") || text.includes("hybrid")) return "Hybrid";

  if (
    text.includes("diesel") ||
    /\btdi\b/.test(text) ||
    /\bcdi\b/.test(text) ||
    /\bhdi\b/.test(text) ||
    /\btdci\b/.test(text) ||
    /\bdci\b/.test(text)
  )
    return "Diesel";

  // Default: Petrol (most common fuel for private-seller NL market listings)
  return "Petrol";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAttr(attrs: any[], key: string): string | undefined {
  const entry = attrs.find((a: { key: string }) => a.key === key);
  return entry?.value;
}

// Parse "74 pk" → 74. Returns 0 if not parseable.
function parsePk(raw: string | undefined): number {
  if (!raw) return 0;
  const match = raw.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeListing(raw: any, brand: string, model: string): Listing | null {
  try {
    const priceCents: number = raw?.priceInfo?.priceCents ?? 0;
    const priceType: string = raw?.priceInfo?.priceType ?? "";
    const askingPrice = Math.round(priceCents / 100);

    if (askingPrice <= 0 || askingPrice > MAX_PRICE_THRESHOLD) return null;
    if (!VALID_PRICE_TYPES.has(priceType)) return null;

    const allAttrs: unknown[] = [
      ...(raw?.attributes ?? []),
      ...(raw?.extendedAttributes ?? [])
    ];

    const yearRaw = getAttr(allAttrs as never[], "constructionYear");
    const year = yearRaw ? parseInt(yearRaw, 10) : NaN;
    const currentYear = new Date().getFullYear();
    if (!Number.isFinite(year) || year < 1990 || year > currentYear + 1) return null;

    const mileageRaw = getAttr(allAttrs as never[], "mileage");
    const mileage = mileageRaw ? parseInt(String(mileageRaw).replace(/\D/g, ""), 10) : NaN;
    if (!Number.isFinite(mileage) || mileage < 0) return null;

    const transmissionRaw = getAttr(allAttrs as never[], "transmission");
    const transmission: Listing["transmission"] =
      TRANSMISSION_MAP[transmissionRaw?.toLowerCase() ?? ""] ?? "Manual";

    const advertiser = getAttr(allAttrs as never[], "advertiser");
    const sellerType = advertiser === "Particulier" ? "Private" : "Trader";

    const powerRaw = getAttr(allAttrs as never[], "engineHorsepower");
    const powerHp = parsePk(powerRaw);

    const title: string = raw?.title ?? "";
    const description: string = raw?.description ?? "";
    if (!title) return null;

    const fuel = inferFuel(title, description);

    const vipUrl: string = raw?.vipUrl ?? "";
    const sourceUrl = vipUrl ? `${BASE_URL}${vipUrl}` : "";
    if (!sourceUrl) return null;

    const externalId: string = raw?.itemId ?? "";
    if (!externalId) return null;

    const imageUrl: string =
      raw?.pictures?.[0]?.largeUrl ??
      (typeof raw?.imageUrls?.[0] === "string"
        ? raw.imageUrls[0].startsWith("//")
          ? `https:${raw.imageUrls[0]}`
          : raw.imageUrls[0]
        : "");

    const imageUrls: string[] = imageUrl ? [imageUrl] : [];

    const location: string = raw?.location?.cityName ?? "";

    return {
      id: `marktplaats-${externalId}`,
      source: SOURCE_NAME,
      externalId,
      sourceUrl,
      title,
      brand: capitalize(brand),
      model: capitalize(model),
      variant: "",
      year,
      mileage,
      askingPrice,
      fuel,
      transmission,
      powerHp,
      location,
      sellerType,
      description: description.slice(0, 500),
      imageUrls,
      firstSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      listingType: "market_data"
    };
  } catch {
    return null;
  }
}

async function fetchBrandModel(brand: string, model: string): Promise<Listing[]> {
  const query = `${toSearchSlug(brand)}+${toSearchSlug(model)}`;
  const results: Listing[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const url = `${BASE_URL}/q/${query}/?offset=${offset}&limit=${PAGE_SIZE}`;

    let html: string;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8"
        }
      });
      if (!res.ok) break;
      html = await res.text();
    } catch {
      break;
    }

    // Extract __NEXT_DATA__ JSON blob
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!match) break;

    let pageListings: Listing[] = [];
    try {
      const data = JSON.parse(match[1]);
      const rawListings: unknown[] =
        data?.props?.pageProps?.searchRequestAndResponse?.listings ?? [];

      pageListings = rawListings
        .map((raw) => normalizeListing(raw, brand, model))
        .filter((l): l is Listing => l !== null);
    } catch {
      break;
    }

    results.push(...pageListings);

    if (pageListings.length < PAGE_SIZE) break; // Last page
    if (page < MAX_PAGES - 1) await delay(PAGE_DELAY_MS);
  }

  return results;
}

function applyQueryFilters(listings: Listing[], query: DealerInventoryQuery): Listing[] {
  return listings.filter((l) => {
    if (l.year < query.minYear) return false;
    if (l.mileage > query.maxMileage) return false;
    if (query.minAskingPrice != null && l.askingPrice < query.minAskingPrice) return false;
    if (query.maxAskingPrice != null && l.askingPrice > query.maxAskingPrice) return false;
    if (query.fuelTypes.length > 0 && !query.fuelTypes.includes(l.fuel)) return false;
    if (query.transmissions.length > 0 && !query.transmissions.includes(l.transmission))
      return false;
    return true;
  });
}

export class MarktplaatsConnector implements DealerSourceConnector {
  readonly connectorId = "marktplaats-nl";
  readonly sourceName = SOURCE_NAME;
  readonly sourceGroup = SOURCE_GROUP;

  async fetchInventory(query: DealerInventoryQuery): Promise<Listing[]> {
    const results: Listing[] = [];

    for (const brand of query.preferredBrands) {
      for (const model of query.preferredModels) {
        const listings = await fetchBrandModel(brand, model);
        results.push(...listings);
      }
    }

    return applyQueryFilters(results, query);
  }
}
