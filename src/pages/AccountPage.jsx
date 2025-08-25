import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import {
  User,
  BookmarkCheck,
  Star,
  MessageSquareText,
  Home,
  Menu,
} from "lucide-react";

import SessionContext from "../context/SessionContext";
import supabase from "../supabase/supabase-client";
import Avatar from "../components/others/Avatar";

const ACCENT_PINK = "#ff36a3";
const ACCENT_YELLOW = "#dbff00";
const PAGE_SIZE = 6;
const COM_FETCH_LIMIT = PAGE_SIZE * 10; // per unione blog+progetti

// nav: solo chiavi; le label arrivano da i18n con chiavi singole (es. "nav_informazioni")
const navItems = [
  { key: "informazioni", icon: User },
  { key: "salvati", icon: BookmarkCheck },
  { key: "recensioni", icon: Star },
  { key: "commenti", icon: MessageSquareText },
];

function ChangePasswordBox() {
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  const onChangePwd = async (e) => {
    e.preventDefault();
    if (!pwd1 || pwd1.length < 8) {
      Swal.fire({
        icon: "error",
        title: t("a1"),
        text: t("a2"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      return;
    }
    if (pwd1 !== pwd2) {
      Swal.fire({
        icon: "error",
        title: t("a3"),
        text: t("a4"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd1 });
      if (error) throw error;
      setPwd1("");
      setPwd2("");
      Swal.fire({
        icon: "success",
        title: t("a5"),
        text: t("a6"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_YELLOW,
        confirmButtonColor: ACCENT_YELLOW,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("form5"),
        text: err.message,
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={onChangePwd}
      className="row g-2 contactForm"
      aria-label="Cambio password"
    >
      <div className="col-12 col-md-6">
        <label className="form-label small">{t("a7")}</label>
        <input
          type="password"
          value={pwd1}
          onChange={(e) => setPwd1(e.target.value)}
          placeholder="Min. 8 caratteri"
        />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label small">{t("a8")}</label>
        <input
          type="password"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
        />
      </div>
      <div className="col-12">
        <button disabled={busy}>{busy ? t("a9") : t("a10")}</button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const { session } = useContext(SessionContext);
  const { t } = useTranslation();

  // fallback locali nel caso manchino le chiavi nel JSON
  const defaultNavLabels = {
    informazioni: "Informazioni",
    salvati: "Salvati",
    recensioni: "Recensioni",
    commenti: "Commenti recenti",
  };

  // ===== NAV =====
  const [active, setActive] = useState("informazioni");

  // ===== PROFILO =====
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [avatar_url, setAvatarUrl] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [location, setLocation] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // ===== SALVATI =====
  const [saved, setSaved] = useState([]); // [{post:{id,title,cover_url,created_at}, saved_at}]
  const [savedPage, setSavedPage] = useState(1);
  const [savedTotal, setSavedTotal] = useState(0);
  const [savedLoading, setSavedLoading] = useState(false);

  // ===== RECENSIONI =====
  const [myReviews, setMyReviews] = useState([]);
  const [revPage, setRevPage] = useState(1);
  const [revTotal, setRevTotal] = useState(0);
  const [revLoading, setRevLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ===== COMMENTI =====
  const [myComments, setMyComments] = useState([]); // unione blog+progetti con metadata
  const [comPage, setComPage] = useState(1);
  const [comTotal, setComTotal] = useState(0);
  const [comLoading, setComLoading] = useState(false);

  // ===== HELPERS =====
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
      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  };

  // ===== LOAD PROFILO =====
  useEffect(() => {
    let ignore = false;
    const getProfile = async () => {
      if (!session?.user) return;
      setLoading(true);
      const { user } = session;
      const { data } = await supabase
        .from("profiles")
        .select(
          `username, first_name, last_name, avatar_url, birthdate, location, github_url, linkedin_url`
        )
        .eq("id", user.id)
        .single();
      if (!ignore && data) {
        setUsername(data.username ?? "");
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
        setAvatarUrl(data.avatar_url ?? "");
        setBirthdate(data.birthdate ?? "");
        setLocation(data.location ?? "");
        setGithubUrl(data.github_url ?? "");
        setLinkedinUrl(data.linkedin_url ?? "");
      }
      if (!ignore) setLoading(false);
    };
    getProfile();
    return () => (ignore = true);
  }, [session]);

  const updateProfile = async (event, avatarUrlParam) => {
    if (event?.preventDefault) event.preventDefault();
    setLoading(true);

    if (githubUrl && !isValidUrl(githubUrl)) {
      Swal.fire({
        icon: "error",
        title: t("account9"),
        text: t("a11"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      setLoading(false);
      return;
    }
    if (linkedinUrl && !isValidUrl(linkedinUrl)) {
      Swal.fire({
        icon: "error",
        title: t("account9"),
        text: t("a12"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
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
        title: t("a7"),
        text: t("a8"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_YELLOW,
        confirmButtonColor: ACCENT_YELLOW,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("a9"),
        text: error.message,
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== SALVATI =====
  const loadSaved = async (page = 1) => {
    if (!session?.user) return;
    setSavedLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1; // <-- FIX qui

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

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
    if (!error) loadSaved(savedPage);
  };

  // ===== RECENSIONI =====
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

    if (!error) {
      const maxPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));
      setRevTotal(total || 0);
      setMyReviews(rows || []);
      setRevPage(Math.min(Math.max(1, page), maxPages));
    }
    setRevLoading(false);
  };

  useEffect(() => {
    loadMyReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const revPages = useMemo(
    () => Math.max(1, Math.ceil((revTotal || 0) / PAGE_SIZE)),
    [revTotal]
  );

  const statusBadge = (approved) => {
    if (approved === true)
      return (
        <span className="ad-badge ad-badge--ok">
          <i className="bi bi-check2-circle"></i> {t("approved") || "Approvata"}
        </span>
      );
    if (approved === false)
      return (
        <span className="ad-badge ad-badge--ko">
          <i className="bi bi-x-circle"></i> {t("rejected") || "Rifiutata"}
        </span>
      );
    return (
      <span className="ad-badge ad-badge--pending">
        <i className="bi bi-hourglass-split"></i>{" "}
        {t("pending") || "In moderazione"}
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
        title: t("a13"),
        text: t("a14"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      return;
    }
    if (!editComment || editComment.trim().length < 3) {
      Swal.fire({
        icon: "error",
        title: t("a15"),
        text: t("a16"),
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      return;
    }
    setEditSubmitting(true);
    const { error } = await supabase
      .from("reviews")
      .update({
        rating: editRating,
        comment: editComment.trim(),
        approved: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId)
      .eq("user_id", session.user.id);
    if (error) {
      Swal.fire({
        icon: "error",
        title: t("form5"),
        text: error.message,
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      setEditSubmitting(false);
      return;
    }
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
      title: t("a17"),
      text: t("a18"),
      background: "#1e1e1e",
      color: "#fff",
      iconColor: ACCENT_YELLOW,
      confirmButtonColor: ACCENT_YELLOW,
    });
  };

  const deleteReview = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: t("a19"),
      text: t("a20"),
      showCancelButton: true,
      confirmButtonText: t("a21"),
      cancelButtonText: t("b16"),
      background: "#1e1e1e",
      color: "#fff",
      iconColor: ACCENT_PINK,
      confirmButtonColor: ACCENT_PINK,
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
        title: t("form5"),
        text: error.message,
        background: "#1e1e1e",
        color: "#fff",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      return;
    }
    await loadMyReviews(revPage);
  };

  // ===== COMMENTI (blog + progetti) =====
  const loadMyComments = async (page = 1) => {
    if (!session?.user) return;
    setComLoading(true);

    // conteggi
    const [countBlog, countProj] = await Promise.all([
      countRows("comments", (q) => q.eq("user_id", session.user.id)),
      countRows("project_comments", (q) => q.eq("user_id", session.user.id)),
    ]);

    const total = (countBlog || 0) + (countProj || 0);

    // carica commenti raw
    let blog = [];
    let proj = [];

    const [{ data: b1, error: be1 }, { data: p1, error: pe1 }] =
      await Promise.all([
        supabase
          .from("comments")
          .select(
            "id, created_at, profile_username, content, blog_post_id, user_id"
          )
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(COM_FETCH_LIMIT),
        supabase
          .from("project_comments")
          .select(
            "id, created_at, profile_username, content, project_post_id, user_id"
          )
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(COM_FETCH_LIMIT),
      ]);

    blog = b1 || [];
    proj = p1 || [];

    // fallback su username quando user_id non è disponibile
    if ((be1 && username) || (pe1 && username)) {
      const [{ data: b2 }, { data: p2 }] = await Promise.all([
        be1
          ? supabase
              .from("comments")
              .select("id, created_at, profile_username, content, blog_post_id")
              .eq("profile_username", username)
              .order("created_at", { ascending: false })
              .limit(COM_FETCH_LIMIT)
          : Promise.resolve({ data: blog }),
        pe1
          ? supabase
              .from("project_comments")
              .select(
                "id, created_at, profile_username, content, project_post_id"
              )
              .eq("profile_username", username)
              .order("created_at", { ascending: false })
              .limit(COM_FETCH_LIMIT)
          : Promise.resolve({ data: proj }),
      ]);
      blog = be1 ? b2 || [] : blog;
      proj = pe1 ? p2 || [] : proj;
    }

    // raccogli id per join manuale (titolo)
    const blogIds = [
      ...new Set((blog || []).map((c) => c.blog_post_id).filter(Boolean)),
    ];
    const projIds = [
      ...new Set((proj || []).map((c) => c.project_post_id).filter(Boolean)),
    ];

    let blogMap = new Map();
    let projMap = new Map();

    if (blogIds.length) {
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("id, title, cover_url")
        .in("id", blogIds);
      if (posts) blogMap = new Map(posts.map((p) => [p.id, p]));
    }
    if (projIds.length) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title, cover_url, cover")
        .in("id", projIds);
      if (projects) projMap = new Map(projects.map((p) => [p.id, p]));
    }

    const merged = [
      ...(blog || []).map((c) => {
        const meta = blogMap.get(c.blog_post_id) || {};
        return {
          type: "blog",
          id: c.id,
          date: new Date(c.created_at),
          username: c.profile_username,
          content: c.content,
          link: c.blog_post_id
            ? `/blog/${c.blog_post_id}#comment-${c.id}`
            : null,
          title: meta.title || "Post",
        };
      }),
      ...(proj || []).map((c) => {
        const meta = projMap.get(c.project_post_id) || {};
        return {
          type: "project",
          id: c.id,
          date: new Date(c.created_at),
          username: c.profile_username,
          content: c.content,
          link: c.project_post_id
            ? `/progetti/${c.project_post_id}#comment-${c.id}`
            : null,
          title: meta.title || "Progetto",
        };
      }),
    ].sort((a, b) => b.date - a.date);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    setMyComments(merged.slice(from, to));
    setComTotal(total || merged.length);
    setComPage(page);
    setComLoading(false);
  };

  useEffect(() => {
    loadMyComments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, username]);

  const comPages = useMemo(
    () => Math.max(1, Math.ceil((comTotal || 0) / PAGE_SIZE)),
    [comTotal]
  );

  // ===== RENDER =====
  const sidebarW = "16rem";

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#0b0b0e",
        color: "#e5e7eb",
        "--sidebar-w": sidebarW,
      }}
    >
<style>{`
  :root{ --accent-pink:${ACCENT_PINK}; --accent-yellow:${ACCENT_YELLOW}; --bg-900:#0b0b0e; --bg-850:#0e0e13; --bg-800:#0f0f14; --panel-stroke: rgba(255,255,255,.1); }
  .topbar{position:fixed;top:0;left:0;right:0;z-index:1030;background-color:rgba(15,15,20,.7);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,.1);height:64px}
  .content-wrap{padding-top:64px}
  @media (min-width:768px){ .content-wrap{margin-left:var(--sidebar-w)} }
  .sidebar-fixed{display:none}
  @media (min-width:768px){ .sidebar-fixed{display:flex;position:fixed;top:64px;bottom:0;left:0;width:var(--sidebar-w);background-color:var(--bg-850);border-right:1px solid var(--panel-stroke)} .sidebar-scroll{overflow-y:auto} }
  .sidebar .nav-link{ color:#e5e7eb; border-radius:.75rem; }
  .sidebar .nav-link:hover{ background-color: rgba(255,255,255,.05); }
  .sidebar .nav-link.active{ background-color: rgba(255,255,255,.07); color: var(--accent-yellow); }

  .badge-dot{width:6px;height:6px;border-radius:999px;background:var(--accent-pink);display:inline-block}
  .card-dark{background-color:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);box-shadow:0 0 0 1px rgba(255,255,255,.02);border-radius:16px}
  .btn-accent{background:var(--accent-yellow);border:1px solid rgba(219,255,0,.4);color:#111; border-radius: 4px}

  /* SAVED — responsive */
  .saved-grid{
    display:grid;
    /* colonne fluide: 1→2→3 in base allo spazio */
    grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));
    gap:16px;
  }

  .saved-card{
    position:relative;
    display:flex;
    gap:12px;
    align-items:center;
    padding:12px;
    border-radius:16px;
    background:rgba(24,25,26,.98);
    border:1px solid rgba(255,255,255,.12);
  }

  /* assetto orizzontale (desktop/tablet) */
  .saved-thumb{
    width:110px;
    height:72px;
    flex:0 0 110px;
    border-radius:12px;
    overflow:hidden;
    background:linear-gradient(135deg,#1f2937,#111827);
    border:1px solid rgba(255,255,255,.08);
  }
  .saved-thumb img{
    width:100%;
    height:100%;
    object-fit:cover;
    display:block;
  }

  .saved-title{
    color:#fff;
    font-weight:700;
    font-size:1rem;
    margin:0 0 .2rem;
    line-height:1.25;
    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;
  }
  .saved-date{
    display:inline-flex;
    align-items:center;
    gap:.35rem;
    padding:.2rem .48rem;
    border-radius:999px;
    border:1px solid rgba(255,255,255,.12);
    background:rgba(255,255,255,.06);
    font-size:.78rem;
  }

  .btn-open{
    display:inline-flex;
    align-items:center;
    gap:.4rem;
    font-size:.85rem;
    padding:.45rem .7rem;
    border-radius:10px;
    color:#111;
    background:var(--accent-yellow);
    border:1px solid rgba(219,255,0,.5);
    text-decoration:none;
    font-weight:700;
  }
  .btn-remove{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:36px;
    height:36px;
    border-radius:10px;
    background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.12);
    color:#fff;
  }
  .btn-remove:hover{
    background:rgba(255,54,163,.15);
    border-color:rgba(255,54,163,.5);
    color:var(--accent-pink);
  }

  /* ——— Breakpoints ——— */

  /* Tablet: thumb leggermente più ampio */
  @media (max-width: 991.98px){
    .saved-thumb{
      width:120px;
      height:78px;
      flex:0 0 120px;
    }
  }

  /* Mobile: card verticale, thumb full-width */
  @media (max-width: 575.98px){
    .saved-grid{
      grid-template-columns:1fr;  /* una colonna piena */
      gap:12px;
    }
    .saved-card{
      flex-direction:column;
      align-items:stretch;
      padding:12px;
    }
    .saved-thumb{
      width:100%;
      height:180px;
      flex:0 0 auto;
      border-radius:12px;
    }
    .saved-title{ font-size:1.05rem; }
    .saved-date{ font-size:.8rem; }

    /* Bottoni comodi per il touch */
    .saved-card .d-flex.align-items-center.gap-2{ gap:8px; }
    .btn-open{
      flex:1 1 auto;
      justify-content:center;
      font-size:.95rem;
      padding:.6rem .9rem;
    }
    .btn-remove{
      width:44px;
      height:44px;
    }
  }

  a{ color: rgba(219,255,0) }
  a:hover{ color: rgba(255,54,163) }

  /* BADGES */
  .ad-badge{display:inline-flex;align-items:center;gap:.35rem;padding:.25rem .55rem;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);font-size:.75rem;color:#e5e7eb;font-weight:600}
  .ad-badge--ok{background:rgba(219,255,0,.12);border-color:rgba(219,255,0,.4);color:#e6ff57}
  .ad-badge--ko{background:rgba(255,54,163,.12);border-color:rgba(255,255,255,.45);color:#ff6cba}
  .ad-badge--pending{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);color:#d2d6db}

  .offcanvas{
  background: black}
`}</style>


      {/* TOPBAR */}
      <header className="topbar">
        <div className="container-fluid px-3 h-100">
          <div className="d-flex align-items-center justify-content-between h-100">
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-dark d-md-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#accountSidebarMobile"
                aria-controls="accountSidebarMobile"
                aria-label={t("open_menu", "Apri menu")}
              >
                <Menu size={22} />
              </button>
              <div className="d-flex align-items-center gap-2 ms-1">
                <span
                  className="rounded-circle"
                  style={{ width: 12, height: 12, background: ACCENT_YELLOW }}
                />
                <span
                  className="fw-semibold"
                  style={{ letterSpacing: ".02em" }}
                >
                  Account<span style={{ color: ACCENT_PINK }}>Panel</span>
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link to="/" className="btn btn-dark" aria-label="Home">
                <Home size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR DESKTOP */}
      <aside
        className="sidebar sidebar-fixed d-none d-md-flex"
        aria-label="Sidebar"
      >
        <nav className="sidebar-scroll px-2 pb-4 pt-4 w-100">
          <ul className="nav flex-column gap-1">
            {navItems.map(({ key, icon: Icon }) => {
              const isActive = key === active;
              const label = t(`nav_${key}`, defaultNavLabels[key]);
              return (
                <li className="nav-item" key={key}>
                  <a
                    href="#"
                    className={`nav-link d-flex align-items-center gap-3 px-3 py-2 ${
                      isActive ? "active" : ""
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={label}
                    onClick={(e) => {
                      e.preventDefault();
                      setActive(key);
                    }}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span>{label}</span>
                    {isActive && <span className="ms-auto badge-dot" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* MOBILE SIDEBAR */}
      <div
        className="offcanvas offcanvas-start text-bg-dark d-md-none bg-black"
        tabIndex={-1}
        id="accountSidebarMobile"
        aria-labelledby="accountSidebarMobileLabel"
      >
        <div className="offcanvas-header">
          <div className="d-flex align-items-center gap-2">
            <span
              className="rounded-circle"
              style={{ width: 12, height: 12, background: ACCENT_YELLOW }}
            />
            <h6 className="offcanvas-title mb-0" id="accountSidebarMobileLabel">
              {t("menu", "Menu")}
            </h6>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label={t("close", "Chiudi")}
          />
        </div>
        <div className="offcanvas-body text-white">
          <ul className="nav flex-column gap-1">
            {navItems.map(({ key, icon: Icon }) => {
              const label = t(`nav_${key}`, defaultNavLabels[key]);
              return (
                <li className="nav-item" key={key}>
                  <a
                    href="#"
                    className="nav-link d-flex align-items-center gap-3 px-3 py-2 text-white"
                    data-bs-dismiss="offcanvas"
                    onClick={(e) => {
                      e.preventDefault();
                      setActive(key);
                    }}
                    aria-label={label}
                    title={label}
                  >
                    <Icon size={20} /> <span className="small">{label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* CONTENT */}
      <main className="content-wrap p-3 p-md-4 mt-5" role="main">
        <div className="container-fluid mt-5" style={{ maxWidth: 1280 }}>
          {/* === Informazioni (SOLO profilo) === */}
          {active === "informazioni" && (
            <section className="row g-3">
              <div className="col-12 col-lg-6 col-xl-5">
                <div className="card-dark p-3 h-100">
                  <div className="text-center mb-3">
                    <Avatar
                      url={avatar_url}
                      alt="User Avatar"
                      className="rounded-circle"
                      size={150}
                      onUpload={(event, url) => updateProfile(event, url)}
                    />
                    <div className="mt-2 small text-white-50">
                      {t("account6")}
                    </div>
                  </div>
                  <form
                    onSubmit={updateProfile}
                    aria-label="Form profilo"
                    className="contactForm"
                  >
                    <div className="input-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        value={session?.user?.email || ""}
                        disabled
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="username">Username</label>
                      <input
                        id="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="first_name">{t("form30")}</label>
                      <input
                        id="first_name"
                        required
                        value={first_name}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="last_name">{t("form31")}</label>
                      <input
                        id="last_name"
                        required
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="birthdate">{t("b22")}</label>
                      <input
                        type="date"
                        id="birthdate"
                        value={birthdate || ""}
                        onChange={(e) => setBirthdate(e.target.value)}
                      />
                    </div>
                    <div className="d-grid gap-2 mt-2">
                      <button type="submit" disabled={loading}>
                        {loading ? t("account4") : t("account3")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-12 col-lg-6 col-xl-7">
                <div className="card-dark p-3 mb-3">
                  <form
                    onSubmit={updateProfile}
                    aria-label="Form profilo"
                    className="contactForm"
                  >
                    <div className="input-group">
                      <label htmlFor="location"> {t("a23")}</label>
                      <input
                        id="location"
                        placeholder="Città, Paese"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="github_url">GitHub {t("a24")}</label>
                      <input
                        type="url"
                        id="github_url"
                        placeholder="https://github.com/tuo-username"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        inputMode="url"
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="linkedin_url">LinkedIn {t("a24")}</label>
                      <input
                        type="url"
                        id="linkedin_url"
                        placeholder="https://www.linkedin.com/in/tuo-username"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        inputMode="url"
                      />
                    </div>
                    <div className="d-grid gap-2 mt-2">
                      <button type="submit" disabled={loading}>
                        {loading ? t("account4") : t("account3")}
                      </button>
                      <p className="text-center text-warning mt-2 small">
                        {t("account5")}
                      </p>
                    </div>
                  </form>
                  <h6 className="mb-2">{t("a25")}</h6>
                  <ChangePasswordBox />
                </div>
                <div className="card-dark p-4">
                  <h6 className="mb-2">Privacy & Policy</h6>
                  <p className="text-white-50 mb-2">{t("a26")}</p>
                  <ul className="text-white-50 small mb-0">
                    <li>{t("a27")}</li>
                    <li>
                      {t("a28")}:{" "}
                      <a
                        href="mailto:sofiavidotto8@gmail.com"
                        className="text-decoration-underline"
                      >
                        sofiavidotto8@gmail.com
                      </a>
                    </li>
                    <li>
                      {t("a29")}{" "}
                      <Link
                        to="/account/delete"
                        className="text-decoration-underline text-danger"
                      >
                        {t("a30")}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* === Salvati (SOLO salvati) === */}
          {active === "salvati" && (
            <section>
              <div className="card-dark p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="fw-bold">{t("account12")}</div>
                  <small className="text-white-50">
                    {savedTotal} {savedTotal === 1 ? "articolo" : "articoli"}
                  </small>
                </div>
                {savedLoading ? (
                  <div className="text-white-50 py-3">{t("account4")}</div>
                ) : saved.length === 0 ? (
                  <div className="p-3 border border-1 border-secondary-subtle rounded-3">
                    <p className="m-0">
                      <strong>{t("account13")}</strong>
                      <br />
                      {t("account14")}
                    </p>
                    <Link to="/blog" className="btn-open mt-2">
                      {t("account15")}
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="saved-grid mt-2">
                      {saved.map((it) => {
                        const p = it.post;
                        return (
                          <article key={p.id} className="saved-card">
                            <div className="saved-thumb" aria-hidden>
                              {p.cover_url && (
                                <img
                                  src={p.cover_url}
                                  alt=""
                                  loading="lazy"
                                  onError={(e) =>
                                    (e.currentTarget.style.display = "none")
                                  }
                                />
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <h4 className="saved-title mb-1">{p.title}</h4>
                              <div className="saved-date">
                                <i className="bi bi-calendar3"></i>
                                {new Date(it.saved_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
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
                          </article>
                        );
                      })}
                    </div>
                    <div className="mt-3 d-flex align-items-center">
                      <div className="text-white-50 me-auto">
                        {t("a31")} {savedPage} / {savedPages} • {savedTotal}{" "}
                        {t("a32")}
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-light"
                          onClick={() => loadSaved(savedPage - 1)}
                          disabled={savedPage <= 1}
                        >
                          ← Prev
                        </button>
                        <button
                          className="btn btn-accent"
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
            </section>
          )}

          {/* === Recensioni (SOLO recensioni) === */}
          {active === "recensioni" && (
            <section>
              <div className="card-dark p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="fw-bold">{t("a80")}</div>
                  <small className="text-white-50">
                    {revTotal} {revTotal === 1 ? "recensione" : "recensioni"}
                  </small>
                </div>
                {revLoading ? (
                  <div className="text-white-50 py-3">{t("account4")}</div>
                ) : myReviews.length === 0 ? (
                  <div className="p-3 border border-1 border-secondary-subtle rounded-3">
                    <p className="m-0">
                      <strong>{t("a33")}</strong>
                      <br />
                      {t("a34")}{" "}
                      <Link to="/reviews" className="text-decoration-underline">
                        {t("a35")}
                      </Link>
                      .
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="row g-2 mt-1">
                      {myReviews.map((r) => (
                        <div key={r.id} className="col-12 col-md-6">
                          <article className="card-dark p-3 h-100">
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="text-white fw-bold">
                                {t("a36")}
                              </div>
                              <small className="text-white-50">
                                {new Date(r.created_at).toLocaleDateString()}
                              </small>
                            </div>
                            <div className="mt-1">
                              {statusBadge(r.approved)}
                            </div>
                            <div className="mt-2">
                              {editingId === r.id ? (
                                <div
                                  className="d-inline-flex gap-2"
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
                                            ? "bi-star-fill text-warning"
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
                                        ? "bi-star-fill text-warning"
                                        : "bi-star text-white-50"
                                    }`}
                                  />
                                ))
                              )}
                            </div>
                            <div className="mt-2">
                              {editingId === r.id ? (
                                <textarea
                                  className="rev-textarea"
                                  rows={4}
                                  value={editComment}
                                  onChange={(e) =>
                                    setEditComment(e.target.value)
                                  }
                                  maxLength={1000}
                                />
                              ) : (
                                <p
                                  className="mb-0 text-white-50"
                                  style={{ whiteSpace: "pre-wrap" }}
                                >
                                  {r.comment}
                                </p>
                              )}
                            </div>
                            <div className="mt-3 d-flex gap-2">
                              {editingId === r.id ? (
                                <>
                                  <button
                                    className="btn btn-accent"
                                    onClick={saveEdit}
                                    disabled={editSubmitting}
                                  >
                                    {editSubmitting ? "Salvataggio…" : "Salva"}
                                  </button>
                                  <button
                                    className="btn btn-outline-light"
                                    onClick={cancelEdit}
                                    disabled={editSubmitting}
                                  >
                                    {t("b16")}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="btn btn-accent"
                                    onClick={() => startEdit(r)}
                                  >
                                    {t("b37")}
                                  </button>
                                  <button
                                    className="btn btn-outline-light"
                                    onClick={() => deleteReview(r.id)}
                                  >
                                    {t("b38")}
                                  </button>
                                </>
                              )}
                            </div>
                          </article>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 d-flex align-items-center">
                      <div className="text-white-50 me-auto">
                        {t("b31")} {revPage} / {revPages} • {revTotal}{" "}
                        {t("a32")}
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-light"
                          onClick={() => loadMyReviews(revPage - 1)}
                          disabled={revPage <= 1}
                        >
                          ← Prev
                        </button>
                        <button
                          className="btn btn-accent"
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
            </section>
          )}

          {/* === Commenti (SOLO commenti) === */}
          {active === "commenti" && (
            <section>
              <div className="card-dark p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="fw-bold">{t("a39")}</div>
                  <small className="text-white-50">
                    {comTotal} {comTotal === 1 ? "commento" : "commenti"}
                  </small>
                </div>

                {comLoading ? (
                  <div className="text-white-50 py-3">{t("account5")}</div>
                ) : myComments.length === 0 ? (
                  <div className="p-3 border border-1 border-secondary-subtle rounded-3">
                    <p className="m-0">
                      <strong>{t("a40")}</strong>
                      <br />
                      {t("a41")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="d-grid gap-2 mt-2">
                      {myComments.map((c) => (
                        <article
                          key={`${c.type}-${c.id}`}
                          className="card-dark p-3"
                        >
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div>
                              {c.link ? (
                                <Link
                                  to={c.link}
                                  className="fw-semibold text-decoration-underline"
                                >
                                  {c.title}
                                </Link>
                              ) : (
                                <span className="fw-semibold">{c.title}</span>
                              )}
                            </div>
                            <small className="text-white-50">
                              {c.date.toLocaleString()}
                            </small>
                          </div>
                          <p
                            className="mb-0"
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {c.content}
                          </p>
                        </article>
                      ))}
                    </div>
                    <div className="mt-3 d-flex align-items-center">
                      <div className="text-white-50 me-auto">
                        {t("a31")} {comPage} / {comPages} • {comTotal}
                        {t("a32")}
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-light"
                          onClick={() => loadMyComments(comPage - 1)}
                          disabled={comPage <= 1}
                        >
                          ← Prev
                        </button>
                        <button
                          className="btn btn-accent"
                          onClick={() => loadMyComments(comPage + 1)}
                          disabled={comPage >= comPages}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
