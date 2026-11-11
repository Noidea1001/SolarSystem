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
  Volume2,
  VolumeX,
  Languages,
  BookOpen,
  Rocket,
  FastForward,
  SkipForward,
  SkipBack,
  Zap,
} from 'lucide-react';

import GoogleMapsEarthExplorer from './GoogleMapsEarthExplorer';
import PlanetComparisonModal from './PlanetComparisonModal';
import DistanceTelemetryPanel from './DistanceTelemetryPanel';
import EphemerisTimeController from './EphemerisTimeController';
import HohmannTransferSimulator from './HohmannTransferSimulator';
import { spaceAudio } from '../utils/spaceAudio';
import { buildConstellationLinesMesh } from '../utils/constellations';
import {
  CELESTIAL_BODIES_PHYSICS,
  MAJOR_MOONS_DATA,
  DEEP_SPACE_MISSIONS,
  CelestialBodyPhysics,
  MoonData,
  SpacecraftData,
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

interface TourStep {
  targetId: string;
  type: 'planet' | 'sun';
  cameraRadius: number;
  phi: number;
  titleEn: string;
  titleKm: string;
  descEn: string;
  descKm: string;
}

const COSMIC_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'sun',
    type: 'sun',
    cameraRadius: 18,
    phi: 1.35,
    titleEn: '1. The Sun (Sol) - The Solar Core',
    titleKm: '១. ព្រះអាទិត្យ (Sol) - បេះដូងនៃប្រព័ន្ធព្រះអាទិត្យ',
    descEn: 'Contains 99.86% of the solar system mass. Thermonuclear fusion converts 600M tons of hydrogen into helium every second.',
    descKm: 'ក្តោបយក 99.86% នៃម៉ាសសរុប។ បំប្លែងអ៊ីដ្រូសែន 600 លានតោនទៅជាអេល្យូមរៀងរាល់វិនាទីតាមរយៈប្រតិកម្មនុយក្លេអ៊ែរផ្សំ។',
  },
  {
    targetId: 'mercury',
    type: 'planet',
    cameraRadius: 3.2,
    phi: 1.32,
    titleEn: '2. Mercury - The Swift Cratered World',
    titleKm: '២. ភពពុធ (Mercury) - ភពថ្មលឿនបំផុត',
    descEn: 'Orbits in just 88 days with a 3:2 spin-orbit resonance. High iron metallic core occupies 85% of its planetary radius.',
    descKm: 'វិលជុំព្រះអាទិត្យក្នុងរយៈពេលត្រឹមតែ 88 ថ្ងៃ។ ស្នូលដែកថែបដ៏ធំសម្បើមក្តោបយក 85% នៃកាំភព។',
  },
  {
    targetId: 'venus',
    type: 'planet',
    cameraRadius: 4.5,
    phi: 1.32,
    titleEn: '3. Venus - Runaway Greenhouse Inferno',
    titleKm: '៣. ភពសុក្រ (Venus) - នរកផ្ទះកញ្ចក់',
    descEn: 'Hottest surface in the solar system (+464°C) beneath dense sulfuric acid clouds with 92 atmospheres of pressure.',
    descKm: 'ផ្ទៃភពក្តៅបំផុត (+464°C) នៅក្រោមពពកអាស៊ីតស៊ុលផួរិកដ៏ក្រាស់ ជាមួយនឹងសម្ពាធបរិយាកាស 92 ដងនៃផែនដី។',
  },
  {
    targetId: 'earth',
    type: 'planet',
    cameraRadius: 3.2,
    phi: 1.35,
    titleEn: '4. Earth & The Moon - The Oasis of Life',
    titleKm: '៤. ភពផែនដី និងព្រះច័ន្ទ - ជម្រកនៃជីវិត',
    descEn: 'Only known world with liquid surface water, active plate tectonics, oxygen-nitrogen atmosphere, and thriving biosphere.',
    descKm: 'ពិភពតែមួយគត់ដែលស្គាល់ថាមានទឹកលើផ្ទៃ បន្ទះតិចតូនិចកម្រើក បរិយាកាសអុកស៊ីសែន-អាសូត និងជីវមណ្ឌលរស់នៅ។',
  },
  {
    targetId: 'mars',
    type: 'planet',
    cameraRadius: 3.5,
    phi: 1.32,
    titleEn: '5. Mars - The Red Frontier',
    titleKm: '៥. ភពព្រះអង្គារ (Mars) - ដែនដីក្រហម',
    descEn: 'Home to Olympus Mons (21.9 km tall volcano) and dry river valleys explored by NASA Perseverance rover.',
    descKm: 'ទីតាំងភ្នំភ្លើង Olympus Mons កម្ពស់ 21.9 គម និងជ្រលងទន្លេបុរាណដែលកំពុងរុករកដោយរ៉ូវ័រ Perseverance។',
  },
  {
    targetId: 'jupiter',
    type: 'planet',
    cameraRadius: 10.5,
    phi: 1.32,
    titleEn: '6. Jupiter - The Giant Jovian Shield',
    titleKm: '៦. ភពព្រហស្បតិ៍ (Jupiter) - ខែលយក្សការពារប្រព័ន្ធព្រះអាទិត្យ',
    descEn: 'More massive than all other planets combined. The Great Red Spot is a giant anticyclonic storm larger than Earth.',
    descKm: 'មានម៉ាសធំជាងគ្រប់ភពទាំងអស់បញ្ចូលគ្នា។ ចំណុចក្រហមយក្សជាព្យុះគួចសម្ពាធខ្ពស់ដែលមានទំហំធំជាងផែនដី។',
  },
  {
    targetId: 'saturn',
    type: 'planet',
    cameraRadius: 9.8,
    phi: 1.32,
    titleEn: '7. Saturn - The Jewel of Rings',
    titleKm: '៧. ភពសៅរ៍ (Saturn) - ត្បូងពេជ្រនៃប្រព័ន្ធកង',
    descEn: 'Famous ice rings span 282,000 km across. Density is lower than liquid water, with a 29,000 km hexagonal polar jet wave.',
    descKm: 'ប្រព័ន្ធកងទឹកកកលាតសន្ធឹង 282,000 គម។ ដង់ស៊ីតេស្រាលជាងទឹក និងមានរលកខ្យល់ព្យុះរាងឆកោននៅប៉ូលខាងជើង។',
  },
  {
    targetId: 'uranus',
    type: 'planet',
    cameraRadius: 6.8,
    phi: 1.32,
    titleEn: '8. Uranus - The Tilted Ice Giant',
    titleKm: '៨. ភពអ៊ុយរ៉ានុស (Uranus) - ភពទឹកកកវិលផ្តេក',
    descEn: '97.8° axial obliquity causes extreme 42-year long polar seasons with temperatures dropping to -224°C.',
    descKm: 'មុំលម្អៀង 97.8° ធ្វើឱ្យវិលផ្តេកជាមួយរដូវកាល 42 ឆ្នាំនៅប៉ូល និងសីតុណ្ហភាពធ្លាក់ចុះដល់ -224°C។',
  },
  {
    targetId: 'neptune',
    type: 'planet',
    cameraRadius: 6.8,
    phi: 1.32,
    titleEn: '9. Neptune - The Supersonic Tempest',
    titleKm: '៩. ភពណិបទូន (Neptune) - ព្យុះលឿនជាងសំឡេង',
    descEn: 'Sustains 2,100 km/h supersonic winds. Its retrograde moon Triton erupts active nitrogen ice geysers.',
    descKm: 'មានខ្យល់ព្យុះល្បឿន 2,100 គម/ម៉ោង។ ព្រះច័ន្ទ Triton វិលច្រាសទិស និងមានបន្ទុះទឹកកកអាសូតរាវ។',
  },
  {
    targetId: 'pluto',
    type: 'planet',
    cameraRadius: 2.8,
    phi: 1.32,
    titleEn: '10. Pluto & Kuiper Belt - The Outer Frontier',
    titleKm: '១០. ភពភ្លុយតូ និងខ្សែក្រវាត់គុយពែរ - ព្រំដែនខាងក្រៅ',
    descEn: 'Heart-shaped nitrogen glacier Sputnik Planitia and gateway to the icy comets of the deep Kuiper Belt.',
    descKm: 'ផ្ទាំងទឹកកកអាសូតរាងបេះដូង Sputnik Planitia និងជាច្រកទ្វារចូលទៅកាន់ខ្សែក្រវាត់អាចម៍ផ្កាយទឹកកកគុយពែរ។',
  },
];

