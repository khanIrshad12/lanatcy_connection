import { exchanges } from '@/data/exchanges';
import { Exchange, LatencyData } from '@/types';

// Real-time latency service using Globalping API
// API Documentation: https://www.jsdelivr.com/package/npm/@globalping/api
// Falls back to simulated data if API is unavailable

class LatencyService {
  private baseLatency: Map<string, number> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(data: LatencyData[]) => void> = new Set();
  private historicalData: Map<
    string,
    { timestamp: number; latency: number }[]
  > = new Map();
  private useRealAPI: boolean = false; // Internal flag - controlled by setDataSourceMode method (default: false for simulated)
  private dataSourceMode: 'simulated' | 'real' | 'both' = 'simulated'; // Default to simulated
  private pendingRequests: Map<string, Promise<number>> = new Map();
  private currentData: LatencyData[] = []; // Store current data for progress tracking
  private readonly API_ENDPOINT = '/api/latency';

  constructor() {
    // Initialize base latencies (simulated realistic values)
    this.initializeBaseLatencies();
    this.loadHistoricalData();
  }

  private initializeBaseLatencies() {
    exchanges.forEach((exchange, i) => {
      exchanges.slice(i + 1).forEach((otherExchange) => {
        const key = `${exchange.id}-${otherExchange.id}`;
        const distance = this.calculateDistance(
          exchange.latitude,
          exchange.longitude,
          otherExchange.latitude,
          otherExchange.longitude
        );
        // Simulate latency based on distance (roughly 1ms per 100km + base 10ms)
        const baseLatency = Math.round(
          10 + (distance / 100) * 1 + Math.random() * 20
        );
        this.baseLatency.set(key, baseLatency);
      });
    });
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async measureLatency(
    fromExchange: Exchange,
    toExchange: Exchange,
    requireRealAPI: boolean = false
  ): Promise<number> {
    // Use cached request if already in progress
    const requestKey = `${fromExchange.id}-${toExchange.id}`;
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    const latencyPromise = (async () => {
      if (!this.useRealAPI || !fromExchange.endpoint || !toExchange.endpoint) {
        return this.calculateDistanceBasedLatency(fromExchange, toExchange);
      }

      try {
        const response = await fetch(this.API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: toExchange.endpoint,
            locations: [{ country: fromExchange.countryCode || 'US' }],
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        console.log(
          `[API] Response for ${fromExchange.name} -> ${toExchange.name}:`,
          {
            id: data.id,
            status: data.status,
            hasResults: !!data.results,
            resultsLength: data.results?.length,
          }
        );

        // Globalping API returns measurement ID, and results come asynchronously
        // Check if we need to poll (status is "in-progress" or results are empty/incomplete)
        const measurementId = data.id;
        const needsPolling =
          data.status === 'in-progress' ||
          !data.results ||
          data.results.length === 0 ||
          !this.hasValidLatencyData(data.results);

        console.log(`[API] Needs polling: ${needsPolling}`);

        if (measurementId && needsPolling) {
          // Need to poll for results until we get valid data
          let attempts = 0;
          const maxAttempts = 20; // Increased to 20 seconds for measurements to complete

          while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

            try {
              // Use our proxy API route to avoid CORS issues
              const resultResponse = await fetch(
                `${this.API_ENDPOINT}?id=${measurementId}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (resultResponse.ok) {
                const resultData = await resultResponse.json();

                // Check if we have valid latency data
                if (resultData.results && resultData.results.length > 0) {
                  const latency = this.extractLatencyFromResults(
                    resultData.results
                  );
                  if (latency && latency > 0) {
                    return latency;
                  }
                }

                // If measurement is still in progress, continue polling
                if (resultData.status === 'in-progress') {
                  attempts++;
                  continue;
                }
              }
            } catch (pollError) {
              console.warn('Error polling for measurement results:', pollError);
            }

            attempts++;
          }

          // If we couldn't get results after polling
          console.warn(
            `Could not get results for measurement ${measurementId} after ${maxAttempts} attempts`
          );
          // In 'real' mode, throw error instead of fallback
          if (requireRealAPI) {
            throw new Error(
              `Could not get API results for measurement ${measurementId}`
            );
          }
          // Otherwise fallback to simulated
          return this.calculateDistanceBasedLatency(fromExchange, toExchange);
        }

        // Extract latency from Globalping response (if results are already available)
        if (data.results && data.results.length > 0) {
          const latency = this.extractLatencyFromResults(data.results);
          console.log(
            `Extracted latency for ${fromExchange.name} -> ${toExchange.name}: ${latency}ms`
          );
          if (latency && latency > 0) {
            return latency;
          }
        }

        // If no valid latency in response
        console.warn('No valid latency found in API response');
        // In 'real' mode, throw error instead of fallback
        if (requireRealAPI) {
          throw new Error('No valid latency data from API');
        }
        // Otherwise fallback to simulated
        return this.calculateDistanceBasedLatency(fromExchange, toExchange);
      } catch (error) {
        console.warn(
          `Failed to measure latency from ${fromExchange.name} to ${toExchange.name}:`,
          error
        );
        // In 'real' mode, throw error instead of fallback
        if (requireRealAPI) {
          throw error;
        }
        // Fallback to distance-based calculation
        return this.calculateDistanceBasedLatency(fromExchange, toExchange);
      } finally {
        // Remove from pending requests after a delay to allow reuse
        setTimeout(() => {
          this.pendingRequests.delete(requestKey);
        }, 1000);
      }
    })();

    this.pendingRequests.set(requestKey, latencyPromise);
    return latencyPromise;
  }

  private hasValidLatencyData(results: any[]): boolean {
    if (!results || results.length === 0) return false;
    const result = results[0];
    return (
      result &&
      result.result &&
      result.result.stats &&
      (result.result.stats.avg ||
        result.result.stats.min ||
        result.result.stats.max)
    );
  }

  private extractLatencyFromResults(results: any[]): number | null {
    if (!results || results.length === 0) return null;

    const result = results[0];
    if (!result || !result.result || !result.result.stats) return null;

    const stats = result.result.stats;
    const avgLatency = stats.avg;
    const minLatency = stats.min;
    const maxLatency = stats.max;

    // Use average if available, otherwise use min or max
    const latency = avgLatency || minLatency || maxLatency;
    if (latency && latency > 0) {
      return Math.round(latency);
    }

    return null;
  }

  private calculateDistanceBasedLatency(
    fromExchange: Exchange,
    toExchange: Exchange
  ): number {
    const distance = this.calculateDistance(
      fromExchange.latitude,
      fromExchange.longitude,
      toExchange.latitude,
      toExchange.longitude
    );
    // Simulate latency based on distance (roughly 1ms per 100km + base 10ms)
    const baseLatency = Math.round(
      10 + (distance / 100) * 1 + Math.random() * 20
    );
    return Math.max(1, baseLatency);
  }

  private async generateLatencyData(): Promise<LatencyData[]> {
    const data: LatencyData[] = [];
    const now = Date.now();

    // Measure latency for each exchange pair
    // Batch requests to avoid overwhelming the API
    const pairs: Array<{ from: Exchange; to: Exchange }> = [];
    exchanges.forEach((exchange, i) => {
      exchanges.slice(i + 1).forEach((otherExchange) => {
        pairs.push({ from: exchange, to: otherExchange });
      });
    });

    // Handle different data source modes
    // 'simulated' mode: all simulated
    // 'real' mode: all real API (all pairs, but may take time)
    // 'both' mode: mix of real API (prioritized) and simulated (rest)

    if (this.dataSourceMode === 'simulated') {
      // All simulated data
      pairs.forEach(({ from, to }) => {
        const latency = this.calculateDistanceBasedLatency(from, to);
        data.push({
          from: from.id,
          to: to.id,
          latency,
          timestamp: now,
          isRealAPI: false,
        });

        // Store historical data
        const historyKey = `${from.id}-${to.id}`;
        if (!this.historicalData.has(historyKey)) {
          this.historicalData.set(historyKey, []);
        }
        const history = this.historicalData.get(historyKey)!;
        history.push({ timestamp: now, latency });
        if (history.length > 1000) {
          history.shift();
        }
      });
      // Store current data
      this.currentData = [...data];
      return data;
    }

    if (this.dataSourceMode === 'real') {
      // All real API - use all pairs (but still batch to respect rate limits)
      const allPairs = pairs;
      const batchSize = 2;

      console.log(
        `[Real API Mode] Starting to measure ${
          allPairs.length
        } pairs in ${Math.ceil(allPairs.length / batchSize)} batches`
      );

      for (let i = 0; i < allPairs.length; i += batchSize) {
        const batch = allPairs.slice(i, i + batchSize);
        const batchNum = i / batchSize + 1;
        const totalBatches = Math.ceil(allPairs.length / batchSize);
        console.log(
          `[Real API Mode] Processing batch ${batchNum}/${totalBatches} (${data.length} connections so far)`
        );

        // Use Promise.allSettled to continue even if some fail
        const batchPromises = batch.map(async ({ from, to }) => {
          try {
            // In 'real' mode, require actual API data (no fallback)
            const latency = await this.measureLatency(from, to, true);
            console.log(
              `[Real API Mode] ✓ ${from.name} → ${to.name} = ${latency}ms`
            );
            return { from, to, latency, success: true, isFromAPI: true };
          } catch (error) {
            console.warn(
              `[Real API Mode] ✗ ${from.name} → ${to.name}: ${
                error instanceof Error ? error.message : 'Failed'
              }`
            );
            // On error in 'real' mode, skip this pair (don't use fallback)
            return null;
          }
        });

        const results = await Promise.allSettled(batchPromises);

        results.forEach((settledResult) => {
          if (settledResult.status === 'fulfilled') {
            const result = settledResult.value;
            if (result && result.isFromAPI) {
              const { from, to, latency } = result;
              data.push({
                from: from.id,
                to: to.id,
                latency,
                timestamp: now,
                isRealAPI: true,
              });

              // Store historical data
              const historyKey = `${from.id}-${to.id}`;
              if (!this.historicalData.has(historyKey)) {
                this.historicalData.set(historyKey, []);
              }
              const history = this.historicalData.get(historyKey)!;
              history.push({ timestamp: now, latency });
              if (history.length > 1000) {
                history.shift();
              }

              // Store current data for progress tracking
              this.currentData = [...data];

              // Notify subscribers with incremental updates
              if (data.length % 5 === 0) {
                // Update every 5 connections
                console.log(
                  `[Real API Mode] 🔄 Incremental update: ${data.length} connections`
                );
                this.subscribers.forEach((sub) => sub([...data]));
              }
            }
          }
        });

        // Delay between batches
        if (i + batchSize < allPairs.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Store final data
      this.currentData = [...data];

      console.log(
        `[Real API Mode] ✅ ALL BATCHES COMPLETE! Returning ${data.length} connections with real API data`
      );
      console.log(
        '[Real API Mode] Sample data:',
        data.slice(0, 3).map((d) => ({
          from: d.from,
          to: d.to,
          latency: d.latency,
          isRealAPI: d.isRealAPI,
        }))
      );
      return data;
    }

    // 'both' mode - mix of real API (prioritized) and simulated (rest)
    // Continue with existing mixed logic below

    // Limit to top 20 most important pairs to reduce API calls
    // Prioritize pairs with different cloud providers or regions
    const prioritizedPairs = pairs
      .sort((a, b) => {
        // Prioritize cross-provider pairs
        const aCrossProvider =
          a.from.cloudProvider !== a.to.cloudProvider ? 1 : 0;
        const bCrossProvider =
          b.from.cloudProvider !== b.to.cloudProvider ? 1 : 0;
        return bCrossProvider - aCrossProvider;
      })
      .slice(0, 20); // Limit to 20 pairs

    // Process in smaller batches of 2 to respect rate limits
    const batchSize = 2;
    for (let i = 0; i < prioritizedPairs.length; i += batchSize) {
      const batch = prioritizedPairs.slice(i, i + batchSize);
      const batchPromises = batch.map(async ({ from, to }) => {
        try {
          const latency = await this.measureLatency(from, to);
          return { from, to, latency, success: true };
        } catch (error) {
          // Fallback to simulated latency on error
          const latency = this.calculateDistanceBasedLatency(from, to);
          return { from, to, latency, success: false };
        }
      });

      const results = await Promise.all(batchPromises);

      results.forEach(({ from, to, latency, success }) => {
        data.push({
          from: from.id,
          to: to.id,
          latency,
          timestamp: now,
          isRealAPI: success && this.useRealAPI,
        });

        // Store historical data
        const historyKey = `${from.id}-${to.id}`;
        if (!this.historicalData.has(historyKey)) {
          this.historicalData.set(historyKey, []);
        }
        const history = this.historicalData.get(historyKey)!;
        history.push({ timestamp: now, latency });
        // Keep only last 1000 points
        if (history.length > 1000) {
          history.shift();
        }
      });

      // Longer delay between batches to respect rate limits (500ms)
      if (i + batchSize < prioritizedPairs.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Fill remaining pairs with simulated data
    const measuredPairs = new Set(
      prioritizedPairs.map((p) => `${p.from.id}-${p.to.id}`)
    );
    pairs.forEach(({ from, to }) => {
      const pairKey = `${from.id}-${to.id}`;
      if (!measuredPairs.has(pairKey)) {
        const latency = this.calculateDistanceBasedLatency(from, to);
        data.push({
          from: from.id,
          to: to.id,
          latency,
          timestamp: now,
          isRealAPI: false, // Simulated data
        });

        // Store historical data
        const historyKey = `${from.id}-${to.id}`;
        if (!this.historicalData.has(historyKey)) {
          this.historicalData.set(historyKey, []);
        }
        const history = this.historicalData.get(historyKey)!;
        history.push({ timestamp: now, latency });
        if (history.length > 1000) {
          history.shift();
        }
      }
    });

    // Store current data
    this.currentData = [...data];
    return data;
  }

  private loadHistoricalData() {
    // Generate some historical data points
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const interval = 60000; // 1 minute intervals

    for (let time = oneHourAgo; time <= now; time += interval) {
      exchanges.forEach((exchange, i) => {
        exchanges.slice(i + 1).forEach((otherExchange) => {
          const key = `${exchange.id}-${otherExchange.id}`;
          const base = this.baseLatency.get(key) || 50;
          const variation = (Math.random() - 0.5) * 0.4;
          const latency = Math.max(1, Math.round(base * (1 + variation)));

          const historyKey = `${exchange.id}-${otherExchange.id}`;
          if (!this.historicalData.has(historyKey)) {
            this.historicalData.set(historyKey, []);
          }
          this.historicalData
            .get(historyKey)!
            .push({ timestamp: time, latency });
        });
      });
    }
  }

  subscribe(callback: (data: LatencyData[]) => void) {
    this.subscribers.add(callback);
    // Send initial data (async)
    this.generateLatencyData()
      .then((data) => callback(data))
      .catch((error) => {
        console.error('Error generating initial latency data:', error);
        // Fallback to simulated data
        callback(this.generateSimulatedLatencyData());
      });

    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => {
        this.generateLatencyData()
          .then((data) => {
            this.subscribers.forEach((sub) => sub(data));
          })
          .catch((error) => {
            console.error('Error generating latency data:', error);
            // Fallback to simulated data
            const simulatedData = this.generateSimulatedLatencyData();
            this.subscribers.forEach((sub) => sub(simulatedData));
          });
      }, 30000); // Update every 30 seconds (increased to respect API rate limits)
    }
  }

  // Fallback method for simulated data
  private generateSimulatedLatencyData(): LatencyData[] {
    const data: LatencyData[] = [];
    const now = Date.now();

    exchanges.forEach((exchange, i) => {
      exchanges.slice(i + 1).forEach((otherExchange) => {
        const key = `${exchange.id}-${otherExchange.id}`;
        const base = this.baseLatency.get(key) || 50;
        // Add random variation (±20%)
        const variation = (Math.random() - 0.5) * 0.4;
        const latency = Math.max(1, Math.round(base * (1 + variation)));

        data.push({
          from: exchange.id,
          to: otherExchange.id,
          latency,
          timestamp: now,
          isRealAPI: false, // Simulated data
        });

        // Store historical data
        const historyKey = `${exchange.id}-${otherExchange.id}`;
        if (!this.historicalData.has(historyKey)) {
          this.historicalData.set(historyKey, []);
        }
        const history = this.historicalData.get(historyKey)!;
        history.push({ timestamp: now, latency });
        // Keep only last 1000 points
        if (history.length > 1000) {
          history.shift();
        }
      });
    });

    return data;
  }

  unsubscribe(callback: (data: LatencyData[]) => void) {
    this.subscribers.delete(callback);
    if (this.subscribers.size === 0 && this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  getHistoricalData(
    from: string,
    to: string,
    timeRange: number
  ): { timestamp: number; latency: number }[] {
    // Normalize exchange IDs to match stored keys
    // Try to find matching exchange by ID or name
    const normalizeId = (id: string): string => {
      // First, try exact match
      const exactMatch = exchanges.find((e) => e.id === id);
      if (exactMatch) return exactMatch.id;

      // Try case-insensitive match
      const caseMatch = exchanges.find(
        (e) => e.id.toLowerCase() === id.toLowerCase()
      );
      if (caseMatch) return caseMatch.id;

      // Try matching by name (handle cases like "binance-singapore" -> "binance-sg")
      const nameMatch = exchanges.find(
        (e) =>
          e.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .includes(id.toLowerCase()) ||
          id.toLowerCase().includes(e.name.toLowerCase().replace(/\s+/g, '-'))
      );
      if (nameMatch) return nameMatch.id;

      // If no match found, return original ID
      return id;
    };

    const normalizedFrom = normalizeId(from);
    const normalizedTo = normalizeId(to);
    const key = `${normalizedFrom}-${normalizedTo}`;
    const reverseKey = `${normalizedTo}-${normalizedFrom}`;

    console.log('📈 [getHistoricalData] Lookup:', {
      original: { from, to },
      normalized: { from: normalizedFrom, to: normalizedTo },
      key,
      reverseKey,
      mapSize: this.historicalData.size,
      mapKeys: Array.from(this.historicalData.keys()).slice(0, 10),
    });

    const data =
      this.historicalData.get(key) || this.historicalData.get(reverseKey) || [];

    console.log('📈 [getHistoricalData] Found data:', {
      dataLength: data.length,
      keyFound: this.historicalData.has(key),
      reverseKeyFound: this.historicalData.has(reverseKey),
    });

    const cutoff = Date.now() - timeRange;
    const filtered = data.filter((point) => point.timestamp >= cutoff);

    console.log('📈 [getHistoricalData] Filtered:', {
      before: data.length,
      after: filtered.length,
      cutoff: new Date(cutoff).toISOString(),
      timeRange,
    });

    return filtered;
  }

  getLatencyStats(from: string, to: string, timeRange: number) {
    const data = this.getHistoricalData(from, to, timeRange);
    if (data.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }
    const latencies = data.map((d) => d.latency);
    return {
      min: Math.min(...latencies),
      max: Math.max(...latencies),
      avg: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    };
  }

  // Method to set data source mode
  setDataSourceMode(mode: 'simulated' | 'real' | 'both') {
    this.dataSourceMode = mode;
    if (mode === 'simulated') {
      this.useRealAPI = false;
    } else if (mode === 'real') {
      this.useRealAPI = true;
    } else {
      // 'both' mode - use real API for prioritized pairs
      this.useRealAPI = true;
    }
    // Initialize useRealAPI based on default mode
    if (this.dataSourceMode === 'simulated') {
      this.useRealAPI = false;
    }
  }

  getDataSourceMode(): 'simulated' | 'real' | 'both' {
    return this.dataSourceMode;
  }

  // Public method to trigger data refresh (for external use)
  async refreshData(): Promise<LatencyData[]> {
    return this.generateLatencyData();
  }

  // Public method to get current data (for progress tracking)
  getCurrentData(): LatencyData[] {
    return [...this.currentData];
  }
}

export const latencyService = new LatencyService();
