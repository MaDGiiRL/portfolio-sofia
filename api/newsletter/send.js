// /api/newsletter/send.js (ESM)
import { createClient } from '@supabase/supabase-js';
import { sendBatch } from '../_lib/sendgrid.js';
import { newsletterTemplate } from '../_lib/templates.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    try {
        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

        // Base URL (assoluta) per generare link corretti anche senza SITE_URL
        const proto = (req.headers['x-forwarded-proto'] || 'https');
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const BASE_URL = (process.env.SITE_URL && process.env.SITE_URL.trim())
            ? process.env.SITE_URL.trim()
            : `${proto}://${host}`;

        // 1) Auth server-side via JWT
        const auth = req.headers.authorization || req.headers.Authorization;
        if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
        const token = auth.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        // 2) Verifica ruolo admin
        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

        // 3) Payload
        const { subject, preheader = '', html, testTo } = req.body || {};
        if (!subject || !html) return res.status(400).json({ error: 'subject/html richiesti' });

        // 4) Test singolo
        if (testTo) {
            await sendBatch([{
                to: String(testTo).trim(),
                subject,
                html: newsletterTemplate({
                    html, preheader,
                    unsubscribeUrl: new URL('/api/newsletter/unsubscribe?token=#', BASE_URL).toString() // placeholder
                }),
                fromName: 'Newsletter'
            }]);
            return res.json({ ok: true, test: true });
        }

        // 5) Destinatari confermati
        const { data: subs, error } = await supabaseAdmin
            .from('newsletter_subscribers')
            .select('email, token')
            .eq('status', 'confirmed');

        if (error) {
            console.error('Supabase select error:', error);
            return res.status(500).json({ error: error.message });
        }

        // 6) Invio a chunk ≤1000
        const chunkSize = 1000;
        let sent = 0;
        for (let i = 0; i < subs.length; i += chunkSize) {
            const chunk = subs.slice(i, i + chunkSize);
            const batch = chunk.map((s) => ({
                to: String(s.email || '').trim(),
                subject,
                html: newsletterTemplate({
                    html, preheader,
                    unsubscribeUrl: new URL(`/api/newsletter/unsubscribe?token=${s.token}`, BASE_URL).toString()
                }),
                fromName: 'Newsletter'
            }));
            await sendBatch(batch);
            sent += batch.length;
        }

        return res.json({ ok: true, sent });
    } catch (e) {
        console.error('send 500:', e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
