import { Link } from "react-router-dom";

import { useState } from "react";

const services = [

  "CAD Modeling",
  "Product Design",
  "3D Visualization",
  "Rapid Prototyping",
  "STL Repair",
  "Reverse Engineering",
  "3D Printer Maintenance",
  "Printer Calibration",

];

const Designer = () => {

  const [selectedImage, setSelectedImage] =
    useState(null);

  return (

    <main className="section-background min-h-screen pt-40 pb-32 px-6 relative overflow-hidden">

      {/* BACKGROUND */}

      <div className="section-glow" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HERO */}

        <div className="text-center max-w-5xl mx-auto">

          <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

            DESIGN SERVICES

          </p>

          <h1 className="text-6xl lg:text-7xl font-black mt-6 leading-[0.95]">

            Need A
            <span className="text-violet-400">

              {" "}Designer?

            </span>

          </h1>

          <p className="soft-text text-xl leading-relaxed mt-10">

            From concept development to functional prototypes, INITY 3D provides professional design and additive manufacturing services for creators, startups and institutions.

          </p>

          {/* CTA */}

          <div className="mt-14">

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

              Start Your Design Project

            </Link>

          </div>

        </div>

        {/* SERVICES */}

        <div className="mt-32">

          <div className="text-center max-w-3xl mx-auto">

            <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

              WHAT WE OFFER

            </p>

            <h2 className="text-5xl font-black mt-6">

              Design & Engineering Services

            </h2>

            <p className="soft-text text-lg leading-relaxed mt-8">

              Professional 3D design, prototyping and technical support services for creators, businesses and institutions.

            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">

            {services.map((service) => (

              <div
                key={service}
                className="
                group
                relative
                glass-card
                rounded-[32px]
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

                <h3 className="relative z-10 text-2xl font-bold">

                  {service}

                </h3>

              </div>

            ))}

          </div>

        </div>

        {/* SHOWCASE */}

        <div className="mt-40">

          <div className="text-center max-w-4xl mx-auto">

            <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

              PORTFOLIO

            </p>

            <h2 className="text-5xl lg:text-6xl font-black mt-6">

              Previous Design Work

            </h2>

            <p className="soft-text text-lg leading-relaxed mt-8">

              A selection of prototypes, product concepts and additive manufacturing projects developed by INITY 3D.

            </p>

          </div>

          {/* PROJECT GRID */}

          <div className="grid md:grid-cols-3 gap-8 mt-20">

            {[1,2,3,4,5,6].map((item) => (

              <button
                key={item}
                onClick={() =>
                  setSelectedImage(
                    `/images/${item}.png`
                  )
                }
                className="
                group
                relative
                glass-card
                rounded-[36px]
                overflow-hidden
                transition-all
                duration-700
                hover:-translate-y-3
                hover:border-violet-500/30
                text-left
                "
              >

                {/* IMAGE */}

                <div className="overflow-hidden">

                  <img
                    src={`/images/${item}.png`}
                    alt="Design Project"
                    className="
                    w-full
                    h-[340px]
                    object-cover
                    transition-all
                    duration-700
                    group-hover:scale-110
                    "
                  />

                </div>

                {/* OVERLAY */}

                <div
                  className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/70
                  via-transparent
                  to-transparent
                  opacity-0
                  group-hover:opacity-100
                  transition-all
                  duration-500
                  "
                />

                {/* TEXT */}

                <div
                  className="
                  absolute
                  bottom-0
                  left-0
                  p-8
                  opacity-0
                  group-hover:opacity-100
                  transition-all
                  duration-500
                  "
                >

                  <h3 className="text-2xl font-black">

                    Design Project

                  </h3>

                  <p className="text-white/70 mt-2">

                    Click To Expand

                  </p>

                </div>

              </button>

            ))}

          </div>

        </div>

        {/* FINAL CTA */}

        <div className="mt-40">

          <div
            className="
            relative
            overflow-hidden
            rounded-[42px]
            border
            border-white/10
            glass-card
            p-14
            text-center
            "
          >

            {/* GLOW */}

            <div
              className="
              absolute
              inset-0
              bg-violet-500/10
              blur-3xl
              "
            />

            <div className="relative z-10">

              <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

                START A PROJECT

              </p>

              <h2 className="text-5xl lg:text-6xl font-black mt-6 leading-tight">

                Let's Turn Your
                <br />

                Ideas Into Reality

              </h2>

              <p className="soft-text text-xl leading-relaxed mt-8 max-w-3xl mx-auto">

                Whether you need product development, CAD modeling, prototyping or technical support, INITY 3D is ready to help build your next project.

              </p>

              <div className="mt-12">

                <Link
                  to="/contact"
                  className="
                  primary-button
                  inline-flex
                  items-center
                  justify-center
                  px-12
                  py-5
                  rounded-2xl
                  text-lg
                  font-semibold
                  "
                >

                  Contact INITY 3D

                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* IMAGE MODAL */}

      {selectedImage && (

        <div
          className="
          fixed
          inset-0
          z-[999]
          bg-black/90
          backdrop-blur-xl
          flex
          items-center
          justify-center
          p-6
          "
          onClick={() =>
            setSelectedImage(null)
          }
        >

          {/* IMAGE */}

          <img
            src={selectedImage}
            alt="Expanded Project"
            className="
            max-w-full
            max-h-full
            rounded-[32px]
            shadow-[0_0_120px_rgba(124,58,237,0.25)]
            "
          />

          {/* CLOSE BUTTON */}

          <button
            className="
            absolute
            top-8
            right-8
            w-14
            h-14
            rounded-full
            bg-white/10
            border
            border-white/10
            text-white
            text-2xl
            hover:bg-white/20
            transition-all
            "
          >

            ×

          </button>

        </div>

      )}

    </main>

  );

};

export default Designer;