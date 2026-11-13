import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Star,
  Store,
  ShoppingBag
} from "lucide-react";

import {
  AppShell,
  Card,
  Label,
  Stepper,
  btn,
  btnGhost
} from "@/components/AppShell";

import { LocationPicker } from "@/components/LocationPicker";
import { NasaLoading, NasaPanel } from "@/components/NasaPanel";

import {
  diagnoseCropHealth,
  assessEnvironmentalStress,
  type Diagnosis,
  type LatLng,
  type NasaData,
  type ModisData,
  type SmapData,
  type EnvironmentalStressAssessment
} from "@/lib/api";


export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Crop Health Check — AgroCop" },
      {
        name: "description",
        content: "Check crop conditions using NASA satellite data."
      },
      {
        property: "og:title",
        content: "AgroCop Crop Health Check"
      },
      {
        property: "og:description",
        content: "Crop condition insights using NASA data."
      }
    ]
  }),

  component: () => (
    <AppShell>
      <HealthFlow />
    </AppShell>
  )
});


const CROPS = [
  "Rice",
  "Wheat",
  "Jute",
  "Potato",
  "Maize",
  "Mustard",
  "Tomato",
  "Lentil"
];

const QUICK = [
  "Brown spots on leaves",
  "Yellowing leaves",
  "Holes / insects on leaves",
  "Wilting stems",
  "White powder on leaves"
];


type HealthResult = {
  nasa: NasaData;
  diagnosis: Diagnosis;
  modis: ModisData | null;
  smap: SmapData | null;
  assessment: EnvironmentalStressAssessment;
};


