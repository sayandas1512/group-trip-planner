import { createClient } from "@supabase/supabase-js";

// Service-role client: server-side only. Never import this from a client component.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-role-key",
    {
      auth: { persistSession: false },
      // Next.js patches global fetch and caches GET requests by default, even
      // inside route handlers marked force-dynamic. Opt every Supabase request
      // out of that cache so reads always reflect the latest writes.
      global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) },
    }
  );
}
