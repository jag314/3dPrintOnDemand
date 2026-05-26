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

// =========================
// DEFAULT MATERIALS
// =========================

const defaultMaterials = {

  PLA: {

    density: 1.24,

    pricePerGram: 35,

    colors: [

      {

        name: "White",

        hex: "#ffffff",

        useMaterialPrice: true,

        customPrice: 0,

      },

    ],

  },

  PETG: {

    density: 1.27,

    pricePerGram: 45,

    colors: [],

  },

  ABS: {

    density: 1.04,

    pricePerGram: 50,

    colors: [],

  },

  Resin: {

    density: 1.1,

    pricePerGram: 80,

    colors: [],

  },

};

const App = () => {

  // =========================
  // LOAD FROM LOCAL STORAGE
  // =========================

  const [materials, setMaterials] =
    useState(() => {

      const savedMaterials =
        localStorage.getItem(
          "materials"
        );

      return savedMaterials

        ? JSON.parse(
            savedMaterials
          )

        : defaultMaterials;

    });

  // =========================
  // AUTO SAVE
  // =========================

  useEffect(() => {

    localStorage.setItem(

      "materials",

      JSON.stringify(
        materials
      )

    );

  }, [materials]);

  return (

    <>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/quote"
          element={

            <QuotePage
              materials={materials}
            />

          }
        />

        <Route
          path="/dashboard"
          element={

            <Dashboard
              materials={materials}
              setMaterials={setMaterials}
            />

          }
        />

      </Routes>

    </>

  );

};

export default App;