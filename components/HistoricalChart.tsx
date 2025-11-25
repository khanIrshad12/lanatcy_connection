'use client';

import { exchanges } from '@/data/exchanges';
import { latencyService } from '@/lib/latencyService';
import { useStore } from '@/store/useStore';
import { FilterState, HistoricalLatency, LatencyData } from '@/types';
import { format } from 'date-fns';
import { Clock, X, Activity } from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface HistoricalChartProps {
  filters?: FilterState;
  selectedPair?: { from: string; to: string } | null;
  setSelectedPair?: (pair: { from: string; to: string } | null) => void;
  historicalData?: HistoricalLatency[];
  setHistoricalData?: (data: HistoricalLatency[]) => void;
}

export default function HistoricalChart(props?: HistoricalChartProps) {
  const store = useStore();
  // Use props if provided, otherwise fall back to store
  const filters = props?.filters ?? store.filters;
  const selectedPair = props?.selectedPair ?? store.selectedPair;
  const setSelectedPair = props?.setSelectedPair ?? store.setSelectedPair;
  const historicalData = props?.historicalData ?? store.historicalData;
  const setHistoricalData = props?.setHistoricalData ?? store.setHistoricalData;
  const theme = store.theme;
  const [timeRange, setTimeRange] = useState<number>(3600000); // 1 hour default
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-black/80' : 'bg-white/90';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-white/20' : 'border-gray-300';

  // Memoize to ensure stable reference
  const showHistorical = useMemo(
    () => filters.showHistorical,
    [filters.showHistorical]
  );

  const updateData = useCallback(() => {
    if (!selectedPair) return;

    const data = latencyService.getHistoricalData(
      selectedPair.from,
      selectedPair.to,
      timeRange
    );
    setHistoricalData(data);

    const latencyStats = latencyService.getLatencyStats(
      selectedPair.from,
      selectedPair.to,
      timeRange
    );
    setStats(latencyStats);
  }, [selectedPair, timeRange, setHistoricalData]);

  useEffect(() => {
    if (!selectedPair || !showHistorical) {
      setHistoricalData([]);
      setStats({ min: 0, max: 0, avg: 0 });
      return;
    }

    // Initial fetch
    updateData();

    // Subscribe to real-time updates
    const handleSubscriptionUpdate = (_: LatencyData[]) => {
      updateData();
    };

    latencyService.subscribe(handleSubscriptionUpdate);

    return () => {
      latencyService.unsubscribe(handleSubscriptionUpdate);
    };
  }, [selectedPair, showHistorical, updateData]);

  // Hide chart when toggle is off
  if (!showHistorical) {
    return null;
  }

  // Show instruction when enabled but no pair selected
  if (!selectedPair) {
    return null;
  }

  const fromExchange = exchanges.find((e) => e.id === selectedPair.from);
  const toExchange = exchanges.find((e) => e.id === selectedPair.to);

  const chartData = historicalData.map((point) => ({
    time: format(new Date(point.timestamp), 'HH:mm:ss'),
    latency: point.latency,
    timestamp: point.timestamp,
  }));

  const selectBgClass = isDark ? 'bg-white/10' : 'bg-gray-100';
  const selectBorderClass = isDark ? 'border-white/20' : 'border-gray-300';
  const hoverClass = isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200';
  const gridColor = isDark ? '#333' : '#e5e7eb';
  const axisColor = isDark ? '#999' : '#6b7280';
  const tooltipBg = isDark ? '#1a1a1a' : '#ffffff';
  const tooltipBorder = isDark ? '#333' : '#e5e7eb';
  const tooltipText = isDark ? '#fff' : '#000';

  // Show message if no data available
  if (chartData.length === 0) {
    return (
      <div
        className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 ${bgClass} backdrop-blur-md ${borderClass} border rounded-xl p-4 sm:p-6 ${textClass} max-w-4xl z-10 mx-auto shadow-2xl`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              {fromExchange?.name} → {toExchange?.name}
            </h3>
          </div>
          <button
            onClick={() => setSelectedPair(null)}
            className={`p-1.5 ${hoverClass} rounded-full transition-all duration-200`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-48 sm:h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Activity className="w-8 h-8 text-gray-500 animate-pulse" />
            <p
              className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'
                } text-center px-2`}
            >
              Waiting for data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 ${bgClass} backdrop-blur-md ${borderClass} border rounded-xl p-4 sm:p-6 ${textClass} max-w-4xl z-10 mx-auto shadow-2xl transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              {fromExchange?.name} → {toExchange?.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Updates
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex gap-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Min</span>
              <span className="font-mono font-bold text-green-400">{stats.min}ms</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Avg</span>
              <span className="font-mono font-bold text-blue-400">{stats.avg}ms</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Max</span>
              <span className="font-mono font-bold text-red-400">{stats.max}ms</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className={`px-3 py-1.5 ${selectBgClass} ${selectBorderClass} border rounded-lg text-sm ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
            >
              <option value={3600000}>1 Hour</option>
              <option value={86400000}>24 Hours</option>
              <option value={604800000}>7 Days</option>
              <option value={2592000000}>30 Days</option>
            </select>
            <button
              onClick={() => setSelectedPair(null)}
              className={`p-1.5 ${hoverClass} rounded-full transition-all duration-200`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-48 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4285F4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4285F4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="time"
              stroke={axisColor}
              tick={{ fill: axisColor, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              stroke={axisColor}
              tick={{ fill: axisColor, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Latency (ms)',
                angle: -90,
                position: 'insideLeft',
                fill: axisColor,
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: tooltipText, fontWeight: 'bold', marginBottom: '4px' }}
              itemStyle={{ color: '#4285F4' }}
            />
            <Area
              type="monotone"
              dataKey="latency"
              stroke="#4285F4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLatency)"
              name="Latency (ms)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
