import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import supabase from "../supabase/supabase-client";
import { useIsAdmin } from "../hooks/useIsAdmin";

import SessionContext from "../context/SessionContext";
import Avatar from "../components/others/Avatar";

export default function Navbar() {
  const { i18n, t } = useTranslation();
  const { session } = useContext(SessionContext);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  // ✅ Aggiorna <html lang="..."> quando cambia la lingua
  useEffect(() => {
    document.documentElement.setAttribute("lang", i18n.language || "it");
  }, [i18n.language]);

  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.warn(error);
    if (data?.session) {
      setUser(data.session.user);
    } else {
      setUser(null);
      setAvatarUrl(null);
      setFirstName(null);
    }
  };

  const getProfile = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from("profiles")
      .select(`username, first_name, last_name, avatar_url`)
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.warn(error);
      return;
    }

    if (data) {
      setAvatarUrl(data.avatar_url || null);
      setFirstName(data.first_name || null);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log(error);
    await Swal.fire({
      icon: "success",
      title: t("form38"),
      background: "#1e1e1e",
      color: "#fff",
      iconColor: "#dbff00",
      confirmButtonColor: "#dbff00",
    });
    // Hard reload verso home
    window.location.replace("/");
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        if (sess?.user) {
          setUser(sess.user);
          getProfile();
        } else {
          setUser(null);
          setAvatarUrl(null);
          setFirstName(null);
        }
      }
    );

    getSession().then(() => getProfile());

    return () => {
      authListener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const displayName =
    user?.user_metadata?.first_name || firstName || t("form13") || "User";

  // Chiude l’offcanvas manualmente (usato per mobile)
  const closeOffcanvas = () => {
    const el = document.getElementById("mobileOffcanvas");
    if (!el) return false;
    const bs = window.bootstrap || {};
    const instance =
      (bs.Offcanvas &&
        bs.Offcanvas.getInstance &&
        bs.Offcanvas.getInstance(el)) ||
      (bs.Offcanvas && new bs.Offcanvas(el));
    if (instance?.hide) {
      instance.hide();
      return true;
    }
    return false;
  };

  // ✅ Cambio lingua: chiudo e applico subito, NESSUN refresh
  const onLang = (lng) => (e) => {
    e.preventDefault();
    changeLanguage(lng);
    closeOffcanvas();

    // (opzionale) chiudo eventuale dropdown desktop aperto
    const dd = document.getElementById("languageDropdownDesktop");
    if (dd?.ariaExpanded === "true" && window.bootstrap?.Dropdown) {
      const inst =
        window.bootstrap.Dropdown.getInstance(dd) ||
        new window.bootstrap.Dropdown(dd);
      inst.hide?.();
    }
  };

  // 🔗 Navigazione SPA (desktop, nessun refresh)
  const handleNavClick = (path) => (e) => {
    e.preventDefault();
    navigate(path, { replace: false });
  };

  // 🔗 Navigazione OFFCANVAS con HARD REFRESH richiesto
  const handleOffcanvasHardNav = (path) => (e) => {
    e.preventDefault();
    const closed = closeOffcanvas();
    setTimeout(() => {
      window.location.assign(path); // 🔥 hard reload SOLO da offcanvas
    }, closed ? 80 : 0);
  };

  return (
    <section className="navsection sticky-top">
      <style>{`
       /* ——— Header blur + username gradient ——— */
.bg-blur{
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-color: rgba(15,15,20,.6) !important;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.username-gradient{
  background: linear-gradient(90deg,#ff36a3,#dbff00);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ——— Offcanvas Dark Theme ——— */
.offcanvas-dark{
  color:#e5e7eb;
  border-left:1px solid #333;
}

/* Corpo offcanvas: spazi e safe-area */
.offcanvas-dark .offcanvas-body{
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

/* Lista link: look & feel e tap target adeguati */
.offcanvas-dark .list-group{
  display: grid;
  gap: 6px;
}
.offcanvas-dark .list-group-item{
  background:#0b0b0e20;
  border-color:#222;
  color:#e5e7eb;
  transition: background .25s ease, border-color .25s ease, color .25s ease, transform .06s ease;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  font-weight: 600;
}

/* Hover / Active */
.offcanvas-dark .list-group-item:hover,
.offcanvas-dark .list-group-item:focus,
.offcanvas-dark .list-group-item:active,
.offcanvas-dark .list-group-item.active{
  color:#111 !important;
  text-decoration: none;
  background: linear-gradient(
    90deg,
    rgba(219,255,0,0.25) 0%,
    rgba(255,54,163,0.25) 25%,
    rgba(0,0,0,0.85) 50%,
    rgba(255,54,163,0.25) 75%,
    rgba(219,255,0,0.25) 100%
  ) !important;
  border-color: rgba(219,255,0,0.35) !important;
  outline: none;
  color:white!important
  }
.offcanvas-dark .list-group-item:active{
  transform: scale(.99);
}

.offcanvas-dark .list-group-item:focus-visible{
  box-shadow: 0 0 0 3px rgba(219,255,0,.35);
}

/* Profilo */
.offcanvas-dark .rounded-circle{
  width: 48px !important;
  height: 48px !important;
}
@media (max-width: 575.98px){
  .offcanvas-dark .rounded-circle{
    width: 40px !important;
    height: 40px !important;
  }
}
.offcanvas-dark .username-gradient{
  display:inline-block;
  max-width: 70vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Pulsanti login/register */
.offcanvas-dark .btn.btn-login{
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color: #fff;
  min-height: 44px;
  font-weight: 700;
}
.offcanvas-dark .btn.btn-login:hover{
  background: rgba(255,255,255,.1);
}

/* Sezione lingua */
.offcanvas-dark .d-flex.gap-2{
  flex-wrap: wrap;
}
.offcanvas-dark .btn.btn-outline-light.btn-sm{
  min-width: 64px;
  min-height: 40px;
  border-radius: 10px;
  border-color: rgba(255,255,255,.2);
  color: #fff;
}
.offcanvas-dark .btn.btn-outline-light.btn-sm:hover{
  background: rgba(255,255,255,.08);
}

/* Logout */
.offcanvas-dark .btn.btn-outline-light.mt-auto{
  min-height: 44px;
  border-radius: 12px;
  border-color: rgba(255,255,255,.2);
}

/* Responsive */
@media (max-width: 575.98px){
  .offcanvas-dark .offcanvas-body{ gap: .85rem; }
  .offcanvas-dark .list-group-item{ font-size: 1.02rem; }
}
@media (min-width: 576px){
  .offcanvas-dark .list-group{
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    row-gap: 8px;
  }
  .offcanvas-dark .list-group-item{
    text-align: center;
  }
}
@media (prefers-reduced-motion: reduce){
  .offcanvas,
  .offcanvas *{
    transition: none !important;
    animation: none !important;
  }
}
@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
  .bg-blur{
    background-color: rgba(15,15,20,.85) !important;
  }
}
      `}</style>

      <nav className="navbar navbar-dark bg-blur">
        <div className="container-fluid">
          {/* Brand */}
          <Link
            className="navbar-brand fw-bold d-flex align-items-center gap-2"
            to="/"
            onClick={handleNavClick("/")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256">
              <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"></path>
            </svg>
          </Link>

          {/* BOTTONI DESTRA */}
          <div className="d-flex align-items-center gap-2">
            {/* DESKTOP MENU */}
            <ul className="navbar-nav d-none d-lg-flex flex-row align-items-center mb-0 text-uppercase">
              <li className="nav-item ms-3">
                <Link className="link-light nav-link px-2" to="/" onClick={handleNavClick("/")}>Home</Link>
              </li>
              <li className="nav-item ms-3">
                <Link className="link-light nav-link px-2" to="/progetti" onClick={handleNavClick("/progetti")}>
                  {t("navp")}
                </Link>
              </li>
              <li className="nav-item ms-3">
                <Link className="link-light nav-link px-2" to="/blog" onClick={handleNavClick("/blog")}>Blog</Link>
              </li>
              <li className="nav-item ms-3">
                <Link className="link-light nav-link px-2" to="/gallery" onClick={handleNavClick("/gallery")}>
                  Gallery
                </Link>
              </li>
              <li className="nav-item ms-3">
                <Link className="link-light nav-link px-2" to="/cv" onClick={handleNavClick("/cv")}>CV</Link>
              </li>

              <li className="nav-item ms-3 dropdown">
                {user ? (
                  <>
                    <button
                      className="btn dropdown-toggle d-flex align-items-center gap-2 flex-nowrap"
                      type="button"
                      id="userDropdownDesktop"
                      data-bs-toggle="dropdown"
                      data-bs-display="static"
                      aria-expanded="false"
                    >
                      <span className="text-white text-uppercase">
                        {t("navp2")},{" "}
                        <span className="username-gradient">{displayName}</span>
                      </span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark dropdown-menu-outside" aria-labelledby="userDropdownDesktop">
                      <li className="px-3 py-2">
                        <Avatar
                          url={avatarUrl || "default-avatar.png"}
                          alt="User Avatar"
                          className="rounded-circle"
                          size={50}
                        />
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/account" onClick={handleNavClick("/account")}>
                          <i className="bi bi-person"></i> Account
                        </Link>
                      </li>
                      {!adminLoading && isAdmin && (
                        <li>
                          <Link className="dropdown-item" to="/admin" onClick={handleNavClick("/admin")}>
                            <i className="bi bi-clipboard-data"></i> Admin Panel
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          className="dropdown-item text-uppercase"
                          onClick={(e) => { e.preventDefault(); signOut(); }}
                        >
                          <i className="bi bi-arrow-up-right-circle"></i> {t("form40")}
                        </button>
                      </li>
                    </ul>
                  </>
                ) : (
                  <>
                    <button
                      className="btn dropdown-toggle text-uppercase"
                      type="button"
                      id="guestDropdownDesktop"
                      data-bs-toggle="dropdown"
                      data-bs-display="static"
                      aria-expanded="false"
                    >
                      <span className="text-nav">
                        {t("form39")}, {t("form14")}
                      </span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark dropdown-menu-outside" aria-labelledby="guestDropdownDesktop">
                      <li>
                        <Link className="dropdown-item" to="/login" onClick={handleNavClick("/login")}>
                          {t("form14")} <i className="bi bi-arrow-right-circle"></i>
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/register" onClick={handleNavClick("/register")}>
                          {t("form11")} <i className="bi bi-arrow-right-circle"></i>
                        </Link>
                      </li>
                    </ul>
                  </>
                )}
              </li>

              <li className="nav-item dropdown ms-3">
                <button
                  className="btn dropdown-toggle"
                  type="button"
                  id="languageDropdownDesktop"
                  data-bs-toggle="dropdown"
                  data-bs-display="static"
                  aria-expanded="false"
                >
                  🌐
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark dropdown-menu-outside text-uppercase" aria-labelledby="languageDropdownDesktop">
                  <li>
                    <button className="dropdown-item d-flex align-items-center text-uppercase" onClick={onLang("it")}>
                      <span className="ms-2">Italiano</span>
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center text-uppercase" onClick={onLang("en")}>
                      <span className="ms-2">English</span>
                    </button>
                  </li>
                </ul>
              </li>
            </ul>

            {/* TOGGLER OFFCANVAS MOBILE */}
            <button
              className="navbar-toggler d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobileOffcanvas"
              aria-controls="mobileOffcanvas"
              aria-label="Apri menu"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* OFFCANVAS MOBILE */}
      <div
        className="offcanvas offcanvas-end offcanvas-dark d-lg-none bg-black"
        tabIndex={-1}
        id="mobileOffcanvas"
        aria-labelledby="mobileOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <div className="d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256">
              <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"></path>
            </svg>
            <h5 className="offcanvas-title mb-0" id="mobileOffcanvasLabel">
              MaD&apos;s Portfolio
            </h5>
          </div>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Chiudi"></button>
        </div>

        <div className="offcanvas-body d-flex flex-column gap-3">
          {/* Profilo / Login */}
          {user ? (
            <div className="d-flex align-items-center gap-3">
              <Avatar
                url={avatarUrl || "default-avatar.png"}
                alt="User Avatar"
                className="rounded-circle"
                size={48}
              />
              <div className="small">
                <div className="text-white">{t("navp2")},</div>
                <div className="fw-semibold username-gradient">{displayName}</div>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-login pt-2" onClick={handleOffcanvasHardNav("/login")}>
                {t("form14")}
              </Link>
              <Link to="/register" className="btn btn-login pt-2" onClick={handleOffcanvasHardNav("/register")}>
                {t("form11")}
              </Link>
            </div>
          )}

          {/* Link principali */}
          <div className="list-group">
            <Link to="/" className="list-group-item list-group-item-action" onClick={handleOffcanvasHardNav("/")}>
              Home
            </Link>
            <Link to="/progetti" className="list-group-item list-group-item-action" onClick={handleOffcanvasHardNav("/progetti")}>
              {t("navp")}
            </Link>
            <Link to="/blog" className="list-group-item list-group-item-action" onClick={handleOffcanvasHardNav("/blog")}>
              Blog
            </Link>
            <Link to="/gallery" className="list-group-item list-group-item-action" onClick={handleOffcanvasHardNav("/gallery")}>
              Gallery
            </Link>
            <Link to="/cv" className="list-group-item list-group-item-action" onClick={handleOffcanvasHardNav("/cv")}>
              CV
            </Link>
            {user && (
              <Link to="/account" className="list-group-item list-group-item-action" onClick={handleOffcanvasHardNav("/account")}>
                Account
              </Link>
            )}
            {!adminLoading && isAdmin && (
              <Link to="/admin" className="list-group-item list-group-item-action" onClick={handleOffcanvasHardNav("/admin")}>
                Admin Panel
              </Link>
            )}
          </div>

          {/* Lingua */}
          <div className="mt-2">
            <div className="text-secondary small mb-2">{t("navp1")}</div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-light btn-sm" onClick={onLang("it")}>IT</button>
              <button className="btn btn-outline-light btn-sm" onClick={onLang("en")}>EN</button>
            </div>
          </div>

          {/* Logout */}
          {user && (
            <button
              className="btn btn-outline-light mt-auto"
              onClick={(e) => {
                e.preventDefault();
                closeOffcanvas();
                setTimeout(() => signOut(), 120);
              }}
            >
              <i className="bi bi-arrow-up-right-circle me-1"></i> {t("form40")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
