import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

export default function Summary() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 580;
    const variable = isMobile ? 55 : 50;
    const radius = isMobile ? 130 : 155;
    const DEG_TO_RAD = Math.PI / 180;
    const CIRCLE_SPACING = 60;
    const { t, i18n } = useTranslation();

    const summaryData = [
        {
            innterText: "About Me",
            paragraphLines: t("summary1"),
            subtitleWord: t("subtitle1"),
            tiitleWord: "About Me"
        },
        {
            innterText: "Dev Services",
            paragraphLines: t("summary2"),
            tiitleWord: "Dev Services",
            subtitleWord: t("subtitle2")
        },
        {
            innterText: "Web Developing",
            paragraphLines: t("summary3"),
            subtitleWord: t("subtitle3"),
            tiitleWord: "Web Developing"
        },
        {
            innterText: "Web Design",
            paragraphLines: t("summary4"),
            subtitleWord: t("subtitle4"),
            tiitleWord: "Web Design"
        },
        {
            innterText: "Working On",
            paragraphLines: t("summary5"),
            subtitleWord: t("subtitle5"),
            tiitleWord: "Working On"
        },
        {
            innterText: "FiveM UI/UX",
            paragraphLines: t("summary6"),
            subtitleWord: t("subtitle6"),
            tiitleWord: "FiveM UI/UX"
        },
    ];

    const circlesRef = useRef([]);

    const calculatePosition = (angle) => ({
        left: Math.cos(angle * DEG_TO_RAD) * radius + variable,
        top: Math.sin(angle * DEG_TO_RAD) * radius + variable
    });

    useEffect(() => {
        circlesRef.current.forEach((circle, i) => {
            const angle = i * CIRCLE_SPACING + currentIndex * 45;
            const pos = calculatePosition(angle);
            if (circle) {
                circle.style.position = "absolute";
                circle.style.left = `${pos.left}px`;
                circle.style.top = `${pos.top}px`;
            }
        });
    }, [currentIndex]);

    const handleClick = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % summaryData.length);
    };

    const currentData = summaryData[currentIndex];

    return (
        <section className="summary-details flex-col-wise w-100 bg-content" onClick={handleClick}>
            <section className="container row">
                <div className="displaycontentdiv col-lg-6 col-12 d-flex flex-column justify-content-center overflow-hidden">
                    <h2 className="text-green-custom">{currentData.tiitleWord}</h2>
                    <p className="small text-uppercase text-pink fw-bold">{currentData.subtitleWord}</p>
                    <div className="normalFont mt-2">
                        <div className="lead text-white text-justify">{currentData.paragraphLines}</div>
                    </div>
                    <div className="footer mt-5" aria-hidden="true">
                        <span className="legend"><span className="dot"></span>{t("guide")}</span>
                    </div>
                </div>

                <div className="col-lg-6 col-12 my-0 order-first">
                    <section className="container center_Div position-relative">
                        <div className="circleContainer position-relative" style={{ height: "300px" }}>
                            <div id="center_circle" className="position-relative">
                                <div id="title">
                                    <div className="typewriter">
                                        <p className="headingFont">{currentData.innterText}</p>
                                    </div>
                                </div>
                                {[
                                    "bi-heart-fill",
                                    "bi-code-slash",
                                    "bi-display",
                                    "bi-chat-heart",
                                    "bi-bag-heart",
                                    "bi-person-circle"
                                ].map((icon, i) => (
                                    <div
                                        key={i}
                                        ref={(el) => (circlesRef.current[i] = el)}
                                        className="circle"
                                    >
                                        <i className={`bi ${icon} link-light fs-3`}></i>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </section>
                </div>
            </section>
        </section>
    );
}
