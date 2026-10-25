'use client';

import React, { useState } from 'react';
import {
  Compass,
  Cpu,
  Layers,
  Zap,
  Radio,
  Flame,
  ShieldAlert,
  Activity,
  ArrowRight,
  BookOpen,
  Orbit,
} from 'lucide-react';

interface TechTopic {
  id: string;
  category: 'ORBITS' | 'SUBSYSTEMS' | 'ENVIRONMENT' | 'PROPULSION';
  title: string;
  tagline: string;
  summary: string;
  governingEquations: string[];
  engineeringBreakdown: { title: string; detail: string }[];
  realWorldExample: string;
}

const TECH_TOPICS: TechTopic[] = [
  {
    id: 'orbital-mechanics-leo-sso',
    category: 'ORBITS',
    title: 'Orbital Mechanics: Sun-Synchronous (SSO) & LEO Orbits',
    tagline: 'Keplerian orbital dynamics and nodal precession exploiting Earth’s oblateness (J2 perturbation).',
    summary:
      'A Sun-Synchronous Orbit (SSO) is a specialized polar orbit where the satellite passes over any given point of the Earth’s surface at the same local solar time. This ensures consistent solar illumination across orbital passes, making it the ideal orbit for optical Earth observation and climate monitoring satellites.',
    governingEquations: [
      'Vis-Viva Orbital Velocity: v = √(μ * (2/r - 1/a))',
      'Orbital Period: T = 2π * √(a³ / μ)',
      'Nodal Precession Rate: dΩ/dt = -3/2 * J₂ * (R_e / p)² * √(μ / a³) * cos(i)',
    ],
    engineeringBreakdown: [
      {
        title: 'J2 Oblateness Perturbation',
        detail:
          'Earth is not a perfect sphere; its equatorial bulge (quadrupole moment J2 = 1.08263e-3) exerts a torque that causes the orbit plane to precess eastward at roughly 0.9856° per day, perfectly matching Earth’s annual revolution around the Sun.',
      },
      {
        title: 'Altitude vs Inclination Matching',
        detail:
          'To achieve a Sun-synchronous drift at 500 km altitude, the required retrograde orbital inclination is approximately 97.4°. At 800 km, the required inclination is 98.6°.',
      },
      {
        title: 'Dawn-Dusk vs Noon-Midnight Configs',
        detail:
          'In a Dawn-Dusk SSO orbit (local solar time ~06:00 / 18:00), the satellite rides the day/night terminator continuously, receiving nearly 100% sunlight on its solar arrays with virtually zero battery eclipse cycles.',
      },
    ],
    realWorldExample:
      'ESA Sentinel-2 and NASA Landsat-9 operate in Sun-Synchronous orbits at ~786 km and ~705 km, guaranteeing identical shadow angles across multi-year crop growth monitoring.',
  },
  {
    id: 'adcs-attitude-control',
    category: 'SUBSYSTEMS',
    title: 'Attitude Determination & Control Systems (ADCS)',
    tagline: 'Sub-arcsecond pointing precision via angular momentum conservation and optical star pattern matching.',
    summary:
      'Satellites must accurately orient themselves in 3-axis space to point cameras at Earth targets, aim solar wings at the Sun, and orient directional high-gain antennas toward ground station receivers. ADCS combines optical sensors, gyroscopes, and mechanical momentum exchange actuators.',
    governingEquations: [
      'Angular Momentum Conservation: H_total = I_spacecraft * ω + Σ(I_wheel * Ω_wheel)',
      'Disturbance Torque Balance: T_control = dH/dt + ω × H',
      'Magnetic Torquer Dipole: T_mag = m × B_earth',
    ],
    engineeringBreakdown: [
      {
        title: 'Star Trackers (Optical Head)',
        detail:
          'High-sensitivity CMOS cameras capture stellar star fields. Onboard algorithms match triangular star centroid separations against a database of 50,000 celestial catalog stars, computing inertial pointing knowledge to under 0.002° (7 arcseconds).',
      },
      {
        title: 'Reaction Wheels (Internal Momentum)',
        detail:
          'Flywheels spun by brushless DC motors. Accelerating a wheel clockwise imparts an equal and opposite counter-clockwise rotation to the satellite body, allowing jitter-free pointing without consuming chemical propellant.',
      },
      {
        title: 'Magnetic Torquers (Momentum Desaturation)',
        detail:
          'Electromagnetic coils generating magnetic dipoles that push against Earth’s geomagnetic field, dumping accumulated wheel momentum back into the planetary magnetic field without thruster fuel.',
      },
    ],
    realWorldExample:
      'The Hubble Space Telescope and Blue Canyon Technologies XACT-50 use reaction wheels to maintain pointing stability comparable to keeping a laser beam centered on a dime from 200 miles away.',
  },
  {
    id: 'electric-propulsion-feep',
    category: 'PROPULSION',
    title: 'Electric Propulsion: Hall Effect & FEEP Thrusters',
    tagline: 'Achieving specific impulses exceeding 3,000 seconds via electrostatic and electromagnetic ion acceleration.',
    summary:
      'Unlike chemical rockets limited by the energy stored in molecular bonds (Isp < 450s), electric thrusters use electrical power from solar panels to ionize propellants (xenon, krypton, or solid liquid-metal indium) and accelerate ions to velocities upwards of 30,000 m/s.',
    governingEquations: [
      'Specific Impulse: I_sp = v_exhaust / g₀',
      'Tsiolkovsky Rocket Equation: Δv = I_sp * g₀ * ln(m_initial / m_final)',
      'Ion Exhaust Velocity: v_ion = √(2 * q * V_accel / m_ion)',
    ],
    engineeringBreakdown: [
      {
        title: 'Field Emission Electric Propulsion (FEEP)',
        detail:
          'Solid metal indium is heated above its melting point (156°C) and drawn by capillary action to sharp tungsten emitter tips. A strong electric field extracts and accelerates indium ions to >40 km/s, providing micro-Newton thrust at unprecedented fuel efficiency.',
      },
      {
        title: 'Hall Effect Thrusters (HET)',
        detail:
          'Electrons trapped in a circular radial magnetic field ionize noble gas (Xenon/Krypton). The resulting plasma beam produces dozens of millinewtons of thrust for constellation station-keeping and orbit-raising.',
      },
      {
        title: 'Propellant Mass Efficiency',
        detail:
          'A satellite equipped with electric propulsion requires up to 90% less propellant mass than a chemical equivalent to achieve the same total orbital velocity change (Delta-V).',
      },
    ],
    realWorldExample:
      'SpaceX Starlink satellites utilize krypton-fueled Hall thrusters for orbital insertion, collision avoidance maneuvers, and end-of-life atmospheric deorbit burns.',
  },
  {
    id: 'space-environment-radiation-thermal',
    category: 'ENVIRONMENT',
    title: 'The Space Environment: Radiation Belts & Thermal Vacuum',
    tagline: 'Surviving extreme temperature differentials (-150°C to +120°C) and cosmic ionizing radiation.',
    summary:
      'Space is not an empty void; spacecraft must withstand hostile particle environments from solar energetic particle (SEP) events, galactic cosmic rays (GCR), trapped proton belts, and extreme thermal radiative imbalances in a hard vacuum of 10^-9 Torr.',
    governingEquations: [
      'Stefan-Boltzmann Radiative Transfer: Q_rad = ε * σ * A * (T⁴_surface - T⁴_space)',
      'Solar Radiation Flux at 1 AU: S₀ ≈ 1361 W/m²',
      'Total Ionizing Dose: TID = Energy Absorbed / Mass (Gray / krad)',
    ],
    engineeringBreakdown: [
      {
        title: 'Total Ionizing Dose (TID) & Single-Event Effects (SEE)',
        detail:
          'Trapped protons and heavy ions cause silicon gate breakdown and bit-flips in memory. Aerospace avionics utilize radiation-hardened components with Error-Correcting Code (ECC) MRAM and triple-modular redundancy (TMR).',
      },
      {
        title: 'Thermal Vacuum (TVAC) Dynamics',
        detail:
          'Without atmosphere, convection is impossible. Heat transfers exclusively through conduction across structures and thermal radiation into deep space (2.7 Kelvin cosmic background). Multi-Layer Insulation (MLI) blankets and heat pipes regulate thermal equilibrium.',
      },
      {
        title: 'Atomic Oxygen (ATOX) Erosion',
        detail:
          'In LEO (200-600 km), highly reactive atomic oxygen rapidly erodes organic polymer coatings and solar cell optical coverglasses, requiring silicon oxide or alumina protective coatings.',
      },
    ],
    realWorldExample:
      'NASA James Webb Space Telescope operates a 5-layer Kapton sunshield maintaining a 300°C temperature gradient between its hot side (+85°C) and cryogenically cooled infrared instruments (-233°C).',
  },
];

