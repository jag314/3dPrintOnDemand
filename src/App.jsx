import {
  Routes,
  Route,
} from "react-router-dom";

import {
  useState,
  useEffect,
} from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import QuotePage from "./pages/QuotePage";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Teach from "./pages/Teach";
import Designer from "./pages/Designer";
import Contact from "./pages/Contact";

// =========================
// DEFAULT MATERIALS
// =========================

const defaultMaterials = {

  PLA: {
    technology: "fdm",
    density: 1.24,
    pricePerGram: 35,
    colors: [
      { name:"White",   hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:35 },
      { name:"Black",   hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:35 },
      { name:"Green",   hex:"#22c55e", premium:false, hidden:false, useMaterialPrice:true, customPrice:35 },
      { name:"Gold",    hex:"#b8960c", premium:false, hidden:false, useMaterialPrice:true, customPrice:35 },
      { name:"Brown",   hex:"#78532a", premium:false, hidden:false, useMaterialPrice:true, customPrice:35 },
      { name:"Gray",    hex:"#6b7280", premium:false, hidden:false, useMaterialPrice:true, customPrice:35 },
      { name:"Lime",    hex:"#84cc16", premium:false, hidden:false, useMaterialPrice:true, customPrice:35 },
      { name:"Cyan",    hex:"#06b6d4", premium:false, hidden:false, useMaterialPrice:true, customPrice:35 },
    ],
  },

  PETG: {
    technology: "fdm",
    density: 1.27,
    pricePerGram: 45,
    colors: [
      { name:"White",   hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:45 },
      { name:"Black",   hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:45 },
      { name:"Blue",    hex:"#3b82f6", premium:false, hidden:false, useMaterialPrice:true, customPrice:45 },
      { name:"Red",     hex:"#ef4444", premium:false, hidden:false, useMaterialPrice:true, customPrice:45 },
    ],
  },

  ABS: {
    technology: "fdm",
    density: 1.04,
    pricePerGram: 50,
    colors: [
      { name:"White",   hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:50 },
      { name:"Black",   hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:50 },
      { name:"Gray",    hex:"#6b7280", premium:false, hidden:false, useMaterialPrice:true, customPrice:50 },
    ],
  },

  "PLA+": {
    technology: "fdm",
    density: 1.24,
    pricePerGram: 2500,
    colors: [
      { name:"White",   hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:2500 },
      { name:"Black",   hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:2500 },
    ],
  },

  "Standard Resin": {
    technology: "sla",
    density: 1.2,
    pricePerGram: 80,
    pricePerML: 80,
    colors: [
      { name:"Clear",   hex:"#dff0f5", premium:false, hidden:false, useMaterialPrice:true, customPrice:80 },
      { name:"White",   hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:80 },
      { name:"Gray",    hex:"#6b7280", premium:false, hidden:false, useMaterialPrice:true, customPrice:80 },
      { name:"Black",   hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:80 },
    ],
  },

  "ABS-Like Resin": {
    technology: "sla",
    density: 1.18,
    pricePerGram: 90,
    pricePerML: 90,
    colors: [
      { name:"White",   hex:"#f0f0f0", premium:false, hidden:false, useMaterialPrice:true, customPrice:90 },
      { name:"Black",   hex:"#1a1a1a", premium:false, hidden:false, useMaterialPrice:true, customPrice:90 },
      { name:"Gray",    hex:"#6b7280", premium:false, hidden:false, useMaterialPrice:true, customPrice:90 },
    ],
  },

  "High-Detail Resin": {
    technology: "sla",
    density: 1.2,
    pricePerGram: 120,
    pricePerML: 120,
    colors: [
      { name:"Clear",   hex:"#dff0f5", premium:true,  hidden:false, useMaterialPrice:true, customPrice:120 },
      { name:"Gray",    hex:"#6b7280", premium:false, hidden:false, useMaterialPrice:true, customPrice:120 },
    ],
  },

};

const App = () => {

  const [materials, setMaterials] =
    useState(() => {
      try {
        const saved = localStorage.getItem("materials");
        if (!saved) return defaultMaterials;
        const parsed = JSON.parse(saved);
        Object.values(parsed).forEach(mat => {
          if (mat.technology === "resin") mat.technology = "sla";
        });
        return parsed;
      } catch {
        return defaultMaterials;
      }
    });

  useEffect(() => {
    localStorage.setItem("materials", JSON.stringify(materials));
  }, [materials]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/quote"     element={<QuotePage materials={materials} />} />
        <Route path="/dashboard" element={<Dashboard materials={materials} setMaterials={setMaterials} />} />
        <Route path="/about"     element={<About />} />
        <Route path="/teach"     element={<Teach />} />
        <Route path="/designer"  element={<Designer />} />
        <Route path="/contact"   element={<Contact />} />
      </Routes>
    </>
  );

};

export default App;