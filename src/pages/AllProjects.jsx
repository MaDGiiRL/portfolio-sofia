import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import ProjectCard from "../components/ProjectCard";
import { motion } from "framer-motion";

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const AllProjects = () => {
    const { t } = useTranslation();

    const allProjects = [
        {
            id: 0,
            name: "MaD Portfolio",
            description: t('p1'),
            image: "https://i.imgur.com/bFr8uf7.png",
            stack: ["React", "Vite", "JS", "HTML", "CSS", "Bootstrap"],
            githubLink: "https://github.com/MaDGiiRL/portfolio-sofia",
            website: "https://madsportfolio.vercel.app",
        },
        {
            id: 1,
            name: "Melodies",
            description: t('p2'),
            image: "https://i.imgur.com/PNvwVGC.png",
            stack: ["Laravel", "MySQL", "Bootstrap", "JS", "HTML", "CSS", "API"],
            githubLink: "https://github.com/tuo-username/advita",
            website: "",
        },
        {
            id: 2,
            name: "Game Master",
            description: t('p3'),
            image: "https://i.imgur.com/ICFvyG3.png",
            stack: ["React", "Supabase", "Tailwind", "JS", "HTML", "CSS", "API"],
            githubLink: "https://github.com/MaDGiiRL/Game-Master-React",
            website: "https://game-master-react-q1gb.vercel.app",
        },
    ];


    return (
        <section className="pt-5" id="all-projects">
            <div className="container py-5">
                <div className="row header mb-5">
                    <div className="col-12 col-md-5 col-lg-5">
                        <h2 className="text-white text-left display-5 text-uppercase">
                            {t('projects')}
                        </h2></div>
                    <div className="col-12 col-md-5 col-lg-5 text-md-end text-lg-end">
                        <Link to="/" className="btn-login">
                            ← {t('form27')}
                        </Link>
                    </div>
                </div>



                <div className="row g-4">
                    {allProjects.map((project, index) => (
                        <motion.div
                            key={index}
                            className="col-12 col-md-6 col-lg-4"
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        >
                            <ProjectCard key={project.id} {...project} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AllProjects;
