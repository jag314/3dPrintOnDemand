import {
  useState,
  useEffect,
} from "react";

import UploadZone from "../components/upload/UploadZone";

import ViewerCanvas from "../components/upload/ViewerCanvas";

import ModelViewer from "../components/ModelViewer";

const QuotePage = ({
  materials,
}) => {

  // =========================
  // FILE
  // =========================

  const [file, setFile] =
    useState(null);

  // =========================
  // MODEL STATS
  // =========================

  const [modelStats, setModelStats] =
    useState({

      fileName: "-",

      dimensions: "-",

      materialUsage: "0 g",

      complexity: "-",

    });

  // =========================
  // MATERIAL
  // =========================

  const [selectedMaterial, setSelectedMaterial] =
    useState(

      Object.keys(materials)[0]

    );

  // =========================
  // COLOR
  // =========================

  const [selectedColor, setSelectedColor] =
    useState(null);

  // =========================
  // DEBUG
  // =========================

  useEffect(() => {

    console.log(
      "QUOTE PAGE FILE:",
      file
    );

  }, [file]);

  // =========================
  // AUTO SELECT FIRST COLOR
  // =========================

  useEffect(() => {

    const material =
      materials[
        selectedMaterial
      ];

    if (
      material?.colors?.length > 0
    ) {

      setSelectedColor(

        material.colors[0]

      );

    }

  }, [
    selectedMaterial,
    materials,
  ]);

  // =========================
  // WEIGHT
  // =========================

  const weight = parseFloat(

    modelStats.materialUsage

      ?.replace(" g", "") || 0

  );

  // =========================
  // PRICE
  // =========================

  const activePricePerGram =

    selectedColor?.useMaterialPrice

      ? materials[
          selectedMaterial
        ]?.pricePerGram || 0

      : selectedColor?.customPrice || 0;

  const totalPrice =
    weight *
    activePricePerGram;

  return (

    <main className="min-h-screen bg-[#050816] text-white pt-32 px-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-6xl font-black leading-none">

            Upload Your
            <span className="text-violet-500">

              {" "}3D File

            </span>

          </h1>

          <p className="text-white/50 mt-4">

            Upload STL, GLTF or GLB files and instantly preview your object.

          </p>

        </div>

        {/* UPLOAD */}

        <UploadZone

          onFileUpload={(uploadedFile) => {

            console.log(
              "SETTING FILE:",
              uploadedFile
            );

            setFile(
              uploadedFile
            );

           setModelStats({

  fileName:
    uploadedFile.name,

  dimensions:
    "-",

  materialUsage:
    "0 g",

  complexity:
    "-",

});

          }}

        />

        {/* MAIN GRID */}

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-10">

          {/* VIEWER */}

          <div className="relative rounded-3xl border border-white/10 bg-black/20 overflow-hidden h-[700px]">

            {/* LIVE ANALYSIS */}

            <div className="absolute top-6 right-6 z-10 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-5 w-[220px]">

              <p className="text-xs uppercase tracking-widest text-white/40">

                Live Analysis

              </p>

              <div className="mt-4 space-y-3 text-sm">

                {/* FILE */}

                <div className="flex justify-between">

                  <span className="text-white/40">

                    File

                  </span>

                  <span className="font-semibold text-right max-w-[120px] truncate">

                    {
                      modelStats.fileName
                    }

                  </span>

                </div>

                {/* WEIGHT */}

                <div className="flex justify-between">

                  <span className="text-white/40">

                    Weight

                  </span>

                  <span className="font-semibold">

                    {
                      modelStats.materialUsage
                    }

                  </span>

                </div>

                {/* STATUS */}

                <div className="flex justify-between">

                  <span className="text-white/40">

                    Status

                  </span>

                  <span
                    className={`font-semibold

                    ${file

                      ? "text-green-400"

                      : "text-yellow-400"

                    }`}
                  >

                    {file

                      ? "Ready"

                      : "Awaiting Upload"

                    }

                  </span>

                </div>

              </div>

            </div>

            {/* VIEWER */}

            <ViewerCanvas>

              <ModelViewer

                file={file}

                setModelStats={
                  setModelStats
                }

                selectedColor={
                  selectedColor
                }

              />

            </ViewerCanvas>

          </div>

          {/* SIDEBAR */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 h-fit sticky top-28">

            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">

              Summary

            </p>

            <h2 className="text-5xl font-black leading-none mt-4">

              Instant
              <br />
              Quote

            </h2>

            {/* MATERIALS */}

            <div className="mt-10">

              <h3 className="text-white/60 text-sm uppercase tracking-widest mb-4">

                Select Material

              </h3>

              <div className="grid grid-cols-2 gap-3">

                {Object.keys(
                  materials
                ).map(
                  (
                    materialName
                  ) => {

                    const material =
                      materials[
                        materialName
                      ];

                    const isSelected =
                      selectedMaterial ===
                      materialName;

                    return (

                      <button
                        key={
                          materialName
                        }
                        onClick={() =>
                          setSelectedMaterial(
                            materialName
                          )
                        }
                        className={`rounded-2xl border p-4 transition text-left

                        ${isSelected

                          ? "border-violet-500 bg-violet-500/10"

                          : "border-white/10 hover:border-violet-500/30"

                        }`}
                      >

                        <h4 className="font-bold text-lg">

                          {materialName}

                        </h4>

                        <p className="text-white/40 text-sm mt-1">

                          ₡
                          {
                            material.pricePerGram
                          }
                          /g

                        </p>

                      </button>

                    );

                  }
                )}

              </div>

            </div>

            {/* COLORS */}

            {materials[selectedMaterial]
              ?.colors?.length > 0 && (

              <div className="mt-8">

                <h3 className="text-white/60 text-sm uppercase tracking-widest mb-4">

                  Select Color

                </h3>

                <div className="grid grid-cols-2 gap-3">

                  {materials[
                    selectedMaterial
                  ].colors.map(
                    (
                      color,
                      index
                    ) => {

                      const isSelected =
                        selectedColor?.name ===
                        color.name;

                      return (

                        <button
                          key={index}
                          onClick={() =>
                            setSelectedColor(
                              color
                            )
                          }
                          className={`rounded-2xl border p-4 transition text-left

                          ${isSelected

                            ? "border-violet-500 bg-violet-500/10"

                            : "border-white/10 hover:border-violet-500/30"

                          }`}
                        >

                          <div className="flex items-center gap-3">

                            <div
                              className="w-6 h-6 rounded-full border border-white/20"
                              style={{
                                background:
                                  color.hex,
                              }}
                            />

                            <div>

                              <h4 className="font-semibold text-white">

                                {color.name}

                              </h4>

                              <p className="text-xs text-white/40">

                                {color.useMaterialPrice

                                  ? "Standard"

                                  : "Premium"

                                }

                              </p>

                            </div>

                          </div>

                        </button>

                      );

                    }
                  )}

                </div>

              </div>

            )}

            {/* DETAILS */}

            <div className="mt-10 space-y-5 text-sm">

              <div className="flex justify-between">

                <span className="text-white/40">

                  File

                </span>

                <span className="font-semibold">

                  {
                    modelStats.fileName
                  }

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-white/40">

                  Material

                </span>

                <span className="font-semibold">

                  {selectedMaterial}

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-white/40">

                  Color

                </span>

                <span className="font-semibold">

                  {selectedColor?.name ||
                    "-"}

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-white/40">

                  Weight

                </span>

                <span className="font-semibold">

                  {
                    modelStats.materialUsage
                  }

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-white/40">

                  Dimensions

                </span>

                <span className="font-semibold text-right">

                  {
                    modelStats.dimensions
                  }

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-white/40">

                  Complexity

                </span>

                <span className="font-semibold">

                  {
                    modelStats.complexity
                  }

                </span>

              </div>

            </div>

            {/* PRICE */}

            <div className="mt-10 pt-8 border-t border-white/10">

              <p className="text-white/40 text-sm">

                Estimated Price

              </p>

              <h3 className="text-6xl font-black mt-3">

                ₡
                {Math.round(
                  totalPrice
                ).toLocaleString()}

              </h3>

            </div>

            {/* BUTTON */}

            <button className="mt-8 w-full bg-violet-600 hover:bg-violet-500 transition rounded-2xl py-5 font-bold">

              Continue to Checkout

            </button>

          </div>

        </div>

      </div>

    </main>

  );

};

export default QuotePage;