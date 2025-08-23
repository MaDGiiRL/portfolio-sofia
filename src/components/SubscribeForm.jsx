import { useState } from "react";
import { useTranslation } from 'react-i18next';


export default function SubscribeForm() {
    const [email, setEmail] = useState("");
    const [ok, setOk] = useState(null);
    const { t } = useTranslation();

    const onSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/newsletter/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, gdpr: true })
        });
        setOk(res.ok);
    };

    return (
        <div className="newsletter mt-5">
            <div className="newsletter-banner text-center p-4 rounded-3 mb-4">
                <h2 className="mb-2">{t('news1')}</h2>
                <p className="mb-3">{t('news2')}</p>
                <form onSubmit={onSubmit} className="d-flex justify-content-center align-items-center flex-wrap gap-2">
                    <input
                        type="email"
                        required
                        placeholder="La tua email"
                        value={email}
                        className="form-control newsletter-input"
                        onChange={(e) => setEmail(e.target.value)} />
                    <button className="btn newsletter-btn">{t('news4')}</button>
                    <div className="input-group d-flex justify-content-center align-items-center small text-white-50">
                        {ok === true && <p className="text-white-50">{t('news5')}</p>}
                        {ok === false && <p className="text-white-50">{t('news6')}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}
