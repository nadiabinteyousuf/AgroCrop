import { createFileRoute, Link } from "@tanstack/react-router";
import { Sprout, Stethoscope, ArrowRight, Satellite } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AgroCop" },
      { name: "description", content: "Choose a tool: find the best crop for your soil or check your crop's health." },
      { property: "og:title", content: "AgroCop Dashboard" },
      { property: "og:description", content: "Crop recommendations and health checks in one place." },
    ],
  }),
  component: () => <AppShell><Dashboard /></AppShell>,
});

function Dashboard() {
  const { user } = useAuth();
  const cards = [
    { to: "/soil" as const, icon: Sprout, title: "Which Crop is Good for My Soil?", desc: "Pick your field on the map, describe your soil and history, and get AI crop suggestions backed by NASA climate data.", tag: "Crop Finder" },
    { to: "/health" as const, icon: Stethoscope, title: "Crop Health Check", desc: "Describe symptoms like leaf spots or pests and get a diagnosis, action plan and trusted product suggestions.", tag: "Diagnosis" },
  ];
  return (
    <>
      <p className="text-sm font-semibold text-primary">Hello, {user?.name}</p>
      <h1 className="font-display text-4xl sm:text-5xl">What does your field need today?</h1>
      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Satellite size={15} /> Insights use NASA POWER weather & soil data</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {cards.map(({ to, icon: I, title, desc, tag }) => (
          <Link key={to} to={to} className="group relative overflow-hidden rounded-3xl border bg-card p-7 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/50 transition group-hover:scale-125" />
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><I /></span>
            <p className="relative mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">{tag}</p>
            <h2 className="relative mt-1 font-display text-2xl">{title}</h2>
            <p className="relative mt-2 text-sm text-muted-foreground">{desc}</p>
            <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">Start <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
