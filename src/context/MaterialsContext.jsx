import { createContext, useContext } from "react";

const MaterialsContext = createContext(null);

export const MaterialsProvider = ({ children, materials, setMaterials }) => (
  <MaterialsContext.Provider value={{ materials, setMaterials }}>
    {children}
  </MaterialsContext.Provider>
);

export const useMaterials = () => {
  const ctx = useContext(MaterialsContext);
  if (!ctx) throw new Error("useMaterials must be used inside MaterialsProvider");
  return ctx;
};

export default MaterialsContext;
