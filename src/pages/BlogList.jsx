
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import supabase from "../supabase/supabase-client";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

const PAGE_SIZE = 2;

export default function BlogList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tag: routeTag } = useParams(); // <--- tag da rotta /blog/tag/:tag

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(null); // <--- gestito anche da rotta
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

  // ===== DATA: fetch con blog_tags e ordinamento stabile =====
  const fetchPosts = useCallback(
    async (currentPage = 1, term = "", tag = null) => {
      setLoading(true);
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("blog_posts")
        .select(
          "id, title, content, cover_url, created_at, profile_username, blog_tags",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

      // Ricerca titolo + contenuto (se vuoi solo title, rimuovi content)
      const q = term.trim();
      if (q) {
        query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
      }

      // Filtro per tag (colonna array text[] o jsonb[] chiamata blog_tags)
      if (tag && String(tag).trim()) {
        query = query.contains("blog_tags", [tag]); // match esatto del tag
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error("Errore caricamento posts:", error);
        setPosts([]);
        setTotal(0);
      } else {
        setPosts(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    },
    []
  );

  // ---- Sync stato tag con rotta ----
  useEffect(() => {
    // Se la rotta è /blog/tag/:tag, attiva il filtro. Altrimenti nessun tag.
    if (routeTag && routeTag.length > 0) {
      setActiveTag(decodeURIComponent(routeTag));
      setPage(1);
    } else {
      setActiveTag(null);
    }
  }, [routeTag]);

  // Effects
  useEffect(() => {
    fetchPosts(page, search, activeTag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTag]);

  useEffect(() => {
    const h = setTimeout(() => {
      setPage(1);
      fetchPosts(1, search, activeTag);
    }, 300);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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

  // Handlers tag
  const onTagClick = (tag) => {
    // Naviga alla rotta dei tag (deep-link)
    const encoded = encodeURIComponent(tag);
    navigate(`/blog/tag/${encoded}`);
  };
  const clearTagFilter = () => {
    navigate("/blog"); // torna alla lista generale
  };

  return (
    <div className="container py-5 mt-5">
      <style>{`
        /* ====== Cards ====== */
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

        /* Tipografia pannello (rimasta per compat, non usata) */
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

        /* Clamp */
        .blog-excerpt {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-excerpt * { display:inline !important; margin:0 !important; padding:0 !important; }
        .comment-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: .9rem;
          color: #e5e7eb;
        }
        .img-fallback { aspect-ratio: 16/9; background: linear-gradient(135deg,#1f2937,#111827); }

        /* Tag pill */
        .tag-pill{
          display:inline-block;
          background: rgba(255,255,255,.06);
          color:#e5e7eb;
          border: 1px dashed rgba(255,255,255,.18);
          border-radius:999px;
          padding:.2rem .55rem;
          font-size:.8rem;
          cursor: pointer;
          user-select: none;
        }
        .tag-pill:hover{ border-style: solid; }
      `}</style>

      {/* Header */}
      <div className="row header pt-5 align-items-center">
        <div className="col">
          <h2 className="text-white display-5 text-uppercase mb-0">
            {t("float6")}
          </h2>
        </div>
        <div className="col-auto">
          <Link to="/" className="btn-login">
            ← {t("form27")}
          </Link>
        </div>
      </div>

      {/* Filtri attivi (tag) */}
      {activeTag && (
        <div className="mt-3">
          <span className="tag-pill me-2">#{activeTag}</span>
          <button className="btn-login" onClick={clearTagFilter}>
            {t("filtro")}
          </button>
        </div>
      )}

      {/* Contenuto principale: cards */}
      <div className="mt-4">
        {loading && posts.length === 0 ? (
          <div className="text-center text-white-50 py-5">{t("account4")}</div>
        ) : (
          <>
            <div className="row g-4">
              {posts.map((post) => (
                <article
                  className="col-12 col-md-6 col-lg-6 post-col"
                  key={post.id}
                >
                  <div className="project-card h-100 overflow-hidden">
                    {/* Cover */}
                    {post.cover_url ? (
                      <img
                        src={post.cover_url}
                        alt={post.title}
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
                      <Link to={`/blog/${post.id}`}>
                        <h5 className="card-title text-nav">{post.title}</h5>
                      </Link>

                      <p className="card-text text-white-50 small my-2">
                        ✍️{" "}
                        {post.profile_username
                          ? `di ${post.profile_username}`
                          : ""}
                        {" • "}
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>

                      {/* TAGS: da blog_tags, cliccabili verso /blog/tag/:tag */}
                      {Array.isArray(post.blog_tags) &&
                        post.blog_tags.length > 0 && (
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            {post.blog_tags.map((tag, i) => (
                              <button
                                key={`${tag}-${i}`}
                                type="button"
                                className="tag-pill"
                                onClick={() => onTagClick(tag)}
                                aria-label={`Filtra per tag ${tag}`}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}

                      {/* Anteprima HTML sanitizzata (clamp 3 righe) */}
                      <div
                        className="project-description blog-excerpt text-white-50"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeExcerpt(post.content),
                        }}
                      />

                      <div className="pt-3 text-end">
                        <Link to={`/blog/${post.id}`}>
                          <span className="legend footer">
                            <span className="dot"></span> {t("p4")} →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {!loading && posts.length === 0 && (
                <div className="col-12">
                  <div className="alert alert-secondary">{t("float7")}</div>
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
                  ? `Pagina ${page} / ${totalPages} • ${total} articoli`
                  : "Nessun articolo"}
              </div>
              <nav className="ad-pager" aria-label="Paginazione articoli">
                <button
                  className="ad-btn ad-btn--ghost"
                  onClick={() => goTo(page - 1)}
                  disabled={page <= 1}
                >
                  ← Prev
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    className="ad-btn ad-btn--ghost"
                    onClick={() => goTo(p)}
                    disabled={p === page}
                    style={
                      p === page
                        ? { opacity: 0.8, cursor: "default" }
                        : undefined
                    }
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
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
    </div>
  );
}
