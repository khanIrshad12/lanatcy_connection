# Aceternity Globe Integration

## Overview
The project now uses the GitHub-style globe component from Aceternity UI for the 3D world map visualization. This provides a more polished and interactive experience similar to GitHub's homepage globe.

## Implementation Details

### Component Structure
- **AceternityGlobe.tsx**: Main globe component with animated arcs
- **GlobeMesh**: The 3D sphere representing Earth
- **AnimatedArc**: Individual arc connections with pulse animations
- **globeUtils.ts**: Utility functions to convert latency data to globe format

### Data Format
The Globe component expects data in the `Position[]` format:
```typescript
{
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;  // Arc altitude (height above globe)
  color: string;   // Hex color for the arc
}
```

### Features
- **Animated Arcs**: Connections pulse with opacity animations
- **Atmosphere Layer**: Optional atmospheric glow around the globe
- **Color-coded Latency**: Arcs change color based on latency (green/yellow/red)
- **Arc Altitude**: Higher latency connections have higher arcs
- **Smooth Animations**: Frame-based animations for smooth performance

### Configuration
The globe can be customized via `GlobeConfig`:
- `globeColor`: Base color of the globe
- `showAtmosphere`: Enable/disable atmosphere layer
- `atmosphereColor`: Color of the atmosphere
- `emissive`: Emissive color for glow effect
- `autoRotate`: Enable automatic rotation
- `autoRotateSpeed`: Speed of rotation

### Integration
- Latency data is converted to globe arcs using `convertLatencyToGlobeData()`
- Arcs are filtered based on user-selected latency ranges
- Exchange markers remain separate and overlay on the globe
- Cloud regions can be toggled on/off

## Reference
Based on: https://ui.aceternity.com/components/github-globe

