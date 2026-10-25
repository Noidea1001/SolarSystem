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
} from 'lucide-react';
import {
  createRealisticEarthDayTexture,
  createRealisticEarthNightTexture,
  createRealisticSunTexture,
} from '../utils/spaceTextures';

interface CountryPoint {
  id: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  timezone: string;
  spaceAgency: string;
  majorSites: string;
  overview: string;
}

const WORLD_COUNTRIES: CountryPoint[] = [
  {
    id: 'khm',
    name: 'Cambodia',
    capital: 'Phnom Penh',
    lat: 12.5657,
    lng: 104.991,
    timezone: 'UTC+07:00 (Indochina Time)',
    spaceAgency: 'MPTC Space Technology & Remote Sensing Bureau',
    majorSites: 'Angkor Wat Telemetry Hub, Phnom Penh Earth Station, Tonle Sap Environmental Basin',
    overview:
      'Kingdom in Southeast Asia utilizing satellite remote sensing for Mekong hydrological forecasting, agricultural flood mapping, and historical heritage preservation.',
  },
  {
    id: 'usa',
    name: 'United States',
    capital: 'Washington D.C.',
    lat: 37.0902,
    lng: -95.7129,
    timezone: 'UTC-05:00 to UTC-08:00',
    spaceAgency: 'NASA & US Space Force',
    majorSites: 'Kennedy Space Center Launch Pad 39A, Cape Canaveral Space Force Station, Johnson Space Center',
    overview:
      'Global pioneer in deep space exploration, Artemis lunar base development, commercial rideshare launches, and Mars rover missions.',
  },
  {
    id: 'fra',
    name: 'France',
    capital: 'Paris',
    lat: 46.2276,
    lng: 2.2137,
    timezone: 'UTC+01:00 (Central European Time)',
    spaceAgency: 'CNES & European Space Agency (ESA)',
    majorSites: 'Guiana Space Centre (CSG Kourou ELA-4), Toulouse Space Center, Paris HQ',
    overview:
      'Leading European space power operating the equatorial spaceport in French Guiana for Ariane 6 and Vega-C orbital launches.',
  },
  {
    id: 'jpn',
    name: 'Japan',
    capital: 'Tokyo',
    lat: 36.2048,
    lng: 138.2529,
    timezone: 'UTC+09:00 (Japan Standard Time)',
    spaceAgency: 'JAXA (Japan Aerospace Exploration Agency)',
    majorSites: 'Tanegashima Space Center, Uchinoura Space Center, Tsukuba Space Center',
    overview:
      'Pioneering asteroid sample returns (Hayabusa), H3 heavy launch vehicles, and precision optical Earth observation constellations.',
  },
  {
    id: 'ind',
    name: 'India',
    capital: 'New Delhi',
    lat: 20.5937,
    lng: 78.9629,
    timezone: 'UTC+05:30 (Indian Standard Time)',
    spaceAgency: 'ISRO (Indian Space Research Organisation)',
    majorSites: 'Satish Dhawan Space Centre (SDSC SHAR), ISRO Telemetry Tracking Command Network',
    overview:
      'Renowned for landing on the lunar south pole (Chandrayaan-3), solar observatory Aditya-L1, and high-frequency PSLV launches.',
  },
  {
    id: 'chn',
    name: 'China',
    capital: 'Beijing',
    lat: 35.8617,
    lng: 104.1954,
    timezone: 'UTC+08:00 (China Standard Time)',
    spaceAgency: 'CNSA (China National Space Administration)',
    majorSites: 'Wenchang Spacecraft Launch Site, Jiuquan Satellite Launch Center, Tiangong Space Station',
    overview:
      'Operating the permanent Tiangong Space Station, Chang’e lunar far side sample returns, and Beidou global satellite navigation system.',
  },
  {
    id: 'sgp',
    name: 'Singapore',
    capital: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    timezone: 'UTC+08:00 (Singapore Time)',
    spaceAgency: 'OSTIn (Office for Space Technology & Industry)',
    majorSites: 'CRISP Center for Remote Imaging & Sensing, Changi Aerospace Park',
    overview:
      'Southeast Asian NewSpace and satellite IoT hub specializing in synthetic aperture radar (SAR) constellations and laser downlinks.',
  },
  {
    id: 'tha',
    name: 'Thailand',
    capital: 'Bangkok',
    lat: 15.87,
    lng: 100.9925,
    timezone: 'UTC+07:00 (Indochina Time)',
    spaceAgency: 'GISTDA (Geo-Informatics and Space Technology Development Agency)',
    majorSites: 'Space Krenovation Park, THEOS Satellite Ground Station',
    overview:
      'Operating THEOS Earth observation satellite series for natural disaster management, water resources, and agricultural monitoring.',
  },
  {
    id: 'vnm',
    name: 'Vietnam',
    capital: 'Hanoi',
    lat: 14.0583,
    lng: 108.2772,
    timezone: 'UTC+07:00 (Indochina Time)',
    spaceAgency: 'VNSC (Vietnam National Space Center)',
    majorSites: 'Hoa Lac High-Tech Park Space Center, Nha Trang Observatory',
    overview:
      'Advancing MicroDragon and NanoDragon CubeSat engineering and optical remote sensing for coastal and typhoon tracking.',
  },
  {
    id: 'deu',
    name: 'Germany',
    capital: 'Berlin',
    lat: 51.1657,
    lng: 10.4515,
    timezone: 'UTC+01:00 (Central European Time)',
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
    spaceAgency: 'UK Space Agency (UKSA)',
    majorSites: 'Harwell Space Cluster, SaxaVord Spaceport Shetland, Goonhilly Earth Station',
    overview:
      'Leading SmallSat manufacturing hub and commercial satellite telecommunications center with OneWeb constellation headquarters.',
  },
  {
    id: 'aus',
    name: 'Australia',
    capital: 'Canberra',
    lat: -25.2744,
    lng: 133.7751,
    timezone: 'UTC+08:00 to UTC+11:00',
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
    spaceAgency: 'AEB & INPE (National Institute for Space Research)',
    majorSites: 'Alcantara Launch Center (Equatorial Launch Base), Amazonia-1 Mission Control',
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
    spaceAgency: 'UAE Space Agency & Mohammed Bin Rashid Space Centre',
    majorSites: 'MBRSC Mission Control, Dubai Sat Telemetry Complex',
    overview:
      'Operators of the Hope Mars Probe (Emirates Mars Mission) and Rashid lunar rover exploration projects.',
  },
];

