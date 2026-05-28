import { useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Palette,
  Crown,
} from "lucide-react";

const Dashboard = ({
  materials,
  setMaterials,
}) => {

  const [expandedMaterial, setExpandedMaterial] =
    useState(null);

  const [editingMaterial, setEditingMaterial] =
    useState(null);

  // =========================
  // NEW MATERIAL
  // =========================

  const [newMaterialName, setNewMaterialName] =
    useState("");

  const [newDensity, setNewDensity] =
    useState("");

  const [newPricePerGram, setNewPricePerGram] =
    useState("");

  // =========================
  // NEW COLOR
  // =========================

  const [customColorName, setCustomColorName] =
    useState("");

  const [customColorHex, setCustomColorHex] =
    useState("#a855f7");

  const [customColorPrice, setCustomColorPrice] =
    useState("");

  const [customColorPremium, setCustomColorPremium] =
    useState(false);

  // =========================
  // ADD MATERIAL
  // =========================

  const addMaterial = () => {

    if (!newMaterialName)
      return;

    setMaterials({

      ...materials,

      [newMaterialName]: {

        density:
          parseFloat(
            newDensity
          ) || 1.24,

        pricePerGram:
          parseFloat(
            newPricePerGram
          ) || 35,

        colors: [],

      },

    });

    setNewMaterialName("");
    setNewDensity("");
    setNewPricePerGram("");

  };

  // =========================
  // SAVE MATERIAL
  // =========================

  const saveMaterial = () => {

    localStorage.setItem(
      "materials",
      JSON.stringify(
        materials
      )
    );

    setEditingMaterial(
      null
    );

  };

  // =========================
  // ADD COLOR
  // =========================

  const addCustomColor = (
    materialName
  ) => {

    if (
      !customColorName
    )
      return;

    const updated =
      { ...materials };

    updated[
      materialName
    ].colors.push({

      name:
        customColorName,

      hex:
        customColorHex,

      premium:
        customColorPremium,

      hidden: false,

      useMaterialPrice:
        customColorPrice === "",

      customPrice:

        customColorPrice === ""

          ? updated[
              materialName
            ].pricePerGram

          : parseFloat(
              customColorPrice
            ),

    });

    setMaterials(
      updated
    );

    setCustomColorName("");
    setCustomColorHex(
      "#a855f7"
    );
    setCustomColorPrice("");
    setCustomColorPremium(
      false
    );

  };

  return (

    <main className="min-h-screen bg-[#050816] text-white pt-32 px-6">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}

        <div>

          <p className="uppercase tracking-[0.3em] text-violet-400 text-xs">

            Material Management

          </p>

          <h1 className="text-6xl font-black mt-3">

            Admin
            <span className="text-violet-500">

              {" "}Dashboard

            </span>

          </h1>

        </div>

        {/* =========================
        ADD MATERIAL
        ========================= */}

        <div className="rounded-3xl border border-white/10 glass-card p-8">

          <h2 className="text-4xl font-black mb-3">

            Add New Material

          </h2>

          <p className="text-white/40 mb-8">

            Create new printable material types for your quoting system.

          </p>

          <div className="grid lg:grid-cols-4 gap-5">

            {/* NAME */}

            <div>

              <label className="text-sm text-white/50 block mb-3">

                Material Name

              </label>

              <input
                value={newMaterialName}
                onChange={(e) =>
                  setNewMaterialName(
                    e.target.value
                  )
                }
                placeholder="Example: PLA CF"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5"
              />

            </div>

            {/* PRICE */}

            <div>

              <label className="text-sm text-white/50 block mb-3">

                Base Price Per Gram (₡)

              </label>

              <input
                type="number"
                value={newPricePerGram}
                onChange={(e) =>
                  setNewPricePerGram(
                    e.target.value
                  )
                }
                placeholder="35"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5"
              />

            </div>

            {/* DENSITY */}

            <div>

              <label className="text-sm text-white/50 block mb-3">

                Density (g/cm³)

              </label>

              <input
                type="number"
                value={newDensity}
                onChange={(e) =>
                  setNewDensity(
                    e.target.value
                  )
                }
                placeholder="1.24"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5"
              />

            </div>

            {/* BUTTON */}

            <button
              onClick={addMaterial}
              className="bg-violet-600 hover:bg-violet-500 transition rounded-2xl font-bold h-[64px] self-end"
            >

              Add Material

            </button>

          </div>

        </div>

        {/* =========================
        MATERIALS
        ========================= */}

        {Object.entries(
          materials
        ).map(
          ([
            materialName,
            material,
          ]) => {

            const expanded =
              expandedMaterial ===
              materialName;

            const isEditing =
              editingMaterial ===
              materialName;

            return (

              <div
                key={materialName}
                className="rounded-3xl border border-white/10 glass-card overflow-hidden"
              >

                {/* HEADER */}

                <div className="p-8 flex items-start justify-between gap-8">

                  <div className="flex-1 grid lg:grid-cols-3 gap-5">

                    {/* NAME */}

                    <div>

                      <label className="text-xs uppercase tracking-widest text-white/30 block mb-3">

                        Material Name

                      </label>

                      <input
                        disabled={!isEditing}
                        value={materialName}
                        onChange={(e) => {

                          const updated =
                            { ...materials };

                          updated[
                            e.target.value
                          ] =
                            updated[
                              materialName
                            ];

                          delete updated[
                            materialName
                          ];

                          setMaterials(
                            updated
                          );

                        }}
                        className={`w-full rounded-2xl px-5 py-5 text-3xl font-black transition

                        ${isEditing

                          ? "bg-black/30 border border-violet-500/40"

                          : "bg-black/20 border border-white/10"

                        }`}
                      />

                    </div>

                    {/* PRICE */}

                    <div>

                      <label className="text-xs uppercase tracking-widest text-white/30 block mb-3">

                        Base Price Per Gram (₡)

                      </label>

                      <input
                        type="number"
                        disabled={!isEditing}
                        value={
                          material.pricePerGram
                        }
                        onChange={(e) => {

                          const updated =
                            { ...materials };

                          updated[
                            materialName
                          ].pricePerGram =
                            parseFloat(
                              e.target.value
                            );

                          setMaterials(
                            updated
                          );

                        }}
                        className={`w-full rounded-2xl px-5 py-5 text-2xl font-bold transition

                        ${isEditing

                          ? "bg-black/30 border border-violet-500/40"

                          : "bg-black/20 border border-white/10"

                        }`}
                      />

                    </div>

                    {/* DENSITY */}

                    <div>

                      <label className="text-xs uppercase tracking-widest text-white/30 block mb-3">

                        Density (g/cm³)

                      </label>

                      <input
                        type="number"
                        disabled={!isEditing}
                        value={
                          material.density
                        }
                        onChange={(e) => {

                          const updated =
                            { ...materials };

                          updated[
                            materialName
                          ].density =
                            parseFloat(
                              e.target.value
                            );

                          setMaterials(
                            updated
                          );

                        }}
                        className={`w-full rounded-2xl px-5 py-5 text-2xl font-bold transition

                        ${isEditing

                          ? "bg-black/30 border border-violet-500/40"

                          : "bg-black/20 border border-white/10"

                        }`}
                      />

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-3">

                    {/* EDIT / SAVE */}

                    <button
                      onClick={() => {

                        if (
                          isEditing
                        ) {

                          saveMaterial();

                        } else {

                          setEditingMaterial(
                            materialName
                          );

                        }

                      }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition

                      ${isEditing

                        ? "bg-green-500/20 text-green-300"

                        : "bg-violet-500/10 text-violet-300"

                      }`}
                    >

                      {isEditing

                        ? <Save size={20} />

                        : <Pencil size={20} />

                      }

                    </button>

                    {/* EXPAND */}

                    <button
                      onClick={() =>
                        setExpandedMaterial(

                          expanded
                            ? null
                            : materialName
                        )
                      }
                      className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"
                    >

                      {expanded

                        ? <ChevronUp size={20} />

                        : <ChevronDown size={20} />

                      }

                    </button>

                  </div>

                </div>

                {/* =========================
                EXPANDED
                ========================= */}

                {expanded && (

                  <div className="px-8 pb-8 border-t border-white/10">

                    {/* ADD COLOR */}

                    <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-8">

                      <div className="flex items-center gap-3 mb-8">

                        <Palette className="text-violet-400" />

                        <h3 className="text-4xl font-black">

                          Add Color Variant

                        </h3>

                      </div>

                      <div className="grid lg:grid-cols-5 gap-5 items-end">

                        {/* NAME */}

                        <div>

                          <label className="text-sm text-white/50 block mb-3">

                            Color Name

                          </label>

                          <input
                            value={
                              customColorName
                            }
                            onChange={(e) =>
                              setCustomColorName(
                                e.target.value
                              )
                            }
                            placeholder="Example: Silk Gold"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5"
                          />

                        </div>

                        {/* COLOR */}

                        <div>

                          <label className="text-sm text-white/50 block mb-3">

                            Select Color

                          </label>

                          <div className="h-[64px] rounded-2xl border border-white/10 overflow-hidden">

                            <input
                              type="color"
                              value={
                                customColorHex
                              }
                              onChange={(e) =>
                                setCustomColorHex(
                                  e.target.value
                                )
                              }
                              className="w-full h-full cursor-pointer"
                            />

                          </div>

                        </div>

                        {/* PRICE */}

                        <div>

                          <label className="text-sm text-white/50 block mb-3">

                            Custom Price Override (₡)

                          </label>

                          <input
                            type="number"
                            value={
                              customColorPrice
                            }
                            onChange={(e) =>
                              setCustomColorPrice(
                                e.target.value
                              )
                            }
                            placeholder={`Default ₡${material.pricePerGram}`}
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5"
                          />

                        </div>

                        {/* PREMIUM TOGGLE */}

                        <div>

                          <label className="text-sm text-white/50 block mb-3">

                            Premium Material

                          </label>

                          <button
                            onClick={() =>
                              setCustomColorPremium(

                                !customColorPremium
                              )
                            }
                            className={`relative w-full h-[64px] rounded-2xl transition-all duration-300 border

                            ${customColorPremium

                              ? "bg-yellow-500/20 border-yellow-400/30"

                              : "bg-black/20 border-white/10"

                            }`}
                          >

                            <div
                              className={`absolute top-2 w-10 h-10 rounded-full bg-white transition-all duration-300 flex items-center justify-center

                              ${customColorPremium

                                ? "left-[calc(100%-48px)]"

                                : "left-2"

                              }`}
                            >

                              <Crown
                                size={16}
                                className={`

                                ${customColorPremium

                                  ? "text-yellow-500"

                                  : "text-gray-400"

                                }`}
                              />

                            </div>

                            <span className="text-sm font-bold tracking-wide">

                              {customColorPremium

                                ? "PREMIUM"

                                : "STANDARD"

                              }

                            </span>

                          </button>

                        </div>

                        {/* BUTTON */}

                        <button
                          onClick={() =>
                            addCustomColor(
                              materialName
                            )
                          }
                          className="bg-violet-600 hover:bg-violet-500 transition rounded-2xl font-bold h-[64px]"
                        >

                          Add Color

                        </button>

                      </div>

                    </div>

                    {/* COLORS */}

                    <div className="grid md:grid-cols-2 gap-5 mt-8">

                      {material.colors.map(
                        (
                          color,
                          index
                        ) => (

                          <div
                            key={index}
                            className={`rounded-3xl border p-6 transition

                            ${color.hidden

                              ? "border-white/5 opacity-40 bg-black/10"

                              : "border-white/10 bg-black/20"

                            }`}
                          >

                            <div className="flex gap-5">

                              {/* COLOR */}

                              <div
                                className="w-24 h-24 rounded-3xl border border-white/10 shrink-0"
                                style={{
                                  background:
                                    color.hex,
                                }}
                              />

                              {/* INFO */}

                              <div className="flex-1 space-y-4">

                                {/* NAME */}

                                <input
                                  disabled={!isEditing}
                                  value={
                                    color.name
                                  }
                                  onChange={(e) => {

                                    const updated =
                                      {
                                        ...materials,
                                      };

                                    updated[
                                      materialName
                                    ].colors[
                                      index
                                    ].name =
                                      e.target.value;

                                    setMaterials(
                                      updated
                                    );

                                  }}
                                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4"
                                />

                                {/* PREMIUM BADGE */}

                                <div className="flex items-center gap-2">

                                  {color.premium && (

                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-400/20 text-yellow-300 text-xs font-bold">

                                      <Crown size={14} />

                                      PREMIUM

                                    </div>

                                  )}

                                </div>

                                {/* TOGGLE */}

                                <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-2xl px-4 py-4">

                                  <div>

                                    <p className="text-sm font-medium">

                                      Use Parent Material Price

                                    </p>

                                    <p className="text-xs text-white/40 mt-1">

                                      Sync with base material pricing.

                                    </p>

                                  </div>

                                  <button
                                    disabled={!isEditing}
                                    onClick={() => {

                                      const updated =
                                        {
                                          ...materials,
                                        };

                                      const current =
                                        updated[
                                          materialName
                                        ].colors[
                                          index
                                        ];

                                      current.useMaterialPrice =
                                        !current.useMaterialPrice;

                                      if (
                                        current.useMaterialPrice
                                      ) {

                                        current.customPrice =
                                          updated[
                                            materialName
                                          ].pricePerGram;

                                      }

                                      setMaterials(
                                        updated
                                      );

                                    }}
                                    className={`relative w-16 h-9 rounded-full transition-all duration-300

                                    ${color.useMaterialPrice

                                      ? "bg-green-500"

                                      : "bg-white/10"

                                    }`}
                                  >

                                    <div
                                      className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-all duration-300

                                      ${color.useMaterialPrice

                                        ? "left-8"

                                        : "left-1"

                                      }`}
                                    />

                                  </button>

                                </div>

                                {/* CUSTOM PRICE */}

                                {!color.useMaterialPrice && (

                                  <input
                                    type="number"
                                    disabled={!isEditing}
                                    value={
                                      color.customPrice
                                    }
                                    onChange={(e) => {

                                      const updated =
                                        {
                                          ...materials,
                                        };

                                      updated[
                                        materialName
                                      ].colors[
                                        index
                                      ].customPrice =

                                        parseFloat(
                                          e.target.value
                                        );

                                      setMaterials(
                                        updated
                                      );

                                    }}
                                    className="w-full bg-black/20 border border-violet-500 rounded-2xl px-5 py-4"
                                  />

                                )}

                              </div>

                              {/* ACTIONS */}

                              <div className="flex flex-col gap-3">

                                {/* HIDE */}

                                <button
                                  disabled={!isEditing}
                                  onClick={() => {

                                    const updated =
                                      {
                                        ...materials,
                                      };

                                    updated[
                                      materialName
                                    ].colors[
                                      index
                                    ].hidden =

                                      !updated[
                                        materialName
                                      ].colors[
                                        index
                                      ].hidden;

                                    setMaterials(
                                      updated
                                    );

                                  }}
                                  className="w-12 h-12 rounded-2xl bg-black/20 text-white/50 flex items-center justify-center"
                                >

                                  {color.hidden

                                    ? <EyeOff size={18} />

                                    : <Eye size={18} />

                                  }

                                </button>

                                {/* DELETE */}

                                <button
                                  disabled={!isEditing}
                                  onClick={() => {

                                    const updated =
                                      {
                                        ...materials,
                                      };

                                    updated[
                                      materialName
                                    ].colors.splice(
                                      index,
                                      1
                                    );

                                    setMaterials(
                                      updated
                                    );

                                  }}
                                  className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-300 flex items-center justify-center"
                                >

                                  <Trash2 size={18} />

                                </button>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>

            );

          }
        )}

      </div>

    </main>

  );

};

export default Dashboard;