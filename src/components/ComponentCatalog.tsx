'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Weight,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  Scale,
  Clock,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { ComponentSpec, SubsystemCategory, ExportCompliance } from '../types/space';
import { SPACE_COMPONENTS } from '../data/spaceComponents';

interface ComponentCatalogProps {
  onAddToBOM: (component: ComponentSpec) => void;
  onAddToRFQ: (component: ComponentSpec) => void;
  onAddToCompare: (component: ComponentSpec) => void;
  comparedIds: string[];
  initialCategoryFilter?: SubsystemCategory | null;
  itarFreeOnly?: boolean;
}

export default function ComponentCatalog({
  onAddToBOM,
  onAddToRFQ,
  onAddToCompare,
  comparedIds,
  initialCategoryFilter,
  itarFreeOnly = false,
}: ComponentCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFilter || 'ALL');
  const [selectedTrl, setSelectedTrl] = useState<number | 'ALL'>('ALL');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState<string>('ALL');
  const [activeModalComponent, setActiveModalComponent] = useState<ComponentSpec | null>(null);

  // Filter components
  const filteredComponents = useMemo(() => {
    return SPACE_COMPONENTS.filter((comp) => {
      // Category filter
      if (selectedCategory !== 'ALL' && comp.category !== selectedCategory) return false;

      // ITAR-Free filter
      if (itarFreeOnly && comp.exportCompliance === 'ITAR_CONTROLLED') return false;

      // TRL filter
      if (selectedTrl !== 'ALL' && comp.trl !== selectedTrl) return false;

      // In-stock filter
      if (inStockOnly && !comp.inStock) return false;

      // Interface filter
      if (selectedInterface !== 'ALL' && !comp.interfaces.includes(selectedInterface as any)) return false;

      // Text search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = comp.name.toLowerCase().includes(q);
        const matchModel = comp.modelCode.toLowerCase().includes(q);
        const matchMfr = comp.manufacturer.toLowerCase().includes(q);
        const matchDesc = comp.description.toLowerCase().includes(q);
        const matchFeatures = comp.keyFeatures.some((f) => f.toLowerCase().includes(q));
        if (!matchName && !matchModel && !matchMfr && !matchDesc && !matchFeatures) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedTrl, inStockOnly, selectedInterface, itarFreeOnly]);

  const categories: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Subsystems' },
    { key: 'ADCS', label: 'ADCS & Attitude' },
    { key: 'PROPULSION', label: 'Propulsion & Thrusters' },
    { key: 'POWER_EPS', label: 'Power & Solar (EPS)' },
    { key: 'AVIONICS_OBC', label: 'Avionics & OBC' },
    { key: 'TELEMETRY_COMMS', label: 'Comms & RF Link' },
    { key: 'OPTICAL_PAYLOAD', label: 'Optical Payloads' },
    { key: 'THERMAL_STRUCTURE', label: 'Chassis & Thermal' },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                NEWSPACE HARDWARE & SUBSYSTEM DIRECTORY
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1">
              Qualified aerospace components with verified flight heritage, TRL certification, and mechanical envelope
              parameters.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-space-400">
            <span>INDEXED:</span>
            <span className="text-aeroblue font-bold">{filteredComponents.length} COMPONENTS</span>
          </div>
        </div>

        {/* Search Inputs and Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main search input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-space-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by part number, manufacturer, or feature (e.g. S-band, Star Tracker, FEEP)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-space-950 border border-space-700 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-space-500 font-mono focus:outline-none focus:border-aeroblue"
            />
          </div>

          {/* TRL Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedTrl}
              onChange={(e) =>
                setSelectedTrl(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-aeroblue"
            >
              <option value="ALL">All TRL Ratings</option>
              <option value="9">TRL 9 (Flight Proven)</option>
              <option value="8">TRL 8 (Flight Qualified)</option>
              <option value="7">TRL 7 (Prototype In Space)</option>
            </select>
          </div>

          {/* Data Interface Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedInterface}
              onChange={(e) => setSelectedInterface(e.target.value)}
              className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-aeroblue"
            >
              <option value="ALL">All Interfaces</option>
              <option value="CAN">CAN Bus</option>
              <option value="SpaceWire">SpaceWire</option>
              <option value="Ethernet">Ethernet</option>
              <option value="RS422">RS-422</option>
              <option value="I2C">I2C</option>
              <option value="SPI">SPI</option>
            </select>
          </div>

          {/* In-Stock Toggle */}
          <div className="md:col-span-3 flex items-center justify-end">
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`w-full py-2 px-3 text-xs font-mono rounded border flex items-center justify-center gap-2 transition-colors ${
                inStockOnly
                  ? 'bg-aeroblue/15 border-aeroblue text-aeroblue-light'
                  : 'bg-space-950 border-space-700 text-space-400 hover:border-space-500'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>READY TO SHIP ({inStockOnly ? 'ON' : 'ALL'})</span>
            </button>
          </div>
        </div>

        {/* Category Pill Badges */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-space-800 pt-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                selectedCategory === cat.key
                  ? 'bg-aeroblue text-space-950 font-semibold shadow-md shadow-aeroblue/20'
                  : 'bg-space-950/80 text-space-400 hover:text-white border border-space-800 hover:border-space-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Component Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredComponents.map((component) => {
          const isCompared = comparedIds.includes(component.id);

          return (
            <div
              key={component.id}
              className="hud-panel rounded-lg border border-space-700/80 hover:border-space-500 transition-all flex flex-col justify-between bg-space-900/60 overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-space-800">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-aeroblue-light border border-space-700">
                    {component.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        component.exportCompliance === 'ITAR_FREE'
                          ? 'bg-aerogreen/10 text-aerogreen border-aerogreen/30'
                          : component.exportCompliance === 'EAR99'
                          ? 'bg-aeroblue/10 text-aeroblue border-aeroblue/30'
                          : 'bg-aeroamber/10 text-aeroamber border-aeroamber/30'
                      }`}
                    >
                      {component.exportCompliance}
                    </span>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-800 text-white font-bold border border-space-700">
                      TRL {component.trl}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-aeroblue-light transition-colors line-clamp-1">
                  {component.name}
                </h3>
                <div className="flex items-center justify-between text-[11px] font-mono text-space-400 mt-1">
                  <span>{component.modelCode}</span>
                  <span>{component.manufacturer} ({component.country})</span>
                </div>
              </div>

              {/* Card Body & Specs */}
              <div className="p-4 space-y-3 flex-1 text-xs font-mono">
                <p className="text-space-300 text-[11px] line-clamp-2 leading-relaxed">
                  {component.description}
                </p>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 gap-2 bg-space-950/70 p-2.5 rounded border border-space-850">
                  <div className="flex items-center gap-1.5 text-space-300">
                    <Weight className="w-3.5 h-3.5 text-aeroblue" />
                    <span>Mass: {component.massGrams} g</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-space-300">
                    <Zap className="w-3.5 h-3.5 text-aeroamber" />
                    <span>Avg: {component.powerAvgWatts} W</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-space-300">
                    <Cpu className="w-3.5 h-3.5 text-aerogreen" />
                    <span>Rad: {component.radiationToleranceKrad} krad</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-space-300">
                    <Clock className="w-3.5 h-3.5 text-space-400" />
                    <span>Lead: {component.leadTimeWeeks} wks</span>
                  </div>
                </div>

                {/* Interfaces tags */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-space-500">I/O:</span>
                  {component.interfaces.map((intf) => (
                    <span
                      key={intf}
                      className="text-[9px] px-1.5 py-0.2 rounded bg-space-800 text-space-300 border border-space-700"
                    >
                      {intf}
                    </span>
                  ))}
                </div>

                {/* Flight Heritage Banner */}
                <div className="bg-space-950/40 border border-space-800/80 rounded p-2 text-[10px] text-space-400">
                  <div className="text-aerogreen font-semibold">
                    Flight Heritage: {component.flightHeritage.missionsFlown} Missions Flown
                  </div>
                  <div className="truncate text-space-500">
                    {component.flightHeritage.cumulativeOrbitHours.toLocaleString()} Orbit Hours &bull;{' '}
                    {component.flightHeritage.verifiedBy}
                  </div>
                </div>
              </div>

              {/* Card Footer & Pricing / Actions */}
              <div className="p-4 border-t border-space-800 bg-space-950/40">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-space-500 uppercase block font-mono">LIST PRICE</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {component.priceUsd ? `$${component.priceUsd.toLocaleString()} USD` : 'RFQ Pricing'}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      component.inStock
                        ? 'bg-aerogreen/15 text-aerogreen border border-aerogreen/30'
                        : 'bg-space-800 text-space-400'
                    }`}
                  >
                    {component.inStock ? `${component.stockCount} In Stock` : 'Made to Order'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                  <button
                    onClick={() => setActiveModalComponent(component)}
                    className="py-1.5 px-2 rounded bg-space-850 hover:bg-space-800 text-space-300 hover:text-white border border-space-700 text-center transition-colors"
                  >
                    SPECS
                  </button>

                  <button
                    onClick={() => onAddToCompare(component)}
                    className={`py-1.5 px-2 rounded border text-center transition-colors flex items-center justify-center gap-1 ${
                      isCompared
                        ? 'bg-aeroindigo/20 border-aeroindigo text-aeroindigo-light'
                        : 'bg-space-850 hover:bg-space-800 border-space-700 text-space-300'
                    }`}
                    title="Add to side-by-side comparison matrix"
                  >
                    <Scale className="w-3 h-3" />
                    <span>{isCompared ? 'COMPARING' : 'COMPARE'}</span>
                  </button>

                  <button
                    onClick={() => onAddToBOM(component)}
                    className="py-1.5 px-2 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-semibold text-center transition-colors flex items-center justify-center gap-1"
                    title="Install into Mission Architecture"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ADD BOM</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Component Detailed Spec Modal */}
      {activeModalComponent && (
        <div className="fixed inset-0 z-50 bg-space-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-space-900 border border-space-700 rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-space-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-aeroblue/15 text-aeroblue border border-aeroblue/30">
                    {activeModalComponent.category}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-space-800 text-white border border-space-700">
                    TRL {activeModalComponent.trl}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-space-800 text-space-300 border border-space-700">
                    {activeModalComponent.exportCompliance}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5 font-mono">
                  {activeModalComponent.name}
                </h3>
                <p className="text-xs text-space-400 font-mono">
                  Part Number: {activeModalComponent.modelCode} &bull; Manufacturer:{' '}
                  {activeModalComponent.manufacturer} ({activeModalComponent.country})
                </p>
              </div>

              <button
                onClick={() => setActiveModalComponent(null)}
                className="p-1 rounded text-space-400 hover:text-white hover:bg-space-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
              <div>
                <h4 className="text-space-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                  ENGINEERING OVERVIEW
                </h4>
                <p className="text-space-200 leading-relaxed text-sm">
                  {activeModalComponent.description}
                </p>
              </div>

              {/* Physical & Electrical Spec Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-space-950 p-4 rounded border border-space-800">
                <div>
                  <span className="text-space-500 block text-[10px]">TOTAL MASS</span>
                  <span className="text-white font-bold text-sm">{activeModalComponent.massGrams} g</span>
                </div>
                <div>
                  <span className="text-space-500 block text-[10px]">DIMENSIONS (X-Y-Z)</span>
                  <span className="text-white font-bold text-sm">
                    {activeModalComponent.dimensionsMm.join(' x ')} mm
                  </span>
                </div>
                <div>
                  <span className="text-space-500 block text-[10px]">AVG / PEAK POWER</span>
                  <span className="text-white font-bold text-sm">
                    {activeModalComponent.powerAvgWatts}W / {activeModalComponent.powerPeakWatts}W
                  </span>
                </div>
                <div>
                  <span className="text-space-500 block text-[10px]">SUPPLY VOLTAGE</span>
                  <span className="text-white font-bold text-sm">{activeModalComponent.voltageInputV}</span>
                </div>
              </div>

              {/* Environmental Qualification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-space-950 p-4 rounded border border-space-800">
                <div>
                  <span className="text-space-500 block text-[10px]">RADIATION TOLERANCE</span>
                  <span className="text-aerogreen font-bold text-sm">
                    {activeModalComponent.radiationToleranceKrad} krad (TID)
                  </span>
                </div>
                <div>
                  <span className="text-space-500 block text-[10px]">OPERATING TEMPERATURE</span>
                  <span className="text-white font-bold text-sm">
                    {activeModalComponent.operatingTempMinC}°C to +{activeModalComponent.operatingTempMaxC}°C
                  </span>
                </div>
                <div>
                  <span className="text-space-500 block text-[10px]">DATA INTERFACES</span>
                  <span className="text-aeroblue-light font-bold text-sm">
                    {activeModalComponent.interfaces.join(', ')}
                  </span>
                </div>
              </div>

              {/* Key Features List */}
              <div>
                <h4 className="text-space-400 font-bold uppercase text-[10px] tracking-wider mb-2">
                  KEY FLIGHT QUALIFICATIONS & FEATURES
                </h4>
                <ul className="space-y-1.5">
                  {activeModalComponent.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-space-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-aeroblue mt-1.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Flight Heritage Verification */}
              <div className="bg-space-950/80 border border-space-800 p-4 rounded">
                <h4 className="text-aerogreen font-bold uppercase text-[10px] tracking-wider mb-1">
                  FLIGHT HERITAGE VALIDATION
                </h4>
                <div className="text-space-300">
                  Flown across <strong className="text-white">{activeModalComponent.flightHeritage.missionsFlown}</strong> orbital
                  missions with <strong className="text-white">{activeModalComponent.flightHeritage.cumulativeOrbitHours.toLocaleString()}</strong> operational
                  hours in low-Earth orbit.
                </div>
                <div className="text-space-500 text-[10px] mt-1">
                  Verified by: {activeModalComponent.flightHeritage.verifiedBy}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-space-800 bg-space-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-space-500 block font-mono uppercase">UNIT PRICE</span>
                <span className="text-base font-bold text-white font-mono">
                  {activeModalComponent.priceUsd
                    ? `$${activeModalComponent.priceUsd.toLocaleString()} USD`
                    : 'Custom RFQ Required'}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <button
                  onClick={() => {
                    onAddToRFQ(activeModalComponent);
                    setActiveModalComponent(null);
                  }}
                  className="px-3 py-2 rounded bg-space-800 hover:bg-space-700 text-space-200 border border-space-700 transition-colors"
                >
                  REQUEST RFQ QUOTE
                </button>

                <button
                  onClick={() => {
                    onAddToBOM(activeModalComponent);
                    setActiveModalComponent(null);
                  }}
                  className="px-4 py-2 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold transition-colors"
                >
                  INSTALL IN MISSION BOM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
