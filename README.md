# Latency Topology Visualizer

A Next.js application that displays a 3D world map visualizing exchange server locations and real-time/historical latency data across AWS, GCP, and Azure co-location regions for cryptocurrency trading infrastructure.

## Features

### Core Functionality

- **3D World Map Display**: Interactive 3D globe with smooth camera controls (rotate, zoom, pan)
- **Exchange Server Locations**: Visual markers for major cryptocurrency exchanges (Binance, OKX, Bybit, Deribit, Coinbase, Kraken, etc.)
- **Real-time Latency Visualization**: Animated connections between exchanges with color-coded latency (green/yellow/red)
- **Historical Latency Trends**: Time-series charts showing latency history for selected exchange pairs
- **Cloud Provider Regions**: Visualization of AWS, GCP, and Azure regions with distinct styling
- **Interactive Controls**: Filtering by exchange, cloud provider, and latency range
- **Search Functionality**: Quick search to locate specific exchanges
- **Performance Metrics**: Real-time FPS, connection count, and average latency display
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Bonus Features

- **Dark Theme**: Modern dark theme with glassmorphism UI
- **Interactive Legend**: Color-coded legend for cloud providers and latency ranges
- **Layer Toggles**: Show/hide real-time connections, historical charts, and cloud regions
- **Smooth Animations**: Pulse effects on latency connections and rotating markers

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **Globe Component**: GitHub-style globe inspired by [Aceternity UI](https://ui.aceternity.com/components/github-globe)
- **UI Components**: React Three Drei
- **Charts**: Recharts
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Modern web browser with WebGL support

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd goquant-assignment
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

## Project Structure

```
goquant-assignment/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── MapVisualizer.tsx # Main 3D map container
│   ├── AceternityGlobe.tsx # GitHub-style 3D globe with animated arcs
│   ├── ExchangeMarkers.tsx
│   ├── ExchangeMarker.tsx
│   ├── LatencyConnections.tsx
│   ├── LatencyConnection.tsx
│   ├── CloudRegions.tsx
│   ├── CloudRegionMarker.tsx
│   ├── ControlPanel.tsx  # Filter and control UI
│   ├── HistoricalChart.tsx
│   └── PerformanceMetrics.tsx
├── data/                  # Static data
│   ├── exchanges.ts      # Exchange locations
│   └── cloudRegions.ts   # Cloud provider regions
├── lib/                   # Utilities
│   ├── latencyService.ts # Latency data service
│   ├── globeUtils.ts     # Globe data conversion utilities
│   └── utils.ts          # Helper functions
├── store/                 # State management
│   └── useStore.ts       # Zustand store
└── types/                 # TypeScript types
    ├── index.ts
    └── globe.ts           # Globe component types
```

## Usage

### Viewing Exchange Locations

- Exchange markers are displayed as colored spheres on the 3D globe
- Colors indicate cloud provider:
  - **Orange**: AWS
  - **Blue**: GCP
  - **Azure Blue**: Azure
- Hover over markers to see exchange names
- Click on markers to select them

### Viewing Latency Connections

- Real-time latency connections appear as animated arcs between exchanges (GitHub-style globe visualization)
- Color coding:
  - **Green**: Low latency (<50ms)
  - **Yellow**: Medium latency (50-150ms)
  - **Red**: High latency (>150ms)
- Arcs pulse with opacity animations to show active data flow
- Higher latency connections have higher arc altitudes

### Viewing Historical Data

1. Click on an exchange marker to select it
2. Click on another exchange marker to create a pair
3. Historical chart appears at the bottom showing latency trends
4. Select time range: 1 hour, 24 hours, 7 days, or 30 days
5. View statistics: min, max, and average latency

### Filtering

Use the control panel (top-left) to:

- Filter by cloud provider (AWS, GCP, Azure)
- Filter by specific exchanges
- Filter by latency range
- Toggle visualization layers
- Search for exchanges

## Assumptions and Notes

### Latency Data

- **Real API Integration**: The application uses **Globalping API** for real-time latency measurements
  - API: https://api.globalping.io/v1/measurements
  - Free and open-source network monitoring service
  - Measures actual ping latency from global probe locations
- **Fallback Mechanism**: If the API is unavailable, the service falls back to simulated data based on geographic distance
- **Update Frequency**: Latency data updates every 10 seconds (to respect API rate limits)
- **Rate Limiting**: Requests are batched (5 at a time) with delays to avoid overwhelming the API
- **Historical Data**: Historical data is stored in-memory and persists during the session

### Exchange Locations

- Exchange locations are approximate and based on known data center locations
- Some exchanges may have multiple data centers; this visualization shows primary locations
- Cloud provider assignments are based on public information and may vary

### Performance

- 3D rendering is optimized for modern GPUs
- Mobile devices may experience reduced performance with many connections
- Consider reducing connection count on lower-end devices

## Future Enhancements

- Integration with real latency monitoring APIs (Cloudflare Radar, Pingdom, etc.)
- Latency heatmap overlay on globe surface
- Network topology visualization with connection paths
- Animated data flow showing trading volume
- Export functionality for latency reports
- Light theme option
- Touch-optimized controls for mobile

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (with WebGL support)
- Mobile browsers with WebGL support

## License

This project is created for assignment purposes.

## Contact

For questions or issues, please refer to the repository.
