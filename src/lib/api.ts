
export const API_BASE_URL = "http://localhost:8000/api";

const USE_MOCK_RECOMMENDATIONS = true;
const USE_MOCK_DIAGNOSIS = true;

export type LatLng = {
  lat: number;
  lng: number;
  label?: string;
};

export type SoilInput = {
  location: LatLng;
  soilType: string;
  cropHistory: string[];
  fertilizers: string[];
  irrigation: string;
  season: string;
  notes: string;
};

export type NasaData = {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  soilMoisture: number | null;
  ph: number | null;
  solar: number | null;
  source?: string;
  period?: {
    start: string;
    end: string;
  };
};

export type ModisData = {
  ndvi: number | null;
  imageCount: number;
  latestObservation?: string;
  source: string;
  resolution?: string;
  area?: string;
  period?: {
    start: string;
    end: string;
  };
  message?: string;
};

export type SmapData = {
  surfaceSoilMoisture: number | null;
  rootZoneSoilMoisture: number | null;
  imageCount: number;
  latestObservation?: string;
  unit: string;
  source: string;
  resolution?: string;
  temporalResolution?: string;
  period?: {
    start: string;
    end: string;
  };
  message?: string;
};

export type EnvironmentalIndicator = {
  name: string;
  status: "Normal" | "Watch" | "Warning" | "Unavailable";
  value: string;
  explanation: string;
};

export type EnvironmentalStressAssessment = {
  riskLevel: "Low" | "Moderate" | "High" | "Insufficient data";
  riskScore: number;
  summary: string;
  indicators: EnvironmentalIndicator[];
  nasa: NasaData | null;
  modis: ModisData | null;
  smap: SmapData | null;
};

export type CropRecommendation = {
  name: string;
  score: number;
  season: string;
  yieldEstimate: string;
  reasons: string[];
};

export type HealthInput = {
  location: LatLng;
  crop: string;
  symptoms: string;
  soilCondition: string;
};

export type Diagnosis = {
  problem: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High";
  cause: string;
  actions: {
    title: string;
    detail: string;
  }[];
  products: {
    name: string;
    type: string;
    price: string;
    vendor: string;
    rating: number;
  }[];
};


// --------------------------------
// API REQUEST HELPER
// --------------------------------

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}


// --------------------------------
// NASA POWER
// --------------------------------

export async function fetchNasaData(
  loc: LatLng
): Promise<NasaData> {
  return post<NasaData>("/nasa/power", loc);
}


// --------------------------------
// NASA MODIS NDVI
// --------------------------------

export async function fetchModisNdvi(
  loc: LatLng
): Promise<ModisData> {
  return post<ModisData>("/nasa/modis-ndvi", loc);
}


// --------------------------------
// NASA SMAP SOIL MOISTURE
// --------------------------------

export async function fetchSmapSoilMoisture(
  loc: LatLng
): Promise<SmapData> {
  return post<SmapData>("/nasa/smap-soil-moisture", loc);
}

