'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Telescope, Play, Pause, RotateCcw, Sparkles, Orbit, SunMedium } from 'lucide-react';

interface ExoplanetTransitSimulatorProps {
  onClose: () => void;
  language?: 'km' | 'en';
}

interface ExoplanetSystem {
  id: string;
  name: string;
  khmerName: string;
  starName: string;
  starType: string;
  starLuminositySolar: number; // L_sun
  starRadiusSolar: number; // R_sun
  starTempK: number;
  planetRadiusEarth: number; // R_earth
  orbitRadiusAU: number;
  periodDays: number;
  habitableStatus: 'OPTIMISTIC HABITABLE' | 'CONSERVATIVE HABITABLE' | 'TOO HOT / TIDALLY ROASTED';
  khmerHabitableStatus: string;
  distanceLightYears: number;
  description: string;
  khmerDescription: string;
}

const EXOPLANET_SYSTEMS: ExoplanetSystem[] = [
  {
    id: 'trappist-1e',
    name: 'TRAPPIST-1e (Earth Twin)',
    khmerName: 'ភព TRAPPIST-1e (កូនភ្លោះផែនដី)',
    starName: 'TRAPPIST-1 (M8V Ultra-cool Dwarf)',
    starType: 'Ultra-cool Red Dwarf',
    starLuminositySolar: 0.00055,
    starRadiusSolar: 0.121,
    starTempK: 2566,
    planetRadiusEarth: 0.92,
    orbitRadiusAU: 0.029,
    periodDays: 6.1,
    habitableStatus: 'CONSERVATIVE HABITABLE',
    khmerHabitableStatus: 'ក្នុងតំបន់រស់នៅអំណោយផលខ្ពស់ (Goldilocks Zone)',
    distanceLightYears: 39.46,
    description: 'Rocky terrestrial exoplanet orbiting within the conservative habitable zone of TRAPPIST-1, receiving 66% of Earth’s solar flux.',
    khmerDescription: 'ភពថ្មរឹងដែលគោចរក្នុងតំបន់រស់នៅអំណោយផលខ្ពស់បំផុត ទទួលកម្តៅ 66% នៃផែនដី ដែលអាចមានទឹកសាបរាវលើផ្ទៃ។',
  },
  {
    id: 'proxima-b',
    name: 'Proxima Centauri b (Nearest Neighbor)',
    khmerName: 'ភព Proxima Centauri b (ជិតបំផុត)',
    starName: 'Proxima Centauri (M5.5Ve Flare Star)',
    starType: 'Red Dwarf Flare Star',
    starLuminositySolar: 0.0017,
    starRadiusSolar: 0.154,
    starTempK: 3042,
    planetRadiusEarth: 1.07,
    orbitRadiusAU: 0.048,
    periodDays: 11.2,
    habitableStatus: 'OPTIMISTIC HABITABLE',
    khmerHabitableStatus: 'ក្នុងតំបន់រស់នៅ ប៉ុន្តែមានព្យុះកាំរស្មីព្រះអាទិត្យ',
    distanceLightYears: 4.24,
    description: 'Closest known exoplanet to Earth, located in the habitable zone but subjected to intense stellar flare ultraviolet irradiation.',
    khmerDescription: 'ភពក្រៅប្រព័ន្ធដែលនៅកៀកផែនដីបំផុតក្នុងចម្ងាយត្រឹមតែ 4.24 ឆ្នាំពន្លឺ ស្ថិតក្នុងតំបន់រស់នៅ ប៉ុន្តែរងព្យុះផ្លេកបន្ទោរ UV ញឹកញាប់។',
  },
  {
    id: 'kepler-186f',
    name: 'Kepler-186f (First Earth-Size in HZ)',
    khmerName: 'ភព Kepler-186f (ទំហំប៉ុនផែនដីដំបូង)',
    starName: 'Kepler-186 (M1V Red Dwarf)',
    starType: 'Red Dwarf',
    starLuminositySolar: 0.041,
    starRadiusSolar: 0.523,
    starTempK: 3788,
    planetRadiusEarth: 1.11,
    orbitRadiusAU: 0.432,
    periodDays: 129.9,
    habitableStatus: 'CONSERVATIVE HABITABLE',
    khmerHabitableStatus: 'ភពថ្មទំហំប៉ុនផែនដីក្នុងតំបន់រស់នៅ',
    distanceLightYears: 582,
    description: 'First validated Earth-sized exoplanet orbiting within the habitable zone of another star, receiving one-third of solar flux.',
    khmerDescription: 'ភពដំបូងគេបង្អស់ដែលមានទំហំប៉ុនផែនដី ត្រូវបានរកឃើញក្នុងតំបន់រស់នៅដោយកែវយឹត Kepler ក្នុងឆ្នាំ 2014។',
  },
  {
    id: 'kepler-452b',
    name: 'Kepler-452b (Earth’s Bigger Cousin)',
    khmerName: 'ភព Kepler-452b (បងប្អូនជីដូនមួយផែនដី)',
    starName: 'Kepler-452 (G2V Solar Twin)',
    starType: 'G-Type Solar Twin',
    starLuminositySolar: 1.20,
    starRadiusSolar: 1.11,
    starTempK: 5757,
    planetRadiusEarth: 1.63,
    orbitRadiusAU: 1.046,
    periodDays: 384.8,
    habitableStatus: 'OPTIMISTIC HABITABLE',
    khmerHabitableStatus: 'គោចរជុំវិញផ្កាយដូចព្រះអាទិត្យ',
    distanceLightYears: 1799,
    description: 'Super-Earth orbiting a G2-class star nearly identical to the Sun with an orbital period of 385 days.',
    khmerDescription: 'ភព Super-Earth វិលជុំវិញផ្កាយដែលដូចព្រះអាទិត្យ 99% ដោយមួយជុំមានរយៈពេល 385 ថ្ងៃ ស្រដៀងនឹងផែនដីបំផុត។',
  },
];

