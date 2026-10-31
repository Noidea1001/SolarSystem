'use client';

import React, { useState } from 'react';
import { X, Scale, ArrowLeftRight, Compass } from 'lucide-react';
import { CELESTIAL_BODIES_PHYSICS, CelestialBodyPhysics } from '../data/celestialBodies';

interface PlanetComparisonModalProps {
  initialPrimaryId?: string;
  onClose: () => void;
  onFocusPlanet: (body: CelestialBodyPhysics) => void;
}

export default function PlanetComparisonModal({
  initialPrimaryId = 'earth',
  onClose,
  onFocusPlanet,
}: PlanetComparisonModalProps) {
  const [bodyAId, setBodyAId] = useState<string>(initialPrimaryId);
  const [bodyBId, setBodyBId] = useState<string>(initialPrimaryId === 'jupiter' ? 'earth' : 'jupiter');

  const bodyA = CELESTIAL_BODIES_PHYSICS.find((b) => b.id === bodyAId) || CELESTIAL_BODIES_PHYSICS[2];
  const bodyB = CELESTIAL_BODIES_PHYSICS.find((b) => b.id === bodyBId) || CELESTIAL_BODIES_PHYSICS[5];

  const maxDiameter = Math.max(bodyA.diameterKm, bodyB.diameterKm, 1);
  const scaleA = Math.max(12, Math.round((bodyA.diameterKm / maxDiameter) * 140));
  const scaleB = Math.max(12, Math.round((bodyB.diameterKm / maxDiameter) * 140));

  const diameterRatio = (bodyA.diameterKm / bodyB.diameterKm).toFixed(2);
  const gravityRatio = (bodyA.surfaceGravityMs2 / Math.max(bodyB.surfaceGravityMs2, 0.0001)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/75 backdrop-blur-md p-4 font-mono text-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-space-950/95 border border-space-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-space-800 bg-space-900/50">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-aeroblue" />
            <span className="text-xs font-bold tracking-widest uppercase text-white">
              PLANETARY SCALE &amp; ASTROPHYSICS COMPARATOR
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-space-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Selector Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
            <div className="sm:col-span-5">
              <label className="text-[10px] text-space-400 uppercase block mb-1">PRIMARY BODY</label>
              <select
                value={bodyAId}
                onChange={(e) => setBodyAId(e.target.value)}
                className="w-full bg-space-900 border border-space-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aeroblue"
              >
                {CELESTIAL_BODIES_PHYSICS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.diameterKm.toLocaleString()} km)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1 flex justify-center pt-4">
              <button
                onClick={() => {
                  const temp = bodyAId;
                  setBodyAId(bodyBId);
                  setBodyBId(temp);
                }}
                className="p-2 rounded-full bg-space-900 hover:bg-space-800 border border-space-800 text-aeroblue transition-colors cursor-pointer"
                title="Swap Bodies"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="sm:col-span-5">
              <label className="text-[10px] text-space-400 uppercase block mb-1">COMPARISON BODY</label>
              <select
                value={bodyBId}
                onChange={(e) => setBodyBId(e.target.value)}
                className="w-full bg-space-900 border border-space-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aeroblue"
              >
                {CELESTIAL_BODIES_PHYSICS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.diameterKm.toLocaleString()} km)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Proportional Scale Spheres */}
          <div className="bg-space-900/60 border border-space-850 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-around gap-6 min-h-[190px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-[145px] flex items-center justify-center">
                <div
                  style={{
                    width: `${scaleA}px`,
                    height: `${scaleA}px`,
                    background: `radial-gradient(circle at 32% 32%, ${bodyA.colorHex}, #050811 88%)`,
                    boxShadow: `0 0 25px ${bodyA.colorHex}44`,
                  }}
                  className="rounded-full border border-white/20 transition-all duration-300"
                />
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-xs">{bodyA.name.split(' (')[0]}</div>
                <div className="text-[10px] text-space-400">{bodyA.diameterKm.toLocaleString()} km</div>
              </div>
            </div>

            <div className="text-center space-y-1 px-3 py-2 rounded-xl bg-space-950/80 border border-space-800">
              <div className="text-[9px] text-space-400 uppercase">RELATIVE RATIO</div>
              <div className="text-sm font-bold text-aeroblue">{diameterRatio}x Diameter</div>
              <div className="text-[10px] text-aeroamber">{gravityRatio}x Surface Gravity</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-[145px] flex items-center justify-center">
                <div
                  style={{
                    width: `${scaleB}px`,
                    height: `${scaleB}px`,
                    background: `radial-gradient(circle at 32% 32%, ${bodyB.colorHex}, #050811 88%)`,
                    boxShadow: `0 0 25px ${bodyB.colorHex}44`,
                  }}
                  className="rounded-full border border-white/20 transition-all duration-300"
                />
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-xs">{bodyB.name.split(' (')[0]}</div>
                <div className="text-[10px] text-space-400">{bodyB.diameterKm.toLocaleString()} km</div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Telemetry Table */}
          <div className="grid grid-cols-3 gap-2 text-[11px] bg-space-900/40 p-3.5 rounded-xl border border-space-850">
            <div className="font-bold text-aeroblue">{bodyA.name.split(' (')[0]}</div>
            <div className="text-center text-space-400 text-[10px] uppercase">PARAMETER</div>
            <div className="text-right font-bold text-aeroamber">{bodyB.name.split(' (')[0]}</div>

            <div className="h-px bg-space-800 col-span-3 my-0.5" />

            <div>{bodyA.surfaceGravityMs2} m/s²</div>
            <div className="text-center text-space-400 text-[10px]">SURFACE GRAVITY</div>
            <div className="text-right">{bodyB.surfaceGravityMs2} m/s²</div>

            <div>{bodyA.escapeVelocityKmS} km/s</div>
            <div className="text-center text-space-400 text-[10px]">ESCAPE VELOCITY</div>
            <div className="text-right">{bodyB.escapeVelocityKmS} km/s</div>

            <div>{bodyA.orbitRadiusAU} AU</div>
            <div className="text-center text-space-400 text-[10px]">SOLAR DISTANCE</div>
            <div className="text-right">{bodyB.orbitRadiusAU} AU</div>

            <div>{bodyA.realPeriodDays.toLocaleString()} days</div>
            <div className="text-center text-space-400 text-[10px]">ORBITAL PERIOD</div>
            <div className="text-right">{bodyB.realPeriodDays.toLocaleString()} days</div>

            <div>{bodyA.axialTiltDeg}°</div>
            <div className="text-center text-space-400 text-[10px]">AXIAL OBLIQUITY</div>
            <div className="text-right">{bodyB.axialTiltDeg}°</div>

            <div>{bodyA.meanTempC}</div>
            <div className="text-center text-space-400 text-[10px]">MEAN TEMPERATURE</div>
            <div className="text-right">{bodyB.meanTempC}</div>
          </div>

          {/* Quick Camera Focus Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={() => {
                onFocusPlanet(bodyA);
                onClose();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-space-900 hover:bg-space-800 border border-space-800 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-aeroblue" />
              <span>FOCUS {bodyA.name.split(' (')[0].toUpperCase()}</span>
            </button>

            <button
              onClick={() => {
                onFocusPlanet(bodyB);
                onClose();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-space-900 hover:bg-space-800 border border-space-800 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-aeroamber" />
              <span>FOCUS {bodyB.name.split(' (')[0].toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
