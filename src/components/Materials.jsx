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
      "Material confiable y versátil, perfecto para prototipos y piezas visuales.",
    color: "#84cc16",
  },

  {
    name: "PETG",
    icon: Shield,
    description:
      "Material resistente y con buena tolerancia química, ideal para piezas funcionales.",
    color: "#06b6d4",
  },

  {
    name: "ABS",
    icon: Flame,
    description:
      "Filamento de ingeniería resistente al calor, diseñado para piezas duraderas.",
    color: "#f97316",
  },

  {
    name: "TPU",
    icon: Waves,
    description:
      "Material flexible optimizado para resistencia al impacto y elasticidad.",
    color: "#22c55e",
  },

  {
    name: "Fibra de Carbono",
    icon: Cpu,
    description:
      "Compuesto reforzado premium para aplicaciones de ingeniería ligera.",
    color: "#64748b",
  },

  {
    name: "Acabados Seda",
    icon: Sparkles,
    description:
      "Materiales estéticos premium con acabados metálicos y brillantes.",
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

            MATERIALES DE MANUFACTURA

          </p>

          <h2 className="text-6xl font-black mt-6">

            Materiales de Impresión
            <br />

            Profesionales

          </h2>

          <p className="text-white/50 text-lg mt-8 leading-relaxed">

            Elegí entre materiales industriales, acabados premium y compuestos de ingeniería para tu próximo proyecto de manufactura.

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
