import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const uploadRef = useRef();

  return (
    <nav className="fixed top-0 left-0 w-full z-[20] backdrop-blur-2xl bg-[#0b1020]/70 border-b border-white/5">

      <input
        ref={uploadRef}
        type="file"
        accept=".stl,.obj,.3mf"
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

        {/* MENU */}
        <div className="hidden lg:flex items-center gap-8 text-sm text-white/70">
          <Link to="/"         className="hover:text-white transition-all duration-300">Inicio</Link>
          <Link to="/about"    className="hover:text-white transition-all duration-300">Nosotros</Link>
          <Link to="/teach"    className="hover:text-white transition-all duration-300">Enseñamos</Link>
          <Link to="/designer" className="hover:text-white transition-all duration-300 whitespace-nowrap">¿Necesitás un Diseñador?</Link>
          <Link to="/contact"  className="hover:text-white transition-all duration-300">Contacto</Link>
        </div>

        {/* Upload CTA */}
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="primary-button px-8 py-4 rounded-2xl font-semibold"
        >
          Subir Modelo
        </button>

      </div>

    </nav>
  );
};

export default Navbar;
