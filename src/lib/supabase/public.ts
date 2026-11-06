import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Cookie-free anon client for public page content (pages, sections, services,
 * published articles). Because it never touches `cookies()`, pages that use it
 * can be statically cached and revalidated (`export const revalidate`) instead
 * of being rendered on every request. Do not use it for anything that needs the
 * signed-in user: use `createServerSupabaseClient` for that.
 */
export function createPublicSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