export async function assessEnvironmentalStress(
  loc: LatLng
): Promise<EnvironmentalStressAssessment> {

  // Fetch all three NASA datasets
  const [powerResult, modisResult, smapResult] =
    await Promise.allSettled([
      fetchNasaData(loc),
      fetchModisNdvi(loc),
      fetchSmapSoilMoisture(loc)
    ]);

  const nasa =
    powerResult.status === "fulfilled"
      ? powerResult.value
      : null;

  const modis =
    modisResult.status === "fulfilled"
      ? modisResult.value
      : null;

  const smap =
    smapResult.status === "fulfilled"
      ? smapResult.value
      : null;

  const indicators: EnvironmentalIndicator[] = [];

  let riskScore = 0;
  let availableIndicators = 0;

  // --------------------------------
  // 1. TEMPERATURE
  // --------------------------------

  if (nasa?.temperature != null) {
    availableIndicators++;

    if (nasa.temperature >= 35) {
      riskScore += 2;

      indicators.push({
        name: "Temperature",
        status: "Warning",
        value: `${nasa.temperature}°C`,
        explanation:
          "High average temperature may increase crop heat stress."
      });

    } else if (nasa.temperature >= 32) {
      riskScore += 1;

      indicators.push({
        name: "Temperature",
        status: "Watch",
        value: `${nasa.temperature}°C`,
        explanation:
          "Elevated average temperature. Monitor crop water needs."
      });

    } else {
      indicators.push({
        name: "Temperature",
        status: "Normal",
        value: `${nasa.temperature}°C`,
        explanation:
          "No high-temperature warning from this screening threshold."
      });
    }

  } else {
    indicators.push({
      name: "Temperature",
      status: "Unavailable",
      value: "Unavailable",
      explanation: "NASA POWER temperature data is unavailable."
    });
  }


  // --------------------------------
  // 2. HUMIDITY
  // --------------------------------

  if (nasa?.humidity != null) {
    availableIndicators++;

    if (nasa.humidity >= 85) {
      riskScore += 2;

      indicators.push({
        name: "Humidity",
        status: "Warning",
        value: `${nasa.humidity}%`,
        explanation:
          "High humidity can create conditions favourable to some fungal diseases."
      });

    } else if (nasa.humidity >= 75) {
      riskScore += 1;

      indicators.push({
        name: "Humidity",
        status: "Watch",
        value: `${nasa.humidity}%`,
        explanation:
          "Humidity is elevated. Monitor crop conditions and leaf wetness."
      });

    } else {
      indicators.push({
        name: "Humidity",
        status: "Normal",
        value: `${nasa.humidity}%`,
        explanation:
          "No high-humidity warning from this screening threshold."
      });
    }

  } else {
    indicators.push({
      name: "Humidity",
      status: "Unavailable",
      value: "Unavailable",
      explanation: "NASA POWER humidity data is unavailable."
    });
  }


  // --------------------------------
  // 3. RAINFALL
  // --------------------------------

  if (nasa?.rainfall != null) {
    availableIndicators++;

    if (nasa.rainfall >= 200) {
      riskScore += 2;

      indicators.push({
        name: "Rainfall",
        status: "Warning",
        value: `${nasa.rainfall} mm`,
        explanation:
          "High rainfall over the selected 30-day period may increase waterlogging risk."
      });

    } else if (nasa.rainfall < 10) {
      riskScore += 2;

      indicators.push({
        name: "Rainfall",
        status: "Warning",
        value: `${nasa.rainfall} mm`,
        explanation:
          "Very low rainfall over the selected 30-day period may indicate a dry spell."
      });

    } else if (nasa.rainfall < 30) {
      riskScore += 1;

      indicators.push({
        name: "Rainfall",
        status: "Watch",
        value: `${nasa.rainfall} mm`,
        explanation:
          "Rainfall is relatively low. Monitor soil moisture and irrigation needs."
      });

    } else {
      indicators.push({
        name: "Rainfall",
        status: "Normal",
        value: `${nasa.rainfall} mm`,
        explanation:
          "No rainfall warning from this screening threshold."
      });
    }

  } else {
    indicators.push({
      name: "Rainfall",
      status: "Unavailable",
      value: "Unavailable",
      explanation: "NASA POWER rainfall data is unavailable."
    });
  }


  // --------------------------------
  // 4. MODIS NDVI
  // --------------------------------

  if (modis?.ndvi != null) {
    availableIndicators++;

    if (modis.ndvi < 0.3) {
      riskScore += 2;

      indicators.push({
        name: "Vegetation Greenness",
        status: "Warning",
        value: modis.ndvi.toFixed(4),
        explanation:
          "Low average vegetation greenness. Check crop coverage, growth stage and field conditions."
      });

    } else if (modis.ndvi < 0.5) {
      riskScore += 1;

      indicators.push({
        name: "Vegetation Greenness",
        status: "Watch",
        value: modis.ndvi.toFixed(4),
        explanation:
          "Moderate vegetation greenness. Compare with previous observations and crop growth stage."
      });

    } else {
      indicators.push({
        name: "Vegetation Greenness",
        status: "Normal",
        value: modis.ndvi.toFixed(4),
        explanation:
          "Relatively high vegetation greenness across the selected area."
      });
    }

  } else {
    indicators.push({
      name: "Vegetation Greenness",
      status: "Unavailable",
      value: "Unavailable",
      explanation: "NASA MODIS NDVI data is unavailable."
    });
  }


  // --------------------------------
  // 5. SMAP ROOT-ZONE SOIL MOISTURE
  // --------------------------------

  if (smap?.rootZoneSoilMoisture != null) {
    availableIndicators++;

    const moisture = smap.rootZoneSoilMoisture;

    if (moisture < 0.10) {
      riskScore += 2;

      indicators.push({
        name: "Root-zone Soil Moisture",
        status: "Warning",
        value: moisture.toFixed(4),
        explanation:
          "Low estimated root-zone moisture. Check field soil conditions and irrigation needs."
      });

    } else if (moisture < 0.20) {
      riskScore += 1;

      indicators.push({
        name: "Root-zone Soil Moisture",
        status: "Watch",
        value: moisture.toFixed(4),
        explanation:
          "Estimated root-zone moisture is relatively low. Interpret according to soil type and crop."
      });

    } else {
      indicators.push({
        name: "Root-zone Soil Moisture",
        status: "Normal",
        value: moisture.toFixed(4),
        explanation:
          "No low-moisture warning from this screening threshold."
      });
    }

  } else {
    indicators.push({
      name: "Root-zone Soil Moisture",
      status: "Unavailable",
      value: "Unavailable",
      explanation: "NASA SMAP root-zone soil moisture is unavailable."
    });
  }


  // --------------------------------
  // FINAL RISK LEVEL
  // --------------------------------

  let riskLevel: EnvironmentalStressAssessment["riskLevel"];

  if (availableIndicators < 3) {
    riskLevel = "Insufficient data";

  } else if (riskScore >= 6) {
    riskLevel = "High";

  } else if (riskScore >= 3) {
    riskLevel = "Moderate";

  } else {
    riskLevel = "Low";
  }


  let summary: string;

  if (availableIndicators < 3) {
    summary =
      "Not enough NASA observations are available for a reliable environmental screening.";

  } else if (riskLevel === "High") {
    summary =
      "Several environmental indicators show potential stress conditions. Field verification is recommended.";

  } else if (riskLevel === "Moderate") {
    summary =
      "Some environmental indicators need attention. Continue monitoring the crop and local field conditions.";

  } else {
    summary =
      "The available satellite indicators show relatively low environmental warning signals.";
  }


  return {
    riskLevel,
    riskScore,
    summary,
    indicators,
    nasa,
    modis,
    smap
  };
}


