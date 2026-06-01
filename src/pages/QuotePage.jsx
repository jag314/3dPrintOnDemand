import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ViewerCanvas from "../components/upload/ViewerCanvas";
import ModelViewer from "../components/upload/ModelViewer";
import {
  calculatePrinterCosts,
  calculateFDMPrice,
  calculateSLAPrice,
  formatPrintTime,
  formatCRC,
} from "../utils/pricingEngine";

// ── Upload zones ─────────────────────────────────────────────────────────────

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
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFileUpload(f); }}
      style={{
        borderRadius: 32, minHeight: "clamp(280px,40vw,320px)", width: "100%", maxWidth: 580,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        background: active ? "rgba(139,92,246,0.07)" : "rgba(255,255,255,0.015)",
        border: active ? "1.5px dashed rgba(139,92,246,0.6)" : "1.5px dashed rgba(255,255,255,0.09)",
        boxShadow: active ? "0 0 60px rgba(139,92,246,0.1)" : "none",
        position: "relative", overflow: "hidden",
        padding: "clamp(24px,4vw,48px) clamp(16px,3vw,32px)",
      }}
    >
      <input ref={inputRef} type="file" accept=".stl,.obj,.3mf" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files[0]; if (f) onFileUpload(f); }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 65%)", opacity: active ? 1 : 0, transition:"opacity 0.35s ease" }} />
      {[
        { top:16, left:16,  borderTop:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`, borderLeft:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}` },
        { top:16, right:16, borderTop:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`, borderRight:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}` },
        { bottom:16, left:16,  borderBottom:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`, borderLeft:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}` },
        { bottom:16, right:16, borderBottom:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`, borderRight:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}` },
      ].map((s, i) => <div key={i} style={{ position:"absolute", width:20, height:20, transition:"border 0.35s ease", ...s }} />)}
      <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ width:80, height:80, borderRadius:24, margin:"0 auto", background: active ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.08)", border:`1px solid rgba(139,92,246,${active?"0.5":"0.18"})`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.35s ease", boxShadow: active ? "0 0 32px rgba(139,92,246,0.35)" : "none", transform: hovered && !dragging ? "translateY(-4px)" : dragging ? "translateY(-6px) scale(1.05)" : "none" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(167,139,250,0.8)", fontFamily:"Inter, sans-serif" }}>{dragging ? "Drop it!" : "Upload"}</span>
        </div>
        <h2 style={{ marginTop:28, fontSize:"clamp(22px,5vw,48px)", fontWeight:900, color:"#fff", lineHeight:1.1, fontFamily:"Inter, sans-serif", letterSpacing:"-0.03em" }}>
          Upload Your <span style={{ color: active ? "#c4b5fd" : "#a78bfa", transition:"color 0.3s ease" }}>3D Files</span>
        </h2>
        <p style={{ marginTop:14, fontSize:"clamp(11px,2vw,13px)", color: active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)", fontFamily:"Inter, sans-serif", transition:"color 0.3s ease" }}>
          {dragging ? "Release to analyze instantly" : "Drag & drop or click to browse  ·  STL, OBJ & 3MF supported"}
        </p>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:20 }}>
          {[".STL", ".OBJ", ".3MF"].map(ext => (
            <span key={ext} style={{ fontSize:10, fontWeight:700, color: active ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.25)", background: active ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)", border:`1px solid ${active ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius:6, padding:"3px 8px", fontFamily:"Inter, sans-serif", transition:"all 0.3s ease" }}>{ext}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const InlineUploadCompact = ({ onFileUpload }) => {
  const inputRef = React.useRef();
  return (
    <div onClick={() => inputRef.current?.click()} title="Upload new file" style={{ width:58, height:58, borderRadius:16, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, cursor:"pointer", background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.28)", backdropFilter:"blur(16px)", transition:"all 0.2s ease", boxShadow:"0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
      <input ref={inputRef} type="file" accept=".stl,.obj,.3mf" style={{ display:"none" }} onChange={(e) => { const f = e.target.files[0]; if (f) onFileUpload(f); }} />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <span style={{ fontSize:8, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(167,139,250,0.7)", fontFamily:"Inter, sans-serif" }}>Upload</span>
    </div>
  );
};

// ── Technology selector ───────────────────────────────────────────────────────

const MATERIAL_INFO = {
  fdm: {
    title:"FDM 3D Printing", subtitle:"Fused Deposition Modeling",
    description:"FDM builds parts layer by layer by melting thermoplastic filament. Best for prototypes, functional parts, and large models.",
    priced:"Priced by weight (grams)", badge:"FDM · Fused Deposition",
    photos:[
      { url:"/materials/fdm-1.png", caption:"FDM PLA — functional prototype",  position:"center center" },
      { url:"/materials/fdm-2.png", caption:"FDM PETG — mechanical part",      position:"center center" },
      { url:"/materials/fdm-3.png", caption:"FDM ABS — structural component",  position:"center center" },
    ],
    characteristics:[
      { icon:"⚡", title:"Fast Turnaround",  description:"Parts ready in 24–48 hours for most sizes" },
      { icon:"💰", title:"Most Affordable",  description:"Lowest cost per part, ideal for prototypes" },
      { icon:"📐", title:"Large Format",     description:"Up to 300×300×400mm build volume" },
      { icon:"🎨", title:"Many Colors",      description:"20+ filament colors available" },
      { icon:"♻️", title:"Eco Friendly",     description:"PLA is biodegradable and sustainable" },
      { icon:"🔧", title:"Functional Parts", description:"Strong enough for real mechanical use" },
    ],
  },
  sla: {
    title:"SLA 3D Printing", subtitle:"Stereolithography · MSLA · DLP",
    description:"SLA cures liquid photopolymer resin with UV light. Produces ultra-fine details, smooth surfaces and excellent accuracy.",
    priced:"Priced by volume (ml)", badge:"SLA · Stereolithography",
    photos:[
      { url:"/materials/sla-1.png", caption:"SLA Standard Resin — smooth prototype", position:"center center" },
      { url:"/materials/sla-2.png", caption:"SLA High Detail — miniature & jewelry",  position:"center center" },
      { url:"/materials/sla-3.png", caption:"SLA ABS-Like — tough functional part",   position:"center center" },
    ],
    characteristics:[
      { icon:"🔬", title:"Ultra High Detail",   description:"50 micron layer height, smooth surfaces" },
      { icon:"✨", title:"Smooth Finish",        description:"Near injection-molded surface quality" },
      { icon:"💎", title:"Jewelry & Miniatures", description:"Perfect for intricate small parts" },
      { icon:"🦷", title:"Dental & Medical",     description:"Biocompatible resins available" },
      { icon:"📏", title:"High Accuracy",        description:"±0.05mm dimensional accuracy" },
      { icon:"🌊", title:"Watertight Parts",     description:"Fully sealed, no layer gaps" },
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
      <div className="absolute top-6 z-30" style={{ left:"50%", transform:"translateX(-50%)", background:"rgba(10,10,20,0.72)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"18px", padding:"10px 10px", boxShadow:"0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)", maxWidth:"calc(100% - 24px)" }}>
        <div style={{ fontSize:"9px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.25)", fontWeight:600, textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>Technology</div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {[{ id:"fdm", label:"FDM", desc:"PLA · PETG · ABS", icon:"⬡" }, { id:"sla", label:"SLA", desc:"High detail · Resin", icon:"◈" }].map(({ id, label, desc, icon }) => (
            <div key={id} style={{ display:"flex", alignItems:"stretch" }}>
              <button onClick={() => setTechnology(id)} style={{ padding:"7px 10px 7px 11px", borderRadius:"12px 0 0 12px", cursor:"pointer", transition:"all 0.2s ease", background: technology === id ? "linear-gradient(135deg,rgba(139,92,246,0.3),rgba(109,40,217,0.18))" : "rgba(255,255,255,0.03)", borderTop:technology === id ? "1px solid rgba(139,92,246,0.55)" : "1px solid rgba(255,255,255,0.06)", borderBottom:technology === id ? "1px solid rgba(139,92,246,0.55)" : "1px solid rgba(255,255,255,0.06)", borderLeft:technology === id ? "1px solid rgba(139,92,246,0.55)" : "1px solid rgba(255,255,255,0.06)", borderRight:"none", color: technology === id ? "#ede9fe" : "rgba(255,255,255,0.3)", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:13, opacity: technology === id ? 1 : 0.4 }}>{icon}</span>
                <div style={{ textAlign:"left" }}><div style={{ fontSize:11, fontWeight:700 }}>{label}</div><div style={{ fontSize:9, opacity:0.5, marginTop:1 }}>{desc}</div></div>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setModal(id); }} style={{ width:26, borderRadius:"0 12px 12px 0", cursor:"pointer", background: technology === id ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)", borderTop:technology === id ? "1px solid rgba(139,92,246,0.55)" : "1px solid rgba(255,255,255,0.06)", borderBottom:technology === id ? "1px solid rgba(139,92,246,0.55)" : "1px solid rgba(255,255,255,0.06)", borderRight:technology === id ? "1px solid rgba(139,92,246,0.55)" : "1px solid rgba(255,255,255,0.06)", borderLeft:`1px solid ${technology === id ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)"}`, color: technology === id ? "rgba(196,181,253,0.9)" : "rgba(255,255,255,0.3)", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"serif", fontStyle:"italic" }}>i</button>
            </div>
          ))}
        </div>
      </div>
      {modal && info && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)" }} onClick={() => setModal(null)}>
          <div className="relative w-full max-w-2xl rounded-[28px] overflow-hidden" style={{ background:"linear-gradient(145deg,#0f0e1a,#13101f)", border:"1px solid rgba(139,92,246,0.3)", boxShadow:"0 24px 80px rgba(0,0,0,0.8)", maxHeight:"85vh", display:"flex", flexDirection:"column" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModal(null)} style={{ position:"absolute", top:16, right:16, zIndex:10, fontSize:22, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.5)", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.6)", cursor:"pointer" }}>×</button>
            <div style={{ position:"relative", width:"100%", height:260, flexShrink:0, overflow:"hidden" }}>
              {info.photos.map((p, idx) => (<div key={idx} style={{ position:"absolute", inset:0, opacity: photoIdx === idx ? 1 : 0, transition:"opacity 0.6s ease", backgroundImage:`url(${p.url})`, backgroundSize:"cover", backgroundPosition:p.position, backgroundRepeat:"no-repeat" }} />))}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(15,14,26,0.88) 78%, #0f0e1a 100%)", pointerEvents:"none" }} />
            </div>
            <div className="overflow-y-auto" style={{ padding:"20px 28px 32px" }}>
              <h2 className="text-3xl font-black text-white">{info.title}</h2>
              <p className="text-white/50 text-sm mt-1">{info.subtitle}</p>
              <p className="text-white/70 text-sm mt-3 leading-relaxed">{info.description}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {info.characteristics.map(c => (
                  <div key={c.title} style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.12)", borderRadius:16, padding:14 }}>
                    <div className="text-2xl mb-2">{c.icon}</div>
                    <div className="text-white font-bold text-sm">{c.title}</div>
                    <div className="text-white/55 text-xs mt-1.5 leading-relaxed">{c.description}</div>
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

// ── Analysis badge ────────────────────────────────────────────────────────────

const AnalysisBadge = ({ modelStats, parsedWeight, fitsOriginal }) => {
  const hasDims = modelStats.dimensions !== "-";
  const dimParts = hasDims ? modelStats.dimensions.split(" × ") : [];
  const dims = [{ l:"X", v:dimParts[0], c:"#ef4444" }, { l:"Y", v:dimParts[1], c:"#22c55e" }, { l:"Z", v:dimParts[2], c:"#3b82f6" }];
  const hasFile = modelStats.fileName !== "-";
  return (
    <div style={{ background:"rgba(10,10,20,0.52)", backdropFilter:"blur(32px) saturate(200%)", WebkitBackdropFilter:"blur(32px) saturate(200%)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"18px", padding:"14px 16px", boxShadow:"0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
        <span style={{ fontSize:"10px", letterSpacing:"0.16em", color:"rgba(255,255,255,0.3)", fontWeight:600, textTransform:"uppercase" }}>Analysis</span>
        <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"10px", fontWeight:700, color:"#4ade80", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.18)", borderRadius:"999px", padding:"2px 7px" }}>
          <span style={{ width:4, height:4, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />Ready
        </span>
      </div>
      <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"0 0 10px" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
        <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.32)" }}>File</span>
        <span style={{ fontSize:"11px", fontWeight:600, color:"rgba(255,255,255,0.82)", maxWidth:"140px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{modelStats.fileName}</span>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.32)" }}>Weight</span>
        <span style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.88)" }}>{parsedWeight} g</span>
      </div>
      {hasDims && (
        <div className="hidden sm:block">
          <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"10px 0" }} />
          <div style={{ display:"flex", gap:"5px" }}>
            {dims.map(({ l, v, c }) => (
              <div key={l} style={{ flex:1, background:"rgba(255,255,255,0.03)", border:`1px solid ${c}28`, borderRadius:"10px", padding:"5px 3px", textAlign:"center" }}>
                <div style={{ fontSize:"9px", color:c, fontWeight:700 }}>{l}</div>
                <div style={{ fontSize:"9.5px", color:"rgba(255,255,255,0.78)", fontWeight:600, marginTop:"2px" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasFile && (
        <>
          <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"10px 0" }} />
          {fitsOriginal && (
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, fontWeight:700, color:"#10b981", marginBottom:6 }}>
              ✅ <span>Entra en impresora</span>
            </div>
          )}
          {modelStats.needsSupports ? (
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, fontWeight:700, color:"#f59e0b", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:999, padding:"3px 8px" }}>⚠ Requiere soportes</div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, fontWeight:700, color:"#10b981", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:999, padding:"3px 8px" }}>✓ Sin soportes</div>
          )}
        </>
      )}
    </div>
  );
};

