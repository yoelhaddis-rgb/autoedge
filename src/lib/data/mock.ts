import { buildConfidenceScore, buildDealScore, buildValuationCostBreakdown } from "@/lib/services/valuation-engine";
import type {
  Comparable,
  DealLifecycleStatus,
  DealerPreference,
  DealStatus,
  Listing,
  Valuation
} from "@/types/domain";

type SeedDeal = {
  id: string;
  source: string;
  externalId: string;
  title: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  mileage: number;
  askingPrice: number;
  fuel: Listing["fuel"];
  transmission: Listing["transmission"];
  powerHp: number;
  location: string;
  sellerType: string;
  description: string;
  medianEstimate: number;
  lowEstimate: number;
  highEstimate: number;
  expectedCosts: number;
  confidenceScore: number;
  dealScore: number;
  reasons: string[];
  risks: string[];
  status?: DealLifecycleStatus;
  note?: string;
};

export const DEMO_DEALER_ID = "11111111-1111-1111-1111-111111111111";

const imagePool = [
  "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80"
];

const now = Date.now();
const hoursAgo = (hours: number): string => new Date(now - hours * 60 * 60 * 1000).toISOString();

const seedDeals: SeedDeal[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    source: "DealerStock NL",
    externalId: "AS24-320D-01",
    title: "BMW 320d Touring M Sport",
    brand: "BMW",
    model: "320d Touring",
    variant: "M Sport",
    year: 2019,
    mileage: 124000,
    askingPrice: 18950,
    fuel: "Diesel",
    transmission: "Automatic",
    powerHp: 190,
    location: "Rotterdam",
    sellerType: "Trader",
    description:
      "Well-maintained lease return with full service history. Interior in strong condition, two keys, and recently replaced front tires.",
    medianEstimate: 22900,
    lowEstimate: 21800,
    highEstimate: 24200,
    expectedCosts: 1700,
    confidenceScore: 84,
    dealScore: 88,
    reasons: [
      "priced below similar market listings",
      "fresh listing under 4 hours",
      "strong year/mileage combination for fleet buyers"
    ],
    risks: ["minor stone chips on bumper"],
    status: "saved",
    note: "Strong margin if bodywork estimate stays below 1.2k"
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    source: "PremiumLease Exchange",
    externalId: "MDE-GOLF-02",
    title: "Volkswagen Golf 1.5 TSI Life",
    brand: "Volkswagen",
    model: "Golf",
    variant: "1.5 TSI Life",
    year: 2020,
    mileage: 88400,
    askingPrice: 16400,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 150,
    location: "Utrecht",
    sellerType: "Private",
    description:
      "Single owner with documented maintenance. Minor paint scratch on rear quarter panel. MOT valid for 10 months.",
    medianEstimate: 18800,
    lowEstimate: 17700,
    highEstimate: 19800,
    expectedCosts: 1300,
    confidenceScore: 80,
    dealScore: 81,
    reasons: ["dealer preference match", "good trim demand in urban markets"],
    risks: ["private seller documentation may be incomplete"],
    status: "contacted",
    note: "Seller ready for quick transfer this week"
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    source: "RegionalAutoHub",
    externalId: "MP-A180-03",
    title: "Mercedes A180 Progressive",
    brand: "Mercedes",
    model: "A-Class",
    variant: "A180 Progressive",
    year: 2018,
    mileage: 96500,
    askingPrice: 17800,
    fuel: "Petrol",
    transmission: "Automatic",
    powerHp: 136,
    location: "The Hague",
    sellerType: "Trader",
    description:
      "Clean vehicle with digital cockpit and lane assist. Last service completed at 90k km. No major cosmetic issues.",
    medianEstimate: 19750,
    lowEstimate: 18800,
    highEstimate: 20800,
    expectedCosts: 1500,
    confidenceScore: 77,
    dealScore: 73,
    reasons: ["stable resale demand", "well-equipped interior package"],
    risks: ["competition heavy in this segment"]
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    source: "DealerStock NL",
    externalId: "AS24-A4-04",
    title: "Audi A4 Avant 2.0 TDI S line",
    brand: "Audi",
    model: "A4 Avant",
    variant: "2.0 TDI S line",
    year: 2019,
    mileage: 132000,
    askingPrice: 19900,
    fuel: "Diesel",
    transmission: "Automatic",
    powerHp: 190,
    location: "Eindhoven",
    sellerType: "Trader",
    description:
      "Fleet car with complete digital record and adaptive cruise. Timing belt done at 120k km.",
    medianEstimate: 22600,
    lowEstimate: 21400,
    highEstimate: 23900,
    expectedCosts: 2100,
    confidenceScore: 79,
    dealScore: 76,
    reasons: ["touring body style remains liquid", "service history is complete"],
    risks: ["high mileage for premium segment"]
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    source: "PremiumLease Exchange",
    externalId: "MDE-FIESTA-05",
    title: "Ford Fiesta 1.0 EcoBoost Titanium",
    brand: "Ford",
    model: "Fiesta",
    variant: "1.0 EcoBoost Titanium",
    year: 2019,
    mileage: 74200,
    askingPrice: 10950,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 100,
    location: "Leiden",
    sellerType: "Trader",
    description:
      "City-friendly hatch in solid condition. New front brake pads and recent battery replacement.",
    medianEstimate: 12800,
    lowEstimate: 12100,
    highEstimate: 13600,
    expectedCosts: 900,
    confidenceScore: 74,
    dealScore: 70,
    reasons: ["quick turnover in compact segment", "below median acquisition price"],
    risks: ["narrow margin if cosmetic prep exceeds estimate"],
    status: "ignored",
    note: "Skipped due to current stock overlap"
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    source: "FleetReturn Direct",
    externalId: "AT-YARIS-06",
    title: "Toyota Yaris Hybrid Dynamic",
    brand: "Toyota",
    model: "Yaris",
    variant: "Hybrid Dynamic",
    year: 2021,
    mileage: 54300,
    askingPrice: 15400,
    fuel: "Hybrid",
    transmission: "Automatic",
    powerHp: 116,
    location: "Amsterdam",
    sellerType: "Trader",
    description:
      "Hybrid drivetrain tested and battery report present. Good urban demand and low ownership costs.",
    medianEstimate: 18100,
    lowEstimate: 17100,
    highEstimate: 18900,
    expectedCosts: 900,
    confidenceScore: 86,
    dealScore: 90,
    reasons: ["excellent fuel economy appeal", "strong year/mileage profile", "fresh listing"],
    risks: ["hybrid battery warranty transfer to verify"],
    status: "saved"
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    source: "RegionalAutoHub",
    externalId: "MP-118I-07",
    title: "BMW 118i Sport",
    brand: "BMW",
    model: "1 Series",
    variant: "118i Sport",
    year: 2017,
    mileage: 118000,
    askingPrice: 13900,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 136,
    location: "Haarlem",
    sellerType: "Private",
    description:
      "Sport package, mostly highway mileage, and maintained at official dealer until 100k km.",
    medianEstimate: 15300,
    lowEstimate: 14400,
    highEstimate: 16300,
    expectedCosts: 1400,
    confidenceScore: 68,
    dealScore: 58,
    reasons: ["brand still attracts younger buyers"],
    risks: ["older model year", "manual transmission narrows buyer pool"]
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    source: "DealerStock NL",
    externalId: "AS24-PASSAT-08",
    title: "Volkswagen Passat Variant 2.0 TDI",
    brand: "Volkswagen",
    model: "Passat Variant",
    variant: "2.0 TDI",
    year: 2018,
    mileage: 158000,
    askingPrice: 14950,
    fuel: "Diesel",
    transmission: "Automatic",
    powerHp: 150,
    location: "Breda",
    sellerType: "Trader",
    description:
      "Large estate with complete maintenance logs and towing package. DPF replaced recently.",
    medianEstimate: 17250,
    lowEstimate: 16400,
    highEstimate: 18100,
    expectedCosts: 1900,
    confidenceScore: 71,
    dealScore: 63,
    reasons: ["estate demand remains stable for B2B buyers"],
    risks: ["high mileage", "diesel demand varies by city"]
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    source: "PremiumLease Exchange",
    externalId: "MDE-C220D-09",
    title: "Mercedes C220d Estate Avantgarde",
    brand: "Mercedes",
    model: "C-Class Estate",
    variant: "C220d Avantgarde",
    year: 2017,
    mileage: 172000,
    askingPrice: 17400,
    fuel: "Diesel",
    transmission: "Automatic",
    powerHp: 170,
    location: "Tilburg",
    sellerType: "Trader",
    description:
      "Long-distance commuter car with premium interior. Front suspension bushings expected soon.",
    medianEstimate: 18800,
    lowEstimate: 17800,
    highEstimate: 19800,
    expectedCosts: 2200,
    confidenceScore: 65,
    dealScore: 45,
    reasons: ["premium wagon still in demand"],
    risks: ["high mileage", "maintenance cost volatility", "older drivetrain"]
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    source: "DealerStock NL",
    externalId: "AS24-A3-10",
    title: "Audi A3 Sportback 35 TFSI",
    brand: "Audi",
    model: "A3 Sportback",
    variant: "35 TFSI",
    year: 2020,
    mileage: 61200,
    askingPrice: 21900,
    fuel: "Petrol",
    transmission: "Automatic",
    powerHp: 150,
    location: "Groningen",
    sellerType: "Trader",
    description:
      "Attractive spec with virtual cockpit and adaptive cruise. One lease owner and clean body.",
    medianEstimate: 24800,
    lowEstimate: 23700,
    highEstimate: 25900,
    expectedCosts: 1300,
    confidenceScore: 83,
    dealScore: 86,
    reasons: ["strong retail demand", "low mileage for year", "pricing under market median"],
    risks: ["higher acquisition amount impacts cash flow"],
    status: "contacted"
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    source: "FleetReturn Direct",
    externalId: "AT-CLIO-11",
    title: "Renault Clio 1.0 TCe Intens",
    brand: "Renault",
    model: "Clio",
    variant: "1.0 TCe Intens",
    year: 2021,
    mileage: 42300,
    askingPrice: 12450,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 100,
    location: "Zwolle",
    sellerType: "Trader",
    description:
      "Compact hatch with infotainment and camera package. Body and interior both clean.",
    medianEstimate: 14200,
    lowEstimate: 13500,
    highEstimate: 14900,
    expectedCosts: 850,
    confidenceScore: 75,
    dealScore: 66,
    reasons: ["quick-selling city car category"],
    risks: ["limited gross margin headroom"]
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    source: "RegionalAutoHub",
    externalId: "MP-208-12",
    title: "Peugeot 208 1.2 PureTech Allure",
    brand: "Peugeot",
    model: "208",
    variant: "1.2 PureTech Allure",
    year: 2020,
    mileage: 68500,
    askingPrice: 13200,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 100,
    location: "Arnhem",
    sellerType: "Trader",
    description:
      "City-focused hatch with navigation, rear camera and full maintenance records. Clean interior and recent service.",
    medianEstimate: 15100,
    lowEstimate: 14300,
    highEstimate: 15900,
    expectedCosts: 950,
    confidenceScore: 76,
    dealScore: 72,
    reasons: ["popular city hatch segment", "asking price below comparable dealer inventory"],
    risks: ["competitive segment with high listing volume"]
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    source: "PremiumLease Exchange",
    externalId: "MDE-OCTAVIA-13",
    title: "Skoda Octavia Combi 1.5 TSI",
    brand: "Skoda",
    model: "Octavia Combi",
    variant: "1.5 TSI",
    year: 2020,
    mileage: 84500,
    askingPrice: 16900,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 150,
    location: "Nijmegen",
    sellerType: "Trader",
    description:
      "Large trunk and active safety package. Excellent maintenance record and recent tire set.",
    medianEstimate: 19600,
    lowEstimate: 18600,
    highEstimate: 20500,
    expectedCosts: 1300,
    confidenceScore: 82,
    dealScore: 84,
    reasons: ["high practical-demand segment", "priced below similar listings"],
    risks: ["manual gearbox slows sale in some regions"],
    status: "saved"
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    source: "DealerStock NL",
    externalId: "AS24-CEED-14",
    title: "Kia Ceed Sportswagon 1.6 CRDi",
    brand: "Kia",
    model: "Ceed Sportswagon",
    variant: "1.6 CRDi",
    year: 2019,
    mileage: 96000,
    askingPrice: 13750,
    fuel: "Diesel",
    transmission: "Manual",
    powerHp: 136,
    location: "Maastricht",
    sellerType: "Trader",
    description:
      "Reliable wagon with lane assist and full dealer history. Minor wheel curb rash.",
    medianEstimate: 15100,
    lowEstimate: 14400,
    highEstimate: 15900,
    expectedCosts: 1000,
    confidenceScore: 70,
    dealScore: 57,
    reasons: ["known reliability profile"],
    risks: ["thin margin after prep", "diesel preference mismatch"]
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    source: "FleetReturn Direct",
    externalId: "AT-QASHQAI-15",
    title: "Nissan Qashqai 1.3 DIG-T N-Connecta",
    brand: "Nissan",
    model: "Qashqai",
    variant: "1.3 DIG-T N-Connecta",
    year: 2018,
    mileage: 109000,
    askingPrice: 16200,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 140,
    location: "Apeldoorn",
    sellerType: "Trader",
    description:
      "SUV crossover with panoramic roof and camera package. Service invoices available from 2019 onward.",
    medianEstimate: 17900,
    lowEstimate: 17000,
    highEstimate: 18700,
    expectedCosts: 1500,
    confidenceScore: 72,
    dealScore: 62,
    reasons: ["SUV body style still performs well"],
    risks: ["manual transmission", "market supply is high"]
  },
  {
    id: "00000000-0000-0000-0000-000000000016",
    source: "PremiumLease Exchange",
    externalId: "MDE-I30-16",
    title: "Hyundai i30 Wagon 1.4 T-GDI Premium",
    brand: "Hyundai",
    model: "i30 Wagon",
    variant: "1.4 T-GDI Premium",
    year: 2019,
    mileage: 79200,
    askingPrice: 14800,
    fuel: "Petrol",
    transmission: "Automatic",
    powerHp: 140,
    location: "Amersfoort",
    sellerType: "Trader",
    description:
      "Practical estate with heated seats and full LED package. Clean body and verified mileage.",
    medianEstimate: 16900,
    lowEstimate: 16100,
    highEstimate: 17700,
    expectedCosts: 1200,
    confidenceScore: 78,
    dealScore: 74,
    reasons: ["balanced age and mileage", "good feature package"],
    risks: ["slightly slower brand turnover than German peers"]
  },
  {
    id: "00000000-0000-0000-0000-000000000017",
    source: "RegionalAutoHub",
    externalId: "MP-ASTRA-17",
    title: "Opel Astra Sports Tourer 1.2 Turbo",
    brand: "Opel",
    model: "Astra Sports Tourer",
    variant: "1.2 Turbo",
    year: 2020,
    mileage: 68200,
    askingPrice: 13400,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 130,
    location: "Dordrecht",
    sellerType: "Trader",
    description:
      "Wagon with Apple CarPlay and adaptive cruise. Slight dent near rear bumper.",
    medianEstimate: 14900,
    lowEstimate: 14100,
    highEstimate: 15700,
    expectedCosts: 1300,
    confidenceScore: 67,
    dealScore: 52,
    reasons: ["good utility profile"],
    risks: ["small margin", "cosmetic repair needed"]
  },
  {
    id: "00000000-0000-0000-0000-000000000018",
    source: "DealerStock NL",
    externalId: "AS24-V60-18",
    title: "Volvo V60 D3 Momentum",
    brand: "Volvo",
    model: "V60",
    variant: "D3 Momentum",
    year: 2018,
    mileage: 146000,
    askingPrice: 18600,
    fuel: "Diesel",
    transmission: "Automatic",
    powerHp: 150,
    location: "Leeuwarden",
    sellerType: "Trader",
    description:
      "Premium wagon with full safety suite and detailed service records. Rear brakes near replacement.",
    medianEstimate: 20500,
    lowEstimate: 19400,
    highEstimate: 21400,
    expectedCosts: 1900,
    confidenceScore: 73,
    dealScore: 60,
    reasons: ["Volvo wagon retains strong niche demand"],
    risks: ["higher prep cost risk", "high mileage"]
  },
  {
    id: "00000000-0000-0000-0000-000000000019",
    source: "PremiumLease Exchange",
    externalId: "MDE-MODEL3-19",
    title: "Tesla Model 3 Standard Range Plus",
    brand: "Tesla",
    model: "Model 3",
    variant: "Standard Range Plus",
    year: 2021,
    mileage: 89000,
    askingPrice: 27800,
    fuel: "Electric",
    transmission: "Automatic",
    powerHp: 283,
    location: "Amsterdam",
    sellerType: "Trader",
    description:
      "Battery health at 91 percent and recent tire replacement. Includes charging cable and Type 2 adapter.",
    medianEstimate: 29800,
    lowEstimate: 28600,
    highEstimate: 31000,
    expectedCosts: 1200,
    confidenceScore: 81,
    dealScore: 72,
    reasons: ["EV demand remains resilient", "battery report available"],
    risks: ["price volatility in EV market", "higher capital lock"]
  },
  {
    id: "00000000-0000-0000-0000-000000000020",
    source: "FleetReturn Direct",
    externalId: "AT-MAZDA3-20",
    title: "Mazda 3 Hatchback Skyactiv-G",
    brand: "Mazda",
    model: "3 Hatchback",
    variant: "Skyactiv-G",
    year: 2019,
    mileage: 73300,
    askingPrice: 15450,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 122,
    location: "Almere",
    sellerType: "Trader",
    description:
      "Sporty hatch in metallic grey with full service history and upgraded infotainment.",
    medianEstimate: 17100,
    lowEstimate: 16300,
    highEstimate: 17900,
    expectedCosts: 900,
    confidenceScore: 76,
    dealScore: 69,
    reasons: ["reliable drivetrain", "good visual condition"],
    risks: ["manual transmission"]
  },
  {
    id: "00000000-0000-0000-0000-000000000021",
    source: "RegionalAutoHub",
    externalId: "MP-520D-21",
    title: "BMW 520d Touring Business Edition",
    brand: "BMW",
    model: "5 Series Touring",
    variant: "520d Business Edition",
    year: 2017,
    mileage: 184000,
    askingPrice: 18700,
    fuel: "Diesel",
    transmission: "Automatic",
    powerHp: 190,
    location: "Venlo",
    sellerType: "Trader",
    description:
      "Executive wagon with premium leather and adaptive LED lights. Drives well but mileage is high.",
    medianEstimate: 20400,
    lowEstimate: 19300,
    highEstimate: 21400,
    expectedCosts: 2400,
    confidenceScore: 62,
    dealScore: 38,
    reasons: ["premium wagon demand in export channels"],
    risks: ["high mileage", "older model year", "possible gearbox wear"]
  },
  {
    id: "00000000-0000-0000-0000-000000000022",
    source: "DealerStock NL",
    externalId: "AS24-POLO-22",
    title: "Volkswagen Polo 1.0 TSI Comfortline",
    brand: "Volkswagen",
    model: "Polo",
    variant: "1.0 TSI Comfortline",
    year: 2020,
    mileage: 51200,
    askingPrice: 12950,
    fuel: "Petrol",
    transmission: "Manual",
    powerHp: 95,
    location: "Utrecht",
    sellerType: "Private",
    description:
      "Compact hatch with parking sensors and clean interior. Maintenance booklet present.",
    medianEstimate: 14800,
    lowEstimate: 14000,
    highEstimate: 15600,
    expectedCosts: 850,
    confidenceScore: 79,
    dealScore: 77,
    reasons: ["strong city-car demand", "low mileage"],
    risks: ["private sale paperwork verification"]
  },
  {
    id: "00000000-0000-0000-0000-000000000023",
    source: "PremiumLease Exchange",
    externalId: "MDE-CLA-23",
    title: "Mercedes CLA 180 Shooting Brake",
    brand: "Mercedes",
    model: "CLA Shooting Brake",
    variant: "CLA 180",
    year: 2019,
    mileage: 92100,
    askingPrice: 23600,
    fuel: "Petrol",
    transmission: "Automatic",
    powerHp: 136,
    location: "Rotterdam",
    sellerType: "Trader",
    description:
      "Desirable body style and premium interior. Last service at 88k km and no visible body damage.",
    medianEstimate: 25800,
    lowEstimate: 24600,
    highEstimate: 26800,
    expectedCosts: 1600,
    confidenceScore: 82,
    dealScore: 75,
    reasons: ["premium body style demand", "priced under similar dealer stock"],
    risks: ["slower sale window in niche segment"]
  },
  {
    id: "00000000-0000-0000-0000-000000000024",
    source: "FleetReturn Direct",
    externalId: "AT-Q2-24",
    title: "Audi Q2 30 TDI S tronic",
    brand: "Audi",
    model: "Q2",
    variant: "30 TDI S tronic",
    year: 2019,
    mileage: 87600,
    askingPrice: 22400,
    fuel: "Diesel",
    transmission: "Automatic",
    powerHp: 116,
    location: "The Hague",
    sellerType: "Trader",
    description:
      "Compact premium SUV with navigation plus and digital cluster. Exterior and interior in good order.",
    medianEstimate: 24400,
    lowEstimate: 23300,
    highEstimate: 25300,
    expectedCosts: 1700,
    confidenceScore: 74,
    dealScore: 64,
    reasons: ["premium compact SUV category", "good service records"],
    risks: ["diesel demand region dependent"]
  },
  {
    id: "00000000-0000-0000-0000-000000000025",
    source: "DealerStock NL",
    externalId: "AS24-COROLLA-25",
    title: "Toyota Corolla Touring Sports 2.0 Hybrid",
    brand: "Toyota",
    model: "Corolla Touring Sports",
    variant: "2.0 Hybrid",
    year: 2020,
    mileage: 66900,
    askingPrice: 21450,
    fuel: "Hybrid",
    transmission: "Automatic",
    powerHp: 184,
    location: "Arnhem",
    sellerType: "Trader",
    description:
      "Popular hybrid wagon with complete maintenance and advanced safety package.",
    medianEstimate: 23600,
    lowEstimate: 22500,
    highEstimate: 24500,
    expectedCosts: 1000,
    confidenceScore: 85,
    dealScore: 83,
    reasons: ["hybrid estate with strong demand", "clean ownership history"],
    risks: ["higher acquisition ticket"]
  },
  {
    id: "00000000-0000-0000-0000-000000000026",
    source: "RegionalAutoHub",
    externalId: "MP-FOCUS-26",
    title: "Ford Focus Wagon 1.5 EcoBlue Titanium",
    brand: "Ford",
    model: "Focus Wagon",
    variant: "1.5 EcoBlue Titanium",
    year: 2019,
    mileage: 112500,
    askingPrice: 14100,
    fuel: "Diesel",
    transmission: "Manual",
    powerHp: 120,
    location: "Zwolle",
    sellerType: "Trader",
    description:
      "Well-specced wagon with navigation and heated front seats. Paint needs correction on bonnet.",
    medianEstimate: 15600,
    lowEstimate: 14800,
    highEstimate: 16400,
    expectedCosts: 1300,
    confidenceScore: 68,
    dealScore: 55,
    reasons: ["wagon format remains practical", "asking price below local average"],
    risks: ["mileage above dealer preference", "cosmetic prep risk"]
  }
];

