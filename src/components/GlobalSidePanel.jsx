
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import supabase from "../supabase/supabase-client";
import { useTranslation } from "react-i18next";

export default function GlobalSidePanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  const [recentPosts, setRecentPosts] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);

  // Unica query
  const [query, setQuery] = useState("");

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const currentQ = searchParams.get("q") || "";

  // Tag attivo se rotta /blog/tag/:tag
  const activeTag = location.pathname.startsWith("/blog/tag/")
    ? decodeURIComponent(location.pathname.split("/blog/tag/")[1] || "")
    : null;

  // Sincronizza input se atterri su /search?q=
  useEffect(() => {
    if (location.pathname.startsWith("/search")) setQuery(currentQ);
  }, [currentQ, location.pathname]);

  const fetchRecents = useCallback(async () => {
    const [pRes, prRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(3),
      supabase
        .from("project_posts")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(3),
    ]);
    if (!pRes.error) setRecentPosts(pRes.data || []);
    if (!prRes.error) setRecentProjects(prRes.data || []);
  }, []);

  useEffect(() => {
    fetchRecents();
  }, [fetchRecents]);

  // Chiusure/ESC/click-outside
  useEffect(() => {
    const onDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e) => {
      if (!open) return;
      const p = panelRef.current,
        b = toggleRef.current;
      if (p && !p.contains(e.target) && b && !b.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("keydown", onDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setOpen(false);
  };

  const clearBlogTag = () => navigate("/blog");

  return (
    <>
      <style>{`
        :root{ --brand-pink:#ff36a3; --brand-yellow:#dbff00; --brand-dark:#18191a;
               --side-gap:max(14px, env(safe-area-inset-right)); --panel-w:320px; --panel-h-max:540px; }
        .gfab__btn{
          position:fixed; right:var(--side-gap); top:50%; transform:translateY(-50%);
          z-index:1045; width:44px; height:44px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center;
          background:var(--brand-dark); color:var(--brand-yellow); border:2px solid var(--brand-pink);
          box-shadow:0 8px 20px rgba(0,0,0,.35), 0 0 0 2px rgba(255,54,163,.15);
          transition:transform .18s ease, box-shadow .18s ease, color .18s ease, border-color .18s ease;
        }
        .gfab__btn:hover{ transform:translateY(-50%) translateX(-2px) scale(1.03); }
        .gfab__btn[aria-expanded="true"]{ border-color:var(--brand-yellow); color:var(--brand-pink); }
        .gpanel{
          position:fixed; right:calc(var(--side-gap) + 54px); top:50%; transform:translate(8px,-50%) scale(.98);
          width:var(--panel-w); max-height:var(--panel-h-max); backdrop-filter:saturate(150%) blur(4px); z-index:1044; overflow:hidden;
          box-shadow:0 16px 40px rgba(0,0,0,.45); transition:transform .18s ease, opacity .18s ease, visibility .18s ease;
        }
        .gpanel.is-closed{ opacity:0; visibility:hidden; pointer-events:none; }
        .gpanel.is-open{ opacity:1; visibility:visible; transform:translate(0,-50%) scale(1); }
        .gpanel__body{ padding:12px 14px; max-height:calc(var(--panel-h-max) - 0px); overflow:auto; }
        .sidebar-title{ font-weight:700; text-transform:uppercase; letter-spacing:.03em; font-size:.8rem; color:#dbff00; margin-bottom:.5rem; }
        .sidebar-section + .sidebar-section { margin-top:1rem; }
        .sidebar-list{ list-style:none; margin:0; padding:0; }
        .sidebar-list li{ margin-bottom:.6rem; }
        .tag-pill{
          display:inline-block; background:rgba(255,255,255,.06); color:#e5e7eb; border:1px dashed rgba(255,255,255,.18);
          border-radius:999px; padding:.2rem .55rem; font-size:.8rem; user-select:none;
        }
        @media (max-width:575.98px){
          .gfab__btn{ right:10px; top:50%; transform:translateY(-50%); }
          .gpanel{ left:10px; right:66px; width:auto; max-height:min(80vh,640px); }
        }
      `}</style>

      {/* Toggle */}
      <button
        ref={toggleRef}
        type="button"
        className="gfab__btn ad-btn"
        aria-expanded={open}
        aria-controls="globalSidePanel"
        onClick={() => setOpen((s) => !s)}
        title={open ? "Chiudi strumenti" : "Apri strumenti"}
      >
        <i
          className={`bi ${
            open ? "bi-x-lg pt-1" : "bi-layout-sidebar-inset pt-1"
          }`}
        ></i>
      </button>

      {/* Panel */}
      <aside
        id="globalSidePanel"
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="Strumenti globali"
        className={`gpanel bg-custom ${open ? "is-open" : "is-closed"}`}
      >
        <div className="gpanel__body">
          {/* Se sei su /blog/tag/:tag, offro clear del filtro */}
          {activeTag && (
            <section className="sidebar-section">
              <span className="tag-pill me-2">#{activeTag}</span>
              <button className="ad-btn ad-btn--ghost" onClick={clearBlogTag}>
                {t("filtro")}
              </button>
            </section>
          )}

          {/* UNICA SEARCH BAR (Blog + Progetti) */}
          <section className="sidebar-section">
            <h3 className="sidebar-title">{t("float1") /* Ricerca */}</h3>
            <form onSubmit={submitSearch} className="input-group">
              <input
                type="text"
                placeholder="Cerca in tutto il sito…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-100"
              />
            </form>
          </section>

          {/* Ultimi articoli */}
          <section className="sidebar-section">
            <h3 className="sidebar-title">{t("float2")}</h3>
            <ul className="sidebar-list">
              {recentPosts.length === 0 && (
                <li className="text-white-50 small">{t("float3")}</li>
              )}
              {recentPosts.map((p) => (
                <li key={p.id}>
                  <Link to={`/blog/${p.id}`} className="text-nav d-block">
                    {p.title}
                  </Link>
                  <small className="text-white-50">
                    {new Date(p.created_at).toLocaleDateString()}
                  </small>
                </li>
              ))}
            </ul>
          </section>

          {/* Ultimi progetti */}
          <section className="sidebar-section">
            <h3 className="sidebar-title">{t("float8")}</h3>
            <ul className="sidebar-list">
              {recentProjects.length === 0 && (
                <li className="text-white-50 small">{t("float9")}</li>
              )}
              {recentProjects.map((p) => (
                <li key={p.id}>
                  <Link to={`/progetti/${p.id}`} className="text-nav d-block">
                    {p.title}
                  </Link>
                  <small className="text-white-50">
                    {new Date(p.created_at).toLocaleDateString()}
                  </small>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </>
  );
}
