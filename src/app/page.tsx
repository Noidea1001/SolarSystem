'use client';

import React, { useState } from 'react';
import NavigationHeader, { ActiveTab } from '../components/NavigationHeader';
import RealSpaceObservatory from '../components/RealSpaceObservatory';
import PlanetaryAtlas from '../components/PlanetaryAtlas';
import SpaceTechScience from '../components/SpaceTechScience';
import MissionChronicles from '../components/MissionChronicles';
import { Globe, Radio, ShieldCheck, Satellite } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('observatory');

  return (
    <div className="min-h-screen flex flex-col bg-space-950 text-slate-100 font-sans selection:bg-aeroblue/30 selection:text-white">
      {/* Global Aerospace Header */}
      <NavigationHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Knowledge Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'observatory' && <RealSpaceObservatory />}

        {activeTab === 'planetary' && <PlanetaryAtlas />}

        {activeTab === 'spacetech' && <SpaceTechScience />}

        {activeTab === 'missions' && <MissionChronicles />}
      </main>

      {/* Space Knowledge Platform Footer */}
      <footer className="mt-auto border-t border-space-850 bg-space-950/80 px-6 py-6 text-xs font-mono text-space-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-space-800 border border-space-700 flex items-center justify-center text-aeroblue">
              <Globe className="w-3 h-3" />
            </div>
            <div>
              <span className="text-white font-bold tracking-wider">AEROVEX SPACE PLATFORM</span>
              <span className="text-space-600 mx-2">&bull;</span>
              <span>PURE SPACE SCIENCE & KNOWLEDGE EXPLORATION</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-space-400">
            <span className="flex items-center gap-1.5 text-aerogreen">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NASA &bull; ESA &bull; USGS OPEN SCIENCE DATA</span>
            </span>
            <span className="text-space-600">&bull;</span>
            <span>NO COMMERCIAL COMMERCE</span>
            <span className="text-space-600">&bull;</span>
            <span>SYSTEM REVISION: 2026.5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
