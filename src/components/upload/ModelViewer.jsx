import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

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

const calcArea = (geo) => {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position;
  let area = 0;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);
    b.fromBufferAttribute(p, i + 1);
    c.fromBufferAttribute(p, i + 2);
    area += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2;
  }
  return area;
};

const detectScale = (sz) => {
  const m = Math.max(sz.x, sz.y, sz.z);
  if (m < 1)  return 1000;
  if (m < 25) return 10;
  return 1;
};

// ── Support detection (mini-slicing) ─────────────────────────────────────────
// Divides the model into 40 horizontal bands along Y (Y-up after prepareGeometry).
// Each band is rasterized onto a 2D XZ grid at 1mm resolution.
// A cell in band_i is "unsupported" if no cell within 10mm in band_(i-1) is occupied.
// Bands 0 and 1 are unconditionally supported (build plate + first-layer growth).
// Metric: 0.7 × max-band-unsupported% + 0.3 × global-avg-unsupported%
// Thresholds: <5 → none | 5–25 → light | 25–55 → moderate | ≥55 → heavy
// Validated on 3DBenchy (→ none, 0.7%) and Goku arm (→ moderate, 42.8%).

const _sliceDilate = (src, cols, rows, k) => {
  const dst = new Uint8Array(cols * rows);
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (!src[gy * cols + gx]) continue;
      const x0 = Math.max(0, gx - k), x1 = Math.min(cols - 1, gx + k);
      const y0 = Math.max(0, gy - k), y1 = Math.min(rows - 1, gy + k);
      for (let y = y0; y <= y1; y++) {
        const row = y * cols;
        for (let x = x0; x <= x1; x++) dst[row + x] = 1;
      }
    }
  }
  return dst;
};

