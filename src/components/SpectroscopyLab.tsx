'use client';

import React, { useState } from 'react';
import { X, Sparkles, Activity, Dna, Info, RotateCcw } from 'lucide-react';

interface SpectroscopyLabProps {
  onClose: () => void;
  language?: 'km' | 'en';
}

interface ExoplanetAtmosphere {
  id: string;
  name: string;
  khmerName: string;
  type: string;
  khmerType: string;
  tempK: number;
  scaleHeightKm: number;
  hostStar: string;
  distanceLy: number;
  h2oPct: number;
  co2Pct: number;
  ch4Pct: number;
  coPct: number;
  dmsCandidate: boolean;
  notes: string;
  khmerNotes: string;
}

const ATMOSPHERE_TARGETS: ExoplanetAtmosphere[] = [
  {
    id: 'wasp-96b',
    name: 'WASP-96b (Hot Gas Giant)',
    khmerName: 'ភព WASP-96b (ភពឧស្ម័នយក្សក្តៅ)',
    type: 'Hot Saturn-mass Gas Giant',
    khmerType: 'ភពឧស្ម័នយក្សកម្រិតសីតុណ្ហភាពខ្ពស់',
    tempK: 1285,
    scaleHeightKm: 680,
    hostStar: 'WASP-96 (G8V Star)',
    distanceLy: 1150,
    h2oPct: 1.4,
    co2Pct: 0.2,
    ch4Pct: 0.05,
    coPct: 0.8,
    dmsCandidate: false,
    notes: 'JWST NIRISS transit transmission spectrum revealed clear vibrational water vapor absorption bands and atmospheric haze signatures.',
    khmerNotes: 'កែវយឹត JWST បានរកឃើញបន្ទះស្រូបទាញចំហាយទឹកយ៉ាងច្បាស់ និងអ័ព្ទក្នុងបរិយាកាសតាមរយៈឧបករណ៍ NIRISS។',
  },
  {
    id: 'k2-18b',
    name: 'K2-18b (Hycean Candidate)',
    khmerName: 'ភព K2-18b (បេក្ខភាពភពសមុទ្រ Hycean)',
    type: 'Sub-Neptune / Hycean World',
    khmerType: 'ភព Sub-Neptune / មហាសមុទ្រសក្តានុពល',
    tempK: 255,
    scaleHeightKm: 420,
    hostStar: 'K2-18 (M2.5V Red Dwarf)',
    distanceLy: 124,
    h2oPct: 0.8,
    co2Pct: 1.5,
    ch4Pct: 1.2,
    coPct: 0.1,
    dmsCandidate: true,
    notes: 'JWST NIRSpec and MIRI observations detected carbon dioxide, methane, and tentative trace features of dimethyl sulfide (DMS).',
    khmerNotes: 'JWST បានរកឃើញឧស្ម័នកាបូនិក មេតាន និងដានបឋមនៃម៉ូលេគុល Dimethyl Sulfide (DMS) ដែលអាចជាសញ្ញាជីវសាស្រ្ត។',
  },
  {
    id: 'trappist-1e',
    name: 'TRAPPIST-1e (Temperate Terrestrial)',
    khmerName: 'ភព TRAPPIST-1e (ភពថ្មរឹងតំបន់រស់នៅ)',
    type: 'Rocky Earth-Sized Habitable',
    khmerType: 'ភពថ្មរឹងទំហំប៉ុនផែនដីក្នុងតំបន់រស់នៅ',
    tempK: 246,
    scaleHeightKm: 18,
    hostStar: 'TRAPPIST-1 (M8V Ultra-cool)',
    distanceLy: 39.5,
    h2oPct: 0.3,
    co2Pct: 0.4,
    ch4Pct: 0.1,
    coPct: 0.02,
    dmsCandidate: false,
    notes: 'Primary candidate for compact terrestrial atmosphere search with high mean molecular weight and greenhouse potential.',
    khmerNotes: 'គោលដៅចម្បងក្នុងការរុករកបរិយាកាសស្តើងនៃភពថ្មរឹង ដែលមានម៉ាស់ម៉ូលេគុលក្រាស់ និងសក្តានុពលរក្សាទឹកសាបរាវ។',
  },
  {
    id: 'hd-209458b',
    name: 'HD 209458b (Osiris)',
    khmerName: 'ភព HD 209458b (Osiris)',
    type: 'Hot Jupiter Benchmarking World',
    khmerType: 'ភព Hot Jupiter កម្រិតស្តង់ដារ',
    tempK: 1450,
    scaleHeightKm: 850,
    hostStar: 'HD 209458 (G0V Star)',
    distanceLy: 159,
    h2oPct: 2.1,
    co2Pct: 0.5,
    ch4Pct: 0.01,
    coPct: 1.2,
    dmsCandidate: false,
    notes: 'Historically the first exoplanet where an evaporating hydrodynamic upper atmosphere was spectroscopically detected.',
    khmerNotes: 'ភពដំបូងបង្អស់ក្នុងប្រវត្តិសាស្ត្រដែលត្រូវបានរកឃើញបរិយាកាសកំពុងហួតចេញតាមរយៈបច្ចេកទេស Spectroscopy។',
  },
];

