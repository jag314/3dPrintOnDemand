import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Math helpers ──────────────────────────────────────────────────────────────

const lerp = (a, b, t) => a + (b - a) * t;

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ── Shared materials (module-level — created once, shared across all part meshes) ─

const solidMat = new THREE.MeshStandardMaterial({
  color:       0x0d0020,
  transparent: true,
  opacity:     0.4,
  roughness:   0.1,
  metalness:   0.9,
});

const wireMat = new THREE.MeshBasicMaterial({
  color:       0x7c3aed,
  wireframe:   true,
  transparent: true,
  opacity:     0.9,
});

const edgeMat = new THREE.LineBasicMaterial({
  color:       0xa855f7,
  transparent: true,
  opacity:     1.0,
});

// ── Part definitions ──────────────────────────────────────────────────────────

const buildParts = (isMobile) => {
  const s      = isMobile ? 0.65 : 1;
  const pCount = isMobile ? 3 : 6;

  return [
    // ── Outer ring
    {
      geo:  new THREE.TorusGeometry(2 * s, 0.08 * s, 8, 64),
      aPos: new THREE.Vector3(0, 0, 0),
      aRot: new THREE.Euler(Math.PI / 2, 0, 0),
      ePos: new THREE.Vector3(0, 2.5 * s, 0),
    },

    // ── Inner gear disc
    {
      geo:  new THREE.CylinderGeometry(1.2 * s, 1.2 * s, 0.3 * s, 24),
      aPos: new THREE.Vector3(0, 0, 0),
      aRot: new THREE.Euler(0, 0, 0),
      ePos: new THREE.Vector3(0, -2 * s, 0),
    },

    // ── Central shaft
    {
      geo:  new THREE.CylinderGeometry(0.2 * s, 0.2 * s, 3 * s, 16),
      aPos: new THREE.Vector3(0, 0, 0),
      aRot: new THREE.Euler(0, 0, 0),
      ePos: new THREE.Vector3(0, 0, 2.5 * s),
    },

    // ── Planetary gears (6 on desktop, 3 on mobile)
    ...Array.from({ length: pCount }, (_, i) => {
      const a = (i / pCount) * Math.PI * 2;
      return {
        geo:  new THREE.CylinderGeometry(0.35 * s, 0.35 * s, 0.25 * s, 16),
        aPos: new THREE.Vector3(Math.cos(a) * 1.6 * s, 0, Math.sin(a) * 1.6 * s),
        aRot: new THREE.Euler(0, 0, 0),
        ePos: new THREE.Vector3(
          Math.cos(a) * 4 * s,
          (i % 2 === 0 ? 1 : -1) * 2 * s,
          Math.sin(a) * 4 * s,
        ),
      };
    }),

    // ── Top cap plate
    {
      geo:  new THREE.CylinderGeometry(1.4 * s, 1.4 * s, 0.08 * s, 32),
      aPos: new THREE.Vector3(0, 0.2 * s, 0),
      aRot: new THREE.Euler(0, 0, 0),
      ePos: new THREE.Vector3(-2.5 * s, 1.5 * s, s),
    },

    // ── Bottom cap plate
    {
      geo:  new THREE.CylinderGeometry(1.4 * s, 1.4 * s, 0.08 * s, 32),
      aPos: new THREE.Vector3(0, -0.2 * s, 0),
      aRot: new THREE.Euler(0, 0, 0),
      ePos: new THREE.Vector3(2 * s, -2 * s, -s),
    },

    // ── Outer bolts / pins (desktop only)
    ...(isMobile ? [] : Array.from({ length: 3 }, (_, i) => {
      const a = (i / 3) * Math.PI * 2;
      return {
        geo:  new THREE.CylinderGeometry(0.07, 0.07, 2.2, 8),
        aPos: new THREE.Vector3(Math.cos(a) * 1.85, 0, Math.sin(a) * 1.85),
        aRot: new THREE.Euler(0, 0, 0),
        ePos: new THREE.Vector3(Math.cos(a) * 5, 0, Math.sin(a) * 5),
      };
    })),

    // ── Decorative inner rings
    {
      geo:  new THREE.TorusGeometry(0.9 * s, 0.05 * s, 6, 48),
      aPos: new THREE.Vector3(0, 0.15 * s, 0),
      aRot: new THREE.Euler(Math.PI / 2, 0, 0),
      ePos: new THREE.Vector3(1.5 * s, 2 * s, -2 * s),
    },
    {
      geo:  new THREE.TorusGeometry(0.9 * s, 0.05 * s, 6, 48),
      aPos: new THREE.Vector3(0, -0.15 * s, 0),
      aRot: new THREE.Euler(Math.PI / 2, 0, 0),
      ePos: new THREE.Vector3(-1.5 * s, -2 * s, 2 * s),
    },
  ];
};

