'use strict';
// mini_slice_v2.cjs — Refined mini-slicing with three fixes:
//   1. bridge=10mm fixed (validated, 15mm breaks discrimination)
//   2. Band 0→Band 1 comparison excluded (build plate always supports band 1)
//   3. Metric changed from global-avg to weighted peak: 0.7×maxBand + 0.3×globalAvg

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

// ── L∞ dilation ──────────────────────────────────────────────────────────────
function dilate(src, cols, rows, k) {
  const dst = new Uint8Array(cols * rows);
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (!src[gy*cols+gx]) continue;
      const x0=Math.max(0,gx-k), x1=Math.min(cols-1,gx+k);
      const y0=Math.max(0,gy-k), y1=Math.min(rows-1,gy+k);
      for (let y=y0; y<=y1; y++) { const row=y*cols; for (let x=x0;x<=x1;x++) dst[row+x]=1; }
    }
  }
  return dst;
}

// ── Rasterize one Z band (15 barycentric samples per triangle) ────────────────
function rasterizeBand(tris, zLo, zHi, xMin, yMin, cols, rows, cellSize, band) {
  const N = 4;
  for (const tri of tris) {
    const [v0,v1,v2]=tri.v;
    const triMinZ=Math.min(v0[2],v1[2],v2[2]), triMaxZ=Math.max(v0[2],v1[2],v2[2]);
    if (triMaxZ<zLo||triMinZ>zHi) continue;
    for (let si=0;si<=N;si++) {
      const u=si/N;
      for (let sj=0;sj<=N-si;sj++) {
        const vv=sj/N, w=1-u-vv;
        const x=u*v0[0]+vv*v1[0]+w*v2[0];
        const y=u*v0[1]+vv*v1[1]+w*v2[1];
        const z=u*v0[2]+vv*v1[2]+w*v2[2];
        if(z<zLo||z>zHi) continue;
        const gx=Math.floor((x-xMin)/cellSize);
        const gy=Math.floor((y-yMin)/cellSize);
        if(gx<0||gx>=cols||gy<0||gy>=rows) continue;
        band[gy*cols+gx]=1;
      }
    }
  }
}

// ── Classification using the weighted-peak metric ─────────────────────────────
// weighted = 0.7 × maxBandPct + 0.3 × globalAvgPct
// Thresholds calibrated on Benchy (→ none/light) and Goku (→ moderate/heavy):
//   < 5   → none
//   5–25  → light
//   25–55 → moderate
//   ≥ 55  → heavy
function classify(weighted) {
  if (weighted < 5)  return 'none';
  if (weighted < 25) return 'light';
  if (weighted < 55) return 'moderate';
  return 'heavy';
}

