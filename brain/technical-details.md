# Technical Details

## Dependencies

### Core
- `next@^14.2.5` - Next.js framework
- `react@^18.3.1` - React library
- `typescript@^5.5.4` - TypeScript compiler

### 3D Graphics
- `three@^0.169.0` - 3D graphics library
- `@react-three/fiber@^8.16.8` - React renderer for Three.js
- `@react-three/drei@^9.114.3` - Useful helpers for R3F

### UI & Charts
- `recharts@^2.12.7` - Charting library
- `lucide-react@^0.427.0` - Icon library
- `tailwindcss@^3.4.7` - CSS framework

### State & Utils
- `zustand@^4.5.2` - State management
- `date-fns@^3.6.0` - Date utilities

## Key Implementation Details

### Latency Service
- Simulates latency based on geographic distance
- Updates every 5 seconds
- Maintains historical data (last 1000 points per connection)
- Can be easily replaced with real API

### 3D Coordinate System
- Uses spherical coordinates (lat/long) converted to 3D vectors
- Globe radius: 1 unit
- Markers positioned at radius 1.01 (slightly above surface)
- Connections use curved paths via CatmullRomCurve3

### Performance Optimizations
- Dynamic imports for 3D components (no SSR)
- Memoized calculations for filtered data
- Efficient re-renders with Zustand
- FPS monitoring for performance tracking

### Responsive Design
- Touch controls enabled for mobile
- Responsive UI panels with max-width constraints
- Z-index layering for proper stacking
- Touch-action: none to prevent scroll conflicts

## Browser Compatibility
- Requires WebGL support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers with WebGL

## Known Limitations
- Latency data is simulated (not from real API)
- Historical data is generated, not persisted
- Performance may degrade with 100+ connections
- Mobile devices may have reduced FPS

