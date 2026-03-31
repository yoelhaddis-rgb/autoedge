type VehicleCatalogEntry = {
  brand: string;
  model: string;
  aliases?: string[];
};

export type VehicleSuggestionOption = {
  brand: string;
  model: string;
  confidence: number;
  reason: "alias" | "typo" | "fuzzy";
};

export type VehicleSuggestionResult =
  | {
      status: "none";
      options: [];
    }
  | {
      status: "single" | "multiple";
      options: VehicleSuggestionOption[];
      confidence: "high" | "medium";
    };

const VEHICLE_CATALOG: VehicleCatalogEntry[] = [
  { brand: "Audi", model: "A3 Sportback", aliases: ["a3"] },
  { brand: "Audi", model: "A4 Avant", aliases: ["a4"] },
  { brand: "Audi", model: "Q2" },
  { brand: "BMW", model: "1 Series", aliases: ["1serie", "1er"] },
  { brand: "BMW", model: "320d Touring", aliases: ["320d", "320 d", "320diesel"] },
  { brand: "BMW", model: "5 Series Touring", aliases: ["5serie touring", "520d touring"] },
  { brand: "Fiat", model: "500", aliases: ["fiat500"] },
  { brand: "Fiat", model: "Panda", aliases: ["pandina"] },
  { brand: "Fiat", model: "Punto", aliases: ["grandepunto", "grande punto"] },
  { brand: "Ford", model: "Fiesta" },
  { brand: "Ford", model: "Focus Wagon", aliases: ["focus"] },
  { brand: "Hyundai", model: "i30 Wagon", aliases: ["i30"] },
  { brand: "Kia", model: "Ceed Sportswagon", aliases: ["ceed"] },
  { brand: "Mazda", model: "3 Hatchback", aliases: ["mazda 3", "3"] },
  { brand: "Mercedes", model: "A-Class", aliases: ["a class", "a klasse", "aklasse"] },
  { brand: "Mercedes", model: "C-Class Estate", aliases: ["c class", "c klasse", "cklasse"] },
  { brand: "Mercedes", model: "CLA Shooting Brake", aliases: ["cla shootingbrake"] },
  { brand: "Nissan", model: "Qashqai", aliases: ["qasqai", "qashkai", "qashqay"] },
  { brand: "Opel", model: "Astra Sports Tourer", aliases: ["astra sportstourer", "astra wagon", "astra"] },
  { brand: "Peugeot", model: "208" },
  { brand: "Renault", model: "Clio" },
  { brand: "Skoda", model: "Octavia Combi", aliases: ["octavia", "octavia wagon"] },
  { brand: "Tesla", model: "Model 3", aliases: ["model3"] },
  { brand: "Toyota", model: "Corolla Touring Sports", aliases: ["corolla touring", "corolla"] },
  { brand: "Toyota", model: "Yaris" },
  { brand: "Volkswagen", model: "Golf", aliases: ["golf7", "golf 7", "golf vii"] },
  { brand: "Volkswagen", model: "Passat Variant", aliases: ["passat"] },
  { brand: "Volkswagen", model: "Polo" },
  { brand: "Volvo", model: "V60" }
];

const BRAND_ALIASES: Record<string, string> = {
  vw: "Volkswagen",
  volkswagon: "Volkswagen",
  volkswagen: "Volkswagen",
  mercedesbenz: "Mercedes",
  mercedes: "Mercedes",
  mb: "Mercedes",
  bmw: "BMW",
  beemer: "BMW",
  audi: "Audi",
  fiat: "Fiat",
  ford: "Ford",
  hyundai: "Hyundai",
  kia: "Kia",
  mazda: "Mazda",
  nissan: "Nissan",
  opel: "Opel",
  peugeot: "Peugeot",
  renault: "Renault",
  skoda: "Skoda",
  tesla: "Tesla",
  toyota: "Toyota",
  volvo: "Volvo"
};

type ScoredCandidate = VehicleSuggestionOption & {
  score: number;
};

const SORTER = new Intl.Collator("nl", { sensitivity: "base" });

