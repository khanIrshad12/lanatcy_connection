'use client';

import { exchanges } from '@/data/exchanges';
import { convertLatencyToGlobeData } from '@/lib/globeUtils';
import { latencyService } from '@/lib/latencyService';
import { useStore } from '@/store/useStore';
import { LatencyData } from '@/types';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import CloudRegions from './CloudRegions';
import ControlPanel from './ControlPanel';
import ExchangeMarkers from './ExchangeMarkers';
import HistoricalChart from './HistoricalChart';
import Instructions from './Instructions';
import PerformanceMetrics from './PerformanceMetrics';
import ProgressBar from './ProgressBar';
import World from './ui/globe';

export default function MapVisualizer() {
  const {
    setLatencyData,
    filters,
    theme,
    latencyData,
    selectedPair,
    setSelectedPair,
    historicalData,
    setHistoricalData,
  } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLatencyUpdate = (data: LatencyData[]) => {
      console.log(`[MapVisualizer] Subscription update:`, {
        total: data.length,
        realAPI: data.filter((d) => d.isRealAPI).length,
        simulated: data.filter((d) => !d.isRealAPI).length,
      });
      setLatencyData(data);
    };

    latencyService.subscribe(handleLatencyUpdate);

    return () => {
      latencyService.unsubscribe(handleLatencyUpdate);
    };
  }, [setLatencyData]);

  // Sync data source mode with latency service and refresh data
  useEffect(() => {
    console.log(
      `[MapVisualizer useEffect] Mode changed to: ${filters.dataSourceMode}`
    );
    latencyService.setDataSourceMode(filters.dataSourceMode);

    // Trigger data refresh when mode changes
    console.log('[MapVisualizer useEffect] Calling refreshData...');
    const promise = latencyService.refreshData();
    console.log('[MapVisualizer useEffect] Promise created:', promise);

    promise
      .then((data) => {
        console.log(`[MapVisualizer useEffect] ✅ Received refreshed data:`, {
          total: data.length,
          realAPI: data.filter((d) => d.isRealAPI).length,
          simulated: data.filter((d) => !d.isRealAPI).length,
          sample: data.slice(0, 3).map((d) => ({
            from: d.from,
            to: d.to,
            isRealAPI: d.isRealAPI,
          })),
        });
        setLatencyData(data);
      })
      .catch((error) => {
        console.error(
          '[MapVisualizer useEffect] ❌ Error refreshing latency data:',
          error
        );
      });
  }, [filters.dataSourceMode, setLatencyData]);

  // Convert latency data to globe arc format
  const globeData = useMemo(() => {
    if (!filters.showRealTime) return [];

    console.log(`[MapVisualizer] Total latency data: ${latencyData.length}`);
    console.log(`[MapVisualizer] Data source mode: ${filters.dataSourceMode}`);

    let filteredData = latencyData.filter((data) => {
      // Filter by data source mode
      if (filters.dataSourceMode === 'simulated' && data.isRealAPI) {
        return false; // Only show simulated
      }
      if (filters.dataSourceMode === 'real' && !data.isRealAPI) {
        return false; // Only show real API
      }
      // 'both' mode shows all

      // Filter by latency range
      if (filters.latencyRange === 'all') return true;
      if (filters.latencyRange === 'low') return data.latency < 50;
      if (filters.latencyRange === 'medium')
        return data.latency >= 50 && data.latency < 150;
      if (filters.latencyRange === 'high') return data.latency >= 150;
      return true;
    });

    console.log(
      `[MapVisualizer] Filtered data: ${
        filteredData.length
      } (isRealAPI counts: ${
        filteredData.filter((d) => d.isRealAPI).length
      } real, ${filteredData.filter((d) => !d.isRealAPI).length} simulated)`
    );

    const globePositions = convertLatencyToGlobeData(filteredData, exchanges);
    console.log(`[MapVisualizer] Globe positions: ${globePositions.length}`);

    return globePositions;
  }, [latencyData, filters]);

  const globeConfig = useMemo(
    () => ({
      globeColor: theme === 'dark' ? '#062056' : '#1e40af',
      showAtmosphere: true,
      atmosphereColor: theme === 'dark' ? '#FFFFFF' : '#e0e7ff',
      atmosphereAltitude: 0.15,
      emissive: theme === 'dark' ? '#062056' : '#1e40af',
      emissiveIntensity: theme === 'dark' ? 0.1 : 0.05,
      autoRotate: false,
      autoRotateSpeed: 0.5,
    }),
    [theme]
  );

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-black' : 'bg-gray-50';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${bgClass} transition-colors duration-300`}
    >
      <Canvas
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <ambientLight intensity={0.6} color="#38bdf8" />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <directionalLight
          position={[-5, -5, -5]}
          intensity={0.5}
          color="#ffffff"
        />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />

        <Stars radius={300} depth={50} count={5000} factor={4} fade speed={1} />

        <World globeConfig={globeConfig} data={globeData} />

        {filters.showRegions && <CloudRegions />}
        <ExchangeMarkers />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={false}
          autoRotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>

      <ControlPanel />
      <ProgressBar />
      <HistoricalChart
        filters={filters}
        selectedPair={selectedPair}
        setSelectedPair={setSelectedPair}
        historicalData={historicalData}
        setHistoricalData={setHistoricalData}
      />
      <PerformanceMetrics />
      <Instructions />
    </div>
  );
}
