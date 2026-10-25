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
  Maximize2,
  Navigation,
  Crosshair,
  MapPin,
  Layers,
  Info,
  Radio,
  Eye,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface PlanetInfo {
  id: string;
  name: string;
  type: string;
  sizeRatio: number; // 3D sphere radius
  orbitDistance: number; // 3D units from Sun
  orbitPeriodSpeed: number; // Animation speed factor
  rotationSpeed: number;
  colorHex: string;
  diameterKm: number;
  distanceFromSunAU: number;
  orbitalPeriodDays: string;
  dayLengthHours: string;
  surfaceGravity: string;
  meanTempC: string;
  moonsCount: number;
  hasRings?: boolean;
  atmosphere: string[];
  scientificSummary: string;
  geologicalHighlights: string[];
}

const PLANETS_DATA: PlanetInfo[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet (Innermost)',
    sizeRatio: 0.38,
    orbitDistance: 8,
    orbitPeriodSpeed: 0.04,
    rotationSpeed: 0.004,
    colorHex: '#9ca3af',
    diameterKm: 4879,
    distanceFromSunAU: 0.39,
    orbitalPeriodDays: '88 Earth Days',
    dayLengthHours: '1,407.6 Hours (58.6 Earth Days)',
    surfaceGravity: '3.7 m/s² (0.38g)',
    meanTempC: '-180°C to +430°C',
    moonsCount: 0,
    atmosphere: ['Trace Exosphere: Oxygen (42%)', 'Sodium (29%)', 'Hydrogen (22%)', 'Helium (6%)'],
    scientificSummary:
      'The smallest planet in the Solar System and closest to the Sun. Contains a massive metallic iron core comprising 75% of its radius and experiences extreme temperature fluctuations.',
    geologicalHighlights: [
      'Caloris Basin: 1,550 km wide impact basin with concentric tectonic rings',
      'Lobate scarps: Enormous thrust faults formed as the core cooled and shrank',
      'Permanently shadowed polar craters harboring deposits of water ice',
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet (Runaway Greenhouse)',
    sizeRatio: 0.95,
    orbitDistance: 13,
    orbitPeriodSpeed: 0.016,
    rotationSpeed: -0.002, // Retrograde spin
    colorHex: '#f59e0b',
    diameterKm: 12104,
    distanceFromSunAU: 0.72,
    orbitalPeriodDays: '224.7 Earth Days',
    dayLengthHours: '5,832 Hours (243 Earth Days, Retrograde)',
    surfaceGravity: '8.87 m/s² (0.91g)',
    meanTempC: '+464°C (Melt Lead)',
    moonsCount: 0,
    atmosphere: ['Carbon Dioxide (96.5%)', 'Nitrogen (3.5%)', 'Sulfuric Acid Clouds'],
    scientificSummary:
      'Earth’s twin in size and mass, but enveloped in dense carbon dioxide with crushing surface pressure exceeding 92 bars. Rotates backwards (clockwise) on its axis.',
    geologicalHighlights: [
      'Maxwell Montes: High-altitude mountain peak reaching 11 km above datum',
      'Extensive volcanic plains covering over 80% of the surface with basaltic lava',
      'Corona structures formed by mantle plumes fracturing the lithosphere',
    ],
  },
  {
    id: 'earth',
    name: 'Earth (Terra)',
    type: 'Terrestrial Ocean Planet (Biosphere)',
    sizeRatio: 1.0,
    orbitDistance: 19,
    orbitPeriodSpeed: 0.01,
    rotationSpeed: 0.015,
    colorHex: '#38bdf8',
    diameterKm: 12742,
    distanceFromSunAU: 1.0,
    orbitalPeriodDays: '365.25 Days',
    dayLengthHours: '23.93 Hours',
    surfaceGravity: '9.807 m/s² (1.0g)',
    meanTempC: '+15°C',
    moonsCount: 1, // Luna
    atmosphere: ['Nitrogen (78.08%)', 'Oxygen (20.95%)', 'Argon (0.93%)', 'Carbon Dioxide (0.04%)'],
    scientificSummary:
      'The vibrant home of humanity and the only known world in the universe confirmed to harbor life. Maintains active plate tectonics, liquid water oceans, and a protective magnetic shield.',
    geologicalHighlights: [
      'Dynamic lithospheric plates cycling crust between ocean trenches and mountain belts',
      'Hydrosphere with 1.38 billion cubic kilometers of liquid surface water',
      'Tidally locked Moon (Luna) stabilizing the 23.4° axial tilt for stable climate cycles',
    ],
  },
  {
    id: 'mars',
    name: 'Mars (The Red Planet)',
    type: 'Terrestrial Desert Planet',
    sizeRatio: 0.53,
    orbitDistance: 26,
    orbitPeriodSpeed: 0.0053,
    rotationSpeed: 0.014,
    colorHex: '#ef4444',
    diameterKm: 6779,
    distanceFromSunAU: 1.52,
    orbitalPeriodDays: '687 Earth Days (1.88 Years)',
    dayLengthHours: '24.62 Hours (1 Sol)',
    surfaceGravity: '3.72 m/s² (0.38g)',
    meanTempC: '-65°C (-125°C to +20°C)',
    moonsCount: 2, // Phobos & Deimos
    atmosphere: ['Carbon Dioxide (95.3%)', 'Nitrogen (2.6%)', 'Argon (1.9%)', 'Water Vapor Trace'],
    scientificSummary:
      'The primary target for human interplanetary colonization. Covered in oxidized iron regolith, featuring ancient river deltas, dry lake beds, and colossal shield volcanoes.',
    geologicalHighlights: [
      'Olympus Mons: Largest shield volcano in the Solar System, rising 21.9 km high',
      'Valles Marineris: Grand canyon system spanning over 4,000 km across the equatorial belt',
      'Jezero Crater: Ancient river delta explored by the Perseverance Rover searching for biosignatures',
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter (King of Planets)',
    type: 'Gas Giant (Jovian)',
    sizeRatio: 2.2,
    orbitDistance: 37,
    orbitPeriodSpeed: 0.002,
    rotationSpeed: 0.035, // Fast 10-hour spin
    colorHex: '#d97706',
    diameterKm: 139820,
    distanceFromSunAU: 5.2,
    orbitalPeriodDays: '11.86 Earth Years',
    dayLengthHours: '9.93 Hours',
    surfaceGravity: '24.79 m/s² (2.53g at 1-bar)',
    meanTempC: '-110°C (Cloud Tops)',
    moonsCount: 95, // Io, Europa, Ganymede, Callisto...
    atmosphere: ['Hydrogen (89.8%)', 'Helium (10.2%)', 'Methane, Ammonia, Water Ice'],
    scientificSummary:
      'Containing 2.5 times the mass of all other planets combined. Boasts a massive magnetosphere, liquid metallic hydrogen interior, and ocean moons (Europa, Ganymede) with high astrobiological interest.',
    geologicalHighlights: [
      'Great Red Spot: Anticyclonic storm persisting for hundreds of years, larger than Earth',
      'Europa: Global subsurface saltwater ocean harboring twice as much water as all of Earth',
      'Io: The most volcanically active body in the Solar System with sulfur plumes reaching 500 km',
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn (Ringed World)',
    type: 'Gas Giant with Planetary Rings',
    sizeRatio: 1.85,
    orbitDistance: 48,
    orbitPeriodSpeed: 0.001,
    rotationSpeed: 0.03,
    colorHex: '#fcd34d',
    diameterKm: 116460,
    distanceFromSunAU: 9.58,
    orbitalPeriodDays: '29.45 Earth Years',
    dayLengthHours: '10.7 Hours',
    surfaceGravity: '10.44 m/s² (1.06g at 1-bar)',
    meanTempC: '-140°C',
    moonsCount: 146, // Titan, Enceladus, Mimas...
    hasRings: true,
    atmosphere: ['Hydrogen (96.3%)', 'Helium (3.25%)', 'Methane & Ammonia'],
    scientificSummary:
      'Celebrated for its majestic ring system made of billions of pure water-ice boulders. Possesses the lowest density of any planet (0.687 g/cm³)—it would float in an enormous cosmic bathtub.',
    geologicalHighlights: [
      'Ring system spanning 282,000 km across, with an average thickness of only 10 meters',
      'Enceladus: Cryovolcanic plumes venting warm ocean water and organic molecules into space',
      'Titan: Dense nitrogen atmosphere with liquid methane rivers, lakes, and dunes',
    ],
  },
  {
    id: 'uranus',
    name: 'Uranus (Ice Giant)',
    type: 'Ice Giant (Tilted Axis)',
    sizeRatio: 1.3,
    orbitDistance: 59,
    orbitPeriodSpeed: 0.0006,
    rotationSpeed: -0.018, // 98-degree tilt
    colorHex: '#38bdf8',
    diameterKm: 50724,
    distanceFromSunAU: 19.2,
    orbitalPeriodDays: '84 Earth Years',
    dayLengthHours: '17.24 Hours (Retrograde)',
    surfaceGravity: '8.69 m/s² (0.89g)',
    meanTempC: '-195°C',
    moonsCount: 28,
    atmosphere: ['Hydrogen (82.5%)', 'Helium (15.2%)', 'Methane (2.3% giving cyan color)'],
    scientificSummary:
      'An ice giant tipped on its side with an axial tilt of 97.8°, causing 42 years of continuous sunlight followed by 42 years of darkness at its poles. Coldest planetary atmosphere in the Solar System.',
    geologicalHighlights: [
      'Rotates almost completely on its side, rolling around the Sun like a cosmic bowling ball',
      'Mantle of supercritical water, ammonia, and methane ices over a small rocky core',
      'Miranda: Moon with 20 km high sheer tectonic cliffs (Verona Rupes)',
    ],
  },
  {
    id: 'neptune',
    name: 'Neptune (Deep Ocean World)',
    type: 'Ice Giant (Outermost Planet)',
    sizeRatio: 1.25,
    orbitDistance: 68,
    orbitPeriodSpeed: 0.0004,
    rotationSpeed: 0.02,
    colorHex: '#2563eb',
    diameterKm: 49244,
    distanceFromSunAU: 30.05,
    orbitalPeriodDays: '164.8 Earth Years',
    dayLengthHours: '16.11 Hours',
    surfaceGravity: '11.15 m/s² (1.14g)',
    meanTempC: '-200°C',
    moonsCount: 16,
    atmosphere: ['Hydrogen (80%)', 'Helium (19%)', 'Methane (1.5%)'],
    scientificSummary:
      'The windiest world in the Solar System, with supersonic storm winds clocking over 2,100 km/h. First planet discovered through mathematical predictions by Le Verrier before direct visual telescope confirmation.',
    geologicalHighlights: [
      'Supersonic storm systems driven by internal heat radiation from its deep mantle',
      'Triton: Retrograde captured Kuiper Belt moon with active nitrogen ice geysers',
      'Faint ring arcs kept stable by gravitational resonances with shepherd moons',
    ],
  },
];

const EARTH_REGIONS = [
  { name: 'Cambodia (Phnom Penh & Angkor)', lat: 12.5657, lng: 104.991, agency: 'MPTC Space Tech & Remote Sensing' },
  { name: 'USA (Kennedy Space Center)', lat: 28.5729, lng: -80.649, agency: 'NASA & US Space Force' },
  { name: 'France (Guiana Spaceport, Kourou)', lat: 5.239, lng: -52.768, agency: 'CNES & European Space Agency' },
  { name: 'Japan (Tanegashima Space Center)', lat: 30.399, lng: 130.975, agency: 'JAXA Space Exploration' },
  { name: 'India (Satish Dhawan Sriharikota)', lat: 13.72, lng: 80.23, agency: 'ISRO Launch Complex' },
  { name: 'Singapore (Aerospace Innovation Hub)', lat: 1.3521, lng: 103.8198, agency: 'OSTIn Singapore' },
  { name: 'New Zealand (Mahia LC-1)', lat: -39.26, lng: 177.86, agency: 'Rocket Lab Launch Site' },
  { name: 'Germany (GSOC Space Operations)', lat: 48.08, lng: 11.28, agency: 'DLR German Aerospace' },
];

export default function SolarSystemInteractiveGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState(EARTH_REGIONS[0]);
  const [locatingStatus, setLocatingStatus] = useState<string>('Ready to locate your coordinates on Earth');

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    sunMesh: THREE.Mesh;
    coronaMesh: THREE.Mesh;
    planetMeshes: {
      planet: PlanetInfo;
      pivot: THREE.Group;
      body: THREE.Mesh;
      clouds?: THREE.Mesh;
      moonPivot?: THREE.Group;
      moonBody?: THREE.Mesh;
      orbitLine: THREE.Line;
      angle: number;
    }[];
    earthPinMesh: THREE.Group | null;
    cameraTargetPos: THREE.Vector3;
    cameraLookAt: THREE.Vector3;
    isDragging: boolean;
    prevMouseX: number;
    prevMouseY: number;
    sphericalCoords: { radius: number; theta: number; phi: number };
    targetedMesh: THREE.Object3D | null;
  } | null>(null);

  // Procedural Texture Generators
  const generatePlanetTexture = (planetId: string, colorHex: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    if (planetId === 'earth') {
      // Deep Blue Oceans
      ctx.fillStyle = '#061633';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Continent silhouettes
      ctx.fillStyle = '#1e3a24';
      ctx.strokeStyle = '#2d5a37';
      ctx.lineWidth = 3;

      const drawLand = (x: number, y: number, w: number, h: number, pts: [number, number][]) => {
        ctx.beginPath();
        pts.forEach(([px, py], i) => {
          if (i === 0) ctx.moveTo(x + px * w, y + py * h);
          else ctx.lineTo(x + px * w, y + py * h);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };

      // Continents
      drawLand(100, 80, 240, 180, [[0.2, 0.1], [0.8, 0.15], [0.7, 0.7], [0.4, 0.9], [0.1, 0.5]]);
      drawLand(240, 260, 160, 200, [[0.3, 0.1], [0.9, 0.3], [0.6, 0.95], [0.2, 0.6]]);
      drawLand(450, 60, 480, 220, [[0.1, 0.4], [0.3, 0.1], [0.8, 0.1], [0.95, 0.5], [0.7, 0.8], [0.2, 0.7]]);
      drawLand(480, 200, 200, 220, [[0.2, 0.1], [0.8, 0.1], [0.9, 0.6], [0.4, 0.95], [0.1, 0.4]]);
      drawLand(780, 300, 160, 130, [[0.2, 0.2], [0.8, 0.1], [0.9, 0.7], [0.3, 0.9]]);

      // Lat/Long Grids
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      for (let y = 0; y <= canvas.height; y += canvas.height / 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // City lights
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 150; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      }
    } else if (planetId === 'sun') {
      // Radiant Solar Surface
      const grad = ctx.createRadialGradient(512, 256, 50, 512, 256, 512);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#fde047');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(0.8, '#d97706');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Solar granules
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 400; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 8 + 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (planetId === 'jupiter' || planetId === 'saturn') {
      // Gas Giant Atmospheric Bands
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(0.2, '#d97706');
      grad.addColorStop(0.35, '#fef3c7');
      grad.addColorStop(0.5, '#b45309');
      grad.addColorStop(0.65, '#fde68a');
      grad.addColorStop(0.8, '#92400e');
      grad.addColorStop(1, '#451a03');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Horizontal storm ribbons
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 4;
      for (let y = 30; y < canvas.height; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin(y) * 10);
        ctx.lineTo(canvas.width, y + Math.cos(y) * 10);
        ctx.stroke();
      }

      // Great Red Spot for Jupiter
      if (planetId === 'jupiter') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(680, 310, 60, 35, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (planetId === 'mars') {
      // Rust red Martian desert
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#7f1d1d';
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 30 + 10, 0, Math.PI * 2);
        ctx.fill();
      }
      // White Polar Ice Caps
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, 30);
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    } else {
      // General planet shading
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let i = 0; i < 80; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 25, Math.random() * 25);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  };

  // Convert GPS (lat, lng) to 3D Cartesian coordinates on Earth sphere
  const latLngToEarthVector = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Initialize Three.js Full-Screen Space Engine
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 4000);
    camera.position.set(0, 35, 75);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Deep Space Starfield & Galaxy Dust
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3500;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 1600;
      starPos[i + 1] = (Math.random() - 0.5) * 1600;
      starPos[i + 2] = (Math.random() - 0.5) * 1600;

      const cType = Math.random();
      if (cType > 0.8) {
        // Cyan / Blue Giants
        starColors[i] = 0.4; starColors[i + 1] = 0.8; starColors[i + 2] = 1.0;
      } else if (cType > 0.6) {
        // Amber / Yellow Stars
        starColors[i] = 1.0; starColors[i + 1] = 0.8; starColors[i + 2] = 0.4;
      } else {
        // Pure White Stars
        starColors[i] = 0.9; starColors[i + 1] = 0.95; starColors[i + 2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.4, vertexColors: true, transparent: true, opacity: 0.9 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Ambient Space Light
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambientLight);

    // The Sun Point Light (illuminates all planets from center)
    const sunLight = new THREE.PointLight(0xfffbeb, 3.5, 400, 0.4);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 1. Center Glowing Sun Mesh
    const sunGeo = new THREE.SphereGeometry(3.6, 64, 64);
    const sunTex = generatePlanetTexture('sun', '#f59e0b');
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Corona Outer Glow Shell
    const coronaGeo = new THREE.SphereGeometry(4.2, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // 2. Planets Setup along Orbits
    const planetMeshes: any[] = [];
    let earthPinGroup: THREE.Group | null = null;

    PLANETS_DATA.forEach((planet) => {
      // Orbit Pivot Group
      const pivot = new THREE.Group();
      scene.add(pivot);

      // Orbit Line Ring
      const orbitCurve = new THREE.EllipseCurve(0, 0, planet.orbitDistance, planet.orbitDistance, 0, 2 * Math.PI, false, 0);
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

      // Planet Sphere Body
      const bodyGeo = new THREE.SphereGeometry(planet.sizeRatio, 48, 48);
      const bodyTex = generatePlanetTexture(planet.id, planet.colorHex);
      const bodyMat = new THREE.MeshStandardMaterial({
        map: bodyTex,
        roughness: 0.7,
        metalness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(planet.orbitDistance, 0, 0);
      pivot.add(body);

      let clouds: THREE.Mesh | undefined;
      let moonPivot: THREE.Group | undefined;
      let moonBody: THREE.Mesh | undefined;

      // Earth Special: Moon & Atmosphere Glow
      if (planet.id === 'earth') {
        // Cloud sphere
        const cloudGeo = new THREE.SphereGeometry(planet.sizeRatio + 0.03, 32, 32);
        const cloudMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
        });
        clouds = new THREE.Mesh(cloudGeo, cloudMat);
        body.add(clouds);

        // Orbiting Moon
        moonPivot = new THREE.Group();
        body.add(moonPivot);

        const moonGeo = new THREE.SphereGeometry(0.24, 24, 24);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9 });
        moonBody = new THREE.Mesh(moonGeo, moonMat);
        moonBody.position.set(1.9, 0, 0);
        moonPivot.add(moonBody);

        // Pin Beacon on Earth for Country & GPS Location
        earthPinGroup = new THREE.Group();
        const pinDot = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        const pinRadar = new THREE.Mesh(
          new THREE.RingGeometry(0.05, 0.1, 24),
          new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
        );
        pinRadar.rotation.x = Math.PI / 2;
        earthPinGroup.add(pinDot);
        earthPinGroup.add(pinRadar);
        body.add(earthPinGroup);

        // Default position on Cambodia
        const initPos = latLngToEarthVector(EARTH_REGIONS[0].lat, EARTH_REGIONS[0].lng, planet.sizeRatio + 0.04);
        earthPinGroup.position.copy(initPos);
      }

      // Saturn Special: Majestic Planetary Rings
      if (planet.hasRings) {
        const ringGeo = new THREE.RingGeometry(planet.sizeRatio * 1.3, planet.sizeRatio * 2.4, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
          roughness: 0.6,
        });
        const rings = new THREE.Mesh(ringGeo, ringMat);
        rings.rotation.x = Math.PI / 2 + 0.4;
        body.add(rings);
      }

      planetMeshes.push({
        planet,
        pivot,
        body,
        clouds,
        moonPivot,
        moonBody,
        orbitLine,
        angle: Math.random() * Math.PI * 2,
      });
    });

    sceneRef.current = {
      scene,
      camera,
      renderer,
      sunMesh,
      coronaMesh,
      planetMeshes,
      earthPinMesh: earthPinGroup,
      cameraTargetPos: new THREE.Vector3(0, 35, 75),
      cameraLookAt: new THREE.Vector3(0, 0, 0),
      isDragging: false,
      prevMouseX: 0,
      prevMouseY: 0,
      sphericalCoords: { radius: 80, theta: 0.4, phi: 1.1 },
      targetedMesh: null,
    };

    // Mouse Drag Rotation
    const onMouseDown = (e: MouseEvent) => {
      if (!sceneRef.current) return;
      sceneRef.current.isDragging = true;
      sceneRef.current.prevMouseX = e.clientX;
      sceneRef.current.prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current || !sceneRef.current.isDragging) return;
      const dx = e.clientX - sceneRef.current.prevMouseX;
      const dy = e.clientY - sceneRef.current.prevMouseY;

      sceneRef.current.sphericalCoords.theta -= dx * 0.006;
      sceneRef.current.sphericalCoords.phi = THREE.MathUtils.clamp(
        sceneRef.current.sphericalCoords.phi - dy * 0.006,
        0.1,
        Math.PI - 0.1
      );

      sceneRef.current.prevMouseX = e.clientX;
      sceneRef.current.prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      if (!sceneRef.current) return;
      sceneRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!sceneRef.current) return;
      const delta = e.deltaY * 0.06;
      sceneRef.current.sphericalCoords.radius = THREE.MathUtils.clamp(
        sceneRef.current.sphericalCoords.radius + delta,
        4.5,
        220
      );
    };

    // Click Detection on 3D Planets (Raycasting)
    const onCanvasClick = (e: MouseEvent) => {
      if (!sceneRef.current || !container) return;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
        -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, sceneRef.current.camera);

      // Check click on Sun
      const sunIntersects = raycaster.intersectObject(sceneRef.current.sunMesh);
      if (sunIntersects.length > 0) {
        setSelectedPlanet(null);
        sceneRef.current.targetedMesh = sceneRef.current.sunMesh;
        sceneRef.current.sphericalCoords.radius = 16;
        return;
      }

      // Check click on each Planet body
      for (const item of sceneRef.current.planetMeshes) {
        const intersects = raycaster.intersectObject(item.body);
        if (intersects.length > 0) {
          setSelectedPlanet(item.planet);
          sceneRef.current.targetedMesh = item.body;
          sceneRef.current.sphericalCoords.radius = item.planet.sizeRatio * 5.2 + 2;
          return;
        }
      }
    };

    const onResize = () => {
      if (!container || !sceneRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
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

      if (sceneRef.current) {
        const {
          sunMesh,
          coronaMesh,
          planetMeshes,
          camera,
          sphericalCoords,
          targetedMesh,
          earthPinMesh,
        } = sceneRef.current;

        // Rotate Sun
        sunMesh.rotation.y += 0.002;
        const pulse = 1 + Math.sin(clock * 3) * 0.05;
        coronaMesh.scale.set(pulse, pulse, pulse);

        // Animate Planets Orbits and Self-Rotations
        planetMeshes.forEach((item) => {
          if (!isPaused) {
            item.angle += item.planet.orbitPeriodSpeed * 0.25 * simSpeed;
            item.pivot.rotation.y = item.angle;
            item.body.rotation.y += item.planet.rotationSpeed * simSpeed;
          }

          if (item.clouds) {
            item.clouds.rotation.y += 0.003 * simSpeed;
          }
          if (item.moonPivot) {
            item.moonPivot.rotation.y += 0.03 * simSpeed;
          }

          // Toggle Orbit Ring Visibility
          item.orbitLine.visible = showOrbits;
        });

        // Pulse Earth GPS Pin
        if (earthPinMesh) {
          const ring = earthPinMesh.children[1];
          if (ring) {
            const pScale = 1 + Math.sin(clock * 6) * 0.25;
            ring.scale.set(pScale, pScale, 1);
          }
        }

        // Camera Positioning (Free Orbit or Planet Following)
        const targetWorldPos = new THREE.Vector3();
        if (targetedMesh) {
          targetedMesh.getWorldPosition(targetWorldPos);
        } else {
          targetWorldPos.set(0, 0, 0);
        }

        const camX = targetWorldPos.x + sphericalCoords.radius * Math.sin(sphericalCoords.phi) * Math.sin(sphericalCoords.theta);
        const camY = targetWorldPos.y + sphericalCoords.radius * Math.cos(sphericalCoords.phi);
        const camZ = targetWorldPos.z + sphericalCoords.radius * Math.sin(sphericalCoords.phi) * Math.cos(sphericalCoords.theta);

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

  // Focus Camera on a Specific Planet
  const handleSelectPlanet = (planet: PlanetInfo) => {
    setSelectedPlanet(planet);
    if (!sceneRef.current) return;

    const item = sceneRef.current.planetMeshes.find((m) => m.planet.id === planet.id);
    if (item) {
      sceneRef.current.targetedMesh = item.body;
      sceneRef.current.sphericalCoords.radius = planet.sizeRatio * 5.2 + 2;
    }
  };

  // Reset View to Entire Solar System
  const handleResetSystemView = () => {
    setSelectedPlanet(null);
    if (!sceneRef.current) return;
    sceneRef.current.targetedMesh = null;
    sceneRef.current.sphericalCoords.radius = 95;
    sceneRef.current.sphericalCoords.theta = 0.5;
    sceneRef.current.sphericalCoords.phi = 1.1;
  };

  // Focus on Earth and pinpoint country
  const handleSelectEarthRegion = (region: (typeof EARTH_REGIONS)[0]) => {
    setSelectedRegion(region);
    const earthData = PLANETS_DATA.find((p) => p.id === 'earth')!;
    handleSelectPlanet(earthData);

    if (sceneRef.current && sceneRef.current.earthPinMesh) {
      const pos = latLngToEarthVector(region.lat, region.lng, earthData.sizeRatio + 0.04);
      sceneRef.current.earthPinMesh.position.copy(pos);
    }
  };

  // Locate User's Real Location on Earth Globe
  const handleLocateMyPosition = () => {
    if (!navigator.geolocation) {
      setLocatingStatus('Geolocation not supported by browser');
      return;
    }

    setLocatingStatus('Acquiring orbital GPS lock on your coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocatingStatus(`Locked: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);

        const earthData = PLANETS_DATA.find((p) => p.id === 'earth')!;
        handleSelectPlanet(earthData);

        if (sceneRef.current && sceneRef.current.earthPinMesh) {
          const userPos = latLngToEarthVector(latitude, longitude, earthData.sizeRatio + 0.04);
          sceneRef.current.earthPinMesh.position.copy(userPos);
        }
      },
      (err) => {
        setLocatingStatus(`GPS fallback: Using Cambodia default (${err.message})`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-950 select-none font-mono text-xs">
      {/* 3D WebGL Canvas Layer (Full Viewport) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Aerospace Control Bar */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Brand / Logo */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-space-950/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-space-700/80 shadow-lg">
          <div className="w-6 h-6 rounded bg-space-800 border border-space-600 flex items-center justify-center text-aeroblue">
            <Sun className="w-3.5 h-3.5 text-aeroamber" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>AEROVEX</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-aeroblue/15 text-aeroblue rounded border border-aeroblue/30">
                SOLAR OS
              </span>
            </div>
            <div className="text-[10px] text-space-400">INTERACTIVE 3D PLANETARY SYSTEM</div>
          </div>
        </div>

        {/* Orbit Simulation Controls: Play/Pause, Speed, Reset */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-space-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-space-700/80 text-xs shadow-lg">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded hover:bg-space-800 text-space-300 hover:text-white transition-colors"
            title={isPaused ? 'Resume Orbit Animation' : 'Pause Orbit Animation'}
          >
            {isPaused ? <Play className="w-4 h-4 text-aerogreen" /> : <Pause className="w-4 h-4 text-aeroamber" />}
          </button>

          <div className="h-4 w-px bg-space-800 mx-1" />

          {/* Speed Presets */}
          {[1, 5, 20].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                simSpeed === spd
                  ? 'bg-aeroblue text-space-950 font-bold'
                  : 'text-space-400 hover:text-white hover:bg-space-800'
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
            onClick={handleResetSystemView}
            className="p-1.5 rounded hover:bg-space-800 text-space-300 hover:text-white transition-colors ml-1"
            title="Full Solar System View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Bottom Planet Quick Selector (Jump to any planet) */}
      <div className="absolute bottom-5 inset-x-4 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 bg-space-950/90 backdrop-blur-md p-1.5 rounded-xl border border-space-700/80 shadow-2xl overflow-x-auto max-w-full">
          <button
            onClick={handleResetSystemView}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
              selectedPlanet === null
                ? 'bg-aeroamber text-space-950 font-bold shadow-md shadow-aeroamber/20'
                : 'text-space-300 hover:text-white hover:bg-space-850'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-aeroamber" />
            <span>THE SUN</span>
          </button>

          {PLANETS_DATA.map((planet) => {
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

      {/* Side Telemetry Drawer (Opens when any planet is selected or clicked) */}
      {selectedPlanet && (
        <div className="absolute top-20 right-4 bottom-20 w-full max-w-md z-30 flex flex-col pointer-events-auto">
          <div className="hud-panel p-5 rounded-xl border border-space-700/80 bg-space-900/90 backdrop-blur-xl shadow-2xl flex-1 flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="border-b border-space-800 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-aeroblue/15 text-aeroblue border border-aeroblue/30 font-bold uppercase">
                  {selectedPlanet.type}
                </span>
                <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">{selectedPlanet.name}</h2>
                <div className="text-[11px] text-space-400">
                  {selectedPlanet.distanceFromSunAU} AU from Sun &bull; {selectedPlanet.moonsCount} Known Moons
                </div>
              </div>

              <button
                onClick={() => setSelectedPlanet(null)}
                className="p-1.5 rounded text-space-400 hover:text-white hover:bg-space-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Data Body */}
            <div className="overflow-y-auto space-y-4 pr-1 my-3 text-xs">
              {/* Summary */}
              <p className="text-space-200 leading-relaxed text-xs">
                {selectedPlanet.scientificSummary}
              </p>

              {/* Physical Data Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">EQUATORIAL DIAMETER</span>
                  <span className="text-white font-bold">{selectedPlanet.diameterKm.toLocaleString()} km</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">ORBITAL PERIOD (YEAR)</span>
                  <span className="text-white font-bold">{selectedPlanet.orbitalPeriodDays}</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">ROTATION PERIOD (DAY)</span>
                  <span className="text-white font-bold">{selectedPlanet.dayLengthHours}</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800">
                  <span className="text-space-500 block text-[10px]">SURFACE GRAVITY</span>
                  <span className="text-aeroblue-light font-bold">{selectedPlanet.surfaceGravity}</span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-800 col-span-2">
                  <span className="text-space-500 block text-[10px]">MEAN SURFACE TEMPERATURE</span>
                  <span className="text-aeroamber-light font-bold">{selectedPlanet.meanTempC}</span>
                </div>
              </div>

              {/* Special Earth Exploration Mode: Country & Space Agency Deep-Dive */}
              {selectedPlanet.id === 'earth' && (
                <div className="p-3.5 bg-space-950/90 rounded-lg border border-aeroblue/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase">
                      <Globe className="w-3.5 h-3.5 text-aeroblue" />
                      <span>TERRESTRIAL COUNTRY & GPS EXPLORER</span>
                    </div>
                  </div>

                  {/* Locate GPS Button */}
                  <button
                    onClick={handleLocateMyPosition}
                    className="w-full py-2 px-3 rounded bg-aerogreen hover:bg-aerogreen-light text-space-950 font-bold transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>PINPOINT MY GPS POSITION ON GLOBE</span>
                  </button>
                  <div className="text-[10px] text-space-400 text-center">{locatingStatus}</div>

                  {/* Country Quick Selector */}
                  <div className="space-y-1.5 pt-1 border-t border-space-850">
                    <span className="text-[10px] text-space-400 font-bold uppercase block">
                      FOCUS COUNTRY / SPACEPORT:
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                      {EARTH_REGIONS.map((region) => (
                        <div
                          key={region.name}
                          onClick={() => handleSelectEarthRegion(region)}
                          className={`p-2 rounded cursor-pointer transition-colors flex items-center justify-between text-[11px] ${
                            selectedRegion.name === region.name
                              ? 'bg-space-800 text-aeroblue-light border border-aeroblue/50 font-bold'
                              : 'bg-space-900/60 text-space-300 hover:text-white'
                          }`}
                        >
                          <span>{region.name}</span>
                          <span className="text-[10px] text-space-500">{region.lat}° N</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-space-900 rounded border border-space-800 text-[11px]">
                    <span className="text-space-500 block text-[10px]">SELECTED SPACE ENTITY:</span>
                    <span className="text-white font-semibold">{selectedRegion.agency}</span>
                  </div>
                </div>
              )}

              {/* Geological Highlights */}
              <div className="space-y-2 pt-1 border-t border-space-800">
                <span className="text-[10px] text-aeroamber font-bold uppercase tracking-wider block">
                  GEOLOGICAL & SURFACE HIGHLIGHTS
                </span>
                <ul className="space-y-1.5 text-space-300 text-xs">
                  {selectedPlanet.geologicalHighlights.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-aeroamber mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Atmosphere List */}
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

            {/* Drawer Footer Actions */}
            <div className="pt-3 border-t border-space-800 flex items-center gap-2">
              <button
                onClick={handleResetSystemView}
                className="w-full py-2 bg-space-800 hover:bg-space-700 text-white rounded font-bold transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RETURN TO SOLAR SYSTEM ORBITS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Left Telemetry HUD HUD Overlay (Always Visible When No Planet Focused) */}
      {!selectedPlanet && (
        <div className="absolute top-20 left-4 z-20 pointer-events-none hidden sm:block">
          <div className="bg-space-950/80 backdrop-blur-md p-3.5 rounded-lg border border-space-700/80 text-xs space-y-1 shadow-lg max-w-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-aerogreen animate-pulse" />
              <span className="text-white font-bold text-xs uppercase">REAL-TIME SOLAR SYSTEM ENGINE</span>
            </div>
            <p className="text-space-400 text-[11px] leading-relaxed">
              Click and drag to freely orbit the camera in 3D. Scroll to zoom. Click directly on any planet or the Sun to
              inspect its astrophysical data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
