import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  PenTool,
  Wrench,
} from "lucide-react";

const Contact = () => {

  return (

    <main className="section-background min-h-screen pt-40 pb-32 px-6 relative overflow-hidden">

      {/* BACKGROUND GLOW */}

      <div className="section-glow" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HERO */}

        <div className="text-center max-w-4xl mx-auto">

          <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">

            CONTACT INITY 3D

          </p>

          <h1 className="text-6xl lg:text-7xl font-black leading-[0.95] mt-8">

            Let's Build
            <br />

            Something
            <span className="text-violet-400">

              {" "}Amazing

            </span>

          </h1>

          <p className="soft-text text-xl leading-relaxed mt-10">

            Whether you need manufacturing, educational programs, product design or maintenance services, INITY 3D is ready to help bring your ideas to life.

          </p>

        </div>

        {/* MAIN GRID */}

        <div className="grid lg:grid-cols-2 gap-12 mt-24">

          {/* LEFT SIDE */}

          <div className="glass-card rounded-[42px] p-10">

            <h2 className="text-4xl font-black">

              Send Us A Message

            </h2>

            <p className="soft-text mt-4 leading-relaxed">

              Tell us about your project, institution or idea and we'll get back to you soon.

            </p>

            {/* FORM */}

            <form className="mt-10 space-y-6">

              {/* NAME */}

              <div>

                <label className="block text-white/70 mb-3">

                  Full Name

                </label>

                <input
                  type="text"
                  placeholder="Your name"
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-6
                  py-5
                  outline-none
                  text-white
                  focus:border-violet-500
                  transition-all
                  "
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-white/70 mb-3">

                  Email Address

                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-6
                  py-5
                  outline-none
                  text-white
                  focus:border-violet-500
                  transition-all
                  "
                />

              </div>

              {/* COMPANY */}

              <div>

                <label className="block text-white/70 mb-3">

                  Institution / Company

                </label>

                <input
                  type="text"
                  placeholder="Optional"
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-6
                  py-5
                  outline-none
                  text-white
                  focus:border-violet-500
                  transition-all
                  "
                />

              </div>

              {/* SERVICE */}

              <div>

                <label className="block text-white/70 mb-3">

                  Service Type

                </label>

                <select
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-6
                  py-5
                  outline-none
                  text-white
                  focus:border-violet-500
                  transition-all
                  "
                >

                  <option className="bg-[#111827]">

                    3D Printing

                  </option>

                  <option className="bg-[#111827]">

                    Educational Programs

                  </option>

                  <option className="bg-[#111827]">

                    Need A Designer

                  </option>

                  <option className="bg-[#111827]">

                    Product Development

                  </option>

                  <option className="bg-[#111827]">

                    Maintenance & Repair

                  </option>

                  <option className="bg-[#111827]">

                    Other

                  </option>

                </select>

              </div>

              {/* MESSAGE */}

              <div>

                <label className="block text-white/70 mb-3">

                  Project Details

                </label>

                <textarea
                  rows="6"
                  placeholder="Tell us about your project..."
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-6
                  py-5
                  outline-none
                  text-white
                  focus:border-violet-500
                  transition-all
                  resize-none
                  "
                />

              </div>

              {/* BUTTON */}

              <button
                type="submit"
                className="
                primary-button
                w-full
                py-5
                rounded-2xl
                text-lg
                font-semibold
                "
              >

                Send Message

              </button>

            </form>

          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-8">

            {/* CONTACT INFO */}

            <div className="glass-card rounded-[42px] p-10">

              <h2 className="text-4xl font-black">

                Contact Information

              </h2>

              <div className="space-y-8 mt-10">

                <div className="flex items-center gap-5">

                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">

                    <Mail className="text-violet-400" />

                  </div>

                  <div>

                    <p className="text-white/50">

                      Email

                    </p>

                    <h3 className="text-xl font-semibold">

                      contact@inity3d.com

                    </h3>

                  </div>

                </div>

                <div className="flex items-center gap-5">

                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">

                    <Phone className="text-violet-400" />

                  </div>

                  <div>

                    <p className="text-white/50">

                      WhatsApp

                    </p>

                    <h3 className="text-xl font-semibold">

                      +506 7290-4402

                    </h3>

                  </div>

                </div>

                <div className="flex items-center gap-5">

                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">

                    <MapPin className="text-violet-400" />

                  </div>

                  <div>

                    <p className="text-white/50">

                      Location

                    </p>

                    <h3 className="text-xl font-semibold">

                      Costa Rica

                    </h3>

                  </div>

                </div>

              </div>

            </div>

            {/* SERVICES */}

            <div className="glass-card rounded-[42px] p-10">

              <h2 className="text-4xl font-black">

                What We Offer

              </h2>

              <div className="grid sm:grid-cols-2 gap-6 mt-10">

                <div className="rounded-3xl border border-white/10 p-6 bg-white/[0.03]">

                  <img src="/materials/3d-printer.png" alt="3D Printer" width={34} height={34} style={{ objectFit: "contain", filter: "invert(72%) sepia(40%) saturate(600%) hue-rotate(215deg) brightness(110%)" }} />

                  <h3 className="text-xl font-bold mt-5">

                    3D Printing

                  </h3>

                </div>

                <div className="rounded-3xl border border-white/10 p-6 bg-white/[0.03]">

                  <GraduationCap className="text-violet-400" size={34} />

                  <h3 className="text-xl font-bold mt-5">

                    Educational Programs

                  </h3>

                </div>

                <div className="rounded-3xl border border-white/10 p-6 bg-white/[0.03]">

                  <PenTool className="text-violet-400" size={34} />

                  <h3 className="text-xl font-bold mt-5">

                    Design Services

                  </h3>

                </div>

                <div className="rounded-3xl border border-white/10 p-6 bg-white/[0.03]">

                  <Wrench className="text-violet-400" size={34} />

                  <h3 className="text-xl font-bold mt-5">

                    Maintenance

                  </h3>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  );

};

export default Contact;