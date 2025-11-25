# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Open Browser**
   - Navigate to http://localhost:3000
   - Ensure WebGL is enabled in your browser

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure Overview

```
app/              - Next.js app directory
components/       - React components
  ├── MapVisualizer.tsx    - Main 3D map container
  ├── Globe.tsx            - 3D globe
  ├── ExchangeMarkers.tsx  - Exchange location markers
  ├── LatencyConnections.tsx - Real-time connections
  ├── ControlPanel.tsx     - Filter UI
  ├── HistoricalChart.tsx  - Time-series chart
  └── PerformanceMetrics.tsx - FPS/stats
data/             - Static data (exchanges, regions)
lib/              - Utilities and services
store/            - Zustand state management
types/            - TypeScript type definitions
brain/            - Project documentation
```

## Key Files to Modify

### Adding New Exchanges
Edit `data/exchanges.ts` and add new exchange objects with:
- id, name, latitude, longitude, cloudProvider, region, regionCode

### Changing Latency Update Frequency
Edit `lib/latencyService.ts` and modify the interval in the `subscribe` method (currently 5000ms)

### Styling Changes
Edit `app/globals.css` or component-specific Tailwind classes

### Theme Customization
Modify color values in:
- `app/globals.css` (CSS variables)
- Component files (provider colors, latency colors)

## Troubleshooting

### WebGL Not Supported
- Update your browser
- Enable hardware acceleration
- Check WebGL support at https://get.webgl.org/

### Performance Issues
- Reduce number of connections in `data/exchanges.ts`
- Lower update frequency in `latencyService.ts`
- Disable some visualization layers

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

## Environment Variables
Currently none required. For production API integration, add:
- `NEXT_PUBLIC_LATENCY_API_URL`
- `NEXT_PUBLIC_LATENCY_API_KEY`

