import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getSession,
  onAuthStateChange,
  signOut as signOutUser,
} from "@build-me/services/integrations";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  readonly children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    function applySession(next: Session | null, nextError: string | null = null) {
      if (!mounted) {
        return;
      }

      setSession(next);
      setError(nextError);
      setLoading(false);
    }

    async function loadSession() {
      try {
        const currentSession = await getSession();

        applySession(currentSession);
      } catch {
        applySession(null, "Unable to load your session. Please try again.");
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = onAuthStateChange((nextSession) => {
      applySession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      error,
      signOut: signOutUser,
    }),
    [session, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
