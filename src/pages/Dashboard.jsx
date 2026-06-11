import React, { useState, useMemo } from "react";
import {
  ChevronDown, ChevronUp, Pencil, Save, Trash2,
  Eye, EyeOff, Palette, Crown, Plus,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { calculatePrinterCosts, formatCRC, formatPrintTime, COMMERCIAL_MARKUP } from "../utils/pricingEngine";
import { DEFAULT_SETTINGS } from "../App";

// ── Shared constants ──────────────────────────────────────────────────────────

const STATUS_CFG = {
  pending_verification: { label:"Verif. SINPE",  dot:"#fb923c", bg:"rgba(251,146,60,0.15)",  border:"rgba(251,146,60,0.4)"  },
  pending:   { label:"Pendiente",    dot:"#f59e0b", bg:"rgba(245,158,11,0.15)",   border:"rgba(245,158,11,0.4)"  },
  quoted:    { label:"Cotizado",     dot:"#3b82f6", bg:"rgba(59,130,246,0.15)",   border:"rgba(59,130,246,0.4)"  },
  confirmed: { label:"Confirmado",   dot:"#8b5cf6", bg:"rgba(139,92,246,0.15)",   border:"rgba(139,92,246,0.4)"  },
  printing:  { label:"En impresión", dot:"#06b6d4", bg:"rgba(6,182,212,0.15)",    border:"rgba(6,182,212,0.4)"   },
  completed: { label:"Completado",   dot:"#10b981", bg:"rgba(16,185,129,0.15)",   border:"rgba(16,185,129,0.4)"  },
  cancelled: { label:"Cancelado",    dot:"#ef4444", bg:"rgba(239,68,68,0.15)",    border:"rgba(239,68,68,0.4)"   },
};

const SUPPORT_CFG = {
  none:     { label:"Sin soportes",       color:"#10b981" },
  light:    { label:"Soportes leves",     color:"#3b82f6" },
  moderate: { label:"Soportes moderados", color:"#f59e0b" },
  heavy:    { label:"Soportes pesados",   color:"#ef4444" },
};

const TECH_STYLES = {
  fdm: { label:"FDM", bg:"rgba(139,92,246,0.15)", border:"rgba(139,92,246,0.4)", color:"#c4b5fd", desc:"Fused Deposition · PLA / PETG / ABS", icon:"⬡" },
  sla: { label:"SLA", bg:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.35)",  color:"#fde68a", desc:"Stereolithography · High Detail",      icon:"◈" },
};

const PRINTER_STATUS_CFG = {
  active:      { label:"Activa",        color:"#10b981" },
  maintenance: { label:"Mantenimiento", color:"#f59e0b" },
  inactive:    { label:"Inactiva",      color:"#6b7280" },
};

const inputCls = "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none text-white focus:border-violet-500/60 transition-all text-sm placeholder:text-white/25";
const labelCls = "text-xs text-white/40 uppercase tracking-widest block mb-2";

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 3600) return `hace ${Math.round(diff/60)}m`;
  if (diff < 86400) return `hace ${Math.round(diff/3600)}h`;
  return `hace ${Math.round(diff/86400)}d`;
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, background:cfg.bg, border:`1px solid ${cfg.border}`, fontSize:11, fontWeight:700, color:cfg.dot, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, display:"inline-block", flexShrink:0 }} />
      {cfg.label}
    </span>
  );
};

const SectionTitle = ({ eyebrow, title }) => (
  <div className="mb-8">
    <p className="uppercase tracking-[0.3em] text-violet-400 text-xs">{eyebrow}</p>
    <h2 className="text-4xl font-black mt-2">{title}</h2>
  </div>
);

// ── CSV Export ────────────────────────────────────────────────────────────────

