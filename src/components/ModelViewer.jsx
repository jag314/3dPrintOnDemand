import {
  useEffect,
  useState,
} from "react";

import * as THREE from "three";

import {
  useLoader,
} from "@react-three/fiber";

import {
  STLLoader,
} from "three-stdlib";

import {
  GLTFLoader,
} from "three/examples/jsm/loaders/GLTFLoader";

const STLModel = ({
  url,
  file,
  setModelStats,
  selectedColor,
}) => {

  const geometry =
    useLoader(
      STLLoader,
      url
    );

  const [scale, setScale] =
    useState(1);

  const [positionY, setPositionY] =
    useState(0);

  useEffect(() => {

    if (!geometry)
      return;

    // =========================
    // CENTER
    // =========================

    geometry.center();

    geometry.computeBoundingBox();

    const box =
      geometry.boundingBox;

    const size =
      new THREE.Vector3();

    box.getSize(size);

    console.log(
      "SIZE:",
      size
    );

    // =========================
    // FIX TINY MODELS
    // =========================

    let normalizedX =
      size.x;

    let normalizedY =
      size.y;

    let normalizedZ =
      size.z;

    const maxDimension =
      Math.max(
        size.x,
        size.y,
        size.z
      );

    // probably meters

    if (
      maxDimension < 5
    ) {

      normalizedX *= 1000;
      normalizedY *= 1000;
      normalizedZ *= 1000;

    }

    // =========================
    // AUTO SCALE
    // =========================

    const targetSize =
      120;

    const autoScale =
      targetSize /
      Math.max(
        normalizedX,
        normalizedY,
        normalizedZ
      );

    setScale(
      autoScale
    );

    // =========================
    // FLOOR POSITION
    // =========================

    const scaledHeight =
      normalizedY *
      autoScale;

    setPositionY(
      scaledHeight / 2
    );

    // =========================
    // VOLUME
    // =========================

    const boundingVolume =

      normalizedX *
      normalizedY *
      normalizedZ;

    const infillFactor =
      0.15;

    const occupiedVolume =

      boundingVolume *
      infillFactor;

    const volumeCm3 =

      occupiedVolume / 1000;

    // =========================
    // DENSITY
    // =========================

    const density =
      1.24;

    // =========================
    // WEIGHT
    // =========================

    const estimatedWeight =

      Math.max(

        volumeCm3 * density,

        1

      ).toFixed(1);

    console.log(
      "WEIGHT:",
      estimatedWeight
    );

    // =========================
    // COMPLEXITY
    // =========================

    const triangles =

      geometry.attributes
        .position.count / 3;

    const complexity =

      triangles > 100000

        ? "High"

        : triangles > 30000

          ? "Medium"

          : "Low";

    // =========================
    // UPDATE STATS
    // =========================

    setModelStats({

      fileName:
        file.name,

      dimensions:

        `${normalizedX.toFixed(1)} × ${normalizedY.toFixed(1)} × ${normalizedZ.toFixed(1)} mm`,

      materialUsage:

        `${estimatedWeight} g`,

      complexity,

    });

  }, [
    geometry,
    file,
    setModelStats,
  ]);

  return (

    <mesh

      geometry={geometry}

      scale={scale}

      position={[
        0,
        positionY,
        0,
      ]}

    >

      <meshStandardMaterial

        color={
          selectedColor?.hex ||
          "#a855f7"
        }

        metalness={0.2}

        roughness={0.4}

      />

    </mesh>

  );

};

const GLTFModel = ({
  url,
}) => {

  const gltf =
    useLoader(
      GLTFLoader,
      url
    );

  return (

    <primitive
      object={gltf.scene}
      scale={2}
    />

  );

};

const ModelViewer = ({
  file,
  setModelStats,
  selectedColor,
}) => {

  const [url, setUrl] =
    useState("");

  useEffect(() => {

    if (!file)
      return;

    const objectUrl =
      URL.createObjectURL(
        file
      );

    setUrl(objectUrl);

    return () => {

      URL.revokeObjectURL(
        objectUrl
      );

    };

  }, [file]);

  if (!file || !url)
    return null;

  // =========================
  // STL
  // =========================

  if (
    file.name
      .toLowerCase()
      .endsWith(".stl")
  ) {

    return (

      <STLModel

        url={url}

        file={file}

        setModelStats={
          setModelStats
        }

        selectedColor={
          selectedColor
        }

      />

    );

  }

  // =========================
  // GLTF / GLB
  // =========================

  if (

    file.name
      .toLowerCase()
      .endsWith(".gltf")

    ||

    file.name
      .toLowerCase()
      .endsWith(".glb")

  ) {

    return (

      <GLTFModel
        url={url}
      />

    );

  }

  return null;

};

export default ModelViewer;