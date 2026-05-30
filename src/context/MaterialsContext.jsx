import { createContext, useContext, useState, useEffect } from "react";

const DEFAULT_MATERIALS = {

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

const MaterialsContext = createContext(null);

export const MaterialsProvider = ({ children }) => {
  const [materials, setMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem("materials");
      if (!saved) return DEFAULT_MATERIALS;
      const parsed = JSON.parse(saved);
      Object.values(parsed).forEach(mat => {
        if (mat.technology === "resin") mat.technology = "sla";
      });
      return parsed;
    } catch {
      return DEFAULT_MATERIALS;
    }
  });

  useEffect(() => {
    localStorage.setItem("materials", JSON.stringify(materials));
  }, [materials]);

  const updateMaterial = (name, data) => {
    setMaterials(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[name] = { ...updated[name], ...data };
      return updated;
    });
  };

  const addMaterial = (name, data) => {
    setMaterials(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[name] = data;
      return updated;
    });
  };

  const deleteMaterial = (name) => {
    setMaterials(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      delete updated[name];
      return updated;
    });
  };

  return (
    <MaterialsContext.Provider value={{
      materials,
      setMaterials,
      updateMaterial,
      addMaterial,
      deleteMaterial,
    }}>
      {children}
    </MaterialsContext.Provider>
  );
};

export const useMaterials = () => {
  const ctx = useContext(MaterialsContext);
  if (!ctx) throw new Error("useMaterials must be used inside MaterialsProvider");
  return ctx;
};

export default MaterialsContext;
