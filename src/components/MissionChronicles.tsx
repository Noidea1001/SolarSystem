'use client';

import React, { useState } from 'react';
import {
  Rocket,
  Calendar,
  Radio,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface MissionArchive {
  id: string;
  name: string;
  agency: string;
  launchDate: string;
  targetDestination: string;
  missionStatus: 'ACTIVE_INTERSTELLAR' | 'ACTIVE_OPERATIONAL' | 'COMPLETED_SUCCESS' | 'EN_ROUTE';
  currentDistance: string;
  telemetrySpeed: string;
  imageUrl: string;
  scientificObjectives: string[];
  landmarkAchievements: string[];
  historicalImpact: string;
}

const HISTORIC_MISSIONS: MissionArchive[] = [
  {
    id: 'voyager-1',
    name: 'Voyager 1 Interstellar Mission',
    agency: 'NASA / JPL-Caltech',
    launchDate: '1977-09-05',
    targetDestination: 'Jupiter, Saturn & Interstellar Medium',
    missionStatus: 'ACTIVE_INTERSTELLAR',
    currentDistance: '24.2 Billion km (162 AU from Earth)',
    telemetrySpeed: '61,200 km/h (17.0 km/s relative to Sun)',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    scientificObjectives: [
      'Characterize Jovian and Saturnian planetary magnetospheres and atmospheres',
      'Locate the outer boundary of the heliosphere (heliopause)',
      'Conduct direct sampling of the interstellar cosmic plasma outside the Solar System',
    ],
    landmarkAchievements: [
      'Crossed the heliopause into interstellar space in August 2012',
      'Captured the iconic "Pale Blue Dot" photograph of Earth from 6 billion km away',
      'Continuous telemetry transmission powered by radioisotope thermoelectric generators (RTG) for over 47 years',
    ],
    historicalImpact:
      'The farthest human-made object in history, carrying the Golden Record with sounds, music, and greetings from Earth into the cosmos.',
  },
  {
    id: 'jwst-telescope',
    name: 'James Webb Space Telescope (JWST)',
    agency: 'NASA / ESA / CSA',
    launchDate: '2021-12-25',
    targetDestination: 'Sun-Earth Lagrange Point 2 (L2)',
    missionStatus: 'ACTIVE_OPERATIONAL',
    currentDistance: '1.5 Million km from Earth (L2 Halo Orbit)',
    telemetrySpeed: 'Orbital velocity around L2 equilibrium',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1600&q=80',
    scientificObjectives: [
      'Observe the first stars and galaxies formed after the Big Bang (>13.5 billion years ago)',
      'Probe the formation of planetary systems and search for water/biosignatures in exoplanet atmospheres',
      'Study the evolution of cosmic dust and stellar nurseries with high-resolution infrared vision',
    ],
    landmarkAchievements: [
      'Successful automated unfolding of a 6.5-meter beryllium primary mirror and 5-layer tennis-court-sized sunshield in deep space',
      'Direct detection of carbon dioxide, water vapor, and methane in atmospheres of distant exoplanets',
      'Photographed the earliest primordial galaxies with redshifts exceeding z = 14',
    ],
    historicalImpact:
      'The premier space astrophysics observatory of the 21st century, revolutionizing cosmic origin models.',
  },
  {
    id: 'perseverance-mars',
    name: 'Mars 2020: Perseverance Rover & Ingenuity',
    agency: 'NASA / JPL-Caltech',
    launchDate: '2020-07-30',
    targetDestination: 'Jezero Crater, Mars (18.38° N, 77.58° E)',
    missionStatus: 'ACTIVE_OPERATIONAL',
    currentDistance: '225 Million km (Variable Orbital Alignment)',
    telemetrySpeed: 'Surface Traverse 0.12 km/h',
    imageUrl: 'https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?auto=format&fit=crop&w=1600&q=80',
    scientificObjectives: [
      'Identify past habitable environments and search for preserved ancient microbial biosignatures',
      'Collect and hermetically seal drill cores of Martian rock and regolith for future return to Earth',
      'Demonstrate in-situ oxygen production (MOXIE experiment) from the thin carbon dioxide atmosphere',
    ],
    landmarkAchievements: [
      'Pioneered the first powered atmospheric flight on another planet with the Ingenuity Mars Helicopter (72 flights)',
      'Generated breathable oxygen directly on Mars using the MOXIE solid oxide electrolysis instrument',
      'Sealed 24 rock core samples along an ancient river delta for the planned Mars Sample Return mission',
    ],
    historicalImpact:
      'Lays the foundation for the first human crewed expeditions to the Martian surface in the 2030s.',
  },
  {
    id: 'cassini-huygens',
    name: 'Cassini-Huygens Mission to Saturn',
    agency: 'NASA / ESA / ASI',
    launchDate: '1997-10-15',
    targetDestination: 'Saturnian System & Titan',
    missionStatus: 'COMPLETED_SUCCESS',
    currentDistance: 'Grand Finale completed into Saturn Atmosphere',
    telemetrySpeed: '124,000 km/h during final atmospheric plunge',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    scientificObjectives: [
      'Determine the 3D structure and dynamic behavior of Saturn’s rings',
      'Study the internal structure and magnetosphere of the gas giant',
      'Deploy the European Huygens probe to land on Titan’s surface',
    ],
    landmarkAchievements: [
      'Huygens probe conducted the first successful robotic landing on a celestial body in the outer Solar System (Titan)',
      'Discovered water-ice plumes venting into space from the subsurface ocean of Enceladus',
      'Orbited Saturn for 13 years, completing 294 orbits and transmitting 453,000 scientific photographs',
    ],
    historicalImpact:
      'Transformed our understanding of habitable ocean worlds in the outer Solar System.',
  },
];

export default function MissionChronicles() {
  const [selectedMission, setSelectedMission] = useState<MissionArchive>(HISTORIC_MISSIONS[0]);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase">
                SPACE MISSION CHRONICLES & EXPLORATION ARCHIVES
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Authentic scientific dossiers of humanity's landmark space exploration missions. Real trajectory parameters,
              mission milestones, and astrophysical discoveries.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-space-400">
            <span>INDEXED MISSIONS:</span>
            <span className="text-aeroblue font-bold">{HISTORIC_MISSIONS.length} SCIENTIFIC ARCHIVES</span>
          </div>
        </div>
      </div>

      {/* Main Mission Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mission Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] text-space-400 font-bold uppercase tracking-wider block">
            EXPLORATION ARCHIVES
          </span>

          <div className="space-y-2.5">
            {HISTORIC_MISSIONS.map((mission) => {
              const isSelected = selectedMission.id === mission.id;

              return (
                <div
                  key={mission.id}
                  onClick={() => setSelectedMission(mission)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'border-aeroblue bg-space-900/90 shadow-md shadow-aeroblue/15'
                      : 'border-space-800 bg-space-950/70 hover:border-space-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.2 rounded bg-space-850 text-aeroblue border border-space-700">
                      {mission.agency}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                        mission.missionStatus.includes('ACTIVE')
                          ? 'bg-aerogreen/15 text-aerogreen border-aerogreen/30'
                          : 'bg-space-800 text-space-400 border-space-700'
                      }`}
                    >
                      {mission.missionStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white leading-snug">{mission.name}</h3>
                  <div className="text-[11px] text-space-400 truncate">
                    Target: {mission.targetDestination}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Mission In-Depth Scientific Dossier (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="hud-panel p-6 rounded-lg border border-space-700/80 bg-space-900/80 space-y-5">
            {/* Header */}
            <div className="border-b border-space-800 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded bg-aeroblue/15 text-aeroblue border border-aeroblue/30 font-bold">
                  {selectedMission.agency}
                </span>
                <span className="text-space-400 text-xs">Launch: {selectedMission.launchDate}</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">{selectedMission.name}</h3>
              <p className="text-space-300 text-xs leading-relaxed">{selectedMission.historicalImpact}</p>
            </div>

            {/* Trajectory & Distance Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-space-950 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">CURRENT DISTANCE FROM EARTH</span>
                <span className="text-aeroblue-light font-bold text-sm mt-0.5 block">
                  {selectedMission.currentDistance}
                </span>
              </div>

              <div className="p-3 bg-space-950 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">ORBITAL / CRUISE SPEED</span>
                <span className="text-white font-bold text-sm mt-0.5 block">
                  {selectedMission.telemetrySpeed}
                </span>
              </div>
            </div>

            {/* Scientific Objectives */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] text-space-400 font-bold uppercase tracking-wider block">
                PRIMARY SCIENTIFIC INVESTIGATION GOALS
              </span>
              <ul className="space-y-1.5 text-space-300 text-xs">
                {selectedMission.scientificObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-aeroblue mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Landmark Scientific Discoveries */}
            <div className="space-y-2 pt-2 border-t border-space-800">
              <span className="text-[10px] text-aerogreen font-bold uppercase tracking-wider block">
                LANDMARK DISCOVERIES & ACHIEVEMENTS
              </span>
              <ul className="space-y-1.5 text-space-200 text-xs">
                {selectedMission.landmarkAchievements.map((ach, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-aerogreen mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
