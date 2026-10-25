'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Globe,
  MapPin,
  Crosshair,
  Satellite,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Radio,
  Search,
  Eye,
  RotateCcw,
  Navigation,
  Info,
} from 'lucide-react';

export type ViewScale = 'GALAXY' | 'SOLAR_SYSTEM' | 'ORBITAL' | 'SURFACE';

interface CountryData {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  spaceAgency: string;
  satellitesInOrbit: number;
  majorSpaceport: string;
  description: string;
}

interface SatelliteTrack {
  id: string;
  name: string;
  noradId: number;
  type: string;
  altitudeKm: number;
  speedKmH: number;
  inclinationDeg: number;
  orbitRadius: number; // 3D units
  orbitSpeed: number;
  angle: number;
  orbitMesh?: THREE.Line;
  satMesh?: THREE.Group;
  color: number;
}

const WORLD_COUNTRIES: CountryData[] = [
  {
    id: 'kh',
    name: 'Cambodia',
    code: 'KHM',
    lat: 12.5657,
    lng: 104.991,
    spaceAgency: 'MPTC Space Tech & Satellite Comm Unit',
    satellitesInOrbit: 2,
    majorSpaceport: 'Techo Telemetry & Earth Station',
    description: 'Expanding Earth observation, disaster mitigation telemetry, and regional satellite data networks.',
  },
  {
    id: 'us',
    name: 'United States',
    code: 'USA',
    lat: 37.0902,
    lng: -95.7129,
    spaceAgency: 'NASA & US Space Force',
    satellitesInOrbit: 3200,
    majorSpaceport: 'Kennedy Space Center / Cape Canaveral SLC-40',
    description: 'Major space exploration hub for Artemis lunar program, commercial rideshares, and deep space astronomy.',
  },
  {
    id: 'fr',
    name: 'France / European Union',
    code: 'FRA',
    lat: 46.2276,
    lng: 2.2137,
    spaceAgency: 'CNES & European Space Agency (ESA)',
    satellitesInOrbit: 680,
    majorSpaceport: 'Guiana Space Centre (CSG Kourou, ELA-4)',
    description: 'Primary launch site for Ariane 6 and Vega-C, leading Copernicus Earth observation satellite constellation.',
  },
  {
    id: 'jp',
    name: 'Japan',
    code: 'JPN',
    lat: 36.2048,
    lng: 138.2529,
    spaceAgency: 'JAXA (Japan Aerospace Exploration Agency)',
    satellitesInOrbit: 210,
    majorSpaceport: 'Tanegashima Space Center (Yoshinobu Launch Complex)',
    description: 'Pioneering Hayabusa asteroid sample returns, H3 heavy-lift launch vehicles, and precision optical sensors.',
  },
  {
    id: 'in',
    name: 'India',
    code: 'IND',
    lat: 20.5937,
    lng: 78.9629,
    spaceAgency: 'ISRO (Indian Space Research Organisation)',
    satellitesInOrbit: 140,
    majorSpaceport: 'Satish Dhawan Space Centre (SDSC SHAR)',
    description: 'Renowned for Chandrayaan lunar polar exploration, Aditya solar observatory, and cost-effective PSLV launches.',
  },
  {
    id: 'de',
    name: 'Germany',
    code: 'DEU',
    lat: 51.1657,
    lng: 10.4515,
    spaceAgency: 'DLR (German Aerospace Center)',
    satellitesInOrbit: 95,
    majorSpaceport: 'German Space Operations Center (GSOC Oberpfaffenhofen)',
    description: 'Key European contributor to radar Earth remote sensing (TerraSAR-X) and optical laser communications.',
  },
  {
    id: 'sg',
    name: 'Singapore',
    code: 'SGP',
    lat: 1.3521,
    lng: 103.8198,
    spaceAgency: 'OSTIn (Office for Space Technology & Industry)',
    satellitesInOrbit: 24,
    majorSpaceport: 'CRISP Center for Remote Imaging & Sensing',
    description: 'Southeast Asian NewSpace tech hub specializing in synthetic aperture radar (SAR) and equatorial Smallsats.',
  },
  {
    id: 'nz',
    name: 'New Zealand',
    code: 'NZL',
    lat: -40.9006,
    lng: 174.886,
    spaceAgency: 'New Zealand Space Agency',
    satellitesInOrbit: 85,
    majorSpaceport: 'Rocket Lab Launch Complex 1 (Mahia Peninsula)',
    description: 'Premier commercial orbital launch complex for high-frequency dedicated SmallSat and rideshare deployments.',
  },
  {
    id: 'ae',
    name: 'United Arab Emirates',
    code: 'ARE',
    lat: 23.4241,
    lng: 53.8478,
    spaceAgency: 'UAESA & Mohammed Bin Rashid Space Centre',
    satellitesInOrbit: 22,
    majorSpaceport: 'MBRSC Ground Telemetry & Control Complex',
    description: 'Operators of the Hope Mars Probe (Emirates Mars Mission) and lunar rover exploration projects.',
  },
  {
    id: 'au',
    name: 'Australia',
    code: 'AUS',
    lat: -25.2744,
    lng: 133.7751,
    spaceAgency: 'Australian Space Agency (ASA)',
    satellitesInOrbit: 45,
    majorSpaceport: 'Whalers Way Orbital Launch Complex',
    description: 'Strategic Southern Hemisphere deep space communications network and emerging launch corridors.',
  },
];

