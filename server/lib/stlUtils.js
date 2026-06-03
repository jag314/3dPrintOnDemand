// Server-side STL scaling using Three.js (no WebGL required — pure geometry).
// Only STL files are scaled; OBJ / 3MF are returned as-is with a warning.

import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

/**
 * Scale a binary or ASCII STL buffer by `scaleFactor` and return a new Buffer.
 * @param {Buffer} inputBuffer  Raw file bytes
 * @param {number} scaleFactor  e.g. 0.25 for 25%
 * @returns {Buffer}
 */
export function scaleSTL(inputBuffer, scaleFactor) {
  // Node Buffer → ArrayBuffer
  const arrayBuffer = inputBuffer.buffer.slice(
    inputBuffer.byteOffset,
    inputBuffer.byteOffset + inputBuffer.byteLength
  );

  const loader   = new STLLoader();
  const geometry = loader.parse(arrayBuffer);

  // Bake the scale into the vertex positions
  geometry.scale(scaleFactor, scaleFactor, scaleFactor);

  const mesh      = new THREE.Mesh(geometry);
  const exporter  = new STLExporter();
  const result    = exporter.parse(mesh, { binary: true }); // Uint8Array

  return Buffer.from(result.buffer);
}

/**
 * Returns true if the filename has an STL extension.
 */
export function isSTL(filename) {
  return /\.stl$/i.test(filename || '');
}
