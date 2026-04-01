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
  // Alfa Romeo
  { brand: "Alfa Romeo", model: "Giulia", aliases: ["alfa giulia"] },
  { brand: "Alfa Romeo", model: "Stelvio", aliases: ["alfa stelvio"] },
  { brand: "Alfa Romeo", model: "Tonale" },

  // Audi
  { brand: "Audi", model: "A1 Sportback", aliases: ["a1"] },
  { brand: "Audi", model: "A3 Sportback", aliases: ["a3"] },
  { brand: "Audi", model: "A4 Avant", aliases: ["a4"] },
  { brand: "Audi", model: "A6 Avant", aliases: ["a6"] },
  { brand: "Audi", model: "Q2" },
  { brand: "Audi", model: "Q3", aliases: ["q3 sportback"] },
  { brand: "Audi", model: "Q5", aliases: ["q5 sportback"] },
  { brand: "Audi", model: "e-tron", aliases: ["etron", "e tron", "q8 etron"] },

  // BMW
  { brand: "BMW", model: "1 Series", aliases: ["1serie", "1er", "118i", "116i", "120i"] },
  { brand: "BMW", model: "3 Series", aliases: ["3serie", "320i", "320d", "330i", "330e"] },
  { brand: "BMW", model: "320d Touring", aliases: ["320d touring", "320diesel touring"] },
  { brand: "BMW", model: "5 Series Touring", aliases: ["5serie touring", "520d touring", "530i touring"] },
  { brand: "BMW", model: "X1", aliases: ["x1 sdrive", "x1 xdrive"] },
  { brand: "BMW", model: "X3", aliases: ["x3 xdrive", "x3 sdrive"] },
  { brand: "BMW", model: "X5", aliases: ["x5 xdrive"] },
  { brand: "BMW", model: "i3", aliases: ["bmw i3"] },
  { brand: "BMW", model: "iX3", aliases: ["ix3"] },

  // Citroën
  { brand: "Citroën", model: "C3", aliases: ["c3 aircross"] },
  { brand: "Citroën", model: "C4", aliases: ["c4 x"] },
  { brand: "Citroën", model: "C5 Aircross" },
  { brand: "Citroën", model: "Berlingo", aliases: ["berlingo multispace"] },

  // Cupra
  { brand: "Cupra", model: "Formentor" },
  { brand: "Cupra", model: "Born", aliases: ["cupra born"] },
  { brand: "Cupra", model: "Ateca", aliases: ["cupra ateca"] },

  // Dacia
  { brand: "Dacia", model: "Sandero", aliases: ["sandero stepway"] },
  { brand: "Dacia", model: "Duster" },
  { brand: "Dacia", model: "Logan", aliases: ["logan mcv"] },
  { brand: "Dacia", model: "Jogger" },

  // Fiat
  { brand: "Fiat", model: "500", aliases: ["fiat500"] },
  { brand: "Fiat", model: "500X" },
  { brand: "Fiat", model: "Panda", aliases: ["pandina"] },
  { brand: "Fiat", model: "Tipo", aliases: ["tipo stationwagon", "tipo sw"] },

  // Ford
  { brand: "Ford", model: "Fiesta" },
  { brand: "Ford", model: "Focus Wagon", aliases: ["focus"] },
  { brand: "Ford", model: "Puma", aliases: ["ford puma"] },
  { brand: "Ford", model: "Kuga", aliases: ["kuga titanium"] },
  { brand: "Ford", model: "Mustang Mach-E", aliases: ["mach e", "mache", "mustang mache"] },

  // Honda
  { brand: "Honda", model: "Civic", aliases: ["civic hatchback"] },
  { brand: "Honda", model: "CR-V", aliases: ["crv", "cr v"] },
  { brand: "Honda", model: "Jazz", aliases: ["jazz crosstar"] },
  { brand: "Honda", model: "HR-V", aliases: ["hrv", "hr v"] },

  // Hyundai
  { brand: "Hyundai", model: "i20", aliases: ["i20 n"] },
  { brand: "Hyundai", model: "i30 Wagon", aliases: ["i30", "i30 cw"] },
  { brand: "Hyundai", model: "Tucson", aliases: ["tucson hybrid"] },
  { brand: "Hyundai", model: "IONIQ 5", aliases: ["ioniq5", "ioniq 5"] },

  // Jeep
  { brand: "Jeep", model: "Renegade", aliases: ["renegade 4xe"] },
  { brand: "Jeep", model: "Compass", aliases: ["compass 4xe"] },

  // Kia
  { brand: "Kia", model: "Ceed Sportswagon", aliases: ["ceed", "xceed"] },
  { brand: "Kia", model: "Sportage", aliases: ["sportage hybrid"] },
  { brand: "Kia", model: "Niro", aliases: ["niro hybrid", "niro ev", "niro phev"] },
  { brand: "Kia", model: "EV6", aliases: ["ev6 gt"] },

  // Land Rover
  { brand: "Land Rover", model: "Discovery Sport", aliases: ["disco sport"] },
  { brand: "Land Rover", model: "Range Rover Evoque", aliases: ["evoque", "rr evoque"] },
  { brand: "Land Rover", model: "Range Rover Sport", aliases: ["rr sport"] },
  { brand: "Land Rover", model: "Defender", aliases: ["defender 90", "defender 110"] },

  // Mazda
  { brand: "Mazda", model: "3 Hatchback", aliases: ["mazda 3", "3"] },
  { brand: "Mazda", model: "CX-30", aliases: ["cx30", "cx 30"] },
  { brand: "Mazda", model: "CX-5", aliases: ["cx5", "cx 5"] },
  { brand: "Mazda", model: "6 Wagon", aliases: ["mazda 6", "6"] },

  // Mercedes
  { brand: "Mercedes", model: "A-Class", aliases: ["a class", "a klasse", "aklasse", "a180", "a200"] },
  { brand: "Mercedes", model: "C-Class Estate", aliases: ["c class", "c klasse", "cklasse", "c200", "c220"] },
  { brand: "Mercedes", model: "E-Class Estate", aliases: ["e class", "e klasse", "eklasse", "e200", "e220"] },
  { brand: "Mercedes", model: "GLC", aliases: ["glc 200", "glc 300"] },
  { brand: "Mercedes", model: "CLA Shooting Brake", aliases: ["cla shootingbrake"] },
  { brand: "Mercedes", model: "EQA", aliases: ["eqa 250"] },

  // MG
  { brand: "MG", model: "ZS", aliases: ["mg zs", "zs ev"] },
  { brand: "MG", model: "MG4", aliases: ["mg 4"] },
  { brand: "MG", model: "MG5", aliases: ["mg 5"] },

  // Mini
  { brand: "Mini", model: "Cooper", aliases: ["mini cooper", "cooper s", "one"] },
  { brand: "Mini", model: "Countryman", aliases: ["mini countryman"] },
  { brand: "Mini", model: "Clubman", aliases: ["mini clubman"] },

  // Mitsubishi
  { brand: "Mitsubishi", model: "Outlander", aliases: ["outlander phev"] },
  { brand: "Mitsubishi", model: "Eclipse Cross", aliases: ["eclipse cross phev"] },
  { brand: "Mitsubishi", model: "ASX" },

  // Nissan
  { brand: "Nissan", model: "Qashqai", aliases: ["qasqai", "qashkai", "qashqay"] },
  { brand: "Nissan", model: "Leaf", aliases: ["nissan leaf"] },
  { brand: "Nissan", model: "Juke", aliases: ["juke hybrid"] },
  { brand: "Nissan", model: "Ariya", aliases: ["nissan ariya"] },

  // Opel
  { brand: "Opel", model: "Corsa", aliases: ["corsa e", "corsa electric"] },
  { brand: "Opel", model: "Astra Sports Tourer", aliases: ["astra sportstourer", "astra wagon", "astra"] },
  { brand: "Opel", model: "Crossland", aliases: ["crossland x"] },
  { brand: "Opel", model: "Mokka", aliases: ["mokka e", "mokka electric"] },

  // Peugeot
  { brand: "Peugeot", model: "208", aliases: ["e-208", "e208"] },
  { brand: "Peugeot", model: "2008", aliases: ["e-2008", "e2008"] },
  { brand: "Peugeot", model: "308", aliases: ["308 sw"] },
  { brand: "Peugeot", model: "3008", aliases: ["3008 hybrid"] },

  // Porsche
  { brand: "Porsche", model: "Cayenne", aliases: ["cayenne e-hybrid", "cayenne s"] },
  { brand: "Porsche", model: "Macan", aliases: ["macan s", "macan electric"] },
  { brand: "Porsche", model: "Panamera", aliases: ["panamera sport turismo"] },

  // Renault
  { brand: "Renault", model: "Clio", aliases: ["clio hybrid"] },
  { brand: "Renault", model: "Mégane", aliases: ["megane", "megane e-tech", "megane ev"] },
  { brand: "Renault", model: "Captur", aliases: ["captur hybrid"] },
  { brand: "Renault", model: "Arkana", aliases: ["arkana hybrid"] },
  { brand: "Renault", model: "Zoe", aliases: ["zoë", "zoe ev"] },

  // Seat
  { brand: "Seat", model: "Ibiza", aliases: ["seat ibiza"] },
  { brand: "Seat", model: "Leon", aliases: ["seat leon", "leon sportstourer", "leon st"] },
  { brand: "Seat", model: "Ateca", aliases: ["seat ateca"] },
  { brand: "Seat", model: "Arona", aliases: ["seat arona"] },

  // Skoda
  { brand: "Skoda", model: "Octavia Combi", aliases: ["octavia", "octavia wagon"] },
  { brand: "Skoda", model: "Superb Combi", aliases: ["superb"] },
  { brand: "Skoda", model: "Karoq" },
  { brand: "Skoda", model: "Kodiaq" },

  // Suzuki
  { brand: "Suzuki", model: "Vitara", aliases: ["vitara hybrid"] },
  { brand: "Suzuki", model: "Swift", aliases: ["swift sport"] },
  { brand: "Suzuki", model: "S-Cross", aliases: ["scross", "s cross hybrid"] },

  // Tesla
  { brand: "Tesla", model: "Model 3", aliases: ["model3"] },
  { brand: "Tesla", model: "Model Y", aliases: ["modely"] },
  { brand: "Tesla", model: "Model S", aliases: ["models"] },

  // Toyota
  { brand: "Toyota", model: "Yaris", aliases: ["yaris hybrid", "yaris gr"] },
  { brand: "Toyota", model: "Yaris Cross", aliases: ["yariscross"] },
  { brand: "Toyota", model: "Corolla Touring Sports", aliases: ["corolla touring", "corolla"] },
  { brand: "Toyota", model: "C-HR", aliases: ["chr", "c hr"] },
  { brand: "Toyota", model: "RAV4", aliases: ["rav 4", "rav4 hybrid", "rav4 phev"] },
  { brand: "Toyota", model: "Prius", aliases: ["prius plug-in", "prius phev"] },

  // Volkswagen
  { brand: "Volkswagen", model: "Polo" },
  { brand: "Volkswagen", model: "Golf", aliases: ["golf7", "golf 7", "golf vii", "golf 8", "golf viii"] },
  { brand: "Volkswagen", model: "Golf Variant", aliases: ["golf variant", "golf wagon"] },
  { brand: "Volkswagen", model: "Passat Variant", aliases: ["passat", "passat alltrack"] },
  { brand: "Volkswagen", model: "T-Roc", aliases: ["troc", "t roc"] },
  { brand: "Volkswagen", model: "Tiguan", aliases: ["tiguan allspace"] },
  { brand: "Volkswagen", model: "ID.3", aliases: ["id3", "id 3"] },
  { brand: "Volkswagen", model: "ID.4", aliases: ["id4", "id 4"] },
  { brand: "Volkswagen", model: "T-Cross", aliases: ["tcross", "t cross"] },

  // Volvo
  { brand: "Volvo", model: "V60", aliases: ["v60 cross country"] },
  { brand: "Volvo", model: "V90 Cross Country", aliases: ["v90", "v90cc"] },
  { brand: "Volvo", model: "XC40", aliases: ["xc40 recharge"] },
  { brand: "Volvo", model: "XC60", aliases: ["xc60 recharge"] },
  { brand: "Volvo", model: "XC90", aliases: ["xc90 recharge"] }
];

