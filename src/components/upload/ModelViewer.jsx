import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

// =========================
// VOLUME — signed tetrahedron method
// =========================

const calcVolume = (geo) => {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position;
  let v = 0;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);
    b.fromBufferAttribute(p, i + 1);
    c.fromBufferAttribute(p, i + 2);
    v += a.dot(b.clone().cross(c)) / 6;
  }
  return Math.abs(v);
};

// =========================
// UNIT DETECTION
// =========================

const detectScale = (sz) => {
  const m = Math.max(sz.x, sz.y, sz.z);
  if (m < 0.1) return 1000; // meters → mm
  if (m < 2)   return 10;   // cm → mm
  return 1;                   // already mm
};

// =========================
// CAMERA FIT
// =========================

const CameraFit = ({ size }) => {
  const { camera, controls } = useThree();
  useEffect(() => {
    if (!size) return;
    const max = Math.max(size.x, size.y, size.z);
    const dist = max * 2.6;
    camera.position.set(dist * 0.7, dist * 0.55, dist);
    camera.near = max * 0.001;
    camera.far  = max * 300;
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.set(0, size.y / 2, 0);
      controls.minDistance = max * 0.3;
      controls.maxDistance = max * 25;
      controls.update();
    }
  }, [size, camera, controls]);
  return null;
};

// =========================
// DIMENSION LINES
// Cura convention: X=width, Y=depth, Z=height
// Model sits: Y=0 (bottom) to Y=size.y (top)
//             X=-size.x/2 to X=+size.x/2
//             Z=-size.z/2 to Z=+size.z/2
// =========================

const DimensionLines = ({ size }) => {
  if (!size) return null;

  const W  = size.x;  // display X
  const H  = size.y;  // display Z (height in Three.js Y)
  const D  = size.z;  // display Y (depth in Three.js Z)
  const hw = W / 2;
  const hd = D / 2;
  const max = Math.max(W, H, D);
  const L   = max * 0.52;
  const T   = max * 0.026;

  const mat = new THREE.LineBasicMaterial({ color:"#c4b5fd", transparent:true, opacity:0.85 });

  const seg = (x1,y1,z1, x2,y2,z2, key) => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1,y1,z1),
      new THREE.Vector3(x2,y2,z2),
    ]);
    return <primitive key={key} object={new THREE.Line(geo, mat)} />;
  };

  const pill = {
    background:"rgba(8,6,22,0.93)", backdropFilter:"blur(14px)",
    border:"1px solid rgba(167,139,250,0.65)", borderRadius:"999px",
    padding:"3px 11px 3px 8px", color:"#ede9fe",
    fontSize:"11.5px", fontWeight:"700", fontFamily:"Inter, sans-serif",
    whiteSpace:"nowrap", pointerEvents:"none", userSelect:"none",
    display:"flex", alignItems:"center", gap:"5px",
    boxShadow:"0 2px 14px rgba(139,92,246,0.3)",
  };
  const dot = (c) => ({ width:"7px", height:"7px", borderRadius:"50%", background:c, flexShrink:0 });

  // X (width) — span along bottom-front edge, leader goes down-forward
  const xExtY = -L * 0.15;
  const xE = [0, xExtY - L*0.32, hd + L*0.42];

  // Z (height) — span along right-front edge, leader goes right-forward
  const zExtX = hw + L * 0.16;
  const zE = [zExtX + L*0.35, H/2, hd + L*0.30];

  // Y (depth) — span along right-bottom edge, leader goes right-down
  const yExtX = hw + L * 0.16;
  const yE = [yExtX + L*0.35, -L*0.25, 0];

  return (
    <group>
      {/* X */}
      {seg(-hw, 0, hd,  -hw, xExtY, hd, "xe1")}
      {seg( hw, 0, hd,   hw, xExtY, hd, "xe2")}
      {seg(-hw, xExtY, hd,  hw, xExtY, hd, "xs")}
      {seg(-hw, xExtY-T, hd, -hw, xExtY+T, hd, "xt1")}
      {seg( hw, xExtY-T, hd,  hw, xExtY+T, hd, "xt2")}
      {seg(0, xExtY, hd,  ...xE, "xl")}
      <Html position={xE} center zIndexRange={[20,0]} occlude={false}>
        <div style={pill}><span style={dot("#a78bfa")} />X &nbsp;{W.toFixed(2)} mm</div>
      </Html>

      {/* Z (height) */}
      {seg(hw, 0, hd,  zExtX, 0, hd, "ze1")}
      {seg(hw, H, hd,  zExtX, H, hd, "ze2")}
      {seg(zExtX, 0, hd,  zExtX, H, hd, "zs")}
      {seg(zExtX-T, 0, hd,  zExtX+T, 0, hd, "zt1")}
      {seg(zExtX-T, H, hd,  zExtX+T, H, hd, "zt2")}
      {seg(zExtX, H/2, hd,  ...zE, "zl")}
      <Html position={zE} center zIndexRange={[20,0]} occlude={false}>
        <div style={pill}><span style={dot("#34d399")} />Z &nbsp;{H.toFixed(2)} mm</div>
      </Html>

      {/* Y (depth) */}
      {seg(hw, 0,  hd,  yExtX, 0,  hd, "ye1")}
      {seg(hw, 0, -hd,  yExtX, 0, -hd, "ye2")}
      {seg(yExtX, 0, -hd,  yExtX, 0, hd, "ys")}
      {seg(yExtX-T, 0,  hd,  yExtX+T, 0,  hd, "yt1")}
      {seg(yExtX-T, 0, -hd,  yExtX+T, 0, -hd, "yt2")}
      {seg(yExtX, 0, 0,  ...yE, "yl")}
      <Html position={yE} center zIndexRange={[20,0]} occlude={false}>
        <div style={pill}><span style={dot("#60a5fa")} />Y &nbsp;{D.toFixed(2)} mm</div>
      </Html>
    </group>
  );
};

