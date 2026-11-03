import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { BlenderEggCartonModel } from './BlenderModels.js';

interface Carton3DSceneProps {
  initialOpen?: boolean;
}

export const Carton3DScene: React.FC<Carton3DSceneProps> = ({ initialOpen = true }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 60%, #FFFDF7 0%, #F5EFE0 100%)',
        border: '1.5px solid #EFE4D0',
        boxShadow: '0 12px 36px rgba(50, 25, 15, 0.06)',
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 2.2, 4.4], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.2} color="#FFFBF0" />
        <directionalLight position={[4, 6, 4]} intensity={1.8} castShadow />
        <directionalLight position={[-4, 3, -3]} intensity={1.1} color="#F4B900" />
        <directionalLight position={[0, -2, 2]} intensity={0.4} color="#FFFFFF" />

        <Suspense fallback={null}>
          <BlenderEggCartonModel isOpen={isOpen} scale={0.95} />
        </Suspense>

        <ContactShadows
          position={[0, -0.65, 0]}
          opacity={0.36}
          scale={7}
          blur={2.4}
          far={3.0}
          color="#35190F"
        />

        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 4}
          rotateSpeed={0.7}
        />
      </Canvas>

      {/* Interactive Controls Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '8px 18px',
          borderRadius: '9999px',
          border: '1.5px solid #E8DFCC',
          boxShadow: '0 6px 20px rgba(40, 20, 10, 0.08)',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: isOpen ? '#EFBF35' : '#24120D',
            color: isOpen ? '#24120D' : '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            padding: '7px 18px',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
        >
          {isOpen ? '✕ Close Lid' : '✦ Open Carton'}
        </button>
        <span
          style={{
            fontSize: '12px',
            color: '#7A6B5D',
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Drag to inspect 360°
        </span>
      </div>
    </div>
  );
};

