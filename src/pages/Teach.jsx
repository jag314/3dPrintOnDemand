import React, { useRef } from "react";
import { Link } from "react-router-dom";

// ── DATA ──────────────────────────────────────────────────────────────────────

const COURSES = [
  {
    id: 1,
    title: "3D Design & Printing from Scratch",
    originalTitle: "Diseño e Impresión 3D desde Cero con Onshape",
    description: "Learn CAD design with Onshape and print your first part. Perfect for complete beginners.",
    platform: "Udemy",
    language: "Spanish",
    level: "Beginner",
    rating: 5.0,
    students: "500+",
    duration: "16h",
    topics: ["Onshape CAD basics", "FDM printing workflow", "First print setup"],
    thumbnail: "https://img-c.udemycdn.com/course/125_H/4689258_30fe_2.jpg",
    url: "https://www.udemy.com/course/diseno-e-impresion-3d-desde-cero-con-onshape/?referralCode=04D6F15A784B910A7695",
    available: true,
  },
  {
    id: 2,
    title: "Concrete Mold Design",
    originalTitle: "Diseño de Moldes de Concreto con Impresión 3D",
    description: "Learn to design and print custom concrete molds for construction and architecture. Available as a private workshop for your team or as a live online session.",
    platform: "Live Training",
    language: "Spanish",
    level: "Intermediate",
    rating: null,
    students: null,
    duration: "16h",
    topics: ["Mold design principles", "Material selection", "Casting techniques"],
    thumbnail: null,
    url: null,
    available: false,
  },
  {
    id: 3,
    title: "3D Print Finishing & Post-Processing",
    originalTitle: "Acabado de Piezas 3D",
    description: "Take your prints from raw to professional finish. Sanding, painting, resin coating and more. Book a hands-on session with our expert instructors.",
    platform: "Live Training",
    language: "Spanish",
    level: "Beginner",
    rating: null,
    students: null,
    duration: "16h",
    topics: ["Sanding & smoothing", "Painting techniques", "Resin coating"],
    thumbnail: null,
    url: null,
    available: false,
  },
  {
    id: 4,
    title: "3D Modeling First Steps",
    originalTitle: "Primeros Pasos en Modelado 3D",
    description: "Never used CAD before? This is your starting point. A practical intro session designed for complete beginners. Available in-person or online.",
    platform: "Live Training",
    language: "Spanish",
    level: "Beginner",
    rating: null,
    students: null,
    duration: "16h",
    topics: ["What is CAD and why it matters", "Basic shapes and operations", "Your first 3D model"],
    thumbnail: null,
    url: null,
    available: false,
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    emoji: "🧊",
  },
  {
    id: 5,
    title: "3D Design with Onshape",
    originalTitle: "Diseño 3D con Onshape",
    description: "Go beyond the basics. Master Onshape for real engineering and product design work. Perfect for professionals who want to level up their skills.",
    platform: "Live Training",
    language: "Spanish",
    level: "Intermediate",
    rating: null,
    students: null,
    duration: "16h",
    topics: ["Advanced Onshape features", "Assemblies and constraints", "Export for manufacturing"],
    thumbnail: null,
    url: null,
    available: false,
    gradient: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)",
    emoji: "⚙️",
  },
  {
    id: 6,
    title: "Advanced Onshape for Engineers",
    originalTitle: "Onshape Avanzado para Ingenieros",
    description: "Master advanced Onshape features for professional engineering work. Assemblies, simulations, drawings and real manufacturing workflows. Perfect for engineers and product designers who already know the basics.",
    platform: "Live Training",
    language: "Spanish",
    level: "Advanced",
    rating: null,
    students: null,
    duration: "16h",
    topics: [
      "Complex assemblies and constraints",
      "Technical drawings and tolerances",
      "Design for manufacturing (DFM)",
    ],
    thumbnail: null,
    url: null,
    available: false,
    gradient: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2d1b69 100%)",
    emoji: "🔩",
  },
];

