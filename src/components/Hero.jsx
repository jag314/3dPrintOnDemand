import HeroCanvas from './canvas/HeroCanvas';

import { Link } from "react-router-dom";

const Hero = () => {

  return (

    <section className="relative w-full h-screen overflow-visible bg-black">

      {/* MAIN CONTAINER */}

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 h-full flex items-center overflow-visible">

        {/* ========================= */}
        {/* LEFT SIDE */}
        {/* ========================= */}

        <div className="relative z-30 max-w-xl">

          {/* BADGE */}

          <div className="inline-flex items-center px-5 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8">

            Professional 3D Printing in Costa Rica

          </div>

          {/* TITLE */}

          <h1 className="text-white font-black leading-[0.9] text-5xl md:text-6xl tracking-tight">

            Upload Your
            <span className="text-violet-500">

              {" "}3D Models{" "}

            </span>

            <br />

            And Get

            <br />

            Instant Quotes

          </h1>

          {/* DESCRIPTION */}

          <p className="mt-8 text-lg text-white/70 leading-relaxed max-w-lg">

            Upload STL, OBJ, STEP or GLTF files and receive instant manufacturing pricing in real time.

          </p>

          {/* BUTTONS */}

          <div className="relative z-50 mt-10 flex flex-wrap gap-4">

            <Link
              to="/quote"
              className="bg-violet-600 hover:bg-violet-500 transition px-8 py-4 rounded-2xl font-semibold text-white inline-flex items-center justify-center"
            >

              Upload Model

            </Link>

            <a
              href="#materials"
              className="border border-white/10 hover:border-violet-500/30 transition px-8 py-4 rounded-2xl text-white inline-flex items-center justify-center"
            >

              Explore Materials

            </a>

          </div>

        </div>

        {/* ========================= */}
        {/* 3D MODEL */}
        {/* ========================= */}

        <div className="absolute inset-0 z-20 overflow-visible pointer-events-none">

          {/* PURPLE GLOW */}

          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/20 blur-[140px] rounded-full" />

          {/* CANVAS */}

          <div className="absolute right-[-10%] top-[8%] w-[58vw] h-[80vh] overflow-visible pointer-events-auto">

            <HeroCanvas />

          </div>

        </div>

      </div>

    </section>

  );

};

export default Hero;