export default function SpectroscopyLab({ onClose, language = 'km' }: SpectroscopyLabProps) {
  const [selectedTarget, setSelectedTarget] = useState<ExoplanetAtmosphere>(ATMOSPHERE_TARGETS[0]);
  const [h2oVal, setH2oVal] = useState(ATMOSPHERE_TARGETS[0].h2oPct);
  const [co2Val, setCo2Val] = useState(ATMOSPHERE_TARGETS[0].co2Pct);
  const [ch4Val, setCh4Val] = useState(ATMOSPHERE_TARGETS[0].ch4Pct);
  const [dmsToggle, setDmsToggle] = useState(ATMOSPHERE_TARGETS[0].dmsCandidate);

  const handleSelectTarget = (target: ExoplanetAtmosphere) => {
    setSelectedTarget(target);
    setH2oVal(target.h2oPct);
    setCo2Val(target.co2Pct);
    setCh4Val(target.ch4Pct);
    setDmsToggle(target.dmsCandidate);
  };

  // Synthetic Transit Absorption Spectrum Generator
  // Wavelengths from 0.8 to 5.0 microns (JWST NIRSpec / NIRISS coverage)
  const wavelengthSteps = 120;
  const spectrumPoints: { wl: number; transitDepthPpm: number; isFeature: boolean; label?: string }[] = [];

  const baseDepth = 12000; // ~1.2% base transit depth
  const scaleKm = selectedTarget.scaleHeightKm;

  for (let i = 0; i < wavelengthSteps; i++) {
    const wl = 0.8 + (i / (wavelengthSteps - 1)) * 4.2; // 0.8 to 5.0 um

    // Molecular Absorption Cross-Section Peaks
    // H2O has dominant absorption bands at 1.15 um, 1.4 um, 1.9 um, and 2.7 um
    const h2oPeak1 = Math.exp(-Math.pow((wl - 1.4) / 0.12, 2)) * 320 * h2oVal;
    const h2oPeak2 = Math.exp(-Math.pow((wl - 1.9) / 0.15, 2)) * 450 * h2oVal;
    const h2oPeak3 = Math.exp(-Math.pow((wl - 2.7) / 0.25, 2)) * 600 * h2oVal;

    // CO2 has sharp fundamental band at 4.3 um and overtone at 2.7 um
    const co2Peak1 = Math.exp(-Math.pow((wl - 4.3) / 0.12, 2)) * 1100 * co2Val;
    const co2Peak2 = Math.exp(-Math.pow((wl - 2.7) / 0.08, 2)) * 350 * co2Val;

    // CH4 has strong bands at 2.3 um and 3.3 um
    const ch4Peak1 = Math.exp(-Math.pow((wl - 2.3) / 0.15, 2)) * 420 * ch4Val;
    const ch4Peak2 = Math.exp(-Math.pow((wl - 3.3) / 0.18, 2)) * 750 * ch4Val;

    // DMS tentative absorption signature around 3.4 um
    const dmsPeak = dmsToggle ? Math.exp(-Math.pow((wl - 3.42) / 0.08, 2)) * 260 : 0;

    // Atmospheric Rayleigh scattering slope at blue/near-IR wavelengths
    const rayleigh = 280 / Math.pow(wl, 1.2);

    const totalFeature = (h2oPeak1 + h2oPeak2 + h2oPeak3 + co2Peak1 + co2Peak2 + ch4Peak1 + ch4Peak2 + dmsPeak + rayleigh) * (scaleKm / 400);
    const noise = Math.sin(i * 17.3) * 18; // Synthetic photon shot noise

    spectrumPoints.push({
      wl,
      transitDepthPpm: baseDepth + totalFeature + noise,
      isFeature: totalFeature > 200,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-space-900 border border-aeroblue/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-aeroblue" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {language === 'km' ? 'ម៉ន្ទីរពិសោធន៍វិភាគគីមីបរិយាកាស JWST SPECTROSCOPY LAB' : 'JWST EXOPLANET TRANSMISSION SPECTROSCOPY LAB'}
              </h2>
              <p className="text-[10px] text-space-400">
                {language === 'km' ? 'ការវាស់កាំរស្មីពន្លឺអ៊ីនហ្វ្រាក្រហម (0.8 - 5.0 um) ដើម្បីរុករកចំហាយទឹក មេតាន និងសញ្ញាជីវសាស្រ្ត' : 'Infrared Molecular Absorption Fingerprints (H2O, CO2, CH4, DMS Biosignatures)'}
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
          {/* Target System Selectors */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-space-400 uppercase tracking-wider">
              {language === 'km' ? 'ភពគោលដៅអង្កេតរបស់កែវយឹត JWST:' : 'JWST TARGET EXOPLANETS:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {ATMOSPHERE_TARGETS.map((target) => (
                <button
                  key={target.id}
                  onClick={() => handleSelectTarget(target)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTarget.id === target.id
                      ? 'bg-aeroblue/15 border-aeroblue text-white shadow-lg'
                      : 'bg-space-950/80 hover:bg-space-850 border-space-800 text-space-300'
                  }`}
                >
                  <div className="font-bold text-xs text-white">
                    {language === 'km' ? target.khmerName : target.name}
                  </div>
                  <div className="text-[10px] text-space-400 mt-1">
                    {target.distanceLy} ly &bull; {target.tempK} K
                  </div>
                  <div className="text-[9px] text-aerogreen font-semibold mt-1 truncate">
                    {language === 'km' ? target.khmerType : target.type}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Graphical Transmission Spectrum Plot */}
          <div className="relative rounded-xl border border-space-800 bg-space-950 p-4 overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-bold text-white mb-2">
              <span className="text-aeroblue flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                {language === 'km' ? 'ក្រាហ្វស្រូបទាញពន្លឺតាមប្រវែងរលក (TRANSIT ABSORPTION SPECTRUM)' : 'TRANSIT DEPTH VS WAVELENGTH'}
              </span>
              <span className="text-space-400 text-[10px]">
                NIRSpec / NIRISS PRISM: 0.8 &mu;m &rarr; 5.0 &mu;m
              </span>
            </div>

            <svg viewBox="0 0 760 260" className="w-full h-auto min-w-[600px] overflow-visible">
              {/* Background Grid */}
              <line x1={50} y1={20} x2={740} y2={20} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1={50} y1={80} x2={740} y2={80} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1={50} y1={140} x2={740} y2={140} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1={50} y1={200} x2={740} y2={200} stroke="#1e293b" strokeDasharray="3 3" />

              {/* Y Axis Labels */}
              <text x={42} y={25} fill="#64748b" fontSize={8} textAnchor="end" fontFamily="monospace">14000</text>
              <text x={42} y={85} fill="#64748b" fontSize={8} textAnchor="end" fontFamily="monospace">13000</text>
              <text x={42} y={145} fill="#64748b" fontSize={8} textAnchor="end" fontFamily="monospace">12500</text>
              <text x={42} y={205} fill="#64748b" fontSize={8} textAnchor="end" fontFamily="monospace">12000</text>
              <text x={42} y={245} fill="#64748b" fontSize={8} textAnchor="end" fontFamily="monospace">ppm</text>

              {/* Molecular Signatures Banner Regions */}
              {/* H2O @ 1.4 um */}
              <rect x={140} y={20} width={35} height={180} fill="#38bdf8" fillOpacity={0.08} />
              <text x={157} y={35} fill="#38bdf8" fontSize={8} textAnchor="middle" fontWeight="bold">H2O</text>

              {/* H2O @ 1.9 um */}
              <rect x={220} y={20} width={40} height={180} fill="#38bdf8" fillOpacity={0.08} />
              <text x={240} y={35} fill="#38bdf8" fontSize={8} textAnchor="middle" fontWeight="bold">H2O</text>

              {/* CH4 @ 2.3 & 3.3 um */}
              <rect x={290} y={20} width={35} height={180} fill="#f59e0b" fillOpacity={0.08} />
              <text x={307} y={35} fill="#f59e0b" fontSize={8} textAnchor="middle" fontWeight="bold">CH4</text>

              <rect x={440} y={20} width={45} height={180} fill="#f59e0b" fillOpacity={0.08} />
              <text x={462} y={35} fill="#f59e0b" fontSize={8} textAnchor="middle" fontWeight="bold">CH4 / DMS</text>

              {/* CO2 @ 4.3 um */}
              <rect x={605} y={20} width={40} height={180} fill="#10b981" fillOpacity={0.08} />
              <text x={625} y={35} fill="#10b981" fontSize={8} textAnchor="middle" fontWeight="bold">CO2</text>

              {/* Draw Spectrum Line */}
              <path
                d={spectrumPoints.reduce((acc, pt, idx) => {
                  const svgX = 50 + (idx / (wavelengthSteps - 1)) * 690;
                  // Map 11800 - 14500 ppm to 200 - 20 px
                  const svgY = 200 - ((pt.transitDepthPpm - 12000) / 2500) * 180;
                  return `${acc} ${idx === 0 ? 'M' : 'L'} ${svgX} ${svgY}`;
                }, '')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={2.5}
              />

              {/* Draw Synthetic Observational Data Points with Error Bars */}
              {spectrumPoints.filter((_, idx) => idx % 4 === 0).map((pt, i) => {
                const idx = i * 4;
                const svgX = 50 + (idx / (wavelengthSteps - 1)) * 690;
                const svgY = 200 - ((pt.transitDepthPpm - 12000) / 2500) * 180;
                const err = 8;

                return (
                  <g key={i}>
                    <line x1={svgX} y1={svgY - err} x2={svgX} y2={svgY + err} stroke="#ffffff" strokeWidth={1} />
                    <circle cx={svgX} cy={svgY} r={2} fill="#ffffff" />
                  </g>
                );
              })}

              {/* X Axis Wavelength Markers */}
              <text x={50} y={225} fill="#94a3b8" fontSize={9} textAnchor="middle" fontFamily="monospace">0.8 &mu;m</text>
              <text x={220} y={225} fill="#94a3b8" fontSize={9} textAnchor="middle" fontFamily="monospace">1.8 &mu;m</text>
              <text x={395} y={225} fill="#94a3b8" fontSize={9} textAnchor="middle" fontFamily="monospace">2.8 &mu;m</text>
              <text x={570} y={225} fill="#94a3b8" fontSize={9} textAnchor="middle" fontFamily="monospace">3.8 &mu;m</text>
              <text x={740} y={225} fill="#94a3b8" fontSize={9} textAnchor="middle" fontFamily="monospace">5.0 &mu;m</text>
            </svg>
          </div>

          {/* Interactive Molecular Concentration Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-space-950 rounded-xl border border-space-800">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                <span className="text-sky-400">Water Vapor (H2O):</span>
                <span>{h2oVal.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={3.0}
                step={0.05}
                value={h2oVal}
                onChange={(e) => setH2oVal(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                <span className="text-emerald-400">Carbon Dioxide (CO2):</span>
                <span>{co2Val.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={3.0}
                step={0.05}
                value={co2Val}
                onChange={(e) => setCo2Val(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                <span className="text-amber-400">Methane (CH4):</span>
                <span>{ch4Val.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={3.0}
                step={0.05}
                value={ch4Val}
                onChange={(e) => setCh4Val(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Biosignature Candidate Toggle & Science Notes */}
          <div className="p-3 bg-space-950 rounded-xl border border-space-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDmsToggle(!dmsToggle)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                  dmsToggle
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md'
                    : 'bg-space-900 text-space-400 border-space-700 hover:text-white'
                }`}
              >
                {language === 'km' ? 'សញ្ញាជីវសាស្រ្ត DMS Candidate (3.42 um)' : 'DMS Biosignature Candidate (3.42 um)'}
              </button>
              <span className="text-[10px] text-space-400">
                {dmsToggle ? (language === 'km' ? 'បានបើកសញ្ញាស្រូបទាញ Dimethyl Sulfide' : 'Dimethyl Sulfide absorption active') : (language === 'km' ? 'បានបិទ' : 'Disabled')}
              </span>
            </div>

            <div className="text-[11px] text-space-300">
              <span className="text-space-400 font-bold block sm:inline mr-1">{language === 'km' ? 'កម្ពស់ស្រទាប់បរិយាកាស (Scale Height):' : 'Scale Height (H):'}</span>
              <strong className="text-aeroblue">{selectedTarget.scaleHeightKm} km</strong> &bull; T: {selectedTarget.tempK} K
            </div>
          </div>

          {/* Scientific Context Description */}
          <div className="p-3 bg-space-900/80 rounded-xl border border-space-800 text-[11px] text-space-300 leading-relaxed">
            <span className="font-bold text-white block mb-0.5">
              {language === 'km' ? 'ព័ត៌មានវិទ្យាសាស្ត្រកែវយឹត JWST:' : 'JWST OBSERVATIONAL CONTEXT:'}
            </span>
            {language === 'km' ? selectedTarget.khmerNotes : selectedTarget.notes}
          </div>
        </div>
      </div>
    </div>
  );
}
