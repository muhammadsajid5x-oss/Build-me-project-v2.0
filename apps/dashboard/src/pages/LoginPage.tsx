import { useState } from "react";
import { supabase } from "@build-me/services/integrations";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    console.log("Supabase login result:", {
      user: data.user,
      session: data.session,
      error: authError,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Login succeeded but no session was created.");
      setLoading(false);
      return;
    }

    setLoading(false);

    navigate("/", { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-black">Sign in</h1>

        <p className="mt-2 text-sm text-gray-600">
          Sign in to access the Build Me dashboard.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-900 px-4 py-2.5 font-semibold text-white"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
