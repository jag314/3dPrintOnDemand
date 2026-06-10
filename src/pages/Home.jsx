import {
  Hero,
  Materials,
  Workflow,
  LivePreview,
  PremiumFinishes,
  WhyInity3D,
  CTASection,
  Footer,
} from "../components";


const Home = () => {

  return (

    <main className="bg-[#050816] text-white overflow-x-hidden">

      <Hero />

      <Materials />

      <Workflow />

      <LivePreview />

    

      <WhyInity3D />

      <CTASection />

      <Footer />

    </main>

  );

};

export default Home;