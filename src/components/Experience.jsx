import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function Experience() {
    const [openIndex, setOpenIndex] = useState(null);
    const { t } = useTranslation();
    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="experienceSection flex-col-wise my-5 py-5">
            <div className="container d-flex flex-column justify-content-center">
                <div className="header">
                    <h2 className="text-white text-left display-5 text-uppercase">
                        {t('exp')}
                    </h2>
                    <span className="legend footer"><span className="dot"></span> {t("guide2")} </span>
                </div>

                <div className="experience">
                    {/* --- CARD 1 --- */}
                    <div className="experienceCard row">
                        <div className="col-lg-3 col-12">
                            <p className="subtitleFont">01.</p>
                            <p className="subtitleFont">Aulab "Hackademy 161"</p>
                        </div>
                        <div className="col-lg-9 col-12">
                            <p
                                className="collapsible normalFont pt-4  text-exp"
                                onClick={() => toggle(1)}

                            >
                                {t('exp1')}
                            </p>
                            {openIndex === 1 && (
                                <div className="content normalFont">
                                    <p className="text-exp">
                                        {t('exp2')}
                                    </p>
                                    <p className="text-exp">
                                        {t('exp22')}

                                    </p>
                                </div>
                            )}

                            <p className="normalFont">Tech Stack : </p>
                            <div className="d-flex flex-row flex-wrap">
                                <span className="bubbleData normalFont mx-2 my-1">HTML</span>
                                <span className="bubbleData normalFont mx-2 my-1">CSS</span>
                                <span className="bubbleData normalFont mx-2 my-1">
                                    Bootstrap
                                </span>
                                <span className="bubbleData normalFont mx-2 my-1">
                                    Tailwind
                                </span>
                                <span className="bubbleData normalFont mx-2 my-1">
                                    Javascript
                                </span>
                                <span className="bubbleData normalFont mx-2 my-1">React</span>
                                <span className="bubbleData normalFont mx-2 my-1">Laravel</span>
                                <span className="bubbleData normalFont mx-2 my-1">MySQL</span>
                                <span className="bubbleData normalFont mx-2 my-1">API</span>
                                <span className="bubbleData normalFont mx-2 my-1">GitHub</span>
                            </div>
                        </div>
                    </div>

                    {/* --- CARD 2 --- */}
                    <div className="experienceCard row mt-4">
                        <div className="col-lg-3 col-12">
                            <p className="subtitleFont">02.</p>
                            <p className="subtitleFont">FiveM Servers</p>
                        </div>
                        <div className="col-lg-9 col-12">
                            <p
                                className="collapsible normalFont pt-4 text-exp"
                                onClick={() => toggle(2)}
                            >
                                {t('exp3')}
                            </p>
                            {openIndex === 2 && (
                                <div className="content normalFont">
                                    <p className="text-exp">
                                        {t('exp4')}
                                    </p>
                                    <p className="text-exp">
                                        {t('exp5')}
                                    </p>
                                </div>
                            )}

                            <p className="normalFont">Tech Stack : </p>
                            <div className="d-flex flex-row flex-wrap">
                                <span className="bubbleData normalFont mx-2 my-1">Lua</span>
                                <span className="bubbleData normalFont mx-2 my-1">React</span>
                                <span className="bubbleData normalFont mx-2 my-1">Mantine</span>
                                <span className="bubbleData normalFont mx-2 my-1">Angular</span>
                                <span className="bubbleData normalFont mx-2 my-1">
                                    Postgre SQL
                                </span>
                                <span className="bubbleData normalFont mx-2 my-1">Node JS</span>
                            </div>
                        </div>
                    </div>

                    {/* --- CARD 3 --- */}
                    <div className="experienceCard row mt-4">
                        <div className="col-lg-3 col-12">
                            <p className="subtitleFont">03.</p>
                            <p className="subtitleFont">Aulab "UX-UI"</p>
                        </div>
                        <div className="col-lg-9 col-12">
                            <p
                                className="collapsible normalFont pt-4 text-exp"
                                onClick={() => toggle(3)}
                            >
                                {t('exp6')}
                            </p>
                            {openIndex === 3 && (
                                <div className="content normalFont">
                                    <p className="text-exp">
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                        Incidunt quas veritatis quia cupiditate officia cum
                                        doloribus iusto voluptatum ipsam dicta, asperiores corporis
                                        facere placeat eligendi vitae ad ullam est exercitationem
                                        optio quo alias. Iusto. Lorem ipsum dolor sit amet
                                        consectetur adipisicing elit. Quam minus consequuntur maxime
                                        assumenda laboriosam. At minus nostrum excepturi nemo.
                                        Officiis iste excepturi totam.
                                    </p>
                                </div>
                            )}

                            <p className="normalFont">Tech Stack : </p>
                            <div className="d-flex flex-row flex-wrap">
                                <span className="bubbleData normalFont mx-2 my-1">Figma</span>
                                <span className="bubbleData normalFont mx-2 my-1">
                                    Adobe Color
                                </span>
                                <span className="bubbleData normalFont mx-2 my-1">
                                    Photoshop
                                </span>
                                <span className="bubbleData normalFont mx-2 my-1">Gimp</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
