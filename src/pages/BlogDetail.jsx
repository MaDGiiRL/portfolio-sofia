import { useEffect, useMemo, useState, useContext, useCallback } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import supabase from "../supabase/supabase-client";
import BlogChat from "../components/blog/BlogChat";
import SessionContext from "../context/SessionContext";
import Swal from "sweetalert2";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const BRAND = {
  pink: "#ff36a3",
  yellow: "#dbff00",
  dark: "#18191a",
};

export default function BlogDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);

  const [post, setPost] = useState(null);
  const [progress, setProgress] = useState(0); // reading progress %
  const [isSaved, setIsSaved] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  // --- Fetch singolo post ---
  const fetchPost = useCallback(async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, title, content, cover_url, blog_tags, created_at, profile_username"
      )
      .eq("id", id)
      .single();

    if (!error) setPost(data);
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // --- Verifica se è salvato per l'utente loggato ---
  const refreshSavedState = useCallback(async () => {
    if (!session?.user || !id) {
      setIsSaved(false);
      return;
    }
    const { data, error } = await supabase
      .from("saved_posts")
      .select("post_id")
      .eq("user_id", session.user.id)
      .eq("post_id", id)
      .maybeSingle();

    if (!error) setIsSaved(Boolean(data));
  }, [session?.user, id]);

  useEffect(() => {
    refreshSavedState();
  }, [refreshSavedState]);

  // --- Tempo di lettura & contenuto migliorato ---
  const { enhancedHtml, readingTimeMin } = useMemo(() => {
    if (!post?.content) return { enhancedHtml: "", readingTimeMin: 1 };

    // Sanitize + aggiungo id agli H2/H3 per ancore/toc leggere
    const sanitize = (html) =>
      DOMPurify.sanitize(html || "", {
        ADD_ATTR: ["id"],
      });

    const toSlug = (str) =>
      String(str)
        .replace(/<[^>]*>/g, "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    let html = post.content || "";

    // Aggiunge id a h2/h3 se mancano
    html = html.replace(
      /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
      (m, lvl, attrs, inner) => {
        const hasId = /\sid\s*=/.test(attrs);
        const idAttr = hasId ? "" : ` id="${toSlug(inner)}"`;
        return `<h${lvl}${attrs}${idAttr}>${inner}</h${lvl}>`;
      }
    );

    const sanitized = sanitize(html);

    // Stima tempo lettura
    const textOnly = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    const words = textOnly.trim().split(/\s+/).filter(Boolean).length || 0;
    const minutes = Math.max(1, Math.round(words / 200)); // 200 wpm

    return { enhancedHtml: sanitized, readingTimeMin: minutes };
  }, [post?.content]);

  // --- Reading progress bar ---
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      const pct =
        height > 0 ? Math.min(100, Math.max(0, (scrolled / height) * 100)) : 0;
      setProgress(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // === SALVA / RIMUOVI SALVATO ===
  const requireAuth = () => {
    if (!session?.user) {
      Swal.fire({
        icon: "info",
        title:  t("detail1"),
        text: t("detail2"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#dbff00",
        confirmButtonColor: "#dbff00",
      });
      return false;
    }
    return true;
  };

  const onToggleSave = async () => {
    if (!requireAuth() || !post?.id) return;
    setPendingSave(true);
    try {
      if (!isSaved) {
        const { error } = await supabase.from("saved_posts").insert({
          user_id: session.user.id,
          post_id: post.id, // UUID
        });
        if (error) throw error;
        setIsSaved(true);
        Swal.fire({
          icon: "success",
          title: t("detail3"),
          background: "#1e1e1e",
          color: "#fff",
          iconColor: "#dbff00",
          confirmButtonColor: "#dbff00",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", session.user.id)
          .eq("post_id", post.id);
        if (error) throw error;
        setIsSaved(false);
        Swal.fire({
          icon: "success",
          title: t("detail4"),
          background: "#1e1e1e",
          color: "#fff",
          iconColor: "#dbff00",
          confirmButtonColor: "#dbff00",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: t("detail5"),
        text: e.message || String(e),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#ff36a3",
        confirmButtonColor: "#ff36a3",
      });
    } finally {
      setPendingSave(false);
    }
  };

  if (!post) {
    return (
      <div className="container py-5">
        <div className="text-center text-white-50 py-5">{t("account4")}</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* --- Styles locali (lightweight) --- */}
      <style>{`
        :root{
          --brand-pink:${BRAND.pink};
          --brand-yellow:${BRAND.yellow};
          --brand-dark:${BRAND.dark};
        }

        /* Progress bar in alto */
        .read-progress{
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          width: ${progress}%;
          background: linear-gradient(90deg, var(--brand-pink), var(--brand-yellow));
          z-index: 1100;
          transition: width .12s linear;
        }

        /* Hero */
        .hero-wrap{
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          background: linear-gradient(135deg, #1f2937, #111827);
          min-height: 260px;
        }
        .hero-media{
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: .9;
        }
        .hero-overlay{
          position: absolute;
          inset: 0;
          background: radial-gradient(1200px 400px at 10% -10%, rgba(255,54,163,.25), transparent 60%),
                      radial-gradient(1000px 600px at 110% 110%, rgba(219,255,0,.12), transparent 45%),
                      linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.65));
          mix-blend-mode: normal;
        }
        .hero-inner{
          position: relative;
          z-index: 2;
        }

        /* Card contenuto */
        .content-card{
          background: rgba(24,25,26,.85);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,.35);
        }

        /* Meta chip */
        .meta-chip{
          display:inline-flex; align-items:center; gap:.4rem;
          font-size:.85rem; color:#cbd5e1;
          background: rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.08);
          padding:.35rem .6rem; border-radius:999px;
        }
        .meta-chip .bi{ font-size:.95rem; opacity:.9; }
        .meta-chip--pink{ border-color: rgba(255,54,163,.35); }
        .meta-chip--yellow{ border-color: rgba(219,255,0,.35); }

        /* Tag pill */
        .tag-pill{
          background: rgba(255,255,255,.06);
          color:#e5e7eb;
          border: 1px dashed rgba(255,255,255,.18);
          border-radius:999px;
          padding:.35rem .7rem;
          font-size:.85rem;
        }
        .tag-pill:hover{ border-style: solid; }

        /* Tipografia contenuto */
        .post-content{
          color:#e5e7eb;
          line-height:1.75;
          font-size:1.03rem;
        }
        .post-content h1,.post-content h2,.post-content h3{
          color:#fff;
          margin-top:1.6em;
          margin-bottom:.6em;
          line-height:1.2;
        }
        .post-content h2{
          border-left: 4px solid var(--brand-pink);
          padding-left:.6rem;
        }
        .post-content a{
          color: var(--brand-yellow);
          text-decoration: underline dotted;
          text-underline-offset: 3px;
        }
        .post-content p{ margin: 1em 0; }
        .post-content blockquote{
          margin:1.2em 0; padding: .9em 1.1em;
          background: rgba(255,255,255,.05);
          border-left: 3px solid var(--brand-yellow);
          border-radius: 8px;
          color:#e5e7eb;
        }
        .post-content pre{
          background: #0d0f12;
          border:1px solid rgba(255,255,255,.08);
          border-radius: 10px;
          padding: .9rem 1rem; overflow:auto;
          margin: 1rem 0;
        }
        .post-content code{
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 6px;
          padding: .1rem .35rem;
        }
        .post-content pre code{
          background: transparent; border: 0; padding: 0;
        }
        .post-content img{
          max-width: 100%; height:auto; display:block;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.06);
          margin: .75rem 0;
        }
        .post-content table{
          width:100%; border-collapse: collapse; margin: 1rem 0;
        }
        .post-content th, .post-content td{
          border:1px solid rgba(255,255,255,.1);
          padding:.6rem .7rem;
        }
        .post-content hr{
          border: 0; height:1px; background: rgba(255,255,255,.12);
          margin: 2rem 0;
        }

 
      `}</style>

      {/* progress bar */}
      <div className="read-progress" />

      <section className="py-md-4 py-lg-5">
        <div className="row g-4 align-items-stretch mt-1">
          {/* HERO */}
          <motion.div
            className="col-12"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="hero-wrap rounded-4 mb-3">
              {post.cover_url && (
                <div
                  className="hero-media"
                  style={{ backgroundImage: `url(${post.cover_url})` }}
                />
              )}
              <div className="hero-overlay" />
              <div className="hero-inner p-4 p-md-5">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  {post.profile_username && (
                    <span className="meta-chip meta-chip--pink">
                      <i className="bi bi-person" />
                      <span>{`di ${post.profile_username}`}</span>
                    </span>
                  )}
                  {post.created_at && (
                    <span className="meta-chip">
                      <i className="bi bi-calendar3" />
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </span>
                  )}
                </div>

                <h1 className="fw-bold display-5 project-name mb-3">
                  {post.title}
                </h1>

                {/* TAGS */}
                {Array.isArray(post.blog_tags) && post.blog_tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {post.blog_tags.map((tag, idx) => (
                      <span key={`${tag}-${idx}`} className="bubbleData">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ACTIONS */}
          <motion.div
            className="col-12 d-flex justify-content-between align-items-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.05 }}
          >
            <Link to="/blog" className="btn btn-ghost btn-sm">
              ← {t("p6") || t("detail8") }
            </Link>

            <div className="d-flex gap-2">
              {/* Salva (toggle) */}
              <button
                className="btn btn-ghost btn-sm"
                onClick={onToggleSave}
                disabled={pendingSave}
                aria-pressed={isSaved}
                title={isSaved ? t("detail9") : t("detail10")}
              >
                <i
                  className={`bi ${
                    isSaved ? "bi-bookmark-check" : "bi-bookmark"
                  }`}
                />{" "}
                {isSaved ? t("detail6") : t("detail7")}
              </button>
            </div>
          </motion.div>

          {/* CONTENUTO */}
          <motion.div
            className="col-12"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            <div className="content-card p-3 p-md-4">
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: enhancedHtml }}
              />
            </div>
          </motion.div>

          {/* CHAT / COMMENTI */}
          {/* <motion.div
            className="col-12"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
          >
            <div className="p-2 p-md-0 text-white">
              <BlogChat post={post} />
            </div>
          </motion.div> */}
        </div>
      </section>
    </div>
  );
}
