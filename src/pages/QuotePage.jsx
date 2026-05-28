import {
  useState,
  useMemo,
} from "react";

import {
  Bounds,
} from "@react-three/drei";

import UploadZone from "../components/upload/UploadZone";

import ViewerCanvas from "../components/upload/ViewerCanvas";

import ModelViewer from "../components/upload/ModelViewer";

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

      materialUsage: "0",

      complexity: "-",

    });

  // =========================
  // MATERIALS
  // =========================

  const materialNames =
    Object.keys(
      materials
    );

  const [selectedMaterial, setSelectedMaterial] =
    useState(
      materialNames[0]
    );

  const selectedColors =
    materials[
      selectedMaterial
    ]?.colors || [];

  const [selectedColor, setSelectedColor] =
    useState(
      selectedColors[0] || null
    );

  // =========================
  // WEIGHT
  // =========================

  const parsedWeight =
    parseFloat(
      modelStats.materialUsage
    ) || 0;

  // =========================
  // QUOTE ENGINE
  // =========================

  const pricing =
    useMemo(() => {

      const materialData =
        materials[
          selectedMaterial
        ];

      if (
        !materialData
      ) {

        return {

          materialCost: 0,
          supportCost: 0,
          machineCost: 0,
          electricityCost: 0,
          failureMargin: 0,
          total: 0,

        };

      }

      const materialCost =

        parsedWeight *

        materialData.pricePerGram;

      const supportWeight =
        parsedWeight * 0.18;

      const supportCost =

        supportWeight *

        materialData.pricePerGram;

      const estimatedHours =
        parsedWeight / 12;

      const machineCost =

        estimatedHours * 1800;

      const electricityCost =

        estimatedHours * 120;

      const failureMargin =

        (
          materialCost +
          supportCost +
          machineCost
        ) * 0.12;

      const total =
        Math.round(

          materialCost +
          supportCost +
          machineCost +
          electricityCost +
          failureMargin

        );

      return {

        materialCost,
        supportCost,
        machineCost,
        electricityCost,
        failureMargin,
        total,

      };

    }, [

      parsedWeight,
      selectedMaterial,
      materials,

    ]);

  return (

    <main
      className="
      section-background
      min-h-screen
      pt-36
      pb-24
      px-6
      overflow-hidden
      "
    >

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-16">

          <p
            className="
            uppercase
            tracking-[0.35em]
            text-violet-400
            text-sm
            "
          >

            INSTANT MANUFACTURING

          </p>

          <h1
            className="
            premium-heading
            text-6xl
            lg:text-7xl
            font-black
            mt-5
            leading-[0.92]
            "
          >

            Upload &
            <span className="text-violet-400">

              {" "}Analyze

            </span>

          </h1>

          <p
            className="
            soft-text
            text-xl
            mt-8
            max-w-3xl
            "
          >

            Upload STL or OBJ files and receive instant manufacturing analysis, material estimates and professional 3D printing quotes.

          </p>

        </div>

        {/* MAIN GRID */}

        <div
          className="
          grid
          lg:grid-cols-[1.35fr_0.65fr]
          gap-10
          items-start
          "
        >

          {/* LEFT SIDE */}

          <div
            className="
            relative
            glass-card
            rounded-[42px]
            overflow-hidden
            border
            border-white/10
            min-h-[820px]
            "
          >

            {/* LIVE ANALYSIS */}

            {file && (

              <div
                className="
                absolute
                top-8
                right-8
                z-30
                bg-black/70
                backdrop-blur-2xl
                border
                border-white/10
                rounded-3xl
                p-6
                w-[250px]
                "
              >

                <p className="text-white/40 text-xs uppercase tracking-[0.2em]">

                  LIVE ANALYSIS

                </p>

                <div className="mt-6 space-y-5">

                  <div className="flex justify-between gap-4">

                    <span className="text-white/40">

                      File

                    </span>

                    <span className="font-semibold text-right truncate max-w-[120px]">

                      {modelStats.fileName}

                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-white/40">

                      Weight

                    </span>

                    <span className="font-semibold">

                      {parsedWeight} g

                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-white/40">

                      Status

                    </span>

                    <span className="text-green-400 font-semibold">

                      Ready

                    </span>

                  </div>

                </div>

              </div>

            )}

            {/* VIEWER */}

            <div
              className="
              w-full
              h-[820px]
              relative
              "
            >

              {/* EMPTY STATE */}

              {!file && (

                <div
                  className="
                  absolute
                  inset-0
                  z-20
                  flex
                  items-center
                  justify-center
                  p-10
                  "
                >

                  <div
                    className="
                    w-full
                    max-w-2xl
                    "
                  >

                    <UploadZone
                      onFileUpload={
                        setFile
                      }
                    />

                  </div>

                </div>

              )}

              {/* FLOATING BUTTON */}

              {file && (

                <div
                  className="
                  absolute
                  top-8
                  left-8
                  z-30
                  "
                >

                  <UploadZone
                    onFileUpload={
                      setFile
                    }
                    compact
                  />

                </div>

              )}

              <ViewerCanvas>

                <Bounds
                  fit
                  clip
                  observe
                  margin={1.2}
                >

                  {file && (

                    <ModelViewer
  file={file}
  selectedColor={selectedColor}
  setModelStats={setModelStats}
  selectedMaterial={selectedMaterial}
  materials={materials}
/>

                  )}

                </Bounds>

              </ViewerCanvas>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div
            className="
            glass-card
            rounded-[42px]
            border
            border-white/10
            p-10
            sticky
            top-28
            "
          >

            {/* TITLE */}

            <p className="text-white/40 text-sm uppercase tracking-[0.2em]">

              SUMMARY

            </p>

            <h2
              className="
              text-6xl
              font-black
              leading-[0.9]
              mt-5
              "
            >

              Instant
              <br />

              Quote

            </h2>

            {/* MATERIALS */}

            <div className="mt-14">

              <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-6">

                SELECT MATERIAL

              </p>

              <div className="grid grid-cols-2 gap-5">

                {materialNames.map(
                  (
                    material
                  ) => (

                    <button
                      key={material}
                      onClick={() => {

                        setSelectedMaterial(
                          material
                        );

                        setSelectedColor(

                          materials[
                            material
                          ]?.colors?.[0] ||

                          null

                        );

                      }}

                      className={`
                      rounded-3xl
                      p-6
                      text-left
                      transition-all
                      duration-300

                      ${selectedMaterial === material

                        ? `
                          border
                          border-violet-500
                          bg-violet-500/10
                          shadow-[0_0_40px_rgba(139,92,246,0.12)]
                        `

                        : `
                          bg-white/[0.03]
                          border
                          border-white/10
                          hover:bg-white/[0.05]
                        `
                      }
                      `}
                    >

                      <h3 className="text-2xl font-black">

                        {material}

                      </h3>

                      <p className="text-white/40 mt-3">

                        ₡{materials[material].pricePerGram}/g

                      </p>

                    </button>

                  )
                )}

              </div>

            </div>

            {/* COLORS */}

            {file && selectedColors.length > 0 && (

              <div className="mt-14">

                <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-6">

                  SELECT COLOR

                </p>

                <div className="flex flex-wrap gap-5">

                  {selectedColors.map(
                    (
                      color
                    ) => (

                      <button

                        key={color.name}

                        onClick={() =>
                          setSelectedColor(
                            color
                          )
                        }

                        className={`
                        w-16
                        h-16
                        rounded-full
                        border-4
                        transition-all

                        ${selectedColor?.name === color.name

                          ? `
                            border-white
                            scale-110
                          `

                          : `
                            border-transparent
                          `
                        }
                        `}
                        style={{

                          background:
                            color.hex,

                        }}
                      />

                    )
                  )}

                </div>

              </div>

            )}

            {/* BREAKDOWN */}

            <div className="mt-16">

              <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-8">

                PRICE BREAKDOWN

              </p>

              <div className="space-y-6">

                <div className="flex justify-between text-lg">

                  <span className="text-white/60">

                    Material Cost

                  </span>

                  <span>

                    ₡{pricing.materialCost.toFixed(0)}

                  </span>

                </div>

                <div className="flex justify-between text-lg">

                  <span className="text-white/60">

                    Support Material

                  </span>

                  <span>

                    ₡{pricing.supportCost.toFixed(0)}

                  </span>

                </div>

                <div className="flex justify-between text-lg">

                  <span className="text-white/60">

                    Machine Usage

                  </span>

                  <span>

                    ₡{pricing.machineCost.toFixed(0)}

                  </span>

                </div>

                <div className="flex justify-between text-lg">

                  <span className="text-white/60">

                    Electricity

                  </span>

                  <span>

                    ₡{pricing.electricityCost.toFixed(0)}

                  </span>

                </div>

                <div className="flex justify-between text-lg">

                  <span className="text-white/60">

                    Failure Margin

                  </span>

                  <span>

                    ₡{pricing.failureMargin.toFixed(0)}

                  </span>

                </div>

              </div>

            </div>

            {/* TOTAL */}

            <div
              className="
              mt-14
              border-t
              border-white/10
              pt-10
              "
            >

              <p className="text-white/40 uppercase tracking-[0.2em] text-sm">

                Estimated Manufacturing Cost

              </p>

              <h3
                className="
                text-6xl
                font-black
                text-violet-400
                mt-5
                "
              >

                ₡{pricing.total}

              </h3>

              <button
                className="
                mt-10
                w-full
                primary-button
                py-5
                rounded-3xl
                text-xl
                font-bold
                "
              >

                Proceed To Checkout

              </button>

            </div>

          </div>

        </div>

      </div>

    </main>

  );

};

export default QuotePage;