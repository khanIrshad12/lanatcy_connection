# 🎬 Quick Reference Card - Video Demo

## Opening (30 seconds)
- "Real-time latency visualization for cryptocurrency exchanges"
- "3D interactive globe showing exchange locations and network latency"
- "Built with Next.js, Three.js, and TypeScript"

---

## 🎯 Key Points to Cover

### 1. Architecture (2 min)
- **Tech Stack**: Next.js 14, TypeScript, Three.js + React Three Fiber, Zustand, Recharts
- **Structure**: 
  - `app/` - Routes
  - `components/` - React components
  - `lib/` - Services (latencyService)
  - `store/` - Zustand state
  - `data/` - Static data

### 2. Core Features (5 min)

#### 3D Globe
- Exchange markers (colored by cloud provider)
- Animated latency arcs (color-coded by latency)
- Interactive controls (rotate, zoom, pan)

#### Control Panel
- Cloud provider filters (AWS/GCP/Azure)
- Latency range filter
- Data source mode (Simulated/Real/Both)
- Search exchanges
- Layer toggles

#### Real-time Data
- Three modes: Simulated, Real API, Both
- Globalping API integration
- Batching and rate limiting
- Incremental updates

#### Historical Charts
- Select exchange pairs
- Time ranges: 1h, 24h, 7d, 30d
- Statistics: min/max/avg
- Real-time updates

### 3. Code Walkthrough (5 min)

#### MapVisualizer.tsx
- Main container component
- Three.js Canvas setup
- Subscription pattern
- useMemo for performance

#### latencyService.ts
- Singleton service class
- API integration (Globalping)
- Fallback mechanism
- Batching logic
- Historical data storage

#### useStore.ts
- Zustand state management
- Filter state
- Latency data
- Selected pairs
- Theme

#### ControlPanel.tsx
- Filter UI
- Glassmorphism design
- Dark/light theme
- Search functionality

#### HistoricalChart.tsx
- Recharts integration
- Real-time updates
- Statistics display
- Responsive design

### 4. Technical Highlights (2 min)

#### Performance
- useMemo for expensive calculations
- Request batching
- Incremental updates
- Request deduplication
- Code splitting

#### Error Handling
- API fallback to simulated
- Graceful degradation
- Progress indicators
- Retry logic
- Input validation

#### Code Quality
- Full TypeScript
- Modular architecture
- Reusable components
- Clean code
- Documentation

---

## 🎬 Demo Scenarios

### Scenario 1: Performance Analysis
1. Filter to AWS only
2. Select exchange pair
3. View historical chart
4. Change time range

### Scenario 2: Cloud Comparison
1. Toggle cloud providers
2. Show connection changes
3. Compare latencies

### Scenario 3: Data Source Modes
1. Switch between modes
2. Show loading differences
3. Point out progress

---

## 💬 Key Phrases to Use

- "This application visualizes..."
- "Built with modern web technologies..."
- "The service supports three modes..."
- "Notice how the component..."
- "This demonstrates..."
- "The architecture follows..."
- "Performance optimizations include..."

---

## 🎥 Visual Elements to Show

1. **Full Application**
   - Rotating globe
   - Exchange markers
   - Animated arcs

2. **Code Editor**
   - Project structure
   - Key files
   - Important code sections

3. **Browser DevTools** (optional)
   - Console logs
   - Network requests
   - Performance metrics

4. **Control Panel**
   - Filters in action
   - Search functionality
   - Theme toggle

5. **Historical Chart**
   - Data visualization
   - Statistics display
   - Time range selection

---

## ⚡ Quick Stats to Mention

- **Exchanges**: Multiple major exchanges (Binance, OKX, Bybit, etc.)
- **Cloud Providers**: AWS, GCP, Azure
- **Update Frequency**: Every 30 seconds
- **Latency Ranges**: <50ms (green), 50-150ms (yellow), >150ms (red)
- **Time Ranges**: 1 hour, 24 hours, 7 days, 30 days

---

## 🎯 Closing Points

- Modern web development practices
- 3D visualization with Three.js
- Real-time data integration
- Production-ready code
- Clean architecture
- Performance optimized
- User-friendly interface

---

## ⚠️ Common Mistakes to Avoid

- Don't rush through code
- Don't skip demonstrations
- Don't forget to show features working
- Don't read code line-by-line
- Don't forget to explain the "why"
- Don't skip error handling discussion
- Don't forget to mention performance

---

## 📋 Pre-Recording Checklist

- [ ] Application running smoothly
- [ ] VS Code open with project
- [ ] Browser ready with app loaded
- [ ] Console cleared
- [ ] Notifications disabled
- [ ] Good lighting
- [ ] Microphone tested
- [ ] Screen resolution set (1920x1080 ideal)

---

## 🎬 Recording Flow

1. **Start**: Show running application (30s)
2. **Architecture**: Show code structure (2min)
3. **Features**: Demonstrate each feature (5min)
4. **Code**: Walk through key files (5min)
5. **Technical**: Highlight optimizations (2min)
6. **Demo**: Show scenarios (2min)
7. **Close**: Summary and future (1min)

**Total: ~15-17 minutes**

---

Good luck! 🚀