export const mockListings: Listing[] = seedDeals.map((deal, index) => ({
  id: deal.id,
  source: deal.source,
  externalId: deal.externalId,
  sourceUrl: `https://www.example.com/listings/${deal.externalId.toLowerCase()}`,
  title: deal.title,
  brand: deal.brand,
  model: deal.model,
  variant: deal.variant,
  year: deal.year,
  mileage: deal.mileage,
  askingPrice: deal.askingPrice,
  fuel: deal.fuel,
  transmission: deal.transmission,
  powerHp: deal.powerHp,
  location: deal.location,
  sellerType: deal.sellerType,
  description: deal.description,
  imageUrls: [imagePool[index % imagePool.length], imagePool[(index + 3) % imagePool.length]],
  firstSeenAt: hoursAgo((index + 1) * 2),
  createdAt: hoursAgo((index + 1) * 2),
  listingType: "deal" as const
}));

// Mock comparables provide 2 entries per deal (1 strict, 1 relaxed).
// Costs and scores are derived by the same engine used in production so that
// demo-mode and live-mode output stay consistent.
const MOCK_COMPARABLE_COUNT = 2;
const MOCK_STRICT_MATCH_COUNT = 1;

export const mockValuations: Valuation[] = seedDeals.map((deal, index) => {
  const listing = mockListings[index];
  const breakdown = buildValuationCostBreakdown({
    listing,
    estimatedResaleValue: deal.medianEstimate,
    lowEstimate: deal.lowEstimate,
    highEstimate: deal.highEstimate,
    comparableCount: MOCK_COMPARABLE_COUNT,
    strictMatchCount: MOCK_STRICT_MATCH_COUNT
  });
  const confidenceScore = buildConfidenceScore({
    comparableCount: MOCK_COMPARABLE_COUNT,
    strictMatchCount: MOCK_STRICT_MATCH_COUNT,
    spreadRatio: breakdown.spreadRatio,
    projectedDaysToSell: breakdown.projectedDaysToSell
  });
  const dealScore = buildDealScore(breakdown, confidenceScore);
  return {
    id: `valuation-${index + 1}`,
    listingId: deal.id,
    lowEstimate: deal.lowEstimate,
    medianEstimate: deal.medianEstimate,
    highEstimate: deal.highEstimate,
    expectedCosts: breakdown.expectedCosts,
    expectedProfit: breakdown.expectedProfit,
    confidenceScore,
    dealScore,
    reasons: deal.reasons,
    risks: deal.risks,
    createdAt: hoursAgo((index + 1) * 2),
    valuationSource: "comparable_based" as const
  };
});

