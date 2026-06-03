// Server-side only — uses Three.js geometry processing (no WebGL needed).
// Only imported via dynamic import() from app/api/orders/route.ts
// to avoid bundling Three.js into every server action.
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

/**
 * Scale a File containing a binary or ASCII STL by `factor` and return a new File.
 * The vertex positions are baked into the output geometry — no transform matrix.
 *
 * @param inputFile   The original File from FormData
 * @param factor      Scale factor, e.g. 0.25 for 25%
 * @returns           A new File with the scaled geometry, named "scaled.stl"
 */
export async function scaleSTLFile(inputFile: File, factor: number): Promise<File> {
  const arrayBuffer = await inputFile.arrayBuffer();

  const loader   = new STLLoader();
  const geometry = loader.parse(arrayBuffer);

  // Bake the scale into vertex positions
  geometry.scale(factor, factor, factor);

  const mesh     = new THREE.Mesh(geometry);
  const exporter = new STLExporter();
  const result   = exporter.parse(mesh, { binary: true }) as Uint8Array;

  return new File([result], "scaled.stl", { type: "model/stl" });
}
