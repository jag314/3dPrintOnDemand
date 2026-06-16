import React, { useState, useRef, useEffect, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ── PROJECT DATA ───────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: 1,
    file: "./projects/1.gltf",
    name: "Exo-Armor Shoulder Plate",
    category: "Cosplay & Props",
    tag: "FDM · PLA+",
    description: "Pieza de armadura articulada diseñada para cosplay de alta fidelidad.",
  },
  {
    id: 2,
    file: "./projects/2.gltf",
    name: "Planetary Gear System",
    category: "Mecánica Industrial",
    tag: "FDM · PETG",
    description: "Sistema de engranajes planetarios funcionales para prototipo de transmisión.",
  },
  {
    id: 3,
    file: "./projects/3.gltf",
    name: "Architectural Façade",
    category: "Arquitectura",
    tag: "SLA · Resina",
    description: "Maqueta de fachada estructural con detalle de 0.1mm para presentación.",
  },
  {
    id: 4,
    file: "./projects/4.gltf",
    name: "Tactical Grip Housing",
    category: "Industrial",
    tag: "FDM · ABS",
    description: "Carcasa ergonómica resistente al calor para dispositivo de campo.",
  },
  {
    id: 5,
    file: "./projects/5.gltf",
    name: "Bio-Inspired Lattice",
    category: "Arte & Diseño",
    tag: "FDM · PLA+",
    description: "Estructura lattice inspirada en patrones orgánicos, optimizada para peso.",
  },
  {
    id: 6,
    file: "./projects/6.gltf",
    name: "Drone Frame V2",
    category: "Aeronáutica",
    tag: "FDM · ASA",
    description: "Chasis de drone ultraligero resistente a UV para uso en exteriores.",
  },
];

const STEPS = [
  {
    number: "01",
    icon: "💬",
    title: "Tell Us Your Idea",
    description: "Send us a description, sketch, photo or reference image. The more detail the better — but even a napkin sketch works.",
  },
  {
    number: "02",
    icon: "✏️",
    title: "We Design It",
    description: "Our designers create your 3D model in Onshape. You get a first draft within 48 hours and we refine until you are 100% satisfied.",
  },
  {
    number: "03",
    icon: "📦",
    title: "Print-Ready Files",
    description: "Receive your STL, STEP and OBJ files optimized for 3D printing. We can also print it for you directly through our quote system.",
  },
];

const SERVICES = [
  { emoji:"🔩", title:"Mechanical Parts",      description:"Brackets, enclosures, gears, mounts, fixtures and functional components." },
  { emoji:"🏠", title:"Architectural Models",  description:"Scale models of buildings, rooms, urban planning and real estate presentations." },
  { emoji:"💍", title:"Jewelry & Art",          description:"Custom rings, pendants, sculptures and artistic pieces for SLA printing." },
  { emoji:"📱", title:"Product Prototypes",    description:"Turn your product idea into a physical prototype. Perfect for investor demos." },
  { emoji:"🎮", title:"Gaming & Collectibles", description:"Miniatures, figurines, cosplay props and custom gaming accessories." },
  { emoji:"🏭", title:"Industrial Components", description:"Replacement parts, jigs, tools and custom industrial solutions." },
];

const FAQ_ITEMS = [
  {
    q: "Do I need to know anything about 3D design?",
    a: "Not at all. Just send us your idea in any format — text, photo, sketch or even a voice note. We handle all the technical work.",
  },
  {
    q: "How long does a design take?",
    a: "Simple parts are delivered within 24-48 hours. Complex assemblies may take 3-5 business days. We always give you a timeline before starting.",
  },
  {
    q: "What if I don't like the design?",
    a: "We offer revisions until you are completely satisfied. Standard and Premium tiers include unlimited revisions.",
  },
  {
    q: "What files will I receive?",
    a: "You always receive STL files ready for printing. Standard and Premium tiers also include STEP and OBJ files compatible with all major CAD software.",
  },
  {
    q: "Can you print the design too?",
    a: "Yes! Once your design is approved, you can send it directly to our quote system and we'll print it for you.",
  },
];

// ── Error boundary — silently handles missing GLTF files ──────────────────────
class ModelErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

// ── Auto-centering, auto-scaling, rotating model ───────────────────────────────
const ProjectModel = ({ path }) => {
  const { scene } = useGLTF(path);

  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    const size   = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    scene.position.set(-center.x, -center.y, -center.z);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) scene.scale.setScalar(1.8 / maxDim);
    console.log(`[ProjectModel] size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}, maxDim: ${maxDim.toFixed(2)}`);
  }, [scene]);

  return (
    <group>
      <primitive object={scene} />
    </group>
  );
};

