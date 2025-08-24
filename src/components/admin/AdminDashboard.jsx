import { useEffect, useMemo, useState } from "react";
import supabase from "../../supabase/supabase-client";

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

  // page sizes
  const PAGE_SIZE_POSTS = 3;
  const PAGE_SIZE_MSGS = 3;
  const PAGE_SIZE_REVIEWS = 3;
  const PAGE_SIZE_SAVED = 6;

  // blog comments
  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);

  // project comments
  const [messages, setMessages] = useState([]);
  const [msgsPage, setMsgsPage] = useState(1);
  const [msgsTotal, setMsgsTotal] = useState(0);

  // reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  // saved posts
  const [savedRows, setSavedRows] = useState([]);
  const [savedPage, setSavedPage] = useState(1);
  const [savedTotal, setSavedTotal] = useState(0);

  // ---------- Helpers ----------
  // selettore colonna parametrico (default "id")
  const countRows = async (table, build, selectExpr = "id") => {
    try {
      let q = supabase
        .from(table)
        .select(selectExpr, { count: "exact" })
        .limit(1);
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

  const getStatsFallback = async () => {
    try {
      await supabase.auth.refreshSession();
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

  // ---------- Session readiness ----------
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

  // ---------- Initial dashboard data ----------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        // Stats via API se disponibile, altrimenti fallback client-side
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
        if (!loadedViaApi) {
          const s = await getStatsFallback();
          setStats(s);
        }

        // Ultimi iscritti
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

  // ---------- URL builders (ID-based, niente slug) ----------
  const buildBlogCommentUrl = (post, commentId, postIdFallback) =>
    `/blog/${post?.id ?? postIdFallback}#comment-${commentId}`;
  const buildProjectCommentUrl = (project, commentId, projectIdFallback) =>
    `/progetti/${project?.id ?? projectIdFallback}#comment-${commentId}`;

  const buildBlogUrl = (post, postIdFallback) =>
    `/blog/${post?.id ?? postIdFallback}`;
  const buildProjectUrl = (project, projectIdFallback) =>
    `/progetti/${project?.id ?? projectIdFallback}`;

  // ---------- Loaders ----------
  const loadPosts = async (page = 1) => {
    const from = (page - 1) * PAGE_SIZE_POSTS;
    const to = from + PAGE_SIZE_POSTS - 1;

    const [{ data: commentsPage, error: errPage }, total] = await Promise.all([
      supabase
        .from("comments")
        .select("id, content, profile_username, created_at, blog_post_id")
        .order("created_at", { ascending: false })
        .range(from, to),
      countRows("comments"),
    ]);

    if (errPage) console.warn("blog comments page error", errPage);

    if (!commentsPage?.length) {
      const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_POSTS));
      setPostsTotal(total || 0);
      setPosts([]);
      setPostsPage(Math.min(Math.max(1, page), maxPages));
      return;
    }

    const postIds = Array.from(
      new Set(
        commentsPage
          .map((c) => c.blog_post_id)
          .filter((v) => v !== null && v !== undefined)
      )
    );

    let postsMap = new Map();
    if (postIds.length) {
      const { data: postsData, error: postsErr } = await supabase
        .from("blog_posts")
        .select("id, title")
        .in("id", postIds);
      if (postsErr) console.warn("blog posts batch error", postsErr);
      else postsMap = new Map(postsData.map((p) => [p.id, p]));
    }

    const merged = commentsPage.map((c) => ({
      ...c,
      blog_post: postsMap.get(c.blog_post_id) || null,
    }));

    const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_POSTS));
    setPostsTotal(total || 0);
    setPosts(merged);
    setPostsPage(Math.min(Math.max(1, page), maxPages));
  };

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
        .select("id, title")
        .in("id", projectIds);
      if (projErr) console.warn("project posts batch error", projErr);
      else projectsMap = new Map(projData.map((p) => [p.id, p]));
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

  // NUOVO: Post salvati (user -> blog_post)
  const loadSaved = async (page = 1) => {
    const from = (page - 1) * PAGE_SIZE_SAVED;
    const to = from + PAGE_SIZE_SAVED - 1;

    const [{ data: savedPageData, error: savedErr }, total] = await Promise.all(
      [
        supabase
          .from("saved_posts")
          .select("user_id, post_id, created_at", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to),
        countRows("saved_posts", undefined, "post_id"),
      ]
    );

    if (savedErr) console.warn("saved posts page error", savedErr);

    if (!savedPageData?.length) {
      const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_SAVED));
      setSavedTotal(total || 0);
      setSavedRows([]);
      setSavedPage(Math.min(Math.max(1, page), maxPages));
      return;
    }

    const postIds = Array.from(new Set(savedPageData.map((r) => r.post_id)));
    const userIds = Array.from(new Set(savedPageData.map((r) => r.user_id)));

    let postsMap = new Map();
    if (postIds.length) {
      const { data: posts, error: postsErr } = await supabase
        .from("blog_posts")
        .select("id, title")
        .in("id", postIds);
      if (postsErr)
        console.warn("saved posts batch blog_posts error", postsErr);
      else postsMap = new Map(posts.map((p) => [p.id, p]));
    }

    let profilesMap = new Map();
    if (userIds.length) {
      const { data: profs, error: profErr } = await supabase
        .from("profiles")
        .select("id, username, first_name, last_name")
        .in("id", userIds);
      if (profErr) console.warn("saved posts batch profiles error", profErr);
      else profilesMap = new Map(profs.map((p) => [p.id, p]));
    }

    const merged = savedPageData.map((r) => ({
      ...r,
      post: postsMap.get(r.post_id) || null,
      profile: profilesMap.get(r.user_id) || null,
    }));

    const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_SAVED));
    setSavedTotal(total || 0);
    setSavedRows(merged);
    setSavedPage(Math.min(Math.max(1, page), maxPages));
  };

  const loadReviews = async (page = 1) => {
    const from = (page - 1) * PAGE_SIZE_REVIEWS;
    const to = from + PAGE_SIZE_REVIEWS - 1;

    const [{ data: pageData, error: errPage }, total] = await Promise.all([
      supabase
        .from("reviews")
        .select(
          "id, display_name, rating, comment, created_at, subject_type, subject_id",
          { count: "exact" }
        )
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .range(from, to),
      countRows("reviews", (q) => q.eq("approved", true)),
    ]);

    if (errPage) console.warn("reviews page error", errPage);

    if (!pageData?.length) {
      const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_REVIEWS));
      setReviewsTotal(total || 0);
      setReviews([]);
      setReviewsPage(Math.min(Math.max(1, page), maxPages));
      return;
    }

    // batch resolve subjects
    const blogIds = Array.from(
      new Set(
        pageData
          .filter((r) => r.subject_type === "blog" && r.subject_id)
          .map((r) => r.subject_id)
      )
    );
    const projIds = Array.from(
      new Set(
        pageData
          .filter((r) => r.subject_type === "project" && r.subject_id)
          .map((r) => r.subject_id)
      )
    );

    let blogMap = new Map();
    if (blogIds.length) {
      const { data: blogData, error: blogErr } = await supabase
        .from("blog_posts")
        .select("id, title")
        .in("id", blogIds);
      if (blogErr) console.warn("reviews blog batch error", blogErr);
      else blogMap = new Map(blogData.map((p) => [p.id, p]));
    }

    let projMap = new Map();
    if (projIds.length) {
      const { data: projData, error: projErr } = await supabase
        .from("project_posts")
        .select("id, title")
        .in("id", projIds);
      if (projErr) console.warn("reviews project batch error", projErr);
      else projMap = new Map(projData.map((p) => [p.id, p]));
    }

    const merged = pageData.map((r) => ({
      ...r,
      blog_post:
        r.subject_type === "blog" ? blogMap.get(r.subject_id) || null : null,
      project:
        r.subject_type === "project" ? projMap.get(r.subject_id) || null : null,
    }));

    const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE_REVIEWS));
    setReviewsTotal(total || 0);
    setReviews(merged);
    setReviewsPage(Math.min(Math.max(1, page), maxPages));
  };

  // ---------- Boot paginated boxes ----------
  useEffect(() => {
    if (!sessionReady) return;
    loadPosts(1);
    loadMessages(1);
    loadReviews(1);
    loadSaved(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady]);

  // ---------- Subs filter + copy ----------
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

  // ---------- Loading ----------
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

  // ---------- Paging totals ----------
  const postsPages = Math.max(1, Math.ceil(postsTotal / PAGE_SIZE_POSTS));
  const msgsPages = Math.max(1, Math.ceil(msgsTotal / PAGE_SIZE_MSGS));
  const reviewsPages = Math.max(1, Math.ceil(reviewsTotal / PAGE_SIZE_REVIEWS));
  const savedPages = Math.max(1, Math.ceil(savedTotal / PAGE_SIZE_SAVED));

  // ---------- Render ----------
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

        {/* Due colonne di contenuti */}
        <div className="ad-two">
          {/* COMMENTI BLOG */}
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
                          className="ad-project"
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

          {/* COMMENTI PROGETTI */}
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

          {/* ULTIME RECENSIONI */}
          <Box
            title="Ultime recensioni"
            footer={
              <div className="ad-pager">
                <span className="ad-pager__info">
                  Pagina {reviewsPage} / {reviewsPages} • {reviewsTotal} totali
                </span>
                <button
                  className="ad-btn ad-btn--ghost"
                  onClick={() => loadReviews(reviewsPage - 1)}
                  disabled={reviewsPage <= 1 || !sessionReady}
                  title={
                    !sessionReady
                      ? "Accedi per vedere le recensioni"
                      : undefined
                  }
                >
                  ← Prev
                </button>
                <button
                  className="ad-btn"
                  onClick={() => loadReviews(reviewsPage + 1)}
                  disabled={reviewsPage >= reviewsPages || !sessionReady}
                  title={
                    !sessionReady
                      ? "Accedi per vedere le recensioni"
                      : undefined
                  }
                >
                  Next →
                </button>
              </div>
            }
          >
            {sessionReady ? (
              reviews.length ? (
                reviews.map((r, i) => {
                  const subjectTitle =
                    r.subject_type === "blog"
                      ? r.blog_post?.title || "Apri post"
                      : r.subject_type === "project"
                      ? r.project?.title || "Apri progetto"
                      : "Recensioni";

                  const subjectHref =
                    r.subject_type === "blog"
                      ? buildBlogUrl(r.blog_post, r.subject_id)
                      : r.subject_type === "project"
                      ? buildProjectUrl(r.project, r.subject_id)
                      : "/reviews";

                  return (
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
                          {r.display_name || "Utente"}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                    
                          <a
                            className="ad-project"
                            href={subjectHref}
                            title={subjectTitle}
                          >
                            {subjectTitle}
                          </a>
                        </div>
                      </div>

                      <div style={{ margin: "4px 0" }}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <i
                            key={j}
                            className={`bi ${
                              j < r.rating ? "bi-star-fill" : "bi-star"
                            }`}
                            style={{
                              color: j < r.rating ? "#ff36a3" : "#a3a3a3",
                            }}
                          />
                        ))}
                      </div>

                      <div style={{ whiteSpace: "pre-wrap" }}>{r.comment}</div>

                      <div className="ad-meta">
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: "#a3a3a3" }}>Nessuna recensione</div>
              )
            ) : (
              <div className="text-secondary">
                Accedi per visualizzare le recensioni recenti
              </div>
            )}
          </Box>

          {/* POST SALVATI DI RECENTE */}
          <Box
            title="Post salvati di recente"
            footer={
              <div className="ad-pager">
                <span className="ad-pager__info">
                  Pagina {savedPage} / {savedPages} • {savedTotal} totali
                </span>
                <button
                  className="ad-btn ad-btn--ghost"
                  onClick={() => loadSaved(savedPage - 1)}
                  disabled={savedPage <= 1 || !sessionReady}
                  title={
                    !sessionReady ? "Accedi per vedere i salvataggi" : undefined
                  }
                >
                  ← Prev
                </button>
                <button
                  className="ad-btn"
                  onClick={() => loadSaved(savedPage + 1)}
                  disabled={savedPage >= savedPages || !sessionReady}
                  title={
                    !sessionReady ? "Accedi per vedere i salvataggi" : undefined
                  }
                >
                  Next →
                </button>
              </div>
            }
          >
            {sessionReady ? (
              savedRows.length ? (
                savedRows.map((r, i) => {
                  const prof = r.profile;
                  const displayName =
                    prof?.first_name || prof?.last_name
                      ? [prof?.first_name, prof?.last_name]
                          .filter(Boolean)
                          .join(" ")
                      : prof?.username || "utente";
                  const postTitle = r.post?.title || "Vedi post";
                  const postHref = buildBlogUrl(r.post, r.post_id);

                  return (
                    <div
                      key={`${r.user_id}-${r.post_id}-${r.created_at}-${i}`}
                      className="ad-cardline"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="ad-username">{displayName}</span>
                        <a
                          className="ad-project"
                          href={postHref}
                          title={postTitle}
                        >
                          {postTitle}
                        </a>
                      </div>

                      <div className="ad-meta">
                        Salvato il {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: "#a3a3a3" }}>Nessun salvataggio</div>
              )
            ) : (
              <div className="text-secondary">
                Accedi per visualizzare i salvataggi recenti
              </div>
            )}
          </Box>
        </div>
      </div>
    </>
  );
}
