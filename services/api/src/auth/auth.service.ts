import { createClient } from "@supabase/supabase-js";
import type { AuthenticatedUser } from "./auth.types.js";
let supabase: ReturnType<typeof createClient> | undefined;

function getSupabaseClient(): ReturnType<typeof createClient> {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is not configured.");
  }
  if (!supabaseKey) {
    throw new Error("SUPABASE_KEY is not configured.");
  }

  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}

export async function authenticateAccessToken(
  accessToken: string,
): Promise<AuthenticatedUser | null> {
  const { data, error } = await getSupabaseClient().auth.getUser(accessToken);
  if (error || !data.user) {
    return null;
  }
  return {
    id: data.user.id,
    ...(data.user.email ? { email: data.user.email } : {}),
    isAdmin: data.user.app_metadata?.role === "admin",
  };
}
