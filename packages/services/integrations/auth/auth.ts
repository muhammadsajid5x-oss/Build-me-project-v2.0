import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    throw new Error("Unable to retrieve authentication session.");
  }
  return session;
}
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return user;
}
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}
export function onAuthStateChange(
  callback: (session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error("Unable to sign out.");
  }
}
