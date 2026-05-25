const Navbar = () => {

  return (

    <nav className="fixed top-0 left-0 w-full z-[100]">

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* LOGO */}

        <h1 className="text-4xl font-black tracking-tight text-white">

          PRINT<span className="text-violet-500">FORGE</span>

        </h1>

        {/* MENU */}

        <div className="hidden md:flex items-center gap-14 text-white/70 text-lg">

          <a href="#">Materials</a>
          <a href="#">Workflow</a>
          <a href="#">Pricing</a>
          <a href="#">Contact</a>

        </div>

        {/* BUTTON */}

        <button className="bg-violet-600 hover:bg-violet-500 transition px-8 py-4 rounded-2xl font-semibold text-white">

          Upload Model

        </button>

      </div>

    </nav>

  );
};

export default Navbar;