// Fallback thumbnails for live-training cards without inline gradient/emoji
const COMING_SOON_THUMBS = {
  2: { gradient: "linear-gradient(135deg,#0d9488,#7c3aed)", emoji: "🏗️" },
  3: { gradient: "linear-gradient(135deg,#ea580c,#db2777)", emoji: "🎨" },
};

const UDEMY_REVIEWS = [
  {
    name: "Carlos M.",
    stars: 5,
    date: "November 2024",
    text: "Excelente curso, muy bien explicado paso a paso. Aprendí a usar Onshape desde cero y ya estoy imprimiendo mis propios diseños.",
    verified: true,
  },
  {
    name: "María G.",
    stars: 5,
    date: "October 2024",
    text: "El instructor explica muy claro y el contenido es práctico. Lo recomiendo a cualquiera que quiera aprender diseño 3D.",
    verified: true,
  },
  {
    name: "Roberto A.",
    stars: 5,
    date: "October 2024",
    text: "Muy completo y fácil de seguir. Desde instalar Onshape hasta imprimir la primera pieza. Vale cada minuto.",
    verified: true,
  },
  {
    name: "Daniela V.",
    stars: 5,
    date: "September 2024",
    text: "No tenía ninguna experiencia en diseño y ahora puedo crear mis propias piezas. El curso es muy didáctico y práctico.",
    verified: true,
  },
  {
    name: "Andrés P.",
    stars: 5,
    date: "September 2024",
    text: "El mejor curso de impresión 3D que he encontrado en Udemy. Muy bien estructurado y con ejemplos reales.",
    verified: true,
  },
  {
    name: "Laura S.",
    stars: 5,
    date: "August 2024",
    text: "Increíble curso. Aprendí a diseñar en Onshape y a configurar mi impresora. El soporte del instructor es excelente.",
    verified: true,
  },
];

const REVIEW_COLORS = ["#7c3aed", "#9333ea", "#2563eb", "#0891b2", "#ea580c", "#16a34a"];

