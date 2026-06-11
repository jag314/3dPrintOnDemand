import { useState, useEffect } from "react";
import { supabase } from "./utils/supabase/client";
import { Routes, Route } from "react-router-dom";
import { MaterialsProvider } from "./context/MaterialsContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import QuotePage from "./pages/QuotePage";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Teach from "./pages/Teach";
import Designer from "./pages/Designer";
import Contact from "./pages/Contact";

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PRINTERS = [
  {
    id: "hi-combo-001",
    name: "Creality Hi Combo",
    technology: "fdm",
    status: "active",
    purchasePriceCRC: 520000,
    amortizationYears: 2,
    daysPerYear: 312,
    hoursPerDay: 10,
    wattsConsumption: 350,
    electricityRateCRC: 150,
    printSpeedProfiles: {
      draft:    { gPerHour: 28, label: "Borrador rápido" },
      standard: { gPerHour: 18, label: "Estándar" },
      quality:  { gPerHour: 10, label: "Alta calidad" },
    },
    defaultProfile: "standard",
    buildVolume: { x: 260, y: 260, z: 300 },
    maxTempNozzle: 300,
    maxTempBed: 110,
    hasEnclosure: false,
    operatorRateCRC: 2000,
    prepHours: 0.5,
    postHours: 0.5,
    failureRate: 0.10,
    purchaseDate: "2026-01-01",
    notes: "Impresora principal FDM — Multicolor 4 colores (CFS), 500 mm/s",
  },
  {
    id: "k1c-001",
    name: "Creality K1C",
    technology: "fdm",
    status: "inactive",
    purchasePriceCRC: 346500,
    amortizationYears: 1,
    daysPerYear: 312,
    hoursPerDay: 10,
    wattsConsumption: 350,
    electricityRateCRC: 150,
    printSpeedProfiles: {
      draft:    { gPerHour: 22, label: "Borrador rápido" },
      standard: { gPerHour: 15, label: "Estándar" },
      quality:  { gPerHour: 8,  label: "Alta calidad" },
    },
    defaultProfile: "standard",
    buildVolume: { x: 220, y: 220, z: 250 },
    maxTempNozzle: 300,
    maxTempBed: 110,
    hasEnclosure: true,
    operatorRateCRC: 2000,
    prepHours: 0.5,
    postHours: 0.5,
    failureRate: 0.10,
    purchaseDate: "2025-01-01",
    notes: "Impresora FDM secundaria",
  },
];

