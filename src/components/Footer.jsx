// /src/components/Footer.jsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import TermsBanner from "./TermsBanner";

export default function Footer() {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!document.querySelector("#iubenda-script")) {
      const s = document.createElement("script");
      s.src = "https://cdn.iubenda.com/iubenda.js";
      s.id = "iubenda-script";
      const first = document.getElementsByTagName("script")[0];
      first.parentNode.insertBefore(s, first);
    }
  }, []);

  const openTermsModal = () => {
    window.dispatchEvent(new Event("terms:open"));
  };

  return (
    <>
      {/* ✅ stile "bannerino" tipo iubenda */}
      <style>{`
        .legal-chip {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          border: 1px solid rgba(0,0,0,.12);
          background: #ffffff;
          color: #111117;
          padding: .28rem .6rem;
          border-radius: 3px;
          font-weight: 400;
          font-size: .70rem;
          line-height: 1;
          box-shadow: 0 6px 18px rgba(0,0,0,.12);
          transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
          text-decoration: none;
        }
        .legal-chip:hover {
               background: #e0ddddff;
          box-shadow: 0 10px 24px rgba(0,0,0,.16);
          border-color: rgba(0,0,0,.18);
          text-decoration: none;
        }
        .legal-chip:focus-visible {
          outline: 0;
          box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #111117;
        }
        .legal-chip__dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--accent-pink, #ff36a3), var(--accent-yellow, #dbff00));
          box-shadow: 0 0 0 2px rgba(0,0,0,.06);
        }
          a{
          color: #dbff00
          }
            a:hover{
          color: #ff36a3
          }
        /* variante dark-friendly se vuoi forzare modalità scura:
        @media (prefers-color-scheme: dark) {
          .legal-chip { border-color: rgba(255,255,255,.16); }
        } */
      `}</style>

      <footer className="text-white py-5 text-center position-relative">
        {/* Social links */}
        <ul className="navbar-nav ms-auto d-flex flex-row flex-lg-row justify-content-center mb-lg-0 fs-3">
          <li className="nav-item ml-1">
            <a
              className="nav-link me-4"
              href="https://www.instagram.com/madgiirl99"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-instagram"></i>
            </a>
          </li>
          <li className="nav-item ml-1">
            <a
              className="nav-link me-4"
              href="https://github.com/MaDGiiRL"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-github"></i>
            </a>
          </li>
          <li className="nav-item ml-1">
            <a
              className="nav-link me-4"
              href="https://discord.gg/DhDfTWPucn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-discord"></i>
            </a>
          </li>
          <li className="nav-item ml-1">
            <a
              className="nav-link me-4"
              href="https://www.facebook.com/sophieriot99"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-facebook"></i>
            </a>
          </li>
          <li className="nav-item ml-1">
            <a
              className="nav-link"
              href="https://www.linkedin.com/in/sofia-vidotto-ba1369351"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-linkedin"></i>
            </a>
          </li>
        </ul>

        <p className="mb-3">
          © Developed with <span className="text-danger">❤️</span> by{" "}
          <a href="https://www.linkedin.com/in/sofia-vidotto-ba1369351">
            MaDGiiRL
          </a>
        </p>

        <div className="site-footer my-3">
          <nav
            aria-label="Legal"
            className="d-flex align-items-center justify-content-center gap-2 flex-wrap"
          >
            {/* Privacy Iubenda (rimane com'è) */}
            <a
              href="https://www.iubenda.com/privacy-policy/79528291"
              className="iubenda-white iubenda-noiframe iubenda-embed"
              title="Privacy Policy"
            >
              Privacy Policy
            </a>

            <span aria-hidden="true" className="mx-1 fs-3">
              ·
            </span>

            {/* 🔥 Bannerino stile Iubenda per i Termini */}
            <button
              type="button"
              className="legal-chip"
              onClick={openTermsModal}
              aria-label="Apri Termini e Condizioni"
            >
              <span className="legal-chip__dot" aria-hidden="true" />
              Terms and Condition
            </button>
          </nav>
        </div>

        <button
          onClick={scrollToTop}
          className="btn btn-primary rounded-pill shadow custom-back-to-top-btn"
        >
          <i className="bi bi-arrow-up me-2"></i>
          {t("backtotop")}
        </button>
      </footer>

      {/* Monta la logica banner/modal una sola volta */}
      <TermsBanner />
    </>
  );
}