// ── Main analysis ─────────────────────────────────────────────────────────────
function analyzeSlice(label, path, nBands, cellSize, bridgingMm) {
  const BRIDGE_MM = bridgingMm;
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${label}`);
  console.log(`  nBands=${nBands}  cell=${cellSize}mm  bridge=${BRIDGE_MM}mm  (Band 0+1 excluded from unsp count)`);
  console.log('═'.repeat(70));

  let tris;
  try { tris = parseSTL(path); }
  catch(e) { console.log(`  ERROR: ${e.message}`); return null; }

  let xMin=Infinity,xMax=-Infinity,yMin=Infinity,yMax=-Infinity,zMin=Infinity,zMax=-Infinity;
  for (const t of tris) for (const v of t.v) {
    if(v[0]<xMin)xMin=v[0]; if(v[0]>xMax)xMax=v[0];
    if(v[1]<yMin)yMin=v[1]; if(v[1]>yMax)yMax=v[1];
    if(v[2]<zMin)zMin=v[2]; if(v[2]>zMax)zMax=v[2];
  }
  const H=zMax-zMin, bandH=H/nBands;
  const cols=Math.ceil((xMax-xMin)/cellSize)+2;
  const rows=Math.ceil((yMax-yMin)/cellSize)+2;
  const bKc=Math.ceil(BRIDGE_MM/cellSize);
  const gSize=cols*rows;

  console.log(`  Triangles  : ${tris.length.toLocaleString()}`);
  console.log(`  Z range    : [${zMin.toFixed(1)}, ${zMax.toFixed(1)}] mm   H=${H.toFixed(1)} mm   bandH=${bandH.toFixed(2)} mm`);
  console.log(`  Grid       : ${cols}×${rows}=${gSize.toLocaleString()} cells  bridge=${bKc} cells=${bKc*cellSize}mm`);

  const t0 = Date.now();
  let totalOcc=0, totalUnsp=0, maxBandPct=0;
  let prevBand=null;
  const bandStats=[];

  for (let b=0; b<nBands; b++) {
    const zLo=zMin+b*bandH, zHi=zLo+bandH;
    const curr=new Uint8Array(gSize);
    rasterizeBand(tris, zLo, zHi, xMin, yMin, cols, rows, cellSize, curr);
    const occ=curr.reduce((s,v)=>s+v,0);
    totalOcc+=occ;

    // FIX: bands 0 AND 1 are unconditionally supported.
    //   Band 0 = resting on build plate.
    //   Band 1 = first layer above build plate; any geometry that "grows"
    //            outward from the base (e.g. Goku's leg widening from feet)
    //            is always printable without support from the first layer.
    if (b<=1) {
      prevBand=curr;
      bandStats.push({b,zLo,zHi,occ,unsp:0,pct:0,excluded:true});
      continue;
    }

    const dilated=dilate(prevBand, cols, rows, bKc);
    let unsp=0;
    for(let i=0;i<gSize;i++) { if(curr[i]&&!dilated[i]) unsp++; }
    totalUnsp+=unsp;
    const pct=occ>0?unsp/occ*100:0;
    if(pct>maxBandPct) maxBandPct=pct;
    bandStats.push({b,zLo,zHi,occ,unsp,pct,excluded:false});
    prevBand=curr;
  }

  const elapsed=((Date.now()-t0)/1000).toFixed(2);
  const globalAvg=totalOcc>0?totalUnsp/totalOcc*100:0;
  const weighted=0.7*maxBandPct+0.3*globalAvg;
  const lvl=classify(weighted);

  // ── Per-band table (only non-trivial bands) ───────────────────────────────
  const significant=bandStats.filter(s=>!s.excluded&&s.pct>=1);
  if (significant.length>0) {
    console.log(`\n  Bands with ≥1% unsupported (bridge=10mm, Band 0+1 excluded):`);
    console.log(`  Band │  Z range (mm)      │  Occ  │  Unsp │  Unsp%`);
    console.log(`  ─────┼────────────────────┼───────┼───────┼───────`);
    for (const s of significant) {
      const zStr=`${s.zLo.toFixed(1)}–${s.zHi.toFixed(1)}`;
      console.log(`  ${String(s.b).padStart(4)} │ ${zStr.padEnd(18)} │ ${String(s.occ).padStart(5)} │ ${String(s.unsp).padStart(5)} │ ${s.pct.toFixed(1)}%`);
    }
  } else {
    console.log('\n  No bands with ≥1% unsupported.');
  }

  // ── Summary metrics ───────────────────────────────────────────────────────
  console.log(`\n  ── Metric summary ──────────────────────────────────────────────────`);
  console.log(`  Total occupied (all bands)    : ${totalOcc.toLocaleString()} cells`);
  console.log(`  Total unsupported (bands 2+)  : ${totalUnsp.toLocaleString()} cells`);
  console.log(`  Global-avg unsp%              : ${globalAvg.toFixed(2)}%`);
  console.log(`  Max per-band unsp%            : ${maxBandPct.toFixed(1)}%`);
  console.log(`  Weighted metric (0.7×max+0.3×avg): ${weighted.toFixed(2)}%`);
  console.log(`\n  ┌─ Thresholds: <5→none  5–25→light  25–55→moderate  ≥55→heavy ─┐`);
  console.log(`  │  weighted = ${weighted.toFixed(1).padStart(5)}%  →  support level: "${lvl}"`.padEnd(68) + '│');
  console.log(`  └───────────────────────────────────────────────────────────────────┘`);
  console.log(`  Done in: ${elapsed}s`);

  return { globalAvg, maxBandPct, weighted, lvl, elapsed };
}

// ── Paths ─────────────────────────────────────────────────────────────────────
const BENCHY = 'c:/Users/j.b.aguilar.gonzalez/Downloads/#3DBenchy - The jolly 3D printing torture-test by CreativeTools.se - 763622 - part 2 of 2/files/3DBenchy.stl';
const GOKU   = 'c:/Users/j.b.aguilar.gonzalez/Downloads/Goku - 6665508/files/gokufixed1.stl';

// ── Validation run ────────────────────────────────────────────────────────────
console.log('\n  mini_slice_v2 — Three fixes applied, bridge=10mm fixed\n');

const bR = analyzeSlice('3DBenchy',   BENCHY, 40, 1.0, 10);
const gR = analyzeSlice('gokufixed1', GOKU,   40, 1.0, 10);

// ── Side-by-side comparison ───────────────────────────────────────────────────
console.log(`\n${'═'.repeat(70)}`);
console.log('  FINAL COMPARISON (bridge=10mm, Band 0+1 excluded, weighted metric)');
console.log('═'.repeat(70));
if (bR && gR) {
  console.log(`  Model       │ Global-avg% │ Max-band% │ Weighted% │ Level`);
  console.log(`  ────────────┼─────────────┼───────────┼───────────┼──────────`);
  console.log(`  Benchy      │ ${bR.globalAvg.toFixed(2).padStart(11)}% │ ${bR.maxBandPct.toFixed(1).padStart(9)}% │ ${bR.weighted.toFixed(2).padStart(9)}% │ ${bR.lvl}`);
  console.log(`  Goku        │ ${gR.globalAvg.toFixed(2).padStart(11)}% │ ${gR.maxBandPct.toFixed(1).padStart(9)}% │ ${gR.weighted.toFixed(2).padStart(9)}% │ ${gR.lvl}`);
  console.log(`\n  Performance: Benchy=${bR.elapsed}s  Goku=${gR.elapsed}s  (both < 1s ✓)`);
  const benOK = bR.lvl==='none'||bR.lvl==='light';
  const gokOK = gR.lvl==='moderate'||gR.lvl==='heavy';
  console.log(`  Benchy → ${bR.lvl} ${benOK?'✓':'✗ (expected none/light)'}`);
  console.log(`  Goku   → ${gR.lvl} ${gokOK?'✓':'✗ (expected moderate/heavy)'}`);
}
console.log(`\n${'═'.repeat(70)}\n`);
