// Runs the exact same analyzeSupportNeeds + FDM pricing logic as the browser code,
// in Node.js against real STL files on disk.
const fs = require("fs");

// ── STL parser ────────────────────────────────────────────────────────────────
// Proper binary-vs-ASCII detection: a valid binary STL has size = 84 + numTri*50.
// Do NOT rely on the 80-byte header string (binary STLs often start with "solid").

function parseSTL(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 84) throw new Error("File too small to be a valid STL");

  const numTrisBinary = buf.readUInt32LE(80);
  const expectedBinarySize = 84 + numTrisBinary * 50;

  if (buf.length === expectedBinarySize) {
    return parseBinarySTL(buf, numTrisBinary);
  }

  // Try ASCII
  const text = buf.toString("ascii");
  const tris = parseASCIISTL(text);
  if (tris.length > 0) return tris;

  // Fallback: just try binary anyway
  return parseBinarySTL(buf, numTrisBinary);
}

function parseBinarySTL(buf, numTriangles) {
  const triangles = [];
  let offset = 84;
  for (let i = 0; i < numTriangles; i++) {
    const nx = buf.readFloatLE(offset);
    const ny = buf.readFloatLE(offset + 4);
    const nz = buf.readFloatLE(offset + 8);
    offset += 12;
    const verts = [];
    for (let v = 0; v < 3; v++) {
      verts.push([
        buf.readFloatLE(offset),
        buf.readFloatLE(offset + 4),
        buf.readFloatLE(offset + 8),
      ]);
      offset += 12;
    }
    offset += 2;
    triangles.push({ n: [nx, ny, nz], v: verts });
  }
  return triangles;
}

function parseASCIISTL(text) {
  const triangles = [];
  const facetRe = /facet\s+normal\s+([\S]+)\s+([\S]+)\s+([\S]+)[\s\S]*?vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)\s*vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)\s*vertex\s+([\S]+)\s+([\S]+)\s+([\S]+)/g;
  let m;
  while ((m = facetRe.exec(text)) !== null) {
    triangles.push({
      n: [parseFloat(m[1]),  parseFloat(m[2]),  parseFloat(m[3])],
      v: [
        [parseFloat(m[4]),  parseFloat(m[5]),  parseFloat(m[6])],
        [parseFloat(m[7]),  parseFloat(m[8]),  parseFloat(m[9])],
        [parseFloat(m[10]), parseFloat(m[11]), parseFloat(m[12])],
      ],
    });
  }
  return triangles;
}

// ── Exact mirror of analyzeSupportNeeds (current code in ModelViewer.jsx) ─────

function analyzeSupportNeeds(triangles) {
  let minY = Infinity, maxY = -Infinity;
  for (const t of triangles) {
    for (const v of t.v) {
      if (v[1] < minY) minY = v[1];
      if (v[1] > maxY) maxY = v[1];
    }
  }

  const modelHeight      = maxY - minY;
  const modelBottom      = minY;
  const GROUND_THRESHOLD = modelHeight * 0.03;

  let totalFaces           = 0;
  let overhangFaces        = 0;
  let extremeOverhangCount = 0;

  for (const t of triangles) {
    const avgY = (t.v[0][1] + t.v[1][1] + t.v[2][1]) / 3;
    if (avgY - modelBottom < GROUND_THRESHOLD) continue;

    // Mirror Three.js: STLLoader sets all 3 vertex normals to the face normal.
    // If stored normal is zero-length (degenerate), compute from cross product.
    let ny = t.n[1];
    const nLen = Math.sqrt(t.n[0] ** 2 + ny ** 2 + t.n[2] ** 2);
    if (nLen < 1e-6) {
      const [v1, v2, v3] = t.v;
      const e1 = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      const e2 = [v3[0]-v1[0], v3[1]-v1[1], v3[2]-v1[2]];
      const cx = e1[1]*e2[2] - e1[2]*e2[1];
      const cy = e1[2]*e2[0] - e1[0]*e2[2];
      const cz = e1[0]*e2[1] - e1[1]*e2[0];
      const cLen = Math.sqrt(cx*cx + cy*cy + cz*cz);
      ny = cLen > 1e-12 ? cy / cLen : 0;
    }
    const avgNY = ny;  // == (ny1 + ny2 + ny3) / 3 since all 3 equal face normal

    totalFaces++;
    if (avgNY < -0.766) overhangFaces++;
    if (avgNY < -0.95)  extremeOverhangCount++;
  }

  const overhangRatio       = totalFaces > 0 ? overhangFaces / totalFaces : 0;
  const extremeClusterFloor = Math.max(3, totalFaces * 0.003);
  const needsExtremeFloor   = extremeOverhangCount >= extremeClusterFloor;

  let supportLevel;
  if      (overhangRatio < 0.03) supportLevel = "none";
  else if (overhangRatio < 0.10) supportLevel = "light";
  else if (overhangRatio < 0.25) supportLevel = "moderate";
  else                            supportLevel = "heavy";

  const SUPPORT_RANK = { none: 0, light: 1, moderate: 2, heavy: 3 };
  if (needsExtremeFloor && SUPPORT_RANK[supportLevel] < SUPPORT_RANK["moderate"]) {
    supportLevel = "moderate";
  }

  const EXTRA = {
    none:     { material: 0.00, time: 0.00 },
    light:    { material: 0.05, time: 0.08 },
    moderate: { material: 0.15, time: 0.20 },
    heavy:    { material: 0.30, time: 0.40 },
  };

  return {
    totalFaces, overhangFaces, overhangRatio,
    extremeOverhangCount, extremeClusterFloor, needsExtremeFloor,
    supportLevel,
    supportExtraMaterial: EXTRA[supportLevel].material,
    supportExtraTime:     EXTRA[supportLevel].time,
  };
}

