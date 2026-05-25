const Footer = () => {

  return (

    <footer className="border-t border-white/10 py-12 px-6">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        <div>

          <h2 className="text-3xl font-black">
            PRINT<span className="text-violet-500">FORGE</span>
          </h2>

          <p className="text-white/50 mt-2">
            Modern Digital Manufacturing Platform
          </p>

        </div>

        <div className="text-white/40 text-sm">
          © 2026 PRINTFORGE — Costa Rica
        </div>

      </div>

    </footer>
  );
};

export default Footer;