const analyzeSupportNeeds = (geometry) => {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry;
  const arr = geo.attributes.position.array; // Float32Array [x,y,z per vertex]
  const count = arr.length / 3;

  if (count < 3) {
    return { supportLevel: "none", needsSupports: false, overhangRatio: 0, supportWeightedPct: 0 };
  }

  // Bounding box (Y = height in Three.js Y-up space)
  let xMin=Infinity, xMax=-Infinity, yMin=Infinity, yMax=-Infinity, zMin=Infinity, zMax=-Infinity;
  for (let i = 0; i < count; i++) {
    const x=arr[i*3], y=arr[i*3+1], z=arr[i*3+2];
    if (x<xMin) xMin=x; if (x>xMax) xMax=x;
    if (y<yMin) yMin=y; if (y>yMax) yMax=y;
    if (z<zMin) zMin=z; if (z>zMax) zMax=z;
  }

  // Adaptive cell size: cap grid to 500 cells per axis so large models stay fast
  const maxXZ  = Math.max(xMax - xMin, zMax - zMin);
  const CELL   = maxXZ > 500 ? Math.ceil(maxXZ / 500) : 1.0;
  const BRIDGE_K = Math.ceil(10 / CELL); // 10mm bridging tolerance in cells

  const N_BANDS = 40;
  const bandH   = (yMax - yMin) / N_BANDS;
  const cols    = Math.ceil((xMax - xMin) / CELL) + 2;
  const rows    = Math.ceil((zMax - zMin) / CELL) + 2;
  const gSize   = cols * rows;

  let totalOcc = 0, totalUnsp = 0, maxBandPct = 0;
  let prevBand = null;

  for (let b = 0; b < N_BANDS; b++) {
    const yLo = yMin + b * bandH;
    const yHi = yLo + bandH;
    const curr = new Uint8Array(gSize);

    // Rasterize triangles into this band (15 barycentric samples, triangular grid n=4)
    for (let i = 0; i < count; i += 3) {
      const y0=arr[i*3+1], y1=arr[(i+1)*3+1], y2=arr[(i+2)*3+1];
      if (Math.min(y0,y1,y2) > yHi || Math.max(y0,y1,y2) < yLo) continue;

      const x0=arr[i*3],   x1=arr[(i+1)*3],   x2=arr[(i+2)*3];
      const z0=arr[i*3+2], z1=arr[(i+1)*3+2], z2=arr[(i+2)*3+2];

      for (let si = 0; si <= 4; si++) {
        const u = si / 4;
        for (let sj = 0; sj <= 4 - si; sj++) {
          const v = sj / 4, w = 1 - u - v;
          const py = u*y0 + v*y1 + w*y2;
          if (py < yLo || py > yHi) continue;
          const gx = Math.floor((u*x0 + v*x1 + w*x2 - xMin) / CELL);
          const gz = Math.floor((u*z0 + v*z1 + w*z2 - zMin) / CELL);
          if (gx >= 0 && gx < cols && gz >= 0 && gz < rows) curr[gz * cols + gx] = 1;
        }
      }
    }

    const occ = curr.reduce((s, v) => s + v, 0);
    totalOcc += occ;

    // Bands 0 and 1: unconditionally supported by build plate.
    // Band 1 is skipped to avoid false positives from geometry growing outward
    // from the base (e.g. leg cross-section widening from narrow feet).
    if (b <= 1) { prevBand = curr; continue; }

    const dilated = _sliceDilate(prevBand, cols, rows, BRIDGE_K);
    let unsp = 0;
    for (let i = 0; i < gSize; i++) { if (curr[i] && !dilated[i]) unsp++; }
    totalUnsp += unsp;

    const bandPct = occ > 0 ? unsp / occ * 100 : 0;
    if (bandPct > maxBandPct) maxBandPct = bandPct;
    prevBand = curr;
  }

  const globalAvg = totalOcc > 0 ? totalUnsp / totalOcc * 100 : 0;
  const weighted  = 0.7 * maxBandPct + 0.3 * globalAvg;

  let supportLevel;
  if      (weighted < 5)  supportLevel = "none";
  else if (weighted < 25) supportLevel = "light";
  else if (weighted < 55) supportLevel = "moderate";
  else                    supportLevel = "heavy";

  return {
    supportLevel,
    needsSupports:        supportLevel !== "none",
    overhangRatio:        globalAvg / 100,
    supportWeightedPct:   weighted,
  };
};

// ── Camera / dimension helpers ───────────────────────────────────────────────

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

const DimensionLines = ({ size }) => {
  if (!size) return null;
  const W = size.x, H = size.y, D = size.z;
  const hw = W / 2, hd = D / 2;
  const max = Math.max(W, H, D);
  const L = max * 0.52, T = max * 0.026;
  const mat = new THREE.LineBasicMaterial({ color:"#ffffff", transparent:true, opacity:0.35 });
  const seg = (x1,y1,z1,x2,y2,z2,key) => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1,y1,z1), new THREE.Vector3(x2,y2,z2)]);
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
  const xExtY = -L * 0.15;
  const xE = [0, xExtY - L*0.32, hd + L*0.42];
  const zExtX = hw + L * 0.16;
  const zE = [zExtX + L*0.35, H/2, hd + L*0.30];
  const yExtX = hw + L * 0.16;
  const yE = [yExtX + L*0.35, -L*0.25, 0];
  return (
    <group>
      {seg(-hw,0,hd, -hw,xExtY,hd, "xe1")}{seg(hw,0,hd, hw,xExtY,hd, "xe2")}
      {seg(-hw,xExtY,hd, hw,xExtY,hd, "xs")}
      {seg(-hw,xExtY-T,hd, -hw,xExtY+T,hd, "xt1")}{seg(hw,xExtY-T,hd, hw,xExtY+T,hd, "xt2")}
      {seg(0,xExtY,hd, ...xE, "xl")}
      <Html position={xE} center zIndexRange={[20,0]} occlude={false}>
        <div style={pill}><span style={dot("#ef4444")} />X &nbsp;{W.toFixed(2)} mm</div>
      </Html>
      {seg(hw,0,hd, zExtX,0,hd, "ze1")}{seg(hw,H,hd, zExtX,H,hd, "ze2")}
      {seg(zExtX,0,hd, zExtX,H,hd, "zs")}
      {seg(zExtX-T,0,hd, zExtX+T,0,hd, "zt1")}{seg(zExtX-T,H,hd, zExtX+T,H,hd, "zt2")}
      {seg(zExtX,H/2,hd, ...zE, "zl")}
      <Html position={zE} center zIndexRange={[20,0]} occlude={false}>
        <div style={pill}><span style={dot("#3b82f6")} />Z &nbsp;{H.toFixed(2)} mm</div>
      </Html>
      {seg(hw,0,hd, yExtX,0,hd, "ye1")}{seg(hw,0,-hd, yExtX,0,-hd, "ye2")}
      {seg(yExtX,0,-hd, yExtX,0,hd, "ys")}
      {seg(yExtX-T,0,hd, yExtX+T,0,hd, "yt1")}{seg(yExtX-T,0,-hd, yExtX+T,0,-hd, "yt2")}
      {seg(yExtX,0,0, ...yE, "yl")}
      <Html position={yE} center zIndexRange={[20,0]} occlude={false}>
        <div style={pill}><span style={dot("#22c55e")} />Y &nbsp;{D.toFixed(2)} mm</div>
      </Html>
    </group>
  );
};

