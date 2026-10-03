import { supabase } from "@build-me/services/integrations";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (authError) {
        setError("Unable to start sign-in. Please try again.");
      }
    } catch {
      setError("Unable to start sign-in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Sign in</h1>

      <p>Please Sign in to access the Build Me dashboard.</p>

      {error && <p role="alert">{error}</p>}

      <button
        type="button"
        onClick={() => void handleLogin()}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Continue with Google"}
      </button>
    </main>
  );
}
