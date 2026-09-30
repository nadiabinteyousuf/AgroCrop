import { useState } from "react";
import { Crosshair, MapPin, Search } from "lucide-react";
import type { LatLng } from "@/lib/api";

const PRESETS: LatLng[] = [
  { label: "Mymensingh, Bangladesh", lat: 24.7471, lng: 90.4203 },
  { label: "Dhaka, Bangladesh", lat: 23.8103, lng: 90.4125 },
  { label: "Rajshahi, Bangladesh", lat: 24.3745, lng: 88.6042 },
  { label: "Rangpur, Bangladesh", lat: 25.7439, lng: 89.2752 },
  { label: "Sylhet, Bangladesh", lat: 24.8949, lng: 91.8687 },
  { label: "Khulna, Bangladesh", lat: 22.8456, lng: 89.5403 },
  { label: "Punjab, India", lat: 30.9, lng: 75.85 },
];

export function LocationPicker({ value, onChange }: { value: LatLng | null; onChange: (l: LatLng) => void }) {
  const [q, setQ] = useState("");
  const [zoom, setZoom] = useState(0.08);
  const matches = q ? PRESETS.filter((p) => p.label!.toLowerCase().includes(q.toLowerCase())) : PRESETS;
  const c = value ?? { lat: 23.7, lng: 90.35 };
  const d = value ? zoom : 3;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${c.lng - d},${c.lat - d},${c.lng + d},${c.lat + d}&layer=mapnik${value ? `&marker=${c.lat},${c.lng}` : ""}`;

  const locate = () =>
    navigator.geolocation?.getCurrentPosition((p) =>
      onChange({ lat: +p.coords.latitude.toFixed(4), lng: +p.coords.longitude.toFixed(4), label: "My location" }),
    );

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
          <input className="field pl-9" placeholder="Search region, e.g. Mymensingh" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <ul className="max-h-64 space-y-1 overflow-y-auto">
          {matches.map((p) => (
            <li key={p.label}>
              <button
                onClick={() => { onChange(p); setZoom(0.08); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary ${value?.label === p.label ? "bg-secondary font-semibold" : ""}`}
              >
                <MapPin size={15} className="text-primary" /> {p.label}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={locate} className="flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">
          <Crosshair size={15} /> Use my current location
        </button>
        <div className="grid grid-cols-2 gap-2">
          <input className="field" type="number" step="0.0001" placeholder="Latitude" value={value?.lat ?? ""}
            onChange={(e) => onChange({ lat: +e.target.value, lng: value?.lng ?? 90, label: "Custom point" })} />
          <input className="field" type="number" step="0.0001" placeholder="Longitude" value={value?.lng ?? ""}
            onChange={(e) => onChange({ lat: value?.lat ?? 24, lng: +e.target.value, label: "Custom point" })} />
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border">
        <iframe title="Map" src={src} className="h-72 w-full sm:h-96" loading="lazy" />
        {value && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card/95 px-3 py-2 text-xs shadow">
            <span className="font-semibold">{value.label}</span>
            <span className="font-mono text-muted-foreground">{value.lat.toFixed(4)}, {value.lng.toFixed(4)}</span>
            <div className="flex gap-1">
              <button onClick={() => setZoom((z) => Math.max(0.01, z / 2))} className="rounded border px-2">+</button>
              <button onClick={() => setZoom((z) => Math.min(2, z * 2))} className="rounded border px-2">−</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
