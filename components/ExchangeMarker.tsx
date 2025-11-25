'use client';

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { Mesh, Vector3 } from 'three';

interface ExchangeMarkerProps {
  exchange: {
    id: string;
    name: string;
    cloudProvider: 'AWS' | 'GCP' | 'Azure';
    region: string;
  };
  position: Vector3;
  isSelected: boolean;
  onClick: () => void;
}

const providerColors = {
  AWS: '#FF9900',
  GCP: '#34A853', // Google Green - more distinct from Azure
  Azure: '#0078D4',
};

export default function ExchangeMarker({
  exchange,
  position,
  isSelected,
  onClick,
}: ExchangeMarkerProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = providerColors[exchange.cloudProvider];

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered || isSelected ? 1.5 : 1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      {(hovered || isSelected) && (
        <group>
          <Text
            position={[0, 0.08, 0]}
            fontSize={0.025}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.002}
            outlineColor="#000000"
          >
            {exchange.name}
          </Text>
          <Text
            position={[0, 0.05, 0]}
            fontSize={0.02}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.002}
            outlineColor="#000000"
          >
            {exchange.region}
          </Text>
          <Text
            position={[0, 0.02, 0]}
            fontSize={0.018}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.002}
            outlineColor="#000000"
          >
            {exchange.cloudProvider}
          </Text>
        </group>
      )}
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.03, 0.05, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
