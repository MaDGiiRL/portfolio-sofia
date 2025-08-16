import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
    }, []);
    const { t } = useTranslation();

    return (
        <>
            <footer className="text-white py-5 text-center position-relative">
                {/* Social links */}
                <ul className="navbar-nav ms-auto d-flex flex-row flex-lg-row justify-content-center mb-lg-0 fs-3">
                    <li className="nav-item ml-1">
                        <a className="nav-link me-4" href="https://www.instagram.com/madgiirl99" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-instagram"></i>
                        </a>
                    </li>
                    <li className="nav-item ml-1">
                        <a className="nav-link me-4" href="https://github.com/MaDGiiRL" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-github"></i>
                        </a>
                    </li>

                    <li className="nav-item ml-1">
                        <a className="nav-link me-4" href="https://discord.gg/UmgNM7kK" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-discord"></i>
                        </a>
                    </li>

                    <li className="nav-item ml-1">
                        <a className="nav-link me-4" href="https://www.facebook.com/sophieriot99" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-facebook"></i>
                        </a>
                    </li>

                    <li className="nav-item ml-1">
                        <a className="nav-link" href="https://www.linkedin.com/in/sofia-vidotto-ba1369351" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-linkedin"></i>
                        </a>
                    </li>

                </ul>
                <p className="mb-3">
                    © Developed with <span className="text-danger">❤️</span> by <a href="https://www.linkedin.com/in/sofia-vidotto-ba1369351">MaDGiiRL</a>
                </p>

                <button
                    onClick={scrollToTop}
                    className="btn btn-primary rounded-pill shadow custom-back-to-top-btn"
                >
                    <i className="bi bi-arrow-up me-2"></i>
                    {t('backtotop')}
                </button>
            </footer>

            <style>{`
                .custom-back-to-top-btn {
                    transition: all 0.3s ease-in-out;
                    padding: 0.6rem 1.2rem;
                    font-weight: 500;
                    font-size: 0.9rem;
                    background-color: rgb(19, 19, 19);
                    border: none

                }

                .custom-back-to-top-btn:hover {
                      background: linear-gradient(90deg,
      rgba(219, 255, 0, 0.2) 0%,
      rgba(255, 54, 163, 0.2) 25%,
      rgba(0, 0, 0, 1) 50%,
      rgba(255, 54, 163, 0.2) 75%,
      rgba(219, 255, 0, 0.2) 100%);
                }

                footer i.bi-arrow-up {
                    transition: transform 0.3s ease;
                }

                .custom-back-to-top-btn:hover i.bi-arrow-up {
                    transform: translateY(-2px);
                }
            `}</style>
        </>
    );
}
