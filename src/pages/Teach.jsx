import { Link } from "react-router-dom";

const institutions = [

  "MakerFaire",
  "Universidades Nacionales",
  "STEM Programs",
  "Online Courses",
  "Educational Workshops",
  "Innovation Events",

];

const programs = [

  "3D Printing Fundamentals",
  "CAD Design & Modeling",
  "Rapid Prototyping",
  "Additive Manufacturing",
  "Engineering Design",
  "STEM Innovation",

];

const Teach = () => {

  return (

    <main className="section-background min-h-screen pt-40 pb-32 px-6 relative overflow-hidden">

      {/* BACKGROUND */}

      <div className="section-glow" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HERO */}

        <div className="text-center max-w-5xl mx-auto">

          <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

            EDUCATION & INNOVATION

          </p>

          <h1 className="text-6xl lg:text-7xl font-black mt-6 leading-[0.95]">

            Teaching The Future Of
            <span className="text-violet-400">

              {" "}Manufacturing

            </span>

          </h1>

          <p className="soft-text text-xl leading-relaxed mt-10">

            INITY 3D develops educational experiences focused on additive manufacturing, product design, CAD modeling and STEM innovation for schools, universities and institutions.

          </p>

          {/* CTA */}

          <div className="mt-14">

            <Link
              to="/contact"
              className="
              primary-button
              inline-flex
              items-center
              justify-center
              px-10
              py-5
              rounded-2xl
              text-lg
              font-semibold
              "
            >

              Bring INITY To Your Institution

            </Link>

          </div>

        </div>

        {/* INSTITUTIONS */}

        <div className="mt-32">

          <div className="text-center max-w-3xl mx-auto">

            <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

              EXPERIENCE

            </p>

            <h2 className="text-5xl font-black mt-6">

              Institutions & Events

            </h2>

            <p className="soft-text text-lg leading-relaxed mt-8">

              Educational initiatives, workshops and innovation experiences developed across Costa Rica.

            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">

            {institutions.map((institution) => (

              <div
                key={institution}
                className="
                group
                glass-card
                rounded-[32px]
                p-10
                text-center
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-violet-500/30
                "
              >

                <div
                  className="
                  absolute
                  inset-0
                  opacity-0
                  group-hover:opacity-100
                  transition-all
                  duration-700
                  bg-violet-500/5
                  blur-3xl
                  "
                />

                <h3 className="relative z-10 text-2xl font-bold">

                  {institution}

                </h3>

              </div>

            ))}

          </div>

        </div>

        {/* PROGRAMS */}

        <div className="mt-40">

          <div className="text-center max-w-3xl mx-auto">

            <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

              EDUCATIONAL PROGRAMS

            </p>

            <h2 className="text-5xl font-black mt-6">

              Learning Experiences

            </h2>

            <p className="soft-text text-lg leading-relaxed mt-8">

              Modern educational programs designed to introduce students and institutions to additive manufacturing and engineering workflows.

            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">

            {programs.map((program) => (

              <div
                key={program}
                className="
                group
                glass-card
                rounded-[32px]
                p-10
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-violet-500/30
                "
              >

                <div
                  className="
                  absolute
                  inset-0
                  opacity-0
                  group-hover:opacity-100
                  transition-all
                  duration-700
                  bg-violet-500/5
                  blur-3xl
                  "
                />

                <h3 className="relative z-10 text-2xl font-bold">

                  {program}

                </h3>

              </div>

            ))}

          </div>

        </div>

        {/* FINAL CTA */}

        <div className="mt-40">

          <div
            className="
            relative
            overflow-hidden
            rounded-[42px]
            border
            border-white/10
            glass-card
            p-14
            text-center
            "
          >

            {/* GLOW */}

            <div
              className="
              absolute
              inset-0
              bg-violet-500/10
              blur-3xl
              "
            />

            <div className="relative z-10">

              <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

                START A PROGRAM

              </p>

              <h2 className="text-5xl lg:text-6xl font-black mt-6 leading-tight">

                Let's Inspire The
                <br />

                Next Generation

              </h2>

              <p className="soft-text text-xl leading-relaxed mt-8 max-w-3xl mx-auto">

                Bring additive manufacturing, CAD design and innovation workshops to your institution with INITY 3D educational programs.

              </p>

              <div className="mt-12">

                <Link
                  to="/contact"
                  className="
                  primary-button
                  inline-flex
                  items-center
                  justify-center
                  px-12
                  py-5
                  rounded-2xl
                  text-lg
                  font-semibold
                  "
                >

                  Contact INITY 3D

                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  );

};

export default Teach;