import {
  GraduationCap,
  Lightbulb,
  Wrench,
} from "lucide-react";

const PrinterIcon3D = ({ size = 38 }) => (
  <img
    src="/materials/3d-printer.png"
    alt="3D Printer"
    width={size}
    height={size}
    style={{ objectFit: "contain", filter: "invert(72%) sepia(40%) saturate(600%) hue-rotate(215deg) brightness(110%)" }}
  />
);

import { Link } from "react-router-dom";

const timeline = [

  {
    title: "Started With a Dream",
    description:
      "The journey began exploring additive manufacturing, prototyping and advanced 3D printing workflows.",
    icon: PrinterIcon3D,
  },

  {
    title: "Designing Real Client Projects",
    description:
      "Created custom 3D models, prototypes and manufacturing solutions for real-world applications.",
    icon: Lightbulb,
  },

  {
    title: "Teaching 3D Printing & Design",
    description:
      "Developed educational experiences for schools, universities, institutions and innovation events.",
    icon: GraduationCap,
  },

  {
    title: "Building INITY 3D",
    description:
      "A platform focused on additive manufacturing, engineering, education and innovation in Costa Rica.",
    icon: Wrench,
  },

];

const About = () => {

  return (

    <main className="section-background min-h-screen pt-40 pb-32 px-6 relative overflow-hidden">

      {/* BACKGROUND GLOW */}

      <div className="section-glow" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HERO */}

        <div className="grid lg:grid-cols-2 gap-24 items-center">

          {/* LEFT */}

          <div>

            <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

              ABOUT INITY 3D

            </p>

            <h1 className="text-6xl lg:text-7xl font-black leading-[0.92] mt-8">

              Building
              <br />

              Innovation
              <br />

              Through
              <span className="text-violet-400">

                {" "}3D Printing

              </span>

            </h1>

            <p className="soft-text text-xl leading-relaxed mt-12 max-w-2xl">

              INITY 3D was created from a passion for additive manufacturing,
              engineering, education and product development. What started with
              an Ender 3 Pro evolved into a platform focused on innovation,
              prototyping and educational impact across Costa Rica.

            </p>

           

            {/* CTA BUTTON */}

            <div className="mt-12">

              <Link
                to="/contact"
                className="
                primary-button
                inline-flex
                items-center
                justify-center
                px-10
                py-5
                rounded-2xl
                text-lg
                font-semibold
                "
              >

                Let's Work Together

              </Link>

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative flex justify-center">

            {/* OUTER GLOW */}

            <div
              className="
              absolute
              inset-0
              bg-violet-500/20
              blur-[120px]
              rounded-full
              scale-90
              "
            />

            {/* VIDEO CARD */}

            <div
              className="
              group
              relative
              z-10
              w-full
              max-w-[560px]
              aspect-square
              rounded-[42px]
              overflow-hidden
              border
              border-white/10

              bg-gradient-to-br
              from-[#161b35]
              via-[#1a1f3f]
              to-[#21184a]

              backdrop-blur-3xl

              transition-all
              duration-700
              hover:scale-[1.02]

              shadow-[0_0_120px_rgba(124,58,237,0.28)]

              flex
              items-center
              justify-center
              "
            >

              {/* INNER LIGHT */}

              <div
                className="
                absolute
                inset-0
                bg-gradient-to-br
                from-violet-500/10
                via-transparent
                to-fuchsia-500/10
                z-10
                pointer-events-none
                "
              />

              {/* VIDEO */}

              <video
                autoPlay
                muted
                loop
                playsInline
                controls
                className="
                relative
                z-20
                w-[92%]
                h-[92%]
                object-contain
                mix-blend-screen
                opacity-95
                transition-all
                duration-700
                group-hover:scale-105
                "
              >

                <source
                  src="/videos/Inity-blanco.mp4"
                  type="video/mp4"
                />

              </video>

            </div>

          </div>

        </div>

        {/* TIMELINE */}

        <div className="mt-40">

          <div className="text-center max-w-4xl mx-auto">

            <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

              OUR JOURNEY

            </p>

            <h2 className="text-6xl font-black mt-6 leading-tight">

              From Passion
              <br />

              To Platform

            </h2>

            <p className="soft-text text-lg mt-8 leading-relaxed">

              INITY 3D combines manufacturing, education and design into a modern platform focused on innovation and engineering.

            </p>

          </div>

          {/* GRID */}

          <div className="grid md:grid-cols-2 gap-10 mt-24">

            {timeline.map((item) => {

              const Icon =
                item.icon;

              return (

                <div
                  key={item.title}
                  className="
                  group
                  relative
                  glass-card
                  rounded-[36px]
                  p-10
                  overflow-hidden
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:border-violet-500/30
                  "
                >

                  {/* HOVER GLOW */}

                  <div
                    className="
                    absolute
                    inset-0
                    opacity-0
                    group-hover:opacity-100
                    transition-all
                    duration-700
                    bg-violet-500/5
                    blur-3xl
                    "
                  />

                  {/* ICON */}

                  <div
                    className="
                    relative
                    z-10
                    w-20
                    h-20
                    rounded-3xl
                    bg-violet-500/10
                    border
                    border-violet-500/20
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-500
                    group-hover:scale-110
                    "
                  >

                    <Icon
                      size={38}
                      className="text-violet-400"
                    />

                  </div>

                  {/* CONTENT */}

                  <div className="relative z-10">

                    <h3 className="text-3xl font-black mt-10">

                      {item.title}

                    </h3>

                    <p className="soft-text leading-relaxed mt-5 text-lg">

                      {item.description}

                    </p>

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </div>

    </main>

  );

};

export default About;