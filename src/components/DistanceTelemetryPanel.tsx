'use client';

import React from 'react';
import { Radio, X, ArrowRight } from 'lucide-react';
import { CELESTIAL_BODIES_PHYSICS } from '../data/celestialBodies';
import { computeInterplanetaryTelemetry } from '../utils/ephemeris';

interface DistanceTelemetryPanelProps {
  originId: string;
  targetId: string;
  daysSinceJ2000: number;
  onChangeOrigin: (id: string) => void;
  onChangeTarget: (id: string) => void;
  onClose: () => void;
}

export default function DistanceTelemetryPanel({
  originId,
  targetId,
  daysSinceJ2000,
  onChangeOrigin,
  onChangeTarget,
  onClose,
}: DistanceTelemetryPanelProps) {
  const originBody = CELESTIAL_BODIES_PHYSICS.find((b) => b.id === originId) || CELESTIAL_BODIES_PHYSICS[2];
  const targetBody = CELESTIAL_BODIES_PHYSICS.find((b) => b.id === targetId) || CELESTIAL_BODIES_PHYSICS[3];

  const telemetry = computeInterplanetaryTelemetry(originBody, targetBody, daysSinceJ2000);

  return (
    <div className="absolute bottom-20 left-5 z-30 pointer-events-auto w-80 bg-space-950/90 backdrop-blur-xl p-4 rounded-2xl border border-aeroblue/40 shadow-2xl font-mono text-xs text-white space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-aerogreen animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-white">
            DEEP SPACE LASER RANGER
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-space-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Origin & Target Selectors */}
      <div className="grid grid-cols-11 gap-1.5 items-center">
        <select
          value={originId}
          onChange={(e) => onChangeOrigin(e.target.value)}
          className="col-span-5 bg-space-900 border border-space-800 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-aeroblue"
        >
          {CELESTIAL_BODIES_PHYSICS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name.split(' (')[0]}
            </option>
          ))}
        </select>

        <div className="col-span-1 flex justify-center text-aeroblue">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        <select
          value={targetId}
          onChange={(e) => onChangeTarget(e.target.value)}
          className="col-span-5 bg-space-900 border border-space-800 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-aeroblue"
        >
          {CELESTIAL_BODIES_PHYSICS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name.split(' (')[0]}
            </option>
          ))}
        </select>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        <div className="p-2 bg-space-900/80 rounded-xl border border-space-850">
          <span className="text-space-400 block text-[9px]">LIVE DISTANCE (AU)</span>
          <span className="text-aeroblue font-bold text-xs">{telemetry.distanceAU.toFixed(3)} AU</span>
        </div>
        <div className="p-2 bg-space-900/80 rounded-xl border border-space-850">
          <span className="text-space-400 block text-[9px]">DISTANCE (KM)</span>
          <span className="text-white font-bold text-xs">{telemetry.distanceMillionKm.toFixed(1)}M km</span>
        </div>
        <div className="p-2 bg-space-900/80 rounded-xl border border-space-850">
          <span className="text-space-400 block text-[9px]">ONE-WAY LIGHT TIME</span>
          <span className="text-aerogreen font-bold text-xs">{telemetry.lightTimeFormatted}</span>
        </div>
        <div className="p-2 bg-space-900/80 rounded-xl border border-space-850">
          <span className="text-space-400 block text-[9px]">PROBE TRANSIT (~28KM/S)</span>
          <span className="text-aeroamber font-bold text-xs">~{telemetry.spacecraftDaysEstimate} days</span>
        </div>
      </div>

      <div className="text-[9px] text-space-400 flex items-center justify-between pt-0.5">
        <span>3D LASER TELEMETRY LINK ACTIVE</span>
        <span className="text-aerogreen font-bold">c = 299,792 km/s</span>
      </div>
    </div>
  );
}
