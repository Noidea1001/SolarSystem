'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, Play, Pause, RotateCcw, ShieldAlert, Sparkles, Flame } from 'lucide-react';

interface BlackHoleLensingSimulatorProps {
  onClose: () => void;
  language?: 'km' | 'en';
}

interface BlackHoleModel {
  id: string;
  name: string;
  khmerName: string;
  massSolar: number; // M_sun
  schwarzschildRadiusKm: number;
  distanceLy: number;
  location: string;
  khmerLocation: string;
  spinParameter: number; // a* (0 to 0.998)
  description: string;
  khmerDescription: string;
}

const BLACK_HOLE_MODELS: BlackHoleModel[] = [
  {
    id: 'sgr-a',
    name: 'Sagittarius A* (Milky Way Core)',
    khmerName: 'ប្រហោងខ្មៅ Sagittarius A* (កណ្តាលមីលគីវេ)',
    massSolar: 4297000,
    schwarzschildRadiusKm: 12700000, // ~12.7 million km (~0.085 AU)
    distanceLy: 26673,
    location: 'Galactic Center, Sagittarius',
    khmerLocation: 'ចំណុចកណ្តាលនៃកាឡាក់ស៊ី Milky Way',
    spinParameter: 0.85,
    description: 'Supermassive black hole at the center of the Milky Way, imaged in polarized millimeter light by the Event Horizon Telescope (EHT).',
    khmerDescription: 'ប្រហោងខ្មៅយក្សដ៏ធំសម្បើមនៅកណ្តាលកាឡាក់ស៊ីយើង ដែលត្រូវបានផ្តិតយករូបភាពដោយបណ្តាញកែវយឹត Event Horizon Telescope (EHT)។',
  },
  {
    id: 'm87',
    name: 'M87* (Messier 87 Core)',
    khmerName: 'ប្រហោងខ្មៅ M87* (កាឡាក់ស៊ី Messier 87)',
    massSolar: 6500000000,
    schwarzschildRadiusKm: 19200000000, // ~128 AU
    distanceLy: 53500000,
    location: 'Virgo A Giant Elliptical Galaxy',
    khmerLocation: 'កណ្តាលកាឡាក់ស៊ីពងក្រពើយក្ស Messier 87',
    spinParameter: 0.90,
    description: 'First black hole directly imaged by humanity in 2019, launching a 5,000-light-year relativistic plasma jet.',
    khmerDescription: 'ប្រហោងខ្មៅដំបូងបង្អស់ក្នុងប្រវត្តិសាស្ត្រដែលមនុស្សជាតិអាចផ្តិតយករូបភាពបានក្នុងឆ្នាំ 2019 ដែលបាញ់កាំផ្លាស្មាប្រវែង 5,000 ឆ្នាំពន្លឺ។',
  },
  {
    id: 'cygnus-x1',
    name: 'Cygnus X-1 (Stellar-Mass)',
    khmerName: 'ប្រហោងខ្មៅ Cygnus X-1 (ម៉ាសផ្កាយ)',
    massSolar: 21.2,
    schwarzschildRadiusKm: 62.6,
    distanceLy: 7200,
    location: 'Constellation Cygnus (The Swan)',
    khmerLocation: 'តារានិករក្ងាន Cygnus',
    spinParameter: 0.96,
    description: 'Stellar-mass black hole accreting matter from a blue supergiant companion star, radiating high-energy X-rays.',
    khmerDescription: 'ប្រហោងខ្មៅកម្រិតម៉ាសផ្កាយ ដែលកំពុងបឺតស្រូបឧស្ម័នពីផ្កាយយក្សខៀវក្បែរខាង និងបញ្ចេញកាំរស្មីអ៊ិច (X-rays) យ៉ាងខ្លាំង។',
  },
];

