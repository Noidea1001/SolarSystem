'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Orbit, Rocket, ArrowRight, Play, Pause, RotateCcw, X, Info } from 'lucide-react';

interface PlanetOrbitInfo {
  id: string;
  name: string;
  khmerName: string;
  rAU: number; // Astronomical Units
  periodDays: number;
  colorHex: string;
}

const ORBITAL_TARGETS: PlanetOrbitInfo[] = [
  { id: 'mercury', name: 'Mercury', khmerName: 'ភពពុធ', rAU: 0.387, periodDays: 87.97, colorHex: '#9ca3af' },
  { id: 'venus', name: 'Venus', khmerName: 'ភពសុក្រ', rAU: 0.723, periodDays: 224.7, colorHex: '#f59e0b' },
  { id: 'earth', name: 'Earth', khmerName: 'ភពផែនដី', rAU: 1.0, periodDays: 365.256, colorHex: '#38bdf8' },
  { id: 'mars', name: 'Mars', khmerName: 'ភពព្រះអង្គារ', rAU: 1.524, periodDays: 686.98, colorHex: '#ef4444' },
  { id: 'jupiter', name: 'Jupiter', khmerName: 'ភពព្រហស្បតិ៍', rAU: 5.203, periodDays: 4332.59, colorHex: '#d97706' },
  { id: 'saturn', name: 'Saturn', khmerName: 'ភពសៅរ៍', rAU: 9.537, periodDays: 10759.22, colorHex: '#eab308' },
];

const AU_KM = 149597870.7; // 1 AU in km
const MU_SUN = 1.32712440018e11; // Standard gravitational parameter of Sun in km^3/s^2

interface HohmannTransferSimulatorProps {
  onClose?: () => void;
  language?: 'km' | 'en';
}

