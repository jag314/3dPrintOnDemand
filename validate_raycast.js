'use strict';
// validate_raycast.js
// Empirically tests the hypothesis:
//   "downward ray finds material within X mm → bridging, no hit → cantilever real"
//
// Coordinate convention: Z-up (raw STL space).
//   The browser's prepareGeometry applies makeRotationX(-PI/2) to convert
//   Z-up → Y-up BEFORE analyzeSupportNeeds runs. In raw STL space the
//   "up" axis is +Z, so overhang faces have NZ < threshold (not NY).
//   Down direction for raycasting: (0, 0, -1).

const fs = require('fs');

// ── STL parser ────────────────────────────────────────────────────────────────
function parseSTL(path) {
  const buf = fs.readFileSync(path);
  if (buf.length < 84) throw new Error('File too small to be STL');
  const nBin = buf.readUInt32LE(80);
  if (buf.length === 84 + nBin * 50) return parseBinary(buf, nBin);
  const ascii = parseASCII(buf.toString('ascii'));
  if (ascii.length > 0) return ascii;
  return parseBinary(buf, nBin); // fallback
}

function parseBinary(buf, n) {
  const out = [];
  let off = 84;
  for (let i = 0; i < n; i++) {
    const nx = buf.readFloatLE(off), ny = buf.readFloatLE(off+4), nz = buf.readFloatLE(off+8);
    off += 12;
    const v = [];
    for (let j = 0; j < 3; j++, off += 12)
      v.push([buf.readFloatLE(off), buf.readFloatLE(off+4), buf.readFloatLE(off+8)]);
    off += 2;
    out.push({ n: [nx, ny, nz], v });
  }
  return out;
}

function parseASCII(text) {
  const re = /facet\s+normal\s+([\S]+)\s+([\S]+)\s+([\S]+)[\s\S]*?vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)\s*vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)\s*vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      n: [+m[1], +m[2], +m[3]],
      v: [[+m[4], +m[5], +m[6]], [+m[7], +m[8], +m[9]], [+m[10], +m[11], +m[12]]],
    });
  }
  return out;
}

// ── Face normal — NZ component (Z-up convention) ──────────────────────────────
function faceNZ(tri) {
  const [nx, ny, nz] = tri.n;
  const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
  if (len > 1e-6) return nz / len;
  // Degenerate stored normal — compute from cross product
  const [v0, v1, v2] = tri.v;
  const e1x = v1[0]-v0[0], e1y = v1[1]-v0[1], e1z = v1[2]-v0[2];
  const e2x = v2[0]-v0[0], e2y = v2[1]-v0[1], e2z = v2[2]-v0[2];
  const cz   = e1x*e2y - e1y*e2x;
  const clen = Math.sqrt((e1y*e2z - e1z*e2y)**2 + (e1z*e2x - e1x*e2z)**2 + cz*cz);
  return clen > 1e-12 ? cz / clen : 0;
}

// ── Möller–Trumbore for D = (0,0,−1) ─────────────────────────────────────────
// Specialized for a straight-down ray — avoids most multiplications by 0.
// Returns t (distance along -Z) if intersection exists with t > minT, else -1.
function intersectDown(ox, oy, oz, tri, minT) {
  const [v0, v1, v2] = tri.v;
  const e1x = v1[0]-v0[0], e1y = v1[1]-v0[1], e1z = v1[2]-v0[2];
  const e2x = v2[0]-v0[0], e2y = v2[1]-v0[1], e2z = v2[2]-v0[2];
  // h = D × e2, where D = (0,0,-1) → h = (e2y, -e2x, 0)
  const hx = e2y, hy = -e2x; // hz=0
  const a  = e1x*hx + e1y*hy; // e1z*hz = 0
  if (Math.abs(a) < 1e-8) return -1;
  const f  = 1 / a;
  const sx = ox - v0[0], sy = oy - v0[1], sz = oz - v0[2];
  const u  = f * (sx*hx + sy*hy); // sz*hz = 0
  if (u < 0 || u > 1) return -1;
  // q = s × e1 → only need qx, qy, qz
  const qx = sy*e1z - sz*e1y;
  const qy = sz*e1x - sx*e1z;
  const qz = sx*e1y - sy*e1x;
  const v_ = f * (-qz);           // D · q = (0,0,-1)·q = -qz
  if (v_ < 0 || u + v_ > 1) return -1;
  const t  = f * (e2x*qx + e2y*qy + e2z*qz);
  return t > minT ? t : -1;
}

