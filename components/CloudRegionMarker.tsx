'use client';

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { Mesh, Vector3 } from 'three';

interface CloudRegionMarkerProps {
  region: {
    provider: 'AWS' | 'GCP' | 'Azure';
    name: string;
    regionCode: string;
    serverCount: number;
  };
  position: Vector3;
}

const providerColors = {
  AWS: '#FF9900',
  GCP: '#34A853', // Google Green - more distinct from Azure
  Azure: '#0078D4',
};

export default function CloudRegionMarker({
  region,
  position,
}: CloudRegionMarkerProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = providerColors[region.provider];

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.01;
      if (hovered) {
        meshRef.current.scale.setScalar(1.3);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={position}>
      {/* Outer glow ring */}
      <mesh>
        <ringGeometry args={[0.05, 0.06, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.3 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Main ring */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <ringGeometry args={[0.035, 0.045, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.9 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner dot */}
      <mesh>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
        />
      </mesh>
      {/* Hover info */}
      {hovered && (
        <group>
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.025}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.003}
            outlineColor="#000000"
          >
            {region.name}
          </Text>
          <Text
            position={[0, 0.06, 0]}
            fontSize={0.02}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.003}
            outlineColor="#000000"
          >
            {region.provider} - {region.regionCode}
          </Text>
          <Text
            position={[0, 0.02, 0]}
            fontSize={0.018}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.003}
            outlineColor="#000000"
          >
            {region.serverCount} servers
          </Text>
        </group>
      )}
    </group>
  );
}
