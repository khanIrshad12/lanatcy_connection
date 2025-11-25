# Latency Topology Visualizer - Project Overview

## Project Description
A Next.js application that visualizes cryptocurrency exchange server locations and latency data on a 3D world map. The application displays real-time and historical latency connections between exchanges across AWS, GCP, and Azure cloud regions.

## Key Technologies
- Next.js 14 (App Router)
- TypeScript
- Three.js + React Three Fiber
- Zustand (State Management)
- Recharts (Historical Charts)
- Tailwind CSS

## Architecture

### Components Structure
1. **MapVisualizer** - Main container component
2. **Globe** - 3D sphere representing Earth
3. **ExchangeMarkers** - Collection of exchange location markers
4. **ExchangeMarker** - Individual exchange marker with hover/click
5. **LatencyConnections** - Real-time latency connection lines
6. **LatencyConnection** - Individual animated connection
7. **CloudRegions** - Cloud provider region markers
8. **CloudRegionMarker** - Individual region marker
9. **ControlPanel** - Filter and control UI
10. **HistoricalChart** - Time-series latency chart
11. **PerformanceMetrics** - FPS and performance stats

### Data Flow
- `latencyService` generates simulated latency data every 5 seconds
- Zustand store manages global state (filters, selections, data)
- Components subscribe to store updates
- Historical data is generated on-demand

### Key Features Implemented
✅ 3D interactive globe
✅ Exchange markers with cloud provider colors
✅ Real-time animated latency connections
✅ Historical latency charts
✅ Cloud region visualization
✅ Filtering and search
✅ Performance metrics
✅ Responsive design
✅ Dark theme

## Data Sources
- Exchange locations: Static data in `data/exchanges.ts`
- Cloud regions: Static data in `data/cloudRegions.ts`
- Latency data: Simulated in `lib/latencyService.ts`

## Future Improvements
- Real API integration for latency data
- Heatmap overlay
- Network topology paths
- Trading volume visualization
- Export functionality

