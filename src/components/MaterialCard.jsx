export default function MaterialCard({ material }) {

  return (

    <div className="border border-white/10 bg-white/[0.03] rounded-3xl p-6 hover:border-violet-500/40 transition cursor-pointer group">

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-2xl font-bold group-hover:text-violet-400 transition">
            {material.name}
          </h3>

          <p className="text-white/60 mt-3 leading-relaxed">
            {material.description}
          </p>

        </div>

        <div className="w-5 h-5 rounded-full bg-violet-500 mt-2" />

      </div>

      <div className="mt-8 flex items-center justify-between">

        <span className="text-2xl font-black">
          {material.price}
        </span>

        <button className="px-5 py-2 rounded-xl border border-white/10 hover:border-violet-500/30 transition text-sm">
          Select
        </button>

      </div>

    </div>
  );
}