import { Html, useProgress } from '@react-three/drei';

const Loader = () => {

  const { progress } = useProgress();

  return (

    <Html center>

      <div className="flex flex-col items-center">

        <div className="canvas-loader" />

        <p className="text-white mt-6 font-bold">
          {progress.toFixed(0)}%
        </p>

      </div>

    </Html>
  );
};

export default Loader;