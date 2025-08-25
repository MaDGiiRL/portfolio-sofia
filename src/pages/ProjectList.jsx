import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router";
import supabase from "../supabase/supabase-client";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import ReviewsCarousel from "../components/reviews/ReviewsCarousel";

const PAGE_SIZE = 2;

export default function ProjectList() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

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

  // Effects
  useEffect(() => {
    fetchProjects(page, search);
  }, [page, search, fetchProjects]);

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

  return (
    <div className="container py-5 mt-5">
      <style>{`
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

        /* Tipografia (lasciata per coerenza visuale) */
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

        
      `}</style>

      {/* Header */}
      <div className="row header pt-5 align-items-center">
        <div className="col">
          <h2 className="text-white display-5 text-uppercase mb-0">
            {t("pro")}
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

            <ReviewsCarousel />
          </>
        )}
      </div>
    </div>
  );
}