export const mockComparables: Comparable[] = seedDeals.flatMap((deal, index) => {
  const baseYear = Math.max(2015, deal.year - 1);
  return [
    {
      id: `cmp-${index + 1}-1`,
      listingId: deal.id,
      comparableTitle: `${deal.brand} ${deal.model} similar spec`,
      comparablePrice: deal.medianEstimate - 700,
      comparableYear: baseYear,
      comparableMileage: deal.mileage + 10000,
      comparableSource: "DealerStock NL",
      comparableUrl: `https://www.example.com/comparables/${deal.externalId.toLowerCase()}-a`
    },
    {
      id: `cmp-${index + 1}-2`,
      listingId: deal.id,
      comparableTitle: `${deal.brand} ${deal.model} low mileage`,
      comparablePrice: deal.medianEstimate + 500,
      comparableYear: deal.year,
      comparableMileage: Math.max(30000, deal.mileage - 12000),
      comparableSource: "PremiumLease Exchange",
      comparableUrl: `https://www.example.com/comparables/${deal.externalId.toLowerCase()}-b`
    }
  ];
});

export const mockDealStatuses: DealStatus[] = seedDeals
  .filter((deal) => Boolean(deal.status))
  .map((deal, index) => ({
    id: `status-${index + 1}`,
    dealerId: DEMO_DEALER_ID,
    listingId: deal.id,
    status: deal.status ?? "new",
    note: deal.note ?? "",
    createdAt: hoursAgo((index + 1) * 4),
    updatedAt: hoursAgo((index + 1) * 2)
  }));

