import { Exchange } from '@/types';

export const exchanges: Exchange[] = [
  // Binance
  { id: 'binance-us', name: 'Binance US', latitude: 40.7128, longitude: -74.0060, cloudProvider: 'AWS', region: 'US East', regionCode: 'us-east-1', endpoint: 'api.binance.us', countryCode: 'US' },
  { id: 'binance-sg', name: 'Binance Singapore', latitude: 1.3521, longitude: 103.8198, cloudProvider: 'AWS', region: 'Asia Pacific', regionCode: 'ap-southeast-1', endpoint: 'api.binance.com', countryCode: 'SG' },
  
  // OKX
  { id: 'okx-hk', name: 'OKX Hong Kong', latitude: 22.3193, longitude: 114.1694, cloudProvider: 'GCP', region: 'Asia East', regionCode: 'asia-east1', endpoint: 'www.okx.com', countryCode: 'HK' },
  { id: 'okx-us', name: 'OKX US', latitude: 37.7749, longitude: -122.4194, cloudProvider: 'GCP', region: 'US West', regionCode: 'us-west1', endpoint: 'www.okx.com', countryCode: 'US' },
  
  // Bybit
  { id: 'bybit-sg', name: 'Bybit Singapore', latitude: 1.3521, longitude: 103.8198, cloudProvider: 'Azure', region: 'Southeast Asia', regionCode: 'southeastasia', endpoint: 'api.bybit.com', countryCode: 'SG' },
  { id: 'bybit-jp', name: 'Bybit Japan', latitude: 35.6762, longitude: 139.6503, cloudProvider: 'Azure', region: 'Japan East', regionCode: 'japaneast', endpoint: 'api.bybit.com', countryCode: 'JP' },
  
  // Deribit
  { id: 'deribit-nl', name: 'Deribit Netherlands', latitude: 52.3676, longitude: 4.9041, cloudProvider: 'AWS', region: 'Europe', regionCode: 'eu-central-1', endpoint: 'www.deribit.com', countryCode: 'NL' },
  
  // Coinbase
  { id: 'coinbase-us', name: 'Coinbase US', latitude: 37.7749, longitude: -122.4194, cloudProvider: 'AWS', region: 'US West', regionCode: 'us-west-2', endpoint: 'api.coinbase.com', countryCode: 'US' },
  
  // Kraken
  { id: 'kraken-us', name: 'Kraken US', latitude: 47.6062, longitude: -122.3321, cloudProvider: 'GCP', region: 'US West', regionCode: 'us-west1', endpoint: 'api.kraken.com', countryCode: 'US' },
  
  // Bitfinex
  { id: 'bitfinex-hk', name: 'Bitfinex Hong Kong', latitude: 22.3193, longitude: 114.1694, cloudProvider: 'Azure', region: 'East Asia', regionCode: 'eastasia', endpoint: 'api.bitfinex.com', countryCode: 'HK' },
  
  // BitMEX
  { id: 'bitmex-sg', name: 'BitMEX Singapore', latitude: 1.3521, longitude: 103.8198, cloudProvider: 'AWS', region: 'Asia Pacific', regionCode: 'ap-southeast-1', endpoint: 'www.bitmex.com', countryCode: 'SG' },
];

