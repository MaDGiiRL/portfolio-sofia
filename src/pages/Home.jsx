import { useEffect } from "react";
import { motion } from "framer-motion";
import Marquee from "../components/Marquee";
import Summary from "../components/Summary";
import Experience from "../components/Experience";
import AnimatedSkills from "../components/AnimatedSkills";
import ContactForm from "../components/ContactForm";
import Skills from "../components/Skills";
import { useTranslation } from "react-i18next";
import DiscordBanner from "../components/DiscordBanner";
import SubscribeForm from "../components/SubscribeForm";
import LatestProjects from "../components/LatestProjects";
import LatestBlogPosts from "../components/LatestBlogPosts";

export default function Home() {
  const { t } = useTranslation();

  useEffect(() => {
    //! Gradient
    const heroSection = document.querySelector(".heroSection");
    const heroTitle = document.querySelector(".herotitle");
    const isMobile = window.innerWidth < 600;

    const config = {
      div: {
        radius: 5,
        maxRadius: 29,
        speed: 0.3,
        opacity: 0,
        maxOpacity: 0.2,
        opacityStep: 0.05,
      },
      text: {
        radius: isMobile ? 180 : 29,
        maxRadius: 49,
        speed: 0.2,
        opacity: isMobile ? 0.8 : 0.2,
        maxOpacity: 1,
        opacityStep: 0.1,
      },
    };

    const gradientPrefix =
      "radial-gradient(circle at top center, rgba(255, 255, 255,";
    const divGradientSuffix = "), rgba(0, 0, 0, 0.0)";
    const textGradientSuffix = "), rgba(255, 45, 163)";

    function animateGradientDiv() {
      const { div } = config;
      div.radius += div.speed;
      div.opacity = Math.min(div.opacity + div.opacityStep, div.maxOpacity);
      heroSection.style.background = `${gradientPrefix} ${div.opacity}${divGradientSuffix} ${div.radius}%)`;
      if (div.radius < div.maxRadius) {
        requestAnimationFrame(animateGradientDiv);
      } else {
        animateTextGradient();
      }
    }

    function animateTextGradient() {
      const { text } = config;
      text.radius += text.speed;
      text.opacity = Math.min(text.opacity + text.opacityStep, text.maxOpacity);
      Object.assign(heroTitle.style, {
        background: `${gradientPrefix} ${text.opacity}${textGradientSuffix} ${text.radius}%)`,
        webkitBackgroundClip: "text",
        webkitTextFillColor: "transparent",
      });
      if (text.radius < text.maxRadius) {
        requestAnimationFrame(animateTextGradient);
      }
    }

    animateGradientDiv();

    //! Stars
    const canvas = document.getElementById("dustCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    let mouseX = canvasWidth / 2;
    let mouseY = canvasHeight / 2;

    const MAX_PARTICLES = 100;
    const PARTICLE_SPEED = 0.0000001;
    const MAX_MOVE_SPEED = 0.5;
    const MIN_LIFE = 100;
    const MAX_LIFE = 200;
    const MIN_OPACITY = 0.3;
    const MAX_OPACITY = 0.8;
    const TWO_PI = Math.PI * 2;

    let isThrottled = false;
    const mouseHandler = (event) => {
      if (!isThrottled) {
        requestAnimationFrame(() => {
          mouseX = event.clientX;
          mouseY = event.clientY;
          isThrottled = false;
        });
        isThrottled = true;
      }
    };

    window.addEventListener("mousemove", mouseHandler);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = Math.random() * 2;
        this.xSpeed = (Math.random() - 0.5) * PARTICLE_SPEED;
        this.ySpeed = (Math.random() - 0.5) * PARTICLE_SPEED;
        this.opacity =
          Math.random() * (MAX_OPACITY - MIN_OPACITY) + MIN_OPACITY;
        this.life = Math.random() * (MAX_LIFE - MIN_LIFE) + MIN_LIFE;
      }
      update() {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0) {
          const factor = MAX_MOVE_SPEED / distance;
          this.x += dx * factor;
          this.y += dy * factor;
        }
        this.life--;
        this.x = (this.x + canvasWidth) % canvasWidth;
        this.y = (this.y + canvasHeight) % canvasHeight;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    const particlePool = new Array(MAX_PARTICLES);
    for (let i = 0; i < MAX_PARTICLES; i++) particlePool[i] = new Particle();

    let activeParticles = 0;
    function createParticle() {
      if (activeParticles < MAX_PARTICLES) {
        particlePool[activeParticles].reset();
        activeParticles++;
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      for (let i = activeParticles - 1; i >= 0; i--) {
        const particle = particlePool[i];
        particle.update();
        particle.draw();
        if (particle.life <= 0) {
          activeParticles--;
          if (i < activeParticles)
            particlePool[i] = particlePool[activeParticles];
        }
      }
      createParticle();
      requestAnimationFrame(animateParticles);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        canvasWidth = width;
        canvasHeight = height;
      }
    });
    resizeObserver.observe(canvas);
    animateParticles();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", mouseHandler);
      resizeObserver.disconnect();
    };
  }, []);
  // Variants Framer Motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };
  return (
    <>
      <section className="heroSection d-flex flex-column min-vh-50">
        <canvas id="dustCanvas" style={{ zIndex: 0 }}>
          {" "}
        </canvas>
        <div className="container-fluid d-flex flex-column">
          <div className="row">
            <motion.h1
              className="text-center herotitle"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
            >
              Mad's Portfolio
            </motion.h1>
            <motion.h2
              className="mt-5 text-center p-2 text-green-hero"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
            >
              Junior Web Developer
            </motion.h2>
            <motion.p
              className="underheader text-center p-2 lead text-white fs-1 pt-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
            >
              "{t("underheader")}"
            </motion.p>
          </div>
          <Marquee />
        </div>
      </section>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <Summary />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <AnimatedSkills />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <LatestProjects />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <Experience />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <DiscordBanner />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <Skills />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <LatestBlogPosts />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <ContactForm />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <SubscribeForm />
      </motion.div>
    </>
  );
}
