import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { BlenderFarmSceneModel } from './BlenderModels.js';

export const Farm3DScene: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '460px',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 60%, #F5FBF0 0%, #E3EFE0 100%)',
        border: '1.5px solid #D6E8D0',
        boxShadow: '0 12px 36px rgba(30, 50, 20, 0.08)',
      }}
    >
      <Canvas
        camera={{ position: [0, 4.5, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.1} color="#FFFDF7" />
        <directionalLight position={[6, 9, 5]} intensity={1.8} castShadow />
        <directionalLight position={[-5, 4, -4]} intensity={0.9} color="#7CAB3E" />
        <directionalLight position={[0, -2, 3]} intensity={0.3} color="#FFFFFF" />

        <Suspense fallback={null}>
          <BlenderFarmSceneModel scale={0.72} />
        </Suspense>

        <ContactShadows
          position={[0, -1.1, 0]}
          opacity={0.35}
          scale={9}
          blur={2.5}
          far={4.0}
          color="#1F3510"
        />

        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 5}
          autoRotate={true}
          autoRotateSpeed={0.8}
        />
      </Canvas>

      {/* Interactive Legend Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '8px 20px',
          borderRadius: '9999px',
          border: '1.5px solid #D6E8D0',
          boxShadow: '0 6px 20px rgba(30, 50, 20, 0.08)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#24120D', fontFamily: "'DM Sans', sans-serif" }}>
          🌿 GoodEggs Pasture Diorama (Blender 3D)
        </span>
        <span style={{ fontSize: '12px', color: '#5A6F50', fontFamily: "'DM Sans', sans-serif" }}>
          Drag to explore
        </span>
      </div>
    </div>
  );
};

