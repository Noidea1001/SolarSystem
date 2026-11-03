'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, RotateCcw, FastForward, X, Globe2 } from 'lucide-react';

interface EphemerisTimeControllerProps {
  simDateMs: number;
  isRealTimeLive: boolean;
  simSpeed: number;
  onJumpToDate: (timestampMs: number) => void;
  onResetToLiveNow: () => void;
  onChangeSimSpeed: (speed: number) => void;
}

export default function EphemerisTimeController({
  simDateMs,
  isRealTimeLive,
  simSpeed,
  onJumpToDate,
  onResetToLiveNow,
  onChangeSimSpeed,
}: EphemerisTimeControllerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [useLocalTime, setUseLocalTime] = useState(true);
  const [userTzName, setUserTzName] = useState('Local Time');
  const [tzOffsetStr, setTzOffsetStr] = useState('LOCAL');

  // Detect user local real time timezone and offset
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setUserTzName(tz.replace(/_/g, ' '));
      const offsetMin = -new Date().getTimezoneOffset();
      const sign = offsetMin >= 0 ? '+' : '-';
      const absH = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
      const absM = String(Math.abs(offsetMin) % 60).padStart(2, '0');
      setTzOffsetStr(`GMT${sign}${absH}:${absM}`);
    } catch {
      setTzOffsetStr('LOCAL');
    }
  }, []);

  const currentDate = new Date(simDateMs);

  // User Local Real-Time Formats
  const localYear = currentDate.getFullYear();
  const localMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const localDay = String(currentDate.getDate()).padStart(2, '0');
  const formattedLocalDate = `${localYear}-${localMonth}-${localDay}`;
  const localHours = String(currentDate.getHours()).padStart(2, '0');
  const localMinutes = String(currentDate.getMinutes()).padStart(2, '0');
  const localSeconds = String(currentDate.getSeconds()).padStart(2, '0');
  const formattedLocalTime = `${localHours}:${localMinutes}:${localSeconds}`;

  // Astronomical UTC Formats
  const formattedUtcDate = currentDate.toISOString().slice(0, 10);
  const formattedUtcTime = currentDate.toISOString().slice(11, 19);

  const activeDateStr = useLocalTime ? formattedLocalDate : formattedUtcDate;
  const activeTimeStr = useLocalTime ? formattedLocalTime : formattedUtcTime;
  const activeLabel = useLocalTime ? tzOffsetStr : 'UTC';

  const PRESET_EVENTS = [
    { label: `Live Now (Your Local Real Time: ${tzOffsetStr})`, dateStr: formattedLocalDate, isLive: true },
    { label: 'Great Planetary Alignment (2025-01-21)', dateStr: '2025-01-21', isLive: false },
    { label: 'Total Solar Eclipse (2026-08-12)', dateStr: '2026-08-12', isLive: false },
    { label: 'Apophis Earth Flyby (2029-04-13)', dateStr: '2029-04-13', isLive: false },
    { label: 'Halley Comet Perihelion (2061-07-28)', dateStr: '2061-07-28', isLive: false },
  ];

  return (
    <>
      {/* Top-Left Compact Ephemeris & Real-Time Clock Pill */}
      <div className="absolute top-11 sm:top-16 left-2 sm:left-4 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-none font-mono text-[11px] sm:text-xs">
        {/* Live Ephemeris Clock Button */}
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-space-950/90 hover:bg-space-900 backdrop-blur-xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-space-800 shadow-xl text-white transition-all cursor-pointer"
          title="Open Astronomical Date, Time & Ephemeris Controller"
        >
          <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isRealTimeLive ? 'text-aerogreen' : 'text-aeroamber'}`} />
          <span className="font-bold tracking-wider text-[10px] sm:text-xs">{activeDateStr}</span>
          <span className="text-[10px] sm:text-[11px] text-space-300 font-semibold">{activeTimeStr}</span>
          <span className="text-[9px] text-aeroblue font-bold hidden xs:inline">{activeLabel}</span>
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
      </div>

      {/* Expandable Ephemeris Date Scrubber Popover */}
      {showDatePicker && (
        <div className="absolute top-21 sm:top-28 left-2 sm:left-4 z-30 pointer-events-auto w-[calc(100vw-1rem)] max-w-xs sm:w-80 bg-space-950/95 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border border-space-800 shadow-2xl font-mono text-xs text-white space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-aeroblue" />
              <span className="font-bold uppercase tracking-wider text-[11px]">EPHEMERIS TIME MACHINE</span>
            </div>
            <button
              onClick={() => setShowDatePicker(false)}
              className="p-1 rounded-full text-space-400 hover:text-white hover:bg-space-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Mode Toggle: User Local Time vs Astronomical UTC */}
          <div className="bg-space-900/80 p-1 rounded-xl border border-space-800 flex items-center gap-1">
            <button
              onClick={() => setUseLocalTime(true)}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                useLocalTime
                  ? 'bg-aeroblue text-space-950 shadow-sm'
                  : 'text-space-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>MY LOCAL TIME</span>
            </button>
            <button
              onClick={() => setUseLocalTime(false)}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                !useLocalTime
                  ? 'bg-aeroblue text-space-950 shadow-sm'
                  : 'text-space-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3 h-3" />
              <span>UTC (ASTRONOMY)</span>
            </button>
          </div>

          {/* Real-Time User Local Time Readout */}
          <div className="bg-space-900/50 p-2.5 rounded-xl border border-space-850 space-y-1 text-[11px]">
            <div className="flex justify-between items-center text-space-400 text-[10px] uppercase">
              <span>USER LOCAL TIME</span>
              <span className="text-aeroblue font-bold">{tzOffsetStr}</span>
            </div>
            <div className="text-white font-bold flex items-center justify-between">
              <span>{formattedLocalDate} {formattedLocalTime}</span>
              <span className="text-[10px] text-space-400 truncate max-w-[110px]">{userTzName}</span>
            </div>
            <div className="text-[10px] text-space-500 pt-0.5">
              UTC Reference: {formattedUtcDate} {formattedUtcTime} UTC
            </div>
          </div>

          {/* Custom Date Input */}
          <div>
            <label className="text-[10px] text-space-400 block mb-1 uppercase">SELECT EXACT ORBITAL DATE</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={activeDateStr}
                onChange={(e) => {
                  const val = e.target.value;
                  const parsed = useLocalTime
                    ? new Date(`${val}T12:00:00`).getTime()
                    : Date.parse(`${val}T12:00:00Z`);
                  if (!isNaN(parsed)) {
                    onJumpToDate(parsed);
                  }
                }}
                className="flex-1 bg-space-900 border border-space-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-aeroblue"
              />
              <button
                onClick={onResetToLiveNow}
                className="px-2.5 py-1.5 rounded-xl bg-aerogreen/15 hover:bg-aerogreen text-aerogreen hover:text-space-950 border border-aerogreen/30 font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                title="Catch User Real-Time Local Clock Now"
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
            <div className="grid grid-cols-6 gap-1">
              {[0.5, 1, 5, 25, 100, 1000].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSimSpeed(spd)}
                  className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    simSpeed === spd
                      ? 'bg-aeroamber text-space-950 border-aeroamber'
                      : 'bg-space-900 text-space-300 border-space-800 hover:text-white'
                  }`}
                >
                  {spd === 1 ? '1x (LIVE)' : `${spd}x`}
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
    </>
  );
}
