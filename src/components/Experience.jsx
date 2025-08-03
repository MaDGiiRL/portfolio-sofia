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
                            <p class="subtitleFont">Lorem Ipsum</p>
                        </div>
                        <div class="col-lg-9 col-12">
                            <p class="collapsible normalFont pt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
                                quas veritatis
                                quia cupiditate officia cum doloribus iusto voluptatum ipsam dicta, asperiores corporis facere placeat
                                eligendi vitae ad ullam est exe</p>
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
                                <span class="bubbleData normalFont mx-2 my-1">Html</span>
                                <span class="bubbleData normalFont mx-2 my-1">Css/Scss/Bootstrap</span>
                                <span class="bubbleData normalFont mx-2  my-1">Javascript</span>
                                <span class="bubbleData normalFont mx-2  my-1">React</span>
                                <span class="bubbleData normalFont mx-2  my-1">TypeScript</span>
                                <span class="bubbleData normalFont mx-2  my-1">Node Js</span>
                            </div>


                        </div>
                    </div>

                    <div class="experienceCard row mt-4">
                        <div class="col-lg-3 col-12">
                            <p class="subtitleFont">02.</p>
                            <p class="subtitleFont">Lorem Ipsum</p>
                        </div>
                        <div class="col-lg-9 col-12">
                            <p class="collapsible normalFont pt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
                                quas veritatis
                                quia cupiditate officia cum doloribus iusto voluptatum ipsam dicta, asperiores corporis facere placeat
                                eligendi vitae ad ullam est exe</p>
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
                                <span class="bubbleData normalFont mx-2 my-1 ">Html</span>
                                <span class="bubbleData normalFont mx-2 my-1">Css/Scss/Bootstrap</span>
                                <span class="bubbleData normalFont mx-2 my-1">Javascript</span>
                                <span class="bubbleData normalFont mx-2 my-1">React</span>
                                <span class="bubbleData normalFont mx-2 my-1">Node Js</span>
                            </div>

                        </div>
                    </div>

                    <div class="experienceCard row mt-4">
                        <div class="col-lg-3">
                            <p class="subtitleFont">03.</p>
                            <p class="subtitleFont">Lorem Ipsum</p>
                        </div>
                        <div class="col-lg-9 col-12">
                            <p class="collapsible normalFont pt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
                                quas veritatis
                                quia cupiditate officia cum doloribus iusto voluptatum ipsam dicta, asperiores corporis facere placeat
                                eligendi vitae ad ullam est exe</p>
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
                                <span class="bubbleData normalFont mx-2 my-1 ">Html</span>
                                <span class="bubbleData normalFont mx-2 my-1">Css/Scss/Bootstrap</span>
                                <span class="bubbleData normalFont mx-2 my-1">Javascript</span>
                                <span class="bubbleData normalFont mx-2 my-1">PHP</span>
                            </div>


                        </div>
                    </div>
                </div>
            </div>


        </section>
    );
}