// =========================
// SHARED: process a geometry to mm, centered, Y-up
// Returns { sz, volumeMM3 }
// =========================

const prepareGeometry = (geo) => {
  // Center geometry
  geo.center();
  geo.computeBoundingBox();

  // Detect and apply scale
  const raw = new THREE.Vector3();
  geo.boundingBox.getSize(raw);
  const scale = detectScale(raw);
  if (scale !== 1) {
    geo.scale(scale, scale, scale);
    geo.computeBoundingBox();
  }

  // Apply Z-up → Y-up (Onshape/CAD → Three.js)
  geo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  geo.computeBoundingBox();

  const sz = new THREE.Vector3();
  geo.boundingBox.getSize(sz);

  const volumeMM3 = calcVolume(geo);

  return { sz, volumeMM3 };
};

// =========================
// MAIN COMPONENT
// =========================

const ModelViewer = ({
  file, selectedColor, setModelStats,
  selectedMaterial, materials, onModelSizeChange, onLoadingChange,
}) => {

  const [model, setModel]         = useState(null);
  const [modelSize, setModelSize] = useState(null);
  const prevUrlRef                = useRef(null);

  // Color update
  useEffect(() => {
    if (!model || !selectedColor) return;
    const color = selectedColor.hex;
    model.traverse?.((child) => {
      if (child.isMesh && child.material) child.material.color.set(color);
    });
    if (model.isMesh) model.material?.color?.set(color);
  }, [selectedColor, model]);

  useEffect(() => {
    if (!file) return;
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);

    const ext      = file.name.split(".").pop().toLowerCase();
    const url      = URL.createObjectURL(file);
    prevUrlRef.current = url;

    const density  = materials?.[selectedMaterial]?.density || 1.24;
    const colorHex = selectedColor?.hex || "#8b5cf6";

    onLoadingChange?.(true);
    setModel(null);
    setModelSize(null);

    // Shared finish — sets model sitting on Y=0
    const finish = (mesh, sz, volumeMM3, complexity) => {
      // Sit model on the ground plane (Y=0)
      mesh.position.y = sz.y / 2;
      mesh.castShadow = true;

      const weight = ((volumeMM3 / 1000) * density).toFixed(1);

      setModel(mesh);
      setModelSize(sz);
      onModelSizeChange?.(sz);
      onLoadingChange?.(false);

      // Cura convention displayed: X=width, Y=depth, Z=height
      setModelStats({
        fileName:      file.name,
        dimensions:    `${sz.x.toFixed(1)} × ${sz.z.toFixed(1)} × ${sz.y.toFixed(1)} mm`,
        materialUsage: weight,
        complexity,
      });
    };

    // ==========  STL  ==========
    if (ext === "stl") {
      new STLLoader().load(url, (geo) => {
        geo.computeVertexNormals();
        const { sz, volumeMM3 } = prepareGeometry(geo);

        const mesh = new THREE.Mesh(
          geo,
          new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.08, roughness: 0.42 })
        );

        const complexity =
          geo.attributes.position.count > 200000 ? "High" :
          geo.attributes.position.count > 80000  ? "Medium" : "Low";

        finish(mesh, sz, volumeMM3, complexity);
      });
    }

    // ==========  OBJ  ==========
    if (ext === "obj") {
      new OBJLoader().load(url, (obj) => {

        // Step 1: Apply Z-up → Y-up rotation to EACH child geometry
        // (rotate geometry, not the object, so relative positions are preserved)
        const rotMat = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
        obj.traverse((child) => {
          if (child.isMesh) {
            child.geometry.applyMatrix4(rotMat);
            child.geometry.computeVertexNormals();
          }
        });

        // Step 2: Get raw bounding box to detect units
        const rawBox = new THREE.Box3().setFromObject(obj);
        const rawSz  = new THREE.Vector3();
        rawBox.getSize(rawSz);
        const scale = detectScale(rawSz);

        // Step 3: Apply unit scale if needed
        if (scale !== 1) {
          obj.traverse((child) => {
            if (child.isMesh) child.geometry.scale(scale, scale, scale);
          });
        }

        // Step 4: Calculate volume using MERGED geometry to avoid double-counting
        // OBJ files often have overlapping faces between parts
        let totalTris = 0;
        const allPositions = [];

        obj.traverse((child) => {
          if (child.isMesh) {
            const geo = child.geometry.index
              ? child.geometry.toNonIndexed()
              : child.geometry;
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
              allPositions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
            }
            totalTris += pos.count;
            child.material = new THREE.MeshStandardMaterial({
              color: colorHex, metalness: 0.08, roughness: 0.42,
            });
            child.castShadow = true;
          }
        });

        // Compute volume on merged geometry (same as STL pipeline)
        const mergedGeo = new THREE.BufferGeometry();
        mergedGeo.setAttribute("position", new THREE.Float32BufferAttribute(allPositions, 3));
        const totalVol = calcVolume(mergedGeo);

        // Step 5: Center the whole group, sit on Y=0
        const finalBox = new THREE.Box3().setFromObject(obj);
        const sz  = finalBox.getSize(new THREE.Vector3());
        const ctr = finalBox.getCenter(new THREE.Vector3());
        obj.position.set(-ctr.x, -finalBox.min.y, -ctr.z);

        const weight     = ((totalVol / 1000) * density).toFixed(1);
        const complexity = totalTris > 200000 ? "High" : totalTris > 80000 ? "Medium" : "Low";

        setModel(obj);
        setModelSize(sz);
        onModelSizeChange?.(sz);
        onLoadingChange?.(false);

        setModelStats({
          fileName:      file.name,
          dimensions:    `${sz.x.toFixed(1)} × ${sz.z.toFixed(1)} × ${sz.y.toFixed(1)} mm`,
          materialUsage: weight,
          complexity,
        });
      });
    }

    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, selectedMaterial, materials]);

  if (!model) return null;

  return (
    <>
      <CameraFit size={modelSize} />
      <primitive object={model} />
      {modelSize && <DimensionLines size={modelSize} />}
    </>
  );
};

export default ModelViewer;