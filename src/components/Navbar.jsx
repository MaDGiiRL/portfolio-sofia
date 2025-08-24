
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
  const navigate = useNavigate();
  const { session } = useContext(SessionContext);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const { isAdmin, loading: adminLoading } = useIsAdmin();

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
    Swal.fire({
      icon: "success",
      title: t("form38"),
      background: "#1e1e1e",
      color: "#fff",
      iconColor: "#dbff00",
      confirmButtonColor: "#dbff00",
    });
    getSession();
    navigate("/");
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

  // Chiude l’offcanvas; ritorna true se ha trovato un’istanza
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

  // Navigazione con refresh: chiudo e poi hard redirect
  const onNav = (to) => (e) => {
    e.preventDefault();
    closeOffcanvas();
    // una piccola attesa per far finire l’animazione
    setTimeout(() => {
      window.location.assign(to); // forza il refresh sulla rotta
    }, 120);
  };

  // Cambio lingua: chiudo e ricarico
  const onLang = (lng) => (e) => {
    e.preventDefault();
    changeLanguage(lng);
    closeOffcanvas();
    setTimeout(() => {
      window.location.reload(); // refresh per riflettere i testi e chiudere il drawer
    }, 120);
  };

  return (
    <section className="navsection sticky-top">
      <style>{`
        .bg-blur{
          backdrop-filter: blur(8px);
          background-color: rgba(15,15,20,.6) !important;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .username-gradient{
          background: linear-gradient(90deg,#ff36a3,#dbff00);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .offcanvas-dark{
          color:#e5e7eb;
          border-left:1px solid #333;
        }
        .offcanvas-dark .list-group-item{
          background:#0b0b0e20;
          border-color:#222;
          color:#e5e7eb;
          transition: background .25s ease, border-color .25s ease, color .25s ease;
        }
        .offcanvas-dark .list-group-item:hover,
        .offcanvas-dark .list-group-item:focus,
        .offcanvas-dark .list-group-item:active,
        .offcanvas-dark .list-group-item.active{
          color: var(--bs-dropdown-link-active-color) !important;
          text-decoration: none;
          background: linear-gradient(90deg,
            rgba(219, 255, 0, 0.2) 0%,
            rgba(255, 54, 163, 0.2) 25%,
            rgba(0, 0, 0, 1) 50%,
            rgba(255, 54, 163, 0.2) 75%,
            rgba(219, 255, 0, 0.2) 100%) !important;
          border-color: rgba(219, 255, 0, 0.2) !important;
          outline: none;
        }
      `}</style>

      <nav className="navbar navbar-dark bg-blur">
        <div className="container-fluid">
          {/* Brand */}
          <Link
            className="navbar-brand fw-bold d-flex align-items-center gap-2"
            to="/"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#fff"
              viewBox="0 0 256 256"
            >
              <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"></path>
            </svg>
          </Link>

          {/* BOTTONI DESTRA */}
          <div className="d-flex align-items-center gap-2">
            {/* DESKTOP MENU */}
            <ul className="navbar-nav d-none d-lg-flex flex-row align-items-center mb-0 text-uppercase">
              <li className="nav-item ms-3">
                <Link className="link-light nav-link px-2" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item ms-3">
                <Link className="link-light nav-link px-2" to="/progetti">
                  {t("navp")}
                </Link>
              </li>
              <li className="nav-item ms-3">
                <Link className="link-light nav-link px-2" to="/blog">
                  Blog
                </Link>
              </li>
              <li className="nav-item ms-3">
                <Link className="link-light nav-link px-2" to="/cv">
                  CV
                </Link>
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
                    <ul
                      className="dropdown-menu dropdown-menu-end dropdown-menu-dark dropdown-menu-outside"
                      aria-labelledby="userDropdownDesktop"
                    >
                      <li className="px-3 py-2">
                        <Avatar
                          url={avatarUrl || "default-avatar.png"}
                          alt="User Avatar"
                          className="rounded-circle"
                          size={50}
                        />
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/account">
                          <i className="bi bi-person"></i> Account
                        </Link>
                      </li>
                      {/* {!adminLoading && isAdmin && ( */}
                      <li>
                        <Link className="dropdown-item" to="/admin">
                          <i className="bi bi-clipboard-data"></i> Admin Panel
                        </Link>
                      </li>
                      {/* )} */}
                      <li>
                        <button
                          className="dropdown-item text-uppercase"
                          onClick={signOut}
                        >
                          <i className="bi bi-arrow-up-right-circle"></i>{" "}
                          {t("form40")}
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
                    <ul
                      className="dropdown-menu dropdown-menu-end dropdown-menu-dark dropdown-menu-outside"
                      aria-labelledby="guestDropdownDesktop"
                    >
                      <li>
                        <Link className="dropdown-item" to="/login">
                          {t("form14")}{" "}
                          <i className="bi bi-arrow-right-circle"></i>
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/register">
                          {t("form11")}{" "}
                          <i className="bi bi-arrow-right-circle"></i>
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
                <ul
                  className="dropdown-menu dropdown-menu-end dropdown-menu-dark dropdown-menu-outside text-uppercase"
                  aria-labelledby="languageDropdownDesktop"
                >
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center text-uppercase"
                      onClick={() => changeLanguage("it")}
                    >
                      {/* IT flag */}{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 640 480"
                      >
                        <g fillRule="evenodd" strokeWidth="1pt">
                          <path fill="#fff" d="M0 0h640v480H0z" />
                          <path fill="#009246" d="M0 0h213.3v480H0z" />
                          <path fill="#ce2b37" d="M426.7 0H640v480H426.7z" />
                        </g>
                      </svg>
                      <span className="ms-2">Italiano</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center text-uppercase"
                      onClick={() => changeLanguage("en")}
                    >
                      {/* EN simplified */}{" "}
                      <svg
                        viewBox="0 -4 28 28"
                        width="20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="28" height="20" rx="2" fill="#fff" />
                        <path
                          d="M0 2.667h28v1.333H0zM0 5.333h28v1.333H0zM0 8h28v1.333H0zM0 10.667h28V12H0zM0 13.333h28v1.333H0zM0 16h28v1.333H0zM0 18.667h28V20H0z"
                          fill="#B12537"
                        />
                        <rect width="12" height="9.333" fill="#3C3C6D" />
                        <g fill="#fff">
                          <circle cx="2" cy="2" r="0.667" />
                          <circle cx="4" cy="2" r="0.667" />
                          <circle cx="6" cy="2" r="0.667" />
                          <circle cx="8" cy="2" r="0.667" />
                          <circle cx="10" cy="2" r="0.667" />
                          <circle cx="3.333" cy="3.333" r="0.667" />
                          <circle cx="6" cy="3.333" r="0.667" />
                          <circle cx="8.667" cy="3.333" r="0.667" />
                          <circle cx="2" cy="4.667" r="0.667" />
                          <circle cx="4.667" cy="4.667" r="0.667" />
                          <circle cx="7.333" cy="4.667" r="0.667" />
                          <circle cx="10" cy="4.667" r="0.667" />
                        </g>
                      </svg>
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
        className="offcanvas offcanvas-end offcanvas-dark d-lg-none bg-custom"
        tabIndex={-1}
        id="mobileOffcanvas"
        aria-labelledby="mobileOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <div className="d-flex align-items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#fff"
              viewBox="0 0 256 256"
            >
              <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"></path>
            </svg>
            <h5 className="offcanvas-title mb-0" id="mobileOffcanvasLabel">
              MaD&apos;s Portfolio
            </h5>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Chiudi"
          ></button>
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
                <div className="text-secondary">{t("navp2")},</div>
                <div className="fw-semibold username-gradient">
                  {displayName}
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <button
                className="btn btn-login pt-1 w-50"
                onClick={onNav("/login")}
              >
                {t("form14")}
              </button>
              <button
                className="btn btn-login pt-1 w-50"
                onClick={onNav("/register")}
              >
                {t("form11")}
              </button>
            </div>
          )}

          {/* Link principali */}
          <div className="list-group">
            <a
              href="/"
              className="list-group-item list-group-item-action"
              onClick={onNav("/")}
            >
              Home
            </a>
            <a
              href="/progetti"
              className="list-group-item list-group-item-action"
              onClick={onNav("/progetti")}
            >
              {t("navp")}
            </a>
            <a
              href="/blog"
              className="list-group-item list-group-item-action"
              onClick={onNav("/blog")}
            >
              Blog
            </a>
            <a
              href="/cv"
              className="list-group-item list-group-item-action"
              onClick={onNav("/cv")}
            >
              CV
            </a>
            {user && (
              <a
                href="/account"
                className="list-group-item list-group-item-action"
                onClick={onNav("/account")}
              >
                Account
              </a>
            )}
            {/* {!adminLoading && isAdmin && ( */}
            <a
              href="/admin"
              className="list-group-item list-group-item-action"
              onClick={onNav("/admin")}
            >
              Admin Panel
            </a>
            {/* )} */}
          </div>

          {/* Lingua */}
          <div className="mt-2">
            <div className="text-secondary small mb-2">{t("navp1")}</div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-light btn-sm"
                onClick={onLang("it")}
              >
                IT
              </button>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={onLang("en")}
              >
                EN
              </button>
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
