import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL)  console.error('ENV MISSING: SUPABASE_URL');
if (!SERVICE_ROLE)  console.error('ENV MISSING: SUPABASE_SERVICE_ROLE_KEY');

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false }
});

export async function getUserFromAuthHeader(req) {
  const auth = req.headers.get?.('authorization') || req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) return { user: null };
  const token = auth.replace('Bearer ', '');
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return { user: null, error };
  return { user: data.user };
}
