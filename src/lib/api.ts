// API helpers — swap BASE_URL + remove mocks to connect your Flask/FastAPI backend
// (which should call NASA POWER: https://power.larc.nasa.gov/api/temporal/climatology/point).
export const API_BASE_URL = "http://localhost:8000/api";
const USE_MOCK = true;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type LatLng = { lat: number; lng: number; label?: string };

export type SoilInput = {
  location: LatLng;
  soilType: string;
  cropHistory: string[];
  fertilizers: string[];
  irrigation: string;
  season: string;
  notes: string;
};

export type NasaData = { temperature: number; humidity: number; rainfall: number; soilMoisture: number; ph: number; solar: number };

export type CropRecommendation = { name: string; score: number; season: string; yieldEstimate: string; reasons: string[] };

export type HealthInput = { location: LatLng; crop: string; symptoms: string; soilCondition: string };

export type Diagnosis = {
  problem: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High";
  cause: string;
  actions: { title: string; detail: string }[];
  products: { name: string; type: string; price: string; vendor: string; rating: number }[];
};

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function fetchNasaData(loc: LatLng): Promise<NasaData> {
  if (!USE_MOCK) return post("/nasa/power", loc);
  await delay(1200);
  const t = 26 + Math.round((24 - Math.abs(loc.lat)) / 3);
  return { temperature: t, humidity: 78, rainfall: 2150, soilMoisture: 0.34, ph: 6.4, solar: 4.8 };
}

export async function getCropRecommendations(input: SoilInput): Promise<{ nasa: NasaData; crops: CropRecommendation[] }> {
  if (!USE_MOCK) return post("/recommend-crops", input);
  const nasa = await fetchNasaData(input.location);
  await delay(900);
  const clayish = ["Clay", "Silt"].includes(input.soilType);
  const crops: CropRecommendation[] = [
    {
      name: clayish ? "Aman Rice" : "Jute",
      score: clayish ? 94 : 88,
      season: "Kharif (Jun–Nov)",
      yieldEstimate: clayish ? "4.8 t/ha" : "2.6 t/ha",
      reasons: [
        `Soil pH ${nasa.ph} is within the ideal 5.5–7.0 range.`,
        `${nasa.rainfall} mm annual rainfall supports water-intensive growth.`,
        `${input.soilType} soil retains moisture (${Math.round(nasa.soilMoisture * 100)}% root-zone wetness).`,
      ],
    },
    {
      name: "Mustard",
      score: 82,
      season: "Rabi (Oct–Feb)",
      yieldEstimate: "1.4 t/ha",
      reasons: [
        `Cool-season temperatures after ${nasa.temperature}°C summer peak suit oilseeds.`,
        input.cropHistory.length ? `Rotating after ${input.cropHistory.join(", ")} breaks pest cycles.` : "Good rotation crop to restore soil structure.",
        `Low water demand fits ${input.irrigation.toLowerCase()} irrigation.`,
      ],
    },
    {
      name: "Lentil",
      score: 74,
      season: "Rabi (Nov–Mar)",
      yieldEstimate: "1.1 t/ha",
      reasons: [
        "Legume fixes nitrogen, reducing future fertilizer needs.",
        `Solar radiation of ${nasa.solar} kWh/m²/day is sufficient for pod filling.`,
        input.fertilizers.includes("Urea") ? "Offsets heavy past urea use by naturally balancing soil N." : "Tolerant of moderate nutrient levels.",
      ],
    },
  ];
  return { nasa, crops };
}

export async function diagnoseCropHealth(input: HealthInput): Promise<{ nasa: NasaData; diagnosis: Diagnosis }> {
  if (!USE_MOCK) return post("/diagnose", input);
  const nasa = await fetchNasaData(input.location);
  await delay(900);
  const s = input.symptoms.toLowerCase();
  const fungal = s.includes("spot") || s.includes("brown") || input.soilCondition === "Over-watered";
  const diagnosis: Diagnosis = fungal
    ? {
        problem: `${input.crop} Leaf Blast / Brown Spot (fungal)`,
        confidence: 87,
        severity: "Moderate",
        cause: `High humidity (${nasa.humidity}%) and ${input.soilCondition.toLowerCase()} soil favour fungal spore spread.`,
        actions: [
          { title: "Improve drainage", detail: "Open field channels and pause irrigation for 5–7 days." },
          { title: "Apply fungicide", detail: "Spray Tricyclazole 75 WP @ 0.6 g/L water in the evening." },
          { title: "Balance nutrients", detail: "Reduce urea; apply potash (MoP) at 30 kg/ha to strengthen cell walls." },
          { title: "Remove infected leaves", detail: "Burn or bury affected residue away from the field." },
        ],
        products: [
          { name: "Trooper 75 WP (Tricyclazole)", type: "Fungicide", price: "৳ 180 / 100 g", vendor: "ACI Agribusiness", rating: 4.6 },
          { name: "Muriate of Potash (MoP)", type: "Fertilizer", price: "৳ 1,100 / 50 kg", vendor: "BADC Dealer", rating: 4.4 },
          { name: "BRRI dhan 89 seed", type: "Resistant seed", price: "৳ 60 / kg", vendor: "BADC Seed Centre", rating: 4.8 },
        ],
      }
    : {
        problem: `${input.crop} Nutrient deficiency / pest stress`,
        confidence: 72,
        severity: "Low",
        cause: `Temperature of ${nasa.temperature}°C with ${input.soilCondition.toLowerCase()} soil suggests moisture and nitrogen stress.`,
        actions: [
          { title: "Adjust watering", detail: "Keep root zone evenly moist; irrigate early morning." },
          { title: "Top-dress nitrogen", detail: "Apply urea at 20 kg/ha split in two doses." },
          { title: "Scout for pests", detail: "Check leaf undersides; use yellow sticky traps." },
        ],
        products: [
          { name: "Urea (Granular)", type: "Fertilizer", price: "৳ 1,350 / 50 kg", vendor: "BCIC Dealer", rating: 4.3 },
          { name: "Neem Oil 1500 ppm", type: "Bio-pesticide", price: "৳ 450 / 500 ml", vendor: "Krishi Bazar", rating: 4.5 },
          { name: "Yellow Sticky Traps (10)", type: "Pest control", price: "৳ 250", vendor: "Agro Mart BD", rating: 4.2 },
        ],
      };
  return { nasa, diagnosis };
}