function HealthFlow() {
  const [step, setStep] = useState(0);
  const [loc, setLoc] = useState<LatLng | null>(null);
  const [crop, setCrop] = useState("Rice");
  const [symptoms, setSymptoms] = useState("");
  const [soil, setSoil] = useState("Normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<HealthResult | null>(null);


  // Fetch NASA data and assess environmental stress
  const run = async () => {
    if (!loc || !symptoms.trim()) return;

    setStep(2);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const [
        diagnosisResponse,
        assessmentResponse
      ] = await Promise.allSettled([
        diagnoseCropHealth({
          location: loc,
          crop,
          symptoms: symptoms.trim(),
          soilCondition: soil
        }),
        assessEnvironmentalStress(loc)
      ]);

      if (diagnosisResponse.status === "rejected") {
        throw diagnosisResponse.reason;
      }

      if (assessmentResponse.status === "rejected") {
        throw assessmentResponse.reason;
      }

      const assessment = assessmentResponse.value;

      setResult({
        ...diagnosisResponse.value,
        modis: assessment.modis,
        smap: assessment.smap,
        assessment
      });

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load crop data."
      );
    } finally {
      setLoading(false);
    }
  };


  // Environmental indicator status styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800";
      case "Watch":
        return "bg-yellow-100 text-yellow-800";
      case "Warning":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };


  return (
    <>
      <h1 className="mb-6 font-display text-3xl sm:text-4xl">
        Crop Health Check
      </h1>

      <Stepper
        steps={["Location & crop", "Symptoms", "Diagnosis"]}
        current={step}
      />


      {/* STEP 1: LOCATION */}

      {step === 0 && (
        <Card>
          <h2 className="mb-4 text-xl">
            Where is the affected field?
          </h2>

          <LocationPicker
            value={loc}
            onChange={setLoc}
          />

          <div className="mt-5 max-w-sm">
            <Label>Current crop</Label>

            <input
              className="field"
              list="crops"
              value={crop}
              maxLength={50}
              onChange={(e) => setCrop(e.target.value)}
            />

            <datalist id="crops">
              {CROPS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              disabled={!loc || !crop.trim()}
              onClick={() => setStep(1)}
              className={btn}
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}


      {/* STEP 2: SYMPTOMS */}

      {step === 1 && (
        <Card>
          <h2 className="mb-4 text-xl">
            Describe the problem
          </h2>

          <Label>Symptoms</Label>

          <textarea
            className="field min-h-32"
            maxLength={1000}
            placeholder="Leaf marks, color changes, pests seen, when it started..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />

          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() =>
                  setSymptoms((s) =>
                    s ? `${s}, ${q.toLowerCase()}` : q
                  )
                }
                className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
              >
                + {q}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <Label>Current soil condition</Label>

            <div className="grid grid-cols-3 gap-2 sm:max-w-md">
              {["Over-watered", "Dry", "Normal"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSoil(s)}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                    soil === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(0)}
              className={btnGhost}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <button
              disabled={!symptoms.trim()}
              onClick={run}
              className={btn}
            >
              Diagnose <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}


      {/* STEP 3: RESULTS */}

      {step === 2 && (
        loading ? (
          <Card>
            <NasaLoading />
          </Card>
        ) : error ? (
          <Card>
            <p className="font-semibold text-destructive">
              Unable to load the crop data.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>

            <button
              onClick={() => setStep(1)}
              className={`${btnGhost} mt-4`}
            >
              <ArrowLeft size={16} /> Back
            </button>
          </Card>
        ) : result && (
          <div className="space-y-6">

            {/* NASA POWER */}

            <NasaPanel nasa={result.nasa} />


            {/* NASA MODIS NDVI */}

            <Card>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  NASA satellite observation
                </p>

                <h2 className="mt-1 text-xl">
                  Vegetation Index (NDVI)
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  MODIS satellite data provides an indicator of vegetation greenness.
                </p>
              </div>

              {result.modis?.ndvi !== null &&
              result.modis?.ndvi !== undefined ? (
                <>
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="font-display text-4xl text-primary">
                        {result.modis.ndvi.toFixed(4)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Average NDVI
                      </p>
                    </div>

                    <div className="text-sm">
                      <p>
                        <span className="font-medium">
                          Latest observation:
                        </span>{" "}
                        {result.modis.latestObservation ?? "Unavailable"}
                      </p>

                      <p>
                        <span className="font-medium">
                          Images used:
                        </span>{" "}
                        {result.modis.imageCount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                    <p>Source: {result.modis.source}</p>

                    <p>
                      Resolution: {result.modis.resolution ?? "Unavailable"}
                    </p>

                    <p>
                      Coverage: {result.modis.area ?? "Unavailable"}
                    </p>

                    {result.modis.period && (
                      <p>
                        Data period: {result.modis.period.start} to{" "}
                        {result.modis.period.end}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  MODIS NDVI data is currently unavailable for this location and period.
                </p>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                Note: NDVI measures vegetation greenness over the selected area.
                It does not independently identify crop diseases or confirm the
                condition of an individual field.
              </p>
            </Card>


            {/* NASA SMAP SOIL MOISTURE */}

            <Card>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  NASA satellite observation
                </p>

                <h2 className="mt-1 text-xl">
                  Soil Moisture
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Surface and root-zone soil moisture estimates from NASA SMAP.
                </p>
              </div>

              {result.smap &&
              (
                result.smap.surfaceSoilMoisture !== null ||
                result.smap.rootZoneSoilMoisture !== null
              ) ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-display text-3xl text-primary">
                        {result.smap.surfaceSoilMoisture !== null
                          ? result.smap.surfaceSoilMoisture.toFixed(4)
                          : "Unavailable"}
                      </p>

                      <p className="text-sm font-medium">
                        Surface (0–5 cm)
                      </p>

                      <p className="text-xs text-muted-foreground">
                        m³/m³
                      </p>
                    </div>

                    <div>
                      <p className="font-display text-3xl text-primary">
                        {result.smap.rootZoneSoilMoisture !== null
                          ? result.smap.rootZoneSoilMoisture.toFixed(4)
                          : "Unavailable"}
                      </p>

                      <p className="text-sm font-medium">
                        Root zone (0–100 cm)
                      </p>

                      <p className="text-xs text-muted-foreground">
                        m³/m³
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                    <p>Source: {result.smap.source}</p>

                    <p>
                      Images used: {result.smap.imageCount}
                    </p>

                    <p>
                      Latest observation:{" "}
                      {result.smap.latestObservation ?? "Unavailable"}
                    </p>

                    <p>
                      Resolution: {result.smap.resolution ?? "Unavailable"}
                    </p>

                    <p>
                      Temporal resolution:{" "}
                      {result.smap.temporalResolution ?? "Unavailable"}
                    </p>

                    {result.smap.period && (
                      <p>
                        Data period: {result.smap.period.start} to{" "}
                        {result.smap.period.end}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  NASA SMAP soil-moisture data is currently unavailable for this location.
                </p>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                Note: SMAP provides regional soil-moisture estimates at
                approximately 11 km resolution. These values do not represent
                direct measurements from an individual field.
              </p>
            </Card>


            {/* ENVIRONMENTAL STRESS ASSESSMENT */}

            <Card>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Combined NASA data analysis
                </p>

                <h2 className="mt-1 text-xl">
                  Environmental Stress Assessment
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Preliminary environmental screening based on NASA POWER,
                  MODIS and SMAP observations.
                </p>
              </div>

              <div className="mb-5 rounded-xl border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Overall environmental risk
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display text-3xl">
                    {result.assessment.riskLevel}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      result.assessment.riskLevel === "High"
                        ? "bg-red-100 text-red-800"
                        : result.assessment.riskLevel === "Moderate"
                        ? "bg-yellow-100 text-yellow-800"
                        : result.assessment.riskLevel === "Low"
                        ? "bg-green-100 text-green-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {result.assessment.riskLevel === "Insufficient data"
                      ? "More data needed"
                      : `${result.assessment.riskLevel} risk`}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {result.assessment.summary}
                </p>
              </div>

              <h3 className="mb-3 font-semibold">
                Environmental indicators
              </h3>

              <div className="space-y-3">
                {result.assessment.indicators.map((indicator) => (
                  <div
                    key={indicator.name}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">
                        {indicator.name}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(indicator.status)}`}
                      >
                        {indicator.status}
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-semibold text-primary">
                      {indicator.value}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {indicator.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  This is a prototype screening model using initial
                  thresholds. Results are not a validated crop-risk prediction.
                  Interpret observations according to crop type, growth stage,
                  local soil conditions and field inspection. Satellite data
                  does not independently confirm disease, drought or waterlogging.
                </p>
              </div>
            </Card>


            {/* ILLUSTRATIVE CROP HEALTH RESULT */}

            <Card className="border-harvest">
              <div className="flex flex-wrap items-start gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-harvest">
                  <AlertTriangle />
                </span>

                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Illustrative crop health result
                  </p>

                  <h2 className="text-2xl">
                    {result.diagnosis.problem}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    This is a simulated result based on the reported symptoms.
                    It is not a confirmed crop diagnosis.
                  </p>
                </div>

                <div className="flex gap-4 text-center">
                  <div>
                    <p className="font-display text-2xl text-primary">
                      {result.diagnosis.confidence}%
                    </p>

                    <p className="text-xs text-muted-foreground">
                      mock confidence
                    </p>
                  </div>

                  <div>
                    <p className="font-display text-2xl">
                      {result.diagnosis.severity}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      mock severity
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Prototype result: the problem label, confidence and severity
                are mock outputs. They are not calculated from NASA satellite
                data and should not be treated as a confirmed diagnosis.
              </p>
            </Card>


            {/* ILLUSTRATIVE ACTION IDEAS */}

            <Card>
              <h3 className="mb-2 text-xl">
                Illustrative action ideas
              </h3>

              <p className="mb-4 text-xs text-muted-foreground">
                These are sample suggestions from the prototype, not verified
                treatment instructions. Inspect the crop and consult a local
                agricultural officer before applying fertilizer or pesticides.
              </p>

              <ol className="grid gap-3 md:grid-cols-2">
                {result.diagnosis.actions.map((a, i) => (
                  <li
                    key={a.title}
                    className="flex gap-3 rounded-xl bg-muted p-4"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>

                    <div>
                      <p className="font-semibold">
                        {a.title}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {a.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>


            {/* SAMPLE AGRICULTURAL PRODUCTS */}

            <div>
              <h3 className="mb-2 text-xl">
                Sample agricultural products
              </h3>

              <p className="mb-4 text-xs text-muted-foreground">
                Example listings for demonstration only. Prices, ratings,
                sellers and product suitability have not been verified.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.diagnosis.products.map((p) => (
                  <Card key={p.name}>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">
                      {p.type}
                    </span>

                    <p className="mt-3 font-semibold">
                      {p.name}
                    </p>

                    <p className="mt-1 font-display text-2xl text-primary">
                      {p.price}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Store size={14} /> {p.vendor}
                      </span>

                      <span className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="fill-harvest text-harvest"
                        />
                        {p.rating}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
                      <ShoppingBag size={15} />
                      Sample listing only
                    </div>
                  </Card>
                ))}
              </div>
            </div>


            {/* BOTTOM BUTTONS */}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className={btnGhost}
              >
                <ArrowLeft size={16} /> Edit symptoms
              </button>

              <button
                onClick={() => {
                  setStep(0);
                  setResult(null);
                  setSymptoms("");
                  setError("");
                }}
                className={btnGhost}
              >
                <RotateCcw size={16} /> New check
              </button>
            </div>

          </div>
        )
      )}
    </>
  );
}