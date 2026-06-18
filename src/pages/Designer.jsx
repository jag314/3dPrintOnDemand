import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── PROJECT DATA ───────────────────────────────────────────────────────────────

const PROJECTS = [
  { id: 1, image: "./images/1.png", name: "Bracket de Montaje",    category: "Ingeniería Industrial",  tag: "FDM · PLA+" },
  { id: 2, image: "./images/2.png", name: "Engranaje Planetario",  category: "Transmisión Mecánica",   tag: "FDM · PETG" },
  { id: 3, image: "./images/3.png", name: "Carcasa de Sensor",     category: "Electrónica Industrial", tag: "FDM · ABS"  },
  { id: 4, image: "./images/4.png", name: "Soporte de Rodamiento", category: "Manufactura",            tag: "FDM · ASA"  },
  { id: 5, image: "./images/5.png", name: "Jig de Ensamblaje",     category: "Control de Calidad",     tag: "FDM · PETG" },
  { id: 6, image: "./images/6.png", name: "Ducto de Ventilación",  category: "HVAC Industrial",        tag: "FDM · ABS"  },
];

const STEPS = [
  {
    number: "01",
    icon: "💬",
    title: "Contanos Tu Idea",
    description: "Envianos una descripción, boceto, foto o imagen de referencia. Cuanto más detalle, mejor — incluso un boceto en servilleta sirve.",
  },
  {
    number: "02",
    icon: "✏️",
    title: "Lo Diseñamos",
    description: "Nuestros diseñadores crean tu modelo 3D en Onshape. Recibís un primer borrador en 48 horas y refinamos hasta que quedés 100% satisfecho.",
  },
  {
    number: "03",
    icon: "📦",
    title: "Archivos Listos para Imprimir",
    description: "Recibís tus archivos STL, STEP y OBJ optimizados para impresión 3D. También podemos imprimirlo directamente a través de nuestro sistema de cotización.",
  },
];

const SERVICES = [
  { emoji:"🔩", title:"Piezas Mecánicas",        description:"Brackets, carcasas, engranajes, soportes, fixtures y componentes funcionales." },
  { emoji:"🏠", title:"Modelos Arquitectónicos", description:"Maquetas a escala de edificios, habitaciones, planificación urbana y presentaciones inmobiliarias." },
  { emoji:"💍", title:"Joyería y Arte",           description:"Anillos, colgantes, esculturas y piezas artísticas personalizadas para impresión SLA." },
  { emoji:"📱", title:"Prototipos de Productos", description:"Convertí tu idea en un prototipo físico. Perfecto para demos con inversores." },
  { emoji:"🎮", title:"Juegos y Coleccionables", description:"Miniaturas, figurines, props de cosplay y accesorios de juego personalizados." },
  { emoji:"🏭", title:"Componentes Industriales",description:"Piezas de repuesto, jigs, herramientas y soluciones industriales a medida." },
];

const FAQ_ITEMS = [
  {
    q: "¿Necesito saber algo de diseño 3D?",
    a: "Para nada. Solo envianos tu idea en cualquier formato — texto, foto, boceto o hasta una nota de voz. Nosotros nos encargamos de todo el trabajo técnico.",
  },
  {
    q: "¿Cuánto tarda un diseño?",
    a: "Las piezas simples se entregan en 24-48 horas. Los ensamblajes complejos pueden tardar 3-5 días hábiles. Siempre te damos un plazo antes de empezar.",
  },
  {
    q: "¿Qué pasa si no me gusta el diseño?",
    a: "Ofrecemos revisiones hasta que estés completamente satisfecho. Los planes Estándar y Premium incluyen revisiones ilimitadas.",
  },
  {
    q: "¿Qué archivos recibiré?",
    a: "Siempre recibís archivos STL listos para imprimir. Los planes Estándar y Premium también incluyen archivos STEP y OBJ compatibles con los principales programas CAD.",
  },
  {
    q: "¿Pueden imprimir el diseño también?",
    a: "¡Sí! Una vez aprobado el diseño, podés enviarlo directamente a nuestro sistema de cotización y lo imprimimos por vos.",
  },
];

