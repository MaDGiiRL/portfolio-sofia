import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import supabase from "../supabase/supabase-client";
import ProjectChat from "../components/projects/ProjectChat";
import ReviewsCarousel from "../components/reviews/ReviewsCarousel";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const BRAND = {
  pink: "#ff36a3",
  yellow: "#dbff00",
  dark: "#18191a",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(0); // %

  // Fetch singolo progetto
  const fetchProject = async () => {
    const { data, error } = await supabase
      .from("project_posts")
      .select(
        "id, title, content, cover_url, stack_tags, created_at, profile_username, github_url, preview_url" // <--- NEW
      )
      .eq("id", id)
      .single();
    if (!error) setProject(data);
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Sanitize + heading id + reading time
  const { enhancedHtml, readingTimeMin } = useMemo(() => {
    if (!project?.content) return { enhancedHtml: "", readingTimeMin: 1 };

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

    let html = project.content || "";
    html = html.replace(
      /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
      (m, lvl, attrs, inner) => {
        const hasId = /\sid\s*=/.test(attrs);
        const idAttr = hasId ? "" : ` id="${toSlug(inner)}"`;
        return `<h${lvl}${attrs}${idAttr}>${inner}</h${lvl}>`;
      }
    );

    const sanitized = sanitize(html);

    const textOnly = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    const words = textOnly.trim().split(/\s+/).filter(Boolean).length || 0;
    const minutes = Math.max(1, Math.round(words / 200));

    return { enhancedHtml: sanitized, readingTimeMin: minutes };
  }, [project?.content]);

  // Reading progress
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

  // Share/Copy
  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: project?.title || "Progetto", url });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch (_) {}
    }
  };

  if (!project) {
    return (
      <div className="container py-5">
        <div className="text-center text-white-50 py-5">{t("account4")}</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <style>{`
        :root{
          --brand-pink:${BRAND.pink};
          --brand-yellow:${BRAND.yellow};
          --brand-dark:${BRAND.dark};
        }

        /* Progress bar */
        .read-progress{
          position: fixed;
          top: 0; left: 0;
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
        }
        .hero-inner{ position: relative; z-index: 2; }

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

        /* Stack pill */
        .tag-pill{
          background: rgba(255,255,255,.06);
          color:#e5e7eb;
          border: 1px dashed rgba(255,255,255,.18);
          border-radius:999px;
          padding:.35rem .7rem;
          font-size:.85rem;
        }
        .tag-pill:hover{ border-style: solid; }

        /* Tipografia */
        .post-content{
          color:#e5e7eb;
          line-height:1.75;
          font-size:1.03rem;
        }
        .post-content h1,.post-content h2,.post-content h3{
          color:#fff; line-height:1.2;
          margin-top:1.6em; margin-bottom:.6em;
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
        .post-content pre code{ background: transparent; border: 0; padding: 0; }
        .post-content img{
          max-width: 100%; height:auto; display:block;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.06);
          margin: .75rem 0;
        }
        .post-content table{ width:100%; border-collapse: collapse; margin: 1rem 0; }
        .post-content th, .post-content td{
          border:1px solid rgba(255,255,255,.1);
          padding:.6rem .7rem;
        }
        .post-content hr{
          border: 0; height:1px; background: rgba(255,255,255,.12);
          margin: 2rem 0;
        }

        /* Buttons */


        .btn-accent-outline{
          border:1px solid var(--brand-pink);
          color:#fff;
          background: transparent;
        }
        .btn-accent-outline:hover{
          background: rgba(255,54,163,.90);
          color:white
        }

        .btn-live{
          border:1px solid var(--brand-yellow);
          color: white
                  }
        .btn-live:hover{
          background: var(--brand-yellow);
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
              {project.cover_url && (
                <div
                  className="hero-media"
                  style={{ backgroundImage: `url(${project.cover_url})` }}
                />
              )}
              <div className="hero-overlay" />
              <div className="hero-inner p-4 p-md-5">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  {project.profile_username && (
                    <span className="meta-chip meta-chip--pink">
                      <i className="bi bi-person" />
                      <span>{`di ${project.profile_username}`}</span>
                    </span>
                  )}
                  {project.created_at && (
                    <span className="meta-chip">
                      <i className="bi bi-calendar3" />
                      <span>
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </span>
                  )}
                  {/* opzionale: tempo di lettura */}
                  <span className="meta-chip meta-chip--yellow">
                    <i className="bi bi-clock" />
                    <span>{readingTimeMin} min</span>
                  </span>
                </div>

                <h1 className="fw-bold display-5 project-name mb-3">
                  {project.title}
                </h1>

                {/* STACK TAGS */}
                {Array.isArray(project.stack_tags) &&
                  project.stack_tags.length > 0 && (
                    <div className="d-flex flex-wrap gap-2">
                      {project.stack_tags.map((tag, idx) => (
                        <span key={`${tag}-${idx}`} className="bubbleData">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </motion.div>

          {/* ACTIONS */}
          <motion.div
            className="col-12 d-flex flex-wrap gap-2 justify-content-between align-items-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.05 }}
          >
            <div className="d-flex gap-2">
              <Link to="/progetti" className="btn btn-ghost btn-sm">
                ← {t("p6") || t("detail11")}
              </Link>
            </div>

            {/* NEW: Bottoni esterni */}
            <div className="d-flex gap-2">
              {project.github_url && (
                <a
                  href={project.github_url}
                  className="btn btn-sm btn-accent-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Apri repository GitHub"
                >
                  <i className="bi bi-github me-1" />
                  Codice
                </a>
              )}
              {project.preview_url && (
                <a
                  href={project.preview_url}
                  className="btn btn-sm btn-live"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Apri Live Preview"
                >
                  <i className="bi bi-box-arrow-up-right me-1" />
                  Live Preview
                </a>
              )}
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

          {/* CHAT */}
          <motion.div
            className="col-12"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
          >
            <div className="p-2 p-md-0 text-white">
              <ProjectChat project={project} />
            </div>
          </motion.div>

          <motion.div
            className="col-12"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
          >
            <ReviewsCarousel />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