interface PlanetData {
  id: string;
  name: string;
  type: string;
  sizeRadius: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  colorHex: string;
  diameterKm: number;
  distanceAU: number;
  yearLength: string;
  dayLength: string;
  surfaceGravity: string;
  meanTempC: string;
  moons: number;
  hasRings?: boolean;
  atmosphere: string[];
  summary: string;
}

const SOLAR_PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet (Innermost)',
    sizeRadius: 0.38,
    orbitRadius: 9,
    orbitSpeed: 0.035,
    rotationSpeed: 0.003,
    colorHex: '#9ca3af',
    diameterKm: 4879,
    distanceAU: 0.39,
    yearLength: '88 Earth Days',
    dayLength: '58.6 Earth Days',
    surfaceGravity: '3.7 m/s² (0.38g)',
    meanTempC: '-180°C to +430°C',
    moons: 0,
    atmosphere: ['Trace: Oxygen (42%)', 'Sodium (29%)', 'Hydrogen (22%)', 'Helium (6%)'],
    summary:
      'The smallest planet in the Solar System, possessing a huge metallic iron core and extreme diurnal temperature swings.',
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet (Runaway Greenhouse)',
    sizeRadius: 0.95,
    orbitRadius: 14,
    orbitSpeed: 0.015,
    rotationSpeed: -0.002,
    colorHex: '#f59e0b',
    diameterKm: 12104,
    distanceAU: 0.72,
    yearLength: '224.7 Earth Days',
    dayLength: '243 Earth Days (Retrograde)',
    surfaceGravity: '8.87 m/s² (0.91g)',
    meanTempC: '+464°C (Melt Lead)',
    moons: 0,
    atmosphere: ['Carbon Dioxide (96.5%)', 'Nitrogen (3.5%)', 'Sulfuric Acid Clouds'],
    summary:
      'Earth’s twin wrapped in suffocating greenhouse clouds with surface pressures 92 times greater than Earth.',
  },
  {
    id: 'earth',
    name: 'Earth (Terra)',
    type: 'Terrestrial Ocean Planet (Biosphere)',
    sizeRadius: 1.0,
    orbitRadius: 21,
    orbitSpeed: 0.009,
    rotationSpeed: 0.014,
    colorHex: '#38bdf8',
    diameterKm: 12742,
    distanceAU: 1.0,
    yearLength: '365.25 Days',
    dayLength: '23.93 Hours',
    surfaceGravity: '9.807 m/s² (1.0g)',
    meanTempC: '+15°C',
    moons: 1,
    atmosphere: ['Nitrogen (78.08%)', 'Oxygen (20.95%)', 'Argon (0.93%)', 'Carbon Dioxide (0.04%)'],
    summary:
      'The vibrant home of humanity, featuring real day/night illumination with city lights, active plate tectonics, oceans, and life.',
  },
  {
    id: 'mars',
    name: 'Mars (The Red Planet)',
    type: 'Terrestrial Desert Planet',
    sizeRadius: 0.53,
    orbitRadius: 29,
    orbitSpeed: 0.0048,
    rotationSpeed: 0.013,
    colorHex: '#ef4444',
    diameterKm: 6779,
    distanceAU: 1.52,
    yearLength: '687 Earth Days',
    dayLength: '24.62 Hours (1 Sol)',
    surfaceGravity: '3.72 m/s² (0.38g)',
    meanTempC: '-65°C (-125°C to +20°C)',
    moons: 2,
    atmosphere: ['Carbon Dioxide (95.3%)', 'Nitrogen (2.6%)', 'Argon (1.9%)'],
    summary:
      'Target for human exploration, harboring the solar system’s largest shield volcano (Olympus Mons) and ancient lake river deltas.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter (King of Planets)',
    type: 'Gas Giant (Jovian)',
    sizeRadius: 2.3,
    orbitRadius: 41,
    orbitSpeed: 0.0018,
    rotationSpeed: 0.032,
    colorHex: '#d97706',
    diameterKm: 139820,
    distanceAU: 5.2,
    yearLength: '11.86 Earth Years',
    dayLength: '9.93 Hours',
    surfaceGravity: '24.79 m/s² (2.53g)',
    meanTempC: '-110°C',
    moons: 95,
    atmosphere: ['Hydrogen (89.8%)', 'Helium (10.2%)', 'Methane, Ammonia, Water Ice'],
    summary:
      'Massive gas giant with over 300 times Earth’s mass, featuring the 350-year-old Great Red Spot storm and ocean moons like Europa.',
  },
  {
    id: 'saturn',
    name: 'Saturn (Ringed World)',
    type: 'Gas Giant with Planetary Rings',
    sizeRadius: 1.9,
    orbitRadius: 53,
    orbitSpeed: 0.0009,
    rotationSpeed: 0.028,
    colorHex: '#fcd34d',
    diameterKm: 116460,
    distanceAU: 9.58,
    yearLength: '29.45 Earth Years',
    dayLength: '10.7 Hours',
    surfaceGravity: '10.44 m/s² (1.06g)',
    meanTempC: '-140°C',
    moons: 146,
    hasRings: true,
    atmosphere: ['Hydrogen (96.3%)', 'Helium (3.25%)', 'Methane & Ammonia'],
    summary:
      'Famous for its breathtaking rings made of billions of water-ice fragments and active cryovolcanoes on moon Enceladus.',
  },
  {
    id: 'uranus',
    name: 'Uranus (Ice Giant)',
    type: 'Ice Giant (Tilted Axis)',
    sizeRadius: 1.35,
    orbitRadius: 65,
    orbitSpeed: 0.0005,
    rotationSpeed: -0.016,
    colorHex: '#38bdf8',
    diameterKm: 50724,
    distanceAU: 19.2,
    yearLength: '84 Earth Years',
    dayLength: '17.24 Hours (Retrograde)',
    surfaceGravity: '8.69 m/s² (0.89g)',
    meanTempC: '-195°C',
    moons: 28,
    atmosphere: ['Hydrogen (82.5%)', 'Helium (15.2%)', 'Methane (2.3%)'],
    summary:
      'Tipped almost 98 degrees on its side, rolling around the Sun with extreme 42-year long seasonal daylight and night periods.',
  },
  {
    id: 'neptune',
    name: 'Neptune (Deep Ocean World)',
    type: 'Ice Giant (Outermost Planet)',
    sizeRadius: 1.3,
    orbitRadius: 75,
    orbitSpeed: 0.0003,
    rotationSpeed: 0.019,
    colorHex: '#2563eb',
    diameterKm: 49244,
    distanceAU: 30.05,
    yearLength: '164.8 Earth Years',
    dayLength: '16.11 Hours',
    surfaceGravity: '11.15 m/s² (1.14g)',
    meanTempC: '-200°C',
    moons: 16,
    atmosphere: ['Hydrogen (80%)', 'Helium (19%)', 'Methane (1.5%)'],
    summary:
      'The stormiest planet in the Solar System, where supersonic winds exceed 2,100 km/h, discovered mathematically by Le Verrier.',
  },
];

