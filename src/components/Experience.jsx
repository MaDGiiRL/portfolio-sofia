import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";

export default function Experience() {
    const [openIndex, setOpenIndex] = useState(null);
    const { t } = useTranslation();

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Variants per l'animazione delle cards
    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.2, duration: 0.5 }
        })
    };

    const experienceData = [
        {
            id: 1,
            title: 'Aulab "Hackademy 161"',
            subtitle: t('exp1'),
            content: [t('exp2'), t('exp22')],
            tech: ["HTML", "CSS", "Bootstrap", "Tailwind", "Javascript", "React", "Laravel", "MySQL", "Supabase", "API", "GitHub"]
        },
        {
            id: 2,
            title: "FiveM Servers",
            subtitle: t('exp3'),
            content: [t('exp4'), t('exp5')],
            tech: ["Lua", "React", "Mantine", "Angular", "Postgre SQL", "Node JS"]
        },
        {
            id: 3,
            title: 'Aulab "UX-UI"',
            subtitle: t('exp6'),
            content: ["Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt quas veritatis quia cupiditate officia cum doloribus iusto voluptatum ipsam dicta..."],
            tech: ["Figma", "Adobe Color", "Photoshop", "Gimp"]
        }
    ];

    return (
        <section className="experienceSection flex-col-wise my-5 py-5" id="experience">
            <div className="container d-flex flex-column justify-content-center">
                <div className="header">
                    <h2 className="text-white text-left display-5 text-uppercase">
                        {t('exp')}
                    </h2>
                </div>
                <span className="legend footer"><span className="dot"></span> {t("guide2")} </span>

                <div className="experience">
                    {experienceData.map((item, index) => (
                        <motion.div
                            className="experienceCard row mt-4"
                            key={item.id}
                            custom={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={cardVariants}
                        >
                            <div className="col-lg-3 col-12">
                                <p className="subtitleFont">{String(index + 1).padStart(2, '0')}.</p>
                                <p className="subtitleFont">{item.title}</p>
                            </div>
                            <div className="col-lg-9 col-12">
                                <p
                                    className="collapsible normalFont pt-4 text-exp"
                                    onClick={() => toggle(item.id)}
                                >
                                    {item.subtitle}
                                </p>
                                {openIndex === item.id && (
                                    <div className="content normalFont">
                                        {item.content.map((c, i) => (
                                            <p className="text-exp" key={i}>{c}</p>
                                        ))}
                                    </div>
                                )}

                                <p className="normalFont">Tech Stack : </p>
                                <div className="d-flex flex-row flex-wrap">
                                    {item.tech.map((tech, i) => (
                                        <motion.span
                                            key={i}
                                            className="bubbleData normalFont mx-2 my-1"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.5 }}
                                            transition={{ delay: i * 0.3, duration: 0.3 }}
                                        >
                                            {tech}
                                        </motion.span>
                                    ))}
                                </div>


                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
