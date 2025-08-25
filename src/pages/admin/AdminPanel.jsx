
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router";

import {
  LayoutDashboard,
  Send,
  FileText,
  FolderKanban,
  Menu,
  Bell,
  Home,
} from "lucide-react";

import AdminDashboard from "../../components/admin/AdminDashboard.jsx";
import AdminNewsletter from "../../components/admin/AdminNewsletter.jsx";
import AdminBlogForm from "../../components/admin/AdminBlogForm.jsx";
import AdminProjectForm from "../../components/admin/AdminProjectForm.jsx";
import supabase from "../../supabase/supabase-client";

const ACCENT_PINK = "#ff36a3";
const ACCENT_YELLOW = "#dbff00";
const NOTIF_LS_KEY = "admin_notif_last_seen_v1";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "newsletter", label: "Newsletter", icon: Send },
  { key: "blog", label: "Blog", icon: FileText },
  { key: "progetti", label: "Progetti", icon: FolderKanban },
];

export default function AdminPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("dashboard");

  // Notifiche
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifError, setNotifError] = useState("");

  // "Nuove" notifiche (badge solo se ci sono novità)
  const [lastSeen, setLastSeen] = useState(() => {
    const v = localStorage.getItem(NOTIF_LS_KEY);
    return v ? new Date(v) : new Date(0);
  });
  const [hasNew, setHasNew] = useState(false);
  const newestNotifRef = useRef(null); // tiene la data più recente

  // larghezza sidebar desktop
  const sidebarW = collapsed ? "5rem" : "16rem";

  // Carica notifiche quando la modale si apre
  useEffect(() => {
    if (!notifOpen) return;

    const load = async () => {
      setNotifLoading(true);
      setNotifError("");
      try {
        const [
          { data: subs, error: errSubs },
          { data: blogCom, error: errBlog },
          { data: projCom, error: errProj },
        ] = await Promise.all([
          supabase
            .from("newsletter_subscribers")
            .select("email,status,created_at")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("comments")
            .select("id, created_at, profile_username, content, blog_post_id")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("project_comments")
            .select(
              "id, created_at, profile_username, content, project_post_id"
            )
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        if (errSubs || errBlog || errProj) {
          throw new Error(
            (errSubs?.message || "") +
              " " +
              (errBlog?.message || "") +
              " " +
              (errProj?.message || "")
          );
        }

        const mapSubs =
          (subs || []).map((s) => ({
            type: "newsletter",
            title: "Nuovo iscritto",
            subtitle: `${s.email} • ${s.status}`,
            date: new Date(s.created_at),
            link: null,
          })) || [];

        const mapBlog =
          (blogCom || []).map((c) => ({
            type: "blog_comment",
            title: "Nuovo commento (Blog)",
            subtitle: `${c.profile_username || "anon"}: ${c.content?.slice(
              0,
              80
            )}${c.content?.length > 80 ? "…" : ""}`,
            date: new Date(c.created_at),
            link: c.blog_post_id ? `/blog/${c.blog_post_id}` : null,
          })) || [];

        const mapProj =
          (projCom || []).map((c) => ({
            type: "project_comment",
            title: "Nuovo commento (Progetto)",
            subtitle: `${c.profile_username || "anon"}: ${c.content?.slice(
              0,
              80
            )}${c.content?.length > 80 ? "…" : ""}`,
            date: new Date(c.created_at),
            link: c.project_post_id ? `/progetti/${c.project_post_id}` : null,
          })) || [];

        const merged = [...mapSubs, ...mapBlog, ...mapProj]
          .sort((a, b) => b.date - a.date)
          .slice(0, 20);

        setNotifications(merged);

        // Calcola se ci sono novità rispetto all'ultima vista
        const newest = merged[0]?.date || null;
        newestNotifRef.current = newest;
        setHasNew(newest ? newest > lastSeen : false);
      } catch (e) {
        console.warn("notif load error", e);
        setNotifError("Impossibile caricare le notifiche.");
        setNotifications([]);
        setHasNew(false);
      } finally {
        setNotifLoading(false);
      }
    };

    load();
  }, [notifOpen, lastSeen]);

  // Quando la modale si chiude (via backdrop/ESC/x), segna come "lette"
  useEffect(() => {
    const el = document.getElementById("notificationsModal");
    if (!el) return;
    const handler = () => {
      setNotifOpen(false);
      const newest = newestNotifRef.current;
      if (newest && newest > lastSeen) {
        localStorage.setItem(NOTIF_LS_KEY, newest.toISOString());
        setLastSeen(newest);
        setHasNew(false);
      }
    };
    el.addEventListener("hidden.bs.modal", handler);
    return () => el.removeEventListener("hidden.bs.modal", handler);
  }, [lastSeen]);

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
        :root{
          --accent-pink: ${ACCENT_PINK};
          --accent-yellow: ${ACCENT_YELLOW};
          --bg-900: #0b0b0e;
          --bg-850: #0e0e13;
          --bg-800: #0f0f14;
        }

        .topbar{
          position: fixed; top: 0; left: 0; right: 0; z-index: 1030;
          background-color: rgba(15,15,20,.7);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,.1);
          height: 64px;
        }

        .sidebar-fixed{
          background-color: var(--bg-850);
          border-right: 1px solid rgba(255,255,255,.1);
          transition: width .3s ease;
          display: none;
        }
        @media (min-width: 768px){
          .sidebar-fixed{
            display: flex;
            position: fixed;
            top: 64px;
            bottom: 0;
            left: 0;
            width: var(--sidebar-w);
            flex-direction: column;
            overflow: hidden;
          }
          .sidebar-scroll{ overflow-y:auto; }
        }
        .sidebar .nav-link{ color:#e5e7eb; border-radius:.75rem; }
        .sidebar .nav-link:hover{ background-color: rgba(255,255,255,.05); }
        .sidebar .nav-link.active{ background-color: rgba(255,255,255,.07); color: var(--accent-yellow); }

        .content-wrap{ padding-top:64px; }
        @media (min-width: 768px){
          .content-wrap{ margin-left: var(--sidebar-w); }
        }

        .badge-dot{ width:6px; height:6px; border-radius:999px; background: var(--accent-pink); display:inline-block; }
        .card-dark{ background-color: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.1); box-shadow: 0 0 0 1px rgba(255,255,255,.02); }
        .gradient-blob{ position: fixed; left:0; right:0; bottom:-20vh; height:40vh; filter: blur(36px); opacity:.25; background: radial-gradient(60% 50% at 50% 100%, var(--accent-pink), transparent 60%), radial-gradient(60% 50% at 60% 100%, var(--accent-yellow), transparent 60%); pointer-events:none; z-index:0; }
        .btn-icon{ border-radius: 12px; }

        /* Notifiche modal */
        .notif-item{ background:#0d0d0d; border:1px solid #333; border-radius:12px; padding:12px; }
        .notif-title{ color: var(--accent-yellow); font-weight:600; }
        .notif-sub{ color:#cbd5e1; }
        .notif-date{ color:#a3a3a3; font-size:12px; }
        .notif-type{ color: var(--accent-pink); font-size:12px; font-weight:600; }
      `}</style>

      {/* TOPBAR */}
      <header className="topbar">
        <div className="container-fluid px-3 h-100">
          <div className="d-flex align-items-center justify-content-between h-100">
            <div className="d-flex align-items-center gap-2">
              {/* Mobile menu button (Offcanvas) */}
              <button
                className="btn btn-dark btn-icon d-md-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#mobileSidebar"
                aria-controls="mobileSidebar"
                aria-label="Apri menu"
              >
                <Menu size={24} />
              </button>
              <div className="d-flex align-items-center gap-2 ms-1">
                <span
                  className="rounded-circle"
                  style={{
                    width: 12,
                    height: 12,
                    background: "var(--accent-yellow)",
                  }}
                />
                <span
                  className="fw-semibold"
                  style={{ letterSpacing: ".02em" }}
                >
                  Admin
                  <span style={{ color: "var(--accent-pink)" }}>Panel</span>
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {/* NOTIFICHE: badge solo se hasNew === true */}
              <button
                className="btn btn-dark btn-icon position-relative"
                aria-label="Notifiche"
                data-bs-toggle="modal"
                data-bs-target="#notificationsModal"
                onClick={() => setNotifOpen(true)}
              >
                <Bell size={20} />
                {hasNew && (
                  <span
                    className="position-absolute translate-middle badge-dot"
                    style={{ right: 2, top: 2 }}
                  />
                )}
              </button>

              {/* HOME */}
              <Link to="/" className="btn btn-dark btn-icon" aria-label="Home">
                <Home size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR DESKTOP */}
      <aside
        className="sidebar-fixed sidebar d-none d-md-flex"
        aria-label="Sidebar"
      >
        <nav className="sidebar-scroll px-2 pb-4 pt-5">
          <ul className="nav flex-column gap-1">
            {navItems.map(({ key, label, icon: Icon }) => {
              const isActive = key === active;
              return (
                <li className="nav-item" key={key}>
                  <a
                    href="#"
                    className={`nav-link d-flex align-items-center gap-3 px-3 py-2 ${
                      isActive ? "active" : ""
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      setActive(key);
                    }}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span className={`${collapsed ? "d-none" : "d-inline"}`}>
                      {label}
                    </span>
                    {isActive && !collapsed && (
                      <span className="ms-auto badge-dot" />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* MOBILE Sidebar (Offcanvas) */}
      <div
        className="offcanvas offcanvas-start text-bg-dark d-md-none bg-black"
        tabIndex={-1}
        id="mobileSidebar"
        aria-labelledby="mobileSidebarLabel"
      >
        <div className="offcanvas-header">
          <div className="d-flex align-items-center gap-2">
            <span
              className="rounded-circle"
              style={{
                width: 12,
                height: 12,
                background: "var(--accent-yellow)",
              }}
            />
            <h6 className="offcanvas-title mb-0" id="mobileSidebarLabel">
              Menu
            </h6>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Chiudi"
          ></button>
        </div>
        <div className="offcanvas-body">
          <nav>
            <ul className="nav flex-column gap-1">
              {navItems.map(({ key, label, icon: Icon }) => (
                <li className="nav-item" key={key}>
                  <a
                    href="#"
                    className="nav-link d-flex align-items-center gap-3 px-3 py-2 text-white"
                    data-bs-dismiss="offcanvas"
                    onClick={(e) => {
                      e.preventDefault();
                      setActive(key);
                    }}
                  >
                    <Icon size={20} />
                    <span className="small">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* CONTENUTO */}
      <main className="content-wrap p-3 p-md-4 pt-5 mt-5" role="main">
        <div
          className="container-fluid mt-lg-5 mt-md-5"
          style={{ maxWidth: "1280px" }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h1 className="h5 fw-semibold mb-0">
              {navItems.find((n) => n.key === active)?.label}
            </h1>
          </div>

          {active === "dashboard" && (
            <section className="mb-4">
              <AdminDashboard />
            </section>
          )}

          {active === "newsletter" && (
            <section className="mb-4">
              <AdminNewsletter />
            </section>
          )}

          {active === "blog" && (
            <section className="mb-4">
              <AdminBlogForm />
            </section>
          )}

          {active === "progetti" && (
            <section className="mb-4">
              <AdminProjectForm />
            </section>
          )}

        </div>
      </main>

      {/* MODALE NOTIFICHE */}
      <div
        className="modal fade"
        id="notificationsModal"
        tabIndex={-1}
        aria-labelledby="notificationsLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-lg">
          <div
            className="modal-content"
            style={{ background: "#0b0b0e", border: "1px solid #333" }}
          >
            <div
              className="modal-header"
              style={{ borderBottom: "1px solid #333" }}
            >
              <h5 className="modal-title text-white" id="notificationsLabel">
                Notifiche
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Chiudi"
                onClick={() => setNotifOpen(false)}
              />
            </div>
            <div className="modal-body">
              {notifLoading && (
                <div className="text-white-50 py-2">Caricamento…</div>
              )}
              {notifError && (
                <div className="alert alert-warning py-2">{notifError}</div>
              )}
              {!notifLoading && !notifError && notifications.length === 0 && (
                <div className="text-white-50">Nessuna notifica recente.</div>
              )}

              <div className="d-grid gap-2">
                {notifications.map((n, i) => (
                  <div className="notif-item" key={i}>
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-sub">{n.subtitle}</div>
                        <div className="notif-date mt-1">
                          {n.date.toLocaleString()}
                          {n.type && (
                            <span className="ms-2 notif-type">#{n.type}</span>
                          )}
                        </div>
                      </div>
                      {n.link && (
                        <Link to={n.link} className="btn btn-sm btn-accent">
                          Vai
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="modal-footer"
              style={{ borderTop: "1px solid #333" }}
            >
              <button
                type="button"
                className="btn btn-outline-light"
                data-bs-dismiss="modal"
                onClick={() => setNotifOpen(false)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="gradient-blob" aria-hidden></div>
    </div>
  );
}
