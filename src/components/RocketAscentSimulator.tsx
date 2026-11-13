'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Rocket, Play, Pause, RotateCcw, Activity, ShieldCheck, Gauge, ArrowUpRight } from 'lucide-react';

interface RocketAscentSimulatorProps {
  onClose: () => void;
  language?: 'km' | 'en';
}

interface RocketVehicle {
  id: string;
  name: string;
  khmerName: string;
  agency: string;
  liftoffMassKg: number;
  stage1ThrustKn: number;
  stage1BurnTimeSec: number;
  stage2ThrustKn: number;
  stage2BurnTimeSec: number;
  targetOrbitKm: number;
  propellantType: string;
  maxQExpectedKpa: number;
}

const ROCKET_VEHICLES: RocketVehicle[] = [
  {
    id: 'falcon-9',
    name: 'Falcon 9 Full Thrust',
    khmerName: 'រ៉ុក្កែត Falcon 9 Full Thrust',
    agency: 'SpaceX',
    liftoffMassKg: 549054,
    stage1ThrustKn: 7607,
    stage1BurnTimeSec: 162,
    stage2ThrustKn: 981,
    stage2BurnTimeSec: 397,
    targetOrbitKm: 250,
    propellantType: 'RP-1 / Liquid Oxygen (Kerolox)',
    maxQExpectedKpa: 33.5,
  },
  {
    id: 'saturn-v',
    name: 'Saturn V (Apollo 11)',
    khmerName: 'រ៉ុក្កែត Saturn V (បេសកកម្ម Apollo)',
    agency: 'NASA / Boeing / North American',
    liftoffMassKg: 2970000,
    stage1ThrustKn: 35100,
    stage1BurnTimeSec: 168,
    stage2ThrustKn: 5140,
    stage2BurnTimeSec: 360,
    targetOrbitKm: 185,
    propellantType: 'Kerolox (S-IC) + Hydrolox (S-II & S-IVB)',
    maxQExpectedKpa: 38.2,
  },
  {
    id: 'sls-block1',
    name: 'Space Launch System (SLS Block 1)',
    khmerName: 'រ៉ុក្កែត SLS Block 1 (Artemis)',
    agency: 'NASA',
    liftoffMassKg: 2608000,
    stage1ThrustKn: 39000,
    stage1BurnTimeSec: 126,
    stage2ThrustKn: 110,
    stage2BurnTimeSec: 460,
    targetOrbitKm: 200,
    propellantType: 'Solid Rocket Boosters + Hydrolox Core',
    maxQExpectedKpa: 35.8,
  },
  {
    id: 'starship',
    name: 'Starship & Super Heavy',
    khmerName: 'រ៉ុក្កែត Starship & Super Heavy',
    agency: 'SpaceX',
    liftoffMassKg: 5000000,
    stage1ThrustKn: 72000,
    stage1BurnTimeSec: 160,
    stage2ThrustKn: 14700,
    stage2BurnTimeSec: 380,
    targetOrbitKm: 300,
    propellantType: 'Sub-cooled Liquid CH4 / LOX (Methalox)',
    maxQExpectedKpa: 36.5,
  },
];