// ── Single project card ────────────────────────────────────────────────────────
const ProjectCard = ({ project, isMobile }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => { if (!isMobile) setHovered(true);  }}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#120a22",
        borderRadius: "16px",
        border: `1px solid ${hovered ? "rgba(167,139,250,0.5)" : "rgba(167,139,250,0.15)"}`,
        boxShadow: hovered ? "0 0 30px rgba(124,58,237,0.2)" : "none",
        transition: "all 0.3s ease",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* MODEL AREA */}
      <div style={{
        height: isMobile ? "180px" : "220px",
        position: "relative",
        background: "#0a0618",
      }}>
        {hovered ? (
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 3.5], fov: 50 }}
            gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#c4b5fd" />
            <pointLight position={[0, 3, 3]} intensity={1.5} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableDamping={true}
              dampingFactor={0.05}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
            />
            <ModelErrorBoundary>
              <Suspense fallback={null}>
                <ProjectModel path={project.file} />
              </Suspense>
            </ModelErrorBoundary>
          </Canvas>
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #1a0f30 0%, #0a0618 100%)",
          }}>
            <div style={{
              width: "48px", height: "48px",
              borderRadius: "50%",
              border: "1px solid rgba(167,139,250,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "8px",
              color: "#6d28d9", fontSize: "20px",
            }}>⬡</div>
            <span style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "9px", letterSpacing: "2px",
              color: "#4c1d95", textTransform: "uppercase",
            }}>
              {isMobile ? project.name : "hover to view"}
            </span>
          </div>
        )}
      </div>

      {/* INFO */}
      <div style={{ padding: "16px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: "6px",
        }}>
          <h3 style={{
            color: "#ffffff", fontSize: "14px",
            fontWeight: "700", margin: 0, lineHeight: 1.3,
          }}>{project.name}</h3>
          <span style={{
            background: "rgba(124,58,237,0.25)",
            border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: "20px", padding: "2px 8px",
            fontSize: "9px", color: "#c4b5fd",
            fontFamily: "'Courier New', monospace",
            whiteSpace: "nowrap", marginLeft: "8px",
            letterSpacing: "0.5px",
          }}>{project.tag}</span>
        </div>
        <p style={{
          color: "#6d28d9", fontSize: "10px",
          letterSpacing: "1px", textTransform: "uppercase",
          marginBottom: "6px", fontFamily: "'Courier New', monospace",
        }}>{project.category}</p>
        <p style={{
          color: "#9ca3af", fontSize: "12px",
          lineHeight: 1.5, margin: 0,
        }}>{project.description}</p>
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const Designer = () => {
  const navigate     = useNavigate();
  const servicesRef  = useRef(null);
  const portfolioRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const isMobile = window.innerWidth < 768;

  const scrollToPortfolio = () =>
    portfolioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="section-background min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="section-glow" />
      <div className="max-w-7xl mx-auto relative z-10">

        {/* ══ S1 — HERO ══ */}
        <div className="py-8 sm:py-12">
          <div>
            <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">
              PROFESSIONAL 3D DESIGN SERVICES
            </p>
            <h1 className="premium-heading text-5xl sm:text-6xl lg:text-7xl font-black mt-6 leading-[0.92]">
              From Your{" "}
              <span className="text-violet-400">Idea</span>
              <br />
              To A Printable
              <br />
              <span className="text-violet-400">3D Model</span>
            </h1>
            <p className="soft-text text-lg sm:text-xl mt-8 leading-relaxed max-w-xl">
              We design custom 3D models ready for FDM and SLA printing.
              Send us a sketch, photo, or description — we handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link to="/contact"
                className="primary-button flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold">
                Start My Project →
              </Link>
              <button onClick={scrollToPortfolio}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 hover:bg-violet-500/15"
                style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.28)", color:"#c4b5fd" }}>
                See Our Work
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-8">
              {["⚡ 48h First Draft","✓ Print-Ready Files","🔄 Unlimited Revisions","📦 STL + 3MF included"].map((b, i) => (
                <React.Fragment key={b}>
                  {i > 0 && <span className="text-white/20">·</span>}
                  <span className="text-white/55 text-sm font-semibold">{b}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ══ S2 — 3D PROJECT GRID ══ */}
        <section ref={portfolioRef} id="portfolio" style={{ padding: "80px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

            <p style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "11px", letterSpacing: "3px",
              color: "#7c3aed", marginBottom: "12px",
              textTransform: "uppercase",
            }}>OUR WORK</p>
            <h2 style={{
              fontSize: "36px", fontWeight: "900",
              color: "#ffffff", marginBottom: "8px",
            }}>
              Proyectos <span style={{ color: "#a78bfa" }}>Reales</span>
            </h2>
            <p style={{
              color: "#6b7280", fontSize: "15px", marginBottom: "48px",
            }}>
              Cada modelo diseñado e impreso por nuestro equipo en Costa Rica.
              {!isMobile && " Hover sobre cada card para ver el modelo en 3D."}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "20px",
            }}>
              {PROJECTS.map(project => (
                <ProjectCard key={project.id} project={project} isMobile={isMobile} />
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "48px" }}>
              <p style={{ color: "#6b7280", marginBottom: "16px", fontSize: "14px" }}>
                ¿Tenés un proyecto en mente?
              </p>
              <button
                type="button"
                onClick={() => navigate("/contact")}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "#ffffff", border: "none",
                  borderRadius: "12px", padding: "14px 32px",
                  fontSize: "15px", fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Empezar mi proyecto →
              </button>
            </div>
          </div>
        </section>

        {/* ══ S3 — HOW IT WORKS ══ */}
        <div className="mt-20 sm:mt-28">
          <div className="text-center mb-14">
            <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">PROCESS</p>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">How It Works</h2>
            <p className="soft-text text-base mt-3">From idea to printed part in 3 simple steps</p>
          </div>
          <div className="flex flex-col md:flex-row items-start gap-10 md:gap-0">
            {STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex-1 flex flex-col items-center text-center px-4">
                  <div className="relative flex items-center justify-center" style={{ width:90, height:72 }}>
                    <span className="absolute inset-0 flex items-center justify-center"
                      style={{ fontSize:72, fontWeight:900, lineHeight:1, color:"rgba(139,92,246,0.13)", userSelect:"none" }}>
                      {step.number}
                    </span>
                    <div className="relative z-10" style={{
                      width:52, height:52, borderRadius:"50%",
                      background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.38)",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.35rem",
                    }}>{step.icon}</div>
                  </div>
                  <h3 className="font-black text-white text-xl mt-5">{step.title}</h3>
                  <p className="text-white/55 text-sm mt-3 leading-relaxed max-w-[220px]">{step.description}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex items-center self-start flex-shrink-0" style={{ paddingTop:34, width:48 }}>
                    <svg width="48" height="2" viewBox="0 0 48 2">
                      <line x1="0" y1="1" x2="48" y2="1" stroke="rgba(139,92,246,0.35)" strokeWidth="1.5" strokeDasharray="4,4"/>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ══ S4 — WHAT WE DESIGN ══ */}
        <div ref={servicesRef} className="mt-20 sm:mt-28" id="services">
          <div className="text-center sm:text-left mb-10">
            <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">SERVICES</p>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">What We Can Design For You</h2>
            <p className="soft-text text-base mt-3">No project too small or too complex</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((svc) => (
              <div key={svc.title}
                className="rounded-[20px] p-6 border border-white/[0.08] hover:border-violet-500/50 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300"
                style={{ background:"rgba(255,255,255,0.04)" }}>
                <div style={{
                  width:52, height:52, borderRadius:"50%",
                  background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"1.5rem", marginBottom:16,
                }}>{svc.emoji}</div>
                <h3 className="font-black text-white text-lg leading-tight">{svc.title}</h3>
                <p className="text-white/55 text-sm mt-2 leading-relaxed">{svc.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ S5 — CONTACT CTA ══ */}
        <div className="mt-20 sm:mt-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-black">
            ¿Querés hablar sobre tu proyecto de diseño?
          </h2>
          <p className="soft-text text-base mt-4">
            Escribinos y te respondemos a la brevedad.
          </p>
          <Link
            to="/contact"
            className="inline-block mt-8 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-full transition-colors"
          >
            Contáctanos
          </Link>
        </div>

        {/* ══ S6 — FAQ ══ */}
        <div className="mt-20 sm:mt-28">
          <div className="text-center mb-10">
            <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">Common Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto" style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left">
                  <span className={`font-semibold text-base sm:text-lg leading-snug transition-colors ${openFaq === i ? "text-violet-400" : "text-white"}`}>
                    {item.q}
                  </span>
                  <span className="text-violet-400 flex-shrink-0 transition-transform duration-300 font-light"
                    style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)", fontSize:24, lineHeight:1 }}>
                    +
                  </span>
                </button>
                <div style={{ maxHeight: openFaq === i ? 300 : 0, overflow:"hidden", transition:"max-height 0.35s ease" }}>
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed pb-5">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
};

export default Designer;
