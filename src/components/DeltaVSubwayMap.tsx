'use client';

import React, { useState } from 'react';
import { X, TrainTrack, Rocket, Calculator, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DeltaVSubwayMapProps {
  onClose: () => void;
  language?: 'km' | 'en';
}

interface NodeInfo {
  id: string;
  name: string;
  khmerName: string;
  category: 'earth' | 'moon' | 'mars' | 'deep_space';
  altitudeKm: string;
  x: number;
  y: number;
}

interface DeltaVEdge {
  from: string;
  to: string;
  deltaV: number; // m/s
  aerobrakeAvailable: boolean;
  notes: string;
  khmerNotes: string;
}

const NODES: NodeInfo[] = [
  { id: 'earth_surface', name: 'Earth Surface', khmerName: 'ផ្ទៃផែនដី', category: 'earth', altitudeKm: '0 km', x: 80, y: 380 },
  { id: 'leo', name: 'Low Earth Orbit (LEO)', khmerName: 'គន្លងផែនដីទាប (LEO)', category: 'earth', altitudeKm: '250 - 450 km', x: 80, y: 260 },
  { id: 'gto', name: 'Geostationary Transfer (GTO)', khmerName: 'គន្លងផ្ទេរ (GTO)', category: 'earth', altitudeKm: '250 x 35,786 km', x: 190, y: 260 },
  { id: 'geo', name: 'Geostationary Orbit (GEO)', khmerName: 'គន្លងស្ថានីយ (GEO)', category: 'earth', altitudeKm: '35,786 km', x: 300, y: 260 },
  { id: 'earth_escape', name: 'Earth Escape (C3=0)', khmerName: 'រំដោះចេញពីផែនដី', category: 'deep_space', altitudeKm: 'Parabolic', x: 80, y: 150 },
  { id: 'tli', name: 'Trans-Lunar Injection', khmerName: 'គន្លងហោះទៅព្រះច័ន្ទ (TLI)', category: 'moon', altitudeKm: 'Translunar Arc', x: 220, y: 150 },
  { id: 'llo', name: 'Low Lunar Orbit (LLO)', khmerName: 'គន្លងព្រះច័ន្ទទាប (LLO)', category: 'moon', altitudeKm: '100 km', x: 360, y: 150 },
  { id: 'moon_surface', name: 'Lunar Surface', khmerName: 'ផ្ទៃព្រះច័ន្ទ', category: 'moon', altitudeKm: '0 km', x: 480, y: 150 },
  { id: 'tmi', name: 'Trans-Mars Injection', khmerName: 'គន្លងហោះទៅភពអង្គារ (TMI)', category: 'mars', altitudeKm: 'Heliocentric Arc', x: 80, y: 60 },
  { id: 'lmo', name: 'Low Mars Orbit (LMO)', khmerName: 'គន្លងភពអង្គារទាប (LMO)', category: 'mars', altitudeKm: '250 km', x: 250, y: 60 },
  { id: 'mars_surface', name: 'Mars Surface', khmerName: 'ផ្ទៃភពអង្គារ', category: 'mars', altitudeKm: '0 km', x: 420, y: 60 },
  { id: 'jupiter_transfer', name: 'Jupiter Transfer Trajectory', khmerName: 'គន្លងទៅភពព្រហស្បតិ៍', category: 'deep_space', altitudeKm: '5.2 AU', x: 580, y: 60 },
];

const EDGES: DeltaVEdge[] = [
  { from: 'earth_surface', to: 'leo', deltaV: 9400, aerobrakeAvailable: true, notes: 'Includes 1.8 km/s gravity/drag loss', khmerNotes: 'រួមបញ្ចូលការបាត់បង់ទម្ងន់ទំនាញ និងកកិតខ្យល់ 1.8 គម/វិនាទី' },
  { from: 'leo', to: 'gto', deltaV: 2440, aerobrakeAvailable: false, notes: 'Perigee apogee raising burn', khmerNotes: 'ដុតបញ្ឆេះបង្កើនកម្ពស់គន្លង' },
  { from: 'gto', to: 'geo', deltaV: 1470, aerobrakeAvailable: false, notes: 'Apogee circularization burn', khmerNotes: 'ដុតបញ្ឆេះតម្រង់គន្លងរង្វង់' },
  { from: 'leo', to: 'earth_escape', deltaV: 3220, aerobrakeAvailable: false, notes: 'Escape parabolic trajectory', khmerNotes: 'រុញច្រានចេញពីទំនាញផែនដី' },
  { from: 'leo', to: 'tli', deltaV: 3150, aerobrakeAvailable: false, notes: 'Apollo & Artemis Trans-lunar burn', khmerNotes: 'គន្លងបេសកកម្ម Apollo និង Artemis' },
  { from: 'tli', to: 'llo', deltaV: 860, aerobrakeAvailable: false, notes: 'Lunar orbit insertion (no atmo)', khmerNotes: 'ចូលគន្លងព្រះច័ន្ទ (គ្មានបរិយាកាស)' },
  { from: 'llo', to: 'moon_surface', deltaV: 1730, aerobrakeAvailable: false, notes: 'Descent propulsion burn (vacuum)', khmerNotes: 'ចុះចតលើព្រះច័ន្ទដោយកម្លាំងម៉ាស៊ីនសុទ្ធ' },
  { from: 'leo', to: 'tmi', deltaV: 3600, aerobrakeAvailable: false, notes: 'Hohmann trans-Mars injection', khmerNotes: 'ដុតបញ្ឆេះបញ្ជូនទៅភពអង្គារ' },
  { from: 'tmi', to: 'lmo', deltaV: 2100, aerobrakeAvailable: true, notes: 'Mars capture (0 m/s with aerobraking)', khmerNotes: 'ចូលគន្លង (0 m/s បើប្រើកកិតបរិយាកាស aerobraking)' },
  { from: 'lmo', to: 'mars_surface', deltaV: 3800, aerobrakeAvailable: true, notes: 'Parachute & retropropulsion landing', khmerNotes: 'ឆ័ត្រយោង និងបាញ់ទប់ល្បឿនចុះចត' },
  { from: 'leo', to: 'jupiter_transfer', deltaV: 8000, aerobrakeAvailable: false, notes: 'Deep space trajectory to outer solar system', khmerNotes: 'គន្លងធ្វើដំណើរទៅកាន់ភពខាងក្រៅ' },
];

interface EngineTech {
  id: string;
  name: string;
  isp: number; // seconds
  type: string;
}

const PROPULSION_TECHS: EngineTech[] = [
  { id: 'hydrolox', name: 'Hydrolox (LH2 / LOX - RS-25 / RL10)', isp: 450, type: 'Cryogenic' },
  { id: 'methalox', name: 'Methalox (CH4 / LOX - Raptor / BE-4)', isp: 380, type: 'Staged Combustion' },
  { id: 'kerolox', name: 'Kerolox (RP-1 / LOX - Merlin 1D)', isp: 311, type: 'Gas Generator' },
  { id: 'solid', name: 'Solid Rocket Motor (HTPB / AP)', isp: 265, type: 'Solid' },
  { id: 'ion', name: 'Hall Effect Ion Thruster (Xenon)', isp: 3000, type: 'Electric Propulsion' },
];

export default function DeltaVSubwayMap({ onClose, language = 'km' }: DeltaVSubwayMapProps) {
  const [originId, setOriginId] = useState('earth_surface');
  const [destId, setDestId] = useState('mars_surface');
  const [payloadKg, setPayloadKg] = useState(5000);
  const [selectedEngine, setSelectedEngine] = useState<EngineTech>(PROPULSION_TECHS[1]); // Methalox default
  const [structuralFraction, setStructuralFraction] = useState(0.08); // 8% dry tank mass

  // Breadth-First-Search (BFS) Pathfinding for cumulative Delta-V
  const findPath = (start: string, end: string): { path: string[]; totalDv: number; aerobrakeSavings: number } => {
    if (start === end) return { path: [start], totalDv: 0, aerobrakeSavings: 0 };

    const queue: { current: string; path: string[]; dv: number; savings: number }[] = [
      { current: start, path: [start], dv: 0, savings: 0 },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { current, path, dv, savings } = queue.shift()!;
      if (current === end) {
        return { path, totalDv: dv, aerobrakeSavings: savings };
      }
      visited.add(current);

      // Find outgoing or bidirectional edges
      for (const edge of EDGES) {
        let neighbor = '';
        if (edge.from === current) neighbor = edge.to;
        else if (edge.to === current) neighbor = edge.from;

        if (neighbor && !visited.has(neighbor)) {
          const savingsAdd = edge.aerobrakeAvailable && (neighbor === 'lmo' || neighbor === 'mars_surface') ? edge.deltaV * 0.85 : 0;
          queue.push({
            current: neighbor,
            path: [...path, neighbor],
            dv: dv + edge.deltaV,
            savings: savings + savingsAdd,
          });
        }
      }
    }

    return { path: [start, end], totalDv: 15400, aerobrakeSavings: 4200 };
  };

  const route = findPath(originId, destId);

  // Tsiolkovsky Rocket Equation calculation:
  // delta_v = Isp * g0 * ln(m0 / mf)
  // m0 / mf = exp(delta_v / (Isp * g0))
  const g0 = 9.80665;
  const massRatio = Math.exp(route.totalDv / (selectedEngine.isp * g0));
  // Payload mass + Structural dry mass + Propellant mass
  // mf = payload + dryMass; dryMass = structuralFraction * propellant
  // m0 = mf + propellant => m0/mf = (payload + (1+eps)*propellant) / (payload + eps*propellant)
  // Simplifying single stage or staged estimate:
  const propellantKg = Math.max(0, payloadKg * (massRatio - 1) / (1 - structuralFraction * (massRatio - 1)));
  const totalWetMassKg = payloadKg + propellantKg + propellantKg * structuralFraction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-space-900 border border-aeroblue/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <TrainTrack className="w-5 h-5 text-aeroblue" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {language === 'km' ? 'ផែនទីថវិកាល្បឿនរ៉ុក្កែតអន្តរភព (SOLAR SYSTEM DELTA-V SUBWAY MAP)' : 'SOLAR SYSTEM DELTA-V SUBWAY MAP'}
              </h2>
              <p className="text-[10px] text-space-400">
                {language === 'km' ? 'ការគណនាថាមពលល្បឿន និងសមីការរ៉ុក្កែត Tsiolkovsky Rocket Equation' : 'Orbital Transfer Maneuver Budgets & Tsiolkovsky Rocket Staging'}
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
          {/* Origin & Destination Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-space-950 rounded-xl border border-space-800">
            <div>
              <label className="text-[10px] font-bold text-space-400 uppercase block mb-1">
                {language === 'km' ? 'ចំណុចចេញដំណើរ (DEPARTURE NODE):' : 'DEPARTURE NODE:'}
              </label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-white font-bold cursor-pointer"
              >
                {NODES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {language === 'km' ? n.khmerName : n.name} ({n.altitudeKm})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-space-400 uppercase block mb-1">
                {language === 'km' ? 'គោលដៅចុះចត/គន្លង (DESTINATION NODE):' : 'DESTINATION NODE:'}
              </label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-white font-bold cursor-pointer"
              >
                {NODES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {language === 'km' ? n.khmerName : n.name} ({n.altitudeKm})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Graphical Delta-V Transit Map */}
          <div className="relative rounded-xl border border-space-800 bg-space-950 p-4 overflow-x-auto">
            <svg viewBox="0 0 700 420" className="w-full min-w-[640px] h-auto">
              {/* Draw Subway Connection Tracks */}
              {EDGES.map((edge, idx) => {
                const nodeA = NODES.find((n) => n.id === edge.from)!;
                const nodeB = NODES.find((n) => n.id === edge.to)!;
                const isInRoute = route.path.includes(edge.from) && route.path.includes(edge.to);

                return (
                  <g key={idx}>
                    <line
                      x1={nodeA.x}
                      y1={nodeA.y}
                      x2={nodeB.x}
                      y2={nodeB.y}
                      stroke={isInRoute ? '#10b981' : '#334155'}
                      strokeWidth={isInRoute ? 4 : 2}
                      strokeDasharray={edge.aerobrakeAvailable ? '4 3' : undefined}
                    />
                    {/* Delta-V Pill label on line center */}
                    <rect
                      x={(nodeA.x + nodeB.x) / 2 - 24}
                      y={(nodeA.y + nodeB.y) / 2 - 8}
                      width={48}
                      height={16}
                      rx={4}
                      fill="#0f172a"
                      stroke={isInRoute ? '#10b981' : '#475569'}
                      strokeWidth={1}
                    />
                    <text
                      x={(nodeA.x + nodeB.x) / 2}
                      y={(nodeA.y + nodeB.y) / 2 + 3}
                      fill={isInRoute ? '#10b981' : '#94a3b8'}
                      fontSize={8}
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {edge.deltaV}
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {NODES.map((node) => {
                const isSelected = originId === node.id || destId === node.id;
                const isInPath = route.path.includes(node.id);

                let fillCol = '#1e293b';
                if (node.category === 'earth') fillCol = '#0284c7';
                else if (node.category === 'moon') fillCol = '#94a3b8';
                else if (node.category === 'mars') fillCol = '#ea580c';
                else fillCol = '#8b5cf6';

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setDestId(node.id)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 10 : 7}
                      fill={fillCol}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={2}
                    />
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={14}
                        fill="none"
                        stroke={node.id === originId ? '#38bdf8' : '#10b981'}
                        strokeWidth={1.5}
                        strokeDasharray="2 2"
                      />
                    )}
                    <text
                      x={node.x}
                      y={node.y + 18}
                      fill={isInPath ? '#ffffff' : '#64748b'}
                      fontSize={9}
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {language === 'km' ? node.khmerName : node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Cumulative Mission Delta-V Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'ថវិកាល្បឿនសរុប (TOTAL DELTA-V)' : 'TOTAL DELTA-V REQUIRED'}
              </span>
              <div className="text-xl font-bold text-aeroblue">
                {route.totalDv.toLocaleString()} <span className="text-xs text-space-400">m/s</span>
              </div>
              <div className="text-[10px] text-space-400">
                {(route.totalDv / 1000).toFixed(2)} km/s kinetic delta
              </div>
            </div>

            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'ការសន្សំដោយបរិយាកាស AEROBRAKING' : 'AEROBRAKING SAVINGS'}
              </span>
              <div className="text-xl font-bold text-aerogreen">
                {route.aerobrakeSavings > 0 ? `~${Math.round(route.aerobrakeSavings).toLocaleString()} m/s` : '0 m/s'}
              </div>
              <div className="text-[10px] text-space-400">
                {route.aerobrakeSavings > 0 ? (language === 'km' ? 'ប្រើខែលការពារកម្តៅកកិត' : 'Atmospheric heat shield dissipation') : (language === 'km' ? 'គ្មានបរិយាកាសជួយទប់' : 'Propulsive capture only')}
              </div>
            </div>

            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block">
                {language === 'km' ? 'ផលធៀបម៉ាស (MASS RATIO R)' : 'MASS RATIO (m0 / mf)'}
              </span>
              <div className="text-xl font-bold text-aeroamber">
                {massRatio.toFixed(2)} : 1
              </div>
              <div className="text-[10px] text-space-400">
                Based on {selectedEngine.name.split(' (')[0]}
              </div>
            </div>
          </div>

          {/* Tsiolkovsky Rocket Equation & Propellant Mass Calculator */}
          <div className="p-4 bg-space-950 rounded-xl border border-space-800 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-space-800">
              <Rocket className="w-4 h-4 text-aeroamber" />
              <span className="font-bold text-white text-xs uppercase tracking-wide">
                {language === 'km' ? 'គណនាម៉ាសឥន្ធនៈតាមសមីការ TSIOLKOVSKY ROCKET EQUATION' : 'TSIOLKOVSKY ROCKET SIZING CALCULATOR'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-space-400 block mb-1">
                  {language === 'km' ? 'ម៉ាសបន្ទុក Payload Mass (kg):' : 'Payload Mass (kg):'}
                </label>
                <input
                  type="number"
                  min={100}
                  max={150000}
                  step={500}
                  value={payloadKg}
                  onChange={(e) => setPayloadKg(Number(e.target.value))}
                  className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-1.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-space-400 block mb-1">
                  {language === 'km' ? 'បច្ចេកវិទ្យាម៉ាស៊ីន Engine Tech:' : 'Engine Technology:'}
                </label>
                <select
                  value={selectedEngine.id}
                  onChange={(e) => setSelectedEngine(PROPULSION_TECHS.find((t) => t.id === e.target.value)!)}
                  className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-1.5 text-white font-bold cursor-pointer"
                >
                  {PROPULSION_TECHS.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} (Isp: {tech.isp}s)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-space-400 block mb-1">
                  {language === 'km' ? 'ផលធៀបតួធុង Dry Structural Tank:' : 'Dry Structural Fraction:'}
                </label>
                <select
                  value={structuralFraction}
                  onChange={(e) => setStructuralFraction(Number(e.target.value))}
                  className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-1.5 text-white font-bold cursor-pointer"
                >
                  <option value={0.05}>5% (Carbon Composite Ultra-light)</option>
                  <option value={0.08}>8% (Standard Modern Rocket Tank)</option>
                  <option value={0.12}>12% (Heavy Redundant Pressure Hull)</option>
                </select>
              </div>
            </div>

            {/* Sizing Outputs */}
            <div className="p-3 bg-space-900/80 rounded-xl border border-space-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-space-400 block">{language === 'km' ? 'ឥន្ធនៈចាំបាច់ Propellant:' : 'Propellant Mass:'}</span>
                <span className="font-bold text-white text-xs">
                  {isFinite(propellantKg) && propellantKg > 0 ? `${Math.round(propellantKg).toLocaleString()} kg` : 'Multi-stage required'}
                </span>
              </div>
              <div>
                <span className="text-space-400 block">{language === 'km' ? 'ទម្ងន់រ៉ុក្កែតសរុប Wet Mass (m0):' : 'Total Wet Mass (m0):'}</span>
                <span className="font-bold text-aeroamber text-xs">
                  {isFinite(totalWetMassKg) && totalWetMassKg > 0 ? `${Math.round(totalWetMassKg).toLocaleString()} kg` : 'Single stage exceeds limit'}
                </span>
              </div>
              <div>
                <span className="text-space-400 block">{language === 'km' ? 'កម្លាំងរុញដំបូង Launch Thrust:' : 'Min Liftoff Thrust:'}</span>
                <span className="font-bold text-aerogreen text-xs">
                  {isFinite(totalWetMassKg) && totalWetMassKg > 0 ? `${Math.round((totalWetMassKg * 9.81 * 1.3) / 1000).toLocaleString()} kN` : 'Staged cluster'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
