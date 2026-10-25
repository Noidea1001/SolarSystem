'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Sun,
  Globe,
  Compass,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Navigation,
  Crosshair,
  MapPin,
  Layers,
  Info,
  Radio,
  Eye,
  ChevronRight,
  X,
  Search,
  Moon,
  Clock,
  Sparkles,
  Activity,
  Flame,
} from 'lucide-react';


interface CountryPoint {
  id: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  timezone: string;
  utcOffsetHours: number;
  spaceAgency: string;
  majorSites: string;
  overview: string;
}

const REAL_WORLD_COUNTRIES: CountryPoint[] = [
  {
    id: 'khm',
    name: 'Cambodia',
    capital: 'Phnom Penh',
    lat: 12.5657,
    lng: 104.991,
    timezone: 'UTC+07:00 (Indochina Time)',
    utcOffsetHours: 7,
    spaceAgency: 'MPTC Space Technology & Remote Sensing Bureau',
    majorSites: 'Angkor Wat Telemetry Hub, Phnom Penh Earth Station, Tonle Sap Basin',
    overview:
      'Utilizing optical and radar satellite Earth observation for Mekong river hydrological monitoring, agricultural flood mapping, and cultural heritage conservation.',
  },
  {
    id: 'usa',
    name: 'United States',
    capital: 'Washington D.C.',
    lat: 37.0902,
    lng: -95.7129,
    timezone: 'UTC-05:00 to UTC-08:00',
    utcOffsetHours: -5,
    spaceAgency: 'NASA & US Space Force',
    majorSites: 'Kennedy Space Center Launch Pad 39A, Cape Canaveral SLC-40, Johnson Space Center',
    overview:
      'Leading deep space astronomy, Artemis lunar base architecture, commercial astronaut missions, and interplanetary Mars rover expeditions.',
  },
  {
    id: 'fra',
    name: 'France',
    capital: 'Paris',
    lat: 46.2276,
    lng: 2.2137,
    timezone: 'UTC+01:00 (Central European Time)',
    utcOffsetHours: 1,
    spaceAgency: 'CNES & European Space Agency (ESA)',
    majorSites: 'Guiana Space Centre (CSG Kourou ELA-4), Toulouse Space Operations Center',
    overview:
      'Premier European space power operating the equatorial launch complex in French Guiana for heavy Ariane 6 and Vega-C orbital rockets.',
  },
  {
    id: 'jpn',
    name: 'Japan',
    capital: 'Tokyo',
    lat: 36.2048,
    lng: 138.2529,
    timezone: 'UTC+09:00 (Japan Standard Time)',
    utcOffsetHours: 9,
    spaceAgency: 'JAXA (Japan Aerospace Exploration Agency)',
    majorSites: 'Tanegashima Space Center, Uchinoura Space Center, Tsukuba Space Center',
    overview:
      'Pioneering asteroid sample return science (Hayabusa), H3 heavy launch vehicles, and Kibo ISS laboratory module.',
  },
  {
    id: 'ind',
    name: 'India',
    capital: 'New Delhi',
    lat: 20.5937,
    lng: 78.9629,
    timezone: 'UTC+05:30 (Indian Standard Time)',
    utcOffsetHours: 5.5,
    spaceAgency: 'ISRO (Indian Space Research Organisation)',
    majorSites: 'Satish Dhawan Space Centre (SDSC SHAR Sriharikota), ISTRAC Telemetry Network',
    overview:
      'Celebrated for the Chandrayaan-3 lunar south pole landing, Aditya-L1 solar halo observatory, and cost-efficient PSLV launches.',
  },
  {
    id: 'chn',
    name: 'China',
    capital: 'Beijing',
    lat: 35.8617,
    lng: 104.1954,
    timezone: 'UTC+08:00 (China Standard Time)',
    utcOffsetHours: 8,
    spaceAgency: 'CNSA (China National Space Administration)',
    majorSites: 'Wenchang Spacecraft Launch Site, Jiuquan Satellite Launch Center, Tiangong Station',
    overview:
      'Operating the permanent Tiangong Space Station, Chang’e far side lunar sample returns, and Beidou satellite navigation constellation.',
  },
  {
    id: 'sgp',
    name: 'Singapore',
    capital: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    timezone: 'UTC+08:00 (Singapore Time)',
    utcOffsetHours: 8,
    spaceAgency: 'OSTIn (Office for Space Technology & Industry)',
    majorSites: 'CRISP Center for Remote Imaging, Changi Aerospace Park',
    overview:
      'Equatorial NewSpace and satellite IoT hub specializing in synthetic aperture radar (SAR) constellations and laser downlinks.',
  },
  {
    id: 'tha',
    name: 'Thailand',
    capital: 'Bangkok',
    lat: 15.87,
    lng: 100.9925,
    timezone: 'UTC+07:00 (Indochina Time)',
    utcOffsetHours: 7,
    spaceAgency: 'GISTDA (Geo-Informatics & Space Technology Development Agency)',
    majorSites: 'Space Krenovation Park, THEOS Ground Telemetry Complex',
    overview:
      'Operating THEOS optical and SAR Earth observation satellite series for regional natural disaster and agricultural monitoring.',
  },
  {
    id: 'vnm',
    name: 'Vietnam',
    capital: 'Hanoi',
    lat: 14.0583,
    lng: 108.2772,
    timezone: 'UTC+07:00 (Indochina Time)',
    utcOffsetHours: 7,
    spaceAgency: 'VNSC (Vietnam National Space Center)',
    majorSites: 'Hoa Lac Space Center, Nha Trang Space Observatory',
    overview:
      'Advancing satellite engineering with MicroDragon and LOTUSat radar observation for typhoon tracking.',
  },
  {
    id: 'kor',
    name: 'South Korea',
    capital: 'Seoul',
    lat: 35.9078,
    lng: 127.7669,
    timezone: 'UTC+09:00 (Korea Standard Time)',
    utcOffsetHours: 9,
    spaceAgency: 'KASA (Korea AeroSpace Administration)',
    majorSites: 'Naro Space Center Goheung, KARI Mission Control Daejeon',
    overview:
      'Operating the Nuri domestic orbital rocket, Danuri lunar orbiter, and national satellite remote sensing constellations.',
  },
  {
    id: 'idn',
    name: 'Indonesia',
    capital: 'Jakarta',
    lat: -0.7893,
    lng: 113.9213,
    timezone: 'UTC+07:00 to UTC+09:00',
    utcOffsetHours: 7,
    spaceAgency: 'BRIN Space & Aviation Research Organization (LAPAN)',
    majorSites: 'Biak Equatorial Spaceport, Rancabungur Satellite Ground Station',
    overview:
      'Developing equatorial orbital launch infrastructure in Papua and operating domestic telecommunications satellite fleets.',
  },
  {
    id: 'deu',
    name: 'Germany',
    capital: 'Berlin',
    lat: 51.1657,
    lng: 10.4515,
    timezone: 'UTC+01:00 (Central European Time)',
    utcOffsetHours: 1,
    spaceAgency: 'DLR (German Aerospace Center)',
    majorSites: 'German Space Operations Center (GSOC Oberpfaffenhofen), Lampoldshausen Propulsion Center',
    overview:
      'Key European contributor to radar Earth remote sensing (TerraSAR-X) and rocket propulsion testing.',
  },
  {
    id: 'gbr',
    name: 'United Kingdom',
    capital: 'London',
    lat: 55.3781,
    lng: -3.436,
    timezone: 'UTC+00:00 (GMT)',
    utcOffsetHours: 0,
    spaceAgency: 'UK Space Agency (UKSA)',
    majorSites: 'Harwell Space Cluster, SaxaVord Spaceport Shetland, Goonhilly Earth Station',
    overview:
      'Leading SmallSat manufacturing hub and commercial satellite telecommunications center with OneWeb constellation headquarters.',
  },
  {
    id: 'ita',
    name: 'Italy',
    capital: 'Rome',
    lat: 41.8719,
    lng: 12.5674,
    timezone: 'UTC+01:00 (Central European Time)',
    utcOffsetHours: 1,
    spaceAgency: 'ASI (Italian Space Agency)',
    majorSites: 'Broglio Space Centre (Malindi Kenya), Fucino Space Operations Center',
    overview:
      'Major contributor to European Vega launcher development, Cosmo-SkyMed radar constellation, and ISS pressurized modules.',
  },
  {
    id: 'can',
    name: 'Canada',
    capital: 'Ottawa',
    lat: 56.1304,
    lng: -106.3468,
    timezone: 'UTC-03:30 to UTC-08:00',
    utcOffsetHours: -5,
    spaceAgency: 'CSA (Canadian Space Agency)',
    majorSites: 'John H. Chapman Space Centre, RADARSAT Earth Operations',
    overview:
      'Pioneers of space robotics (Canadarm series for ISS and Lunar Gateway) and RADARSAT Arctic maritime radar mapping.',
  },
  {
    id: 'aus',
    name: 'Australia',
    capital: 'Canberra',
    lat: -25.2744,
    lng: 133.7751,
    timezone: 'UTC+08:00 to UTC+11:00',
    utcOffsetHours: 10,
    spaceAgency: 'Australian Space Agency (ASA)',
    majorSites: 'Canberra Deep Space Communication Complex, Whalers Way Orbital Launch Complex',
    overview:
      'Crucial Southern Hemisphere tracking hub for NASA Deep Space Network (DSN) receiving signals from Voyager and Mars rovers.',
  },
  {
    id: 'bra',
    name: 'Brazil',
    capital: 'Brasilia',
    lat: -14.235,
    lng: -51.9253,
    timezone: 'UTC-03:00 (Brasilia Time)',
    utcOffsetHours: -3,
    spaceAgency: 'AEB & INPE (National Institute for Space Research)',
    majorSites: 'Alcantara Launch Center (Equatorial Base), Amazonia-1 Mission Control',
    overview:
      'Operating equatorial orbital launch complex at Alcantara and monitoring Amazon rainforest deforestation via satellite imagery.',
  },
  {
    id: 'are',
    name: 'United Arab Emirates',
    capital: 'Abu Dhabi',
    lat: 23.4241,
    lng: 53.8478,
    timezone: 'UTC+04:00 (Gulf Standard Time)',
    utcOffsetHours: 4,
    spaceAgency: 'UAE Space Agency & Mohammed Bin Rashid Space Centre',
    majorSites: 'MBRSC Mission Control, Dubai Sat Telemetry Complex',
    overview:
      'Operators of the Hope Mars Probe (Emirates Mars Mission) and Rashid lunar rover exploration projects.',
  },
  {
    id: 'egy',
    name: 'Egypt',
    capital: 'Cairo',
    lat: 26.8206,
    lng: 30.8025,
    timezone: 'UTC+02:00 (Eastern European Time)',
    utcOffsetHours: 2,
    spaceAgency: 'EgSA (Egyptian Space Agency)',
    majorSites: 'Space City Complex Cairo, Nile Delta Telemetry Ground Station',
    overview:
      'Host of the African Space Agency headquarters and operator of NileSat and MisrSat Earth remote sensing constellations.',
  },
  {
    id: 'zaf',
    name: 'South Africa',
    capital: 'Pretoria',
    lat: -30.5595,
    lng: 22.9375,
    timezone: 'UTC+02:00 (South Africa Standard Time)',
    utcOffsetHours: 2,
    spaceAgency: 'SANSA (South African National Space Agency)',
    majorSites: 'Hartebeesthoek Radio Astronomy Observatory, Overberg Test Range',
    overview:
      'Southern African deep space telemetry node supporting interplanetary mission tracking and Square Kilometre Array (SKA) cosmology.',
  },
];

