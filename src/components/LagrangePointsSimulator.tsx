'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Orbit, Play, Pause, RotateCcw, Target, ShieldCheck, AlertTriangle } from 'lucide-react';

interface LagrangePointsSimulatorProps {
  onClose: () => void;
  language?: 'km' | 'en';
}

interface LagrangePointData {
  id: string;
  name: string;
  khmerName: string;
  xNorm: number; // Normalized coordinate relative to distance d
  yNorm: number;
  stability: 'UNSTABLE SADDLE' | 'STABLE CORIOLIS HILL';
  khmerStability: string;
  annualDeltaVMs: number;
  activeMissions: string;
  khmerMissions: string;
  physicsSummary: string;
  khmerPhysicsSummary: string;
}

const LAGRANGE_POINTS: LagrangePointData[] = [
  {
    id: 'L1',
    name: 'Lagrange Point L1',
    khmerName: 'ចំណុចតុល្យភាពទំនាញ L1',
    xNorm: 0.85,
    yNorm: 0.0,
    stability: 'UNSTABLE SADDLE',
    khmerStability: 'ចំណុចកែបសេះអស្ថិរភាព (ត្រូវការកែតម្រូវគន្លង)',
    annualDeltaVMs: 2.5,
    activeMissions: 'SOHO, DSCOVR, ACE, Wind',
    khmerMissions: 'កែវយឹត SOHO, យាន DSCOVR, យាន ACE',
    physicsSummary: 'Located 1.5M km sunward from Earth where gravitational forces cancel orbital centrifugal acceleration. Ideal for uninterrupted solar observation.',
    khmerPhysicsSummary: 'ស្ថិតនៅចម្ងាយ 1.5 លានគមពីផែនដីឆ្ពោះទៅព្រះអាទិត្យ ជាចំណុចល្អបំផុតសម្រាប់អង្កេតផ្ទៃព្រះអាទិត្យ និងខ្យល់ព្រះអាទិត្យ 24 ម៉ោងជាប់គ្នា។',
  },
  {
    id: 'L2',
    name: 'Lagrange Point L2',
    khmerName: 'ចំណុចតុល្យភាពទំនាញ L2',
    xNorm: 1.15,
    yNorm: 0.0,
    stability: 'UNSTABLE SADDLE',
    khmerStability: 'ចំណុចកែបសេះអស្ថិរភាព (ត្រូវការកែតម្រូវគន្លង)',
    annualDeltaVMs: 3.2,
    activeMissions: 'JWST, Euclid, Gaia, Roman Space Telescope',
    khmerMissions: 'កែវយឹត JWST, Euclid, Gaia, Roman',
    physicsSummary: 'Located 1.5M km directly behind Earth away from the Sun. Earth shields the observatory from solar thermal radiation, maintaining cryogenic 40 Kelvin.',
    khmerPhysicsSummary: 'ស្ថិតនៅចម្ងាយ 1.5 លានគមខាងក្រោយផែនដី។ ផែនដីជួយបាំងកម្តៅព្រះអាទិត្យ អនុញ្ញាតឱ្យកែវយឹតរក្សាសីតុណ្ហភាពត្រជាក់ខ្លាំង -233°C។',
  },
  {
    id: 'L3',
    name: 'Lagrange Point L3',
    khmerName: 'ចំណុចតុល្យភាពទំនាញ L3',
    xNorm: -1.02,
    yNorm: 0.0,
    stability: 'UNSTABLE SADDLE',
    khmerStability: 'ចំណុចអស្ថិរភាព (លាក់ក្រោយព្រះអាទិត្យ)',
    annualDeltaVMs: 4.8,
    activeMissions: 'None (Historically hypothesized Counter-Earth)',
    khmerMissions: 'គ្មាន (លាក់នៅត្រើយម្ខាងទៀតនៃព្រះអាទិត្យ)',
    physicsSummary: 'Located behind the Sun opposite Earth. Gravitationally unstable and permanently hidden from direct terrestrial radio line of sight.',
    khmerPhysicsSummary: 'លាក់ខ្លួននៅខាងក្រោយព្រះអាទិត្យត្រង់ទល់មុខផែនដី មិនមានខ្សែទាក់ទងរលកវិទ្យុផ្ទាល់ជាមួយផែនដីឡើយ។',
  },
  {
    id: 'L4',
    name: 'Lagrange Point L4 (Leading Trojan)',
    khmerName: 'ចំណុចតុល្យភាពទំនាញ L4 (Trojan ខាងមុខ)',
    xNorm: 0.5,
    yNorm: 0.866,
    stability: 'STABLE CORIOLIS HILL',
    khmerStability: 'មានស្ថិរភាពខ្ពស់ដោយសារកម្លាំង Coriolis',
    annualDeltaVMs: 0.0,
    activeMissions: 'Lucy (Trojan asteroid tour), Asteroid 2010 TK7',
    khmerMissions: 'យាន Lucy (រុករកអាចម៍ផ្កាយ Trojan)',
    physicsSummary: 'Forms an equilateral triangle leading 60 degrees ahead of Earth. Coriolis acceleration dynamically traps Trojan asteroids and dust without propulsion.',
    khmerPhysicsSummary: 'បង្កើតជាត្រីកោណសម័ង្សនាំមុខផែនដី 60 ដឺក្រេ។ កម្លាំងកូរីយ៉ូលីស (Coriolis) ជួយរក្សាស្ថិរភាពអាចម៍ផ្កាយរាប់ពាន់ដោយមិនបាច់ប្រើឥន្ធនៈ។',
  },
  {
    id: 'L5',
    name: 'Lagrange Point L5 (Trailing Trojan)',
    khmerName: 'ចំណុចតុល្យភាពទំនាញ L5 (Trojan ខាងក្រោយ)',
    xNorm: 0.5,
    yNorm: -0.866,
    stability: 'STABLE CORIOLIS HILL',
    khmerStability: 'មានស្ថិរភាពខ្ពស់ដោយសារកម្លាំង Coriolis',
    annualDeltaVMs: 0.0,
    activeMissions: 'Lucy target reserve, Asteroid 2020 XL5',
    khmerMissions: 'អាចម៍ផ្កាយ Trojan 2020 XL5',
    physicsSummary: 'Forms an equilateral triangle trailing 60 degrees behind Earth. Pristine primordial gravitational trap holding early solar system planetesimals.',
    khmerPhysicsSummary: 'បង្កើតជាត្រីកោណសម័ង្សដេញតាមក្រោយផែនដី 60 ដឺក្រេ ជាអន្ទាក់ទំនាញធម្មជាតិស្តុកទុកសំណល់អាចម៍ផ្កាយតាំងពីកកើតប្រព័ន្ធព្រះអាទិត្យ។',
  },
];

