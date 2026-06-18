import { Link } from "react-router-dom";

const CTASection = () => {

  return (

    <section className="section-background py-32 px-6 overflow-hidden">

      <div className="max-w-6xl mx-auto rounded-[40px] border border-violet-500/20 bg-violet-500/10 p-20 text-center relative overflow-hidden">

        <div className="relative z-10">

          <h2 className="text-6xl font-black leading-tight">

            ¿Listo para Imprimir
            <br />

            tu Próximo Proyecto?

          </h2>

          <p className="text-white/60 text-xl mt-8 max-w-2xl mx-auto">

            Subí tu modelo 3D y recibí el precio de manufactura en tiempo real, al instante.

          </p>

          <Link
            to="/quote"
            className="inline-flex mt-10 bg-violet-600 hover:bg-violet-500 transition px-10 py-5 rounded-2xl font-bold text-lg"
          >

            Subí tu Archivo 3D

          </Link>

        </div>

      </div>

    </section>

  );

};

export default CTASection;