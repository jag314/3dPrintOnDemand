import { Link } from "react-router-dom";

const LivePreview = () => {

  return (

    <section className="section-background py-32 px-6 overflow-hidden">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        <div>

          <p className="uppercase tracking-[0.3em] text-violet-400 text-sm">

            Instant Quoting

          </p>

          <h2 className="text-5xl font-black mt-5 leading-tight">

            Real-Time 3D
            <span className="text-violet-500">

              {" "}Manufacturing{" "}

            </span>

            Analysis

          </h2>

          <p className="text-white/60 mt-8 text-lg leading-relaxed">

            Upload STL, STEP, OBJ or GLTF files and instantly calculate manufacturing cost, estimated weight, complexity and material pricing.

          </p>

          <Link
            to="/quote"
            className="inline-flex mt-10 bg-violet-600 hover:bg-violet-500 transition px-8 py-4 rounded-2xl font-semibold"
          >

            Try Live Quote

          </Link>

        </div>

        <div className="border border-white/10 glass-card rounded-[32px] p-8">

          <div className="aspect-video rounded-3xl bg-gradient-to-br from-violet-500/20 to-black border border-violet-500/20 flex items-center justify-center">

            <div className="text-center">

              <div className="text-6xl mb-6">

                ⚡

              </div>

              <h3 className="text-3xl font-black">

                Live 3D Preview

              </h3>

            </div>

          </div>

        </div>

      </div>

    </section>

  );

};

export default LivePreview;