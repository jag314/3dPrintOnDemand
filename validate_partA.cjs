'use strict';
// validate_partA.cjs
// Tests whether Z-proximity-to-build-plate exclusion reduces Benchy false-cantilever rate.
// Runs raycasting at multiple floor thresholds and shows the Z-histogram of no-hit faces
// so we can see where in the model the no-hits are concentrated.

const fs = require('fs');

// ── STL parser ────────────────────────────────────────────────────────────────
function parseSTL(path) {
  const buf = fs.readFileSync(path);
  if (buf.length < 84) throw new Error('Too small');
  const nBin = buf.readUInt32LE(80);
  if (buf.length === 84 + nBin * 50) return parseBinary(buf, nBin);
  const ascii = parseASCII(buf.toString('ascii'));
  if (ascii.length > 0) return ascii;
  return parseBinary(buf, nBin);
}
function parseBinary(buf, n) {
  const out = []; let off = 84;
  for (let i = 0; i < n; i++) {
    const nx=buf.readFloatLE(off), ny=buf.readFloatLE(off+4), nz=buf.readFloatLE(off+8); off+=12;
    const v=[];
    for (let j=0;j<3;j++,off+=12) v.push([buf.readFloatLE(off),buf.readFloatLE(off+4),buf.readFloatLE(off+8)]);
    off+=2; out.push({n:[nx,ny,nz],v});
  }
  return out;
}
function parseASCII(text) {
  const re=/facet\s+normal\s+([\S]+)\s+([\S]+)\s+([\S]+)[\s\S]*?vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)\s*vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)\s*vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)/g;
  const out=[]; let m;
  while ((m=re.exec(text))!==null)
    out.push({n:[+m[1],+m[2],+m[3]],v:[[+m[4],+m[5],+m[6]],[+m[7],+m[8],+m[9]],[+m[10],+m[11],+m[12]]]});
  return out;
}

// ── Face NZ (Z-up raw STL convention) ────────────────────────────────────────
function faceNZ(tri) {
  const [nx,ny,nz]=tri.n, len=Math.sqrt(nx*nx+ny*ny+nz*nz);
  if (len>1e-6) return nz/len;
  const [v0,v1,v2]=tri.v;
  const e1x=v1[0]-v0[0],e1y=v1[1]-v0[1],e1z=v1[2]-v0[2];
  const e2x=v2[0]-v0[0],e2y=v2[1]-v0[1],e2z=v2[2]-v0[2];
  const cz=e1x*e2y-e1y*e2x;
  const clen=Math.sqrt((e1y*e2z-e1z*e2y)**2+(e1z*e2x-e1x*e2z)**2+cz*cz);
  return clen>1e-12?cz/clen:0;
}

// ── Möller–Trumbore for D=(0,0,−1) ───────────────────────────────────────────
function intersectDown(ox,oy,oz,tri,minT) {
  const [v0,v1,v2]=tri.v;
  const e1x=v1[0]-v0[0],e1y=v1[1]-v0[1],e1z=v1[2]-v0[2];
  const e2x=v2[0]-v0[0],e2y=v2[1]-v0[1],e2z=v2[2]-v0[2];
  const hx=e2y,hy=-e2x;
  const a=e1x*hx+e1y*hy; if(Math.abs(a)<1e-8) return -1;
  const f=1/a, sx=ox-v0[0],sy=oy-v0[1],sz=oz-v0[2];
  const u=f*(sx*hx+sy*hy); if(u<0||u>1) return -1;
  const qx=sy*e1z-sz*e1y,qy=sz*e1x-sx*e1z,qz=sx*e1y-sy*e1x;
  const v_=f*(-qz); if(v_<0||u+v_>1) return -1;
  const t=f*(e2x*qx+e2y*qy+e2z*qz);
  return t>minT?t:-1;
}
function buildMinZCache(tris) {
  const a=new Float64Array(tris.length);
  for(let i=0;i<tris.length;i++) { const v=tris[i].v; a[i]=Math.min(v[0][2],v[1][2],v[2][2]); }
  return a;
}
function rayDown(ox,oy,oz,tris,selfIdx,minZArr) {
  const EPS=0.5, MINT=0.5, rz=oz+EPS; let best=Infinity;
  for(let i=0;i<tris.length;i++) {
    if(i===selfIdx||minZArr[i]>=rz) continue;
    const t=intersectDown(ox,oy,rz,tris[i],MINT);
    if(t>0&&t<best) best=t;
  }
  return best;
}

