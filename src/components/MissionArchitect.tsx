'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Cpu,
  Layers,
  BatteryCharging,
  Zap,
  Weight,
  Radio,
  Clock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  FileDown,
  ShoppingBag,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ComponentSpec, FormFactor, SubsystemCategory } from '../types/space';
import { SPACE_COMPONENTS } from '../data/spaceComponents';
import RealSatelliteMissionViewer from './RealSatelliteMissionViewer';

interface MissionArchitectProps {
  currentBOM: ComponentSpec[];
  onAddBOMItem: (item: ComponentSpec) => void;
  onRemoveBOMItem: (id: string) => void;
  onSendToRFQ: (items: ComponentSpec[]) => void;
  onOpenCatalogToSelect: (category: SubsystemCategory) => void;
}

const BUS_LIMITS: { [key in FormFactor]?: { maxMassG: number; volumeCm3: number; label: string } } = {
  '1U': { maxMassG: 1500, volumeCm3: 1000, label: '1U CubeSat (10x10x10 cm)' },
  '3U': { maxMassG: 4500, volumeCm3: 3000, label: '3U CubeSat (10x10x30 cm)' },
  '6U': { maxMassG: 12000, volumeCm3: 6000, label: '6U CubeSat (10x20x30 cm)' },
  '12U': { maxMassG: 24000, volumeCm3: 12000, label: '12U CubeSat (20x20x30 cm)' },
  '16U': { maxMassG: 32000, volumeCm3: 16000, label: '16U CubeSat (20x20x40 cm)' },
  'ESPA': { maxMassG: 180000, volumeCm3: 150000, label: 'ESPA-Class MicroSat (>100 kg)' },
};

