import { useEffect } from "react";

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // opzionale: aggiungi un effetto quando il componente è montato
    useEffect(() => {
        // Scroll reveal effect o qualsiasi logica futura
    }, []);

    return (
        <>
            <footer className="text-white py-5 text-center position-relative">
                <p className="mb-3">
                    © Developed with <span className="text-danger">❤️</span> by Sofia Vidotto
                </p>

                <button
                    onClick={scrollToTop}
                    className="btn btn-primary rounded-pill shadow custom-back-to-top-btn"
                >
                    <i className="bi bi-arrow-up me-2"></i>
                    Back to Top
                </button>
            </footer>

            <style jsx>{`
                .custom-back-to-top-btn {
                    transition: all 0.3s ease-in-out;
                    padding: 0.6rem 1.2rem;
                    font-weight: 500;
                    font-size: 0.9rem;
                    background-image: url(/src/assets/01.png);
                    background-size: cover;
                    background-color: rgb(19, 19, 19);
                    border: none

                }

                .custom-back-to-top-btn:hover {
                    transform: translateY(-4px);
                     background: rgb(255, 255, 255);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.09287464985994398) 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, rgba(255, 255, 255, 0.20772058823529416) 100%);
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
