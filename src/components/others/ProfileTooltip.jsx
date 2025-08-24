import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import supabase from "../../supabase/supabase-client";


export default function ProfileTooltip({
  username,
  profileId,
  triggerClassName = "nickname-link",
  children, // opzionale: testo custom per il trigger (default = @username)
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const btnRef = useRef(null);
  const cardRef = useRef(null);

  const canOpen =
    username &&
    username !== "Unknown" &&
    username !== "You" &&
    username !== "Anonimo";

  const toggle = () => canOpen && setOpen((s) => !s);
  const close = () => setOpen(false);

  const computePosition = () => {
    const el = btnRef.current;
    const card = cardRef.current;
    if (!el || !card) return;
    const r = el.getBoundingClientRect();
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardRect = card.getBoundingClientRect();

    // preferisci sotto, centrato al trigger
    let left = Math.min(
      Math.max(margin, r.left + r.width / 2 - cardRect.width / 2),
      vw - cardRect.width - margin
    );
    let top = r.bottom + margin;

    // se non ci sta sotto, prova sopra
    if (
      top + cardRect.height + margin > vh &&
      r.top - cardRect.height - margin > margin
    ) {
      top = r.top - cardRect.height - margin;
    }

    setPos({ top, left });
  };

  // fetch on open
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!open) return;
      setError("");
      setLoading(true);

      let q = supabase
        .from("profiles")
        .select(
          "id, username, first_name, last_name, role, birthdate, location, github_url, linkedin_url, updated_at"
        );

      if (username) q = q.eq("username", username);
      else if (profileId) q = q.eq("id", profileId);
      else {
        setLoading(false);
        return;
      }

      const { data, error } = await q.single();
      if (!ignore) {
        if (error) setError(error.message || "Profilo non trovato");
        setProfile(data || null);
        setLoading(false);
        setTimeout(computePosition, 0);
      }
    };
    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, username, profileId]);

  // reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const onScroll = () => computePosition();
    const onResize = () => computePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    computePosition();
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // outside click / ESC
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => e.key === "Escape" && close();
    const onClick = (e) => {
      const b = btnRef.current;
      const c = cardRef.current;
      if (b && c && !b.contains(e.target) && !c.contains(e.target)) close();
    };
    document.addEventListener("keydown", onDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const fullName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ")
    : "";
  const birth = profile?.birthdate
    ? new Date(profile.birthdate).toLocaleDateString()
    : null;

  return (
    <>
      <style>{`
        /* Trigger elegante per il nickname */
        .nickname-link{
          appearance:none; border:0; background:none; padding:0;
          color:#e5e7eb; font-weight:700; line-height:1.2;
          cursor:${canOpen ? "pointer" : "default"};
          position:relative;
        }
        .nickname-link:hover,
        .nickname-link:focus-visible{
          color: var(--brand-yellow, #dbff00);
          outline:none;
        }
        .nickname-link::after{
          content:"";
          position:absolute; left:0; right:0; bottom:-1px; height:2px;
          background: linear-gradient(90deg, var(--brand-pink,#ff36a3), var(--brand-yellow,#dbff00));
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform .18s ease-in-out;
        }
        .nickname-link:hover::after,
        .nickname-link:focus-visible::after{
          transform: scaleX(1);
        }

        /* Tooltip card minimal */
        .profile-tip{
          background: rgba(24,25,26,.98);
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 16px 40px rgba(0,0,0,.45);
          border-radius: 12px;
          padding: 12px 12px 10px;
          color:#e5e7eb;
          width: 320px;
        }
        .profile-tip__title{
          margin:0 0 2px 0; color:#fff; font-weight:800; font-size:1rem;
        }
        .profile-tip__sub{
          color:#cbd5e1; font-size:.9rem; margin-bottom:6px;
        }
        .tip-row{
          display:flex; align-items:center; gap:8px; font-size:.9rem; margin-top:4px;
        }
        .tip-row .bi{ opacity:.9; }
        .tip-links{ display:flex; gap:8px; margin-top:10px; }
        .btn-ext{
          border:1px solid rgba(255,255,255,.12); color:#fff; background:transparent;
          border-radius:10px; padding:.3rem .55rem; font-size:.85rem; text-decoration:none;
        }
        .btn-ext:hover{ background: rgba(255,255,255,.08); }
        .skeleton{
          background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.12), rgba(255,255,255,.06));
          background-size: 200% 100%; animation: sk 1.2s infinite; border-radius:8px; height:64px;
        }
        @keyframes sk{ 0%{ background-position: 200% 0; } 100%{ background-position: -200% 0; } }
        .error-tip{ color:#ffb4c7; font-size:.9rem; }
      `}</style>

      <button
        type="button"
        ref={btnRef}
        className={triggerClassName}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={canOpen ? `Mostra profilo di @${username}` : undefined}
      >
        {children ?? (username ? `@${username}` : "@utente")}
      </button>

      {open &&
        createPortal(
          <div
            ref={cardRef}
            role="dialog"
            aria-label={`Scheda profilo di ${username}`}
            className="profile-tip"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 2000,
            }}
          >
            {loading ? (
              <div className="skeleton" />
            ) : error ? (
              <div className="error-tip">{error}</div>
            ) : profile ? (
              <>
                <h3 className="profile-tip__title">
                  {fullName || `@${profile.username}`}
                </h3>
                <div className="profile-tip__sub">
                  @{profile.username}
                  {profile.role ? ` • ${profile.role}` : ""}
                </div>

                {profile.location && (
                  <div className="tip-row">
                    <i className="bi bi-geo-alt"></i>
                    <span>{profile.location}</span>
                  </div>
                )}
                {birth && (
                  <div className="tip-row">
                    <i className="bi bi-cake2"></i>
                    <span>{birth}</span>
                  </div>
                )}

                <div className="tip-links">
                  {profile.github_url && (
                    <a
                      className="btn-ext"
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-github me-1"></i> GitHub
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      className="btn-ext"
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-linkedin me-1"></i> LinkedIn
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="error-tip">Profilo non trovato</div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
