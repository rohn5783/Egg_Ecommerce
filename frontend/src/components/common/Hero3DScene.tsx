import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { BlenderChickenModel, BlenderFloatingEgg } from './BlenderModels.js';

// Realistic Egg Geometry Generator
export const createEggGeometry = (radius = 1.0, heightScale = 1.35, taperAmount = 0.24) => {
  const geo = new THREE.SphereGeometry(radius, 64, 64);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // Taper top (y > 0) narrower, broaden base (y < 0)
    const normY = y / radius;
    const taper = normY > 0 ? 1.0 - taperAmount * normY : 1.0 + (taperAmount * 0.25) * Math.abs(normY);
    pos.setX(i, pos.getX(i) * taper);
    pos.setZ(i, pos.getZ(i) * taper);
    pos.setY(i, y * heightScale);
  }
  geo.computeVertexNormals();
  return geo;
};

// 3D Floating Egg Component
interface FloatingEggProps {
  color: string;
  position: [number, number, number];
  scale?: number;
  rotationSpeed?: number;
  floatSpeed?: number;
  floatIntensity?: number;
  roughness?: number;
}

export const FloatingEgg: React.FC<FloatingEggProps> = ({
  color,
  position,
  scale = 1,
  rotationSpeed = 0.5,
  floatSpeed = 1.5,
  floatIntensity = 0.4,
  roughness = 0.5,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometry = useMemo(() => createEggGeometry(0.75, 1.32, 0.25), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * rotationSpeed * 0.4;
      meshRef.current.rotation.z = Math.sin(t * rotationSpeed * 0.6) * 0.15;
      meshRef.current.rotation.x = Math.cos(t * rotationSpeed * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.3} floatIntensity={floatIntensity}>
      <mesh ref={meshRef} geometry={geometry} position={position} scale={scale} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={0.04}
          envMapIntensity={0.8}
        />
      </mesh>
    </Float>
  );
};

// 3D Procedural Chicken Character Component
export const ChickenCharacter: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftWingRef = useRef<THREE.Group>(null!);
  const rightWingRef = useRef<THREE.Group>(null!);
  const leftEyeRef = useRef<THREE.Mesh>(null!);
  const rightEyeRef = useRef<THREE.Mesh>(null!);

  // Geometries for chicken anatomy
  const bodyGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.05, 48, 48);
    // Taper slightly like a plump bird
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const taper = y < 0 ? 1.05 : 0.95;
      pos.setX(i, pos.getX(i) * taper);
      pos.setZ(i, pos.getZ(i) * taper);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const headGeo = useMemo(() => new THREE.SphereGeometry(0.68, 40, 40), []);
  const beakGeo = useMemo(() => new THREE.ConeGeometry(0.18, 0.42, 24), []);
  const combGeo1 = useMemo(() => new THREE.SphereGeometry(0.2, 20, 20), []);
  const combGeo2 = useMemo(() => new THREE.SphereGeometry(0.26, 20, 20), []);
  const combGeo3 = useMemo(() => new THREE.SphereGeometry(0.18, 20, 20), []);
  const eyeScleraGeo = useMemo(() => new THREE.SphereGeometry(0.14, 20, 20), []);
  const eyePupilGeo = useMemo(() => new THREE.SphereGeometry(0.075, 16, 16), []);
  const eyeCatchGeo = useMemo(() => new THREE.SphereGeometry(0.028, 12, 12), []);
  const wattleGeo = useMemo(() => new THREE.SphereGeometry(0.12, 16, 16), []);
  const tailGeo = useMemo(() => new THREE.ConeGeometry(0.28, 0.95, 20), []);
  const wingGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.62, 28, 28);
    // Flatten wing
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, pos.getX(i) * 0.3);
      pos.setY(i, pos.getY(i) * 1.15);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  const legGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 0.45, 16), []);
  const toeGeo = useMemo(() => new THREE.ConeGeometry(0.06, 0.28, 16), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;

    if (groupRef.current) {
      // Gentle floating bob
      groupRef.current.position.y = Math.sin(t * 1.8) * 0.08 + 0.1;
      // Soft breathing scale
      const breath = 1.0 + Math.sin(t * 2.2) * 0.015;
      groupRef.current.scale.set(breath, breath, breath);

      // Subtle parallax look toward pointer
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.35, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.15, 0.05);
    }

    if (headRef.current) {
      // Natural head tilt and curiosity
      headRef.current.rotation.z = Math.sin(t * 1.2) * 0.04 + (pointer.x * 0.15);
      headRef.current.rotation.x = Math.sin(t * 1.6) * 0.03 + (-pointer.y * 0.1);
    }

    if (leftWingRef.current && rightWingRef.current) {
      // Gentle wing flutter
      const wingFlutter = Math.sin(t * 2.5) * 0.08;
      leftWingRef.current.rotation.z = -0.15 + wingFlutter;
      rightWingRef.current.rotation.z = 0.15 - wingFlutter;
    }

    // Cute blink animation every ~4 seconds
    const blinkCycle = t % 4.0;
    const isBlinking = blinkCycle > 3.85;
    const eyeScaleY = isBlinking ? 0.1 : 1.0;
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = eyeScaleY;
      rightEyeRef.current.scale.y = eyeScaleY;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Main Plump Yellow Body */}
      <mesh geometry={bodyGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color="#F5D85E"
          roughness={0.48}
          metalness={0.02}
        />
      </mesh>

      {/* Creamy belly patch */}
      <mesh position={[0, -0.1, 0.42]} scale={[0.82, 0.88, 0.65]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color="#FFF7D6"
          roughness={0.52}
          metalness={0.01}
        />
      </mesh>

      {/* 2. Head Group */}
      <group ref={headRef} position={[0, 0.95, 0.3]}>
        {/* Head Sphere */}
        <mesh geometry={headGeo} castShadow>
          <meshStandardMaterial
            color="#F5D85E"
            roughness={0.45}
            metalness={0.02}
          />
        </mesh>

        {/* 3 Red Comb Lobes on Crown */}
        <group position={[0, 0.65, 0]}>
          <mesh geometry={combGeo1} position={[-0.14, -0.05, -0.08]} scale={[1, 1.4, 0.8]} castShadow>
            <meshStandardMaterial color="#D32F2F" roughness={0.35} />
          </mesh>
          <mesh geometry={combGeo2} position={[0, 0.06, 0.05]} scale={[1, 1.6, 0.85]} castShadow>
            <meshStandardMaterial color="#D32F2F" roughness={0.35} />
          </mesh>
          <mesh geometry={combGeo3} position={[0.14, -0.04, -0.05]} scale={[1, 1.3, 0.8]} castShadow>
            <meshStandardMaterial color="#D32F2F" roughness={0.35} />
          </mesh>
        </group>

        {/* Golden Orange Beak */}
        <mesh
          geometry={beakGeo}
          position={[0, -0.02, 0.72]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color="#F4B900" roughness={0.25} metalness={0.1} />
        </mesh>

        {/* Red Wattle below beak */}
        <group position={[0, -0.22, 0.62]}>
          <mesh geometry={wattleGeo} position={[-0.07, 0, 0]} scale={[0.8, 1.3, 0.8]}>
            <meshStandardMaterial color="#D32F2F" roughness={0.35} />
          </mesh>
          <mesh geometry={wattleGeo} position={[0.07, 0, 0]} scale={[0.8, 1.3, 0.8]}>
            <meshStandardMaterial color="#D32F2F" roughness={0.35} />
          </mesh>
        </group>

        {/* Soft Pink Blush Cheeks */}
        <mesh position={[-0.44, -0.08, 0.44]} scale={[0.16, 0.1, 0.04]} rotation={[0, -0.5, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#FF9398" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.44, -0.08, 0.44]} scale={[0.16, 0.1, 0.04]} rotation={[0, 0.5, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#FF9398" transparent opacity={0.7} />
        </mesh>

        {/* Bok bok! Speech Bubble */}
        <Html position={[0.65, 0.9, 0.2]} center distanceFactor={7}>
          <div
            style={{
              background: '#FFFFFF',
              color: '#32190F',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '13px',
              padding: '6px 14px',
              borderRadius: '9999px',
              boxShadow: '0 4px 16px rgba(50, 25, 15, 0.14)',
              border: '1.5px solid #F0E8D4',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              pointerEvents: 'none',
              transform: 'rotate(-4deg)',
            }}
          >
            <span>Bok bok!</span>
            <span style={{ fontSize: '11px', color: '#EFBF35' }}>✦</span>
          </div>
        </Html>

        {/* Left Eye */}
        <group position={[-0.32, 0.15, 0.45]} rotation={[0, -0.3, 0]}>
          <mesh ref={leftEyeRef} geometry={eyeScleraGeo}>
            <meshStandardMaterial color="#FFFFFF" roughness={0.15} />
          </mesh>
          <mesh geometry={eyePupilGeo} position={[0, 0, 0.08]}>
            <meshStandardMaterial color="#211A13" roughness={0.1} />
          </mesh>
          <mesh geometry={eyeCatchGeo} position={[0.035, 0.035, 0.13]}>
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.32, 0.15, 0.45]} rotation={[0, 0.3, 0]}>
          <mesh ref={rightEyeRef} geometry={eyeScleraGeo}>
            <meshStandardMaterial color="#FFFFFF" roughness={0.15} />
          </mesh>
          <mesh geometry={eyePupilGeo} position={[0, 0, 0.08]}>
            <meshStandardMaterial color="#211A13" roughness={0.1} />
          </mesh>
          <mesh geometry={eyeCatchGeo} position={[0.035, 0.035, 0.13]}>
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      </group>

      {/* 3. Left Wing */}
      <group ref={leftWingRef} position={[-0.98, 0.05, 0]}>
        <mesh geometry={wingGeo} castShadow>
          <meshStandardMaterial color="#F4B900" roughness={0.5} />
        </mesh>
      </group>

      {/* 4. Right Wing */}
      <group ref={rightWingRef} position={[0.98, 0.05, 0]}>
        <mesh geometry={wingGeo} castShadow>
          <meshStandardMaterial color="#F4B900" roughness={0.5} />
        </mesh>
      </group>

      {/* 5. Brown Tail Feathers (Curving Upward) */}
      <group position={[0, 0.35, -0.95]} rotation={[-0.7, 0, 0]}>
        <mesh geometry={tailGeo} position={[-0.18, 0, 0]} rotation={[0, 0, -0.2]} castShadow>
          <meshStandardMaterial color="#A66B3F" roughness={0.55} />
        </mesh>
        <mesh geometry={tailGeo} position={[0, 0.15, 0.08]} scale={[1.1, 1.25, 1.1]} castShadow>
          <meshStandardMaterial color="#8C502E" roughness={0.55} />
        </mesh>
        <mesh geometry={tailGeo} position={[0.18, 0, 0]} rotation={[0, 0, 0.2]} castShadow>
          <meshStandardMaterial color="#A66B3F" roughness={0.55} />
        </mesh>
      </group>

      {/* 6. Legs & Feet */}
      <group position={[0, -0.95, 0]}>
        {/* Left Leg */}
        <group position={[-0.32, 0, 0]}>
          <mesh geometry={legGeo} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color="#F4B900" roughness={0.4} />
          </mesh>
          {/* 3 Toes */}
          <group position={[0, -0.35, 0.08]}>
            <mesh geometry={toeGeo} position={[-0.08, 0, 0.08]} rotation={[Math.PI / 2, 0, -0.3]}>
              <meshStandardMaterial color="#F4B900" roughness={0.4} />
            </mesh>
            <mesh geometry={toeGeo} position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#F4B900" roughness={0.4} />
            </mesh>
            <mesh geometry={toeGeo} position={[0.08, 0, 0.08]} rotation={[Math.PI / 2, 0, 0.3]}>
              <meshStandardMaterial color="#F4B900" roughness={0.4} />
            </mesh>
          </group>
        </group>

        {/* Right Leg */}
        <group position={[0.32, 0, 0]}>
          <mesh geometry={legGeo} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color="#F4B900" roughness={0.4} />
          </mesh>
          {/* 3 Toes */}
          <group position={[0, -0.35, 0.08]}>
            <mesh geometry={toeGeo} position={[-0.08, 0, 0.08]} rotation={[Math.PI / 2, 0, -0.3]}>
              <meshStandardMaterial color="#F4B900" roughness={0.4} />
            </mesh>
            <mesh geometry={toeGeo} position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#F4B900" roughness={0.4} />
            </mesh>
            <mesh geometry={toeGeo} position={[0.08, 0, 0.08]} rotation={[Math.PI / 2, 0, 0.3]}>
              <meshStandardMaterial color="#F4B900" roughness={0.4} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

// Main Hero 3D Scene Container
export const Hero3DScene: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '440px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.4, 5.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        {/* Warm Studio Lighting */}
        <ambientLight intensity={1.1} color="#FFFBF0" />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.7}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Soft Golden Rim Light from behind */}
        <directionalLight position={[-4, 3, -3]} intensity={1.2} color="#F4B900" />
        <directionalLight position={[0, -3, 2]} intensity={0.4} color="#FFF5D6" />

        {/* 1. Center Hero Chicken (Blender 3D Asset with Procedural Fallback) */}
        <Suspense fallback={<ChickenCharacter />}>
          <BlenderChickenModel scale={1.05} />
        </Suspense>

        {/* 2. Floating Brown Egg (Blender 3D Asset with Procedural Fallback) */}
        <Suspense
          fallback={
            <FloatingEgg
              color="#A66B3F"
              position={[-1.85, -0.5, 0.7]}
              scale={0.92}
              rotationSpeed={0.55}
              floatSpeed={1.4}
              floatIntensity={0.5}
              roughness={0.52}
            />
          }
        >
          <BlenderFloatingEgg
            type="brown"
            position={[-1.85, -0.5, 0.7]}
            scale={0.92}
            rotationSpeed={0.55}
            floatSpeed={1.4}
            floatIntensity={0.5}
          />
        </Suspense>

        {/* 3. Floating White Egg (Blender 3D Asset with Procedural Fallback) */}
        <Suspense
          fallback={
            <FloatingEgg
              color="#FFFFFF"
              position={[1.8, 0.65, 0.5]}
              scale={0.88}
              rotationSpeed={-0.45}
              floatSpeed={1.7}
              floatIntensity={0.45}
              roughness={0.4}
            />
          }
        >
          <BlenderFloatingEgg
            type="white"
            position={[1.8, 0.65, 0.5]}
            scale={0.88}
            rotationSpeed={-0.45}
            floatSpeed={1.7}
            floatIntensity={0.45}
          />
        </Suspense>

        {/* Ground Contact Shadow */}
        <ContactShadows
          position={[0, -1.55, 0]}
          opacity={0.38}
          scale={6.5}
          blur={2.6}
          far={3.5}
          color="#35190F"
        />
      </Canvas>
    </div>
  );
};

