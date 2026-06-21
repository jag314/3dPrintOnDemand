import React, { useState, useMemo } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import ViewerCanvas from "../components/upload/ViewerCanvas";
import ModelViewer from "../components/upload/ModelViewer";
import CheckoutFlow from "./CheckoutFlow";
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
        borderRadius:32, minHeight:"clamp(280px,40vw,320px)", width:"100%", maxWidth:580,
        display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",
        background: active ? "rgba(139,92,246,0.07)" : "rgba(255,255,255,0.015)",
        border: active ? "1.5px dashed rgba(139,92,246,0.6)" : "1.5px dashed rgba(255,255,255,0.09)",
        boxShadow: active ? "0 0 60px rgba(139,92,246,0.1)" : "none",
        position:"relative", overflow:"hidden",
        padding:"clamp(24px,4vw,48px) clamp(16px,3vw,32px)",
      }}
    >
      <input ref={inputRef} type="file" accept=".stl,.obj,.3mf" style={{ display:"none" }}
        onChange={(e) => { const f = e.target.files[0]; if (f) onFileUpload(f); }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 65%)", opacity:active?1:0, transition:"opacity 0.35s ease" }} />
      {[
        { top:16, left:16,  borderTop:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`, borderLeft:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}` },
        { top:16, right:16, borderTop:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`, borderRight:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}` },
        { bottom:16, left:16,  borderBottom:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`, borderLeft:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}` },
        { bottom:16, right:16, borderBottom:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}`, borderRight:`1.5px solid ${active?"rgba(139,92,246,0.6)":"rgba(255,255,255,0.12)"}` },
      ].map((s,i) => <div key={i} style={{ position:"absolute", width:20, height:20, transition:"border 0.35s ease", ...s }} />)}
      <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ width:80, height:80, borderRadius:24, margin:"0 auto", background:active?"rgba(139,92,246,0.18)":"rgba(139,92,246,0.08)", border:`1px solid rgba(139,92,246,${active?"0.5":"0.18"})`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.35s ease", boxShadow:active?"0 0 32px rgba(139,92,246,0.35)":"none", transform:hovered&&!dragging?"translateY(-4px)":dragging?"translateY(-6px) scale(1.05)":"none" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(167,139,250,0.8)", fontFamily:"Inter, sans-serif" }}>{dragging?"¡Soltá!":"Subir"}</span>
        </div>
        <h2 style={{ marginTop:28, fontSize:"clamp(22px,5vw,48px)", fontWeight:900, color:"#fff", lineHeight:1.1, fontFamily:"Inter, sans-serif", letterSpacing:"-0.03em" }}>
          Subí tus <span style={{ color:active?"#c4b5fd":"#a78bfa", transition:"color 0.3s ease" }}>Archivos 3D</span>
        </h2>
        <p style={{ marginTop:14, fontSize:"clamp(11px,2vw,13px)", color:active?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.3)", fontFamily:"Inter, sans-serif", transition:"color 0.3s ease" }}>
          {dragging?"Soltá para analizar":"Arrastrá o hacé clic para explorar  ·  STL, OBJ y 3MF soportados"}
        </p>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:20 }}>
          {[".STL",".OBJ",".3MF"].map(ext => (
            <span key={ext} style={{ fontSize:10, fontWeight:700, color:active?"rgba(167,139,250,0.8)":"rgba(255,255,255,0.25)", background:active?"rgba(139,92,246,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${active?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.08)"}`, borderRadius:6, padding:"3px 8px", fontFamily:"Inter, sans-serif", transition:"all 0.3s ease" }}>{ext}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const InlineUploadCompact = ({ onFileUpload }) => {
  const inputRef = React.useRef();
  return (
    <div onClick={() => inputRef.current?.click()} title="Subir nuevo archivo" style={{ width:58, height:58, borderRadius:16, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, cursor:"pointer", background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.28)", backdropFilter:"blur(16px)", transition:"all 0.2s ease", boxShadow:"0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
      <input ref={inputRef} type="file" accept=".stl,.obj,.3mf" style={{ display:"none" }} onChange={(e) => { const f = e.target.files[0]; if (f) onFileUpload(f); }} />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <span style={{ fontSize:8, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(167,139,250,0.7)", fontFamily:"Inter, sans-serif" }}>Subir</span>
    </div>
  );
};

// ── Technology selector ───────────────────────────────────────────────────────

const MATERIAL_INFO = {
  fdm: {
    title:"Impresión 3D FDM", subtitle:"Deposición de Filamento Fundido",
    description:"FDM fabrica piezas capa a capa fundiendo filamento termoplástico. Ideal para prototipos, piezas funcionales y modelos de gran tamaño.",
    priced:"Cotizado por peso (gramos)", badge:"FDM · Deposición de Material",
    photos:[
      { url:"/materials/fdm-1.png", caption:"FDM PLA — prototipo funcional",      position:"center center" },
      { url:"/materials/fdm-2.png", caption:"FDM PETG — pieza mecánica",          position:"center center" },
      { url:"/materials/fdm-3.png", caption:"FDM ABS — componente estructural",   position:"center center" },
    ],
    characteristics:[
      { icon:"⚡", title:"Entrega Rápida",           description:"Piezas listas en 24–48 horas para la mayoría de tamaños" },
      { icon:"💰", title:"Más Económico",             description:"Menor costo por pieza, ideal para prototipos" },
      { icon:"📐", title:"Gran Formato",              description:"Volumen de fabricación de hasta 300×300×400mm" },
      { icon:"🎨", title:"Gran Variedad de Colores",  description:"Más de 20 colores de filamento disponibles" },
      { icon:"♻️", title:"Eco Sostenible",            description:"El PLA es biodegradable y sostenible" },
      { icon:"🔧", title:"Piezas Funcionales",        description:"Resistentes para uso mecánico real" },
    ],
  },
  sla: {
    title:"Impresión 3D SLA", subtitle:"Estereolitografía · MSLA · DLP",
    description:"SLA cura resina fotopolimérica líquida con luz UV. Produce detalles ultra-finos, superficies lisas y excelente precisión.",
    priced:"Cotizado por volumen (ml)", badge:"SLA · Estereolitografía",
    photos:[
      { url:"/materials/sla-1.png", caption:"SLA Resina Estándar — prototipo liso",       position:"center center" },
      { url:"/materials/sla-2.png", caption:"SLA Alta Definición — miniaturas y joyería", position:"center center" },
      { url:"/materials/sla-3.png", caption:"SLA tipo ABS — pieza funcional resistente",  position:"center center" },
    ],
    characteristics:[
      { icon:"🔬", title:"Ultra Alta Definición",  description:"Capas de 50 micrones, superficies lisas" },
      { icon:"✨", title:"Acabado Liso",            description:"Calidad de superficie casi inyectada" },
      { icon:"💎", title:"Joyería y Miniaturas",   description:"Perfecto para piezas pequeñas e intrincadas" },
      { icon:"🦷", title:"Dental y Médico",         description:"Resinas biocompatibles disponibles" },
      { icon:"📏", title:"Alta Precisión",          description:"Precisión dimensional de ±0.05mm" },
      { icon:"🌊", title:"Piezas Herméticas",       description:"Totalmente selladas, sin huecos entre capas" },
    ],
  },
};

const TechnologySelector = ({ technology, setTechnology }) => {
  const [modal, setModal] = React.useState(null);
  const [photoIdx, setPhotoIdx] = React.useState(0);
  const info = modal ? MATERIAL_INFO[modal] : null;
  React.useEffect(() => { setPhotoIdx(0); }, [modal]);
  React.useEffect(() => {
    if (!modal) return;
    const len = MATERIAL_INFO[modal].photos.length;
    const timer = setInterval(() => setPhotoIdx(i => (i + 1) % len), 3000);
    return () => clearInterval(timer);
  }, [modal, photoIdx]);
  return (
    <>
      <div className="absolute top-6 z-30" style={{ left:"50%", transform:"translateX(-50%)", background:"rgba(10,10,20,0.72)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"18px", padding:"10px 10px", boxShadow:"0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize:"9px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.25)", fontWeight:600, textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>Tecnología</div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {[{id:"fdm",label:"FDM",desc:"PLA · PETG · ABS",icon:"⬡"},{id:"sla",label:"SLA",desc:"High detail · Resin",icon:"◈"}].map(({id,label,desc,icon}) => (
            <div key={id} style={{ display:"flex", alignItems:"stretch" }}>
              <button onClick={() => setTechnology(id)} style={{ padding:"7px 10px 7px 11px", borderRadius:"12px 0 0 12px", cursor:"pointer", transition:"all 0.2s ease", background:technology===id?"linear-gradient(135deg,rgba(139,92,246,0.3),rgba(109,40,217,0.18))":"rgba(255,255,255,0.03)", borderTop:technology===id?"1px solid rgba(139,92,246,0.55)":"1px solid rgba(255,255,255,0.06)", borderBottom:technology===id?"1px solid rgba(139,92,246,0.55)":"1px solid rgba(255,255,255,0.06)", borderLeft:technology===id?"1px solid rgba(139,92,246,0.55)":"1px solid rgba(255,255,255,0.06)", borderRight:"none", color:technology===id?"#ede9fe":"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:13, opacity:technology===id?1:0.4 }}>{icon}</span>
                <div style={{ textAlign:"left" }}><div style={{ fontSize:11, fontWeight:700 }}>{label}</div><div style={{ fontSize:9, opacity:0.5, marginTop:1 }}>{desc}</div></div>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setModal(id); }} style={{ width:26, borderRadius:"0 12px 12px 0", cursor:"pointer", background:technology===id?"rgba(139,92,246,0.18)":"rgba(255,255,255,0.04)", borderTop:technology===id?"1px solid rgba(139,92,246,0.55)":"1px solid rgba(255,255,255,0.06)", borderBottom:technology===id?"1px solid rgba(139,92,246,0.55)":"1px solid rgba(255,255,255,0.06)", borderRight:technology===id?"1px solid rgba(139,92,246,0.55)":"1px solid rgba(255,255,255,0.06)", borderLeft:`1px solid ${technology===id?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.04)"}`, color:technology===id?"rgba(196,181,253,0.9)":"rgba(255,255,255,0.3)", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"serif", fontStyle:"italic" }}>i</button>
            </div>
          ))}
        </div>
      </div>
      {modal && info && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)" }} onClick={() => setModal(null)}>
          <div className="relative w-full max-w-2xl rounded-[28px] overflow-hidden" style={{ background:"linear-gradient(145deg,#0f0e1a,#13101f)", border:"1px solid rgba(139,92,246,0.3)", boxShadow:"0 24px 80px rgba(0,0,0,0.8)", maxHeight:"85vh", display:"flex", flexDirection:"column" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModal(null)} style={{ position:"absolute", top:16, right:16, zIndex:10, fontSize:22, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.5)", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.6)", cursor:"pointer" }}>×</button>
            <div style={{ position:"relative", width:"100%", height:340, flexShrink:0, overflow:"hidden" }}>
              {info.photos.map((p,idx) => (
                <div key={idx} style={{ position:"absolute", inset:0, opacity:photoIdx===idx?1:0, transition:"opacity 0.6s ease", backgroundImage:`url(${p.url})`, backgroundSize:"cover", backgroundPosition:p.position||"center center", backgroundRepeat:"no-repeat" }} />
              ))}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 0%, rgba(15,14,26,0.55) 55%, #0f0e1a 100%)", pointerEvents:"none" }} />
              <button onClick={(e) => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + info.photos.length) % info.photos.length); }} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", zIndex:5, width:32, height:32, borderRadius:"50%", background:"rgba(0,0,0,0.45)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, lineHeight:1 }}>‹</button>
              <button onClick={(e) => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % info.photos.length); }} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", zIndex:5, width:32, height:32, borderRadius:"50%", background:"rgba(0,0,0,0.45)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, lineHeight:1 }}>›</button>
              <div style={{ position:"absolute", bottom:20, left:24 }}>
                <h2 style={{ fontSize:22, fontWeight:900, color:"#ffffff", margin:0, lineHeight:1.2 }}>{info.title}</h2>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.55)", margin:"4px 0 0" }}>{info.subtitle}</p>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:6, padding:"10px 0 2px", flexShrink:0 }}>
              {info.photos.map((_,idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setPhotoIdx(idx); }} style={{ width:photoIdx===idx?18:6, height:6, borderRadius:3, background:photoIdx===idx?"#a78bfa":"rgba(255,255,255,0.25)", border:"none", cursor:"pointer", transition:"all 0.3s ease", padding:0 }} />
              ))}
            </div>
            <div className="overflow-y-auto" style={{ padding:"12px 28px 28px" }}>
              <p className="text-white/70 text-sm leading-relaxed">{info.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {info.characteristics.slice(0,4).map(c => (
                  <div key={c.title} style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.12)", borderRadius:14, padding:10 }}>
                    <div className="text-xl mb-1">{c.icon}</div>
                    <div className="text-white font-bold text-sm">{c.title}</div>
                    <div className="text-white/55 text-xs mt-1 leading-relaxed">{c.description}</div>
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

// AnalysisBadge: shows file name, weight, dimensions, status, and support geometry warning.
// Receives `displayDimensions` (already scaled) so the X/Y/Z boxes always match the
// scale panel values. Build-volume capacity check is intentionally excluded here.
const AnalysisBadge = ({ modelStats, parsedWeight, displayDimensions }) => {
  const dimStr  = displayDimensions || modelStats.dimensions;
  const hasDims = dimStr !== "-";
  const dimParts = hasDims ? dimStr.replace(" mm","").split(" × ") : [];
  const dims = [{ l:"X", v:dimParts[0], c:"#ef4444" }, { l:"Y", v:dimParts[1], c:"#22c55e" }, { l:"Z", v:dimParts[2], c:"#3b82f6" }];
  const hasFile = modelStats.fileName !== "-";
  return (
    <div style={{ background:"rgba(10,10,20,0.52)", backdropFilter:"blur(32px) saturate(200%)", WebkitBackdropFilter:"blur(32px) saturate(200%)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"18px", padding:"14px 16px", boxShadow:"0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
        <span style={{ fontSize:"10px", letterSpacing:"0.16em", color:"rgba(255,255,255,0.3)", fontWeight:600, textTransform:"uppercase" }}>Análisis</span>
        <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"10px", fontWeight:700, color:"#4ade80", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.18)", borderRadius:"999px", padding:"2px 7px" }}>
          <span style={{ width:4, height:4, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />Listo
        </span>
      </div>
      <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"0 0 10px" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
        <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.32)" }}>Archivo</span>
        <span style={{ fontSize:"11px", fontWeight:600, color:"rgba(255,255,255,0.82)", maxWidth:"140px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{modelStats.fileName}</span>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.32)" }}>Peso</span>
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

// CheckoutModal replaced by CheckoutFlow (imported above).
// The full multi-step checkout (Delivery → SINPE Payment → Confirm) lives in
// src/pages/CheckoutFlow.jsx together with the step indicator and CR address data.

// ── Build volume helpers ──────────────────────────────────────────────────────

const computeBuildCheck = (dimensionsStr, buildVolume) => {
  if (!dimensionsStr || dimensionsStr === "-" || !buildVolume) return null;
  const parts = dimensionsStr.replace(" mm", "").split(" × ").map(parseFloat);
  if (parts.some(isNaN) || parts.length < 3) return null;
  const [dX, dY, dZ] = parts;
  const { x:bvX, y:bvY, z:bvZ } = buildVolume;
  const exceeded = { x:dX>bvX, y:dY>bvY, z:dZ>bvZ };
  const fitsOriginal = !exceeded.x && !exceeded.y && !exceeded.z;
  const overflowMM = {
    x:+(Math.max(0, dX-bvX).toFixed(1)),
    y:+(Math.max(0, dY-bvY).toFixed(1)),
    z:+(Math.max(0, dZ-bvZ).toFixed(1)),
  };
  const minScaleDecimal = Math.min(bvX/dX, bvY/dY, bvZ/dZ);
  const minScalePct = Math.max(1, Math.min(99, Math.floor(minScaleDecimal * 100)));
  return { fitsOriginal, exceeded, overflowMM, minScalePct, originalDimensions:dimensionsStr, printerVolume:`${bvX} × ${bvY} × ${bvZ} mm` };
};

const scaleDimensions = (dimensionsStr, scalePct) => {
  if (!dimensionsStr || dimensionsStr === "-") return null;
  const clean = dimensionsStr.replace(" mm", "").split(" × ");
  return clean.map(v => (parseFloat(v) * scalePct / 100).toFixed(0)).join(" × ") + " mm";
};

// ── Main page ─────────────────────────────────────────────────────────────────

const QuotePage = ({ materials, printers, getActivePrinter, settings }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [file,           setFile]           = useState(location.state?.file || null);
  const [technology,     setTechnology]     = useState("fdm");
  const [modelSize,      setModelSize]      = useState(null);
  const [isLoading,      setIsLoading]      = useState(false);
  const [showModal,      setShowModal]      = useState(false);
  const [fileBase64,     setFileBase64]     = useState(null);

  // Scale state
  const [modelScale,     setModelScale]     = useState(1.0);   // applied
  const [scalePanelOpen, setScalePanelOpen] = useState(false);
  const [currentScale,   setCurrentScale]   = useState(100);   // panel preview (10-200)
  const [debouncedScale, setDebouncedScale] = useState(100);   // debounced, drives Three.js model

  const [modelStats, setModelStats] = useState({
    fileName:"-", dimensions:"-", materialUsage:"0", complexity:"-",
    supportLevel:"none", needsSupports:false, overhangRatio:0,
  });

  const materialNames = Object.keys(materials).filter(
    name => !materials[name].technology || materials[name].technology === technology
  );
  const [selectedMaterial, setSelectedMaterial] = useState(materialNames[0]);
  const [selectedColor,    setSelectedColor]    = useState(materials[materialNames[0]]?.colors?.[0] || null);
  const [quantity,         setQuantity]         = useState(1);

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

  // Reset on new file
  React.useEffect(() => {
    setModelScale(1.0);
    setCurrentScale(100);
    setScalePanelOpen(false);
  }, [modelStats.fileName]);

  // Read file as base64 (if ≤ 3MB)
  React.useEffect(() => {
    if (!file) { setFileBase64(null); return; }
    if (file.size > 3 * 1024 * 1024) { setFileBase64(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => setFileBase64(e.target.result);
    reader.readAsDataURL(file);
  }, [file]);

  // Sync panel slider with applied scale when opened
  React.useEffect(() => {
    if (scalePanelOpen) setCurrentScale(Math.round(modelScale * 100));
  }, [scalePanelOpen]);

  // Debounce model scale to prevent Three.js jerkiness during slider drag
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedScale(currentScale), 150);
    return () => clearTimeout(t);
  }, [currentScale]);

  const selectedColors = materials[selectedMaterial]?.colors || [];
  const parsedWeight   = parseFloat(modelStats.materialUsage) || 0;
  const activePrinter  = getActivePrinter(technology);
  const markup         = settings?.commercialMarkup || 2.5;
  const minimumPrice   = settings?.minimumPrice || 5000;

  const supportConfig = useMemo(() => ({
    none:     { material: 0, time: 0 },
    light:    { material: (settings?.supportLightMat     ?? 5)  / 100,
                time:     (settings?.supportLightTime    ?? 8)  / 100 },
    moderate: { material: (settings?.supportModerateMat  ?? 15) / 100,
                time:     (settings?.supportModerateTime ?? 20) / 100 },
    heavy:    { material: (settings?.supportHeavyMat     ?? 30) / 100,
                time:     (settings?.supportHeavyTime    ?? 40) / 100 },
  }), [settings?.supportLightMat, settings?.supportLightTime,
       settings?.supportModerateMat, settings?.supportModerateTime,
       settings?.supportHeavyMat, settings?.supportHeavyTime]);

  // Build volume check
  const buildCheck = useMemo(() => {
    return computeBuildCheck(modelStats.dimensions, activePrinter?.buildVolume);
  }, [modelStats.dimensions, activePrinter?.buildVolume]);

  const fitsOriginal = buildCheck?.fitsOriginal ?? true;
  const fitsAtCurrentScale = fitsOriginal || (!!buildCheck && Math.round(modelScale * 100) <= buildCheck.minScalePct);

  // Live viewer scale — debounced so Three.js only updates after slider settles
  const modelScaleProp = scalePanelOpen ? debouncedScale / 100 : modelScale;

  // Pricing uses the APPLIED scale (not live preview)
  const weightForPricing = useMemo(() => parsedWeight * Math.pow(modelScale, 3), [parsedWeight, modelScale]);

  const pricing = useMemo(() => {
    const empty = { salePrice:0, costReal:0, printHours:0, needsPrinter:false, materialBase:0, supportMatCost:0, materialCost:0, electricity:0, amortization:0, labor:0, failureCost:0, subtotal:0, needsSupports:false, supportLevel:"none" };
    if (!activePrinter) return { ...empty, needsPrinter:true };
    const materialData = materials[selectedMaterial];
    if (!materialData || weightForPricing === 0) return empty;
    const costs    = calculatePrinterCosts(activePrinter);
    const suppLevel = modelStats.supportLevel || "none";
    const suppCfg   = supportConfig[suppLevel] || { material: 0, time: 0 };
    if (technology === "sla") {
      const density    = materialData.density || 1.10;
      const pricePerML = materialData.pricePerML || materialData.pricePerGram;
      return calculateSLAPrice({ weightGrams:weightForPricing, density, pricePerML, supportExtraMaterial:suppCfg.material, supportExtraTime:suppCfg.time, costs, markup, minimumPrice, supportLevel:suppLevel });
    }
    return calculateFDMPrice({ weightGrams:weightForPricing, pricePerGram:materialData.pricePerGram, supportExtraMaterial:suppCfg.material, supportExtraTime:suppCfg.time, costs, markup, minimumPrice, supportLevel:suppLevel, smallFastThreshold:settings?.SMALL_FAST_PART_THRESHOLD });
  }, [weightForPricing, modelStats, selectedMaterial, materials, technology, activePrinter, markup, minimumPrice, supportConfig]);

  // Live price for scale panel (uses currentScale for instant feedback)
  const panelLiveWeight = parsedWeight * Math.pow(currentScale / 100, 3);
  const panelLivePrice  = useMemo(() => {
    const materialData = materials[selectedMaterial];
    if (!activePrinter || !materialData || panelLiveWeight === 0) return 0;
    const costs    = calculatePrinterCosts(activePrinter);
    const suppLevel = modelStats.supportLevel || "none";
    const suppCfg   = supportConfig[suppLevel] || { material: 0, time: 0 };
    if (technology === "sla") {
      const density    = materialData.density || 1.10;
      const pricePerML = materialData.pricePerML || materialData.pricePerGram;
      return calculateSLAPrice({ weightGrams:panelLiveWeight, density, pricePerML, supportExtraMaterial:suppCfg.material, supportExtraTime:suppCfg.time, costs, markup, minimumPrice, supportLevel:suppLevel }).salePrice;
    }
    return calculateFDMPrice({ weightGrams:panelLiveWeight, pricePerGram:materialData.pricePerGram, supportExtraMaterial:suppCfg.material, supportExtraTime:suppCfg.time, costs, markup, minimumPrice, supportLevel:suppLevel, smallFastThreshold:settings?.SMALL_FAST_PART_THRESHOLD }).salePrice;
  }, [panelLiveWeight, selectedMaterial, materials, activePrinter, technology, markup, minimumPrice, modelStats.supportLevel, supportConfig]);

  // waNumber/waSupport not needed here — compact banner uses /contact route; CheckoutFlow handles WhatsApp

  // Quick scale pills
  const baseQuickScales = [25, 50, 75, 80, 100, 125, 150];
  const minScalePct = buildCheck && !buildCheck.fitsOriginal ? buildCheck.minScalePct : null;
  const quickScales = minScalePct && !baseQuickScales.includes(minScalePct)
    ? [...baseQuickScales, minScalePct].sort((a,b) => a-b)
    : baseQuickScales;

  // Single source of truth for displayed dimensions: always reflects the applied scale.
  // The scale panel uses the same scaleDimensions() function for its live preview,
  // so both components read the same computed value once scale is applied.
  const displayDimensions = useMemo(() => {
    if (modelStats.dimensions === "-") return "-";
    return scaleDimensions(modelStats.dimensions, Math.round(modelScale * 100)) || modelStats.dimensions;
  }, [modelStats.dimensions, modelScale]);

  // fitsOriginal is used only for the compact oversized banner; AnalysisBadge no longer receives it
  const displayWeight = scalePanelOpen ? panelLiveWeight : weightForPricing;
  const badgeProps = { modelStats, parsedWeight: parseFloat(displayWeight.toFixed(1)), displayDimensions };

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

        {/* Right panel is fixed 420px so it doesn't over-stretch on large screens;
            viewer takes remaining width. */}
        <div className={file ? "grid lg:grid-cols-[1fr_420px] gap-6 sm:gap-10 items-start" : "grid grid-cols-1 gap-10"}>

          {/* ── VIEWER ── */}
          <div
            className={`relative rounded-[28px] sm:rounded-[42px] ${file ? "h-[380px] sm:h-[560px] lg:h-[820px]" : "h-[380px] sm:h-[480px] lg:h-[600px]"}`}
            style={{ background:"linear-gradient(145deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)", border:"1px solid rgba(139,92,246,0.2)", boxShadow:"0 0 0 1px rgba(255,255,255,0.04),0 30px 80px rgba(0,0,0,0.6),0 0 140px rgba(109,40,217,0.15), inset 0 0 120px rgba(0,0,0,0.6)", backdropFilter:"blur(20px)", overflow:"hidden", transition:"height 0.5s ease" }}
          >
            {file && <TechnologySelector technology={technology} setTechnology={setTechnology} />}
            {file && (
              <div className="absolute top-6 right-6 z-30 hidden lg:block" style={{ minWidth:"196px" }}>
                <AnalysisBadge {...badgeProps} />
              </div>
            )}

            <div className={`w-full relative ${file ? "h-[380px] sm:h-[560px] lg:h-[820px]" : "h-[380px] sm:h-[480px] lg:h-[600px]"}`} style={{ transition:"height 0.5s ease" }}>
              {!file && <Navigate to="/" replace />}
              {file && (<div className="absolute top-6 left-6 z-30"><InlineUploadCompact onFileUpload={setFile} /></div>)}
              <ViewerCanvas modelSize={modelSize} loading={isLoading} hasFile={!!file} glowMode={selectedColor?.finish==="glow"} glowColor={selectedColor?.hex}>
                {file && (
                  <ModelViewer
                    file={file} selectedColor={selectedColor} setModelStats={setModelStats}
                    selectedMaterial={selectedMaterial} materials={materials}
                    onModelSizeChange={setModelSize} onLoadingChange={setIsLoading}
                    technology={technology}
                    modelScale={modelScaleProp}
                    infillFactor={settings?.infillWeightFactor ?? 0.65}
                  />
                )}
              </ViewerCanvas>
            </div>

            {/* ── SCALE BUTTON (bottom-right of viewer) ── */}
            {file && (
              <button
                onClick={() => setScalePanelOpen(v => !v)}
                style={{
                  position:"absolute", bottom:80, right:16, zIndex:30,
                  background:"rgba(10,10,20,0.72)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
                  border: scalePanelOpen ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius:14, padding:"0 14px", height:40,
                  display:"flex", alignItems:"center", gap:8,
                  cursor:"pointer", transition:"all 0.2s ease",
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.04em", color:"rgba(255,255,255,0.7)" }}>Escalar</span>
                <span style={{
                  background: modelScale !== 1.0 ? "rgba(245,158,11,0.2)" : "rgba(139,92,246,0.2)",
                  border:     modelScale !== 1.0 ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(139,92,246,0.4)",
                  borderRadius:999, padding:"1px 7px", fontSize:10, fontWeight:800,
                  color: modelScale !== 1.0 ? "#fde68a" : "#c4b5fd",
                }}>
                  {Math.round(modelScale * 100)}%
                </span>
              </button>
            )}

            {/* ── SCALE PANEL (slides up from bottom of viewer) ── */}
            {file && (
              <div style={{
                position:"absolute", bottom:0, left:0, right:0, zIndex:35,
                background:"rgba(8,6,22,0.92)",
                backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
                borderTop:"1px solid rgba(139,92,246,0.3)",
                borderRadius:"0 0 42px 42px",
                padding:"12px 20px 16px",
                transform: scalePanelOpen ? "translateY(0)" : "translateY(100%)",
                opacity:   scalePanelOpen ? 1 : 0,
                transition:"transform 0.3s ease, opacity 0.3s ease",
                pointerEvents: scalePanelOpen ? "auto" : "none",
              }}>
                {/* Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:13, fontWeight:800, color:"#fff" }}>↕ Escalar modelo</span>
                  <button onClick={() => setScalePanelOpen(false)} style={{ width:24, height:24, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>×</button>
                </div>

                {/* Live dimensions */}
                {(() => {
                  const dims = scaleDimensions(modelStats.dimensions, currentScale)?.replace(" mm","").split(" × ") || ["—","—","—"];
                  return (
                    <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                      {[["X","#ef4444",dims[0]],["Y","#22c55e",dims[1]],["Z","#3b82f6",dims[2]]].map(([l,c,v]) => (
                        <div key={l} style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"4px 8px", display:"flex", flexDirection:"column", alignItems:"center" }}>
                          <span style={{ fontSize:8, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:c }}>{l}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:"#fff", marginTop:1 }}>{v}mm</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Slider + custom number input */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Tamaño</span>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      {!quickScales.includes(currentScale) && (
                        <span style={{ fontSize:9, fontWeight:700, color:"#a78bfa", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.35)", borderRadius:999, padding:"1px 7px" }}>Custom</span>
                      )}
                      <input
                        type="number" min={1} max={200}
                        value={currentScale}
                        onChange={e => {
                          const v = Math.min(200, Math.max(1, parseInt(e.target.value) || 1));
                          setCurrentScale(v);
                        }}
                        style={{ width:68, textAlign:"center", background:"rgba(139,92,246,0.08)", border: currentScale !== 100 ? "1.5px solid #7c3aed" : "1.5px solid rgba(139,92,246,0.4)", boxShadow: currentScale !== 100 ? "0 0 10px rgba(124,58,237,0.35)" : "none", borderRadius:8, padding:"3px 6px", fontSize:18, fontWeight:800, color:"#c4b5fd", outline:"none", MozAppearance:"textfield", transition:"border-color 0.2s, box-shadow 0.2s" }}
                      />
                      <span style={{ fontSize:14, fontWeight:700, color:"#a78bfa" }}>%</span>
                    </div>
                  </div>
                  <input type="range" min={1} max={200} step={1} value={currentScale}
                    onChange={e => setCurrentScale(+e.target.value)}
                    style={{ width:"100%", accentColor:"#7c3aed", height:4, cursor:"pointer" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:4 }}>
                    {minScalePct ? (
                      <span style={{ color:"#f59e0b" }}>{minScalePct}% · óptimo</span>
                    ) : <span>1%</span>}
                    <span>100% · original</span>
                    <span>200%</span>
                  </div>
                </div>

                {/* Quick scale pills */}
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                  {quickScales.map(s => {
                    const isMin = s === minScalePct;
                    const isSelected = currentScale === s;
                    return (
                      <button key={s} onClick={() => setCurrentScale(s)} style={{
                        borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
                        background: isSelected ? "rgba(139,92,246,0.2)" : isMin ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)",
                        border: isSelected ? "1px solid rgba(139,92,246,0.5)" : isMin ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(255,255,255,0.1)",
                        color: isSelected ? "#c4b5fd" : isMin ? "#fde68a" : "rgba(255,255,255,0.5)",
                      }}>
                        {s}%
                      </button>
                    );
                  })}
                </div>

                {/* Weight + price preview — single line */}
                <div style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:10, padding:"7px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>
                    <span style={{ fontWeight:700, color:"#fff" }}>{panelLiveWeight.toFixed(1)}g</span>
                    {" · estimado"}
                  </span>
                  <span style={{ fontSize:15, fontWeight:900, color:"#a78bfa" }}>{formatCRC(panelLivePrice)}</span>
                </div>

                {/* Apply + Reset row */}
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <button onClick={() => { setModelScale(currentScale / 100); setScalePanelOpen(false); }}
                    style={{ flex:1, background:"linear-gradient(135deg,#7c3aed,#9333ea)", color:"#fff", border:"none", borderRadius:10, padding:"9px 0", fontSize:13, fontWeight:800, cursor:"pointer" }}>
                    ✓ Aplicar
                  </button>
                  <button onClick={() => setCurrentScale(100)}
                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, borderRadius:10, padding:"9px 14px", cursor:"pointer" }}>
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── QUOTE PANEL ── */}
          {file && (
            <div className="glass-card rounded-[28px] sm:rounded-[42px] border border-white/10 p-5 sm:p-8 lg:p-10 lg:sticky lg:top-28">

              {/* Badge — mobile */}
              <div className="lg:hidden mb-6">
                <AnalysisBadge {...badgeProps} />
              </div>

              <p className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.2em]">COTIZACIÓN</p>
              <h2 className="text-4xl sm:text-5xl font-black leading-[0.9] mt-3 sm:mt-5">Precio<br />Instantáneo</h2>

              {/* Applied scale badge */}
              {modelScale !== 1.0 && (
                <div className="mt-4" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", borderRadius:10, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)" }}>
                  <span style={{ fontSize:12, color:"#fde68a", fontWeight:600 }}>↕ Tamaño al {Math.round(modelScale * 100)}% · {scaleDimensions(modelStats.dimensions, Math.round(modelScale * 100))}</span>
                  <button onClick={() => { setModelScale(1.0); setCurrentScale(100); }} style={{ fontSize:11, color:"rgba(255,255,255,0.4)", cursor:"pointer", background:"none", border:"none", textDecoration:"underline" }}>Restablecer</button>
                </div>
              )}

              {/* ── OVERSIZED MODEL CARD — placed above material selector ── */}
              {!fitsOriginal && (
                fitsAtCurrentScale ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:16, marginBottom:4, padding:"10px 14px", borderRadius:12, background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.25)" }}>
                    <span style={{ fontSize:14, color:"#10b981" }}>✓</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"#10b981" }}>Modelo dentro del volumen de impresión</span>
                  </div>
                ) : (
                  <div style={{
                    marginTop:16, marginBottom:4,
                    background:"rgba(139,92,246,0.06)",
                    border:"1px solid rgba(139,92,246,0.2)",
                    borderRadius:12,
                    padding:"18px 16px",
                  }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:10 }}>
                      {/* Diagram: dashed gray rect = printer bed, violet rect = model (taller), dashed line = cut */}
                      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ flexShrink:0, marginTop:2 }}>
                        <rect x="4" y="20" width="48" height="32" rx="2"
                          stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeDasharray="4 3"
                          fill="rgba(255,255,255,0.03)" />
                        <rect x="15" y="5" width="26" height="47" rx="2"
                          stroke="#8b5cf6" strokeWidth="1.5"
                          fill="rgba(139,92,246,0.13)" />
                        <line x1="4" y1="20" x2="52" y2="20"
                          stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 2" />
                      </svg>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:"#c4b5fd", margin:0, lineHeight:1.35 }}>Tu modelo supera nuestro volumen de impresión estándar</p>
                        <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:"5px 0 0", lineHeight:1.4 }}>La parte sombreada es lo que no cabe en la cama estándar.</p>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"6px 14px", marginBottom:16 }}>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)", alignSelf:"center" }}>Dimensiones del modelo</span>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.85)", fontWeight:600 }}>{buildCheck?.originalDimensions}</span>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)", alignSelf:"center" }}>Volumen máximo</span>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.85)", fontWeight:600 }}>{buildCheck?.printerVolume}</span>
                    </div>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:12 }}>¿Cómo deseas continuar?</p>
                    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                      <button
                        onClick={() => setScalePanelOpen(true)}
                        style={{ flex:1, background:"linear-gradient(135deg,#7c3aed,#9333ea)", color:"#fff", border:"none", borderRadius:10, padding:"10px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}
                      >
                        ↕ Escalar modelo
                      </button>
                      <button
                        onClick={() => navigate(`/contact?ref=oversized&file=${encodeURIComponent(modelStats.fileName)}&dims=${(buildCheck?.originalDimensions||"").replace(/ × /g,"x").replace(" mm","")}`)}
                        style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:12, fontWeight:500, cursor:"pointer", textDecoration:"underline", padding:"4px 0", whiteSpace:"nowrap" }}
                      >
                        ✉ Solicitar cotización
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* Material selection */}
              <div className="mt-8 sm:mt-10">
                <p className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.2em] mb-4 sm:mb-5">MATERIAL</p>
                <div className="grid grid-cols-2 gap-3">
                  {materialNames.map(material => (
                    <button key={material}
                      onClick={() => { setSelectedMaterial(material); setSelectedColor(materials[material]?.colors?.find(c => !c.hidden) || null); }}
                      className={`rounded-2xl p-4 text-left transition-all duration-300 ${selectedMaterial===material?"border border-violet-500 bg-violet-500/10 shadow-[0_0_40px_rgba(139,92,246,0.12)]":"bg-white/[0.03] border border-white/10 hover:bg-white/[0.05]"}`}>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-base font-black leading-tight">{material}</h3>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5 shrink-0 mt-0.5">
                          {materials[material].technology==="sla"?"SLA":"FDM"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Support banner */}
              {modelStats.fileName !== "-" && (
                <div className="mt-5" style={{ padding:"10px 14px", borderRadius:12, background:modelStats.needsSupports?"rgba(245,158,11,0.06)":"rgba(16,185,129,0.06)", border:modelStats.needsSupports?"1px solid rgba(245,158,11,0.2)":"1px solid rgba(16,185,129,0.2)" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:modelStats.needsSupports?"#f59e0b":"#10b981" }}>
                    {modelStats.needsSupports?"⚠️ Requiere material de soporte — incluido en el precio":"✅ Se puede imprimir sin soportes"}
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
                          className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor?.name===color.name?"border-white scale-110":"border-transparent hover:border-white/30"}`}
                          style={{ background:color.hex }} />
                        <span className="text-[9px] text-white/40 w-10 truncate text-center">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div style={{ marginBottom: "20px", marginTop: "28px" }}>
                <p style={{ fontSize: "11px", letterSpacing: "2px", color: "#9ca3af", marginBottom: "10px" }}>CANTIDAD</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width:"36px", height:"36px", borderRadius:"8px", background:"rgba(124,58,237,0.2)", border:"1px solid rgba(167,139,250,0.3)", color:"#a78bfa", fontSize:"18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                  >−</button>
                  <span style={{ color:"#ffffff", fontSize:"18px", fontWeight:"700", minWidth:"32px", textAlign:"center" }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(99, q + 1))}
                    style={{ width:"36px", height:"36px", borderRadius:"8px", background:"rgba(124,58,237,0.2)", border:"1px solid rgba(167,139,250,0.3)", color:"#a78bfa", fontSize:"18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                  >+</button>
                  {quantity > 1 && (
                    <span style={{ color:"#6d28d9", fontSize:"12px" }}>{quantity} piezas</span>
                  )}
                </div>
              </div>

              {/* Price section */}
              <div className="pt-6 border-t border-white/10">
                {technology === "sla" ? (
                  <div style={{
                    background:"rgba(124,58,237,0.06)",
                    borderTop:"1px solid rgba(124,58,237,0.18)",
                    borderRight:"1px solid rgba(124,58,237,0.18)",
                    borderBottom:"1px solid rgba(124,58,237,0.18)",
                    borderLeft:"3px solid #7c3aed",
                    borderRadius:12,
                    padding:"20px 18px",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                      <span style={{ fontSize:20 }}>🔬</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#a78bfa", lineHeight:1.3 }}>Próximamente · Impresión en Resina SLA</span>
                    </div>
                    <p style={{ fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.6, marginBottom:14 }}>
                      Estamos trabajando para ofrecerte impresión en resina de alta precisión muy pronto.
                    </p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginBottom:14 }}>¿Necesitas este servicio ahora?</p>
                    <button
                      onClick={() => navigate("/contact")}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"linear-gradient(135deg,#7c3aed,#9333ea)", color:"#fff", border:"none", borderRadius:10, padding:"11px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}
                    >
                      <span>Solicitar cotización personalizada</span>
                      <span>→</span>
                    </button>
                  </div>
                ) : pricing.needsPrinter ? (
                  <div style={{ padding:"14px", borderRadius:12, background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)" }}>
                    <p style={{ fontSize:13, color:"#f59e0b", fontWeight:600 }}>⚙️ Sin impresora {technology.toUpperCase()} activa</p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:6 }}>COSTO DE MANUFACTURA</p>
                    <h3 className="text-4xl sm:text-5xl font-black text-violet-400 leading-none break-all">
                      {formatCRC(pricing.salePrice * quantity)}
                    </h3>
                    {quantity > 1 && (
                      <p style={{ fontSize:12, color:"rgba(167,139,250,0.7)", marginTop:4 }}>
                        {formatCRC(pricing.salePrice)} × {quantity} piezas
                      </p>
                    )}
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontStyle:"italic", marginTop:4 }}>
                      * Precio estimado basado en el análisis del modelo.
                    </p>
                  </>
                )}

                {technology !== "sla" && !pricing.needsPrinter && weightForPricing > 0 && (
                  <button onClick={() => setShowModal(true)}
                    className="mt-6 w-full primary-button py-4 rounded-2xl sm:rounded-3xl text-base sm:text-lg font-bold">
                    Confirmar Pedido →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CheckoutFlow
          onClose={() => setShowModal(false)}
          onNewOrder={() => { setShowModal(false); setFile(null); setModelScale(1.0); setCurrentScale(100); }}
          pricing={pricing}
          modelStats={modelStats}
          selectedMaterial={selectedMaterial}
          selectedColor={selectedColor}
          settings={settings}
          parsedWeight={parsedWeight}
          activePrinter={activePrinter}
          buildCheck={buildCheck}
          modelScale={modelScale}
          file={file}
          fileBase64={fileBase64}
          quantity={quantity}
        />
      )}
    </main>
  );
};

export default QuotePage;
