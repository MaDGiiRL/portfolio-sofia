import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const skills = [
    { id: 1, name: 'Front-End 🎨', key: 'frontend' },
    { id: 2, name: 'Back-End 🚀', key: 'backend' },
    { id: 3, name: 'Web Design ✨', key: 'webdesign' },
];

export default function AnimatedSkills() {
    const [activeSkill, setActiveSkill] = useState(skills[0]);
    const { t } = useTranslation();

    return (
        <section className="flex-col-wise p-5 d-md-block d-lg-block d-none" id="passions">
            <div className="container bg-custom">
                <div className="row p-0 m-0">
                    {/* Skill List */}
                    <div className="skillsContainer text-center col-lg-6 col-12">
                        <div className="row">
                            {skills.map((skill) => (
                                <div className="col-12 py-1" key={skill.id}>
                                    <p
                                        className={`skillpara fs-1 text-uppercase ${activeSkill.id === skill.id ? 'active' : ''}`}
                                        data-content={skill.name}
                                        onClick={() => setActiveSkill(skill)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {skill.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skill Description */}
                    <div className="skillsDiscription col-lg-6 col-12">
                        <div className="main-content active p-2" id="mainContent">
                            <h3 className="text-uppercase">{activeSkill.name}</h3>
                            <p className="normalFont text-justify">{t(activeSkill.key)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
