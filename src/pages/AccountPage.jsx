// /src/pages/AccountPage.jsx
import { useContext, useState, useEffect } from "react";
import SessionContext from "../context/SessionContext";
import { Link } from "react-router";
import supabase from "../supabase/supabase-client";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import Avatar from "../components/Avatar";

export default function AccountPage() {
  const { session } = useContext(SessionContext);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState(null);
  const [first_name, setFirstName] = useState(null);
  const [last_name, setLastName] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);

  // NEW: campi opzionali
  const [birthdate, setBirthdate] = useState(""); // ISO yyyy-mm-dd
  const [location, setLocation] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Post salvati
  const [saved, setSaved] = useState([]); // [{id,title,created_at,cover_url}]

  const isValidUrl = (value) => {
    if (!value) return true;
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

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
        if (error) {
          console.warn(error);
        } else if (data) {
          setUsername(data.username ?? "");
          setFirstName(data.first_name ?? "");
          setLastName(data.last_name ?? "");
          setAvatarUrl(data.avatar_url ?? "");
          setBirthdate(data.birthdate ?? ""); // già yyyy-mm-dd
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

  useEffect(() => {
    const loadSaved = async () => {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("saved_posts")
        .select("post_id, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) return;

      const ids = (data || []).map((r) => r.post_id);
      if (ids.length === 0) {
        setSaved([]);
        return;
      }

      const { data: posts, error: e2 } = await supabase
        .from("blog_posts")
        .select("id, title, created_at, cover_url")
        .in("id", ids)
        .order("created_at", { ascending: false });

      if (!e2) setSaved(posts || []);
    };
    loadSaved();
  }, [session]);

  const updateProfile = async (event, avatarUrlParam) => {
    // Gestisce submit del form e upload avatar (entrambi passano qui)
    if (event?.preventDefault) event.preventDefault();
    setLoading(true);

    // Validazioni soft
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
      // NEW
      birthdate: birthdate || null, // stringa yyyy-mm-dd o null
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
        timer: 2000,
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

  const unsave = async (postId) => {
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
    setSaved((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="container text-container mt-5">
      {/* === Styles dedicati ai salvati (dark + brand) === */}
      <style>{`
        :root{
          --brand-pink: #ff36a3;
          --brand-yellow: #dbff00;
          --brand-dark: #18191a;
        }
        .saved-header{
          display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        .saved-header .count{
          font-size:.9rem; color:#cbd5e1; opacity:.9;
        }
        .saved-grid{
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap:14px;
        }
        .saved-card{
          position:relative;
          display:flex; gap:12px; align-items:center;
          padding:12px;
          border-radius:16px;
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
        .saved-thumb{
          width:92px; height:62px; flex:0 0 92px;
          border-radius:12px; overflow:hidden;
          background: linear-gradient(135deg,#1f2937,#111827);
          border:1px solid rgba(255,255,255,.08);
          position:relative;
        }
        .saved-thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
        .saved-body{ min-width:0; }
        .saved-title{
          color:#fff; font-weight:600; font-size:.98rem;
          margin:0 0 .2rem; line-height:1.25;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .saved-meta{
          display:flex; align-items:center; gap:8px; flex-wrap:wrap;
          font-size:.78rem; color:#cbd5e1;
        }
        .saved-date{
          display:inline-flex; align-items:center; gap:.35rem;
          padding:.2rem .48rem; border-radius:999px;
          border:1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.06);
        }
        .saved-actions{
          margin-left:auto; display:flex; align-items:center; gap:8px;
        }
        .btn-open{
          display:inline-flex; align-items:center; gap:.4rem;
          font-size:.85rem; padding:.35rem .6rem; border-radius:10px;
          color:#111; background: var(--brand-yellow); border:1px solid rgba(219,255,0,.5);
          text-decoration:none;
        }
        .btn-open:hover{ filter: brightness(1.03); }
        .btn-remove{
          display:inline-flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:10px;
          background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
          color:#fff;
        }
        .btn-remove:hover{
          background: rgba(255,54,163,.15);
          border-color: rgba(255,54,163,.5);
          color: var(--brand-pink);
        }
        .saved-empty{
          border:1px dashed rgba(255,255,255,.18);
          border-radius:16px; padding:18px;
          background: rgba(24,25,26,.75);
          text-align:center; color:#cbd5e1;
        }
        .saved-empty strong{ color:#fff; }
        .cta-link{
          display:inline-flex; align-items:center; gap:.45rem;
          margin-top:10px; padding:.45rem .7rem; border-radius:999px;
          color:#111; background: var(--brand-yellow); border:1px solid rgba(219,255,0,.5);
          text-decoration:none; font-weight:600;
        }
        .cta-link:hover{ filter: brightness(1.03); }
      `}</style>

      <div className="row justify-content-center">
        <div className="col-8 auth-container">
          <div className="panel-card pt-5">
            <div className="logo d-flex align-items-center justify-content-center">
              <div className="logo-icon">MP</div>
            </div>
            <h2>{t("account1")}</h2>
            <p>{t("account2")}</p>

            <form onSubmit={updateProfile} className="space-y-5">
              <div className="avatar-section text-center">
                <div className="avatar-preview">
                  <Avatar
                    url={avatar_url}
                    alt="User Avatar"
                    className="rounded-circle"
                    size={150}
                    onUpload={(event, url) => {
                      // salva solo avatar
                      updateProfile(event, url);
                    }}
                  />
                  <span className="legend footer">
                    <span className="dot"></span> {t("account6")}
                  </span>
                </div>
              </div>

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

              {/* NEW: opzionali */}
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
              {/* FINE nuovi campi */}

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
            </form>

            {/* Box Post Salvati */}
            <hr className="my-4" />
            <div>
              <div className="saved-header mb-2">
                <h3 className="h5 m-0 d-flex align-items-center gap-2">
                  <i className="bi bi-bookmark-check"></i>
                  <span>{t("account12")}</span>
                </h3>
                <span className="count">
                  {saved.length} {saved.length === 1 ? "articolo" : "articoli"}
                </span>
              </div>

              {saved.length === 0 ? (
                <div className="saved-empty">
                  <p className="m-0">
                    <strong>{t("account13")}</strong>
                    <br />
                    {t("account14")}
                  </p>
                  <Link to="/blog" className="cta-link">
                    <i className="bi bi-rocket-takeoff"></i> {t("account15")}
                  </Link>
                </div>
              ) : (
                <div className="saved-grid">
                  {saved.map((p) => (
                    <div key={p.id} className="saved-card">
                      <div className="saved-thumb" aria-hidden="true">
                        {p.cover_url ? (
                          <img
                            src={p.cover_url}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                      </div>

                      <div className="saved-body">
                        <h4 className="saved-title">{p.title}</h4>
                        <div className="saved-meta">
                          <span className="saved-date">
                            <i className="bi bi-calendar3"></i>
                            {new Date(p.created_at).toLocaleDateString()}
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
                  ))}
                </div>
              )}
            </div>

            <div className="auth-footer">
              <a href="/">
                <i className="bi bi-arrow-left-short"></i> {t("form27")}
              </a>
            </div>
            <div className="pt-5">
              <p className="small">© 2025 MaD's Portfolio. {t("form13")}</p>
            </div>
          </div>
        </div>
      </div>

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
