'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Instructions() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useStore();
  
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-black/90' : 'bg-white/95';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-white/20' : 'border-gray-300';
  const grayTextClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const hoverClass = isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200';

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute bottom-2 right-2 sm:bottom-4 sm:right-4 ${bgClass} backdrop-blur-sm ${borderClass} border rounded-full p-2 sm:p-3 ${textClass} ${hoverClass} transition-colors z-10`}
        title="Show Instructions"
      >
        <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    );
  }

  return (
    <div className={`absolute bottom-2 right-2 sm:bottom-4 sm:right-4 ${bgClass} backdrop-blur-sm ${borderClass} border rounded-lg p-4 sm:p-6 ${textClass} max-w-[calc(100vw-1rem)] sm:max-w-md z-20`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold">Instructions</h3>
        <button
          onClick={() => setIsOpen(false)}
          className={`p-1 ${hoverClass} rounded transition-colors`}
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
        <div>
          <h4 className="font-semibold mb-1">3D Map Controls</h4>
          <ul className={`list-disc list-inside space-y-1 ${grayTextClass}`}>
            <li>Click and drag to rotate</li>
            <li>Scroll to zoom in/out</li>
            <li>Right-click and drag to pan</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-1">Viewing Latency</h4>
          <ul className={`list-disc list-inside space-y-1 ${grayTextClass}`}>
            <li>Click an exchange marker to select it</li>
            <li>Click another exchange to view historical data</li>
            <li>Color-coded connections show latency levels</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-1">Filtering</h4>
          <ul className={`list-disc list-inside space-y-1 ${grayTextClass}`}>
            <li>Use the control panel to filter by provider</li>
            <li>Search for specific exchanges</li>
            <li>Toggle visualization layers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

