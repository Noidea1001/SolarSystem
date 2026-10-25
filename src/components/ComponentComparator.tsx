'use client';

import React from 'react';
import {
  Scale,
  Trash2,
  Plus,
  ShieldCheck,
  Zap,
  Weight,
  Clock,
  DollarSign,
  Cpu,
  Layers,
} from 'lucide-react';
import { ComponentSpec } from '../types/space';
import { SPACE_COMPONENTS } from '../data/spaceComponents';

interface ComponentComparatorProps {
  comparedComponents: ComponentSpec[];
  onRemoveFromCompare: (id: string) => void;
  onAddToBOM: (component: ComponentSpec) => void;
  onClearCompare: () => void;
  onAddQuickCompare: (id: string) => void;
}

export default function ComponentComparator({
  comparedComponents,
  onRemoveFromCompare,
  onAddToBOM,
  onClearCompare,
  onAddQuickCompare,
}: ComponentComparatorProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                SUBSYSTEM SPECIFICATION COMPARATOR
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Side-by-side technical trade studies. Compare mass, power draw, radiation tolerance, flight heritage, and
              export regimes across competing vendors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {comparedComponents.length > 0 && (
              <button
                onClick={onClearCompare}
                className="px-3 py-1.5 text-xs font-mono rounded bg-space-800 hover:bg-space-750 text-space-300 hover:text-white border border-space-700 transition-colors"
              >
                Clear Matrix
              </button>
            )}
            <span className="text-xs font-mono text-space-400">
              Comparing: <strong className="text-aeroblue">{comparedComponents.length}</strong> / 4 Max
            </span>
          </div>
        </div>

        {/* Quick Add suggestions if matrix is not full */}
        {comparedComponents.length < 4 && (
          <div className="mt-4 pt-3 border-t border-space-800 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-space-500 text-[11px]">QUICK ADD CANDIDATES:</span>
            {SPACE_COMPONENTS.filter((c) => !comparedComponents.some((comp) => comp.id === c.id))
              .slice(0, 4)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => onAddQuickCompare(c.id)}
                  className="px-2.5 py-1 rounded bg-space-950 hover:bg-space-850 text-space-300 hover:text-white border border-space-800 flex items-center gap-1 transition-colors text-[11px]"
                >
                  <Plus className="w-3 h-3 text-aeroblue" />
                  <span>{c.name}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Comparison Table / Matrix */}
      {comparedComponents.length === 0 ? (
        <div className="hud-panel p-12 text-center text-space-400 font-mono text-xs rounded-lg border border-space-800 space-y-2">
          <Scale className="w-8 h-8 text-space-600 mx-auto" />
          <p>No components selected for comparison.</p>
          <p className="text-space-500 text-[11px]">
            Go to the Subsystems Catalog and click "Compare" on any 2 to 4 components to evaluate side-by-side trade-offs.
          </p>
        </div>
      ) : (
        <div className="hud-panel rounded-lg border border-space-700/80 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono min-w-[700px]">
            <thead>
              <tr className="bg-space-950 border-b border-space-800">
                <th className="py-4 px-4 w-48 text-space-400 uppercase text-[10px]">PARAMETER</th>
                {comparedComponents.map((comp) => (
                  <th key={comp.id} className="py-4 px-4 text-white align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-space-800 text-aeroblue-light border border-space-700">
                          {comp.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{comp.name}</h4>
                        <div className="text-[10px] text-space-400 font-normal">
                          {comp.modelCode} &bull; {comp.manufacturer}
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveFromCompare(comp.id)}
                        className="p-1 rounded text-space-400 hover:text-aerored hover:bg-space-800 transition-colors"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => onAddToBOM(comp)}
                      className="mt-3 w-full py-1.5 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold transition-all text-center text-[11px]"
                    >
                      ADD TO MISSION BOM
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800">
              {/* Price Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold">UNIT PRICE</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4 text-white font-bold text-sm">
                    {comp.priceUsd ? `$${comp.priceUsd.toLocaleString()} USD` : 'RFQ Custom'}
                  </td>
                ))}
              </tr>

              {/* TRL & Flight Heritage Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold">TRL & FLIGHT HERITAGE</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4">
                    <span className="text-aerogreen font-bold">TRL {comp.trl}</span>
                    <div className="text-space-300 text-[11px] mt-0.5">
                      {comp.flightHeritage.missionsFlown} Missions ({comp.flightHeritage.cumulativeOrbitHours.toLocaleString()} hrs)
                    </div>
                  </td>
                ))}
              </tr>

              {/* Export Regime Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold">EXPORT REGULATION</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        comp.exportCompliance === 'ITAR_FREE'
                          ? 'bg-aerogreen/15 text-aerogreen border-aerogreen/30'
                          : comp.exportCompliance === 'EAR99'
                          ? 'bg-aeroblue/15 text-aeroblue border-aeroblue/30'
                          : 'bg-aeroamber/15 text-aeroamber border-aeroamber/30'
                      }`}
                    >
                      {comp.exportCompliance}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Mass Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold">MASS</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4 text-space-200">
                    <span className="font-bold text-white">{comp.massGrams} g</span>
                    <span className="text-space-500 text-[10px] ml-1">({(comp.massGrams / 1000).toFixed(2)} kg)</span>
                  </td>
                ))}
              </tr>

              {/* Power Consumption Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold">POWER (AVG / PEAK)</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4 text-space-200">
                    <span className="text-aeroblue-light font-bold">{comp.powerAvgWatts} W</span> /{' '}
                    <span className="text-space-400">{comp.powerPeakWatts} W</span>
                  </td>
                ))}
              </tr>

              {/* Radiation Tolerance Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold">RAD TOLERANCE (TID)</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4 text-aerogreen font-bold">
                    {comp.radiationToleranceKrad} krad
                  </td>
                ))}
              </tr>

              {/* Operating Temp Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold">OPERATING TEMP</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4 text-space-300">
                    {comp.operatingTempMinC}°C to +{comp.operatingTempMaxC}°C
                  </td>
                ))}
              </tr>

              {/* Interfaces Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold">DATA INTERFACES</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4 text-space-300">
                    {comp.interfaces.join(', ') || 'Direct / Passive'}
                  </td>
                ))}
              </tr>

              {/* Lead Time Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold">LEAD TIME</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4 text-space-300">
                    {comp.leadTimeWeeks} Weeks
                  </td>
                ))}
              </tr>

              {/* Key Features Row */}
              <tr className="hover:bg-space-900/40">
                <td className="py-3 px-4 text-space-400 font-semibold align-top">DISTINCT FEATURES</td>
                {comparedComponents.map((comp) => (
                  <td key={comp.id} className="py-3 px-4 text-space-300 text-[11px] align-top">
                    <ul className="space-y-1 list-disc list-inside text-space-400">
                      {comp.keyFeatures.slice(0, 3).map((feat, i) => (
                        <li key={i} className="leading-snug">
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
