import { useEffect, useMemo, useState } from "react";
import supabase from "../supabase/supabase-client";

function Box({ title, children, footer }) {
  return (
    <section className="ad-card">
      <h3 className="ad-card__title">{title}</h3>
      <div className="ad-card__body">{children}</div>
      <div className="ad-card__footer">{footer}</div>
    </section>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    unsub: 0,
  });
  const [subs, setSubs] = useState([]);
  const [q, setQ] = useState("");

  // Page size
  const PAGE_SIZE_POSTS = 3; // commenti blog
  const PAGE_SIZE_MSGS = 3; // commenti progetti

  // Liste paginated
  const [posts, setPosts] = useState([]); // commenti blog (+ post agganciato)
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);

  const [messages, setMessages] = useState([]); // commenti progetti (+ progetto agganciato)
  const [msgsPage, setMsgsPage] = useState(1);
  const [msgsTotal, setMsgsTotal] = useState(0);

  // --- Helpers ---

  // COUNT affidabile: niente head:true (che spesso ritorna 0 con RLS)
  const countRows = async (table, build) => {
    try {
      let q = supabase.from(table).select("id", { count: "exact" }).limit(1);
      if (build) q = build(q);
      const { count, error } = await q;
      if (error) {
        console.warn(`count ${table} error`, error);
        return 0;
      }
      return count ?? 0;
    } catch (e) {
      console.warn(`count ${table} exception`, e);
      return 0;
    }
  };

  // Fallback client-side ai count (rispetta RLS)
  const getStatsFallback = async () => {
    try {
      await supabase.auth.refreshSession(); // token fresco, se possibile
    } catch {}
    const [total, confirmed, pending, unsub] = await Promise.all([
      countRows("newsletter_subscribers"),
      countRows("newsletter_subscribers", (q) => q.eq("status", "confirmed")),
      countRows("newsletter_subscribers", (q) => q.eq("status", "pending")),
      countRows("newsletter_subscribers", (q) =>
        q.eq("status", "unsubscribed")
      ),
    ]);
    return { total, confirmed, pending, unsub };
  };

  // Prova API server (service role)
  async function fetchAdminStats(token) {
    let res;
    try {
      res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new Error("no_api");
    }

    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      const msg = json?.error || `HTTP ${res.status}: ${text.slice(0, 160)}`;
      throw new Error(msg);
    }
    if (!json || typeof json.total !== "number") {
      throw new Error("bad_payload");
    }
    return {
      total: json.total || 0,
      confirmed: json.confirmed || 0,
      pending: json.pending || 0,
      unsub: json.unsub || 0,
    };
  }

  // 0) Attendi che il JWT sia pronto (ma non bloccare la UI per sempre se non arriva)
  useEffect(() => {
    let unsub;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSessionReady(!!session?.access_token);
      const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
        setSessionReady(!!sess?.access_token);
      });
      unsub = sub?.subscription;
    })();
    return () => unsub?.unsubscribe?.();
  }, []);

  // 1) STAT + ultimi iscritti — adesso gira SEMPRE
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        // --- STATS via API server se possibile ---
        let loadedViaApi = false;
        if (token) {
          try {
            const s = await fetchAdminStats(token);
            setStats(s);
            loadedViaApi = true;
          } catch (e) {
            console.warn(
              "stats api error, fallback to client count:",
              e?.message || e
            );
          }
        }

        // --- Fallback client-side (RLS) ---
        if (!loadedViaApi) {
          const s = await getStatsFallback();
          setStats(s);
        }

        // --- Ultimi iscritti (lista) via RLS ---
        const { data: subsData, error: subsErr } = await supabase
          .from("newsletter_subscribers")
          .select("email,status,created_at,confirmed_at")
          .in("status", ["confirmed", "pending"])
          .order("created_at", { ascending: false })
          .limit(10);

        if (subsErr) console.warn("subs list error", subsErr);
        setSubs(subsData || []);
      } catch (err) {
        console.warn("dashboard load error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionReady]);

  // --- URL builders: slug > id (fallback) + ancora al commento ---
  const buildBlogCommentUrl = (post, commentId, postIdFallback) => {
    const slug = post?.slug;
    if (slug) return `/blog/${slug}#comment-${commentId}`;
    return `/blog/post/${post?.id ?? postIdFallback}#comment-${commentId}`;
  };

  const buildProjectCommentUrl = (project, commentId, projectIdFallback) => {
    const slug = project?.slug;
    if (slug) return `/projects/${slug}#comment-${commentId}`;
    return `/projects/${project?.id ?? projectIdFallback}#comment-${commentId}`;
  };

  // 2) Fetch paginato: ULTIMI COMMENTI BLOG (3 per pagina)
  //    Copia l’approccio della modale Notifiche: prima comments, poi batch dei post.
  const loadPosts = async (page = 1) => {
    const from = (page - 1) * PAGE_SIZE_POSTS;
    const to = from + PAGE_SIZE_POSTS - 1; // supabase range inclusivo

    const [{ data: commentsPage, error: errPage }, total] = await Promise.all([
      supabase
        .from("comments")
        .select("id, content, profile_username, created_at, blog_post_id")
        .order("created_at", { ascending: false })
        .range(from, to),
      countRows("comments"),
    ]);

    if (errPage) console.warn("blog comments page error", errPage);

    // Se non ci sono commenti, aggiorna stato e esci
    if (!commentsPage?.length) {
      const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_POSTS));
      setPostsTotal(total || 0);
      setPosts([]);
      setPostsPage(Math.min(Math.max(1, page), maxPages));
      return;
    }

    // Estrai gli ID post unici
    const postIds = Array.from(
      new Set(
        commentsPage
          .map((c) => c.blog_post_id)
          .filter((v) => v !== null && v !== undefined)
      )
    );

    // Batch fetch dei post (titolo/slug) — come fa la modale con link by id
    let postsMap = new Map();
    if (postIds.length) {
      const { data: postsData, error: postsErr } = await supabase
        .from("blog_posts")
        .select("id, title, slug")
        .in("id", postIds);

      if (postsErr) {
        console.warn("blog posts batch error", postsErr);
      } else {
        postsMap = new Map(postsData.map((p) => [p.id, p]));
      }
    }

    // Unisci i dati
    const merged = commentsPage.map((c) => ({
      ...c,
      blog_post: postsMap.get(c.blog_post_id) || null,
    }));

    const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_POSTS));
    setPostsTotal(total || 0);
    setPosts(merged);
    setPostsPage(Math.min(Math.max(1, page), maxPages));
  };

  // 3) Fetch paginato: ULTIMI COMMENTI PROGETTI (3 per pagina)
  const loadMessages = async (page = 1) => {
    const from = (page - 1) * PAGE_SIZE_MSGS;
    const to = from + PAGE_SIZE_MSGS - 1;

    const [{ data: commentsPage, error: errPage }, total] = await Promise.all([
      supabase
        .from("project_comments")
        .select("id, content, profile_username, created_at, project_post_id")
        .order("created_at", { ascending: false })
        .range(from, to),
      countRows("project_comments"),
    ]);

    if (errPage) console.warn("project comments page error", errPage);

    if (!commentsPage?.length) {
      const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_MSGS));
      setMsgsTotal(total || 0);
      setMessages([]);
      setMsgsPage(Math.min(Math.max(1, page), maxPages));
      return;
    }

    const projectIds = Array.from(
      new Set(
        commentsPage
          .map((c) => c.project_post_id)
          .filter((v) => v !== null && v !== undefined)
      )
    );

    let projectsMap = new Map();
    if (projectIds.length) {
      const { data: projData, error: projErr } = await supabase
        .from("project_posts")
        .select("id, title, slug")
        .in("id", projectIds);

      if (projErr) {
        console.warn("project posts batch error", projErr);
      } else {
        projectsMap = new Map(projData.map((p) => [p.id, p]));
      }
    }

    const merged = commentsPage.map((c) => ({
      ...c,
      project: projectsMap.get(c.project_post_id) || null,
    }));

    const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_MSGS));
    setMsgsTotal(total || 0);
    setMessages(merged);
    setMsgsPage(Math.min(Math.max(1, page), maxPages));
  };

  // 4) carica le prime pagine; se non c'è sessione mostriamo un hint non-bloccante
  useEffect(() => {
    if (!sessionReady) return; // rispetto RLS: carico solo autenticato
    loadPosts(1);
    loadMessages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady]);

  const filteredSubs = useMemo(() => {
    if (!q.trim()) return subs;
    const s = q.trim().toLowerCase();
    return subs.filter((r) => (r.email || "").toLowerCase().includes(s));
  }, [q, subs]);

  const copyEmails = async () => {
    const emails = subs
      .filter((s) => s.status === "confirmed")
      .map((s) => s.email)
      .join(", ");
    await navigator.clipboard.writeText(emails);
    alert("Email copiate negli appunti");
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div
          className="spinner-border text-light me-2"
          role="status"
          aria-hidden="true"
        />
        <span className="text-secondary">Caricamento…</span>
      </div>
    );
  }

  const postsPages = Math.max(1, Math.ceil(postsTotal / PAGE_SIZE_POSTS));
  const msgsPages = Math.max(1, Math.ceil(msgsTotal / PAGE_SIZE_MSGS));

  return (
    <>
      <div className="ad-wrap mb-5">
        {/* STAT */}
        <div className="ad-stats">
          {[
            { k: "Totali", v: stats.total },
            { k: "Confermati", v: stats.confirmed },
            { k: "Pending", v: stats.pending },
            { k: "Unsub", v: stats.unsub },
          ].map((it, i) => (
            <div key={i} className="ad-stat">
              <div className="ad-stat__k">{it.k}</div>
              <div className="ad-stat__v">{it.v}</div>
            </div>
          ))}
        </div>

        {/* Ultimi iscritti */}
        <Box title="Ultimi iscritti (confirmed/pending)">
          <div className="ad-toolbar">
            <input
              className="ad-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca email…"
            />
            <button onClick={copyEmails} className="ad-btn">
              Copia
            </button>
            <a
              href="/api/newsletter/export"
              className="ad-btn"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              Export
            </a>
          </div>

          <div className="ad-subs">
            {filteredSubs.map((s, idx) => (
              <div key={idx} className="ad-subs__row">
                <div className="ad-subs__email">{s.email}</div>
                <div
                  className={
                    s.status === "confirmed"
                      ? "ad-subs__status--ok"
                      : "ad-subs__status--pending"
                  }
                >
                  {s.status}
                </div>
                <div className="ad-subs__date">
                  {new Date(s.confirmed_at || s.created_at).toLocaleString()}
                </div>
              </div>
            ))}
            {!filteredSubs.length && (
              <div style={{ color: "#a3a3a3" }}>Nessun iscritto</div>
            )}
          </div>
        </Box>

        {/* Ultimi contenuti */}
        <div className="ad-two">
          {/* COMMENTI BLOG con paginazione (3) */}
          <Box
            title="Ultimi commenti Blog"
            footer={
              <div className="ad-pager">
                <span className="ad-pager__info">
                  Pagina {postsPage} / {postsPages} • {postsTotal} totali
                </span>
                <button
                  className="ad-btn ad-btn--ghost"
                  onClick={() => loadPosts(postsPage - 1)}
                  disabled={postsPage <= 1 || !sessionReady}
                  title={
                    !sessionReady ? "Accedi per vedere i commenti" : undefined
                  }
                >
                  ← Prev
                </button>
                <button
                  className="ad-btn"
                  onClick={() => loadPosts(postsPage + 1)}
                  disabled={postsPage >= postsPages || !sessionReady}
                  title={
                    !sessionReady ? "Accedi per vedere i commenti" : undefined
                  }
                >
                  Next →
                </button>
              </div>
            }
          >
            {sessionReady ? (
              posts.length ? (
                posts.map((p, i) => (
                  <div key={i} className="ad-cardline">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="ad-username">
                        {p.profile_username || "anon"}
                      </span>
                      {(p.blog_post || p.blog_post_id) && (
                        <a
                          className="ad-project" // stessa classe per allineamento a destra
                          href={buildBlogCommentUrl(
                            p.blog_post,
                            p.id,
                            p.blog_post_id
                          )}
                          title={p.blog_post?.title || "Apri il post"}
                        >
                          {p.blog_post?.title || "Vedi post"}
                        </a>
                      )}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{p.content}</div>
                    <div className="ad-meta">
                      {new Date(p.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#a3a3a3" }}>Nessun commento</div>
              )
            ) : (
              <div className="text-secondary">
                Accedi per visualizzare i commenti recenti
              </div>
            )}
          </Box>

          {/* COMMENTI PROGETTI con paginazione (3) */}
          <Box
            title="Ultimi commenti Progetti"
            footer={
              <div className="ad-pager">
                <span className="ad-pager__info">
                  Pagina {msgsPage} / {msgsPages} • {msgsTotal} totali
                </span>
                <button
                  className="ad-btn ad-btn--ghost"
                  onClick={() => loadMessages(msgsPage - 1)}
                  disabled={msgsPage <= 1 || !sessionReady}
                  title={
                    !sessionReady ? "Accedi per vedere i commenti" : undefined
                  }
                >
                  ← Prev
                </button>
                <button
                  className="ad-btn"
                  onClick={() => loadMessages(msgsPage + 1)}
                  disabled={msgsPage >= msgsPages || !sessionReady}
                  title={
                    !sessionReady ? "Accedi per vedere i commenti" : undefined
                  }
                >
                  Next →
                </button>
              </div>
            }
          >
            {sessionReady ? (
              messages.length ? (
                messages.map((m, i) => (
                  <div key={i} className="ad-cardline">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="ad-username">
                        {m.profile_username || "anon"}
                      </span>
                      {(m.project || m.project_post_id != null) && (
                        <a
                          className="ad-project"
                          href={buildProjectCommentUrl(
                            m.project,
                            m.id,
                            m.project_post_id
                          )}
                          title={m.project?.title || "Apri il progetto"}
                        >
                          {m.project?.title || "Vedi progetto"}
                        </a>
                      )}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                    <div className="ad-meta">
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#a3a3a3" }}>Nessun commento</div>
              )
            ) : (
              <div className="text-secondary">
                Accedi per visualizzare i commenti recenti
              </div>
            )}
          </Box>
        </div>
      </div>
    </>
  );
}
