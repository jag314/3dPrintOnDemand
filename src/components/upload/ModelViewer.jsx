import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { useThree } from "@react-three/fiber";
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

const detectScale = (sz) => {
  const m = Math.max(sz.x, sz.y, sz.z);
  if (m < 0.1) return 1000;
  if (m < 2)   return 10;
  return 1;
};

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
  const mat = new THREE.LineBasicMaterial({ color:"#c4b5fd", transparent:true, opacity:0.85 });
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
        <div style={pill}><span style={dot("#a78bfa")} />X &nbsp;{W.toFixed(2)} mm</div>
      </Html>
      {seg(hw,0,hd, zExtX,0,hd, "ze1")}{seg(hw,H,hd, zExtX,H,hd, "ze2")}
      {seg(zExtX,0,hd, zExtX,H,hd, "zs")}
      {seg(zExtX-T,0,hd, zExtX+T,0,hd, "zt1")}{seg(zExtX-T,H,hd, zExtX+T,H,hd, "zt2")}
      {seg(zExtX,H/2,hd, ...zE, "zl")}
      <Html position={zE} center zIndexRange={[20,0]} occlude={false}>
        <div style={pill}><span style={dot("#34d399")} />Z &nbsp;{H.toFixed(2)} mm</div>
      </Html>
      {seg(hw,0,hd, yExtX,0,hd, "ye1")}{seg(hw,0,-hd, yExtX,0,-hd, "ye2")}
      {seg(yExtX,0,-hd, yExtX,0,hd, "ys")}
      {seg(yExtX-T,0,hd, yExtX+T,0,hd, "yt1")}{seg(yExtX-T,0,-hd, yExtX+T,0,-hd, "yt2")}
      {seg(yExtX,0,0, ...yE, "yl")}
      <Html position={yE} center zIndexRange={[20,0]} occlude={false}>
        <div style={pill}><span style={dot("#60a5fa")} />Y &nbsp;{D.toFixed(2)} mm</div>
      </Html>
    </group>
  );
};

const createMaterial = (colorHex, technology, finish) => {
  const col = new THREE.Color(colorHex);

  // Explicit finish overrides technology defaults
  if (finish === "matte") {
    return new THREE.MeshStandardMaterial({ color: col, metalness: 0.0, roughness: 0.85 });
  }
  if (finish === "glossy") {
    return new THREE.MeshPhysicalMaterial({
      color: col, metalness: 0.05, roughness: 0.1,
      clearcoat: 0.8, clearcoatRoughness: 0.15,
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
    // Layer 1: main model — readable detail with low emissive glow
    return new THREE.MeshStandardMaterial({
      color: col, emissive: col.clone(), emissiveIntensity: 0.35,
      roughness: 0.4, metalness: 0.0,
    });
  }

  // Technology defaults — no finish set
  if (technology === "sla") {
    // Smooth glossy resin — opaque, soft sheen, like real cured SLA print
    return new THREE.MeshPhysicalMaterial({
      color: col, metalness: 0.0, roughness: 0.15,
      clearcoat: 0.6, clearcoatRoughness: 0.2,
      envMapIntensity: 1.0,
    });
  }
  // FDM default — rough matte plastic, visible texture, no shine
  return new THREE.MeshStandardMaterial({ color: col, metalness: 0.0, roughness: 0.85 });
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
  return { sz, volumeMM3 };
};

const GlowToneMap = ({ enabled }) => {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = enabled ? 1.6 : 1.0;
    return () => { gl.toneMappingExposure = 1.0; };
  }, [enabled, gl]);
  return null;
};

// Layer 2 — BackSide halo: scales geometry up 4%, renders only back faces,
// which peek out around the silhouette as a soft colored outline.
const buildHalo = (model, colorHex) => {
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colorHex),
    transparent: true,
    opacity: 0.22,
    side: THREE.BackSide,
    depthWrite: false,
  });

  if (model.isMesh) {
    const halo = new THREE.Mesh(model.geometry, mat);
    halo.position.copy(model.position);
    halo.rotation.copy(model.rotation);
    halo.scale.setScalar(1.06);
    return halo;
  }

  // OBJ — group of meshes
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
  group.scale.setScalar(1.06);
  return group;
};

