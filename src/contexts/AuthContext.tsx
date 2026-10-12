import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: (scope?: "local" | "global") => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Single source of truth for the signed-in session.
 * One listener for the whole app avoids duplicate subscriptions and
 * flicker between pages.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Listener first, so no event fired during getSession() is missed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return;
      setSession(next);
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      })
      .catch(() => {
        /* offline / backend waking up — treat as signed out for now */
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Re-validate when the tab regains focus (handles expired / revoked sessions).
    const onFocus = () => {
      supabase.auth.getSession().then(({ data }) => {
        if (mounted) setSession(data.session);
      }).catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const signOut = useCallback(async (scope: "local" | "global" = "local") => {
    try {
      await supabase.auth.signOut({ scope });
    } catch {
      // Even if the network call fails, clear the local session.
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    }
    setSession(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.refreshSession();
    if (data.session) setSession(data.session);
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading, signOut, refreshUser }),
    [session, loading, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
