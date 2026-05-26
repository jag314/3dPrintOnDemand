import {
  useState,
} from "react";

import {
  Pencil,
  Save,
} from "lucide-react";

const Dashboard = ({
  materials,
  setMaterials,
}) => {

  // =========================
  // STATES
  // =========================

  const [newMaterial, setNewMaterial] =
    useState({

      name: "",

      pricePerGram: "",

      density: "",

    });

  const [editingMaterial, setEditingMaterial] =
    useState(null);

  // =========================
  // ADD MATERIAL
  // =========================

  const addMaterial = () => {

    if (!newMaterial.name)
      return;

    setMaterials({

      ...materials,

      [newMaterial.name]: {

        density:
          parseFloat(
            newMaterial.density
          ),

        pricePerGram:
          parseFloat(
            newMaterial.pricePerGram
          ),

        colors: [],

      },

    });

    setNewMaterial({

      name: "",

      pricePerGram: "",

      density: "",

    });

  };

  // =========================
  // DELETE MATERIAL
  // =========================

  const deleteMaterial = (
    materialName
  ) => {

    const updatedMaterials =
      { ...materials };

    delete updatedMaterials[
      materialName
    ];

    setMaterials(
      updatedMaterials
    );

  };

  // =========================
  // UPDATE MATERIAL
  // =========================

  const updateMaterial = (
    materialName,
    field,
    value
  ) => {

    setMaterials({

      ...materials,

      [materialName]: {

        ...materials[
          materialName
        ],

        [field]:
          parseFloat(value),

      },

    });

  };

  // =========================
  // RENAME MATERIAL
  // =========================

  const renameMaterial = (
    oldName,
    newName
  ) => {

    if (
      !newName ||
      oldName === newName
    )
      return;

    const updatedMaterials =
      { ...materials };

    updatedMaterials[
      newName
    ] =
      updatedMaterials[
        oldName
      ];

    delete updatedMaterials[
      oldName
    ];

    setMaterials(
      updatedMaterials
    );

  };

  // =========================
  // ADD COLOR
  // =========================

  const addColor = (
    materialName
  ) => {

    const updatedMaterials = {
      ...materials,
    };

    if (
      !updatedMaterials[
        materialName
      ].colors
    ) {

      updatedMaterials[
        materialName
      ].colors = [];

    }

    updatedMaterials[
      materialName
    ].colors.push({

      name: "New Color",

      hex: "#ffffff",

      useMaterialPrice: true,

      customPrice: 0,

    });

    setMaterials(
      updatedMaterials
    );

  };

  // =========================
  // UPDATE COLOR
  // =========================

  const updateColor = (
    materialName,
    index,
    field,
    value
  ) => {

    const updatedMaterials = {
      ...materials,
    };

    updatedMaterials[
      materialName
    ].colors[index][field] =
      value;

    setMaterials(
      updatedMaterials
    );

  };

  // =========================
  // DELETE COLOR
  // =========================

  const deleteColor = (
    materialName,
    index
  ) => {

    const updatedMaterials = {
      ...materials,
    };

    updatedMaterials[
      materialName
    ].colors.splice(
      index,
      1
    );

    setMaterials(
      updatedMaterials
    );

  };

  return (

    <main className="min-h-screen bg-[#050816] text-white pt-32 px-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-14">

          <p className="text-violet-400 uppercase tracking-[0.25em] text-sm">

            Material Management

          </p>

          <h1 className="text-6xl font-black mt-2">

            Admin
            <span className="text-violet-500">

              {" "}Dashboard

            </span>

          </h1>

        </div>

        {/* ADD MATERIAL */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

          <h2 className="text-3xl font-bold">

            Add New Material

          </h2>

          <p className="text-white/40 mt-2">

            Configure printable materials for your instant quote engine.

          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-10">

            {/* NAME */}

            <div>

              <label className="text-sm text-white/50">

                Material Name

              </label>

              <p className="text-xs text-white/30 mt-1">

                Example: PLA, PETG, ABS, Resin

              </p>

              <input
                type="text"
                placeholder="Example: PLA+"
                value={newMaterial.name}
                onChange={(e) =>
                  setNewMaterial({

                    ...newMaterial,

                    name:
                      e.target.value,

                  })
                }
                className="mt-3 bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none w-full"
              />

            </div>

            {/* PRICE */}

            <div>

              <label className="text-sm text-white/50">

                Base Price Per Gram (₡)

              </label>

              <p className="text-xs text-white/30 mt-1">

                Main printing cost before premium color pricing.

              </p>

              <input
                type="number"
                placeholder="35"
                value={
                  newMaterial.pricePerGram
                }
                onChange={(e) =>
                  setNewMaterial({

                    ...newMaterial,

                    pricePerGram:
                      e.target.value,

                  })
                }
                className="mt-3 bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none w-full"
              />

            </div>

            {/* DENSITY */}

            <div>

              <label className="text-sm text-white/50">

                Material Density (g/cm³)

              </label>

              <p className="text-xs text-white/30 mt-1">

                Used to calculate object weight from geometry.

              </p>

              <input
                type="number"
                step="0.01"
                placeholder="1.24"
                value={
                  newMaterial.density
                }
                onChange={(e) =>
                  setNewMaterial({

                    ...newMaterial,

                    density:
                      e.target.value,

                  })
                }
                className="mt-3 bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none w-full"
              />

            </div>

          </div>

          <button
            onClick={addMaterial}
            className="mt-10 bg-violet-600 hover:bg-violet-500 transition px-8 py-4 rounded-2xl font-bold"
          >

            Add Material

          </button>

        </div>

        {/* MATERIALS */}

        <div className="mt-10 space-y-8">

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

              const isEditing =
                editingMaterial ===
                materialName;

              return (

                <div
                  key={
                    materialName
                  }
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-8"
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-6">

                    <div className="grid md:grid-cols-3 gap-6 flex-1">

                      {/* NAME */}

                      <div>

                        <label className="text-sm text-white/50">

                          Material Name

                        </label>

                        <input
                          readOnly={!isEditing}
                          type="text"
                          defaultValue={
                            materialName
                          }
                          onBlur={(e) =>
                            renameMaterial(

                              materialName,

                              e.target.value

                            )
                          }
                          className={`mt-3 border rounded-2xl px-5 py-4 outline-none w-full text-2xl font-bold bg-black/20

                          ${isEditing

                            ? "border-violet-500/30"

                            : "border-white/10 opacity-70 cursor-default"

                          }`}
                        />

                      </div>

                      {/* PRICE */}

                      <div>

                        <label className="text-sm text-white/50">

                          Base Price Per Gram (₡)

                        </label>

                        <input
                          readOnly={!isEditing}
                          type="number"
                          value={
                            material.pricePerGram
                          }
                          onChange={(e) =>
                            updateMaterial(

                              materialName,

                              "pricePerGram",

                              e.target.value

                            )
                          }
                          className={`mt-3 border rounded-2xl px-5 py-4 outline-none w-full bg-black/20

                          ${isEditing

                            ? "border-violet-500/30"

                            : "border-white/10 opacity-70 cursor-default"

                          }`}
                        />

                      </div>

                      {/* DENSITY */}

                      <div>

                        <label className="text-sm text-white/50">

                          Density (g/cm³)

                        </label>

                        <input
                          readOnly={!isEditing}
                          type="number"
                          value={
                            material.density
                          }
                          onChange={(e) =>
                            updateMaterial(

                              materialName,

                              "density",

                              e.target.value

                            )
                          }
                          className={`mt-3 border rounded-2xl px-5 py-4 outline-none w-full bg-black/20

                          ${isEditing

                            ? "border-violet-500/30"

                            : "border-white/10 opacity-70 cursor-default"

                          }`}
                        />

                      </div>

                    </div>

                    {/* EDIT / SAVE */}

                    <button

                      onClick={() => {

                        if (isEditing) {

                          localStorage.setItem(

                            "materials",

                            JSON.stringify(
                              materials
                            )

                          );

                          setEditingMaterial(
                            null
                          );

                        }

                        else {

                          setEditingMaterial(
                            materialName
                          );

                        }

                      }}

                      className={`w-14 h-14 rounded-2xl transition flex items-center justify-center

                      ${isEditing

                        ? "bg-green-500/20 hover:bg-green-500/30"

                        : "bg-violet-500/10 hover:bg-violet-500/20"

                      }`}
                    >

                      {isEditing ? (

                        <Save
                          size={20}
                          className="text-green-300"
                        />

                      ) : (

                        <Pencil
                          size={20}
                          className="text-violet-300"
                        />

                      )}

                    </button>

                  </div>

                  {/* COLORS */}

                  <div className="mt-12">

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="text-2xl font-bold">

                          Available Colors

                        </h3>

                        <p className="text-white/40 text-sm mt-1">

                          Configure premium filament pricing and color variants.

                        </p>

                      </div>

                      <button
                        disabled={!isEditing}
                        onClick={() =>
                          addColor(materialName)
                        }
                        className={`px-5 py-3 rounded-2xl transition

                        ${isEditing

                          ? "bg-violet-600 hover:bg-violet-500"

                          : "bg-white/5 opacity-40 cursor-not-allowed"

                        }`}
                      >

                        Add Color

                      </button>

                    </div>

                    {/* COLOR LIST */}

                    <div className="mt-6 space-y-5">

                      {material.colors?.map(
                        (
                          color,
                          index
                        ) => (

                          <div
                            key={index}
                            className="rounded-3xl border border-white/10 bg-black/20 p-6"
                          >

                            <div className="grid lg:grid-cols-[70px_1fr_320px_100px_120px] gap-6 items-start">

                              <div
                                className="w-14 h-14 rounded-full border border-white/20 shadow-lg mt-8"
                                style={{
                                  background:
                                    color.hex,
                                }}
                              />

                              {/* NAME */}

                              <div>

                                <label className="text-xs uppercase tracking-widest text-white/40">

                                  Color Name

                                </label>

                                <input
                                  readOnly={!isEditing}
                                  type="text"
                                  value={color.name}
                                  onChange={(e) =>
                                    updateColor(

                                      materialName,

                                      index,

                                      "name",

                                      e.target.value

                                    )
                                  }
                                  className={`mt-3 w-full rounded-2xl px-4 py-3 outline-none bg-black/20 border

                                  ${isEditing

                                    ? "border-violet-500/30"

                                    : "border-white/10 opacity-70 cursor-default"

                                  }`}
                                />

                              </div>

                              {/* PRICING */}

                              <div>

                                <label className="text-xs uppercase tracking-widest text-white/40">

                                  Pricing Mode

                                </label>

                                <div className="mt-3 space-y-4">

                                  <label className="flex items-center gap-3 text-sm text-white/70">

                                    <input
                                      disabled={!isEditing}
                                      type="checkbox"
                                      checked={
                                        color.useMaterialPrice
                                      }
                                      onChange={(e) =>
                                        updateColor(

                                          materialName,

                                          index,

                                          "useMaterialPrice",

                                          e.target.checked

                                        )
                                      }
                                      className="w-5 h-5"
                                    />

                                    Use Parent Material Price

                                  </label>

                                  {!color.useMaterialPrice && (

                                    <input
                                      readOnly={!isEditing}
                                      type="number"
                                      value={
                                        color.customPrice || 0
                                      }
                                      onChange={(e) =>
                                        updateColor(

                                          materialName,

                                          index,

                                          "customPrice",

                                          parseFloat(
                                            e.target.value
                                          )

                                        )
                                      }
                                      placeholder="Custom ₡/g"
                                      className={`w-full rounded-2xl px-4 py-3 outline-none bg-black/20 border

                                      ${isEditing

                                        ? "border-violet-500/30"

                                        : "border-white/10 opacity-70 cursor-default"

                                      }`}
                                    />

                                  )}

                                </div>

                              </div>

                              {/* PICKER */}

                              <div>

                                <label className="text-xs uppercase tracking-widest text-white/40">

                                  Color

                                </label>

                                <input
                                  disabled={!isEditing}
                                  type="color"
                                  value={color.hex}
                                  onChange={(e) =>
                                    updateColor(

                                      materialName,

                                      index,

                                      "hex",

                                      e.target.value

                                    )
                                  }
                                  className={`mt-3 w-16 h-16 bg-transparent border-none

                                  ${!isEditing
                                    ? "opacity-50"
                                    : "cursor-pointer"
                                  }`}
                                />

                              </div>

                              {/* DELETE */}

                              <div className="flex items-end h-full">

                                <button
                                  disabled={!isEditing}
                                  onClick={() =>
                                    deleteColor(

                                      materialName,

                                      index

                                    )
                                  }
                                  className={`w-full px-4 py-4 rounded-2xl mt-7 transition

                                  ${isEditing

                                    ? "bg-red-500/20 hover:bg-red-500/30"

                                    : "bg-white/5 opacity-40 cursor-not-allowed"

                                  }`}
                                >

                                  Delete

                                </button>

                              </div>

                            </div>

                            {/* ACTIVE PRICE */}

                            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">

                              <span className="text-white/40 text-sm">

                                Active Price

                              </span>

                              <span className="font-bold text-violet-300">

                                {color.useMaterialPrice

                                  ? `Uses ${materialName} base price`

                                  : `₡${color.customPrice || 0}/g`

                                }

                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* DELETE MATERIAL */}

                  <div className="mt-8 flex justify-end">

                    <button
                      onClick={() =>
                        deleteMaterial(
                          materialName
                        )
                      }
                      className="bg-red-500/20 hover:bg-red-500/30 transition px-6 py-4 rounded-2xl"
                    >

                      Delete Material

                    </button>

                  </div>

                </div>

              );

            }
          )}

        </div>

      </div>

    </main>

  );

};

export default Dashboard;