export default function ExoplanetTransitSimulator({ onClose, language = 'km' }: ExoplanetTransitSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedSystem, setSelectedSystem] = useState<ExoplanetSystem>(EXOPLANET_SYSTEMS[0]);
  const [orbitalPhase, setOrbitalPhase] = useState(0); // 0 to 1
  const [isPlaying, setIsPlaying] = useState(true);
  const [impactParameter, setImpactParameter] = useState(0.2); // b = a*cos(i) / R_*

  // Compute Transit Photometry Dip:
  // delta = (R_p / R_*)^2
  // R_sun = 696,340 km; R_earth = 6,371 km
  const rStarKm = selectedSystem.starRadiusSolar * 696340;
  const rPlanetKm = selectedSystem.planetRadiusEarth * 6371;
  const radiusRatio = rPlanetKm / rStarKm;
  const transitDepthFraction = radiusRatio * radiusRatio;
  const transitDepthPpm = Math.round(transitDepthFraction * 1e6); // Parts per million

  // Habitable Zone (Goldilocks) Boundaries:
  // r_inner = sqrt(L_* / 1.1) AU (runaway greenhouse)
  // r_outer = sqrt(L_* / 0.53) AU (maximum greenhouse)
  const lStar = selectedSystem.starLuminositySolar;
  const rInnerHz = Math.sqrt(lStar / 1.1);
  const rOuterHz = Math.sqrt(lStar / 0.53);

  // Animation Loop
  useEffect(() => {
    let animId: number;
    let phase = orbitalPhase;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Top Half: Star & Transiting Planet
      const starCenterX = w * 0.5;
      const starCenterY = h * 0.28;
      const starDrawRadius = 60;

      // Draw Host Star with Limb Darkening
      const starGrad = ctx.createRadialGradient(
        starCenterX, starCenterY, starDrawRadius * 0.1,
        starCenterX, starCenterY, starDrawRadius
      );
      if (selectedSystem.starTempK < 3500) {
        starGrad.addColorStop(0, '#fef08a');
        starGrad.addColorStop(0.6, '#ea580c');
        starGrad.addColorStop(1, '#7f1d1d');
      } else {
        starGrad.addColorStop(0, '#ffffff');
        starGrad.addColorStop(0.5, '#fde047');
        starGrad.addColorStop(1, '#ca8a04');
      }

      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(starCenterX, starCenterY, starDrawRadius, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric Corona Glow
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Transiting Planet Position in Phase (-0.5 to 0.5 where 0 is mid-transit)
      const centeredPhase = (phase - 0.5) * 2; // -1 to 1
      const planetX = starCenterX + centeredPhase * (starDrawRadius * 2.8);
      const planetY = starCenterY + impactParameter * starDrawRadius;
      const planetDrawRadius = Math.max(3, starDrawRadius * radiusRatio * 4.5); // Visual enhancement factor

      const distFromStarCenter = Math.hypot(planetX - starCenterX, planetY - starCenterY);
      const isTransiting = distFromStarCenter < starDrawRadius + planetDrawRadius && Math.abs(centeredPhase) < 0.6;

      // Draw Orbit Track
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(starCenterX - starDrawRadius * 2.5, planetY);
      ctx.lineTo(starCenterX + starDrawRadius * 2.5, planetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Planet Silhouette
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetDrawRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isTransiting ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bottom Half: Normalized Flux Light Curve Graph
      const graphX = 60;
      const graphY = h * 0.62;
      const graphW = w - 120;
      const graphH = h * 0.30;

      // Graph Background
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(graphX, graphY, graphW, graphH);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      // Graph Baseline (Flux = 1.0)
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(graphX, graphY + 15);
      ctx.lineTo(graphX + graphW, graphY + 15);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('1.000 (100% FLUX)', graphX + 8, graphY + 12);
      ctx.fillText(`${(1.0 - transitDepthFraction).toFixed(5)} (-${transitDepthPpm} ppm)`, graphX + 8, graphY + graphH - 8);

      // Draw Theoretical U-shaped Transit Dip Curve
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let px = 0; px <= graphW; px += 2) {
        const pNorm = (px / graphW - 0.5) * 2; // -1 to 1
        let flux = 1.0;
        const transitHalfWidth = (starDrawRadius + planetDrawRadius) / (starDrawRadius * 2.8);

        if (Math.abs(pNorm) < transitHalfWidth) {
          const ingressFrac = (transitHalfWidth - Math.abs(pNorm)) / (planetDrawRadius * 2 / (starDrawRadius * 2.8));
          const depthScale = Math.min(1.0, Math.max(0.0, ingressFrac));
          flux = 1.0 - transitDepthFraction * depthScale;
        }

        const plotY = graphY + 15 + ((1.0 - flux) / (transitDepthFraction * 1.25 || 1)) * (graphH - 30);
        if (px === 0) ctx.moveTo(graphX + px, plotY);
        else ctx.lineTo(graphX + px, plotY);
      }
      ctx.stroke();

      // Current Phase Telemetry Cursor on Graph
      const cursorX = graphX + phase * graphW;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cursorX, graphY);
      ctx.lineTo(cursorX, graphY + graphH);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cursorX, graphY + 15, 3.5, 0, Math.PI * 2);
      ctx.fill();

      if (isPlaying) {
        phase = (phase + 0.003) % 1;
        setOrbitalPhase(phase);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedSystem, orbitalPhase, isPlaying, impactParameter, radiusRatio, transitDepthFraction, transitDepthPpm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-space-900 border border-aeroblue/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Telescope className="w-5 h-5 text-aeroblue" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {language === 'km' ? 'ពិសោធន៍រុករកភពក្រៅប្រព័ន្ធ (EXOPLANET TRANSIT PHOTOMETRY)' : 'EXOPLANET TRANSIT PHOTOMETRY SIMULATOR'}
              </h2>
              <p className="text-[10px] text-space-400">
                {language === 'km' ? 'វិធីសាស្ត្រកែវយឹត Kepler/TESS វាស់ការធ្លាក់ចុះនៃពន្លឺផ្កាយ និងតំបន់រស់នៅ Goldilocks Zone' : 'Kepler & TESS Transit Depth Light Curve & Habitable Zone Sizing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-space-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Exoplanet Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-space-400 uppercase tracking-wider">
              {language === 'km' ? 'ប្រព័ន្ធភពក្រៅប្រព័ន្ធល្បីៗ (TARGET EXOPLANET SYSTEMS):' : 'TARGET EXOPLANET SYSTEMS:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {EXOPLANET_SYSTEMS.map((sys) => (
                <button
                  key={sys.id}
                  onClick={() => setSelectedSystem(sys)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSystem.id === sys.id
                      ? 'bg-aeroblue/15 border-aeroblue text-white shadow-lg'
                      : 'bg-space-950/80 hover:bg-space-850 border-space-800 text-space-300'
                  }`}
                >
                  <div className="font-bold text-xs text-white">
                    {language === 'km' ? sys.khmerName : sys.name}
                  </div>
                  <div className="text-[10px] text-space-400 mt-1">
                    {sys.distanceLightYears} ly &bull; {sys.periodDays}d orbit
                  </div>
                  <div className="text-[9px] text-aerogreen font-semibold mt-1 truncate">
                    {language === 'km' ? sys.khmerHabitableStatus : sys.habitableStatus}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Transit Canvas */}
          <div className="relative rounded-xl border border-space-800 bg-space-950 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={820}
              height={380}
              className="w-full h-auto block aspect-[820/380]"
            />
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-space-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-space-800 text-[10px]">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 font-bold text-white hover:text-aeroblue transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-aeroamber" /> : <Play className="w-3.5 h-3.5 text-aerogreen" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
              <div className="w-px h-3 bg-space-700" />
              <button
                onClick={() => setOrbitalPhase(0)}
                className="flex items-center gap-1 text-space-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* 3 Telemetry Metric Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'ជម្រៅធ្លាក់ចុះនៃពន្លឺ TRANSIT DEPTH' : 'TRANSIT DEPTH (DELTA)'}
              </span>
              <div className="text-xl font-bold text-aeroblue">
                {transitDepthPpm.toLocaleString()} <span className="text-xs text-space-400">ppm</span>
              </div>
              <div className="text-[10px] text-space-400">
                &Delta;F / F = (R_p / R_*)^2 = {(transitDepthFraction * 100).toFixed(4)}%
              </div>
            </div>

            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'តំបន់រស់នៅ GOLDILOCKS ZONE' : 'HABITABLE ZONE BOUNDARY'}
              </span>
              <div className="text-xl font-bold text-aerogreen">
                {rInnerHz.toFixed(3)} - {rOuterHz.toFixed(3)} <span className="text-xs text-space-400">AU</span>
              </div>
              <div className="text-[10px] text-space-400">
                Planet Orbit: {selectedSystem.orbitRadiusAU} AU ({selectedSystem.orbitRadiusAU >= rInnerHz && selectedSystem.orbitRadiusAU <= rOuterHz ? 'INSIDE ZONE' : 'OUTSIDE'})
              </div>
            </div>

            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'លក្ខណៈផ្កាយមេ HOST STAR' : 'HOST STAR PARAMETERS'}
              </span>
              <div className="text-xl font-bold text-aeroamber">
                {selectedSystem.starTempK.toLocaleString()} <span className="text-xs text-space-400">Kelvin</span>
              </div>
              <div className="text-[10px] text-space-400">
                L: {selectedSystem.starLuminositySolar} L_sun &bull; R: {selectedSystem.starRadiusSolar} R_sun
              </div>
            </div>
          </div>

          {/* Interactive Impact Parameter Slider */}
          <div className="p-3.5 bg-space-950 rounded-xl border border-space-800 space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-white">
              <span>{language === 'km' ? 'ប៉ារ៉ាម៉ែត្រកាត់មុខផ្កាយ Impact Parameter (b):' : 'Impact Parameter (b = a*cos(i)/R_*):'}</span>
              <span className="text-aeroblue">{impactParameter.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={0.9}
              step={0.05}
              value={impactParameter}
              onChange={(e) => setImpactParameter(Number(e.target.value))}
              className="w-full accent-aeroblue cursor-pointer"
            />
            <div className="text-[10px] text-space-400">
              {impactParameter === 0 ? 'Central chord transit (longest duration)' : 'Grazing chord transit (shorter duration)'}
            </div>

            {/* Scientific Description */}
            <div className="p-2.5 bg-space-900/80 rounded-lg border border-space-800 text-[11px] text-space-300 leading-relaxed mt-2">
              <span className="font-bold text-white block mb-0.5">
                {language === 'km' ? 'ព័ត៌មានវិទ្យាសាស្ត្រភពក្រៅប្រព័ន្ធ:' : 'EXOPLANET CHARACTERISTICS:'}
              </span>
              {language === 'km' ? selectedSystem.khmerDescription : selectedSystem.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
