// supabase/functions/delete-account/index.js
// Deploy: supabase functions deploy delete-account

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "method_not_allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization") || "";

    if (!supabaseUrl || !anonKey || !serviceKey) {
        return new Response(JSON.stringify({ error: "missing_env" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Client utente (con JWT del chiamante) per capire chi è loggato
    const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Client admin (service role) per bypassare RLS e cancellare davvero l'utente
    const admin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    try {
        const uid = user.id;

        // 1) PULIZIA DATI (adatta i nomi delle tabelle se servono)
        await admin.from("saved_posts").delete().eq("user_id", uid);
        await admin.from("reviews").delete().eq("user_id", uid);
        await admin.from("comments").delete().eq("user_id", uid);
        await admin.from("project_comments").delete().eq("user_id", uid);
        await admin.from("profiles").delete().eq("id", uid);

        // 2) RIMOZIONE DELL’UTENTE AUTH
        const { error: delErr } = await admin.auth.admin.deleteUser(uid);
        if (delErr) throw delErr;

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e?.message || "unknown" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
});
