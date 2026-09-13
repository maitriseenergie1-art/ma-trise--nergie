import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn('[admin] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
}

// Service-role client: bypasses RLS. Only ever used inside authenticated
// Netlify Functions, never shipped to the browser.
export const admin = createClient(url ?? '', serviceKey ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const supabaseConfigured = Boolean(url && serviceKey);
