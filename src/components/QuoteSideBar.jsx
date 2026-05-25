export default function QuoteSidebar() {

  return (

    <aside className="sticky top-28 h-fit border border-white/10 bg-white/[0.03] rounded-[32px] p-8 backdrop-blur-md">

      {/* HEADER */}

      <div>

        <p className="text-violet-400 uppercase text-sm tracking-widest">
          Summary
        </p>

        <h2 className="text-4xl font-black mt-3">
          Instant Quote
        </h2>

      </div>

      {/* DETAILS */}

      <div className="space-y-6 mt-10">

        <div className="flex items-center justify-between text-white/70">
          <span>Material</span>
          <span className="text-white font-semibold">PETG</span>
        </div>

        <div className="flex items-center justify-between text-white/70">
          <span>Layer Height</span>
          <span className="text-white font-semibold">0.2 mm</span>
        </div>

        <div className="flex items-center justify-between text-white/70">
          <span>Estimated Time</span>
          <span className="text-white font-semibold">14h</span>
        </div>

        <div className="flex items-center justify-between text-white/70">
          <span>Volume</span>
          <span className="text-white font-semibold">124 cm³</span>
        </div>

      </div>

      {/* PRICE */}

      <div className="mt-12 border-t border-white/10 pt-8">

        <div className="flex items-end justify-between">

          <div>

            <p className="text-white/40 text-sm">
              Total Price
            </p>

            <h3 className="text-5xl font-black mt-2">
              ₡12,500
            </h3>

          </div>

          <span className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 px-4 py-2 rounded-full">

            Ready

          </span>

        </div>

      </div>

      {/* BUTTON */}

      <button className="w-full mt-10 bg-violet-600 hover:bg-violet-500 transition py-5 rounded-2xl text-lg font-bold">

        Continue to Checkout

      </button>

      {/* DELIVERY */}

      <div className="mt-6 text-center text-white/40 text-sm leading-relaxed">

        Estimated delivery between

        <br />

        <span className="text-white font-semibold">
          May 28 — May 31
        </span>

      </div>

    </aside>

  );
}