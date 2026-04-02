/**
 * Supabase client singleton.
 *
 * Reads credentials from Vite environment variables.
 * Returns `null` when the env vars are missing so the app can
 * gracefully fall back to local-only mode.
 *
 * In web (self-hosted) deployments, Supabase is not used —
 * the client will be null and all data stays in IndexedDB.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabasePublishableKey && !supabaseUrl.includes('your-project')) {
  supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };
