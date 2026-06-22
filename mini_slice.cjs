'use strict';
// mini_slice.cjs — Part B: layer-by-layer unsupported-area detection
//
// Hypothesis: divide the model into N horizontal Z-bands, rasterize each
// band's geometry onto a 2D XY grid, then compare band_i to band_(i-1).
// A cell in band_i that has no occupied cell within `bridgingMm` in
// band_(i-1) is "unsupported".  Aggregate over all bands → support level.
//
// Convention: Z-up (raw STL space), same as analyze scripts.
// No interior fill — uses surface-cell rasterization only.

const fs = require('fs');

// ── STL parser (same as other validation scripts) ─────────────────────────────
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
    for(let j=0;j<3;j++,off+=12) v.push([buf.readFloatLE(off),buf.readFloatLE(off+4),buf.readFloatLE(off+8)]);
    off+=2; out.push({n:[nx,ny,nz],v});
  }
  return out;
}
function parseASCII(text) {
  const re=/facet\s+normal\s+([\S]+)\s+([\S]+)\s+([\S]+)[\s\S]*?vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)\s*vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)\s*vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)/g;
  const out=[]; let m;
  while((m=re.exec(text))!==null)
    out.push({n:[+m[1],+m[2],+m[3]],v:[[+m[4],+m[5],+m[6]],[+m[7],+m[8],+m[9]],[+m[10],+m[11],+m[12]]]});
  return out;
}

// ── L∞ dilation of a binary grid ─────────────────────────────────────────────
// Marks all cells within k cells (square neighbourhood) of any occupied source cell.
function dilate(src, cols, rows, k) {
  const dst = new Uint8Array(cols * rows);
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (!src[gy * cols + gx]) continue;
      const x0=Math.max(0,gx-k), x1=Math.min(cols-1,gx+k);
      const y0=Math.max(0,gy-k), y1=Math.min(rows-1,gy+k);
      for (let y=y0; y<=y1; y++) {
        const row = y * cols;
        for (let x=x0; x<=x1; x++) dst[row+x] = 1;
      }
    }
  }
  return dst;
}

// ── Rasterize one Z band ──────────────────────────────────────────────────────
// Samples each triangle at 15 barycentric points (triangular grid n=4).
// Only points within [zLo, zHi] contribute.
function rasterizeBand(tris, zLo, zHi, xMin, yMin, cols, rows, cellSize, band) {
  const N = 4; // grid size → 15 samples per triangle
  for (const tri of tris) {
    const [v0,v1,v2] = tri.v;
    // Quick Z filter
    const triMinZ = Math.min(v0[2],v1[2],v2[2]);
    const triMaxZ = Math.max(v0[2],v1[2],v2[2]);
    if (triMaxZ < zLo || triMinZ > zHi) continue;

    for (let si=0; si<=N; si++) {
      const u = si / N;
      for (let sj=0; sj<=N-si; sj++) {
        const vv=sj/N, w=1-u-vv;
        const x = u*v0[0] + vv*v1[0] + w*v2[0];
        const y = u*v0[1] + vv*v1[1] + w*v2[1];
        const z = u*v0[2] + vv*v1[2] + w*v2[2];
        if (z < zLo || z > zHi) continue;
        const gx = Math.floor((x-xMin)/cellSize);
        const gy = Math.floor((y-yMin)/cellSize);
        if (gx<0||gx>=cols||gy<0||gy>=rows) continue;
        band[gy*cols+gx] = 1;
      }
    }
  }
}

