import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sprout, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { btn } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgroCop — Sign in" },
      { name: "description", content: "Sign in to AgroCop for AI crop recommendations and crop health checks." },
      { property: "og:title", content: "AgroCop — Smart farming with NASA data" },
      { property: "og:description", content: "AI crop recommendations and crop health diagnostics." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (mode === "up" && !name.trim()) return setErr("Enter your name.");
    setLoading(true);
    try { mode === "in" ? await signIn(email, password) : await signUp(name.trim(), email, password); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2"><Sprout /> <span className="font-display text-2xl font-semibold">AgroCop</span></div>
        <div>
          <h1 className="font-display text-5xl leading-tight">Grow the right crop.<br />Heal the field early.</h1>
          <p className="mt-4 max-w-md opacity-85">Soil-aware crop recommendations and disease diagnosis, powered by NASA POWER climate data.</p>
        </div>
        <p className="text-sm opacity-70">Built for farmers of Bangladesh & South Asia</p>
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-harvest/30" />
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden"><Sprout className="text-primary" /><span className="font-display text-2xl font-semibold">AgroCop</span></div>
          <h2 className="font-display text-3xl">{mode === "in" ? "Welcome back" : "Create account"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "in" ? "Sign in to your farm dashboard" : "Start making smarter crop decisions"}</p>
          <button onClick={() => signInWithGoogle()} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border py-2.5 text-sm font-semibold hover:bg-muted">
            <span className="font-bold text-primary">G</span> Continue with Google
          </button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && (
              <div className="relative"><User size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <input className="field pl-9" placeholder="Full name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></div>
            )}
            <div className="relative"><Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <input className="field pl-9" type="email" placeholder="Email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="relative"><Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <input className="field pl-9" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button disabled={loading} className={`${btn} w-full`}>{loading && <Loader2 size={16} className="animate-spin" />}{mode === "in" ? "Sign in" : "Sign up"}</button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "in" ? "New to AgroCop?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="font-semibold text-primary">{mode === "in" ? "Create account" : "Sign in"}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
