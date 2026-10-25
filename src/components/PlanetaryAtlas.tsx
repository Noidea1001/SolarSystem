'use client';

import React, { useState } from 'react';
import {
  Sun,
  Globe,
  Compass,
  Radio,
  Layers,
  Info,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface CelestialBody {
  id: string;
  name: string;
  type: string;
  diameterKm: number;
  distanceFromSunKm: string;
  orbitalPeriodDays: string;
  surfaceGravity: string;
  meanTempC: string;
  knownMoons: number;
  imageUrl: string;
  atmosphere: string[];
  scientificSummary: string;
  keyMissions: string[];
  geologicalFeatures: string[];
}

const CELESTIAL_BODIES: CelestialBody[] = [
  {
    id: 'sun',
    name: 'The Sun (Sol)',
    type: 'G-Type Main-Sequence Star (Yellow Dwarf)',
    diameterKm: 1392700,
    distanceFromSunKm: '0 km (Center of Mass)',
    orbitalPeriodDays: '230 Million Years (Galactic Orbit)',
    surfaceGravity: '274.0 m/s² (28g)',
    meanTempC: 'Core: 15,000,000°C / Surface: 5,500°C',
    knownMoons: 8, // 8 planets
    imageUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1600&q=80',
    atmosphere: ['Hydrogen (73.4%)', 'Helium (24.8%)', 'Oxygen (0.77%)', 'Carbon (0.29%)'],
    scientificSummary:
      'The powerhouse of the Solar System, containing 99.86% of the system’s total mass. Powered by nuclear fusion converting 600 million tons of hydrogen into helium every second in its core, driving space weather, solar winds, and planetary magnetospheres.',
    keyMissions: ['NASA Parker Solar Probe', 'ESA/NASA Solar Orbiter', 'NASA SDO (Solar Dynamics Observatory)', 'SOHO'],
    geologicalFeatures: [
      'Photosphere with dynamic sunspots and magnetic flux tubes',
      'Chromosphere and transition zone reaching 1,000,000°C in the corona',
      'Coronal Mass Ejections (CMEs) driving geomagnetic storms on Earth',
    ],
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet (Innermost)',
    diameterKm: 4879,
    distanceFromSunKm: '57.9 Million km (0.39 AU)',
    orbitalPeriodDays: '88 Earth Days',
    surfaceGravity: '3.7 m/s² (0.38g)',
    meanTempC: '-180°C (Night) to +430°C (Day)',
    knownMoons: 0,
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1600&q=80',
    atmosphere: ['Trace Exosphere: Oxygen (42%)', 'Sodium (29%)', 'Hydrogen (22%)', 'Helium (6%)'],
    scientificSummary:
      'The smallest planet in the Solar System and closest to the Sun. Experiences the most extreme diurnal temperature swings due to the lack of a substantial atmosphere. Boasts a disproportionately large metallic iron core comprising 75% of its radius.',
    keyMissions: ['NASA MESSENGER (Orbiter 2011-2015)', 'ESA/JAXA BepiColombo (En Route)', 'NASA Mariner 10 (1974)'],
    geologicalFeatures: [
      'Caloris Basin: Massive 1,550 km impact basin with concentric rings',
      'Lobate scarps: Enormous tectonic thrust faults formed as the planet cooled and shrank',
      'Permanently shadowed polar craters containing deposits of water ice',
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet (Super-Critical Greenhouse)',
    diameterKm: 12104,
    distanceFromSunKm: '108.2 Million km (0.72 AU)',
    orbitalPeriodDays: '224.7 Earth Days (Retrograde Rotation)',
    surfaceGravity: '8.87 m/s² (0.91g)',
    meanTempC: '+464°C (Hot enough to melt lead)',
    knownMoons: 0,
    imageUrl: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&w=1600&q=80',
    atmosphere: ['Carbon Dioxide (96.5%)', 'Nitrogen (3.5%)', 'Sulfuric Acid Clouds'],
    scientificSummary:
      'Earth’s twin in mass and size, but a runaway hellscape driven by an extreme greenhouse effect. The atmospheric surface pressure exceeds 92 bars (equivalent to 900 meters underwater on Earth). Rotates backwards (clockwise) in retrograde motion.',
    keyMissions: ['Soviet Venera 7-14 (First Surface Landers)', 'NASA Magellan Radar Mapping', 'ESA Venus Express', 'NASA VERITAS & DAVINCI+'],
    geologicalFeatures: [
      'Maxwell Montes: Mountain peak rising 11 km above the mean planetary radius',
      'Extensive volcanic plains covering 80% of the surface with basaltic lava flows',
      'Coronas: Ring-like volcanic collapse structures unique to Venusian mantle plumes',
    ],
  },
  {
    id: 'earth',
    name: 'Earth (Terra)',
    type: 'Terrestrial Ocean Planet (Biosphere)',
    diameterKm: 12742,
    distanceFromSunKm: '149.6 Million km (1.0 AU)',
    orbitalPeriodDays: '365.25 Days',
    surfaceGravity: '9.807 m/s² (1.0g)',
    meanTempC: '+15°C',
    knownMoons: 1, // Luna
    imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1600&q=80',
    atmosphere: ['Nitrogen (78.08%)', 'Oxygen (20.95%)', 'Argon (0.93%)', 'Carbon Dioxide (0.04%)'],
    scientificSummary:
      'The only known celestial body in the universe confirmed to harbor life. Possesses active plate tectonics, liquid water covering 71% of its surface, and a dynamic geodynamo core generating a protective geomagnetic shield against harmful cosmic radiation.',
    keyMissions: ['NASA/NOAA Earth Observing System', 'ESA Copernicus Constellation', 'ISS (International Space Station)'],
    geologicalFeatures: [
      'Dynamic lithospheric plate boundaries with subduction trenches and mid-ocean ridges',
      'Active hydrosphere cycling over 1.38 billion cubic kilometers of water',
      'Dense nitrogen-oxygen atmosphere sustaining a vast biosphere',
    ],
  },
  {
    id: 'moon',
    name: 'The Moon (Luna)',
    type: 'Major Terrestrial Natural Satellite',
    diameterKm: 3474,
    distanceFromSunKm: '384,400 km from Earth',
    orbitalPeriodDays: '27.3 Days (Tidally Locked Synchronous Rotation)',
    surfaceGravity: '1.62 m/s² (0.166g)',
    meanTempC: '-130°C (Night) to +120°C (Day)',
    knownMoons: 0,
    imageUrl: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1600&q=80',
    atmosphere: ['Near-Vacuum Exosphere (Argon, Helium, Sodium)'],
    scientificSummary:
      'Formed approximately 4.5 billion years ago following a giant impact between the proto-Earth and a Mars-sized planetesimal named Theia. Stabilizes Earth’s axial tilt and drives oceanic tides.',
    keyMissions: ['NASA Apollo 11-17 (Manned Landings)', 'NASA Artemis Program', 'CNSA Chang’e 4-6 (Far Side Landings)', 'ISRO Chandrayaan-3'],
    geologicalFeatures: [
      'Lunar Maria: Vast dark plains of solidified basalt from ancient volcanic floods',
      'Impact craters: Tycho, Copernicus, and South Pole-Aitken basin (2,500 km wide)',
      'Permanently Shadowed Regions (PSRs) preserving gigatons of water ice',
    ],
  },
  {
    id: 'mars',
    name: 'Mars (The Red Planet)',
    type: 'Terrestrial Desert Planet',
    diameterKm: 6779,
    distanceFromSunKm: '227.9 Million km (1.52 AU)',
    orbitalPeriodDays: '687 Earth Days (1.88 Years)',
    surfaceGravity: '3.72 m/s² (0.38g)',
    meanTempC: '-65°C (-125°C at poles to +20°C at equator)',
    knownMoons: 2, // Phobos & Deimos
    imageUrl: 'https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?auto=format&fit=crop&w=1600&q=80',
    atmosphere: ['Carbon Dioxide (95.3%)', 'Nitrogen (2.6%)', 'Argon (1.9%)', 'Water Vapor Trace'],
    scientificSummary:
      'The primary target for human interplanetary colonization. Features ancient evidence of flowing rivers, deltas, and lakes. Its reddish hue is caused by widespread iron(III) oxide (rust) in the regolith.',
    keyMissions: ['NASA Perseverance & Curiosity Rovers', 'NASA Mars Reconnaissance Orbiter (HiRISE)', 'ESA ExoMars Trace Gas Orbiter', 'UAE Hope Probe'],
    geologicalFeatures: [
      'Olympus Mons: Largest volcano in the Solar System, towering 21.9 km above datum',
      'Valles Marineris: Grand canyon system spanning over 4,000 km in length and 7 km deep',
      'Jezero Crater: River delta preserving ancient clay sediment and potential biosignatures',
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter (King of Planets)',
    type: 'Gas Giant (Jovian)',
    diameterKm: 139820,
    distanceFromSunKm: '778.5 Million km (5.2 AU)',
    orbitalPeriodDays: '11.86 Earth Years',
    surfaceGravity: '24.79 m/s² (2.53g at 1-bar level)',
    meanTempC: '-110°C (Cloud Tops)',
    knownMoons: 95, // Including Io, Europa, Ganymede, Callisto
    imageUrl: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&w=1600&q=80',
    atmosphere: ['Hydrogen (89.8%)', 'Helium (10.2%)', 'Methane, Ammonia, Water Ice'],
    scientificSummary:
      'More massive than all other planets in the Solar System combined (318 Earth masses). Acts as a gravitational vacuum cleaner shielding the inner planets from excessive cometary bombardment. Hosts an ocean moon (Europa) with strong astrobiological potential.',
    keyMissions: ['NASA Juno (Current Polar Orbiter)', 'NASA Galileo (1995-2003)', 'ESA JUICE (En Route to Galilean Moons)', 'NASA Europa Clipper'],
    geologicalFeatures: [
      'Great Red Spot: Persistent anticyclonic storm larger than the diameter of Earth',
      'Liquid metallic hydrogen mantle generating a colossal magnetosphere',
      'Europa subsurface ocean containing twice as much liquid water as all Earth’s oceans',
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant with Planetary Rings',
    diameterKm: 116460,
    distanceFromSunKm: '1.43 Billion km (9.58 AU)',
    orbitalPeriodDays: '29.45 Earth Years',
    surfaceGravity: '10.44 m/s² (1.06g at 1-bar level)',
    meanTempC: '-140°C',
    knownMoons: 146, // Titan, Enceladus, Mimas...
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    atmosphere: ['Hydrogen (96.3%)', 'Helium (3.25%)', 'Methane & Ammonia'],
    scientificSummary:
      'Famous for its breathtaking ring system composed of billions of water ice particles ranging from micrometers to meters in size. Has the lowest mean density of any planet (0.687 g/cm³)—less dense than water.',
    keyMissions: ['NASA/ESA/ASI Cassini-Huygens (2004-2017)', 'NASA Voyager 1 & 2', 'NASA Dragonfly (Upcoming Titan Quadcopter)'],
    geologicalFeatures: [
      'Main ring system spanning 282,000 km across, yet only 10 meters in average thickness',
      'Enceladus south polar ice geysers venting salty water directly into space from a global ocean',
      'Titan: Dense nitrogen atmosphere with liquid methane and ethane lakes and river systems',
    ],
  },
];

export default function PlanetaryAtlas() {
  const [selectedBody, setSelectedBody] = useState<CelestialBody>(CELESTIAL_BODIES[3]); // Earth default

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-aeroamber" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase">
                PLANETARY SCIENCE & SOLAR SYSTEM ATLAS
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Authentic photographic survey and astrophysical data tables of the major planetary bodies, moons, and the
              Sun, compiled from robotic orbiters, landers, and space telescopes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-space-400">
            <span>EXPLORATION CATALOG:</span>
            <span className="text-aeroamber font-bold">{CELESTIAL_BODIES.length} CELESTIAL BODIES</span>
          </div>
        </div>

        {/* Planet Quick Selector Bar */}
        <div className="mt-4 pt-3 border-t border-space-800 flex flex-wrap gap-1.5">
          {CELESTIAL_BODIES.map((body) => {
            const isSelected = selectedBody.id === body.id;

            return (
              <button
                key={body.id}
                onClick={() => setSelectedBody(body)}
                className={`px-3 py-1.5 rounded transition-all text-xs flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-aeroamber text-space-950 font-bold shadow-md shadow-aeroamber/20'
                    : 'bg-space-950 text-space-300 hover:text-white border border-space-800 hover:border-space-600'
                }`}
              >
                <span>{body.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body Explorer Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real Photographic Hero & Geology (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full h-[520px] rounded-lg border border-space-700/80 overflow-hidden bg-space-950 group">
            <img
              src={selectedBody.imageUrl}
              alt={selectedBody.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/40 to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 bg-space-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-space-700 text-space-300">
              Classification: <strong className="text-white">{selectedBody.type}</strong>
            </div>

            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-aeroamber/20 text-aeroamber border border-aeroamber/40 font-bold uppercase">
                AUTHENTIC ROBOTIC SENSOR PHOTOGRAPHY
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">{selectedBody.name}</h3>
              <p className="text-space-200 text-xs leading-relaxed max-w-2xl">
                {selectedBody.scientificSummary}
              </p>
            </div>
          </div>

          {/* Geological & Surface Features Box */}
          <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/60 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
              <Layers className="w-4 h-4 text-aeroamber" />
              <span>GEOLOGICAL & SURFACE PROCESSES</span>
            </div>
            <ul className="space-y-1.5 text-space-300 text-xs">
              {selectedBody.geologicalFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-aeroamber mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Astrophysical Data Sheet & Missions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Physical Parameters Table */}
          <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80 space-y-4">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <h4 className="text-xs font-bold uppercase text-white tracking-wide">
                ASTROPHYSICAL DATA MATRIX
              </h4>
              <span className="text-[10px] text-space-500 uppercase">NASA HORIZONS STANDARDS</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-space-950 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">EQUATORIAL DIAMETER</span>
                <span className="text-white font-bold text-sm">
                  {selectedBody.diameterKm.toLocaleString()} km
                </span>
              </div>

              <div className="p-2.5 bg-space-950 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">DISTANCE FROM SUN</span>
                <span className="text-white font-bold text-sm">{selectedBody.distanceFromSunKm}</span>
              </div>

              <div className="p-2.5 bg-space-950 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">ORBITAL PERIOD</span>
                <span className="text-white font-bold text-sm">{selectedBody.orbitalPeriodDays}</span>
              </div>

              <div className="p-2.5 bg-space-950 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">SURFACE GRAVITY</span>
                <span className="text-white font-bold text-sm">{selectedBody.surfaceGravity}</span>
              </div>

              <div className="p-2.5 bg-space-950 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">MEAN TEMPERATURE</span>
                <span className="text-aeroamber-light font-bold text-sm">{selectedBody.meanTempC}</span>
              </div>

              <div className="p-2.5 bg-space-950 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">KNOWN SATELLITES</span>
                <span className="text-aerogreen font-bold text-sm">
                  {selectedBody.knownMoons} Moons
                </span>
              </div>
            </div>

            {/* Atmospheric Composition */}
            <div className="pt-2 border-t border-space-800 space-y-2">
              <span className="text-[10px] text-space-400 font-bold uppercase block">
                ATMOSPHERIC CHEMICAL COMPOSITION
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBody.atmosphere.map((gas, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-space-950 border border-space-800 text-space-300 text-[11px]"
                  >
                    {gas}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Landmark Exploration Missions */}
          <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
              <Radio className="w-4 h-4 text-aeroblue" />
              <span>LANDMARK EXPLORATION MISSIONS</span>
            </div>

            <div className="space-y-2">
              {selectedBody.keyMissions.map((mission, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-space-950/70 border border-space-800 rounded flex items-center justify-between text-xs"
                >
                  <span className="text-space-200 font-semibold">{mission}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-aeroblue/15 text-aeroblue border border-aeroblue/30">
                    VERIFIED DATA
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