// ── Volume + bounding box ─────────────────────────────────────────────────────

function calcGeometry(triangles) {
  let vol = 0;
  let minX=Infinity, minY=Infinity, minZ=Infinity;
  let maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;
  for (const t of triangles) {
    const [a, b, c] = t.v;
    vol += (a[0]*(b[1]*c[2]-b[2]*c[1]) + a[1]*(b[2]*c[0]-b[0]*c[2]) + a[2]*(b[0]*c[1]-b[1]*c[0])) / 6;
    for (const v of [a, b, c]) {
      if (v[0]<minX) minX=v[0]; if (v[0]>maxX) maxX=v[0];
      if (v[1]<minY) minY=v[1]; if (v[1]>maxY) maxY=v[1];
      if (v[2]<minZ) minZ=v[2]; if (v[2]>maxZ) maxZ=v[2];
    }
  }
  return { volumeMM3: Math.abs(vol), x: maxX-minX, y: maxY-minY, z: maxZ-minZ };
}

// ── FDM pricing (mirror of pricingEngine.js) ──────────────────────────────────

function calcFDMPrice({ weightGrams, pricePerGram, suppMat = 0, suppTime = 0,
  operatorRate, prepHours, postHours, failureRate,
  amortPerHour, elecPerHour, gPerHour,
  markup = 2.5, minimumPrice = 5000, supportLevel = "none" }) {

  const SUPPORT_POST_HOURS = { none: 0, light: 0.25, moderate: 0.75, heavy: 1.5 };
  const SF = { maxW: 30, maxH: 1.0, laborH: 0.25 };

  const materialBase  = weightGrams * pricePerGram;
  const supportMat    = materialBase * suppMat;
  const basePrintH    = weightGrams / gPerHour;
  const printH        = basePrintH * (1 + suppTime);
  const electricity   = printH * elecPerHour;
  const amortization  = printH * amortPerHour;
  const isSmall       = weightGrams < SF.maxW && basePrintH < SF.maxH && (supportLevel === "none" || supportLevel === "light");
  const labor         = isSmall
    ? operatorRate * SF.laborH
    : operatorRate * (prepHours + postHours + (SUPPORT_POST_HOURS[supportLevel] || 0));
  const costReal      = (materialBase + supportMat + electricity + amortization + labor) * (1 + failureRate);
  const salePrice     = Math.max(minimumPrice, Math.round(costReal * markup / 500) * 500);

  return { weightGrams, basePrintH, printH, isSmall, materialBase, supportMat, electricity, amortization, labor, costReal, salePrice };
}

// ── Hi Combo printer cost rates ───────────────────────────────────────────────

const HI_COMBO = (() => {
  const totalH = 2 * 312 * 10;  // amortizationYears=2, daysPerYear=312, hoursPerDay=10
  return {
    gPerHour:     18,
    amortPerHour: 520000 / totalH,
    elecPerHour:  (350 / 1000) * 150,
    operatorRate: 3500,
    prepHours:    0.5,
    postHours:    0.5,
    failureRate:  0.10,
  };
})();

// ── Run one test ──────────────────────────────────────────────────────────────

