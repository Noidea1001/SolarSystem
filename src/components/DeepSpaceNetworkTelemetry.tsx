'use client';

import React, { useState, useEffect } from 'react';
import { X, Radio, Signal, Globe, Zap, ArrowDown, ArrowUp, Activity } from 'lucide-react';

interface DeepSpaceNetworkTelemetryProps {
  onClose: () => void;
  language?: 'km' | 'en';
}

interface GroundStation {
  id: string;
  name: string;
  khmerName: string;
  location: string;
  khmerLocation: string;
  lat: number;
  lng: number;
  activeDishes: string[];
}

interface DsnTarget {
  id: string;
  name: string;
  khmerName: string;
  distanceAU: number;
  distanceKm: number;
  oneWayLightTimeSec: number;
  uplinkFreqGhz: number;
  downlinkFreqGhz: number;
  band: 'X-band' | 'Ka-band' | 'S-band';
  downlinkDataRate: string;
  signalStrengthDbm: number;
  primaryStationId: string;
  antennaDish: string;
  elevationDeg: number;
  azimuthDeg: number;
  status: string;
  khmerStatus: string;
}

const DSN_STATIONS: GroundStation[] = [
  {
    id: 'goldstone',
    name: 'Goldstone DSN Complex (GDSCC)',
    khmerName: 'ស្ថា​នីយ Goldstone (GDSCC)',
    location: 'Mojave Desert, California, USA',
    khmerLocation: 'វាលខ្សាច់ Mojave, រដ្ឋកាលីហ្វ័រញ៉ា, សហរដ្ឋអាមេរិក',
    lat: 35.42,
    lng: -116.89,
    activeDishes: ['DSS-14 (70m)', 'DSS-24 (34m)', 'DSS-26 (34m)'],
  },
  {
    id: 'madrid',
    name: 'Madrid DSN Complex (MDSCC)',
    khmerName: 'ស្ថា​នីយ Madrid (MDSCC)',
    location: 'Robledo de Chavela, Spain',
    khmerLocation: 'តំបន់ Robledo de Chavela, ប្រទេសអេស្ប៉ាញ',
    lat: 40.43,
    lng: -4.25,
    activeDishes: ['DSS-63 (70m)', 'DSS-65 (34m)', 'DSS-54 (34m)'],
  },
  {
    id: 'canberra',
    name: 'Canberra DSN Complex (CDSCC)',
    khmerName: 'ស្ថា​នីយ Canberra (CDSCC)',
    location: 'Tidbinbilla, ACT, Australia',
    khmerLocation: 'តំបន់ Tidbinbilla, រដ្ឋធានីកង់បេរ៉ា, ប្រទេសអូស្ត្រាលី',
    lat: -35.40,
    lng: 148.98,
    activeDishes: ['DSS-43 (70m)', 'DSS-34 (34m)', 'DSS-36 (34m)'],
  },
];

