import { useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import SessionContext from "../context/SessionContext";
import supabase from "../supabase/supabase-client";

// Accent colors
const ACCENT_PINK = "#ff36a3"; // magenta
const ACCENT_LIME = "rgb(165, 233, 39)"; // lime-yellow

export default function DeleteAccountPage() {
  const { session } = useContext(SessionContext);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  // Computed classes to keep JSX tidy
  const classes = useMemo(
    () => ({
      page: "container py-5 d-flex justify-content-center align-items-start align-items-md-center",
      card: "delete-card shadow-lg border-0 rounded-4 p-4 p-md-5 w-100",
      title: "h3 fw-bold mb-3 gradient-text",
      subtitle: "text-white-50 mb-4",
      alert:
        "alert alert-dark-subtle border-0 rounded-4 px-3 py-3 d-flex gap-3 align-items-start",
      alertIcon: "bi bi-exclamation-triangle-fill fs-4 flex-shrink-0",
      btnRow: "d-flex gap-3 mt-4 flex-wrap",
      btnDelete:
        "btn btn-lg btn-accent-danger px-4 rounded-3 d-inline-flex align-items-center gap-2",
      btnCancel: "btn btn-lg btn-outline-light px-4 rounded-3",
      note: "form-text text-white-50 mt-3",
    }),
    []
  );

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: t("a46"),
      text: t("a47"),
      showCancelButton: true,
      confirmButtonText: t("a48"),
      cancelButtonText: t("b16"),
      background: "#0f0f10",
      color: "#eaeaea",
      iconColor: ACCENT_PINK,
      confirmButtonColor: ACCENT_PINK,
      cancelButtonColor: "#2a2a2a",
      reverseButtons: true,
      customClass: {
        popup: "rounded-4",
        confirmButton: "btn btn-accent-danger",
        cancelButton: "btn btn-outline-light",
      },
    });
    if (!confirm.isConfirmed) return;

    setBusy(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", session.user.id);
      if (error) throw error;

      // 1) Soft-delete del profilo (via RLS)
      const { error: fxErr } = await supabase.rpc("account_self_delete_soft");
      if (fxErr) throw fxErr;

      // 2) Logout e redirect
      await supabase.auth.signOut();

      await Swal.fire({
        icon: "success",
        title: t("a49"),
        text: t("a50"),
        background: "#0f0f10",
        color: "#eaeaea",
        iconColor: ACCENT_LIME,
        confirmButtonColor: ACCENT_LIME,
        confirmButtonText: "OK",
        customClass: { popup: "rounded-4" },
      });

      navigate("/"); // redirect home
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("a51"),
        text: err.message,
        background: "#0f0f10",
        color: "#eaeaea",
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
        customClass: { popup: "rounded-4" },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={classes.page} style={{ minHeight: "calc(100dvh - 120px)" }}>
      <div className={classes.card}>
        <h2 className={classes.title}>{t("a53")}</h2>
        <p className={classes.subtitle}>
          {t("a54")} <strong className="text-white">{t("a55")}</strong>.
          <br className="d-none d-md-block" /> {t("a56")}
        </p>

        <div className={classes.alert}>
          <i className={classes.alertIcon} style={{ color: ACCENT_LIME }} />
          <div className="text-white-50">
            <div className="fw-semibold text-white mb-1">{t("a57")}</div>
            <ul className="mb-0 ps-3 small">
              <li>{t("a58")}</li>
              <li>{t("a59")}</li>
              <li>
                {t("a60")} <span className="text-white">{t("a61")}</span>.
              </li>
            </ul>
          </div>
        </div>

        <div className={classes.btnRow}>
          <button
            type="button"
            className={classes.btnDelete}
            disabled={busy}
            onClick={handleDelete}
            style={{ opacity: busy ? 0.85 : 1 }}
          >
            {busy ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                <span> {t("a62")}</span>
              </>
            ) : (
              <>
                <i className="bi bi-trash3" />
                <span>{t("a63")}</span>
              </>
            )}
          </button>

          <button
            type="button"
            className={classes.btnCancel}
            disabled={busy}
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left" /> {t("a64")}
          </button>
        </div>

        <div className={classes.note}>
          {t("a65")}{" "}
          <a
            className="link-light text-decoration-underline"
            href="mailto:sofiavidotto8@gmail.com"
          >
            {t("a66")}
          </a>{" "}
          {t("a67")}
        </div>
      </div>

      {/* --- Styles specifici della pagina --- */}
      <style>{`
        /* Contenitore */
        .delete-card { 
          background: radial-gradient(1200px 500px at -10% -20%, rgba(255,54,163,0.08), transparent 40%),
                      radial-gradient(900px 400px at 120% 120%, rgba(165,233,39,0.08), transparent 35%),
                      #151515; 
          border: 1px solid rgba(255,255,255,0.06);
          position: relative;
        }
        .delete-card::before {
          /* bordo glow */
          content: "";
          position: absolute; inset: -1px; z-index: -1; border-radius: 1rem;
          background: linear-gradient(135deg, ${ACCENT_PINK}, ${ACCENT_LIME});
          filter: blur(12px); opacity: 0.25;
        }
        .gradient-text {
          background: linear-gradient(135deg, ${ACCENT_LIME}, ${ACCENT_PINK});
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        /* Bottoni */
        .btn-accent-danger {
          --bs-btn-bg: ${ACCENT_PINK};
          --bs-btn-border-color: ${ACCENT_PINK};
          --bs-btn-hover-bg: #ff4fb0;
          --bs-btn-hover-border-color: #ff4fb0;
          --bs-btn-active-bg: #e22f91;
          --bs-btn-active-border-color: #e22f91;
          --bs-btn-color: #0b0b0b;
          font-weight: 600;
          box-shadow: 0 0 0 .25rem rgba(255, 54, 163, .15);
        }
        .btn-outline-light:hover { color: #0b0b0b; background: #f1f1f1; }

        /* Alert scura ma leggibile */
        .alert-dark-subtle { 
          background: rgba(255,255,255,0.04) !important; 
          border-left: 4px solid ${ACCENT_LIME} !important;
        }

        /* Link */
        a.link-light { color: ${ACCENT_LIME}; }
        a.link-light:hover { color: #d6ff6a; }

        /* Accessibilità focus */
        .btn:focus { box-shadow: 0 0 0 .25rem rgba(165, 233, 39, .2) !important; }
      `}</style>
    </div>
  );
}
