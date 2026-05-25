export default function Topbar() {

  return (

    <nav className="w-full border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">

      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">

        <h1 className="text-3xl font-black tracking-tight">
          PRINT<span className="text-violet-500">FORGE</span>
        </h1>

        <div className="hidden md:flex items-center gap-10 text-white/70 text-sm font-medium">
          <a href="#">Dashboard</a>
          <a href="#">Orders</a>
          <a href="#">Materials</a>
          <a href="#">Support</a>
        </div>

        <button className="bg-violet-600 hover:bg-violet-500 transition px-6 py-3 rounded-2xl font-semibold">
          Checkout
        </button>

      </div>

    </nav>
  );
}