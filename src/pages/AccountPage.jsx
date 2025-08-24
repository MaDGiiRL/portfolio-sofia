// /src/pages/AccountPage.jsx
import { useContext, useState, useEffect, useMemo } from "react";
import SessionContext from "../context/SessionContext";
import { Link } from "react-router";
import supabase from "../supabase/supabase-client";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import Avatar from "../components/others/Avatar";

export default function AccountPage() {
  const { session } = useContext(SessionContext);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState(null);
  const [first_name, setFirstName] = useState(null);
  const [last_name, setLastName] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);

  // Opzionali profilo
  const [birthdate, setBirthdate] = useState("");
  const [location, setLocation] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // ===== Helpers =====
  const isValidUrl = (value) => {
    if (!value) return true;
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

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

  // ====== PROFILO ======
  useEffect(() => {
    let ignore = false;
    const getProfile = async () => {
      if (!session?.user) return;
      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from("profiles")
        .select(
          `username, first_name, last_name, avatar_url,
           birthdate, location, github_url, linkedin_url`
        )
        .eq("id", user.id)
        .single();

      if (!ignore) {
        if (error) console.warn(error);
        if (data) {
          setUsername(data.username ?? "");
          setFirstName(data.first_name ?? "");
          setLastName(data.last_name ?? "");
          setAvatarUrl(data.avatar_url ?? "");
          setBirthdate(data.birthdate ?? "");
          setLocation(data.location ?? "");
          setGithubUrl(data.github_url ?? "");
          setLinkedinUrl(data.linkedin_url ?? "");
        }
        setLoading(false);
      }
    };

    getProfile();
    return () => {
      ignore = true;
    };
  }, [session]);

  const updateProfile = async (event, avatarUrlParam) => {
    if (event?.preventDefault) event.preventDefault();
    setLoading(true);

    if (githubUrl && !isValidUrl(githubUrl)) {
      Swal.fire({
        icon: "error",
        title: t("account9"),
        text: "URL GitHub non valido (usa http/https).",
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#ff36a3",
        confirmButtonColor: "#ff36a3",
      });
      setLoading(false);
      return;
    }
    if (linkedinUrl && !isValidUrl(linkedinUrl)) {
      Swal.fire({
        icon: "error",
        title: t("account9"),
        text: "URL LinkedIn non valido (usa http/https).",
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#ff36a3",
        confirmButtonColor: "#ff36a3",
      });
      setLoading(false);
      return;
    }

    const { user } = session;
    const finalAvatar = avatarUrlParam ?? avatar_url ?? null;

    const updates = {
      id: user.id,
      username: username?.trim() || null,
      first_name: first_name?.trim() || null,
      last_name: last_name?.trim() || null,
      avatar_url: finalAvatar,
      birthdate: birthdate || null,
      location: location?.trim() || null,
      github_url: githubUrl?.trim() || null,
      linkedin_url: linkedinUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
      setAvatarUrl(finalAvatar || "");

      Swal.fire({
        icon: "success",
        title: t("account7"),
        text: t("account8"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#dbff00",
        confirmButtonColor: "#dbff00",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("account9"),
        text: error.message,
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#ff36a3",
        confirmButtonColor: "#ff36a3",
      });
    } finally {
      setLoading(false);
    }
  };

  // ====== POST SALVATI (paginati) ======
  const PAGE_SIZE = 3;
  const [saved, setSaved] = useState([]); // [{post:{id,title,cover_url,created_at}, saved_at:...}]
  const [savedPage, setSavedPage] = useState(1);
  const [savedTotal, setSavedTotal] = useState(0);
  const [savedLoading, setSavedLoading] = useState(false);

  const loadSaved = async (page = 1) => {
    if (!session?.user) return;
    setSavedLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const [{ data: rows, error }, total] = await Promise.all([
      supabase
        .from("saved_posts")
        .select("post_id, created_at", { count: "exact" })
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .range(from, to),
      countRows(
        "saved_posts",
        (q) => q.eq("user_id", session.user.id),
        "post_id"
      ),
    ]);

    if (error) {
      console.warn("saved_posts page error", error);
      setSavedLoading(false);
      return;
    }

    const postIds = (rows || []).map((r) => r.post_id);
    let postsMap = new Map();
    if (postIds.length) {
      const { data: posts, error: e2 } = await supabase
        .from("blog_posts")
        .select("id, title, created_at, cover_url")
        .in("id", postIds);
      if (!e2) postsMap = new Map(posts.map((p) => [p.id, p]));
    }

    const merged = (rows || []).map((r) => ({
      post: postsMap.get(r.post_id) || {
        id: r.post_id,
        title: "Post",
        created_at: null,
        cover_url: null,
      },
      saved_at: r.created_at,
    }));

    const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));
    setSavedTotal(total || 0);
    setSaved(merged);
    setSavedPage(Math.min(Math.max(1, page), maxPages));
    setSavedLoading(false);
  };

  useEffect(() => {
    loadSaved(1);
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const savedPages = useMemo(
    () => Math.max(1, Math.ceil((savedTotal || 0) / PAGE_SIZE)),
    [savedTotal]
  );

  const unsave = async (postId) => {
    if (!session?.user) return;
    const { error } = await supabase
      .from("saved_posts")
      .delete()
      .eq("user_id", session.user.id)
      .eq("post_id", postId);

    if (error) {
      Swal.fire({
        icon: "error",
        title: t("form5"),
        text: error.message,
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#ff36a3",
        confirmButtonColor: "#ff36a3",
      });
      return;
    }
    await loadSaved(savedPage);
  };

  // ====== LE MIE RECENSIONI (paginato + edit/delete) ======
  const [myReviews, setMyReviews] = useState([]);
  const [revPage, setRevPage] = useState(1);
  const [revTotal, setRevTotal] = useState(0);
  const [revLoading, setRevLoading] = useState(false);

  // stato editing
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadMyReviews = async (page = 1) => {
    if (!session?.user) return;
    setRevLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const [{ data: rows, error }, total] = await Promise.all([
      supabase
        .from("reviews")
        .select("id, rating, comment, approved, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .range(from, to),
      countRows("reviews", (q) => q.eq("user_id", session.user.id)),
    ]);

    if (error) console.warn("my reviews error", error);

    const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));
    setRevTotal(total || 0);
    setMyReviews(rows || []);
    setRevPage(Math.min(Math.max(1, page), maxPages));
    setRevLoading(false);
  };

  useEffect(() => {
    loadMyReviews(1);
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const revPages = useMemo(
    () => Math.max(1, Math.ceil((revTotal || 0) / PAGE_SIZE)),
    [revTotal]
  );

  const statusBadge = (approved) => {
    if (approved === true)
      return (
        <span
          className="ad-badge"
          style={{
            background: "rgba(219,255,0,.12)",
            borderColor: "rgba(219,255,0,.5)",
          }}
        >
          Approvata
        </span>
      );
    if (approved === false)
      return (
        <span
          className="ad-badge"
          style={{
            background: "rgba(255,54,163,.12)",
            borderColor: "rgba(255,54,163,.5)",
          }}
        >
          Rifiutata
        </span>
      );
    return (
      <span
        className="ad-badge"
        style={{
          background: "rgba(255,255,255,.08)",
          borderColor: "rgba(255,255,255,.2)",
        }}
      >
        In moderazione
      </span>
    );
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditRating(r.rating);
    setEditComment(r.comment);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment("");
    setEditSubmitting(false);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (editRating < 1 || editRating > 5) {
      Swal.fire({
        icon: "error",
        title: "Valutazione non valida",
        text: "Seleziona da 1 a 5 stelle.",
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#ff36a3",
        confirmButtonColor: "#ff36a3",
      });
      return;
    }
    if (!editComment || editComment.trim().length < 3) {
      Swal.fire({
        icon: "error",
        title: "Commento troppo breve",
        text: "Minimo 3 caratteri.",
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#ff36a3",
        confirmButtonColor: "#ff36a3",
      });
      return;
    }

    setEditSubmitting(true);
    const { error } = await supabase
      .from("reviews")
      .update({
        rating: editRating,
        comment: editComment.trim(),
        // quando l'utente modifica, rimettiamo in moderazione:
        approved: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId)
      .eq("user_id", session.user.id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Errore",
        text: error.message,
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#ff36a3",
        confirmButtonColor: "#ff36a3",
      });
      setEditSubmitting(false);
      return;
    }

    // aggiorna localmente
    setMyReviews((prev) =>
      prev.map((r) =>
        r.id === editingId
          ? {
              ...r,
              rating: editRating,
              comment: editComment.trim(),
              approved: null,
            }
          : r
      )
    );
    cancelEdit();

    Swal.fire({
      icon: "success",
      title: "Aggiornata",
      text: "La recensione è stata aggiornata ed è in attesa di moderazione.",
      background: "#1e1e1e",
      color: "#fff",
      iconColor: "#dbff00",
      confirmButtonColor: "#dbff00",
    });
  };

  const deleteReview = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Eliminare la recensione?",
      text: "Questa azione non può essere annullata.",
      showCancelButton: true,
      confirmButtonText: "Elimina",
      cancelButtonText: "Annulla",
      background: "#1e1e1e",
      color: "#fff",
      iconColor: "#ff36a3",
      confirmButtonColor: "#ff36a3",
      cancelButtonColor: "#666",
    });
    if (!confirm.isConfirmed) return;

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Errore",
        text: error.message,
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#ff36a3",
        confirmButtonColor: "#ff36a3",
      });
      return;
    }
    await loadMyReviews(revPage);
  };

  // ====== RENDER ======
  return (
    <div className="container text-container mt-5">
      <style>{`
        :root{
          --brand-pink: #ff36a3;
          --brand-yellow: #dbff00;
          --brand-dark: #18191a;
        }
        /* layout responsive: 1 col mobile, 2 col desktop */
        .acc-grid{
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 992px){
          .acc-grid{
            grid-template-columns: 360px 1fr;
            align-items: start;
          }
        }

        /* card/pannelli a destra (salvati + reviews) */
        .panel{
          background: rgba(24,25,26,.92);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 16px;
          padding: 16px;
        }
        .panel + .panel{ margin-top: 16px; }

        .section-header{
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          margin-bottom: 8px;
        }
        .section-header h3{
          margin:0; font-size:1rem; color:#fff; display:flex; align-items:center; gap:8px;
        }
        .count{ font-size:.9rem; color:#cbd5e1; opacity:.9; }

        /* salvati */
        .saved-grid{
          display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:14px;
        }
        .saved-card{
          position:relative; display:flex; gap:12px; align-items:center;
          padding:12px; border-radius:16px;
          background:
            linear-gradient(135deg, rgba(255,54,163,.18), rgba(219,255,0,.18)) border-box,
            linear-gradient(180deg, rgba(24,25,26,.92), rgba(24,25,26,.92)) padding-box;
          border:1px solid transparent;
          box-shadow: 0 10px 26px rgba(0,0,0,.28);
          transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease, background .15s ease;
        }
        .saved-card:hover{
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(0,0,0,.36);
          background:
            linear-gradient(135deg, rgba(255,54,163,.28), rgba(219,255,0,.28)) border-box,
            linear-gradient(180deg, rgba(24,25,26,.96), rgba(24,25,26,.96)) padding-box;
        }
        .saved-thumb{ width:92px; height:62px; flex:0 0 92px; border-radius:12px; overflow:hidden; background: linear-gradient(135deg,#1f2937,#111827); border:1px solid rgba(255,255,255,.08); }
        .saved-thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
        .saved-title{ color:#fff; font-weight:600; font-size:.98rem; margin:0 0 .2rem; line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .saved-meta{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:.78rem; color:#cbd5e1; }
        .saved-date{ display:inline-flex; align-items:center; gap:.35rem; padding:.2rem .48rem; border-radius:999px; border:1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); }
        .saved-actions{ margin-left:auto; display:flex; align-items:center; gap:8px; }
        .btn-open{ display:inline-flex; align-items:center; gap:.4rem; font-size:.85rem; padding:.35rem .6rem; border-radius:10px; color:#111; background: var(--brand-yellow); border:1px solid rgba(219,255,0,.5); text-decoration:none; }
        .btn-open:hover{ filter: brightness(1.03); }
        .btn-remove{ display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); color:#fff; }
        .btn-remove:hover{ background: rgba(255,54,163,.15); border-color: rgba(255,54,163,.5); color: var(--brand-pink); }

        /* pager */
        .ad-pager{ display:flex; gap:8px; align-items:center; }
        .ad-pager__info{ color:#a3a3a3; font-size:12px; margin-right:auto; }
        .ad-btn{ background:#dbff00; color:#111; border:1px solid rgba(219,255,0,.4); border-radius:10px; padding:.35rem .7rem; }
        .ad-btn[disabled]{ opacity:.5; cursor:not-allowed; }
        .ad-btn--ghost{ background: transparent; color:#ddd; border:1px solid rgba(255,255,255,.2); }

        /* reviews mie (altezza fissa + clamp) */
        .review-card{
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.12);
          border-radius:12px;
          padding:12px;
          height:350px;
          min-height:350px;
          display:flex;
          flex-direction:column;
        }
        .rev-body{
          flex:1;
          overflow:hidden; /* evita overflow verticale */
        }
        .rev-comment{
          color:#cbd5e1;
          margin-top:8px;
          line-height:1.5;
          display:-webkit-box;
          -webkit-line-clamp:8; /* numero linee visibili */
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
        .stars{ display:inline-flex; gap:4px; font-size:1.1rem; cursor:pointer; }
        .star{ color:#ff36a3; }
        .rev-textarea{
          font-size: 16px; display: inline-block; padding: 12px; width: 100%;
          border-radius: 6px; border: 1px solid rgb(19, 19, 19);
          color: #c9c9c9; background-color: #000; outline:none; box-shadow:none; resize: vertical;
          max-height: 200px;
        }
        .ad-badge{
          display:inline-flex; align-items:center; gap:.35rem;
          padding:.2rem .48rem; border-radius:999px;
          border:1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.06);
          font-size:.75rem; color:#e5e7eb;
        }

        /* colonna sinistra (profilo) */
        .profile-card{
          background: rgba(24,25,26,.92);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 16px;
          padding: 20px;
        }
      `}</style>

      <div className="acc-grid">
        {/* ====== COLONNA SINISTRA: profilo ====== */}
        <div className="profile-card">
          <div className="text-center mb-3">
            <Avatar
              url={avatar_url}
              alt="User Avatar"
              className="rounded-circle"
              size={150}
              onUpload={(event, url) => updateProfile(event, url)}
            />
            <div className="mt-2 small text-white-50">
              <span className="legend footer">
                <span className="dot"></span> {t("account6")}
              </span>
            </div>
          </div>

          <h2 className="h5 text-white mb-2">{t("account1")}</h2>

          <form onSubmit={updateProfile}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                value={session.user.email}
                disabled
              />
            </div>

            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                required
                value={username || ""}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="first_name">{t("form30")}</label>
              <input
                type="text"
                id="first_name"
                required
                value={first_name || ""}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="last_name">{t("form31")}</label>
              <input
                type="text"
                id="last_name"
                required
                value={last_name || ""}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* opzionali */}
            <div className="input-group">
              <label htmlFor="birthdate">Data di nascita (opzionale)</label>
              <input
                type="date"
                id="birthdate"
                value={birthdate || ""}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="location">Dove vivi (opzionale)</label>
              <input
                type="text"
                id="location"
                placeholder="Città, Paese"
                value={location || ""}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="github_url">GitHub (opzionale)</label>
              <input
                type="url"
                id="github_url"
                placeholder="https://github.com/tuo-username"
                value={githubUrl || ""}
                onChange={(e) => setGithubUrl(e.target.value)}
                inputMode="url"
              />
            </div>

            <div className="input-group">
              <label htmlFor="linkedin_url">LinkedIn (opzionale)</label>
              <input
                type="url"
                id="linkedin_url"
                placeholder="https://www.linkedin.com/in/tuo-username"
                value={linkedinUrl || ""}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                inputMode="url"
              />
            </div>

            <div className="input-group">
              <button
                type="submit"
                disabled={loading}
                className="btn-login-auth"
              >
                {loading ? t("account4") : t("account3")}
              </button>
              <p className="text-center text-warning mt-3 small">
                {t("account5")}
              </p>
            </div>

            <div className="auth-footer mt-3">
              <a href="/">
                <i className="bi bi-arrow-left-short"></i> {t("form27")}
              </a>
            </div>
            <div className="pt-3">
              <p className="small">© 2025 MaD's Portfolio. {t("form13")}</p>
            </div>
          </form>
        </div>

        {/* ====== COLONNA DESTRA: salvati + mie recensioni ====== */}
        <div>
          {/* ---- Post salvati ---- */}
          <div className="panel">
            <div className="section-header">
              <h3>
                <i className="bi bi-bookmark-check"></i> {t("account12")}
              </h3>
              <span className="count">
                {savedTotal} {savedTotal === 1 ? "articolo" : "articoli"}
              </span>
            </div>

            {savedLoading ? (
              <div className="text-white-50 py-3">Caricamento…</div>
            ) : saved.length === 0 ? (
              <div className="saved-empty">
                <p className="m-0">
                  <strong>{t("account13")}</strong>
                  <br />
                  {t("account14")}
                </p>
                <Link to="/blog" className="btn-open" style={{ marginTop: 10 }}>
                  <i className="bi bi-rocket-takeoff"></i> {t("account15")}
                </Link>
              </div>
            ) : (
              <>
                <div className="saved-grid">
                  {saved.map((it) => {
                    const p = it.post;
                    return (
                      <div key={p.id} className="saved-card">
                        <div className="saved-thumb" aria-hidden="true">
                          {p.cover_url ? (
                            <img
                              src={p.cover_url}
                              alt=""
                              loading="lazy"
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          ) : null}
                        </div>

                        <div className="saved-body">
                          <h4 className="saved-title">{p.title}</h4>
                          <div className="saved-meta">
                            <span className="saved-date">
                              <i className="bi bi-calendar3"></i>
                              {new Date(it.saved_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="saved-actions">
                          <Link
                            to={`/blog/${p.id}`}
                            className="btn-open"
                            aria-label={`Apri ${p.title}`}
                          >
                            <i className="bi bi-box-arrow-up-right"></i>
                          </Link>
                          <button
                            className="btn-remove"
                            onClick={() => unsave(p.id)}
                            title="Rimuovi dai salvati"
                            aria-label="Rimuovi dai salvati"
                          >
                            <i className="bi bi-bookmark-dash"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* pager salvati */}
                <div className="mt-3 d-flex align-items-center">
                  <div className="ad-pager__info">
                    Pagina {savedPage} / {savedPages} • {savedTotal} totali
                  </div>
                  <div className="ad-pager">
                    <button
                      className="ad-btn ad-btn--ghost"
                      onClick={() => loadSaved(savedPage - 1)}
                      disabled={savedPage <= 1}
                    >
                      ← Prev
                    </button>
                    <button
                      className="ad-btn"
                      onClick={() => loadSaved(savedPage + 1)}
                      disabled={savedPage >= savedPages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ---- Le mie recensioni ---- */}
          <div className="panel">
            <div className="section-header">
              <h3>
                <i className="bi bi-chat-heart"></i> Le mie recensioni
              </h3>
              <span className="count">
                {revTotal} {revTotal === 1 ? "recensione" : "recensioni"}
              </span>
            </div>

            {revLoading ? (
              <div className="text-white-50 py-3">Caricamento…</div>
            ) : myReviews.length === 0 ? (
              <div className="saved-empty">
                <p className="m-0">
                  <strong>Nessuna recensione</strong>
                  <br />
                  Scrivine una dalla pagina{" "}
                  <Link to="/reviews" className="text-nav">
                    Recensioni
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <div className="row g-2">
                  {myReviews.map((r) => (
                    <div key={r.id} className="col-12 col-md-6">
                      <article className="review-card">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="text-white fw-bold">Tu</div>
                          <small className="text-white-50">
                            {new Date(r.created_at).toLocaleDateString()}
                          </small>
                        </div>

                        {/* status */}
                        <div className="mt-1">{statusBadge(r.approved)}</div>

                        {/* stars (static o editabili) */}
                        <div className="mt-1">
                          {editingId === r.id ? (
                            <div
                              className="stars"
                              aria-label="Scegli il numero di stelle"
                            >
                              {Array.from({ length: 5 }).map((_, i) => {
                                const idx = i + 1;
                                const filled = editRating >= idx;
                                return (
                                  <i
                                    key={idx}
                                    className={`bi ${
                                      filled
                                        ? "bi-star-fill star"
                                        : "bi-star text-white-50"
                                    }`}
                                    onClick={() => setEditRating(idx)}
                                    role="button"
                                    aria-label={`${idx} stelle`}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            Array.from({ length: 5 }).map((_, i) => (
                              <i
                                key={i}
                                className={`bi ${
                                  i < r.rating
                                    ? "bi-star-fill star"
                                    : "bi-star text-white-50"
                                }`}
                              />
                            ))
                          )}
                        </div>

                        {/* commento (statico o editor) */}
                        <div className="rev-body">
                          {editingId === r.id ? (
                            <textarea
                              className="rev-textarea mt-2"
                              rows={4}
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              maxLength={1000}
                            />
                          ) : (
                            <p className="rev-comment mb-0">{r.comment}</p>
                          )}
                        </div>

                        {/* azioni */}
                        <div className="mt-2 d-flex gap-2">
                          {editingId === r.id ? (
                            <>
                              <button
                                className="ad-btn"
                                onClick={saveEdit}
                                disabled={editSubmitting}
                              >
                                {editSubmitting ? "Salvataggio…" : "Salva"}
                              </button>
                              <button
                                className="ad-btn ad-btn--ghost"
                                onClick={cancelEdit}
                                disabled={editSubmitting}
                              >
                                Annulla
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="ad-btn"
                                onClick={() => startEdit(r)}
                              >
                                Modifica
                              </button>
                              <button
                                className="ad-btn ad-btn--ghost"
                                onClick={() => deleteReview(r.id)}
                              >
                                Elimina
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    </div>
                  ))}
                </div>

                {/* pager reviews */}
                <div className="mt-3 d-flex align-items-center">
                  <div className="ad-pager__info">
                    Pagina {revPage} / {revPages} • {revTotal} totali
                  </div>
                  <div className="ad-pager">
                    <button
                      className="ad-btn ad-btn--ghost"
                      onClick={() => loadMyReviews(revPage - 1)}
                      disabled={revPage <= 1}
                    >
                      ← Prev
                    </button>
                    <button
                      className="ad-btn"
                      onClick={() => loadMyReviews(revPage + 1)}
                      disabled={revPage >= revPages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* gradient bg come prima */}
      <div className="gradient-bg">
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="goo">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="10"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div className="gradients-container">
          <div className="g1"></div>
          <div className="g2"></div>
          <div className="g3"></div>
          <div className="g4"></div>
          <div className="g5"></div>
          <div className="interactive"></div>
        </div>
      </div>
    </div>
  );
}