function normalizeRaw(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/klasse/g, "class")
    .replace(/shooting\s*brake/g, "shootingbrake")
    .replace(/touring\s*sports/g, "touringsports")
    .replace(/sports\s*tourer/g, "sportstourer")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function levenshteinDistance(left: string, right: string): number {
  if (left === right) return 0;
  if (left.length === 0) return right.length;
  if (right.length === 0) return left.length;

  const matrix = Array.from({ length: left.length + 1 }, () => new Array<number>(right.length + 1).fill(0));

  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function stringSimilarity(left: string, right: string): number {
  if (!left || !right) return 0;
  if (left === right) return 1;

  const distance = levenshteinDistance(left, right);
  const maxLength = Math.max(left.length, right.length);
  return Math.max(0, 1 - distance / maxLength);
}

function resolveBrand(brandInput: string): { canonical?: string; score: number } {
  const brandNorm = normalizeRaw(brandInput);
  if (!brandNorm) return { score: 0 };

  const aliasHit = BRAND_ALIASES[brandNorm];
  if (aliasHit) {
    const canonicalNorm = normalizeRaw(aliasHit);
    const isExactCanonical = brandNorm === canonicalNorm;
    return { canonical: aliasHit, score: isExactCanonical ? 1 : 0.98 };
  }

  const canonicalBrands = [...new Set(VEHICLE_CATALOG.map((entry) => entry.brand))];
  const scored = canonicalBrands
    .map((brand) => ({
      brand,
      score: stringSimilarity(brandNorm, normalizeRaw(brand))
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 0.82) return { score: 0 };
  return { canonical: best.brand, score: best.score };
}

function rankAutocomplete(
  inputNorm: string,
  value: string,
  aliasValues: string[]
): { rank: number; score: number } {
  const valueNorm = normalizeRaw(value);
  const aliasNorms = aliasValues.map(normalizeRaw);
  const all = [valueNorm, ...aliasNorms];

  const prefixHit = all.some((candidate) => candidate.startsWith(inputNorm));
  if (prefixHit) {
    const bestScore = Math.max(...all.map((candidate) => stringSimilarity(inputNorm, candidate)));
    return { rank: 0, score: bestScore };
  }

  const containsHit = all.some((candidate) => candidate.includes(inputNorm));
  if (containsHit) {
    const bestScore = Math.max(...all.map((candidate) => stringSimilarity(inputNorm, candidate)));
    return { rank: 1, score: bestScore };
  }

  const bestScore = Math.max(...all.map((candidate) => stringSimilarity(inputNorm, candidate)));
  return { rank: 2, score: bestScore };
}

export function getBrandAutocompleteOptions(brandInput: string, limit = 8): string[] {
  const inputNorm = normalizeRaw(brandInput);
  const canonicalBrands = [...new Set(VEHICLE_CATALOG.map((entry) => entry.brand))];

  if (!inputNorm) {
    return canonicalBrands.sort((a, b) => SORTER.compare(a, b)).slice(0, limit);
  }

  const ranked = canonicalBrands
    .map((brand) => {
      const aliasValues = Object.entries(BRAND_ALIASES)
        .filter(([, canonical]) => canonical === brand)
        .map(([alias]) => alias);
      const aliasScope = inputNorm.length <= 1 ? [] : aliasValues;
      return {
        brand,
        ...rankAutocomplete(inputNorm, brand, aliasScope)
      };
    })
    .filter((item) => item.rank < 2 || item.score >= 0.64)
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.score !== b.score) return b.score - a.score;
      return SORTER.compare(a.brand, b.brand);
    });

  return ranked.slice(0, limit).map((item) => item.brand);
}

