import {
  Routes,
  Route,
} from "react-router-dom";

import { MaterialsProvider } from "./context/MaterialsContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import QuotePage from "./pages/QuotePage";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Teach from "./pages/Teach";
import Designer from "./pages/Designer";
import Contact from "./pages/Contact";

const App = () => {
  return (
    <MaterialsProvider>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/quote"     element={<QuotePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about"     element={<About />} />
        <Route path="/teach"     element={<Teach />} />
        <Route path="/designer"  element={<Designer />} />
        <Route path="/contact"   element={<Contact />} />
      </Routes>
    </MaterialsProvider>
  );
};

export default App;
