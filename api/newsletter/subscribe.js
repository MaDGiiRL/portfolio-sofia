import { createClient } from '@supabase/supabase-js';
import { sendOne, SITE_URL } from '../_lib/sendgrid.js';
import { confirmTemplate } from '../_lib/templates.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { email, gdpr } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email richiesta' });

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return res.status(500).json({ error: 'Server misconfigured' });
    }
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: row, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({ email, status: 'pending', gdpr_consent: !!gdpr }, { onConflict: 'email' })
      .select('token')
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: error.message });
    }

    const confirmUrl = `${process.env.SITE_URL || SITE_URL}/api/newsletter/confirm?token=${row.token}`;

    await sendOne({
      to: String(email).trim(),
      subject: 'Conferma la tua iscrizione',
      html: confirmTemplate(confirmUrl),
      fromName: 'Newsletter'
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error('subscribe 500:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