export function getModelAutocompleteOptions(
  brandInput: string,
  modelInput: string,
  limit = 8
): string[] {
  const brandResolution = resolveBrand(brandInput);
  const scopedCatalog =
    brandResolution.canonical && brandResolution.score >= 0.75
      ? VEHICLE_CATALOG.filter((entry) => entry.brand === brandResolution.canonical)
      : VEHICLE_CATALOG;

  const inputNorm = normalizeRaw(modelInput);
  const allowLoose = inputNorm.length <= 2;

  const ranked = scopedCatalog
    .map((entry) => {
      const rankedModel = rankAutocomplete(inputNorm, entry.model, entry.aliases ?? []);
      return {
        model: entry.model,
        rank: rankedModel.rank,
        score: rankedModel.score
      };
    })
    .filter((item) => {
      if (!inputNorm) return true;
      if (allowLoose) return true;
      return item.rank < 2 || item.score >= 0.68;
    })
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.score !== b.score) return b.score - a.score;
      return SORTER.compare(a.model, b.model);
    });

  const uniqueModels = [...new Set(ranked.map((item) => item.model))];
  return uniqueModels.slice(0, limit);
}

function getModelScore(inputNorm: string, modelNorm: string, aliasNorms: string[]): { score: number; reason: ScoredCandidate["reason"] } {
  if (!inputNorm) return { score: 0, reason: "fuzzy" };
  if (inputNorm === modelNorm) return { score: 1, reason: "alias" };
  if (aliasNorms.includes(inputNorm)) return { score: 0.99, reason: "alias" };

  if (modelNorm.includes(inputNorm) || inputNorm.includes(modelNorm)) {
    const ratio = Math.min(modelNorm.length, inputNorm.length) / Math.max(modelNorm.length, inputNorm.length);
    return { score: 0.82 + ratio * 0.14, reason: "fuzzy" };
  }

  let bestAliasSimilarity = stringSimilarity(inputNorm, modelNorm);
  let reason: ScoredCandidate["reason"] = "fuzzy";

  for (const aliasNorm of aliasNorms) {
    const aliasSimilarity = stringSimilarity(inputNorm, aliasNorm);
    if (aliasSimilarity > bestAliasSimilarity) {
      bestAliasSimilarity = aliasSimilarity;
      reason = aliasSimilarity >= 0.85 ? "typo" : "fuzzy";
    }
  }

  if (bestAliasSimilarity >= 0.9) return { score: bestAliasSimilarity, reason: "typo" };
  return { score: bestAliasSimilarity, reason };
}

function dedupeCandidates(candidates: ScoredCandidate[]): ScoredCandidate[] {
  const unique = new Map<string, ScoredCandidate>();
  for (const candidate of candidates) {
    const key = `${candidate.brand}::${candidate.model}`.toLowerCase();
    const current = unique.get(key);
    if (!current || candidate.score > current.score) {
      unique.set(key, candidate);
    }
  }
  return [...unique.values()].sort((a, b) => b.score - a.score);
}

function buildShortInputCandidates(
  modelNorm: string,
  brandResolution: { canonical?: string; score: number }
): ScoredCandidate[] {
  if (!brandResolution.canonical || modelNorm.length > 3) {
    return [];
  }

  const brandEntries = VEHICLE_CATALOG.filter((entry) => entry.brand === brandResolution.canonical);
  if (brandEntries.length < 2) {
    return [];
  }

  const ranked = brandEntries
    .map((entry) => {
      const modelKey = normalizeRaw(entry.model);
      const aliasKeys = (entry.aliases ?? []).map(normalizeRaw);
      const startsWith = modelKey.startsWith(modelNorm) || aliasKeys.some((alias) => alias.startsWith(modelNorm));
      const includes = modelKey.includes(modelNorm) || aliasKeys.some((alias) => alias.includes(modelNorm));

      const bestSimilarity = Math.max(
        stringSimilarity(modelNorm, modelKey),
        ...aliasKeys.map((alias) => stringSimilarity(modelNorm, alias))
      );

      const modelScore = startsWith ? 0.9 : includes ? 0.8 : Math.max(0.46, bestSimilarity * 0.9);
      const score = modelScore * 0.8 + brandResolution.score * 0.2;
      const reason: ScoredCandidate["reason"] = startsWith || includes ? "alias" : bestSimilarity >= 0.84 ? "typo" : "fuzzy";

      return {
        brand: entry.brand,
        model: entry.model,
        confidence: Math.round(score * 100) / 100,
        reason,
        score
      } satisfies ScoredCandidate;
    })
    .sort((a, b) => b.score - a.score);

  const viable = ranked.filter((candidate) => candidate.score >= 0.52).slice(0, 4);
  if (viable.length >= 2) {
    return viable;
  }

  return ranked.slice(0, Math.min(3, ranked.length));
}

