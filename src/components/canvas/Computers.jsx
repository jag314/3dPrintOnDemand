import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

import CanvasLoader from "../Loader";

const Computers = ({ isMobile }) => {
  const computer = useGLTF("./robot/robot.gltf");

  const handlePointerOver = () => {
    document.body.style.cursor = "pointer"; // Change cursor to a hand
  };

  const handlePointerOut = () => {
    document.body.style.cursor = ""; // Revert cursor to default
  };

  return (
    <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <hemisphereLight intensity={1.3} groundColor="black" />
      <spotLight
        position={[-10, 25, 5]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <primitive
        object={computer.scene}
        scale={isMobile ? 5 : 15}
        position={isMobile ? [0, -3, -2] : [0, -5, -0.2]}
        rotation={[-Math.PI / 2, 0, 1.6]} // Rotación ajustada para la posición vertical
      />
    </mesh>
  );
};

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Add a listener for changes to the screen size
    const mediaQuery = window.matchMedia("(max-width: 500px)");

    // Set the initial value of the `isMobile` state variable
    setIsMobile(mediaQuery.matches);

    // Define a callback function to handle changes to the media query
    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Remove the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, 2]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Computers isMobile={isMobile} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default ComputersCanvas;