// ── Material helpers ─────────────────────────────────────────────────────────

const ensureVisibleColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = r * 0.299 + g * 0.587 + b * 0.114;
  if (brightness < 40) {
    const lift = 35;
    const nr = Math.min(255, r + lift);
    const ng = Math.min(255, g + lift);
    const nb = Math.min(255, b + lift);
    return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
  }
  return hexColor;
};

const createMaterial = (colorHex, technology, finish) => {
  const col = new THREE.Color(ensureVisibleColor(colorHex));

  if (finish === "matte") {
    return new THREE.MeshStandardMaterial({ color: col, metalness: 0.0, roughness: 0.78 });
  }
  if (finish === "glossy") {
    return new THREE.MeshPhysicalMaterial({
      color: col, metalness: 0.0, roughness: 0.12,
      clearcoat: 1.0, clearcoatRoughness: 0.08,
    });
  }
  if (finish === "translucent") {
    return new THREE.MeshPhysicalMaterial({
      color: col, metalness: 0.0, roughness: 0.05,
      transmission: 0.72, thickness: 8, ior: 1.5,
      transparent: true, opacity: 0.85, side: THREE.DoubleSide,
      envMapIntensity: 1.6, clearcoat: 1.0, clearcoatRoughness: 0.05,
    });
  }
  if (finish === "glow") {
    return new THREE.MeshStandardMaterial({
      color: col, emissive: col.clone(), emissiveIntensity: 0.35,
      roughness: 0.4, metalness: 0.0,
    });
  }
  if (technology === "sla") {
    return new THREE.MeshPhysicalMaterial({
      color: col, metalness: 0.0, roughness: 0.15,
      clearcoat: 0.6, clearcoatRoughness: 0.2,
      envMapIntensity: 1.0,
    });
  }
  return new THREE.MeshStandardMaterial({ color: col, metalness: 0.0, roughness: 0.78 });
};

const applyTechnologyMaterial = (model, colorHex, technology, finish) => {
  const mat = createMaterial(colorHex, technology, finish);
  model.traverse?.((child) => {
    if (child.isMesh) child.material = mat.clone();
  });
  if (model.isMesh) model.material = mat;
};

const prepareGeometry = (geo) => {
  geo.center();
  geo.computeBoundingBox();
  const raw = new THREE.Vector3();
  geo.boundingBox.getSize(raw);
  const scale = detectScale(raw);
  if (scale !== 1) { geo.scale(scale, scale, scale); geo.computeBoundingBox(); }
  geo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  geo.computeBoundingBox();
  const sz = new THREE.Vector3();
  geo.boundingBox.getSize(sz);
  const volumeMM3 = calcVolume(geo);
  const areaMM2   = calcArea(geo);
  return { sz, volumeMM3, areaMM2 };
};