const defaultMaterials = {
  "PLA+": {
    technology: "fdm",
    spoolWeightG: 1000,
    spoolPriceCRC: 11960,
    pricePerGram: 11.96,
    colors: [
      { name:"Blanco", hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:"Negro",  hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:"Gris",   hex:"#6b7280", premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:"Verde",  hex:"#22c55e", premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:"Azul",   hex:"#3b82f6", premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:"Rojo",   hex:"#ef4444", premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
    ],
  },
  "PETG": {
    technology: "fdm",
    spoolWeightG: 1000,
    spoolPriceCRC: 14040,
    pricePerGram: 14.04,
    colors: [
      { name:"Blanco", hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:14.04 },
      { name:"Negro",  hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:14.04 },
      { name:"Azul",   hex:"#3b82f6", premium:false, hidden:false, useMaterialPrice:true, customPrice:14.04 },
    ],
  },
  "ABS": {
    technology: "fdm",
    spoolWeightG: 1000,
    spoolPriceCRC: 15600,
    pricePerGram: 15.60,
    colors: [
      { name:"Blanco", hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:15.60 },
      { name:"Negro",  hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:15.60 },
    ],
  },
  "ASA": {
    technology: "fdm",
    spoolWeightG: 1000,
    spoolPriceCRC: 16640,
    pricePerGram: 16.64,
    colors: [
      { name:"Blanco", hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:16.64 },
      { name:"Negro",  hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:16.64 },
    ],
  },
  "Resina Estándar": {
    technology: "sla",
    density: 1.10,
    spoolWeightG: 1000,
    spoolPriceCRC: 18200,
    pricePerGram: 18.20,
    pricePerML: 18.20,
    colors: [
      { name:"Gris",   hex:"#9ca3af", premium:false, hidden:false, useMaterialPrice:true, customPrice:18.20 },
      { name:"Blanco", hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:18.20 },
    ],
  },
  "Resina ABS-Like": {
    technology: "sla",
    density: 1.18,
    spoolWeightG: 1000,
    spoolPriceCRC: 20800,
    pricePerGram: 20.80,
    pricePerML: 20.80,
    colors: [
      { name:"Gris",   hex:"#6b7280", premium:false, hidden:false, useMaterialPrice:true, customPrice:20.80 },
      { name:"Negro",  hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:20.80 },
    ],
  },
};

export const DEFAULT_SETTINGS = {
  businessName:      "Inity 3D",
  email:             "hola@inity3d.com",
  whatsapp:          "+506 7290-4402",
  address:           "Costa Rica",
  currency:          "CRC",
  applyVAT:          false,
  vatRate:           13,
  commercialMarkup:  2.5,
  urgencySemi:       0.20,
  urgencyUrgent:     0.50,
  minimumPrice:      5000,
  quoteValidDays:    3,
  welcomeMessage:    "Completa tus datos y te enviamos una cotización formal en menos de 2 horas",
  responseTimeH:     2,
  notificationEmail: "",
  lowStockAlert:     1,
  // Support overhead percentages (whole numbers, e.g. 5 = 5%)
  supportLightMat:     5,
  supportLightTime:    8,
  supportModerateMat:  15,
  supportModerateTime: 20,
  supportHeavyMat:     30,
  supportHeavyTime:    40,
};

// ── App ───────────────────────────────────────────────────────────────────────

const App = () => {
  // TODO: Remove this block after confirming the DB connection works
  useEffect(() => {
    supabase.from("orders").select("count").limit(1)
      .then(({ error }) => {
        if (error) console.error("❌ Supabase connection failed:", error.message);
        else        console.log("✅ Supabase connected successfully");
      });
  }, []);

  // Printers — inity_printers key, with migration from old "printers" key
  const [printers, setPrinters] = useState(() => {
    try {
      const saved = localStorage.getItem("inity_printers");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.printSpeedProfiles) return parsed;
      }
      // Migrate from old key
      const old = localStorage.getItem("printers");
      if (old) {
        const parsed = JSON.parse(old);
        if (Array.isArray(parsed) && parsed[0]?.printSpeedProfiles) {
          localStorage.removeItem("printers");
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_PRINTERS;
  });

  useEffect(() => {
    localStorage.setItem("inity_printers", JSON.stringify(printers));
  }, [printers]);

  // Materials — inity_materials key, with migration from old "materials" key
  const [materials, setMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem("inity_materials");
      if (saved) {
        const parsed = JSON.parse(saved);
        const first = Object.values(parsed)[0];
        if (first?.spoolPriceCRC) return parsed;
      }
      // Migrate from old key
      const old = localStorage.getItem("materials");
      if (old) {
        const parsed = JSON.parse(old);
        const first = Object.values(parsed)[0];
        if (first?.spoolPriceCRC) {
          localStorage.removeItem("materials");
          return parsed;
        }
      }
    } catch {}
    return defaultMaterials;
  });

  useEffect(() => {
    localStorage.setItem("inity_materials", JSON.stringify(materials));
  }, [materials]);

  // Settings — inity_settings key
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("inity_settings");
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem("inity_settings", JSON.stringify(settings));
  }, [settings]);

  const getActivePrinter = (technology) =>
    printers.find(p => p.technology === technology && p.status === "active") ||
    printers.find(p => p.technology === technology) ||
    null;

  return (
    <MaterialsProvider materials={materials} setMaterials={setMaterials}>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/quote"     element={
          <QuotePage
            materials={materials}
            printers={printers}
            getActivePrinter={getActivePrinter}
            settings={settings}
          />
        } />
        <Route path="/dashboard" element={
          <Dashboard
            materials={materials}
            setMaterials={setMaterials}
            printers={printers}
            setPrinters={setPrinters}
            settings={settings}
            setSettings={setSettings}
          />
        } />
        <Route path="/about"     element={<About />} />
        <Route path="/teach"     element={<Teach />} />
        <Route path="/designer"  element={<Designer />} />
        <Route path="/contact"   element={<Contact />} />
      </Routes>
      <Footer />
    </MaterialsProvider>
  );
};

export default App;
