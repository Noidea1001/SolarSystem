'use client';

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  UploadCloud,
  CheckCircle2,
  FileCheck,
  Building,
  ShieldCheck,
  Plus,
  Send,
  Layers,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { SubsystemCategory, ExportCompliance, TRL } from '../types/space';

export default function SupplierStudio() {
  const [vendorName, setVendorName] = useState('Apex Propulsion & Photonics');
  const [country, setCountry] = useState('Germany');
  const [hardwareName, setHardwareName] = useState('');
  const [modelCode, setModelCode] = useState('');
  const [category, setCategory] = useState<SubsystemCategory>('PROPULSION');
  const [trl, setTrl] = useState<TRL>(8);
  const [exportCompliance, setExportCompliance] = useState<ExportCompliance>('ITAR_FREE');
  const [massGrams, setMassGrams] = useState(850);
  const [powerWatts, setPowerWatts] = useState(15);
  const [leadTimeWeeks, setLeadTimeWeeks] = useState(8);
  const [priceUsd, setPriceUsd] = useState(45000);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                SUPPLIER ONBOARDING & HARDWARE LISTING STUDIO
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              List flight-proven subsystems, upload environmental qualification test data (TVAC, vibration, radiation),
              and respond to global space mission RFQs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono text-xs">
              <span className="text-space-400 block text-[10px]">VERIFIED VENDOR LEVEL</span>
              <span className="text-aerogreen font-semibold">AS9100D FLIGHT TIER 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form and Qualification Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Component Submission Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80 font-mono text-xs">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-aeroblue" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-white">
                NEW HARDWARE LISTING SUBMISSION
              </h3>
            </div>

            {submitted ? (
              <div className="p-5 rounded bg-aerogreen/10 border border-aerogreen/30 space-y-3">
                <div className="flex items-center gap-2 text-aerogreen font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>HARDWARE QUALIFICATION DOSSIER SUBMITTED</span>
                </div>
                <div className="text-space-300 text-[11px] space-y-1">
                  <div>Manufacturer: <strong className="text-white">{vendorName}</strong></div>
                  <div>Component: <strong className="text-white">{hardwareName || 'Aerospace Subsystem'}</strong> ({modelCode || 'APX-01'})</div>
                  <div>TRL Rating: <strong className="text-aerogreen">TRL {trl}</strong></div>
                  <div>Export Classification: <strong className="text-white">{exportCompliance}</strong></div>
                </div>
                <div className="text-[10px] text-space-400 p-2.5 bg-space-950/60 rounded border border-space-850">
                  Aerovex Flight Verification Committee will review your TVAC and vibration test logs within 48 hours to activate the listing on the Global B2B Marketplace.
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full py-2 bg-space-800 hover:bg-space-700 text-white rounded text-xs transition-colors"
                >
                  List Another Component
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">MANUFACTURER / SUPPLIER NAME</label>
                    <input
                      type="text"
                      required
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">COUNTRY OF MANUFACTURE</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">SUBSYSTEM HARDWARE NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ka-Band High Speed Transmitter"
                      value={hardwareName}
                      onChange={(e) => setHardwareName(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">PART / MODEL CODE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. APX-TX-KA-100"
                      value={modelCode}
                      onChange={(e) => setModelCode(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">SUBSYSTEM DOMAIN</label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    >
                      <option value="ADCS">ADCS & Attitude</option>
                      <option value="PROPULSION">Propulsion</option>
                      <option value="POWER_EPS">Power & EPS</option>
                      <option value="AVIONICS_OBC">Avionics & OBC</option>
                      <option value="TELEMETRY_COMMS">Comms & RF Link</option>
                      <option value="OPTICAL_PAYLOAD">Optical Payload</option>
                      <option value="THERMAL_STRUCTURE">Chassis & Thermal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">TECHNOLOGY READINESS (TRL)</label>
                    <select
                      value={trl}
                      onChange={(e: any) => setTrl(Number(e.target.value) as TRL)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    >
                      <option value="9">TRL 9 (Flight Proven)</option>
                      <option value="8">TRL 8 (Flight Qualified)</option>
                      <option value="7">TRL 7 (In-Space Prototype)</option>
                      <option value="6">TRL 6 (Ground Demonstrated)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">EXPORT REGULATION</label>
                    <select
                      value={exportCompliance}
                      onChange={(e: any) => setExportCompliance(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    >
                      <option value="ITAR_FREE">ITAR-Free (Dual Use)</option>
                      <option value="EAR99">EAR99 (Commerce Dept)</option>
                      <option value="ITAR_CONTROLLED">ITAR Category XV</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">MASS (GRAMS)</label>
                    <input
                      type="number"
                      required
                      value={massGrams}
                      onChange={(e) => setMassGrams(Number(e.target.value))}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">AVG POWER (WATTS)</label>
                    <input
                      type="number"
                      required
                      value={powerWatts}
                      onChange={(e) => setPowerWatts(Number(e.target.value))}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">LEAD TIME (WEEKS)</label>
                    <input
                      type="number"
                      required
                      value={leadTimeWeeks}
                      onChange={(e) => setLeadTimeWeeks(Number(e.target.value))}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-space-400 text-[11px] mb-1">PRICE (USD)</label>
                    <input
                      type="number"
                      required
                      value={priceUsd}
                      onChange={(e) => setPriceUsd(Number(e.target.value))}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">TECHNICAL SUMMARY & HERITAGE</label>
                  <textarea
                    rows={3}
                    placeholder="Describe architectural interfaces, radiation tolerance, vibration test standards, and past mission flights..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-aeroblue/10 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>PUBLISH HARDWARE TO CATALOG</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Flight Qualification Dossier & Audit Standards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80 font-mono text-xs space-y-4">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-aeroblue" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-white">
                FLIGHT TEST QUALIFICATION DOSSIER
              </h3>
            </div>
            <p className="text-space-300 text-[11px] leading-relaxed">
              Upload your laboratory qualification artifacts to earn the "Flight Proven" badge in search results:
            </p>

            <div className="space-y-2">
              <div className="p-3 bg-space-950 border border-dashed border-space-700 rounded flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Thermal Vacuum (TVAC) Log</div>
                  <div className="text-[10px] text-space-500">ECSS-E-ST-10-03C &bull; 8 Thermal Cycles</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-aerogreen/15 text-aerogreen border border-aerogreen/30">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 bg-space-950 border border-dashed border-space-700 rounded flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Random Vibration Test Report</div>
                  <div className="text-[10px] text-space-500">14.1 Grms Qual Envelope &bull; 3 Axes</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-aerogreen/15 text-aerogreen border border-aerogreen/30">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 bg-space-950 border border-dashed border-space-700 rounded flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Total Ionizing Dose (TID) Radiation</div>
                  <div className="text-[10px] text-space-500">Cobalt-60 gamma ray beam qualification</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-aerogreen/15 text-aerogreen border border-aerogreen/30">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 bg-space-950 border border-dashed border-space-700 rounded flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">STEP / CAD 3D Digital Twin</div>
                  <div className="text-[10px] text-space-500">Envelope & connector keep-out zones</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-aeroblue/15 text-aeroblue border border-aeroblue/30">
                  INSPECTION READY
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-space-800 text-[10px] text-space-400">
              Approved vendors receive priority ranking on the Aerovex Mission Architect auto-synthesis engine.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
