import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, AlertTriangle, RotateCcw, Star, Store, ShoppingBag } from "lucide-react";
import { AppShell, Card, Label, Stepper, btn, btnGhost } from "@/components/AppShell";
import { LocationPicker } from "@/components/LocationPicker";
import { NasaLoading, NasaPanel } from "@/components/NasaPanel";
import { diagnoseCropHealth, type Diagnosis, type LatLng, type NasaData } from "@/lib/api";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Crop Health Check — AgroCop" },
      { name: "description", content: "Diagnose crop diseases and pests and get an action plan with trusted product suggestions." },
      { property: "og:title", content: "AgroCop Crop Health Check" },
      { property: "og:description", content: "AI crop disease diagnosis with action plans." },
    ],
  }),
  component: () => <AppShell><HealthFlow /></AppShell>,
});

const CROPS = ["Rice", "Wheat", "Jute", "Potato", "Maize", "Mustard", "Tomato", "Lentil"];
const QUICK = ["Brown spots on leaves", "Yellowing leaves", "Holes / insects on leaves", "Wilting stems", "White powder on leaves"];

function HealthFlow() {
  const [step, setStep] = useState(0);
  const [loc, setLoc] = useState<LatLng | null>(null);
  const [crop, setCrop] = useState("Rice");
  const [symptoms, setSymptoms] = useState("");
  const [soil, setSoil] = useState("Normal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ nasa: NasaData; diagnosis: Diagnosis } | null>(null);

  const run = async () => {
    if (!loc || !symptoms.trim()) return;
    setStep(2); setLoading(true); setResult(null);
    try { setResult(await diagnoseCropHealth({ location: loc, crop, symptoms: symptoms.trim(), soilCondition: soil })); }
    finally { setLoading(false); }
  };

  return (
    <>
      <h1 className="mb-6 font-display text-3xl sm:text-4xl">Crop Health Check</h1>
      <Stepper steps={["Location & crop", "Symptoms", "Diagnosis"]} current={step} />

      {step === 0 && (
        <Card>
          <h2 className="mb-4 text-xl">Where is the affected field?</h2>
          <LocationPicker value={loc} onChange={setLoc} />
          <div className="mt-5 max-w-sm"><Label>Current crop</Label>
            <input className="field" list="crops" value={crop} maxLength={50} onChange={(e) => setCrop(e.target.value)} />
            <datalist id="crops">{CROPS.map((c) => <option key={c} value={c} />)}</datalist></div>
          <div className="mt-6 flex justify-end"><button disabled={!loc || !crop.trim()} onClick={() => setStep(1)} className={btn}>Next <ArrowRight size={16} /></button></div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <h2 className="mb-4 text-xl">Describe the problem</h2>
          <Label>Symptoms</Label>
          <textarea className="field min-h-32" maxLength={1000} placeholder="Leaf marks, color changes, pests seen, when it started..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK.map((q) => <button key={q} onClick={() => setSymptoms((s) => (s ? `${s}, ${q.toLowerCase()}` : q))} className="rounded-full border px-3 py-1 text-xs hover:bg-muted">+ {q}</button>)}
          </div>
          <div className="mt-5"><Label>Current soil condition</Label>
            <div className="grid grid-cols-3 gap-2 sm:max-w-md">
              {["Over-watered", "Dry", "Normal"].map((s) => (
                <button key={s} onClick={() => setSoil(s)} className={`rounded-xl border px-3 py-3 text-sm font-medium ${soil === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{s}</button>
              ))}
            </div></div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(0)} className={btnGhost}><ArrowLeft size={16} /> Back</button>
            <button disabled={!symptoms.trim()} onClick={run} className={btn}>Diagnose <ArrowRight size={16} /></button>
          </div>
        </Card>
      )}

      {step === 2 && (loading || !result ? <Card><NasaLoading /></Card> : (
        <div className="space-y-6">
          <NasaPanel nasa={result.nasa} />
          <Card className="border-harvest">
            <div className="flex flex-wrap items-start gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-harvest"><AlertTriangle /></span>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Likely problem</p>
                <h2 className="text-2xl">{result.diagnosis.problem}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{result.diagnosis.cause}</p>
              </div>
              <div className="flex gap-4 text-center">
                <div><p className="font-display text-2xl text-primary">{result.diagnosis.confidence}%</p><p className="text-xs text-muted-foreground">confidence</p></div>
                <div><p className="font-display text-2xl">{result.diagnosis.severity}</p><p className="text-xs text-muted-foreground">severity</p></div>
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="mb-4 text-xl">Action plan</h3>
            <ol className="grid gap-3 md:grid-cols-2">
              {result.diagnosis.actions.map((a, i) => (
                <li key={a.title} className="flex gap-3 rounded-xl bg-muted p-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <div><p className="font-semibold">{a.title}</p><p className="text-sm text-muted-foreground">{a.detail}</p></div>
                </li>
              ))}
            </ol>
          </Card>
          <div>
            <h3 className="mb-4 text-xl">Recommended products</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.diagnosis.products.map((p) => (
                <Card key={p.name}>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">{p.type}</span>
                  <p className="mt-3 font-semibold">{p.name}</p>
                  <p className="mt-1 font-display text-2xl text-primary">{p.price}</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Store size={14} /> {p.vendor}</span>
                    <span className="flex items-center gap-1"><Star size={14} className="fill-harvest text-harvest" /> {p.rating}</span>
                  </div>
                  <button className={`${btnGhost} mt-4 w-full`}><ShoppingBag size={15} /> Find nearby seller</button>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className={btnGhost}><ArrowLeft size={16} /> Edit symptoms</button>
            <button onClick={() => { setStep(0); setResult(null); setSymptoms(""); }} className={btnGhost}><RotateCcw size={16} /> New check</button>
          </div>
        </div>
      ))}
    </>
  );
}
