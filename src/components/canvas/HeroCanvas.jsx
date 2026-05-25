import { Suspense, useEffect, useState } from 'react';

import { Canvas } from '@react-three/fiber';

import {
  OrbitControls,
  Preload,
  Environment,
} from '@react-three/drei';

import Loader from '../Loader';

import HeroModel from './HeroModel';

const HeroCanvas = () => {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    const mediaQuery = window.matchMedia('(max-width: 500px)');

    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };

  }, []);

  return (

    <Canvas
      
  eventSource={document.getElementById('root')}
    >

      <Suspense fallback={null}>

        {/* ENVIRONMENT */}

        <Environment preset="city" />

        {/* CONTROLS */}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
        />

        {/* MODEL */}

        <HeroModel isMobile={isMobile} />

      </Suspense>

      <Preload all />

    </Canvas>

  );
};

export default HeroCanvas;