export default function MissionArchitect({
  currentBOM,
  onAddBOMItem,
  onRemoveBOMItem,
  onSendToRFQ,
  onOpenCatalogToSelect,
}: MissionArchitectProps) {
  const [missionName, setMissionName] = useState('ORBITAL-OBSERVER-1');
  const [selectedOrbit, setSelectedOrbit] = useState<'LEO_SSO' | 'LEO_POLAR' | 'LEO_MID' | 'GEO'>('LEO_SSO');
  const [selectedBus, setSelectedBus] = useState<FormFactor>('6U');
  const [altitudeKm, setAltitudeKm] = useState(520);
  const [missionLifetimeYears, setMissionLifetimeYears] = useState(3);
  const [activeSubsystemTab, setActiveSubsystemTab] = useState<string | null>(null);

  // Orbit parameters calculation
  const orbitDetails = useMemo(() => {
    // Earth radius = 6371 km, mu = 398600.4418 km^3/s^2
    const r = 6371 + altitudeKm;
    const periodSec = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / 398600.4418);
    const periodMin = periodSec / 60;
    // LEO eclipse estimate ~ 36% of orbit
    const eclipseMin = periodMin * 0.36;
    const sunlightMin = periodMin - eclipseMin;
    return {
      periodMin: Number(periodMin.toFixed(1)),
      eclipseMin: Number(eclipseMin.toFixed(1)),
      sunlightMin: Number(sunlightMin.toFixed(1)),
      velocityKmS: Number(Math.sqrt(398600.4418 / r).toFixed(2)),
      passesPerDay: selectedOrbit === 'LEO_SSO' || selectedOrbit === 'LEO_POLAR' ? 14.8 : 4.2,
    };
  }, [altitudeKm, selectedOrbit]);

  // Mass Budget
  const massBudget = useMemo(() => {
    const rawComponentMassG = currentBOM.reduce((sum, item) => sum + item.massGrams, 0);
    // 20% AIAA standard engineering design margin
    const marginG = Math.round(rawComponentMassG * 0.2);
    const totalMassG = rawComponentMassG + marginG;
    const maxMassLimitG = BUS_LIMITS[selectedBus]?.maxMassG || 12000;
    const massMarginRemainingG = maxMassLimitG - totalMassG;
    const percentage = Math.min(Math.round((totalMassG / maxMassLimitG) * 100), 100);
    const isExceeded = totalMassG > maxMassLimitG;

    return {
      rawComponentMassG,
      marginG,
      totalMassG,
      maxMassLimitG,
      massMarginRemainingG,
      percentage,
      isExceeded,
    };
  }, [currentBOM, selectedBus]);

  // Power Budget
  const powerBudget = useMemo(() => {
    // Average power draw of non-solar components
    const consumers = currentBOM.filter((c) => c.category !== 'POWER_EPS' || c.powerAvgWatts > 0);
    const avgPowerDrawWatts = consumers.reduce((sum, item) => sum + item.powerAvgWatts, 0);
    const peakPowerDrawWatts = consumers.reduce((sum, item) => sum + item.powerPeakWatts, 0);

    // Generation: find solar components or default estimation
    const solarComponents = currentBOM.filter(
      (c) => c.category === 'POWER_EPS' && c.modelCode.includes('SPEC-XTJ')
    );
    const daylightGenerationWatts = solarComponents.length > 0 ? solarComponents[0].powerAvgWatts : 35.0;

    // Energy balance over one orbit
    const energyProducedWh = (daylightGenerationWatts * orbitDetails.sunlightMin) / 60;
    const energyConsumedWh = (avgPowerDrawWatts * orbitDetails.periodMin) / 60;
    const netEnergyBalanceWh = Number((energyProducedWh - energyConsumedWh).toFixed(2));
    const powerMarginPercent = Math.round(((energyProducedWh - energyConsumedWh) / energyProducedWh) * 100);
    const isPositive = netEnergyBalanceWh >= 0;

    return {
      avgPowerDrawWatts: Number(avgPowerDrawWatts.toFixed(1)),
      peakPowerDrawWatts: Number(peakPowerDrawWatts.toFixed(1)),
      daylightGenerationWatts,
      netEnergyBalanceWh,
      powerMarginPercent,
      isPositive,
    };
  }, [currentBOM, orbitDetails]);

  // ITAR and TRL status
  const complianceStatus = useMemo(() => {
    const hasItar = currentBOM.some((c) => c.exportCompliance === 'ITAR_CONTROLLED');
    const minTrl = currentBOM.length > 0 ? Math.min(...currentBOM.map((c) => c.trl)) : 9;
    const totalEstCostUsd = currentBOM.reduce((sum, c) => sum + (c.priceUsd || 0), 0);
    return {
      hasItar,
      minTrl,
      totalEstCostUsd,
    };
  }, [currentBOM]);

  // Export Engineering Report function
  const handleExportSpecification = () => {
    const specReport = `=================================================================
AEROVEX SPACE PLATFORM - MISSION ARCHITECTURE SPECIFICATION
=================================================================
Mission Identifier : ${missionName}
Target Orbit       : ${selectedOrbit} (${altitudeKm} km)
Satellite Bus      : ${selectedBus} Standard
Mission Lifetime   : ${missionLifetimeYears} Years
Export Clearance   : ${complianceStatus.hasItar ? 'ITAR RESTRICTED' : 'ITAR-FREE EXPORTABLE'}
Minimum System TRL : Level ${complianceStatus.minTrl}

-----------------------------------------------------------------
ORBITAL MECHANICS METRICS
-----------------------------------------------------------------
Orbital Period     : ${orbitDetails.periodMin} Minutes
Orbital Velocity   : ${orbitDetails.velocityKmS} km/s
Sunlight Duration  : ${orbitDetails.sunlightMin} Minutes
Eclipse Duration   : ${orbitDetails.eclipseMin} Minutes
Ground Passes / Day: ${orbitDetails.passesPerDay}

-----------------------------------------------------------------
MASS BUDGET SUMMARY (ECSS / AIAA Standard 20% Reserve)
-----------------------------------------------------------------
Subsystems Mass    : ${massBudget.rawComponentMassG} g
Design Margin (20%): ${massBudget.marginG} g
Total Launch Mass  : ${massBudget.totalMassG} g
Dispenser Limit    : ${massBudget.maxMassLimitG} g
Status             : ${massBudget.isExceeded ? 'EXCEEDED (CRITICAL)' : 'COMPLIANT WITH LAUNCH ENVELOPE'}

-----------------------------------------------------------------
POWER BUDGET SUMMARY
-----------------------------------------------------------------
Daylight Generation: ${powerBudget.daylightGenerationWatts} W
Average Consumption: ${powerBudget.avgPowerDrawWatts} W
Peak Consumption   : ${powerBudget.peakPowerDrawWatts} W
Net Energy Orbit   : ${powerBudget.netEnergyBalanceWh} Wh (${powerBudget.powerMarginPercent}% Margin)

-----------------------------------------------------------------
BILL OF MATERIALS (BOM)
-----------------------------------------------------------------
${currentBOM
  .map(
    (item, idx) =>
      `${idx + 1}. [${item.category}] ${item.name}
   Model: ${item.modelCode} | Mfr: ${item.manufacturer} (${item.country})
   Mass: ${item.massGrams}g | Power Avg: ${item.powerAvgWatts}W | TRL: ${item.trl} | Export: ${item.exportCompliance}
   Unit Cost: ${item.priceUsd ? '$' + item.priceUsd.toLocaleString() : 'RFQ Only'}`
  )
  .join('\n\n')}

Total Estimated Hardware Cost: $${complianceStatus.totalEstCostUsd.toLocaleString()} USD
=================================================================
Generated via Aerovex NewSpace Platform Engine. All rights reserved.
`;

    const blob = new Blob([specReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${missionName.toLowerCase()}-aerospace-spec.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                MISSION ARCHITECT & SUBSYSTEM CONFIGURATOR
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Model orbital mechanics, balance live mass and power budgets, and synthesize a verified Bill of Materials
              (BOM) with flight heritage validation and export compliance verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportSpecification}
              className="px-3 py-2 text-xs font-mono rounded bg-space-800 hover:bg-space-750 text-space-200 border border-space-700 hover:border-space-500 transition-all flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-aeroblue-light" />
              <span>EXPORT SPEC REPORT</span>
            </button>

            <button
              onClick={() => onSendToRFQ(currentBOM)}
              disabled={currentBOM.length === 0}
              className="px-4 py-2 text-xs font-mono font-medium rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-aeroblue/10"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>REQUEST B2B QUOTES ({currentBOM.length})</span>
            </button>
          </div>
        </div>

        {/* Mission Parameters Form Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-space-800 pt-4">
          <div>
            <label className="block text-[11px] font-mono text-space-400 mb-1">MISSION NAME</label>
            <input
              type="text"
              value={missionName}
              onChange={(e) => setMissionName(e.target.value.toUpperCase())}
              className="w-full bg-space-950 border border-space-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-aeroblue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-space-400 mb-1">ORBIT PROFILE</label>
            <select
              value={selectedOrbit}
              onChange={(e: any) => setSelectedOrbit(e.target.value)}
              className="w-full bg-space-950 border border-space-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-aeroblue"
            >
              <option value="LEO_SSO">LEO Sun-Synchronous (SSO)</option>
              <option value="LEO_POLAR">LEO Polar (98° Inclination)</option>
              <option value="LEO_MID">LEO Mid-Inclination (45° - 53°)</option>
              <option value="GEO">Geostationary Equatorial (GEO)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-space-400 mb-1">
              ORBIT ALTITUDE ({altitudeKm} KM)
            </label>
            <input
              type="range"
              min="350"
              max="1200"
              step="10"
              value={altitudeKm}
              onChange={(e) => setAltitudeKm(Number(e.target.value))}
              className="w-full accent-aeroblue h-1.5 bg-space-800 rounded appearance-none cursor-pointer mt-2"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-space-400 mb-1">BUS FORM FACTOR</label>
            <select
              value={selectedBus}
              onChange={(e: any) => setSelectedBus(e.target.value)}
              className="w-full bg-space-950 border border-space-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-aeroblue"
            >
              <option value="1U">1U CubeSat Standard</option>
              <option value="3U">3U CubeSat Standard</option>
              <option value="6U">6U CubeSat Standard</option>
              <option value="12U">12U CubeSat Standard</option>
              <option value="16U">16U CubeSat Standard</option>
              <option value="ESPA">ESPA MicroSat (100kg+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Visual & Engineering Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real Satellite Optical & Sensor Telemetry Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <RealSatelliteMissionViewer
            busType={`${selectedBus} CubeSat Platform`}
            selectedSubsystem={activeSubsystemTab}
          />

          {/* Real-time Telemetry & Orbital Dynamics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-space-900/60 border border-space-800 rounded">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-space-400">
                <Clock className="w-3.5 h-3.5 text-aeroblue" />
                <span>ORBIT PERIOD</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {orbitDetails.periodMin} <span className="text-xs font-normal text-space-400">min</span>
              </div>
              <div className="text-[10px] text-space-400 font-mono mt-0.5">
                Day: {orbitDetails.sunlightMin}m | Ecl: {orbitDetails.eclipseMin}m
              </div>
            </div>

            <div className="p-3 bg-space-900/60 border border-space-800 rounded">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-space-400">
                <Compass className="w-3.5 h-3.5 text-aeroblue" />
                <span>VELOCITY</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {orbitDetails.velocityKmS} <span className="text-xs font-normal text-space-400">km/s</span>
              </div>
              <div className="text-[10px] text-space-400 font-mono mt-0.5">Orbital circular velocity</div>
            </div>

            <div className="p-3 bg-space-900/60 border border-space-800 rounded">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-space-400">
                <Radio className="w-3.5 h-3.5 text-aeroblue" />
                <span>GROUND PASSES</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {orbitDetails.passesPerDay} <span className="text-xs font-normal text-space-400">/ day</span>
              </div>
              <div className="text-[10px] text-space-400 font-mono mt-0.5">Polar network coverage</div>
            </div>

            <div className="p-3 bg-space-900/60 border border-space-800 rounded">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-space-400">
                <Cpu className="w-3.5 h-3.5 text-aeroblue" />
                <span>SYSTEM TRL</span>
              </div>
              <div className="text-base font-bold text-aerogreen font-mono mt-1">
                TRL {complianceStatus.minTrl}
              </div>
              <div className="text-[10px] text-space-400 font-mono mt-0.5">
                {complianceStatus.minTrl === 9 ? 'Flight Proven' : 'In Qualification'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Engineering Budgets & Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mass Budget Card */}
          <div className="p-4 bg-space-900/80 border border-space-700/80 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Weight className="w-4 h-4 text-aeroblue" />
                <h3 className="text-xs font-bold uppercase font-mono tracking-wide text-white">
                  MASS BUDGET & LAUNCH MARGIN
                </h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  massBudget.isExceeded
                    ? 'bg-aerored/10 text-aerored border-aerored/40'
                    : 'bg-aerogreen/10 text-aerogreen border-aerogreen/40'
                }`}
              >
                {massBudget.isExceeded ? 'EXCEEDED' : 'COMPLIANT'}
              </span>
            </div>

            {/* Mass Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] font-mono text-space-300 mb-1">
                <span>
                  Allocated: {(massBudget.totalMassG / 1000).toFixed(2)} kg
                  <span className="text-space-500 text-[10px] ml-1">(inc. 20% margin)</span>
                </span>
                <span className="text-space-400">Limit: {massBudget.maxMassLimitG / 1000} kg</span>
              </div>
              <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden border border-space-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    massBudget.isExceeded ? 'bg-aerored' : 'bg-aeroblue'
                  }`}
                  style={{ width: `${massBudget.percentage}%` }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono text-space-300 pt-2 border-t border-space-800">
              <div>
                <span className="text-space-500 block text-[10px]">PARTS MASS</span>
                <span>{massBudget.rawComponentMassG} g</span>
              </div>
              <div>
                <span className="text-space-500 block text-[10px]">AIAA MARGIN (20%)</span>
                <span>+{massBudget.marginG} g</span>
              </div>
              <div>
                <span className="text-space-500 block text-[10px]">PAYLOAD CAPACITY</span>
                <span className={massBudget.massMarginRemainingG < 0 ? 'text-aerored' : 'text-aerogreen'}>
                  {massBudget.massMarginRemainingG} g
                </span>
              </div>
            </div>
          </div>

          {/* Power Budget Card */}
          <div className="p-4 bg-space-900/80 border border-space-700/80 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-aeroamber" />
                <h3 className="text-xs font-bold uppercase font-mono tracking-wide text-white">
                  POWER BALANCE & SOLAR GENERATION
                </h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  powerBudget.isPositive
                    ? 'bg-aerogreen/10 text-aerogreen border-aerogreen/40'
                    : 'bg-aerored/10 text-aerored border-aerored/40'
                }`}
              >
                {powerBudget.isPositive ? 'POSITIVE MARGIN' : 'DEFICIT'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono text-space-300">
              <div className="p-2 rounded bg-space-950/60 border border-space-800">
                <span className="text-space-500 block text-[10px]">SUNLIGHT GEN</span>
                <span className="text-aeroblue-light text-sm font-bold">
                  {powerBudget.daylightGenerationWatts} W
                </span>
              </div>
              <div className="p-2 rounded bg-space-950/60 border border-space-800">
                <span className="text-space-500 block text-[10px]">AVG BUS LOAD</span>
                <span className="text-white text-sm font-bold">{powerBudget.avgPowerDrawWatts} W</span>
              </div>
              <div className="p-2 rounded bg-space-950/60 border border-space-800">
                <span className="text-space-500 block text-[10px]">NET ORBIT BAL</span>
                <span
                  className={`text-sm font-bold ${
                    powerBudget.isPositive ? 'text-aerogreen' : 'text-aerored'
                  }`}
                >
                  {powerBudget.netEnergyBalanceWh > 0 ? '+' : ''}
                  {powerBudget.netEnergyBalanceWh} Wh
                </span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-space-400 font-mono flex items-center justify-between">
              <span>Peak Instantaneous Demand: {powerBudget.peakPowerDrawWatts} W</span>
              <span className="text-aerogreen">{powerBudget.powerMarginPercent}% Power Reserve</span>
            </div>
          </div>

          {/* Export Compliance & Clearance Tag */}
          <div className="p-4 bg-space-900/80 border border-space-700/80 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-aerogreen" />
                <h3 className="text-xs font-bold uppercase font-mono tracking-wide text-white">
                  REGULATORY & EXPORT COMPLIANCE
                </h3>
              </div>
            </div>

            {complianceStatus.hasItar ? (
              <div className="p-2.5 rounded bg-aeroamber/10 border border-aeroamber/30 text-xs font-mono text-aeroamber-light flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-aeroamber flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">ITAR Category XV Restricted:</span> At least one subsystem is governed
                  by US International Traffic in Arms Regulations. Requires US State Dept DDTC export license for
                  non-US launch or integration.
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded bg-aerogreen/10 border border-aerogreen/30 text-xs font-mono text-aerogreen-light flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-aerogreen flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">100% ITAR-Free Verified:</span> All components are sourced from European,
                  South African, and international suppliers under commercial dual-use licenses.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill of Materials (BOM) Subsystems Table */}
      <div className="hud-panel rounded-lg border border-space-700/80 overflow-hidden">
        <div className="px-5 py-3.5 bg-space-900/90 border-b border-space-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-aeroblue" />
            <h3 className="text-xs font-bold uppercase font-mono tracking-wide text-white">
              ACTIVE SUBSYSTEMS ARCHITECTURE (BOM)
            </h3>
            <span className="text-xs text-space-400 font-mono">({currentBOM.length} Installed)</span>
          </div>

          <div className="text-xs font-mono text-space-300">
            Estimated Total Hardware:
            <span className="text-white font-bold ml-1.5 font-mono">
              ${complianceStatus.totalEstCostUsd.toLocaleString()} USD
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-space-950/80 text-space-400 border-b border-space-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Subsystem</th>
                <th className="py-2.5 px-4">Component & Model</th>
                <th className="py-2.5 px-4">Manufacturer</th>
                <th className="py-2.5 px-4">Mass</th>
                <th className="py-2.5 px-4">Avg Power</th>
                <th className="py-2.5 px-4">TRL</th>
                <th className="py-2.5 px-4">Export Status</th>
                <th className="py-2.5 px-4">Cost (USD)</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800/80">
              {currentBOM.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-space-400">
                    No subsystems installed yet. Open the catalog below to add components to your mission architecture.
                  </td>
                </tr>
              ) : (
                currentBOM.map((item) => (
                  <tr key={item.id} className="hover:bg-space-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-space-800 text-[10px] text-space-300 border border-space-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-[10px] text-space-400">{item.modelCode}</div>
                    </td>
                    <td className="py-3 px-4 text-space-300">
                      <div>{item.manufacturer}</div>
                      <div className="text-[10px] text-space-500">{item.country}</div>
                    </td>
                    <td className="py-3 px-4 text-space-200">{item.massGrams} g</td>
                    <td className="py-3 px-4 text-space-200">{item.powerAvgWatts} W</td>
                    <td className="py-3 px-4">
                      <span className="text-aerogreen font-bold">TRL {item.trl}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          item.exportCompliance === 'ITAR_FREE'
                            ? 'bg-aerogreen/10 text-aerogreen border-aerogreen/30'
                            : item.exportCompliance === 'EAR99'
                            ? 'bg-aeroblue/10 text-aeroblue border-aeroblue/30'
                            : 'bg-aeroamber/10 text-aeroamber border-aeroamber/30'
                        }`}
                      >
                        {item.exportCompliance}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {item.priceUsd ? `$${item.priceUsd.toLocaleString()}` : 'RFQ Custom'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onRemoveBOMItem(item.id)}
                        className="p-1 rounded text-space-400 hover:text-aerored hover:bg-space-800 transition-colors"
                        title="Remove from BOM"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Add Subsystem Buttons Bar */}
        <div className="p-3 bg-space-950/60 border-t border-space-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-space-400 mr-2">ADD SUBSYSTEM:</span>
          {(
            [
              'ADCS',
              'PROPULSION',
              'POWER_EPS',
              'AVIONICS_OBC',
              'TELEMETRY_COMMS',
              'OPTICAL_PAYLOAD',
              'THERMAL_STRUCTURE',
            ] as SubsystemCategory[]
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => onOpenCatalogToSelect(cat)}
              className="px-2.5 py-1 text-[11px] font-mono rounded bg-space-900 hover:bg-space-800 text-space-300 hover:text-white border border-space-700/80 hover:border-space-500 transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-aeroblue" />
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
