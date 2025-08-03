import React, { useEffect, useState, useRef } from "react";
const summaryData = [
    {
        innterText: "About Coding",
        paragraphLines: `A versatile full-stack developer with a strong focus on Web Design. Proven experience in building and deploying robust websites, from UI/UX frontend to backend APIs and infrastructure. Skilled in performance optimization and implementing innovative features.`,
        tiitleWord: "About Coding",
        subtitleWord: "+10 Years of Passion for Tech"
    },
    {
        innterText: "What I do",
        paragraphLines: `HTML, CSS, SCSS, SASS, Bootstrap, JavaScript, Node.js, RESTful APIs, React.js, PHP, MySQL, Laravel, Git, GitLab, GitHub, Agile and Scrum methodologies.`,
        subtitleWord: "Keep Studying everyday",
        tiitleWord: "What I do"
    },
    {
        innterText: "Skills",
        paragraphLines: `Highly skilled developer with a solid knowledge of HTML, CSS, JavaScript, and backend technologies such as Laravel and PHP. Expert in creating responsive and innovative websites.`,
        subtitleWord: "Frontend lover",
        tiitleWord: "Skills"
    },
    {
        innterText: "Working On",
        paragraphLines: `I am currently specializing in React.js, deepening my knowledge in building dynamic and high-performance interfaces. I’m excited to explore the full potential of this framework to create modern and interactive web applications.`,
        subtitleWord: "Continue personal evolution",
        tiitleWord: "Working On"
    },
    {
        innterText: "About me",
        paragraphLines: `Hi! I’m Sofia, a junior full-stack web developer with a great passion for coding, video games, and above all, my family. Every day I balance my life between developing web applications, gaming, and the wonderful role of being a mom. I love creating intuitive and engaging digital experiences using Laravel, Livewire, PHP, HTML, CSS, and JavaScript. For me, coding is like solving a puzzle: every line of code is a piece that leads to the perfect solution. Whether I’m building a website or beating a tough level in a game, my determination never stops!`,
        subtitleWord: "We’re all mad here",
        tiitleWord: "About me"
    },
    {
        innterText: "Sofia Vidotto",
        paragraphLines: `I’m Sofia, a full-stack developer with a strong passion for web design and dynamic application development. I’m currently specializing in React.js to create modern and interactive interfaces. I love turning ideas into intuitive digital solutions, combining creativity and logic to deliver smooth and high-performing user experiences.`,
        subtitleWord: "Web Dev Junior",
        tiitleWord: "Sofia Vidotto"
    }
];


export default function Summary() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 580;
    const variable = isMobile ? 55 : 50;
    const radius = isMobile ? 130 : 155;
    const DEG_TO_RAD = Math.PI / 180;
    const CIRCLE_SPACING = 60;

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
                </div>

                <div className="col-lg-6 col-12 my-0 mt-5 pt-5 order-first pb-5 mb-2">
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
