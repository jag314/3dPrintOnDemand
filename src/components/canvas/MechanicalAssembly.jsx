import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ── HUD tag definitions ───────────────────────────────────────────────────────

const TAG_DEFS = [
  { lines: ["FILAMENT // PLA+",  "DIAM: 1.75mm",       "SPOOL: 82% REMAINING"],           delay: "0s"   },
  { lines: ["HOTEND // ACTIVE",  "TEMP: 215°C",         "SPEED: 500mm/s",  "FAN: 100%"],   delay: "1.2s" },
  { lines: ["NOZZLE: 0.4mm",     "LAYER: 0047 / 120",  "H: 0.20mm"],                      delay: "2.1s" },
  { lines: ["BED TEMP: 60°C",    "VOL: 260×260×300mm", "ADHESION: OK"],                   delay: "3.0s" },
  { lines: ["SYS // INITY3D",    "CR-UNIT-001",         "PWR: 98.3%"],                     delay: "0.6s" },
  { lines: ["BUILD: 39.2%",      "ETA: 01:23:44",       "STATUS: PRINTING"],               delay: "1.8s" },
];

// ── Scene builder ─────────────────────────────────────────────────────────────

function buildPrinter(scene, isMobile) {
  const seg      = isMobile ? 5 : 12;
  const resources = [];  // geometries to dispose
  const matList   = [];  // materials to dispose

  function stdMat(opts) {
    const m = new THREE.MeshStandardMaterial({ metalness: 0.95, roughness: 0.05, ...opts });
    matList.push(m);
    return m;
  }
  function lineMat(opts) {
    const m = new THREE.LineBasicMaterial(opts);
    matList.push(m);
    return m;
  }
  function basicMat(opts) {
    const m = new THREE.MeshBasicMaterial(opts);
    matList.push(m);
    return m;
  }

  const solidM  = stdMat({ color: 0x0d0020, transparent: true, opacity: 0.6 });
  const wireM   = basicMat({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.7 });
  const edgeM   = lineMat({ color: 0xa855f7, transparent: true, opacity: 0.95 });
  const gridM   = lineMat({ color: 0x4c1d95, transparent: true, opacity: 0.5 });
  const nozzleM = stdMat({
    color: 0xc084fc, transparent: true, opacity: 1.0,
    emissive: new THREE.Color(0xc084fc), emissiveIntensity: 0.3,
  });

  // Builds a three-layer (solid + wireframe + edges) group from a geometry
  function part(geo, sm, wm, em) {
    sm = sm || solidM; wm = wm || wireM; em = em || edgeM;
    resources.push(geo);
    const edgeGeo = new THREE.EdgesGeometry(geo, 12);
    resources.push(edgeGeo);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, sm), new THREE.Mesh(geo, wm), new THREE.LineSegments(edgeGeo, em));
    return g;
  }

  const printerGroup = new THREE.Group();

  // ── Frame ─────────────────────────────────────────────────────────────────
  const frame = new THREE.Group();

  frame.add(part(new THREE.CylinderGeometry(2.2, 2.4, 0.15, 6)));

  const lVert = part(new THREE.CylinderGeometry(0.06, 0.06, 7, seg));
  lVert.position.set(-2.0, 3.5, 0);
  frame.add(lVert);

  const rVert = part(new THREE.CylinderGeometry(0.06, 0.06, 7, seg));
  rVert.position.set(2.0, 3.5, 0);
  frame.add(rVert);

  const topBar = part(new THREE.CylinderGeometry(0.06, 0.06, 4.4, seg));
  topBar.rotation.z = Math.PI / 2;
  topBar.position.set(0, 7.1, 0);
  frame.add(topBar);

  const midBar = part(new THREE.CylinderGeometry(0.05, 0.05, 4.4, seg));
  midBar.rotation.z = Math.PI / 2;
  midBar.position.set(0, 3.5, 0);
  frame.add(midBar);

  [[-1.9, 7.05, 0.15], [1.9, 7.05, 0.15], [-1.9, 7.05, -0.15], [1.9, 7.05, -0.15]].forEach(([x, y, z]) => {
    const b = part(new THREE.BoxGeometry(0.15, 0.15, 0.15));
    b.position.set(x, y, z);
    frame.add(b);
  });

  printerGroup.add(frame);

  // ── Print bed ─────────────────────────────────────────────────────────────
  const printBed = new THREE.Group();
  printBed.add(part(new THREE.BoxGeometry(3.8, 0.12, 3.8)));

  const gridPts = [];
  const gs = 3.6, gc = 10;
  for (let i = 0; i <= gc; i++) {
    const p = -gs / 2 + (gs / gc) * i;
    gridPts.push(new THREE.Vector3(-gs/2, 0.07, p), new THREE.Vector3(gs/2, 0.07, p));
    gridPts.push(new THREE.Vector3(p, 0.07, -gs/2), new THREE.Vector3(p, 0.07, gs/2));
  }
  const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPts);
  resources.push(gridGeo);
  printBed.add(new THREE.LineSegments(gridGeo, gridM));

  const bedSup = part(new THREE.CylinderGeometry(0.08, 0.08, 1.2, seg));
  bedSup.position.set(0, -0.66, 0);
  printBed.add(bedSup);

  printBed.position.set(0, -2.5, 0);
  printerGroup.add(printBed);

  // ── X rail ────────────────────────────────────────────────────────────────
  const xRail = part(new THREE.CylinderGeometry(0.05, 0.05, 4.2, seg));
  xRail.rotation.z = Math.PI / 2;
  xRail.position.set(0, 4.5, 0.2);
  printerGroup.add(xRail);

  // ── Print head ────────────────────────────────────────────────────────────
  const printHead = new THREE.Group();
  printHead.add(part(new THREE.BoxGeometry(0.8, 0.9, 0.5)));

  const fan = part(new THREE.TorusGeometry(0.22, 0.04, 6, 20));
  fan.rotation.x = Math.PI / 2;
  fan.position.set(0, -0.1, 0.3);
  printHead.add(fan);

  const heatBlock = part(new THREE.BoxGeometry(0.2, 0.2, 0.2));
  heatBlock.position.set(0, -0.65, 0);
  printHead.add(heatBlock);

  const heatBreak = part(new THREE.CylinderGeometry(0.04, 0.04, 0.3, seg));
  heatBreak.position.set(0, -0.9, 0);
  printHead.add(heatBreak);

  const nozzleG = part(new THREE.CylinderGeometry(0.08, 0.02, 0.25, seg), nozzleM, wireM, edgeM);
  nozzleG.position.set(0, -1.15, 0);
  printHead.add(nozzleG);

  printHead.position.set(0, 4.5, 0.2);
  printerGroup.add(printHead);

  // ── Filament spool ────────────────────────────────────────────────────────
  const filamentSpool = new THREE.Group();
  filamentSpool.add(part(new THREE.TorusGeometry(0.9, 0.12, 8, 32)));
  filamentSpool.add(part(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16)));

  if (!isMobile) {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-1.0, 1.2, 0.3),
      new THREE.Vector3(-2.5, -0.8, 0.2),
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.025, 6, false);
    resources.push(tubeGeo);
    filamentSpool.add(new THREE.Mesh(tubeGeo, basicMat({ color: 0x6d28d9, transparent: true, opacity: 0.6 })));
  }

  filamentSpool.position.set(2.5, 5.5, -0.5);
  printerGroup.add(filamentSpool);

  // ── Lead screws ───────────────────────────────────────────────────────────
  const lScrew = part(new THREE.CylinderGeometry(0.04, 0.04, 7, isMobile ? 4 : 6));
  lScrew.position.set(-1.7, 3.5, 0.3);
  printerGroup.add(lScrew);

  const rScrew = part(new THREE.CylinderGeometry(0.04, 0.04, 7, isMobile ? 4 : 6));
  rScrew.position.set(1.7, 3.5, 0.3);
  printerGroup.add(rScrew);

  // ── Printed object (layered) ──────────────────────────────────────────────
  const printedObj   = new THREE.Group();
  const LAYER_COUNT  = 7;
  const layerMats    = [];

  for (let i = 0; i < LAYER_COUNT; i++) {
    const size  = 1.2 - i * 0.08;
    const isTop = i === LAYER_COUNT - 1;
    const geo   = new THREE.BoxGeometry(size, 0.1, size);
    resources.push(geo);
    const lm = stdMat({
      color:              isTop ? 0xc084fc : 0x7c3aed,
      transparent:        true,
      opacity:            0.3 + i * 0.08,
      emissive:           new THREE.Color(isTop ? 0xc084fc : 0x7c3aed),
      emissiveIntensity:  isTop ? 0.5 : 0.08,
    });
    layerMats.push(lm);
    const mesh = new THREE.Mesh(geo, lm);
    mesh.position.y = i * 0.12;
    printedObj.add(mesh);
  }

  printedObj.position.set(-0.3, -2.36, -0.3);
  printerGroup.add(printedObj);

  // ── Lights ────────────────────────────────────────────────────────────────
  const nozzleLight = new THREE.PointLight(0x7c3aed, 5, 15);
  nozzleLight.position.set(0, 3.3, 0.2);
  scene.add(nozzleLight);

  const spoolLight = new THREE.PointLight(0xa855f7, 2, 20);
  spoolLight.position.set(2.5, 5.5, -0.5);
  scene.add(spoolLight);

  scene.add(new THREE.AmbientLight(0x1a0030, 4));

  // ── Scale + tilt ──────────────────────────────────────────────────────────
  printerGroup.scale.setScalar(0.72);
  printerGroup.position.set(0.6, -0.5, 0);
  printerGroup.rotation.y = Math.PI * 0.083; // ~15°
  scene.add(printerGroup);

  // ── HUD anchors ───────────────────────────────────────────────────────────
  const spoolAnchor = new THREE.Object3D();
  filamentSpool.add(spoolAnchor);

  const headAnchor = new THREE.Object3D();
  printHead.add(headAnchor);

  const nozzleAnchor = new THREE.Object3D();
  nozzleAnchor.position.set(0, -1.15, 0);
  printHead.add(nozzleAnchor);

  const bedAnchor = new THREE.Object3D();
  printBed.add(bedAnchor);

  const frameTLAnchor = new THREE.Object3D();
  frameTLAnchor.position.set(-2.0, 7.1, 0);
  frame.add(frameTLAnchor);

  const objAnchor = new THREE.Object3D();
  objAnchor.position.set(0, LAYER_COUNT * 0.12 + 0.1, 0);
  printedObj.add(objAnchor);

  const topLayerMat = layerMats[LAYER_COUNT - 1];

  return {
    printerGroup,
    printHead,
    printBed,
    filamentSpool,
    lScrew,
    rScrew,
    nozzleLight,
    topLayerMat,
    anchors: [spoolAnchor, headAnchor, nozzleAnchor, bedAnchor, frameTLAnchor, objAnchor],
    resources,
    matList,
  };
}