export default function SolarSystemInteractiveGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryPoint>(WORLD_COUNTRIES[0]); // Cambodia default
  const [countrySearch, setCountrySearch] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingStatus, setLocatingStatus] = useState<string>('Ready to locate your real coordinates on Earth');
  const [isEarthFocused, setIsEarthFocused] = useState(false);
  const [isNightAtTarget, setIsNightAtTarget] = useState(false);

  const sceneContextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    sunMesh: THREE.Mesh;
    sunPointLight: THREE.PointLight;
    earthMesh: THREE.Mesh | null;
    earthShaderMaterial: THREE.ShaderMaterial | null;
    earthGroup: THREE.Group | null;
    countryMarkers: { country: CountryPoint; marker: THREE.Group }[];
    userPinMesh: THREE.Group | null;
    planetMeshes: {
      planet: PlanetData;
      pivot: THREE.Group;
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

  // Determine if a country coordinate is currently in Day or Night based on Sun direction
  const computeDayNightAtCoords = (lat: number, lng: number, sunDir: THREE.Vector3): boolean => {
    const pt = latLngToVector3(lat, lng, 1.0).normalize();
    const dot = pt.dot(sunDir.normalize());
    return dot < -0.05; // Negative means night side
  };

  // Initialize Three.js Simulation
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020409);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 4000);
    camera.position.set(0, 30, 85);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Deep Universe Starfield (Real astrophotographical colors)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3800;
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 1800;
      starPos[i + 1] = (Math.random() - 0.5) * 1800;
      starPos[i + 2] = (Math.random() - 0.5) * 1800;

      const r = Math.random();
      if (r > 0.8) {
        starCols[i] = 0.45; starCols[i + 1] = 0.8; starCols[i + 2] = 1.0; // Blue giants
      } else if (r > 0.6) {
        starCols[i] = 1.0; starCols[i + 1] = 0.8; starCols[i + 2] = 0.45; // Amber stars
      } else {
        starCols[i] = 0.95; starCols[i + 1] = 0.95; starCols[i + 2] = 1.0; // White stars
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));
    const starField = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.3, vertexColors: true, transparent: true, opacity: 0.85 }));
    scene.add(starField);

    // Ambient space illumination
    const ambientLight = new THREE.AmbientLight(0x0a101d, 1.2);
    scene.add(ambientLight);

    // 1. REAL SUN (Center Light Source)
    const sunPointLight = new THREE.PointLight(0xfffbeb, 4.0, 500, 0.4);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const sunGeo = new THREE.SphereGeometry(3.8, 64, 64);
    const sunTex = createRealisticSunTexture();
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun Corona Glow
    const coronaGeo = new THREE.SphereGeometry(4.4, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // 2. REAL EARTH WITH TRUE DAY/NIGHT TERMINATOR SHADER
    const earthDayTex = createRealisticEarthDayTexture();
    const earthNightTex = createRealisticEarthNightTexture();

    // GLSL Shader that computes real Day vs Night based on Sun angle:
    // When facing Sun (Day) -> Shows Blue Marble continents and oceans.
    // When facing away from Sun (Night) -> Shows NASA Black Marble glowing city lights!
    const earthShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: earthDayTex },
        nightTexture: { value: earthNightTex },
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
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 norm = normalize(vNormal);
          vec3 sunDir = normalize(sunDirection);
          float NdotL = dot(norm, sunDir);
          
          // Smooth day/night twilight terminator transition
          float dayFactor = smoothstep(-0.15, 0.15, NdotL);
          
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // At night: city lights shine bright!
          // At day: realistic sunlit oceans and continents!
          vec3 mixedColor = mix(nightColor.rgb * 1.8, dayColor.rgb, dayFactor);
          
          // Atmospheric scattering glow on daytime horizon
          float rim = 1.0 - max(0.0, dot(norm, vec3(0.0, 0.0, 1.0)));
          vec3 atmoGlow = vec3(0.2, 0.6, 1.0) * pow(rim, 3.5) * max(0.0, NdotL);
          mixedColor += atmoGlow * 0.45;
          
          gl_FragColor = vec4(mixedColor, 1.0);
        }
      `,
    });

    let earthMesh: THREE.Mesh | null = null;
    let earthGroup: THREE.Group | null = null;
    let userPinGroup: THREE.Group | null = null;
    const countryMarkers: { country: CountryPoint; marker: THREE.Group }[] = [];
    const planetMeshes: any[] = [];

    // Build Planets
    SOLAR_PLANETS.forEach((planet) => {
      const pivot = new THREE.Group();
      scene.add(pivot);

      // Orbit Line Ring
      const orbitCurve = new THREE.EllipseCurve(0, 0, planet.orbitRadius, planet.orbitRadius, 0, 2 * Math.PI, false, 0);
      const points = orbitCurve.getPoints(120);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, 0, p.y)));
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(planet.colorHex),
        transparent: true,
        opacity: 0.25,
      });
      const orbitLine = new THREE.Line(lineGeo, lineMat);
      orbitLine.rotation.x = Math.PI / 2;
      scene.add(orbitLine);

      let body: THREE.Mesh;

      if (planet.id === 'earth') {
        // Real Earth Sphere with Day/Night Shader
        const eGeo = new THREE.SphereGeometry(planet.sizeRadius, 64, 64);
        body = new THREE.Mesh(eGeo, earthShaderMaterial);
        body.position.set(planet.orbitRadius, 0, 0);
        pivot.add(body);
        earthMesh = body;
        earthGroup = pivot;

        // Add 3D Google Maps style Country Markers on Earth
        WORLD_COUNTRIES.forEach((c) => {
          const mGroup = new THREE.Group();
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 12, 12),
            new THREE.MeshBasicMaterial({ color: c.id === 'khm' ? 0x38bdf8 : 0x94a3b8 })
          );
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.03, 0.05, 16),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
          );
          ring.rotation.x = Math.PI / 2;
          mGroup.add(dot);
          mGroup.add(ring);

          const pos = latLngToVector3(c.lat, c.lng, planet.sizeRadius + 0.02);
          mGroup.position.copy(pos);
          body.add(mGroup);
          countryMarkers.push({ country: c, marker: mGroup });
        });

        // GPS User Marker
        userPinGroup = new THREE.Group();
        const pinDot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        const pinRadar = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.09, 20), new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
        pinRadar.rotation.x = Math.PI / 2;
        userPinGroup.add(pinDot);
        userPinGroup.add(pinRadar);
        body.add(userPinGroup);

        // Initial pin position on Cambodia
        const initPinPos = latLngToVector3(WORLD_COUNTRIES[0].lat, WORLD_COUNTRIES[0].lng, planet.sizeRadius + 0.03);
        userPinGroup.position.copy(initPinPos);

        // Moon Orbiting Earth
        const moonPivot = new THREE.Group();
        body.add(moonPivot);
        const moonGeo = new THREE.SphereGeometry(0.25, 24, 24);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 });
        const moonBody = new THREE.Mesh(moonGeo, moonMat);
        moonBody.position.set(2.2, 0, 0);
        moonPivot.add(moonBody);
      } else {
        // Standard Planets with physical lighting
        const pGeo = new THREE.SphereGeometry(planet.sizeRadius, 48, 48);
        const pMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(planet.colorHex), roughness: 0.7 });
        body = new THREE.Mesh(pGeo, pMat);
        body.position.set(planet.orbitRadius, 0, 0);
        pivot.add(body);

        // Saturn Rings
        if (planet.hasRings) {
          const ringGeo = new THREE.RingGeometry(planet.sizeRadius * 1.3, planet.sizeRadius * 2.3, 64);
          const ringMat = new THREE.MeshStandardMaterial({ color: 0xd97706, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
          const rings = new THREE.Mesh(ringGeo, ringMat);
          rings.rotation.x = Math.PI / 2 + 0.4;
          body.add(rings);
        }
      }

      planetMeshes.push({
        planet,
        pivot,
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
      sunPointLight,
      earthMesh,
      earthShaderMaterial,
      earthGroup,
      countryMarkers,
      userPinMesh: userPinGroup,
      planetMeshes,
      spherical: { radius: 85, theta: 0.45, phi: 1.15 },
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

      sceneContextRef.current.spherical.theta -= dx * 0.0055;
      sceneContextRef.current.spherical.phi = THREE.MathUtils.clamp(
        sceneContextRef.current.spherical.phi - dy * 0.0055,
        0.1,
        Math.PI - 0.1
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
      const delta = e.deltaY * 0.055;
      sceneContextRef.current.spherical.radius = THREE.MathUtils.clamp(
        sceneContextRef.current.spherical.radius + delta,
        3.2,
        240
      );
    };

    // Click Detection on 3D Bodies (Raycaster)
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

    // Animation Render Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.01;

      if (sceneContextRef.current) {
        const {
          sunMesh,
          planetMeshes,
          earthMesh,
          earthShaderMaterial,
          camera,
          spherical,
          targetedMesh,
          userPinMesh,
        } = sceneContextRef.current;

        // Sun spin
        sunMesh.rotation.y += 0.002;
        const pulse = 1 + Math.sin(clock * 3) * 0.04;
        coronaMesh.scale.set(pulse, pulse, pulse);

        // Orbit planets
        planetMeshes.forEach((item) => {
          if (!isPaused) {
            item.angle += item.planet.orbitSpeed * 0.25 * simSpeed;
            item.pivot.rotation.y = item.angle;
            item.body.rotation.y += item.planet.rotationSpeed * simSpeed;
          }
          item.orbitLine.visible = showOrbits;
        });

        // Update Real Day/Night Shader Sun Vector on Earth
        if (earthMesh && earthShaderMaterial) {
          // Calculate Sun vector relative to Earth in Earth's local coordinate space
          const earthWorldPos = new THREE.Vector3();
          earthMesh.getWorldPosition(earthWorldPos);

          const sunDir = new THREE.Vector3(0, 0, 0).sub(earthWorldPos).normalize();
          // Transform sun direction to Earth body's local rotation frame
          const invMatrix = new THREE.Matrix4().extractRotation(earthMesh.matrixWorld).invert();
          sunDir.applyMatrix4(invMatrix);

          earthShaderMaterial.uniforms.sunDirection.value.copy(sunDir);
        }

        // Pulse GPS Pin
        if (userPinMesh) {
          const ring = userPinMesh.children[1];
          if (ring) {
            const pScale = 1 + Math.sin(clock * 6) * 0.25;
            ring.scale.set(pScale, pScale, 1);
          }
        }

        // Camera Follow Target (Earth or selected planet)
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
  }, [isPaused, simSpeed, showOrbits]);

  // Handle Planet Selection
  const handleSelectPlanet = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    setIsEarthFocused(planet.id === 'earth');

    if (!sceneContextRef.current) return;
    const item = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === planet.id);
    if (item) {
      sceneContextRef.current.targetedMesh = item.body;
      sceneContextRef.current.spherical.radius = planet.sizeRadius * 4.2 + 2;
    }
  };

  // Reset to full Solar System
  const handleResetView = () => {
    setSelectedPlanet(null);
    setIsEarthFocused(false);
    if (!sceneContextRef.current) return;
    sceneContextRef.current.targetedMesh = null;
    sceneContextRef.current.spherical.radius = 85;
    sceneContextRef.current.spherical.theta = 0.45;
    sceneContextRef.current.spherical.phi = 1.15;
  };

  // Select Country on Earth (Rotates Earth & Flies Camera like Google Maps)
  const handleSelectCountry = (country: CountryPoint) => {
    setSelectedCountry(country);
    setIsEarthFocused(true);

    const earthData = SOLAR_PLANETS.find((p) => p.id === 'earth')!;
    setSelectedPlanet(earthData);

    if (!sceneContextRef.current) return;
    const earthItem = sceneContextRef.current.planetMeshes.find((m) => m.planet.id === 'earth');
    if (!earthItem) return;

    sceneContextRef.current.targetedMesh = earthItem.body;
    // Zoom close to Earth surface
    sceneContextRef.current.spherical.radius = 2.8;

    // Check Day or Night status
    if (sceneContextRef.current.earthMesh) {
      const earthWorldPos = new THREE.Vector3();
      sceneContextRef.current.earthMesh.getWorldPosition(earthWorldPos);
      const sunDir = new THREE.Vector3(0, 0, 0).sub(earthWorldPos).normalize();
      const isNight = computeDayNightAtCoords(country.lat, country.lng, sunDir);
      setIsNightAtTarget(isNight);
    }
  };

  // GPS Locate My Current Location on Real Earth
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
          const earthData = SOLAR_PLANETS.find((p) => p.id === 'earth')!;
          const posVec = latLngToVector3(latitude, longitude, earthData.sizeRadius + 0.035);
          sceneContextRef.current.userPinMesh.position.copy(posVec);

          // Fly close to Earth and focus user
          handleSelectPlanet(earthData);
          sceneContextRef.current.spherical.radius = 2.6;

          // Check Day/Night status
          const earthWorldPos = new THREE.Vector3();
          sceneContextRef.current.earthMesh.getWorldPosition(earthWorldPos);
          const sunDir = new THREE.Vector3(0, 0, 0).sub(earthWorldPos).normalize();
          const isNight = computeDayNightAtCoords(latitude, longitude, sunDir);
          setIsNightAtTarget(isNight);
        }
      },
      (err) => {
        setLocatingStatus(`GPS fallback: Using Cambodia coordinates (${err.message})`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Filter countries for search
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return WORLD_COUNTRIES;
    const q = countrySearch.toLowerCase();
    return WORLD_COUNTRIES.filter(
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
                REAL SOLAR OS
              </span>
            </div>
            <div className="text-[10px] text-space-400">TRUE DAY/NIGHT EARTH & SOLAR SIMULATION</div>
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

          {[1, 5, 20].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                simSpeed === spd ? 'bg-aeroblue text-space-950 font-bold' : 'text-space-400 hover:text-white'
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

          {SOLAR_PLANETS.map((planet) => {
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

      {/* Floating Day/Night Real-Time Status HUD (When Earth is Focused) */}
      {isEarthFocused && (
        <div className="absolute top-20 left-4 z-20 pointer-events-none max-w-xs">
          <div className="bg-space-950/85 backdrop-blur-md p-3.5 rounded-lg border border-space-700/80 space-y-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-aerogreen animate-pulse" />
              <span className="text-white font-bold text-xs uppercase">
                REAL DAY & NIGHT TERMINATOR
              </span>
            </div>
            <p className="text-[11px] text-space-300 leading-relaxed">
              Half of Earth is bathed in real daylight (Blue Marble), while the night side reveals glowing golden city
              lights (NASA Black Marble).
            </p>
            <div className="p-2 bg-space-900 rounded border border-space-800 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-space-400">FOCUS TARGET:</span>
                <span className="text-white font-bold">{selectedCountry.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">SOLAR STATE:</span>
                <span className={isNightAtTarget ? 'text-aeroamber-light font-bold' : 'text-aerogreen font-bold'}>
                  {isNightAtTarget ? 'NIGHTTIME (CITY LIGHTS)' : 'DAYTIME (SUNLIT)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer: Detailed Planet & Country Telemetry (Like Google Maps) */}
      {selectedPlanet && (
        <div className="absolute top-20 right-4 bottom-20 w-full max-w-md z-30 flex flex-col pointer-events-auto">
          <div className="hud-panel p-5 rounded-xl border border-space-700/80 bg-space-900/95 backdrop-blur-xl shadow-2xl flex-1 flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="border-b border-space-800 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-aeroblue/15 text-aeroblue border border-aeroblue/30 font-bold uppercase">
                  {selectedPlanet.type}
                </span>
                <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">{selectedPlanet.name}</h2>
                <div className="text-[11px] text-space-400">
                  {selectedPlanet.distanceAU} AU from Sun &bull; {selectedPlanet.moons} Moons
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
              <p className="text-space-200 leading-relaxed text-xs">
                {selectedPlanet.summary}
              </p>

              {/* Physical Parameters */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">DIAMETER</span>
                  <span className="text-white font-bold">{selectedPlanet.diameterKm.toLocaleString()} km</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">YEAR (ORBIT)</span>
                  <span className="text-white font-bold">{selectedPlanet.yearLength}</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">DAY (ROTATION)</span>
                  <span className="text-white font-bold">{selectedPlanet.dayLength}</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">GRAVITY</span>
                  <span className="text-aeroblue-light font-bold">{selectedPlanet.surfaceGravity}</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800 col-span-2">
                  <span className="text-space-500 block text-[10px]">MEAN SURFACE TEMPERATURE</span>
                  <span className="text-aeroamber-light font-bold">{selectedPlanet.meanTempC}</span>
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
                  <div className="p-3 bg-space-900 rounded border border-space-800 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{selectedCountry.name}</span>
                      <span className="text-[10px] text-aeroblue">{selectedCountry.timezone}</span>
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
