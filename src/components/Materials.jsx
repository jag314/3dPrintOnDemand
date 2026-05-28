import {
  Boxes,
  Shield,
  Flame,
  Sparkles,
  Waves,
  Cpu,
} from "lucide-react";

const materials = [

  {
    name: "PLA",
    icon: Boxes,
    description:
      "Reliable and versatile material perfect for prototypes and visual parts.",
    color: "#84cc16",
  },

  {
    name: "PETG",
    icon: Shield,
    description:
      "Strong and chemical-resistant material ideal for functional components.",
    color: "#06b6d4",
  },

  {
    name: "ABS",
    icon: Flame,
    description:
      "Heat-resistant engineering filament designed for durable parts.",
    color: "#f97316",
  },

  {
    name: "TPU",
    icon: Waves,
    description:
      "Flexible material optimized for impact resistance and elasticity.",
    color: "#22c55e",
  },

  {
    name: "Carbon Fiber",
    icon: Cpu,
    description:
      "Premium reinforced composite for lightweight engineering applications.",
    color: "#64748b",
  },

  {
    name: "Silk Finishes",
    icon: Sparkles,
    description:
      "Premium aesthetic materials with metallic and glossy finishes.",
    color: "#d946ef",
  },

];

const Materials = () => {

  return (

    <section className="section-background py-32 px-6 overflow-hidden">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="text-center max-w-4xl mx-auto">

          <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

            MANUFACTURING MATERIALS

          </p>

          <h2 className="text-6xl font-black mt-6">

            Professional
            <br />

            Printing Materials

          </h2>

          <p className="text-white/50 text-lg mt-8 leading-relaxed">

            Choose from industrial-grade materials, premium finishes, and engineering composites for your next manufacturing project.

          </p>

        </div>

        {/* GRID */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24">

          {materials.map((material) => {

            const Icon =
              material.icon;

            return (

              <div
                key={material.name}
                className="group relative rounded-[36px] border border-white/10 glass-card p-10 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:border-violet-500/40 hover:bg-violet-500/[0.05]"
              >

                {/* GLOW */}

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-violet-500/5 blur-3xl" />

                {/* ICON */}

                <div
                  className="relative z-10 w-20 h-20 rounded-3xl border flex items-center justify-center mx-auto group-hover:scale-110 transition duration-500"
                  style={{
                    background:
                      `${material.color}20`,
                    borderColor:
                      `${material.color}40`,
                  }}
                >

                  <Icon
                    size={38}
                    style={{
                      color:
                        material.color,
                    }}
                  />

                </div>

                {/* CONTENT */}

                <div className="relative z-10 text-center mt-10">

                  <h3 className="text-3xl font-black">

                    {material.name}

                  </h3>

                  <p className="text-white/50 leading-relaxed mt-5">

                    {material.description}

                  </p>

                </div>

                {/* HOVER LINE */}

                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:w-full transition-all duration-500" />

              </div>

            );

          })}

        </div>

      </div>

    </section>

  );

};

export default Materials;