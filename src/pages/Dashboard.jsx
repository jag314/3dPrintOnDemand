import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Save, Trash2, Eye, EyeOff, Palette, Crown, Layers } from "lucide-react";

const TECH_STYLES = {
  fdm: {
    label:"FDM", bg:"rgba(139,92,246,0.15)", border:"rgba(139,92,246,0.4)", color:"#c4b5fd",
    desc:"Fused Deposition · PLA / PETG / ABS", icon:"⬡",
  },
  sla: {
    label:"SLA", bg:"rgba(251,191,36,0.12)", border:"rgba(251,191,36,0.35)", color:"#fde68a",
    desc:"Stereolithography · High Detail", icon:"◈",
  },
};

const TechnologyPicker = ({ value, onChange, disabled }) => (
  <div style={{ display:"flex", gap:8 }}>
    {["fdm","sla"].map((id) => {
      const s = TECH_STYLES[id];
      const active = value === id;
      return (
        <button key={id} disabled={disabled} onClick={() => onChange(id)} style={{
          flex:1, padding:"10px 12px", borderRadius:14, cursor: disabled ? "default" : "pointer",
          transition:"all 0.2s ease",
          background: active ? s.bg : "rgba(255,255,255,0.03)",
          border:`1px solid ${active ? s.border : "rgba(255,255,255,0.08)"}`,
          color: active ? s.color : "rgba(255,255,255,0.3)",
          display:"flex", alignItems:"center", gap:8,
          opacity: disabled ? 0.7 : 1,
        }}>
          <span style={{ fontSize:16 }}>{s.icon}</span>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.02em" }}>{s.label}</div>
            <div style={{ fontSize:9, opacity:0.6, marginTop:1 }}>{s.desc}</div>
          </div>
        </button>
      );
    })}
  </div>
);