// ── Main analysis ─────────────────────────────────────────────────────────────
function analyzeSlice(label, path, nBands, cellSize, bridgingMm) {
  console.log(`\n${'═'.repeat(68)}`);
  console.log(`  ${label}`);
  console.log(`  nBands=${nBands}  cell=${cellSize}mm  bridge=${bridgingMm}mm`);
  console.log('═'.repeat(68));

  let tris;
  try { tris = parseSTL(path); }
  catch(e) { console.log(`  ERROR: ${e.message}`); return; }

  // Bounds
  let xMin=Infinity,xMax=-Infinity,yMin=Infinity,yMax=-Infinity,zMin=Infinity,zMax=-Infinity;
  for (const t of tris) for (const v of t.v) {
    if(v[0]<xMin)xMin=v[0]; if(v[0]>xMax)xMax=v[0];
    if(v[1]<yMin)yMin=v[1]; if(v[1]>yMax)yMax=v[1];
    if(v[2]<zMin)zMin=v[2]; if(v[2]>zMax)zMax=v[2];
  }
  const H     = zMax - zMin;
  const bandH = H / nBands;
  const cols  = Math.ceil((xMax-xMin)/cellSize) + 2;
  const rows  = Math.ceil((yMax-yMin)/cellSize) + 2;
  const bKc   = Math.ceil(bridgingMm/cellSize);   // bridging in cells
  const gSize = cols * rows;

  console.log(`  Triangles : ${tris.length.toLocaleString()}`);
  console.log(`  Z range   : [${zMin.toFixed(1)}, ${zMax.toFixed(1)}] mm   H=${H.toFixed(1)} mm`);
  console.log(`  Band height: ${bandH.toFixed(2)} mm`);
  console.log(`  Grid      : ${cols}×${rows} = ${(gSize).toLocaleString()} cells  (X:${(xMax-xMin).toFixed(0)}mm Y:${(yMax-yMin).toFixed(0)}mm)`);
  console.log(`  Bridge    : ≤${bKc} cells = ≤${bKc*cellSize}mm (L∞)`);

  const t0 = Date.now();

  let totalOcc  = 0;
  let totalUnsp = 0;
  let prevBand  = null;

  // Per-band stats for showing where unsupported area is in the model
  const bandStats = [];

  for (let b = 0; b < nBands; b++) {
    const zLo = zMin + b * bandH;
    const zHi = zLo + bandH;
    const curr = new Uint8Array(gSize);

    rasterizeBand(tris, zLo, zHi, xMin, yMin, cols, rows, cellSize, curr);

    const occ  = curr.reduce((s,v)=>s+v, 0);
    totalOcc  += occ;

    let unsp = 0;
    if (b === 0 || prevBand === null) {
      // First band: supported by build plate — nothing counts as unsupported
      prevBand = curr;
      bandStats.push({ b, zLo, zHi, occ, unsp: 0 });
      continue;
    }

    // Dilate previous band by bridging cells
    const dilated = dilate(prevBand, cols, rows, bKc);

    // Count unsupported cells in curr that have no support within bridging tolerance
    for (let i = 0; i < gSize; i++) {
      if (curr[i] && !dilated[i]) unsp++;
    }
    totalUnsp += unsp;
    bandStats.push({ b, zLo, zHi, occ, unsp });
    prevBand = curr;
  }

  const elapsed = ((Date.now()-t0)/1000).toFixed(2);
  const ratio   = totalOcc > 0 ? (totalUnsp/totalOcc*100) : 0;

  console.log(`  Done in   : ${elapsed}s`);
  console.log(`  Total cells (all bands): occ=${totalOcc.toLocaleString()}  unsp=${totalUnsp.toLocaleString()}`);
  console.log(`  Unsupported area ratio : ${ratio.toFixed(2)}%`);

  // Per-band summary (only bands with unsupported cells, + context bands around them)
  const hasUnsp = bandStats.some(s => s.unsp > 0);
  if (hasUnsp) {
    console.log(`\n  Bands with unsupported area (unsp/occ > 5%):`);
    console.log(`  Band │  Z range (mm)    │  Occ  │  Unsp │  %`);
    console.log(`  ─────┼──────────────────┼───────┼───────┼──────`);
    for (const s of bandStats) {
      const pct = s.occ > 0 ? s.unsp/s.occ*100 : 0;
      if (pct < 5) continue;
      console.log(`  ${String(s.b).padStart(4)} │ ${s.zLo.toFixed(1).padStart(6)}–${s.zHi.toFixed(1).padEnd(7)}  │ ${String(s.occ).padStart(5)} │ ${String(s.unsp).padStart(5)} │ ${pct.toFixed(0)}%`);
    }
  } else {
    console.log('  No bands have unsupported area > 5%.');
  }

  // Support level mapping
  const lvl = ratio < 3 ? 'none' : ratio < 10 ? 'light' : ratio < 25 ? 'moderate' : 'heavy';
  console.log(`\n  → Unsupported ratio: ${ratio.toFixed(1)}%  →  support level: "${lvl}"`);
  return ratio;
}

// ── Paths ─────────────────────────────────────────────────────────────────────
const BENCHY = 'c:/Users/j.b.aguilar.gonzalez/Downloads/#3DBenchy - The jolly 3D printing torture-test by CreativeTools.se - 763622 - part 2 of 2/files/3DBenchy.stl';
const GOKU   = 'c:/Users/j.b.aguilar.gonzalez/Downloads/Goku - 6665508/files/gokufixed1.stl';

// ── Test multiple bridging tolerances ─────────────────────────────────────────
console.log('\n  PART B — Mini-slicing unsupported area detection\n');

// Fixed params: 40 bands, 1mm grid
// Vary bridging tolerance: 5mm, 10mm, 15mm
const NBANDS = 40;
const CELL   = 1.0;

console.log('\n── nBands=40  cellSize=1mm ─────────────────────────────────────────────\n');
for (const bridge of [5, 10, 15]) {
  analyzeSlice(`3DBenchy   bridge=${bridge}mm`, BENCHY, NBANDS, CELL, bridge);
  analyzeSlice(`gokufixed1 bridge=${bridge}mm`, GOKU,   NBANDS, CELL, bridge);
}

// Also try coarser grid for performance reference
console.log('\n── nBands=40  cellSize=2mm  bridge=10mm  (performance reference) ───────\n');
analyzeSlice('3DBenchy   cell=2mm bridge=10mm', BENCHY, NBANDS, 2.0, 10);
analyzeSlice('gokufixed1 cell=2mm bridge=10mm', GOKU,   NBANDS, 2.0, 10);

console.log(`\n${'═'.repeat(68)}\n`);
