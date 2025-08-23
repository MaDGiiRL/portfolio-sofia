import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const token = req.query.token;
    if (!token) return res.redirect('/?confirm=missing');

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('token', token);

    return res.redirect(error ? '/?confirm=error' : '/?confirm=ok');
  } catch (e) {
    console.error('confirm 500:', e);
    return res.redirect('/?confirm=error');
  }
}
