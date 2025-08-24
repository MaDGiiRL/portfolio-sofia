import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

export default function TermsBanner({
  message,
  agreeText,
  closeText,
  linkText,
  storageKey = "terms_banner_ack_v1",
  persistDays = 365,
  showDelayMs = 600,
}) {
  const { t } = useTranslation();

  // fallback i18n dopo aver ottenuto t
  const msg = message ?? t("terms24");
  const agree = agreeText ?? t("terms25");
  const close = closeText ?? t("terms26");
  const link = linkText ?? t("terms27");

  const [visible, setVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const closeBtnRef = useRef(null);
  const prevActiveRef = useRef(null);

  const getAck = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj?.expiresAt) return null;
      if (Date.now() > Number(obj.expiresAt)) {
        localStorage.removeItem(storageKey);
        return null;
      }
      return obj;
    } catch {
      return null;
    }
  };

  const setAck = () => {
    const expiresAt = Date.now() + persistDays * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ acceptedAt: Date.now(), expiresAt })
    );
  };

  useEffect(() => {
    const ack = getAck();
    const dismissed = sessionStorage.getItem(`${storageKey}_dismissed`) === "1";
    if (!ack && !dismissed) {
      const t = setTimeout(() => setVisible(true), showDelayMs);
      return () => clearTimeout(t);
    }
  }, [showDelayMs, storageKey]);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => closeBtnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [visible]);

  useEffect(() => {
    if (openModal) {
      prevActiveRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      prevActiveRef.current?.focus?.();
    }
    const onKey = (e) => e.key === "Escape" && setOpenModal(false);
    if (openModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openModal]);

  useEffect(() => {
    const handler = () => setOpenModal(true);
    window.addEventListener("terms:open", handler);
    return () => window.removeEventListener("terms:open", handler);
  }, []);

  const onAccept = () => {
    setAck();
    setOpenModal(false);
    setVisible(false);
  };

  const onCloseBanner = () => {
    sessionStorage.setItem(`${storageKey}_dismissed`, "1");
    setVisible(false);
  };

  // non uscire se la modale è aperta
  if (!visible && !openModal) return null;

  return (
    <>
      <style>{`
        .tc-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2147483001;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s ease-out}
        .tc-modal{background:#0f1016;color:#e5e7eb;border:1px solid rgba(255,255,255,.12);border-radius:16px;max-width:920px;width:100%;max-height:80vh;overflow:hidden;box-shadow:0 20px 80px rgba(0,0,0,.6);display:flex;flex-direction:column}
        .tc-modal-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
        .tc-modal-title{font-weight:700;letter-spacing:.02em}
        .tc-modal-body{padding:16px;overflow:auto}
        .tc-modal-actions{padding:12px 16px;border-top:1px solid rgba(255,255,255,.1);display:flex;gap:8px;justify-content:flex-end}
        .tc-x{background:transparent;border:1px solid rgba(255,255,255,.2);color:#e5e7eb;border-radius:8px;padding:6px 10px;cursor:pointer}
        .tc-btn{appearance:none;border:none;cursor:pointer;border-radius:10px;padding:10px 14px;font-weight:700}
        .tc-accept{background:linear-gradient(90deg,var(--accent-pink,#ff36a3),var(--accent-yellow,#dbff00));color:#111117;box-shadow:0 6px 20px rgba(255,54,163,.25)}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .tc-banner-wrap{position:fixed;left:0;right:0;bottom:16px;z-index:2147483000;display:flex;justify-content:center;pointer-events:none}
        .tc-banner{pointer-events:auto;background:rgba(17,17,23,.92);border:1px solid rgba(255,255,255,.12);color:#e5e7eb;border-radius:14px;max-width:920px;width:calc(100% - 24px);box-shadow:0 10px 40px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.03) inset;backdrop-filter:blur(6px);padding:12px 14px;display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;animation:tc-slide-up .35s ease-out}
        .tc-badge{display:inline-flex;align-items:center;gap:8px;font-weight:600;letter-spacing:.02em}
        .tc-dot{width:8px;height:8px;border-radius:999px;background:linear-gradient(90deg,var(--accent-pink,#ff36a3),var(--accent-yellow,#dbff00));box-shadow:0 0 0 2px rgba(255,255,255,.08)}
        .tc-text{color:#cbd5e1;line-height:1.35}
        .tc-link{color:var(--accent-yellow,#dbff00);text-decoration:none;font-weight:700;cursor:pointer}
        .tc-link:hover{text-decoration:underline}
        .tc-close{background:#1a1b22;color:#e5e7eb;border:1px solid rgba(255,255,255,.12)}
        @media (max-width:640px){.tc-banner{grid-template-columns:1fr;gap:8px}.tc-actions{display:flex;gap:8px;justify-content:flex-end}}
        @keyframes tc-slide-up{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
      `}</style>

      {/* Banner */}
      {visible && (
        <div
          className="tc-banner-wrap"
          role="region"
          aria-label="Termini e Condizioni"
          aria-live="polite"
        >
          <div className="tc-banner">
            <div className="tc-badge">
              <span className="tc-dot" aria-hidden="true" />
              <span> {t("terms")}</span>
            </div>

            <div className="tc-text">
              {msg}{" "}
              <span
                className="tc-link"
                onClick={() => setOpenModal(true)}
                role="button"
                tabIndex={0}
              >
                {link}
              </span>
              .
            </div>

            <div className="tc-actions d-flex gap-2">
              <button
                type="button"
                className="tc-btn tc-close"
                onClick={onCloseBanner}
                ref={closeBtnRef}
                aria-label="Chiudi banner Termini e Condizioni"
              >
                {close}
              </button>
              <button
                type="button"
                className="tc-btn tc-accept"
                onClick={onAccept}
              >
                {agree}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale */}
      {openModal && (
        <div
          className="tc-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tc-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpenModal(false);
          }}
        >
          <div className="tc-modal">
            <div className="tc-modal-header">
              <div id="tc-modal-title" className="tc-modal-title">
                {t("terms1")}
              </div>
              <button
                className="tc-x"
                onClick={() => setOpenModal(false)}
                aria-label="Chiudi"
              >
                ✕
              </button>
            </div>

            <div className="tc-modal-body">
              <h1 className="title">Terms & Conditions</h1>
              <p className="update">{t("terms4")} 17 agosto 2025</p>
              <p className="intro">
                {t("terms2")} {t("terms3")}
              </p>

              <main>
                <h2>{t("terms5")}</h2>
                <p>{t("terms6")}</p>

                <h2>{t("terms7")}</h2>
                <ul>
                  <li>{t("terms8")}</li>
                  <li>{t("terms9")}</li>
                  <li>{t("terms10")}</li>
                </ul>

                <h2>{t("terms11")}</h2>
                <p>{t("terms12")}</p>

                <h2>{t("terms13")}</h2>
                <p>{t("terms14")}</p>

                <h2>{t("terms15")}</h2>
                <p>{t("terms16")}</p>

                <h2>{t("terms17")}</h2>
                <p>{t("terms18")}</p>

                <h2>{t("terms19")}</h2>
                <p>{t("terms20")}</p>

                <h2>{t("terms21")}</h2>
                <p>
                  {t("terms22")}:{" "}
                  <a href="mailto:sofiavidotto8@gmail.com">
                    sofiavidotto8@gmail.com
                  </a>
                </p>
              </main>
            </div>

            <div className="tc-modal-actions">
              <button
                className="tc-btn tc-accept"
                onClick={() => setOpenModal(false)}
              >
                {t("terms23")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
