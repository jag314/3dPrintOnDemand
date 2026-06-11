import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import ComputersCanvas from "./canvas/Computers";
import Stats from "./Stats";

const Hero = () => {
  const navigate          = useNavigate();
  const location          = useLocation();
  const [dragging, setDragging] = useState(false);
  const inputRef          = useRef();

  useEffect(() => {
    if (location.hash === "#upload-hero") {
      document.getElementById("upload-hero")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  const handleFile = (f) => {
    if (f) navigate("/quote", { state: { file: f } });
  };

  return (

    <section id="upload-hero" className="relative w-full min-h-screen overflow-hidden pt-32 lg:pt-40">

      {/* BACKGROUND — fixed so it never moves on scroll */}

      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] pointer-events-none" />

      {/* GRID */}

      <div className="grid-background" />

      {/* BIG GLOW — fixed so it stays put while user scrolls */}

      <div className="fixed top-[-200px] right-[-200px] w-[900px] h-[900px] bg-violet-600/[0.18] blur-[180px] rounded-full -z-10 pointer-events-none" />

      {/* EXTRA ATMOSPHERE — fixed */}

      <div className="fixed top-0 right-0 w-[900px] h-[900px] bg-violet-500/[0.08] blur-[180px] rounded-full -z-10 pointer-events-none" />

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

            <button className="glass-card hover-card px-10 py-5 rounded-2xl text-lg">

              Explore Materials

            </button>

          </div>

          {/* UPLOAD ZONE */}

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            className={`mt-8 border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all flex items-center gap-4 ${
              dragging
                ? "border-violet-500/70 bg-violet-500/10"
                : "border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/70"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".stl,.obj,.3mf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {dragging ? "Soltá el archivo aquí" : "Subí tu archivo STL, OBJ o 3MF"}
              </p>
              <p className="text-white/40 text-xs mt-1">
                Drag & drop o click para seleccionar · Cotización instantánea
              </p>
            </div>
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
            overflow-visible
            transition-all
            duration-300
            bg-transparent
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
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
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
