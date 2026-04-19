'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, MeshDistortMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Core() {
  const meshRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.18
      meshRef.current.rotation.z = t * 0.08
      const s = 1 + Math.sin(t * 1.2) * 0.04
      meshRef.current.scale.setScalar(s)
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.3
      innerRef.current.rotation.x = t * 0.12
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.25
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.2
    }
  })

  return (
    <>
      {/* outer glow shell */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.12, 1]} />
        <MeshDistortMaterial
          color="#00ffe0"
          emissive="#003d38"
          roughness={0.1}
          metalness={0.8}
          wireframe
          distort={0.18}
          speed={2}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* inner solid core */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.62, 1]} />
        <MeshDistortMaterial
          color="#00b8aa"
          emissive="#005450"
          roughness={0.2}
          metalness={0.9}
          distort={0.3}
          speed={3}
        />
      </mesh>

      {/* orbital ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.018, 8, 80]} />
        <meshBasicMaterial color="#00ffe0" transparent opacity={0.35} />
      </mesh>
    </>
  )
}

function Particles() {
  return (
    <>
      <Sparkles
        count={90}
        scale={4.5}
        size={2.2}
        speed={0.5}
        opacity={0.7}
        color="#00ffe0"
        noise={0.4}
      />
      <Sparkles
        count={40}
        scale={6}
        size={1.2}
        speed={0.3}
        opacity={0.35}
        color="#8bf0e4"
        noise={0.8}
      />
    </>
  )
}

function DataStreams() {
  const groupRef = useRef<THREE.Group>(null)

  const lines = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const radius = 1.9 + Math.random() * 0.4
      const points = []
      for (let j = 0; j < 20; j++) {
        const t = j / 19
        const r = radius * (0.85 + t * 0.3)
        points.push(new THREE.Vector3(
          Math.cos(angle) * r,
          (t - 0.5) * 3.2,
          Math.sin(angle) * r
        ))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      return { geo, delay: i * 0.15, opacity: 0.12 + Math.random() * 0.18 }
    })
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) groupRef.current.rotation.y = t * 0.06
  })

  return (
    <group ref={groupRef}>
      {lines.map((l, i) => (
        <line key={i}>
          <primitive object={l.geo} attach="geometry" />
          <lineBasicMaterial color="#00ffe0" transparent opacity={l.opacity} />
        </line>
      ))}
    </group>
  )
}

function Lights() {
  const light1 = useRef<THREE.PointLight>(null)
  const light2 = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (light1.current) {
      light1.current.intensity = 1.8 + Math.sin(t * 1.5) * 0.4
    }
    if (light2.current) {
      light2.current.intensity = 0.8 + Math.cos(t * 2.1) * 0.2
    }
  })

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight ref={light1} position={[0, 2, 2]} color="#00ffe0" intensity={1.8} distance={8} />
      <pointLight ref={light2} position={[-2, -1, -1]} color="#0080ff" intensity={0.8} distance={6} />
      <pointLight position={[0, -3, 0]} color="#004444" intensity={0.5} distance={5} />
    </>
  )
}

export function GptxScene() {
  return (
    <div className="w-full h-full" style={{ minHeight: '360px' }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Lights />
        <Core />
        <Particles />
        <DataStreams />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.7}
        />
      </Canvas>
    </div>
  )
}
