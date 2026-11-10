'use client';

import React, { useState } from 'react';
import SolarSystemInteractiveGame from '../components/SolarSystemInteractiveGame';
import RealSpaceObservatory from '../components/RealSpaceObservatory';
import PlanetaryAtlas from '../components/PlanetaryAtlas';
import SpaceTechScience from '../components/SpaceTechScience';
import MissionChronicles from '../components/MissionChronicles';
import NavigationHeader, { ActiveTab } from '../components/NavigationHeader';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulation');

  return (
    <main className="w-screen h-screen overflow-hidden bg-space-950 flex flex-col font-mono text-slate-100">
      {/* 3D Simulation Container: Stays mounted to preserve WebGL context, textures, and orbits */}
      <div
        className={`w-full h-full relative ${
          activeTab === 'simulation' ? 'block' : 'hidden'
        }`}
      >
        <SolarSystemInteractiveGame onOpenKnowledgeTab={setActiveTab} />
      </div>

      {/* Encyclopedic Knowledge & Observatory Modules Container */}
      {activeTab !== 'simulation' && (
        <div className="w-full h-full flex flex-col overflow-hidden bg-space-950">
          <NavigationHeader activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'observatory' && <RealSpaceObservatory />}
            {activeTab === 'planetary' && <PlanetaryAtlas />}
            {activeTab === 'spacetech' && <SpaceTechScience />}
            {activeTab === 'missions' && <MissionChronicles />}
          </div>
        </div>
      )}
    </main>
  );
}
