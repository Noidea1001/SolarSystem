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
  Scale,
  Ruler,
  Orbit,
} from 'lucide-react';

import GoogleMapsEarthExplorer from './GoogleMapsEarthExplorer';
import PlanetComparisonModal from './PlanetComparisonModal';
import DistanceTelemetryPanel from './DistanceTelemetryPanel';
import EphemerisTimeController from './EphemerisTimeController';
import {
  CELESTIAL_BODIES_PHYSICS,
  MAJOR_MOONS_DATA,
  CelestialBodyPhysics,
  MoonData,
} from '../data/celestialBodies';
import {
  getDaysSinceJ2000,
  computeKeplerianPosition3D,
  generateEllipticalOrbitPoints,
} from '../utils/ephemeris';

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

type RealPlanetPhysics = CelestialBodyPhysics;
const REAL_PLANETS_PHYSICS: RealPlanetPhysics[] = CELESTIAL_BODIES_PHYSICS;

export default function SolarSystemInteractiveGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<RealPlanetPhysics | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<MoonData | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showAsteroidBelt, setShowAsteroidBelt] = useState(true);
  const [showComparator, setShowComparator] = useState(false);
  const [showDistanceRuler, setShowDistanceRuler] = useState(false);
  const [rulerOriginId, setRulerOriginId] = useState<string>('earth');
  const [rulerTargetId, setRulerTargetId] = useState<string>('mars');
  const [simDateMs, setSimDateMs] = useState<number>(() => Date.now());
  const [isRealTimeLive, setIsRealTimeLive] = useState<boolean>(true);
  const [useRealTimeSync, setUseRealTimeSync] = useState(true); // Live Real-Time Earth Day/Night Sync
  const [selectedCountry, setSelectedCountry] = useState<CountryPoint>(REAL_WORLD_COUNTRIES[0]); // Cambodia default
  const [countrySearch, setCountrySearch] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingStatus, setLocatingStatus] = useState<string>('Ready to locate your real coordinates on Earth');
  const [isEarthFocused, setIsEarthFocused] = useState(false);
  const isEarthFocusedRef = useRef(false);
  useEffect(() => {
    isEarthFocusedRef.current = isEarthFocused;
  }, [isEarthFocused]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const simSpeedRef = useRef(simSpeed);
  useEffect(() => {
    simSpeedRef.current = simSpeed;
  }, [simSpeed]);

  const showOrbitsRef = useRef(showOrbits);
  useEffect(() => {
    showOrbitsRef.current = showOrbits;
  }, [showOrbits]);

  const showAsteroidBeltRef = useRef(showAsteroidBelt);
  useEffect(() => {
    showAsteroidBeltRef.current = showAsteroidBelt;
  }, [showAsteroidBelt]);

  const showDistanceRulerRef = useRef(showDistanceRuler);
  useEffect(() => {
    showDistanceRulerRef.current = showDistanceRuler;
  }, [showDistanceRuler]);

  const rulerPairRef = useRef({ originId: rulerOriginId, targetId: rulerTargetId });
  useEffect(() => {
    rulerPairRef.current = { originId: rulerOriginId, targetId: rulerTargetId };
  }, [rulerOriginId, rulerTargetId]);

  const simDateMsRef = useRef<number>(simDateMs);
  const isRealTimeLiveRef = useRef<boolean>(isRealTimeLive);
  useEffect(() => {
    isRealTimeLiveRef.current = isRealTimeLive;
  }, [isRealTimeLive]);
  const [targetSolarStatus, setTargetSolarStatus] = useState<'day' | 'night' | 'twilight'>('day');
  const [liveUtcString, setLiveUtcString] = useState('');
  const [viewMode, setViewMode] = useState<'space' | 'maps'>('space');
  const [mapsTarget, setMapsTarget] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 12.5657,
    lng: 104.991,
    zoom: 7,
  });

  // Cinematic 3D Dive to Google Maps State
  const [isDivingToMaps, setIsDivingToMaps] = useState(false);
  const [diveStage, setDiveStage] = useState<'idle' | 'hyperspeed' | 'cloud_burst' | 'cloud_dissolve'>('idle');
  const [diveAltitude, setDiveAltitude] = useState(1200);
  const isDivingRef = useRef(false);

  const triggerCinematicDiveToMaps = (lat = 12.5657, lng = 104.991, zoom = 7) => {
    if (isDivingRef.current) return;
    isDivingRef.current = true;
    setIsDivingToMaps(true);
    setDiveStage('hyperspeed');
    setDiveAltitude(1200);

    setMapsTarget({ lat, lng, zoom });

    if (sceneContextRef.current) {
      const earthItem = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === 'earth');
      if (earthItem) {
        sceneContextRef.current.targetedMesh = earthItem.body;
      }
    }

    let alt = 1200;
    const altInterval = setInterval(() => {
      alt = Math.max(10, Math.floor(alt * 0.62));
      setDiveAltitude(alt);
    }, 70);

    // Stage 1: Plunge towards Earth surface in 3D
    setTimeout(() => {
      setDiveStage('cloud_burst');
    }, 600);

    // Stage 2: Penetrate cloud layer, reveal Google Maps Satellite
    setTimeout(() => {
      clearInterval(altInterval);
      setDiveAltitude(10);
      setViewMode('maps');
      setDiveStage('cloud_dissolve');
    }, 1050);

    // Stage 3: Fully clear transition overlay
    setTimeout(() => {
      setDiveStage('idle');
      setIsDivingToMaps(false);
      isDivingRef.current = false;
    }, 1800);
  };

  const handlePrepareReturnToSpace = () => {
    if (sceneContextRef.current) {
      const earthItem = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === 'earth');
      if (earthItem) {
        sceneContextRef.current.targetedMesh = earthItem.body;
        sceneContextRef.current.spherical.radius = 2.85;
        sceneContextRef.current.spherical.theta = 0.52;
        sceneContextRef.current.spherical.phi = 1.35;
        setIsEarthFocused(true);
        setSelectedPlanet(earthItem.planet);
      }
    }
  };

  const handleReturnFromMaps = () => {
    isDivingRef.current = false;
    setIsDivingToMaps(false);
    setDiveStage('idle');
    setViewMode('space');

    if (sceneContextRef.current) {
      const earthItem = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === 'earth');
      if (earthItem) {
        sceneContextRef.current.targetedMesh = earthItem.body;
        sceneContextRef.current.spherical.radius = 2.85;
        sceneContextRef.current.spherical.theta = 0.52;
        sceneContextRef.current.spherical.phi = 1.35;
        setIsEarthFocused(true);
        setSelectedPlanet(earthItem.planet);
      } else {
        sceneContextRef.current.targetedMesh = null;
        sceneContextRef.current.spherical.radius = 75;
      }

      if (mountRef.current) {
        const w = mountRef.current.clientWidth || window.innerWidth;
        const h = mountRef.current.clientHeight || window.innerHeight;
        if (w > 0 && h > 0) {
          sceneContextRef.current.camera.aspect = w / h;
          sceneContextRef.current.camera.updateProjectionMatrix();
          sceneContextRef.current.renderer.setSize(w, h);
        }
      }

      sceneContextRef.current.renderer.render(
        sceneContextRef.current.scene,
        sceneContextRef.current.camera
      );
    }
  };

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
      cometTailGroup?: THREE.Group;
      angle: number;
    }[];
    moonMeshes: {
      moon: MoonData;
      pivot: THREE.Group;
      mesh: THREE.Mesh;
      orbitLine: THREE.Line;
      angle: number;
    }[];
    asteroidBeltMesh: THREE.InstancedMesh;
    kuiperBeltMesh: THREE.InstancedMesh;
    laserLineMesh: THREE.Line;
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
    camera.position.set(0, 24, 75);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 1. Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // Cosmic Deep Space Starfield & Galaxy Sphere
    const bgGeo = new THREE.SphereGeometry(1500, 32, 32);
    const bgTex = textureLoader.load('/textures/planets/galaxy_starfield.png');
    bgTex.colorSpace = THREE.SRGBColorSpace;
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
    const starCount = 4000;
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 1800;
      starPos[i + 1] = (Math.random() - 0.5) * 1800;
      starPos[i + 2] = (Math.random() - 0.5) * 1800;

      const r = Math.random();
      if (r > 0.8) {
        starCols[i] = 0.55; starCols[i + 1] = 0.85; starCols[i + 2] = 1.0;
      } else if (r > 0.6) {
        starCols[i] = 1.0; starCols[i + 1] = 0.85; starCols[i + 2] = 0.55;
      } else {
        starCols[i] = 0.98; starCols[i + 1] = 0.98; starCols[i + 2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));
    const starField = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.25, vertexColors: true, transparent: true, opacity: 0.85 }));
    scene.add(starField);

    // Realistic Deep Space Ambient Illumination (High Contrast)
    const ambientLight = new THREE.AmbientLight(0x060c18, 0.45);
    scene.add(ambientLight);

    // 1. THE SUN: Real Radiant Star & Center Physical Point Light
    const sunPointLight = new THREE.PointLight(0xfffef0, 5.5, 1500, 0.15);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const sunGeo = new THREE.SphereGeometry(3.9, 64, 64);
    const sunTex = textureLoader.load('/textures/planets/sun.jpg');
    sunTex.colorSpace = THREE.SRGBColorSpace;
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun Inner White-Hot Radiant Flare Shell
    const innerCoronaGeo = new THREE.SphereGeometry(4.2, 32, 32);
    const innerCoronaMat = new THREE.MeshBasicMaterial({
      color: 0xfffdf0,
      transparent: true,
      opacity: 0.75,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const innerCoronaMesh = new THREE.Mesh(innerCoronaGeo, innerCoronaMat);
    scene.add(innerCoronaMesh);

    // Sun Outer Turbulent Plasma Flare Shell
    const coronaGeo = new THREE.SphereGeometry(4.8, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.38,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // Dynamic Blinding Lens Flare Halo on the Sun
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 256;
    flareCanvas.height = 256;
    const flareCtx = flareCanvas.getContext('2d')!;
    const grad = flareCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.12, 'rgba(255, 248, 220, 0.95)');
    grad.addColorStop(0.3, 'rgba(245, 158, 11, 0.55)');
    grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flareCtx.fillStyle = grad;
    flareCtx.fillRect(0, 0, 256, 256);
    const flareTex = new THREE.CanvasTexture(flareCanvas);
    const sunFlareMat = new THREE.SpriteMaterial({
      map: flareTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const sunFlareSprite = new THREE.Sprite(sunFlareMat);
    sunFlareSprite.scale.set(24, 24, 1);
    sunMesh.add(sunFlareSprite);

    // 2. REAL EARTH WITH TRUE NASA 4K BLUE MARBLE & BLACK MARBLE SHADER
    const earthDayTex = textureLoader.load('/textures/planets/earth_day_4k.jpg');
    earthDayTex.colorSpace = THREE.SRGBColorSpace;
    const earthNightTex = textureLoader.load('/textures/planets/earth_night_4k.jpg');
    earthNightTex.colorSpace = THREE.SRGBColorSpace;
    const earthSpecTex = textureLoader.load('/textures/planets/earth_specular.jpg');
    const earthCloudsTex = textureLoader.load('/textures/planets/earth_clouds.png');
    earthCloudsTex.colorSpace = THREE.SRGBColorSpace;

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

    let earthMesh: THREE.Mesh | null = null;
    let earthBodyGroup: THREE.Group | null = null;
    let userPinGroup: THREE.Group | null = null;
    const countryMarkers: { country: CountryPoint; marker: THREE.Group }[] = [];
    const planetMeshes: any[] = [];
    const moonMeshes: any[] = [];

    const moonTex = textureLoader.load('/textures/planets/moon_1k.jpg');
    moonTex.colorSpace = THREE.SRGBColorSpace;

    // 3. Build All Planets, Dwarf Planets & Comets with True J2000 Elliptical & Inclined Orbits
    REAL_PLANETS_PHYSICS.forEach((planet) => {
      const orbitPivot = new THREE.Group();
      scene.add(orbitPivot);

      // True 3D Elliptical & Inclined Orbit Path
      const orbitPts = generateEllipticalOrbitPoints(planet, 180);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(
        orbitPts.map((p) => new THREE.Vector3(p.x, p.y, p.z))
      );
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(planet.colorHex),
        transparent: true,
        opacity: planet.category === 'planet' ? 0.34 : 0.22,
      });
      const orbitLine = new THREE.Line(lineGeo, lineMat);
      scene.add(orbitLine);

      // Axial Tilt Group (Applies exact physical obliquity)
      const tiltGroup = new THREE.Group();
      const initialPos = computeKeplerianPosition3D(planet, getDaysSinceJ2000(new Date(simDateMsRef.current)));
      tiltGroup.position.set(initialPos.x, initialPos.y, initialPos.z);
      tiltGroup.rotation.z = (planet.axialTiltDeg * Math.PI) / 180;
      orbitPivot.add(tiltGroup);

      let body: THREE.Mesh;
      let cometTailGroup: THREE.Group | undefined;

      if (planet.id === 'earth') {
        const eGeo = new THREE.SphereGeometry(planet.sizeRadius, 64, 64);
        body = new THREE.Mesh(eGeo, earthShaderMaterial);
        tiltGroup.add(body);
        earthMesh = body;
        earthBodyGroup = tiltGroup;

        // Realistic Atmospheric Clouds Layer
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

        // GPS User Marker
        userPinGroup = new THREE.Group();
        userPinGroup.visible = false;
        const pinDot = new THREE.Mesh(
          new THREE.SphereGeometry(0.024, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x10b981, depthTest: true })
        );
        const pinRadar = new THREE.Mesh(
          new THREE.RingGeometry(0.035, 0.075, 20),
          new THREE.MeshBasicMaterial({
            color: 0x10b981,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            depthTest: true,
          })
        );
        pinRadar.rotation.x = Math.PI / 2;

        userPinGroup.add(pinDot);
        userPinGroup.add(pinRadar);
        body.add(userPinGroup);

        const initPinPos = latLngToVector3(
          REAL_WORLD_COUNTRIES[0].lat,
          REAL_WORLD_COUNTRIES[0].lng,
          planet.sizeRadius + 0.008
        );
        userPinGroup.position.copy(initPinPos);
      } else {
        const pGeo = new THREE.SphereGeometry(planet.sizeRadius, 64, 64);
        const pTex = textureLoader.load(planet.textureUrl);
        pTex.colorSpace = THREE.SRGBColorSpace;
        const pMat = new THREE.MeshStandardMaterial({
          map: pTex,
          bumpMap: planet.bumpScale ? pTex : null,
          bumpScale: planet.bumpScale || 0,
          roughness: planet.category === 'comet' ? 0.4 : 0.75,
          metalness: 0.05,
        });
        body = new THREE.Mesh(pGeo, pMat);
        tiltGroup.add(body);

        // Planetary Rings (Saturn, Uranus, Neptune)
        if (planet.hasRings) {
          const ringInner = planet.sizeRadius * (planet.ringInnerRatio || 1.32);
          const ringOuter = planet.sizeRadius * (planet.ringOuterRatio || 2.38);
          const ringGeo = new THREE.RingGeometry(ringInner, ringOuter, 72);

          const pos = ringGeo.attributes.position;
          const v3 = new THREE.Vector3();
          for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            const dist = v3.length();
            const u = (dist - ringInner) / (ringOuter - ringInner);
            ringGeo.attributes.uv.setXY(i, u, 0.5);
          }

          if (planet.id === 'saturn') {
            const ringTex = textureLoader.load('/textures/planets/saturn_ring.png');
            ringTex.colorSpace = THREE.SRGBColorSpace;
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
          } else {
            const ringMat = new THREE.MeshBasicMaterial({
              color: new THREE.Color(planet.ringColorHex || '#67e8f9'),
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.25,
            });
            const rings = new THREE.Mesh(ringGeo, ringMat);
            rings.rotation.x = Math.PI / 2;
            tiltGroup.add(rings);
          }
        }

        // Dynamic Solar-Wind Ion & Dust Tail for Halley's Comet
        if (planet.hasCometTail) {
          cometTailGroup = new THREE.Group();
          const comaGeo = new THREE.SphereGeometry(planet.sizeRadius * 2.2, 24, 24);
          const comaMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          cometTailGroup.add(new THREE.Mesh(comaGeo, comaMat));

          // Ion Tail Cone pointing along +Z of cometTailGroup
          const tailLen = 9.5;
          const tailGeo = new THREE.ConeGeometry(0.95, tailLen, 24, 1, true);
          tailGeo.translate(0, -tailLen / 2, 0);
          tailGeo.rotateX(-Math.PI / 2);
          const tailMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.28,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          cometTailGroup.add(new THREE.Mesh(tailGeo, tailMat));

          const innerTailGeo = new THREE.ConeGeometry(0.42, tailLen * 0.65, 16, 1, true);
          innerTailGeo.translate(0, -(tailLen * 0.65) / 2, 0);
          innerTailGeo.rotateX(-Math.PI / 2);
          const innerTailMat = new THREE.MeshBasicMaterial({
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          cometTailGroup.add(new THREE.Mesh(innerTailGeo, innerTailMat));

          tiltGroup.add(cometTailGroup);
        }
      }

      // Build Major Moons for this Planet
      const parentMoons = MAJOR_MOONS_DATA.filter((m) => m.parentId === planet.id);
      parentMoons.forEach((moon, idx) => {
        const moonPivot = new THREE.Group();
        moonPivot.rotation.z = ((idx % 2 === 0 ? 3.5 : -2.8) * Math.PI) / 180;
        tiltGroup.add(moonPivot);

        const mOrbitPts = new THREE.EllipseCurve(
          0,
          0,
          moon.orbitRadius3D,
          moon.orbitRadius3D,
          0,
          2 * Math.PI,
          false,
          0
        ).getPoints(64);
        const mOrbitGeo = new THREE.BufferGeometry().setFromPoints(
          mOrbitPts.map((p) => new THREE.Vector3(p.x, 0, p.y))
        );
        const mOrbitLine = new THREE.Line(
          mOrbitGeo,
          new THREE.LineBasicMaterial({
            color: new THREE.Color(moon.colorHex),
            transparent: true,
            opacity: 0.22,
          })
        );
        moonPivot.add(mOrbitLine);

        const mGeo = new THREE.SphereGeometry(moon.radius3D, 28, 28);
        const mMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          color: new THREE.Color(moon.colorHex),
          roughness: 0.88,
          metalness: 0.05,
        });
        const mMesh = new THREE.Mesh(mGeo, mMat);
        mMesh.position.set(moon.orbitRadius3D, 0, 0);
        moonPivot.add(mMesh);

        // Titan orange atmospheric haze shell
        if (moon.id === 'titan') {
          const hazeGeo = new THREE.SphereGeometry(moon.radius3D * 1.12, 20, 20);
          const hazeMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          mMesh.add(new THREE.Mesh(hazeGeo, hazeMat));
        }

        moonMeshes.push({
          moon,
          pivot: moonPivot,
          mesh: mMesh,
          orbitLine: mOrbitLine,
          angle: idx * 1.4,
        });
      });

      planetMeshes.push({
        planet,
        orbitPivot,
        tiltGroup,
        body,
        orbitLine,
        cometTailGroup,
        angle: initialPos.trueAnomalyRad,
      });
    });

    // 4. 3D Main Asteroid Belt (Mars-Jupiter) & Outer Kuiper Belt (InstancedMesh at 60 FPS)
    const createBeltInstancedMesh = (
      count: number,
      innerR: number,
      outerR: number,
      maxHeight: number,
      colorHex: number,
      baseSize: number
    ) => {
      const rockGeo = new THREE.DodecahedronGeometry(baseSize, 0);
      const rockMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.9,
        metalness: 0.12,
      });
      const instanced = new THREE.InstancedMesh(rockGeo, rockMat, count);
      const dummy = new THREE.Object3D();

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = innerR + Math.random() * (outerR - innerR);
        const y = (Math.random() - 0.5) * maxHeight;
        dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const s = 0.45 + Math.random() * 1.35;
        dummy.scale.set(s, s * (0.6 + Math.random() * 0.6), s);
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
      }
      instanced.instanceMatrix.needsUpdate = true;
      scene.add(instanced);
      return instanced;
    };

    const asteroidBeltMesh = createBeltInstancedMesh(1500, 33.5, 41.2, 2.4, 0x9ca3af, 0.085);
    const kuiperBeltMesh = createBeltInstancedMesh(700, 96.0, 114.0, 6.0, 0x7dd3fc, 0.12);

    // 5. 3D Interplanetary Laser Telemetry Line (For Distance & Light-Time Ranger)
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 0, 0),
    ]);
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.9,
    });
    const laserLineMesh = new THREE.Line(laserGeo, laserMat);
    laserLineMesh.visible = false;
    scene.add(laserLineMesh);

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
      moonMeshes,
      asteroidBeltMesh,
      kuiperBeltMesh,
      laserLineMesh,
      spherical: { radius: 75, theta: 0.52, phi: 1.38 },
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
      const newRadius = currentR + delta;

      // When zooming close to Earth surface, seamlessly trigger cinematic 3D dive into Google Maps
      if (isTargetingBody && newRadius <= 1.22 && !isDivingRef.current) {
        triggerCinematicDiveToMaps(mapsTarget.lat, mapsTarget.lng, mapsTarget.zoom);
        return;
      }

      // Allow zooming right down to 1.14 (Low Earth Orbit / satellite altitude) when looking at Earth
      const minRadius = isTargetingBody ? 1.14 : 3.0;

      sceneContextRef.current.spherical.radius = THREE.MathUtils.clamp(
        newRadius,
        minRadius,
        350
      );
    };

    const onDoubleClick = (e: MouseEvent) => {
      if (!sceneContextRef.current || !container) return;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
        -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, sceneContextRef.current.camera);
      if (sceneContextRef.current.earthMesh) {
        const earthHits = raycaster.intersectObject(sceneContextRef.current.earthMesh);
        if (earthHits.length > 0) {
          triggerCinematicDiveToMaps(mapsTarget.lat, mapsTarget.lng, mapsTarget.zoom);
        }
      }
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

      // Check click on Moons
      for (const mItem of sceneContextRef.current.moonMeshes) {
        const hits = raycaster.intersectObject(mItem.mesh);
        if (hits.length > 0) {
          handleSelectMoon(mItem.moon);
          return;
        }
      }

      // Check click on planets, dwarf planets & comets
      for (const item of sceneContextRef.current.planetMeshes) {
        const hits = raycaster.intersectObject(item.body);
        if (hits.length > 0) {
          if (item.planet.id === 'earth' && isEarthFocusedRef.current) {
            triggerCinematicDiveToMaps(mapsTarget.lat, mapsTarget.lng, mapsTarget.zoom);
            return;
          }
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
    container.addEventListener('dblclick', onDoubleClick);
    window.addEventListener('resize', onResize);

    // Animation Render Loop with True J2000 Keplerian Time Physics
    let animId: number;
    let clock = 0;
    let uiSyncCounter = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.016;

      if (sceneContextRef.current) {
        const {
          sunMesh,
          coronaMesh,
          planetMeshes,
          moonMeshes,
          asteroidBeltMesh,
          kuiperBeltMesh,
          laserLineMesh,
          earthMesh,
          earthShaderMaterial,
          camera,
          spherical,
          targetedMesh,
          userPinMesh,
        } = sceneContextRef.current;

        const paused = isPausedRef.current;
        const speed = simSpeedRef.current;
        const orbitsVisible = showOrbitsRef.current;
        const beltVisible = showAsteroidBeltRef.current;

        // Advance simulation clock at a calm, realistic, majestic pace
        if (!paused) {
          if (isRealTimeLiveRef.current && speed === 1) {
            // Live time: smooth, realistic astronomical advance (~30 minutes of celestial time per real second)
            simDateMsRef.current += 0.00028 * 86400000;
          } else {
            // Scaled warp time: smooth proportional advance
            simDateMsRef.current += 0.00045 * speed * 86400000;
          }
          uiSyncCounter++;
          if (uiSyncCounter % 20 === 0) {
            setSimDateMs(simDateMsRef.current);
          }
        }

        const daysJ2000 = getDaysSinceJ2000(new Date(simDateMsRef.current));

        // Sun rotation & calm gentle coronal breathing
        sunMesh.rotation.y += 0.0003;
        const pulse = 1 + Math.sin(clock * 1.4) * 0.022;
        coronaMesh.scale.set(pulse, pulse, pulse);

        // Asteroid & Kuiper Belt slow cosmic drift
        asteroidBeltMesh.visible = beltVisible;
        kuiperBeltMesh.visible = beltVisible;
        if (!paused && beltVisible) {
          asteroidBeltMesh.rotation.y += 0.000035 * speed;
          kuiperBeltMesh.rotation.y += 0.000012 * speed;
        }

        // True J2000 Elliptical & Inclined Keplerian Orbital Motions (Calm & Majestic)
        planetMeshes.forEach((item) => {
          const pos = computeKeplerianPosition3D(item.planet, daysJ2000);
          item.tiltGroup.position.set(pos.x, pos.y, pos.z);
          item.angle = pos.trueAnomalyRad;

          // Planetary axial rotation: Slow and graceful (Earth takes ~85s for full turn at 1x)
          if (!paused) {
            const rotFactor = (24.0 / Math.abs(item.planet.rotationPeriodHours)) * 0.0012 * speed;
            item.body.rotation.y += item.planet.isRetrograde ? -rotFactor : rotFactor;
          }

          // Orient Halley's Comet ion/dust tail directly away from the Sun (anti-solar vector)
          if (item.cometTailGroup) {
            const worldPos = new THREE.Vector3();
            item.tiltGroup.getWorldPosition(worldPos);
            const awayFromSunTarget = worldPos.clone().multiplyScalar(2.0);
            item.cometTailGroup.lookAt(awayFromSunTarget);
          }

          item.orbitLine.visible = orbitsVisible;
        });

        // Orbit Major Moons serenely around their parent planets
        moonMeshes.forEach((mItem) => {
          if (!paused) {
            const mSpeed = (27.32 / mItem.moon.periodDays) * 0.00085 * speed;
            mItem.angle += mSpeed;
            mItem.mesh.position.set(
              Math.cos(mItem.angle) * mItem.moon.orbitRadius3D,
              0,
              Math.sin(mItem.angle) * mItem.moon.orbitRadius3D
            );
            mItem.mesh.rotation.y = -mItem.angle;
          }
          mItem.orbitLine.visible = orbitsVisible;
        });

        // Update 3D Interplanetary Laser Telemetry Line
        if (showDistanceRulerRef.current) {
          const { originId, targetId } = rulerPairRef.current;
          const pA = planetMeshes.find((p) => p.planet.id === originId);
          const pB = planetMeshes.find((p) => p.planet.id === targetId);
          if (pA && pB) {
            const posA = new THREE.Vector3();
            const posB = new THREE.Vector3();
            pA.body.getWorldPosition(posA);
            pB.body.getWorldPosition(posB);
            laserLineMesh.geometry.setFromPoints([posA, posB]);
            laserLineMesh.visible = true;
          } else {
            laserLineMesh.visible = false;
          }
        } else {
          laserLineMesh.visible = false;
        }

        // Real-Time Earth Rotation & Atmospheric Shader Synchronization
        if (earthMesh && earthShaderMaterial) {
          if (!paused && isRealTimeLiveRef.current && speed === 1) {
            const now = new Date(simDateMsRef.current);
            const utcSeconds = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
            const dayFraction = utcSeconds / 86400;
            earthMesh.rotation.y = dayFraction * 2 * Math.PI + Math.PI;
          }

          if (earthCloudsRef.current && !paused) {
            earthCloudsRef.current.rotation.y += 0.000075 * speed;
          }

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

        // Camera Follow Target (Earth, Sun, Moon, Spacecraft, or other planets)
        const targetWorldPos = new THREE.Vector3();
        if (targetedMesh) {
          targetedMesh.getWorldPosition(targetWorldPos);
        } else {
          targetWorldPos.set(0, 0, 0);
        }

        if (isDivingRef.current) {
          spherical.radius = THREE.MathUtils.lerp(spherical.radius, 1.025, 0.14);
        }

        const camX = targetWorldPos.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        const camY = targetWorldPos.y + spherical.radius * Math.cos(spherical.phi);
        const camZ = targetWorldPos.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);

        const camLerp = isDivingRef.current ? 0.15 : 0.06;
        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), camLerp);
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
      container.removeEventListener('dblclick', onDoubleClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Planet Focus
  const handleSelectPlanet = (planet: RealPlanetPhysics) => {
    setSelectedPlanet(planet);
    setSelectedMoon(null);
    setIsEarthFocused(planet.id === 'earth');

    if (!sceneContextRef.current) return;
    const item = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === planet.id);
    if (item) {
      sceneContextRef.current.targetedMesh = item.body;
      sceneContextRef.current.spherical.radius = Math.max(1.8, planet.sizeRadius * 4.2 + 1.5);
    }
  };

  // Moon Focus
  const handleSelectMoon = (moon: MoonData) => {
    setSelectedMoon(moon);
    const parentPlanet = REAL_PLANETS_PHYSICS.find((p) => p.id === moon.parentId) || null;
    setSelectedPlanet(parentPlanet);
    setIsEarthFocused(false);

    if (!sceneContextRef.current) return;
    const mItem = sceneContextRef.current.moonMeshes.find((m) => m.moon.id === moon.id);
    if (mItem) {
      sceneContextRef.current.targetedMesh = mItem.mesh;
      sceneContextRef.current.spherical.radius = Math.max(1.2, moon.radius3D * 6.5);
    }
  };

  // Reset to Full Solar System
  const handleResetView = () => {
    setSelectedPlanet(null);
    setIsEarthFocused(false);
    if (!sceneContextRef.current) return;
    sceneContextRef.current.targetedMesh = null;
    sceneContextRef.current.spherical.radius = 75;
    sceneContextRef.current.spherical.theta = 0.52;
    sceneContextRef.current.spherical.phi = 1.38;
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
    setMapsTarget({
      lat: country.lat,
      lng: country.lng,
      zoom: country.id === 'khm' ? 8 : 6,
    });

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
        setMapsTarget({ lat: latitude, lng: longitude, zoom: 14 });
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
      {/* 3D WebGL Canvas Layer (Full Viewport 100vw x 100vh) - Persistently Mounted */}
      <div
        ref={mountRef}
        className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-300 ${
          viewMode === 'maps' ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      />

      {/* Google Maps Satellite View Layer */}
      {viewMode === 'maps' && (
        <div className="absolute inset-0 z-40 w-full h-full animate-in fade-in duration-300">
          <GoogleMapsEarthExplorer
            initialLat={mapsTarget.lat}
            initialLng={mapsTarget.lng}
            initialZoom={mapsTarget.zoom}
            isEnteringFromSpace={true}
            onReturnToSpace={handleReturnFromMaps}
            onPrepareReturnToSpace={handlePrepareReturnToSpace}
          />

          {/* Stratospheric Cloud Dissolve on Arrival */}
          {isDivingToMaps && (
            <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 animate-cloud-dive bg-gradient-radial from-white/90 via-aeroblue/40 to-space-950/60" />
              <div className="relative z-10 text-center font-mono space-y-1 bg-space-950/80 px-6 py-2.5 rounded-2xl border border-aeroblue/40 backdrop-blur-md shadow-2xl">
                <div className="text-xs font-bold text-white tracking-widest uppercase">
                  STRATOSPHERIC BREAKTHROUGH // SATELLITE TILES ACTIVE
                </div>
                <div className="text-[10px] text-aeroblue-light font-bold">ALTITUDE: 10 KM &bull; TERRESTRIAL GRID LOCKED</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3D Space View HUD Controls */}
      {viewMode === 'space' && (
        <>
          {/* J2000 Ephemeris Clock, Time Warp & Live Spacecraft/ISS Controller */}
          <EphemerisTimeController
            simDateMs={simDateMs}
            isRealTimeLive={isRealTimeLive}
            simSpeed={simSpeed}
            onJumpToDate={(ts) => {
              setIsRealTimeLive(false);
              simDateMsRef.current = ts;
              setSimDateMs(ts);
            }}
            onResetToLiveNow={() => {
              const now = Date.now();
              setIsRealTimeLive(true);
              setSimSpeed(1);
              simDateMsRef.current = now;
              setSimDateMs(now);
            }}
            onChangeSimSpeed={(spd) => {
              setSimSpeed(spd);
              if (spd !== 1) setIsRealTimeLive(false);
            }}
          />

          {/* Top Floating Minimalist Navigation Bar (Single Slim Row) */}
          <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Brand */}
            <div className="pointer-events-auto flex items-center gap-2 bg-space-950/80 backdrop-blur-xl px-4 py-2 rounded-full border border-space-800 shadow-xl">
              <div className="w-2 h-2 rounded-full bg-aeroblue animate-pulse" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">AEROVEX</span>
              <span className="text-[10px] text-space-400">SOLAR SYSTEM</span>
            </div>

            {/* Center Mode Switcher Pill */}
            <div className="pointer-events-auto flex items-center gap-1 bg-space-950/80 backdrop-blur-xl p-1 rounded-full border border-space-800 shadow-xl">
              <button
                onClick={handleResetView}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedPlanet === null
                    ? 'bg-space-800 text-white shadow-sm'
                    : 'text-space-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-aeroamber" />
                <span>3D SOLAR SYSTEM</span>
              </button>

              <button
                onClick={() => triggerCinematicDiveToMaps(12.5657, 104.991, 7)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 bg-aeroblue/15 hover:bg-aeroblue text-aeroblue-light hover:text-space-950 border border-aeroblue/30 cursor-pointer"
                title="Open authentic Google Maps Satellite View with 3D zoom dive"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>EARTH SATELLITE MAP</span>
              </button>
            </div>

            {/* Right Minimal Controls Pill */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-space-950/80 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-space-800 shadow-xl text-xs">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-full hover:bg-space-800 text-space-300 hover:text-white transition-colors cursor-pointer"
                title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-aerogreen" /> : <Pause className="w-3.5 h-3.5 text-aeroamber" />}
              </button>

              <div className="h-3 w-px bg-space-800" />

              <button
                onClick={() => setShowOrbits(!showOrbits)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                  showOrbits ? 'bg-space-800 text-aeroblue' : 'text-space-500 hover:text-white'
                }`}
                title="Toggle Elliptical Orbital Rings"
              >
                ORBITS
              </button>

              <button
                onClick={() => setShowAsteroidBelt(!showAsteroidBelt)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                  showAsteroidBelt ? 'bg-space-800 text-aeroamber' : 'text-space-500 hover:text-white'
                }`}
                title="Toggle 3D Main Asteroid Belt & Kuiper Belt"
              >
                BELT
              </button>

              <button
                onClick={() => setShowDistanceRuler(!showDistanceRuler)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  showDistanceRuler ? 'bg-aerogreen text-space-950' : 'text-space-400 hover:text-white'
                }`}
                title="3D Laser Distance & Light-Speed Ranger"
              >
                <Ruler className="w-3 h-3" />
                <span className="hidden md:inline">RANGER</span>
              </button>

              <button
                onClick={() => setShowComparator(true)}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-space-300 hover:text-white hover:bg-space-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Compare Planetary Scale & Gravity"
              >
                <Scale className="w-3 h-3 text-aeroblue" />
                <span className="hidden md:inline">COMPARE</span>
              </button>

              <div className="h-3 w-px bg-space-800" />

              <button
                onClick={handleResetView}
                className="p-1.5 rounded-full hover:bg-space-800 text-space-300 hover:text-white transition-colors cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3D Interplanetary Distance & Light-Time Telemetry Panel */}
          {showDistanceRuler && (
            <DistanceTelemetryPanel
              originId={rulerOriginId}
              targetId={rulerTargetId}
              daysSinceJ2000={getDaysSinceJ2000(new Date(simDateMs))}
              onChangeOrigin={setRulerOriginId}
              onChangeTarget={setRulerTargetId}
              onClose={() => setShowDistanceRuler(false)}
            />
          )}

          {/* Planetary Scale & Gravity Comparator Modal */}
          {showComparator && (
            <PlanetComparisonModal
              initialPrimaryId={selectedPlanet?.id || 'earth'}
              onClose={() => setShowComparator(false)}
              onFocusPlanet={handleSelectPlanet}
            />
          )}

          {/* Floating Compact Planet / Moon Telemetry Card on Right */}
          {selectedPlanet && (
            <div className="absolute top-20 right-5 z-30 pointer-events-auto w-80 animate-in fade-in duration-200">
              <div className="bg-space-950/85 backdrop-blur-xl p-4 rounded-2xl border border-space-800/90 shadow-2xl space-y-3 font-mono text-xs text-white">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-aeroblue/15 text-aeroblue border border-aeroblue/30 font-bold uppercase tracking-wider">
                      {selectedMoon ? `NATURAL SATELLITE OF ${selectedPlanet.name.split(' (')[0]}` : selectedPlanet.type.split(' (')[0]}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-1 tracking-tight">
                      {selectedMoon ? selectedMoon.name : selectedPlanet.name.split(' (')[0]}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlanet(null);
                      setSelectedMoon(null);
                      setIsEarthFocused(false);
                    }}
                    className="p-1 rounded-full text-space-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
                    title="Close Card"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected Moon Info Box */}
                {selectedMoon && (
                  <div className="p-2.5 bg-space-900/80 rounded-xl border border-aeroblue/30 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-space-400">DIAMETER: <strong className="text-white">{selectedMoon.diameterKm.toLocaleString()} km</strong></span>
                      <span className="text-aeroblue font-bold">ORBIT: {selectedMoon.periodDays}d</span>
                    </div>
                    <p className="text-space-300 leading-snug">{selectedMoon.description}</p>
                    <button
                      onClick={() => handleSelectPlanet(selectedPlanet)}
                      className="text-[10px] text-aeroamber hover:underline font-bold pt-1 block cursor-pointer"
                    >
                      RETURN TO {selectedPlanet.name.split(' (')[0].toUpperCase()}
                    </button>
                  </div>
                )}

                {/* Compact 2x2 Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 bg-space-900/70 rounded-xl border border-space-850">
                    <span className="text-space-400 block text-[9px]">DIAMETER</span>
                    <span className="text-white font-bold">{selectedPlanet.diameterKm.toLocaleString()} km</span>
                  </div>
                  <div className="p-2 bg-space-900/70 rounded-xl border border-space-850">
                    <span className="text-space-400 block text-[9px]">SOLAR DISTANCE</span>
                    <span className="text-white font-bold">{selectedPlanet.orbitRadiusAU} AU</span>
                  </div>
                  <div className="p-2 bg-space-900/70 rounded-xl border border-space-850">
                    <span className="text-space-400 block text-[9px]">GRAVITY / TILT</span>
                    <span className="text-white font-bold">{selectedPlanet.surfaceGravityMs2} m/s² &bull; {selectedPlanet.axialTiltDeg}°</span>
                  </div>
                  <div className="p-2 bg-space-900/70 rounded-xl border border-space-850">
                    <span className="text-space-400 block text-[9px]">MEAN TEMP</span>
                    <span className="text-white font-bold">{selectedPlanet.meanTempC}</span>
                  </div>
                </div>

                {/* Major Orbiting Moons Selector (If planet has modeled moons) */}
                {MAJOR_MOONS_DATA.some((m) => m.parentId === selectedPlanet.id) && (
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[9px] text-space-400 uppercase font-bold block">
                      MAJOR ORBITING MOONS (CLICK TO FOCUS 3D):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {MAJOR_MOONS_DATA.filter((m) => m.parentId === selectedPlanet.id).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleSelectMoon(m)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            selectedMoon?.id === m.id
                              ? 'bg-aeroblue text-space-950 border-aeroblue'
                              : 'bg-space-900 hover:bg-space-800 text-space-200 border-space-800'
                          }`}
                        >
                          {m.name.split(' (')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Earth Specific: Single Direct Action into Google Maps */}
                {selectedPlanet.id === 'earth' ? (
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => triggerCinematicDiveToMaps(selectedCountry.lat, selectedCountry.lng, 7)}
                      className="w-full py-2.5 px-3 rounded-xl bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-aeroblue/20 cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span>VIEW IN GOOGLE MAPS</span>
                    </button>

                    <button
                      onClick={handleLocateMyPosition}
                      className="w-full py-2 px-3 rounded-xl bg-space-900 hover:bg-space-850 text-aerogreen border border-aerogreen/30 font-bold transition-all flex items-center justify-center gap-2 text-[11px] cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-aerogreen" />
                      <span>PINPOINT MY GPS LOCATION</span>
                    </button>

                    {userLocation && (
                      <div className="text-[10px] text-space-400 text-center">{locatingStatus}</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1 text-[11px] text-space-300">
                    <div className="text-[10px] text-space-400 uppercase font-bold">ATMOSPHERE:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlanet.atmosphere.slice(0, 3).map((gas, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-space-900 text-space-300 text-[10px] border border-space-800">
                          {gas}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-space-400 leading-relaxed line-clamp-2 pt-1">
                      {selectedPlanet.physicsHighlights[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Planet, Dwarf Planet & Comet Quick-Selector Bar (Ultra-Sleek Pill) */}
          <div className="absolute bottom-4 inset-x-4 z-20 flex justify-center pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-1 bg-space-950/80 backdrop-blur-xl p-1.5 rounded-full border border-space-800 shadow-2xl overflow-x-auto max-w-full">
              <button
                onClick={handleResetView}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedPlanet === null && !isEarthFocused
                    ? 'bg-aeroamber text-space-950 shadow-sm'
                    : 'text-space-400 hover:text-white'
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
                    className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-aeroblue text-space-950 shadow-sm'
                        : 'text-space-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: planet.colorHex }}
                    />
                    <span>{planet.name.split(' (')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 3D Atmospheric Re-Entry / Hyperspace Dive Overlay */}
      {isDivingToMaps && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
          {/* Hyperspeed / Radial Warp Speed Streaks */}
          <div className="absolute inset-0 animate-warp-speed opacity-80" />

          {/* Cloud Penetration Flash */}
          <div className="absolute inset-0 animate-cloud-dive bg-gradient-radial from-white/95 via-aeroblue/50 to-transparent" />

          {/* Re-entry Heat / Rayleigh Glow */}
          <div className="absolute inset-0 animate-reentry-flash" />

          {/* Sleek Aerospace Re-entry HUD */}
          <div className="relative z-10 text-center font-mono space-y-2 bg-space-950/85 px-8 py-4 rounded-2xl border border-aeroblue/50 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-aerogreen animate-ping" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">
                ORBITAL DE-ORBIT MANEUVER ENGAGED
              </span>
            </div>
            <div className="text-2xl font-bold text-aeroblue tracking-tight">
              ALTITUDE: {diveAltitude} KM
            </div>
            <div className="text-[10px] text-space-300 font-bold tracking-wider">
              DIVING INTO GOOGLE MAPS TERRESTRIAL SATELLITE GRID
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
