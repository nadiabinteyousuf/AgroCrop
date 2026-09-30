import { Link, useNavigate } from "@tanstack/react-router";
import { Sprout, LogOut, UserCircle2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !user) navigate({ to: "/" });
  }, [ready, user, navigate]);
  if (!user) return null;
  const nav = "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground";
  const active = { className: "rounded-full px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground" };
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Sprout size={20} /></span>
            <span className="font-display text-xl font-semibold">AgroCop</span>
          </Link>
          <nav className="ml-4 hidden gap-1 md:flex">
            <Link to="/dashboard" className={nav} activeProps={active}>Dashboard</Link>
            <Link to="/soil" className={nav} activeProps={active}>Crop Finder</Link>
            <Link to="/health" className={nav} activeProps={active}>Health Check</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
            <UserCircle2 className="text-primary" size={28} />
            <button onClick={signOut} aria-label="Sign out" className="rounded-full p-2 hover:bg-muted"><LogOut size={18} /></button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          <Link to="/dashboard" className={nav} activeProps={active}>Dashboard</Link>
          <Link to="/soil" className={nav} activeProps={active}>Crop Finder</Link>
          <Link to="/health" className={nav} activeProps={active}>Health Check</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${i <= current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
          <span className={`hidden text-sm sm:inline ${i === current ? "font-semibold" : "text-muted-foreground"}`}>{s}</span>
          {i < steps.length - 1 && <span className={`h-0.5 flex-1 rounded ${i < current ? "bg-primary" : "bg-border"}`} />}
        </li>
      ))}
    </ol>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-card p-5 shadow-sm sm:p-6 ${className}`}>{children}</div>;
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold">{children}</label>;
}

export const btn = "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted";
