/* =========================================================
   CampusMarket — js/config/supabaseClient.js

   Creates the single shared Supabase client for the whole app.
   Loaded via the CDN script (added to each page's <head>, see
   below) before this file, so `window.supabase` is the library,
   and this file exposes the configured instance as `window.sb`.

   >>> FILL THESE IN with your own project's values <<<
   Find them in the Supabase dashboard under
   Project Settings → API. Only ever use the "anon / public" key
   here — never the service_role key, which must stay server-side.
   ========================================================= */

const SUPABASE_URL = "https://lxafgdnlqclcwlvnywtq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PHIzv5sMxAwbz7NYPne4GQ_xP6yJtDm";

if (SUPABASE_URL.includes("YOUR-PROJECT-REF")) {
  console.warn(
    "[CampusMarket] Supabase is not configured yet — edit js/config/supabaseClient.js " +
    "with your project URL and anon key before auth/listings will work."
  );
}

let sb = null;

if (!window.supabase) {
  console.error(
    "[CampusMarket] The Supabase library failed to load (check your internet " +
    "connection or ad-blocker) — auth and data calls will not work on this page load."
  );
} else {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

window.sb = sb;
