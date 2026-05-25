import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Materials from "./components/Materials";
import Workflow from "./components/WorkFlow";
import Footer from "./components/Footer";

function App() {

  return (

    <main className="bg-black text-white overflow-hidden">

      <Navbar />

      <Hero />

      <Materials />

      <Workflow />

      <Footer />

    </main>

  );
}

export default App;