// ── Size warning box ──────────────────────────────────────────────────────────

const SizeWarningBox = ({ minScalePct, scaledDimsAtMin, onSelectScale, onSelectResize }) => {
  const [sel, setSel] = useState("scale");
  const card = (id, title, body, extra) => (
    <div onClick={() => setSel(id)} style={{ background: sel === id ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${sel === id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius:16, padding:18, cursor:"pointer", transition:"all 0.2s ease", marginBottom:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
        <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${sel === id ? "#8b5cf6" : "rgba(255,255,255,0.3)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {sel === id && <div style={{ width:8, height:8, borderRadius:"50%", background:"#8b5cf6" }} />}
        </div>
        <p style={{ fontWeight:700, color:"rgba(255,255,255,0.9)", fontSize:14 }}>{title}</p>
      </div>
      <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.55, paddingLeft:26 }}>{body}</p>
      {extra && <div style={{ paddingLeft:26, marginTop:8 }}>{extra}</div>}
    </div>
  );
  return (
    <div style={{ background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.25)", borderRadius:24, padding:28, marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:16 }}>
        <span style={{ fontSize:28, flexShrink:0, lineHeight:1 }}>📐</span>
        <div>
          <p style={{ fontWeight:900, color:"#fff", fontSize:15, lineHeight:1.3 }}>Tu modelo es más grande de lo que podemos imprimir en tamaño completo</p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:4 }}>No te preocupes — tienes dos opciones:</p>
        </div>
      </div>

      {card("scale",
        "Reducir el tamaño automáticamente",
        `Tu modelo se ajusta al ${minScalePct}% de su tamaño original. La calidad y los detalles se mantienen perfectamente.`,
        <>
          {scaledDimsAtMin && <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginBottom:6 }}>Tamaño resultante: {scaledDimsAtMin}</p>}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#10b981", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:999, padding:"2px 8px" }}>✅ Recomendado</span>
            <span style={{ fontSize:11, color:"#10b981" }}>🟢 Listo para imprimir</span>
          </div>
        </>
      )}

      {card("resize",
        "Pedir al equipo de Inity 3D que lo redimensione profesionalmente",
        "Nuestro equipo ajusta y optimiza tu modelo para impresión. Te enviamos una vista previa antes de confirmar.",
        <div style={{ display:"flex", gap:16 }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>⏱ Tiempo: 24-48 horas</span>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>💰 Costo adicional: ₡5,000</span>
        </div>
      )}

      <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginBottom:14 }}>Elige tu preferencia para continuar:</p>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onSelectScale} className="primary-button" style={{ flex:1, padding:"11px 0", borderRadius:14, fontWeight:700, fontSize:14, cursor:"pointer" }}>
          Reducir automáticamente
        </button>
        <button onClick={onSelectResize} style={{ flex:1, padding:"11px 0", borderRadius:14, fontWeight:700, fontSize:14, cursor:"pointer", background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.28)", color:"#c4b5fd", transition:"all 0.2s ease" }}>
          Pedir ajuste
        </button>
      </div>
    </div>
  );
};

