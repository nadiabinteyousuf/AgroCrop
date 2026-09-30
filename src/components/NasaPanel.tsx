import { Satellite, Thermometer, Droplets, CloudRain, Sun, FlaskConical, Waves } from "lucide-react";
import type { NasaData } from "@/lib/api";

export function NasaLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent" />
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground"><Satellite /></span>
      </div>
      <p className="font-display text-xl">Fetching NASA Soil & Climate Data...</p>
      <p className="text-sm text-muted-foreground">Querying NASA POWER for temperature, rainfall, humidity and soil moisture</p>
    </div>
  );
}

export function NasaPanel({ nasa }: { nasa: NasaData }) {
  const items = [
    { icon: Thermometer, label: "Avg Temp", v: `${nasa.temperature}°C` },
    { icon: Droplets, label: "Humidity", v: `${nasa.humidity}%` },
    { icon: CloudRain, label: "Rainfall", v: `${nasa.rainfall} mm/yr` },
    { icon: Waves, label: "Soil Moisture", v: `${Math.round(nasa.soilMoisture * 100)}%` },
    { icon: FlaskConical, label: "Soil pH", v: nasa.ph },
    { icon: Sun, label: "Solar", v: `${nasa.solar} kWh/m²` },
  ];
  return (
    <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold opacity-90"><Satellite size={16} /> NASA POWER data for this location</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(({ icon: I, label, v }) => (
          <div key={label} className="rounded-xl bg-primary-foreground/10 p-3">
            <I size={16} className="opacity-80" />
            <p className="mt-1 text-lg font-bold">{v}</p>
            <p className="text-xs opacity-80">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
