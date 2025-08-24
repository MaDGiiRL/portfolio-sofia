import { useEffect, useMemo, useState } from "react";
import supabase from "../../supabase/supabase-client";

export default function AdminNewsletter() {
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [html, setHtml] = useState(
    "<h1>Ciao!</h1><p>Contenuto della newsletter…</p>"
  );
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState(false);
  const [sentInfo, setSentInfo] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setToken(session?.access_token || "");
    })();
  }, []);

  const canSend = useMemo(() => {
    return subject.trim().length > 0 && html.trim().length > 0 && !!token;
  }, [subject, html, token]);

  const callSend = async (test = false) => {
    setSending(true);
    setSentInfo(null);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          preheader,
          html,
          testTo: test ? testTo || undefined : undefined,
        }),
      });

      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Errore invio");

      setSentInfo(out);
      alert(
        test
          ? "Inviata email di TEST"
          : `Inviata newsletter a ${out.sent} iscritti`
      );
    } catch (e) {
      console.error(e);
      alert(e.message || "Errore");
    } finally {
      setSending(false);
    }
  };

  return (
    <>


      <div className="card nl-card rounded-4 bg-custom">
        <div className="card-body p-3 p-md-4">
          <h2 className="h5 nl-title mb-3">Newsletter</h2>

          <div className="d-grid gap-3">
            <label className="w-100">
              <div className="nl-label">Soggetto *</div>
              <input
                className="nl-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Oggetto"
              />
            </label>

            <label className="w-100">
              <div className="nl-label">Preheader (facoltativo)</div>
              <input
                className="nl-input"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="Anteprima breve che appare in alcuni client"
              />
            </label>

            <label className="w-100">
              <div className="nl-label">HTML *</div>
              <textarea
                rows={14}
                className="nl-textarea"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="<h1>Titolo</h1><p>Testo…</p>"
              />
            </label>

            <div className="d-flex gap-2 align-items-center flex-wrap">
              <div className="ms-auto" />
              <button
                onClick={() => callSend(false)}
                disabled={sending || !canSend}
                className="nl-btn"
              >
                {sending ? "Invio…" : "Invia a tutti i confermati"}
              </button>
            </div>

            <details>
              <summary
                style={{ cursor: "pointer", color: "var(--accent-pink)" }}
              >
                Anteprima veloce
              </summary>
              <div
                className="nl-preview mt-2"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <p className="nl-hint mt-2">
                Nota: l’anteprima qui non mostra il blocco di{" "}
                <em>unsubscribe</em>. Verrà aggiunto automaticamente dal
                template server.
              </p>
            </details>

            {sentInfo && (
              <div style={{ color: "var(--accent-yellow)", fontWeight: 600 }}>
                {sentInfo.test
                  ? "Email di TEST inviata."
                  : `Invio completato. Inviate ${sentInfo.sent} email.`}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