// ── Main analysis with variable floor ────────────────────────────────────────
// floorMm: absolute mm above minZ to add as exclusion floor
//          (uses max(3% of height, floorMm) as actual ground cut)
function analyze(label, path, nzThresh, maxSamples, floorMm) {
  console.log(`\n${'═'.repeat(68)}`);
  console.log(`  ${label}`);
  console.log('═'.repeat(68));

  let tris;
  try { tris = parseSTL(path); }
  catch (e) { console.log(`  ERROR: ${e.message}`); return; }

  let minZ=Infinity, maxZ=-Infinity;
  for (const t of tris) for (const v of t.v) {
    if(v[2]<minZ) minZ=v[2]; if(v[2]>maxZ) maxZ=v[2];
  }
  const H     = maxZ - minZ;
  const pct3  = minZ + H * 0.03;         // original 3%-of-height floor
  const absF  = minZ + floorMm;           // absolute floor
  const gndZ  = Math.max(pct3, absF);     // use whichever is higher

  console.log(`  H=${H.toFixed(1)}mm  3%-floor=${pct3.toFixed(2)}mm  abs-floor=${absF.toFixed(2)}mm  active-floor=${gndZ.toFixed(2)}mm`);

  const minZArr = buildMinZCache(tris);

  const cands = [];
  for (let i = 0; i < tris.length; i++) {
    const t = tris[i];
    const avgZ = (t.v[0][2]+t.v[1][2]+t.v[2][2])/3;
    if (avgZ < gndZ) continue;
    if (faceNZ(t) < nzThresh) cands.push({ i, avgZ });
  }
  console.log(`  Candidates: ${cands.length.toLocaleString()}  (NZ < ${nzThresh})`);
  if (cands.length === 0) { console.log('  No candidates.'); return; }

  let sample = cands;
  if (cands.length > maxSamples) {
    const step = Math.ceil(cands.length / maxSamples);
    sample = cands.filter((_,idx) => idx%step===0);
  }
  process.stdout.write(`  Sampling ${sample.length} faces, raycasting...`);
  const t0 = Date.now();

  const results = [];
  for (const cand of sample) {
    const tri = tris[cand.i];
    const cx = (tri.v[0][0]+tri.v[1][0]+tri.v[2][0])/3;
    const cy = (tri.v[0][1]+tri.v[1][1]+tri.v[2][1])/3;
    const dist = rayDown(cx, cy, cand.avgZ, tris, cand.i, minZArr);
    results.push({ dist, avgZ: cand.avgZ });
  }
  console.log(` done ${((Date.now()-t0)/1000).toFixed(1)}s`);

  const N     = results.length;
  const noHit = results.filter(r => r.dist===Infinity);
  const w10   = results.filter(r => r.dist<=10).length;
  const nhPct = (noHit.length/N*100).toFixed(1);
  const w10Pct= (w10/N*100).toFixed(1);

  console.log(`  Summary: ${N} samples | no-hit ${noHit.length} (${nhPct}%) | hit≤10mm ${w10} (${w10Pct}%)`);

  // Z-histogram of no-hit samples (8 buckets, gndZ → maxZ)
  const nBkt = 8;
  const bktH = (maxZ - gndZ) / nBkt;
  console.log(`\n  Z distribution of no-hit faces (each bucket = ${bktH.toFixed(1)}mm):`);
  console.log(`  Z range (mm)             │ No-hit │ Total │ No-hit% │ bar`);
  console.log(`  ─────────────────────────┼────────┼───────┼─────────┼──────────────`);
  for (let b = 0; b < nBkt; b++) {
    const bLo = gndZ + b * bktH;
    const bHi = bLo + bktH;
    const inBkt  = results.filter(r => r.avgZ >= bLo && r.avgZ < bHi);
    const nhBkt  = inBkt.filter(r => r.dist===Infinity);
    const pct    = inBkt.length > 0 ? (nhBkt.length/inBkt.length*100).toFixed(0) : '-';
    const bar    = '█'.repeat(Math.round((nhBkt.length/Math.max(1,inBkt.length))*20));
    const bStr   = `${bLo.toFixed(1)}–${bHi.toFixed(1)}`;
    console.log(`  ${bStr.padEnd(24)} │ ${String(nhBkt.length).padStart(6)} │ ${String(inBkt.length).padStart(5)} │ ${String(pct).padStart(7)}% │ ${bar}`);
  }
}

// ── File paths ────────────────────────────────────────────────────────────────
const BENCHY = 'c:/Users/j.b.aguilar.gonzalez/Downloads/#3DBenchy - The jolly 3D printing torture-test by CreativeTools.se - 763622 - part 2 of 2/files/3DBenchy.stl';
const GOKU   = 'c:/Users/j.b.aguilar.gonzalez/Downloads/Goku - 6665508/files/gokufixed1.stl';

// ── Run: Benchy at multiple floor thresholds ──────────────────────────────────
console.log('\n  PART A — Ground floor exclusion effect on Benchy no-hit rate\n');
analyze('Benchy  floor=0mm  (current: 3%H = 1.44mm)', BENCHY, -0.766, 1000, 0);
analyze('Benchy  floor=2mm  (abs)',                    BENCHY, -0.766, 1000, 2);
analyze('Benchy  floor=5mm  (abs)',                    BENCHY, -0.766, 1000, 5);
analyze('Benchy  floor=10mm (abs)',                    BENCHY, -0.766, 1000, 10);
analyze('Benchy  floor=20mm (abs)',                    BENCHY, -0.766, 1000, 20);

// ── Goku: confirm arm is unaffected by a 2mm absolute floor ───────────────────
console.log('\n\n  PART A — Goku: confirming 2mm floor does not affect arm overhangs\n');
analyze('Goku  floor=0mm  (current: 3%H = 9.4mm)', GOKU, -0.766, 1000, 0);
analyze('Goku  floor=2mm  (abs)',                   GOKU, -0.766, 1000, 2);

console.log(`\n${'═'.repeat(68)}\n`);
