import {
  Canvas,
} from "@react-three/fiber";

import {
  OrbitControls,
  Grid,
  Environment,
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
            120,
            260,
          ],

          fov: 45,

          near: 0.01,

          far: 10000,

        }}

      >

        {/* BACKGROUND */}

        <color
          attach="background"
          args={[
            "#050816",
          ]}
        />

        {/* LIGHTS */}

        <ambientLight
          intensity={1.8}
        />

        <directionalLight
          position={[
            120,
            120,
            120,
          ]}
          intensity={4}
        />

        <directionalLight
          position={[
            -120,
            80,
            -120,
          ]}
          intensity={2}
        />

        {/* ENVIRONMENT */}

        <Environment
          preset="city"
        />

        {/* GRID */}

        <Grid

          args={[
            500,
            500,
          ]}

          cellSize={10}

          sectionSize={50}

          fadeDistance={1000}

          fadeStrength={1}

          infiniteGrid

        />

        {/* MODEL */}

        {children}

        {/* CONTROLS */}

        <OrbitControls

          makeDefault

          enableZoom

          enablePan

          minDistance={20}

          maxDistance={2000}

        />

      </Canvas>

    </div>

  );

};

export default ViewerCanvas;