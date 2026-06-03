import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatCRC, formatPrintTime } from "../utils/pricingEngine";
import {
  CR_PROVINCES, CR_CANTONS, CR_DISTRICTS, CORREOS_BRANCHES,
} from "../data/costaRicaData";

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — CARD PAYMENT GATEWAY (not yet implemented)
//
// Planned integration: ONVO Pay (https://onvopay.com)
// ONVO supports Visa / Mastercard for Costa Rican merchants.
//
// Prerequisites before enabling:
//   - Registered legal entity in Costa Rica (S.A. or S.R.L.)
//   - Active merchant account with BCCR
//   - ONVO merchant credentials: API key + webhook secret
//
// Implementation steps when ready:
//   1. Install ONVO SDK or integrate via their REST API
//   2. Replace the SINPE block in this component with <OnvoCheckout />
//   3. Handle ONVO payment webhook at POST /api/webhooks/onvo
//   4. Update order status from the webhook only — never trust the client
//   5. Store ONVO_API_KEY and ONVO_WEBHOOK_SECRET in environment variables
//
// Alternative to evaluate: Flow (https://www.getflow.cr) — also operates
// in Costa Rica with local card support.
// ─────────────────────────────────────────────────────────────────────────────

// SINPE config — change via .env (VITE_SINPE_PHONE / VITE_SINPE_NAME)
const SINPE_PHONE    = import.meta.env.VITE_SINPE_PHONE    || "XXXX-XXXX";
const SINPE_NAME     = import.meta.env.VITE_SINPE_NAME     || "Inity 3D";

const URGENCY_OPTS = [
  { value:"normal", label:"Estándar — 3 a 5 días hábiles", multiplier:1.0 },
  { value:"semi",   label:"Express — 48 horas (+20%)",      multiplier:1.2 },
  { value:"urgent", label:"Urgente — 24 horas (+50%)",      multiplier:1.5 },
];

