import { useEffect, useState } from "react";


export default function ConfirmSubscriptionPage() {
    const [msg, setMsg] = useState("Verifica in corso…");


    useEffect(() => {
        const t = new URLSearchParams(window.location.search).get("t");
        if (!t) { setMsg("Token mancante"); return; }
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-subscription?t=${encodeURIComponent(t)}`;
        fetch(url)
            .then(async (r) => {
                const txt = await r.text();
                if (r.ok) setMsg("Indirizzo confermato. " + txt);
                else setMsg("Errore: " + txt);
            })
            .catch((e) => setMsg("Errore: " + String(e)));
    }, []);


    return (
        <div className="container py-4">
            <h1 className="text-2xl font-bold mb-3">Conferma iscrizione</h1>
            <p>{msg}</p>
        </div>
    );
}