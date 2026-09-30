import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, X, CheckCircle2, RotateCcw } from "lucide-react";
import { AppShell, Card, Label, Stepper, btn, btnGhost } from "@/components/AppShell";
import { LocationPicker } from "@/components/LocationPicker";
import { NasaLoading, NasaPanel } from "@/components/NasaPanel";
import { getCropRecommendations, type CropRecommendation, type LatLng, type NasaData } from "@/lib/api";

export const Route = createFileRoute("/soil")({
  head: () => ({
    meta: [
      { title: "Which Crop is Good for My Soil? — AgroCop" },
      { name: "description", content: "Get AI crop recommendations for your field using soil details and NASA climate data." },
      { property: "og:title", content: "AgroCop Crop Finder" },
      { property: "og:description", content: "Find the best crop for your soil with NASA data." },
    ],
  }),
  component: () => <AppShell><SoilFlow /></AppShell>,
});

const FERTS = ["Urea", "TSP", "MoP (Potash)", "DAP", "Gypsum", "Zinc Sulphate", "Organic Compost", "Pesticides"];

function SoilFlow() {
  const [step, setStep] = useState(0);
  const [loc, setLoc] = useState<LatLng | null>(null);
  const [soilType, setSoilType] = useState("Loamy");
  const [history, setHistory] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [ferts, setFerts] = useState<string[]>([]);
  const [irrigation, setIrrigation] = useState("Rain-fed");
  const [season, setSeason] = useState("Kharif (Monsoon)");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ nasa: NasaData; crops: CropRecommendation[] } | null>(null);

  const addTag = () => { const t = tag.trim(); if (t && !history.includes(t)) setHistory([...history, t]); setTag(""); };

  const run = async () => {
    if (!loc) return;
    setStep(2); setLoading(true); setResult(null);
    try { setResult(await getCropRecommendations({ location: loc, soilType, cropHistory: history, fertilizers: ferts, irrigation, season, notes })); }
    finally { setLoading(false); }
  };

  return (
    <>
      <h1 className="mb-6 font-display text-3xl sm:text-4xl">Which Crop is Good for My Soil?</h1>
      <Stepper steps={["Location", "Soil details", "Recommendations"]} current={step} />

      {step === 0 && (
        <Card>
          <h2 className="mb-4 text-xl">Select your field location</h2>
          <LocationPicker value={loc} onChange={setLoc} />
          <div className="mt-6 flex justify-end"><button disabled={!loc} onClick={() => setStep(1)} className={btn}>Next <ArrowRight size={16} /></button></div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <h2 className="mb-4 text-xl">Soil & environment</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div><Label>Soil type</Label>
              <select className="field" value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                {["Loamy", "Clay", "Sandy", "Silt", "Clay Loam", "Sandy Loam"].map((s) => <option key={s}>{s}</option>)}
              </select></div>
            <div><Label>Irrigation source</Label>
              <div className="flex flex-wrap gap-2">
                {["Rain-fed", "Groundwater", "Canal"].map((s) => (
                  <button key={s} onClick={() => setIrrigation(s)} className={`rounded-full border px-4 py-2 text-sm ${irrigation === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{s}</button>
                ))}
              </div></div>
            <div className="md:col-span-2"><Label>Crop history</Label>
              <div className="flex gap-2">
                <input className="field" placeholder="e.g. Boro Rice — press Enter" value={tag} maxLength={40}
                  onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                <button onClick={addTag} className={btnGhost}>Add</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {history.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">{h}
                    <button onClick={() => setHistory(history.filter((x) => x !== h))} aria-label={`Remove ${h}`}><X size={13} /></button></span>
                ))}
              </div></div>
            <div className="md:col-span-2"><Label>Fertilizers / chemicals used previously</Label>
              <div className="flex flex-wrap gap-2">
                {FERTS.map((f) => {
                  const on = ferts.includes(f);
                  return <button key={f} onClick={() => setFerts(on ? ferts.filter((x) => x !== f) : [...ferts, f])}
                    className={`rounded-lg border px-3 py-1.5 text-sm ${on ? "border-primary bg-accent font-semibold" : "hover:bg-muted"}`}>{on && "✓ "}{f}</button>;
                })}
              </div></div>
            <div><Label>Season</Label>
              <select className="field" value={season} onChange={(e) => setSeason(e.target.value)}>
                {["Kharif (Monsoon)", "Rabi (Winter)", "Zaid / Pre-Kharif (Summer)"].map((s) => <option key={s}>{s}</option>)}
              </select></div>
            <div><Label>Weather notes</Label>
              <input className="field" placeholder="e.g. frequent flooding, late rains" maxLength={200} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(0)} className={btnGhost}><ArrowLeft size={16} /> Back</button>
            <button onClick={run} className={btn}>Get recommendations <ArrowRight size={16} /></button>
          </div>
        </Card>
      )}

      {step === 2 && (loading || !result ? <Card><NasaLoading /></Card> : (
        <div className="space-y-6">
          <NasaPanel nasa={result.nasa} />
          <div className="grid gap-5 lg:grid-cols-3">
            {result.crops.map((c, i) => (
              <Card key={c.name} className={i === 0 ? "border-primary ring-2 ring-primary/20" : ""}>
                <div className="flex items-start justify-between">
                  <div>
                    {i === 0 && <span className="rounded-full bg-harvest px-2 py-0.5 text-xs font-bold">Best match</span>}
                    <h3 className="mt-2 text-2xl">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.season} · {c.yieldEstimate}</p>
                  </div>
                  <div className="text-right"><p className="font-display text-3xl text-primary">{c.score}%</p><p className="text-xs text-muted-foreground">suitability</p></div>
                </div>
                <div className="my-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${c.score}%` }} /></div>
                <ul className="space-y-2">
                  {c.reasons.map((r) => <li key={r} className="flex gap-2 text-sm"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />{r}</li>)}
                </ul>
              </Card>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className={btnGhost}><ArrowLeft size={16} /> Edit details</button>
            <button onClick={() => { setStep(0); setResult(null); }} className={btnGhost}><RotateCcw size={16} /> New analysis</button>
          </div>
        </div>
      ))}
    </>
  );
}