const INITIAL_SATELLITES: SatelliteTrack[] = [
  {
    id: 'sat-iss',
    name: 'International Space Station (ISS)',
    noradId: 25544,
    type: 'Crewed Orbital Habitat',
    altitudeKm: 418,
    speedKmH: 27600,
    inclinationDeg: 51.6,
    orbitRadius: 3.8,
    orbitSpeed: 0.007,
    angle: 0.4,
    color: 0x38bdf8,
  },
  {
    id: 'sat-landsat9',
    name: 'Landsat-9 Earth Observation',
    noradId: 49260,
    type: 'Multispectral Land Imaging',
    altitudeKm: 705,
    speedKmH: 26800,
    inclinationDeg: 98.2,
    orbitRadius: 4.4,
    orbitSpeed: 0.005,
    angle: 1.8,
    color: 0x10b981,
  },
  {
    id: 'sat-starlink-g7',
    name: 'Starlink Constellation Unit 4182',
    noradId: 54122,
    type: 'Broadband Mega-Constellation',
    altitudeKm: 550,
    speedKmH: 27300,
    inclinationDeg: 53.2,
    orbitRadius: 4.1,
    orbitSpeed: 0.0062,
    angle: 3.2,
    color: 0x0ea5e9,
  },
  {
    id: 'sat-sentinel2a',
    name: 'Sentinel-2A Copernicus Payload',
    noradId: 40697,
    type: 'European High-Res Environmental',
    altitudeKm: 786,
    speedKmH: 26500,
    inclinationDeg: 98.5,
    orbitRadius: 4.6,
    orbitSpeed: 0.0045,
    angle: 4.5,
    color: 0xf59e0b,
  },
  {
    id: 'sat-hubble',
    name: 'Hubble Space Telescope',
    noradId: 20580,
    type: 'Deep Space Optical Observatory',
    altitudeKm: 535,
    speedKmH: 27320,
    inclinationDeg: 28.5,
    orbitRadius: 4.05,
    orbitSpeed: 0.0064,
    angle: 5.6,
    color: 0x818cf8,
  },
];