// --------------------------------
// CROP RECOMMENDATIONS
// --------------------------------

export async function getCropRecommendations(
  input: SoilInput
): Promise<{
  nasa: NasaData;
  crops: CropRecommendation[];
}> {

  if (!USE_MOCK_RECOMMENDATIONS) {
    return post("/recommend-crops", input);
  }

  const nasa = await fetchNasaData(input.location);

  const clayish = ["Clay", "Silt"].includes(input.soilType);

  const crops: CropRecommendation[] = [
    {
      name: clayish ? "Aman Rice" : "Jute",
      score: clayish ? 94 : 88,
      season: "Kharif (Jun–Nov)",
      yieldEstimate: clayish ? "4.8 t/ha" : "2.6 t/ha",
      reasons: [
        `NASA POWER recorded an average temperature of ${nasa.temperature ?? "unavailable"}°C.`,
        `NASA POWER recorded ${nasa.rainfall ?? "unavailable"} mm rainfall during the selected 30-day period.`,
        `${input.soilType} soil was selected by the user. Soil pH and root-zone moisture have not yet been verified.`,
      ],
    },
    {
      name: "Mustard",
      score: 82,
      season: "Rabi (Oct–Feb)",
      yieldEstimate: "1.4 t/ha",
      reasons: [
        `NASA POWER recorded an average temperature of ${nasa.temperature ?? "unavailable"}°C during the selected period.`,
        input.cropHistory.length
          ? `Previous crop history: ${input.cropHistory.join(", ")}.`
          : "Crop rotation history was not provided.",
        `The selected irrigation method is ${input.irrigation.toLowerCase()}.`,
      ],
    },
    {
      name: "Lentil",
      score: 74,
      season: "Rabi (Nov–Mar)",
      yieldEstimate: "1.1 t/ha",
      reasons: [
        "Lentil is a legume crop that can contribute to soil nitrogen through biological nitrogen fixation.",
        `NASA POWER solar radiation: ${nasa.solar ?? "unavailable"}.`,
        input.fertilizers.includes("Urea")
          ? "Urea was included in the user's fertilizer history."
          : "No previous urea use was reported.",
      ],
    },
  ];

  return {
    nasa,
    crops
  };
}


