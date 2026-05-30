import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewcube } from "@react-three/drei";
import { useState, useEffect } from "react";

const ViewerLoader = ({ visible }) => (
  <div style={{
    position:"absolute", inset:0, zIndex:50,
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    background:"rgba(8,8,18,0.88)", backdropFilter:"blur(16px)",
    borderRadius:"inherit", pointerEvents:"none",
    opacity: visible ? 1 : 0, transition:"opacity 0.3s ease",
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

const InteractionHint = ({ visible }) => (
  <div style={{
    position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)",
    zIndex:30, display:"flex", alignItems:"center", gap:6,
    background:"rgba(8,6,20,0.78)", backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.2)",
    borderRadius:"999px", padding:"10px 20px", pointerEvents:"none",
    opacity: visible ? 1 : 0, transition:"opacity 0.5s ease",
    boxShadow:"0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
    whiteSpace:"nowrap",
  }}>
    {[
      { svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 9c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M12 3v4"/></svg>, label:"Drag to rotate" },
      { svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M9 11l3-3 3 3"/></svg>, label:"Scroll to zoom" },
      { svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 9l4-4 4 4M5 15l4 4 4-4"/><path d="M14 5l4 4-4 4M20 9H9"/></svg>, label:"Right-drag to pan" },
    ].map(({ svg, label }, i) => (
      <React.Fragment key={label}>
        {i > 0 && <span style={{ width:1, height:16, background:"rgba(255,255,255,0.1)", margin:"0 6px", flexShrink:0 }} />}
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{
            width:30, height:30, borderRadius:"50%",
            background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"rgba(167,139,250,0.9)", flexShrink:0,
          }}>{svg}</span>
          <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.65)", fontFamily:"Inter, sans-serif", letterSpacing:"0.01em" }}>{label}</span>
        </div>
      </React.Fragment>
    ))}
  </div>
);

const ViewerCanvas = ({ children, loading, hasFile, glowMode, glowColor }) => {
  const [hintVisible, setHintVisible] = useState(false);
  const [cursor, setCursor] = useState("default");

  useEffect(() => { setHintVisible(hasFile); }, [hasFile]);

  return (
    <div
      className="w-full h-full"
      style={{
        position:"relative", cursor,
        transition:"box-shadow 0.5s ease",
        background: glowMode
          ? "#000000"
          : "radial-gradient(ellipse at 40% 40%, #3a4a7a 0%, #252f5a 50%, #1a2040 100%)",
        boxShadow: glowMode && glowColor ? `0 0 60px 8px ${glowColor}55, inset 0 0 40px 4px ${glowColor}22` : "none",
      }}
      onMouseEnter={() => { if (hasFile) setCursor("grab"); }}
      onMouseLeave={() => setCursor("default")}
      onMouseDown={() => { if (hasFile) setCursor("grabbing"); }}
      onMouseUp={() => { if (hasFile) setCursor("grab"); }}
    >
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      {loading && <ViewerLoader visible={true} />}
      <InteractionHint visible={hasFile && hintVisible} />
      <Canvas
        shadows
        camera={{ position:[0,80,200], fov:42, near:0.1, far:10000 }}
        gl={{ antialias:true, alpha:true, powerPreference:"high-performance" }}
        style={{ cursor:"inherit" }}
      >
        <color attach="background" args={["#1e2235"]} />
        <ambientLight intensity={glowMode ? 0.06 : 0.5} />
        {!glowMode && (
          <>
            {/* Key light — top-front-right, main shadow caster */}
            <directionalLight
              position={[120, 200, 80]}
              intensity={1.8}
              castShadow
              shadow-mapSize={[4096, 4096]}
              shadow-camera-near={0.1}
              shadow-camera-far={2000}
              shadow-camera-left={-500}
              shadow-camera-right={500}
              shadow-camera-top={500}
              shadow-camera-bottom={-500}
            />
            {/* Fill light — soft blue-white from opposite side, no pure-black shadows */}
            <directionalLight position={[-100, 80, -60]} intensity={0.45} color="#d0d8ff" />
            {/* Rim light — behind model, sharpens silhouette edges */}
            <directionalLight position={[0, -50, -200]} intensity={0.3} color="#ffffff" />
            {/* Dark-model rim — cool backlight that outlines black/dark objects */}
            <directionalLight position={[-50, 100, -150]} intensity={0.7} color="#4060ff" />
          </>
        )}

        {children}
        {hasFile && (
          <GizmoHelper alignment="bottom-left" margin={[72,72]}>
            <GizmoViewcube
              opacity={1}
              faces={["Right","Left","Top","Bottom","Front","Back"]}
              color="#1c1838" strokeColor="#9d8fe0" textColor="#ffffff"
              hoverColor="#312870" font="700 13px Inter, sans-serif"
            />
          </GizmoHelper>
        )}
        <OrbitControls makeDefault enableZoom enablePan minDistance={10} maxDistance={3000} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
    </div>
  );
};

export default ViewerCanvas;