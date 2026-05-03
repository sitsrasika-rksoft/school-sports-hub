import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "user";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isAdmin: boolean;
  mySportIds: string[];
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [mySportIds, setMySportIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAux = async (uid: string) => {
    const [{ data: rolesData }, { data: memberData }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("sport_members").select("sport_id").eq("user_id", uid),
    ]);
    const isAdmin = (rolesData ?? []).some((r) => r.role === "admin");
    setRole(isAdmin ? "admin" : "user");
    setMySportIds((memberData ?? []).map((m: { sport_id: string }) => m.sport_id));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => fetchAux(sess.user.id), 0);
      } else {
        setRole(null);
        setMySportIds([]);
      }
    });
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchAux(sess.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setMySportIds([]);
  };

  const refresh = async () => {
    if (user) await fetchAux(user.id);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        role,
        isAdmin: role === "admin",
        mySportIds,
        loading,
        signOut,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
