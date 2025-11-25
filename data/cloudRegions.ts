import { CloudRegion } from '@/types';

export const cloudRegions: CloudRegion[] = [
  // AWS Regions
  { id: 'aws-us-east-1', provider: 'AWS', name: 'US East (N. Virginia)', regionCode: 'us-east-1', latitude: 38.9072, longitude: -77.0369, serverCount: 12 },
  { id: 'aws-us-west-2', provider: 'AWS', name: 'US West (Oregon)', regionCode: 'us-west-2', latitude: 45.5152, longitude: -122.6784, serverCount: 8 },
  { id: 'aws-eu-central-1', provider: 'AWS', name: 'Europe (Frankfurt)', regionCode: 'eu-central-1', latitude: 50.1109, longitude: 8.6821, serverCount: 10 },
  { id: 'aws-ap-southeast-1', provider: 'AWS', name: 'Asia Pacific (Singapore)', regionCode: 'ap-southeast-1', latitude: 1.3521, longitude: 103.8198, serverCount: 15 },
  { id: 'aws-ap-northeast-1', provider: 'AWS', name: 'Asia Pacific (Tokyo)', regionCode: 'ap-northeast-1', latitude: 35.6762, longitude: 139.6503, serverCount: 9 },
  
  // GCP Regions
  { id: 'gcp-us-west1', provider: 'GCP', name: 'US West (Oregon)', regionCode: 'us-west1', latitude: 45.5152, longitude: -122.6784, serverCount: 7 },
  { id: 'gcp-us-east1', provider: 'GCP', name: 'US East (South Carolina)', regionCode: 'us-east1', latitude: 33.7490, longitude: -84.3880, serverCount: 6 },
  { id: 'gcp-asia-east1', provider: 'GCP', name: 'Asia East (Taiwan)', regionCode: 'asia-east1', latitude: 25.0330, longitude: 121.5654, serverCount: 11 },
  { id: 'gcp-europe-west1', provider: 'GCP', name: 'Europe West (Belgium)', regionCode: 'europe-west1', latitude: 50.8503, longitude: 4.3517, serverCount: 8 },
  
  // Azure Regions
  { id: 'azure-eastus', provider: 'Azure', name: 'East US', regionCode: 'eastus', latitude: 38.9072, longitude: -77.0369, serverCount: 9 },
  { id: 'azure-westus2', provider: 'Azure', name: 'West US 2', regionCode: 'westus2', latitude: 47.6062, longitude: -122.3321, serverCount: 7 },
  { id: 'azure-westeurope', provider: 'Azure', name: 'West Europe', regionCode: 'westeurope', latitude: 52.3676, longitude: 4.9041, serverCount: 10 },
  { id: 'azure-southeastasia', provider: 'Azure', name: 'Southeast Asia', regionCode: 'southeastasia', latitude: 1.3521, longitude: 103.8198, serverCount: 12 },
  { id: 'azure-japaneast', provider: 'Azure', name: 'Japan East', regionCode: 'japaneast', latitude: 35.6762, longitude: 139.6503, serverCount: 8 },
];

