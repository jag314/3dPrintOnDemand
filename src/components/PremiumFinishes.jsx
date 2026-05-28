const finishes = [

  {
    name: "Silk Gold",
    color: "#d4af37",
  },

  {
    name: "Carbon Fiber",
    color: "#374151",
  },

  {
    name: "Silk Silver",
    color: "#c0c0c0",
  },

  {
    name: "Glow PLA",
    color: "#84cc16",
  },

];

const PremiumFinishes = () => {

  return (

    <section className="section-background py-32 px-6 overflow-hidden">

      <div className="max-w-7xl mx-auto">

        <div className="mb-20">

          <p className="uppercase tracking-[0.3em] text-violet-400 text-sm">

            Premium Materials

          </p>

          <h2 className="text-5xl font-black mt-5">

            Professional Finishes

          </h2>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {finishes.map((finish) => (

            <div
              key={finish.name}
              className="rounded-[32px] border border-white/10 glass-card p-8 hover:border-violet-500/30 transition"
            >

              <div
                className="w-24 h-24 rounded-3xl"
                style={{
                  background: finish.color,
                }}
              />

              <h3 className="text-2xl font-black mt-8">

                {finish.name}

              </h3>

              <p className="text-white/50 mt-3">

                Premium filament finish for professional-grade parts.

              </p>

            </div>

          ))}

        </div>

      </div>

    </section>

  );

};

export default PremiumFinishes;