interface SolarSystemInteractiveGameProps {
  onOpenKnowledgeTab?: (tab: 'observatory' | 'planetary' | 'spacetech' | 'missions') => void;
}

export default function SolarSystemInteractiveGame({ onOpenKnowledgeTab }: SolarSystemInteractiveGameProps = {}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<RealPlanetPhysics | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<MoonData | null>(null);
  const [selectedSpacecraft, setSelectedSpacecraft] = useState<SpacecraftData | null>(null);
  const [showSpacecraftList, setShowSpacecraftList] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showAsteroidBelt, setShowAsteroidBelt] = useState(true);
  const [showComparator, setShowComparator] = useState(false);
  const [showDistanceRuler, setShowDistanceRuler] = useState(false);
  const [showHohmannModal, setShowHohmannModal] = useState(false);
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

  // Advanced Educational & Simulation States
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [language, setLanguage] = useState<'km' | 'en'>('km');
  const [showConstellations, setShowConstellations] = useState(false);
  const showConstellationsRef = useRef(false);
  const constellationLinesRef = useRef<THREE.LineSegments | null>(null);
  const [isEclipseActive, setIsEclipseActive] = useState(false);
  const isEclipseActiveRef = useRef(false);
  const saturnRingShaderRef = useRef<THREE.WebGLProgramParametersWithUniforms | null>(null);
  const saturnBodyMeshRef = useRef<THREE.Mesh | null>(null);

  // Guided Cosmic Tour States
  const [isCosmicTourActive, setIsCosmicTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  // Solar CME (Coronal Mass Ejection) Wave States
  const cmeMeshRef = useRef<THREE.Mesh | null>(null);
  const cmeRadiusRef = useRef(4.2);
  const [cmeFlash, setCmeFlash] = useState(false);
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

  useEffect(() => {
    showConstellationsRef.current = showConstellations;
    if (constellationLinesRef.current) {
      constellationLinesRef.current.visible = showConstellations;
    }
  }, [showConstellations]);

  const handleToggleAudio = () => {
    const isNowMuted = !spaceAudio.toggleMute();
    setIsAudioMuted(isNowMuted);
    if (!isNowMuted) {
      spaceAudio.playTelemetryBeep(1200, 0.12);
    }
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'km' ? 'en' : 'km'));
    spaceAudio.playTelemetryBeep(880, 0.08);
  };

  const handleToggleConstellations = () => {
    setShowConstellations((prev) => {
      const next = !prev;
      showConstellationsRef.current = next;
      if (constellationLinesRef.current) {
        constellationLinesRef.current.visible = next;
      }
      return next;
    });
    spaceAudio.playTelemetryBeep(940, 0.08);
  };
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
        sceneContextRef.current.spherical.phi = 1.35;
        const ePos = new THREE.Vector3();
        earthItem.body.getWorldPosition(ePos);
        const sunAngle = Math.atan2(-ePos.x, -ePos.z);
        sceneContextRef.current.spherical.theta = sunAngle + 0.25;
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
        sceneContextRef.current.spherical.phi = 1.35;
        const ePos = new THREE.Vector3();
        earthItem.body.getWorldPosition(ePos);
        const sunAngle = Math.atan2(-ePos.x, -ePos.z);
        sceneContextRef.current.spherical.theta = sunAngle + 0.25;
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
    spacecraftMeshes: {
      mission: SpacecraftData;
      pivot: THREE.Group;
      mesh: THREE.Group;
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
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

    // 3D Astronomical Constellations Sphere
    const constellationLines = buildConstellationLinesMesh(650);
    constellationLines.visible = showConstellationsRef.current;
    scene.add(constellationLines);
    constellationLinesRef.current = constellationLines;

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

    // Solar Coronal Mass Ejection (CME) Expanding Plasma Ring
    const cmeGeo = new THREE.RingGeometry(4.1, 4.9, 64);
    const cmeMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cmeMesh = new THREE.Mesh(cmeGeo, cmeMat);
    cmeMesh.rotation.x = Math.PI / 2;
    scene.add(cmeMesh);
    cmeMeshRef.current = cmeMesh;

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
        eclipseFactor: { value: 0.0 },
        moonShadowDir: { value: new THREE.Vector3(0, 0, 1) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specularMap;
        uniform vec3 sunDirection;
        uniform float eclipseFactor;
        uniform vec3 moonShadowDir;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 norm = normalize(vWorldNormal);
          vec3 sunDir = normalize(sunDirection);
          float NdotL = dot(norm, sunDir);
          
          // Smooth day/night twilight terminator transition
          float dayFactor = smoothstep(-0.15, 0.15, NdotL);
          
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // Realistic night lights: warm glowing NASA city lights
          vec3 nightLights = nightColor.rgb * 2.3;
          
          // Bright, crisp daylight side with direct solar radiance
          vec3 litDay = dayColor.rgb * (1.18 + max(0.0, NdotL) * 0.45);
          vec3 mixedColor = mix(nightLights, litDay, dayFactor);

          // Solar eclipse lunar umbra and penumbra projection
          if (eclipseFactor > 0.0) {
            float moonAlign = dot(norm, normalize(moonShadowDir));
            if (moonAlign > 0.94) {
              float shadowIntensity = smoothstep(0.94, 0.992, moonAlign) * eclipseFactor;
              mixedColor *= (1.0 - shadowIntensity * 0.92);
            }
          }
          
          // Ocean specular sun glint in world space
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 halfDir = normalize(sunDir + viewDir);
          float specAmount = pow(max(dot(norm, halfDir), 0.0), 32.0);
          float specMask = texture2D(specularMap, vUv).r;
          vec3 sunSpecular = vec3(0.95, 0.98, 1.0) * specAmount * specMask * max(0.0, NdotL) * 0.85;
          mixedColor += sunSpecular;
          
          // Atmospheric limb rim glow on daylight side in world space
          float rim = 1.0 - max(0.0, dot(norm, viewDir));
          vec3 atmoGlow = vec3(0.25, 0.65, 1.0) * pow(rim, 3.2) * max(0.0, NdotL + 0.25);
          mixedColor += atmoGlow * 0.5;
          
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
            varying vec3 vWorldNormal;
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPos.xyz;
              vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
              gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
          `,
          fragmentShader: `
            uniform vec3 sunDirection;
            varying vec3 vWorldNormal;
            varying vec3 vWorldPosition;
            void main() {
              vec3 norm = normalize(vWorldNormal);
              vec3 viewDir = normalize(cameraPosition - vWorldPosition);
              vec3 sunDir = normalize(sunDirection);
              float rim = 1.0 - max(0.0, dot(norm, viewDir));
              float sunFacing = dot(norm, sunDir);
              float intensity = pow(rim, 2.5) * smoothstep(-0.25, 0.4, sunFacing);
              vec3 atmoColor = vec3(0.22, 0.65, 1.0);
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
            saturnBodyMeshRef.current = body;
            const ringTex = textureLoader.load('/textures/planets/saturn_ring.png');
            ringTex.colorSpace = THREE.SRGBColorSpace;
            const ringMat = new THREE.MeshStandardMaterial({
              map: ringTex,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.92,
              roughness: 0.5,
            });
            ringMat.onBeforeCompile = (shader) => {
              shader.uniforms.saturnWorldPos = { value: new THREE.Vector3() };
              shader.uniforms.saturnRadius = { value: planet.sizeRadius };
              shader.vertexShader = `
                varying vec3 vRingWorldPos;
                ${shader.vertexShader}
              `.replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
                 vRingWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;`
              );
              shader.fragmentShader = `
                uniform vec3 saturnWorldPos;
                uniform float saturnRadius;
                varying vec3 vRingWorldPos;
                ${shader.fragmentShader}
              `.replace(
                '#include <dithering_fragment>',
                `#include <dithering_fragment>
                 vec3 toSun = normalize(-saturnWorldPos);
                 vec3 toPoint = vRingWorldPos - saturnWorldPos;
                 float proj = dot(toPoint, toSun);
                 if (proj < 0.0) {
                   vec3 perp = toPoint - proj * toSun;
                   if (length(perp) < saturnRadius * 1.02) {
                     gl_FragColor.rgb *= 0.15;
                   }
                 }`
              );
              saturnRingShaderRef.current = shader;
            };
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
      const rockMat = new THREE.MeshLambertMaterial({
        color: colorHex,
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

    // 6. Build Active Human Spacecraft & Telescopes (ISS, JWST, Parker, Perseverance)
    const spacecraftMeshes: any[] = [];
    DEEP_SPACE_MISSIONS.forEach((mission) => {
      const craftPivot = new THREE.Group();
      craftPivot.rotation.z = (mission.orbitOffset3D.inclinationDeg * Math.PI) / 180;

      const craftGroup = new THREE.Group();
      const pts = new THREE.EllipseCurve(
        0, 0,
        mission.orbitOffset3D.r, mission.orbitOffset3D.r,
        0, 2 * Math.PI, false, 0
      ).getPoints(48);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        pts.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitLine = new THREE.Line(
        orbitGeo,
        new THREE.LineBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
        })
      );
      craftPivot.add(orbitLine);

      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.8 });
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.5 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 });

      if (mission.id === 'iss') {
        const truss = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 8), bodyMat);
        truss.rotation.z = Math.PI / 2;
        craftGroup.add(truss);
        const wing1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.005, 0.05), solarMat);
        wing1.position.set(-0.08, 0, 0);
        craftGroup.add(wing1);
        const wing2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.005, 0.05), solarMat);
        wing2.position.set(0.08, 0, 0);
        craftGroup.add(wing2);
      } else if (mission.id === 'jwst') {
        const mirror = new THREE.Mesh(new THREE.CircleGeometry(0.065, 6), goldMat);
        mirror.rotation.y = Math.PI / 2;
        craftGroup.add(mirror);
        const shield = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), bodyMat);
        shield.position.set(-0.02, -0.04, 0);
        shield.rotation.x = Math.PI / 2;
        craftGroup.add(shield);
      } else if (mission.id === 'parker') {
        const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 16), bodyMat);
        shield.rotation.x = Math.PI / 2;
        craftGroup.add(shield);
        const bus = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.05), goldMat);
        bus.position.set(0, 0, -0.035);
        craftGroup.add(bus);
      } else {
        const roverBody = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.06), bodyMat);
        craftGroup.add(roverBody);
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 6), goldMat);
        mast.position.set(0.015, 0.025, 0.02);
        craftGroup.add(mast);
      }

      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      craftGroup.add(beacon);

      craftGroup.position.set(mission.orbitOffset3D.r, 0, 0);
      craftPivot.add(craftGroup);

      if (mission.targetBodyId === 'earth' && earthBodyGroup) {
        earthBodyGroup.add(craftPivot);
      } else if (mission.targetBodyId === 'sun') {
        scene.add(craftPivot);
      } else {
        const targetP = planetMeshes.find((p) => p.planet.id === mission.targetBodyId);
        if (targetP) {
          targetP.tiltGroup.add(craftPivot);
        } else {
          scene.add(craftPivot);
        }
      }

      spacecraftMeshes.push({
        mission,
        pivot: craftPivot,
        mesh: craftGroup,
        orbitLine,
        angle: 0,
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
      moonMeshes,
      spacecraftMeshes,
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

    const handlePointerRaycast = (clientX: number, clientY: number) => {
      if (!sceneContextRef.current || !container) return;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / container.clientWidth) * 2 - 1,
        -((clientY - rect.top) / container.clientHeight) * 2 + 1
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

      // Check click on Active Human Spacecraft
      if (sceneContextRef.current.spacecraftMeshes) {
        for (const scItem of sceneContextRef.current.spacecraftMeshes) {
          const hits = raycaster.intersectObjects(scItem.mesh.children);
          if (hits.length > 0) {
            handleSelectSpacecraft(scItem.mission);
            return;
          }
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

    const onCanvasClick = (e: MouseEvent) => {
      handlePointerRaycast(e.clientX, e.clientY);
    };

    // Mobile Touch Navigation: 1-finger rotate, 2-finger pinch-to-zoom, tap-to-select
    let touchStartDist = 0;
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchMoving = false;

    const onTouchStart = (e: TouchEvent) => {
      if (!sceneContextRef.current) return;
      if (e.touches.length === 1) {
        sceneContextRef.current.isDragging = true;
        sceneContextRef.current.prevX = e.touches[0].clientX;
        sceneContextRef.current.prevY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isTouchMoving = false;
      } else if (e.touches.length === 2) {
        sceneContextRef.current.isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!sceneContextRef.current) return;
      if (e.touches.length === 1 && sceneContextRef.current.isDragging) {
        const t = e.touches[0];
        const dx = t.clientX - sceneContextRef.current.prevX;
        const dy = t.clientY - sceneContextRef.current.prevY;

        if (Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY) > 6) {
          isTouchMoving = true;
        }

        sceneContextRef.current.spherical.theta -= dx * 0.005;
        sceneContextRef.current.spherical.phi = THREE.MathUtils.clamp(
          sceneContextRef.current.spherical.phi - dy * 0.005,
          0.05,
          Math.PI - 0.05
        );

        sceneContextRef.current.prevX = t.clientX;
        sceneContextRef.current.prevY = t.clientY;
      } else if (e.touches.length === 2) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStartDist > 0) {
          const distDelta = currentDist - touchStartDist;
          const currentR = sceneContextRef.current.spherical.radius;
          const zoomFactor = currentR < 2.0 ? 0.003 * currentR : currentR < 10.0 ? 0.02 : 0.06;
          const newRadius = currentR - distDelta * zoomFactor;

          const isTargetingBody = sceneContextRef.current.targetedMesh !== null;
          if (isTargetingBody && newRadius <= 1.22 && !isDivingRef.current) {
            triggerCinematicDiveToMaps(mapsTarget.lat, mapsTarget.lng, mapsTarget.zoom);
            return;
          }

          const minRadius = isTargetingBody ? 1.14 : 3.0;
          sceneContextRef.current.spherical.radius = THREE.MathUtils.clamp(
            newRadius,
            minRadius,
            350
          );
        }
        touchStartDist = currentDist;
        isTouchMoving = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!sceneContextRef.current) return;
      if (e.touches.length === 0) {
        sceneContextRef.current.isDragging = false;
        touchStartDist = 0;

        if (!isTouchMoving && Date.now() - touchStartTime < 350) {
          handlePointerRaycast(touchStartX, touchStartY);
        }
      } else if (e.touches.length === 1) {
        sceneContextRef.current.isDragging = true;
        sceneContextRef.current.prevX = e.touches[0].clientX;
        sceneContextRef.current.prevY = e.touches[0].clientY;
        touchStartDist = 0;
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

    container.style.touchAction = 'none';
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onCanvasClick);
    container.addEventListener('dblclick', onDoubleClick);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('resize', onResize);

    // Reusable pooled vectors and matrices for zero-GC 60 FPS animation loop
    const poolWorldPos = new THREE.Vector3();
    const poolAwayTarget = new THREE.Vector3();
    const poolPosA = new THREE.Vector3();
    const poolPosB = new THREE.Vector3();
    const poolEarthPos = new THREE.Vector3();
    const poolSunDir = new THREE.Vector3();
    const poolInvMatrix = new THREE.Matrix4();
    const poolTargetWorldPos = new THREE.Vector3();
    const poolDesiredCamPos = new THREE.Vector3();

    // Animation Render Loop with True J2000 Keplerian Time Physics
    let animId: number;
    let clock = 0;
    let uiSyncCounter = 0;
    let lastPerfTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.016;

      const nowPerf = performance.now();
      const deltaRealSec = Math.min((nowPerf - lastPerfTime) / 1000, 0.1);
      lastPerfTime = nowPerf;

      if (sceneContextRef.current) {
        const {
          sunMesh,
          coronaMesh,
          planetMeshes,
          moonMeshes,
          spacecraftMeshes,
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

        // 100% Scientific Real-Time / Time Warp Clock Synchronization
        if (!paused) {
          if (isRealTimeLiveRef.current && speed === 1) {
            // Live Real-Time: exact 1:1 synchronization with the real-world clock (Date.now())
            simDateMsRef.current = Date.now();
          } else {
            // Educational time warp: scaled advance based on actual elapsed seconds
            simDateMsRef.current += deltaRealSec * speed * 1000;
          }
          uiSyncCounter++;
          if (uiSyncCounter % 15 === 0) {
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

        // True J2000 Elliptical & Inclined Keplerian Orbital Motions
        planetMeshes.forEach((item) => {
          const pos = computeKeplerianPosition3D(item.planet, daysJ2000);
          item.tiltGroup.position.set(pos.x, pos.y, pos.z);
          item.angle = pos.trueAnomalyRad;

          // Planetary axial rotation: strictly follow real physical rotational periods
          if (!paused && item.planet.id !== 'earth') {
            const rotFactor = ((deltaRealSec * speed) / (Math.abs(item.planet.rotationPeriodHours) * 3600)) * 2 * Math.PI;
            item.body.rotation.y += item.planet.isRetrograde ? -rotFactor : rotFactor;
          }

          // Orient Halley's Comet ion/dust tail directly away from the Sun (anti-solar vector)
          if (item.cometTailGroup) {
            item.tiltGroup.getWorldPosition(poolWorldPos);
            poolAwayTarget.copy(poolWorldPos).multiplyScalar(2.0);
            item.cometTailGroup.lookAt(poolAwayTarget);
          }

          item.orbitLine.visible = orbitsVisible;
        });

        // Orbit Major Moons around parent planets (e.g. Moon around Earth in 27.32 days)
        moonMeshes.forEach((mItem) => {
          if (!paused) {
            const mSpeed = ((deltaRealSec * speed) / (mItem.moon.periodDays * 86400)) * 2 * Math.PI;
            mItem.angle += mSpeed;
            mItem.mesh.position.set(
              Math.cos(mItem.angle) * mItem.moon.orbitRadius3D,
              0,
              Math.sin(mItem.angle) * mItem.moon.orbitRadius3D
            );
            mItem.mesh.rotation.y = -mItem.angle; // Tidally locked
          }
          mItem.orbitLine.visible = orbitsVisible;
        });

        // Orbit Active Spacecraft & Satellite Telemetry (ISS, JWST, Parker, Perseverance)
        if (spacecraftMeshes) {
          spacecraftMeshes.forEach((sc) => {
            if (!paused) {
              const scDelta = (deltaRealSec * speed) * 0.22 * sc.mission.orbitOffset3D.speed;
              sc.angle += scDelta;
              sc.mesh.position.set(
                Math.cos(sc.angle) * sc.mission.orbitOffset3D.r,
                0,
                Math.sin(sc.angle) * sc.mission.orbitOffset3D.r
              );
              sc.mesh.rotation.y = sc.angle;
            }
            sc.orbitLine.visible = orbitsVisible;
          });
        }

        // Animate Solar Coronal Mass Ejection (CME) shockwave wavefront
        if (cmeMeshRef.current) {
          cmeRadiusRef.current += (deltaRealSec * Math.min(speed, 25)) * 2.5;
          if (cmeRadiusRef.current > 42.0) {
            cmeRadiusRef.current = 1.6;
          }
          const cmeScale = cmeRadiusRef.current;
          cmeMeshRef.current.scale.set(cmeScale, cmeScale, cmeScale);
          const cmeAlpha = Math.max(0.0, 1.0 - cmeRadiusRef.current / 42.0) * 0.45;
          (cmeMeshRef.current.material as THREE.MeshBasicMaterial).opacity = cmeAlpha;
        }

        // Update 3D Interplanetary Laser Telemetry Line
        if (showDistanceRulerRef.current) {
          const { originId, targetId } = rulerPairRef.current;
          const pA = planetMeshes.find((p) => p.planet.id === originId);
          const pB = planetMeshes.find((p) => p.planet.id === targetId);
          if (pA && pB) {
            pA.body.getWorldPosition(poolPosA);
            pB.body.getWorldPosition(poolPosB);
            laserLineMesh.geometry.setFromPoints([poolPosA, poolPosB]);
            laserLineMesh.visible = true;
          } else {
            laserLineMesh.visible = false;
          }
        } else {
          laserLineMesh.visible = false;
        }

        // 100% Scientific Real-Time 24-Hour Earth Diurnal Rotation & Day/Night Shader
        if (earthMesh && earthShaderMaterial) {
          const simDate = new Date(simDateMsRef.current);
          const utcSeconds =
            simDate.getUTCHours() * 3600 +
            simDate.getUTCMinutes() * 60 +
            simDate.getUTCSeconds() +
            simDate.getUTCMilliseconds() / 1000;
          const dayFraction = utcSeconds / 86400;

          // Compute Sun's position vector relative to Earth in ecliptic plane
          earthMesh.getWorldPosition(poolEarthPos);
          const sunAngle = Math.atan2(-poolEarthPos.x, -poolEarthPos.z);

          // 24-hour physical diurnal rotation:
          // Greenwich meridian (0 deg) faces Sun at 12:00 UTC (solar noon).
          // Cambodia (105 deg E) faces Sun at 05:00 UTC (12:00 PM local solar noon).
          // Completes exactly one 360-degree rotation every 24 hours.
          earthMesh.rotation.y = sunAngle + (dayFraction - 0.5) * 2 * Math.PI - Math.PI / 2;

          if (earthCloudsRef.current && !paused) {
            // Gentle trade wind atmospheric cloud drift
            earthCloudsRef.current.rotation.y = earthMesh.rotation.y + (simDateMsRef.current / (86400000 * 30)) * 2 * Math.PI;
          }

          // Physical world-space vector from Earth toward the Sun at (0, 0, 0)
          poolSunDir.set(0, 0, 0).sub(poolEarthPos).normalize();

          earthShaderMaterial.uniforms.sunDirection.value.copy(poolSunDir);

          if (earthAtmoRef.current) {
            earthAtmoRef.current.uniforms.sunDirection.value.copy(poolSunDir);
          }

          // Real-time Solar Eclipse Moon shadow projection
          const moonItem = moonMeshes.find((m) => m.moon.id === 'moon');
          if (moonItem) {
            const moonWorldPos = new THREE.Vector3();
            moonItem.mesh.getWorldPosition(moonWorldPos);
            const moonRelDir = moonWorldPos.sub(poolEarthPos).normalize();
            const align = moonRelDir.dot(poolSunDir);
            const isEclipse = align > 0.984;
            earthShaderMaterial.uniforms.eclipseFactor.value = isEclipse ? THREE.MathUtils.clamp((align - 0.984) / 0.012, 0.0, 1.0) : 0.0;
            earthShaderMaterial.uniforms.moonShadowDir.value.copy(moonRelDir);
            if (isEclipse !== isEclipseActiveRef.current) {
              isEclipseActiveRef.current = isEclipse;
              setIsEclipseActive(isEclipse);
            }
          }
        }

        // Saturn globe shadow onto rings
        if (saturnRingShaderRef.current && saturnBodyMeshRef.current) {
          const saturnWorldPos = new THREE.Vector3();
          saturnBodyMeshRef.current.getWorldPosition(saturnWorldPos);
          saturnRingShaderRef.current.uniforms.saturnWorldPos.value.copy(saturnWorldPos);
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
        if (targetedMesh) {
          targetedMesh.getWorldPosition(poolTargetWorldPos);
        } else {
          poolTargetWorldPos.set(0, 0, 0);
        }

        if (isDivingRef.current) {
          spherical.radius = THREE.MathUtils.lerp(spherical.radius, 1.025, 0.14);
        }

        const camX = poolTargetWorldPos.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        const camY = poolTargetWorldPos.y + spherical.radius * Math.cos(spherical.phi);
        const camZ = poolTargetWorldPos.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);

        const camLerp = isDivingRef.current ? 0.15 : 0.06;
        poolDesiredCamPos.set(camX, camY, camZ);
        camera.position.lerp(poolDesiredCamPos, camLerp);
        camera.lookAt(poolTargetWorldPos);

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
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Planet Focus
  const handleSelectPlanet = (planet: RealPlanetPhysics) => {
    spaceAudio.playTelemetryBeep(640, 0.09);
    setSelectedPlanet(planet);
    setSelectedMoon(null);
    setIsEarthFocused(planet.id === 'earth');

    if (!sceneContextRef.current) return;
    const item = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === planet.id);
    if (item) {
      sceneContextRef.current.targetedMesh = item.body;
      sceneContextRef.current.spherical.radius = Math.max(1.8, planet.sizeRadius * 4.2 + 1.5);

      // Automatically place camera on the sunlit/bright daytime side of the planet
      const pPos = new THREE.Vector3();
      item.body.getWorldPosition(pPos);
      const sunAngle = Math.atan2(-pPos.x, -pPos.z);
      sceneContextRef.current.spherical.theta = sunAngle + 0.25;
      sceneContextRef.current.spherical.phi = 1.32;
    }
  };

  // Focus directly onto the bright sunlit side of the selected planet or Earth
  const handleFocusSunlitSide = () => {
    spaceAudio.playTelemetryBeep(840, 0.08);
    if (!sceneContextRef.current) return;
    const item = selectedPlanet
      ? sceneContextRef.current.planetMeshes.find((m) => m.planet.id === selectedPlanet.id)
      : sceneContextRef.current.planetMeshes.find((m) => m.planet.id === 'earth');

    if (item) {
      sceneContextRef.current.targetedMesh = item.body;
      const targetR = selectedPlanet
        ? Math.max(1.8, selectedPlanet.sizeRadius * 4.2 + 1.5)
        : 2.85;
      sceneContextRef.current.spherical.radius = targetR;
      sceneContextRef.current.spherical.phi = 1.35;

      const pPos = new THREE.Vector3();
      item.body.getWorldPosition(pPos);
      const sunAngle = Math.atan2(-pPos.x, -pPos.z);
      sceneContextRef.current.spherical.theta = sunAngle + 0.15;
    }
  };

  // Moon Focus
  const handleSelectMoon = (moon: MoonData) => {
    spaceAudio.playTelemetryBeep(980, 0.08);
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
    spaceAudio.playDeepSpacePulse();
    setSelectedPlanet(null);
    setSelectedMoon(null);
    setSelectedSpacecraft(null);
    setIsEarthFocused(false);
    if (!sceneContextRef.current) return;
    sceneContextRef.current.targetedMesh = null;
    sceneContextRef.current.spherical.radius = 75;
    sceneContextRef.current.spherical.theta = 0.52;
    sceneContextRef.current.spherical.phi = 1.38;
  };

  // Spacecraft Focus & Telemetry
  const handleSelectSpacecraft = (craft: SpacecraftData) => {
    spaceAudio.playTelemetryBeep(1150, 0.08);
    setSelectedSpacecraft(craft);
    setSelectedPlanet(null);
    setSelectedMoon(null);
    setIsEarthFocused(false);

    if (!sceneContextRef.current || !sceneContextRef.current.spacecraftMeshes) return;
    const item = sceneContextRef.current.spacecraftMeshes.find((s: any) => s.mission.id === craft.id);
    if (item) {
      sceneContextRef.current.targetedMesh = item.mesh;
      sceneContextRef.current.spherical.radius = 1.35;
      sceneContextRef.current.spherical.phi = 1.25;
      sceneContextRef.current.spherical.theta = item.angle + 0.35;
    }
  };

  // Trigger Dynamic Solar Coronal Mass Ejection (CME) shockwave blast
  const handleTriggerCme = () => {
    spaceAudio.playDeepSpacePulse();
    cmeRadiusRef.current = 1.8;
    setCmeFlash(true);
    setTimeout(() => setCmeFlash(false), 900);
  };

  // Guided Cosmic Tour Navigation
  const applyCosmicTourStep = (stepIdx: number) => {
    const step = COSMIC_TOUR_STEPS[stepIdx];
    if (!step || !sceneContextRef.current) return;

    if (step.type === 'sun') {
      setSelectedPlanet(null);
      setSelectedMoon(null);
      setSelectedSpacecraft(null);
      setIsEarthFocused(false);
      sceneContextRef.current.targetedMesh = sceneContextRef.current.sunMesh;
      sceneContextRef.current.spherical.radius = step.cameraRadius;
      sceneContextRef.current.spherical.phi = step.phi;
      sceneContextRef.current.spherical.theta = 0.85;
    } else {
      const p = REAL_PLANETS_PHYSICS.find((item) => item.id === step.targetId);
      if (p) {
        setSelectedPlanet(p);
        setSelectedMoon(null);
        setSelectedSpacecraft(null);
        setIsEarthFocused(p.id === 'earth');
        const m = sceneContextRef.current.planetMeshes.find((item) => item.planet.id === p.id);
        if (m) {
          sceneContextRef.current.targetedMesh = m.body;
          sceneContextRef.current.spherical.radius = step.cameraRadius;
          sceneContextRef.current.spherical.phi = step.phi;
          const pPos = new THREE.Vector3();
          m.body.getWorldPosition(pPos);
          const sunAngle = Math.atan2(-pPos.x, -pPos.z);
          sceneContextRef.current.spherical.theta = sunAngle + 0.25;
        }
      }
    }
  };

  const handleStartCosmicTour = () => {
    spaceAudio.playTelemetryBeep(920, 0.12);
    setIsCosmicTourActive(true);
    setTourStepIndex(0);
    applyCosmicTourStep(0);
  };

  const handleNextTourStep = () => {
    const nextIdx = (tourStepIndex + 1) % COSMIC_TOUR_STEPS.length;
    spaceAudio.playTelemetryBeep(960, 0.08);
    setTourStepIndex(nextIdx);
    applyCosmicTourStep(nextIdx);
  };

  const handlePrevTourStep = () => {
    const prevIdx = (tourStepIndex - 1 + COSMIC_TOUR_STEPS.length) % COSMIC_TOUR_STEPS.length;
    spaceAudio.playTelemetryBeep(820, 0.08);
    setTourStepIndex(prevIdx);
    applyCosmicTourStep(prevIdx);
  };

  const handleExitCosmicTour = () => {
    setIsCosmicTourActive(false);
    handleResetView();
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
    sceneContextRef.current.spherical.radius = 2.85;
    sceneContextRef.current.spherical.phi = 1.25;
    const earthPos = new THREE.Vector3();
    earthItem.body.getWorldPosition(earthPos);
    const sunAngle = Math.atan2(-earthPos.x, -earthPos.z);
    sceneContextRef.current.spherical.theta = sunAngle + 0.25;
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
              if (spd === 1) {
                setIsRealTimeLive(true);
                simDateMsRef.current = Date.now();
                setSimDateMs(Date.now());
              } else {
                setIsRealTimeLive(false);
              }
            }}
            onToggleSpacecraft={() => setShowSpacecraftList(!showSpacecraftList)}
            isSpacecraftActive={showSpacecraftList || selectedSpacecraft !== null}
          />

          {/* Active Human Spacecraft & Satellite Selector Dropdown */}
          {showSpacecraftList && (
            <div className="absolute top-22 sm:top-28 left-2 sm:left-4 z-30 pointer-events-auto w-[calc(100vw-1rem)] max-w-sm bg-space-950/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-space-800 shadow-2xl font-mono text-xs text-white space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-space-800">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-aeroblue" />
                  <span className="font-bold uppercase tracking-wider text-[11px]">
                    {language === 'km' ? 'យានអវកាស និងរណបសកម្ម 3D' : 'ACTIVE SPACECRAFT &amp; SATELLITES'}
                  </span>
                </div>
                <button
                  onClick={() => setShowSpacecraftList(false)}
                  className="p-1 rounded-full text-space-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {DEEP_SPACE_MISSIONS.map((craft) => (
                  <button
                    key={craft.id}
                    onClick={() => {
                      handleSelectSpacecraft(craft);
                      setShowSpacecraftList(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      selectedSpacecraft?.id === craft.id
                        ? 'bg-aeroblue/15 border-aeroblue text-white'
                        : 'bg-space-900/70 hover:bg-space-850 border-space-800 text-space-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-aerogreen" />
                        <span>{language === 'km' && craft.khmerName ? craft.khmerName : craft.name}</span>
                      </div>
                      <div className="text-[10px] text-space-400">
                        {language === 'km' && craft.khmerAgency ? craft.khmerAgency : craft.agency} &bull; {craft.targetBodyId.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-aeroblue font-bold block">{craft.launchYear}</span>
                      <span className="text-[9px] text-aerogreen font-semibold">ACTIVE</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guided Cosmic Tour Subtitle Banner */}
          {isCosmicTourActive && (
            <div className="absolute top-16 sm:top-20 inset-x-2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-30 pointer-events-auto max-w-xl w-full animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-space-950/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-aerogreen/50 shadow-2xl shadow-aerogreen/10 text-white font-mono space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-aerogreen/20 border border-aerogreen/40 text-aerogreen text-[10px] font-bold">
                      {language === 'km' ? `ដំណាក់កាលទី ${tourStepIndex + 1} / ${COSMIC_TOUR_STEPS.length}` : `TOUR STEP ${tourStepIndex + 1} / ${COSMIC_TOUR_STEPS.length}`}
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {language === 'km' ? COSMIC_TOUR_STEPS[tourStepIndex].titleKm : COSMIC_TOUR_STEPS[tourStepIndex].titleEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevTourStep}
                      className="p-1.5 rounded-lg bg-space-900 hover:bg-space-800 text-space-300 hover:text-white transition-colors cursor-pointer"
                      title="Previous Step"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleNextTourStep}
                      className="p-1.5 rounded-lg bg-aerogreen/20 hover:bg-aerogreen text-aerogreen hover:text-space-950 font-bold transition-colors cursor-pointer"
                      title="Next Step"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleExitCosmicTour}
                      className="p-1.5 rounded-lg bg-space-900 hover:bg-space-800 text-space-400 hover:text-white transition-colors cursor-pointer"
                      title="Exit Cosmic Tour"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-space-300 leading-relaxed">
                  {language === 'km' ? COSMIC_TOUR_STEPS[tourStepIndex].descKm : COSMIC_TOUR_STEPS[tourStepIndex].descEn}
                </p>
              </div>
            </div>
          )}

          {/* Dynamic CME Solar Wind Flare Wave Overlay */}
          {cmeFlash && (
            <div className="absolute inset-0 pointer-events-none z-30 bg-gradient-radial from-aeroamber/30 via-aeroamber/10 to-transparent animate-pulse flex items-center justify-center">
              <div className="bg-space-950/90 border border-aeroamber px-6 py-2 rounded-full text-aeroamber font-bold text-xs tracking-widest shadow-2xl">
                {language === 'km' ? 'បន្ទុះព្រះអាទិត្យ CME កំពុងបាញ់រលកផ្លាស្មាឆ្លងកាត់ប្រព័ន្ធព្រះអាទិត្យ' : 'SOLAR CORONAL MASS EJECTION (CME) PROPAGATING'}
              </div>
            </div>
          )}

          {/* Solar Eclipse Alert Banner */}
          {isEclipseActive && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-pulse">
              <div className="bg-aeroamber/20 border border-aeroamber/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-aeroamber font-bold text-[10px] sm:text-xs tracking-wider flex items-center gap-2 shadow-lg shadow-aeroamber/20">
                <span className="w-2 h-2 rounded-full bg-aeroamber animate-ping" />
                <span>{language === 'km' ? 'សូរ្យគ្រាសពេញលេញកំពុងកើតឡើង (ស្រមោលព្រះច័ន្ទលើផែនដី)' : 'TOTAL SOLAR ECLIPSE ACTIVE (LUNAR UMBRA ON EARTH)'}</span>
              </div>
            </div>
          )}

          {/* Desktop/Tablet Top Navigation Bar (Single Slim Row for screens >= 640px) */}
          <div className="hidden sm:flex absolute top-4 inset-x-4 z-20 items-center justify-between gap-2 pointer-events-none">
            {/* Brand */}
            <div className="pointer-events-auto flex items-center gap-2 bg-space-950/85 backdrop-blur-xl px-4 py-2 rounded-full border border-space-800 shadow-xl">
              <div className="w-2 h-2 rounded-full bg-aeroblue animate-pulse" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">AEROVEX</span>
              <span className="text-[10px] text-space-400">{language === 'km' ? 'ប្រព័ន្ធព្រះអាទិត្យ 3D' : 'SOLAR SYSTEM'}</span>
            </div>

            {/* Center Mode Switcher Pill */}
            <div className="pointer-events-auto flex items-center gap-1 bg-space-950/85 backdrop-blur-xl p-1 rounded-full border border-space-800 shadow-xl">
              <button
                onClick={handleResetView}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedPlanet === null
                    ? 'bg-space-800 text-white shadow-sm'
                    : 'text-space-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-aeroamber" />
                <span>{language === 'km' ? 'ប្រព័ន្ធព្រះអាទិត្យ 3D' : '3D SOLAR SYSTEM'}</span>
              </button>

              <button
                onClick={() => triggerCinematicDiveToMaps(12.5657, 104.991, 7)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 bg-aeroblue/15 hover:bg-aeroblue text-aeroblue-light hover:text-space-950 border border-aeroblue/30 cursor-pointer"
                title="Open authentic Google Maps Satellite View with 3D zoom dive"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ផែនទីរណបផែនដី' : 'EARTH SATELLITE MAP'}</span>
              </button>

              {onOpenKnowledgeTab && (
                <button
                  onClick={() => {
                    spaceAudio.playTelemetryBeep(1100, 0.1);
                    onOpenKnowledgeTab('observatory');
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 bg-space-900 hover:bg-aerogreen text-aerogreen-light hover:text-space-950 border border-aerogreen/30 cursor-pointer"
                  title="Open Deep Space Observatory & Science Encyclopedia"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'បណ្ណសារវិទ្យាសាស្ត្រ' : 'SCIENCE ARCHIVES'}</span>
                </button>
              )}
            </div>

            {/* Right Controls Pill */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-space-950/85 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-space-800 shadow-xl text-xs">
              <button
                onClick={handleToggleAudio}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isAudioMuted ? 'text-space-500 hover:text-white' : 'text-aerogreen bg-aerogreen/15'
                }`}
                title={isAudioMuted ? (language === 'km' ? 'បើកសំឡេង' : 'Enable Audio') : (language === 'km' ? 'បិទសំឡេង' : 'Mute Audio')}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleToggleConstellations}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                  showConstellations ? 'bg-aeroblue text-space-950' : 'text-space-500 hover:text-white'
                }`}
                title="Toggle Astronomical Constellations"
              >
                {language === 'km' ? 'ផ្កាយ' : 'STARS'}
              </button>

              <button
                onClick={handleToggleLanguage}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-space-900 hover:bg-space-800 text-aeroamber border border-aeroamber/30 transition-colors flex items-center gap-1 cursor-pointer"
                title="Toggle Language"
              >
                <Languages className="w-3 h-3 text-aeroamber" />
                <span>{language === 'km' ? 'ខ្មែរ' : 'EN'}</span>
              </button>

              <div className="h-3 w-px bg-space-800" />

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-full hover:bg-space-800 text-space-300 hover:text-white transition-colors cursor-pointer"
                title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-aerogreen" /> : <Pause className="w-3.5 h-3.5 text-aeroamber" />}
              </button>

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
                <span>RANGER</span>
              </button>

              <button
                onClick={() => setShowComparator(true)}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-space-300 hover:text-white hover:bg-space-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Compare Planetary Scale & Gravity"
              >
                <Scale className="w-3 h-3 text-aeroblue" />
                <span>COMPARE</span>
              </button>

              <button
                onClick={handleStartCosmicTour}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  isCosmicTourActive ? 'bg-aerogreen text-space-950' : 'text-space-300 hover:text-white hover:bg-space-800'
                }`}
                title="Guided 10-Step Cosmic Solar Tour"
              >
                <FastForward className="w-3 h-3 text-aerogreen" />
                <span>TOUR</span>
              </button>

              <button
                onClick={handleTriggerCme}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-aeroamber hover:text-white hover:bg-space-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Simulate Solar Coronal Mass Ejection (CME) Wave Blast"
              >
                <Zap className="w-3 h-3 text-aeroamber" />
                <span>CME</span>
              </button>

              <button
                onClick={() => setShowHohmannModal(true)}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-aeroblue hover:text-white hover:bg-space-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Hohmann Transfer Orbit & Delta-V Trajectory Simulator"
              >
                <Rocket className="w-3 h-3 text-aeroblue" />
                <span>HOHMANN</span>
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

          {/* Mobile Top Navigation Bar (Two Tiered Layout for screens < 640px) */}
          <div className="sm:hidden absolute top-2 inset-x-2 z-20 flex items-center justify-between gap-1 pointer-events-none">
            {/* Mobile Brand */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-space-950/90 backdrop-blur-xl px-2.5 py-1 rounded-full border border-space-800 shadow-xl">
              <div className="w-2 h-2 rounded-full bg-aeroblue animate-pulse" />
              <span className="text-[11px] font-bold text-white tracking-wider uppercase">AEROVEX</span>
            </div>

            {/* Mobile Mode Switcher */}
            <div className="pointer-events-auto flex items-center gap-1 bg-space-950/90 backdrop-blur-xl p-0.5 rounded-full border border-space-800 shadow-xl">
              <button
                onClick={handleToggleLanguage}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-space-900 text-aeroamber border border-aeroamber/30 cursor-pointer"
              >
                {language === 'km' ? 'ខ្មែរ' : 'EN'}
              </button>

              <button
                onClick={handleToggleAudio}
                className={`p-1 rounded-full cursor-pointer ${isAudioMuted ? 'text-space-500' : 'text-aerogreen'}`}
              >
                {isAudioMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>

              <button
                onClick={handleResetView}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedPlanet === null ? 'bg-space-800 text-white shadow-sm' : 'text-space-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3 text-aeroamber" />
                <span>3D</span>
              </button>

              <button
                onClick={() => triggerCinematicDiveToMaps(12.5657, 104.991, 7)}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 bg-aeroblue/15 hover:bg-aeroblue text-aeroblue-light hover:text-space-950 border border-aeroblue/30 cursor-pointer"
              >
                <Globe className="w-3 h-3" />
                <span>MAP</span>
              </button>

              {onOpenKnowledgeTab && (
                <button
                  onClick={() => {
                    spaceAudio.playTelemetryBeep(1100, 0.1);
                    onOpenKnowledgeTab('observatory');
                  }}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 bg-aerogreen/15 text-aerogreen border border-aerogreen/30 cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>INFO</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Second-Tier Quick Controls (Right side opposite Ephemeris Clock) */}
          <div className="sm:hidden absolute top-11 right-2 z-20 pointer-events-auto flex items-center gap-1 bg-space-950/90 backdrop-blur-xl px-2 py-1 rounded-full border border-space-800 shadow-xl text-xs">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 rounded-full hover:bg-space-800 text-space-300 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-3 h-3 text-aerogreen" /> : <Pause className="w-3 h-3 text-aeroamber" />}
            </button>

            <button
              onClick={handleStartCosmicTour}
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-colors cursor-pointer ${
                isCosmicTourActive ? 'bg-aerogreen text-space-950' : 'text-space-400 hover:text-white'
              }`}
              title="Cosmic Tour"
            >
              TOUR
            </button>

            <button
              onClick={() => setShowHohmannModal(true)}
              className="p-1 rounded-full text-aeroblue hover:bg-space-800 transition-colors cursor-pointer"
              title="Hohmann Simulator"
            >
              <Rocket className="w-3 h-3" />
            </button>

            <button
              onClick={() => setShowOrbits(!showOrbits)}
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-colors cursor-pointer ${
                showOrbits ? 'bg-space-800 text-aeroblue' : 'text-space-500 hover:text-white'
              }`}
              title="Orbits"
            >
              ORBITS
            </button>

            <button
              onClick={() => setShowAsteroidBelt(!showAsteroidBelt)}
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-colors cursor-pointer ${
                showAsteroidBelt ? 'bg-space-800 text-aeroamber' : 'text-space-500 hover:text-white'
              }`}
              title="Belt"
            >
              BELT
            </button>

            <button
              onClick={() => setShowComparator(true)}
              className="p-1 rounded-full text-space-300 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
              title="Compare"
            >
              <Scale className="w-3 h-3 text-aeroblue" />
            </button>

            <button
              onClick={handleResetView}
              className="p-1 rounded-full hover:bg-space-800 text-space-300 hover:text-white transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
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

          {/* Hohmann Orbital Transfer & Delta-V Simulator Modal */}
          {showHohmannModal && (
            <HohmannTransferSimulator
              onClose={() => setShowHohmannModal(false)}
              language={language}
            />
          )}

          {/* Dedicated Active Spacecraft Telemetry Card on Right */}
          {selectedSpacecraft && (
            <div className="absolute top-20 sm:top-20 right-2 sm:right-5 z-30 pointer-events-auto w-[calc(100vw-1rem)] max-w-xs sm:w-84 animate-in fade-in duration-200">
              <div className="bg-space-950/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-aeroblue/40 shadow-2xl space-y-3 font-mono text-xs text-white max-h-[75vh] overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-aerogreen/15 text-aerogreen border border-aerogreen/30 font-bold uppercase tracking-wider">
                      {selectedSpacecraft.status}
                    </span>
                    <h2 className="text-base font-bold text-white mt-1 tracking-tight">
                      {language === 'km' && selectedSpacecraft.khmerName ? selectedSpacecraft.khmerName : selectedSpacecraft.name}
                    </h2>
                    <div className="text-[10px] text-space-400">
                      {language === 'km' && selectedSpacecraft.khmerAgency ? selectedSpacecraft.khmerAgency : selectedSpacecraft.agency}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSpacecraft(null)}
                    className="p-1 rounded-full text-space-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 bg-space-900/80 rounded-xl border border-space-800">
                    <span className="text-space-400 block text-[9px]">{language === 'km' ? 'គោលដៅរុករក' : 'TARGET BODY'}</span>
                    <span className="text-aeroblue font-bold uppercase">{selectedSpacecraft.targetBodyId}</span>
                  </div>
                  <div className="p-2 bg-space-900/80 rounded-xl border border-space-800">
                    <span className="text-space-400 block text-[9px]">{language === 'km' ? 'ឆ្នាំបង្ហោះ' : 'LAUNCH YEAR'}</span>
                    <span className="text-aerogreen font-bold">{selectedSpacecraft.launchYear}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-space-900/70 rounded-xl border border-space-800 space-y-1 text-[10px]">
                  <span className="text-[9px] text-space-400 font-bold uppercase block">
                    {language === 'km' ? 'បេសកកម្មចម្បង:' : 'MISSION SUMMARY:'}
                  </span>
                  <p className="text-space-200 leading-relaxed">
                    {language === 'km' && selectedSpacecraft.khmerMissionSummary
                      ? selectedSpacecraft.khmerMissionSummary
                      : selectedSpacecraft.missionSummary}
                  </p>
                </div>

                <div className="p-2 bg-aeroblue/10 rounded-xl border border-aeroblue/25 text-[10px] text-aeroblue-light leading-relaxed">
                  <span className="font-bold block text-[9px] text-aeroblue uppercase mb-0.5">
                    {language === 'km' ? 'ទិន្នន័យតេឡេមេទ្រីបន្តផ្ទាល់:' : 'LIVE TELEMETRY HIGHLIGHT:'}
                  </span>
                  {language === 'km' && selectedSpacecraft.khmerTelemetryHighlight
                    ? selectedSpacecraft.khmerTelemetryHighlight
                    : selectedSpacecraft.telemetryHighlight}
                </div>
              </div>
            </div>
          )}

          {/* Floating Compact Planet / Moon Telemetry Card on Right */}
          {selectedPlanet && (
            <div className="absolute top-20 sm:top-20 right-2 sm:right-5 z-30 pointer-events-auto w-[calc(100vw-1rem)] max-w-xs sm:w-80 animate-in fade-in duration-200">
              <div className="bg-space-950/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-space-800/90 shadow-2xl space-y-2.5 sm:space-y-3 font-mono text-xs text-white max-h-[75vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-aeroblue/15 text-aeroblue border border-aeroblue/30 font-bold uppercase tracking-wider">
                      {selectedMoon
                        ? (language === 'km' ? `ព្រះច័ន្ទរណបរបស់ ${selectedPlanet.khmerName || selectedPlanet.name.split(' (')[0]}` : `NATURAL SATELLITE OF ${selectedPlanet.name.split(' (')[0]}`)
                        : (language === 'km' ? (selectedPlanet.khmerType || selectedPlanet.type) : selectedPlanet.type.split(' (')[0])}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-1 tracking-tight">
                      {selectedMoon
                        ? (language === 'km' && selectedMoon.khmerName ? selectedMoon.khmerName : selectedMoon.name)
                        : (language === 'km' && selectedPlanet.khmerName ? selectedPlanet.khmerName : selectedPlanet.name.split(' (')[0])}
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
                      <span className="text-space-400">{language === 'km' ? 'អង្កត់ផ្ចិត:' : 'DIAMETER:'} <strong className="text-white">{selectedMoon.diameterKm.toLocaleString()} km</strong></span>
                      <span className="text-aeroblue font-bold">{language === 'km' ? 'គន្លង:' : 'ORBIT:'} {selectedMoon.periodDays}d</span>
                    </div>
                    <p className="text-space-300 leading-snug">{selectedMoon.description}</p>
                    <button
                      onClick={() => handleSelectPlanet(selectedPlanet)}
                      className="text-[10px] text-aeroamber hover:underline font-bold pt-1 block cursor-pointer"
                    >
                      {language === 'km' ? `ត្រឡប់ទៅ ${selectedPlanet.khmerName || selectedPlanet.name.split(' (')[0]}` : `RETURN TO ${selectedPlanet.name.split(' (')[0].toUpperCase()}`}
                    </button>
                  </div>
                )}

                {/* Compact 2x2 Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 bg-space-900/70 rounded-xl border border-space-850">
                    <span className="text-space-400 block text-[9px]">{language === 'km' ? 'អង្កត់ផ្ចិត' : 'DIAMETER'}</span>
                    <span className="text-white font-bold">{selectedPlanet.diameterKm.toLocaleString()} km</span>
                  </div>
                  <div className="p-2 bg-space-900/70 rounded-xl border border-space-850">
                    <span className="text-space-400 block text-[9px]">{language === 'km' ? 'ចម្ងាយពីព្រះអាទិត្យ' : 'SOLAR DISTANCE'}</span>
                    <span className="text-white font-bold">{selectedPlanet.orbitRadiusAU} AU</span>
                  </div>
                  <div className="p-2 bg-space-900/70 rounded-xl border border-space-850">
                    <span className="text-space-400 block text-[9px]">{language === 'km' ? 'ទំនាញ / មុំលម្អៀង' : 'GRAVITY / TILT'}</span>
                    <span className="text-white font-bold">{selectedPlanet.surfaceGravityMs2} m/s² &bull; {selectedPlanet.axialTiltDeg}°</span>
                  </div>
                  <div className="p-2 bg-space-900/70 rounded-xl border border-space-850">
                    <span className="text-space-400 block text-[9px]">{language === 'km' ? 'សីតុណ្ហភាពមធ្យម' : 'MEAN TEMP'}</span>
                    <span className="text-white font-bold">{selectedPlanet.meanTempC}</span>
                  </div>
                </div>

                {/* Major Orbiting Moons Selector (If planet has modeled moons) */}
                {MAJOR_MOONS_DATA.some((m) => m.parentId === selectedPlanet.id) && (
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[9px] text-space-400 uppercase font-bold block">
                      {language === 'km' ? 'ព្រះច័ន្ទរណបធំៗ (ចុចដើម្បី ZOOM 3D):' : 'MAJOR ORBITING MOONS (CLICK TO FOCUS 3D):'}
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
                          {(language === 'km' && m.khmerName) ? m.khmerName.split(' (')[0] : m.name.split(' (')[0]}
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
                      <span>{language === 'km' ? 'មើលលើផែនទីរណប GOOGLE MAPS' : 'VIEW IN GOOGLE MAPS'}</span>
                    </button>

                    <button
                      onClick={handleLocateMyPosition}
                      className="w-full py-2 px-3 rounded-xl bg-space-900 hover:bg-space-850 text-aerogreen border border-aerogreen/30 font-bold transition-all flex items-center justify-center gap-2 text-[11px] cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-aerogreen" />
                      <span>{language === 'km' ? 'កំណត់ទីតាំង GPS របស់ខ្ញុំ' : 'PINPOINT MY GPS LOCATION'}</span>
                    </button>

                    <button
                      onClick={handleFocusSunlitSide}
                      className="w-full py-2 px-3 rounded-xl bg-space-900 hover:bg-space-850 text-aeroamber border border-aeroamber/30 font-bold transition-all flex items-center justify-center gap-2 text-[11px] cursor-pointer"
                    >
                      <Sun className="w-3.5 h-3.5 text-aeroamber" />
                      <span>{language === 'km' ? 'មើលផ្នែកភ្លឺ (ពេលថ្ងៃ)' : 'VIEW BRIGHT DAYLIGHT SIDE'}</span>
                    </button>

                    {userLocation && (
                      <div className="text-[10px] text-space-400 text-center">{locatingStatus}</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1 text-[11px] text-space-300">
                    <button
                      onClick={handleFocusSunlitSide}
                      className="w-full py-2 px-3 mb-1 rounded-xl bg-space-900 hover:bg-space-850 text-aeroamber border border-aeroamber/30 font-bold transition-all flex items-center justify-center gap-2 text-[11px] cursor-pointer"
                    >
                      <Sun className="w-3.5 h-3.5 text-aeroamber" />
                      <span>{language === 'km' ? 'មើលផ្នែកភ្លឺ (ពេលថ្ងៃ)' : 'VIEW BRIGHT DAYLIGHT SIDE'}</span>
                    </button>
                    <div className="text-[10px] text-space-400 uppercase font-bold">{language === 'km' ? 'បរិយាកាស:' : 'ATMOSPHERE:'}</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlanet.atmosphere.slice(0, 3).map((gas, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-space-900 text-space-300 text-[10px] border border-space-800">
                          {gas}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-space-400 leading-relaxed line-clamp-2 pt-1">
                      {(language === 'km' && selectedPlanet.khmerPhysicsHighlights)
                        ? selectedPlanet.khmerPhysicsHighlights[0]
                        : selectedPlanet.physicsHighlights[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Planet, Dwarf Planet & Comet Quick-Selector Bar (Ultra-Sleek Pill) */}
          <div className="absolute bottom-2 sm:bottom-4 inset-x-2 sm:inset-x-4 z-20 flex justify-center pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-1 bg-space-950/90 backdrop-blur-xl px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-space-800 shadow-2xl overflow-x-auto max-w-full touch-pan-x">
              <button
                onClick={handleResetView}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer flex-shrink-0 ${
                  selectedPlanet === null && !isEarthFocused
                    ? 'bg-aeroamber text-space-950 shadow-sm'
                    : 'text-space-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-aeroamber" />
                <span>{language === 'km' ? 'ព្រះអាទិត្យ' : 'THE SUN'}</span>
              </button>

              {REAL_PLANETS_PHYSICS.map((planet) => {
                const isSelected = selectedPlanet?.id === planet.id;

                return (
                  <button
                    key={planet.id}
                    onClick={() => handleSelectPlanet(planet)}
                    className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                      isSelected
                        ? 'bg-aeroblue text-space-950 shadow-sm'
                        : 'text-space-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: planet.colorHex }}
                    />
                    <span>{(language === 'km' && planet.khmerName) ? planet.khmerName.split(' (')[0] : planet.name.split(' (')[0]}</span>
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
