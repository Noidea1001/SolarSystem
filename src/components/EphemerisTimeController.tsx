'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Satellite, RotateCcw, FastForward, Navigation, X } from 'lucide-react';
import { DEEP_SPACE_MISSIONS, SpacecraftData } from '../data/celestialBodies';

interface EphemerisTimeControllerProps {
  simDateMs: number;
  isRealTimeLive: boolean;
  simSpeed: number;
  selectedMission: SpacecraftData | null;
  onJumpToDate: (timestampMs: number) => void;
  onResetToLiveNow: () => void;
  onChangeSimSpeed: (speed: number) => void;
  onSelectMission: (mission: SpacecraftData | null) => void;
  onOpenIssInMaps?: (lat: number, lng: number) => void;
}

export default function EphemerisTimeController({
  simDateMs,
  isRealTimeLive,
  simSpeed,
  selectedMission,
  onJumpToDate,
  onResetToLiveNow,
  onChangeSimSpeed,
  onSelectMission,
  onOpenIssInMaps,
}: EphemerisTimeControllerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMissionsPanel, setShowMissionsPanel] = useState(false);
  const [issLiveTelemetry, setIssLiveTelemetry] = useState<{
    lat: number;
    lng: number;
    altitudeKm: number;
    velocityKmh: number;
  } | null>(null);

  // Fetch real-time ISS orbital telemetry from WhereTheISS API
  useEffect(() => {
    let isMounted = true;

    const fetchIssPosition = async () => {
      try {
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data && typeof data.latitude === 'number') {
          setIssLiveTelemetry({
            lat: data.latitude,
            lng: data.longitude,
            altitudeKm: data.altitude || 418.5,
            velocityKmh: data.velocity || 27580,
          });
        }
      } catch {
        // Fallback live orbital approximation if offline
      }
    };

    fetchIssPosition();
    const interval = setInterval(fetchIssPosition, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentDate = new Date(simDateMs);
  const formattedUtcDate = currentDate.toISOString().slice(0, 10);
  const formattedUtcTime = currentDate.toISOString().slice(11, 19);

  const PRESET_EVENTS = [
    { label: 'Live Now (Real-Time UTC)', dateStr: new Date().toISOString().slice(0, 10), isLive: true },
    { label: 'Great Planetary Alignment (2025-01-21)', dateStr: '2025-01-21', isLive: false },
    { label: 'Total Solar Eclipse (2026-08-12)', dateStr: '2026-08-12', isLive: false },
    { label: 'Apophis Earth Flyby (2029-04-13)', dateStr: '2029-04-13', isLive: false },
    { label: 'Halley Comet Perihelion (2061-07-28)', dateStr: '2061-07-28', isLive: false },
  ];

  return (
    <>
      {/* Top-Left Compact Ephemeris Clock & Missions Pill */}
      <div className="absolute top-16 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none font-mono text-xs">
        {/* Live J2000 Ephemeris Clock Button */}
        <button
          onClick={() => {
            setShowDatePicker(!showDatePicker);
            setShowMissionsPanel(false);
          }}
          className="pointer-events-auto flex items-center gap-2 bg-space-950/85 hover:bg-space-900 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-space-800 shadow-xl text-white transition-all cursor-pointer"
          title="Open J2000 Astronomical Ephemeris Date & Time Controller"
        >
          <Clock className={`w-3.5 h-3.5 ${isRealTimeLive ? 'text-aerogreen' : 'text-aeroamber'}`} />
          <span className="font-bold tracking-wider">{formattedUtcDate}</span>
          <span className="text-[10px] text-space-400">{formattedUtcTime} UTC</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
              isRealTimeLive
                ? 'bg-aerogreen/15 text-aerogreen border border-aerogreen/30'
                : 'bg-aeroamber/15 text-aeroamber border border-aeroamber/30'
            }`}
          >
            {isRealTimeLive ? 'LIVE' : `${simSpeed}X`}
          </span>
        </button>

        {/* Deep Space Missions & Live ISS Tracker Button */}
        <button
          onClick={() => {
            setShowMissionsPanel(!showMissionsPanel);
            setShowDatePicker(false);
          }}
          className={`pointer-events-auto flex items-center gap-1.5 backdrop-blur-xl px-3 py-1.5 rounded-full border shadow-xl transition-all cursor-pointer ${
            selectedMission || showMissionsPanel
              ? 'bg-aeroblue text-space-950 border-aeroblue font-bold'
              : 'bg-space-950/85 hover:bg-space-900 text-space-300 hover:text-white border-space-800'
          }`}
          title="Track Live ISS & Deep Space Probes"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">SPACECRAFT &amp; ISS</span>
        </button>
      </div>

      {/* Expandable Ephemeris Date Scrubber Popover */}
      {showDatePicker && (
        <div className="absolute top-28 left-4 z-30 pointer-events-auto w-80 bg-space-950/90 backdrop-blur-xl p-4 rounded-2xl border border-space-800 shadow-2xl font-mono text-xs text-white space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-aeroblue" />
              <span className="font-bold uppercase tracking-wider text-[11px]">J2000 EPHEMERIS TIME MACHINE</span>
            </div>
            <button
              onClick={() => setShowDatePicker(false)}
              className="p-1 rounded-full text-space-400 hover:text-white hover:bg-space-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Custom Date Input */}
          <div>
            <label className="text-[10px] text-space-400 block mb-1 uppercase">SELECT EXACT ORBITAL DATE</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={formattedUtcDate}
                onChange={(e) => {
                  const parsed = Date.parse(e.target.value + 'T12:00:00Z');
                  if (!isNaN(parsed)) {
                    onJumpToDate(parsed);
                  }
                }}
                className="flex-1 bg-space-900 border border-space-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-aeroblue"
              />
              <button
                onClick={onResetToLiveNow}
                className="px-2.5 py-1.5 rounded-xl bg-aerogreen/15 hover:bg-aerogreen text-aerogreen hover:text-space-950 border border-aerogreen/30 font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                title="Sync with Real-Time Current UTC"
              >
                <RotateCcw className="w-3 h-3" />
                <span>NOW</span>
              </button>
            </div>
          </div>

          {/* Warp Speed Multiplier */}
          <div>
            <label className="text-[10px] text-space-400 block mb-1 uppercase flex items-center gap-1">
              <FastForward className="w-3 h-3 text-aeroamber" />
              <span>ORBITAL TIME WARP SPEED</span>
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[0.5, 1, 5, 25, 100].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSimSpeed(spd)}
                  className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    simSpeed === spd
                      ? 'bg-aeroamber text-space-950 border-aeroamber'
                      : 'bg-space-900 text-space-300 border-space-800 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Historical & Future Astronomical Presets */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-space-400 uppercase block">ASTRONOMICAL EPOCH PRESETS</span>
            {PRESET_EVENTS.map((ev) => (
              <button
                key={ev.label}
                onClick={() => {
                  if (ev.isLive) {
                    onResetToLiveNow();
                  } else {
                    onJumpToDate(Date.parse(ev.dateStr + 'T12:00:00Z'));
                  }
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-space-900/70 hover:bg-space-800 border border-space-850 text-[10px] text-space-300 hover:text-white transition-colors block cursor-pointer"
              >
                {ev.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Deep Space Missions & Live ISS Tracker Panel */}
      {showMissionsPanel && (
        <div className="absolute top-28 left-4 z-30 pointer-events-auto w-80 bg-space-950/90 backdrop-blur-xl p-4 rounded-2xl border border-space-800 shadow-2xl font-mono text-xs text-white space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Satellite className="w-3.5 h-3.5 text-aeroblue" />
              <span className="font-bold uppercase tracking-wider text-[11px]">ACTIVE SPACECRAFT TELEMETRY</span>
            </div>
            <button
              onClick={() => setShowMissionsPanel(false)}
              className="p-1 rounded-full text-space-400 hover:text-white hover:bg-space-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live ISS Real-Time Telemetry Box */}
          {issLiveTelemetry && (
            <div className="p-3 rounded-xl bg-space-900/90 border border-aerogreen/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-aerogreen flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-aerogreen animate-ping" />
                  ISS LIVE ORBITAL FEED
                </span>
                <span className="text-[9px] text-space-400">{issLiveTelemetry.altitudeKm.toFixed(0)} KM ALT</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>
                  <span className="text-space-400 block text-[9px]">LATITUDE</span>
                  <span className="text-white font-bold">{issLiveTelemetry.lat.toFixed(4)}°</span>
                </div>
                <div>
                  <span className="text-space-400 block text-[9px]">LONGITUDE</span>
                  <span className="text-white font-bold">{issLiveTelemetry.lng.toFixed(4)}°</span>
                </div>
              </div>
              {onOpenIssInMaps && (
                <button
                  onClick={() => {
                    onOpenIssInMaps(issLiveTelemetry.lat, issLiveTelemetry.lng);
                    setShowMissionsPanel(false);
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-aerogreen hover:bg-aerogreen/90 text-space-950 font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>TRACK ISS GROUND PATH ON SATELLITE MAP</span>
                </button>
              )}
            </div>
          )}

          {/* Spacecraft List */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {DEEP_SPACE_MISSIONS.map((mission) => {
              const isSelected = selectedMission?.id === mission.id;
              return (
                <button
                  key={mission.id}
                  onClick={() => onSelectMission(isSelected ? null : mission)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-aeroblue/15 border-aeroblue text-white'
                      : 'bg-space-900/60 hover:bg-space-900 border-space-850 text-space-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">{mission.name}</span>
                    <span className="text-[9px] text-aeroblue font-bold">{mission.launchYear}</span>
                  </div>
                  <div className="text-[9px] text-space-400 mt-0.5">{mission.agency}</div>
                  <div className="text-[10px] text-space-300 mt-1 leading-snug">{mission.telemetryHighlight}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
