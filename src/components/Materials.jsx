const materials = [
  {
    name: 'PLA',
    description: 'Affordable and high quality prototyping material.',
  },
  {
    name: 'PETG',
    description: 'Strong and durable engineering material.',
  },
  {
    name: 'ABS',
    description: 'Industrial resistant thermoplastic.',
  },
  {
    name: 'Resin',
    description: 'Ultra high detail prints for precision parts.',
  },
];

const Materials = () => {

  return (

    <section id="materials" className="py-32 px-6">

      <div className="max-w-7xl mx-auto">

        <div className="mb-20">

          <p className="text-violet-400 uppercase tracking-widest text-sm">
            Materials
          </p>

          <h2 className="text-5xl font-black mt-4">
            Manufacturing Materials
          </h2>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {materials.map((material) => (

            <div
              key={material.name}
              className="border border-white/10 bg-white/[0.03] rounded-3xl p-8 hover:border-violet-500/30 transition"
            >

              <h3 className="text-2xl font-bold">
                {material.name}
              </h3>

              <p className="text-white/60 mt-4 leading-relaxed">
                {material.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
};

export default Materials;