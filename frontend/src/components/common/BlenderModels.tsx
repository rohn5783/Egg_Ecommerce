import React, { useRef, useEffect, Suspense } from 'react';
import { useGLTF, useAnimations, Html, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ----------------------------------------------------------------------
// 1. BLENDER CHICKEN MODEL WITH BLENDER ANIMATIONS & CURSOR TRACKING
// ----------------------------------------------------------------------
interface BlenderChickenProps {
  scale?: number;
  showSpeechBubble?: boolean;
}

export const BlenderChickenModel: React.FC<BlenderChickenProps> = ({
  scale = 1.05,
  showSpeechBubble = true,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF('/models/chicken.glb');
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (actions['Chicken_Idle']) {
      actions['Chicken_Idle'].reset().fadeIn(0.4).play();
    } else {
      const firstAction = Object.values(actions)[0];
      if (firstAction) firstAction.play();
    }
  }, [actions]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;

    if (groupRef.current) {
      // Gentle breathing floating motion
      groupRef.current.position.y = Math.sin(t * 1.8) * 0.08 + 0.1;
      // Dynamic cursor tracking
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.45, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.2, 0.06);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[scale, scale, scale]}>
      <primitive object={scene} />

      {/* Lovable/Yolk & Co authentic Bok bok! speech bubble */}
      {showSpeechBubble && (
        <Html position={[0.65, 1.3, 0.2]} center distanceFactor={7}>
          <div
            style={{
              background: '#FFFFFF',
              color: '#32190F',
              fontFamily: "'Caveat', cursive, sans-serif",
              fontWeight: 700,
              fontSize: '19px',
              padding: '6px 16px',
              borderRadius: '9999px',
              boxShadow: '0 4px 16px rgba(50, 25, 15, 0.14)',
              border: '1.5px solid #F0E8D4',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              pointerEvents: 'none',
              transform: 'rotate(-4deg)',
            }}
          >
            <span>Bok bok!</span>
            <span style={{ fontSize: '13px', color: '#EFBF35' }}>✦</span>
          </div>
        </Html>
      )}
    </group>
  );
};

// ----------------------------------------------------------------------
// 2. BLENDER FLOATING EGG (WHITE OR BROWN) WITH CURSOR TRACKING & DRAG SPIN
// ----------------------------------------------------------------------
interface BlenderFloatingEggProps {
  type: 'white' | 'brown';
  position: [number, number, number];
  scale?: number;
  rotationSpeed?: number;
  floatSpeed?: number;
  floatIntensity?: number;
  interactiveCursor?: boolean;
}

export const BlenderFloatingEgg: React.FC<BlenderFloatingEggProps> = ({
  type,
  position,
  scale = 0.9,
  rotationSpeed = 0.5,
  floatSpeed = 1.5,
  floatIntensity = 0.4,
  interactiveCursor = true,
}) => {
  const meshRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = React.useState(false);
  const dragRef = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
  });

  const path = type === 'white' ? '/models/egg-white.glb' : '/models/egg-brown.glb';
  const { scene, animations } = useGLTF(path);
  const { actions } = useAnimations(animations, meshRef);

  useEffect(() => {
    const action = actions['Egg_Float'] || Object.values(actions)[0];
    if (action) action.play();
  }, [actions]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;
    if (meshRef.current) {
      if (interactiveCursor) {
        // Apply inertia drag damping
        if (!dragRef.current.isDragging) {
          dragRef.current.rotX += dragRef.current.velX;
          dragRef.current.rotY += dragRef.current.velY;
          dragRef.current.velX *= 0.92;
          dragRef.current.velY *= 0.92;
        }

        // Dynamic 3D cursor tracking
        const targetPosX = position[0] + pointer.x * 0.48;
        const targetPosY = position[1] + pointer.y * 0.38 + Math.sin(t * floatSpeed) * (floatIntensity * 0.25);
        const targetRotX = -pointer.y * 0.65 + dragRef.current.rotX + Math.cos(t * rotationSpeed) * 0.08;
        const targetRotY =
          (type === 'brown' ? -0.25 : 0.25) +
          pointer.x * 0.85 +
          dragRef.current.rotY +
          Math.sin(t * rotationSpeed * 0.7) * 0.12;
        const targetRotZ = -pointer.x * 0.25;

        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetPosX, 0.07);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetPosY, 0.07);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.08);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.08);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, 0.08);

        // Tactile scale up on cursor hover
        const targetScale = hovered ? scale * 1.12 : scale;
        meshRef.current.scale.setScalar(
          THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
        );
      } else {
        meshRef.current.rotation.y = t * rotationSpeed * 0.4;
        meshRef.current.rotation.z = Math.sin(t * rotationSpeed * 0.6) * 0.12;
        meshRef.current.rotation.x = Math.cos(t * rotationSpeed * 0.5) * 0.08;
      }
    }
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.2} floatIntensity={floatIntensity}>
      <group
        ref={meshRef}
        position={position}
        scale={[scale, scale, scale]}
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
        <primitive object={scene.clone()} />
      </group>
    </Float>
  );
};

// ----------------------------------------------------------------------
// 3. BLENDER EGG CARTON MODEL (INTERACTIVE OPEN/CLOSE ANIMATION)
// ----------------------------------------------------------------------
interface BlenderCartonProps {
  isOpen?: boolean;
  scale?: number;
}

export const BlenderEggCartonModel: React.FC<BlenderCartonProps> = ({
  isOpen = true,
  scale = 0.95,
}) => {
  const cartonRef = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF('/models/egg-carton.glb');
  const { actions } = useAnimations(animations, cartonRef);

  useEffect(() => {
    const action = actions['Carton_Open'] || Object.values(actions)[0];
    if (action) {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      if (isOpen) {
        action.timeScale = 1.2;
        action.play();
      } else {
        action.timeScale = -1.2;
        action.play();
      }
    }
  }, [isOpen, actions]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;
    if (cartonRef.current) {
      // Gentle presentation rotation
      cartonRef.current.rotation.y = THREE.MathUtils.lerp(
        cartonRef.current.rotation.y,
        pointer.x * 0.35 + Math.sin(t * 0.5) * 0.08,
        0.05
      );
      cartonRef.current.rotation.x = THREE.MathUtils.lerp(
        cartonRef.current.rotation.x,
        0.35 - pointer.y * 0.2,
        0.05
      );
    }
  });

  return (
    <group ref={cartonRef} position={[0, -0.2, 0]} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
};

// ----------------------------------------------------------------------
// 4. BLENDER FARM SCENE MODEL
// ----------------------------------------------------------------------
export const BlenderFarmSceneModel: React.FC<{ scale?: number }> = ({ scale = 0.65 }) => {
  const farmRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/models/farm-scene.glb');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;
    if (farmRef.current) {
      farmRef.current.rotation.y = THREE.MathUtils.lerp(
        farmRef.current.rotation.y,
        t * 0.08 + pointer.x * 0.3,
        0.04
      );
    }
  });

  return (
    <group ref={farmRef} position={[0, -0.8, 0]} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
};

// Preload models for instant smooth rendering
useGLTF.preload('/models/chicken.glb');
useGLTF.preload('/models/egg-white.glb');
useGLTF.preload('/models/egg-brown.glb');
useGLTF.preload('/models/egg-carton.glb');
useGLTF.preload('/models/egg-carton-closed.glb');
useGLTF.preload('/models/farm-scene.glb');

