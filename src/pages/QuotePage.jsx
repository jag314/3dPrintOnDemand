import React from "react";
import { useState, useMemo } from "react";
import ViewerCanvas from "../components/upload/ViewerCanvas";
import ModelViewer from "../components/upload/ModelViewer";

const InlineUpload = ({ onFileUpload }) => {
  const [hovered, setHovered] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef();
  const active = hovered || dragging;
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onFileUpload(f);
      }}
      style={{
        borderRadius:32, minHeight:320, width:"100%", maxWidth:580,
        display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",
        background: active ? "rgba(139,92,246,0.07)" : "rgba(255,255,255,0.015)",
        border: active ? "1.5px dashed rgba(139,92,246,0.6)" : "1.5px dashed rgba(255,255,255,0.09)",
        boxShadow: active ? "0 0 60px rgba(139,92,246,0.1)" : "none",
        position:"relative", overflow:"hidden", padding:"48px 32px",
      }}
    >
      <input ref={inputRef} type="file" accept=".stl,.obj" style={{display:"none"}}
        onChange={(e) => { const f = e.target.files[0]; if (f) onFileUpload(f); }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 65%)",
        opacity: active ? 1 : 0, transition:"opacity 0.35s ease" }} />
      {[
        {top:16,left:16,  borderTop:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`,borderLeft:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`},
        {top:16,right:16, borderTop:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`,borderRight:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`},
        {bottom:16,left:16, borderBottom:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`,borderLeft:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`},
        {bottom:16,right:16,borderBottom:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`,borderRight:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`},
      ].map((s,i) => <div key={i} style={{ position:"absolute", width:20, height:20, transition:"border 0.35s ease", ...s }} />)}
      <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{
          width:80, height:80, borderRadius:24, margin:"0 auto",
          background: active ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.08)",
          border:`1px solid rgba(139,92,246,${active ? "0.5" : "0.18"})`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6,
          transition:"all 0.35s ease",
          boxShadow: active ? "0 0 32px rgba(139,92,246,0.35)" : "none",
          transform: hovered && !dragging ? "translateY(-4px)" : dragging ? "translateY(-6px) scale(1.05)" : "none",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(167,139,250,0.8)", fontFamily:"Inter, sans-serif" }}>
            {dragging ? "Drop it!" : "Upload"}
          </span>
        </div>
        <h2 style={{ marginTop:28, fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:"#fff", lineHeight:1.1, fontFamily:"Inter, sans-serif", letterSpacing:"-0.03em" }}>
          Upload Your <span style={{ color: active ? "#c4b5fd" : "#a78bfa", transition:"color 0.3s ease" }}>3D Files</span>
        </h2>
        <p style={{ marginTop:14, fontSize:13, color: active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)", fontFamily:"Inter, sans-serif", transition:"color 0.3s ease" }}>
          {dragging ? "Release to analyze instantly" : "Drag & drop or click to browse  ·  STL & OBJ supported"}
        </p>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:20 }}>
          {[".STL",".OBJ"].map(ext => (
            <span key={ext} style={{ fontSize:10, fontWeight:700, color: active ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.25)",
              background: active ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)",
              border:`1px solid ${active ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius:6, padding:"3px 8px", fontFamily:"Inter, sans-serif", transition:"all 0.3s ease" }}>{ext}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const InlineUploadCompact = ({ onFileUpload }) => {
  const inputRef = React.useRef();
  return (
    <div onClick={() => inputRef.current?.click()} title="Upload new file"
      style={{ width:58, height:58, borderRadius:16, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:3, cursor:"pointer",
        background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.28)",
        backdropFilter:"blur(16px)", transition:"all 0.2s ease",
        boxShadow:"0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
      <input ref={inputRef} type="file" accept=".stl,.obj" style={{display:"none"}}
        onChange={(e) => { const f = e.target.files[0]; if (f) onFileUpload(f); }} />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span style={{ fontSize:8, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(167,139,250,0.7)", fontFamily:"Inter, sans-serif" }}>Upload</span>
    </div>
  );
};

// =========================
// MATERIAL INFO
// photos: add optional "position" e.g. "center 20%" to crop focus
// =========================
const MATERIAL_INFO = {
  fdm: {
    title: "FDM 3D Printing",
    subtitle: "Fused Deposition Modeling",
    description: "FDM builds parts layer by layer by melting thermoplastic filament. Best for prototypes, functional parts, and large models.",
    priced: "Priced by weight (grams)",
    badge: "FDM · Fused Deposition",
    photos: [
      { url: "/materials/fdm-1.png", caption: "FDM PLA — functional prototype", position: "center center" },
      { url: "/materials/fdm-2.png", caption: "FDM PETG — mechanical part",     position: "center center" },
      { url: "/materials/fdm-3.png", caption: "FDM ABS — structural component",  position: "center center" },
    ],
    materials: [
      { name:"PLA",  density:"1.24 g/cm³", accuracy:"±0.3mm", wallMin:"1mm",   strength:"37 MPa", notes:"Low cost, biodegradable, great for visuals" },
      { name:"PETG", density:"1.27 g/cm³", accuracy:"±0.3mm", wallMin:"1mm",   strength:"50 MPa", notes:"Flexible, chemical resistant, food-safe" },
      { name:"ABS",  density:"1.04 g/cm³", accuracy:"±0.3mm", wallMin:"1mm",   strength:"40 MPa", notes:"Impact resistant, machinable, post-processable" },
      { name:"PLA+", density:"1.24 g/cm³", accuracy:"±0.2mm", wallMin:"0.8mm", strength:"45 MPa", notes:"Higher strength and detail than standard PLA" },
    ],
  },
  sla: {
    title: "SLA 3D Printing",
    subtitle: "Stereolithography · MSLA · DLP",
    description: "SLA cures liquid photopolymer resin with UV light layer by layer. Produces ultra-fine details, smooth surfaces, and excellent accuracy. Ideal for jewelry, dental models, miniatures, and engineering prototypes.",
    priced: "Priced by volume (ml)",
    badge: "SLA · Stereolithography",
    photos: [
      { url: "/materials/sla-1.png", caption: "SLA Standard Resin — smooth prototype", position: "center center" },
      { url: "/materials/sla-2.png", caption: "SLA High Detail — miniature & jewelry",  position: "center center" },
      { url: "/materials/sla-3.png", caption: "SLA ABS-Like — tough functional part",   position: "center center" },
    ],
    materials: [
      { name:"Standard Resin",  density:"1.2 g/cm³",  accuracy:"±0.2mm",  wallMin:"0.6mm", strength:"65 MPa", notes:"Smooth finish, great for visual prototypes" },
      { name:"ABS-Like Resin",  density:"1.18 g/cm³", accuracy:"±0.2mm",  wallMin:"0.6mm", strength:"55 MPa", notes:"Tough, slightly flexible, functional parts" },
      { name:"Water-Washable",  density:"1.1 g/cm³",  accuracy:"±0.2mm",  wallMin:"0.5mm", strength:"42 MPa", notes:"Easy cleanup, vibrant colors available" },
      { name:"High-Detail",     density:"1.2 g/cm³",  accuracy:"±0.05mm", wallMin:"0.3mm", strength:"58 MPa", notes:"Ultra-fine detail for miniatures and jewelry" },
    ],
  },
};

const TechnologySelector = ({ technology, setTechnology }) => {
  const [modal, setModal] = React.useState(null);
  const [photoIdx, setPhotoIdx] = React.useState(0);
  const info = modal ? MATERIAL_INFO[modal] : null;
  React.useEffect(() => { setPhotoIdx(0); }, [modal]);

  return (
    <>
      <div
        className="absolute top-6 z-30"
        style={{
          left:"50%", transform:"translateX(-50%)",
          background:"rgba(10,10,20,0.72)",
          backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:"18px", padding:"10px 10px",
          boxShadow:"0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ fontSize:"9px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.25)", fontWeight:600, textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>
          Technology
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[
            { id:"fdm", label:"FDM", desc:"PLA · PETG · ABS",        icon:"⬡" },
            { id:"sla", label:"SLA", desc:"High detail · Resin",      icon:"◈" },
          ].map(({ id, label, desc, icon }) => (
            <div key={id} style={{ display:"flex", alignItems:"stretch" }}>
              <button
                onClick={() => setTechnology(id)}
                style={{
                  padding:"7px 10px 7px 11px", borderRadius:"12px 0 0 12px", cursor:"pointer",
                  transition:"all 0.2s ease",
                  background: technology === id ? "linear-gradient(135deg,rgba(139,92,246,0.3),rgba(109,40,217,0.18))" : "rgba(255,255,255,0.03)",
                  border: technology === id ? "1px solid rgba(139,92,246,0.55)" : "1px solid rgba(255,255,255,0.06)",
                  borderRight:"none",
                  boxShadow: technology === id ? "0 0 16px rgba(139,92,246,0.2)" : "none",
                  color: technology === id ? "#ede9fe" : "rgba(255,255,255,0.3)",
                  display:"flex", alignItems:"center", gap:8,
                }}
              >
                <span style={{ fontSize:13, opacity: technology === id ? 1 : 0.4 }}>{icon}</span>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.02em" }}>{label}</div>
                  <div style={{ fontSize:9, opacity:0.5, marginTop:1 }}>{desc}</div>
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setModal(id); }}
                title={`About ${label}`}
                style={{
                  width:26, borderRadius:"0 12px 12px 0", cursor:"pointer",
                  background: technology === id ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                  border: technology === id ? "1px solid rgba(139,92,246,0.55)" : "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `1px solid ${technology === id ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)"}`,
                  color: technology === id ? "rgba(196,181,253,0.9)" : "rgba(255,255,255,0.3)",
                  fontSize:10, fontWeight:800,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0, transition:"all 0.2s ease",
                  fontFamily:"serif", fontStyle:"italic",
                }}
              >i</button>
            </div>
          ))}
        </div>
      </div>

      {modal && info && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)" }}
          onClick={() => setModal(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-[28px] overflow-hidden"
            style={{
              background:"linear-gradient(145deg,#0f0e1a,#13101f)",
              border:"1px solid rgba(139,92,246,0.3)",
              boxShadow:"0 24px 80px rgba(0,0,0,0.8)",
              maxHeight:"85vh", display:"flex", flexDirection:"column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModal(null)}
              style={{ position:"absolute", top:16, right:16, zIndex:10, fontSize:22, lineHeight:1,
                width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                background:"rgba(0,0,0,0.5)", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)",
                color:"rgba(255,255,255,0.6)", cursor:"pointer" }}
            >×</button>

            {/* PHOTO GALLERY */}
            <div style={{ position:"relative", width:"100%", height:300, flexShrink:0, overflow:"hidden" }}>

              {/* Images */}
              {info.photos.map((photo, idx) => (
                <div key={idx} style={{
                  position:"absolute", inset:0,
                  opacity: photoIdx === idx ? 1 : 0,
                  transition:"opacity 0.6s ease",
                  backgroundImage:`url(${photo.url})`,
                  backgroundSize:"cover",
                  backgroundPosition: photo.position || "center center",
                  backgroundRepeat:"no-repeat",
                }} />
              ))}

              {/* Dark gradient — stronger at bottom for text legibility */}
              <div style={{ position:"absolute", inset:0,
                background:"linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 40%, rgba(15,14,26,0.88) 78%, #0f0e1a 100%)",
                pointerEvents:"none",
              }} />

              {/* Tech badge top-left */}
              <div style={{ position:"absolute", top:16, left:16,
                background:"rgba(15,12,30,0.65)", backdropFilter:"blur(12px)",
                border:"1px solid rgba(139,92,246,0.5)",
                borderRadius:8, padding:"5px 12px",
                fontSize:10, fontWeight:700, letterSpacing:"0.13em",
                textTransform:"uppercase", color:"#c4b5fd",
                fontFamily:"Inter, sans-serif",
              }}>
                {info.badge}
              </div>

              {/* Caption bottom-left */}
              <div style={{ position:"absolute", bottom:42, left:20,
                fontSize:12, color:"rgba(255,255,255,0.6)",
                fontFamily:"Inter, sans-serif", fontStyle:"italic",
                textShadow:"0 1px 8px rgba(0,0,0,0.8)",
              }}>
                {info.photos[photoIdx]?.caption}
              </div>

              {/* Dot indicators bottom-right */}
              <div style={{ position:"absolute", bottom:16, right:16, display:"flex", gap:5, alignItems:"center" }}>
                {info.photos.map((_, idx) => (
                  <button key={idx} onClick={() => setPhotoIdx(idx)} style={{
                    width: photoIdx === idx ? 20 : 6,
                    height: 6, borderRadius: 3,
                    border:"none", cursor:"pointer", padding:0,
                    background: photoIdx === idx ? "#a78bfa" : "rgba(255,255,255,0.3)",
                    transition:"all 0.3s ease",
                  }} />
                ))}
              </div>

              {/* Left/right arrows */}
              <button onClick={() => setPhotoIdx((photoIdx - 1 + info.photos.length) % info.photos.length)}
                style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-60%)",
                  width:34, height:34, borderRadius:"50%",
                  border:"1px solid rgba(255,255,255,0.18)",
                  background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)",
                  color:"rgba(255,255,255,0.8)", fontSize:18,
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>‹</button>
              <button onClick={() => setPhotoIdx((photoIdx + 1) % info.photos.length)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-60%)",
                  width:34, height:34, borderRadius:"50%",
                  border:"1px solid rgba(255,255,255,0.18)",
                  background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)",
                  color:"rgba(255,255,255,0.8)", fontSize:18,
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>›</button>
            </div>

            {/* BODY */}
            <div className="overflow-y-auto" style={{ padding:"20px 28px 32px" }}>
              <p className="text-violet-400 text-xs uppercase tracking-widest mb-1">Material Guide</p>
              <h2 className="text-3xl font-black text-white mt-1">{info.title}</h2>
              <p className="text-white/50 text-sm mt-1 mb-0">{info.subtitle}</p>
              <p className="text-white/70 text-sm mt-3 leading-relaxed">{info.description}</p>

              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.25)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                <span className="text-violet-300 text-xs font-semibold">{info.priced}</span>
              </div>

              <div className="mt-6 space-y-3">
                {info.materials.map((m) => (
                  <div key={m.name} className="rounded-2xl p-4"
                    style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-white text-base">{m.name}</span>
                      <span className="text-xs text-white/40">{m.notes}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label:"Density",  value:m.density  },
                        { label:"Accuracy", value:m.accuracy },
                        { label:"Min Wall", value:m.wallMin  },
                        { label:"Tensile",  value:m.strength },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl p-2 text-center"
                          style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.12)" }}>
                          <div className="text-violet-400 text-[10px] font-semibold uppercase tracking-wide">{label}</div>
                          <div className="text-white text-xs font-bold mt-1">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const QuotePage = ({ materials }) => {
  const [file, setFile] = useState(null);
  const [technology, setTechnology] = useState("fdm");
  const [modelSize, setModelSize] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelStats, setModelStats] = useState({ fileName:"-", dimensions:"-", materialUsage:"0", complexity:"-" });

  const materialNames = Object.keys(materials).filter(
    name => !materials[name].technology || materials[name].technology === technology
  );

  const [selectedMaterial, setSelectedMaterial] = useState(materialNames[0]);
  const [selectedColor, setSelectedColor] = useState(materials[materialNames[0]]?.colors?.[0] || null);

  React.useEffect(() => {
    if (!materialNames.includes(selectedMaterial)) {
      setSelectedMaterial(materialNames[0]);
      setSelectedColor(materials[materialNames[0]]?.colors?.[0] || null);
    }
  }, [technology]);

  // Keep selectedColor in sync when materials are edited externally (Dashboard)
  React.useEffect(() => {
    if (!selectedMaterial || !selectedColor) return;
    const colors = materials[selectedMaterial]?.colors;
    if (!colors) return;
    const fresh = colors.find(c => c.name === selectedColor.name);
    if (fresh && (fresh.hex !== selectedColor.hex || fresh.finish !== selectedColor.finish)) {
      setSelectedColor(fresh);
    }
  }, [materials, selectedMaterial]);

  const selectedColors = materials[selectedMaterial]?.colors || [];
  const parsedWeight = parseFloat(modelStats.materialUsage) || 0;

  const pricing = useMemo(() => {
    const materialData = materials[selectedMaterial];
    if (!materialData) return { materialCost:0, supportCost:0, machineCost:0, electricityCost:0, failureMargin:0, total:0 };
    const density = materialData.density || 1.24;
    const volumeCM3 = parsedWeight / density;
    if (technology === "sla") {
      const pricePerML = materialData.pricePerML || materialData.pricePerGram * 1.5;
      const materialCost = volumeCM3 * pricePerML;
      const supportCost = volumeCM3 * 0.15 * pricePerML;
      const estimatedHours = volumeCM3 / 20;
      const machineCost = estimatedHours * 2200;
      const electricityCost = estimatedHours * 150;
      const failureMargin = (materialCost + supportCost + machineCost) * 0.15;
      const total = Math.round(materialCost + supportCost + machineCost + electricityCost + failureMargin);
      return { materialCost, supportCost, machineCost, electricityCost, failureMargin, total, volumeCM3, isSLA:true };
    } else {
      const materialCost = parsedWeight * materialData.pricePerGram;
      const supportCost = parsedWeight * 0.18 * materialData.pricePerGram;
      const estimatedHours = parsedWeight / 12;
      const machineCost = estimatedHours * 1800;
      const electricityCost = estimatedHours * 120;
      const failureMargin = (materialCost + supportCost + machineCost) * 0.12;
      const total = Math.round(materialCost + supportCost + machineCost + electricityCost + failureMargin);
      return { materialCost, supportCost, machineCost, electricityCost, failureMargin, total, volumeCM3, isSLA:false };
    }
  }, [parsedWeight, selectedMaterial, materials, technology]);

  return (
    <main className="section-background min-h-screen pt-36 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        <div className="mb-16">
          <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">INSTANT MANUFACTURING</p>
          <h1 className="premium-heading text-6xl lg:text-7xl font-black mt-5 leading-[0.92]">
            Upload & <span className="text-violet-400">Analyze</span>
          </h1>
          <p className="soft-text text-xl mt-8 max-w-3xl">
            Upload STL or OBJ files and receive instant manufacturing analysis, material estimates and professional 3D printing quotes.
          </p>
        </div>

        <div className={file ? "grid lg:grid-cols-[1.35fr_0.65fr] gap-10 items-start" : "grid grid-cols-1 gap-10"}>

          {/* VIEWER */}
          <div className="relative rounded-[42px]" style={{
            background:"linear-gradient(145deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)",
            border:"1px solid rgba(139,92,246,0.2)",
            boxShadow:"0 0 0 1px rgba(255,255,255,0.04),0 30px 80px rgba(0,0,0,0.6),0 0 140px rgba(109,40,217,0.15)",
            backdropFilter:"blur(20px)", overflow:"hidden",
            height: file ? "820px" : "600px", transition:"height 0.5s ease",
          }}>

            {file && <TechnologySelector technology={technology} setTechnology={setTechnology} />}

            {/* ANALYSIS BADGE */}
            {file && (
              <div className="absolute top-6 right-6 z-30" style={{
                background:"rgba(10,10,20,0.52)", backdropFilter:"blur(32px) saturate(200%)",
                WebkitBackdropFilter:"blur(32px) saturate(200%)", border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:"18px", padding:"14px 16px", minWidth:"196px",
                boxShadow:"0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
                  <span style={{ fontSize:"10px", letterSpacing:"0.16em", color:"rgba(255,255,255,0.3)", fontWeight:600, textTransform:"uppercase" }}>Analysis</span>
                  <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"10px", fontWeight:700, color:"#4ade80", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.18)", borderRadius:"999px", padding:"2px 7px" }}>
                    <span style={{ width:4, height:4, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />Ready
                  </span>
                </div>
                <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"0 0 10px" }} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
                  <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.32)" }}>File</span>
                  <span style={{ fontSize:"11px", fontWeight:600, color:"rgba(255,255,255,0.82)", maxWidth:"108px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{modelStats.fileName}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.32)" }}>Weight</span>
                  <span style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.88)" }}>{parsedWeight} g</span>
                </div>
                {modelStats.dimensions !== "-" && (() => {
                  const parts = modelStats.dimensions.split(" × ");
                  const dims = [{ l:"X", v:parts[0], c:"#ef4444" }, { l:"Y", v:parts[1], c:"#22c55e" }, { l:"Z", v:parts[2], c:"#3b82f6" }];
                  return (<>
                    <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"10px 0" }} />
                    <div style={{ display:"flex", gap:"5px" }}>
                      {dims.map(({ l, v, c }) => (
                        <div key={l} style={{ flex:1, background:"rgba(255,255,255,0.03)", border:`1px solid ${c}28`, borderRadius:"10px", padding:"5px 3px", textAlign:"center" }}>
                          <div style={{ fontSize:"9px", color:c, fontWeight:700, letterSpacing:"0.04em" }}>{l}</div>
                          <div style={{ fontSize:"9.5px", color:"rgba(255,255,255,0.78)", fontWeight:600, marginTop:"2px" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </>);
                })()}
              </div>
            )}

            <div style={{ width:"100%", height: file ? "820px" : "600px", position:"relative", transition:"height 0.5s ease" }}>
              {!file && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-10">
                  <InlineUpload onFileUpload={setFile} />
                </div>
              )}
              {file && (
                <div className="absolute top-6 left-6 z-30">
                  <InlineUploadCompact onFileUpload={setFile} />
                </div>
              )}
              <ViewerCanvas
                modelSize={modelSize} loading={isLoading} hasFile={!!file}
                glowMode={selectedColor?.finish === "glow"}
                glowColor={selectedColor?.hex}
              >
                {file && (
                  <ModelViewer
                    file={file}
                    selectedColor={selectedColor}
                    setModelStats={setModelStats}
                    selectedMaterial={selectedMaterial}
                    materials={materials}
                    onModelSizeChange={setModelSize}
                    onLoadingChange={setIsLoading}
                    technology={technology}
                  />
                )}
              </ViewerCanvas>
            </div>
          </div>

          {/* QUOTE PANEL */}
          {file && (
            <div className="glass-card rounded-[42px] border border-white/10 p-10 sticky top-28">
              <p className="text-white/40 text-sm uppercase tracking-[0.2em]">SUMMARY</p>
              <h2 className="text-6xl font-black leading-[0.9] mt-5">Instant<br />Quote</h2>

              <div className="mt-10">
                <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-6">SELECT MATERIAL</p>
                <div className="grid grid-cols-2 gap-5">
                  {materialNames.map((material) => (
                    <button key={material}
                      onClick={() => { setSelectedMaterial(material); setSelectedColor(materials[material]?.colors?.[0] || null); }}
                      className={`rounded-3xl p-6 text-left transition-all duration-300 ${
                        selectedMaterial === material
                          ? "border border-violet-500 bg-violet-500/10 shadow-[0_0_40px_rgba(139,92,246,0.12)]"
                          : "bg-white/[0.03] border border-white/10 hover:bg-white/[0.05]"
                      }`}>
                      <h3 className="text-2xl font-black">{material}</h3>
                      <p className="text-white/40 mt-3">
                        {materials[material].technology === "sla"
                          ? `₡${materials[material].pricePerML ?? materials[material].pricePerGram}/ml`
                          : `₡${materials[material].pricePerGram}/g`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedColors.length > 0 && (
                <div className="mt-14">
                  <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-6">SELECT COLOR</p>
                  <div className="flex flex-wrap gap-5">
                    {selectedColors.map((color, colorIdx) => (
                      <button key={`${colorIdx}-${color.name}`} onClick={() => setSelectedColor(color)}
                        className={`w-16 h-16 rounded-full border-4 transition-all ${selectedColor?.name === color.name ? "border-white scale-110" : "border-transparent"}`}
                        style={{ background: color.hex }} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-16">
                <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-8">PRICE BREAKDOWN</p>
                {pricing.volumeCM3 > 0 && (
                  <div className="mb-6 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background:"rgba(139,92,246,0.07)", border:"1px solid rgba(139,92,246,0.15)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>
                    <span className="text-violet-300 font-semibold">
                      {pricing.isSLA
                        ? `Volume: ${pricing.volumeCM3.toFixed(1)} ml  ·  ${parsedWeight.toFixed(1)} g`
                        : `Weight: ${parsedWeight.toFixed(1)} g  ·  ${pricing.volumeCM3.toFixed(1)} cm³`}
                    </span>
                  </div>
                )}
                <div className="space-y-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-white/60">{pricing.isSLA ? `Resin · ${pricing.volumeCM3.toFixed(1)} ml` : "Material Cost"}</span>
                    <span>₡{pricing.materialCost.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-lg"><span className="text-white/60">Support Material</span><span>₡{pricing.supportCost.toFixed(0)}</span></div>
                  <div className="flex justify-between text-lg"><span className="text-white/60">Machine Usage</span><span>₡{pricing.machineCost.toFixed(0)}</span></div>
                  <div className="flex justify-between text-lg"><span className="text-white/60">Electricity</span><span>₡{pricing.electricityCost.toFixed(0)}</span></div>
                  <div className="flex justify-between text-lg"><span className="text-white/60">Failure Margin</span><span>₡{pricing.failureMargin.toFixed(0)}</span></div>
                </div>
              </div>

              <div className="mt-14 border-t border-white/10 pt-10">
                <p className="text-white/40 uppercase tracking-[0.2em] text-sm">Estimated Manufacturing Cost</p>
                <h3 className="text-6xl font-black text-violet-400 mt-5">₡{pricing.total}</h3>
                <button className="mt-10 w-full primary-button py-5 rounded-3xl text-xl font-bold">Proceed To Checkout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default QuotePage;