const BRAND_ALIASES: Record<string, string> = {
  // Alfa Romeo
  alfa: "Alfa Romeo",
  alfaromeo: "Alfa Romeo",
  alfromeo: "Alfa Romeo",

  // Audi
  audi: "Audi",

  // BMW
  bmw: "BMW",
  beemer: "BMW",
  bimmer: "BMW",

  // Citroën
  citroen: "Citroën",
  ds: "Citroën", // DS is Citroën sub-brand; redirect loosely

  // Cupra
  cupra: "Cupra",

  // Dacia
  dacia: "Dacia",
  datsun: "Dacia", // common confusion

  // Fiat
  fiat: "Fiat",

  // Ford
  ford: "Ford",

  // Honda
  honda: "Honda",

  // Hyundai
  hyundai: "Hyundai",
  hundai: "Hyundai",
  hyundei: "Hyundai",

  // Jeep
  jeep: "Jeep",

  // Kia
  kia: "Kia",

  // Land Rover
  landrover: "Land Rover",
  landroover: "Land Rover",
  landy: "Land Rover",
  rr: "Land Rover",
  rangerover: "Land Rover",

  // Mazda
  mazda: "Mazda",

  // Mercedes
  mercedesbenz: "Mercedes",
  mercedes: "Mercedes",
  mb: "Mercedes",
  benz: "Mercedes",

  // MG
  mg: "MG",

  // Mini
  mini: "Mini",
  bmwmini: "Mini",

  // Mitsubishi
  mitsubishi: "Mitsubishi",
  mitsu: "Mitsubishi",

  // Nissan
  nissan: "Nissan",

  // Opel
  opel: "Opel",
  vauxhall: "Opel",

  // Peugeot
  peugeot: "Peugeot",

  // Porsche
  porsche: "Porsche",

  // Renault
  renault: "Renault",
  renolt: "Renault",

  // Seat
  seat: "Seat",

  // Skoda
  skoda: "Skoda",
  shkoda: "Skoda",

  // Suzuki
  suzuki: "Suzuki",

  // Tesla
  tesla: "Tesla",

  // Toyota
  toyota: "Toyota",

  // Volkswagen
  vw: "Volkswagen",
  volkswagon: "Volkswagen",
  volkswagen: "Volkswagen",
  volkswaagen: "Volkswagen",

  // Volvo
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
