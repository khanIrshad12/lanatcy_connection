'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const MapVisualizer = dynamic(() => import('@/components/MapVisualizer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-white text-xl">Loading 3D Map...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-black">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }>
        <MapVisualizer />
      </Suspense>
    </main>
  );
}
