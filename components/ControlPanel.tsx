'use client';

import { exchanges } from '@/data/exchanges';
import { useStore } from '@/store/useStore';
import { FilterState } from '@/types';
import {
  Activity,
  ChevronDown,
  Cloud,
  Database,
  Filter,
  Layers,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ControlPanel() {
  const {
    filters,
    setFilters,
    selectedExchange,
    setSelectedExchange,
    selectedPair,
    setSelectedPair,
    theme,
    toggleTheme,
  } = useStore();

  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localFrom, setLocalFrom] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync theme with HTML element for CSS selectors
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync localFrom with selectedPair when it changes externally
  useEffect(() => {
    if (selectedPair && selectedPair.from !== localFrom) {
      setLocalFrom(selectedPair.from);
    }
  }, [selectedPair, localFrom]);

  const filteredExchanges = exchanges.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloudProviderToggle = (provider: 'AWS' | 'GCP' | 'Azure') => {
    const newProviders = filters.cloudProviders.includes(provider)
      ? filters.cloudProviders.filter((p) => p !== provider)
      : [...filters.cloudProviders, provider];
    setFilters({ cloudProviders: newProviders });
  };

  if (!isMounted) return null;

  const isDark = theme === 'dark';

  // Base styles
  const panelBaseClasses = `
    absolute top-20 left-4 z-[100]
    transition-all duration-300 ease-in-out
    flex flex-col
    ${isOpen ? 'w-80 max-h-[calc(100vh-5rem)]' : 'w-auto'}
    pointer-events-auto
  `;

  const contentClasses = `
    backdrop-blur-md border shadow-xl rounded-xl overflow-hidden
    ${
      isDark
        ? 'bg-black/80 border-white/10 text-white'
        : 'bg-white/90 border-gray-200 text-gray-900'
    }
  `;

  const headerClasses = `
    flex items-center justify-between p-4 relative z-20
    border-b ${isDark ? 'border-white/10' : 'border-gray-200'}
  `;

  const sectionClasses = `
    p-4 border-b last:border-0 ${isDark ? 'border-white/10' : 'border-gray-200'}
  `;

  const inputClasses = `
    w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors
    border ${
      isDark
        ? 'bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder-gray-500'
        : 'bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900 placeholder-gray-400'
    }
  `;

  const selectClasses = `
    w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none cursor-pointer
    border ${
      isDark
        ? 'bg-white/5 border-white/10 focus:border-blue-500 text-white'
        : 'bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900'
    }
  `;

  // Option styles for dark mode
  const optionStyle = isDark
    ? { backgroundColor: '#1a1a1a', color: '#ffffff' }
    : { backgroundColor: '#ffffff', color: '#111827' };

  const labelClasses = `
    text-xs font-medium uppercase tracking-wider mb-2 block
    ${isDark ? 'text-gray-400' : 'text-gray-500'}
  `;

  return (
    <div className={panelBaseClasses}>
      {/* Main Container */}
      <div className={contentClasses}>
        {/* Header */}
        <div className={headerClasses}>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isDark
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              <Filter className="w-4 h-4" />
            </div>
            {isOpen && <h1 className="font-bold text-sm">Control Panel</h1>}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              {isOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4 -rotate-90" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        {isOpen && (
          <div
            className="overflow-y-auto custom-scrollbar"
            style={{ maxHeight: 'calc(100vh - 12rem)' }}
          >
            {/* Search Section */}
            <div className={sectionClasses}>
              <div className="relative">
                <Search
                  className={`absolute left-3 top-2.5 w-4 h-4 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search exchanges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputClasses} pl-9`}
                />
              </div>
            </div>

            {/* Pair Analysis */}
            <div className={sectionClasses}>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold">Pair Analysis</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClasses}>Source</label>
                  <div className="relative">
                    <select
                      value={localFrom}
                      onChange={(e) => {
                        const from = e.target.value;
                        setLocalFrom(from);
                        if (from && selectedPair?.to) {
                          setSelectedPair({ from, to: selectedPair.to });
                        } else if (!from) {
                          setSelectedPair(null);
                        }
                      }}
                      className={selectClasses}
                      style={{
                        backgroundImage: isDark
                          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`
                          : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23111827' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="" style={optionStyle}>
                        Select Source...
                      </option>
                      {exchanges.map((ex) => (
                        <option key={ex.id} value={ex.id} style={optionStyle}>
                          {ex.name} ({ex.cloudProvider})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Target</label>
                  <div className="relative">
                    <select
                      value={selectedPair?.to || ''}
                      onChange={(e) => {
                        const to = e.target.value;
                        if (localFrom && to) {
                          setSelectedPair({ from: localFrom, to });
                        }
                      }}
                      disabled={!localFrom}
                      className={`${selectClasses} ${
                        !localFrom ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{
                        backgroundImage: isDark
                          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`
                          : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23111827' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="" style={optionStyle}>
                        Select Target...
                      </option>
                      {exchanges
                        .filter((ex) => ex.id !== localFrom)
                        .map((ex) => (
                          <option key={ex.id} value={ex.id} style={optionStyle}>
                            {ex.name} ({ex.cloudProvider})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Providers */}
            <div className={sectionClasses}>
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold">Cloud Providers</span>
              </div>
              <div className="space-y-2">
                {(['AWS', 'GCP', 'Azure'] as const).map((provider) => (
                  <label
                    key={provider}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`
                      w-4 h-4 rounded border flex items-center justify-center transition-colors
                      ${
                        filters.cloudProviders.includes(provider)
                          ? 'bg-blue-500 border-blue-500'
                          : isDark
                          ? 'border-gray-600 group-hover:border-gray-500'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }
                    `}
                    >
                      {filters.cloudProviders.includes(provider) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={filters.cloudProviders.includes(provider)}
                      onChange={() => handleCloudProviderToggle(provider)}
                    />
                    <span className="text-sm">{provider}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Data Source */}
            <div className={sectionClasses}>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold">Data Source</span>
              </div>
              <select
                value={filters.dataSourceMode}
                onChange={(e) =>
                  setFilters({ dataSourceMode: e.target.value as any })
                }
                className={selectClasses}
                style={{
                  backgroundImage: isDark
                    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`
                    : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23111827' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="simulated" style={optionStyle}>
                  Simulated Only
                </option>
                <option value="real" style={optionStyle}>
                  Real API Only
                </option>
                <option value="both" style={optionStyle}>
                  Mixed (Both)
                </option>
              </select>
              <p
                className={`text-xs mt-2 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {filters.dataSourceMode === 'simulated' &&
                  'Using distance-based simulation'}
                {filters.dataSourceMode === 'real' &&
                  'Live data from Globalping API'}
                {filters.dataSourceMode === 'both' &&
                  'Prioritizes real data, falls back to sim'}
              </p>
            </div>

            {/* Latency Range */}
            <div className={sectionClasses}>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold">Latency Range</span>
              </div>
              <select
                value={filters.latencyRange}
                onChange={(e) =>
                  setFilters({ latencyRange: e.target.value as any })
                }
                className={selectClasses}
                style={{
                  backgroundImage: isDark
                    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`
                    : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23111827' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="all" style={optionStyle}>
                  All Latencies
                </option>
                <option value="low" style={optionStyle}>
                  Low (&lt;50ms)
                </option>
                <option value="medium" style={optionStyle}>
                  Medium (50-150ms)
                </option>
                <option value="high" style={optionStyle}>
                  High (&gt;150ms)
                </option>
              </select>
            </div>

            {/* Layers */}
            <div className={sectionClasses}>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold">
                  Visualization Layers
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'showRealTime', label: 'Real-time Latency' },
                  { id: 'showHistorical', label: 'Historical Chart' },
                  { id: 'showRegions', label: 'Cloud Regions' },
                ].map((layer) => (
                  <label
                    key={layer.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`
                      w-9 h-5 rounded-full relative transition-colors
                      ${
                        filters[layer.id as keyof FilterState]
                          ? 'bg-blue-500'
                          : isDark
                          ? 'bg-gray-700'
                          : 'bg-gray-300'
                      }
                    `}
                    >
                      <div
                        className={`
                        absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform
                        ${
                          filters[layer.id as keyof FilterState]
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }
                      `}
                      />
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={
                        filters[layer.id as keyof FilterState] as boolean
                      }
                      onChange={(e) =>
                        setFilters({ [layer.id]: e.target.checked })
                      }
                    />
                    <span className="text-sm">{layer.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className={sectionClasses}>
              <span className={labelClasses}>Legend</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF9900]" />
                  <span className="text-xs">AWS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#34A853]" />
                  <span className="text-xs">GCP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0078D4]" />
                  <span className="text-xs">Azure</span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-gradient-to-r from-green-500 to-green-500" />
                  <span className="text-xs text-gray-500">&lt; 50ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-gradient-to-r from-yellow-500 to-yellow-500" />
                  <span className="text-xs text-gray-500">50-150ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-gradient-to-r from-red-500 to-red-500" />
                  <span className="text-xs text-gray-500">&gt; 150ms</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
