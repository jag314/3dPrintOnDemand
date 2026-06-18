import {
  Zap,
  ShieldCheck,
  Sparkles,
  Rocket,
  Box,
  Cpu,
} from "lucide-react";

const features = [

  {
    title: "Precio Instantáneo",
    icon: Zap,
    description:
      "Recibí el precio de manufactura en tiempo real al subir tu archivo 3D.",
  },

  {
    title: "Precisión Industrial",
    icon: ShieldCheck,
    description:
      "Manufactura aditiva enfocada en precisión para proyectos de grado industrial.",
  },

  {
    title: "Materiales Premium",
    icon: Sparkles,
    description:
      "Elegí entre materiales de alta gama, acabados premium y variantes de color personalizados.",
  },

  {
    title: "Entrega Rápida",
    icon: Rocket,
    description:
      "El flujo optimizado y la cotización automática reducen los tiempos de producción.",
  },

  {
    title: "Vista Previa en Tiempo Real",
    icon: Box,
    description:
      "Visualizá tus modelos STL y 3D directamente en el navegador antes de producir.",
  },

  {
    title: "Calidad de Ingeniería",
    icon: Cpu,
    description:
      "Diseñado para prototipado profesional, piezas de producción y validación técnica.",
  },

];

const WhyInity3D = () => {

  return (

    <section className="section-background py-32 px-6 overflow-hidden relative">

      {/* GLOW */}

      <div className="section-glow" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}

        <div className="text-center max-w-4xl mx-auto">

          <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

            POR QUÉ INITY 3D

          </p>

          <h2 className="text-6xl font-black mt-6 leading-tight">

            Hecho para la Manufactura
            <br />

            Moderna

          </h2>

          <p className="soft-text text-lg mt-8 leading-relaxed">

            Una plataforma de manufactura aditiva de nueva generación, enfocada en automatización, precisión y flujos de producción premium.

          </p>

        </div>

        {/* GRID */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24">

          {features.map((feature) => {

            const Icon =
              feature.icon;

            return (

              <div
                key={feature.title}
                className="
                group
                relative
                rounded-[36px]
                glass-card
                p-10
                overflow-hidden
                hover-card
                "
              >

                {/* GLOW */}

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-violet-500/5 blur-3xl" />

                {/* ICON */}

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-violet-700/10 border border-violet-500/20 flex items-center justify-center mx-auto group-hover:scale-110 transition duration-500">

                  <Icon
                    size={38}
                    className="text-violet-300"
                  />

                </div>

                {/* CONTENT */}

                <div className="relative z-10 text-center mt-10">

                  <h3 className="text-3xl font-black">

                    {feature.title}

                  </h3>

                  <p className="soft-text leading-relaxed mt-5">

                    {feature.description}

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

export default WhyInity3D;