const scaleDimensions = (dimensionsStr, scalePct) => {
  if (!dimensionsStr || dimensionsStr === "-") return null;
  const clean = dimensionsStr.replace(" mm","").split(" × ");
  return clean.map(v => (parseFloat(v) * scalePct / 100).toFixed(0)).join(" × ") + " mm";
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const ic  = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none text-white text-sm focus:border-violet-500/60 transition-all placeholder:text-white/25";
const ic2 = "w-full rounded-xl border border-red-500/50 bg-red-500/[0.04] px-4 py-3 outline-none text-white text-sm focus:border-red-400/60 transition-all placeholder:text-white/25";
const lbl = (err) => err ? ic2 : ic;

// Native <select> elements need explicit background/color to override the browser's
// white default on all platforms (Chrome macOS ignores the CSS cascade for the widget).
const selStyle = (err) => ({
  appearance:"none", WebkitAppearance:"none",
  backgroundColor: err ? "rgba(239,68,68,0.05)" : "#0d0c1a",
  color:"#ffffff",
  borderColor: err ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
});
const Lbl = ({ children }) => <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.08em" }}>{children}</label>;
const Err = ({ msg }) => msg ? <p style={{ fontSize:11, color:"#f87171", marginTop:4 }}>{msg}</p> : null;

// ── Step indicator ────────────────────────────────────────────────────────────
// modalStep: 1=Delivery, 2=Payment, 3=Confirm → overall steps 3, 4, 5
const STEPS = ["Model","Configure","Delivery","Payment","Confirm"];

const StepIndicator = ({ modalStep }) => {
  const overall = modalStep + 2; // 3, 4, or 5
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", paddingBottom:20, overflowX:"auto", flexShrink:0 }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done    = n < overall;
        const current = n === overall;
        const col = done ? "#10b981" : current ? "#a78bfa" : "rgba(255,255,255,0.22)";
        return (
          <React.Fragment key={label}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, minWidth:52 }}>
              <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:col, background: done ? "rgba(16,185,129,0.12)" : current ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)", border:`1.5px solid ${col}`, flexShrink:0 }}>
                {done ? "✓" : n}
              </div>
              <span style={{ fontSize:9, fontWeight:current?700:500, color:col, whiteSpace:"nowrap" }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width:"clamp(10px,2.5vw,28px)", height:1.5, background: done ? "#10b981" : "rgba(255,255,255,0.1)", marginBottom:14, flexShrink:0, margin:"0 2px 14px" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Step 1: Delivery (customer info + delivery address) ───────────────────────
const DeliveryStep = ({ form, setForm, deliveryMethod, setDeliveryMethod, delivery, setDelivery, errors, pricing, unitPrice, qty, modelScale, modelStats }) => {
  const set  = (k,v) => setForm(p => ({ ...p, [k]:v }));
  const setD = (k,v) => setDelivery(p => ({ ...p, [k]:v, ...(k==="province" ? { canton:"", district:"", branch:"" } : {}), ...(k==="canton" ? { district:"" } : {}) }));

  const cantons  = delivery.province ? (CR_CANTONS[delivery.province] || []) : [];
  const distKey  = delivery.province && delivery.canton ? `${delivery.province} / ${delivery.canton}` : "";
  const districts = distKey ? (CR_DISTRICTS[distKey] || []) : [];
  const branches = delivery.province ? CORREOS_BRANCHES.filter(b => b.province === delivery.province) : [];

  const urgencyOpt = URGENCY_OPTS.find(o => o.value === form.urgency) || URGENCY_OPTS[0];

  return (
    <div className="space-y-5">
      {/* Price summary */}
      <div style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:16, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.12em" }}>Precio estimado</p>
          <p style={{ fontSize:24, fontWeight:900, color:"#a78bfa", lineHeight:1 }}>{formatCRC(unitPrice)}</p>
          {qty > 1 && <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:1 }}>× {qty} piezas = {formatCRC(unitPrice * qty)}</p>}
          {modelScale !== 1.0 && <p style={{ fontSize:10, color:"rgba(167,139,250,0.6)", marginTop:2 }}>Tamaño al {Math.round(modelScale*100)}%</p>}
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>{modelStats.fileName}</p>
        </div>
      </div>

      {/* ── Customer info ── */}
      <div>
        <p style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:12 }}>INFORMACIÓN DE CONTACTO</p>
        <div className="grid grid-cols-2 gap-3">
          <div><Lbl>Nombre completo *</Lbl><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Tu nombre" className={lbl(errors.name)} /><Err msg={errors.name} /></div>
          <div><Lbl>Empresa</Lbl><input value={form.company} onChange={e=>set("company",e.target.value)} placeholder="Tu empresa" className={ic} /></div>
          <div><Lbl>Email *</Lbl><input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@empresa.com" className={lbl(errors.email)} /><Err msg={errors.email} /></div>
          <div><Lbl>Teléfono / WhatsApp *</Lbl><input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+506 XXXX-XXXX" className={lbl(errors.phone)} /><Err msg={errors.phone} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <Lbl>Cantidad de piezas</Lbl>
            <input type="number" min="1" value={form.quantity} onChange={e=>set("quantity",e.target.value)} className={ic} />
          </div>
          <div>
            <Lbl>Tiempo de entrega</Lbl>
            <div className="space-y-1.5 mt-1">
              {URGENCY_OPTS.map(opt => (
                <label key={opt.value} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", borderRadius:10, cursor:"pointer", background:form.urgency===opt.value?"rgba(139,92,246,0.12)":"rgba(255,255,255,0.02)", border:form.urgency===opt.value?"1px solid rgba(139,92,246,0.4)":"1px solid rgba(255,255,255,0.06)", fontSize:12, color:form.urgency===opt.value?"#c4b5fd":"rgba(255,255,255,0.55)" }}>
                  <input type="radio" name="urgency" value={opt.value} checked={form.urgency===opt.value} onChange={()=>set("urgency",opt.value)} style={{ accentColor:"#7c3aed", flexShrink:0 }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3"><Lbl>Notas adicionales</Lbl><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} placeholder="Materiales especiales, acabados, uso final..." className={ic + " resize-none"} /></div>
      </div>

      {/* ── Delivery method ── */}
      <div>
        <p style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:12 }}>MÉTODO DE ENVÍO</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val:"home",    icon:"🏠", title:"Entrega a domicilio",         sub:"Te enviamos a tu dirección" },
            { val:"correos", icon:"📮", title:"Sucursal Correos de CR", sub:"Retiras en una sucursal" },
          ].map(({ val,icon,title,sub }) => (
            <button key={val} type="button" onClick={()=>setDeliveryMethod(val)} style={{ padding:"12px 14px", borderRadius:14, textAlign:"left", cursor:"pointer", background:deliveryMethod===val?"rgba(139,92,246,0.12)":"rgba(255,255,255,0.03)", border:deliveryMethod===val?"1.5px solid rgba(139,92,246,0.5)":"1px solid rgba(255,255,255,0.08)", transition:"all 0.15s" }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
              <div style={{ fontSize:12, fontWeight:700, color:deliveryMethod===val?"#c4b5fd":"rgba(255,255,255,0.75)" }}>{title}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{sub}</div>
            </button>
          ))}
        </div>

        {/* ── Home delivery fields ── */}
        {deliveryMethod === "home" && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Lbl>Provincia *</Lbl>
                <select value={delivery.province} onChange={e=>setD("province",e.target.value)} className={lbl(errors.province)} style={selStyle(errors.province)}>
                  <option value="">Seleccionar...</option>
                  {CR_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Err msg={errors.province} />
              </div>
              <div>
                <Lbl>Cantón *</Lbl>
                <select value={delivery.canton} onChange={e=>setD("canton",e.target.value)} className={lbl(errors.canton)} style={selStyle(errors.canton)} disabled={!delivery.province}>
                  <option value="">Seleccionar...</option>
                  {cantons.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Err msg={errors.canton} />
              </div>
              <div>
                <Lbl>Distrito *</Lbl>
                <select value={delivery.district} onChange={e=>setD("district",e.target.value)} className={lbl(errors.district)} style={selStyle(errors.district)} disabled={!delivery.canton}>
                  <option value="">Seleccionar...</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <Err msg={errors.district} />
              </div>
            </div>
            <div>
              <Lbl>Dirección exacta *</Lbl>
              <textarea value={delivery.exactAddress} onChange={e=>setD("exactAddress",e.target.value)} rows={2} placeholder="100m norte del parque, casa verde..." className={lbl(errors.exactAddress) + " resize-none"} />
              <Err msg={errors.exactAddress} />
            </div>
            <div>
              <Lbl>Indicaciones adicionales</Lbl>
              <input value={delivery.additionalNotes} onChange={e=>setD("additionalNotes",e.target.value)} placeholder="Color de casa, portón, referencia..." className={ic} />
            </div>
          </div>
        )}

        {/* ── Correos branch fields ── */}
        {deliveryMethod === "correos" && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Provincia *</Lbl>
                <select value={delivery.province} onChange={e=>setD("province",e.target.value)} className={lbl(errors.province)} style={selStyle(errors.province)}>
                  <option value="">Seleccionar...</option>
                  {CR_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Err msg={errors.province} />
              </div>
              <div>
                <Lbl>Sucursal *</Lbl>
                <select value={delivery.branch} onChange={e=>setD("branch",e.target.value)} className={lbl(errors.branch)} style={selStyle(errors.branch)} disabled={!delivery.province}>
                  <option value="">Seleccionar...</option>
                  {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                </select>
                <Err msg={errors.branch} />
              </div>
            </div>
            {delivery.branch && (
              <div style={{ padding:"8px 12px", background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:10, fontSize:11, color:"rgba(255,255,255,0.55)" }}>
                📍 {branches.find(b=>b.name===delivery.branch)?.address}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Nombre completo *</Lbl>
                <input value={delivery.fullName} onChange={e=>setD("fullName",e.target.value)} placeholder="Nombre para retiro" className={lbl(errors.fullName)} />
                <Err msg={errors.fullName} />
              </div>
              <div>
                <Lbl>Cédula / ID *</Lbl>
                <input value={delivery.cedula} onChange={e=>setD("cedula",e.target.value)} placeholder="1-0000-0000" className={lbl(errors.cedula)} />
                <Err msg={errors.cedula} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Step 2: SINPE Móvil payment ───────────────────────────────────────────────
const PaymentStep = ({ totalPrice, sinpe, setSinpe, errors }) => {
  const set = (k,v) => setSinpe(p=>({ ...p, [k]:v }));
  return (
    <div className="space-y-5">
      {/* SINPE instructions */}
      <div style={{ background:"rgba(139,92,246,0.07)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:18, padding:"20px 22px" }}>
        <p style={{ fontSize:13, fontWeight:700, color:"#c4b5fd", marginBottom:14 }}>Pay via SINPE Móvil</p>
        <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>Send</p>
          <p style={{ fontSize:28, fontWeight:900, color:"#a78bfa" }}>{formatCRC(totalPrice)}</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:6 }}>to:</p>
          <p style={{ fontSize:22, fontWeight:900, color:"#fff", marginTop:2, letterSpacing:"0.05em" }}>{SINPE_PHONE}</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:2 }}>{SINPE_NAME}</p>
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>
          <p>1. Open your bank's app and select <strong style={{ color:"rgba(255,255,255,0.75)" }}>SINPE Móvil</strong>.</p>
          <p>2. Send the exact amount above to the number shown.</p>
          <p>3. Enter the confirmation number you receive here.</p>
        </div>
      </div>

      {/* Confirmation number */}
      <div>
        <Lbl>Número de confirmación SINPE *</Lbl>
        <input
          value={sinpe.confirmation}
          onChange={e=>set("confirmation",e.target.value)}
          placeholder="Ej: 12345678"
          className={lbl(errors.confirmation)}
          maxLength={20}
        />
        <Err msg={errors.confirmation} />
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:4 }}>
          El número de confirmación aparece en el SMS de tu banco tras completar el SINPE.
        </p>
      </div>

      {/* Screenshot upload (optional) */}
      <div>
        <Lbl>Captura de pantalla del comprobante (opcional)</Lbl>
        <label style={{ display:"block", cursor:"pointer", padding:"14px 16px", borderRadius:12, background:"rgba(255,255,255,0.03)", border:sinpe.screenshot?"1px solid rgba(16,185,129,0.35)":"1px dashed rgba(255,255,255,0.12)", textAlign:"center" }}>
          <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{
            const f = e.target.files?.[0];
            set("screenshot", f ? f.name : null);
          }} />
          {sinpe.screenshot ? (
            <span style={{ fontSize:12, color:"#4ade80" }}>✓ {sinpe.screenshot}</span>
          ) : (
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>📎 Adjuntar imagen (JPG, PNG)</span>
          )}
        </label>
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:4 }}>
          La captura ayuda a acelerar la verificación del pago.
        </p>
      </div>

      <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)" }}>
        <p style={{ fontSize:11, color:"#f59e0b", fontWeight:600 }}>
          ⏳ Tu pedido quedará en estado <strong>Pendiente de verificación</strong> hasta que nuestro equipo confirme el pago. Recibirás notificación por email.
        </p>
      </div>
    </div>
  );
};