// ── Cast one ray straight down from (ox, oy, oz), return nearest hit ──────────
// EPS    : how far above the centroid we start the ray (avoids self-hit on own plane)
// MINT   : minimum valid hit distance (excludes same-Z adjacent faces)
// Returns Infinity when no triangle is hit below.
function rayDown(ox, oy, oz, tris, selfIdx, minZArr) {
  const EPS  = 0.5;  // mm — start above centroid
  const MINT = 0.5;  // mm — exclude hits at exactly EPS (same-plane adjacent faces)
  const rz   = oz + EPS;
  let best   = Infinity;
  for (let i = 0; i < tris.length; i++) {
    if (i === selfIdx) continue;
    if (minZArr[i] >= rz) continue;  // triangle entirely at or above ray origin → skip
    const t = intersectDown(ox, oy, rz, tris[i], MINT);
    if (t > 0 && t < best) best = t;
  }
  return best;
}

// ── Build per-triangle minZ cache (for fast Z-filter) ────────────────────────
function buildMinZCache(tris) {
  const minZ = new Float64Array(tris.length);
  for (let i = 0; i < tris.length; i++) {
    const v = tris[i].v;
    minZ[i] = Math.min(v[0][2], v[1][2], v[2][2]);
  }
  return minZ;
}

// ── Main analysis ─────────────────────────────────────────────────────────────
function analyze(label, path, nzThresh, maxSamples) {
  console.log(`\n${'═'.repeat(68)}`);
  console.log(`  ${label}`);
  console.log('═'.repeat(68));

  let tris;
  try { tris = parseSTL(path); }
  catch (e) { console.log(`  ERROR: ${e.message}`); return; }

  // Z bounds (Z-up raw STL)
  let minZ = Infinity, maxZ = -Infinity;
  for (const t of tris) for (const v of t.v) {
    if (v[2] < minZ) minZ = v[2];
    if (v[2] > maxZ) maxZ = v[2];
  }
  const H      = maxZ - minZ;
  const gndZ   = minZ + H * 0.03; // same ground-exclusion as analyzeSupportNeeds

  console.log(`  Triangles : ${tris.length.toLocaleString()}`);
  console.log(`  Z range   : [${minZ.toFixed(1)}, ${maxZ.toFixed(1)}] mm   H=${H.toFixed(1)} mm`);
  console.log(`  Ground cut: Z < ${gndZ.toFixed(1)} mm (bottom 3%)`);

  const minZArr = buildMinZCache(tris);

  // Identify overhang candidates
  const cands = [];
  for (let i = 0; i < tris.length; i++) {
    const t = tris[i];
    const avgZ = (t.v[0][2] + t.v[1][2] + t.v[2][2]) / 3;
    if (avgZ < gndZ) continue;
    if (faceNZ(t) < nzThresh) cands.push(i);
  }
  console.log(`  Candidates: ${cands.length.toLocaleString()}  (NZ < ${nzThresh})`);

  if (cands.length === 0) { console.log('  No candidates — aborting.'); return; }

  // Evenly-spaced subsample
  let sample = cands;
  if (cands.length > maxSamples) {
    const step = Math.ceil(cands.length / maxSamples);
    sample = cands.filter((_, i) => i % step === 0);
  }
  const stride = Math.ceil(cands.length / sample.length);
  console.log(`  Sample    : ${sample.length} faces (1 in ${stride})`);
  process.stdout.write('  Raycasting...');
  const t0 = Date.now();

  const dists = [];
  for (const idx of sample) {
    const tri = tris[idx];
    const cx = (tri.v[0][0] + tri.v[1][0] + tri.v[2][0]) / 3;
    const cy = (tri.v[0][1] + tri.v[1][1] + tri.v[2][1]) / 3;
    const cz = (tri.v[0][2] + tri.v[1][2] + tri.v[2][2]) / 3;
    dists.push(rayDown(cx, cy, cz, tris, idx, minZArr));
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(` done in ${elapsed}s`);

  const N     = dists.length;
  const noHit = dists.filter(d => d === Infinity).length;
  const hits  = dists.filter(d => d < Infinity);

  const within = (mm) => dists.filter(d => d <= mm).length;

  console.log(`\n  ── Distance-to-material distribution (all ${N} samples) ──────────`);
  console.log(`  Threshold  │  Count  │  % of overhang faces`);
  console.log(`  ───────────┼─────────┼─────────────────────`);
  for (const mm of [1, 2, 5, 10, 15, 20, 30, 50]) {
    const cnt = within(mm);
    console.log(`  hit ≤ ${String(mm).padEnd(3)}mm │ ${String(cnt).padStart(7)} │ ${(cnt/N*100).toFixed(1).padStart(5)}%`);
  }
  console.log(`  any hit    │ ${String(hits.length).padStart(7)} │ ${(hits.length/N*100).toFixed(1).padStart(5)}%`);
  console.log(`  NO HIT     │ ${String(noHit).padStart(7)} │ ${(noHit/N*100).toFixed(1).padStart(5)}%`);

  if (hits.length > 0) {
    const s  = hits.slice().sort((a, b) => a - b);
    const p  = (pct) => s[Math.floor(s.length * pct / 100)];
    console.log(`\n  Hit-distance percentiles (excl. no-hit, ${hits.length} samples):`);
    console.log(`  p10=${p(10).toFixed(1)}mm  p25=${p(25).toFixed(1)}mm  p50=${p(50).toFixed(1)}mm  p75=${p(75).toFixed(1)}mm  p90=${p(90).toFixed(1)}mm  max=${s[s.length-1].toFixed(1)}mm`);
  }

  const w5   = (within(5)  / N * 100).toFixed(1);
  const w10  = (within(10) / N * 100).toFixed(1);
  const nhPct = (noHit / N * 100).toFixed(1);
  console.log(`\n  HYPOTHESIS CHECK:`);
  console.log(`    Bridgeable (hit ≤  5mm): ${w5.padStart(5)}%   (expect HIGH for cabin-ceiling Benchy)`);
  console.log(`    Bridgeable (hit ≤ 10mm): ${w10.padStart(5)}%   (expect HIGH for Benchy, LOW for Goku arm)`);
  console.log(`    Cantilever (no hit):      ${nhPct.padStart(5)}%   (expect LOW for Benchy, HIGH for Goku arm)`);
}

// ── Entry point ───────────────────────────────────────────────────────────────
const BENCHY = 'c:/Users/j.b.aguilar.gonzalez/Downloads/#3DBenchy - The jolly 3D printing torture-test by CreativeTools.se - 763622 - part 2 of 2/files/3DBenchy.stl';
const GOKU   = 'c:/Users/j.b.aguilar.gonzalez/Downloads/Goku - 6665508/files/gokufixed1.stl';

// Two normal thresholds: 50° (NZ < -0.766, same as analyzeSupportNeeds) and 72° (NZ < -0.95)
analyze('3DBenchy — NZ < −0.766 (≥50°)',  BENCHY, -0.766, 1000);
analyze('gokufixed1 — NZ < −0.766 (≥50°)', GOKU,  -0.766, 1000);
analyze('3DBenchy — NZ < −0.95 (≥72°)',   BENCHY, -0.95,  1000);
analyze('gokufixed1 — NZ < −0.95 (≥72°)',  GOKU,  -0.95,  1000);

console.log(`\n${'═'.repeat(68)}\n`);