const DSN_TARGETS: DsnTarget[] = [
  {
    id: 'voyager1',
    name: 'Voyager 1 (Interstellar Space)',
    khmerName: 'យាន Voyager 1 (លំហអន្តរផ្កាយ)',
    distanceAU: 163.5,
    distanceKm: 24459000000,
    oneWayLightTimeSec: 81586, // ~22.66 hours
    uplinkFreqGhz: 2.114,
    downlinkFreqGhz: 8.415,
    band: 'X-band',
    downlinkDataRate: '160 bps',
    signalStrengthDbm: -161.4,
    primaryStationId: 'goldstone',
    antennaDish: 'DSS-14 (70m Mars Dish)',
    elevationDeg: 42.8,
    azimuthDeg: 168.3,
    status: 'ACTIVE TELEMETRY TRACKING',
    khmerStatus: 'កំពុងទទួលទិន្នន័យពីលំហអន្តរផ្កាយ',
  },
  {
    id: 'voyager2',
    name: 'Voyager 2 (Southern Interstellar)',
    khmerName: 'យាន Voyager 2 (លំហអន្តរផ្កាយភាគខាងត្បូង)',
    distanceAU: 136.2,
    distanceKm: 20375000000,
    oneWayLightTimeSec: 67963, // ~18.88 hours
    uplinkFreqGhz: 2.115,
    downlinkFreqGhz: 8.420,
    band: 'X-band',
    downlinkDataRate: '160 bps',
    signalStrengthDbm: -158.2,
    primaryStationId: 'canberra',
    antennaDish: 'DSS-43 (70m Sole Link)',
    elevationDeg: 68.4,
    azimuthDeg: 204.1,
    status: 'EXCLUSIVE CANBERRA LINK',
    khmerStatus: 'ទាក់ទងផ្តាច់មុខតាមអង់តែន Canberra 70m',
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope (JWST)',
    khmerName: 'កែវយឹតអវកាស James Webb (JWST)',
    distanceAU: 0.010,
    distanceKm: 1500000,
    oneWayLightTimeSec: 5.0,
    uplinkFreqGhz: 2.09,
    downlinkFreqGhz: 25.9,
    band: 'Ka-band',
    downlinkDataRate: '28.0 Mbps',
    signalStrengthDbm: -92.5,
    primaryStationId: 'madrid',
    antennaDish: 'DSS-54 (34m BWG)',
    elevationDeg: 54.1,
    azimuthDeg: 122.7,
    status: 'HIGH-RATE SCIENCE DOWNLINK',
    khmerStatus: 'កំពុងបញ្ជូនរូបភាពវិទ្យាសាស្ត្រល្បឿនលឿន',
  },
  {
    id: 'perseverance',
    name: 'Perseverance & MRO (Mars)',
    khmerName: 'រ៉ូវ័រ Perseverance និង MRO (ភពអង្គារ)',
    distanceAU: 1.52,
    distanceKm: 227390000,
    oneWayLightTimeSec: 758, // ~12.6 minutes
    uplinkFreqGhz: 7.15,
    downlinkFreqGhz: 8.42,
    band: 'X-band',
    downlinkDataRate: '2.0 Mbps (via MRO Relay)',
    signalStrengthDbm: -118.4,
    primaryStationId: 'goldstone',
    antennaDish: 'DSS-24 (34m BWG)',
    elevationDeg: 31.6,
    azimuthDeg: 215.8,
    status: 'MARTIAN SURFACE RELAY',
    khmerStatus: 'ការបញ្ជូនតពីរ៉ូវ័រលើផ្ទៃភពអង្គារ',
  },
  {
    id: 'parker',
    name: 'Parker Solar Probe',
    khmerName: 'យានអង្កេតព្រះអាទិត្យ Parker',
    distanceAU: 0.28,
    distanceKm: 41890000,
    oneWayLightTimeSec: 140, // ~2.3 minutes
    uplinkFreqGhz: 7.18,
    downlinkFreqGhz: 32.0,
    band: 'Ka-band',
    downlinkDataRate: '500 kbps',
    signalStrengthDbm: -104.1,
    primaryStationId: 'madrid',
    antennaDish: 'DSS-65 (34m HEF)',
    elevationDeg: 62.9,
    azimuthDeg: 89.4,
    status: 'SOLAR PERIHELION TRACKING',
    khmerStatus: 'តាមដានការហោះកាត់ស្រទាប់កូរ៉ូណាព្រះអាទិត្យ',
  },
];