const exportOrdersCSV = (orders) => {
  const headers = ["Ref","Fecha","Estado","Cliente","Empresa","Email","Material","Color","Cantidad","Archivo","Dimensiones","Peso(g)","Horas","Soportes","Costo Real","Precio Venta","Ganancia","Margen%"];
  const rows = orders.map(o => [
    o.ref || o.id,
    new Date(o.timestamp).toLocaleDateString("es-CR"),
    o.status,
    o.customer?.name || o.fileName || "",
    o.customer?.company || "",
    o.customer?.email || "",
    o.quote?.material || o.material || "",
    o.quote?.color || o.color || "",
    o.quote?.quantity || 1,
    o.quote?.fileName || o.fileName || "",
    o.quote?.dimensions || o.dimensions || "",
    o.admin?.weightG || "",
    o.admin?.printHours?.toFixed(1) || "",
    o.admin?.supportLevel || "",
    o.admin?.breakdown?.costReal || o.admin?.costReal || "",
    o.quote?.totalPrice || o.totalCRC || "",
    Math.round((o.quote?.totalPrice || o.totalCRC || 0) - (o.admin?.breakdown?.costReal || o.admin?.costReal || 0)),
    "60%",
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `inity3d-pedidos-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
};

// ── SECTION 1: Resumen ────────────────────────────────────────────────────────

const ResumenSection = ({ orders, materials, printers, settings }) => {
  const inventory = (() => { try { return JSON.parse(localStorage.getItem("inity_inventory") || "{}"); } catch { return {}; } })();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthOrders = orders.filter(o => new Date(o.timestamp) >= monthStart);
  const monthRevenue = monthOrders.filter(o => o.status === "completed").reduce((s, o) => s + (o.quote?.totalPrice || o.totalCRC || 0), 0);
  const activeOrders = orders.filter(o => ["pending","quoted","confirmed","printing"].includes(o.status));
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const printingCount = orders.filter(o => o.status === "printing").length;
  const piecesThisMonth = monthOrders.filter(o => o.status === "completed").reduce((s, o) => s + (o.quote?.quantity || 1), 0);

  const recent5 = orders.slice(0, 5);

  const alerts = [];
  Object.entries(materials).forEach(([name, mat]) => {
    const inv = inventory[name] || {};
    const spools = inv.spools || 0;
    if (spools <= (settings?.lowStockAlert || 1)) {
      alerts.push({ type:"stock", msg:`${name}: ${spools} rollo${spools === 1 ? "" : "s"} en stock` });
    }
  });
  printers.forEach(p => {
    if (p.status === "maintenance") alerts.push({ type:"printer", msg:`${p.name} en mantenimiento` });
  });
  const oldPending = orders.filter(o => o.status === "pending" && (Date.now() - new Date(o.timestamp)) > 86400000);
  if (oldPending.length > 0) alerts.push({ type:"response", msg:`${oldPending.length} pedido(s) sin responder > 24h` });

  const kpis = [
    { label:"Ingresos del mes", value: formatCRC(monthRevenue), sub:"pedidos completados", color:"#8b5cf6", border:"rgba(139,92,246,0.4)" },
    { label:"Pedidos activos",  value: activeOrders.length,     sub:`${pendingCount} pendientes · ${printingCount} en impresión`, color:"#3b82f6", border:"rgba(59,130,246,0.4)" },
    { label:"Piezas producidas",value: piecesThisMonth,         sub:"este mes", color:"#10b981", border:"rgba(16,185,129,0.4)" },
    { label:"Margen promedio",  value: "60%",                   sub:"objetivo: 60%", color:"#f59e0b", border:"rgba(245,158,11,0.4)" },
  ];

  return (
    <div>
      <SectionTitle eyebrow="VISTA GENERAL" title="Resumen" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.08)`, borderTop:`2px solid ${k.border}` }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{k.label}</p>
            <p style={{ fontSize:26, fontWeight:900, color:k.color, marginTop:4, lineHeight:1 }}>{k.value}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:4 }}>{k.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="rounded-2xl p-6" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-bold text-white mb-4">Pedidos recientes</p>
          {recent5.length === 0 ? (
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>No hay pedidos aún</p>
          ) : (
            <div className="space-y-3">
              {recent5.map(o => (
                <div key={o.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{o.customer?.name || o.fileName || "—"}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{o.quote?.material || o.material || "—"} · {timeAgo(o.timestamp)}</p>
                  </div>
                  <StatusBadge status={o.status} />
                  <p style={{ fontSize:13, fontWeight:700, color:"#a78bfa", whiteSpace:"nowrap" }}>{formatCRC(o.quote?.totalPrice || o.totalCRC || 0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Alerts */}
        <div className="rounded-2xl p-6" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-bold text-white mb-4">Alertas</p>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3 py-3" style={{ color:"#10b981" }}>
              <span style={{ fontSize:20 }}>✅</span>
              <p style={{ fontSize:13 }}>Todo en orden — sin alertas activas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 rounded-xl px-3" style={{ background: a.type === "stock" ? "rgba(239,68,68,0.06)" : a.type === "printer" ? "rgba(245,158,11,0.06)" : "rgba(59,130,246,0.06)", border: a.type === "stock" ? "1px solid rgba(239,68,68,0.2)" : a.type === "printer" ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(59,130,246,0.2)" }}>
                  <span style={{ fontSize:16 }}>{a.type === "stock" ? "⚠️" : a.type === "printer" ? "🖨️" : "📋"}</span>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{a.msg}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── SECTION 2: Pedidos ────────────────────────────────────────────────────────

const NEXT_STATUSES = {
  pending_verification: ["confirmed","cancelled"],
  pending:   ["quoted","confirmed","cancelled"],
  quoted:    ["confirmed","cancelled"],
  confirmed: ["printing","cancelled"],
  printing:  ["completed","cancelled"],
  completed: [],
  cancelled: [],
};

const STATUS_BTN_CFG = {
  quoted:    { label:"Marcar Cotizado",   style:{ background:"rgba(59,130,246,0.15)",  border:"1px solid rgba(59,130,246,0.35)",  color:"#60a5fa" } },
  confirmed: { label:"Confirmar Pedido",  style:{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.35)", color:"#a78bfa" } },
  printing:  { label:"En Impresión",      style:{ background:"rgba(6,182,212,0.15)",   border:"1px solid rgba(6,182,212,0.35)",   color:"#22d3ee" } },
  completed: { label:"Completado ✓",      style:{ background:"rgba(16,185,129,0.15)",  border:"1px solid rgba(16,185,129,0.35)",  color:"#34d399" } },
  cancelled: { label:"Cancelar ✗",        style:{ background:"rgba(239,68,68,0.1)",    border:"1px solid rgba(239,68,68,0.3)",    color:"#f87171" } },
};

// ── STL download via signed Supabase URL ─────────────────────────────────────
// Calls the admin API which returns a 60-second signed URL from Supabase Storage.
// Requires a valid adminToken (admin JWT).

const downloadViaApi = async (orderId, type, adminToken, refStr) => {
  console.log('[Dashboard] Download clicked — orderId:', orderId, '| type:', type, '| hasToken:', !!adminToken);
  if (!adminToken) { alert("Inicia sesión como admin para descargar archivos."); return; }
  try {
    const apiBase = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${apiBase}/api/admin/orders/${orderId}/download/${type}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Error ${res.status}`);
    }
    const { url } = await res.json();
    // Fetch as blob so the `download` attribute works cross-origin (Supabase signed URLs).
    const blob = await fetch(url).then(r => r.blob());
    const refNum = (refStr || "").replace(/[^0-9]/g, "") || orderId.slice(-6);
    const fileName = `inity3d_order_${refNum}_${type}.stl`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch (err) {
    alert("No se pudo descargar el archivo: " + err.message);
  }
};

const viewPaymentReceipt = async (orderId, adminToken) => {
  if (!adminToken) { alert("Inicia sesión como admin para ver comprobantes."); return; }
  try {
    const apiBase = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${apiBase}/api/admin/orders/${orderId}/download/screenshot`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Error ${res.status}`);
    }
    const { url } = await res.json();
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (err) {
    alert("No se pudo cargar el comprobante: " + err.message);
  }
};

// ── Admin login component ─────────────────────────────────────────────────────

const AdminLogin = ({ onLogin }) => {
  const [creds, setCreds]   = useState({ username:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]    = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res  = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      sessionStorage.setItem("inity_admin_token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"#050816" }}>
      <div style={{ width:360, background:"linear-gradient(145deg,#0d0c1a,#121020)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:28, padding:"36px 32px", boxShadow:"0 24px 80px rgba(0,0,0,0.7)" }}>
        <p className="uppercase tracking-[0.3em] text-violet-400 text-xs mb-2">INITY 3D</p>
        <h2 className="text-2xl font-black text-white mb-2">Admin Dashboard</h2>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginBottom:28 }}>Inicia sesión para gestionar pedidos</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Usuario</label>
            <input value={creds.username} onChange={e=>setCreds(p=>({...p,username:e.target.value}))} className={inputCls} placeholder="admin" autoComplete="username" />
          </div>
          <div>
            <label className={labelCls}>Contraseña</label>
            <input type="password" value={creds.password} onChange={e=>setCreds(p=>({...p,password:e.target.value}))} className={inputCls} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <p style={{ color:"#f87171", fontSize:12, fontWeight:600 }}>⚠ {error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition"
            style={{ background: loading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg,#7c3aed,#9333ea)", border:"none", cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
            {loading ? "Iniciando sesión…" : "Iniciar sesión →"}
          </button>
        </form>
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:20, textAlign:"center" }}>
          Credenciales configuradas en las variables de entorno del servidor
        </p>
      </div>
    </div>
  );
};

const PedidosSection = ({ orders, setOrders, adminToken }) => {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [sort, setSort]         = useState("newest");
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        (o.customer?.name || "").toLowerCase().includes(q) ||
        (o.customer?.company || "").toLowerCase().includes(q) ||
        (o.ref || o.id || "").toLowerCase().includes(q) ||
        (o.quote?.material || o.material || "").toLowerCase().includes(q)
      );
    }
    if (filter !== "all") list = list.filter(o => o.status === filter);
    switch (sort) {
      case "oldest":  list.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); break;
      case "priceup": list.sort((a, b) => (a.quote?.totalPrice || a.totalCRC || 0) - (b.quote?.totalPrice || b.totalCRC || 0)); break;
      case "pricedown":list.sort((a, b) => (b.quote?.totalPrice || b.totalCRC || 0) - (a.quote?.totalPrice || a.totalCRC || 0)); break;
      default: list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    return list;
  }, [orders, search, filter, sort]);

  const updateStatus = (id, status) => {
    // Optimistic UI + localStorage update
    const updated = orders.map(o => {
      if (o.id !== id) return o;
      const next = { ...o, status };
      if (status === "completed") {
        try {
          const customers = JSON.parse(localStorage.getItem("inity_customers") || "[]");
          const email = o.customer?.email;
          if (email) {
            const idx = customers.findIndex(c => c.email === email);
            if (idx >= 0) customers[idx].totalSpent = (customers[idx].totalSpent || 0) + (o.quote?.totalPrice || o.totalCRC || 0);
            localStorage.setItem("inity_customers", JSON.stringify(customers));
          }
        } catch {}
      }
      return next;
    });
    setOrders(updated);
    localStorage.setItem("inity_orders", JSON.stringify(updated));

    // Sync status to Supabase via API when admin token is available
    if (adminToken) {
      const apiBase = import.meta.env.VITE_API_URL || "";
      fetch(`${apiBase}/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status }),
      }).catch(err => console.error("Status sync to API failed:", err));
    }
  };

  const deleteOrder = (id) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    localStorage.setItem("inity_orders", JSON.stringify(updated));
  };

  const statusCounts = Object.keys(STATUS_CFG).reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="uppercase tracking-[0.3em] text-violet-400 text-xs">GESTIÓN</p>
          <h2 className="text-4xl font-black mt-1">Pedidos</h2>
        </div>
        <button onClick={() => exportOrdersCSV(filtered)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-80"
          style={{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.35)", color:"#c4b5fd" }}>
          📥 Exportar CSV
        </button>
      </div>

      {/* Status pipeline */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(STATUS_CFG).map(([k, cfg]) => (
          <button key={k} onClick={() => setFilter(filter === k ? "all" : k)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition"
            style={{ background: filter === k ? cfg.bg : "rgba(255,255,255,0.03)", border:`1px solid ${filter === k ? cfg.border : "rgba(255,255,255,0.08)"}`, color: filter === k ? cfg.dot : "rgba(255,255,255,0.4)" }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot, display:"inline-block" }} />
            {cfg.label} {statusCounts[k] > 0 && <span style={{ background:"rgba(255,255,255,0.1)", borderRadius:999, padding:"0 5px" }}>{statusCounts[k]}</span>}
          </button>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, empresa, ref..." className={inputCls + " max-w-xs"} />
        <select value={sort} onChange={e => setSort(e.target.value)} className={inputCls + " w-auto"} style={{ appearance:"none" }}>
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="pricedown">Precio ↓</option>
          <option value="priceup">Precio ↑</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 flex flex-col items-center gap-3">
          <span style={{ fontSize:48 }}>📦</span>
          <p className="font-bold text-white text-lg">No hay pedidos</p>
          <p className="text-white/40 text-sm">Las cotizaciones de clientes aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const isOpen = expanded === order.id;
            const admin = order.admin || {};
            const bd    = admin.breakdown || {};
            const sc    = STATUS_CFG[order.status] || STATUS_CFG.pending;
            const supportCfg = SUPPORT_CFG[admin.supportLevel] || SUPPORT_CFG.none;
            const totalPrice = order.quote?.totalPrice || order.totalCRC || 0;
            const costReal   = bd.costReal || admin.costReal || 0;
            const profit     = totalPrice - costReal;

            return (
              <div key={order.id} className="rounded-3xl border border-white/10 overflow-hidden" style={{ background:"rgba(255,255,255,0.02)" }}>
                {/* Header */}
                <div className="p-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa", fontFamily:"monospace" }}>{order.ref || ("#"+order.id?.slice(-6))}</span>
                      <span className="text-white font-bold">{order.customer?.name || order.fileName || "—"}</span>
                      {order.customer?.company && <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>· {order.customer.company}</span>}
                    </div>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{order.quote?.material || order.material || "—"} {order.quote?.color && `— ${order.quote.color}`} {order.quote?.quantity > 1 && `· ×${order.quote.quantity}`} · {formatDate(order.timestamp)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                  <div className="text-right">
                    <p style={{ fontSize:20, fontWeight:900, color:"#a78bfa" }}>{formatCRC(totalPrice)}</p>
                    <button onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="text-xs text-white/40 hover:text-white/70 transition flex items-center gap-1 ml-auto mt-0.5">
                      {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {isOpen ? "Ocultar" : "Detalle"}
                    </button>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t border-white/10 p-5">
                    <div className="grid lg:grid-cols-2 gap-5 mb-5">
                      {/* Left — customer & quote */}
                      <div className="space-y-2">
                        <p style={{ fontSize:9, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)", marginBottom:8 }}>CLIENTE & COTIZACIÓN</p>
                        {[
                          ["Referencia",  order.ref || ("—")],
                          ["Cliente",     order.customer?.name || order.fileName || "—"],
                          ["Empresa",     order.customer?.company || "—"],
                          ["Email",       order.customer?.email || "—"],
                          ["Teléfono",    order.customer?.phone || "—"],
                          ["Archivo",     order.quote?.fileName || order.fileName || "—"],
                          ["Escala",      order.modelFile?.scalePct != null ? `${order.modelFile.scalePct}%${order.modelFile.scalePct === 100 ? " (original)" : ""}` : "—"],
                          ["Dimensiones", order.quote?.dimensions || order.dimensions || "—"],
                          ["Material",    `${order.quote?.material || order.material || "—"}${order.quote?.color ? ` — ${order.quote.color}` : ""}`],
                          ["Cantidad",    `${order.quote?.quantity || 1} pieza${(order.quote?.quantity || 1) > 1 ? "s" : ""}`],
                          ["Urgencia",    order.quote?.urgency === "semi" ? "Semi-urgente" : order.quote?.urgency === "urgent" ? "Urgente" : "Normal"],
                          ["Precio unit", formatCRC(order.quote?.unitPrice || totalPrice)],
                          ["Total",       formatCRC(totalPrice)],
                          ...(order.payment?.sinpeConfirmation ? [["SINPE Nº", order.payment.sinpeConfirmation]] : []),
                          ...(order.delivery ? [["Envío", order.delivery.method === "correos" ? `Correos: ${order.delivery.branch} (${order.delivery.province})` : `${order.delivery.district}, ${order.delivery.canton}, ${order.delivery.province}`]] : []),
                          ...(order.customer?.notes ? [["Notas", order.customer.notes]] : []),
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm gap-3">
                            <span className="text-white/40 shrink-0">{k}</span>
                            <span className="text-white/80 text-right">{v}</span>
                          </div>
                        ))}

                        {/* ── STL download via Supabase signed URL ── */}
                        {order.modelFile && (
                          <div className="pt-3 mt-1 space-y-2" style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                            <p style={{ fontSize:9, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:6 }}>📁 ARCHIVOS STL</p>
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => downloadViaApi(order.id, "original", adminToken, order.ref)}
                                disabled={!adminToken}
                                title={adminToken ? "Descargar STL original desde Supabase Storage" : "Inicia sesión para descargar"}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-80 disabled:opacity-35 disabled:cursor-not-allowed"
                                style={{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.35)", color:"#c4b5fd" }}>
                                ⬇ Original STL
                              </button>
                              {order.stlScaledPath && (
                                <button
                                  onClick={() => downloadViaApi(order.id, "scaled", adminToken, order.ref)}
                                  disabled={!adminToken}
                                  title={adminToken ? `Descargar STL escalado al ${order.modelFile.scalePct}%` : "Inicia sesión para descargar"}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-80 disabled:opacity-35 disabled:cursor-not-allowed"
                                  style={{ background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.35)", color:"#fde68a" }}>
                                  ⬇ Scaled {order.modelFile.scalePct}% STL
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ── Payment receipt ── */}
                        <div className="pt-3 mt-1" style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                          <p style={{ fontSize:9, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:8 }}>🧾 COMPROBANTE DE PAGO</p>
                          {order.screenshotPath ? (
                            <button
                              onClick={() => viewPaymentReceipt(order.id, adminToken)}
                              disabled={!adminToken}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-80 disabled:opacity-35 disabled:cursor-not-allowed"
                              style={{ background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.35)", color:"#4ade80" }}>
                              🔍 Ver comprobante
                            </button>
                          ) : (
                            <p style={{ fontSize:12, color:"rgba(255,255,255,0.28)" }}>Sin comprobante adjunto</p>
                          )}
                        </div>
                      </div>

                      {/* Right — admin technical */}
                      <div className="rounded-2xl p-4 space-y-2" style={{ background:"rgba(0,0,0,0.3)", borderTop:"2px solid rgba(139,92,246,0.4)" }}>
                        <p style={{ fontSize:9, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", color:"#a78bfa", marginBottom:8 }}>🔧 DATOS TÉCNICOS</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Peso</span>
                          <span className="text-white/80">{admin.weightG}g{admin.needsSupports && ` → ${admin.effectiveWeightG?.toFixed(1)}g efectivo`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Tiempo est.</span>
                          <span className="text-white/80">{admin.printTimeLabel || formatPrintTime(admin.printHours || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/40">Soportes</span>
                          <span style={{ fontSize:11, fontWeight:700, color:supportCfg.color }}>{supportCfg.label}{admin.supportLevel !== "none" && ` · ${admin.overhangPct}`}</span>
                        </div>
                        {admin.printer && (
                          <div className="flex justify-between text-sm">
                            <span className="text-white/40">Impresora</span>
                            <span className="text-white/80">{admin.printer.name} · {admin.printer.profile}</span>
                          </div>
                        )}

                        <div className="pt-3 mt-2" style={{ borderTop:"1px solid rgba(139,92,246,0.2)" }}>
                          <p style={{ fontSize:9, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", color:"#f59e0b", marginBottom:8 }}>💰 RENTABILIDAD</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/40">Costo real</span>
                            <span className="text-white/80">{formatCRC(costReal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/40">Precio venta</span>
                            <span className="text-violet-300">{formatCRC(totalPrice)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-white/40">Ganancia</span>
                            <span className="text-green-400">{formatCRC(profit)} (60%)</span>
                          </div>
                        </div>

                        {(bd.materialBase || bd.electricity) && (
                          <div className="pt-3 space-y-1.5" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                            {[
                              ["Material",    bd.materialBase],
                              ...(bd.supportMat > 0 ? [["Soporte mat.", bd.supportMat]] : []),
                              ["Electricidad",bd.electricity],
                              ["Amortización",bd.amortization],
                              ["Mano de obra",bd.labor],
                              ["Fallos 10%",  bd.failureCost],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between text-xs">
                                <span className="text-white/30">{k}</span>
                                <span className="text-white/50">{formatCRC(v || 0)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs font-bold pt-1.5" style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                              <span className="text-white/50">COSTO</span>
                              <span className="text-white/70">{formatCRC(costReal)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-violet-300/70">VENTA</span>
                              <span className="text-violet-400">{formatCRC(totalPrice)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      {(NEXT_STATUSES[order.status] || []).map(nextStatus => {
                        const cfg = STATUS_BTN_CFG[nextStatus];
                        if (!cfg) return null;
                        return (
                          <button key={nextStatus} onClick={() => updateStatus(order.id, nextStatus)}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition hover:opacity-80"
                            style={cfg.style}>
                            {cfg.label}
                          </button>
                        );
                      })}
                      <button onClick={() => deleteOrder(order.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition hover:opacity-80 flex items-center gap-1.5 ml-auto"
                        style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)" }}>
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── SECTION 3: Impresoras ─────────────────────────────────────────────────────

const FDM_DEFAULTS = { name:"", technology:"fdm", status:"inactive", purchasePriceCRC:0, amortizationYears:1, daysPerYear:312, hoursPerDay:10, wattsConsumption:300, electricityRateCRC:150, printSpeedProfiles:{ draft:{gPerHour:20,label:"Borrador rápido"}, standard:{gPerHour:12,label:"Estándar"}, quality:{gPerHour:6,label:"Alta calidad"} }, defaultProfile:"standard", buildVolume:{x:260,y:260,z:300}, maxTempNozzle:260, maxTempBed:100, hasEnclosure:false, operatorRateCRC:2000, prepHours:0.5, postHours:0.5, failureRate:0.10, notes:"" };
const SLA_DEFAULTS = { ...FDM_DEFAULTS, technology:"sla", wattsConsumption:200, slaSpeedMLPerHour:17, prepHours:0.75, postHours:0.75, failureRate:0.12 };

const PrinterEditForm = ({ draft, setDraft, onSave, onCancel }) => {
  if (!draft) return null;
  const set = (f, v) => setDraft(p => ({ ...p, [f]: v }));
  const setProfile = (profile, f, v) => setDraft(p => ({ ...p, printSpeedProfiles: { ...p.printSpeedProfiles, [profile]: { ...p.printSpeedProfiles[profile], [f]: v } } }));
  let costs = null;
  try { costs = calculatePrinterCosts(draft); } catch {}
  return (
    <div className="border-t border-white/10 p-6 space-y-6">
      <div>
        <p className={labelCls} style={{ color:"#a78bfa" }}>INVERSIÓN</p>
        <div className="grid sm:grid-cols-3 gap-4 mt-3">
          <div><label className={labelCls}>Nombre</label><input className={inputCls} value={draft.name} onChange={e => set("name", e.target.value)} placeholder="Ej: Creality K1C" /></div>
          <div><label className={labelCls}>Costo compra (₡)</label><input type="number" className={inputCls} value={draft.purchasePriceCRC} onChange={e => set("purchasePriceCRC", +e.target.value)} /></div>
          <div><label className={labelCls}>Años amortización</label><input type="number" className={inputCls} value={draft.amortizationYears} onChange={e => set("amortizationYears", +e.target.value)} /></div>
          <div><label className={labelCls}>Días activos / año</label><input type="number" className={inputCls} value={draft.daysPerYear} onChange={e => set("daysPerYear", +e.target.value)} /></div>
          <div><label className={labelCls}>Horas op. / día</label><input type="number" className={inputCls} value={draft.hoursPerDay} onChange={e => set("hoursPerDay", +e.target.value)} /></div>
          <div className="flex items-end"><p style={{ fontSize:12, color:"#a78bfa", fontStyle:"italic" }}>Costo/hora: {costs ? formatCRC(costs.amortPerHour) : "—"}</p></div>
        </div>
      </div>
      <div>
        <p className={labelCls} style={{ color:"#a78bfa" }}>ELECTRICIDAD</p>
        <div className="grid sm:grid-cols-3 gap-4 mt-3">
          <div><label className={labelCls}>Consumo (Watts)</label><input type="number" className={inputCls} value={draft.wattsConsumption} onChange={e => set("wattsConsumption", +e.target.value)} /></div>
          <div><label className={labelCls}>Tarifa ICE (₡/kWh)</label><input type="number" className={inputCls} value={draft.electricityRateCRC} onChange={e => set("electricityRateCRC", +e.target.value)} /></div>
          <div className="flex items-end"><p style={{ fontSize:12, color:"#a78bfa", fontStyle:"italic" }}>Costo/hora: {costs ? formatCRC(costs.elecPerHour) : "—"}</p></div>
        </div>
      </div>
      <div>
        <p className={labelCls} style={{ color:"#a78bfa" }}>VELOCIDADES</p>
        <div className="space-y-2 mt-3">
          {["draft","standard","quality"].map(profile => (
            <div key={profile} className="grid grid-cols-3 gap-3 items-center">
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", textTransform:"capitalize" }}>{profile}</span>
              <input type="number" className={inputCls} placeholder="g/h" value={draft.printSpeedProfiles[profile]?.gPerHour || ""} onChange={e => setProfile(profile, "gPerHour", +e.target.value)} />
              <input className={inputCls} placeholder="Etiqueta" value={draft.printSpeedProfiles[profile]?.label || ""} onChange={e => setProfile(profile, "label", e.target.value)} />
            </div>
          ))}
          <div className="flex items-center gap-4 pt-1">
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Perfil por defecto:</span>
            {["draft","standard","quality"].map(p => (
              <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name={`profile-${draft.id || "new"}`} checked={draft.defaultProfile === p} onChange={() => set("defaultProfile", p)} style={{ accentColor:"#7c3aed" }} />
                <span style={{ fontSize:12, color: draft.defaultProfile === p ? "#c4b5fd" : "rgba(255,255,255,0.4)" }}>{draft.printSpeedProfiles[p]?.label || p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className={labelCls} style={{ color:"#a78bfa" }}>OPERARIO</p>
        <div className="grid sm:grid-cols-4 gap-4 mt-3">
          <div><label className={labelCls}>Costo hora (₡)</label><input type="number" className={inputCls} value={draft.operatorRateCRC} onChange={e => set("operatorRateCRC", +e.target.value)} /></div>
          <div><label className={labelCls}>Preparación (h)</label><input type="number" step="0.25" className={inputCls} value={draft.prepHours} onChange={e => set("prepHours", +e.target.value)} /></div>
          <div><label className={labelCls}>Postproceso (h)</label><input type="number" step="0.25" className={inputCls} value={draft.postHours} onChange={e => set("postHours", +e.target.value)} /></div>
          <div><label className={labelCls}>Fallos (%)</label><input type="number" min="0" max="100" className={inputCls} value={Math.round((draft.failureRate||0)*100)} onChange={e => set("failureRate", +e.target.value/100)} /></div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background:"linear-gradient(135deg,#7c3aed,#9333ea)", color:"#fff" }}><Save size={15} /> Guardar</button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)" }}>Cancelar</button>
      </div>
    </div>
  );
};

const PrintersSection = ({ printers, setPrinters, orders }) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const startEdit = p => { setEditingId(p.id); setDraft({ ...p, printSpeedProfiles: JSON.parse(JSON.stringify(p.printSpeedProfiles)) }); };
  const startAdd  = tech => { setEditingId("new"); setDraft({ ...(tech==="sla"?SLA_DEFAULTS:FDM_DEFAULTS), technology:tech, id:Date.now().toString() }); };
  const cancelEdit = () => { setEditingId(null); setDraft(null); };
  const saveEdit  = () => { setPrinters(prev => editingId === "new" ? [...prev, draft] : prev.map(p => p.id === editingId ? draft : p)); cancelEdit(); };
  const activate  = (id, tech) => setPrinters(prev => prev.map(p => p.technology !== tech ? p : { ...p, status: p.id === id ? "active" : "inactive" }));

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthOrders = orders.filter(o => new Date(o.timestamp) >= monthStart && o.status === "completed");

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div><p className="uppercase tracking-[0.3em] text-violet-400 text-xs">EQUIPOS</p><h2 className="text-4xl font-black mt-1">Impresoras</h2></div>
        <div className="flex gap-2">
          <button onClick={() => startAdd("fdm")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.35)", color:"#c4b5fd" }}><Plus size={14} /> FDM</button>
          <button onClick={() => startAdd("sla")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", color:"#fde68a" }}><Plus size={14} /> SLA</button>
        </div>
      </div>
      {editingId === "new" && (
        <div className="rounded-3xl border border-violet-500/30 overflow-hidden mb-5" style={{ background:"rgba(139,92,246,0.04)" }}>
          <div className="p-5 border-b border-white/10"><p className="font-bold text-white">Nueva Impresora — {draft?.technology?.toUpperCase()}</p></div>
          <PrinterEditForm draft={draft} setDraft={setDraft} onSave={saveEdit} onCancel={cancelEdit} />
        </div>
      )}
      <div className="space-y-5">
        {printers.map(printer => {
          const ts = TECH_STYLES[printer.technology] || TECH_STYLES.fdm;
          const ps = PRINTER_STATUS_CFG[printer.status] || PRINTER_STATUS_CFG.inactive;
          const isEditing = editingId === printer.id;
          let costs = null;
          try { costs = calculatePrinterCosts(printer); } catch {}
          const availableHours = printer.daysPerYear * printer.hoursPerDay / 12;
          const usedHours = monthOrders.reduce((s, o) => s + (o.admin?.printHours || 0), 0);
          const utilPct = Math.min(100, Math.round((usedHours / availableHours) * 100));
          return (
            <div key={printer.id} className="rounded-3xl border border-white/10 overflow-hidden" style={{ background:"rgba(255,255,255,0.02)" }}>
              <div className="p-5 flex flex-wrap items-center gap-4">
                <div style={{ padding:"3px 9px", borderRadius:8, background:ts.bg, border:`1px solid ${ts.border}`, color:ts.color, fontSize:10, fontWeight:700, textTransform:"uppercase" }}>{ts.icon} {ts.label}</div>
                <div className="flex-1">
                  <p className="text-xl font-black text-white">{printer.name}</p>
                  <p style={{ fontSize:11, color:ps.color, fontWeight:600, marginTop:1 }}>● {ps.label}</p>
                </div>
                <div className="flex gap-2">
                  {printer.status !== "active" && <button onClick={() => activate(printer.id, printer.technology)} className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)", color:"#10b981" }}>Activar</button>}
                  <button onClick={() => isEditing ? cancelEdit() : startEdit(printer)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.3)", color:"#c4b5fd" }}><Pencil size={12} /> Editar</button>
                </div>
              </div>
              {costs && (
                <div className="px-5 pb-4">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[["Amort/hora", formatCRC(costs.amortPerHour)], ["Elect/hora", formatCRC(costs.elecPerHour)], ["Vel. estándar", `${costs.gPerHour} g/h`]].map(([l, v]) => (
                      <div key={l} className="rounded-xl p-3 text-center" style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.12)" }}>
                        <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{l}</p>
                        <p style={{ fontSize:13, fontWeight:800, color:"#c4b5fd", marginTop:2 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color:"rgba(255,255,255,0.4)" }}>Utilización este mes</span>
                      <span style={{ color:"rgba(255,255,255,0.6)", fontWeight:600 }}>{usedHours.toFixed(0)}h / {availableHours.toFixed(0)}h ({utilPct}%)</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height:4, background:"rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width:`${utilPct}%`, background:"linear-gradient(90deg,#7c3aed,#9333ea)" }} />
                    </div>
                  </div>
                </div>
              )}
              {isEditing && <PrinterEditForm draft={draft} setDraft={setDraft} onSave={saveEdit} onCancel={cancelEdit} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── SECTION 4: Materiales ─────────────────────────────────────────────────────

const MaterialsSection = ({ materials, setMaterials }) => {
  const [expandedMaterial, setExpandedMaterial] = useState(null);
  const [editingMaterial,  setEditingMaterial]  = useState(null);
  const [newName,  setNewName]  = useState(""); const [newSpoolPrice, setNewSpoolPrice] = useState(""); const [newSpoolWeight, setNewSpoolWeight] = useState("1000"); const [newDensity, setNewDensity] = useState(""); const [newTech, setNewTech] = useState("fdm");
  const [ccName, setCCName] = useState(""); const [ccHex, setCCHex] = useState("#a855f7"); const [ccPrice, setCCPrice] = useState(""); const [ccPremium, setCCPremium] = useState(false); const [ccFinish, setCCFinish] = useState("matte");
  const [inventory, setInventory] = useState(() => { try { return JSON.parse(localStorage.getItem("inity_inventory") || "{}"); } catch { return {}; } });

  const clone = () => JSON.parse(JSON.stringify(materials));

  const saveInventory = (inv) => { setInventory(inv); localStorage.setItem("inity_inventory", JSON.stringify(inv)); };
  const setSpools = (materialName, spools) => saveInventory({ ...inventory, [materialName]: { ...(inventory[materialName]||{}), spools: +spools } });

  const addMaterial = () => {
    if (!newName) return;
    const spc = parseFloat(newSpoolPrice)||0, swg = parseFloat(newSpoolWeight)||1000;
    const ppg = swg > 0 ? +(spc/swg).toFixed(4) : 0;
    const updated = clone();
    updated[newName] = { technology:newTech, spoolPriceCRC:spc, spoolWeightG:swg, pricePerGram:ppg, ...(newTech==="sla"?{density:parseFloat(newDensity)||1.10,pricePerML:ppg}:{}), colors:[] };
    setMaterials(updated);
    setNewName(""); setNewSpoolPrice(""); setNewSpoolWeight("1000"); setNewDensity(""); setNewTech("fdm");
  };

  const updateSpool = (n, f, v) => {
    const updated = clone(); const mat = updated[n];
    mat[f] = parseFloat(v)||0;
    const pg = mat.spoolWeightG > 0 ? +(mat.spoolPriceCRC/mat.spoolWeightG).toFixed(4) : 0;
    mat.pricePerGram = pg; if (mat.technology==="sla") mat.pricePerML = pg;
    setMaterials(updated);
  };

  const updateColor  = (n, i, p) => { const u = clone(); u[n].colors = u[n].colors.map((c,j)=>j===i?{...c,...p}:c); setMaterials(u); };
  const removeColor  = (n, i)    => { const u = clone(); u[n].colors = u[n].colors.filter((_,j)=>j!==i); setMaterials(u); };
  const addCC = (n) => {
    if (!ccName) return;
    const u = clone(); const mat = u[n];
    mat.colors.push({ name:ccName, hex:ccHex, finish:ccFinish, premium:ccPremium, hidden:false, useMaterialPrice:ccPrice==="", customPrice:ccPrice===""?mat.pricePerGram:parseFloat(ccPrice) });
    setMaterials(u); setCCName(""); setCCHex("#a855f7"); setCCPrice(""); setCCPremium(false); setCCFinish("matte");
  };

  return (
    <div>
      <SectionTitle eyebrow="INVENTARIO" title="Materiales" />
      {/* Add material */}
      <div className="rounded-3xl border border-white/10 glass-card p-6 mb-6">
        <h3 className="text-xl font-black mb-4">Agregar Material</h3>
        <div className="flex gap-3 mb-4">
          {["fdm","sla"].map(t => (<button key={t} onClick={() => setNewTech(t)} style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer", background: newTech===t ? TECH_STYLES[t].bg : "rgba(255,255,255,0.03)", border:`1px solid ${newTech===t ? TECH_STYLES[t].border : "rgba(255,255,255,0.08)"}`, color: newTech===t ? TECH_STYLES[t].color : "rgba(255,255,255,0.3)", fontSize:12, fontWeight:700 }}>{t.toUpperCase()}</button>))}
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <div><label className={labelCls}>Nombre</label><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="PLA CF" className={inputCls} /></div>
          <div><label className={labelCls}>Precio rollo (₡)</label><input type="number" value={newSpoolPrice} onChange={e=>setNewSpoolPrice(e.target.value)} placeholder="11960" className={inputCls} /></div>
          <div><label className={labelCls}>Peso rollo (g)</label><input type="number" value={newSpoolWeight} onChange={e=>setNewSpoolWeight(e.target.value)} placeholder="1000" className={inputCls} /></div>
          {newTech==="sla" && <div><label className={labelCls}>Densidad (g/cm³)</label><input type="number" value={newDensity} onChange={e=>setNewDensity(e.target.value)} placeholder="1.10" className={inputCls} /></div>}
          <button onClick={addMaterial} className="bg-violet-600 hover:bg-violet-500 transition rounded-2xl font-bold text-sm" style={{ height:46, alignSelf:"end" }}>Agregar</button>
        </div>
        {newSpoolPrice && newSpoolWeight && <p style={{ fontSize:11, color:"#a78bfa", marginTop:6, fontStyle:"italic" }}>= ₡{(parseFloat(newSpoolPrice)/parseFloat(newSpoolWeight)).toFixed(2)} por gramo</p>}
      </div>

      {Object.entries(materials).map(([name, material]) => {
        const expanded  = expandedMaterial === name;
        const isEditing = editingMaterial === name;
        const ts = TECH_STYLES[material.technology] || TECH_STYLES.fdm;
        const inv = inventory[name] || {};
        const spools = inv.spools || 0;
        const gramsAvail = spools * (material.spoolWeightG || 1000);
        const maxG = 5 * (material.spoolWeightG || 1000);
        const pct  = Math.min(100, Math.round((gramsAvail / maxG) * 100));
        const stockColor = spools > 2 ? "#10b981" : spools > 1 ? "#f59e0b" : "#ef4444";

        return (
          <div key={name} className="rounded-3xl border border-white/10 glass-card overflow-hidden mb-4">
            <div className="p-6 flex items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="grid lg:grid-cols-3 gap-4">
                  <div><label className={labelCls}>Nombre</label>
                    <input disabled={!isEditing} value={name} onChange={e=>{const u=clone();u[e.target.value]=u[name];delete u[name];setMaterials(u);}}
                      className={`w-full rounded-2xl px-4 py-4 text-2xl font-black transition ${isEditing?"bg-black/30 border border-violet-500/40":"bg-black/20 border border-white/10"}`} />
                  </div>
                  <div><label className={labelCls}>Precio del rollo (₡)</label>
                    <input type="number" disabled={!isEditing} value={material.spoolPriceCRC??""} onChange={e=>updateSpool(name,"spoolPriceCRC",e.target.value)}
                      className={`w-full rounded-2xl px-4 py-4 text-xl font-bold transition ${isEditing?"bg-black/30 border border-violet-500/40":"bg-black/20 border border-white/10"}`} />
                  </div>
                  <div><label className={labelCls}>Peso del rollo (g)</label>
                    <input type="number" disabled={!isEditing} value={material.spoolWeightG??""} onChange={e=>updateSpool(name,"spoolWeightG",e.target.value)}
                      className={`w-full rounded-2xl px-4 py-4 text-xl font-bold transition ${isEditing?"bg-black/30 border border-violet-500/40":"bg-black/20 border border-white/10"}`} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <p style={{ fontSize:12, color:"#a78bfa", fontStyle:"italic" }}>= ₡{(material.pricePerGram||0).toFixed(2)} por gramo</p>
                  {material.technology === "sla" && (
                    <div className="flex items-center gap-2">
                      <label className={labelCls + " mb-0"}>Densidad</label>
                      <input type="number" step="0.01" disabled={!isEditing} value={material.density??""} onChange={e=>{const u=clone();u[name].density=parseFloat(e.target.value);setMaterials(u);}}
                        className={`w-24 rounded-xl px-3 py-1.5 text-sm font-bold ${isEditing?"bg-black/30 border border-violet-500/40":"bg-black/20 border border-white/10"}`} />
                    </div>
                  )}
                </div>
                {/* Inventory */}
                <div className="pt-3" style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                  <p className={labelCls} style={{ color:"#a78bfa" }}>INVENTARIO</p>
                  <div className="grid sm:grid-cols-3 gap-4 mt-2 items-center">
                    <div><label className={labelCls}>Rollos en stock</label>
                      <input type="number" min="0" value={spools} onChange={e=>setSpools(name,e.target.value)} className={inputCls} style={{ width:100 }} />
                    </div>
                    <div>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Gramos disponibles</p>
                      <p style={{ fontSize:16, fontWeight:700, color:stockColor }}>{gramsAvail.toLocaleString()}g</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color:"rgba(255,255,255,0.35)" }}>Stock</span>
                        <span style={{ color:stockColor, fontWeight:600 }}>{spools} rollos</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height:5, background:"rgba(255,255,255,0.08)" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:stockColor, borderRadius:999, transition:"all 0.3s" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 mt-1">
                <div style={{ padding:"3px 8px", borderRadius:8, background:ts.bg, border:`1px solid ${ts.border}`, color:ts.color, fontSize:10, fontWeight:700, textTransform:"uppercase", whiteSpace:"nowrap" }}>{ts.icon} {ts.label}</div>
                <button onClick={()=>isEditing?setEditingMaterial(null):setEditingMaterial(name)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${isEditing?"bg-green-500/20 text-green-300":"bg-violet-500/10 text-violet-300"}`}>{isEditing?<Save size={18}/>:<Pencil size={18}/>}</button>
                <button onClick={()=>setExpandedMaterial(expanded?null:name)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">{expanded?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</button>
                <button onClick={()=>{const u=clone();delete u[name];setMaterials(u);}} className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition"><Trash2 size={18}/></button>
              </div>
            </div>
            {expanded && (
              <div className="px-6 pb-6 border-t border-white/10">
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-2 mb-4"><Palette className="text-violet-400" size={18}/><h3 className="text-xl font-black">Agregar Color</h3></div>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
                    <div><label className="text-xs text-white/50 block mb-2">Nombre</label><input value={ccName} onChange={e=>setCCName(e.target.value)} placeholder="Silk Gold" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" /></div>
                    <div><label className="text-xs text-white/50 block mb-2">Color</label><div className="h-[46px] rounded-xl border border-white/10 overflow-hidden"><input type="color" value={ccHex} onChange={e=>setCCHex(e.target.value)} className="w-full h-full cursor-pointer" /></div></div>
                    <div><label className="text-xs text-white/50 block mb-2">Acabado</label>
                      <div className="flex gap-1 h-[46px]">
                        {["matte","glossy","translucent","glow"].map(f=>(
                          <button key={f} onClick={()=>setCCFinish(f)} style={{ flex:1, borderRadius:8, cursor:"pointer", background:ccFinish===f?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.04)", border:ccFinish===f?"1px solid rgba(139,92,246,0.6)":"1px solid rgba(255,255,255,0.08)", color:ccFinish===f?"#c4b5fd":"rgba(255,255,255,0.3)", fontSize:8, fontWeight:700, textTransform:"uppercase" }}>{f.slice(0,3)}</button>
                        ))}
                      </div>
                    </div>
                    <div><label className="text-xs text-white/50 block mb-2">Precio override</label><input type="number" value={ccPrice} onChange={e=>setCCPrice(e.target.value)} placeholder={`₡${material.pricePerGram}`} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" /></div>
                    <div><label className="text-xs text-white/50 block mb-2">Premium</label>
                      <button onClick={()=>setCCPremium(!ccPremium)} className={`relative w-full h-[46px] rounded-xl transition-all border ${ccPremium?"bg-yellow-500/20 border-yellow-400/30":"bg-black/20 border-white/10"}`}>
                        <div className={`absolute top-1.5 w-8 h-8 rounded-full bg-white transition-all flex items-center justify-center ${ccPremium?"left-[calc(100%-38px)]":"left-1.5"}`}><Crown size={14} className={ccPremium?"text-yellow-500":"text-gray-400"}/></div>
                        <span className="text-xs font-bold">{ccPremium?"PRO":"STD"}</span>
                      </button>
                    </div>
                    <button onClick={()=>addCC(name)} className="bg-violet-600 hover:bg-violet-500 transition rounded-xl font-bold text-sm" style={{ height:46 }}>Agregar</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-5">
                  {material.colors.map((color, index) => (
                    <div key={index} className={`rounded-2xl border p-4 transition ${color.hidden?"border-white/5 opacity-40 bg-black/10":"border-white/10 bg-black/20"}`}>
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl border border-white/10 shrink-0" style={{ background:color.hex }} />
                        <div className="flex-1 space-y-2">
                          <input disabled={!isEditing} value={color.name} onChange={e=>updateColor(name,index,{name:e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" />
                          <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl px-3 py-2">
                            <span className="text-xs text-white/50">Precio del material</span>
                            <button disabled={!isEditing} onClick={()=>updateColor(name,index,{useMaterialPrice:!color.useMaterialPrice,customPrice:!color.useMaterialPrice?material.pricePerGram:color.customPrice})} className={`relative w-10 h-5 rounded-full transition-all ${color.useMaterialPrice?"bg-green-500":"bg-white/10"}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${color.useMaterialPrice?"left-5":"left-0.5"}`} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button disabled={!isEditing} onClick={()=>updateColor(name,index,{hidden:!color.hidden})} className="w-9 h-9 rounded-xl bg-black/20 text-white/50 flex items-center justify-center">{color.hidden?<EyeOff size={15}/>:<Eye size={15}/>}</button>
                          <button disabled={!isEditing} onClick={()=>removeColor(name,index)} className="w-9 h-9 rounded-xl bg-red-500/10 text-red-300 flex items-center justify-center"><Trash2 size={15}/></button>
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
  );
};

// ── SECTION 5: Clientes ───────────────────────────────────────────────────────

const ClientesSection = ({ orders }) => {
  const [customers, setCustomers] = useState(() => { try { return JSON.parse(localStorage.getItem("inity_customers") || "[]"); } catch { return []; } });
  const [search, setSearch] = useState("");
  const [sort,   setSort]   = useState("lastOrder");
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    let list = [...customers];
    if (search) { const q = search.toLowerCase(); list = list.filter(c => (c.name||"").toLowerCase().includes(q) || (c.company||"").toLowerCase().includes(q) || (c.email||"").toLowerCase().includes(q)); }
    if (sort === "lastOrder") list.sort((a, b) => new Date(b.lastOrder||0) - new Date(a.lastOrder||0));
    else if (sort === "spent") list.sort((a, b) => (b.totalSpent||0) - (a.totalSpent||0));
    else list.sort((a, b) => (a.company||"").localeCompare(b.company||""));
    return list;
  }, [customers, search, sort]);

  return (
    <div>
      <SectionTitle eyebrow="CRM" title="Clientes" />
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, empresa, email..." className={inputCls + " max-w-xs"} />
        <select value={sort} onChange={e=>setSort(e.target.value)} className={inputCls + " w-auto"} style={{ appearance:"none" }}>
          <option value="lastOrder">Último pedido</option>
          <option value="spent">Mayor gasto</option>
          <option value="company">Empresa A-Z</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 flex flex-col items-center gap-3">
          <span style={{ fontSize:48 }}>👥</span>
          <p className="font-bold text-white text-lg">No hay clientes aún</p>
          <p className="text-white/40 text-sm">Los clientes aparecerán cuando envíen cotizaciones</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(customer => {
            const isOpen = expanded === customer.id;
            const clientOrders = orders.filter(o => o.customer?.email === customer.email);
            return (
              <div key={customer.id} className="rounded-2xl border border-white/10 overflow-hidden" style={{ background:"rgba(255,255,255,0.02)" }}>
                <div className="p-5 flex flex-wrap items-center gap-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : customer.id)}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{customer.name}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{customer.company} · {customer.email}</p>
                    {customer.phone && <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{customer.phone}</p>}
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize:18, fontWeight:900, color:"#a78bfa" }}>{customer.totalOrders || 0}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>pedidos</p>
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize:14, fontWeight:700, color:"#34d399" }}>{formatCRC(customer.totalSpent || 0)}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>gastado</p>
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{timeAgo(customer.lastOrder)}</div>
                  {isOpen ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                </div>
                {isOpen && (
                  <div className="border-t border-white/10 p-5 space-y-3">
                    <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", color:"rgba(255,255,255,0.4)", textTransform:"uppercase" }}>Historial de pedidos</p>
                    {clientOrders.length === 0 ? <p className="text-white/30 text-sm">Sin pedidos</p> : clientOrders.map(o => (
                      <div key={o.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className="flex-1"><p className="text-sm text-white/80">{o.ref || o.id?.slice(-6)} · {o.quote?.material || o.material}</p><p style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{formatDate(o.timestamp)}</p></div>
                        <StatusBadge status={o.status} />
                        <p style={{ fontSize:13, fontWeight:700, color:"#a78bfa" }}>{formatCRC(o.quote?.totalPrice || o.totalCRC || 0)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── SECTION 6: Ventas ─────────────────────────────────────────────────────────

const CHART_COLORS = ["#8b5cf6","#3b82f6","#10b981","#f59e0b","#ef4444","#06b6d4"];
const DEMO_NOTE = ({ children }) => <p style={{ fontSize:11, color:"rgba(245,158,11,0.7)", fontStyle:"italic", marginTop:4 }}>{children}</p>;

const VentasSection = ({ orders }) => {
  const [range, setRange] = useState("month");

  const rangeStart = useMemo(() => {
    const now = new Date();
    switch (range) {
      case "week":  return new Date(now - 7*86400000);
      case "month": return new Date(now.getFullYear(), now.getMonth(), 1);
      case "q3":    return new Date(now - 90*86400000);
      case "year":  return new Date(now.getFullYear(), 0, 1);
      default:      return new Date(0);
    }
  }, [range]);

  const filtered = orders.filter(o => new Date(o.timestamp) >= rangeStart);
  const completed = filtered.filter(o => o.status === "completed");
  const hasData = completed.length > 0;

  const totalRevenue = completed.reduce((s, o) => s + (o.quote?.totalPrice || o.totalCRC || 0), 0);
  const totalCost    = completed.reduce((s, o) => s + (o.admin?.costReal || o.admin?.breakdown?.costReal || 0), 0);
  const totalProfit  = totalRevenue - totalCost;
  const avgMargin    = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 60;
  const avgTicket    = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;
  const totalGrams   = completed.reduce((s, o) => s + (o.admin?.weightG || 0), 0);
  const totalHours   = completed.reduce((s, o) => s + (o.admin?.printHours || 0), 0);

  // Weekly revenue chart
  const weeklyData = useMemo(() => {
    const weeks = {};
    completed.forEach(o => {
      const d = new Date(o.timestamp);
      const wk = `${d.getMonth()+1}/${d.getDate() - d.getDay()}`;
      weeks[wk] = (weeks[wk] || 0) + (o.quote?.totalPrice || o.totalCRC || 0);
    });
    if (!hasData) return [{ week:"Sem 1",revenue:21000 },{ week:"Sem 2",revenue:35000 },{ week:"Sem 3",revenue:28000 },{ week:"Sem 4",revenue:42000 }];
    return Object.entries(weeks).map(([k, v]) => ({ week:k, revenue:v })).slice(-8);
  }, [completed, hasData]);

  // Materials pie
  const materialsData = useMemo(() => {
    const counts = {};
    completed.forEach(o => { const m = o.quote?.material || o.material || "Otro"; counts[m] = (counts[m]||0) + 1; });
    if (!hasData) return [{ name:"PLA+",value:45 },{ name:"PETG",value:30 },{ name:"ABS",value:15 },{ name:"Resina",value:10 }];
    return Object.entries(counts).map(([n, v]) => ({ name:n, value:v }));
  }, [completed, hasData]);

  // Status funnel
  const funnelData = Object.entries(STATUS_CFG).map(([k, cfg]) => ({ name:cfg.label, count: filtered.filter(o=>o.status===k).length, color:cfg.dot }));

  // Top clients
  const topClients = useMemo(() => {
    const by = {};
    completed.forEach(o => { const c = o.customer?.company || o.customer?.name || "Sin empresa"; by[c] = (by[c]||0) + (o.quote?.totalPrice || o.totalCRC || 0); });
    if (!hasData) return [{ name:"Empresa A",revenue:84000 },{ name:"Empresa B",revenue:63000 },{ name:"Empresa C",revenue:42000 }];
    return Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,v])=>({ name:n, revenue:v }));
  }, [completed, hasData]);

  const kpis = [
    { label:"Ingresos",       value:formatCRC(hasData?totalRevenue:125000),  color:"#8b5cf6" },
    { label:"Costo total",    value:formatCRC(hasData?totalCost:50000),       color:"#3b82f6" },
    { label:"Ganancia bruta", value:formatCRC(hasData?totalProfit:75000),     color:"#10b981" },
    { label:"Margen",         value:`${hasData?avgMargin:60}%`,               color:"#f59e0b" },
    { label:"Pedidos",        value:hasData?completed.length:12,              color:"#8b5cf6" },
    { label:"Ticket prom.",   value:formatCRC(hasData?avgTicket:10417),       color:"#06b6d4" },
    { label:"Gramos",         value:`${hasData?totalGrams.toFixed(0):340}g`,  color:"#10b981" },
    { label:"Horas máq.",     value:`${hasData?totalHours.toFixed(0):28}h`,   color:"#a78bfa" },
  ];

  const chartTooltipStyle = { background:"rgba(10,10,20,0.9)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:12, color:"#fff", fontSize:12 };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div><p className="uppercase tracking-[0.3em] text-violet-400 text-xs">ANÁLISIS</p><h2 className="text-4xl font-black mt-1">Ventas</h2></div>
        <div className="flex gap-2">
          {[["week","Esta semana"],["month","Este mes"],["q3","3 meses"],["year","Este año"]].map(([v,l]) => (
            <button key={v} onClick={() => setRange(v)} className="px-4 py-2 rounded-xl text-xs font-bold transition"
              style={{ background: range===v ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)", border: range===v ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)", color: range===v ? "#c4b5fd" : "rgba(255,255,255,0.4)" }}>{l}</button>
          ))}
        </div>
      </div>

      {!hasData && <DEMO_NOTE>⚠ Mostrando datos de ejemplo — tus datos aparecerán cuando tengas pedidos completados</DEMO_NOTE>}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl p-3 text-center" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{k.label}</p>
            <p style={{ fontSize:14, fontWeight:900, color:k.color, marginTop:3 }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue bar chart */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-bold text-white mb-4">Ingresos por semana</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ top:5, right:10, left:0, bottom:5 }}>
              <XAxis dataKey="week" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"rgba(255,255,255,0.35)", fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => `₡${(v/1000).toFixed(0)}K`} width={50} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={v => [formatCRC(v), "Ingresos"]} />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Materials pie */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-bold text-white mb-4">Materiales más usados</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={materialsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {materialsData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend iconSize={8} wrapperStyle={{ fontSize:11, color:"rgba(255,255,255,0.5)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status funnel */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-bold text-white mb-4">Pipeline de pedidos</p>
          <div className="space-y-2">
            {funnelData.map(d => {
              const maxCount = Math.max(...funnelData.map(x => x.count), 1);
              const pct = Math.round((d.count / maxCount) * 100);
              return (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color:"rgba(255,255,255,0.5)" }}>{d.name}</span>
                    <span style={{ color:d.color, fontWeight:700 }}>{d.count}</span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height:6, background:"rgba(255,255,255,0.06)" }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:d.color, borderRadius:999, transition:"all 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top clients */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-bold text-white mb-4">Top clientes por ingreso</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topClients} layout="vertical" margin={{ top:0, right:10, left:0, bottom:0 }}>
              <XAxis type="number" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => `₡${(v/1000).toFixed(0)}K`} />
              <YAxis dataKey="name" type="category" tick={{ fill:"rgba(255,255,255,0.45)", fontSize:10 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={v => [formatCRC(v), "Ingresos"]} />
              <Bar dataKey="revenue" fill="#6d28d9" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ── SECTION 7: Envíos ─────────────────────────────────────────────────────────

const EnviosSection = ({ adminToken }) => {
  const [config, setConfig]               = React.useState(null);
  const [rates, setRates]                 = React.useState([]);
  const [loading, setLoading]             = React.useState(true);
  const [saving, setSaving]               = React.useState(false);
  const [saved, setSaved]                 = React.useState(false);
  const [margin, setMargin]               = React.useState("");
  const [packagingWeight, setPackagingWeight] = React.useState("");

  const apiBase = import.meta.env.VITE_API_URL || "";
  const authHeaders = { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" };

  React.useEffect(() => {
    Promise.all([
      fetch(`${apiBase}/api/admin/shipping/config`, { headers: authHeaders }).then(r => r.json()),
      fetch(`${apiBase}/api/admin/shipping/rates`,  { headers: authHeaders }).then(r => r.json()),
    ])
      .then(([cfg, ratesData]) => {
        setConfig(cfg);
        setMargin(String(cfg.margin_percent));
        setPackagingWeight(String(cfg.packaging_weight_g));
        setRates(ratesData.rates || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res  = await fetch(`${apiBase}/api/admin/shipping/config`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ margin_percent: Number(margin), packaging_weight_g: Number(packagingWeight) }),
      });
      const data = await res.json();
      setConfig(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color:"rgba(255,255,255,0.4)", padding:40 }}>Cargando configuración de envíos...</div>;

  return (
    <div>
      <SectionTitle eyebrow="LOGÍSTICA" title="Envíos" />

      {/* Rates table */}
      <div className="rounded-2xl p-6 mb-6" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)" }}>
        <p className="font-bold text-white mb-4">Tarifas base — Correos de Costa Rica</p>
        <table className="w-full" style={{ borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
              {["Origen","Destino","Primer kg","Kg adicional"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"6px 12px", fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rates.map(r => (
              <tr key={r.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding:"10px 12px", fontSize:13, color:"rgba(255,255,255,0.75)" }}>{r.origin_zone}</td>
                <td style={{ padding:"10px 12px", fontSize:13, color:"rgba(255,255,255,0.75)" }}>{r.destination_zone}</td>
                <td style={{ padding:"10px 12px", fontSize:13, color:"#a78bfa", fontWeight:700 }}>{formatCRC(r.first_kg_crc)}</td>
                <td style={{ padding:"10px 12px", fontSize:13, color:"rgba(255,255,255,0.6)" }}>{formatCRC(r.additional_kg_crc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.28)", marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          Tarifas PYMEXPRESS Categoría Emprendedor. Actualizar manualmente cuando Correos modifique sus precios.
        </p>
      </div>

      {/* Config panel */}
      <div className="rounded-2xl p-6" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)" }}>
        <p className="font-bold text-white mb-6">Configuración editable</p>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelCls}>Margen de servicio (%)</label>
            <input type="number" min="0" max="100" step="0.5" value={margin} onChange={e => setMargin(e.target.value)} className={inputCls} />
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>Ej: 5 → se cobra 5% extra sobre la tarifa base de Correos</p>
          </div>
          <div>
            <label className={labelCls}>Peso de empaque (g)</label>
            <input type="number" min="0" step="10" value={packagingWeight} onChange={e => setPackagingWeight(e.target.value)} className={inputCls} />
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>Ej: 150 → se suman 150g al peso del modelo para calcular la tarifa</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding:"10px 22px", borderRadius:12, fontWeight:700, fontSize:13, cursor:saving?"not-allowed":"pointer", background:saving?"rgba(139,92,246,0.3)":"rgba(139,92,246,0.8)", color:"#fff", border:"none", transition:"background 0.2s" }}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          {saved && <span style={{ fontSize:12, color:"#4ade80", fontWeight:600 }}>✓ Guardado</span>}
        </div>
        {config?.updated_at && (
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:16 }}>
            Última actualización: {formatDate(config.updated_at)}{config.updated_by ? ` · por ${config.updated_by}` : ""}
          </p>
        )}
      </div>
    </div>
  );
};

// ── SECTION 8: Configuración ──────────────────────────────────────────────────

const ConfiguracionSection = ({ settings, setSettings }) => {
  const [draft, setDraft] = useState({ ...settings });
  const set = (k, v) => setDraft(p => ({ ...p, [k]: v }));
  const save = () => { setSettings(draft); };
  const margin = Math.round((1 - 1/draft.commercialMarkup) * 100);

  return (
    <div>
      <SectionTitle eyebrow="AJUSTES" title="Configuración" />
      <div className="space-y-8 max-w-3xl">

        {/* Negocio */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background:"rgba(255,255,255,0.02)" }}>
          <p className={labelCls} style={{ color:"#a78bfa", fontSize:11, marginBottom:16 }}>NEGOCIO</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[["businessName","Nombre del negocio","Inity 3D"],["email","Email de contacto","hola@inity3d.com"],["whatsapp","WhatsApp","+506 XXXX-XXXX"],["address","Dirección","Costa Rica"]].map(([k, l, ph]) => (
              <div key={k}><label className={labelCls}>{l}</label><input value={draft[k]||""} onChange={e=>set(k,e.target.value)} placeholder={ph} className={inputCls} /></div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>IVA:</span>
            <button onClick={()=>set("applyVAT",!draft.applyVAT)} className={`relative w-12 h-7 rounded-full transition-all duration-300 ${draft.applyVAT?"bg-violet-600":"bg-white/10"}`}>
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${draft.applyVAT?"left-6":"left-1"}`} />
            </button>
            {draft.applyVAT && <input type="number" value={draft.vatRate} onChange={e=>set("vatRate",+e.target.value)} className={inputCls} style={{ width:80 }} />}
            {draft.applyVAT && <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>%</span>}
          </div>
        </div>

        {/* Precios */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background:"rgba(255,255,255,0.02)" }}>
          <p className={labelCls} style={{ color:"#a78bfa", fontSize:11, marginBottom:16 }}>PRECIOS</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Markup comercial (× costo real)</label>
              <input type="number" step="0.1" min="1" value={draft.commercialMarkup} onChange={e=>set("commercialMarkup",+e.target.value)} className={inputCls} />
              <p style={{ fontSize:11, color:"#10b981", marginTop:4, fontStyle:"italic" }}>→ Margen resultante: ~{margin}%</p>
            </div>
            <div>
              <label className={labelCls}>Precio mínimo (₡)</label>
              <input type="number" value={draft.minimumPrice} onChange={e=>set("minimumPrice",+e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Recargo semi-urgente (%)</label>
              <input type="number" value={Math.round((draft.urgencySemi||0)*100)} onChange={e=>set("urgencySemi",+e.target.value/100)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Recargo urgente (%)</label>
              <input type="number" value={Math.round((draft.urgencyUrgent||0)*100)} onChange={e=>set("urgencyUrgent",+e.target.value/100)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Cotizaciones */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background:"rgba(255,255,255,0.02)" }}>
          <p className={labelCls} style={{ color:"#a78bfa", fontSize:11, marginBottom:16 }}>COTIZACIONES</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Validez cotización (días)</label><input type="number" value={draft.quoteValidDays} onChange={e=>set("quoteValidDays",+e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Tiempo de respuesta (h)</label><input type="number" value={draft.responseTimeH} onChange={e=>set("responseTimeH",+e.target.value)} className={inputCls} /></div>
          </div>
          <div className="mt-4"><label className={labelCls}>Mensaje de bienvenida</label><textarea value={draft.welcomeMessage||""} onChange={e=>set("welcomeMessage",e.target.value)} rows={2} className={inputCls + " resize-none"} /></div>
        </div>

        {/* Notificaciones */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background:"rgba(255,255,255,0.02)" }}>
          <p className={labelCls} style={{ color:"#a78bfa", fontSize:11, marginBottom:16 }}>NOTIFICACIONES</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Email notificaciones</label><input value={draft.notificationEmail||""} onChange={e=>set("notificationEmail",e.target.value)} placeholder="admin@inity3d.com" className={inputCls} /></div>
            <div><label className={labelCls}>Stock mínimo alerta (rollos)</label><input type="number" value={draft.lowStockAlert} onChange={e=>set("lowStockAlert",+e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        <button onClick={save} className="primary-button px-10 py-4 rounded-2xl font-bold text-base">Guardar Configuración</button>
      </div>
    </div>
  );
};

// ── Sidebar navigation ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id:"resumen",       icon:"📊", label:"Resumen" },
  { id:"pedidos",       icon:"📦", label:"Pedidos" },
  { id:"impresoras",    icon:"🖨️",  label:"Impresoras" },
  { id:"materiales",    icon:"🧵", label:"Materiales" },
  { id:"clientes",      icon:"👥", label:"Clientes" },
  { id:"ventas",        icon:"📈", label:"Ventas" },
  { id:"envios",        icon:"🚚", label:"Envíos" },
  { id:"configuracion", icon:"⚙️", label:"Configuración" },
];

// ── Main Dashboard ────────────────────────────────────────────────────────────

const Dashboard = ({ materials, setMaterials, printers, setPrinters, settings, setSettings }) => {
  const [activeSection, setActiveSection] = useState("resumen");

  // ── Admin JWT auth ──────────────────────────────────────────────────────────
  // Token is held in sessionStorage so it survives page refreshes within the same
  // tab session but is cleared when the browser tab/window is closed.
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("inity_admin_token") || null);

  const handleLogin  = (token) => setAdminToken(token);
  const handleLogout = () => {
    sessionStorage.removeItem("inity_admin_token");
    setAdminToken(null);
  };

  // ── Orders: loaded from localStorage; refreshed from API when token available ─
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("inity_orders") || "[]"); }
    catch { return []; }
  });

  // Refresh orders from API on mount (and whenever the token changes)
  React.useEffect(() => {
    if (!adminToken) return;
    const apiBase = import.meta.env.VITE_API_URL || "";
    fetch(`${apiBase}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then(r => {
        if (r.status === 401) { handleLogout(); return null; }
        return r.json();
      })
      .then(data => {
        if (data?.orders) {
          setOrders(data.orders);
          // Keep localStorage in sync so offline / non-API sections still work
          localStorage.setItem("inity_orders", JSON.stringify(data.orders));
        }
      })
      .catch(err => console.error("Failed to fetch orders from API:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  // Show login screen if not authenticated
  if (!adminToken) return <AdminLogin onLogin={handleLogin} />;

  const pendingCount = orders.filter(o => o.status === "pending" || o.status === "pending_verification").length;

  return (
    <div className="min-h-screen text-white flex" style={{ background:"#050816" }}>
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full flex flex-col z-40" style={{ width:240, background:"#060614", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
        <div className="p-6 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <p className="text-lg font-black text-white tracking-tight">INITY <span className="text-violet-400">3D</span></p>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(139,92,246,0.7)", background:"rgba(139,92,246,0.1)", borderRadius:4, padding:"2px 6px", marginTop:4, display:"inline-block" }}>Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left relative"
                style={{ background: isActive ? "rgba(139,92,246,0.2)" : "transparent", color: isActive ? "#ede9fe" : "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                <span style={{ fontSize:16 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "pedidos" && pendingCount > 0 && (
                  <span style={{ marginLeft:"auto", minWidth:18, height:18, borderRadius:999, background:"#8b5cf6", color:"#fff", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px" }}>{pendingCount}</span>
                )}
                {isActive && <div style={{ position:"absolute", left:0, top:"25%", bottom:"25%", width:3, background:"#7c3aed", borderRadius:"0 3px 3px 0" }} />}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t space-y-2" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)" }}>v1.0.0</p>
          <a href="/" style={{ fontSize:11, color:"rgba(139,92,246,0.7)", textDecoration:"none", display:"block" }}>← Ver sitio</a>
          <button onClick={handleLogout} style={{ fontSize:11, color:"rgba(239,68,68,0.6)", background:"none", border:"none", cursor:"pointer", padding:0 }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-screen" style={{ marginLeft:240, padding:"40px 40px 80px" }}>
        {activeSection === "resumen"       && <ResumenSection       orders={orders} materials={materials} printers={printers} settings={settings} />}
        {activeSection === "pedidos"       && <PedidosSection       orders={orders} setOrders={setOrders} adminToken={adminToken} />}
        {activeSection === "impresoras"    && <PrintersSection      printers={printers} setPrinters={setPrinters} orders={orders} />}
        {activeSection === "materiales"    && <MaterialsSection     materials={materials} setMaterials={setMaterials} />}
        {activeSection === "clientes"      && <ClientesSection      orders={orders} />}
        {activeSection === "ventas"        && <VentasSection        orders={orders} />}
        {activeSection === "envios"        && <EnviosSection        adminToken={adminToken} />}
        {activeSection === "configuracion" && <ConfiguracionSection settings={settings} setSettings={setSettings} />}
      </div>
    </div>
  );
};

export default Dashboard;