export default function BlackHoleLensingSimulator({ onClose, language = 'km' }: BlackHoleLensingSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedModel, setSelectedModel] = useState<BlackHoleModel>(BLACK_HOLE_MODELS[0]);
  const [diskInclinationDeg, setDiskInclinationDeg] = useState(75); // Viewing angle (0 top down, 90 edge on)
  const [accretionTempK, setAccretionTempK] = useState(8500);
  const [spinBoost, setSpinBoost] = useState(selectedModel.spinParameter);
  const [isPlaying, setIsPlaying] = useState(true);
  const [diskRotation, setDiskRotation] = useState(0);

  // Relativistic Horizons:
  // r_s = 2 * G * M / c^2
  // r_ph = 1.5 * r_s (Photon Sphere)
  // r_isco = 3.0 * r_s * (1 - spin * 0.6) (Innermost Stable Circular Orbit)
  const rs = selectedModel.schwarzschildRadiusKm;
  const rPhotonSphereKm = rs * 1.5;
  const rIscoKm = rs * (3.0 - spinBoost * 2.0);

  // Animation Loop: Relativistic Black Hole Ray Traced Lensing Canvas
  useEffect(() => {
    let animId: number;
    let rot = diskRotation;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Draw Starfield Background with Relativistic Lensing Distortion
      const centerX = w * 0.5;
      const centerY = h * 0.5;
      const rsPixels = 42; // Visual scale of Event Horizon
      const rPhotonPixels = rsPixels * 1.5;

      // Dark Space Backdrop
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Starfield dots distorted around Einstein Ring
      ctx.fillStyle = '#94a3b8';
      for (let sx = 20; sx < w; sx += 45) {
        for (let sy = 20; sy < h; sy += 45) {
          const dx = sx - centerX;
          const dy = sy - centerY;
          const dist = Math.hypot(dx, dy);

          if (dist > rsPixels * 0.8) {
            // Gravitational deflection: deflection angle proportional to 4*G*M / (c^2 * b)
            const bendFactor = (rsPixels * rsPixels * 1.8) / (dist * dist);
            const drawX = sx + (dx / dist) * bendFactor * 14;
            const drawY = sy + (dy / dist) * bendFactor * 14;
            ctx.beginPath();
            ctx.arc(drawX, drawY, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 2. Draw Top Gravitational Lensed Back of Accretion Disk (Einstein Light Arc)
      // Light from the far side of the accretion disk is bent over the top of the black hole
      const inclRad = (diskInclinationDeg * Math.PI) / 180;
      const diskYScale = Math.sin(Math.max(0.15, Math.PI / 2 - inclRad));

      ctx.save();
      ctx.translate(centerX, centerY);

      // Upper Lensed Secondary Arc
      const upperArcGrad = ctx.createLinearGradient(-120, 0, 120, 0);
      upperArcGrad.addColorStop(0, '#38bdf8'); // Blue-shifted approaching side
      upperArcGrad.addColorStop(0.5, '#f59e0b');
      upperArcGrad.addColorStop(1, '#dc2626'); // Red-shifted receding side

      ctx.strokeStyle = upperArcGrad;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(0, -rsPixels * 0.95, rsPixels * 2.6, rsPixels * 1.4, 0, Math.PI, 2 * Math.PI);
      ctx.stroke();

      // Lower Lensed Mirror Arc
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(0, rsPixels * 0.85, rsPixels * 2.2, rsPixels * 0.9, 0, 0, Math.PI);
      ctx.stroke();

      // 3. Draw Relativistic Accretion Disk (Front Plane)
      // Approaching side (left) is brighter due to Doppler boosting
      const diskOuterRadius = rsPixels * 3.4;
      const diskInnerRadius = rsPixels * 1.8;

      for (let r = diskInnerRadius; r <= diskOuterRadius; r += 3) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * diskYScale, 0, 0, Math.PI * 2);

        // Relativistic Doppler Beaming intensity gradient across azimuth
        const diskGrad = ctx.createLinearGradient(-r, 0, r, 0);
        diskGrad.addColorStop(0, '#67e8f9'); // Strongly boosted & blue-shifted
        diskGrad.addColorStop(0.35, '#f59e0b'); // Hot ionized gas
        diskGrad.addColorStop(0.8, '#b91c1c'); // Dimmed red-shifted receding side
        diskGrad.addColorStop(1, '#450a0a');

        ctx.strokeStyle = diskGrad;
        ctx.lineWidth = 3.5;
        ctx.stroke();
      }

      // 4. Draw Black Hole Shadow (Photon Sphere boundary: 1.5 * r_s)
      const shadowGrad = ctx.createRadialGradient(0, 0, rsPixels * 0.8, 0, 0, rPhotonPixels);
      shadowGrad.addColorStop(0, '#000000');
      shadowGrad.addColorStop(0.85, '#000000');
      shadowGrad.addColorStop(1, 'rgba(254, 240, 138, 0.45)'); // Glowing photon ring boundary

      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, rPhotonPixels, 0, Math.PI * 2);
      ctx.fill();

      // Pure Event Horizon Core (Nothing escapes)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, rsPixels, 0, Math.PI * 2);
      ctx.fill();

      // 5. Draw Glowing Photon Ring (Infinitely wrapped photons)
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, rPhotonPixels, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      if (isPlaying) {
        rot += 0.01;
        setDiskRotation(rot);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedModel, diskInclinationDeg, accretionTempK, spinBoost, isPlaying]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-space-900 border border-aeroblue/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-aeroblue" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {language === 'km' ? 'ពិសោធន៍កោងនៃលំហអាកាស និងប្រហោងខ្មៅ (BLACK HOLE GRAVITATIONAL LENSING)' : 'SUPERMASSIVE BLACK HOLE GRAVITATIONAL LENSING'}
              </h2>
              <p className="text-[10px] text-space-400">
                {language === 'km' ? 'ទ្រឹស្តីទូទៅនៃរ៉ឺឡាទីវីតេ (Einstein General Relativity), Event Horizon, និង Photon Sphere' : 'General Relativistic Light Bending, Accretion Disk Beaming & ISCO'}
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
          {/* Target Black Holes Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-space-400 uppercase tracking-wider">
              {language === 'km' ? 'ប្រហោងខ្មៅល្បីៗក្នុងចក្រវាល (TARGET BLACK HOLES):' : 'TARGET BLACK HOLES:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {BLACK_HOLE_MODELS.map((bh) => (
                <button
                  key={bh.id}
                  onClick={() => {
                    setSelectedModel(bh);
                    setSpinBoost(bh.spinParameter);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedModel.id === bh.id
                      ? 'bg-aeroblue/15 border-aeroblue text-white shadow-lg'
                      : 'bg-space-950/80 hover:bg-space-850 border-space-800 text-space-300'
                  }`}
                >
                  <div className="font-bold text-xs text-white">
                    {language === 'km' ? bh.khmerName : bh.name}
                  </div>
                  <div className="text-[10px] text-space-400 mt-1">
                    {bh.massSolar.toLocaleString()} M_sun &bull; {bh.distanceLy.toLocaleString()} ly
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Ray Tracing Canvas */}
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
                onClick={() => {
                  setDiskInclinationDeg(75);
                  setSpinBoost(selectedModel.spinParameter);
                }}
                className="flex items-center gap-1 text-space-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET</span>
              </button>
            </div>
            <div className="absolute top-2 right-2 bg-space-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-space-800 text-[10px] text-aeroamber">
              {language === 'km' ? 'ពន្លឺផ្លាត Doppler Beaming: ផ្នែកខាងឆ្វេងហោះមករកយើង (ភ្លឺជាង)' : 'Doppler Beaming: Left side moves toward observer (blue-shifted)'}
            </div>
          </div>

          {/* 3 Relativistic Metric Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'កាំព្រំដែន EVENT HORIZON (R_S)' : 'EVENT HORIZON RADIUS (r_s)'}
              </span>
              <div className="text-xl font-bold text-aeroblue">
                {Math.round(rs).toLocaleString()} <span className="text-xs text-space-400">km</span>
              </div>
              <div className="text-[10px] text-space-400">
                r_s = 2GM / c^2 (Schwarzschild metric)
              </div>
            </div>

            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'កាំរង្វង់ពន្លឺ PHOTON SPHERE' : 'PHOTON SPHERE RADIUS'}
              </span>
              <div className="text-xl font-bold text-aeroamber">
                {Math.round(rPhotonSphereKm).toLocaleString()} <span className="text-xs text-space-400">km</span>
              </div>
              <div className="text-[10px] text-space-400">
                r_ph = 1.5 r_s (Photons in circular orbit)
              </div>
            </div>

            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'គន្លងស្ថិរភាពចុងក្រោយ ISCO' : 'INNERMOST STABLE ORBIT (ISCO)'}
              </span>
              <div className="text-xl font-bold text-aerogreen">
                {Math.round(rIscoKm).toLocaleString()} <span className="text-xs text-space-400">km</span>
              </div>
              <div className="text-[10px] text-space-400">
                Spin (a*): {spinBoost.toFixed(2)} &bull; r_isco = {(rIscoKm / rs).toFixed(2)} r_s
              </div>
            </div>
          </div>

          {/* Sliders for Viewing Angle & Spin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-space-950 rounded-xl border border-space-800">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                <span>{language === 'km' ? 'មុំទិដ្ឋភាព Accretion Disk Inclination:' : 'Accretion Disk Inclination:'}</span>
                <span className="text-aeroblue">{diskInclinationDeg}&deg;</span>
              </div>
              <input
                type="range"
                min={0}
                max={88}
                step={1}
                value={diskInclinationDeg}
                onChange={(e) => setDiskInclinationDeg(Number(e.target.value))}
                className="w-full accent-aeroblue cursor-pointer"
              />
              <div className="text-[10px] text-space-400">
                0&deg; = Face-on &bull; 85&deg; = Edge-on (Gargantua view)
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                <span>{language === 'km' ? 'កម្រិតវិលជុំ Spin Parameter (a*):' : 'Dimensionless Spin (a*):'}</span>
                <span className="text-aeroamber">{spinBoost.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={0.99}
                step={0.01}
                value={spinBoost}
                onChange={(e) => setSpinBoost(Number(e.target.value))}
                className="w-full accent-aeroamber cursor-pointer"
              />
              <div className="text-[10px] text-space-400">
                Higher spin pulls the ISCO disk closer to the event horizon
              </div>
            </div>
          </div>

          {/* Scientific Description */}
          <div className="p-3 bg-space-900/80 rounded-xl border border-space-800 text-[11px] text-space-300 leading-relaxed">
            <span className="font-bold text-white block mb-0.5">
              {language === 'km' ? 'ព័ត៌មានវិទ្យាសាស្ត្រប្រហោងខ្មៅ:' : 'GENERAL RELATIVITY CONTEXT:'}
            </span>
            {language === 'km' ? selectedModel.khmerDescription : selectedModel.description}
          </div>
        </div>
      </div>
    </div>
  );
}