// ── R3F scene component (lives inside <Canvas>) ───────────────────────────────

const Assembly = ({ isMobile, hoverRef }) => {
  const groupRef  = useRef();
  const glowRef   = useRef();
  const partRefs  = useRef([]);
  const animRef   = useRef({ progress: 0, target: 0 });

  const parts    = useMemo(() => buildParts(isMobile), [isMobile]);
  const edgeGeos = useMemo(
    () => parts.map((p) => new THREE.EdgesGeometry(p.geo)),
    [parts],
  );

  // Dispose geometries when parts change (isMobile switch) or on unmount
  useEffect(() => {
    return () => {
      parts.forEach((p) => p.geo.dispose());
      edgeGeos.forEach((e) => e.dispose());
    };
  }, [parts, edgeGeos]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    const anim = animRef.current;

    // Read hover intent directly from ref — no re-renders needed
    anim.target    = hoverRef.current ? 1 : 0;

    // Delta-based lerp for frame-rate independence
    anim.progress += (anim.target - anim.progress) * Math.min(delta * 4, 0.9);

    // Idle rotation of the whole assembly
    groupRef.current.rotation.y += delta * 0.25;

    // Pulsing glow
    if (glowRef.current) {
      glowRef.current.intensity = 3 + Math.sin(clock.elapsedTime * 2) * 1.5;
    }

    // Per-part staggered animation
    parts.forEach((part, i) => {
      const ref = partRefs.current[i];
      if (!ref) return;

      const stagger = i * 0.04;
      const denom   = Math.max(0.001, 1 - stagger);
      const t       = Math.max(0, Math.min(1, (anim.progress - stagger) / denom));
      const eased   = easeInOutCubic(t);

      ref.position.set(
        lerp(part.aPos.x, part.ePos.x, eased),
        lerp(part.aPos.y, part.ePos.y, eased),
        lerp(part.aPos.z, part.ePos.z, eased),
      );

      // Individual spin while exploding (desktop only for performance)
      if (!isMobile) {
        ref.rotation.y += delta * 0.3 * (1 + anim.progress * 2);
      }
    });
  });

  const partKey = isMobile ? "m" : "d";

  return (
    <group ref={groupRef}>
      {/* Central glow light — pulses in useFrame */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 0]}
        color={0x7c3aed}
        intensity={3}
        distance={8}
      />
      <ambientLight color={0x1a0030} intensity={2} />
      <pointLight position={[4, 4, 4]}   color={0xffffff} intensity={0.4} />
      <pointLight position={[-4, -2, 2]} color={0x5b21b6} intensity={0.6} />

      {parts.map((part, i) => (
        <group
          key={`${partKey}-${i}`}
          ref={(el) => { partRefs.current[i] = el; }}
          position={[part.aPos.x, part.aPos.y, part.aPos.z]}
          rotation={[part.aRot.x, part.aRot.y, part.aRot.z]}
        >
          {/* Layer 1: solid dark base */}
          <mesh geometry={part.geo} material={solidMat} />

          {/* Layer 2: wireframe purple overlay */}
          <mesh geometry={part.geo} material={wireMat} />

          {/* Layer 3: emissive edge lines */}
          <lineSegments geometry={edgeGeos[i]} material={edgeMat} />
        </group>
      ))}
    </group>
  );
};

// ── Canvas + hover wrapper ────────────────────────────────────────────────────

const MechanicalAssemblyCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);
  const hoverRef  = useRef(false);

  useEffect(() => {
    const mq      = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      onMouseEnter={() => { hoverRef.current = true;  }}
      onMouseLeave={() => { hoverRef.current = false; }}
      style={{ width: "100%", height: "100%" }}
    >
      <Canvas
        camera={{ position: [0, 1.5, 8], fov: 42 }}
        gl={{
          antialias:         true,
          alpha:             true,
          powerPreference:   "high-performance",
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
      >
        {/* key forces full remount when isMobile switches */}
        <Assembly key={isMobile ? "m" : "d"} isMobile={isMobile} hoverRef={hoverRef} />
      </Canvas>
    </div>
  );
};

export default MechanicalAssemblyCanvas;
