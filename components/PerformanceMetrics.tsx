'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Activity, Server, Zap, GripVertical } from 'lucide-react';

export default function PerformanceMetrics() {
  const { latencyData, theme } = useStore();
  const [fps, setFps] = useState(60);
  const [lastTime, setLastTime] = useState(Date.now());
  const [frameCount, setFrameCount] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const metricsRef = useRef<HTMLDivElement>(null);
  
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-black/80' : 'bg-white/90';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-white/20' : 'border-gray-300';
  const grayTextClass = isDark ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    let animationFrameId: number;
    let lastFpsTime = Date.now();
    let fpsCount = 0;

    const measureFps = () => {
      const now = Date.now();
      fpsCount++;

      if (now - lastFpsTime >= 1000) {
        setFps(fpsCount);
        fpsCount = 0;
        lastFpsTime = now;
      }

      animationFrameId = requestAnimationFrame(measureFps);
    };

    animationFrameId = requestAnimationFrame(measureFps);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const avgLatency = latencyData.length > 0
    ? Math.round(latencyData.reduce((sum, d) => sum + d.latency, 0) / latencyData.length)
    : 0;

  const activeConnections = latencyData.length;

  // Initialize position on mount (top-right corner)
  useEffect(() => {
    if (metricsRef.current) {
      const rect = metricsRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 16,
        y: 16,
      });
    }
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (metricsRef.current) {
      const rect = metricsRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && metricsRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Constrain to viewport
        const maxX = window.innerWidth - (metricsRef.current.offsetWidth || 200);
        const maxY = window.innerHeight - (metricsRef.current.offsetHeight || 150);
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={metricsRef}
      className={`absolute ${bgClass} backdrop-blur-sm ${borderClass} border rounded-lg p-2 sm:p-4 ${textClass} z-10 max-w-[calc(100vw-1rem)] sm:max-w-xs ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'none',
      }}
    >
      <div
        className="flex items-center justify-between mb-2 sm:mb-3 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
          <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Performance</span>
          <span className="sm:hidden">Perf</span>
        </h3>
        <GripVertical className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'} opacity-50`} />
      </div>
      <div className="space-y-1.5 sm:space-y-2 text-xs">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <span className={grayTextClass}>FPS</span>
          <span className={`font-mono ${textClass}`}>{fps}</span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <span className={`${grayTextClass} flex items-center gap-1`}>
            <Server className="w-3 h-3" />
            <span className="hidden sm:inline">Connections</span>
            <span className="sm:hidden">Conn</span>
          </span>
          <span className={`font-mono ${textClass}`}>{activeConnections}</span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <span className={`${grayTextClass} flex items-center gap-1`}>
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Avg Latency</span>
            <span className="sm:hidden">Latency</span>
          </span>
          <span className={`font-mono ${textClass}`}>{avgLatency}ms</span>
        </div>
      </div>
    </div>
  );
}