// --------------------------------
// CROP HEALTH DIAGNOSIS
// --------------------------------

export async function diagnoseCropHealth(
  input: HealthInput
): Promise<{
  nasa: NasaData;
  diagnosis: Diagnosis;
}> {

  if (!USE_MOCK_DIAGNOSIS) {
    return post("/diagnose", input);
  }

  const nasa = await fetchNasaData(input.location);

  const s = input.symptoms.toLowerCase();

  const fungal =
    s.includes("spot") ||
    s.includes("brown") ||
    input.soilCondition === "Over-watered";

  const diagnosis: Diagnosis = fungal
    ? {
        problem: `${input.crop} Leaf Blast / Brown Spot (fungal)`,
        confidence: 87,
        severity: "Moderate",
        cause: `High humidity (${nasa.humidity}%) and ${input.soilCondition.toLowerCase()} soil favour fungal spore spread.`,
        actions: [
          {
            title: "Improve drainage",
            detail: "Open field channels and pause irrigation for 5–7 days."
          },
          {
            title: "Apply fungicide",
            detail: "Spray Tricyclazole 75 WP @ 0.6 g/L water in the evening."
          },
          {
            title: "Balance nutrients",
            detail: "Reduce urea; apply potash (MoP) at 30 kg/ha to strengthen cell walls."
          },
          {
            title: "Remove infected leaves",
            detail: "Burn or bury affected residue away from the field."
          },
        ],
        products: [
          {
            name: "Trooper 75 WP (Tricyclazole)",
            type: "Fungicide",
            price: "৳ 180 / 100 g",
            vendor: "ACI Agribusiness",
            rating: 4.6
          },
          {
            name: "Muriate of Potash (MoP)",
            type: "Fertilizer",
            price: "৳ 1,100 / 50 kg",
            vendor: "BADC Dealer",
            rating: 4.4
          },
          {
            name: "BRRI dhan 89 seed",
            type: "Resistant seed",
            price: "৳ 60 / kg",
            vendor: "BADC Seed Centre",
            rating: 4.8
          },
        ],
      }
    : {
        problem: `${input.crop} Nutrient deficiency / pest stress`,
        confidence: 72,
        severity: "Low",
        cause: `Temperature of ${nasa.temperature}°C with ${input.soilCondition.toLowerCase()} soil suggests moisture and nitrogen stress.`,
        actions: [
          {
            title: "Adjust watering",
            detail: "Keep root zone evenly moist; irrigate early morning."
          },
          {
            title: "Top-dress nitrogen",
            detail: "Apply urea at 20 kg/ha split in two doses."
          },
          {
            title: "Scout for pests",
            detail: "Check leaf undersides; use yellow sticky traps."
          },
        ],
        products: [
          {
            name: "Urea (Granular)",
            type: "Fertilizer",
            price: "৳ 1,350 / 50 kg",
            vendor: "BCIC Dealer",
            rating: 4.3
          },
          {
            name: "Neem Oil 1500 ppm",
            type: "Bio-pesticide",
            price: "৳ 450 / 500 ml",
            vendor: "Krishi Bazar",
            rating: 4.5
          },
          {
            name: "Yellow Sticky Traps (10)",
            type: "Pest control",
            price: "৳ 250",
            vendor: "Agro Mart BD",
            rating: 4.2
          },
        ],
      };

  return {
    nasa,
    diagnosis
  };
}
