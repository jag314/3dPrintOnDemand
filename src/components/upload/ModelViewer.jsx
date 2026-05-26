import {
  useEffect,
  useState,
} from "react";

import * as THREE from "three";

import {
  STLLoader,
} from "three/examples/jsm/loaders/STLLoader";

const ModelViewer = ({
  file,
  setModelStats,
  selectedColor,
}) => {

  const [geometry, setGeometry] =
    useState(null);

  const [scale, setScale] =
    useState(1);

  const [positionY, setPositionY] =
    useState(0);

  // =========================
  // LOAD MODEL
  // =========================

  useEffect(() => {

    // RESET

    if (!file) {

      setGeometry(null);

      setModelStats({

        fileName: "-",

        dimensions: "-",

        materialUsage: "0 g",

        complexity: "-",

      });

      return;

    }

    console.log(
      "MODEL VIEWER FILE:",
      file
    );

    const reader =
      new FileReader();

    reader.onload = (
      event
    ) => {

      try {

        console.log(
          "READ SUCCESS"
        );

        // =========================
        // LOAD STL
        // =========================

        const loader =
          new STLLoader();

        const parsedGeometry =
          loader.parse(
            event.target.result
          );

        parsedGeometry.computeVertexNormals();

        parsedGeometry.computeBoundingBox();

        // =========================
        // SIZE
        // =========================

        const box =
          parsedGeometry.boundingBox;

        const size =
          new THREE.Vector3();

        box.getSize(size);

        console.log(
          "ORIGINAL SIZE:",
          size
        );

        // =========================
        // FIX UNITS
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

        // Tiny models probably exported in meters

        if (
          maxDimension < 5
        ) {

          normalizedX *= 1000;
          normalizedY *= 1000;
          normalizedZ *= 1000;

        }

        console.log(
          "NORMALIZED:",
          normalizedX,
          normalizedY,
          normalizedZ
        );

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
        // CENTER MODEL
        // =========================

        parsedGeometry.center();

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

        const volumeCm3 =

          (
            normalizedX *
            normalizedY *
            normalizedZ
          ) / 1000;

        console.log(
          "VOLUME:",
          volumeCm3
        );

        // =========================
        // WEIGHT
        // =========================

        const estimatedWeight =

          Math.max(

            volumeCm3 * 1.24,

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
          parsedGeometry
            .attributes.position
            .count / 3;

        const complexity =

          triangles > 100000

            ? "High"

            : triangles > 30000

              ? "Medium"

              : "Low";

        // =========================
        // FINAL STATS
        // =========================

        const finalStats = {

          fileName:
            file.name,

          dimensions:

            `${normalizedX.toFixed(1)} × ${normalizedY.toFixed(1)} × ${normalizedZ.toFixed(1)} mm`,

          materialUsage:

            `${estimatedWeight} g`,

          complexity,

        };

        console.log(
          "FINAL STATS:",
          finalStats
        );

        setModelStats(
          finalStats
        );

        // =========================
        // SAVE GEOMETRY
        // =========================

        setGeometry(
          parsedGeometry
        );

      }

      catch (error) {

        console.error(
          "STL ERROR:",
          error
        );

      }

    };

    reader.readAsArrayBuffer(
      file
    );

  }, [file]);

  // =========================
  // EMPTY
  // =========================

  if (!geometry)
    return null;

  // =========================
  // RENDER
  // =========================

  return (

    <mesh

      geometry={geometry}

      scale={scale}

      position={[
        0,
        positionY,
        0,
      ]}

      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
    >

      <meshStandardMaterial

        color={
          selectedColor?.hex ||
          "#c084fc"
        }

        metalness={0.2}

        roughness={0.35}

      />

    </mesh>

  );

};

export default ModelViewer;