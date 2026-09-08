import { createClient } from "@supabase/supabase-js";

/**
 * Same Supabase project as the iOS app (see Payloat/Services/AppConfig.swift).
 * The URL and publishable key are designed to be embedded client-side; RLS
 * gates everything the browser can touch.
 */
/* fall back to the client-safe project constants (same values the iOS app
   ships) so a deploy missing env vars degrades instead of white-screening */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "https://xtjcsgsmvzulthfltnux.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "sb_publishable_1yzgWqIAkSHPSHbyk-KaHQ_ZO5m-GS3",
);
