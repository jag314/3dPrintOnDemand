import { Link } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";

const Footer = () => (
  <footer style={{ background: "#060818", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
    <div className="max-w-7xl mx-auto px-6 py-16">

      {/* 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

        {/* Logo + tagline */}
        <div>
          <h2 className="text-2xl font-black mb-3">
            INITY<span className="text-violet-500">3D</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Plataforma profesional de impresión 3D en Costa Rica.<br />
            Cotización instantánea, materiales premium.
          </p>
        </div>

        {/* Nav links */}
        <div>
          <h3 className="text-white/80 font-semibold text-xs uppercase tracking-widest mb-5">
            Navegación
          </h3>
          <ul className="space-y-3">
            {[
              { label: "Inicio",                   to: "/" },
              { label: "Nosotros",               to: "/about" },
              { label: "Enseñamos",              to: "/teach" },
              { label: "¿Necesitás un Diseñador?", to: "/designer" },
              { label: "Contacto",               to: "/contact" },
            ].map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-white/50 hover:text-violet-400 transition-colors text-sm"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto + redes */}
        <div>
          <h3 className="text-white/80 font-semibold text-xs uppercase tracking-widest mb-5">
            Contacto
          </h3>
          <ul className="space-y-3 mb-6">
            <li>
              <a
                href="mailto:info@inity3d.com"
                className="text-white/50 hover:text-violet-400 transition-colors text-sm"
              >
                info@inity3d.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/50672904402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-violet-400 transition-colors text-sm"
              >
                +506 7290-4402
              </a>
            </li>
          </ul>
          <a
            href="https://instagram.com/inity.3d"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/50 hover:text-violet-400 transition-colors mt-6 mb-4"
          >
            <FaInstagram size={20} />
            <span className="text-sm">@inity.3d</span>
          </a>
          <Link
            to="/contact"
            className="inline-block px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Enviar mensaje
          </Link>
        </div>

      </div>

      {/* Copyright */}
      <div
        className="pt-8 text-center text-white/30 text-xs"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        © 2026 Inity3D. Todos los derechos reservados.
      </div>

    </div>
  </footer>
);

export default Footer;
