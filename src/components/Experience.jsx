export default function Experience() {

    var coll = document.getElementsByClassName("collapsible");
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }

    return (
        <section class="experienceSection flex-col-wise my-5 py-5">
            <div class="container d-flex flex-column justify-content-center">
                <div>
                    <h2 class="text-white text-left display-5 text-uppercase">My Experience</h2>
                </div>
                <div class="experience ">
                    <div class="experienceCard row">
                        <div class="col-lg-3 col-12">
                            <p class="subtitleFont">01.</p>
                            <p class="subtitleFont">Aulab "Hackademy 161"</p>
                        </div>
                        <div class="col-lg-9 col-12">
                            <p class="collapsible normalFont pt-4"> During my time at Aulab's "Hackademy 161", I transitioned from being a self-taught frontend enthusiast with over 10 years of experience in design and Photoshop to becoming a fully capable full-stack web developer.</p>
                            <div class="content  normalFont">
                                <p>
                                    I enrolled in Aulab to gain professional structure and practical training. The intensive bootcamp gave me the opportunity to work on real-world projects, strengthen my backend skills with PHP and Laravel, and solidify my understanding of databases, authentication systems, and RESTful APIs. I developed a full web application with a complete authentication flow, integrated AI APIs, Google Vision, and Stripe payments. I also practiced version control with Git and worked in team-based environments using Agile methodologies.
                                </p>
                                <p>
                                    The course was a transformative experience that challenged me daily and ultimately helped me build a solid foundation in modern web development, including both frontend and backend technologies.
                                </p>
                            </div>

                            <p class="normalFont">Tech Stack : </p>
                            <div class="d-flex flex-row flex-wrap">
                                <span class="bubbleData normalFont mx-2 my-1">HTML</span>
                                <span class="bubbleData normalFont mx-2 my-1">CSS</span>
                                <span class="bubbleData normalFont mx-2  my-1">Bootstrap</span>
                                <span class="bubbleData normalFont mx-2  my-1">Tailwind</span>
                                <span class="bubbleData normalFont mx-2  my-1">Javascript</span>
                                <span class="bubbleData normalFont mx-2  my-1">React</span>
                                <span class="bubbleData normalFont mx-2  my-1">Laravel</span>
                                <span class="bubbleData normalFont mx-2  my-1">MySQL</span>
                                <span class="bubbleData normalFont mx-2  my-1">API</span>
                                <span class="bubbleData normalFont mx-2  my-1">GitHub</span>
                            </div>


                        </div>
                    </div>

                    <div class="experienceCard row mt-4">
                        <div class="col-lg-3 col-12">
                            <p class="subtitleFont">02.</p>
                            <p class="subtitleFont">FiveM Servers</p>
                        </div>
                        <div class="col-lg-9 col-12">
                            <p class="collapsible normalFont pt-4">  At FiveM, I worked as a developer for a FiveM Roleplay servers, focusing on scripting, system integration, and server-side management.</p>
                            <div class="content  normalFont">
                                <p>
                                    I was responsible for customizing and integrating advanced scripts, including the OX Suite (like `ox_inventory`, `ox_lib`, and `ox_target`). I learned to troubleshoot and fix bugs across both client-side and server-side logic, developed custom items, jobs, and interactions, and gained hands-on experience in configuring a full RP server environment.
                                </p>
                                <p>
                                    Additionally, I managed key server resources, optimized performance, and coordinated the implementation of gameplay mechanics. I frequently edited Lua-based scripts, created customs configurations, and integrated external tools.
                                </p>
                            </div>
                            <p class="normalFont">Tech Stack : </p>
                            <div class="d-flex flex-row flex-wrap">
                                <span class="bubbleData normalFont mx-2 my-1">Lua</span>
                                <span class="bubbleData normalFont mx-2 my-1">React</span>
                                <span class="bubbleData normalFont mx-2 my-1">Mantine</span>
                                <span class="bubbleData normalFont mx-2 my-1">Angular</span>
                                <span class="bubbleData normalFont mx-2 my-1">Postgre SQL</span>
                                <span class="bubbleData normalFont mx-2 my-1">Node JS</span>
                            </div>

                        </div>
                    </div>

                    <div class="experienceCard row mt-4">
                        <div class="col-lg-3">
                            <p class="subtitleFont">03.</p>
                            <p class="subtitleFont">Aulab "UX-UI"</p>
                        </div>
                        <div class="col-lg-9 col-12">
                            <p class="collapsible normalFont pt-4">Coming soon..</p>
                            <div class="content  normalFont">
                                <p>Lorem ipsum dolor sit amet, cLorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt quas
                                    veritatis
                                    quia cupiditate officia cum doloribus iusto voluptatum ipsam dicta, asperiores corporis facere placeat
                                    eligendi vitae ad ullam est exercitationem optio quo alias. Iusto.Lorem ipsum dolor sit amet consectetur
                                    adipisicing elit. Quam minus consequuntur maxime assumenda laboriosam. At minus nostrum excepturi nemo.
                                    Officiis iste excepturi totam.onsectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
                                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat.</p>
                            </div>
                            <p class="normalFont">Tech Stack : </p>
                            <div class="d-flex flex-row flex-wrap">
                                <span class="bubbleData normalFont mx-2 my-1">Figma</span>
                                <span class="bubbleData normalFont mx-2 my-1">Adobe Color</span>
                                <span class="bubbleData normalFont mx-2 my-1">Photoshop</span>
                                <span class="bubbleData normalFont mx-2 my-1">Gimp</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>


        </section>
    );
}