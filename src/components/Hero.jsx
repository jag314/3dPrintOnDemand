import { Link } from "react-router-dom";

import ComputersCanvas from "./canvas/Computers";

import Stats from "./Stats";

const Hero = () => {

  return (

    <section className="relative w-full min-h-screen overflow-hidden pt-32 lg:pt-40">

      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b]" />

      {/* GRID */}

      <div className="grid-background" />

      {/* BIG GLOW */}

      <div className="hero-glow" />

      {/* EXTRA ATMOSPHERE */}

      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-violet-500/10 blur-[180px] rounded-full" />

      {/* CONTENT */}

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">

        {/* LEFT */}

        <div className="pb-20 lg:pb-0">

          {/* BADGE */}

          <div className="inline-flex items-center px-6 py-3 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-200 backdrop-blur-xl mb-10">

            Professional Additive Manufacturing Platform

          </div>

          {/* TITLE */}

          <h1 className="premium-heading text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.92]">

            Professional
            <br />

            <span className="text-violet-400">

              3D Printing

            </span>

            <br />

            Costa Rica

          </h1>

          {/* DESCRIPTION */}

          <p className="soft-text text-lg sm:text-xl leading-relaxed mt-10 max-w-xl">

            Upload STL, OBJ or STEP files and receive instant manufacturing quotes, premium materials and professional 3D printing services in Costa Rica.

          </p>

          {/* BUTTONS */}

          <div className="flex flex-wrap gap-5 mt-12">

            <Link
              to="/quote"
              className="primary-button px-10 py-5 rounded-2xl font-semibold text-lg"
            >

              Upload Model

            </Link>

            <button
              className="glass-card hover-card px-10 py-5 rounded-2xl text-lg"
            >

              Explore Materials

            </button>

          </div>

          {/* STATS */}

          <Stats />

        </div>

        {/* RIGHT */}

        <div className="relative flex justify-center">

          {/* MODEL AREA */}

          <div
            className="
            group
            relative
            w-full
            max-w-[650px]
            h-[650px]
            rounded-[42px]
            overflow-hidden
            transition-all
            duration-700
            bg-white/[0.02]
            hover:bg-white/[0.04]
            "
          >

            {/* HOVER BORDER */}

            <div
              className="
              absolute
              inset-0
              rounded-[42px]
              border
              border-transparent
              group-hover:border-white/10
              transition-all
              duration-700
              "
            />

            {/* INNER LIGHT */}

            <div
              className="
              absolute
              inset-0
              bg-gradient-to-br
              from-violet-500/[0.03]
              to-transparent
              opacity-60
              group-hover:opacity-100
              transition-all
              duration-700
              "
            />

            {/* HOVER GLOW */}

            <div
              className="
              absolute
              inset-0
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-700
              shadow-[0_0_120px_rgba(124,58,237,0.18)]
              rounded-[42px]
              "
            />

            {/* MODEL */}

            <ComputersCanvas />

          </div>

        </div>

      </div>

    </section>

  );

};

export default Hero;