export default function HohmannTransferSimulator({ onClose, language = 'km' }: HohmannTransferSimulatorProps) {
  const [originId, setOriginId] = useState<string>('earth');
  const [targetId, setTargetId] = useState<string>('mars');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [flightProgress, setFlightProgress] = useState<number>(0); // 0 to 1
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const origin = ORBITAL_TARGETS.find((p) => p.id === originId) || ORBITAL_TARGETS[2];
  const destination = ORBITAL_TARGETS.find((p) => p.id === targetId) || ORBITAL_TARGETS[3];

  const r1Km = origin.rAU * AU_KM;
  const r2Km = destination.rAU * AU_KM;
  const aTransferKm = (r1Km + r2Km) / 2;
  const aTransferAU = (origin.rAU + destination.rAU) / 2;

  // Orbital velocities in circular orbits
  const v1 = Math.sqrt(MU_SUN / r1Km);
  const v2 = Math.sqrt(MU_SUN / r2Km);

  // Velocities at perihelion and aphelion of the transfer ellipse
  const vPeri = Math.sqrt(MU_SUN * (2 / r1Km - 1 / aTransferKm));
  const vAph = Math.sqrt(MU_SUN * (2 / r2Km - 1 / aTransferKm));

  const deltaV1 = Math.abs(vPeri - v1);
  const deltaV2 = Math.abs(v2 - vAph);
  const totalDeltaV = deltaV1 + deltaV2;

  // Transit flight time (half orbital period of the transfer ellipse)
  const transferPeriodSec = 2 * Math.PI * Math.sqrt(Math.pow(aTransferKm, 3) / MU_SUN);
  const flightTimeDays = (transferPeriodSec / 2) / 86400;

  // Synodic launch window period
  const synodicDays = Math.abs((origin.periodDays * destination.periodDays) / (origin.periodDays - destination.periodDays));

  // Animation Loop for Canvas
  useEffect(() => {
    let animId: number;
    let progress = flightProgress;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isSimulating) {
        progress = (progress + 0.0035) % 1.0;
        setFlightProgress(progress);
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.max(origin.rAU, destination.rAU);
      const scale = (Math.min(w, h) * 0.42) / maxR;

      // Draw Orbit 1 (Origin)
      ctx.strokeStyle = origin.colorHex;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, origin.rAU * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Orbit 2 (Destination)
      ctx.strokeStyle = destination.colorHex;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, destination.rAU * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Sun
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Hohmann Transfer Ellipse Arc
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      const isOutward = destination.rAU >= origin.rAU;
      const rA = origin.rAU * scale;
      const rB = destination.rAU * scale;
      const a = (rA + rB) / 2;
      const c = Math.abs(rB - rA) / 2;
      const b = Math.sqrt(Math.max(0, a * a - c * c));
      const ellipseCenterX = isOutward ? cx - c : cx + c;

      ctx.beginPath();
      ctx.ellipse(ellipseCenterX, cy, a, b, 0, Math.PI, 0, !isOutward);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Origin Planet Position
      const originAngle = 0;
      const ox = cx + Math.cos(originAngle) * rA;
      const oy = cy + Math.sin(originAngle) * rA;
      ctx.fillStyle = origin.colorHex;
      ctx.beginPath();
      ctx.arc(ox, oy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw Destination Planet Position at Arrival
      const destAngle = Math.PI;
      const dx = cx + Math.cos(destAngle) * rB;
      const dy = cy + Math.sin(destAngle) * rB;
      ctx.fillStyle = destination.colorHex;
      ctx.beginPath();
      ctx.arc(dx, dy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw Flying Spacecraft along the Hohmann Transfer Arc
      const theta = isOutward ? Math.PI + progress * Math.PI : Math.PI - progress * Math.PI;
      const shipX = ellipseCenterX + a * Math.cos(theta);
      const shipY = cy - b * Math.sin(theta);

      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(shipX, shipY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [origin, destination, isSimulating]);

  return (
    <div className="bg-space-950/95 backdrop-blur-2xl border border-space-800 rounded-3xl p-4 sm:p-6 text-white font-mono shadow-2xl max-w-3xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-space-850">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-aeroblue/15 border border-aeroblue/30 flex items-center justify-center text-aeroblue">
            <Rocket className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <span>{language === 'km' ? 'ម៉ាស៊ីនគណនាគន្លងផ្លាស់ប្តូរ HOHMANN TRANSFER' : 'HOHMANN ORBITAL TRANSFER TRAJECTORY SIMULATOR'}</span>
            </h2>
            <p className="text-[10px] text-space-400">
              {language === 'km' ? 'គណនាថាមពល DELTA-V និងរយៈពេលធ្វើដំណើរតាមទ្រឹស្តីកេព្លែរ' : 'Keplerian minimum-energy interplanetary transfer dynamics & delta-v budget'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-space-800 text-space-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        {/* Origin Selector */}
        <div className="bg-space-900/70 p-3 rounded-2xl border border-space-850 space-y-1">
          <label className="text-[10px] font-bold text-space-400 uppercase tracking-wider block">
            {language === 'km' ? 'ភពចេញដំណើរ (ORIGIN)' : 'DEPARTURE BODY (ORIGIN)'}
          </label>
          <select
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
            className="w-full bg-space-950 border border-space-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-aeroblue cursor-pointer"
          >
            {ORBITAL_TARGETS.filter((p) => p.id !== targetId).map((p) => (
              <option key={p.id} value={p.id}>
                {language === 'km' ? `${p.khmerName} (${p.name}) - ${p.rAU} AU` : `${p.name} (${p.rAU} AU)`}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Selector */}
        <div className="bg-space-900/70 p-3 rounded-2xl border border-space-850 space-y-1">
          <label className="text-[10px] font-bold text-space-400 uppercase tracking-wider block">
            {language === 'km' ? 'ភពគោលដៅ (DESTINATION)' : 'TARGET BODY (DESTINATION)'}
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full bg-space-950 border border-space-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-aeroblue cursor-pointer"
          >
            {ORBITAL_TARGETS.filter((p) => p.id !== originId).map((p) => (
              <option key={p.id} value={p.id}>
                {language === 'km' ? `${p.khmerName} (${p.name}) - ${p.rAU} AU` : `${p.name} (${p.rAU} AU)`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive 2D Orbit Canvas Display */}
      <div className="relative w-full h-52 sm:h-64 bg-space-950/80 rounded-2xl border border-space-850 flex items-center justify-center overflow-hidden mb-4">
        <canvas ref={canvasRef} width={600} height={260} className="w-full h-full" />

        {/* Play / Pause Toggle */}
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="px-2.5 py-1 rounded-lg bg-space-900/90 hover:bg-space-800 border border-space-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
          >
            {isSimulating ? <Pause className="w-3 h-3 text-aeroamber" /> : <Play className="w-3 h-3 text-aerogreen" />}
            <span>{isSimulating ? (language === 'km' ? 'ផ្អាក' : 'PAUSE') : (language === 'km' ? 'ដំណើរការ' : 'RESUME')}</span>
          </button>

          <span className="text-[10px] text-space-400 font-mono">
            {language === 'km' ? 'វដ្តហោះហើរ:' : 'TRANSIT:'} {Math.round(flightProgress * 100)}%
          </span>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-850">
          <span className="text-[9px] text-space-400 uppercase font-bold block">
            {language === 'km' ? 'ល្បឿន DELTA-V សរុប' : 'TOTAL DELTA-V'}
          </span>
          <span className="text-sm font-bold text-aeroblue">{totalDeltaV.toFixed(2)} km/s</span>
          <span className="text-[9px] text-space-400 block mt-0.5">
            d1: {deltaV1.toFixed(2)} | d2: {deltaV2.toFixed(2)} km/s
          </span>
        </div>

        <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-850">
          <span className="text-[9px] text-space-400 uppercase font-bold block">
            {language === 'km' ? 'រយៈពេលហោះហើរ' : 'ONE-WAY FLIGHT'}
          </span>
          <span className="text-sm font-bold text-aeroamber">
            {flightTimeDays >= 365 ? `${(flightTimeDays / 365.25).toFixed(1)} yrs` : `${Math.round(flightTimeDays)} days`}
          </span>
          <span className="text-[9px] text-space-400 block mt-0.5">
            {Math.round(flightTimeDays)} {language === 'km' ? 'ថ្ងៃនៃផែនដី' : 'Earth days'}
          </span>
        </div>

        <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-850">
          <span className="text-[9px] text-space-400 uppercase font-bold block">
            {language === 'km' ? 'កន្លះអ័ក្សធំគន្លង' : 'SEMI-MAJOR AXIS'}
          </span>
          <span className="text-sm font-bold text-aerogreen">{aTransferAU.toFixed(3)} AU</span>
          <span className="text-[9px] text-space-400 block mt-0.5">
            {(aTransferKm / 1e6).toFixed(1)}M km
          </span>
        </div>

        <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-850">
          <span className="text-[9px] text-space-400 uppercase font-bold block">
            {language === 'km' ? 'បង្អួចបាញ់បង្ហោះ' : 'LAUNCH WINDOW'}
          </span>
          <span className="text-sm font-bold text-white">
            {synodicDays >= 365 ? `${(synodicDays / 365.25).toFixed(1)} yrs` : `${Math.round(synodicDays)} d`}
          </span>
          <span className="text-[9px] text-space-400 block mt-0.5">
            {language === 'km' ? 'វដ្ត Synodic' : 'Synodic period'}
          </span>
        </div>
      </div>
    </div>
  );
}
