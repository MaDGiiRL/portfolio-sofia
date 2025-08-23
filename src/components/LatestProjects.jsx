import { useEffect, useState } from "react";
import { Link } from "react-router";
import supabase from "../supabase/supabase-client";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";

export default function LatestProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

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

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_posts")
        .select("id, title, content, cover_url, created_at, profile_username")
        .order("created_at", { ascending: false })
        .limit(3);
      if (!error) setItems(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container">
      <div className="row">
        <section className="mt-4">
          <style>{`
  
        .hlist-media{ width:100%; min-height:220px; }
        @media (min-width:768px){ .hlist-media{ min-height:100%; height:100%; } }
        .hlist-body{ padding:16px; display:flex; flex-direction:column; height:100%; }
        .hlist-title{ color: var(--accent-yellow); margin-bottom:4px; }
        .hlist-meta{ color:#a3a3a3; font-size:12px; margin-bottom:8px; }
        .hlist-excerpt{ color:#cbd5e1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>

          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="header">
              <h4 className="text-white text-left text-uppercase">
                <i className="bi bi-kanban me-2"></i> {t("latest4")}
              </h4>
            </div>
            <Link to="/progetti" className="btn-login btn-sm">
              {t("latest5")}
            </Link>
          </div>

          {loading && <div className="text-white-50 py-3">{t("account4")}</div>}
          {!loading && items.length === 0 && (
            <div className="alert alert-secondary">
              {t("latest6")}
            </div>
          )}

          <div className="d-grid gap-3">
            {items.map((p, idx) => {
              const imageRight = idx % 2 === 0; // alterna: 0→destra, 1→sinistra, ...
              return (
                <article key={p.id} className="overflow-hidden bg-custom">
                  <div className="row g-0 align-items-stretch">
                    {/* Testo */}
                    <div
                      className={`col-12 col-md-7 ${
                        imageRight ? "order-md-1" : "order-md-2"
                      }`}
                    >
                      <div className="hlist-body">
                        <Link
                          to={`/progetti/${p.id}`}
                          className="text-decoration-none"
                        >
                          <h5 className="hlist-title">{p.title}</h5>
                        </Link>
                        <div className="hlist-meta">
                          ✍️ {p.profile_username || "anon"}
                          {p.created_at && (
                            <>
                              {" "}
                              • 📅 {new Date(p.created_at).toLocaleDateString()}
                            </>
                          )}
                        </div>
                        <div
                          className="hlist-excerpt mb-3"
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

                    {/* Immagine */}
                    <div
                      className={`col-12 col-md-5 ${
                        imageRight ? "order-md-2" : "order-md-1"
                      }`}
                    >
                      <div
                        className="hlist-media"
                        style={{
                          background: p.cover_url
                            ? `linear-gradient(0deg, rgba(0,0,0,0), rgba(0,0,0,0)), url(${p.cover_url}) center/cover no-repeat`
                            : "linear-gradient(135deg, #1f2937, #111827)",
                        }}
                        aria-label={p.title}
                        role="img"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