// ── Project card — image-based ─────────────────────────────────────────────────
const ProjectCard = ({ project, onImageClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "#0f0622",
        border: `1px solid ${hovered ? "rgba(167,139,250,0.5)" : "rgba(167,139,250,0.1)"}`,
        boxShadow: hovered
          ? "0 20px 60px rgba(124,58,237,0.25), 0 0 0 1px rgba(167,139,250,0.3)"
          : "0 4px 20px rgba(0,0,0,0.4)",
        transition: "all 0.35s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        cursor: "pointer",
      }}
    >
      {/* IMAGE */}
      <div
        onClick={() => onImageClick(project)}
        style={{ height: "220px", position: "relative", overflow: "hidden", cursor: "zoom-in" }}
      >
        <img
          src={project.image}
          alt={project.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.08)" : "scale(1)",
          }}
          onError={e => {
            e.target.style.display = "none";
            e.target.parentElement.style.background = "linear-gradient(135deg,#1a0f30,#0a0618)";
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 40%, rgba(15,6,34,0.8) 100%)",
        }} />
        {/* Zoom hint on hover */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          background: "rgba(0,0,0,0.3)",
        }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "rgba(124,58,237,0.8)",
            border: "1px solid rgba(167,139,250,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", color: "#ffffff",
          }}>⤢</div>
        </div>
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          background: "rgba(10,4,24,0.85)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(167,139,250,0.4)",
          borderRadius: "20px", padding: "4px 10px",
          fontSize: "9px", color: "#c4b5fd",
          fontFamily: "'Courier New', monospace",
          letterSpacing: "1px",
        }}>{project.tag}</div>
      </div>

      {/* INFO */}
      <div style={{ padding: "18px 20px 20px" }}>
        <p style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "9px", letterSpacing: "2px",
          color: "#7c3aed", textTransform: "uppercase",
          margin: "0 0 6px 0",
        }}>{project.category}</p>
        <h3 style={{
          color: "#ffffff", fontSize: "15px",
          fontWeight: "700", margin: "0 0 16px 0", lineHeight: 1.3,
        }}>{project.name}</h3>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid rgba(167,139,250,0.1)", paddingTop: "12px",
        }}>
          <span style={{
            color: "#4c1d95", fontSize: "11px",
            fontFamily: "'Courier New', monospace",
          }}>Ver proyecto →</span>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: hovered ? "rgba(124,58,237,0.4)" : "rgba(124,58,237,0.15)",
            border: "1px solid rgba(167,139,250,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease",
            fontSize: "12px", color: "#a78bfa",
          }}>⬡</div>
        </div>
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const Designer = () => {
  const navigate     = useNavigate();
  const servicesRef  = useRef(null);
  const portfolioRef = useRef(null);
  const [openFaq, setOpenFaq]   = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const w    = window.innerWidth;
  const cols = w < 768 ? "1fr" : w < 1024 ? "repeat(2, 1fr)" : "repeat(3, 1fr)";

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const scrollToWork = () =>
    document.getElementById("our-work")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="section-background min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="section-glow" />
      <div className="max-w-7xl mx-auto relative z-10">

        {/* ══ S1 — HERO ══ */}
        <div style={{ paddingTop: "100px", paddingBottom: "80px", textAlign: "center" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(167,139,250,0.3)",
              borderRadius: "20px", padding: "6px 16px",
              marginBottom: "20px",
            }}>
              <span style={{
                color: "#a78bfa", fontSize: "10px",
                letterSpacing: "2px", fontFamily: "'Courier New', monospace",
              }}>SERVICIOS PROFESIONALES DE DISEÑO 3D</span>
            </div>

            <h1
              className="premium-heading text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.92]"
              style={{ textShadow: "0 0 80px rgba(124,58,237,0.3)" }}
            >
              De Tu{" "}
              <span className="text-violet-400">Idea</span>
              <br />
              A Un Modelo
              <br />
              <span className="text-violet-400">Imprimible</span>
            </h1>

            <p className="soft-text text-lg sm:text-xl mt-8 leading-relaxed">
              Diseñamos modelos 3D personalizados listos para impresión FDM y SLA.
              Enviános un sketch, foto o descripción — nosotros hacemos el resto.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "40px", flexWrap: "wrap" }}>
              <Link to="/contact"
                className="primary-button flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold">
                Empezar Mi Proyecto →
              </Link>
              <button type="button" onClick={scrollToWork}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 hover:bg-violet-500/15"
                style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.28)", color:"#c4b5fd" }}>
                Ver Nuestro Trabajo
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 12px", marginTop: "32px" }}>
              {["⚡ 48h Primer Borrador","✓ Archivos Listos Para Imprimir","🔄 Revisiones Ilimitadas","📦 STL + 3MF incluido"].map((b, i) => (
                <React.Fragment key={b}>
                  {i > 0 && <span className="text-white/20">·</span>}
                  <span className="text-white/55 text-sm font-semibold">{b}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ══ S2 — PROJECT GRID ══ */}
        <section ref={portfolioRef} id="our-work" style={{ padding: "80px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

            {/* Header */}
            <div style={{ marginBottom: "48px" }}>
              <p style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "11px", letterSpacing: "3px",
                color: "#7c3aed", marginBottom: "12px",
                textTransform: "uppercase",
              }}>NUESTRO TRABAJO</p>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-end", flexWrap: "wrap", gap: "16px",
              }}>
                <h2 style={{
                  fontSize: "40px", fontWeight: "900",
                  color: "#ffffff", margin: 0, lineHeight: 1.1,
                }}>
                  Proyectos <span style={{ color: "#a78bfa" }}>Reales</span>
                </h2>
                <p style={{
                  color: "#6b7280", fontSize: "14px",
                  maxWidth: "400px", margin: 0, lineHeight: 1.6,
                }}>
                  Cada modelo diseñado e impreso por nuestro equipo en Costa Rica.
                </p>
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: cols, gap: "24px" }}>
              {PROJECTS.map(project => (
                <ProjectCard key={project.id} project={project} onImageClick={setLightbox} />
              ))}
            </div>

            {/* CTA strip */}
            <div style={{
              textAlign: "center", marginTop: "56px",
              padding: "48px 32px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(109,40,217,0.05) 100%)",
              border: "1px solid rgba(167,139,250,0.1)",
              borderRadius: "20px",
            }}>
              <p style={{ color: "#9ca3af", marginBottom: "8px", fontSize: "14px" }}>
                ¿Tenés un proyecto en mente?
              </p>
              <h3 style={{
                color: "#ffffff", fontSize: "24px",
                fontWeight: "800", marginBottom: "24px",
              }}>
                Convertimos tu idea en un modelo{" "}
                <span style={{ color: "#a78bfa" }}>imprimible</span>
              </h3>
              <button
                type="button"
                onClick={() => navigate("/contact")}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "#ffffff", border: "none",
                  borderRadius: "12px", padding: "14px 32px",
                  fontSize: "15px", fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 8px 30px rgba(124,58,237,0.3)",
                }}
              >
                Empezar mi proyecto →
              </button>
            </div>
          </div>
        </section>

        {/* ══ LIGHTBOX ══ */}
        {lightbox && (
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0,0,0,0.92)",
              backdropFilter: "blur(12px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "24px", cursor: "zoom-out",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ position: "relative", maxWidth: "600px", maxHeight: "80vh", width: "100%", cursor: "default" }}
            >
              <button
                type="button"
                onClick={() => setLightbox(null)}
                style={{
                  position: "absolute", top: "-48px", right: "0",
                  background: "rgba(124,58,237,0.3)",
                  border: "1px solid rgba(167,139,250,0.4)",
                  borderRadius: "50%", width: "36px", height: "36px",
                  color: "#a78bfa", fontSize: "16px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 10,
                }}
              >✕</button>
              <img
                src={lightbox.image}
                alt={lightbox.name}
                style={{
                  width: "100%", maxHeight: "60vh", objectFit: "contain",
                  borderRadius: "16px",
                  border: "1px solid rgba(167,139,250,0.2)",
                  display: "block",
                }}
              />
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: "16px", padding: "0 4px",
              }}>
                <div>
                  <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: "700", margin: "0 0 4px 0" }}>
                    {lightbox.name}
                  </h3>
                  <p style={{
                    color: "#7c3aed", fontSize: "11px",
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: "1px", margin: 0, textTransform: "uppercase",
                  }}>{lightbox.category}</p>
                </div>
                <span style={{
                  background: "rgba(124,58,237,0.25)",
                  border: "1px solid rgba(167,139,250,0.4)",
                  borderRadius: "20px", padding: "6px 14px",
                  fontSize: "11px", color: "#c4b5fd",
                  fontFamily: "'Courier New', monospace", letterSpacing: "1px",
                }}>{lightbox.tag}</span>
              </div>
            </div>
          </div>
        )}

        {/* ══ S3 — HOW IT WORKS ══ */}
        <div className="mt-20 sm:mt-28">
          <div className="text-center mb-14">
            <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">PROCESO</p>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">Cómo Funciona</h2>
            <p className="soft-text text-base mt-3">De la idea a la pieza impresa en 3 simples pasos</p>
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
            <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">SERVICIOS</p>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">Qué Podemos Diseñar Para Vos</h2>
            <p className="soft-text text-base mt-3">Ningún proyecto es demasiado pequeño o complejo</p>
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
            <h2 className="text-3xl sm:text-4xl font-black mt-3">Preguntas Frecuentes</h2>
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
