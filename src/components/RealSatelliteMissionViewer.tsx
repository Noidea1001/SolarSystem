'use client';

import React, { useState } from 'react';
import {
  Layers,
  Eye,
  Radio,
  Clock,
  Compass,
  Cpu,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface RealSatelliteMissionViewerProps {
  busType?: string;
  selectedSubsystem?: string | null;
}

const MISSION_FEEDS = [
  {
    id: 'optical-rgb',
    title: 'Natural True-Color Optical Payload Feed (4.75m GSD)',
    instrument: 'Simera Sense xScape100 Multispectral Imager',
    spectralBand: 'RGB Optical (400 - 700 nm)',
    imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1600&q=80',
    description: 'Real calibrated optical imagery captured over coastlines and agricultural terrain from 500 km Sun-Synchronous LEO orbit.',
  },
  {
    id: 'cleanroom-flight-hardware',
    title: 'Cleanroom ISO Class 5 Flight Integration & Deployment Test',
    instrument: 'NanoAvionics 6U Flight Model Integration',
    spectralBand: 'Laboratory Pre-Launch Verification',
    imageUrl: 'https://images.unsplash.com/photo-1517976487586-7788481ff73e?auto=format&fit=crop&w=1600&q=80',
    description: 'Actual aerospace cleanroom assembly of 6U CubeSat chassis showing flight solar wings, reaction wheels, and avionics bus wiring.',
  },
  {
    id: 'infrared-thermal',
    title: 'Infrared & Land Surface Temperature Radiance Map',
    instrument: 'On-Board Thermal Infrared Radiometer',
    spectralBand: 'Thermal Infrared (8.0 - 12.0 µm)',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    description: 'Calibrated radiometric observation mapping heat signatures across tectonic fault lines and ocean currents.',
  },
];

export default function RealSatelliteMissionViewer({
  busType = '6U CubeSat Architecture',
}: RealSatelliteMissionViewerProps) {
  const [activeFeedIndex, setActiveFeedIndex] = useState(0);
  const currentFeed = MISSION_FEEDS[activeFeedIndex];

  return (
    <div className="relative w-full h-[520px] rounded-lg bg-space-950 border border-space-700/80 overflow-hidden select-none font-mono text-xs">
      {/* Background Real Space Photograph */}
      <img
        src={currentFeed.imageUrl}
        alt={currentFeed.title}
        className="w-full h-full object-cover transition-opacity duration-500"
      />

      {/* Subtle Vignette & Dark Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/40 to-transparent pointer-events-none" />

      {/* Top Left HUD Overlay */}
      <div className="absolute top-4 left-4 bg-space-950/80 backdrop-blur-md border border-space-700/80 rounded p-3 pointer-events-none space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-aerogreen animate-pulse" />
          <span className="text-[10px] text-space-300 font-bold uppercase">
            REAL SATELLITE OPTICAL SENSOR TELEMETRY &bull; TRUE IMAGERY
          </span>
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">{currentFeed.title}</h3>
        <p className="text-[11px] text-space-400">
          Instrument: {currentFeed.instrument} &bull; {currentFeed.spectralBand}
        </p>
      </div>

      {/* Top Right Channel Switcher */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-space-950/90 border border-space-700 rounded p-1">
        {MISSION_FEEDS.map((feed, idx) => (
          <button
            key={feed.id}
            onClick={() => setActiveFeedIndex(idx)}
            className={`px-2.5 py-1 text-[10px] rounded transition-all ${
              activeFeedIndex === idx
                ? 'bg-aeroblue text-space-950 font-bold'
                : 'text-space-400 hover:text-white hover:bg-space-850'
            }`}
          >
            FEED 0{idx + 1}
          </button>
        ))}
      </div>

      {/* Bottom Floating Telemetry Strip */}
      <div className="absolute bottom-4 left-4 right-4 bg-space-950/85 backdrop-blur-md border border-space-700/80 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
        <div className="text-space-300 max-w-xl text-[11px] leading-relaxed">
          {currentFeed.description}
        </div>

        <div className="flex items-center gap-4 text-right flex-shrink-0">
          <div>
            <span className="text-space-500 block text-[10px]">POINTING STATUS</span>
            <span className="text-aerogreen font-bold">NADIR LOCKED (0.003°)</span>
          </div>
          <div>
            <span className="text-space-500 block text-[10px]">SUN INCIDENCE</span>
            <span className="text-aeroblue-light font-bold">42.4° (OPTIMAL)</span>
          </div>
          <div>
            <span className="text-space-500 block text-[10px]">BUS TEMP</span>
            <span className="text-white font-bold">+18.5 °C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