export default function RocketAscentSimulator({ onClose, language = 'km' }: RocketAscentSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRocket, setSelectedRocket] = useState<RocketVehicle>(ROCKET_VEHICLES[0]);
  const [flightTimeSec, setFlightTimeSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Flight Dynamics Variables
  // Time integration step:
  const t = flightTimeSec;
  const isStage1Active = t < selectedRocket.stage1BurnTimeSec;
  const isMeco = t >= selectedRocket.stage1BurnTimeSec && t < selectedRocket.stage1BurnTimeSec + 8;
  const isStage2Active = t >= selectedRocket.stage1BurnTimeSec + 8 && t < selectedRocket.stage1BurnTimeSec + 8 + selectedRocket.stage2BurnTimeSec;
  const isOrbitReached = t >= selectedRocket.stage1BurnTimeSec + 8 + selectedRocket.stage2BurnTimeSec;

  // Numerical flight path equations of motion:
  // Altitude h(t)
  const hKm = Math.min(
    selectedRocket.targetOrbitKm,
    t < 15
      ? 0.05 * Math.pow(t / 15, 2) * 1.5
      : t < selectedRocket.stage1BurnTimeSec
      ? 1.5 + Math.pow((t - 15) / (selectedRocket.stage1BurnTimeSec - 15), 1.8) * 68
      : 70 + Math.pow((t - selectedRocket.stage1BurnTimeSec) / selectedRocket.stage2BurnTimeSec, 1.1) * (selectedRocket.targetOrbitKm - 70)
  );

  // Velocity v(t)
  const vKmS = Math.min(
    7.8,
    t < selectedRocket.stage1BurnTimeSec
      ? (t / selectedRocket.stage1BurnTimeSec) * 2.3
      : 2.3 + ((t - selectedRocket.stage1BurnTimeSec) / selectedRocket.stage2BurnTimeSec) * (7.8 - 2.3)
  );

  // Downrange distance x(t)
  const downrangeKm = t < 15 ? 0 : Math.pow((t - 15) / 500, 1.9) * 1200;

  // Atmospheric density rho(h) = rho0 * exp(-h / 7.2)
  const rhoKgM3 = 1.225 * Math.exp(-hKm / 7.2);

  // Dynamic Pressure Q = 0.5 * rho * v^2
  const vMS = vKmS * 1000;
  const qKpa = Math.min(selectedRocket.maxQExpectedKpa * 1.05, (0.5 * rhoKgM3 * vMS * vMS) / 1000);
  const isMaxQ = qKpa > selectedRocket.maxQExpectedKpa * 0.95 && hKm > 8 && hKm < 18;

  // Acceleration G-force
  const gForce = isOrbitReached ? 0 : isMeco ? 0.05 : isStage1Active ? 1.2 + (t / selectedRocket.stage1BurnTimeSec) * 2.4 : 1.5 + ((t - selectedRocket.stage1BurnTimeSec) / selectedRocket.stage2BurnTimeSec) * 1.8;

  // Gravity Turn Pitch Angle (90 at liftoff to 0 horizontal at orbit)
  const pitchAngleDeg = Math.max(0, 90 - Math.pow(t / 550, 0.7) * 90);

  // Animation Loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Trajectory Graph View: Altitude (0 to 280 km) vs Downrange (0 to 1400 km)
      const originX = 60;
      const originY = h - 45;
      const graphW = w - 90;
      const graphH = h - 75;

      // Draw Grid & Axes
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let yStep = 0; yStep <= 250; yStep += 50) {
        const py = originY - (yStep / 280) * graphH;
        ctx.beginPath();
        ctx.moveTo(originX, py);
        ctx.lineTo(originX + graphW, py);
        ctx.stroke();

        ctx.font = '9px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${yStep} km`, originX - 42, py + 3);
      }

      for (let xStep = 0; xStep <= 1200; xStep += 300) {
        const px = originX + (xStep / 1400) * graphW;
        ctx.beginPath();
        ctx.moveTo(px, originY);
        ctx.lineTo(px, originY - graphH);
        ctx.stroke();

        ctx.font = '9px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${xStep} km`, px - 12, originY + 18);
      }

      // Atmospheric Karman Line (100 km)
      const karmanY = originY - (100 / 280) * graphH;
      ctx.strokeStyle = '#0284c7';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(originX, karmanY);
      ctx.lineTo(originX + graphW, karmanY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('KARMAN LINE (100 KM BOUNDARY)', originX + graphW - 190, karmanY - 4);

      // Draw Projected Full Gravity Turn Flight Curve
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let simT = 0; simT <= 560; simT += 5) {
        const simH = Math.min(
          selectedRocket.targetOrbitKm,
          simT < 15
            ? 0.05 * Math.pow(simT / 15, 2) * 1.5
            : simT < selectedRocket.stage1BurnTimeSec
            ? 1.5 + Math.pow((simT - 15) / (selectedRocket.stage1BurnTimeSec - 15), 1.8) * 68
            : 70 + Math.pow((simT - selectedRocket.stage1BurnTimeSec) / selectedRocket.stage2BurnTimeSec, 1.1) * (selectedRocket.targetOrbitKm - 70)
        );
        const simX = simT < 15 ? 0 : Math.pow((simT - 15) / 500, 1.9) * 1200;

        const plotX = originX + (simX / 1400) * graphW;
        const plotY = originY - (simH / 280) * graphH;

        if (simT === 0) ctx.moveTo(plotX, plotY);
        else ctx.lineTo(plotX, plotY);
      }
      ctx.stroke();

      // Draw Traveled Flight Trail
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let simT = 0; simT <= Math.min(t, 560); simT += 2) {
        const simH = Math.min(
          selectedRocket.targetOrbitKm,
          simT < 15
            ? 0.05 * Math.pow(simT / 15, 2) * 1.5
            : simT < selectedRocket.stage1BurnTimeSec
            ? 1.5 + Math.pow((simT - 15) / (selectedRocket.stage1BurnTimeSec - 15), 1.8) * 68
            : 70 + Math.pow((simT - selectedRocket.stage1BurnTimeSec) / selectedRocket.stage2BurnTimeSec, 1.1) * (selectedRocket.targetOrbitKm - 70)
        );
        const simX = simT < 15 ? 0 : Math.pow((simT - 15) / 500, 1.9) * 1200;

        const plotX = originX + (simX / 1400) * graphW;
        const plotY = originY - (simH / 280) * graphH;

        if (simT === 0) ctx.moveTo(plotX, plotY);
        else ctx.lineTo(plotX, plotY);
      }
      ctx.stroke();

      // Current Rocket Position
      const curX = originX + (downrangeKm / 1400) * graphW;
      const curY = originY - (hKm / 280) * graphH;

      ctx.save();
      ctx.translate(curX, curY);
      ctx.rotate((-pitchAngleDeg * Math.PI) / 180 + Math.PI / 2);

      // Rocket Body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -12, 6, 24);

      // Rocket Exhaust Plume
      if (!isOrbitReached && !isMeco) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(-2.5, 12);
        ctx.lineTo(2.5, 12);
        ctx.lineTo(0, 12 + 10 + Math.random() * 5);
        ctx.fill();
      }
      ctx.restore();

      // Telemetry Marker Dot
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(curX, curY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (isPlaying && t < 560) {
        setFlightTimeSec((prev) => prev + 0.6);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedRocket, flightTimeSec, isPlaying, t, hKm, vKmS, downrangeKm, pitchAngleDeg, isOrbitReached, isMeco]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-space-900 border border-aeroblue/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-aeroblue" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {language === 'km' ? 'ពិសោធន៍បាញ់បង្ហោះរ៉ុក្កែតចូលគន្លងផែនដី (MULTI-STAGE ROCKET ASCENT)' : 'MULTI-STAGE ROCKET ASCENT & GRAVITY TURN AUTOPILOT'}
              </h2>
              <p className="text-[10px] text-space-400">
                {language === 'km' ? 'ការគណនាកម្លាំងសម្ពាធ Max-Q, កម្លាំងកកិតបរិយាកាស, និងល្បឿនគន្លង 7.8 km/s' : 'Dynamic Pressure Max-Q, Aerodynamic Drag, MECO Staging & Orbital Insertion'}
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
          {/* Rocket Vehicle Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-space-400 uppercase tracking-wider">
              {language === 'km' ? 'ជ្រើសរើសរ៉ុក្កែតបាញ់បង្ហោះ (LAUNCH VEHICLES):' : 'LAUNCH VEHICLES:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {ROCKET_VEHICLES.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => {
                    setSelectedRocket(vehicle);
                    setFlightTimeSec(0);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedRocket.id === vehicle.id
                      ? 'bg-aeroblue/15 border-aeroblue text-white shadow-lg'
                      : 'bg-space-950/80 hover:bg-space-850 border-space-800 text-space-300'
                  }`}
                >
                  <div className="font-bold text-xs text-white">
                    {language === 'km' ? vehicle.khmerName : vehicle.name}
                  </div>
                  <div className="text-[10px] text-space-400 mt-1">
                    {vehicle.agency} &bull; {(vehicle.liftoffMassKg / 1000).toLocaleString()} tons
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Ascent Flight Profile Canvas */}
          <div className="relative rounded-xl border border-space-800 bg-space-950 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={820}
              height={360}
              className="w-full h-auto block aspect-[820/360]"
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
                onClick={() => setFlightTimeSec(0)}
                className="flex items-center gap-1 text-space-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET LAUNCH</span>
              </button>
            </div>

            {/* Stage Status Badge */}
            <div className="absolute top-2 right-2 bg-space-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-space-800 text-[10px] font-bold">
              {isOrbitReached ? (
                <span className="text-aerogreen">ORBITAL INSERTION ACHIEVED (250 KM LEO)</span>
              ) : isMeco ? (
                <span className="text-aeroamber animate-pulse">MECO &bull; STAGE 1 SEPARATION</span>
              ) : isStage2Active ? (
                <span className="text-aeroblue">STAGE 2 VACUUM BURN ACTIVE</span>
              ) : (
                <span className="text-white">STAGE 1 ASCENT BOOST</span>
              )}
            </div>
          </div>

          {/* 4 Real-Time Flight Telemetry HUD Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'កម្ពស់ ALTITUDE' : 'ALTITUDE'}
              </span>
              <div className="text-lg font-bold text-white">
                {hKm.toFixed(1)} <span className="text-xs text-space-400">km</span>
              </div>
              <div className="text-[10px] text-space-400">
                Target: {selectedRocket.targetOrbitKm} km circular
              </div>
            </div>

            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'ល្បឿនគន្លង VELOCITY' : 'ORBITAL VELOCITY'}
              </span>
              <div className="text-lg font-bold text-aeroblue">
                {vKmS.toFixed(2)} <span className="text-xs text-space-400">km/s</span>
              </div>
              <div className="text-[10px] text-space-400">
                {Math.round(vKmS * 3600).toLocaleString()} km/h
              </div>
            </div>

            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'សម្ពាធខ្យល់ DYNAMIC Q' : 'DYNAMIC PRESSURE (Q)'}
              </span>
              <div className={`text-lg font-bold ${isMaxQ ? 'text-rose-400 animate-pulse' : 'text-aerogreen'}`}>
                {qKpa.toFixed(1)} <span className="text-xs text-space-400">kPa</span>
              </div>
              <div className="text-[10px] text-space-400">
                {isMaxQ ? 'MAX-Q VEHICLE STRESS' : `Max Expected: ${selectedRocket.maxQExpectedKpa} kPa`}
              </div>
            </div>

            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'ទម្ងន់កម្លាំងទាញ G-FORCE' : 'ACCELERATION (G-LOAD)'}
              </span>
              <div className="text-lg font-bold text-aeroamber">
                {gForce.toFixed(2)} <span className="text-xs text-space-400">g</span>
              </div>
              <div className="text-[10px] text-space-400">
                Pitch: {Math.round(pitchAngleDeg)}&deg; from horizontal
              </div>
            </div>
          </div>

          {/* Mission Timeline Summary */}
          <div className="p-3 bg-space-900/80 rounded-xl border border-space-800 text-[11px] text-space-300 leading-relaxed flex items-center justify-between">
            <div>
              <span className="font-bold text-white block mb-0.5">
                {language === 'km' ? 'ពេលវេលាហោះហើរ MISSION ELAPSED TIME (MET):' : 'MISSION ELAPSED TIME (MET):'}
              </span>
              <span className="font-mono text-xs text-aeroblue font-bold">
                T+ {Math.floor(t / 60)}m {Math.floor(t % 60)}s &bull; Downrange: {Math.round(downrangeKm)} km
              </span>
            </div>
            <div className="text-right text-[10px] text-space-400">
              Launch Site: Kennedy Space Center LC-39A (28.57&deg; N, 80.65&deg; W)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
