import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import CanvasLoader from "../Loader";

const Helmet = ({ isMobile }) => {
  const { scene } = useGLTF("./robot/helmet.glb");
  const meshRef = useRef();

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      scene.position.set(-center.x, -center.y, -center.z);
    }
  }, [scene]);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  // Auto-normalize scale so the model always fits in view
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const normalizedScale = maxDim > 0 ? (isMobile ? 1.8 : 3.0) / maxDim : 1;

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Key light — white, upper-left */}
      <directionalLight position={[-4, 6, 4]} intensity={3} color="#ffffff" />
      {/* Fill light — neutral white, right side */}
      <directionalLight position={[6, 2, -2]} intensity={0.6} color="#ffffff" />
      {/* Rim light — subtle purple, behind-below */}
      <directionalLight position={[0, -2, -6]} intensity={0.6} color="#c4b5fd" />
      {/* Gold visor glow — point light up close */}
      <pointLight position={[0, -1, 3]} intensity={2} color="#f59e0b" distance={8} />
      {/* Ambient — very dark purple base */}
      <ambientLight intensity={0.3} color="#1a0a2e" />
      {/* Sky/ground hemisphere — white sky to preserve silver/grey tones */}
      <hemisphereLight skyColor="#ffffff" groundColor="#0a0612" intensity={0.4} />
      <primitive object={scene} scale={normalizedScale} />
    </group>
  );
};

const HelmetCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 500px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <Canvas
      frameloop="always"
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.2, 6], fov: 42 }}
      gl={{
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.4,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
        <Helmet isMobile={isMobile} />
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default HelmetCanvas;
