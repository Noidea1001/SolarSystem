'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Compass, Zap, HelpCircle } from 'lucide-react';

interface GravityAssistSimulatorProps {
  onClose: () => void;
  language?: 'km' | 'en';
}

interface AssistPreset {
  id: string;
  name: string;
  khmerName: string;
  planetName: string;
  khmerPlanetName: string;
  planetVelocity: number; // km/s
  vInfinity: number; // km/s
  periapsisKm: number;
  muPlanet: number; // km^3/s^2 (Standard gravitational parameter)
  historicContext: string;
  khmerHistoricContext: string;
}

const HISTORIC_PRESETS: AssistPreset[] = [
  {
    id: 'voyager1-jupiter',
    name: 'Voyager 1 Jupiter Gravity Assist (1979)',
    khmerName: 'Voyager 1 ទាញយកកម្លាំងទំនាញភពព្រហស្បតិ៍ (1979)',
    planetName: 'Jupiter',
    khmerPlanetName: 'ភពព្រហស្បតិ៍',
    planetVelocity: 13.06,
    vInfinity: 11.5,
    periapsisKm: 349000,
    muPlanet: 126686534,
    historicContext: 'Voyager 1 gained 10.2 km/s of heliocentric speed from Jupiter, enabling its high-inclination climb out of the ecliptic plane.',
    khmerHistoricContext: 'Voyager 1 ទទួលបានល្បឿនបន្ថែម 10.2 គម/វិនាទី ពីភពព្រហស្បតិ៍ ដែលអនុញ្ញាតឱ្យយានហោះចេញពីប្លង់គន្លងប្រព័ន្ធព្រះអាទិត្យ។',
  },
  {
    id: 'voyager2-saturn',
    name: 'Voyager 2 Saturn Slingshot (1981)',
    khmerName: 'Voyager 2 បាញ់បង្វែរទិសដៅនៅភពសៅរ៍ (1981)',
    planetName: 'Saturn',
    khmerPlanetName: 'ភពសៅរ៍',
    planetVelocity: 9.68,
    vInfinity: 9.8,
    periapsisKm: 161000,
    muPlanet: 37931187,
    historicContext: 'Redirected Voyager 2 along the Grand Tour alignment toward Uranus and Neptune.',
    khmerHistoricContext: 'បានបង្វែរទិសដៅ Voyager 2 លើគន្លង Grand Tour តម្រង់ទៅកាន់ភពអ៊ុយរ៉ានុស និងណិបទូន។',
  },
  {
    id: 'newhorizons-jupiter',
    name: 'New Horizons Jupiter Boost (2007)',
    khmerName: 'New Horizons បង្កើនល្បឿននៅភពព្រហស្បតិ៍ (2007)',
    planetName: 'Jupiter',
    khmerPlanetName: 'ភពព្រហស្បតិ៍',
    planetVelocity: 13.06,
    vInfinity: 19.5,
    periapsisKm: 2300000,
    muPlanet: 126686534,
    historicContext: 'Shaved 3 full years off the transit time to Pluto by stealing orbital momentum from Jupiter.',
    khmerHistoricContext: 'កាត់បន្ថយរយៈពេលហោះហើរទៅកាន់ភពភ្លុយតូបាន 3 ឆ្នាំពេញ ដោយដកស្រង់សន្ទុះគន្លងពីភពព្រហស្បតិ៍។',
  },
  {
    id: 'cassini-venus',
    name: 'Cassini Inner Solar System Resonances',
    khmerName: 'Cassini ប្រព័ន្ធកម្លាំងទាញទំនាញភពសុក្រ',
    planetName: 'Venus',
    khmerPlanetName: 'ភពសុក្រ',
    planetVelocity: 35.02,
    vInfinity: 7.2,
    periapsisKm: 6350,
    muPlanet: 324859,
    historicContext: 'Cassini executed dual Venus flybys to pump up orbital energy before heading to Saturn.',
    khmerHistoricContext: 'Cassini បានអនុវត្តការហោះកាត់ភពសុក្រ ២ ដង ដើម្បីបង្កើនថាមពលគន្លងមុននឹងធ្វើដំណើរទៅភពសៅរ៍។',
  },
];