export const mockDealerPreferences: DealerPreference = {
  id: "pref-1",
  dealerId: DEMO_DEALER_ID,
  preferredBrands: ["BMW", "Audi", "Volkswagen", "Toyota"],
  preferredModels: ["Golf", "A4 Avant", "320d Touring", "Corolla Touring Sports"],
  minYear: 2017,
  maxMileage: 140000,
  minPrice: 7000,
  maxPrice: 26000,
  minExpectedProfit: 1500,
  fuelTypes: ["Petrol", "Diesel", "Hybrid"],
  transmissions: ["Automatic", "Manual"],
  monitoringIntensity: "balanced",
  selectedSourceGroups: ["AutoScout24"],
  reconCostBaseOverride: null,
  dailyHoldingCostOverride: null,
  riskBufferBaseOverride: null,
  lastScanAt: null,
  lastScanAnalyzed: null,
  createdAt: hoursAgo(200),
  updatedAt: hoursAgo(4)
};

export function getDefaultStatus(listingId: string): DealLifecycleStatus {
  const status = mockDealStatuses.find((item) => item.listingId === listingId);
  return status?.status ?? "new";
}

export function getDefaultNote(listingId: string): string {
  const status = mockDealStatuses.find((item) => item.listingId === listingId);
  return status?.note ?? "";
}
