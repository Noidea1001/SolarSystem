'use client';

import React from 'react';
import SolarSystemInteractiveGame from '../components/SolarSystemInteractiveGame';

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-space-950">
      <SolarSystemInteractiveGame />
    </main>
  );
}
