'use client';

import { useMemo } from 'react';
import { Vector3 } from 'three';
import { exchanges } from '@/data/exchanges';
import { Exchange } from '@/types';
import { useStore } from '@/store/useStore';
import { latLongToVector3 } from '@/lib/utils';
import ExchangeMarker from './ExchangeMarker';

// Calculate distance between two lat/lng coordinates in degrees
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// Offset a 3D position on the sphere surface in a tangent direction
function offsetOnSphere(center: Vector3, angle: number, offsetRadius: number): Vector3 {
  // Create two perpendicular tangent vectors
  const up = new Vector3(0, 1, 0);
  const tangent1 = new Vector3().crossVectors(center, up).normalize();
  // If center is too close to up vector, use a different reference
  if (tangent1.length() < 0.1) {
    tangent1.set(1, 0, 0);
  }
  const tangent2 = new Vector3().crossVectors(center, tangent1).normalize();
  
  // Calculate offset direction
  const offsetDir = new Vector3()
    .addScaledVector(tangent1, Math.cos(angle))
    .addScaledVector(tangent2, Math.sin(angle))
    .normalize();
  
  // Apply offset and normalize to sphere surface
  const offset = new Vector3().addVectors(center, offsetDir.multiplyScalar(offsetRadius));
  return offset.normalize().multiplyScalar(center.length());
}

// Group exchanges by proximity and calculate offsets
function calculateMarkerPositions(exchangesList: Exchange[]) {
  const OVERLAP_THRESHOLD = 0.5; // degrees - if exchanges are closer than this, offset them
  const OFFSET_RADIUS = 0.03; // 3D units - how far to offset overlapping markers on sphere
  const positions = new Map<string, Vector3>();
  const groups: Array<Exchange[]> = [];

  // Group exchanges by proximity
  exchangesList.forEach((exchange) => {
    let addedToGroup = false;
    for (const group of groups) {
      const firstInGroup = group[0];
      const distance = calculateDistance(
        exchange.latitude,
        exchange.longitude,
        firstInGroup.latitude,
        firstInGroup.longitude
      );
      if (distance < OVERLAP_THRESHOLD) {
        group.push(exchange);
        addedToGroup = true;
        break;
      }
    }
    if (!addedToGroup) {
      groups.push([exchange]);
    }
  });

  // Calculate positions for each group
  groups.forEach((group) => {
    if (group.length === 1) {
      // Single exchange, no offset needed
      const exchange = group[0];
      const position = latLongToVector3(exchange.latitude, exchange.longitude, 1.01);
      positions.set(exchange.id, position);
    } else {
      // Multiple exchanges at same location, offset them in a circle
      const centerExchange = group[0];
      const centerPosition = latLongToVector3(
        centerExchange.latitude,
        centerExchange.longitude,
        1.01
      );
      const angleStep = (2 * Math.PI) / group.length;

      group.forEach((exchange, index) => {
        const angle = index * angleStep;
        const offsetPosition = offsetOnSphere(centerPosition, angle, OFFSET_RADIUS);
        positions.set(exchange.id, offsetPosition);
      });
    }
  });

  return positions;
}

export default function ExchangeMarkers() {
  const { filters, selectedExchange, setSelectedExchange, setSelectedPair } = useStore();

  const filteredExchanges = useMemo(() => {
    return exchanges.filter((exchange) => {
      if (filters.exchanges.length > 0 && !filters.exchanges.includes(exchange.id)) {
        return false;
      }
      if (!filters.cloudProviders.includes(exchange.cloudProvider)) {
        return false;
      }
      return true;
    });
  }, [filters]);

  // Calculate positions with overlap handling
  const markerPositions = useMemo(() => {
    return calculateMarkerPositions(filteredExchanges);
  }, [filteredExchanges]);

  const handleExchangeClick = (exchangeId: string) => {
    if (selectedExchange && selectedExchange !== exchangeId) {
      // Create a pair
      setSelectedPair({ from: selectedExchange, to: exchangeId });
      setSelectedExchange(null);
    } else {
      setSelectedExchange(exchangeId === selectedExchange ? null : exchangeId);
      setSelectedPair(null);
    }
  };

  return (
    <>
      {filteredExchanges.map((exchange) => {
        const position = markerPositions.get(exchange.id) || 
          latLongToVector3(exchange.latitude, exchange.longitude, 1.01);
        return (
          <ExchangeMarker
            key={exchange.id}
            exchange={exchange}
            position={position}
            isSelected={selectedExchange === exchange.id}
            onClick={() => handleExchangeClick(exchange.id)}
          />
        );
      })}
    </>
  );
}

