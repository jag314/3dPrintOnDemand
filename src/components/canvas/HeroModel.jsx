import { useGLTF } from '@react-three/drei';

const HeroModel = ({ isMobile }) => {

  const model = useGLTF('/robot/robot.gltf');

  return (

    <mesh>

      {/* LIGHTS */}

      <hemisphereLight
        intensity={1.3}
        groundColor="black"
      />

      <spotLight
        position={[-10, 25, 5]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />

      <pointLight intensity={0.5} />

      <pointLight
        position={[10, 10, 10]}
        intensity={1}
      />

      {/* MODEL */}

      <primitive
  object={model.scene}
  scale={isMobile ? 0 : 9.5}
  position={isMobile ? [0, 0, -2] : [0, -2, 1]}
  rotation={[-Math.PI / 2, 0, 5.6]}

  onPointerOver={() => {
    document.body.style.cursor = 'grab';
  }}

  onPointerOut={() => {
    document.body.style.cursor = 'default';
  }}

  onPointerDown={() => {
    document.body.style.cursor = 'grabbing';
  }}

  onPointerUp={() => {
    document.body.style.cursor = 'grab';
  }}
/>

    </mesh>

  );
};

export default HeroModel;