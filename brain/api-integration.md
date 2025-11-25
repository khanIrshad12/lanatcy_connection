# Globalping API Integration

## Overview
The project now uses the **Globalping API** for real-time latency monitoring. Globalping is a free, open-source service that provides network measurements from globally distributed probes.

## Implementation Details

### API Endpoint
- **Globalping API**: https://api.globalping.io/v1/measurements
- **Next.js Proxy Route**: `/api/latency` (handles CORS and proxies requests)

### How It Works

1. **Latency Measurement**:
   - Uses ping measurements from Globalping probes
   - Probes are located near exchange locations (based on country code)
   - Measures latency to exchange API endpoints

2. **Request Flow**:
   - Client calls `/api/latency` (Next.js API route)
   - API route proxies request to Globalping API
   - Returns ping statistics (avg, min, max latency)

3. **Rate Limiting**:
   - Requests are batched (5 at a time)
   - 200ms delay between batches
   - Update interval: 10 seconds (increased from 5s)

4. **Error Handling**:
   - Automatic fallback to simulated data if API fails
   - Cached pending requests to avoid duplicates
   - Graceful degradation

### Exchange Data Structure

Each exchange now includes:
- `endpoint`: API domain (e.g., 'api.binance.com')
- `countryCode`: ISO country code (e.g., 'US', 'SG') for probe location

### Configuration

- `useRealAPI`: Boolean flag to enable/disable real API (default: true)
- Can be toggled in `lib/latencyService.ts` line 13

## API Response Format

```json
{
  "results": [
    {
      "result": {
        "stats": {
          "min": 45.2,
          "avg": 48.5,
          "max": 52.1
        }
      }
    }
  ]
}
```

## Fallback Mechanism

If the API is unavailable:
- Falls back to distance-based latency calculation
- Uses geographic distance formula
- Maintains same data structure for seamless transition

## Rate Limits

- Globalping is free but has rate limits
- Current implementation: 5 requests per batch, 200ms delay
- Total pairs: ~55 (for 11 exchanges)
- Estimated time per full update: ~2-3 seconds

## Future Improvements

- Add request caching to reduce API calls
- Implement WebSocket for real-time updates
- Add API key support if needed
- Monitor API health and auto-switch fallback

