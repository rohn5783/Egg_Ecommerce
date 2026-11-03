import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { createEggGeometry } from './Hero3DScene.js';
import { BlenderFloatingEgg } from './BlenderModels.js';

interface ComparisonEggProps {
  type: 'brown' | 'white';
  color: string;
  position: [number, number, number];
  rotationY?: number;
  label: string;
  roughness?: number;
}

const ComparisonEggMesh: React.FC<ComparisonEggProps> = ({
  type,
  color,
  position,
  rotationY = 0,
  roughness = 0.38,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const dragRef = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
  });

  const geometry = useMemo(() => createEggGeometry(1.28, 1.38, 0.22), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;
    if (meshRef.current) {
      if (!dragRef.current.isDragging) {
        dragRef.current.rotX += dragRef.current.velX;
        dragRef.current.rotY += dragRef.current.velY;
        dragRef.current.velX *= 0.92;
        dragRef.current.velY *= 0.92;
      }

      // Smooth cursor parallax and tilt
      const targetPosX = position[0] + pointer.x * 0.45;
      const targetPosY = position[1] + pointer.y * 0.35 + Math.sin(t * 1.5) * 0.08;
      const targetRotX = -pointer.y * 0.65 + dragRef.current.rotX + Math.sin(t * 0.4) * 0.06;
      const targetRotY =
        rotationY +
        pointer.x * 0.85 +
        dragRef.current.rotY +
        (type === 'brown' ? t * 0.12 : -t * 0.12);
      const targetRotZ = -pointer.x * 0.22;

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetPosX, 0.08);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetPosY, 0.08);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.08);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.08);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, 0.08);

      const targetScale = hovered ? 1.12 : 1.0;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
      );
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={position}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragRef.current.isDragging = true;
          dragRef.current.lastX = e.clientX;
          dragRef.current.lastY = e.clientY;
          document.body.style.cursor = 'grabbing';
        }}
        onPointerMove={(e) => {
          if (dragRef.current.isDragging) {
            e.stopPropagation();
            const deltaX = (e.clientX - dragRef.current.lastX) * 0.012;
            const deltaY = (e.clientY - dragRef.current.lastY) * 0.012;
            dragRef.current.rotY += deltaX;
            dragRef.current.rotX += deltaY;
            dragRef.current.velY = deltaX;
            dragRef.current.velX = deltaY;
            dragRef.current.lastX = e.clientX;
            dragRef.current.lastY = e.clientY;
          }
        }}
        onPointerUp={() => {
          dragRef.current.isDragging = false;
          document.body.style.cursor = hovered ? 'grab' : 'auto';
        }}
      >
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={0.02}
          envMapIntensity={0.9}
        />
      </mesh>
    </Float>
  );
};

export const EggComparison3DScene: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '380px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.15, 5.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Natural Farm Studio Lighting with rich warm golden specular tones */}
        <ambientLight intensity={1.15} color="#FFFBF0" />
        <directionalLight position={[4, 6, 5]} intensity={1.8} castShadow />
        <directionalLight position={[-4, 3, -2]} intensity={1.2} color="#F5D85E" />
        <directionalLight position={[0, -2, 3]} intensity={0.4} color="#FFF5D6" />

        {/* 1. Large Rich Terracotta Brown Egg on the Left matching frame 008 */}
        <Suspense
          fallback={
            <ComparisonEggMesh
              type="brown"
              color="#6E320F"
              position={[-2.3, 0, 0]}
              label="The Brown One"
              roughness={0.42}
            />
          }
        >
          <BlenderFloatingEgg
            type="brown"
            position={[-2.3, 0, 0]}
            scale={1.28}
            rotationSpeed={0.3}
            floatSpeed={1.5}
            floatIntensity={0.3}
            interactiveCursor={true}
          />
        </Suspense>

        {/* 2. Large Porcelain Warm White Egg on the Right matching frame 008 */}
        <Suspense
          fallback={
            <ComparisonEggMesh
              type="white"
              color="#FFFDF7"
              position={[2.3, 0, 0]}
              label="The White One"
              roughness={0.28}
              rotationY={Math.PI / 4}
            />
          }
        >
          <BlenderFloatingEgg
            type="white"
            position={[2.3, 0, 0]}
            scale={1.28}
            rotationSpeed={-0.3}
            floatSpeed={1.5}
            floatIntensity={0.3}
            interactiveCursor={true}
          />
        </Suspense>

        {/* Soft Ground Contact Shadows */}
        <ContactShadows
          position={[0, -1.75, 0]}
          opacity={0.32}
          scale={8}
          blur={2.2}
          far={3.8}
          color="#35190F"
        />
      </Canvas>
    </div>
  );
};