export default function OrbitalExplorer3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeScale, setActiveScale] = useState<ViewScale>('ORBITAL');
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(WORLD_COUNTRIES[0]);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteTrack | null>(INITIAL_SATELLITES[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracyM: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Ready for coordinate capture');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverheadPasses, setShowOverheadPasses] = useState(true);

  // Scene references
  const sceneContextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    earthGroup: THREE.Group;
    solarGroup: THREE.Group;
    galaxyGroup: THREE.Group;
    earthMesh: THREE.Mesh;
    cloudMesh: THREE.Mesh;
    targetCameraPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    isUserInteracting: boolean;
    prevX: number;
    prevY: number;
    rotX: number;
    rotY: number;
    userPinMesh: THREE.Group | null;
    countryPinMesh: THREE.Group | null;
    satelliteMeshes: { sat: SatelliteTrack; group: THREE.Group; line: THREE.Line }[];
  } | null>(null);

  // Convert GPS (lat, lng) to 3D Cartesian coordinates on sphere of radius R
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Helper to generate a procedural high-res Earth texture on canvas
  const createProceduralEarthTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Deep ocean base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#040d1f');
    oceanGrad.addColorStop(0.5, '#071630');
    oceanGrad.addColorStop(1, '#040d1f');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw continent silhouettes (Stylized vector approximation for high visual fidelity)
    ctx.fillStyle = '#0f2942'; // Dark technical landmass
    ctx.strokeStyle = '#1e486d'; // Technical border
    ctx.lineWidth = 2;

    // Approximate continent clusters
    const drawLandmass = (x: number, y: number, w: number, h: number, points: [number, number][]) => {
      ctx.beginPath();
      points.forEach(([px, py], i) => {
        const cx = x + px * w;
        const cy = y + py * h;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // North America
    drawLandmass(200, 150, 450, 320, [
      [0.2, 0.1], [0.6, 0.05], [0.85, 0.2], [0.8, 0.45], [0.65, 0.55],
      [0.6, 0.8], [0.55, 0.95], [0.45, 0.9], [0.35, 0.65], [0.1, 0.4], [0.05, 0.2]
    ]);
    // South America
    drawLandmass(480, 480, 260, 400, [
      [0.3, 0.05], [0.8, 0.25], [0.95, 0.45], [0.65, 0.75], [0.45, 0.98], [0.25, 0.65], [0.2, 0.3]
    ]);
    // Eurasia
    drawLandmass(850, 120, 950, 380, [
      [0.05, 0.4], [0.15, 0.15], [0.35, 0.05], [0.75, 0.05], [0.95, 0.2],
      [0.85, 0.6], [0.75, 0.75], [0.6, 0.8], [0.45, 0.65], [0.35, 0.7], [0.25, 0.55], [0.1, 0.6]
    ]);
    // Africa
    drawLandmass(880, 350, 380, 420, [
      [0.1, 0.1], [0.75, 0.1], [0.9, 0.35], [0.7, 0.75], [0.45, 0.95], [0.25, 0.65], [0.05, 0.35]
    ]);
    // Australia
    drawLandmass(1550, 540, 320, 240, [
      [0.2, 0.1], [0.7, 0.1], [0.9, 0.45], [0.8, 0.85], [0.4, 0.9], [0.15, 0.65]
    ]);
    // Southeast Asia & Cambodia cluster
    drawLandmass(1400, 380, 180, 160, [
      [0.1, 0.1], [0.6, 0.2], [0.8, 0.6], [0.4, 0.9], [0.2, 0.5]
    ]);

    // Lat/Long Coordinate Grid Lines (Aerospace Telemetry Style)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    // Parallels
    for (let lat = 0; lat <= canvas.height; lat += canvas.height / 12) {
      ctx.beginPath();
      ctx.moveTo(0, lat);
      ctx.lineTo(canvas.width, lat);
      ctx.stroke();
    }
    // Meridians
    for (let lng = 0; lng <= canvas.width; lng += canvas.width / 24) {
      ctx.beginPath();
      ctx.moveTo(lng, 0);
      ctx.lineTo(lng, canvas.height);
      ctx.stroke();
    }

    // City lights / ground stations (bright dots)
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 200; i++) {
      const rx = (Math.random() * canvas.width);
      const ry = (Math.random() * canvas.height * 0.7 + canvas.height * 0.15);
      ctx.fillRect(rx, ry, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  // Generate Cloud Texture
  const createProceduralCloudTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';

    for (let i = 0; i < 90; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
      const rad = Math.random() * 40 + 20;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  };

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040711);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
    camera.position.set(0, 2.5, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Deep Space Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 800;
      starPos[i + 1] = (Math.random() - 0.5) * 800;
      starPos[i + 2] = (Math.random() - 0.5) * 800;
      starColors[i] = 0.6 + Math.random() * 0.4;
      starColors[i + 1] = 0.7 + Math.random() * 0.3;
      starColors[i + 2] = 0.9 + Math.random() * 0.1;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMaterial);
    scene.add(starField);

    // Ambient & Directional Lighting (The Sun)
    const ambientLight = new THREE.AmbientLight(0x1a2942, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(20, 10, 18);
    scene.add(sunLight);

    // 1. Earth Hierarchy Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const earthRadius = 3.0; // 3D units

    // Earth Sphere
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthTexture = createProceduralEarthTexture();
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.15,
      emissive: 0x051329,
      emissiveIntensity: 0.3,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // Atmospheric Glow Shell
    const atmoGeo = new THREE.SphereGeometry(earthRadius + 0.08, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmoMesh);

    // Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.04, 64, 64);
    const cloudTexture = createProceduralCloudTexture();
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);

    // 2. Satellites and Orbits
    const satelliteMeshes: { sat: SatelliteTrack; group: THREE.Group; line: THREE.Line }[] = [];

    INITIAL_SATELLITES.forEach((sat) => {
      // Orbit Ring Line
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        sat.orbitRadius, sat.orbitRadius,
        0, 2 * Math.PI,
        false,
        0
      );
      const points = orbitCurve.getPoints(120);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const lineMat = new THREE.LineBasicMaterial({
        color: sat.color,
        transparent: true,
        opacity: 0.35,
      });
      const orbitLine = new THREE.Line(lineGeo, lineMat);
      orbitLine.rotation.x = (sat.inclinationDeg * Math.PI) / 180;
      orbitLine.rotation.z = (sat.orbitRadius * 0.4);
      earthGroup.add(orbitLine);

      // Satellite 3D Body
      const satGroup = new THREE.Group();
      // Body box
      const bodyMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
      );
      satGroup.add(bodyMesh);
      // Solar wings
      const wingGeo = new THREE.BoxGeometry(0.32, 0.01, 0.1);
      const wingMesh = new THREE.Mesh(
        wingGeo,
        new THREE.MeshStandardMaterial({ color: sat.color, emissive: sat.color, emissiveIntensity: 0.5 })
      );
      satGroup.add(wingMesh);

      // Position satellite on its inclined orbit plane
      const p = new THREE.Vector3(
        Math.cos(sat.angle) * sat.orbitRadius,
        0,
        Math.sin(sat.angle) * sat.orbitRadius
      );
      p.applyAxisAngle(new THREE.Vector3(1, 0, 0), (sat.inclinationDeg * Math.PI) / 180);
      satGroup.position.copy(p);
      earthGroup.add(satGroup);

      satelliteMeshes.push({ sat, group: satGroup, line: orbitLine });
    });

    // 3. User Location Marker Pin
    const userPinGroup = new THREE.Group();
    const pinBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    const pinRing = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.16, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    pinRing.rotation.x = Math.PI / 2;
    userPinGroup.add(pinBeacon);
    userPinGroup.add(pinRing);
    userPinGroup.visible = false;
    earthGroup.add(userPinGroup);

    // 4. Country Target Pin
    const countryPinGroup = new THREE.Group();
    const cBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    const cRing = new THREE.Mesh(
      new THREE.RingGeometry(0.09, 0.15, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    cRing.rotation.x = Math.PI / 2;
    countryPinGroup.add(cBeacon);
    countryPinGroup.add(cRing);
    earthGroup.add(countryPinGroup);

    // Position country pin on default country (Cambodia)
    const initialCountryPos = latLngToVector3(WORLD_COUNTRIES[0].lat, WORLD_COUNTRIES[0].lng, earthRadius + 0.05);
    countryPinGroup.position.copy(initialCountryPos);

    // 5. Solar System & Galaxy representations for zoom scaling
    const solarGroup = new THREE.Group();
    const sunSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    sunSphere.position.set(-28, 0, -20);
    solarGroup.add(sunSphere);
    scene.add(solarGroup);

    const galaxyGroup = new THREE.Group();
    // Nebula / galaxy cloud particles
    const galGeo = new THREE.BufferGeometry();
    const galCount = 800;
    const galPos = new Float32Array(galCount * 3);
    for (let i = 0; i < galCount * 3; i += 3) {
      const r = Math.random() * 80 + 20;
      const th = Math.random() * Math.PI * 2;
      galPos[i] = Math.cos(th) * r;
      galPos[i + 1] = (Math.random() - 0.5) * 15;
      galPos[i + 2] = Math.sin(th) * r - 100;
    }
    galGeo.setAttribute('position', new THREE.BufferAttribute(galPos, 3));
    const galMat = new THREE.PointsMaterial({ color: 0x818cf8, size: 2.5, transparent: true, opacity: 0.4 });
    const galaxyPoints = new THREE.Points(galGeo, galMat);
    galaxyGroup.add(galaxyPoints);
    scene.add(galaxyGroup);

    sceneContextRef.current = {
      scene,
      camera,
      renderer,
      earthGroup,
      solarGroup,
      galaxyGroup,
      earthMesh,
      cloudMesh,
      targetCameraPos: new THREE.Vector3(0, 2.5, 9),
      targetLookAt: new THREE.Vector3(0, 0, 0),
      isUserInteracting: false,
      prevX: 0,
      prevY: 0,
      rotX: 0,
      rotY: 0,
      userPinMesh: userPinGroup,
      countryPinMesh: countryPinGroup,
      satelliteMeshes,
    };

    // Mouse Interaction Handlers
    const onMouseDown = (e: MouseEvent) => {
      if (!sceneContextRef.current) return;
      sceneContextRef.current.isUserInteracting = true;
      sceneContextRef.current.prevX = e.clientX;
      sceneContextRef.current.prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!sceneContextRef.current || !sceneContextRef.current.isUserInteracting) return;
      const dx = e.clientX - sceneContextRef.current.prevX;
      const dy = e.clientY - sceneContextRef.current.prevY;

      sceneContextRef.current.rotY += dx * 0.006;
      sceneContextRef.current.rotX += dy * 0.006;

      sceneContextRef.current.prevX = e.clientX;
      sceneContextRef.current.prevY = e.clientY;
    };

    const onMouseUp = () => {
      if (!sceneContextRef.current) return;
      sceneContextRef.current.isUserInteracting = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!sceneContextRef.current) return;
      const cam = sceneContextRef.current.camera;
      const delta = e.deltaY * 0.008;
      const newZ = Math.min(Math.max(cam.position.z + delta, 4.2), 45);
      cam.position.z = newZ;
      sceneContextRef.current.targetCameraPos.z = newZ;
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
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.01;

      if (sceneContextRef.current) {
        const {
          earthGroup,
          cloudMesh,
          camera,
          targetCameraPos,
          targetLookAt,
          satelliteMeshes,
          userPinMesh,
          countryPinMesh,
        } = sceneContextRef.current;

        // Smoothly interpolate camera position & orientation
        camera.position.lerp(targetCameraPos, 0.05);

        // Auto earth rotation when user is idle
        if (!sceneContextRef.current.isUserInteracting) {
          earthGroup.rotation.y += 0.001;
        } else {
          earthGroup.rotation.y = sceneContextRef.current.rotY;
          earthGroup.rotation.x = sceneContextRef.current.rotX;
        }

        // Independent subtle cloud drift
        cloudMesh.rotation.y += 0.0004;

        // Animate satellites along their orbits
        satelliteMeshes.forEach((item) => {
          item.sat.angle += item.sat.orbitSpeed;
          const pos = new THREE.Vector3(
            Math.cos(item.sat.angle) * item.sat.orbitRadius,
            0,
            Math.sin(item.sat.angle) * item.sat.orbitRadius
          );
          pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), (item.sat.inclinationDeg * Math.PI) / 180);
          item.group.position.copy(pos);
          item.group.lookAt(0, 0, 0);
        });

        // Pulse radar rings on location pins
        if (userPinMesh && userPinMesh.visible) {
          const ring = userPinMesh.children[1];
          if (ring) {
            const scale = 1 + Math.sin(clock * 5) * 0.25;
            ring.scale.set(scale, scale, 1);
          }
        }
        if (countryPinMesh) {
          const cRing = countryPinMesh.children[1];
          if (cRing) {
            const cScale = 1 + Math.sin(clock * 4) * 0.2;
            cRing.scale.set(cScale, cScale, 1);
          }
        }

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
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Handle Scale Transition (GALAXY -> SOLAR SYSTEM -> ORBITAL -> SURFACE)
  const setScaleView = (scale: ViewScale) => {
    setActiveScale(scale);
    if (!sceneContextRef.current) return;

    if (scale === 'GALAXY') {
      sceneContextRef.current.targetCameraPos.set(0, 18, 42);
    } else if (scale === 'SOLAR_SYSTEM') {
      sceneContextRef.current.targetCameraPos.set(-10, 8, 24);
    } else if (scale === 'ORBITAL') {
      sceneContextRef.current.targetCameraPos.set(0, 2.5, 9);
    } else if (scale === 'SURFACE') {
      // Zoom close to Earth surface
      sceneContextRef.current.targetCameraPos.set(0, 1.2, 5.2);
    }
  };

  // Fly Camera & Pin to Selected Country
  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
    if (!sceneContextRef.current) return;

    const earthRadius = 3.0;
    const pos = latLngToVector3(country.lat, country.lng, earthRadius + 0.05);

    if (sceneContextRef.current.countryPinMesh) {
      sceneContextRef.current.countryPinMesh.position.copy(pos);
    }

    // Orient Earth so the target country faces the camera
    const targetRotY = -((country.lng + 180) * (Math.PI / 180)) + Math.PI / 2;
    const targetRotX = ((90 - country.lat) * (Math.PI / 180)) - Math.PI / 2;

    sceneContextRef.current.rotY = targetRotY;
    sceneContextRef.current.rotX = THREE.MathUtils.clamp(targetRotX * 0.5, -0.6, 0.6);
    sceneContextRef.current.earthGroup.rotation.y = sceneContextRef.current.rotY;
    sceneContextRef.current.earthGroup.rotation.x = sceneContextRef.current.rotX;

    // Zoom into surface level
    sceneContextRef.current.targetCameraPos.set(0, 0.8, 5.6);
    setActiveScale('SURFACE');
  };

  // Detect My Real-Time Location (HTML5 Geolocation)
  const handleDetectMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring orbital GPS telemetry lock...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({
          lat: Number(latitude.toFixed(4)),
          lng: Number(longitude.toFixed(4)),
          accuracyM: Math.round(accuracy),
        });
        setIsLocating(false);
        setLocationStatus(`Locked: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (±${Math.round(accuracy)}m)`);

        if (sceneContextRef.current) {
          const earthRadius = 3.0;
          const userPos = latLngToVector3(latitude, longitude, earthRadius + 0.05);
          if (sceneContextRef.current.userPinMesh) {
            sceneContextRef.current.userPinMesh.position.copy(userPos);
            sceneContextRef.current.userPinMesh.visible = true;
          }

          // Orient Earth to face user
          const targetRotY = -((longitude + 180) * (Math.PI / 180)) + Math.PI / 2;
          const targetRotX = ((90 - latitude) * (Math.PI / 180)) - Math.PI / 2;
          sceneContextRef.current.rotY = targetRotY;
          sceneContextRef.current.rotX = THREE.MathUtils.clamp(targetRotX * 0.5, -0.6, 0.6);
          sceneContextRef.current.earthGroup.rotation.y = targetRotY;
          sceneContextRef.current.earthGroup.rotation.x = sceneContextRef.current.rotX;

          // Smoothly fly camera close
          sceneContextRef.current.targetCameraPos.set(0, 0.5, 5.2);
          setActiveScale('SURFACE');
        }
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus(`GPS capture bypassed: Using regional telemetry default (${error.message})`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Filter countries for search
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return WORLD_COUNTRIES;
    const q = searchQuery.toLowerCase();
    return WORLD_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.majorSpaceport.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Scale Selector */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                ORBITAL & GLOBAL TECHNOLOGY EXPLORER
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Multi-scale interactive observatory. Zoom smoothly from galactic starfields and the solar system down into
              real-time Low-Earth Orbit satellites, ground stations, and your current GPS position on Earth.
            </p>
          </div>

          {/* Scale Transition Buttons (Galaxy -> Solar System -> LEO Orbit -> Earth Surface) */}
          <div className="flex items-center gap-1.5 p-1 bg-space-950 border border-space-800 rounded font-mono text-xs">
            {(
              [
                { key: 'GALAXY', label: 'DEEP SPACE' },
                { key: 'SOLAR_SYSTEM', label: 'SOLAR SYSTEM' },
                { key: 'ORBITAL', label: 'LEO SATELLITES' },
                { key: 'SURFACE', label: 'SURFACE / MAP' },
              ] as { key: ViewScale; label: string }[]
            ).map((s) => (
              <button
                key={s.key}
                onClick={() => setScaleView(s.key)}
                className={`px-3 py-1.5 rounded transition-all ${
                  activeScale === s.key
                    ? 'bg-aeroblue text-space-950 font-bold shadow-md shadow-aeroblue/20'
                    : 'text-space-400 hover:text-white hover:bg-space-850'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Location Bar & Quick Action */}
        <div className="mt-4 pt-3 border-t border-space-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-space-300">
            <Crosshair className="w-4 h-4 text-aerogreen" />
            <span>GEO-TELEMETRY STATUS:</span>
            <span className="text-white font-semibold">{locationStatus}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDetectMyLocation}
              disabled={isLocating}
              className="px-3.5 py-1.5 rounded bg-aerogreen hover:bg-aerogreen-light text-space-950 font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isLocating ? 'LOCKING GPS...' : 'LOCATE MY POSITION'}</span>
            </button>

            <button
              onClick={() => {
                if (sceneContextRef.current) {
                  sceneContextRef.current.rotX = 0;
                  sceneContextRef.current.rotY = 0;
                  sceneContextRef.current.targetCameraPos.set(0, 2.5, 9);
                  setActiveScale('ORBITAL');
                }
              }}
              className="p-1.5 rounded bg-space-800 hover:bg-space-700 text-space-300 hover:text-white border border-space-700 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas & Side HUD Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D WebGL Globe & Satellite View (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative w-full h-[620px] rounded-lg bg-space-950 border border-space-700/80 overflow-hidden select-none">
            {/* Canvas Mount */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top Left Telemetry Overlay */}
            <div className="absolute top-4 left-4 pointer-events-none font-mono text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-aeroblue animate-pulse" />
                <span className="text-[11px] text-aeroblue-light font-bold">
                  ORBITAL VIEW SCALE: {activeScale}
                </span>
              </div>
              <div className="text-white font-bold text-sm">
                TARGET FOCUS: {selectedCountry.name.toUpperCase()} ({selectedCountry.code})
              </div>
              <div className="text-space-400 text-[11px]">
                Coordinates: {selectedCountry.lat}° N, {selectedCountry.lng}° E
              </div>
            </div>

            {/* Top Right Zoom / Controls Pill */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-space-900/90 border border-space-700 rounded p-1 font-mono text-xs">
              <button
                onClick={() => {
                  if (sceneContextRef.current) {
                    const cam = sceneContextRef.current.camera;
                    cam.position.z = Math.max(cam.position.z - 1.5, 4.2);
                  }
                }}
                className="p-1.5 hover:text-white text-space-400 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (sceneContextRef.current) {
                    const cam = sceneContextRef.current.camera;
                    cam.position.z = Math.min(cam.position.z + 2.0, 45);
                  }
                }}
                className="p-1.5 hover:text-white text-space-400 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Left: Live Tracked Satellites Carousel */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto flex flex-wrap gap-2 max-w-xl">
              {INITIAL_SATELLITES.map((sat) => {
                const isSelected = selectedSatellite?.id === sat.id;

                return (
                  <button
                    key={sat.id}
                    onClick={() => setSelectedSatellite(sat)}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-mono border transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-space-900 border-aeroblue text-white shadow-md shadow-aeroblue/20'
                        : 'bg-space-950/90 border-space-800 text-space-400 hover:text-white hover:border-space-600'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: `#${sat.color.toString(16).padStart(6, '0')}` }}
                    />
                    <span>{sat.name}</span>
                    <span className="text-[10px] text-space-500 font-normal">({sat.altitudeKm} km)</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Satellite Telemetry Detail Strip */}
          {selectedSatellite && (
            <div className="hud-panel p-4 rounded-lg border border-space-700/80 bg-space-900/60 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-space-800 border border-space-700 flex items-center justify-center text-aeroblue">
                  <Satellite className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold">{selectedSatellite.name}</div>
                  <div className="text-[11px] text-space-400">
                    NORAD ID: {selectedSatellite.noradId} &bull; Classification: {selectedSatellite.type}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 text-[11px]">
                <div>
                  <span className="text-space-500 block text-[10px]">ORBITAL ALTITUDE</span>
                  <span className="text-white font-bold">{selectedSatellite.altitudeKm} km</span>
                </div>
                <div>
                  <span className="text-space-500 block text-[10px]">GROUND SPEED</span>
                  <span className="text-aeroblue-light font-bold">
                    {selectedSatellite.speedKmH.toLocaleString()} km/h
                  </span>
                </div>
                <div>
                  <span className="text-space-500 block text-[10px]">INCLINATION</span>
                  <span className="text-aerogreen font-bold">{selectedSatellite.inclinationDeg}°</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Country Explorer & Spaceport Hub (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Country Details Card */}
          <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-aeroblue" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-white">
                  TERRESTRIAL SPACEPORT & COUNTRY HUB
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-space-800 text-aeroblue border border-space-700">
                {selectedCountry.code}
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white tracking-tight">{selectedCountry.name}</h4>
              <p className="text-space-300 text-[11px] mt-1 leading-relaxed">
                {selectedCountry.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-space-800">
              <div className="p-2.5 bg-space-950/80 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">NATIONAL SPACE ENTITY</span>
                <span className="text-white font-semibold text-xs mt-0.5 block">
                  {selectedCountry.spaceAgency}
                </span>
              </div>

              <div className="p-2.5 bg-space-950/80 rounded border border-space-850">
                <span className="text-space-500 block text-[10px]">PRIMARY SPACEPORT / TELEMETRY SITE</span>
                <span className="text-aeroblue-light font-semibold text-xs mt-0.5 block">
                  {selectedCountry.majorSpaceport}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-space-950/80 rounded border border-space-850">
                  <span className="text-space-500 block text-[10px]">SATELLITES OPERATED</span>
                  <span className="text-aerogreen font-bold text-sm">
                    {selectedCountry.satellitesInOrbit} IN ORBIT
                  </span>
                </div>

                <div className="p-2.5 bg-space-950/80 rounded border border-space-850">
                  <span className="text-space-500 block text-[10px]">SURFACE COORDINATES</span>
                  <span className="text-white font-bold text-xs">
                    {selectedCountry.lat}° N, {selectedCountry.lng}° E
                  </span>
                </div>
              </div>
            </div>

            {/* Fly to Country Action */}
            <button
              onClick={() => handleSelectCountry(selectedCountry)}
              className="w-full py-2.5 px-4 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-aeroblue/10"
            >
              <Eye className="w-4 h-4" />
              <span>ORBITAL RECONNAISSANCE FLYBY</span>
            </button>
          </div>

          {/* Country Directory & Search List */}
          <div className="hud-panel p-4 rounded-lg border border-space-700/80 bg-space-900/80 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-space-400 font-bold uppercase text-[10px]">SELECT COUNTRY & SPACEPORT</span>
              <span className="text-space-500 text-[10px]">{filteredCountries.length} REGIONS</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-space-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search country (e.g. Cambodia, France, Japan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-space-950 border border-space-700 rounded pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-space-500 focus:outline-none focus:border-aeroblue"
              />
            </div>

            {/* Country Scrollable List */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry.id === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCountry(c)}
                    className={`p-2 rounded cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-space-800 border border-aeroblue text-white'
                        : 'bg-space-950/60 border border-space-850 text-space-300 hover:border-space-700 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-[10px] text-space-500">{c.majorSpaceport}</div>
                    </div>
                    <span className="text-[10px] text-aeroblue font-bold">{c.satellitesInOrbit} Sats</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
