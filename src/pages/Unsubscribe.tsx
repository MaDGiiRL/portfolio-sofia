import { useEffect, useState } from "react";


export default function UnsubscribePage() {
    const [msg, setMsg] = useState("Elaborazione in corso…");


    useEffect(() => {
        const t = new URLSearchParams(window.location.search).get("t");
        if (!t) { setMsg("Token mancante"); return; }
        // Call the public edge function endpoint directly (GET)
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsubscribe?t=${encodeURIComponent(t)}`;
        fetch(url)
            .then(async (r) => {
                const txt = await r.text();
                if (r.ok) setMsg("Sei stat* disiscritto/a dalla newsletter. " + txt);
                else setMsg("Errore: " + txt);
            })
            .catch((e) => setMsg("Errore: " + String(e)));
    }, []);


    return (
        <div className="container py-4">
            <h1 className="text-2xl font-bold mb-3">Unsubscribe</h1>
            <p>{msg}</p>
        </div>
    );
}