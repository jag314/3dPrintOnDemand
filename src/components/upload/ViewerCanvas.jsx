import {
  Canvas,
} from "@react-three/fiber";

import {
  OrbitControls,
  Grid,
} from "@react-three/drei";

const ViewerCanvas = ({
  children,
}) => {

  return (

    <div className="w-full h-full">

      <Canvas
        camera={{
          position: [
            0,
            60,
            160,
          ],
          fov: 45,
        }}
      >

        {/* LIGHTS */}

        <ambientLight intensity={2} />

        <directionalLight
          position={[
            50,
            50,
            50,
          ]}
          intensity={4}
        />

        {/* GRID */}

        <Grid
          args={[
            200,
            200,
          ]}
          cellSize={10}
          sectionSize={50}
          fadeDistance={300}
        />

        {/* MODEL */}

        {children}

        {/* CONTROLS */}

        <OrbitControls
          enableZoom
          enablePan
        />

      </Canvas>

    </div>

  );

};

export default ViewerCanvas;