const mosaicPanels = [
  { img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80", label: "Workshop Sessions" },
  { img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80", label: "Team Learning"     },
  { img: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&q=80", label: "Printed Results"   },
  { img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80", label: "Corporate Events"  },
];

const audiences = [
  {
    icon: "🏢",
    title: "Corporate Training",
    desc: "Upskill your engineering and design teams",
    bullets: ["CAD design fundamentals", "FDM & SLA printing workflows", "Hands-on machine operation"],
  },
  {
    icon: "🎓",
    title: "Academic Programs",
    desc: "Curriculum integration and lab setup",
    bullets: ["Ready-to-teach lesson plans", "Student certification included", "Lab equipment guidance"],
  },
  {
    icon: "🎪",
    title: "Live Experiences",
    desc: "Interactive demos for your event",
    bullets: ["Live printing demonstrations", "Attendees take home a print", "Available nationwide"],
  },
];

// ── COMPONENTS ────────────────────────────────────────────────────────────────

const CourseCard = ({ course }) => {
  const thumb = !course.available ? {
    gradient: course.gradient || COMING_SOON_THUMBS[course.id]?.gradient || "linear-gradient(135deg,#1e1e2e,#3b2060)",
    emoji:    course.emoji    || COMING_SOON_THUMBS[course.id]?.emoji    || "📚",
  } : null;

  return (
    <div
      className="flex flex-col rounded-[20px] overflow-hidden border border-white/[0.08] hover:border-violet-500/50 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 w-full h-full"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {/* Thumbnail — 160px tall */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: 160 }}>
        {course.available ? (
          <>
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.5) 100%)",
            }} />
            <div className="absolute top-3 left-3">
              <span style={{
                background: "#a435f0", borderRadius: 5, padding: "3px 9px",
                fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff",
              }}>UDEMY</span>
            </div>
            <div className="absolute top-3 right-3">
              <span style={{
                background: "rgba(0,0,0,0.62)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 5, padding: "3px 8px",
                fontSize: 9, fontWeight: 700, color: "#fff",
              }}>🇪🇸 En Español</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full relative flex items-center justify-center" style={{ background: thumb.gradient }}>
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.18)" }} />
            <span style={{ fontSize: 48, position: "relative", zIndex: 1 }}>{thumb.emoji}</span>
            {/* LIVE TRAINING badge — emerald green */}
            <div className="absolute top-3 right-3">
              <span style={{
                background: "rgba(16,185,129,0.2)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(16,185,129,0.5)",
                borderRadius: 5, padding: "3px 9px",
                fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#10b981",
              }}>LIVE TRAINING</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {course.available && course.rating != null && (
            <>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b" }}>5.0</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
            </>
          )}
          <span style={{
            background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.28)",
            borderRadius: 4, padding: "2px 7px",
            fontSize: 9, fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {course.level}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>· {course.duration}</span>
          {course.students && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>· {course.students} students</span>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-black text-white text-base leading-snug"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {course.title}
        </h3>

        {/* Description — 3 lines for live training cards (more copy) */}
        <p
          className="text-white/60 text-sm mt-2 leading-relaxed"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: course.available ? 2 : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.description}
        </p>

        {/* Topics */}
        <ul className="mt-4 space-y-1.5">
          {course.topics.map(topic => (
            <li key={topic} className="flex items-center gap-2.5">
              <span style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "rgba(167,139,250,0.7)", flexShrink: 0, display: "inline-block",
              }} />
              <span className="text-white/55 text-xs leading-snug">{topic}</span>
            </li>
          ))}
        </ul>

        {/* CTA — always at bottom */}
        <div className="mt-auto pt-5">
          {course.available ? (
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#a435f0", color: "#fff", textDecoration: "none" }}
            >
              View on Udemy →
            </a>
          ) : (
            <>
              <Link
                to="/contact"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)", color: "#fff", textDecoration: "none" }}
              >
                I Want This Course →
              </Link>
              <p className="text-white/40 text-xs text-center mt-2">
                📅 Flexible scheduling &nbsp;·&nbsp; 👥 Group &amp; individual available
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── PAGE ──────────────────────────────────────────────────────────────────────

const Teach = () => {
  const coursesRef = useRef(null);

  const scrollToCourses = () => coursesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="section-background min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="section-glow" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ════════════════════════════════════════════════
            S1 — HERO
        ════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-8 sm:py-12">

          {/* Left */}
          <div>
            <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">
              CORPORATE TRAINING & EDUCATION
            </p>
            <h1 className="premium-heading text-5xl sm:text-6xl lg:text-7xl font-black mt-6 leading-[0.92]">
              Bring 3D Printing
              <br />
              <span className="text-violet-400">To Your Team</span>
            </h1>
            <p className="soft-text text-lg sm:text-xl mt-8 leading-relaxed max-w-xl">
              Professional workshops for companies, schools and events.
              Hands-on learning that delivers real results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                to="/contact"
                className="primary-button flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold"
              >
                Request a Workshop
              </Link>
              <button
                onClick={scrollToCourses}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 hover:bg-violet-500/15"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.28)", color: "#c4b5fd" }}
              >
                View Our Courses
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-8">
              {["500+ Students Trained", "50+ Companies", "4.9★ Rating"].map((stat, i) => (
                <React.Fragment key={stat}>
                  {i > 0 && <span className="text-white/20">·</span>}
                  <span className="text-white/55 text-sm font-semibold">{stat}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right — 2×2 photo mosaic */}
          <div className="grid grid-cols-2 gap-3 h-[280px] sm:h-[380px] lg:h-[440px]">
            {mosaicPanels.map((panel, i) => (
              <div key={i} className="rounded-[20px] relative overflow-hidden flex items-end p-4">
                <img
                  src={panel.img}
                  alt={panel.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.72) 100%)",
                }} />
                <span className="relative z-10 text-xs font-bold" style={{ color: "rgba(255,255,255,0.92)" }}>
                  {panel.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            S2 — WHO IS THIS FOR
        ════════════════════════════════════════════════ */}
        <div className="mt-14 sm:mt-20">
          <div className="grid sm:grid-cols-3 gap-5">
            {audiences.map((a) => (
              <div
                key={a.title}
                className="rounded-[24px] p-6 sm:p-7 transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.55rem", marginBottom: 18,
                }}>
                  {a.icon}
                </div>
                <h3 className="font-black text-white text-xl leading-tight">{a.title}</h3>
                <p className="text-white/50 text-sm mt-2 leading-snug">{a.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {a.bullets.map(bullet => (
                    <li key={bullet} className="flex items-start gap-2.5">
                      <span style={{ color: "#a78bfa", flexShrink: 0, fontWeight: 800, marginTop: 1, fontSize: 13 }}>✓</span>
                      <span className="text-white/65 text-sm leading-snug">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            S3 — ONLINE COURSES
        ════════════════════════════════════════════════ */}
        <div ref={coursesRef} className="mt-20 sm:mt-24" id="courses">

          <div className="text-center sm:text-left mb-10">
            <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">ONLINE COURSES</p>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">Learn At Your Own Pace</h2>
            <p className="soft-text text-base mt-3 max-w-xl">
              One recorded course available now on Udemy. All other topics available as live
              in-person or online training — contact us to book.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {COURSES.map(course => (
              <div
                key={course.id}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex"
              >
                <CourseCard
                  course={course}
                />
              </div>
            ))}
          </div>

          <p className="text-white/35 text-sm mt-7 text-center">
            Need something custom?{" "}
            <Link
              to="/contact"
              className="text-violet-400 font-semibold hover:text-violet-300 transition-colors"
            >
              Request a tailored workshop →
            </Link>
          </p>
        </div>

        {/* ════════════════════════════════════════════════
            S4 — REAL UDEMY REVIEWS
        ════════════════════════════════════════════════ */}
        <div className="mt-20 sm:mt-24">

          <div className="mb-10">
            <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">WHAT STUDENTS SAY</p>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">Real Reviews from Udemy</h2>
            <p className="soft-text text-base mt-2">From our Diseño e Impresión 3D course</p>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
              </div>
              <span className="font-bold text-yellow-400 text-sm">5.0</span>
              <span className="text-white/40 text-sm">· Verified Udemy Reviews</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {UDEMY_REVIEWS.map((review, i) => {
              const initials    = review.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
              const circleColor = REVIEW_COLORS[i % REVIEW_COLORS.length];
              return (
                <div
                  key={i}
                  className="rounded-[16px] p-5 flex flex-col"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      ))}
                    </div>
                    {review.verified && (
                      <span style={{
                        background: "rgba(234,88,12,0.14)", border: "1px solid rgba(234,88,12,0.3)",
                        borderRadius: 4, padding: "2px 6px",
                        fontSize: 8, fontWeight: 800, color: "#fb923c", letterSpacing: "0.07em", textTransform: "uppercase",
                      }}>
                        Verified
                      </span>
                    )}
                  </div>

                  <p
                    className="text-white/80 text-sm leading-relaxed italic flex-1"
                    style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    "{review.text}"
                  </p>

                  <div
                    className="flex items-center justify-between mt-4 pt-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", background: circleColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0,
                      }}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-white font-bold text-xs">{review.name}</p>
                        <p className="text-white/40 text-[10px]">{review.date}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#a435f0", letterSpacing: "0.08em" }}>
                      UDEMY
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-white/45 text-sm mb-5">Join 500+ students learning 3D printing</p>
            <a
              href="https://www.udemy.com/course/diseno-e-impresion-3d-desde-cero-con-onshape/?referralCode=04D6F15A784B910A7695"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#a435f0", color: "#fff", textDecoration: "none" }}
            >
              View Course on Udemy →
            </a>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            S5 — CONTACT CTA
        ════════════════════════════════════════════════ */}
        <div className="mt-20 sm:mt-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-black">
            ¿Tenés alguna pregunta sobre nuestros cursos?
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

      </div>
    </main>
  );
};

export default Teach;
