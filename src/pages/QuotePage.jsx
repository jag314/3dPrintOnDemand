import { useState } from "react";

import UploadZone from "../components/upload/UploadZone";
import ViewerCanvas from "../components/upload/ViewerCanvas";

const QuotePage = () => {

  const [uploadedFile, setUploadedFile] =
    useState(null);

  const [selectedMaterial, setSelectedMaterial] =
    useState("PLA");

  const [modelStats, setModelStats] =
    useState({});

  return (

    <main className="min-h-screen bg-[#050816] text-white px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div>

          <h1 className="text-5xl md:text-7xl font-black leading-[0.9]">

            Upload Your
            <span className="text-violet-500">
              {" "}3D File
            </span>

          </h1>

          <p className="mt-6 text-white/60 text-lg max-w-2xl">

            Upload STL, GLTF or GLB files and instantly preview your object.

          </p>

        </div>

        {/* UPLOAD ZONE */}

        <div className="mt-12">

          <UploadZone
            onFileUpload={setUploadedFile}
          />

        </div>

        {/* MAIN GRID */}

        <div className="mt-12 grid lg:grid-cols-[2fr_1fr] gap-8">

          {/* ========================= */}
          {/* VIEWER */}
          {/* ========================= */}

          <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-black/30 min-h-[700px]">

            {/* LIVE ANALYSIS */}

            <div className="absolute top-5 right-5 z-20 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl p-5 w-[240px]">

              <div className="text-xs tracking-[0.2em] uppercase text-white/60 mb-4">

                Live Analysis

              </div>

              <div className="space-y-4">

                {/* FILE */}

                <div className="flex justify-between gap-3">

                  <span className="text-white/50">

                    File

                  </span>

                  <span className="font-semibold truncate max-w-[130px] text-right">

                    {modelStats.fileName || "-"}

                  </span>

                </div>

                {/* WEIGHT */}

                <div className="flex justify-between">

                  <span className="text-white/50">

                    Weight

                  </span>

                  <span className="font-semibold">

                    {modelStats.weight || "-"}

                  </span>

                </div>

                {/* STATUS */}

                <div className="flex justify-between">

                  <span className="text-white/50">

                    Status

                  </span>

                  <span
                    className={`font-semibold ${
                      uploadedFile
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >

                    {uploadedFile
                      ? "Ready"
                      : "Waiting"}

                  </span>

                </div>

              </div>

            </div>

            {/* VIEWER */}

            <ViewerCanvas
              file={uploadedFile}
              setModelStats={setModelStats}
              selectedMaterial={selectedMaterial}
            />

          </div>

          {/* ========================= */}
          {/* QUOTE PANEL */}
          {/* ========================= */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

            {/* LABEL */}

            <div className="text-xs tracking-[0.25em] text-violet-300 uppercase mb-4">

              Summary

            </div>

            {/* TITLE */}

            <h2 className="text-5xl font-black leading-none">

              Instant
              <br />
              Quote

            </h2>

            {/* ========================= */}
            {/* MATERIALS */}
            {/* ========================= */}

            <div className="mt-10">

              <div className="text-white/60 mb-4">

                Select Material

              </div>

              <div className="grid grid-cols-2 gap-3">

                {[
                  {
                    name: "PLA",
                    description: "Fast & affordable",
                  },

                  {
                    name: "PETG",
                    description: "Durable & heat resistant",
                  },

                  {
                    name: "ABS",
                    description: "Industrial strength",
                  },

                  {
                    name: "Resin",
                    description: "Ultra detail",
                  },

                ].map((material) => (

                  <button
                    key={material.name}
                    onClick={() =>
                      setSelectedMaterial(material.name)
                    }
                    className={`rounded-2xl p-4 text-left transition border

                    ${
                      selectedMaterial === material.name

                        ? "bg-violet-600 border-violet-500"

                        : "border-white/10 hover:border-violet-500/40 hover:bg-white/[0.03]"
                    }
                    
                    `}
                  >

                    <div className="font-bold">

                      {material.name}

                    </div>

                    <div className="text-sm text-white/70 mt-1">

                      {material.description}

                    </div>

                  </button>

                ))}

              </div>

            </div>

            {/* ========================= */}
            {/* MODEL DATA */}
            {/* ========================= */}

            <div className="mt-10 space-y-6">

              {/* FILE */}

              <div className="flex justify-between gap-4">

                <span className="text-white/60">

                  File

                </span>

                <span className="truncate max-w-[180px] text-right">

                  {modelStats.fileName || "-"}

                </span>

              </div>

              {/* MATERIAL */}

              <div className="flex justify-between gap-4">

                <span className="text-white/60">

                  Material

                </span>

                <span>

                  {selectedMaterial}

                </span>

              </div>

              {/* WEIGHT */}

              <div className="flex justify-between gap-4">

                <span className="text-white/60">

                  Weight

                </span>

                <span>

                  {modelStats.weight || "-"}

                </span>

              </div>

              {/* DIMENSIONS */}

              <div className="flex justify-between gap-4">

                <span className="text-white/60">

                  Dimensions

                </span>

                <span className="text-right max-w-[180px]">

                  {modelStats.dimensions || "-"}

                </span>

              </div>

              {/*
<div className="flex justify-between gap-4">

  <span className="text-white/60">

    Print Time

  </span>

  <span>

    {modelStats.estimatedTime || "-"}

  </span>

</div>
*/}

              {/* COMPLEXITY */}

              <div className="flex justify-between gap-4">

                <span className="text-white/60">

                  Complexity

                </span>

                <span>

                  {modelStats.complexity || "-"}

                </span>

              </div>

            </div>

            {/* ========================= */}
            {/* PRICE */}
            {/* ========================= */}

            <div className="mt-12 border-t border-white/10 pt-8">

              <div className="text-white/50 mb-2">

                Estimated Price

              </div>

              <div className="text-6xl font-black">

                ₡12,500

              </div>

              <button className="w-full mt-8 bg-violet-600 hover:bg-violet-500 transition py-4 rounded-2xl font-semibold">

                Continue to Checkout

              </button>

            </div>

          </div>

        </div>

      </div>

    </main>

  );

};

export default QuotePage;