const ModelViewer = ({
  file, selectedColor, setModelStats,
  selectedMaterial, materials, onModelSizeChange, onLoadingChange,
  technology = "fdm",
}) => {
  const [model, setModel] = useState(null);
  const [modelSize, setModelSize] = useState(null);
  const [haloModel, setHaloModel] = useState(null);
  const prevUrlRef = useRef(null);

  useEffect(() => {
    if (!model) return;
    const colorHex = selectedColor?.hex || "#8b5cf6";
    const finish = selectedColor?.finish;
    applyTechnologyMaterial(model, colorHex, technology, finish);
  }, [selectedColor, technology, model]);

  // Build / destroy halo whenever model or glow status changes
  useEffect(() => {
    if (!model || selectedColor?.finish !== "glow") {
      setHaloModel(null);
      return;
    }
    const halo = buildHalo(model, selectedColor?.hex || "#00ff88");
    setHaloModel(halo);
    return () => setHaloModel(null);
  }, [model, selectedColor?.finish]);

  // Update halo color live when hex changes (no full rebuild needed)
  useEffect(() => {
    if (!haloModel) return;
    const col = new THREE.Color(selectedColor?.hex || "#00ff88");
    haloModel.traverse?.(child => {
      if (child.isMesh && child.material) child.material.color.set(col);
    });
    if (haloModel.isMesh && haloModel.material) haloModel.material.color.set(col);
  }, [selectedColor?.hex, haloModel]);

  useEffect(() => {
    if (!file) return;
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    const ext = file.name.split(".").pop().toLowerCase();
    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    const density = materials?.[selectedMaterial]?.density || 1.24;
    const colorHex = selectedColor?.hex || "#8b5cf6";
    const colorFinish = selectedColor?.finish;
    onLoadingChange?.(true);
    setModel(null);
    setModelSize(null);

    const finish = (mesh, sz, volumeMM3, complexity) => {
      mesh.position.y = sz.y / 2;
      mesh.castShadow = true;
      applyTechnologyMaterial(mesh, colorHex, technology, colorFinish);
      const weight = ((volumeMM3 / 1000) * density).toFixed(1);
      setModel(mesh);
      setModelSize(sz);
      onModelSizeChange?.(sz);
      onLoadingChange?.(false);
      setModelStats({
        fileName: file.name,
        dimensions: `${sz.x.toFixed(1)} × ${sz.z.toFixed(1)} × ${sz.y.toFixed(1)} mm`,
        materialUsage: weight,
        complexity,
      });
    };

    if (ext === "stl") {
      new STLLoader().load(url, (geo) => {
        geo.computeVertexNormals();
        const { sz, volumeMM3 } = prepareGeometry(geo);
        const mesh = new THREE.Mesh(geo, createMaterial(colorHex, technology, colorFinish));
        const complexity = geo.attributes.position.count > 200000 ? "High" : geo.attributes.position.count > 80000 ? "Medium" : "Low";
        finish(mesh, sz, volumeMM3, complexity);
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
        const totalVol = calcVolume(mergedGeo);
        const finalBox = new THREE.Box3().setFromObject(obj);
        const sz = finalBox.getSize(new THREE.Vector3());
        const ctr = finalBox.getCenter(new THREE.Vector3());
        obj.position.set(-ctr.x, -finalBox.min.y, -ctr.z);
        const weight = ((totalVol / 1000) * density).toFixed(1);
        const complexity = totalTris > 200000 ? "High" : totalTris > 80000 ? "Medium" : "Low";
        setModel(obj);
        setModelSize(sz);
        onModelSizeChange?.(sz);
        onLoadingChange?.(false);
        setModelStats({
          fileName: file.name,
          dimensions: `${sz.x.toFixed(1)} × ${sz.z.toFixed(1)} × ${sz.y.toFixed(1)} mm`,
          materialUsage: weight,
          complexity,
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
      {/* Layer 2 — BackSide halo mesh renders as sibling, not child */}
      {haloModel && <primitive object={haloModel} />}
      {/* Layer 3 — subtle colored point light so glow spills onto the scene */}
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
    </>
  );
};

export default ModelViewer;