import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient;

/**
 * Returns the Supabase client singleton.
 * Uses the service role key for full admin access on the server side.
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables. ' +
        'Please set them in your .env file.'
      );
    }

    supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabase;
}
