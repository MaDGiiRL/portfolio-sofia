import { useTranslation } from 'react-i18next';
export default function ErrorPage() {
    const { t } = useTranslation();
    return (
        <div className="d-flex align-items-center justify-content-center vh-100 error-page bg-black text-light position-relative overflow-hidden">
            <div className="glow-error glow-pink"></div>
            <div className="glow-error glow-yellow"></div>

            <div className="text-center position-relative">
                <h1 className="display-1 fw-bold text-gradient">Oops!</h1>
                <p className="fs-4">{t('error1')}</p>
                <p className="text-secondary">{t('error2')}<br /> {t('error3')}</p>

                <a href="/" className="btn btn-lg btn-gradient mt-4 shadow">
                    {t('form27')}
                </a>
            </div>
        </div>
    );
}