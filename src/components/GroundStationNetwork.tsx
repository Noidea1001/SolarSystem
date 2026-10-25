'use client';

import React, { useState } from 'react';
import {
  Radio,
  MapPin,
  Clock,
  Zap,
  DollarSign,
  CheckCircle,
  Calendar,
  Send,
  Activity,
  HardDrive,
} from 'lucide-react';
import { GROUND_STATION_PASSES } from '../data/spaceComponents';
import { GroundStationPass } from '../types/space';

export default function GroundStationNetwork() {
  const [selectedStation, setSelectedStation] = useState<GroundStationPass>(GROUND_STATION_PASSES[0]);
  const [selectedBand, setSelectedBand] = useState<'S_BAND' | 'X_BAND' | 'UHF'>('X_BAND');
  const [passDurationMin, setPassDurationMin] = useState<number>(10);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  const costPerPass = passDurationMin * selectedStation.costPerMinuteUsd;
  // Estimated data volume: X-band ~ 100 Mbps => 12.5 MB/s * 60s * duration
  const dataRateMbps = selectedBand === 'X_BAND' ? 100 : selectedBand === 'S_BAND' ? 2.5 : 0.05;
  const estimatedDataGigabytes = Number(
    (((dataRateMbps * 1000000) / 8 / (1024 * 1024 * 1024)) * 60 * passDurationMin).toFixed(2)
  );

  const handleSchedulePass = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduledSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                GROUND STATION AS A SERVICE (GSAAS) NETWORK
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Global polar and equatorial parabolic telemetry tracking dishes. Schedule direct downlinks for high-rate
              Earth observation data and command uplink windows with automated cloud streaming.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-space-400">
            <span>AVAILABLE DISHES:</span>
            <span className="text-aeroblue font-bold">{GROUND_STATION_PASSES.length} APERTURES</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Station Aperture Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {GROUND_STATION_PASSES.map((station) => {
            const isSelected = selectedStation.id === station.id;

            return (
              <div
                key={station.id}
                onClick={() => {
                  setSelectedStation(station);
                  setScheduledSuccess(false);
                }}
                className={`hud-panel p-5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-aeroblue bg-space-900/90 shadow-lg shadow-aeroblue/10'
                    : 'border-space-800 bg-space-900/50 hover:border-space-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-aeroblue-light border border-space-700">
                        {station.dishDiameterMeters}m Parabolic Aperture
                      </span>
                      <span className="text-[10px] font-mono text-space-400">
                        Elev: {station.elevationMeters}m
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-1.5 font-mono">{station.stationName}</h3>
                    <div className="text-xs text-space-400 font-mono">
                      Operator: <span className="text-space-200">{station.operator}</span>
                    </div>
                  </div>

                  <div className="sm:text-right font-mono">
                    <div className="text-sm font-bold text-aeroblue-light">
                      ${station.costPerMinuteUsd.toFixed(2)} / min
                    </div>
                    <div className="text-[10px] text-space-400">Tracking Pass Rate</div>
                  </div>
                </div>

                {/* Frequency Bands Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-space-850">
                  <span className="text-[10px] font-mono text-space-500 mr-1">SUPPORTED RF BANDS:</span>
                  {station.frequencyBands.map((band) => (
                    <span
                      key={band}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 text-aeroblue-light border border-space-800"
                    >
                      {band.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Coordinates & Coverage */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-space-400 pt-2 border-t border-space-850">
                  <div>
                    <span className="text-space-500 block text-[10px]">COORDINATES</span>
                    <span>
                      {station.latitude}° N, {station.longitude}° E
                    </span>
                  </div>
                  <div>
                    <span className="text-space-500 block text-[10px]">HORIZON ANGLE</span>
                    <span>Up to {station.maxElevationAngleDeg}° Elev</span>
                  </div>
                  <div>
                    <span className="text-space-500 block text-[10px]">PASS CADENCE</span>
                    <span className="text-aerogreen">Continuous Polar</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Pass Scheduling & Throughput Calculator (5 cols) */}
        <div className="lg:col-span-5">
          <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80 font-mono text-xs">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-aeroblue" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-white">
                PASS SCHEDULER & BANDWIDTH CALCULATOR
              </h3>
            </div>

            {scheduledSuccess ? (
              <div className="p-5 rounded bg-aerogreen/10 border border-aerogreen/30 space-y-3">
                <div className="flex items-center gap-2 text-aerogreen font-bold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  <span>GROUND TRACKING PASS RESERVED</span>
                </div>
                <div className="text-space-300 text-[11px] space-y-1">
                  <div>Ground Station: <strong className="text-white">{selectedStation.stationName}</strong></div>
                  <div>RF Carrier: <strong className="text-white">{selectedBand.replace('_', ' ')}</strong></div>
                  <div>Pass Window: <strong className="text-white">{passDurationMin} Minutes</strong></div>
                  <div>Estimated Data Received: <strong className="text-aeroblue-light">{estimatedDataGigabytes} GB</strong></div>
                  <div>Pass Reservation Cost: <strong className="text-white">${costPerPass.toFixed(2)} USD</strong></div>
                </div>
                <div className="text-[10px] text-space-400 p-2.5 bg-space-950/60 rounded border border-space-850">
                  Demodulated telemetry frames will stream in real-time over CCSDS TLS socket into your secure S3 endpoint.
                </div>
                <button
                  onClick={() => setScheduledSuccess(false)}
                  className="w-full py-2 bg-space-800 hover:bg-space-700 text-white rounded text-xs transition-colors"
                >
                  Schedule Another Pass
                </button>
              </div>
            ) : (
              <form onSubmit={handleSchedulePass} className="space-y-4">
                <div className="p-3 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">TARGET GROUND STATION</span>
                  <div className="text-white font-bold text-sm mt-0.5">{selectedStation.stationName}</div>
                  <div className="text-space-400 text-[11px]">
                    Dish: {selectedStation.dishDiameterMeters}m &bull; {selectedStation.operator}
                  </div>
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">DOWNLINK FREQUENCY BAND</label>
                  <select
                    value={selectedBand}
                    onChange={(e: any) => setSelectedBand(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                  >
                    <option value="X_BAND">X-Band (8.0 - 8.4 GHz) &bull; High-Rate 100 Mbps</option>
                    <option value="S_BAND">S-Band (2.2 - 2.4 GHz) &bull; Telemetry 2.5 Mbps</option>
                    <option value="UHF">UHF (435 MHz) &bull; TT&C Beacon 50 kbps</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-space-400 text-[11px]">PASS CONTACT DURATION</label>
                    <span className="text-white font-bold">{passDurationMin} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="18"
                    step="1"
                    value={passDurationMin}
                    onChange={(e) => setPassDurationMin(Number(e.target.value))}
                    className="w-full accent-aeroblue h-1.5 bg-space-800 rounded appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-space-500 mt-1">
                    <span>4 min (Low pass)</span>
                    <span>10 min (Nominal)</span>
                    <span>18 min (Zenith sweep)</span>
                  </div>
                </div>

                {/* Data Metrics Card */}
                <div className="p-3 bg-space-950/90 rounded border border-space-800 space-y-2">
                  <div className="flex justify-between text-space-300">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-aeroblue" />
                      <span>Data Ingested:</span>
                    </span>
                    <span className="text-aeroblue-light font-bold">{estimatedDataGigabytes} GB</span>
                  </div>
                  <div className="flex justify-between text-space-300">
                    <span>Dish Tracking Rate:</span>
                    <span className="text-white">${selectedStation.costPerMinuteUsd.toFixed(2)} / min</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-space-850">
                    <span className="text-aeroblue-light">PASS TOTAL:</span>
                    <span className="text-white">${costPerPass.toFixed(2)} USD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-aeroblue/10 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>BOOK GSaaS PASS WINDOW</span>
                </button>

                <div className="text-[10px] text-space-500 text-center">
                  Integrated with CCSDS 131.0-B-3 Space Data Link standard.
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
