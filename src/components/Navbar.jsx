import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

const NAV_LINKS = [
  { to: "/",         label: "Inicio" },
  { to: "/about",    label: "Nosotros" },
  { to: "/teach",    label: "Enseñamos" },
  { to: "/designer", label: "¿Necesitás un Diseñador?" },
  { to: "/contact",  label: "Contacto" },
];

const Navbar = () => {
  const navigate  = useNavigate();
  const uploadRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Close on click outside the nav element
  useEffect(() => {
    if (!menuOpen) return;
    const onOutside = (e) => {
      if (!e.target.closest("nav")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full z-[20] backdrop-blur-2xl bg-[#0b1020]/70 border-b border-white/5">

      <input
        ref={uploadRef}
        type="file"
        accept=".stl,.obj,.3mf,model/stl,application/sla,application/vnd.ms-pkistl,model/obj,model/3mf,application/vnd.ms-package.3dmanufacturing-3dmodel+xml"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) navigate("/quote", { state: { file } });
        }}
      />

      <div className="max-w-7xl mx-auto px-6 h-[88px] flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="text-4xl font-black tracking-tight">
          INITY<span className="text-violet-400">3D</span>
        </Link>

        {/* MENU — desktop only */}
        <div className="hidden lg:flex items-center gap-8 text-sm text-white/70">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className="hover:text-white transition-all duration-300 whitespace-nowrap">
              {label}
            </Link>
          ))}
        </div>

        {/* Right side: hamburger (mobile/tablet) + CTA */}
        <div className="flex items-center gap-3">

          {/* Hamburger button — hidden on desktop */}
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden flex flex-col justify-center items-center w-11 h-11 gap-[5px] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <span className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>

          {/* Upload CTA — always visible */}
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="primary-button px-8 py-4 rounded-2xl font-semibold"
          >
            Subir Modelo
          </button>

        </div>
      </div>

      {/* Mobile / tablet dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0b1020]/95 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center min-h-[44px] px-4 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
