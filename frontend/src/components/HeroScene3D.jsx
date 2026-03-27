import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Detect mobile for performance scaling ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

/* ─── Wireframe Icosahedron (structural engineering) ─── */
function WireframeIcosahedron() {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.08;
    meshRef.current.rotation.y = t * 0.12;
    meshRef.current.position.y = Math.sin(t * 0.4) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={[-2.5, 0.5, -2]}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshBasicMaterial
        color="#1A3A6B"
        wireframe
        transparent
        opacity={0.25}
      />
    </mesh>
  );
}

/* ─── Floating Cube with visible edges ─── */
function FloatingCube({ position, size = 0.4, speed = 1, phaseOffset = 0 }) {
  const meshRef = useRef();

  const edgesGeometry = useMemo(() => {
    const box = new THREE.BoxGeometry(size, size, size);
    return new THREE.EdgesGeometry(box);
  }, [size]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.15 * speed;
    meshRef.current.rotation.z = t * 0.1 * speed;
    meshRef.current.position.y =
      position[1] + Math.sin(t * 0.5 * speed + phaseOffset) * 0.4;
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Semi-transparent face */}
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial
          color="#1A3A6B"
          transparent
          opacity={0.06}
        />
      </mesh>
      {/* Visible edges */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#F4A524" transparent opacity={0.2} />
      </lineSegments>
    </group>
  );
}

/* ─── Torus Knot (complex engineering) ─── */
function RotatingTorusKnot() {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.05;
    meshRef.current.rotation.y = t * 0.08;
    meshRef.current.position.y = Math.sin(t * 0.3 + 1) * 0.25;
  });

  return (
    <mesh ref={meshRef} position={[2.8, -0.5, -3]}>
      <torusKnotGeometry args={[0.7, 0.2, 64, 8]} />
      <meshBasicMaterial
        color="#1A3A6B"
        wireframe
        transparent
        opacity={0.18}
      />
    </mesh>
  );
}

/* ─── Floating sphere particles ─── */
function SphereParticles({ count = 20 }) {
  const meshRef = useRef();

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6 - 2,
      ],
      scale: Math.random() * 0.06 + 0.02,
      speed: Math.random() * 0.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
      isGold: i % 4 === 0,
    }));
  }, [count]);

  return (
    <group ref={meshRef}>
      {particles.map((p, i) => (
        <SphereParticle key={i} {...p} />
      ))}
    </group>
  );
}

function SphereParticle({ position, scale, speed, phase, isGold }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.5;
    ref.current.position.x =
      position[0] + Math.sin(t * speed * 0.7 + phase) * 0.2;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color={isGold ? '#F4A524' : '#ffffff'}
        transparent
        opacity={isGold ? 0.35 : 0.15}
      />
    </mesh>
  );
}

/* ─── Wireframe ring decoration ─── */
function WireframeRing({ position, radius = 0.8, rotationSpeed = 0.06 }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * rotationSpeed;
    ref.current.rotation.z = t * rotationSpeed * 0.7;
    ref.current.position.y = position[1] + Math.sin(t * 0.35) * 0.2;
  });

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[radius, 0.02, 8, 32]} />
      <meshBasicMaterial color="#F4A524" transparent opacity={0.12} />
    </mesh>
  );
}

/* ─── Scene content ─── */
function SceneContent({ isMobile }) {
  const particleCount = isMobile ? 8 : 20;

  const cubePositions = isMobile
    ? [
        { position: [1.5, 1.0, -1.5], size: 0.35, speed: 0.8, phaseOffset: 0 },
        { position: [-1.8, -0.8, -2], size: 0.3, speed: 1.1, phaseOffset: 2 },
      ]
    : [
        { position: [1.5, 1.0, -1.5], size: 0.35, speed: 0.8, phaseOffset: 0 },
        { position: [-1.2, -1.2, -1], size: 0.25, speed: 1.2, phaseOffset: 1 },
        { position: [3.5, 1.5, -2.5], size: 0.3, speed: 1.0, phaseOffset: 2 },
        { position: [-3.0, 0.8, -1.8], size: 0.28, speed: 0.9, phaseOffset: 3 },
        { position: [0.5, -1.5, -2], size: 0.22, speed: 1.1, phaseOffset: 4 },
      ];

  return (
    <>
      {/* Ambient light only -- we mostly use BasicMaterial so lighting is optional */}
      <ambientLight intensity={0.5} />

      {/* Stars background */}
      <Stars
        radius={50}
        depth={30}
        count={isMobile ? 300 : 800}
        factor={2}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Main geometric shapes */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <WireframeIcosahedron />
      </Float>

      {!isMobile && (
        <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.2}>
          <RotatingTorusKnot />
        </Float>
      )}

      {/* Floating cubes */}
      {cubePositions.map((props, i) => (
        <FloatingCube key={i} {...props} />
      ))}

      {/* Wireframe rings */}
      <WireframeRing position={[0, 0, -4]} radius={1.5} rotationSpeed={0.04} />
      {!isMobile && (
        <WireframeRing
          position={[-3, -1, -3]}
          radius={0.6}
          rotationSpeed={0.08}
        />
      )}

      {/* Sphere particles */}
      <SphereParticles count={particleCount} />
    </>
  );
}

/* ─── Continuous invalidation for demand mode (renders every frame) ─── */
function FrameInvalidator() {
  useFrame((state) => {
    state.invalidate();
  });
  return null;
}

/* ─── Main exported component ─── */
export default function HeroScene3D() {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        frameloop="demand"
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: true,
        }}
        style={{ background: 'transparent' }}
      >
        <FrameInvalidator />
        <SceneContent isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