function runTest(label, stlPath, noteScale) {
  console.log("\n" + "═".repeat(62));
  console.log(`  TEST: ${label}`);
  console.log("═".repeat(62));

  let triangles;
  try {
    triangles = parseSTL(stlPath);
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
    return;
  }

  const geo     = calcGeometry(triangles);
  const support = analyzeSupportNeeds(triangles);

  const solidWeightG = (geo.volumeMM3 / 1000) * 1.24;     // PLA+ density
  const fdmWeightG   = solidWeightG * 0.65;                 // infill factor

  const pricing = calcFDMPrice({
    weightGrams: fdmWeightG,
    pricePerGram: 11.96,
    suppMat:   support.supportExtraMaterial,
    suppTime:  support.supportExtraTime,
    ...HI_COMBO,
    supportLevel: support.supportLevel,
  });

  console.log(`\n  GEOMETRY (${triangles.length.toLocaleString()} triangles)`);
  console.log(`    Size (mm):      X ${geo.x.toFixed(1)}  Y ${geo.y.toFixed(1)}  Z ${geo.z.toFixed(1)}`);
  console.log(`    Volume:         ${geo.volumeMM3.toFixed(0)} mm³`);
  console.log(`    Solid weight:   ${solidWeightG.toFixed(2)} g`);
  console.log(`    FDM weight:     ${fdmWeightG.toFixed(2)} g  (×0.65 infill)`);
  if (noteScale) console.log(`    Note: ${noteScale}`);

  console.log(`\n  OVERHANG DETECTION`);
  console.log(`    totalFaces:           ${support.totalFaces.toLocaleString()}`);
  console.log(`    overhangFaces:        ${support.overhangFaces.toLocaleString()}  (avgNY < −0.766, ≥50°)`);
  console.log(`    overhangRatio:        ${(support.overhangRatio * 100).toFixed(2)}%`);
  console.log(`    extremeOverhangCount: ${support.extremeOverhangCount.toLocaleString()}  (avgNY < −0.95, ≥72°)`);
  console.log(`    extremeClusterFloor:  ${support.extremeClusterFloor.toFixed(1)}  (max(3, totalFaces×0.003))`);
  console.log(`    needsExtremeFloor:    ${support.needsExtremeFloor}`);
  console.log(`    supportLevel:         "${support.supportLevel}"`);

  console.log(`\n  PRICING  (PLA+ ₡11.96/g · Hi Combo std 18g/h · op ₡3500/h · markup 2.5×)`);
  console.log(`    basePrintHours:  ${(pricing.basePrintH * 60).toFixed(1)} min`);
  console.log(`    printHours:      ${(pricing.printH * 60).toFixed(1)} min  (incl. support time overhead)`);
  console.log(`    isSmallFastPart: ${pricing.isSmall}`);
  console.log(`    materialBase:    ₡${Math.round(pricing.materialBase)}`);
  console.log(`    supportMat:      ₡${Math.round(pricing.supportMat)}`);
  console.log(`    electricity:     ₡${Math.round(pricing.electricity)}`);
  console.log(`    amortization:    ₡${Math.round(pricing.amortization)}`);
  console.log(`    labor:           ₡${Math.round(pricing.labor)}`);
  console.log(`    costReal:        ₡${Math.round(pricing.costReal)}`);
  console.log(`  ──────────────────────────────────────────────────────────`);
  console.log(`    salePrice:       ₡${pricing.salePrice.toLocaleString()}`);
}

// ── File paths ────────────────────────────────────────────────────────────────

const BENCHY = "c:/Users/j.b.aguilar.gonzalez/Downloads/#3DBenchy - The jolly 3D printing torture-test by CreativeTools.se - 763622 - part 2 of 2/files/3DBenchy.stl";
const GOKU   = "c:/Users/j.b.aguilar.gonzalez/Downloads/Goku - 6665508/files/gokufixed1.stl";
const GOKU_SCALED = "c:/Users/j.b.aguilar.gonzalez/Downloads/inity3d_order_17_scaled goku.stl";

runTest("3DBenchy.stl", BENCHY);
runTest("gokufixed1.stl  (original, unscaled)", GOKU,
  "browser test used scale ~50%; FDM weight at 50% = above × (0.5³) = ×0.125");
runTest("inity3d_order_17_scaled goku.stl  (the actual file from the dashboard order)", GOKU_SCALED);

console.log("\n" + "═".repeat(62) + "\n");
