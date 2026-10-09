import { supabase } from "@build-me/services/integrations";

async function handleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error("Authentication failed.");
  }
}

export default function LoginPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <p>Sign in to access the Build Me dashboard.</p>

      <button type="button" onClick={() => void handleLogin()}>
        Continue with Google
      </button>
    </main>
  );
}
