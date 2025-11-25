export interface Exchange {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  cloudProvider: 'AWS' | 'GCP' | 'Azure';
  region: string;
  regionCode: string;
  endpoint?: string; // API endpoint or domain for latency measurement
  countryCode?: string; // ISO country code for Globalping probe location
}

export interface CloudRegion {
  id: string;
  provider: 'AWS' | 'GCP' | 'Azure';
  name: string;
  regionCode: string;
  latitude: number;
  longitude: number;
  serverCount: number;
}

export interface LatencyData {
  from: string;
  to: string;
  latency: number;
  timestamp: number;
  isRealAPI?: boolean; // Indicates if this data came from real API or is simulated
}

export interface HistoricalLatency {
  timestamp: number;
  latency: number;
}

export type LatencyRange = 'low' | 'medium' | 'high';
export type DataSourceMode = 'simulated' | 'real' | 'both';

export interface FilterState {
  exchanges: string[];
  cloudProviders: ('AWS' | 'GCP' | 'Azure')[];
  latencyRange: LatencyRange | 'all';
  showRealTime: boolean;
  showHistorical: boolean;
  showRegions: boolean;
  dataSourceMode: DataSourceMode; // 'simulated' | 'real' | 'both'
}
