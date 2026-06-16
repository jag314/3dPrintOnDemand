import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const navigate = useNavigate();
  const uploadRef = useRef();
  const { t, i18n } = useTranslation();

  return (

    <nav
      className="
      fixed
      top-0
      left-0
      w-full
      z-[20]
      backdrop-blur-2xl
      bg-[#0b1020]/70
      border-b
      border-white/5
      "
    >

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
        <div className="hidden lg:flex items-center gap-12 text-lg text-white/70">
          <Link to="/"          className="hover:text-white transition-all duration-300">{t("nav.home")}</Link>
          <Link to="/about"     className="hover:text-white transition-all duration-300">{t("nav.about")}</Link>
          <Link to="/teach"     className="hover:text-white transition-all duration-300">{t("nav.weTeach")}</Link>
          <Link to="/designer"  className="hover:text-white transition-all duration-300">{t("nav.needDesigner")}</Link>
          <Link to="/contact"   className="hover:text-white transition-all duration-300">{t("nav.contact")}</Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* Language toggle */}
          <button
            type="button"
            onClick={() => i18n.changeLanguage(i18n.language === "es" ? "en" : "es")}
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(167,139,250,0.3)",
              borderRadius: "8px",
              padding: "6px 12px",
              color: "#a78bfa",
              fontSize: "12px",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "1px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            {i18n.language === "es" ? "EN" : "ES"}
          </button>

          {/* Upload CTA */}
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="primary-button px-8 py-4 rounded-2xl font-semibold"
          >
            {t("nav.uploadModel")}
          </button>

        </div>

      </div>

    </nav>

  );

};

export default Navbar;
