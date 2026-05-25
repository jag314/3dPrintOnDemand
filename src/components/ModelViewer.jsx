import { useEffect, useState } from "react";

import { useLoader } from "@react-three/fiber";

import { STLLoader } from "three-stdlib";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const STLModel = ({ url }) => {

  const geometry = useLoader(STLLoader, url);

  geometry.center();

  return (

    <mesh geometry={geometry} scale={0.05}>

      <meshStandardMaterial
        color="#a855f7"
        metalness={0.2}
        roughness={0.4}
      />

    </mesh>

  );

};

const GLTFModel = ({ url }) => {

  const gltf = useLoader(GLTFLoader, url);

  return (

    <primitive
      object={gltf.scene}
      scale={2}
    />

  );

};

const ModelViewer = ({ file }) => {

  const [url, setUrl] = useState("");

  useEffect(() => {

    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    setUrl(objectUrl);

    return () => {

      URL.revokeObjectURL(objectUrl);

    };

  }, [file]);

  if (!file || !url) return null;

  // STL

  if (file.name.toLowerCase().endsWith(".stl")) {

    return <STLModel url={url} />;

  }

  // GLTF / GLB

  if (
    file.name.toLowerCase().endsWith(".gltf") ||
    file.name.toLowerCase().endsWith(".glb")
  ) {

    return <GLTFModel url={url} />;

  }

  return null;

};

export default ModelViewer;