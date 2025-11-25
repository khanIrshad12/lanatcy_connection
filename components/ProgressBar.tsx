'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { exchanges } from '@/data/exchanges';

export default function ProgressBar() {
  const { filters, latencyData } = useStore();
  const [progress, setProgress] = useState({ current: 0, total: 0, isActive: false });

  useEffect(() => {
    if (filters.dataSourceMode !== 'real') {
      setProgress({ current: 0, total: 0, isActive: false });
      return;
    }

    // Calculate total pairs (n*(n-1)/2 for n exchanges)
    const totalExchanges = exchanges.length;
    const totalPairs = (totalExchanges * (totalExchanges - 1)) / 2;
    
    const handleUpdate = () => {
      // Count real API connections from current latency data
      const realAPIData = latencyData.filter(d => d.isRealAPI);
      
      setProgress({
        current: realAPIData.length,
        total: totalPairs,
        isActive: realAPIData.length < totalPairs,
      });
    };

    // Check immediately
    handleUpdate();
    
    // Check every 500ms
    const interval = setInterval(handleUpdate, 500);

    return () => clearInterval(interval);
  }, [filters.dataSourceMode, latencyData]);

  // Progress bar is hidden
  return null;
  
  // if (!progress.isActive || filters.dataSourceMode !== 'real') {
  //   return null;
  // }

  const percentage = progress.total > 0 
    ? Math.min(100, Math.round((progress.current / progress.total) * 100))
    : 0;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-w-[300px]">
      <div className="flex items-center gap-3 mb-2">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white mb-1">
            Fetching Real API Data...
          </div>
          <div className="text-xs text-gray-400">
            {progress.current} / {progress.total} connections
          </div>
        </div>
        <div className="text-sm font-bold text-white">
          {percentage}%
        </div>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