// ── Resize request form ───────────────────────────────────────────────────────

const ResizeRequestForm = ({ buildCheck, modelStats, onReset, onComplete }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ sizePreference:"maxFit", specificH:"", specificW:"", criticalParts:"", specialInstructions:"", name:"", email:"", phone:"" });
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none text-white text-sm focus:border-violet-500/60 transition-all placeholder:text-white/25";

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = Date.now().toString();
    const ref = "#" + id.slice(-6);
    const orderData = {
      id, ref, timestamp: new Date().toISOString(),
      type: "resize_request", status: "resize_pending",
      customer: { name: form.name, company: "", email: form.email, phone: form.phone, notes: form.specialInstructions },
      quote: {
        fileName: modelStats.fileName, dimensions: modelStats.dimensions,
        material: null, color: null, quantity: 1, urgency: "normal",
        unitPrice: 5000, totalPrice: 5000, currency: "CRC", vatIncluded: false,
      },
      admin: {
        originalDimensions: modelStats.dimensions,
        printerVolume: buildCheck?.printerVolume || "",
        overflowMM: buildCheck?.overflowMM || {},
        exceeded: buildCheck?.exceeded || {},
        resizeInstructions: {
          sizePreference: form.sizePreference,
          specificH: form.sizePreference === "specific" ? form.specificH : null,
          specificW: form.sizePreference === "specific" ? form.specificW : null,
          criticalParts: form.criticalParts,
          specialInstructions: form.specialInstructions,
        },
        resizeFee: 5000,
        requestedSize: form.sizePreference === "specific"
          ? `${form.specificH}mm × ${form.specificW}mm`
          : form.sizePreference,
      },
    };
    const orders = JSON.parse(localStorage.getItem("inity_orders") || "[]");
    orders.unshift(orderData);
    localStorage.setItem("inity_orders", JSON.stringify(orders));
    if (form.email) {
      const customers = JSON.parse(localStorage.getItem("inity_customers") || "[]");
      const idx = customers.findIndex(c => c.email === form.email);
      if (idx >= 0) {
        customers[idx].lastOrder = orderData.timestamp; customers[idx].totalOrders += 1;
        customers[idx].name = form.name; customers[idx].phone = form.phone;
      } else {
        customers.push({ id: form.email, name: form.name, company: "", email: form.email, phone: form.phone, firstOrder: orderData.timestamp, lastOrder: orderData.timestamp, totalOrders: 1, totalSpent: 0, status: "prospect" });
      }
      localStorage.setItem("inity_customers", JSON.stringify(customers));
    }
    setRefNum(ref); setSubmitted(true);
  };

  if (submitted) return (
    <div style={{ textAlign:"center", padding:"24px 0" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
      <h3 style={{ fontWeight:900, color:"#fff", fontSize:20, marginBottom:8 }}>¡Solicitud de ajuste recibida!</h3>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.6, marginBottom:16 }}>
        Te enviaremos una vista previa del modelo ajustado a{" "}
        <strong style={{ color:"#c4b5fd" }}>{form.email}</strong>{" "}en 24-48 horas.
      </p>
      <div style={{ background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:14, padding:"10px 20px", display:"inline-block", marginBottom:20 }}>
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.12em" }}>Referencia</p>
        <p style={{ fontSize:20, fontWeight:800, color:"#c4b5fd", marginTop:2 }}>{refNum}</p>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={() => { onReset(); onComplete(); }} style={{ flex:1, padding:"12px 0", borderRadius:14, fontWeight:700, fontSize:13, cursor:"pointer", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)" }}>
          Ver otra cotización
        </button>
        <button onClick={() => navigate("/")} className="primary-button" style={{ flex:1, padding:"12px 0", borderRadius:14, fontWeight:700, fontSize:13, cursor:"pointer" }}>
          Volver al inicio
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <p style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#a78bfa", marginBottom:4 }}>AJUSTE PROFESIONAL</p>
      <h3 style={{ fontWeight:900, color:"#fff", fontSize:18, marginBottom:4 }}>Solicitar ajuste profesional</h3>
      <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginBottom:18 }}>
        Cuéntanos cómo quieres tu pieza y nuestro equipo la optimiza para impresión
      </p>
      <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:8 }}>¿Qué tan grande quieres la pieza?</label>
          {[["maxFit","Lo más grande posible (máx. impresora)"],["specific","Un tamaño específico"],["teamDecides","A criterio del equipo"]].map(([v,l]) => (
            <label key={v} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"10px 12px", borderRadius:12, marginBottom:5, background: form.sizePreference === v ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)", border: form.sizePreference === v ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(255,255,255,0.06)", transition:"all 0.15s" }}>
              <input type="radio" name="sizePreference" value={v} checked={form.sizePreference === v} onChange={() => set("sizePreference", v)} style={{ accentColor:"#7c3aed" }} />
              <span style={{ fontSize:13, color: form.sizePreference === v ? "#c4b5fd" : "rgba(255,255,255,0.6)" }}>{l}</span>
            </label>
          ))}
          {form.sizePreference === "specific" && (
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:4 }}>Alto (mm)</label>
                <input type="number" value={form.specificH} onChange={e => set("specificH", e.target.value)} placeholder="ej. 200" className={inputCls} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:4 }}>Ancho (mm)</label>
                <input type="number" value={form.specificW} onChange={e => set("specificW", e.target.value)} placeholder="ej. 150" className={inputCls} />
              </div>
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:6 }}>¿Hay partes que NO deben cambiar de tamaño?</label>
          <textarea value={form.criticalParts} onChange={e => set("criticalParts", e.target.value)} rows={2} placeholder='Ej: "El hueco del tornillo debe quedar en 4mm exactos"' className={inputCls + " resize-none"} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:6 }}>¿Alguna instrucción especial?</label>
          <textarea value={form.specialInstructions} onChange={e => set("specialInstructions", e.target.value)} rows={2} placeholder="Ej: Quiero que el logo quede más visible, orientar de otra forma, etc." className={inputCls + " resize-none"} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:6 }}>Tu nombre *</label>
          <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Tu nombre completo" className={inputCls} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:6 }}>Tu email *</label>
          <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="tu@email.com" className={inputCls} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:6 }}>WhatsApp</label>
          <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+506 XXXX-XXXX" className={inputCls} />
        </div>
        <div style={{ padding:"12px 14px", borderRadius:12, background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.2)" }}>
          <p style={{ fontSize:11, color:"rgba(196,181,253,0.8)", lineHeight:1.55 }}>
            📋 Recibirás una vista previa del modelo ajustado antes de confirmar la impresión. Tiempo estimado: 24-48 horas hábiles. Costo del servicio: ₡5,000 (se descuenta del precio final si decides imprimir con nosotros).
          </p>
        </div>
        <button type="submit" className="primary-button" style={{ width:"100%", padding:"14px 0", borderRadius:14, fontWeight:700, fontSize:15, cursor:"pointer" }}>
          Enviar solicitud de ajuste →
        </button>
      </form>
    </div>
  );
};