// ── Step 3: Confirmation screen ───────────────────────────────────────────────
const ConfirmStep = ({ savedOrder, onNewOrder, onClose, settings }) => {
  const navigate  = useNavigate();
  const waNumber  = (settings?.whatsapp || "").replace(/\D/g,"");
  const o = savedOrder;
  if (!o) return null;

  const deliveryLabel = () => {
    const d = o.delivery;
    if (!d) return "—";
    if (d.method === "correos") return `Sucursal Correos: ${d.branch} (${d.province})`;
    return `${d.district}, ${d.canton}, ${d.province} — ${d.exactAddress}`;
  };

  const rows = [
    ["Referencia",     o.ref || "—"],
    ["Archivo",        o.quote?.fileName || "—"],
    ["Escala aplicada",o.modelFile?.scalePct != null ? `${o.modelFile.scalePct}% ${o.modelFile.scalePct===100?"(tamaño original)":""}` : "Original"],
    ["Dimensiones",    o.quote?.dimensions || "—"],
    ["Material",       `${o.quote?.material || "—"}${o.quote?.color ? ` — ${o.quote.color}` : ""}`],
    ["Tecnología",     o.admin?.printer ? o.admin.printer.name : (o.quote?.material?.includes("Resina") ? "SLA" : "FDM")],
    ["Peso estimado",  `${o.admin?.weightG}g`],
    ["Envío",          deliveryLabel()],
    ["Total",          formatCRC(o.quote?.totalPrice || 0)],
    ["Confirmación SINPE", o.payment?.sinpeConfirmation || "—"],
  ];

  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:8 }}>🎉</div>
      <h3 style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:6 }}>¡Pedido enviado!</h3>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:20, lineHeight:1.65 }}>
        Pedido <strong style={{ color:"#c4b5fd" }}>{o.ref}</strong> en estado <strong style={{ color:"#f59e0b" }}>Pendiente de verificación SINPE</strong>.<br />
        Te contactaremos a <strong style={{ color:"#c4b5fd" }}>{o.customer?.email}</strong> en cuanto confirmemos el pago.
      </p>

      {/* Order summary card */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"14px 16px", marginBottom:16, textAlign:"left" }}>
        {rows.map(([k,v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.38)", flexShrink:0 }}>{k}</span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.78)", fontWeight:600, textAlign:"right", wordBreak:"break-word" }}>{v}</span>
          </div>
        ))}
      </div>

      {waNumber && (
        <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola, confirmé el pedido ${o.ref} en Inity 3D. Número SINPE: ${o.payment?.sinpeConfirmation || "—"}`)}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"12px 0", borderRadius:14, fontWeight:700, fontSize:13, background:"#25d366", color:"#fff", textDecoration:"none", marginBottom:10 }}>
          💬 Escríbenos por WhatsApp
        </a>
      )}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onNewOrder} style={{ flex:1, padding:"11px 0", borderRadius:14, fontWeight:700, fontSize:13, cursor:"pointer", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)" }}>
          Nuevo pedido
        </button>
        <button onClick={()=>navigate("/")} style={{ flex:1, padding:"11px 0", borderRadius:14, fontWeight:700, fontSize:13, cursor:"pointer", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.35)", color:"#c4b5fd" }}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

// ── Main CheckoutFlow ─────────────────────────────────────────────────────────
const CheckoutFlow = ({
  onClose, onNewOrder,
  pricing, modelStats, selectedMaterial, selectedColor,
  settings, parsedWeight, activePrinter, buildCheck,
  modelScale, file,
  // fileBase64 is no longer used — file goes directly to the server as multipart
}) => {
  const [modalStep, setModalStep] = useState(1); // 1=Delivery, 2=Payment, 3=Confirm
  const [savedOrder, setSavedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Customer / urgency form
  const [form, setForm] = useState({
    name:"", company:"", email:"", phone:"",
    quantity:"1", urgency:"normal", notes:"",
  });

  // Delivery state
  const [deliveryMethod, setDeliveryMethod] = useState("home");
  const [delivery, setDelivery] = useState({
    province:"", canton:"", district:"", exactAddress:"", additionalNotes:"",
    branch:"", fullName:"", cedula:"",
  });

  // Payment state
  const [sinpe, setSinpe] = useState({ confirmation:"", screenshot:null });

  // Validation errors
  const [errors, setErrors] = useState({});

  const urgencyOpt  = URGENCY_OPTS.find(o => o.value === form.urgency) || URGENCY_OPTS[0];
  const qty         = Math.max(1, parseInt(form.quantity) || 1);
  const unitPrice   = Math.round((pricing.salePrice * urgencyOpt.multiplier) / 500) * 500;
  const totalPrice  = unitPrice * qty;

  // ── Validation ────────────────────────────────────────────────────────────
  const validateDelivery = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Nombre requerido";
    if (!form.email.trim()) e.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.phone.trim()) e.phone = "Teléfono requerido";

    if (deliveryMethod === "home") {
      if (!delivery.province)    e.province    = "Selecciona una provincia";
      if (!delivery.canton)      e.canton      = "Selecciona un cantón";
      if (!delivery.district)    e.district    = "Selecciona un distrito";
      if (!delivery.exactAddress.trim()) e.exactAddress = "Dirección exacta requerida";
    } else {
      if (!delivery.province) e.province = "Selecciona una provincia";
      if (!delivery.branch)   e.branch   = "Selecciona una sucursal";
      if (!delivery.fullName.trim()) e.fullName = "Nombre requerido";
      if (!delivery.cedula.trim())   e.cedula   = "Cédula requerida";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e = {};
    if (!sinpe.confirmation.trim()) e.confirmation = "Ingresa el número de confirmación SINPE";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Build order payload (no file data — file goes as multipart) ───────────
  const buildOrderPayload = () => {
    const id  = Date.now().toString();
    const ref = "#" + id.slice(-6);

    const deliveryData = deliveryMethod === "home" ? {
      method:"home",
      province: delivery.province, canton: delivery.canton,
      district: delivery.district, exactAddress: delivery.exactAddress,
      additionalNotes: delivery.additionalNotes,
    } : {
      method:"correos",
      province: delivery.province, branch: delivery.branch,
      branchAddress: CORREOS_BRANCHES.find(b=>b.name===delivery.branch)?.address || "",
      fullName: delivery.fullName, cedula: delivery.cedula,
    };

    const scalePct = Math.round(modelScale * 100);

    return {
      id, ref, scalePct,
      timestamp: new Date().toISOString(),
      status: "pending_verification",
      customer: {
        name: form.name, company: form.company,
        email: form.email, phone: form.phone, notes: form.notes,
      },
      quote: {
        fileName:    modelStats.fileName,
        dimensions:  scaleDimensions(modelStats.dimensions, scalePct) || modelStats.dimensions,
        material:    selectedMaterial,
        color:       selectedColor?.name || "Sin color",
        quantity:    qty,
        urgency:     form.urgency,
        unitPrice,
        totalPrice,
        currency:    "CRC",
      },
      delivery: deliveryData,
      payment: {
        method: "sinpe",
        sinpeConfirmation: sinpe.confirmation,
        screenshotAttached: !!sinpe.screenshot,
        screenshotName: sinpe.screenshot || null,
      },
      modelFile: file ? {
        name:     file.name,
        type:     file.name.split(".").pop().toLowerCase(),
        sizeBytes: file.size,
        sizeMB:   (file.size / 1024 / 1024).toFixed(2),
        scale:    modelScale,
        scalePct,
        stored:   true, // will be confirmed by server response
      } : null,
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
        modelScale,
        buildCheck: buildCheck ? {
          fitsOriginal:     buildCheck.fitsOriginal,
          customerScalePct: scalePct,
          minScalePct:      buildCheck.minScalePct,
        } : null,
        breakdown: {
          materialBase: pricing.materialBase,
          supportMat:   pricing.supportMatCost,
          electricity:  pricing.electricity,
          amortization: pricing.amortization,
          labor:        pricing.labor,
          failureCost:  pricing.failureCost,
          costReal:     pricing.costReal,
          markup:       pricing.markup,
          salePrice:    pricing.salePrice,
        },
        printer: activePrinter ? { name:activePrinter.name, profile:activePrinter.defaultProfile } : null,
      },
    };
  };

  // ── Submit order to API ───────────────────────────────────────────────────
  // Sends the STL file as multipart/form-data together with the order JSON.
  // The order is NOT saved anywhere until the server confirms success.
  // If the upload fails, submitError is set and the user stays on step 2.
  const submitOrder = async () => {
    if (!file) {
      setSubmitError("No hay archivo STL adjunto. Regresa y sube tu modelo.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildOrderPayload();
      const formData = new FormData();
      formData.append("stlFile",   file, file.name);
      formData.append("orderData", JSON.stringify(payload));

      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/orders`, {
        method: "POST",
        body:   formData,
        // Do NOT set Content-Type — browser sets multipart boundary automatically.
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const { stlOriginalPath, stlScaledPath } = await res.json();

      // Merge server-confirmed storage paths into the payload for the confirm screen
      const confirmedOrder = {
        ...payload,
        stlOriginalPath,
        stlScaledPath,
      };

      // Mirror to localStorage so the admin dashboard can still see this order
      // if the admin hasn't yet connected the full API flow.
      try {
        const orders = JSON.parse(localStorage.getItem("inity_orders") || "[]");
        orders.unshift(confirmedOrder);
        localStorage.setItem("inity_orders", JSON.stringify(orders));

        const customers = JSON.parse(localStorage.getItem("inity_customers") || "[]");
        const idx = customers.findIndex(c => c.email === form.email);
        if (idx >= 0) {
          customers[idx].lastOrder   = confirmedOrder.timestamp;
          customers[idx].totalOrders += 1;
        } else {
          customers.push({
            id: form.email, name: form.name, company: form.company,
            email: form.email, phone: form.phone,
            firstOrder: confirmedOrder.timestamp,
            lastOrder: confirmedOrder.timestamp,
            totalOrders: 1, totalSpent: 0, status: "active",
          });
        }
        localStorage.setItem("inity_customers", JSON.stringify(customers));
      } catch {
        // localStorage mirror is non-critical; don't block the success flow.
      }

      setSavedOrder(confirmedOrder);
      setErrors({});
      setModalStep(3);
    } catch (err) {
      setSubmitError(err.message || "Error al enviar el pedido. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (modalStep === 1) {
      if (validateDelivery()) { setErrors({}); setModalStep(2); }
    } else if (modalStep === 2) {
      if (validatePayment()) submitOrder();
    }
  };

  const titleMap  = { 1:"Datos & Entrega", 2:"Pago SINPE Móvil", 3:"¡Pedido Confirmado!" };
  const btnLabel  = {
    1: "Continuar al pago →",
    2: submitting ? "Enviando pedido…" : "Confirmar pedido →",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background:"rgba(0,0,0,0.82)", backdropFilter:"blur(16px)" }}
      onClick={modalStep < 3 ? onClose : undefined}>
      <div className="relative w-full max-w-2xl rounded-[28px] overflow-hidden max-h-[92vh] flex flex-col"
        style={{ background:"linear-gradient(145deg,#0d0c1a,#121020)", border:"1px solid rgba(139,92,246,0.3)", boxShadow:"0 32px 80px rgba(0,0,0,0.85)" }}
        onClick={e => e.stopPropagation()}>

        {/* Close button */}
        {modalStep < 3 && (
          <button onClick={onClose} style={{ position:"absolute", top:14, right:14, zIndex:10, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.08)", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.55)", cursor:"pointer", fontSize:18 }}>×</button>
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1" style={{ padding:"24px 24px 28px" }}>
          <StepIndicator modalStep={modalStep} />

          {modalStep < 3 && (
            <>
              <p className="uppercase tracking-[0.22em] text-violet-400 text-xs mb-1">PEDIDO 3D</p>
              <h3 style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:18 }}>{titleMap[modalStep]}</h3>
            </>
          )}

          {modalStep === 1 && (
            <DeliveryStep
              form={form} setForm={setForm}
              deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod}
              delivery={delivery} setDelivery={setDelivery}
              errors={errors} pricing={pricing}
              unitPrice={unitPrice} qty={qty}
              modelScale={modelScale} modelStats={modelStats}
            />
          )}
          {modalStep === 2 && (
            <PaymentStep
              totalPrice={totalPrice}
              sinpe={sinpe} setSinpe={setSinpe}
              errors={errors}
            />
          )}
          {modalStep === 3 && (
            <ConfirmStep
              savedOrder={savedOrder}
              onNewOrder={() => { onNewOrder(); }}
              onClose={onClose}
              settings={settings}
            />
          )}
        </div>

        {/* Footer navigation */}
        {modalStep < 3 && (
          <div style={{ padding:"14px 24px 20px", borderTop:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
            {/* Upload / submit error banner */}
            {submitError && (
              <div style={{ marginBottom:10, padding:"10px 14px", borderRadius:10, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.35)", fontSize:12, color:"#f87171", fontWeight:600 }}>
                ⚠️ {submitError}
              </div>
            )}
            <div style={{ display:"flex", gap:10 }}>
              {modalStep > 1 && (
                <button
                  onClick={() => { setErrors({}); setSubmitError(null); setModalStep(s => s - 1); }}
                  disabled={submitting}
                  style={{ padding:"11px 18px", borderRadius:14, fontWeight:700, fontSize:13, cursor:submitting?"not-allowed":"pointer", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", opacity:submitting?0.4:1 }}>
                  ← Atrás
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={submitting}
                style={{ flex:1, padding:"13px 0", borderRadius:14, fontWeight:800, fontSize:14, cursor:submitting?"not-allowed":"pointer", background: submitting ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg,#7c3aed,#9333ea)", color:"#fff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background 0.2s" }}>
                {submitting && (
                  <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />
                )}
                {btnLabel[modalStep]}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutFlow;
