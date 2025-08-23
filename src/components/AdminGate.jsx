import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

export default function AdminGate({ children }) {
    const [ok, setOk] = useState(false);
    const [checking, setChecking] = useState(true);
    const [pass, setPass] = useState("");
    const { t } = useTranslation();

    const check = async () => {
        try {
            const res = await fetch("/api/admin/status", {
                credentials: "include",
                headers: { "Cache-Control": "no-store" },
            });
            if (!res.ok) throw new Error("status not ok");
            const data = await res.json();
            setOk(!!data.ok);
        } catch {
            setOk(false);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        check();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: pass }),
            });
            if (!res.ok) throw new Error("bad pass");
            setPass("");

            await Swal.fire({
                icon: "success",
                title: t("admin1"),
                text: t("admin2"),
                background: "#0d0d0d",
                color: "#fff",
                iconColor: "#dbff00",
                confirmButtonColor: "#dbff00",
            });


            check();
        } catch {
            Swal.fire({
                icon: "error",
                title: t("admin3"),
                text: t("admin4"),
                background: "#0d0d0d",
                color: "#fff",
                iconColor: "#ff36a3",
                confirmButtonColor: "#ff36a3",
            });
        }
    };

    if (checking) return <p style={{ color: "#fff" }}>{t("form5")}</p>;
    if (!ok) {

        return (
            <div className="text-container">
                <div className="container text-container mt-md-5 mt-lg-5 px-3">
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-6 auth-container">
                            <div className="auth-card p-4 p-sm-4 p-lg-5">
                                <div className="logo d-flex align-items-center justify-content-center mb-3">
                                    <div className="logo-icon">MP</div>
                                </div>
                                <h2>Admin Gate</h2>
                                <p>{t("admin6")}</p>

                                <form onSubmit={submit}>
                                    <div className="input-group">
                                        <input
                                            type="password"
                                            placeholder="Enter passphrase"
                                            value={pass}
                                            onChange={(e) => setPass(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: 12,
                                                borderRadius: 8,
                                                border: "1px solid #333",
                                                background: "#1a1a1a",
                                                color: "#fff",
                                            }}
                                        />
                                    </div>
                                    <button type="submit" className="btn-login-auth">
                                        {t("admin7")}
                                    </button>
                                </form>

                                <div className="auth-footer">
                                    <a href="/">
                                        <i className="bi bi-arrow-left-short"></i> {t("form27")}
                                    </a>
                                </div>

                                <div className="pt-5">
                                    <p className="small">
                                        © 2025 MaD&apos;s Portfolio. {t("form13")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="gradient-bg">
                        <svg xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <filter id="goo">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
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
            </div>
        );
    }

    return children;
}