import { useGLTF } from "@react-three/drei";

const DashboardModel = () => {

  const robot = useGLTF("/models/robot.glb");

  return (

    <primitive
      object={robot.scene}
      scale={4}
      position={[0, -2, 0]}
      rotation={[0, 0.5, 0]}
    />

  );
};

export default DashboardModel;