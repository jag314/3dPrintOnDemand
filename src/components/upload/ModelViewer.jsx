import {
  useEffect,
  useState,
} from "react";

import * as THREE from "three";

import {
  STLLoader,
} from "three/examples/jsm/loaders/STLLoader";

import {
  OBJLoader,
} from "three/examples/jsm/loaders/OBJLoader";

// =========================
// VOLUME CALCULATION
// =========================

const calculateGeometryVolume = (
  geometry
) => {

  let volume = 0;

  const position =
    geometry.attributes.position;

  const p1 =
    new THREE.Vector3();

  const p2 =
    new THREE.Vector3();

  const p3 =
    new THREE.Vector3();

  for (
    let i = 0;
    i < position.count;
    i += 3
  ) {

    p1.fromBufferAttribute(
      position,
      i
    );

    p2.fromBufferAttribute(
      position,
      i + 1
    );

    p3.fromBufferAttribute(
      position,
      i + 2
    );

    volume +=
      signedVolumeOfTriangle(
        p1,
        p2,
        p3
      );

  }

  return Math.abs(volume);

};

// =========================
// TRIANGLE VOLUME
// =========================

const signedVolumeOfTriangle = (
  p1,
  p2,
  p3
) => {

  return (

    p1.dot(

      p2.cross(
        p3
      )

    ) / 6.0

  );

};

const ModelViewer = ({
  file,
  selectedColor,
  setModelStats,
  selectedMaterial,
  materials,
}) => {

  const [model, setModel] =
    useState(null);

  useEffect(() => {

    if (!file) return;

    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();

    const objectUrl =
      URL.createObjectURL(
        file
      );

    // =========================
    // MATERIAL DENSITY
    // =========================

    const density =

      materials?.[
        selectedMaterial
      ]?.density ||

      1.24;

    // =========================
    // STL
    // =========================

    if (
      extension === "stl"
    ) {

      const loader =
        new STLLoader();

      loader.load(

        objectUrl,

        (geometry) => {

          geometry.computeVertexNormals();

          geometry.center();

          geometry.computeBoundingBox();

          const box =
            geometry.boundingBox;

          const size =
            new THREE.Vector3();

          box.getSize(size);

          // =========================
          // REAL VOLUME
          // =========================

          const volumeMM3 =
            calculateGeometryVolume(
              geometry
            );

          // mm³ -> cm³

          const volumeCM3 =
            volumeMM3 / 1000;

          // =========================
          // REAL WEIGHT
          // =========================

          const estimatedWeight =

            (
              volumeCM3 *
              density
            ).toFixed(1);

          // =========================
          // MATERIAL
          // =========================

          const material =
            new THREE.MeshStandardMaterial({

              color:
                selectedColor?.hex ||

                "#8b5cf6",

              metalness: 0.15,

              roughness: 0.45,

            });

          // =========================
          // MESH
          // =========================

          const mesh =
            new THREE.Mesh(
              geometry,
              material
            );

          // =========================
          // FLOAT
          // =========================

          mesh.position.y =
            size.y / 2 + 2;

          mesh.castShadow =
            true;

          mesh.receiveShadow =
            true;

          setModel(mesh);

          // =========================
          // STATS
          // =========================

          setModelStats({

            fileName:
              file.name,

            dimensions:
              `${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)} mm`,

            materialUsage:
              estimatedWeight,

            complexity:
              geometry.attributes.position.count > 200000

                ? "High"

                : geometry.attributes.position.count > 80000

                ? "Medium"

                : "Low",

          });

        }

      );

    }

    // =========================
    // OBJ
    // =========================

    if (
      extension === "obj"
    ) {

      const loader =
        new OBJLoader();

      loader.load(

        objectUrl,

        (loadedModel) => {

          let totalVolume = 0;

          loadedModel.traverse(
            (child) => {

              if (
                child.isMesh
              ) {

                child.geometry.computeVertexNormals();

                child.geometry.computeBoundingBox();

                // =========================
                // REAL VOLUME
                // =========================

                totalVolume +=
                  calculateGeometryVolume(
                    child.geometry
                  );

                // =========================
                // MATERIAL
                // =========================

                child.material =
                  new THREE.MeshStandardMaterial({

                    color:
                      selectedColor?.hex ||

                      "#8b5cf6",

                    metalness: 0.15,

                    roughness: 0.45,

                  });

                child.castShadow =
                  true;

                child.receiveShadow =
                  true;

              }

            }
          );

          // =========================
          // CENTER
          // =========================

          const box =
            new THREE.Box3().setFromObject(
              loadedModel
            );

          const center =
            box.getCenter(
              new THREE.Vector3()
            );

          loadedModel.position.sub(
            center
          );

          // =========================
          // SIZE
          // =========================

          const size =
            box.getSize(
              new THREE.Vector3()
            );

          // =========================
          // FLOAT
          // =========================

          loadedModel.position.y =
            size.y / 2 + 2;

          // =========================
          // REAL WEIGHT
          // =========================

          const volumeCM3 =
            totalVolume / 1000;

          const estimatedWeight =

            (
              volumeCM3 *
              density
            ).toFixed(1);

          setModel(
            loadedModel
          );

          // =========================
          // STATS
          // =========================

          setModelStats({

            fileName:
              file.name,

            dimensions:
              `${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)} mm`,

            materialUsage:
              estimatedWeight,

            complexity:
              totalVolume > 500000

                ? "High"

                : totalVolume > 120000

                ? "Medium"

                : "Low",

          });

        }

      );

    }

    return () => {

      URL.revokeObjectURL(
        objectUrl
      );

    };

  }, [

    file,
    selectedColor,
    setModelStats,
    selectedMaterial,
    materials,

  ]);

  if (!model)
    return null;

  return (

    <primitive
      object={model}
    />

  );

};

export default ModelViewer;