export default function GravityAssistSimulator({ onClose, language = 'km' }: GravityAssistSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPreset, setSelectedPreset] = useState<AssistPreset>(HISTORIC_PRESETS[0]);
  const [approachAngleDeg, setApproachAngleDeg] = useState(45); // Degrees relative to planet velocity vector
  const [periapsisFactor, setPeriapsisFactor] = useState(1.0); // Multiplier on minimum safe altitude
  const [isPlaying, setIsPlaying] = useState(true);
  const [simTime, setSimTime] = useState(0);

  // Compute Keplerian hyperbolic deflection angle: delta = 2 * asin(1 / (1 + (r_p * v_inf^2) / mu))
  const rP = selectedPreset.periapsisKm * periapsisFactor;
  const vInf = selectedPreset.vInfinity;
  const mu = selectedPreset.muPlanet;
  const eccentricity = 1 + (rP * (vInf * vInf)) / mu;
  const deflectionAngleRad = 2 * Math.asin(1 / eccentricity);
  const deflectionAngleDeg = (deflectionAngleRad * 180) / Math.PI;

  // Heliocentric velocity transformation
  // Approach: v_in = v_planet + v_inf (vectorial)
  const angleRad = (approachAngleDeg * Math.PI) / 180;
  const vPlanet = selectedPreset.planetVelocity;

  // Initial heliocentric velocity vector
  const vInX = vPlanet + vInf * Math.cos(angleRad);
  const vInY = vInf * Math.sin(angleRad);
  const vInMag = Math.hypot(vInX, vInY);

  // Post-encounter heliocentric velocity vector
  const outAngleRad = angleRad + deflectionAngleRad;
  const vOutX = vPlanet + vInf * Math.cos(outAngleRad);
  const vOutY = vInf * Math.sin(outAngleRad);
  const vOutMag = Math.hypot(vOutX, vOutY);

  const deltaVGain = vOutMag - vInMag;

  // Animation Loop
  useEffect(() => {
    let animId: number;
    let t = simTime;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Planet Center Coordinate
      const centerX = w * 0.45;
      const centerY = h * 0.52;

      // Draw Planet
      const planetRadius = 24;
      const planetGrad = ctx.createRadialGradient(
        centerX - 6, centerY - 6, 4,
        centerX, centerY, planetRadius
      );
      if (selectedPreset.planetName === 'Jupiter') {
        planetGrad.addColorStop(0, '#fde68a');
        planetGrad.addColorStop(1, '#b45309');
      } else if (selectedPreset.planetName === 'Saturn') {
        planetGrad.addColorStop(0, '#fef08a');
        planetGrad.addColorStop(1, '#ca8a04');
      } else {
        planetGrad.addColorStop(0, '#fed7aa');
        planetGrad.addColorStop(1, '#c2410c');
      }

      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, planetRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Planet Motion Vector (Orbital Motion around Sun)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + 90, centerY);
      ctx.stroke();

      // Planet Vector Arrowhead
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(centerX + 96, centerY);
      ctx.lineTo(centerX + 86, centerY - 5);
      ctx.lineTo(centerX + 86, centerY + 5);
      ctx.fill();

      ctx.font = '10px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`v_planet = ${vPlanet.toFixed(1)} km/s`, centerX + 15, centerY - 10);

      // Sphere of Influence (SOI) circle
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Hyperbolic Flight Trajectory
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const scale = 0.55;
      const curvePts: { x: number; y: number }[] = [];

      for (let s = -2.6; s <= 2.6; s += 0.05) {
        // Hyperbolic coordinates in encounter frame
        const localX = (eccentricity - Math.cosh(s)) * (rP / (eccentricity - 1)) * scale * 0.00035;
        const localY = (Math.sqrt(eccentricity * eccentricity - 1) * Math.sinh(s)) * (rP / (eccentricity - 1)) * scale * 0.00035;

        // Rotate by encounter alignment angle
        const rotX = localX * Math.cos(angleRad + Math.PI) - localY * Math.sin(angleRad + Math.PI);
        const rotY = localX * Math.sin(angleRad + Math.PI) + localY * Math.cos(angleRad + Math.PI);

        const scrX = centerX + rotX;
        const scrY = centerY + rotY;
        curvePts.push({ x: scrX, y: scrY });

        if (s === -2.6) ctx.moveTo(scrX, scrY);
        else ctx.lineTo(scrX, scrY);
      }
      ctx.stroke();

      // Draw Animated Spacecraft
      if (curvePts.length > 0) {
        const loopIdx = Math.floor((t % 1) * (curvePts.length - 1));
        const currentPt = curvePts[loopIdx];
        if (currentPt) {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(currentPt.x, currentPt.y, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(currentPt.x, currentPt.y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Velocity Vector Diagram on top right
      const diagX = w - 160;
      const diagY = 70;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(diagX - 10, diagY - 30, 155, 120);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(diagX - 10, diagY - 30, 155, 120);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('VELOCITY VECTORS', diagX, diagY - 14);

      // Initial Vector
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(diagX + 20, diagY + 40);
      ctx.lineTo(diagX + 20 + vInX * 2.2, diagY + 40 - vInY * 2.2);
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`v_in: ${vInMag.toFixed(1)} km/s`, diagX, diagY + 60);

      // Final Vector
      ctx.strokeStyle = deltaVGain >= 0 ? '#10b981' : '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(diagX + 20, diagY + 40);
      ctx.lineTo(diagX + 20 + vOutX * 2.2, diagY + 40 - vOutY * 2.2);
      ctx.stroke();
      ctx.fillStyle = deltaVGain >= 0 ? '#10b981' : '#f43f5e';
      ctx.fillText(`v_out: ${vOutMag.toFixed(1)} km/s`, diagX, diagY + 75);

      if (isPlaying) {
        t += 0.007;
        setSimTime(t);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedPreset, approachAngleDeg, periapsisFactor, isPlaying, eccentricity, rP, angleRad, vInMag, vOutMag, vPlanet, vInf, deflectionAngleRad, deltaVGain, vInX, vInY, vOutX, vOutY]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-space-900 border border-aeroblue/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-aeroblue" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {language === 'km' ? 'ពិសោធន៍កម្លាំងទាញទំនាញជំនួយល្បឿន (GRAVITY ASSIST SLINGSHOT)' : 'GRAVITY ASSIST SLINGSHOT SIMULATOR'}
              </h2>
              <p className="text-[10px] text-space-400">
                {language === 'km' ? 'ការផ្លាស់ប្តូរសន្ទុះ និងល្បឿនយានអន្តរភពតាមសមីការ Keplerian Hyperbolic Flyby' : 'Keplerian Hyperbolic Flyby & Orbital Momentum Exchange'}
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
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-space-400 uppercase tracking-wider">
              {language === 'km' ? 'បេសកកម្មប្រវត្តិសាស្ត្រគំរូ:' : 'HISTORIC FLYBY MISSIONS:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {HISTORIC_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPreset(p);
                    setPeriapsisFactor(1.0);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPreset.id === p.id
                      ? 'bg-aeroblue/15 border-aeroblue text-white shadow-lg'
                      : 'bg-space-950/80 hover:bg-space-850 border-space-800 text-space-300'
                  }`}
                >
                  <div className="font-bold text-xs text-white">
                    {language === 'km' ? p.khmerName : p.name}
                  </div>
                  <div className="text-[10px] text-space-400 mt-1">
                    {language === 'km' ? p.khmerPlanetName : p.planetName} &bull; v_inf: {p.vInfinity} km/s
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Physics Canvas */}
          <div className="relative rounded-xl border border-space-800 bg-space-950 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={820}
              height={380}
              className="w-full h-auto block aspect-[820/380]"
            />
            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-space-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-space-800 text-[10px]">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 font-bold text-white hover:text-aeroblue transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-aeroamber" /> : <Play className="w-3.5 h-3.5 text-aerogreen" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
              <div className="w-px h-3 bg-space-700" />
              <button
                onClick={() => setSimTime(0)}
                className="flex items-center gap-1 text-space-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* Telemetry Metrics & Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Metric Box 1 */}
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'ល្បឿនមុន និងក្រោយហោះកាត់' : 'HELIOCENTRIC VELOCITY'}
              </span>
              <div className="text-base font-bold text-white">
                {vInMag.toFixed(2)} &rarr; {vOutMag.toFixed(2)} <span className="text-xs text-space-400">km/s</span>
              </div>
              <div className={`text-xs font-bold ${deltaVGain >= 0 ? 'text-aerogreen' : 'text-rose-400'}`}>
                {deltaVGain >= 0 ? '+' : ''}{deltaVGain.toFixed(2)} km/s ({deltaVGain >= 0 ? 'BOOST' : 'BRAKE'})
              </div>
            </div>

            {/* Metric Box 2 */}
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'មុំបង្វែរទិសដៅ (DEFLECTION ANGLE)' : 'DEFLECTION ANGLE'}
              </span>
              <div className="text-base font-bold text-aeroblue">
                &delta; = {deflectionAngleDeg.toFixed(1)}&deg;
              </div>
              <div className="text-[10px] text-space-400">
                Eccentricity (e): {eccentricity.toFixed(2)}
              </div>
            </div>

            {/* Metric Box 3 */}
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'ចម្ងាយជិតបំផុត PERIAPSIS' : 'PERIAPSIS ALTITUDE'}
              </span>
              <div className="text-base font-bold text-aeroamber">
                {Math.round(rP).toLocaleString()} <span className="text-xs text-space-400">km</span>
              </div>
              <div className="text-[10px] text-space-400">
                v_inf: {vInf} km/s | &mu;: {mu.toExponential(2)}
              </div>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="p-3.5 bg-space-950 rounded-xl border border-space-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                  <span>{language === 'km' ? 'មុំចូល Approach Angle:' : 'Approach Angle:'}</span>
                  <span className="text-aeroblue">{approachAngleDeg}&deg;</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={170}
                  step={1}
                  value={approachAngleDeg}
                  onChange={(e) => setApproachAngleDeg(Number(e.target.value))}
                  className="w-full accent-aeroblue cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                  <span>{language === 'km' ? 'កម្ពស់ហោះកាត់ Periapsis Factor:' : 'Periapsis Factor:'}</span>
                  <span className="text-aeroamber">{periapsisFactor.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={3.0}
                  step={0.05}
                  value={periapsisFactor}
                  onChange={(e) => setPeriapsisFactor(Number(e.target.value))}
                  className="w-full accent-aeroamber cursor-pointer"
                />
              </div>
            </div>

            {/* Historic Context Note */}
            <div className="p-2.5 bg-space-900/80 rounded-lg border border-space-800 text-[11px] text-space-300 leading-relaxed">
              <span className="font-bold text-white block mb-0.5">
                {language === 'km' ? 'ព័ត៌មានវិទ្យាសាស្ត្រប្រវត្តិសាស្ត្រ:' : 'HISTORIC CONTEXT:'}
              </span>
              {language === 'km' ? selectedPreset.khmerHistoricContext : selectedPreset.historicContext}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
