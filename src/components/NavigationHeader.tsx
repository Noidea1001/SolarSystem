'use client';

import React from 'react';
import {
  Satellite,
  Compass,
  Layers,
  ShoppingBag,
  Rocket,
  Radio,
  FileText,
  ShieldCheck,
  Cpu,
  BarChart3,
  SlidersHorizontal,
  Globe,
} from 'lucide-react';

export type ActiveTab = 'explorer' | 'architect' | 'catalog' | 'marketplace' | 'rideshare' | 'ground' | 'comparator' | 'supplier';

interface NavigationHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  rfqCount: number;
  bomCount: number;
  itarFreeOnly: boolean;
  onToggleItarFree: () => void;
}

export default function NavigationHeader({
  activeTab,
  onTabChange,
  rfqCount,
  bomCount,
  itarFreeOnly,
  onToggleItarFree,
}: NavigationHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-space-950/95 backdrop-blur-md border-b border-space-800">
      {/* Top Telemetry & Clearance Ticker */}
      <div className="border-b border-space-900 bg-space-900/60 px-4 py-1.5 text-[11px] font-mono text-space-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-space-300">
            <span className="w-1.5 h-1.5 rounded-full bg-aeroblue animate-pulse" />
            <span className="tracking-wide">AEROVEX SPACE PLATFORM</span>
            <span className="text-space-600">/</span>
            <span className="text-aeroblue-light">ORBITAL SPEC & MARKETPLACE</span>
          </div>

          <div className="hidden md:flex items-center gap-3 border-l border-space-800 pl-4 text-space-400">
            <span>NETWORK: LEO CONSTELLATION SYNC</span>
            <span className="text-space-600">&bull;</span>
            <span className="text-aerogreen">SECURITY: TRL-VERIFIED</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ITAR Filter Switch */}
          <button
            onClick={onToggleItarFree}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] border transition-colors ${
              itarFreeOnly
                ? 'bg-aerogreen/15 border-aerogreen text-aerogreen-light'
                : 'bg-space-850 border-space-700 text-space-300 hover:border-space-500'
            }`}
            title="Filter by ITAR-Free hardware suitable for global export"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EXPORT FILTER: {itarFreeOnly ? 'ITAR-FREE ONLY' : 'ALL REGIMES'}</span>
          </button>

          <div className="text-space-400 border-l border-space-800 pl-3">
            UTC: {new Date().toISOString().substring(11, 19)}Z
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => onTabChange('architect')}
          className="cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded bg-space-800 border border-space-700 flex items-center justify-center text-aeroblue group-hover:border-aeroblue transition-colors">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>AEROVEX</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-aeroblue/10 text-aeroblue border border-aeroblue/30 rounded font-mono">
                NEWSPACE OS
              </span>
            </div>
            <div className="text-[10px] text-space-400 font-mono tracking-tight">
              AEROSPACE ARCHITECTURE & B2B PROCUREMENT
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onTabChange('explorer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'explorer'
                ? 'bg-space-800 text-aeroblue-light border border-space-700 shadow-sm shadow-aeroblue/10'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-aeroblue" />
            <span>Real Earth & Deep Space</span>
          </button>

          <button
            onClick={() => onTabChange('architect')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'architect'
                ? 'bg-space-800 text-aeroblue-light border border-space-700'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Mission Architect</span>
            {bomCount > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-space-700 text-aeroblue rounded-full font-mono">
                {bomCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('catalog')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'bg-space-800 text-aeroblue-light border border-space-700'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Subsystems Catalog</span>
          </button>

          <button
            onClick={() => onTabChange('marketplace')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'marketplace'
                ? 'bg-space-800 text-aeroblue-light border border-space-700'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>B2B Marketplace & RFQ</span>
            {rfqCount > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-aeroamber/20 text-aeroamber border border-aeroamber/30 rounded-full font-mono">
                {rfqCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('rideshare')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'rideshare'
                ? 'bg-space-800 text-aeroblue-light border border-space-700'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Launch Rideshare</span>
          </button>

          <button
            onClick={() => onTabChange('ground')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'ground'
                ? 'bg-space-800 text-aeroblue-light border border-space-700'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>GSaaS Network</span>
          </button>

          <button
            onClick={() => onTabChange('comparator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'comparator'
                ? 'bg-space-800 text-aeroblue-light border border-space-700'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Spec Matrix</span>
          </button>

          <button
            onClick={() => onTabChange('supplier')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'supplier'
                ? 'bg-space-800 text-aeroblue-light border border-space-700'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Supplier Portal</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
