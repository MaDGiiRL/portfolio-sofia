// pages/api/admin/stats.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // <-- solo qui, lato server
);

// /api/admin/stats.js
export default async function handler(req, res) {
  try {
    // TODO: verifica Authorization e calcola stats reali
    return res.status(200).json({ total: 0, confirmed: 0, pending: 0, unsub: 0 });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
}