export default function SpaceTechScience() {
  const [selectedTopic, setSelectedTopic] = useState<TechTopic>(TECH_TOPICS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredTopics = TECH_TOPICS.filter((t) => {
    if (activeCategory !== 'ALL' && t.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase">
                SPACE TECHNOLOGY & ORBITAL SCIENCE ENCYCLOPEDIA
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Engineering foundations, orbital mechanics formulas, spacecraft subsystem architecture, and space
              environmental physics. Pure educational science with verified aerospace data.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-space-950 border border-space-800 rounded">
            {['ALL', 'ORBITS', 'SUBSYSTEMS', 'PROPULSION', 'ENVIRONMENT'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded transition-all text-xs ${
                  activeCategory === cat
                    ? 'bg-aeroblue text-space-950 font-bold'
                    : 'text-space-400 hover:text-white hover:bg-space-850'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Topic Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Topic Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] text-space-400 font-bold uppercase tracking-wider block">
            AEROSPACE MODULES ({filteredTopics.length})
          </span>

          <div className="space-y-2.5">
            {filteredTopics.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;

              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                    isSelected
                      ? 'border-aeroblue bg-space-900/90 shadow-md shadow-aeroblue/15'
                      : 'border-space-800 bg-space-950/70 hover:border-space-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.2 rounded bg-space-800 text-aeroblue border border-space-700">
                      {topic.category}
                    </span>
                    <span className="text-[10px] text-space-500 font-mono">PEER REVIEWED</span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">{topic.title}</h3>
                  <p className="text-[11px] text-space-400 line-clamp-2 leading-relaxed">{topic.tagline}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: In-Depth Scientific Dossier (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="hud-panel p-6 rounded-lg border border-space-700/80 bg-space-900/80 space-y-5">
            <div className="border-b border-space-800 pb-4 space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-aeroblue/15 text-aeroblue border border-aeroblue/30 font-bold uppercase">
                {selectedTopic.category} SCIENCE MODULE
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{selectedTopic.title}</h3>
              <p className="text-space-300 text-xs leading-relaxed">{selectedTopic.summary}</p>
            </div>

            {/* Governing Physical Formulas Card */}
            <div className="p-4 bg-space-950 rounded-lg border border-space-800 space-y-2">
              <span className="text-[10px] text-aeroblue font-bold uppercase tracking-wider block">
                GOVERNING PHYSICAL & ASTRODYNAMICAL EQUATIONS
              </span>
              <div className="space-y-1 text-space-200 text-xs font-mono">
                {selectedTopic.governingEquations.map((eq, i) => (
                  <div key={i} className="p-2 bg-space-900/80 rounded border border-space-850 font-bold">
                    {eq}
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Subsystem Engineering Breakdown */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] text-space-400 font-bold uppercase tracking-wider block">
                ENGINEERING ARCHITECTURE & MECHANISMS
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedTopic.engineeringBreakdown.map((item, i) => (
                  <div key={i} className="p-3 bg-space-950/60 rounded border border-space-850 space-y-1.5">
                    <h4 className="text-white font-bold text-xs">{item.title}</h4>
                    <p className="text-space-300 text-[11px] leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real World Mission Application */}
            <div className="p-4 bg-aerogreen/10 border border-aerogreen/30 rounded-lg space-y-1">
              <span className="text-[10px] text-aerogreen font-bold uppercase tracking-wider block">
                ACTIVE FLIGHT HERITAGE APPLICATION
              </span>
              <p className="text-space-200 text-xs leading-relaxed">{selectedTopic.realWorldExample}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
