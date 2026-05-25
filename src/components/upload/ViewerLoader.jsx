import { Html } from "@react-three/drei";

const ViewerLoader = () => {

  return (

    <Html center>

      <div className="flex flex-col items-center justify-center">

        {/* SPINNER */}

        <div className="relative w-20 h-20">

          {/* OUTER RING */}

          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />

          {/* SPIN */}

          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-violet-400 border-b-transparent border-l-transparent animate-spin" />

          {/* GLOW */}

          <div className="absolute inset-2 rounded-full bg-violet-500/20 blur-xl" />

        </div>

        {/* TEXT */}

        <div className="mt-6 text-center">

          <h3 className="text-white font-bold text-xl whitespace-nowrap">

            Analyzing 3D Model

          </h3>

          <p className="text-white/50 mt-2 whitespace-nowrap">

            Preparing preview...

          </p>

        </div>

      </div>

    </Html>

  );

};

export default ViewerLoader;