// ── Checkout modal ────────────────────────────────────────────────────────────

const URGENCY_OPTS = [
  { value:"normal", label:"Sin urgencia (3-5 días hábiles)",    multiplier: 1.0 },
  { value:"semi",   label:"Semi-urgente (48 horas) +20%",       multiplier: 1.2 },
  { value:"urgent", label:"Urgente (24 horas) +50%",            multiplier: 1.5 },
];

const CheckoutModal = ({ onClose, pricing, modelStats, selectedMaterial, selectedColor, settings, parsedWeight, activePrinter, buildCheck, sizeMode, userScale }) => {
  const [form, setForm] = useState({ name:"", company:"", email:"", phone:"", quantity:"1", urgency:"normal", notes:"" });
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const urgencyOpt = URGENCY_OPTS.find(o => o.value === form.urgency) || URGENCY_OPTS[0];
  const unitPrice  = Math.round((pricing.salePrice * urgencyOpt.multiplier) / 500) * 500;
  const qty        = Math.max(1, parseInt(form.quantity) || 1);
  const totalPrice = unitPrice * qty;

  const handleSubmit = (e) => {
    e.preventDefault();
    const id  = Date.now().toString();
    const ref = "#" + id.slice(-6);

    const orderData = {
      id, ref,
      timestamp: new Date().toISOString(),
      status: "pending",
      customer: { name: form.name, company: form.company, email: form.email, phone: form.phone, notes: form.notes },
      quote: {
        fileName:   modelStats.fileName,
        dimensions: modelStats.dimensions,
        material:   selectedMaterial,
        color:      selectedColor?.name || "Sin color",
        quantity:   qty,
        urgency:    form.urgency,
        unitPrice,
        totalPrice,
        currency:   "CRC",
        vatIncluded: false,
      },
      admin: {
        costReal:         pricing.costReal,
        salePrice:        pricing.salePrice,
        margin:           pricing.margin,
        printHours:       pricing.printHours,
        printTimeLabel:   formatPrintTime(pricing.printHours || 0),
        weightG:          parsedWeight,
        effectiveWeightG: pricing.effectiveWeight || pricing.effectiveVol || parsedWeight,
        supportLevel:     modelStats.supportLevel || "none",
        needsSupports:    modelStats.needsSupports || false,
        overhangPct:      ((modelStats.overhangRatio || 0) * 100).toFixed(1) + "%",
        // Build volume check data (admin only)
        buildCheck: buildCheck ? {
          originalDimensions: buildCheck.originalDimensions,
          printerVolume:      buildCheck.printerVolume,
          exceeded:           buildCheck.exceeded,
          overflowMM:         buildCheck.overflowMM,
          minScalePct:        buildCheck.minScalePct,
          customerScalePct:   sizeMode === "scaled" ? userScale : 100,
          fitsOriginal:       buildCheck.fitsOriginal,
        } : null,
        modelScale: sizeMode === "scaled" ? userScale / 100 : 1.0,
        breakdown: {
          materialBase:  pricing.materialBase,
          supportMat:    pricing.supportMatCost,
          electricity:   pricing.electricity,
          amortization:  pricing.amortization,
          labor:         pricing.labor,
          failureCost:   pricing.failureCost,
          costReal:      pricing.costReal,
          markup:        pricing.markup,
          salePrice:     pricing.salePrice,
        },
        printer: activePrinter ? { name: activePrinter.name, profile: activePrinter.defaultProfile } : null,
      },
    };

    const orders = JSON.parse(localStorage.getItem("inity_orders") || "[]");
    orders.unshift(orderData);
    localStorage.setItem("inity_orders", JSON.stringify(orders));

    const customers = JSON.parse(localStorage.getItem("inity_customers") || "[]");
    const existing = customers.findIndex(c => c.email === form.email);
    if (existing >= 0) {
      customers[existing].lastOrder   = orderData.timestamp;
      customers[existing].totalOrders += 1;
      customers[existing].name        = form.name;
      customers[existing].company     = form.company;
      customers[existing].phone       = form.phone;
    } else {
      customers.push({ id: form.email, name: form.name, company: form.company, email: form.email, phone: form.phone, firstOrder: orderData.timestamp, lastOrder: orderData.timestamp, totalOrders: 1, totalSpent: 0, status: "prospect" });
    }
    localStorage.setItem("inity_customers", JSON.stringify(customers));

    setRefNum(ref);
    setSubmitted(true);
  };

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none text-white text-sm focus:border-violet-500/60 transition-all placeholder:text-white/25";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background:"rgba(0,0,0,0.8)", backdropFilter:"blur(16px)" }}
      onClick={onClose}>
      <div className="relative w-full max-w-xl rounded-[28px] overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background:"linear-gradient(145deg,#0d0c1a,#121020)", border:"1px solid rgba(139,92,246,0.3)", boxShadow:"0 32px 80px rgba(0,0,0,0.8)" }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, zIndex:10, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.08)", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:20 }}>×</button>
        <div className="overflow-y-auto" style={{ padding:"28px 28px 32px" }}>
          {submitted ? (
            <div className="text-center py-8">
              <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
              <h3 className="text-2xl font-black text-white">¡Solicitud recibida!</h3>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginTop:8, lineHeight:1.6 }}>
                Te enviaremos la cotización formal a <strong style={{ color:"#c4b5fd" }}>{form.email}</strong><br />
                en menos de {settings?.responseTimeH || 2} horas durante días hábiles.
              </p>
              <div className="mt-6 py-3 px-5 rounded-xl inline-block" style={{ background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.3)" }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Número de referencia</p>
                <p style={{ fontSize:22, fontWeight:800, color:"#c4b5fd", marginTop:2 }}>{refNum}</p>
              </div>
              <div className="mt-6 p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex justify-between text-sm mb-1"><span className="text-white/40">Material</span><span className="text-white/80">{selectedMaterial} — {selectedColor?.name}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-white/40">Cantidad</span><span className="text-white/80">{qty} piezas</span></div>
                <div className="flex justify-between text-sm font-bold mt-2 pt-2" style={{ borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-white/60">Total estimado</span>
                  <span className="text-violet-400">{formatCRC(totalPrice)}</span>
                </div>
              </div>
              <button onClick={onClose} className="mt-8 primary-button px-8 py-3 rounded-2xl font-bold">Cerrar</button>
            </div>
          ) : (
            <>
              <p className="uppercase tracking-[0.25em] text-violet-400 text-xs mb-1">COTIZACIÓN EMPRESARIAL</p>
              <h3 className="text-2xl font-black text-white">Solicitar Cotización</h3>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:4, marginBottom:20, lineHeight:1.5 }}>
                {settings?.welcomeMessage || "Completa tus datos y te enviamos una cotización formal en menos de 2 horas"}
              </p>
              <div className="mb-6 p-4 rounded-2xl" style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.15em" }}>Precio estimado</p>
                    <p style={{ fontSize:28, fontWeight:900, color:"#a78bfa", lineHeight:1 }}>{formatCRC(unitPrice)}</p>
                    {qty > 1 && <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>× {qty} piezas = {formatCRC(totalPrice)}</p>}
                    {sizeMode === "scaled" && <p style={{ fontSize:11, color:"rgba(167,139,250,0.6)", marginTop:3 }}>Tamaño al {userScale}%</p>}
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>{selectedMaterial}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{modelStats.fileName}</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-white/40 block mb-1.5">Nombre completo *</label><input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Tu nombre" className={inputCls} /></div>
                  <div><label className="text-xs text-white/40 block mb-1.5">Empresa / Organización *</label><input required value={form.company} onChange={e => set("company", e.target.value)} placeholder="Tu empresa" className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-white/40 block mb-1.5">Email corporativo *</label><input type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@empresa.com" className={inputCls} /></div>
                  <div><label className="text-xs text-white/40 block mb-1.5">Teléfono / WhatsApp *</label><input required value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+506 XXXX-XXXX" className={inputCls} /></div>
                </div>
                <div><label className="text-xs text-white/40 block mb-1.5">Cantidad de piezas</label><input type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} className={inputCls} /></div>
                <div>
                  <label className="text-xs text-white/40 block mb-2">¿Tienes un plazo de entrega?</label>
                  <div className="space-y-2">
                    {URGENCY_OPTS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all" style={{ background: form.urgency === opt.value ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.02)", border: form.urgency === opt.value ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.06)" }}>
                        <input type="radio" name="urgency" value={opt.value} checked={form.urgency === opt.value} onChange={() => set("urgency", opt.value)} style={{ accentColor:"#7c3aed" }} />
                        <div className="flex-1"><span style={{ fontSize:13, color: form.urgency === opt.value ? "#c4b5fd" : "rgba(255,255,255,0.6)", fontWeight: form.urgency === opt.value ? 600 : 400 }}>{opt.label}</span></div>
                        {opt.multiplier > 1 && <span style={{ fontSize:12, fontWeight:700, color:"#f59e0b" }}>{formatCRC(Math.round(pricing.salePrice * opt.multiplier / 500) * 500)}</span>}
                      </label>
                    ))}
                  </div>
                </div>
                <div><label className="text-xs text-white/40 block mb-1.5">Notas adicionales</label><textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Materiales especiales, acabados, uso final..." className={inputCls + " resize-none"} /></div>
                <button type="submit" className="w-full primary-button py-4 rounded-2xl font-bold text-lg mt-2">Enviar Solicitud →</button>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" }}>Precio para clientes empresariales · IVA no incluido</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Build volume check helper ─────────────────────────────────────────────────

