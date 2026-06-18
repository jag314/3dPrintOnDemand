import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import CanvasLoader from "../Loader";

// Preload all models
useGLTF.preload("./robot/helmet.glb");
useGLTF.preload("./robot/gear_box.glb");
useGLTF.preload("./robot/porshe_911.glb");

// Config per model — tweak scale and position for each
const MODELS = [
  {
    path: "./robot/helmet.glb",
    label: "Casco Táctico",
    scaleFactor: 3.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  {
    path: "./robot/gear_box.glb",
    label: "Caja de Engranajes",
    scaleFactor: 3.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  {
    path: "./robot/porshe_911.glb",
    label: "Coleccionables",
    scaleFactor: 3.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
];

// Individual model component — auto-normalizes size
const Model = ({ config, isHovering }) => {
  const { scene } = useGLTF(config.path);
  const groupRef = useRef();
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState([0, 0, 0]);
  const hoverScale = useRef(1);

  useEffect(() => {
    if (!scene) return;

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    setOffset([-center.x, -center.y, -center.z]);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      setScale(config.scaleFactor / maxDim);
    }

    console.log(`[${config.label}] size:`, size, "scale:", config.scaleFactor / maxDim);
  }, [scene]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (isHovering ? 0.05 : 0.12);

      if (isHovering) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
      } else {
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          0,
          0.05
        );
      }

      hoverScale.current = THREE.MathUtils.lerp(
        hoverScale.current,
        isHovering ? 1.12 : 1.0,
        0.06
      );
      groupRef.current.scale.setScalar(scale * hoverScale.current);
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <primitive object={scene} position={offset} />
    </group>
  );
};

// Main scene
const CarouselScene = ({ currentIndex, isHovering }) => {
  return (
    <>
      <ambientLight intensity={0.4} color="#1a0a2e" />
      <hemisphereLight skyColor="#ffffff" groundColor="#0a0612" intensity={0.5} />
      <directionalLight position={[-4, 6, 4]} intensity={3} color="#ffffff" castShadow shadow-mapSize={2048} />
      <directionalLight position={[6, 2, -2]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[0, -2, -6]} intensity={0.6} color="#c4b5fd" />
      <pointLight position={[0, -1, 3]} intensity={2} color="#f59e0b" distance={8} />

      {MODELS.map((config, i) =>
        i === currentIndex ? (
          <Model key={config.path} config={config} isHovering={isHovering} />
        ) : null
      )}
    </>
  );
};

// Canvas wrapper with carousel controls
const ModelCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isHovering) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MODELS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovering]);

  const prev = () => setCurrentIndex((i) => (i - 1 + MODELS.length) % MODELS.length);
  const next = () => setCurrentIndex((i) => (i + 1) % MODELS.length);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: isHovering ? "grab" : "default",
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* HOVER GLOW */}
      <div style={{
        position: "absolute",
        inset: 0,
        transition: "background 0.4s ease",
        background: isHovering
          ? "radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)"
          : "transparent",
        pointerEvents: "none",
        zIndex: 1,
      }} />

      <Canvas
        frameloop="always"
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.2, 6], fov: 42 }}
        style={{ background: "transparent" }}
        gl={{
          preserveDrawingBuffer: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("WebGL context lost, will restore...");
          });
          gl.domElement.addEventListener("webglcontextrestored", () => {
            console.log("WebGL context restored");
          });
        }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 3}
          />
          <CarouselScene currentIndex={currentIndex} isHovering={isHovering} />
        </Suspense>
        <Preload all />
      </Canvas>

      {/* MODEL LABEL */}
      <div style={{
        position: "absolute",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "#a78bfa",
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        letterSpacing: "3px",
        opacity: 0.7,
        zIndex: 10,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}>
        {MODELS[currentIndex].label}
      </div>

      {/* PREV ARROW */}
      <button
        onClick={prev}
        style={{
          position: "absolute", left: "8px", top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(124,58,237,0.2)",
          border: "1px solid rgba(167,139,250,0.3)",
          color: "#a78bfa", borderRadius: "50%",
          width: "36px", height: "36px",
          cursor: "pointer", fontSize: "16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10,
        }}
      >‹</button>

      {/* NEXT ARROW */}
      <button
        onClick={next}
        style={{
          position: "absolute", right: "8px", top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(124,58,237,0.2)",
          border: "1px solid rgba(167,139,250,0.3)",
          color: "#a78bfa", borderRadius: "50%",
          width: "36px", height: "36px",
          cursor: "pointer", fontSize: "16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10,
        }}
      >›</button>

      {/* DOT INDICATORS */}
      <div style={{
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "8px",
        zIndex: 10,
      }}>
        {MODELS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            style={{
              width: i === currentIndex ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === currentIndex ? "#a78bfa" : "#4c1d95",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ModelCarousel;
