import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import HelmetCanvas from "./canvas/Computers";
import Stats from "./Stats";

const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (location.hash === "#upload-hero") {
      document.getElementById("upload-hero")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  const handleFile = (f) => {
    if (f) navigate("/quote", { state: { file: f } });
  };

  return (
    <section id="upload-hero" className="relative w-full min-h-screen overflow-x-clip pt-32 lg:pt-40">

      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] pointer-events-none" />
      <div className="grid-background" />
      <div className="fixed top-[-200px] right-[-200px] w-[900px] h-[900px] bg-violet-600/[0.18] blur-[180px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[900px] h-[900px] bg-violet-500/[0.08] blur-[180px] rounded-full -z-10 pointer-events-none" />

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative">

        {/* LEFT */}
        <div className="pb-20 lg:pb-0">

          <div className="inline-flex items-center px-6 py-3 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-200 backdrop-blur-xl mb-10">
            Professional Additive Manufacturing Platform
          </div>

          <h1 className="premium-heading text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.92]">
            Professional
            <br />
            <span className="text-violet-400">3D Printing</span>
            <br />
            Costa Rica
          </h1>

          <p className="soft-text text-lg sm:text-xl leading-relaxed mt-10 max-w-xl">
            Upload STL, OBJ or STEP files and receive instant manufacturing quotes, premium materials and professional 3D printing services in Costa Rica.
          </p>

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            className={`mt-12 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all flex items-center gap-5 ${dragging ? "border-violet-500/80 bg-violet-500/15" : "border-violet-500/60 bg-violet-500/10 hover:bg-violet-500/15 hover:border-violet-500/80"}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".stl,.obj,.3mf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="w-16 h-16 rounded-xl bg-violet-600/20 flex items-center justify-center flex-shrink-0">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-white text-base font-bold">
                {dragging ? "Soltá el archivo aquí" : "Subí tu archivo STL, OBJ o 3MF"}
              </p>
              <p className="text-violet-300/70 text-sm mt-1 font-medium">
                Obtené tu cotización en segundos
              </p>
              <p className="text-white/40 text-xs mt-1">
                Drag &amp; drop o click para seleccionar
              </p>
            </div>
          </div>

          <a href="#materials" className="text-white/40 hover:text-white/70 text-sm transition-colors mt-3 inline-block">
            Explorar materiales →
          </a>

          <Stats />

        </div>

        {/* RIGHT — 3D robot canvas */}
        <div className="relative">
          <div className="w-full" style={{ height: "600px", overflow: "visible" }}>
            <HelmetCanvas />
          </div>
        </div>

      </div>

    </section>
  );
};

export default Hero;