const computeBuildCheck = (dimensionsStr, buildVolume) => {
  if (!dimensionsStr || dimensionsStr === "-" || !buildVolume) return null;
  const parts = dimensionsStr.replace(" mm", "").split(" × ").map(parseFloat);
  if (parts.some(isNaN) || parts.length < 3) return null;
  const [dX, dY, dZ] = parts;
  const { x: bvX, y: bvY, z: bvZ } = buildVolume;
  const exceeded = { x: dX > bvX, y: dY > bvY, z: dZ > bvZ };
  const fitsOriginal = !exceeded.x && !exceeded.y && !exceeded.z;
  const overflowMM = {
    x: +(Math.max(0, dX - bvX).toFixed(1)),
    y: +(Math.max(0, dY - bvY).toFixed(1)),
    z: +(Math.max(0, dZ - bvZ).toFixed(1)),
  };
  const minScaleDecimal = Math.min(bvX / dX, bvY / dY, bvZ / dZ);
  const minScalePct = Math.max(1, Math.min(99, Math.floor(minScaleDecimal * 100)));
  return {
    fitsOriginal, exceeded, overflowMM, minScalePct,
    originalDimensions: dimensionsStr,
    printerVolume: `${bvX} × ${bvY} × ${bvZ} mm`,
  };
};

