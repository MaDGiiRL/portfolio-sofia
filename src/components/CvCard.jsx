import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';


export default function CvCard() {
    const { t } = useTranslation();
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const staggerContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    /** Helpers **/
    function ContactRow({ icon: Icon, label, value, href }) {
        if (!value) return null;
        const content = (
            <>
                <Icon className="icon" />
                <span className="label">{label}:</span>
                <span className="value">{value}</span>
            </>
        );
        return (
            <div className="contact-row">
                {href ? (
                    <a
                        className="contact-link"
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        {content}
                    </a>
                ) : (
                    <div className="contact-static">{content}</div>
                )}
            </div>
        );
    }

    /** Icone SVG minimal **/
    function MailIcon({ className = "" }) {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
            >
                <path
                    d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm16 2-8 5-8-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }
    function PhoneIcon({ className = "" }) {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
            >
                <path
                    d="M22 16.92v2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 3.9 2 2 0 0 1 4.11 2h2a2 2 0 0 1 2 1.72c.12.9.33 1.77.63 2.6a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.48-1.19a2 2 0 0 1 2.11-.45c.83.3 1.7.51 2.6.63A2 2 0 0 1 22 16.92z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }
    function GlobeIcon({ className = "" }) {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
                <path
                    d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            </svg>
        );
    }
    function MapPinIcon({ className = "" }) {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
            >
                <path
                    d="M12 22s7-5.33 7-12a7 7 0 1 0-14 0c0 6.67 7 12 7 12z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.5" fill="currentColor" />
            </svg>
        );
    }


    return (
        <div className="cvcard-wrapper py-5 my-2" id="cvcard">
            <article className="cv-card" aria-label="Scheda curriculum">
                <div className="glow" aria-hidden="true" />
                <header className="cv-header">
                    <div className="avatar-wrap" aria-hidden="false">
                        <img
                            className="avatar"
                            src="https://i.imgur.com/rFN67vL.png"
                            alt="Sofia Vidotto"
                        />
                        <span className="ring" aria-hidden="true" />
                    </div>
                    <div className="id-block">
                        <h1 className="name">
                            <span className="first">Sofia</span>
                            <span className="last"> Vidotto</span>
                        </h1>
                        <p className="role" aria-label="Ruolo professionale">
                            Full-Stack Web Developer
                        </p>
                    </div>
                </header>

                <div className="divider" aria-hidden="true" />

                <section className="contacts normalFont" aria-label={t('cv6')}>
                    <ContactRow
                        icon={MailIcon}
                        label="Email"
                        value="sofiavidotto8@gmail.com"
                        href="mailto:sofiavidotto8@gmail.com"
                    />
                    <ContactRow
                        icon={PhoneIcon}
                        label={t('cv1')}
                        value="+39 351 725 5899"
                        href="tel:+393517255899"
                    />
                    <ContactRow
                        icon={GlobeIcon}
                        label="GitHub"
                        value="github.com/MaDGiiRL"
                        href="https://github.com/MaDGiiRL"
                    />
                    <ContactRow
                        icon={MapPinIcon}
                        label={t('cv2')}
                        value={t('cv5')}
                    />
                </section>

                <div className="divider thin" aria-hidden="true" />

                <section className="about" aria-label="Chi sono">
                    <h2 className="section-title">{t('cv14')}</h2>

                    <p>👋 {t('cv15')} 💻.</p>

                    <p>🎓 {t('cv16')}.</p>

                    <p>💻 {t('cv17')}.</p>

                    <p>✨ {t('cv18')}.</p>

                    <p> 🚀 {t('cv19')}.</p>

                </section>

                <div className="divider thin" aria-hidden="true" />

                {/* Esperienza */}
                <section className="experience" aria-label="Esperienza lavorativa">
                    <h2 className="section-title">{t('cv20')}</h2>
                    <ul className="list-unstyled">
                        <li>
                            <strong>Frontend Developer</strong> – FiveM Project (2024 – 2025)
                            <p>
                                {t('cv21')}
                            </p>
                        </li>
                        <li>
                            <strong>Frontend Developer</strong> – Freelance (2021 – 2023)
                            <p>
                                {t('cv22')}
                            </p>
                        </li>
                    </ul>
                </section>



                <div className="divider thin" aria-hidden="true" />

                {/* Soft Skills */}
                <section className="soft-skills" aria-label="Competenze trasversali">
                    <h2 className="section-title">Soft Skills</h2>

                    <p className="bubbleData normalFont mx-2 my-1">{t('cv23')}</p>
                    <p className="bubbleData normalFont mx-2 my-1">{t('cv24')}</p>
                    <p className="bubbleData normalFont mx-2 my-1">{t('cv25')}</p>
                    <p className="bubbleData normalFont mx-2 my-1">{t('cv26')}</p>
                    <p className="bubbleData normalFont mx-2 my-1">{t('cv27')}</p>
                    <p className="bubbleData normalFont mx-2 my-1">{t('cv28')}</p>
                    <p className="bubbleData normalFont mx-2 my-1">{t('cv29')}</p>
                    <p className="bubbleData normalFont mx-2 my-1">{t('cv30')}</p>
                    <p className="bubbleData normalFont mx-2 my-1">{t('cv31')}</p>
                    <p className="bubbleData normalFont mx-2 my-1">{t('cv32')}</p>
                </section>


                <div className="divider thin" aria-hidden="true" />

                <section className="education" aria-label="Titolo di studio">
                    <h2 className="section-title">{t('cv3')}</h2>
                    <p className="degree">
                        <a href="https://www.credential.net/9bcc06d6-6d2c-4a95-aff9-c03874c1bdf9#acc.iZsw3pbr">
                            {t('cv4')} Aulab Full-Stack Web Developer
                        </a>
                    </p>
                    <p className="degree">
                        <a href="https://www.credential.net/f75b7cb6-5d49-46f3-9893-9946b64298be#acc.pyQNCgRZ">
                            {t('cv4')} Aulab {t('cv33')} React
                        </a>
                    </p>
                    <h2 className="section-title mt-3"> {t('cv7')}</h2>
                    <ul className="list-unstyled">
                        <li> {t('cv8')}</li>
                        <li> {t('cv9')}</li>
                    </ul>
                </section>

                <section className="languages" aria-label="Lingue parlate">
                    <h2 className="section-title"> {t('cv10')}</h2>
                    <ul className="list-unstyled">
                        <li> {t('cv11')}</li>
                        <li> {t('cv12')} – C2</li>
                        <li> {t('cv13')} – A1</li>
                    </ul>
                </section>
            </article>
        </div>
    );
}