function isCanonicalInput(brandInput: string, modelInput: string, option: VehicleSuggestionOption): boolean {
  return normalizeRaw(brandInput) === normalizeRaw(option.brand) && normalizeRaw(modelInput) === normalizeRaw(option.model);
}

export function suggestVehicleIdentity(
  brandInput: string,
  modelInput: string
): VehicleSuggestionResult {
  const trimmedBrand = brandInput.trim();
  const trimmedModel = modelInput.trim();
  if (!trimmedBrand || !trimmedModel) {
    return { status: "none", options: [] };
  }

  const brandResolution = resolveBrand(trimmedBrand);
  const modelNorm = normalizeRaw(trimmedModel);
  if (!modelNorm) {
    return { status: "none", options: [] };
  }

  const candidatePool =
    brandResolution.canonical && brandResolution.score >= 0.84
      ? VEHICLE_CATALOG.filter((entry) => entry.brand === brandResolution.canonical)
      : VEHICLE_CATALOG;

  const scored: ScoredCandidate[] = candidatePool
    .map((entry) => {
      const aliasNorms = (entry.aliases ?? []).map(normalizeRaw);
      const modelScore = getModelScore(modelNorm, normalizeRaw(entry.model), aliasNorms);
      if (modelScore.score <= 0) return null;

      const candidateBrandScore =
        brandResolution.canonical && entry.brand === brandResolution.canonical
          ? brandResolution.score
          : stringSimilarity(normalizeRaw(trimmedBrand), normalizeRaw(entry.brand));

      const score = modelScore.score * 0.8 + candidateBrandScore * 0.2;
      return {
        brand: entry.brand,
        model: entry.model,
        confidence: Math.round(score * 100) / 100,
        reason: modelScore.reason,
        score
      } satisfies ScoredCandidate;
    })
    .filter((entry): entry is ScoredCandidate => Boolean(entry))
    .sort((a, b) => b.score - a.score);

  const shortInputCandidates = buildShortInputCandidates(modelNorm, brandResolution);
  const best = scored[0];
  if ((!best || best.score < 0.74) && shortInputCandidates.length >= 2) {
    return {
      status: "multiple",
      confidence: "medium",
      options: shortInputCandidates.slice(0, 4)
    };
  }

  if (!best || best.score < 0.74) {
    return { status: "none", options: [] };
  }

  if (isCanonicalInput(trimmedBrand, trimmedModel, best)) {
    return { status: "none", options: [] };
  }

  const secondScore = scored[1]?.score ?? 0;
  const isHighSingle = best.score >= 0.9 && best.score - secondScore >= 0.08;

  if (isHighSingle) {
    return {
      status: "single",
      confidence: "high",
      options: [best]
    };
  }

  const topCandidates = dedupeCandidates(
    scored
      .filter((candidate) => candidate.score >= Math.max(0.72, best.score - 0.08))
      .slice(0, 4)
  );
  const mergedCandidates =
    modelNorm.length <= 3 && best.score < 0.9
      ? dedupeCandidates([...topCandidates, ...shortInputCandidates]).slice(0, 4)
      : topCandidates;

  if (modelNorm.length <= 3 && mergedCandidates.length >= 2 && best.score < 0.9) {
    return {
      status: "multiple",
      confidence: "medium",
      options: mergedCandidates
    };
  }

  if (topCandidates.length === 1 && topCandidates[0].score >= 0.82) {
    return {
      status: "single",
      confidence: "medium",
      options: topCandidates
    };
  }

  const resultCandidates = mergedCandidates.length > 0 ? mergedCandidates : topCandidates;

  return {
    status: "multiple",
    confidence: best.score >= 0.86 ? "high" : "medium",
    options: resultCandidates
  };
}
