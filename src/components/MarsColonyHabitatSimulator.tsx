'use client';

import React, { useState } from 'react';
import { X, Flame, ShieldCheck, Zap, Droplets, Wind, Users, SunMedium, Compass } from 'lucide-react';

interface MarsColonyHabitatSimulatorProps {
  onClose: () => void;
  language?: 'km' | 'en';
}

export default function MarsColonyHabitatSimulator({ onClose, language = 'km' }: MarsColonyHabitatSimulatorProps) {
  const [crewSize, setCrewSize] = useState(6);
  const [missionSols, setMissionSols] = useState(500);
  const [isDustStormActive, setIsDustStormActive] = useState(false);
  const [regolithShieldingMeters, setRegolithShieldingMeters] = useState(3.0);
  const [moxieUnits, setMoxieUnits] = useState(4); // MOXIE oxygen generation scale

  // Life support consumption rates per astronaut sol:
  // O2: 0.84 kg / person / sol
  // H2O: 2.5 kg drinking + hygiene (with 98% recycling efficiency)
  // Calories: 2,800 kcal
  // Power: 5 kW base per habitat module
  const dailyO2Kg = crewSize * 0.84;
  const grossWaterKg = crewSize * 4.2;
  const netWaterKg = grossWaterKg * 0.02; // 98% closed-loop recovery

  // ISRU Chemical Production:
  // MOXIE generation: 2 * CO2 -> 2 * CO + O2 (each scaled industrial unit generates 2.5 kg O2 / hour)
  const moxieDailyO2Kg = moxieUnits * 2.5 * 24;
  const netO2BalanceKg = moxieDailyO2Kg - dailyO2Kg;

  // Sabatier Methanation: CO2 + 4 H2 -> CH4 + 2 H2O
  // Generates Starship return propellant (need ~240 tons CH4 + 860 tons LOX for ascent)
  const dailyCh4Kg = 120; // kg/sol
  const totalCh4Tons = (dailyCh4Kg * missionSols) / 1000;

  // Power Generation:
  // Solar PV generation: 100 kW nominal, drops to 15 kW during severe global dust storm
  const solarKw = isDustStormActive ? 15 : 110;
  const nuclearKw = 40; // 4x 10 kWe NASA Kilopower Stirling reactors
  const totalPowerKw = solarKw + nuclearKw;
  const requiredPowerKw = 45 + crewSize * 4.5 + moxieUnits * 8;
  const powerMarginKw = totalPowerKw - requiredPowerKw;

  // Radiation Dosage Calculation:
  // Deep space GCR dose on Mars surface: ~300 mSv/year
  // Regolith attenuation: Half-Value Layer (HVL) ~35 cm
  const surfaceDoseMsvYear = 300;
  const shieldedDoseMsvYear = surfaceDoseMsvYear * Math.pow(0.5, (regolithShieldingMeters * 100) / 35);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-space-900 border border-aeroblue/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-aeroamber" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {language === 'km' ? 'គំរូស្ថាបត្យកម្មជម្រក និងប្រព័ន្ធទ្រទ្រង់ជីវិតលើភពអង្គារ (MARS HABITAT & ISRU)' : 'MARS SURFACE HABITAT & ISRU LIFE SUPPORT LAB'}
              </h2>
              <p className="text-[10px] text-space-400">
                {language === 'km' ? 'បច្ចេកវិទ្យា Sabatier Reactor ផលិតឥន្ធនៈ, MOXIE ផលិតអុកស៊ីសែន, និងខែលការពារកាំរស្មីព្រះអាទិត្យ' : 'Sabatier Methanation, MOXIE Oxygen Electrolysis & Closed-Loop ECLSS'}
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
          {/* Base Coordinates Banner */}
          <div className="p-3 bg-space-950 rounded-xl border border-space-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div>
              <span className="text-space-400 font-bold block">{language === 'km' ? 'ទីតាំងមូលដ្ឋាន:' : 'SURFACE BASE SITE:'}</span>
              <strong className="text-white">Jezero Crater Astrobiology Base (18.38&deg; N, 77.58&deg; E)</strong>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-space-400">{language === 'km' ? 'បរិយាកាស:' : 'ATMOSPHERE:'} 95.3% CO2 &bull; 610 Pa (0.006 atm)</span>
              <span className="text-aeroamber font-bold">Temp: -63&deg;C</span>
            </div>
          </div>

          {/* Interactive Control Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-space-950 rounded-xl border border-space-800">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                <span>{language === 'km' ? 'ចំនួនអ្នកអវកាស Crew Size:' : 'Crew Size:'}</span>
                <span className="text-aeroblue">{crewSize} Astronauts</span>
              </div>
              <input
                type="range"
                min={2}
                max={16}
                step={1}
                value={crewSize}
                onChange={(e) => setCrewSize(Number(e.target.value))}
                className="w-full accent-aeroblue cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                <span>{language === 'km' ? 'កម្រាស់ខែលថ្ម Regolith Shielding:' : 'Regolith Shielding:'}</span>
                <span className="text-aeroamber">{regolithShieldingMeters.toFixed(1)} meters</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.5}
                value={regolithShieldingMeters}
                onChange={(e) => setRegolithShieldingMeters(Number(e.target.value))}
                className="w-full accent-aeroamber cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                <span>{language === 'km' ? 'ឧបករណ៍ MOXIE Units:' : 'MOXIE Scale Units:'}</span>
                <span className="text-aerogreen">{moxieUnits} Units</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={moxieUnits}
                onChange={(e) => setMoxieUnits(Number(e.target.value))}
                className="w-full accent-aerogreen cursor-pointer"
              />
            </div>
          </div>

          {/* Global Dust Storm Toggle Pill */}
          <div className="p-3 bg-space-950 rounded-xl border border-space-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className={`w-4 h-4 ${isDustStormActive ? 'text-aeroamber animate-pulse' : 'text-space-400'}`} />
              <span className="text-[11px] font-bold text-white">
                {language === 'km' ? 'ព្យុះធូលីភពអង្គារសកល (GLOBAL DUST STORM EVENT):' : 'GLOBAL MARTIAN DUST STORM:'}
              </span>
            </div>
            <button
              onClick={() => setIsDustStormActive(!isDustStormActive)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                isDustStormActive
                  ? 'bg-aeroamber/20 text-aeroamber border-aeroamber/50 shadow-md'
                  : 'bg-space-900 text-space-400 border-space-700 hover:text-white'
              }`}
            >
              {isDustStormActive ? (language === 'km' ? 'ព្យុះកំពុងកើតឡើង (កាត់បន្ថយពន្លឺ 85%)' : 'STORM ACTIVE (-85% SOLAR)') : (language === 'km' ? 'ស្ថានភាពមេឃស្រឡះ' : 'CLEAR SKY CONDITIONS')}
            </button>
          </div>

          {/* 4 Life Support System Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Oxygen Generation Card */}
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block flex items-center gap-1">
                <Wind className="w-3 h-3 text-aeroblue" />
                {language === 'km' ? 'អុកស៊ីសែន O2 BALANCE' : 'O2 BALANCE (MOXIE)'}
              </span>
              <div className="text-lg font-bold text-aeroblue">
                +{netO2BalanceKg.toFixed(1)} <span className="text-xs text-space-400">kg/sol</span>
              </div>
              <div className="text-[10px] text-space-400">
                Demand: {dailyO2Kg.toFixed(1)} kg &bull; Gen: {moxieDailyO2Kg.toFixed(1)} kg
              </div>
            </div>

            {/* Sabatier Fuel Production Card */}
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block flex items-center gap-1">
                <Flame className="w-3 h-3 text-aeroamber" />
                {language === 'km' ? 'ឥន្ធនៈ SABATIER METHANE' : 'METHANE CH4 FUEL'}
              </span>
              <div className="text-lg font-bold text-aeroamber">
                {totalCh4Tons.toFixed(1)} <span className="text-xs text-space-400">tons CH4</span>
              </div>
              <div className="text-[10px] text-space-400">
                Rate: {dailyCh4Kg} kg/sol &bull; Target: 240 tons
              </div>
            </div>

            {/* Closed Loop Water Recovery */}
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block flex items-center gap-1">
                <Droplets className="w-3 h-3 text-sky-400" />
                {language === 'km' ? 'ចម្រោះទឹកស្អាត RECOVERY' : 'WATER RECYCLING'}
              </span>
              <div className="text-lg font-bold text-sky-400">
                98.2% <span className="text-xs text-space-400">Efficiency</span>
              </div>
              <div className="text-[10px] text-space-400">
                Net Loss: {netWaterKg.toFixed(2)} L/sol replaced by ice
              </div>
            </div>

            {/* Radiation Shielding Card */}
            <div className="p-3 bg-space-950 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] text-space-400 uppercase font-bold block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-aerogreen" />
                {language === 'km' ? 'កម្រិតកាំរស្មី RADIATION' : 'HABITAT RADIATION'}
              </span>
              <div className={`text-lg font-bold ${shieldedDoseMsvYear < 50 ? 'text-aerogreen' : 'text-rose-400'}`}>
                {shieldedDoseMsvYear.toFixed(1)} <span className="text-xs text-space-400">mSv/year</span>
              </div>
              <div className="text-[10px] text-space-400">
                Unshielded: 300 mSv &bull; Safe limit: &lt;50 mSv
              </div>
            </div>
          </div>

          {/* Energy Grid Status */}
          <div className="p-3.5 bg-space-950 rounded-xl border border-space-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-aeroamber" />
                {language === 'km' ? 'បណ្តាញថាមពលអគ្គិសនី (MICROGRID POWER BALANCE):' : 'HABITAT ELECTRICAL MICROGRID:'}
              </span>
              <span className={`text-xs ${powerMarginKw >= 0 ? 'text-aerogreen font-bold' : 'text-rose-400 font-bold'}`}>
                {powerMarginKw >= 0 ? `+${powerMarginKw.toFixed(1)} kW MARGIN (SURPLUS)` : `${powerMarginKw.toFixed(1)} kW DEFICIT (SHED LOAD)`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-space-300 pt-1">
              <div>
                <span className="text-space-400 block">{language === 'km' ? 'ថាមពលពន្លឺព្រះអាទិត្យ Solar PV:' : 'Solar Array PV:'}</span>
                <strong className="text-white">{solarKw} kWe</strong>
              </div>
              <div>
                <span className="text-space-400 block">{language === 'km' ? 'នុយក្លេអ៊ែរ Kilopower:' : 'Nuclear Kilopower:'}</span>
                <strong className="text-white">{nuclearKw} kWe (4x Stirling)</strong>
              </div>
              <div>
                <span className="text-space-400 block">{language === 'km' ? 'តម្រូវការសរុប Base Demand:' : 'Total Base Load:'}</span>
                <strong className="text-white">{requiredPowerKw.toFixed(1)} kWe</strong>
              </div>
            </div>
          </div>

          {/* Chemical Equations Educational Box */}
          <div className="p-3 bg-space-900/80 rounded-xl border border-space-800 text-[11px] text-space-300 space-y-1 leading-relaxed">
            <span className="font-bold text-white block">
              {language === 'km' ? 'សមីការគីមីវិទ្យាក្នុងការទ្រទ្រង់ជីវិតលើភពអង្គារ (ISRU CHEMICAL EQUATIONS):' : 'ISRU REACTION EQUATIONS:'}
            </span>
            <div className="font-mono text-[10px] text-aeroblue space-y-0.5">
              <div>1. Sabatier Methanation: CO2 + 4 H2 &rarr; CH4 + 2 H2O (&Delta;H = -165 kJ/mol)</div>
              <div>2. MOXIE Solid Oxide Electrolysis: 2 CO2 &rarr; 2 CO + O2 (Operating at 800&deg;C)</div>
              <div>3. Water Electrolysis: 2 H2O &rarr; 2 H2 + O2 (Hydrogen recycled back to Sabatier)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