export default function DeepSpaceNetworkTelemetry({ onClose, language = 'km' }: DeepSpaceNetworkTelemetryProps) {
  const [selectedTarget, setSelectedTarget] = useState<DsnTarget>(DSN_TARGETS[0]);
  const [carrierPulse, setCarrierPulse] = useState(0);

  // Animated radio wave packet ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setCarrierPulse((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const activeStation = DSN_STATIONS.find((s) => s.id === selectedTarget.primaryStationId)!;

  // Format One-Way Light Time
  const formatLightTime = (sec: number) => {
    if (sec < 60) return `${sec.toFixed(1)} seconds`;
    if (sec < 3600) return `${(sec / 60).toFixed(1)} minutes`;
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-space-900 border border-aeroblue/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-aeroblue animate-pulse" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {language === 'km' ? 'បណ្តាញអង់តែនដីគោក NASA DEEP SPACE NETWORK (DSN)' : 'NASA DEEP SPACE NETWORK (DSN) TELEMETRY'}
              </h2>
              <p className="text-[10px] text-space-400">
                {language === 'km' ? 'ស្ថានីយអង់តែនទាក់ទងយានអវកាសជ្រៅ 120 ដឺក្រេជុំវិញផែនដី (Goldstone, Madrid, Canberra)' : 'Continuous 360-degree Ground Interplanetary Communication Array'}
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
          {/* Active Missions Quick Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-space-400 uppercase tracking-wider">
              {language === 'km' ? 'យានអវកាសកំពុងភ្ជាប់ទំនាក់ទំនង (TRACKED SPACECRAFT):' : 'TRACKED SPACECRAFT:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {DSN_TARGETS.map((target) => (
                <button
                  key={target.id}
                  onClick={() => setSelectedTarget(target)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTarget.id === target.id
                      ? 'bg-aeroblue/15 border-aeroblue text-white shadow-lg'
                      : 'bg-space-950/80 hover:bg-space-850 border-space-800 text-space-300'
                  }`}
                >
                  <div className="font-bold text-xs text-white flex items-center justify-between">
                    <span>{language === 'km' ? target.khmerName : target.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-space-800 text-aeroblue font-bold">
                      {target.band}
                    </span>
                  </div>
                  <div className="text-[10px] text-space-400 mt-1 flex items-center justify-between">
                    <span>{target.distanceAU >= 1 ? `${target.distanceAU.toFixed(1)} AU` : `${(target.distanceKm / 1e6).toFixed(1)}M km`}</span>
                    <span className="text-aerogreen font-semibold">{target.downlinkDataRate}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DSN Global Ground Stations 120-degree Layout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DSN_STATIONS.map((station) => {
              const isActive = selectedTarget.primaryStationId === station.id;

              return (
                <div
                  key={station.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-space-950 border-aeroblue shadow-md'
                      : 'bg-space-950/60 border-space-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">
                      {language === 'km' ? station.khmerName : station.name}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-aerogreen animate-ping" />
                    )}
                  </div>
                  <div className="text-[10px] text-space-400">
                    {language === 'km' ? station.khmerLocation : station.location}
                  </div>
                  <div className="text-[9px] text-space-500 mt-1">
                    Coords: {station.lat}&deg;N, {station.lng}&deg;E
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {station.activeDishes.map((dish, i) => (
                      <span
                        key={i}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          isActive && selectedTarget.antennaDish.startsWith(dish.slice(0, 6))
                            ? 'bg-aeroblue text-space-950 font-bold'
                            : 'bg-space-900 text-space-400 border border-space-800'
                        }`}
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-Time Signal Link Telemetry Console */}
          <div className="p-4 bg-space-950 rounded-xl border border-space-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-space-800">
              <div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-aerogreen/15 text-aerogreen border border-aerogreen/30 font-bold uppercase tracking-wider">
                  {language === 'km' ? selectedTarget.khmerStatus : selectedTarget.status}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {language === 'km' ? selectedTarget.khmerName : selectedTarget.name} &harr; {selectedTarget.antennaDish}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-space-400 block uppercase font-bold">
                  {language === 'km' ? 'ចម្ងាយសរុប (DISTANCE)' : 'PHYSICAL DISTANCE'}
                </span>
                <span className="text-base font-bold text-aeroblue">
                  {selectedTarget.distanceKm.toLocaleString()} km ({selectedTarget.distanceAU} AU)
                </span>
              </div>
            </div>

            {/* Signal Propagation Diagram */}
            <div className="relative py-4 bg-space-900/60 rounded-xl border border-space-850 px-4 overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-white relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-aeroblue" />
                  <span>{activeStation.name.split(' (')[0]}</span>
                </div>
                <div className="text-[10px] text-aeroamber font-mono">
                  ONE-WAY LIGHT TIME: {formatLightTime(selectedTarget.oneWayLightTimeSec)}
                </div>
                <div className="flex items-center gap-2">
                  <span>{selectedTarget.name.split(' (')[0]}</span>
                  <div className="w-3 h-3 rounded-full bg-aerogreen animate-pulse" />
                </div>
              </div>

              {/* Animated Wave Pulses */}
              <div className="relative w-full h-3 my-2 bg-space-800/80 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-aeroblue to-transparent opacity-80"
                  style={{ left: `${carrierPulse}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-aerogreen to-transparent opacity-80"
                  style={{ right: `${carrierPulse}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-space-400">
                <span className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3 text-aeroblue" /> Uplink: {selectedTarget.uplinkFreqGhz} GHz
                </span>
                <span>Round-Trip: {formatLightTime(selectedTarget.oneWayLightTimeSec * 2)}</span>
                <span className="flex items-center gap-1">
                  <ArrowDown className="w-3 h-3 text-aerogreen" /> Downlink: {selectedTarget.downlinkFreqGhz} GHz ({selectedTarget.band})
                </span>
              </div>
            </div>

            {/* 4 Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[10px]">
              <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-800">
                <span className="text-space-400 block">{language === 'km' ? 'កម្លាំងរលកសញ្ញា' : 'SIGNAL STRENGTH'}</span>
                <span className="text-white font-bold text-xs">{selectedTarget.signalStrengthDbm} dBm</span>
              </div>
              <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-800">
                <span className="text-space-400 block">{language === 'km' ? 'ល្បឿនបញ្ជូនទិន្នន័យ' : 'DOWNLINK DATA RATE'}</span>
                <span className="text-aerogreen font-bold text-xs">{selectedTarget.downlinkDataRate}</span>
              </div>
              <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-800">
                <span className="text-space-400 block">{language === 'km' ? 'មុំងើបអង់តែន Elevation' : 'ANTENNA ELEVATION'}</span>
                <span className="text-aeroblue font-bold text-xs">{selectedTarget.elevationDeg}&deg; above horizon</span>
              </div>
              <div className="p-2.5 bg-space-900/80 rounded-xl border border-space-800">
                <span className="text-space-400 block">{language === 'km' ? 'ទិសដៅ Azimuth' : 'ANTENNA AZIMUTH'}</span>
                <span className="text-aeroamber font-bold text-xs">{selectedTarget.azimuthDeg}&deg; (compass heading)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
