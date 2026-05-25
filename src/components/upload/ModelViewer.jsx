import { useEffect, useState } from "react";

import { useLoader } from "@react-three/fiber";

import { STLLoader } from "three-stdlib";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import * as THREE from "three";

const materialDensities = {

  PLA: 1.24,

  PETG: 1.27,

  ABS: 1.04,

  Resin: 1.10,

};

const ModelViewer = ({
  file,
  setModelStats,
  selectedMaterial,
}) => {

  const [url, setUrl] = useState("");

  // =========================
  // CREATE OBJECT URL
  // =========================

  useEffect(() => {

    const objectUrl =
      URL.createObjectURL(file);

    setUrl(objectUrl);

    return () => {

      URL.revokeObjectURL(objectUrl);

    };

  }, [file]);

  // WAIT URL

  if (!url) return null;

  // =========================
  // STL FILES
  // =========================

  if (
    file.name.toLowerCase().endsWith(".stl")
  ) {

    const geometry =
      useLoader(STLLoader, url);

    geometry.center();

    geometry.computeBoundingBox();

    const box =
      geometry.boundingBox;

    const size =
      new THREE.Vector3();

    box.getSize(size);

    // DIMENSIONS

    const width =
      size.x.toFixed(1);

    const height =
      size.y.toFixed(1);

    const depth =
      size.z.toFixed(1);

    // =========================
    // REAL GEOMETRY VOLUME
    // =========================

    let volume = 0;

    const position =
      geometry.attributes.position;

    for (
      let i = 0;
      i < position.count;
      i += 3
    ) {

      const p1 =
        new THREE.Vector3(
          position.getX(i),
          position.getY(i),
          position.getZ(i)
        );

      const p2 =
        new THREE.Vector3(
          position.getX(i + 1),
          position.getY(i + 1),
          position.getZ(i + 1)
        );

      const p3 =
        new THREE.Vector3(
          position.getX(i + 2),
          position.getY(i + 2),
          position.getZ(i + 2)
        );

      volume +=
        p1.dot(
          p2.cross(p3)
        ) / 6;

    }

    volume = Math.abs(volume);

    // mm³ → cm³

    const volumeCm3 =
      volume / 1000;

    // =========================
    // MATERIAL DENSITY
    // =========================

    const density =
      materialDensities[
        selectedMaterial
      ] || 1.24;

    // =========================
    // WEIGHT
    // =========================

    const estimatedWeight =
      volumeCm3 * density;

    // =========================
    // PRINT TIME
    // =========================

    const estimatedHours =
      estimatedWeight / 6;

    // =========================
    // COMPLEXITY
    // =========================

    let complexity = "Low";

    if (estimatedWeight > 80)
      complexity = "Medium";

    if (estimatedWeight > 200)
      complexity = "High";

    // =========================
    // SEND DATA
    // =========================

    setModelStats({

      fileName: file.name,

      dimensions:
        `${width} × ${height} × ${depth} mm`,

      weight:
        `${estimatedWeight.toFixed(1)} g`,

      estimatedTime:
        `${estimatedHours.toFixed(1)} h`,

      complexity,

    });

    return (

      <mesh
        geometry={geometry}
        scale={0.05}
      >

        <meshStandardMaterial
          color="#c084fc"
          metalness={0.25}
          roughness={0.35}
        />

      </mesh>

    );

  }

  // =========================
  // GLTF / GLB
  // =========================

  if (
    file.name.toLowerCase().endsWith(".gltf") ||
    file.name.toLowerCase().endsWith(".glb")
  ) {

    const gltf =
      useLoader(GLTFLoader, url);

    gltf.scene.traverse((child) => {

      if (child.isMesh) {

        child.castShadow = true;

        child.receiveShadow = true;

      }

    });

    const box =
      new THREE.Box3().setFromObject(
        gltf.scene
      );

    const size =
      new THREE.Vector3();

    box.getSize(size);

    const width =
      (size.x * 1000).toFixed(1);

    const height =
      (size.y * 1000).toFixed(1);

    const depth =
      (size.z * 1000).toFixed(1);

    // APPROX VOLUME

    const volumeCm3 =
      (
        (
          (size.x * 1000) *
          (size.y * 1000) *
          (size.z * 1000)
        ) / 1800
      );

    // DENSITY

    const density =
      materialDensities[
        selectedMaterial
      ] || 1.24;

    // WEIGHT

    const estimatedWeight =
      volumeCm3 * density;

    // TIME

    const estimatedHours =
      estimatedWeight / 6;

    // COMPLEXITY

    let complexity = "Low";

    if (estimatedWeight > 80)
      complexity = "Medium";

    if (estimatedWeight > 200)
      complexity = "High";

    // SEND DATA

    setModelStats({

      fileName: file.name,

      dimensions:
        `${width} × ${height} × ${depth} mm`,

      weight:
        `${estimatedWeight.toFixed(1)} g`,

      estimatedTime:
        `${estimatedHours.toFixed(1)} h`,

      complexity,

    });

    return (

      <primitive
        object={gltf.scene}
        scale={2}
      />

    );

  }

  return null;

};

export default ModelViewer;