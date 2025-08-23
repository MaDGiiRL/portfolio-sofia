// /src/pages/ProjectList.jsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router";
import supabase from "../supabase/supabase-client";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

const PAGE_SIZE = 2;

export default function ProjectList() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pannello flottante (ex sidebar)
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const searchInputRef = useRef(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / PAGE_SIZE)),
    [total]
  );

  // Sanitizers
  const sanitizeExcerpt = (html) =>
    DOMPurify.sanitize(html || "", {
      ALLOWED_TAGS: [
        "b",
        "strong",
        "i",
        "em",
        "u",
        "s",
        "a",
        "p",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "span",
        "br",
        "h1",
        "h2",
        "h3",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });

  const sanitizeToText = (html) =>
    DOMPurify.sanitize(html || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

  // ===== DATA: fetch con count separato e ordinamento stabile =====
  const fetchProjects = useCallback(async (currentPage = 1, term = "") => {
    setLoading(true);

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Builder separati per count (HEAD) e data
    const countBuilder = supabase
      .from("project_posts")
      .select("id", { count: "exact", head: true });

    const dataBuilder = supabase
      .from("project_posts")
      .select("id, title, content, cover_url, created_at, profile_username")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    // Filtri ricerca identici su entrambe
    const q = term.trim();
    if (q) {
      // Estendi a content oltre al title (volendo lascia solo title)
      const filter = `title.ilike.%${q}%,content.ilike.%${q}%`;
      countBuilder.or(filter);
      dataBuilder.or(filter);
    }

    const [countRes, dataRes] = await Promise.all([countBuilder, dataBuilder]);

    if (countRes.error) {
      console.error("Errore count progetti:", countRes.error);
      setTotal(0);
    } else {
      setTotal(countRes.count ?? 0);
    }

    if (dataRes.error) {
      console.error("Errore caricamento progetti:", dataRes.error);
      setProjects([]);
    } else {
      setProjects(dataRes.data || []);
    }

    setLoading(false);
  }, []);

  const fetchPanelData = useCallback(async () => {
    // Ultimi 3 progetti e ultimi 3 commenti
    const [pRes, cRes] = await Promise.all([
      supabase
        .from("project_posts")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(3),
      // Assumo tabella 'project_comments' con: id, content, created_at, profile_username, project_id
      supabase
        .from("project_comments")
        .select("id, content, created_at, profile_username, project_id")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(3),
    ]);

    if (!pRes.error) setRecentProjects(pRes.data || []);
    if (!cRes.error) setRecentComments(cRes.data || []);
    if (pRes.error) console.warn("Errore ultimi progetti:", pRes.error);
    if (cRes.error) console.warn("Errore ultimi commenti:", cRes.error);
  }, []);

  // Effects
  useEffect(() => {
    fetchProjects(page, search);
  }, [page, search, fetchProjects]);

  // debounce della search (opzionale): se lo vuoi, rimetti il timeout e rimuovi search dai deps dell'effetto sopra.
  // In questa versione aggiornata la UX è immediata e coerente con la paginazione.

  useEffect(() => {
    fetchPanelData(); // solo on-mount
  }, [fetchPanelData]);

  // Focus input quando apro il pannello
  useEffect(() => {
    if (panelOpen) {
      const tmo = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(tmo);
    }
  }, [panelOpen]);

  // Chiudi con click esterno ed ESC
  useEffect(() => {
    const onDown = (e) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    const onClick = (e) => {
      if (!panelOpen) return;
      const p = panelRef.current;
      const b = toggleRef.current;
      if (p && !p.contains(e.target) && b && !b.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("keydown", onDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, [panelOpen]);

  // Pagination
  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  };

  const pageNumbers = useMemo(() => {
    const max = Math.min(totalPages, 5);
    const start = Math.max(1, Math.min(page - 2, totalPages - max + 1));
    return Array.from({ length: max }, (_, i) => start + i);
  }, [page, totalPages]);

  // Pannello flottante laterale a metà schermo (stile identico a BlogList)
  const FloatingPanel = (
    <>
      {/* Toggle laterale a metà schermo */}
      <button
        ref={toggleRef}
        type="button"
        className="proj-fab__btn ad-btn"
        aria-expanded={panelOpen}
        aria-controls="projectsFloatingPanel"
        onClick={() => setPanelOpen((s) => !s)}
        title={
          panelOpen ? "Chiudi strumenti progetti" : "Apri strumenti progetti"
        }
      >
        <i
          className={`bi ${
            panelOpen ? "bi-x-lg pt-1" : "bi-layout-sidebar-inset pt-1"
          }`}
        ></i>
      </button>

      {/* Pannello centrato verticalmente sul lato */}
      <aside
        id="projectsFloatingPanel"
        ref={panelRef}
        role="dialog"
        aria-label="Strumenti dei progetti"
        aria-modal="false"
        className={`proj-fab__panel bg-custom ${
          panelOpen ? "is-open" : "is-closed"
        }`}
      >
        <div className="proj-fab__panel-body">
          {/* Ricerca (legata alla lista principale) */}
          <section className="sidebar-section">
            <h3 className="sidebar-title">{t("float1")}</h3>
            <div className="input-group">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cerca un progetto…"
                value={search}
                onChange={(e) => {
                  setPage(1); // reset pagina quando cambi ricerca
                  setSearch(e.target.value);
                }}
                className="w-100"
              />
            </div>
          </section>

          {/* Ultimi 3 progetti */}
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

  return (
    <div className="container py-5 mt-5">
      <style>{`
        /* === Brand colors === (copiati da BlogList) */
        :root{
          --brand-pink:   #ff36a3;
          --brand-yellow: #dbff00;
          --brand-dark:   #18191aff;

          --side-gap: max(14px, env(safe-area-inset-right));
          --panel-w: 320px;
          --panel-h-max: 540px;
        }

        /* ====== Cards ====== (copiati da BlogList) */
        .post-col{ display:flex; justify-content:center; align-items:stretch; }
        .post-col .project-card{
          width:100%;
          max-width: 680px;
          display:flex;
          flex-direction:column;
          position:relative;
        }
        .post-col .project-content{ position: static !important; }
        .post-col img{ display:block; }

        /* Tipografia pannello (copiata) */
        .sidebar-title {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .03em;
          font-size: .8rem;
          color: #dbff00;
          margin-bottom: .5rem;
        }
        .sidebar-section + .sidebar-section { margin-top: 1rem; }
        .sidebar-list { list-style: none; margin: 0; padding: 0; }
        .sidebar-list li { margin-bottom: .6rem; }
        .xsmall { font-size: .75rem; }

        /* Clamp (copiato) */
        .proj-excerpt, .blog-excerpt { 
          display: -webkit-box; 
          -webkit-line-clamp: 3; 
          -webkit-box-orient: vertical; 
          overflow: hidden; 
        }
        .proj-excerpt *,.blog-excerpt * { display:inline !important; margin:0 !important; padding:0 !important; }
        .comment-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: .9rem;
          color: #e5e7eb;
        }
        .img-fallback { aspect-ratio: 16/9; background: linear-gradient(135deg,#1f2937,#111827); }

        /* ====== Toggle laterale (centrato verticalmente) ====== */
        .proj-fab__btn{
          position: fixed;
          right: var(--side-gap);
          top: 50%;
          transform: translateY(-50%);
          z-index: 1045;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0,0,0,.35);
        }
        .proj-fab__btn .bi{ font-size: 1.1rem; }

        .proj-fab__btn,
        .proj-fab__btn.ad-btn{
          background: var(--brand-dark);
          color: var(--brand-yellow);
          border: 2px solid var(--brand-pink);
          box-shadow:
            0 8px 20px rgba(0,0,0,.35),
            0 0 0 2px rgba(255,54,163,.15);
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease, border-color .18s ease;
          transform: translateY(-50%);
        }
        .proj-fab__btn .bi{ color: currentColor; }

        .proj-fab__btn:hover{
          transform: translateY(-50%) translateX(-2px) scale(1.03);
          box-shadow:
            0 14px 28px rgba(0,0,0,.45),
            0 0 0 2px rgba(255,54,163,.25),
            0 0 16px rgba(219,255,0,.18);
        }
        .proj-fab__btn:active{ transform: translateY(-50%) scale(.98); }
        .proj-fab__btn:focus-visible{
          outline: 3px solid rgba(219,255,0,.6);
          outline-offset: 2px;
        }
        .proj-fab__btn[aria-expanded="true"]{
          border-color: var(--brand-yellow);
          color: var(--brand-pink);
        }

        /* ====== Pannello flottante ====== */
        .proj-fab__panel{
          position: fixed;
          right: calc(var(--side-gap) + 54px);
          top: 50%;
          transform: translate(8px, -50%) scale(.98);
          width: var(--panel-w);
          max-height: var(--panel-h-max);
          backdrop-filter: saturate(150%) blur(4px);
          box-shadow: 0 16px 40px rgba(0,0,0,.45);
          z-index: 1044;
          transform-origin: center right;
          transition: transform .18s ease, opacity .18s ease, visibility .18s ease;
          overflow: hidden;
        }
        .proj-fab__panel.is-closed{
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .proj-fab__panel.is-open{
          opacity: 1;
          visibility: visible;
          transform: translate(0, -50%) scale(1);
          box-shadow:
            0 16px 40px rgba(0,0,0,.45),
            0 0 0 2px rgba(219,255,0,.12);
        }
        .proj-fab__panel-body{
          padding: 12px 14px;
          max-height: calc(var(--panel-h-max) - 0px);
          overflow: auto;
        }

        /* ====== Mobile ====== */
        @media (max-width: 575.98px){
          .proj-fab__btn{
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
          }
          .proj-fab__btn:hover{
            transform: translateY(-50%) translateX(-2px) scale(1.03);
          }
          .proj-fab__panel{
            left: 10px;
            right: 66px;
            width: auto;
            max-height: min(80vh, 640px);
            transform: translate(8px, -50%) scale(.98);
          }
          .proj-fab__panel.is-open{
            transform: translate(0, -50%) scale(1);
          }
        }
      `}</style>

      {/* Header */}
      <div className="row header pt-5 align-items-center">
        <div className="col">
          <h2 className="text-white display-5 text-uppercase mb-0">
            <i className="bi bi-kanban"></i> {t("pro")}
          </h2>
        </div>
        <div className="col-auto">
          <Link to="/" className="btn-login">
            ← {t("form27")}
          </Link>
        </div>
      </div>

      {/* Contenuto principale: cards responsive (2 colonne) */}
      <div className="mt-4">
        {loading && projects.length === 0 ? (
          <div className="text-center text-white-50 py-5">{t("account4")}</div>
        ) : (
          <>
            <div className="row g-4">
              {projects.map((p) => (
                <article
                  className="col-12 col-md-6 col-lg-6 post-col"
                  key={p.id}
                >
                  <div className="project-card h-100 overflow-hidden">
                    {/* Cover */}
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt={p.title}
                        className="w-100"
                        loading="lazy"
                        style={{
                          aspectRatio: "16 / 9",
                          objectFit: "cover",
                          display: "block",
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml;charset=UTF-8," +
                            encodeURIComponent(
                              `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'>
                                 <defs>
                                   <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
                                     <stop stop-color='#1f2937' offset='0' />
                                     <stop stop-color='#111827' offset='1' />
                                   </linearGradient>
                                 </defs>
                                 <rect width='100%' height='100%' fill='url(#g)'/>
                               </svg>`
                            );
                        }}
                      />
                    ) : (
                      <div className="img-fallback" />
                    )}

                    <div className="project-content d-flex flex-column pt-4">
                      <Link to={`/progetti/${p.id}`}>
                        <h5 className="card-title text-nav">{p.title}</h5>
                      </Link>

                      <p className="card-text text-white-50 small my-2">
                        ✍️{" "}
                        {p.profile_username ? `di ${p.profile_username}` : ""}{" "}
                        {" • "} {new Date(p.created_at).toLocaleDateString()}
                      </p>

                      {/* Anteprima HTML sanitizzata (clamp 3 righe) */}
                      <div
                        className="project-description blog-excerpt text-white-50"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeExcerpt(p.content),
                        }}
                      />

                      <div className="pt-3 text-end">
                        <Link to={`/progetti/${p.id}`}>
                          <span className="legend footer">
                            <span className="dot"></span> {t("p4")} →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {!loading && projects.length === 0 && (
                <div className="col-12">
                  <div className="alert alert-secondary">{t("pro1")}</div>
                </div>
              )}
            </div>

            {/* Paginazione */}
            <div className="mt-4 d-flex align-items-center">
              <div
                className="ad-pager__info"
                style={{ marginRight: "auto", color: "#a3a3a3", fontSize: 12 }}
              >
                {total > 0
                  ? `Pagina ${page} / ${totalPages} • ${total} progetti`
                  : "Nessun progetto"}
              </div>
              <nav className="ad-pager" aria-label="Paginazione progetti">
                <button
                  className="ad-btn ad-btn--ghost"
                  onClick={() => goTo(page - 1)}
                  disabled={page <= 1}
                >
                  ← Prev
                </button>
                {pageNumbers.map((pnum) => (
                  <button
                    key={pnum}
                    className="ad-btn ad-btn--ghost"
                    onClick={() => goTo(pnum)}
                    disabled={pnum === page}
                    style={
                      pnum === page
                        ? { opacity: 0.8, cursor: "default" }
                        : undefined
                    }
                    aria-current={pnum === page ? "page" : undefined}
                  >
                    {pnum}
                  </button>
                ))}
                <button
                  className="ad-btn"
                  onClick={() => goTo(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next →
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Pannello flottante laterale a metà schermo */}
      {FloatingPanel}
    </div>
  );
}
