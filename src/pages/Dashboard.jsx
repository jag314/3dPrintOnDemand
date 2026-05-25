import { Canvas } from "@react-three/fiber";
import DashboardModel from "../components/canvas/DashboardModel";
import {
  OrbitControls,
  Environment,
} from "@react-three/drei";

import RobotModel from "../components/canvas/HeroModel";

const Dashboard = () => {

  return (

    <section className="min-h-screen bg-[#050816] text-white px-6 lg:px-12 py-24">

      {/* HEADER */}

      <div className="max-w-7xl mx-auto">

        <div className="inline-flex items-center px-5 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8">

          Instant Manufacturing Quote

        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight max-w-4xl">

          Upload Your
          <span className="text-violet-500"> 3D File </span>

          <br />

          And Get Instant Pricing

        </h1>

        <p className="mt-8 text-lg text-white/70 leading-relaxed max-w-3xl">

          Drag and drop your STL, OBJ, STEP or GLTF file to instantly preview your model, calculate dimensions and receive manufacturing pricing in real time.

        </p>

        {/* UPLOAD AREA */}

        <div className="mt-14 border border-violet-500/20 rounded-[32px] bg-[#0b0b1d] p-16 text-center hover:border-violet-500/40 transition">

          <div className="w-24 h-24 mx-auto rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-400 text-5xl">

            ↑

          </div>

          <h3 className="mt-8 text-4xl font-bold">

            Drop your 3D files here

          </h3>

          <p className="mt-4 text-white/50 text-lg">

            Upload STL, OBJ, STEP or GLTF files and receive instant manufacturing pricing in real time.

          </p>

        </div>

        {/* DASHBOARD GRID */}

        <div className="mt-14 grid lg:grid-cols-3 gap-10 items-start">

          {/* LEFT SIDE */}

          <div className="lg:col-span-2 rounded-[32px] border border-white/10 bg-[#0b0b1d] p-8">

            <h2 className="text-5xl font-black">

              3D Preview

            </h2>

            <p className="mt-3 text-white/50 text-lg">

              Rotate, zoom and inspect your uploaded model.

            </p>

            {/* VIEWER */}

            <div className="mt-8 h-[700px] rounded-[32px] overflow-hidden bg-gradient-to-br from-[#12052b] to-[#090914] border border-violet-500/20 relative">

              {/* TOP BAR */}

              <div className="absolute top-6 left-6 z-10">

                <p className="text-white/40 uppercase tracking-[0.2em] text-sm">

                  3D Preview

                </p>

                <h3 className="text-4xl font-bold mt-2">

                  Interactive Viewer

                </h3>

              </div>

              {/* ZOOM BUTTONS */}

              <div className="absolute top-6 right-6 z-10 flex gap-4">

                <button className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-3xl">

                  +

                </button>

                <button className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-3xl">

                  −

                </button>

              </div>

              {/* CANVAS */}

              <Canvas
                camera={{
                  position: [0, 0, 7],
                  fov: 35,
                }}
              >

                <ambientLight intensity={1.5} />

                <directionalLight
                  position={[5, 5, 5]}
                  intensity={2}
                />

                <Environment preset="city" />

                <OrbitControls
                  enablePan={false}
                  autoRotate
                  autoRotateSpeed={1}
                />

                <RobotModel />

              </Canvas>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="rounded-[32px] border border-white/10 bg-[#0b0b1d] p-10 sticky top-10">

            <p className="text-violet-300 uppercase tracking-[0.2em] text-sm">

              Summary

            </p>

            <h2 className="mt-4 text-6xl font-black">

              Instant Quote

            </h2>

            {/* INFO */}

            <div className="mt-10 space-y-8 text-xl">

              <div className="flex justify-between">

                <span className="text-white/60">
                  Material
                </span>

                <span className="font-semibold">
                  PETG
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-white/60">
                  Layer Height
                </span>

                <span className="font-semibold">
                  0.2 mm
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-white/60">
                  Estimated Time
                </span>

                <span className="font-semibold">
                  14h
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-white/60">
                  Volume
                </span>

                <span className="font-semibold">
                  124 cm³
                </span>

              </div>

            </div>

            <div className="my-10 h-px bg-white/10" />

            {/* PRICE */}

            <div className="flex items-center justify-between">

              <div>

                <p className="text-white/40 text-lg">

                  Total Price

                </p>

                <h3 className="text-7xl font-black mt-3">

                  ₡12,500

                </h3>

              </div>

              <div className="px-5 py-3 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">

                Ready

              </div>

            </div>

            {/* BUTTON */}

            <button className="w-full mt-10 bg-violet-600 hover:bg-violet-500 transition rounded-2xl py-6 text-2xl font-bold">

              Continue to Checkout

            </button>

            {/* DELIVERY */}

            <div className="mt-10 text-center">

              <p className="text-white/40">

                Estimated delivery between

              </p>

              <p className="mt-2 text-xl font-semibold">

                May 28 — May 31

              </p>

            </div>

          </div>

        </div>

      </div>

    </section>

  );
};

export default Dashboard;