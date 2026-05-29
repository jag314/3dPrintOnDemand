import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, GizmoHelper, GizmoViewcube } from "@react-three/drei";
import { useState, useEffect } from "react";

// =========================
// LOADER OVERLAY
// =========================

const ViewerLoader = ({ visible }) => (
  <div style={{
    position:"absolute", inset:0, zIndex:50,
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    background:"rgba(8,8,18,0.88)", backdropFilter:"blur(16px)",
    borderRadius:"inherit", pointerEvents:"none",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.3s ease",
  }}>
    <div style={{ position:"relative", width:60, height:60 }}>
      <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid rgba(139,92,246,0.12)" }} />
      <div style={{
        position:"absolute", inset:0, borderRadius:"50%",
        border:"2px solid transparent",
        borderTopColor:"#8b5cf6", borderRightColor:"#a78bfa",
        animation:"spin 0.9s linear infinite",
      }} />
      <div style={{
        position:"absolute", inset:"20px", borderRadius:"50%",
        background:"radial-gradient(circle, #7c3aed, #4c1d95)",
        boxShadow:"0 0 20px rgba(139,92,246,0.7)",
      }} />
    </div>
    <p style={{ marginTop:20, fontSize:12, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(167,139,250,0.85)", fontFamily:"Inter, sans-serif" }}>
      Analyzing Model
    </p>
    <p style={{ marginTop:5, fontSize:10, color:"rgba(255,255,255,0.22)", fontFamily:"Inter, sans-serif" }}>
      Calculating geometry &amp; weight
    </p>
  </div>
);

// =========================
// INTERACTION HINT
// Fades in when model loads, fades out after 3.5s
// =========================

const InteractionHint = ({ visible }) => (
  <div style={{
    position:"absolute",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(8,6,20,0.78)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: "999px",
    padding: "10px 20px",
    pointerEvents: "none",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.5s ease",
    boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
    whiteSpace: "nowrap",
  }}>
    {[
      { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 9c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M12 3v4"/></svg>, label: "Drag to rotate" },
      { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M9 11l3-3 3 3"/></svg>, label: "Scroll to zoom" },
      { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 9l4-4 4 4M5 15l4 4 4-4"/><path d="M14 5l4 4-4 4M20 9H9"/></svg>, label: "Right-drag to pan" },
    ].map(({ svg, label }, i) => (
      <React.Fragment key={label}>
        {i > 0 && <span style={{ width:1, height:16, background:"rgba(255,255,255,0.1)", margin:"0 6px", flexShrink:0 }} />}
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{
            width:30, height:30, borderRadius:"50%",
            background:"rgba(139,92,246,0.15)",
            border:"1px solid rgba(139,92,246,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"rgba(167,139,250,0.9)", flexShrink:0,
          }}>{svg}</span>
          <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.65)", fontFamily:"Inter, sans-serif", letterSpacing:"0.01em" }}>
            {label}
          </span>
        </div>
      </React.Fragment>
    ))}
  </div>
);

// =========================
// VIEWER CANVAS
// =========================

const ViewerCanvas = ({ children, loading, hasFile }) => {
  const [hintVisible, setHintVisible]   = useState(false);
  const [cursor, setCursor]             = useState("default");

  // Show hints whenever a model is loaded
  useEffect(() => {
    setHintVisible(hasFile);
  }, [hasFile]);

  return (
    <div
      className="w-full h-full"
      style={{
        position: "relative",
        cursor: cursor,
      }}
      // Open hand on hover over canvas
      onMouseEnter={() => { if (hasFile) setCursor("grab"); }}
      onMouseLeave={() => setCursor("default")}
      // Closed hand while dragging
      onMouseDown={() => { if (hasFile) setCursor("grabbing"); }}
      onMouseUp={() => { if (hasFile) setCursor("grab"); }}
    >
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {loading && <ViewerLoader visible={true} />}

      {/* Interaction hint — shown briefly after model loads */}
      <InteractionHint visible={hasFile && hintVisible} />

      <Canvas
        shadows
        camera={{ position:[0, 80, 200], fov:42, near:0.1, far:10000 }}
        gl={{ antialias:true }}
        // Prevent canvas from overriding our custom cursor
        style={{ cursor:"inherit" }}
      >
        <color attach="background" args={["#080a12"]} />

        <ambientLight intensity={1.1} />
        <directionalLight position={[100,200,100]} intensity={2.5} castShadow shadow-mapSize={[2048,2048]} />
        <directionalLight position={[-80,100,-60]} intensity={0.8} color="#c0d0ff" />
        <pointLight position={[0,200,-200]} color="#7c3aed" intensity={1.2} distance={1200} />

        <Environment preset="studio" />

        <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={300} blur={1.8} far={8} color="#3b1f7a" />

        {children}

        {hasFile && (
          <GizmoHelper alignment="bottom-left" margin={[72, 72]}>
            <GizmoViewcube
              opacity={1}
              faces={["Right","Left","Top","Bottom","Front","Back"]}
              color="#1c1838"
              strokeColor="#9d8fe0"
              textColor="#ffffff"
              hoverColor="#312870"
              font="700 13px Inter, sans-serif"
            />
          </GizmoHelper>
        )}

        <OrbitControls
          makeDefault enableZoom enablePan
          minDistance={10} maxDistance={3000}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
};

export default ViewerCanvas;