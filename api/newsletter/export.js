import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    // opzionale: richiedi Authorization Bearer e verifica admin come in /send.js
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data, error } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('email, status, created_at, confirmed_at, unsubscribed_at')
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const rows = data || [];
    const header = "email,status,created_at,confirmed_at,unsubscribed_at";
    const csv = [header, ...rows.map(r =>
        [r.email, r.status, r.created_at, r.confirmed_at, r.unsubscribed_at]
            .map(x => x == null ? "" : String(x).replace(/"/g, '""'))
            .map(x => /[,"\n]/.test(x) ? `"${x}"` : x)
            .join(",")
    )].join("\n");

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    res.status(200).send('\uFEFF' + csv); // BOM per Excel
}