const Dashboard = ({ materials, setMaterials }) => {
  const [expandedMaterial, setExpandedMaterial] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newDensity, setNewDensity] = useState("");
  const [newPricePerGram, setNewPricePerGram] = useState("");
  const [newTechnology, setNewTechnology] = useState("fdm");
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#a855f7");
  const [customColorPrice, setCustomColorPrice] = useState("");
  const [customColorPremium, setCustomColorPremium] = useState(false);
  const [customColorFinish, setCustomColorFinish] = useState("matte");

  const clone = () => JSON.parse(JSON.stringify(materials));

  const addMaterial = () => {
    if (!newMaterialName) return;
    const price = parseFloat(newPricePerGram) || 35;
    const updated = clone();
    updated[newMaterialName] = {
      technology: newTechnology,
      density: parseFloat(newDensity) || 1.24,
      pricePerGram: price,
      ...(newTechnology === "sla" ? { pricePerML: price } : {}),
      colors: [],
    };
    setMaterials(updated);
    setNewMaterialName(""); setNewDensity(""); setNewPricePerGram(""); setNewTechnology("fdm");
  };

  const saveMaterial = () => setEditingMaterial(null);

  const updateColor = (materialName, index, patch) => {
    const updated = clone();
    updated[materialName].colors = updated[materialName].colors.map((c, i) =>
      i === index ? { ...c, ...patch } : c
    );
    setMaterials(updated);
  };

  const removeColor = (materialName, index) => {
    const updated = clone();
    updated[materialName].colors = updated[materialName].colors.filter((_, i) => i !== index);
    setMaterials(updated);
  };

  const addCustomColor = (materialName) => {
    if (!customColorName) return;
    const updated = clone();
    const mat = updated[materialName];
    mat.colors.push({
      name: customColorName, hex: customColorHex, finish: customColorFinish,
      premium: customColorPremium, hidden: false,
      useMaterialPrice: customColorPrice === "",
      customPrice: customColorPrice === "" ? mat.pricePerGram : parseFloat(customColorPrice),
    });
    setMaterials(updated);
    setCustomColorName(""); setCustomColorHex("#a855f7"); setCustomColorPrice(""); setCustomColorPremium(false); setCustomColorFinish("matte");
  };

  return (
    <main className="min-h-screen bg-[#050816] text-white pt-32 px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        <div>
          <p className="uppercase tracking-[0.3em] text-violet-400 text-xs">Material Management</p>
          <h1 className="text-6xl font-black mt-3">Admin<span className="text-violet-500"> Dashboard</span></h1>
        </div>

        {/* ADD MATERIAL */}
        <div className="rounded-3xl border border-white/10 glass-card p-8">
          <h2 className="text-4xl font-black mb-3">Add New Material</h2>
          <p className="text-white/40 mb-8">Create new printable material types for your quoting system.</p>
          <div className="mb-6">
            <label className="text-sm text-white/50 block mb-3">Print Technology</label>
            <TechnologyPicker value={newTechnology} onChange={setNewTechnology} disabled={false} />
          </div>
          <div className="grid lg:grid-cols-4 gap-5">
            <div>
              <label className="text-sm text-white/50 block mb-3">Material Name</label>
              <input value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)}
                placeholder="Example: PLA CF" className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5" />
            </div>
            <div>
              <label className="text-sm text-white/50 block mb-3">
                {newTechnology === "sla" ? "Price Per ML (₡)" : "Base Price Per Gram (₡)"}
              </label>
              <input type="number" value={newPricePerGram} onChange={(e) => setNewPricePerGram(e.target.value)}
                placeholder={newTechnology === "sla" ? "80" : "35"} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5" />
            </div>
            <div>
              <label className="text-sm text-white/50 block mb-3">Density (g/cm³)</label>
              <input type="number" value={newDensity} onChange={(e) => setNewDensity(e.target.value)}
                placeholder="1.24" className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5" />
            </div>
            <button onClick={addMaterial}
              className="bg-violet-600 hover:bg-violet-500 transition rounded-2xl font-bold h-[64px] self-end">
              Add Material
            </button>
          </div>
        </div>

        {/* MATERIALS LIST */}
        {Object.entries(materials).map(([materialName, material]) => {
          const expanded = expandedMaterial === materialName;
          const isEditing = editingMaterial === materialName;
          const techStyle = TECH_STYLES[material.technology] || TECH_STYLES["fdm"];

          return (
            <div key={materialName} className="rounded-3xl border border-white/10 glass-card overflow-hidden">
              <div className="p-8 flex items-start justify-between gap-8">
                <div className="flex-1 space-y-5">

                  {/* TECHNOLOGY */}
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/30 block mb-3">Print Technology</label>
                    <TechnologyPicker
                      value={material.technology || "fdm"}
                      onChange={(tech) => {
                        const updated = clone();
                        updated[materialName].technology = tech;
                        if (tech === "sla" && !updated[materialName].pricePerML) {
                          updated[materialName].pricePerML = updated[materialName].pricePerGram;
                        }
                        setMaterials(updated);
                      }}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid lg:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-white/30 block mb-3">Material Name</label>
                      <input disabled={!isEditing} value={materialName}
                        onChange={(e) => {
                          const updated = clone();
                          updated[e.target.value] = updated[materialName];
                          delete updated[materialName];
                          setMaterials(updated);
                        }}
                        className={`w-full rounded-2xl px-5 py-5 text-3xl font-black transition ${isEditing ? "bg-black/30 border border-violet-500/40" : "bg-black/20 border border-white/10"}`} />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-white/30 block mb-3">
                        {material.technology === "sla" ? "Price Per ML (₡)" : "Base Price Per Gram (₡)"}
                      </label>
                      <input type="number" disabled={!isEditing} value={material.pricePerGram}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          const updated = clone();
                          updated[materialName].pricePerGram = val;
                          if (updated[materialName].technology === "sla") updated[materialName].pricePerML = val;
                          setMaterials(updated);
                        }}
                        className={`w-full rounded-2xl px-5 py-5 text-2xl font-bold transition ${isEditing ? "bg-black/30 border border-violet-500/40" : "bg-black/20 border border-white/10"}`} />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-white/30 block mb-3">Density (g/cm³)</label>
                      <input type="number" disabled={!isEditing} value={material.density}
                        onChange={(e) => {
                          const updated = clone();
                          updated[materialName].density = parseFloat(e.target.value);
                          setMaterials(updated);
                        }}
                        className={`w-full rounded-2xl px-5 py-5 text-2xl font-bold transition ${isEditing ? "bg-black/30 border border-violet-500/40" : "bg-black/20 border border-white/10"}`} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 mt-2">
                  <div style={{
                    padding:"4px 10px", borderRadius:8, background:techStyle.bg,
                    border:`1px solid ${techStyle.border}`, color:techStyle.color,
                    fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                    whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5,
                  }}>
                    <span>{techStyle.icon}</span>{techStyle.label}
                  </div>
                  <button
                    onClick={() => isEditing ? saveMaterial() : setEditingMaterial(materialName)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${isEditing ? "bg-green-500/20 text-green-300" : "bg-violet-500/10 text-violet-300"}`}>
                    {isEditing ? <Save size={20} /> : <Pencil size={20} />}
                  </button>
                  <button
                    onClick={() => setExpandedMaterial(expanded ? null : materialName)}
                    className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <button
                    onClick={() => {
                      const updated = clone();
                      delete updated[materialName];
                      setMaterials(updated);
                    }}
                    className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="px-8 pb-8 border-t border-white/10">
                  <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <Palette className="text-violet-400" />
                      <h3 className="text-4xl font-black">Add Color Variant</h3>
                    </div>
                    <div className="grid lg:grid-cols-6 gap-5 items-end">
                      <div>
                        <label className="text-sm text-white/50 block mb-3">Color Name</label>
                        <input value={customColorName} onChange={(e) => setCustomColorName(e.target.value)}
                          placeholder="Example: Silk Gold" className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5" />
                      </div>
                      <div>
                        <label className="text-sm text-white/50 block mb-3">Select Color</label>
                        <div className="h-[64px] rounded-2xl border border-white/10 overflow-hidden">
                          <input type="color" value={customColorHex} onChange={(e) => setCustomColorHex(e.target.value)} className="w-full h-full cursor-pointer" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-white/50 block mb-3">Finish</label>
                        <div className="flex gap-1 h-[64px]">
                          {[{id:"matte",icon:"◯"},{id:"glossy",icon:"◉"},{id:"translucent",icon:"◈"},{id:"glow",icon:"✦"}].map(({ id, icon }) => (
                            <button key={id} onClick={() => setCustomColorFinish(id)}
                              title={id}
                              style={{
                                flex:1, borderRadius:10, cursor:"pointer", transition:"all 0.15s",
                                background: customColorFinish === id ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)",
                                border: customColorFinish === id ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
                                color: customColorFinish === id ? "#c4b5fd" : "rgba(255,255,255,0.3)",
                                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3,
                              }}>
                              <span style={{ fontSize:14 }}>{icon}</span>
                              <span style={{ fontSize:8, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>{id}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-white/50 block mb-3">Custom Price Override (₡)</label>
                        <input type="number" value={customColorPrice} onChange={(e) => setCustomColorPrice(e.target.value)}
                          placeholder={`Default ₡${material.pricePerGram}`} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5" />
                      </div>
                      <div>
                        <label className="text-sm text-white/50 block mb-3">Premium Material</label>
                        <button onClick={() => setCustomColorPremium(!customColorPremium)}
                          className={`relative w-full h-[64px] rounded-2xl transition-all duration-300 border ${customColorPremium ? "bg-yellow-500/20 border-yellow-400/30" : "bg-black/20 border-white/10"}`}>
                          <div className={`absolute top-2 w-10 h-10 rounded-full bg-white transition-all duration-300 flex items-center justify-center ${customColorPremium ? "left-[calc(100%-48px)]" : "left-2"}`}>
                            <Crown size={16} className={customColorPremium ? "text-yellow-500" : "text-gray-400"} />
                          </div>
                          <span className="text-sm font-bold tracking-wide">{customColorPremium ? "PREMIUM" : "STANDARD"}</span>
                        </button>
                      </div>
                      <button onClick={() => addCustomColor(materialName)}
                        className="bg-violet-600 hover:bg-violet-500 transition rounded-2xl font-bold h-[64px]">
                        Add Color
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 mt-8">
                    {material.colors.map((color, index) => (
                      <div key={index} className={`rounded-3xl border p-6 transition ${color.hidden ? "border-white/5 opacity-40 bg-black/10" : "border-white/10 bg-black/20"}`}>
                        <div className="flex gap-5">
                          <div className="w-24 h-24 rounded-3xl border border-white/10 shrink-0 relative" style={{ background: color.hex }}>
                            {color.finish && (
                              <span style={{ position:"absolute", bottom:4, left:"50%", transform:"translateX(-50%)", fontSize:8, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", background:"rgba(0,0,0,0.7)", color:"#fff", borderRadius:4, padding:"2px 5px", whiteSpace:"nowrap" }}>
                                {color.finish}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 space-y-4">
                            <input disabled={!isEditing} value={color.name}
                              onChange={(e) => updateColor(materialName, index, { name: e.target.value })}
                              className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4" />
                            {color.premium && (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-400/20 text-yellow-300 text-xs font-bold w-fit">
                                <Crown size={14} />PREMIUM
                              </div>
                            )}
                            {isEditing && (
                              <div className="flex gap-1">
                                {["matte","glossy","translucent","glow"].map(f => (
                                  <button key={f} onClick={() => updateColor(materialName, index, { finish: f })}
                                    style={{
                                      flex:1, padding:"4px 2px", borderRadius:8, fontSize:9, fontWeight:700,
                                      textTransform:"uppercase", letterSpacing:"0.04em", cursor:"pointer", transition:"all 0.15s",
                                      background: (color.finish||"matte") === f ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.04)",
                                      border: (color.finish||"matte") === f ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
                                      color: (color.finish||"matte") === f ? "#c4b5fd" : "rgba(255,255,255,0.3)",
                                    }}>
                                    {f}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-2xl px-4 py-4">
                              <div>
                                <p className="text-sm font-medium">Use Parent Material Price</p>
                                <p className="text-xs text-white/40 mt-1">Sync with base material pricing.</p>
                              </div>
                              <button disabled={!isEditing}
                                onClick={() => updateColor(materialName, index, {
                                  useMaterialPrice: !color.useMaterialPrice,
                                  customPrice: !color.useMaterialPrice ? material.pricePerGram : color.customPrice,
                                })}
                                className={`relative w-16 h-9 rounded-full transition-all duration-300 ${color.useMaterialPrice ? "bg-green-500" : "bg-white/10"}`}>
                                <div className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-all duration-300 ${color.useMaterialPrice ? "left-8" : "left-1"}`} />
                              </button>
                            </div>
                            {!color.useMaterialPrice && (
                              <input type="number" disabled={!isEditing} value={color.customPrice}
                                onChange={(e) => updateColor(materialName, index, { customPrice: parseFloat(e.target.value) })}
                                className="w-full bg-black/20 border border-violet-500 rounded-2xl px-5 py-4" />
                            )}
                          </div>
                          <div className="flex flex-col gap-3">
                            <button disabled={!isEditing}
                              onClick={() => updateColor(materialName, index, { hidden: !color.hidden })}
                              className="w-12 h-12 rounded-2xl bg-black/20 text-white/50 flex items-center justify-center">
                              {color.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button disabled={!isEditing}
                              onClick={() => removeColor(materialName, index)}
                              className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-300 flex items-center justify-center">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Dashboard;