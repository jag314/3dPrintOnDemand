import {
  Upload,
  ScanSearch,
  Calculator,
} from "lucide-react";

const PrinterIcon3D = ({ size = 38 }) => (
  <img
    src="/materials/3d-printer.png"
    alt="Impresora 3D"
    width={size}
    height={size}
    style={{ objectFit: "contain", filter: "invert(72%) sepia(40%) saturate(600%) hue-rotate(215deg) brightness(110%)" }}
  />
);

const workflow = [

  {
    title: "Subí tu Modelo",
    icon: Upload,
    description:
      "Subí archivos STL, OBJ o STEP directamente a nuestra plataforma de manufactura instantánea.",
  },

  {
    title: "Análisis en Vivo",
    icon: ScanSearch,
    description:
      "Análisis geométrico automático y visualización 3D en tiempo real antes de producir.",
  },

  {
    title: "Cotización Instantánea",
    icon: Calculator,
    description:
      "Recibí precios automáticos según material, volumen, acabados y complejidad de producción.",
  },

  {
    title: "Producción",
    icon: PrinterIcon3D,
    description:
      "Tu proyecto entra al flujo profesional de manufactura aditiva con validación de calidad.",
  },

];

const Workflow = () => {

  return (

    <section
      id="workflow"
      className="section-background py-32 px-6 overflow-hidden relative"
    >

      {/* GLOW */}

      <div className="section-glow" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}

        <div className="text-center max-w-4xl mx-auto">

          <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

            CÓMO FUNCIONA INITY 3D

          </p>

          <h2 className="text-6xl font-black mt-6 leading-tight">

            Flujo de Fabricación
            <br />

            Automatizado

          </h2>

          <p className="soft-text text-lg mt-8 leading-relaxed">

            Un flujo de fabricación digital simplificado, enfocado en velocidad, precisión y eficiencia productiva.

          </p>

        </div>

        {/* STEPS */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">

          {workflow.map((step, index) => {

            const Icon =
              step.icon;

            return (

              <div
                key={step.title}
                className="
                group
                relative
                glass-card
                rounded-[36px]
                p-10
                hover-card
                overflow-hidden
                "
              >

                {/* NUMBER */}

                <div className="absolute top-6 right-6 text-white/10 text-7xl font-black">

                  0{index + 1}

                </div>

                {/* ICON */}

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-violet-700/10 border border-violet-500/20 flex items-center justify-center">

                  <Icon
                    size={38}
                    className="text-violet-300"
                  />

                </div>

                {/* CONTENT */}

                <div className="relative z-10 mt-10">

                  <h3 className="text-3xl font-black">

                    {step.title}

                  </h3>

                  <p className="soft-text leading-relaxed mt-5">

                    {step.description}

                  </p>

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </section>

  );

};

export default Workflow;