interface RealPlanetPhysics {
  id: string;
  name: string;
  type: string;
  sizeRadius: number; // 3D units
  orbitRadiusAU: number; // Astronomical Units
  orbitRadius3D: number; // Scaled 3D distance
  realPeriodDays: number; // Exact orbital period in days
  axialTiltDeg: number; // Real physical axial tilt (obliquity)
  rotationPeriodHours: number; // Exact sidereal day length
  isRetrograde: boolean;
  colorHex: string;
  textureUrl: string; // Real NASA photographic planetary map
  diameterKm: number;
  massKg: string;
  escapeVelocityKmS: number;
  surfaceGravityMs2: number;
  meanTempC: string;
  moonsCount: number;
  hasRings?: boolean;
  atmosphere: string[];
  physicsHighlights: string[];
}

// 100% Real Physical Parameters and NASA Photographic Planetary Maps
const REAL_PLANETS_PHYSICS: RealPlanetPhysics[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet (Innermost)',
    sizeRadius: 0.38,
    orbitRadiusAU: 0.387,
    orbitRadius3D: 9.5,
    realPeriodDays: 87.97, // 0.24 Earth years
    axialTiltDeg: 0.034, // Nearly upright
    rotationPeriodHours: 1407.6, // 58.6 Earth days
    isRetrograde: false,
    colorHex: '#9ca3af',
    textureUrl: '/textures/planets/mercury.jpg',
    diameterKm: 4879,
    massKg: '3.301 × 10²³ kg (0.055 Earths)',
    escapeVelocityKmS: 4.25,
    surfaceGravityMs2: 3.7,
    meanTempC: '-180°C to +430°C',
    moonsCount: 0,
    atmosphere: ['Trace: Oxygen (42%)', 'Sodium (29%)', 'Hydrogen (22%)', 'Helium (6%)'],
    physicsHighlights: [
      'Fastest orbital velocity in Solar System: 47.36 km/s',
      '3:2 spin-orbit resonance: rotates 3 times for every 2 orbits around the Sun',
      'Massive metallic core accounts for 85% of total planetary radius',
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet (Runaway Greenhouse)',
    sizeRadius: 0.95,
    orbitRadiusAU: 0.723,
    orbitRadius3D: 15.0,
    realPeriodDays: 224.7, // 0.615 Earth years
    axialTiltDeg: 177.36, // Retrograde spin (upside down)
    rotationPeriodHours: 5832.5, // 243 Earth days
    isRetrograde: true,
    colorHex: '#f59e0b',
    textureUrl: '/textures/planets/venus.jpg',
    diameterKm: 12104,
    massKg: '4.867 × 10²⁴ kg (0.815 Earths)',
    escapeVelocityKmS: 10.36,
    surfaceGravityMs2: 8.87,
    meanTempC: '+464°C',
    moonsCount: 0,
    atmosphere: ['Carbon Dioxide (96.5%)', 'Nitrogen (3.5%)', 'Sulfuric Acid Aerosols'],
    physicsHighlights: [
      'Retrograde rotation: the Sun rises in the West and sets in the East',
      'Atmospheric surface pressure: 9.2 MPa (92 atmospheres)',
      'Super-rotation: upper cloud layers circle the planet in just 4 Earth days',
    ],
  },
  {
    id: 'earth',
    name: 'Earth (Terra)',
    type: 'Terrestrial Ocean Planet (Biosphere)',
    sizeRadius: 1.0,
    orbitRadiusAU: 1.0,
    orbitRadius3D: 22.0,
    realPeriodDays: 365.256, // 1.000 Earth year
    axialTiltDeg: 23.44, // Exact cause of Earth’s 4 seasons!
    rotationPeriodHours: 23.934, // 1 Sidereal Day (23h 56m 4s)
    isRetrograde: false,
    colorHex: '#38bdf8',
    textureUrl: '/textures/planets/earth_day_4k.jpg',
    diameterKm: 12742,
    massKg: '5.972 × 10²⁴ kg (1.00 Earth)',
    escapeVelocityKmS: 11.186,
    surfaceGravityMs2: 9.807,
    meanTempC: '+15°C',
    moonsCount: 1, // Luna
    atmosphere: ['Nitrogen (78.08%)', 'Oxygen (20.95%)', 'Argon (0.93%)', 'Carbon Dioxide (0.04%)'],
    physicsHighlights: [
      'Orbital speed: 29.78 km/s around the Sun',
      'True day/night terminator with real-time city lights (NASA Black Marble)',
      'Active geodynamo core generating protective magnetic Van Allen belts',
    ],
  },
  {
    id: 'mars',
    name: 'Mars (The Red Planet)',
    type: 'Terrestrial Desert Planet',
    sizeRadius: 0.53,
    orbitRadiusAU: 1.524,
    orbitRadius3D: 30.5,
    realPeriodDays: 686.98, // 1.88 Earth years
    axialTiltDeg: 25.19, // Near-identical seasonal tilt to Earth!
    rotationPeriodHours: 24.623, // 1 Martian Sol (24h 37m 22s)
    isRetrograde: false,
    colorHex: '#ef4444',
    textureUrl: '/textures/planets/mars.jpg',
    diameterKm: 6779,
    massKg: '6.417 × 10²³ kg (0.107 Earths)',
    escapeVelocityKmS: 5.03,
    surfaceGravityMs2: 3.72,
    meanTempC: '-65°C',
    moonsCount: 2, // Phobos & Deimos
    atmosphere: ['Carbon Dioxide (95.3%)', 'Nitrogen (2.6%)', 'Argon (1.9%)'],
    physicsHighlights: [
      'Sol length: 24h 39m 35s, exceptionally close to Earth’s solar day',
      'Olympus Mons volcano: 21.9 km elevation with 600 km basal diameter',
      'Atmospheric surface pressure: 610 Pascals (less than 1% of Earth)',
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter (King of Planets)',
    type: 'Gas Giant (Jovian)',
    sizeRadius: 2.35,
    orbitRadiusAU: 5.204,
    orbitRadius3D: 43.0,
    realPeriodDays: 4332.59, // 11.86 Earth years
    axialTiltDeg: 3.13, // Almost upright
    rotationPeriodHours: 9.925, // Fastest spinning planet (under 10 hours!)
    isRetrograde: false,
    colorHex: '#d97706',
    textureUrl: '/textures/planets/jupiter.jpg',
    diameterKm: 139820,
    massKg: '1.898 × 10²⁷ kg (317.8 Earths)',
    escapeVelocityKmS: 59.5,
    surfaceGravityMs2: 24.79,
    meanTempC: '-110°C',
    moonsCount: 95,
    atmosphere: ['Hydrogen (89.8%)', 'Helium (10.2%)', 'Methane, Ammonia, Water Ice'],
    physicsHighlights: [
      'Rotates once every 9 hours 55 minutes, causing significant equatorial oblateness',
      'Massive magnetosphere: 20,000 times stronger than Earth’s magnetic dipole',
      'Europa: Subsurface liquid ocean warmed by tidal friction from Jupiter’s gravity',
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn (Ringed World)',
    type: 'Gas Giant with Planetary Rings',
    sizeRadius: 1.95,
    orbitRadiusAU: 9.582,
    orbitRadius3D: 56.0,
    realPeriodDays: 10759.22, // 29.45 Earth years
    axialTiltDeg: 26.73, // Rings tilt majestically toward the Sun!
    rotationPeriodHours: 10.656, // 10h 39m
    isRetrograde: false,
    colorHex: '#fcd34d',
    textureUrl: '/textures/planets/saturn.jpg',
    diameterKm: 116460,
    massKg: '5.683 × 10²⁶ kg (95.2 Earths)',
    escapeVelocityKmS: 35.5,
    surfaceGravityMs2: 10.44,
    meanTempC: '-140°C',
    moonsCount: 146,
    hasRings: true,
    atmosphere: ['Hydrogen (96.3%)', 'Helium (3.25%)', 'Methane & Ammonia'],
    physicsHighlights: [
      'Mean density: 0.687 g/cm³ (less dense than liquid water)',
      'Ring system diameter: 282,000 km, but only ~10 meters average thickness',
      'Enceladus cryogeysers vent salty water directly into Saturn’s E-ring',
    ],
  },
  {
    id: 'uranus',
    name: 'Uranus (Ice Giant)',
    type: 'Ice Giant (Tilted Axis)',
    sizeRadius: 1.4,
    orbitRadiusAU: 19.201,
    orbitRadius3D: 68.0,
    realPeriodDays: 30685.4, // 84.01 Earth years
    axialTiltDeg: 97.77, // Rotates completely on its side!
    rotationPeriodHours: 17.24, // 17h 14m (Retrograde)
    isRetrograde: true,
    colorHex: '#38bdf8',
    textureUrl: '/textures/planets/uranus.jpg',
    diameterKm: 50724,
    massKg: '8.681 × 10²⁵ kg (14.5 Earths)',
    escapeVelocityKmS: 21.3,
    surfaceGravityMs2: 8.69,
    meanTempC: '-195°C',
    moonsCount: 28,
    atmosphere: ['Hydrogen (82.5%)', 'Helium (15.2%)', 'Methane (2.3%)'],
    physicsHighlights: [
      'Axial tilt of 97.8°: rolls around the orbital plane like a bowling ball',
      'Each pole experiences 42 years of continuous sunlight and 42 years of night',
      'Coldest planetary mantle in the Solar System, emitting negligible internal heat',
    ],
  },
  {
    id: 'neptune',
    name: 'Neptune (Deep Ocean World)',
    type: 'Ice Giant (Outermost Planet)',
    sizeRadius: 1.35,
    orbitRadiusAU: 30.047,
    orbitRadius3D: 79.0,
    realPeriodDays: 60189.0, // 164.8 Earth years
    axialTiltDeg: 28.32,
    rotationPeriodHours: 16.11, // 16h 6m
    isRetrograde: false,
    colorHex: '#2563eb',
    textureUrl: '/textures/planets/neptune.jpg',
    diameterKm: 49244,
    massKg: '1.024 × 10²⁶ kg (17.1 Earths)',
    escapeVelocityKmS: 23.5,
    surfaceGravityMs2: 11.15,
    meanTempC: '-200°C',
    moonsCount: 16,
    atmosphere: ['Hydrogen (80%)', 'Helium (19%)', 'Methane (1.5%)'],
    physicsHighlights: [
      'Supersonic winds clocking over 2,100 km/h (Mach 1.7)',
      'Discovered via mathematical perturbation calculations by Le Verrier in 1846',
      'Triton moon orbits in retrograde, ejecting nitrogen geysers 8 km high',
    ],
  },
];

export default function SolarSystemInteractiveGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<RealPlanetPhysics | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [useRealTimeSync, setUseRealTimeSync] = useState(true); // Live Real-Time Earth Day/Night Sync
  const [selectedCountry, setSelectedCountry] = useState<CountryPoint>(REAL_WORLD_COUNTRIES[0]); // Cambodia default
  const [countrySearch, setCountrySearch] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingStatus, setLocatingStatus] = useState<string>('Ready to locate your real coordinates on Earth');
  const [isEarthFocused, setIsEarthFocused] = useState(false);
  const [targetSolarStatus, setTargetSolarStatus] = useState<'day' | 'night' | 'twilight'>('day');
  const [liveUtcString, setLiveUtcString] = useState('');

  const earthCloudsRef = useRef<THREE.Mesh | null>(null);
  const earthAtmoRef = useRef<THREE.ShaderMaterial | null>(null);

  const sceneContextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    sunMesh: THREE.Mesh;
    coronaMesh: THREE.Mesh;
    earthMesh: THREE.Mesh | null;
    earthShaderMaterial: THREE.ShaderMaterial | null;
    earthBodyGroup: THREE.Group | null;
    countryMarkers: { country: CountryPoint; marker: THREE.Group }[];
    userPinMesh: THREE.Group | null;
    planetMeshes: {
      planet: RealPlanetPhysics;
      orbitPivot: THREE.Group;
      tiltGroup: THREE.Group;
      body: THREE.Mesh;
      orbitLine: THREE.Line;
      angle: number;
    }[];
    spherical: { radius: number; theta: number; phi: number };
    targetedMesh: THREE.Object3D | null;
    isDragging: boolean;
    prevX: number;
    prevY: number;
  } | null>(null);

  // Convert (lat, lng) to 3D Cartesian coordinates on sphere of radius R
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Determine if coordinates are in Full Day, Night, or Twilight Terminator
  const computeDayNightAtCoords = (lat: number, lng: number, sunDir: THREE.Vector3): 'day' | 'night' | 'twilight' => {
    const pt = latLngToVector3(lat, lng, 1.0).normalize();
    const dot = pt.dot(sunDir.normalize());
    if (dot > 0.08) return 'day';
    if (dot < -0.08) return 'night';
    return 'twilight';
  };

  // Live Astronomical Clock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveUtcString(now.toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Three.js Engine with Full Keplerian Orbital Mechanics
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020409);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.02, 5000);
    camera.position.set(0, 32, 90);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 1. Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // Cosmic Deep Space Starfield & Galaxy Sphere
    const bgGeo = new THREE.SphereGeometry(1500, 32, 32);
    const bgTex = textureLoader.load('/textures/planets/galaxy_starfield.png');
    bgTex.wrapS = THREE.RepeatWrapping;
    bgTex.wrapT = THREE.RepeatWrapping;
    bgTex.repeat.set(4, 2);
    const bgMat = new THREE.MeshBasicMaterial({
      map: bgTex,
      side: THREE.BackSide,
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    scene.add(bgMesh);

    // Dynamic Starfield Points
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3500;
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 1800;
      starPos[i + 1] = (Math.random() - 0.5) * 1800;
      starPos[i + 2] = (Math.random() - 0.5) * 1800;

      const r = Math.random();
      if (r > 0.8) {
        starCols[i] = 0.45; starCols[i + 1] = 0.8; starCols[i + 2] = 1.0;
      } else if (r > 0.6) {
        starCols[i] = 1.0; starCols[i + 1] = 0.8; starCols[i + 2] = 0.45;
      } else {
        starCols[i] = 0.95; starCols[i + 1] = 0.95; starCols[i + 2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));
    const starField = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.8 }));
    scene.add(starField);

    // Ambient space illumination
    const ambientLight = new THREE.AmbientLight(0x0a101d, 1.4);
    scene.add(ambientLight);

    // 1. THE SUN: Center Physical Point Light
    const sunPointLight = new THREE.PointLight(0xfffbeb, 4.5, 800, 0.3);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const sunGeo = new THREE.SphereGeometry(3.9, 64, 64);
    const sunTex = textureLoader.load('/textures/planets/sun.jpg');
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun Corona Plasma Flare Shell
    const coronaGeo = new THREE.SphereGeometry(4.55, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // Solar Flare Glow Sprite on the Sun (creates cinematic sunrise glow on the horizon)
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 128;
    flareCanvas.height = 128;
    const flareCtx = flareCanvas.getContext('2d')!;
    const grad = flareCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.15, 'rgba(254, 240, 138, 0.9)');
    grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flareCtx.fillStyle = grad;
    flareCtx.fillRect(0, 0, 128, 128);
    const flareTex = new THREE.CanvasTexture(flareCanvas);
    const sunFlareMat = new THREE.SpriteMaterial({
      map: flareTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const sunFlareSprite = new THREE.Sprite(sunFlareMat);
    sunFlareSprite.scale.set(16, 16, 1);
    sunMesh.add(sunFlareSprite);

    // 2. REAL EARTH WITH TRUE NASA 4K BLUE MARBLE & BLACK MARBLE SHADER
    const earthDayTex = textureLoader.load('/textures/planets/earth_day_4k.jpg');
    const earthNightTex = textureLoader.load('/textures/planets/earth_night_4k.jpg');
    const earthSpecTex = textureLoader.load('/textures/planets/earth_specular.jpg');
    const earthCloudsTex = textureLoader.load('/textures/planets/earth_clouds.png');

    const earthShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: earthDayTex },
        nightTexture: { value: earthNightTex },
        specularMap: { value: earthSpecTex },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specularMap;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 norm = normalize(vNormal);
          vec3 sunDir = normalize(sunDirection);
          float NdotL = dot(norm, sunDir);
          
          // Smooth day/night twilight terminator transition
          float dayFactor = smoothstep(-0.12, 0.12, NdotL);
          
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // Realistic night lights: warm glowing NASA city lights
          vec3 nightLights = nightColor.rgb * 2.3;
          vec3 mixedColor = mix(nightLights, dayColor.rgb, dayFactor);
          
          // Ocean specular sun glint
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 halfDir = normalize(sunDir + viewDir);
          float specAmount = pow(max(dot(norm, halfDir), 0.0), 32.0);
          float specMask = texture2D(specularMap, vUv).r;
          vec3 sunSpecular = vec3(0.9, 0.95, 1.0) * specAmount * specMask * max(0.0, NdotL) * 0.75;
          mixedColor += sunSpecular;
          
          // Subtle atmospheric limb rim glow on daylight side
          float rim = 1.0 - max(0.0, dot(norm, viewDir));
          vec3 atmoGlow = vec3(0.25, 0.65, 1.0) * pow(rim, 3.2) * max(0.0, NdotL + 0.2);
          mixedColor += atmoGlow * 0.45;
          
          gl_FragColor = vec4(mixedColor, 1.0);
        }
      `,
    });

    // Helper: Google Maps Billboard Label
    const createCountryLabelSprite = (countryName: string, isCambodia: boolean, isUserLocation: boolean = false): THREE.Sprite => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 256, 64);

      // Card pill background
      if (isUserLocation) {
        ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
        ctx.strokeStyle = '#10b981';
      } else if (isCambodia) {
        ctx.fillStyle = 'rgba(3, 105, 161, 0.95)';
        ctx.strokeStyle = '#38bdf8';
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      }
      ctx.lineWidth = 2.5;

      const px = 6, py = 10, pw = 244, ph = 44, pr = 8;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(px, py, pw, ph, pr);
      } else {
        ctx.rect(px, py, pw, ph);
      }
      ctx.fill();
      ctx.stroke();

      // Country Name
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = isUserLocation ? '#34d399' : isCambodia ? '#ffffff' : '#f1f5f9';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(countryName.toUpperCase(), 128, 32);

      const sprTex = new THREE.CanvasTexture(canvas);
      sprTex.minFilter = THREE.LinearFilter;
      const sprMat = new THREE.SpriteMaterial({
        map: sprTex,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(sprMat);
      sprite.scale.set(0.32, 0.08, 1);
      return sprite;
    };

    let earthMesh: THREE.Mesh | null = null;
    let earthBodyGroup: THREE.Group | null = null;
    let userPinGroup: THREE.Group | null = null;
    const countryMarkers: { country: CountryPoint; marker: THREE.Group }[] = [];
    const planetMeshes: any[] = [];

    // Base Keplerian velocity factor (1 Earth year = 60s at 1x speed)
    const BASE_EARTH_ORBIT_CYCLE_SEC = 60.0;

    // 3. Build All Planets with Real Keplerian Mechanics and Axial Tilts
    REAL_PLANETS_PHYSICS.forEach((planet) => {
      // Pivot around Sun
      const orbitPivot = new THREE.Group();
      scene.add(orbitPivot);

      // Orbit Line Ring (True circular/elliptical path)
      const orbitCurve = new THREE.EllipseCurve(0, 0, planet.orbitRadius3D, planet.orbitRadius3D, 0, 2 * Math.PI, false, 0);
      const pts = orbitCurve.getPoints(120);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, 0, p.y)));
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(planet.colorHex),
        transparent: true,
        opacity: 0.28,
      });
      const orbitLine = new THREE.Line(lineGeo, lineMat);
      orbitLine.rotation.x = Math.PI / 2;
      scene.add(orbitLine);

      // Axial Tilt Group (Applies exact physical tilt e.g. Earth 23.44°, Mars 25.19°, Saturn 26.73°)
      const tiltGroup = new THREE.Group();
      tiltGroup.position.set(planet.orbitRadius3D, 0, 0);
      tiltGroup.rotation.z = (planet.axialTiltDeg * Math.PI) / 180;
      orbitPivot.add(tiltGroup);

      let body: THREE.Mesh;

      if (planet.id === 'earth') {
        const eGeo = new THREE.SphereGeometry(planet.sizeRadius, 64, 64);
        body = new THREE.Mesh(eGeo, earthShaderMaterial);
        tiltGroup.add(body);
        earthMesh = body;
        earthBodyGroup = tiltGroup;

        // Realistic Atmospheric Clouds Layer (Swirling clouds drifting over oceans/continents)
        const cloudGeo = new THREE.SphereGeometry(planet.sizeRadius * 1.009, 64, 64);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: earthCloudsTex,
          transparent: true,
          opacity: 0.82,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });
        const cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
        tiltGroup.add(cloudsMesh);
        earthCloudsRef.current = cloudsMesh;

        // Realistic Rayleigh Scattering Atmospheric Limb Glow Halo
        const atmoGeo = new THREE.SphereGeometry(planet.sizeRadius * 1.032, 64, 64);
        const atmoMat = new THREE.ShaderMaterial({
          uniforms: {
            sunDirection: { value: new THREE.Vector3(1, 0, 0) },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPos.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
          `,
          fragmentShader: `
            uniform vec3 sunDirection;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            void main() {
              vec3 norm = normalize(vNormal);
              vec3 viewDir = normalize(cameraPosition - vWorldPosition);
              float rim = 1.0 - max(0.0, dot(norm, viewDir));
              float sunFacing = dot(norm, normalize(sunDirection));
              float intensity = pow(rim, 2.5) * smoothstep(-0.3, 0.35, sunFacing);
              vec3 atmoColor = vec3(0.2, 0.62, 1.0);
              gl_FragColor = vec4(atmoColor, intensity * 0.95);
            }
          `,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
        });
        const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
        tiltGroup.add(atmoMesh);
        earthAtmoRef.current = atmoMat;

        // Add 3D Country Markers on Earth with Google Maps precision & labels
        REAL_WORLD_COUNTRIES.forEach((c) => {
          const mGroup = new THREE.Group();
          const isKh = c.id === 'khm';

          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 12, 12),
            new THREE.MeshBasicMaterial({ color: isKh ? 0x38bdf8 : 0x94a3b8 })
          );
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.025, 0.05, 16),
            new THREE.MeshBasicMaterial({
              color: isKh ? 0x38bdf8 : 0x64748b,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.8,
            })
          );
          ring.rotation.x = Math.PI / 2;

          // Vertical stem pin connecting surface to label
          const stemGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.035, 8);
          const stemMat = new THREE.MeshBasicMaterial({ color: isKh ? 0x38bdf8 : 0x64748b });
          const stem = new THREE.Mesh(stemGeo, stemMat);
          stem.position.set(0, 0.018, 0);

          mGroup.add(dot);
          mGroup.add(ring);
          mGroup.add(stem);

          // Google Maps Billboard Label
          const label = createCountryLabelSprite(c.name, isKh);
          label.position.set(0, 0.048, 0);
          mGroup.add(label);

          const pos = latLngToVector3(c.lat, c.lng, planet.sizeRadius + 0.015);
          mGroup.position.copy(pos);
          body.add(mGroup);
          countryMarkers.push({ country: c, marker: mGroup });
        });

        // GPS User Marker
        userPinGroup = new THREE.Group();
        const pinDot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        const pinRadar = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.085, 20), new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }));
        pinRadar.rotation.x = Math.PI / 2;
        const pinStem = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.045, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        pinStem.position.set(0, 0.022, 0);

        const userPinLabel = createCountryLabelSprite('MY CURRENT GPS LOCATION', false, true);
        userPinLabel.position.set(0, 0.065, 0);

        userPinGroup.add(pinDot);
        userPinGroup.add(pinRadar);
        userPinGroup.add(pinStem);
        userPinGroup.add(userPinLabel);
        body.add(userPinGroup);

        const initPinPos = latLngToVector3(REAL_WORLD_COUNTRIES[0].lat, REAL_WORLD_COUNTRIES[0].lng, planet.sizeRadius + 0.015);
        userPinGroup.position.copy(initPinPos);

        // Real Moon with 27.3 Day Orbital Cycle & 5.14° Inclination
        const moonPivot = new THREE.Group();
        moonPivot.rotation.z = (5.14 * Math.PI) / 180;
        tiltGroup.add(moonPivot);
        const moonGeo = new THREE.SphereGeometry(0.27, 32, 32);
        const moonTex = textureLoader.load('/textures/planets/moon_1k.jpg');
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          roughness: 0.92,
          metalness: 0.05,
        });
        const moonBody = new THREE.Mesh(moonGeo, moonMat);
        moonBody.position.set(3.4, 0, 0);
        moonPivot.add(moonBody);
      } else {
        const pGeo = new THREE.SphereGeometry(planet.sizeRadius, 64, 64);
        const pTex = textureLoader.load(planet.textureUrl);
        const pMat = new THREE.MeshStandardMaterial({
          map: pTex,
          roughness: 0.75,
          metalness: 0.05,
        });
        body = new THREE.Mesh(pGeo, pMat);
        tiltGroup.add(body);

        // Saturn's Rings (Cassini ring transparency map)
        if (planet.hasRings) {
          const ringInner = planet.sizeRadius * 1.32;
          const ringOuter = planet.sizeRadius * 2.38;
          const ringGeo = new THREE.RingGeometry(ringInner, ringOuter, 64);
          
          const pos = ringGeo.attributes.position;
          const v3 = new THREE.Vector3();
          for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            const dist = v3.length();
            const u = (dist - ringInner) / (ringOuter - ringInner);
            ringGeo.attributes.uv.setXY(i, u, 0.5);
          }
          
          const ringTex = textureLoader.load('/textures/planets/saturn_ring.png');
          const ringMat = new THREE.MeshStandardMaterial({
            map: ringTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92,
            roughness: 0.5,
          });
          const rings = new THREE.Mesh(ringGeo, ringMat);
          rings.rotation.x = Math.PI / 2;
          tiltGroup.add(rings);
        }
      }

      planetMeshes.push({
        planet,
        orbitPivot,
        tiltGroup,
        body,
        orbitLine,
        angle: Math.random() * Math.PI * 2,
      });
    });

    sceneContextRef.current = {
      scene,
      camera,
      renderer,
      sunMesh,
      coronaMesh,
      earthMesh,
      earthShaderMaterial,
      earthBodyGroup,
      countryMarkers,
      userPinMesh: userPinGroup,
      planetMeshes,
      spherical: { radius: 90, theta: 0.45, phi: 1.15 },
      targetedMesh: null,
      isDragging: false,
      prevX: 0,
      prevY: 0,
    };

    // Mouse Interaction
    const onMouseDown = (e: MouseEvent) => {
      if (!sceneContextRef.current) return;
      sceneContextRef.current.isDragging = true;
      sceneContextRef.current.prevX = e.clientX;
      sceneContextRef.current.prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!sceneContextRef.current || !sceneContextRef.current.isDragging) return;
      const dx = e.clientX - sceneContextRef.current.prevX;
      const dy = e.clientY - sceneContextRef.current.prevY;

      sceneContextRef.current.spherical.theta -= dx * 0.004;
      sceneContextRef.current.spherical.phi = THREE.MathUtils.clamp(
        sceneContextRef.current.spherical.phi - dy * 0.004,
        0.05,
        Math.PI - 0.05
      );

      sceneContextRef.current.prevX = e.clientX;
      sceneContextRef.current.prevY = e.clientY;
    };

    const onMouseUp = () => {
      if (!sceneContextRef.current) return;
      sceneContextRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!sceneContextRef.current) return;

      const currentR = sceneContextRef.current.spherical.radius;
      // Proportional zoom sensitivity: ultra smooth when close to Earth surface, faster when in deep space
      const zoomFactor = currentR < 2.0 ? 0.0018 * currentR : currentR < 10.0 ? 0.015 : 0.055;
      const delta = e.deltaY * zoomFactor;

      const isTargetingBody = sceneContextRef.current.targetedMesh !== null;
      // Allow zooming right down to 1.14 (Low Earth Orbit / satellite altitude) when looking at Earth!
      const minRadius = isTargetingBody ? 1.14 : 3.0;

      sceneContextRef.current.spherical.radius = THREE.MathUtils.clamp(
        currentR + delta,
        minRadius,
        350
      );
    };

    const onCanvasClick = (e: MouseEvent) => {
      if (!sceneContextRef.current || !container) return;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
        -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, sceneContextRef.current.camera);

      // Check click on Earth Country Markers
      for (const cm of sceneContextRef.current.countryMarkers) {
        const hits = raycaster.intersectObjects(cm.marker.children);
        if (hits.length > 0) {
          handleSelectCountry(cm.country);
          return;
        }
      }

      // Check click on planets
      for (const item of sceneContextRef.current.planetMeshes) {
        const hits = raycaster.intersectObject(item.body);
        if (hits.length > 0) {
          handleSelectPlanet(item.planet);
          return;
        }
      }

      // Check click on Sun
      const sunHits = raycaster.intersectObject(sceneContextRef.current.sunMesh);
      if (sunHits.length > 0) {
        handleResetView();
      }
    };

    const onResize = () => {
      if (!container || !sceneContextRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      sceneContextRef.current.camera.aspect = w / h;
      sceneContextRef.current.camera.updateProjectionMatrix();
      sceneContextRef.current.renderer.setSize(w, h);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', onResize);

    // Animation Render Loop with Real Keplerian Time Physics
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.016;

      if (sceneContextRef.current) {
        const {
          sunMesh,
          coronaMesh,
          planetMeshes,
          earthMesh,
          earthShaderMaterial,
          camera,
          spherical,
          targetedMesh,
          userPinMesh,
        } = sceneContextRef.current;

        // Sun rotation
        sunMesh.rotation.y += 0.002;
        const pulse = 1 + Math.sin(clock * 3) * 0.04;
        coronaMesh.scale.set(pulse, pulse, pulse);

        // Real Keplerian Orbital Motions: T_planet / T_earth
        planetMeshes.forEach((item) => {
          if (!isPaused) {
            // Kepler's Third Law: speed is strictly proportional to 1 / sqrt(a)
            const speedFactor = (365.256 / item.planet.realPeriodDays) * 0.0025 * simSpeed;
            item.angle += speedFactor;
            item.orbitPivot.rotation.y = item.angle;

            // Real physical rotation around its tilted axis
            const rotFactor = (24.0 / Math.abs(item.planet.rotationPeriodHours)) * 0.02 * simSpeed;
            item.body.rotation.y += item.planet.isRetrograde ? -rotFactor : rotFactor;
          }

          item.orbitLine.visible = showOrbits;
        });

        // Real-Time Earth Rotation Synchronization
        if (earthMesh && earthShaderMaterial) {
          if (useRealTimeSync && !isPaused) {
            // Synchronize Earth's rotation angle directly with current real-time UTC!
            const now = new Date();
            const utcSeconds = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
            // Solar noon at 0° longitude is at 12:00 UTC (43200s)
            const dayFraction = utcSeconds / 86400;
            earthMesh.rotation.y = dayFraction * 2 * Math.PI + Math.PI;
          }

          // Dynamic atmospheric cloud drift (clouds rotate with atmospheric winds)
          if (earthCloudsRef.current && !isPaused) {
            earthCloudsRef.current.rotation.y += 0.00032 * simSpeed;
          }

          // Compute exact Sun direction relative to Earth surface normal
          const earthWorldPos = new THREE.Vector3();
          earthMesh.getWorldPosition(earthWorldPos);

          const sunDir = new THREE.Vector3(0, 0, 0).sub(earthWorldPos).normalize();
          const invMatrix = new THREE.Matrix4().extractRotation(earthMesh.matrixWorld).invert();
          sunDir.applyMatrix4(invMatrix);

          earthShaderMaterial.uniforms.sunDirection.value.copy(sunDir);

          if (earthAtmoRef.current) {
            earthAtmoRef.current.uniforms.sunDirection.value.copy(sunDir);
          }
        }

        // Pulse Radar Pin on User GPS location
        if (userPinMesh) {
          const ring = userPinMesh.children[1];
          if (ring) {
            const pScale = 1 + Math.sin(clock * 6) * 0.25;
            ring.scale.set(pScale, pScale, 1);
          }
        }

        // Camera Follow Target (Earth, Sun, or other planets)
        const targetWorldPos = new THREE.Vector3();
        if (targetedMesh) {
          targetedMesh.getWorldPosition(targetWorldPos);
        } else {
          targetWorldPos.set(0, 0, 0);
        }

        const camX = targetWorldPos.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        const camY = targetWorldPos.y + spherical.radius * Math.cos(spherical.phi);
        const camZ = targetWorldPos.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);

        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.06);
        camera.lookAt(targetWorldPos);

        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onCanvasClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [isPaused, simSpeed, showOrbits, useRealTimeSync]);

  // Planet Focus
  const handleSelectPlanet = (planet: RealPlanetPhysics) => {
    setSelectedPlanet(planet);
    setIsEarthFocused(planet.id === 'earth');

    if (!sceneContextRef.current) return;
    const item = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === planet.id);
    if (item) {
      sceneContextRef.current.targetedMesh = item.body;
      sceneContextRef.current.spherical.radius = planet.sizeRadius * 4.2 + 2;
    }
  };

  // Reset to Full Solar System
  const handleResetView = () => {
    setSelectedPlanet(null);
    setIsEarthFocused(false);
    if (!sceneContextRef.current) return;
    sceneContextRef.current.targetedMesh = null;
    sceneContextRef.current.spherical.radius = 90;
    sceneContextRef.current.spherical.theta = 0.45;
    sceneContextRef.current.spherical.phi = 1.15;
  };

  // Cinematic Low Earth Orbit Sunrise Horizon View (Matching photo)
  const handleCinematicHorizonView = () => {
    const earthData = REAL_PLANETS_PHYSICS.find((p) => p.id === 'earth')!;
    setSelectedPlanet(earthData);
    setIsEarthFocused(true);

    if (!sceneContextRef.current) return;
    const earthItem = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === 'earth');
    if (!earthItem) return;

    sceneContextRef.current.targetedMesh = earthItem.body;
    // Skim right above the atmosphere at 1.28 radius
    sceneContextRef.current.spherical.radius = 1.28;
    // Tangential horizon grazing angle
    sceneContextRef.current.spherical.phi = 1.48;

    if (sceneContextRef.current.earthMesh) {
      const eRot = sceneContextRef.current.earthMesh.rotation.y;
      // Position camera looking along the terminator line toward the rising Sun
      sceneContextRef.current.spherical.theta = -eRot + Math.PI / 2 + 0.35;
    }
  };

  // High Orbit Full Globe View
  const handleGlobalEarthView = () => {
    const earthData = REAL_PLANETS_PHYSICS.find((p) => p.id === 'earth')!;
    setSelectedPlanet(earthData);
    setIsEarthFocused(true);

    if (!sceneContextRef.current) return;
    const earthItem = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === 'earth');
    if (!earthItem) return;

    sceneContextRef.current.targetedMesh = earthItem.body;
    sceneContextRef.current.spherical.radius = 2.65;
    sceneContextRef.current.spherical.phi = 1.22;
    sceneContextRef.current.spherical.theta = 0.45;
  };

  // Select Country on Earth (Google Maps Mode: zooms close to country)
  const handleSelectCountry = (country: CountryPoint) => {
    setSelectedCountry(country);
    setIsEarthFocused(true);

    const earthData = REAL_PLANETS_PHYSICS.find((p) => p.id === 'earth')!;
    setSelectedPlanet(earthData);

    if (!sceneContextRef.current) return;
    const earthItem = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === 'earth');
    if (!earthItem) return;

    sceneContextRef.current.targetedMesh = earthItem.body;
    // Zoom close down to country territory like Google Maps
    sceneContextRef.current.spherical.radius = 1.38;

    // Center camera view directly onto country coordinates
    if (sceneContextRef.current.earthMesh) {
      const eRot = sceneContextRef.current.earthMesh.rotation.y;
      const lngRad = (country.lng * Math.PI) / 180;
      sceneContextRef.current.spherical.theta = -eRot - lngRad + Math.PI / 2;
      sceneContextRef.current.spherical.phi = THREE.MathUtils.clamp(
        (90 - country.lat) * (Math.PI / 180),
        0.35,
        Math.PI - 0.35
      );

      // Check solar illumination at target country
      const earthWorldPos = new THREE.Vector3();
      sceneContextRef.current.earthMesh.getWorldPosition(earthWorldPos);
      const sunDir = new THREE.Vector3(0, 0, 0).sub(earthWorldPos).normalize();
      const status = computeDayNightAtCoords(country.lat, country.lng, sunDir);
      setTargetSolarStatus(status);
    }
  };

  // GPS Locate My Current Coordinates on Real Earth (Astronaut Pinpoint Mode)
  const handleLocateMyPosition = () => {
    if (!navigator.geolocation) {
      setLocatingStatus('Browser does not support geolocation telemetry');
      return;
    }

    setLocatingStatus('Acquiring orbital GPS lock on your coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocatingStatus(`Locked: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);

        if (sceneContextRef.current && sceneContextRef.current.userPinMesh && sceneContextRef.current.earthMesh) {
          const earthData = REAL_PLANETS_PHYSICS.find((p) => p.id === 'earth')!;
          const posVec = latLngToVector3(latitude, longitude, earthData.sizeRadius + 0.015);
          sceneContextRef.current.userPinMesh.position.copy(posVec);

          handleSelectPlanet(earthData);
          // Zoom close down directly above user location
          sceneContextRef.current.spherical.radius = 1.30;

          const eRot = sceneContextRef.current.earthMesh.rotation.y;
          const lngRad = (longitude * Math.PI) / 180;
          sceneContextRef.current.spherical.theta = -eRot - lngRad + Math.PI / 2;
          sceneContextRef.current.spherical.phi = THREE.MathUtils.clamp(
            (90 - latitude) * (Math.PI / 180),
            0.35,
            Math.PI - 0.35
          );

          const earthWorldPos = new THREE.Vector3();
          sceneContextRef.current.earthMesh.getWorldPosition(earthWorldPos);
          const sunDir = new THREE.Vector3(0, 0, 0).sub(earthWorldPos).normalize();
          const status = computeDayNightAtCoords(latitude, longitude, sunDir);
          setTargetSolarStatus(status);
        }
      },
      (err) => {
        setLocatingStatus(`GPS fallback: Using Cambodia coordinates (${err.message})`);
        // Fallback to Cambodia center
        handleSelectCountry(REAL_WORLD_COUNTRIES[0]);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Filter countries
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return REAL_WORLD_COUNTRIES;
    const q = countrySearch.toLowerCase();
    return REAL_WORLD_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q) || c.majorSites.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-950 select-none font-mono text-xs">
      {/* 3D WebGL Canvas Layer (Full Viewport 100vw x 100vh) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Glassmorphic HUD Bar */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Brand */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-space-950/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-space-700/80 shadow-lg">
          <div className="w-6 h-6 rounded bg-space-800 border border-space-600 flex items-center justify-center text-aeroblue">
            <Sun className="w-3.5 h-3.5 text-aeroamber" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>AEROVEX</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-aeroblue/15 text-aeroblue rounded border border-aeroblue/30">
                REAL PHYSICS ENGINE
              </span>
            </div>
            <div className="text-[10px] text-space-400">100% AUTHENTIC KEPLERIAN ORBITS & DAY/NIGHT</div>
          </div>
        </div>

        {/* Orbit Simulation Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-space-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-space-700/80 text-xs shadow-lg">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded hover:bg-space-800 text-space-300 hover:text-white transition-colors"
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? <Play className="w-4 h-4 text-aerogreen" /> : <Pause className="w-4 h-4 text-aeroamber" />}
          </button>

          <div className="h-4 w-px bg-space-800 mx-1" />

          {/* Real-Time UTC Live Sync Toggle */}
          <button
            onClick={() => setUseRealTimeSync(!useRealTimeSync)}
            className={`px-2.5 py-1 rounded text-[11px] transition-all flex items-center gap-1.5 ${
              useRealTimeSync
                ? 'bg-aerogreen/20 text-aerogreen border border-aerogreen/40 font-bold'
                : 'text-space-400 hover:text-white hover:bg-space-800'
            }`}
            title="Synchronize Earth rotation directly with live UTC time"
          >
            <Clock className="w-3 h-3" />
            <span>{useRealTimeSync ? 'LIVE UTC SYNC' : 'MANUAL SPEED'}</span>
          </button>

          <div className="h-4 w-px bg-space-800 mx-1" />

          {[1, 5, 20].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                setSimSpeed(spd);
                setUseRealTimeSync(false);
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                !useRealTimeSync && simSpeed === spd ? 'bg-aeroblue text-space-950 font-bold' : 'text-space-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}

          <div className="h-4 w-px bg-space-800 mx-1" />

          <button
            onClick={() => setShowOrbits(!showOrbits)}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              showOrbits ? 'bg-space-800 text-aeroblue border border-space-700' : 'text-space-500 hover:text-white'
            }`}
            title="Toggle Orbital Rings"
          >
            TRAILS
          </button>

          <button
            onClick={handleResetView}
            className="p-1.5 rounded hover:bg-space-800 text-space-300 hover:text-white transition-colors ml-1"
            title="Full Solar System"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Perspective Views: Astronaut Horizon Sunrise, Global Earth, Cambodia, GPS */}
      <div className="absolute top-16 inset-x-4 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-space-950/90 backdrop-blur-md p-1.5 rounded-xl border border-space-700/80 shadow-2xl overflow-x-auto text-xs">
          <button
            onClick={handleCinematicHorizonView}
            className="px-3 py-1.5 rounded-lg bg-aeroamber/20 hover:bg-aeroamber/30 text-aeroamber-light border border-aeroamber/40 font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            title="Astronaut Horizon Sunrise Perspective (View from Orbit)"
          >
            <Flame className="w-3.5 h-3.5 text-aeroamber" />
            <span>LEO SUNRISE HORIZON</span>
          </button>

          <button
            onClick={handleGlobalEarthView}
            className="px-3 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-aeroblue border border-aeroblue/40 font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
            title="High Orbit Astronaut Globe View"
          >
            <Globe className="w-3.5 h-3.5 text-aeroblue" />
            <span>GLOBAL EARTH</span>
          </button>

          <button
            onClick={() => handleSelectCountry(REAL_WORLD_COUNTRIES[0])}
            className="px-3 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-white border border-space-700 font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
            title="Zoom into Cambodia (Angkor & Phnom Penh)"
          >
            <MapPin className="w-3.5 h-3.5 text-aeroblue" />
            <span>CAMBODIA</span>
          </button>

          <button
            onClick={handleLocateMyPosition}
            className="px-3 py-1.5 rounded-lg bg-aerogreen/20 hover:bg-aerogreen/30 text-aerogreen border border-aerogreen/40 font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            title="Pinpoint my live GPS location on Earth"
          >
            <Navigation className="w-3.5 h-3.5 text-aerogreen animate-pulse" />
            <span>PINPOINT MY GPS</span>
          </button>

          <button
            onClick={handleResetView}
            className="px-3 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-space-300 hover:text-white border border-space-700 transition-all flex items-center gap-1.5 whitespace-nowrap"
            title="Full Solar System View"
          >
            <Compass className="w-3.5 h-3.5 text-space-400" />
            <span>SOLAR SYSTEM</span>
          </button>
        </div>
      </div>

      {/* Bottom Planet Quick-Selector Bar */}
      <div className="absolute bottom-5 inset-x-4 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 bg-space-950/90 backdrop-blur-md p-1.5 rounded-xl border border-space-700/80 shadow-2xl overflow-x-auto max-w-full">
          <button
            onClick={handleResetView}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
              selectedPlanet === null && !isEarthFocused
                ? 'bg-aeroamber text-space-950 font-bold shadow-md shadow-aeroamber/20'
                : 'text-space-300 hover:text-white hover:bg-space-850'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-aeroamber" />
            <span>THE SUN</span>
          </button>

          {REAL_PLANETS_PHYSICS.map((planet) => {
            const isSelected = selectedPlanet?.id === planet.id;

            return (
              <button
                key={planet.id}
                onClick={() => handleSelectPlanet(planet)}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-aeroblue text-space-950 font-bold shadow-md shadow-aeroblue/20'
                    : 'text-space-400 hover:text-white hover:bg-space-850'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: planet.colorHex }}
                />
                <span>{planet.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Day/Night Live Status HUD (When Earth is Focused) */}
      {isEarthFocused && (
        <div className="absolute top-28 left-4 z-20 pointer-events-none max-w-xs">
          <div className="bg-space-950/85 backdrop-blur-md p-3.5 rounded-lg border border-space-700/80 space-y-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-aerogreen animate-pulse" />
              <span className="text-white font-bold text-xs uppercase">
                REAL DAY & NIGHT TERMINATOR
              </span>
            </div>
            <p className="text-[11px] text-space-300 leading-relaxed">
              Half of Earth is illuminated in real daylight, while the dark night hemisphere reveals glowing golden city
              lights (NASA Black Marble).
            </p>
            <div className="p-2 bg-space-900 rounded border border-space-800 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-space-400">FOCUS TARGET:</span>
                <span className="text-white font-bold">{selectedCountry.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">SOLAR ILLUMINATION:</span>
                <span className={targetSolarStatus === 'day' ? 'text-aeroamber font-bold' : targetSolarStatus === 'night' ? 'text-aeroblue font-bold' : 'text-aerocyan font-bold'}>
                  {targetSolarStatus === 'day' ? 'DAYTIME (NASA BLUE MARBLE)' : targetSolarStatus === 'night' ? 'NIGHTTIME (CITY LIGHTS GLOW)' : 'TERMINATOR (TWILIGHT DAWN/DUSK)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">PERSPECTIVE:</span>
                <span className="text-aerocyan font-bold">OUTER SPACE (ORBITAL PERSPECTIVE)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">LIVE UTC ASTRONOMICAL TIME:</span>
                <span className="text-space-200">{liveUtcString || 'Synchronized'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer: Detailed Planet & Country Telemetry (Like Google Maps) */}
      {selectedPlanet && (
        <div className="absolute top-28 right-4 bottom-20 w-full max-w-md z-30 flex flex-col pointer-events-auto">
          <div className="hud-panel p-5 rounded-xl border border-space-700/80 bg-space-900/95 backdrop-blur-xl shadow-2xl flex-1 flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="border-b border-space-800 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-aeroblue/15 text-aeroblue border border-aeroblue/30 font-bold uppercase">
                  {selectedPlanet.type}
                </span>
                <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">{selectedPlanet.name}</h2>
                <div className="text-[11px] text-space-400">
                  {selectedPlanet.orbitRadiusAU} AU &bull; Axial Tilt: {selectedPlanet.axialTiltDeg}° &bull; {selectedPlanet.moonsCount} Moons
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlanet(null);
                  setIsEarthFocused(false);
                }}
                className="p-1.5 rounded text-space-400 hover:text-white hover:bg-space-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto space-y-4 pr-1 my-3 text-xs">
              {/* Physical Parameters */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">DIAMETER</span>
                  <span className="text-white font-bold">{selectedPlanet.diameterKm.toLocaleString()} km</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">ORBITAL PERIOD (YEAR)</span>
                  <span className="text-white font-bold">{selectedPlanet.realPeriodDays} Days</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">SIDEREAL DAY LENGTH</span>
                  <span className="text-white font-bold">{selectedPlanet.rotationPeriodHours} Hours</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">SURFACE GRAVITY</span>
                  <span className="text-aeroblue-light font-bold">{selectedPlanet.surfaceGravityMs2} m/s²</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">MASS (ACTUAL)</span>
                  <span className="text-white font-bold">{selectedPlanet.massKg}</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">ESCAPE VELOCITY</span>
                  <span className="text-white font-bold">{selectedPlanet.escapeVelocityKmS} km/s</span>
                </div>
              </div>

              {/* SPECIAL EARTH FEATURE: GOOGLE MAPS STYLE COUNTRY & GPS EXPLORER */}
              {selectedPlanet.id === 'earth' && (
                <div className="p-4 bg-space-950/90 rounded-lg border border-aeroblue/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase">
                      <Globe className="w-4 h-4 text-aeroblue" />
                      <span>TERRESTRIAL COUNTRY EXPLORER (MAPS MODE)</span>
                    </div>
                  </div>

                  {/* Locate GPS Button */}
                  <button
                    onClick={handleLocateMyPosition}
                    className="w-full py-2.5 px-3 rounded bg-aerogreen hover:bg-aerogreen-light text-space-950 font-bold transition-all flex items-center justify-center gap-2 text-xs shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>PINPOINT MY GPS POSITION ON GLOBE</span>
                  </button>
                  <div className="text-[10px] text-space-400 text-center">{locatingStatus}</div>

                  {/* Country Search Bar */}
                  <div className="relative pt-1 border-t border-space-850">
                    <Search className="w-3.5 h-3.5 text-space-500 absolute left-2.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search country (e.g. Cambodia, France, Japan)..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full bg-space-900 border border-space-700 rounded pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-space-500 focus:outline-none focus:border-aeroblue"
                    />
                  </div>

                  {/* Country Selectable List */}
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {filteredCountries.map((c) => {
                      const isSelected = selectedCountry.id === c.id;

                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCountry(c)}
                          className={`p-2 rounded cursor-pointer transition-colors flex items-center justify-between text-[11px] ${
                            isSelected
                              ? 'bg-space-800 text-aeroblue-light border border-aeroblue/60 font-bold'
                              : 'bg-space-900/60 text-space-300 hover:text-white'
                          }`}
                        >
                          <div>
                            <div>{c.name}</div>
                            <div className="text-[10px] text-space-500 font-normal">{c.capital}</div>
                          </div>
                          <span className="text-[10px] text-space-400">{c.lat}° N</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Country Data Card */}
                  <div className="p-3 bg-space-900 rounded border border-space-800 text-[11px] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{selectedCountry.name}</span>
                      <span className="text-[10px] text-aeroblue">{selectedCountry.timezone}</span>
                    </div>

                    {/* Solar State on Target Country */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-space-950 border border-space-800 text-[10px]">
                      {targetSolarStatus === 'day' && (
                        <>
                          <Sun className="w-3.5 h-3.5 text-aeroamber" />
                          <span className="text-aeroamber font-bold">SOLAR POSITION: FULL DAYLIGHT (BLUE MARBLE)</span>
                        </>
                      )}
                      {targetSolarStatus === 'night' && (
                        <>
                          <Moon className="w-3.5 h-3.5 text-aeroblue" />
                          <span className="text-aeroblue font-bold">SOLAR POSITION: NIGHTTIME (NASA BLACK MARBLE)</span>
                        </>
                      )}
                      {targetSolarStatus === 'twilight' && (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-aerocyan" />
                          <span className="text-aerocyan font-bold">SOLAR POSITION: TERMINATOR LINE (DAWN / DUSK)</span>
                        </>
                      )}
                    </div>

                    <div className="text-space-300 text-[10px] leading-relaxed">
                      {selectedCountry.overview}
                    </div>
                    <div className="pt-1 border-t border-space-800 text-[10px] text-space-400">
                      <div>Space Agency: <strong className="text-white">{selectedCountry.spaceAgency}</strong></div>
                      <div>Key Sites: <strong className="text-space-300">{selectedCountry.majorSites}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Physical Highlights */}
              <div className="space-y-2 pt-1 border-t border-space-800">
                <span className="text-[10px] text-aeroamber font-bold uppercase tracking-wider block">
                  PHYSICAL & ASTRODYNAMICAL PROPERTIES
                </span>
                <ul className="space-y-1.5 text-space-300 text-xs">
                  {selectedPlanet.physicsHighlights.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-aeroamber mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Atmosphere Badges */}
              <div className="space-y-1.5 pt-1 border-t border-space-800">
                <span className="text-[10px] text-space-400 font-bold uppercase tracking-wider block">
                  ATMOSPHERIC COMPOSITION
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlanet.atmosphere.map((gas, i) => (
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

            {/* Footer */}
            <div className="pt-3 border-t border-space-800">
              <button
                onClick={handleResetView}
                className="w-full py-2 bg-space-800 hover:bg-space-700 text-white rounded font-bold transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RETURN TO SOLAR SYSTEM VIEW</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
