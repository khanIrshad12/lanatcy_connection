import { FilterState, HistoricalLatency, LatencyData } from '@/types';
import { create } from 'zustand';

interface AppState {
  filters: FilterState;
  latencyData: LatencyData[];
  selectedExchange: string | null;
  selectedPair: { from: string; to: string } | null;
  historicalData: HistoricalLatency[];
  theme: 'dark' | 'light';
  setFilters: (filters: Partial<FilterState>) => void;
  setLatencyData: (data: LatencyData[]) => void;
  setSelectedExchange: (id: string | null) => void;
  setSelectedPair: (pair: { from: string; to: string } | null) => void;
  setHistoricalData: (data: HistoricalLatency[]) => void;
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set) => ({
  filters: {
    exchanges: [],
    cloudProviders: ['AWS', 'GCP', 'Azure'],
    latencyRange: 'all',
    showRealTime: true,
    showHistorical: true,
    showRegions: true,
    dataSourceMode: 'simulated', // Default to simulated only
  },
  latencyData: [],
  selectedExchange: null,
  selectedPair: null,
  historicalData: [],
  theme: 'dark',
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setLatencyData: (data) => set({ latencyData: data }),
  setSelectedExchange: (id) => set({ selectedExchange: id }),
  setSelectedPair: (pair) => set({ selectedPair: pair }),
  setHistoricalData: (data) => set({ historicalData: data }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    })),
}));
