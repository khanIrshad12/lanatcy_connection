'use client';

import globeData from '@/data/globe.json';
import { GlobeConfig, Position } from '@/types/globe';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  BufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  Vector3,
} from 'three';

interface WorldProps {
  globeConfig?: GlobeConfig;
  data: Position[];
}

const defaultGlobeConfig: GlobeConfig = {
  pointSize: 4,
  globeColor: '#062056',
  showAtmosphere: true,
  atmosphereColor: '#FFFFFF',
  atmosphereAltitude: 0.1,
  emissive: '#062056',
  emissiveIntensity: 0.1,
  polygonColor: 'rgba(255,255,255,0.1)',
  ambientLight: '#38bdf8',
  directionalLeftLight: '#ffffff',
  directionalTopLight: '#ffffff',
  pointLight: '#ffffff',
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 0, lng: 0 },
  autoRotate: false,
  autoRotateSpeed: 0.5,
};

function latLongToVector3(
  lat: number,
  lng: number,
  radius: number = 1
): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new Vector3(x, y, z);
}

function World({ globeConfig, data }: WorldProps) {
  const config = useMemo(
    () => ({ ...defaultGlobeConfig, ...globeConfig }),
    [globeConfig]
  );
  const globeRef = useRef<THREE.Group>(null);

  // Parse globe data - it's a GeoJSON FeatureCollection
  const { polygons, points } = useMemo(() => {
    const polygonsData: any[] = [];
    const pointsData: any[] = [];

    // Check if globeData is a FeatureCollection
    if (
      globeData &&
      (globeData as any).type === 'FeatureCollection' &&
      Array.isArray((globeData as any).features)
    ) {
      (globeData as any).features.forEach((feature: any) => {
        if (feature.type === 'Feature' && feature.geometry) {
          if (feature.geometry.type === 'Polygon') {
            // Extract coordinates from polygon
            const coords = feature.geometry.coordinates[0];
            coords.forEach((coord: number[]) => {
              pointsData.push({ lat: coord[1], lng: coord[0] });
            });
            // Add more points by sampling every coordinate (not just boundary)
            // Also add interpolated points for denser coverage
            for (let i = 0; i < coords.length - 1; i++) {
              const coord1 = coords[i];
              const coord2 = coords[i + 1];
              // Add mid-points for denser coverage
              pointsData.push({
                lat: (coord1[1] + coord2[1]) / 2,
                lng: (coord1[0] + coord2[0]) / 2,
              });
            }
            polygonsData.push(coords);
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach((polygon: any) => {
              const coords = polygon[0];
              coords.forEach((coord: number[]) => {
                pointsData.push({ lat: coord[1], lng: coord[0] });
              });
              // Add interpolated points
              for (let i = 0; i < coords.length - 1; i++) {
                const coord1 = coords[i];
                const coord2 = coords[i + 1];
                pointsData.push({
                  lat: (coord1[1] + coord2[1]) / 2,
                  lng: (coord1[0] + coord2[0]) / 2,
                });
              }
              polygonsData.push(coords);
            });
          }
        }
      });
    }

    return { polygons: polygonsData, points: pointsData };
  }, []);

  useFrame((state) => {
    if (globeRef.current && config.autoRotate) {
      globeRef.current.rotation.y += (config.autoRotateSpeed || 0.5) * 0.001;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Globe sphere */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={config.globeColor || '#062056'}
          emissive={config.emissive || '#062056'}
          emissiveIntensity={config.emissiveIntensity || 0.1}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere layer */}
      {config.showAtmosphere && (
        <mesh>
          <sphereGeometry
            args={[1 + (config.atmosphereAltitude || 0.1), 64, 64]}
          />
          <meshBasicMaterial
            color={config.atmosphereColor || '#FFFFFF'}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Globe polygons (country shapes) */}
      {polygons.slice(0, 200).map((polygon: number[][], index: number) => {
        const positions = polygon
          .map((coord: number[]) => {
            const pos = latLongToVector3(coord[1], coord[0], 1.01);
            return [pos.x, pos.y, pos.z];
          })
          .flat();

        if (positions.length < 9) return null;

        return (
          <mesh key={`polygon-${index}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(positions), 3]}
                count={positions.length / 3}
              />
            </bufferGeometry>
            <meshBasicMaterial
              color={config.polygonColor || 'rgba(74, 158, 255, 0.1)'}
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Globe points (country dots) - using Points for better performance */}
      <GlobePoints
        points={points.filter((_: any, i: number) => i % 2 === 0)}
        pointSize={config.pointSize || 4}
      />

      {/* Arcs (latency connections) */}
      {data.map((position, index) => {
        // Calculate base positions on sphere surface (radius 1.0)
        const startBase = latLongToVector3(
          position.startLat,
          position.startLng,
          1.2
        );
        const endBase = latLongToVector3(position.endLat, position.endLng, 1.2);

        // Calculate distance between points (chord length)
        const distance = startBase.distanceTo(endBase);

        // Calculate distance-based endpoint radius
        // Longer distances need more clearance to prevent intersection
        // Scale from 1.015 (short) to 1.03 (very long)
        // Distance range: ~0 (same point) to ~2 (opposite sides of globe)
        const minRadius = 1.015; // Minimum clearance (tube thickness 0.005 + buffer)
        const maxRadius = 1.03; // Maximum for very long distances
        const distanceFactor = Math.min(1, distance / 2); // Normalize to 0-1
        const endpointRadius =
          minRadius + (maxRadius - minRadius) * distanceFactor;

        // Create start and end points with distance-based radius
        const start = latLongToVector3(
          position.startLat,
          position.startLng,
          endpointRadius
        );
        const end = latLongToVector3(
          position.endLat,
          position.endLng,
          endpointRadius
        );

        // Calculate great circle midpoint on sphere surface (radius 1.0)
        // This creates a more circular arc by following the sphere's curvature
        const midBase = new Vector3()
          .addVectors(startBase, endBase)
          .normalize();

        // Elevate the midpoint perpendicular to the sphere surface
        // The normal vector at the midpoint is the midpoint itself (for a sphere)
        // Scale it by (1 + arcAlt) to create the elevated control point
        const mid = midBase.clone().multiplyScalar(1 + position.arcAlt);

        // Use QuadraticBezierCurve3 for a smoother, more circular arc
        // This creates a smooth parabolic curve that looks more circular than CatmullRomCurve3
        const curve = new QuadraticBezierCurve3(start, mid, end);

        return (
          <Arc
            key={`arc-${index}`}
            curve={curve}
            color={position.color}
            config={config}
            index={index}
            isRealAPI={position.isRealAPI || false}
          />
        );
      })}
    </group>
  );
}

function GlobePoints({
  points,
  pointSize,
}: {
  points: any[];
  pointSize: number;
}) {
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(points.length * 3);

    points.forEach((point, i) => {
      const pos = latLongToVector3(point.lat, point.lng, 1.005);
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    });

    const geom = new BufferGeometry();
    geom.setAttribute('position', new BufferAttribute(positions, 3));

    const mat = new PointsMaterial({
      color: '#4a9eff',
      size: pointSize ? pointSize / 1000 : 0.004,
      sizeAttenuation: false,
    });

    return { geometry: geom, material: mat };
  }, [points, pointSize]);

  return <primitive object={new Points(geometry, material)} />;
}

function Arc({
  curve,
  color,
  config,
  index,
  isRealAPI,
}: {
  curve: QuadraticBezierCurve3;
  color: string;
  config: GlobeConfig;
  index: number;
  isRealAPI: boolean;
}) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      const arcTime = config.arcTime || 1000;
      const timeOffset = (index * 200) % arcTime;
      const progress =
        ((state.clock.elapsedTime * 1000 + timeOffset) % arcTime) / arcTime;
      // Real API connections have stronger pulse, simulated are more subtle
      const baseOpacity = isRealAPI ? 0.4 : 0.3;
      const pulseRange = isRealAPI ? 0.5 : 0.3;
      const opacity = baseOpacity + Math.sin(progress * Math.PI) * pulseRange;
      materialRef.current.opacity = Math.max(0.2, Math.min(0.9, opacity));
    }
  });

  return (
    <group>
      {/* Main arc - solid for real API, slightly thinner for simulated */}
      <mesh>
        <tubeGeometry args={[curve, 64, isRealAPI ? 0.005 : 0.003, 8, false]} />
        <meshBasicMaterial
          ref={materialRef}
          color={color}
          transparent
          opacity={isRealAPI ? 0.7 : 0.5}
        />
      </mesh>
      {/* Dashed effect for simulated data using multiple segments */}
      {!isRealAPI && (
        <mesh>
          <tubeGeometry args={[curve, 32, 0.002, 8, false]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

export default World;