export default function LagrangePointsSimulator({ onClose, language = 'km' }: LagrangePointsSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedLPoint, setSelectedLPoint] = useState<LagrangePointData>(LAGRANGE_POINTS[1]); // L2 default
  const [systemMode, setSystemMode] = useState<'sun_earth' | 'earth_moon'>('sun_earth');
  const [testParticles, setTestParticles] = useState<{ x: number; y: number; vx: number; vy: number; trail: { x: number; y: number }[] }[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  // Initialize L2 Halo Orbit Particle
  const handleInjectL2Halo = () => {
    // Inject satellite into a periodic halo orbit around L2
    setTestParticles([
      {
        x: 1.15,
        y: 0.04,
        vx: 0.0,
        vy: -0.065,
        trail: [],
      },
    ]);
  };

  const handleClearParticles = () => {
    setTestParticles([]);
  };

  // Canvas Equipotential & Trajectory Renderer
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

      const centerX = w * 0.48;
      const centerY = h * 0.50;
      const scale = w * 0.28; // Distance between Primary and Secondary

      const mu = systemMode === 'sun_earth' ? 0.05 : 0.08; // Visually accentuated mass ratio for clear contours

      // 1. Draw Roche Equipotential Contour Lines
      // Potential: Omega(x, y) = 0.5*(x^2 + y^2) + (1-mu)/r1 + mu/r2
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      // Concentric potential approximations
      const primaryX = centerX - mu * scale;
      const primaryY = centerY;
      const secondaryX = centerX + (1 - mu) * scale;
      const secondaryY = centerY;

      // Draw Contour Ellipses
      for (let r = 20; r <= scale * 1.6; r += 22) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Gravitational Saddle connecting Primary & Secondary (Roche lobes)
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(primaryX, primaryY, scale * 0.75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(secondaryX, secondaryY, scale * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw Primary Body (Sun / Earth)
      const primaryRadius = systemMode === 'sun_earth' ? 18 : 12;
      ctx.fillStyle = systemMode === 'sun_earth' ? '#f59e0b' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(primaryX, primaryY, primaryRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = '10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(systemMode === 'sun_earth' ? 'Sun' : 'Earth', primaryX - 12, primaryY - primaryRadius - 4);

      // 3. Draw Secondary Body (Earth / Moon)
      const secRadius = systemMode === 'sun_earth' ? 9 : 6;
      ctx.fillStyle = systemMode === 'sun_earth' ? '#38bdf8' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(secondaryX, secondaryY, secRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillText(systemMode === 'sun_earth' ? 'Earth' : 'Moon', secondaryX - 14, secondaryY - secRadius - 4);

      // 4. Draw Lagrange Points (L1 to L5)
      LAGRANGE_POINTS.forEach((lp) => {
        const lpX = centerX + lp.xNorm * scale;
        const lpY = centerY - lp.yNorm * scale; // Inverted Y for standard screen coordinates
        const isSelected = selectedLPoint.id === lp.id;

        // Equilateral triangle connecting lines for L4 and L5
        if (lp.id === 'L4' || lp.id === 'L5') {
          ctx.strokeStyle = '#334155';
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(primaryX, primaryY);
          ctx.lineTo(lpX, lpY);
          ctx.lineTo(secondaryX, secondaryY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Lagrange Point Marker
        ctx.fillStyle = lp.stability.startsWith('STABLE') ? '#10b981' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(lpX, lpY, isSelected ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(lpX, lpY, 11, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.fillText(lp.id, lpX + 8, lpY - 6);
      });

      // 5. Simulate & Draw Test Satellite Particles
      if (isPlaying && testParticles.length > 0) {
        setTestParticles((prev) =>
          prev.map((p) => {
            // Rotating frame equations of motion:
            // x'' - 2*y' = dOmega/dx
            // y'' + 2*x' = dOmega/dy
            const r1 = Math.hypot(p.x + mu, p.y);
            const r2 = Math.hypot(p.x - (1 - mu), p.y);

            const ax = p.x - ((1 - mu) * (p.x + mu)) / Math.pow(r1, 3) - (mu * (p.x - (1 - mu))) / Math.pow(r2, 3) + 2 * p.vy;
            const ay = p.y - ((1 - mu) * p.y) / Math.pow(r1, 3) - (mu * p.y) / Math.pow(r2, 3) - 2 * p.vx;

            const dt = 0.04;
            const nextVx = p.vx + ax * dt;
            const nextVy = p.vy + ay * dt;
            const nextX = p.x + nextVx * dt;
            const nextY = p.y + nextVy * dt;

            const nextTrail = [...p.trail.slice(-60), { x: nextX, y: nextY }];
            return { x: nextX, y: nextY, vx: nextVx, vy: nextVy, trail: nextTrail };
          })
        );
      }

      // Draw Satellite Trajectories
      testParticles.forEach((p) => {
        if (p.trail.length > 1) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          p.trail.forEach((tPt, idx) => {
            const scX = centerX + tPt.x * scale;
            const scY = centerY - tPt.y * scale;
            if (idx === 0) ctx.moveTo(scX, scY);
            else ctx.lineTo(scX, scY);
          });
          ctx.stroke();
        }

        const satX = centerX + p.x * scale;
        const satY = centerY - p.y * scale;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(satX, satY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedLPoint, systemMode, testParticles, isPlaying]);

  // Click on Canvas to Release Test Satellite Particle
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const centerX = canvas.width * 0.48;
    const centerY = canvas.height * 0.50;
    const scale = canvas.width * 0.28;

    const normX = (clickX - centerX) / scale;
    const normY = -(clickY - centerY) / scale;

    // Check if clicked close to an existing Lagrange Point
    const hitL = LAGRANGE_POINTS.find(
      (lp) => Math.hypot(lp.xNorm - normX, lp.yNorm - normY) < 0.18
    );
    if (hitL) {
      setSelectedLPoint(hitL);
      return;
    }

    // Release particle with small initial tangential drift
    setTestParticles([
      {
        x: normX,
        y: normY,
        vx: -normY * 0.05,
        vy: normX * 0.05,
        trail: [],
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-space-900 border border-aeroblue/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Orbit className="w-5 h-5 text-aeroblue" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {language === 'km' ? 'ផែនទីចំណុចតុល្យភាពទំនាញ LAGRANGE POINTS L1 - L5' : 'LAGRANGE POINTS & GRAVITATIONAL POTENTIAL WELL'}
              </h2>
              <p className="text-[10px] text-space-400">
                {language === 'km' ? 'ចំណុចតុល្យភាពកម្លាំងទំនាញ និងកម្លាំងកណ្តាលវាង ព្រះអាទិត្យ-ផែនដី សម្រាប់គន្លង JWST' : 'Restricted Three-Body Problem (CR3BP) & Rotating Roche Potential'}
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
          {/* System Selection & Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-space-950 rounded-xl border border-space-800">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-space-400 uppercase">
                {language === 'km' ? 'ប្រព័ន្ធទំនាញ:' : 'TWO-BODY SYSTEM:'}
              </span>
              <button
                onClick={() => setSystemMode('sun_earth')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  systemMode === 'sun_earth'
                    ? 'bg-aeroblue text-space-950'
                    : 'bg-space-900 text-space-400 hover:text-white'
                }`}
              >
                {language === 'km' ? 'ព្រះអាទិត្យ - ផែនដី (JWST / SOHO)' : 'Sun - Earth (JWST)'}
              </button>
              <button
                onClick={() => setSystemMode('earth_moon')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  systemMode === 'earth_moon'
                    ? 'bg-aeroblue text-space-950'
                    : 'bg-space-900 text-space-400 hover:text-white'
                }`}
              >
                {language === 'km' ? 'ផែនដី - ព្រះច័ន្ទ (Gateway NRHO)' : 'Earth - Moon'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInjectL2Halo}
                className="px-3 py-1.5 rounded-lg bg-aerogreen/20 hover:bg-aerogreen text-aerogreen hover:text-space-950 font-bold text-xs border border-aerogreen/40 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Simulate James Webb L2 Halo Orbit"
              >
                <Target className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'គន្លង HALO នៅ L2 (JWST)' : 'INJECT L2 HALO ORBIT'}</span>
              </button>
              <button
                onClick={handleClearParticles}
                className="p-1.5 rounded-lg bg-space-900 hover:bg-space-850 text-space-400 hover:text-white border border-space-800 transition-colors cursor-pointer"
                title="Clear Particles"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Gravitational Potential Canvas */}
          <div className="relative rounded-xl border border-space-800 bg-space-950 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={820}
              height={380}
              onClick={handleCanvasClick}
              className="w-full h-auto block aspect-[820/380] cursor-crosshair"
            />
            <div className="absolute top-2 left-2 bg-space-900/90 backdrop-blur px-3 py-1 rounded-lg border border-space-800 text-[10px] text-space-300">
              {language === 'km' ? 'ចុចលើចំណុច L1-L5 ឬចុចលើលំហដើម្បីលែងផ្កាយរណបសាកល្បង' : 'Click L1-L5 to inspect, or click anywhere to release a test satellite'}
            </div>
          </div>

          {/* Lagrange Points Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {LAGRANGE_POINTS.map((lp) => (
              <button
                key={lp.id}
                onClick={() => setSelectedLPoint(lp)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedLPoint.id === lp.id
                    ? 'bg-aeroblue/15 border-aeroblue text-white shadow-lg'
                    : 'bg-space-950/80 hover:bg-space-850 border-space-800 text-space-300'
                }`}
              >
                <div className="font-bold text-xs text-white flex items-center justify-between">
                  <span>{lp.id}</span>
                  <span className={`w-2 h-2 rounded-full ${lp.stability.startsWith('STABLE') ? 'bg-aerogreen' : 'bg-rose-500'}`} />
                </div>
                <div className="text-[10px] text-space-400 mt-1 truncate">
                  {language === 'km' ? lp.khmerName.split(' ')[1] : lp.name.split(' (')[0]}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Point Telemetry Details */}
          <div className="p-4 bg-space-950 rounded-xl border border-space-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-space-800">
              <div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  selectedLPoint.stability.startsWith('STABLE')
                    ? 'bg-aerogreen/20 text-aerogreen border border-aerogreen/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {language === 'km' ? selectedLPoint.khmerStability : selectedLPoint.stability}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {language === 'km' ? selectedLPoint.khmerName : selectedLPoint.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-space-400 block uppercase font-bold">
                  {language === 'km' ? 'ថវិកាល្បឿនរក្សាគន្លងប្រចាំឆ្នាំ' : 'ANNUAL STATION-KEEPING BUDGET'}
                </span>
                <span className="text-base font-bold text-aeroblue">
                  {selectedLPoint.annualDeltaVMs > 0 ? `~${selectedLPoint.annualDeltaVMs} m/s / year` : '0 m/s (Coriolis Passive)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-800 space-y-1">
                <span className="text-space-400 block font-bold uppercase text-[10px]">
                  {language === 'km' ? 'យានអវកាស និងបេសកកម្មសំខាន់ៗ:' : 'ACTIVE & HISTORIC MISSIONS:'}
                </span>
                <p className="text-white font-bold">
                  {language === 'km' ? selectedLPoint.khmerMissions : selectedLPoint.activeMissions}
                </p>
              </div>

              <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-800 space-y-1">
                <span className="text-space-400 block font-bold uppercase text-[10px]">
                  {language === 'km' ? 'គោលការណ៍រូបវិទ្យាគន្លង:' : 'ORBITAL MECHANICS SUMMARY:'}
                </span>
                <p className="text-space-200 leading-relaxed">
                  {language === 'km' ? selectedLPoint.khmerPhysicsSummary : selectedLPoint.physicsSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
