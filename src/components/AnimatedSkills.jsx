import { useState } from 'react';

const skills = [
    {
        id: 1,
        name: 'Front-End 🎨',
        body: "Since my teenage years, I've always been passionate about coding. I vividly remember the moment I discovered HTML tables, and from that point on, I couldn't stop exploring. The idea of creating something tangible using just a programming language fascinated me. This initial curiosity drove me to deepen my knowledge, and ever since, I have continuously learned and experimented, refining my skills at Aulab, where I truly grasped the potential of what programming can offer.",
    },
    {
        id: 2,
        name: 'Back-End 🚀',
        body: "Back-end development was initially an entirely new territory for me. Before joining Aulab, I had never explored this aspect of programming and it felt outside of my comfort zone. However, through dedication and determination, I managed to grasp the fundamentals and overcome the early challenges. Every day, I strive to learn something new, and my curiosity pushes me to constantly grow, embracing each challenge with enthusiasm.",
    },
    {
        id: 3,
        name: 'Web Design ✨',
        body: "Web design has always been an integral part of my journey. I have a natural passion for aesthetics and harmony, which is reflected in every project I undertake. I possess a strong sense of visual composition that I aim to convey through my work. I love using Photoshop as a key tool in my creative process, allowing me to bring my ideas to life. For me, design is just as essential as functionality, and I strive to balance both aspects in all my projects.",
    },
];

export default function AnimatedSkills() {
    const [activeSkill, setActiveSkill] = useState(skills[0]);

    return (
        <section className="flex-col-wise my-5">
            <div className="container my-5">
                <div className="row p-0 m-0">

                    {/* Skill List */}
                    <div className="skillsContainer text-center col-lg-6 col-12">
                        <div className="row">
                            {skills.map((skill) => (
                                <div className="col-12 py-1" key={skill.id}>
                                    <p
                                        className={`skillpara fs-1 text-uppercase ${activeSkill.id === skill.id ? 'active' : ''
                                            }`}
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
                            <p className="normalFont text-justify">{activeSkill.body}</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
