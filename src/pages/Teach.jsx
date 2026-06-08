import React, { useState, useRef, useEffect } from "react";
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
    thumbnail: "https://img-c.udemycdn.com/course/480x270/6380765_3f8c.jpg",
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

const CourseCard = ({ course, onNotify }) => {
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
              <button
                onClick={onNotify}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)", color: "#fff" }}
              >
                I Want This Course →
              </button>
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
  const formRef    = useRef(null);
  const coursesRef = useRef(null);

  const [showFloat,      setShowFloat]      = useState(false);
  const [formHighlighted, setFormHighlighted] = useState(false);
  const [form, setForm]                     = useState({ name: "", email: "", company: "", type: "", participants: "", message: "" });
  const [submitted, setSubmitted]           = useState(false);

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowFloat(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollToForm    = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToCourses = () => coursesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const handleChange    = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit    = (e) => { e.preventDefault(); setSubmitted(true); };

  const notifyAboutCourse = (title) => {
    setForm(p => ({
      ...p,
      message: `Hi, I'm interested in learning ${title}. Please contact me with available dates and pricing.`,
    }));
    scrollToForm();
    setFormHighlighted(true);
    setTimeout(() => setFormHighlighted(false), 1400);
  };

  const inputCls  = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 outline-none text-white focus:border-violet-500 transition-all text-sm placeholder:text-white/25";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  return (
    <main className="section-background min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <style>{`
        @keyframes formPulse {
          0%   { box-shadow: 0 0 0 0   rgba(139,92,246,0);    border-color: rgba(139,92,246,0.22); }
          35%  { box-shadow: 0 0 0 12px rgba(139,92,246,0.28); border-color: rgba(139,92,246,0.8);  }
          100% { box-shadow: 0 0 0 0   rgba(139,92,246,0);    border-color: rgba(139,92,246,0.22); }
        }
      `}</style>
      <div className="section-glow" />

      {/* ── FLOATING CTA (mobile only, hides when form is visible) ── */}
      <div
        className={`fixed bottom-6 right-6 z-50 sm:hidden transition-all duration-300 ${
          showFloat ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToForm}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#9333ea)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
          }}
        >
          Get a Quote ↑
        </button>
      </div>

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
              <button
                onClick={scrollToForm}
                className="primary-button flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold"
              >
                Request a Workshop
              </button>
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
                  onNotify={() => notifyAboutCourse(course.title)}
                />
              </div>
            ))}
          </div>

          <p className="text-white/35 text-sm mt-7 text-center">
            Need something custom?{" "}
            <button
              onClick={scrollToForm}
              className="text-violet-400 font-semibold hover:text-violet-300 transition-colors"
            >
              Request a tailored workshop →
            </button>
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
            S5 — LEAD CAPTURE FORM
        ════════════════════════════════════════════════ */}
        <div ref={formRef} className="mt-20 sm:mt-28" id="workshop-form">
          <div
            className="relative rounded-[28px] sm:rounded-[42px] overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(109,40,217,0.08) 0%, rgba(12,12,24,0.96) 100%)",
              border: "1px solid rgba(139,92,246,0.22)",
              animation: formHighlighted ? "formPulse 1.4s ease-out" : "none",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% -8%, rgba(124,58,237,0.2) 0%, transparent 55%)" }}
            />

            <div className="relative z-10 max-w-[600px] mx-auto px-6 sm:px-10 py-14 sm:py-20">

              <div className="text-center mb-10">
                <p className="uppercase tracking-[0.35em] text-violet-400 text-xs sm:text-sm">START TODAY</p>
                <h2 className="text-4xl sm:text-5xl font-black mt-4 leading-tight">
                  Ready To Train
                  <br />
                  <span className="text-violet-400">Your Team?</span>
                </h2>
                <p className="soft-text text-base sm:text-lg mt-5 leading-relaxed">
                  Tell us about your project and we'll get back to you within 24 hours.
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-10">
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%", margin: "0 auto",
                    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32,
                  }}>✓</div>
                  <h3 className="text-2xl font-black mt-6">Message Sent!</h3>
                  <p className="soft-text text-base mt-3">
                    Thanks! We'll contact you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-violet-400 text-sm font-semibold hover:text-violet-300 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/55 text-sm mb-2">Full Name *</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange}
                        placeholder="Your name" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-white/55 text-sm mb-2">Email *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange}
                        placeholder="you@company.com" required className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/55 text-sm mb-2">Company / Institution *</label>
                    <input type="text" name="company" value={form.company} onChange={handleChange}
                      placeholder="Your organization" required className={inputCls} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/55 text-sm mb-2">Type of Training *</label>
                      <select name="type" value={form.type} onChange={handleChange} required className={selectCls}>
                        <option value="" disabled className="bg-[#111827]">Select type</option>
                        <option value="corporate" className="bg-[#111827]">Corporate Workshop</option>
                        <option value="academic"  className="bg-[#111827]">Academic Program</option>
                        <option value="event"     className="bg-[#111827]">Event Experience</option>
                        <option value="online"    className="bg-[#111827]">Online Course</option>
                        <option value="other"     className="bg-[#111827]">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/55 text-sm mb-2">Participants *</label>
                      <select name="participants" value={form.participants} onChange={handleChange} required className={selectCls}>
                        <option value="" disabled className="bg-[#111827]">Select range</option>
                        <option value="1-10"  className="bg-[#111827]">1–10</option>
                        <option value="11-30" className="bg-[#111827]">11–30</option>
                        <option value="31-50" className="bg-[#111827]">31–50</option>
                        <option value="50+"   className="bg-[#111827]">50+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/55 text-sm mb-2">Project Details</label>
                    <textarea name="message" value={form.message} onChange={handleChange}
                      placeholder="Tell us about your team, goals and timeline..."
                      rows={3} className={inputCls + " resize-none"} />
                  </div>

                  <button type="submit" className="primary-button w-full py-5 rounded-2xl text-lg font-bold mt-2">
                    Request Your Workshop →
                  </button>
                </form>
              )}

              {!submitted && (
                <div className="mt-8 pt-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-white/38 text-sm mb-5">Or contact us directly:</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                    <a href="mailto:contact@inity3d.com"
                      className="flex items-center gap-2 text-white/60 text-sm hover:text-violet-400 transition-colors"
                      style={{ textDecoration: "none" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      contact@inity3d.com
                    </a>
                    <a href="https://wa.me/50600000000"
                      className="flex items-center gap-2 text-white/60 text-sm hover:text-violet-400 transition-colors"
                      style={{ textDecoration: "none" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 17z" />
                      </svg>
                      +506 7290-4402
                    </a>
                  </div>
                  <p className="text-violet-400/65 text-xs font-semibold mt-5">⚡ Average response: 2 hours</p>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Teach;
