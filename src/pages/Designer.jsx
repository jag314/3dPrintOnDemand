import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";

// ── DATA ──────────────────────────────────────────────────────────────────────

const MY_WORK = [
  {
    url: "/images/1.png",
    title: "Custom Mechanical Part",
    tech: "FDM · PLA",
  },
  {
    url: "/images/2.png",
    title: "Prototype Design",
    tech: "FDM · PETG",
  },
  {
    url: "/images/3.png",
    title: "Artistic Model",
    tech: "SLA · Resin",
  },
  {
    url: "/images/4.png",
    title: "Functional Component",
    tech: "FDM · ABS",
  },
  {
    url: "/images/5.png",
    title: "Detail Part",
    tech: "SLA · High Detail",
  },
  {
    url: "/images/6.png",
    title: "Custom Design",
    tech: "FDM · PLA+",
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

// ── PAGE ──────────────────────────────────────────────────────────────────────

const Designer = () => {
  const servicesRef = useRef(null);
  const portfolioRef = useRef(null);

  const [openFaq, setOpenFaq]         = useState(null);
  const [hoveredWork, setHoveredWork] = useState(null);
  const [lightbox, setLightbox]       = useState(null);

  const scrollToServices  = () => portfolioRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });

  return (
    <main className="section-background min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="section-glow" />
      <div className="max-w-7xl mx-auto relative z-10">

        {/* ══ S1 — HERO ══ */}
        <div className="py-8 sm:py-12">

          {/* Left */}
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
              <button onClick={scrollToServices}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 hover:bg-violet-500/15"
                style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.28)", color:"#c4b5fd" }}>
                See Our Work
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-8">
              {["⚡ 48h First Draft","✓ Print-Ready Files","🔄 Unlimited Revisions","📦 STL + 3MF included"].map((b,i) => (
                <React.Fragment key={b}>
                  {i > 0 && <span className="text-white/20">·</span>}
                  <span className="text-white/55 text-sm font-semibold">{b}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>

        {/* ══ REAL PORTFOLIO SECTION ══ */}
        <div ref={portfolioRef} className="mt-20 sm:mt-28" id="portfolio">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">OUR WORK</p>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">Real Projects We've Built</h2>
              <p className="soft-text text-base mt-2">
                Every model designed and printed by our team in Costa Rica
              </p>
            </div>
            <Link to="/contact"
              className="primary-button px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap self-start sm:self-auto">
              Start Your Project →
            </Link>
          </div>

          {/* 3x2 masonry-style grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MY_WORK.map((item, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredWork(i)}
                onMouseLeave={() => setHoveredWork(null)}
                onClick={() => setLightbox(i)}
                className="relative overflow-hidden cursor-pointer group"
                style={{
                  borderRadius:20,
                  aspectRatio: i === 0 || i === 3 ? "4/3" : "1/1",
                  border: hoveredWork === i ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
                  transform: hoveredWork === i ? "scale(1.02)" : "scale(1)",
                  boxShadow: hoveredWork === i
                    ? "0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.3)"
                    : "0 4px 20px rgba(0,0,0,0.3)",
                  transition:"all 0.35s ease",
                }}>

                {/* Image */}
                <img
                  src={item.url}
                  alt={item.title}
                  style={{
                    width:"100%", height:"100%",
                    objectFit:"cover",
                    transform: hoveredWork === i ? "scale(1.06)" : "scale(1)",
                    transition:"transform 0.5s ease",
                    display:"block",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.style.background = "linear-gradient(135deg,#1a1a2e,#2d1b69)";
                  }}
                />

                {/* Hover overlay */}
                <div style={{
                  position:"absolute", inset:0,
                  background: hoveredWork === i
                    ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.0) 100%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)",
                  transition:"all 0.35s ease",
                }} />

                {/* Zoom icon on hover */}
                <div style={{
                  position:"absolute", top:14, right:14,
                  width:36, height:36, borderRadius:"50%",
                  background:"rgba(255,255,255,0.12)",
                  backdropFilter:"blur(8px)",
                  border:"1px solid rgba(255,255,255,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16,
                  opacity: hoveredWork === i ? 1 : 0,
                  transform: hoveredWork === i ? "scale(1)" : "scale(0.8)",
                  transition:"all 0.3s ease",
                }}>🔍</div>

                {/* Bottom info */}
                <div style={{
                  position:"absolute", bottom:0, left:0, right:0,
                  padding:"16px",
                  transform: hoveredWork === i ? "translateY(0)" : "translateY(4px)",
                  transition:"transform 0.3s ease",
                }}>
                  <div style={{
                    display:"inline-block",
                    background:"rgba(139,92,246,0.25)",
                    backdropFilter:"blur(8px)",
                    border:"1px solid rgba(139,92,246,0.4)",
                    borderRadius:999, padding:"2px 10px",
                    fontSize:9, fontWeight:700,
                    letterSpacing:"0.1em", textTransform:"uppercase",
                    color:"#c4b5fd", marginBottom:6,
                  }}>{item.tech}</div>
                  <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.95)" }}>{item.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 rounded-2xl"
            style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.2)" }}>
            <div>
              <p className="font-bold text-white text-base">Like what you see?</p>
              <p className="text-white/50 text-sm mt-0.5">We can design and print something just like this for you.</p>
            </div>
            <Link to="/contact"
              className="primary-button px-8 py-3 rounded-2xl font-bold text-sm whitespace-nowrap">
              Get A Custom Quote →
            </Link>
          </div>
        </div>

        {/* ══ LIGHTBOX ══ */}
        {lightbox !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background:"rgba(0,0,0,0.9)", backdropFilter:"blur(12px)" }}
            onClick={() => setLightbox(null)}
          >
            <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLightbox(null)}
                style={{
                  position:"absolute", top:-16, right:-16, zIndex:10,
                  width:36, height:36, borderRadius:"50%",
                  background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
                  color:"white", fontSize:18, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>×</button>
              <img
                src={MY_WORK[lightbox].url}
                alt={MY_WORK[lightbox].title}
                style={{ width:"100%", borderRadius:20, display:"block", maxHeight:"80vh", objectFit:"contain" }}
              />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{MY_WORK[lightbox].title}</p>
                  <p className="text-white/50 text-sm mt-1">{MY_WORK[lightbox].tech}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLightbox((lightbox - 1 + MY_WORK.length) % MY_WORK.length)}
                    style={{
                      width:40, height:40, borderRadius:"50%",
                      background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.4)",
                      color:"#c4b5fd", fontSize:18, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>‹</button>
                  <button
                    onClick={() => setLightbox((lightbox + 1) % MY_WORK.length)}
                    style={{
                      width:40, height:40, borderRadius:"50%",
                      background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.4)",
                      color:"#c4b5fd", fontSize:18, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>›</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ S2 — HOW IT WORKS ══ */}
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

        {/* ══ S3 — WHAT WE DESIGN ══ */}
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
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
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