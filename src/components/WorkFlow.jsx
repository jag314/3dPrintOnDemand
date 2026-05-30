import {
  Upload,
  ScanSearch,
  Calculator,
} from "lucide-react";

const PrinterIcon3D = ({ size = 38 }) => (
  <img
    src="/materials/3d-printer.png"
    alt="3D Printer"
    width={size}
    height={size}
    style={{ objectFit: "contain", filter: "invert(72%) sepia(40%) saturate(600%) hue-rotate(215deg) brightness(110%)" }}
  />
);

const workflow = [

  {
    title: "Upload Model",
    icon: Upload,
    description:
      "Upload STL, OBJ or STEP files directly through the instant manufacturing platform.",
  },

  {
    title: "Live Analysis",
    icon: ScanSearch,
    description:
      "Automatic geometry analysis and real-time 3D visualization before production.",
  },

  {
    title: "Instant Quote",
    icon: Calculator,
    description:
      "Receive automated pricing based on material, volume, finishes and production complexity.",
  },

  {
    title: "Production",
    icon: PrinterIcon3D,
    description:
      "Your project enters professional additive manufacturing workflow and quality validation.",
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

            HOW INITY 3D WORKS

          </p>

          <h2 className="text-6xl font-black mt-6 leading-tight">

            Automated
            <br />

            Manufacturing Workflow

          </h2>

          <p className="soft-text text-lg mt-8 leading-relaxed">

            A simplified digital manufacturing pipeline focused on speed, precision and production efficiency.

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