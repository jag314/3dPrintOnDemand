const steps = [
  'Upload your 3D model',
  'Automatic file analysis',
  'Instant manufacturing quote',
  'Secure online payment',
  'Production and shipping',
];

const Workflow = () => {

  return (

    <section id="workflow" className="py-32 px-6">

      <div className="max-w-7xl mx-auto">

        <div className="mb-20">

          <p className="text-violet-400 uppercase tracking-widest text-sm">
            Process
          </p>

          <h2 className="text-5xl font-black mt-4">
            How PRINTFORGE Works
          </h2>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">

          {steps.map((step, index) => (

            <div
              key={step}
              className="border border-white/10 bg-white/[0.03] rounded-3xl p-8"
            >

              <div className="text-violet-500 text-5xl font-black mb-6">
                0{index + 1}
              </div>

              <h3 className="text-xl font-semibold leading-snug">
                {step}
              </h3>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
};

export default Workflow;