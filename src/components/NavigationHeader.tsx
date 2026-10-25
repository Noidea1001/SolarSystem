'use client';

import React from 'react';
import {
  Globe,
  Sun,
  Compass,
  Rocket,
  Satellite,
  Radio,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export type ActiveTab = 'observatory' | 'planetary' | 'spacetech' | 'missions';

interface NavigationHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export default function NavigationHeader({
  activeTab,
  onTabChange,
}: NavigationHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-space-950/95 backdrop-blur-md border-b border-space-800 font-mono">
      {/* Top Telemetry & Clearance Ticker */}
      <div className="border-b border-space-900 bg-space-900/60 px-4 py-1.5 text-[11px] text-space-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-space-300">
            <span className="w-1.5 h-1.5 rounded-full bg-aeroblue animate-pulse" />
            <span className="tracking-wide">AEROVEX SPACE PLATFORM</span>
            <span className="text-space-600">/</span>
            <span className="text-aeroblue-light">PURE SPACE SCIENCE & KNOWLEDGE EXPLORATION</span>
          </div>

          <div className="hidden md:flex items-center gap-3 border-l border-space-800 pl-4 text-space-400">
            <span>OBSERVATORY DATA: 100% AUTHENTIC SENSOR PHOTOGRAPHY</span>
            <span className="text-space-600">&bull;</span>
            <span className="text-aerogreen">STATUS: ACTIVE SCIENCE ENGINE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-space-400">
            TIME (UTC): {new Date().toISOString().substring(11, 19)}Z
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => onTabChange('observatory')}
          className="cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded bg-space-800 border border-space-700 flex items-center justify-center text-aeroblue group-hover:border-aeroblue transition-colors">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>AEROVEX</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-aeroblue/10 text-aeroblue border border-aeroblue/30 rounded">
                EXPLORE KNOWLEDGE
              </span>
            </div>
            <div className="text-[10px] text-space-400 tracking-tight">
              ASTRONOMY &bull; PLANETARY SCIENCE &bull; SATELLITE ENGINEERING
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
          <button
            onClick={() => onTabChange('observatory')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'observatory'
                ? 'bg-space-800 text-aeroblue-light border border-space-700 shadow-sm shadow-aeroblue/10 font-bold'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-aeroblue" />
            <span>Earth & Space Observatory</span>
          </button>

          <button
            onClick={() => onTabChange('planetary')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'planetary'
                ? 'bg-space-800 text-aeroamber-light border border-space-700 shadow-sm shadow-aeroamber/10 font-bold'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-aeroamber" />
            <span>Planetary Science Atlas</span>
          </button>

          <button
            onClick={() => onTabChange('spacetech')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'spacetech'
                ? 'bg-space-800 text-aeroblue-light border border-space-700 shadow-sm shadow-aeroblue/10 font-bold'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-aeroblue" />
            <span>Space Technology & Orbits</span>
          </button>

          <button
            onClick={() => onTabChange('missions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'missions'
                ? 'bg-space-800 text-aerogreen-light border border-space-700 shadow-sm shadow-aerogreen/10 font-bold'
                : 'text-space-300 hover:text-white hover:bg-space-900'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-aerogreen" />
            <span>Mission Exploration Archives</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