// ── React component ───────────────────────────────────────────────────────────

const MechanicalAssemblyCanvas = () => {
  const mountRef    = useRef(null);
  const svgLineRefs = useRef([]);
  const svgDotRefs  = useRef([]);
  const tagRefs     = useRef([]);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const h  = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42, container.clientWidth / container.clientHeight, 0.1, 100
    );
    camera.position.set(0, 1.5, 12);

    const {
      printerGroup, printHead, printBed, filamentSpool,
      lScrew, rScrew, nozzleLight, topLayerMat,
      anchors, resources, matList,
    } = buildPrinter(scene, isMobile);

    const t0   = performance.now();
    const wVec = new THREE.Vector3();
    const pVec = new THREE.Vector3();
    let rafId;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = (performance.now() - t0) / 1000;

      printerGroup.rotation.y += 0.002;

      printHead.position.x   = Math.sin(t * 0.8) * 1.6;
      printBed.position.y    = -2.5 + Math.sin(t * 0.05) * 0.3;
      filamentSpool.rotation.z -= 0.01;
      lScrew.rotation.y      += 0.03;
      rScrew.rotation.y      += 0.03;

      printHead.getWorldPosition(wVec);
      nozzleLight.position.set(wVec.x, wVec.y - 0.85, wVec.z);
      nozzleLight.intensity = 3 + Math.sin(t * 2) * 2;

      topLayerMat.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.3;

      // HUD tag repositioning
      if (!isMobile) {
        const cW = container.clientWidth;
        const cH = container.clientHeight;
        anchors.forEach((anchor, i) => {
          const tagEl  = tagRefs.current[i];
          const lineEl = svgLineRefs.current[i];
          const dotEl  = svgDotRefs.current[i];
          if (!anchor || !tagEl || !lineEl || !dotEl) return;

          anchor.getWorldPosition(wVec);
          pVec.copy(wVec).project(camera);

          const ax = (pVec.x  *  0.5 + 0.5) * cW;
          const ay = (-pVec.y *  0.5 + 0.5) * cH;

          const tw      = tagEl.offsetWidth  || 150;
          const th      = tagEl.offsetHeight || 56;
          const onRight = ax > cW * 0.5;
          const tLeft   = onRight ? ax + 28 : ax - tw - 28;
          const tTop    = ay - th / 2;

          tagEl.style.left = `${tLeft}px`;
          tagEl.style.top  = `${tTop}px`;

          const lx2 = onRight ? tLeft : tLeft + tw;
          const ly2 = tTop + th / 2;
          lineEl.setAttribute("x1", ax.toFixed(1));
          lineEl.setAttribute("y1", ay.toFixed(1));
          lineEl.setAttribute("x2", lx2.toFixed(1));
          lineEl.setAttribute("y2", ly2.toFixed(1));
          dotEl.setAttribute("cx", ax.toFixed(1));
          dotEl.setAttribute("cy", ay.toFixed(1));
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      resources.forEach((r) => r.dispose());
      matList.forEach((m)   => m.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [isMobile]);

  // CSS injection (once)
  useEffect(() => {
    const id = "fdm-hud-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @keyframes hud-pulse {
        0%, 90%   { opacity: 1;   border-color: #7c3aed; }
        92%, 97%  { opacity: 0.4; border-color: #4c1d95; }
        100%      { opacity: 1;   border-color: #7c3aed; }
      }
      .hud-fdm {
        position: absolute;
        font-family: 'Courier New', Courier, monospace;
        font-size: 10px;
        line-height: 1.7;
        color: #c084fc;
        background: rgba(8, 4, 24, 0.88);
        border: 1px solid #7c3aed;
        border-left: 2px solid #a855f7;
        padding: 5px 8px;
        white-space: nowrap;
        pointer-events: none;
        animation: hud-pulse 5s infinite;
        left: -9999px;
        top: -9999px;
      }
    `;
    document.head.appendChild(el);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* WebGL canvas mount */}
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* SVG leader lines — desktop only */}
      {!isMobile && (
        <svg
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            pointerEvents: "none", overflow: "visible",
          }}
        >
          {TAG_DEFS.map((_, i) => (
            <g key={i}>
              <line
                ref={(el) => { svgLineRefs.current[i] = el; }}
                stroke="#7c3aed" strokeWidth="0.8" opacity="0.7"
                x1="0" y1="0" x2="0" y2="0"
              />
              <circle
                ref={(el) => { svgDotRefs.current[i] = el; }}
                r="2.5" fill="#7c3aed" cx="0" cy="0"
              />
            </g>
          ))}
        </svg>
      )}

      {/* HUD tag boxes — desktop only */}
      {!isMobile && (
        <div
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            pointerEvents: "none", overflow: "visible",
          }}
        >
          {TAG_DEFS.map((tag, i) => (
            <div
              key={i}
              ref={(el) => { tagRefs.current[i] = el; }}
              className="hud-fdm"
              style={{ animationDelay: tag.delay }}
            >
              {tag.lines.map((line, li) => <div key={li}>{line}</div>)}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MechanicalAssemblyCanvas;
