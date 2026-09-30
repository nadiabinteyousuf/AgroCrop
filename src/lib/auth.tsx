import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Placeholder auth — replace signIn/signUp/signInWithGoogle with your backend calls.
type User = { name: string; email: string };
type Ctx = {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
};
const AuthCtx = createContext<Ctx | null>(null);
const KEY = "agrocop_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setUser(JSON.parse(raw));
    setReady(true);
  }, []);
  const save = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  };
  const wait = () => new Promise((r) => setTimeout(r, 600));
  return (
    <AuthCtx.Provider
      value={{
        user,
        ready,
        signIn: async (email) => { await wait(); save({ name: email.split("@")[0] ?? email, email }); },
        signUp: async (name, email) => { await wait(); save({ name, email }); },
        signInWithGoogle: async () => { await wait(); save({ name: "Farmer", email: "farmer@gmail.com" }); },
        signOut: () => save(null),
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
