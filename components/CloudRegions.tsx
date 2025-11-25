'use client';

import { cloudRegions } from '@/data/cloudRegions';
import { latLongToVector3 } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import CloudRegionMarker from './CloudRegionMarker';

export default function CloudRegions() {
  const { filters } = useStore();

  const filteredRegions = useMemo(() => {
    return cloudRegions.filter((region) =>
      filters.cloudProviders.includes(region.provider)
    );
  }, [filters]);

  return (
    <>
      {filteredRegions.map((region) => {
        const position = latLongToVector3(
          region.latitude,
          region.longitude,
          1.005
        );
        return (
          <CloudRegionMarker
            key={region.id}
            region={region}
            position={position}
          />
        );
      })}
    </>
  );
}