const scaleDimensions = (dimensionsStr, scalePct) => {
  if (!dimensionsStr || dimensionsStr === "-") return null;
  const scale = scalePct / 100;
  const clean = dimensionsStr.replace(" mm", "").split(" × ");
  return clean.map(v => (parseFloat(v) * scale).toFixed(0)).join(" × ") + " mm";
};

// ── Main page ─────────────────────────────────────────────────────────────────

const QuotePage = ({ materials, printers, getActivePrinter, settings }) => {
  const [file, setFile] = useState(null);
  const [technology, setTechnology] = useState("fdm");
  const [modelSize, setModelSize] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Size / scale state
  const [sizeMode, setSizeMode] = useState(null);  // null | "scaled" | "resize_request"
  const [userScale, setUserScale] = useState(100); // percentage

  const [modelStats, setModelStats] = useState({
    fileName: "-", dimensions: "-", materialUsage: "0", complexity: "-",
    supportLevel: "none", needsSupports: false, overhangRatio: 0,
    supportExtraMaterial: 0, supportExtraTime: 0,
  });

  const materialNames = Object.keys(materials).filter(
    name => !materials[name].technology || materials[name].technology === technology
  );

  const [selectedMaterial, setSelectedMaterial] = useState(materialNames[0]);
  const [selectedColor, setSelectedColor] = useState(materials[materialNames[0]]?.colors?.[0] || null);

  React.useEffect(() => {
    if (!materialNames.includes(selectedMaterial)) {
      const first = materialNames[0] ?? null;
      setSelectedMaterial(first);
      setSelectedColor(first ? (materials[first]?.colors?.find(c => !c.hidden) ?? null) : null);
      return;
    }
    if (selectedColor) {
      const colors = materials[selectedMaterial]?.colors ?? [];
      const fresh = colors.find(c => c.name === selectedColor.name);
      if (!fresh || fresh.hidden) setSelectedColor(colors.find(c => !c.hidden) ?? null);
      else if (fresh.hex !== selectedColor.hex || fresh.finish !== selectedColor.finish || fresh.hidden !== selectedColor.hidden) setSelectedColor(fresh);
    }
  }, [technology, materials]);

  // Reset size mode when a new file loads
  React.useEffect(() => {
    setSizeMode(null);
  }, [modelStats.fileName]);

  const selectedColors = materials[selectedMaterial]?.colors || [];
  const parsedWeight   = parseFloat(modelStats.materialUsage) || 0;
  const activePrinter  = getActivePrinter(technology);
  const markup         = settings?.commercialMarkup || 2.5;
  const minimumPrice   = settings?.minimumPrice || 5000;

  // Build volume check
  const buildCheck = useMemo(() => {
    return computeBuildCheck(modelStats.dimensions, activePrinter?.buildVolume);
  }, [modelStats.dimensions, activePrinter?.buildVolume]);

  const fitsOriginal = buildCheck?.fitsOriginal ?? true;

  // Auto-set userScale to minScalePct when new model exceeds limits
  React.useEffect(() => {
    if (buildCheck && !buildCheck.fitsOriginal) {
      setUserScale(buildCheck.minScalePct);
    } else {
      setUserScale(100);
    }
  }, [buildCheck?.fitsOriginal, buildCheck?.minScalePct]);

  // Scaled dim strings for display
  const scaledDimsAtMin  = buildCheck && !buildCheck.fitsOriginal ? scaleDimensions(modelStats.dimensions, buildCheck.minScalePct) : null;
  const scaledDimsAtUser = scaleDimensions(modelStats.dimensions, userScale);

  // Effective weight for pricing (accounts for scale³)
  const weightForPricing = useMemo(() => {
    if (sizeMode === "scaled") return parsedWeight * Math.pow(userScale / 100, 3);
    return parsedWeight;
  }, [parsedWeight, sizeMode, userScale]);

  // modelScale to pass to ModelViewer
  const modelScaleProp = sizeMode === "scaled" ? userScale / 100 : 1.0;

  const pricing = useMemo(() => {
    const empty = { salePrice:0, costReal:0, printHours:0, needsPrinter:false, materialBase:0, supportMatCost:0, materialCost:0, electricity:0, amortization:0, labor:0, failureCost:0, subtotal:0, needsSupports:false, supportLevel:"none" };
    if (!activePrinter) return { ...empty, needsPrinter:true };
    const materialData = materials[selectedMaterial];
    if (!materialData || weightForPricing === 0) return empty;
    const costs = calculatePrinterCosts(activePrinter);
    const supportExtraMaterial = modelStats.supportExtraMaterial || 0;
    const supportExtraTime     = modelStats.supportExtraTime || 0;
    const supportLevel         = modelStats.supportLevel || "none";
    if (technology === "sla") {
      const density    = materialData.density || 1.10;
      const pricePerML = materialData.pricePerML || materialData.pricePerGram;
      return calculateSLAPrice({ weightGrams:weightForPricing, density, pricePerML, supportExtraMaterial, supportExtraTime, costs, markup, minimumPrice, supportLevel });
    }
    return calculateFDMPrice({ weightGrams:weightForPricing, pricePerGram:materialData.pricePerGram, supportExtraMaterial, supportExtraTime, costs, markup, minimumPrice, supportLevel });
  }, [weightForPricing, modelStats, selectedMaterial, materials, technology, activePrinter, markup, minimumPrice]);

  const badgeProps = { modelStats, parsedWeight, fitsOriginal };

  // Show the quote / price section only when model fits or user has chosen scale mode
  const showQuoteFlow = fitsOriginal || sizeMode === "scaled";

  return (
    <main className="section-background min-h-screen pt-24 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-16">
          <p className="hidden sm:block uppercase tracking-[0.35em] text-violet-400 text-sm">FABRICACIÓN PROFESIONAL</p>
          <h1 className="premium-heading text-4xl sm:text-6xl lg:text-7xl font-black mt-3 sm:mt-5 leading-[0.92]">
            Sube & <span className="text-violet-400">Cotiza</span>
          </h1>
          <p className="soft-text text-base sm:text-xl mt-4 sm:mt-8 max-w-3xl">
            Sube tu archivo STL u OBJ y recibe un análisis de manufactura instantáneo con cotización empresarial profesional.
          </p>
        </div>

        <div className={file ? "grid lg:grid-cols-[1.35fr_0.65fr] gap-6 sm:gap-10 items-start" : "grid grid-cols-1 gap-10"}>

          {/* VIEWER */}
          <div className={`relative rounded-[28px] sm:rounded-[42px] ${file ? "h-[380px] sm:h-[560px] lg:h-[820px]" : "h-[380px] sm:h-[480px] lg:h-[600px]"}`} style={{ background:"linear-gradient(145deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)", border:"1px solid rgba(139,92,246,0.2)", boxShadow:"0 0 0 1px rgba(255,255,255,0.04),0 30px 80px rgba(0,0,0,0.6),0 0 140px rgba(109,40,217,0.15), inset 0 0 120px rgba(0,0,0,0.6)", backdropFilter:"blur(20px)", overflow:"hidden", transition:"height 0.5s ease" }}>
            {file && <TechnologySelector technology={technology} setTechnology={setTechnology} />}
            {file && (
              <div className="absolute top-6 right-6 z-30 hidden lg:block" style={{ minWidth:"196px" }}>
                <AnalysisBadge {...badgeProps} />
              </div>
            )}
            <div className={`w-full relative ${file ? "h-[380px] sm:h-[560px] lg:h-[820px]" : "h-[380px] sm:h-[480px] lg:h-[600px]"}`} style={{ transition:"height 0.5s ease" }}>
              {!file && (<div className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:p-10"><InlineUpload onFileUpload={setFile} /></div>)}
              {file && (<div className="absolute top-6 left-6 z-30"><InlineUploadCompact onFileUpload={setFile} /></div>)}
              <ViewerCanvas modelSize={modelSize} loading={isLoading} hasFile={!!file} glowMode={selectedColor?.finish === "glow"} glowColor={selectedColor?.hex}>
                {file && (
                  <ModelViewer
                    file={file} selectedColor={selectedColor} setModelStats={setModelStats}
                    selectedMaterial={selectedMaterial} materials={materials}
                    onModelSizeChange={setModelSize} onLoadingChange={setIsLoading}
                    technology={technology}
                    modelScale={modelScaleProp}
                  />
                )}
              </ViewerCanvas>
            </div>
          </div>

          {/* QUOTE PANEL */}
          {file && (
            <div className="glass-card rounded-[28px] sm:rounded-[42px] border border-white/10 p-5 sm:p-8 lg:p-10 lg:sticky lg:top-28">

              {/* Badge — mobile */}
              <div className="lg:hidden mb-6">
                <AnalysisBadge {...badgeProps} />
              </div>

              <p className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.2em]">COTIZACIÓN</p>
              <h2 className="text-4xl sm:text-5xl font-black leading-[0.9] mt-3 sm:mt-5">Precio<br />Instant</h2>

              {/* ── SIZE WARNING (when doesn't fit, no mode chosen) ── */}
              {!fitsOriginal && sizeMode === null && (
                <div className="mt-6">
                  <SizeWarningBox
                    minScalePct={buildCheck.minScalePct}
                    scaledDimsAtMin={scaledDimsAtMin}
                    onSelectScale={() => setSizeMode("scaled")}
                    onSelectResize={() => setSizeMode("resize_request")}
                  />
                </div>
              )}

              {/* ── SCALE MODE ACTIVE ── */}
              {!fitsOriginal && sizeMode === "scaled" && (
                <div className="mt-6 mb-2">
                  {/* Compact banner */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:12, background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.25)", marginBottom:14 }}>
                    <span style={{ fontSize:13, color:"#c4b5fd", fontWeight:600 }}>📐 Reduciendo al {userScale}% del tamaño original</span>
                    <button onClick={() => setSizeMode(null)} style={{ fontSize:12, color:"rgba(255,255,255,0.4)", cursor:"pointer", background:"none", border:"none", textDecoration:"underline" }}>← Cambiar</button>
                  </div>
                  {/* Slider */}
                  <div style={{ padding:"16px", borderRadius:14, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:12 }}>Puedes ajustar el tamaño exacto con el control:</p>
                    <input
                      type="range"
                      min={buildCheck.minScalePct}
                      max={100}
                      step={1}
                      value={userScale}
                      onChange={e => setUserScale(+e.target.value)}
                      style={{ width:"100%", accentColor:"#7c3aed", cursor:"pointer" }}
                    />
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:4 }}>
                      <span>{buildCheck.minScalePct}% (mínimo)</span>
                      <span style={{ fontWeight:700, color:"#c4b5fd", fontSize:13 }}>{userScale}%</span>
                      <span>100%</span>
                    </div>
                    {scaledDimsAtUser && (
                      <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:8 }}>
                        Tamaño: <strong style={{ color:"rgba(255,255,255,0.8)" }}>{scaledDimsAtUser}</strong>
                      </p>
                    )}
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:4 }}>
                      Peso estimado: <strong style={{ color:"rgba(255,255,255,0.8)" }}>{(parsedWeight * Math.pow(userScale / 100, 3)).toFixed(1)}g</strong>
                    </p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:8, lineHeight:1.4 }}>
                      El tamaño mínimo para que quepa en nuestra impresora es {buildCheck.minScalePct}%
                    </p>
                  </div>
                </div>
              )}

              {/* ── RESIZE REQUEST MODE ── */}
              {sizeMode === "resize_request" && (
                <div className="mt-6">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:12, background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.25)", marginBottom:18 }}>
                    <span style={{ fontSize:13, color:"#93c5fd", fontWeight:600 }}>📐 Solicitando ajuste profesional</span>
                    <button onClick={() => setSizeMode(null)} style={{ fontSize:12, color:"rgba(255,255,255,0.4)", cursor:"pointer", background:"none", border:"none", textDecoration:"underline" }}>← Cambiar</button>
                  </div>
                  <ResizeRequestForm
                    buildCheck={buildCheck}
                    modelStats={modelStats}
                    onReset={() => setSizeMode(null)}
                    onComplete={() => setFile(null)}
                  />
                </div>
              )}

              {/* ── NORMAL QUOTE FLOW (fits or scale mode) ── */}
              {showQuoteFlow && sizeMode !== "resize_request" && (
                <>
                  {/* Material selection */}
                  <div className="mt-8 sm:mt-10">
                    <p className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.2em] mb-4 sm:mb-5">MATERIAL</p>
                    <div className="grid grid-cols-2 gap-3">
                      {materialNames.map(material => (
                        <button key={material}
                          onClick={() => { setSelectedMaterial(material); setSelectedColor(materials[material]?.colors?.find(c => !c.hidden) || null); }}
                          className={`rounded-2xl p-4 text-left transition-all duration-300 ${selectedMaterial === material ? "border border-violet-500 bg-violet-500/10 shadow-[0_0_40px_rgba(139,92,246,0.12)]" : "bg-white/[0.03] border border-white/10 hover:bg-white/[0.05]"}`}>
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-base font-black leading-tight">{material}</h3>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5 shrink-0 mt-0.5">
                              {materials[material].technology === "sla" ? "SLA" : "FDM"}
                            </span>
                          </div>
                          <p className="text-white/40 mt-1.5 text-xs">
                            {materials[material].technology === "sla" ? `₡${(materials[material].pricePerML ?? materials[material].pricePerGram).toLocaleString("es-CR")}/ml` : `₡${materials[material].pricePerGram.toLocaleString("es-CR")}/g`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Support banner */}
                  {modelStats.fileName !== "-" && (
                    <div className="mt-5" style={{ padding:"10px 14px", borderRadius:12, background: modelStats.needsSupports ? "rgba(245,158,11,0.06)" : "rgba(16,185,129,0.06)", border: modelStats.needsSupports ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(16,185,129,0.2)" }}>
                      <p style={{ fontSize:12, fontWeight:600, color: modelStats.needsSupports ? "#f59e0b" : "#10b981" }}>
                        {modelStats.needsSupports ? "⚠️ Requiere material de soporte — incluido en el precio" : "✅ Se puede imprimir sin soportes"}
                      </p>
                    </div>
                  )}

                  {/* Color selection */}
                  {selectedColors.length > 0 && (
                    <div className="mt-7">
                      <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        COLOR {selectedColor && <span className="normal-case tracking-normal font-semibold text-violet-300">· {selectedColor.name}</span>}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {selectedColors.filter(c => !c.hidden).map((color, idx) => (
                          <div key={`${idx}-${color.name}`} className="flex flex-col items-center gap-1">
                            <button onClick={() => setSelectedColor(color)} title={color.name}
                              className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor?.name === color.name ? "border-white scale-110" : "border-transparent hover:border-white/30"}`}
                              style={{ background:color.hex }} />
                            <span className="text-[9px] text-white/40 w-10 truncate text-center">{color.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price section */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    {pricing.needsPrinter ? (
                      <div style={{ padding:"14px", borderRadius:12, background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)" }}>
                        <p style={{ fontSize:13, color:"#f59e0b", fontWeight:600 }}>⚙️ No hay impresora para {technology.toUpperCase()}</p>
                        <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:3 }}>Configura una en el Dashboard.</p>
                      </div>
                    ) : (
                      <>
                        <p style={{ fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:6 }}>COSTO DE MANUFACTURA</p>
                        <h3 className="text-4xl sm:text-5xl font-black text-violet-400 leading-none break-all">
                          {formatCRC(pricing.salePrice)}
                        </h3>
                        <ul className="mt-4 space-y-1.5">
                          {[
                            "✓ Material de impresión incluido",
                            "✓ Mano de obra profesional",
                            "✓ Control de calidad",
                            ...(modelStats.needsSupports ? ["✓ Material de soporte"] : []),
                            "✓ Entrega en 3-5 días hábiles",
                          ].map(item => (
                            <li key={item} style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>{item}</li>
                          ))}
                        </ul>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:8, fontStyle:"italic" }}>
                          Precio para clientes empresariales · IVA no incluido
                        </p>
                      </>
                    )}

                    {!pricing.needsPrinter && weightForPricing > 0 && (
                      <button onClick={() => setShowModal(true)}
                        className="mt-6 w-full primary-button py-4 rounded-2xl sm:rounded-3xl text-base sm:text-lg font-bold">
                        Solicitar Cotización Formal →
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── PROMPT TO CHOOSE OPTION (when !fits and no mode yet) ── */}
              {!fitsOriginal && sizeMode === null && (
                <div className="mt-4" style={{ padding:"12px 14px", borderRadius:12, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", textAlign:"center" }}>
                    Elige una opción para ver el precio de fabricación
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CheckoutModal
          onClose={() => setShowModal(false)}
          pricing={pricing}
          modelStats={modelStats}
          selectedMaterial={selectedMaterial}
          selectedColor={selectedColor}
          settings={settings}
          parsedWeight={parsedWeight}
          activePrinter={activePrinter}
          buildCheck={buildCheck}
          sizeMode={sizeMode}
          userScale={userScale}
        />
      )}
    </main>
  );
};

export default QuotePage;
