import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import ViewerLoader from "./ViewerLoader";
import {
  OrbitControls,
  Environment,
} from "@react-three/drei";

import ModelViewer from "./ModelViewer";

const ViewerCanvas = ({
  file,
  setModelStats,
  selectedMaterial,
}) => {

 return (

  <Canvas
    camera={{
      position: [0, 0, 120],
      fov: 35,
    }}
  >

    <color
      attach="background"
      args={["#050816"]}
    />

    {/* LIGHTS */}

    <ambientLight intensity={1.8} />

    <directionalLight
      position={[10, 10, 5]}
      intensity={2}
    />

    <Environment preset="city" />

    {/* CONTROLS */}

    <OrbitControls
      enablePan
      enableZoom
      enableRotate
    />

    {/* MODEL */}

    <Suspense fallback={<ViewerLoader />}>

      {file && (

        <ModelViewer
          file={file}
          setModelStats={setModelStats}
          selectedMaterial={selectedMaterial}
        />

      )}

    </Suspense>

  </Canvas>

);
};

export default ViewerCanvas;