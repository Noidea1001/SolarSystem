'use client';

import React, { useState } from 'react';
import {
  Rocket,
  Calendar,
  MapPin,
  Weight,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Send,
  Layers,
} from 'lucide-react';
import { LAUNCH_RIDESHARES } from '../data/spaceComponents';
import { LaunchRideshare } from '../types/space';

export default function LaunchRideshareBrokering() {
  const [selectedFlight, setSelectedFlight] = useState<LaunchRideshare>(LAUNCH_RIDESHARES[0]);
  const [payloadMassKg, setPayloadMassKg] = useState<number>(6);
  const [deployerType, setDeployerType] = useState('Standard Canister Deployer');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const totalLaunchPrice = payloadMassKg * selectedFlight.pricePerKgUsd;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                LAUNCH CAPACITY & RIDESHARE BROKERING
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Secondary payload slot aggregation on Falcon 9, Electron, and European launch vehicles. Verified dispenser
              fit checks and orbital insertion accuracy.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-space-400">
            <span>UPCOMING MANIFESTS:</span>
            <span className="text-aeroblue font-bold">{LAUNCH_RIDESHARES.length} FLIGHTS</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Flight Cards List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {LAUNCH_RIDESHARES.map((flight) => {
            const isSelected = selectedFlight.id === flight.id;

            return (
              <div
                key={flight.id}
                onClick={() => {
                  setSelectedFlight(flight);
                  setBookingSuccess(false);
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
                        {flight.vehicle}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          flight.status === 'BOARDING_OPEN'
                            ? 'bg-aerogreen/15 text-aerogreen border-aerogreen/30'
                            : 'bg-space-800 text-space-300 border-space-700'
                        }`}
                      >
                        {flight.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-1.5 font-mono">{flight.missionName}</h3>
                    <div className="text-xs text-space-400 font-mono">
                      Operator: <span className="text-space-200">{flight.provider}</span>
                    </div>
                  </div>

                  <div className="sm:text-right font-mono">
                    <div className="text-sm font-bold text-aeroblue-light">
                      ${flight.pricePerKgUsd.toLocaleString()} / kg
                    </div>
                    <div className="text-[10px] text-space-400">Orbital Slot Rate</div>
                  </div>
                </div>

                {/* Flight Meta Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-space-850 font-mono text-[11px]">
                  <div>
                    <span className="text-space-500 block text-[10px]">TARGET ORBIT</span>
                    <span className="text-white font-semibold">
                      {flight.targetOrbit} ({flight.orbitAltitudeKm} km)
                    </span>
                  </div>

                  <div>
                    <span className="text-space-500 block text-[10px]">DEPARTURE DATE</span>
                    <span className="text-white font-semibold">{flight.launchDate}</span>
                  </div>

                  <div>
                    <span className="text-space-500 block text-[10px]">REMAINING CAPACITY</span>
                    <span className="text-aerogreen font-semibold">
                      {flight.remainingCapacityKg} kg of {flight.massCapacityKg} kg
                    </span>
                  </div>

                  <div>
                    <span className="text-space-500 block text-[10px]">LAUNCH COMPLEX</span>
                    <span className="text-space-300 truncate block">{flight.launchSite}</span>
                  </div>
                </div>

                {/* Standard Deployer Tag */}
                <div className="mt-3 text-[10px] font-mono text-space-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-space-500" />
                  <span>Verified Deployer: {flight.standardDeployer}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Booking Calculator & Reservation Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80 font-mono text-xs">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-4 h-4 text-aeroblue" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-white">
                SLOT CAPACITY RESERVATION
              </h3>
            </div>

            {bookingSuccess ? (
              <div className="p-5 rounded bg-aerogreen/10 border border-aerogreen/30 space-y-3">
                <div className="flex items-center gap-2 text-aerogreen font-bold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  <span>SLOT RESERVATION REQUEST LOGGED</span>
                </div>
                <div className="text-space-300 text-[11px] space-y-1">
                  <div>Mission: <strong className="text-white">{selectedFlight.missionName}</strong></div>
                  <div>Payload Mass: <strong className="text-white">{payloadMassKg} kg</strong></div>
                  <div>Estimated Launch Fee: <strong className="text-white">${totalLaunchPrice.toLocaleString()} USD</strong></div>
                </div>
                <div className="text-[10px] text-space-400 p-2.5 bg-space-950/60 rounded border border-space-850">
                  Launch integration engineers will contact you to perform mechanical vibration coupled loads analysis (CLA) and review ICD (Interface Control Documents).
                </div>
                <button
                  onClick={() => setBookingSuccess(false)}
                  className="w-full py-2 bg-space-800 hover:bg-space-700 text-white rounded text-xs transition-colors"
                >
                  Configure Another Slot
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="p-3 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">SELECTED MISSION</span>
                  <div className="text-white font-bold text-sm mt-0.5">{selectedFlight.missionName}</div>
                  <div className="text-space-400 text-[11px]">
                    Vehicle: {selectedFlight.vehicle} &bull; {selectedFlight.launchDate}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-space-400 text-[11px]">SPACECRAFT PAYLOAD MASS</label>
                    <span className="text-white font-bold">{payloadMassKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={Math.min(selectedFlight.remainingCapacityKg, 60)}
                    step="1"
                    value={payloadMassKg}
                    onChange={(e) => setPayloadMassKg(Number(e.target.value))}
                    className="w-full accent-aeroblue h-1.5 bg-space-800 rounded appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-space-500 mt-1">
                    <span>1 kg (1U)</span>
                    <span>12 kg (6U)</span>
                    <span>24 kg (12U)</span>
                    <span>60 kg (ESPA)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">DISPENSER ADAPTER</label>
                  <select
                    value={deployerType}
                    onChange={(e) => setDeployerType(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                  >
                    <option value="Standard Canister Deployer">Exolaunch EXOpod Nova Standard</option>
                    <option value="Maxwell Canister">Rocket Lab Maxwell Dispenser</option>
                    <option value="ISRO Rail Ring">ISRO Rail Dispenser Ring</option>
                    <option value="Custom Separation Ring">Custom MicroSat Separation Ring</option>
                  </select>
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-space-800 space-y-2">
                  <div className="flex justify-between text-space-300">
                    <span>Rate per Kilogram:</span>
                    <span className="text-white">${selectedFlight.pricePerKgUsd.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-space-300">
                    <span>Spacecraft Mass:</span>
                    <span className="text-white">{payloadMassKg} kg</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-space-850">
                    <span className="text-aeroblue-light">TOTAL ESTIMATED LAUNCH:</span>
                    <span className="text-white">${totalLaunchPrice.toLocaleString()} USD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-aeroblue/10 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>REQUEST RIDESHARE MANIFEST SLOT</span>
                </button>

                <div className="text-[10px] text-space-500 text-center">
                  Subject to FAA/AST or host country orbital launch license approval.
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