const GlowToneMap = ({ enabled }) => {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = enabled ? 1.6 : 1.0;
    return () => { gl.toneMappingExposure = 1.0; };
  }, [enabled, gl]);
  return null;
};

const buildHalo = (model, colorHex) => {
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colorHex),
    transparent: true, opacity: 0.22,
    side: THREE.BackSide, depthWrite: false,
  });
  if (model.isMesh) {
    const halo = new THREE.Mesh(model.geometry, mat);
    halo.position.copy(model.position);
    halo.rotation.copy(model.rotation);
    halo.scale.setScalar(1.02);
    return halo;
  }
  const group = new THREE.Group();
  group.position.copy(model.position);
  group.rotation.copy(model.rotation);
  model.traverse(child => {
    if (!child.isMesh) return;
    const hm = new THREE.Mesh(child.geometry, mat.clone());
    hm.position.copy(child.position);
    hm.rotation.copy(child.rotation);
    hm.scale.copy(child.scale);
    group.add(hm);
  });
  group.scale.setScalar(1.02);
  return group;
};

// Wraps the loaded model with landing-page-style rotation + float animation.
// Rotation pauses while the user is actively orbiting and resumes 1.5 s after.
const AnimatedModel = ({ model, haloModel, modelSize, isGlow, glowDist, selectedColor }) => {
  const groupRef = useRef();
  const { controls } = useThree();
  const lastInteractRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current || !modelSize) return;
    const t = state.clock.elapsedTime;
    if (controls?.active) lastInteractRef.current = t;
    if (t - lastInteractRef.current > 1.5) {
      groupRef.current.rotation.y += delta * 0.08;
    }
    const amp = Math.max(modelSize.x, modelSize.y, modelSize.z) * 0.018;
    groupRef.current.position.y = amp * Math.sin(t * 1.2);
  });

  return (
    <group ref={groupRef}>
      {haloModel && <primitive object={haloModel} />}
      {isGlow && modelSize && (
        <pointLight
          position={[0, modelSize.y * 0.5, 0]}
          color={selectedColor.hex}
          intensity={1.2}
          distance={glowDist}
          decay={2}
        />
      )}
      <primitive object={model} />
      {modelSize && <DimensionLines size={modelSize} />}
    </group>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

const ModelViewer = ({
  file, selectedColor, setModelStats,
  selectedMaterial, materials, onModelSizeChange, onLoadingChange,
  technology = "fdm",
  modelScale = 1,
}) => {
  const [model, setModel] = useState(null);
  const [modelSize, setModelSize] = useState(null);
  const [haloModel, setHaloModel] = useState(null);
  const prevUrlRef = useRef(null);
  const originalSizeRef = useRef(null);

  useEffect(() => {
    if (!model) return;
    const colorHex = selectedColor?.hex || "#8b5cf6";
    const finish = selectedColor?.finish;
    applyTechnologyMaterial(model, colorHex, technology, finish);
  }, [selectedColor, technology, model]);

  useEffect(() => {
    if (!model || selectedColor?.finish !== "glow") { setHaloModel(null); return; }
    const halo = buildHalo(model, selectedColor?.hex || "#00ff88");
    setHaloModel(halo);
    return () => setHaloModel(null);
  }, [model, selectedColor?.finish]);

  useEffect(() => {
    if (!haloModel) return;
    const col = new THREE.Color(selectedColor?.hex || "#00ff88");
    haloModel.traverse?.(child => {
      if (child.isMesh && child.material) child.material.color.set(col);
    });
    if (haloModel.isMesh && haloModel.material) haloModel.material.color.set(col);
  }, [selectedColor?.hex, haloModel]);

  // Apply visual scale; keep model bottom at Y=0 so dimension lines stay anchored
  useEffect(() => {
    if (!model || !originalSizeRef.current) return;
    model.scale.setScalar(modelScale);
    const o = originalSizeRef.current;
    // Re-ground the model: geometry is centered at local origin, so world bottom
    // sits at position.y - height/2. Setting position.y = height/2 keeps it at Y=0.
    model.position.y = (o.y * modelScale) / 2;
    setModelSize({ x: o.x * modelScale, y: o.y * modelScale, z: o.z * modelScale });
  }, [model, modelScale]);

  useEffect(() => {
    if (!file) return;
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);

    const ext = file.name.split(".").pop().toLowerCase();
    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    const colorHex = selectedColor?.hex || "#8b5cf6";
    const colorFinish = selectedColor?.finish;
    onLoadingChange?.(true);
    setModel(null);
    setModelSize(null);

    const finish = (mesh, sz, volumeMM3, areaMM2, complexity, support) => {
      mesh.position.y = sz.y / 2;
      mesh.castShadow = true;
      applyTechnologyMaterial(mesh, colorHex, technology, colorFinish);
      originalSizeRef.current = sz;
      setModel(mesh);
      setModelSize(sz);
      onModelSizeChange?.(sz);
      onLoadingChange?.(false);
      setModelStats({
        fileName:           file.name,
        dimensions:         `${sz.x.toFixed(1)} × ${sz.z.toFixed(1)} × ${sz.y.toFixed(1)} mm`,
        dimensionsMM:       { x: sz.x, y: sz.z, z: sz.y },
        volumeMM3,
        areaMM2,
        complexity,
        supportLevel:       support.supportLevel,
        needsSupports:      support.needsSupports,
        overhangRatio:      support.overhangRatio,
        supportWeightedPct: support.supportWeightedPct,
      });
    };

    if (ext === "stl") {
      new STLLoader().load(url, (geo) => {
        geo.computeVertexNormals();
        const { sz, volumeMM3, areaMM2 } = prepareGeometry(geo);
        const support = analyzeSupportNeeds(geo);
        const mesh = new THREE.Mesh(geo, createMaterial(colorHex, technology, colorFinish));
        const complexity = geo.attributes.position.count > 200000 ? "High" : geo.attributes.position.count > 80000 ? "Medium" : "Low";
        finish(mesh, sz, volumeMM3, areaMM2, complexity, support);
      });
    }

    if (ext === "obj") {
      new OBJLoader().load(url, (obj) => {
        const rotMat = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
        obj.traverse((child) => {
          if (child.isMesh) { child.geometry.applyMatrix4(rotMat); child.geometry.computeVertexNormals(); }
        });
        const rawBox = new THREE.Box3().setFromObject(obj);
        const rawSz = new THREE.Vector3();
        rawBox.getSize(rawSz);
        const scale = detectScale(rawSz);
        if (scale !== 1) {
          obj.traverse((child) => { if (child.isMesh) child.geometry.scale(scale, scale, scale); });
        }
        let totalTris = 0;
        const allPositions = [];
        obj.traverse((child) => {
          if (child.isMesh) {
            const geo = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry;
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) allPositions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
            totalTris += pos.count;
            child.material = createMaterial(colorHex, technology, colorFinish);
            child.castShadow = true;
          }
        });
        const mergedGeo = new THREE.BufferGeometry();
        mergedGeo.setAttribute("position", new THREE.Float32BufferAttribute(allPositions, 3));
        mergedGeo.computeVertexNormals();
        const support = analyzeSupportNeeds(mergedGeo);
        const totalVol  = calcVolume(mergedGeo);
        const totalArea = calcArea(mergedGeo);
        const finalBox = new THREE.Box3().setFromObject(obj);
        const sz = finalBox.getSize(new THREE.Vector3());
        const ctr = finalBox.getCenter(new THREE.Vector3());
        obj.position.set(-ctr.x, -finalBox.min.y, -ctr.z);
        const complexity = totalTris > 200000 ? "High" : totalTris > 80000 ? "Medium" : "Low";
        originalSizeRef.current = sz;
        setModel(obj);
        setModelSize(sz);
        onModelSizeChange?.(sz);
        onLoadingChange?.(false);
        setModelStats({
          fileName:           file.name,
          dimensions:         `${sz.x.toFixed(1)} × ${sz.z.toFixed(1)} × ${sz.y.toFixed(1)} mm`,
          dimensionsMM:       { x: sz.x, y: sz.z, z: sz.y },
          volumeMM3:          totalVol,
          areaMM2:            totalArea,
          complexity,
          supportLevel:       support.supportLevel,
          needsSupports:      support.needsSupports,
          overhangRatio:      support.overhangRatio,
          supportWeightedPct: support.supportWeightedPct,
        });
      });
    }

    if (ext === "3mf") {
      new ThreeMFLoader().load(url, (object) => {
        const rotMat = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
        object.traverse((child) => {
          if (child.isMesh) { child.geometry.applyMatrix4(rotMat); child.geometry.computeVertexNormals(); }
        });
        const rawBox = new THREE.Box3().setFromObject(object);
        const rawSz = new THREE.Vector3();
        rawBox.getSize(rawSz);
        const scale = detectScale(rawSz);
        if (scale !== 1) {
          object.traverse((child) => { if (child.isMesh) child.geometry.scale(scale, scale, scale); });
        }
        let totalTris = 0;
        const allPositions = [];
        object.traverse((child) => {
          if (child.isMesh) {
            const geo = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry;
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) allPositions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
            totalTris += pos.count;
            child.material = createMaterial(colorHex, technology, colorFinish);
            child.castShadow = true;
          }
        });
        const mergedGeo = new THREE.BufferGeometry();
        mergedGeo.setAttribute("position", new THREE.Float32BufferAttribute(allPositions, 3));
        mergedGeo.computeVertexNormals();
        const support = analyzeSupportNeeds(mergedGeo);
        const totalVol  = calcVolume(mergedGeo);
        const totalArea = calcArea(mergedGeo);
        const finalBox = new THREE.Box3().setFromObject(object);
        const sz = finalBox.getSize(new THREE.Vector3());
        const ctr = finalBox.getCenter(new THREE.Vector3());
        object.position.set(-ctr.x, -finalBox.min.y, -ctr.z);
        const complexity = totalTris > 200000 ? "High" : totalTris > 80000 ? "Medium" : "Low";
        originalSizeRef.current = sz;
        setModel(object);
        setModelSize(sz);
        onModelSizeChange?.(sz);
        onLoadingChange?.(false);
        setModelStats({
          fileName:           file.name,
          dimensions:         `${sz.x.toFixed(1)} × ${sz.z.toFixed(1)} × ${sz.y.toFixed(1)} mm`,
          dimensionsMM:       { x: sz.x, y: sz.z, z: sz.y },
          volumeMM3:          totalVol,
          areaMM2:            totalArea,
          complexity,
          supportLevel:       support.supportLevel,
          needsSupports:      support.needsSupports,
          overhangRatio:      support.overhangRatio,
          supportWeightedPct: support.supportWeightedPct,
        });
      });
    }

    return () => {
      if (prevUrlRef.current) { URL.revokeObjectURL(prevUrlRef.current); prevUrlRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, selectedMaterial, materials]);

  if (!model) return null;
  const isGlow = selectedColor?.finish === "glow";
  const glowDist = modelSize ? Math.max(modelSize.x, modelSize.y, modelSize.z) * 3 : 400;
  return (
    <>
      <GlowToneMap enabled={isGlow} />
      <CameraFit size={modelSize} />
      <AnimatedModel
        model={model}
        haloModel={haloModel}
        modelSize={modelSize}
        isGlow={isGlow}
        glowDist={glowDist}
        selectedColor={selectedColor}
      />
    </>
  );
};

export default ModelViewer;
