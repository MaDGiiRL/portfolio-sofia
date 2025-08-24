
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import supabase from "../supabase/supabase-client";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

const PAGE_SIZE = 2;

export default function SearchResults() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // {id,title,content,cover_url,created_at,profile_username,type}

  // Stato paginazione
  const [page, setPage] = useState(1);

  const sanitizeExcerpt = (html) =>
    DOMPurify.sanitize(html || "", {
      ALLOWED_TAGS: [
        "b","strong","i","em","u","s","a","p","ul","ol","li","blockquote","code","pre","span","br","h1","h2","h3",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });

  const fetchAll = useCallback(async () => {
    setLoading(true);

    // Costruisci filtro per Supabase
    const filter = q ? `title.ilike.%${q}%,content.ilike.%${q}%` : "";

    const blogBuilder = supabase
      .from("blog_posts")
      .select("id, title, content, cover_url, created_at, profile_username", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    const projBuilder = supabase
      .from("project_posts")
      .select("id, title, content, cover_url, created_at, profile_username", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (q) {
      blogBuilder.or(filter);
      projBuilder.or(filter);
    }

    const [blogRes, projRes] = await Promise.all([blogBuilder, projBuilder]);

    const blogItems = !blogRes.error ? (blogRes.data || []).map((r) => ({ ...r, type: "blog" })) : [];
    const projItems = !projRes.error ? (projRes.data || []).map((r) => ({ ...r, type: "project" })) : [];

    // Merge + sort by created_at desc
    const merged = [...blogItems, ...projItems].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    setItems(merged);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Reset pagina se cambia query o cambia il set di risultati
  useEffect(() => {
    setPage(1);
  }, [q, items.length]);

  const total = items.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / PAGE_SIZE)),
    [total]
  );

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  };

  const pageNumbers = useMemo(() => {
    const max = Math.min(totalPages, 5);
    const start = Math.max(1, Math.min(page - 2, totalPages - max + 1));
    return Array.from({ length: max }, (_, i) => start + i);
  }, [page, totalPages]);

  // Slice paginato
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const visible = items.slice(from, to);

  return (
    <div className="container py-5 mt-5">
      <style>{`
        .post-col{ display:flex; justify-content:center; align-items:stretch; }
        .post-col .project-card{ width:100%; max-width: 680px; display:flex; flex-direction:column; position:relative; }
        .post-col img{ display:block; }
        .type-pill{
          display:inline-block; border-radius:999px; padding:.2rem .55rem; font-size:.75rem; font-weight:600; letter-spacing:.02em;
          border:1px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.06); color:#e5e7eb;
        }
        .type-pill.blog{ border-color:#ff36a3; }
        .type-pill.project{ border-color:#dbff00; }
        .img-fallback{ aspect-ratio:16/9; background:linear-gradient(135deg,#1f2937,#111827); }
        .excerpt{ display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; color:#cbd5e1; }
        .excerpt *{ display:inline !important; margin:0 !important; padding:0 !important; }
      `}</style>

      {/* Header */}
      <div className="row header pt-5 align-items-center">
        <div className="col">
          <h2 className="text-white display-6 text-uppercase mb-0">
            <i className="bi bi-search"></i> Risultati ricerca
          </h2>
        </div>
        <div className="col-auto">
          <Link to="/" className="btn-login">← {t("form27")}</Link>
        </div>
      </div>

      <p className="text-white-50 mt-2">
        {loading ? "Caricamento…" : `${total} risultati totali`}
      </p>

      <div className="mt-4">
        {loading ? (
          <div className="text-center text-white-50 py-5">{t("account4")}</div>
        ) : total === 0 ? (
          <div className="alert alert-secondary">Nessun risultato.</div>
        ) : (
          <>
            <div className="row g-4">
              {visible.map((it) => {
                const href = it.type === "blog" ? `/blog/${it.id}` : `/progetti/${it.id}`;
                const typeLabel = it.type === "blog" ? "Articolo Blog" : "Progetto";
                const typeClass = it.type === "blog" ? "blog" : "project";
                return (
                  <article className="col-12 col-md-4 col-lg-6 post-col" key={`${it.type}-${it.id}`}>
                    <div className="project-card h-100 overflow-hidden">
                      {it.cover_url ? (
                        <img
                          src={it.cover_url}
                          alt={it.title}
                          className="w-100"
                          loading="lazy"
                          style={{ aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml;charset=UTF-8," +
                              encodeURIComponent(
                                `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'>
                                   <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
                                   <stop stop-color='#1f2937' offset='0'/><stop stop-color='#111827' offset='1'/></linearGradient></defs>
                                   <rect width='100%' height='100%' fill='url(#g)'/></svg>`
                              );
                          }}
                        />
                      ) : (<div className="img-fallback" />)}

                      <div className="project-content d-flex flex-column pt-4">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className={`type-pill ${typeClass}`}>{typeLabel}</span>
                          <small className="text-white-50">
                            {new Date(it.created_at).toLocaleDateString()}
                          </small>
                        </div>

                        <Link to={href}><h5 className="card-title text-nav mt-3">{it.title}</h5></Link>

                        <p className="card-text text-white-50 small my-2">
                          ✍️ {it.profile_username ? `di ${it.profile_username}` : ""}
                        </p>

                        <div
                          className="excerpt"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(it.content || "", {
                              ALLOWED_TAGS: ["b","strong","i","em","u","s","a","p","ul","ol","li","blockquote","code","pre","span","br"],
                              ALLOWED_ATTR: ["href","target","rel"],
                            }),
                          }}
                        />

                        <div className="pt-3 text-end">
                          <Link to={href}>
                            <span className="legend footer">
                              <span className="dot"></span> {t("p4")} →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Paginazione */}
            <div className="mt-4 d-flex align-items-center">
              <div
                className="ad-pager__info"
                style={{ marginRight: "auto", color: "#a3a3a3", fontSize: 12 }}
              >
                {total > 0
                  ? `Pagina ${page} / ${totalPages} • ${total} risultati`
                  : "Nessun risultato"}
              </div>
              <nav className="ad-pager" aria-label="Paginazione risultati">
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
                    style={p === page ? { opacity: 0.8, cursor: "default" } : undefined}
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
