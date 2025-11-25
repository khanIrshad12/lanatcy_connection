import { Exchange, LatencyData } from '@/types';
import { Position } from '@/types/globe';

export function getLatencyColor(latency: number): string {
  if (latency < 50) return '#00ff00'; // Green
  if (latency < 150) return '#ffff00'; // Yellow
  return '#ff0000'; // Red
}

// Calculate distance between two lat/lng points in kilometers
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function convertLatencyToGlobeData(
  latencyData: LatencyData[],
  exchanges: Exchange[]
): Position[] {
  const positions: Position[] = [];

  latencyData.forEach((data, index) => {
    const fromExchange = exchanges.find((e) => e.id === data.from);
    const toExchange = exchanges.find((e) => e.id === data.to);

    if (!fromExchange || !toExchange) {
      return;
    }

    // Calculate distance between exchanges
    const distance = calculateDistance(
      fromExchange.latitude,
      fromExchange.longitude,
      toExchange.latitude,
      toExchange.longitude
    );

    // For real API connections, use distance-based altitude (longer distance = higher arc)
    // For simulated connections, use latency-based altitude
    let arcAlt: number;

    if (data.isRealAPI) {
      // Real API: Base altitude of 0.2, plus distance factor (max 0.4 for very long distances)
      // Distance factor: 0.1 for every 5000km, capped at 0.2 additional altitude
      const distanceFactor = Math.min(0.2, (distance / 5000) * 0.1);
      arcAlt = 0.2 + distanceFactor; // Range: 0.2 to 0.4
    } else {
      // Simulated: Use latency-based altitude with minimum
      const baseArcAlt = data.latency / 200;
      arcAlt = Math.max(0.1, Math.min(baseArcAlt, 0.9));
    }

    positions.push({
      order: index,
      startLat: fromExchange.latitude,
      startLng: fromExchange.longitude,
      endLat: toExchange.latitude,
      endLng: toExchange.longitude,
      arcAlt,
      color: getLatencyColor(data.latency),
      isRealAPI: data.isRealAPI ?? false, // Pass through the real API flag
    });
  });

  return positions;
}
