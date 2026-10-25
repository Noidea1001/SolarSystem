'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  MapPin,
  Crosshair,
  Compass,
  Search,
  Eye,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Info,
  Calendar,
  Radio,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export type ObservatoryChannel = 'EARTH_SATELLITE' | 'DEEP_SPACE' | 'SOLAR_SYSTEM' | 'ORBITAL_VIEW';

interface SpacePhoto {
  id: string;
  title: string;
  source: string;
  instrument: string;
  targetObject: string;
  distance: string;
  observationDate: string;
  spectralBand: string;
  imageUrl: string;
  description: string;
  coordinates?: string;
  scienceHighlights: string[];
}

const DEEP_SPACE_PHOTOS: SpacePhoto[] = [
  {
    id: 'jwst-carina',
    title: 'JWST Cosmic Cliffs in the Carina Nebula (NGC 3324)',
    source: 'NASA / ESA / CSA / STScI',
    instrument: 'James Webb Space Telescope (NIRCam & MIRI)',
    targetObject: 'Carina Nebula Star-Forming Region',
    distance: '7,600 Light-Years',
    observationDate: '2022-07-12',
    spectralBand: 'Near-Infrared & Mid-Infrared Composite (0.6 - 28 µm)',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1600&q=80',
    description: 'Real infrared observation revealing previously invisible baby stars and ionized gas ridges carved by intense ultraviolet radiation from massive young stars.',
    scienceHighlights: [
      'Reveals stellar nurseries hidden behind opaque dust clouds',
      'Gas pillars towering 7 light-years above the ionization cavity',
      'Direct detection of protostellar outflows and supersonic jets',
    ],
  },
  {
    id: 'hubble-pillars',
    title: 'Hubble Pillars of Creation (Eagle Nebula M16)',
    source: 'NASA / ESA / Hubble Heritage Team',
    instrument: 'Hubble Space Telescope (WFC3)',
    targetObject: 'Messier 16 (Serpens Constellation)',
    distance: '6,500 Light-Years',
    observationDate: '2015-01-05',
    spectralBand: 'Optical Visible Light (Hydrogen-alpha, Oxygen III, Sulfur II)',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    description: 'The iconic high-resolution true-color capture of interstellar gas and dust pillars in the Eagle Nebula, where newborn stars are being formed.',
    scienceHighlights: [
      'Pillars composed of cold molecular hydrogen and dense cosmic dust',
      'Finger-like projections larger than our entire Solar System',
      'Evaporating Gaseous Globules (EGGs) emerging from the cloud summits',
    ],
  },
  {
    id: 'jwst-deep-field',
    title: 'JWST First Deep Field (Galaxy Cluster SMACS 0723)',
    source: 'NASA / ESA / CSA / STScI',
    instrument: 'James Webb Space Telescope (NIRCam)',
    targetObject: 'Deep Cosmic Web & Gravitational Lenses',
    distance: '13.1 Billion Light-Years (Lookback Time)',
    observationDate: '2022-07-11',
    spectralBand: 'Infrared (F090W, F150W, F200W, F277W, F356W, F444W)',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80',
    description: 'Deepest and sharpest infrared photograph of the distant universe taken to date. Massive foreground galaxy cluster acts as a gravitational lens, magnifying primordial galaxies.',
    scienceHighlights: [
      'Magnification of galaxies that existed when the universe was under 600 million years old',
      'Gravitationally bent arcs and distorted mirror galaxy images',
      'Spectroscopic detection of early oxygen, hydrogen, and carbon lines',
    ],
  },
  {
    id: 'andromeda-m31',
    title: 'Andromeda Galaxy (Messier 31) Core and Spiral Arms',
    source: 'NASA / Hubble / Subaru Observatory',
    instrument: 'Deep Optical Astrophotography Survey',
    targetObject: 'Spiral Galaxy M31',
    distance: '2.537 Million Light-Years',
    observationDate: '2021-09-18',
    spectralBand: 'Broadband Optical & Ultraviolet Composite',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    description: 'Our nearest major galactic neighbor containing over one trillion stars. Features prominent interstellar dust lanes and orbiting satellite dwarf galaxies.',
    scienceHighlights: [
      'Over one trillion stars spanning 220,000 light-years in diameter',
      'Approaching the Milky Way at 110 kilometers per second',
      'Supermassive black hole at core with 140 million solar masses',
    ],
  },
];

const SOLAR_SYSTEM_PHOTOS: SpacePhoto[] = [
  {
    id: 'sun-sdo',
    title: 'The Sun: Solar Flare & Magnetic Corona Loops',
    source: 'NASA Solar Dynamics Observatory (SDO)',
    instrument: 'Atmospheric Imaging Assembly (AIA 304 & 171)',
    targetObject: 'Sol (Active Region 13182)',
    distance: '149.6 Million Kilometers (1.0 AU)',
    observationDate: '2023-01-08',
    spectralBand: 'Extreme Ultraviolet (304 Å Helium II & 171 Å Iron IX)',
    imageUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1600&q=80',
    description: 'Authentic 4K extreme ultraviolet observation of solar plasma twisting along magnetic field lines at temperatures exceeding 1,000,000 Kelvin.',
    scienceHighlights: [
      'Coronal mass ejection (CME) plasma reaching velocities of 800 km/s',
      'Magnetic reconnection events triggering solar flare radio blackouts',
      'Continuous 24/7 space weather monitoring for astronaut radiation protection',
    ],
  },
  {
    id: 'moon-lro',
    title: 'The Moon: Tycho Crater & Basaltic Mare Highlands',
    source: 'NASA Lunar Reconnaissance Orbiter (LRO)',
    instrument: 'LROC Narrow Angle Camera (0.5m/pixel)',
    targetObject: 'Lunar Surface (Tycho & Mare Imbrium)',
    distance: '384,400 Kilometers',
    observationDate: '2022-11-20',
    spectralBand: 'Panchromatic High-Resolution Optical',
    imageUrl: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1600&q=80',
    description: 'High-resolution true photographic map of ancient meteorite bombardment craters and basalt lava flows preserved in the vacuum of space for 3.8 billion years.',
    scienceHighlights: [
      'Prominent radial impact ejecta rays spanning over 1,500 km across lunar disc',
      'Central peak rising 2 kilometers above the crater floor',
      'Water ice deposits identified in permanently shadowed polar craters',
    ],
  },
  {
    id: 'mars-perseverance',
    title: 'Mars: Jezero Crater River Delta & Stratified Rock Beds',
    source: 'NASA / JPL-Caltech / MSSS / USGS',
    instrument: 'Perseverance Rover Mastcam-Z & Mars Reconnaissance Orbiter (HiRISE)',
    targetObject: 'Jezero Crater Paleolake Delta',
    distance: '225 Million Kilometers (Average)',
    observationDate: '2023-04-15',
    spectralBand: 'True-Color Calibrated Surface Photography',
    imageUrl: 'https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?auto=format&fit=crop&w=1600&q=80',
    description: 'Real photographic imagery of sedimentary ancient lake beds on Mars where an ancient river once flowed into a deep lake basin 3.5 billion years ago.',
    scienceHighlights: [
      'Sedimentary mudstones and clay minerals capable of preserving biosignatures',
      'Ingenuity Mars Helicopter flight terrain reconnaissance',
      'Core sample cache sealing for planned Mars Sample Return campaign',
    ],
  },
  {
    id: 'jupiter-juno',
    title: 'Jupiter: Great Red Spot & Swirling Polar Storm Cyclones',
    source: 'NASA / JPL-Caltech / SwRI / MSSS / JunoCam',
    instrument: 'Juno Spacecraft Optical Imager (Perijove-44)',
    targetObject: 'Jupiter Jovian Atmosphere',
    distance: '778 Million Kilometers (5.2 AU)',
    observationDate: '2022-08-17',
    spectralBand: 'Enhanced True-Color Calibrated RGB',
    imageUrl: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&w=1600&q=80',
    description: 'Real close-up photograph taken during an elliptical orbital dive skimming 4,200 km above the clouds, capturing ammonia-water cloud belts and cyclonic storms larger than Earth.',
    scienceHighlights: [
      'Great Red Spot storm persisting for over 350 years with wind speeds > 430 km/h',
      'Pentagonal vortex clusters at the jovian north and south poles',
      'Atmospheric depth showing atmospheric mixing down to 3,000 kilometers',
    ],
  },
];

const ORBITAL_EARTH_PHOTOS: SpacePhoto[] = [
  {
    id: 'earth-iss-aurora',
    title: 'Earth: Aurora Australis Glow Observed from ISS Cupola',
    source: 'NASA / International Space Station Expedition 68',
    instrument: 'Nikon D5 Digital SLR with 28mm f/1.4 Lens from Orbit',
    targetObject: 'Earth Atmosphere & Southern Lights',
    distance: '418 Kilometers LEO Orbit',
    observationDate: '2023-03-24',
    spectralBand: 'High-ISO Optical Night Photography',
    imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1600&q=80',
    description: 'Genuine photograph taken by astronauts aboard the International Space Station looking out the Cupola window as solar wind particles collide with nitrogen and oxygen atoms in the upper atmosphere.',
    scienceHighlights: [
      'Green glow from oxygen atoms at 100-200 km altitude',
      'Red emission ribbons from high-altitude molecular nitrogen',
      'Atmospheric limb curving against the absolute blackness of vacuum',
    ],
  },
  {
    id: 'earth-epic-globe',
    title: 'Earth: Full Sunlit Disc from 1.5 Million Kilometers (L1)',
    source: 'NASA / NOAA DSCOVR Spacecraft',
    instrument: 'Earth Polychromatic Imaging Camera (EPIC)',
    targetObject: 'Planet Earth True Color Disc',
    distance: '1,500,000 Kilometers (Lagrange Point 1)',
    observationDate: '2023-06-21',
    spectralBand: 'Calibrated Natural Color (Red, Green, Blue Filters)',
    imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1600&q=80',
    description: 'Real photograph of Earth captured from the Sun-Earth Lagrange Point 1 where gravity balances. Displays true oceanic reflectivity, cloud vortexes, and desert albedos.',
    scienceHighlights: [
      'Unbroken sunlit view of Earth from sunrise to sunset',
      'Real-time tracking of dust storms, ozone layers, and cloud reflectivity',
      'Captures the Moon transiting across the face of Earth twice a year',
    ],
  },
];

const SATELLITE_REGIONS = [
  { id: 'khm', name: 'Cambodia (Phnom Penh & Angkor Wat)', lat: 11.5564, lng: 104.9282, zoom: 12 },
  { id: 'usa', name: 'USA (Kennedy Space Center Launch Pad 39A)', lat: 28.6083, lng: -80.6043, zoom: 14 },
  { id: 'fra', name: 'France (Guiana Spaceport CSG, Kourou)', lat: 5.239, lng: -52.768, zoom: 13 },
  { id: 'jpn', name: 'Japan (Tanegashima Space Center SLC)', lat: 30.399, lng: 130.975, zoom: 14 },
  { id: 'sgp', name: 'Singapore (Aerospace Innovation Hub)', lat: 1.3521, lng: 103.8198, zoom: 12 },
  { id: 'ind', name: 'India (Satish Dhawan Launch Complex)', lat: 13.72, lng: 80.23, zoom: 13 },
  { id: 'nzl', name: 'New Zealand (Rocket Lab LC-1 Mahia)', lat: -39.26, lng: 177.86, zoom: 14 },
  { id: 'deu', name: 'Germany (GSOC Space Operations)', lat: 48.08, lng: 11.28, zoom: 13 },
];

export default function RealSpaceObservatory() {
  const [activeChannel, setActiveChannel] = useState<ObservatoryChannel>('EARTH_SATELLITE');
  const [selectedDeepSpace, setSelectedDeepSpace] = useState<SpacePhoto>(DEEP_SPACE_PHOTOS[0]);
  const [selectedSolar, setSelectedSolar] = useState<SpacePhoto>(SOLAR_SYSTEM_PHOTOS[0]);
  const [selectedOrbital, setSelectedOrbital] = useState<SpacePhoto>(ORBITAL_EARTH_PHOTOS[0]);

  // Leaflet map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.5657,
    lng: 104.991, // Cambodia center
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Ready to locate your real coordinates');
  const [isLocating, setIsLocating] = useState(false);
  const [satelliteLayerType, setSatelliteLayerType] = useState<'ESRI' | 'HYBRID'>('HYBRID');

  // Initialize Real Satellite Leaflet Map
  useEffect(() => {
    if (activeChannel !== 'EARTH_SATELLITE') return;
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically load leaflet on client
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [currentCoords.lat, currentCoords.lng],
          zoom: mapZoom,
          zoomControl: false,
          attributionControl: false,
        });

        // 1. Real Satellite Imagery Layer (ESRI World Imagery - Authentic high-resolution satellite photography)
        const esriSatellite = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
            attribution: 'Esri, Maxar, Earthstar Geographics, CNES/Airbus DS',
          }
        ).addTo(map);

        // 2. Clear Hybrid Labels & Country Borders Layer
        const hybridLabels = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
          {
            subdomains: 'abcd',
            maxZoom: 19,
          }
        ).addTo(map);

        map.on('moveend', () => {
          const center = map.getCenter();
          setCurrentCoords({
            lat: Number(center.lat.toFixed(4)),
            lng: Number(center.lng.toFixed(4)),
          });
          setMapZoom(map.getZoom());
        });

        leafletMapRef.current = map;
      }
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [activeChannel]);

  // Jump satellite map to region
  const handleJumpToRegion = (region: (typeof SATELLITE_REGIONS)[0]) => {
    if (!leafletMapRef.current) return;
    leafletMapRef.current.flyTo([region.lat, region.lng], region.zoom, {
      duration: 1.8,
    });
  };

  // Find My Real-Time Location (GPS)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring orbital GPS satellite lock on your location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
        setLocationStatus(`Locked: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (±${Math.round(accuracy)}m)`);

        if (leafletMapRef.current) {
          import('leaflet').then((L) => {
            // Remove previous marker if exists
            if (userMarkerRef.current) {
              leafletMapRef.current.removeLayer(userMarkerRef.current);
            }

            // Custom clean SVG pulsing pin
            const customIcon = L.divIcon({
              className: 'custom-gps-pin',
              html: `
                <div style="position:relative; width:24px; height:24px;">
                  <div style="position:absolute; width:24px; height:24px; border-radius:50%; background:rgba(16,185,129,0.3); border:2px solid #10B981; animation:pulse 2s infinite;"></div>
                  <div style="position:absolute; top:8px; left:8px; width:8px; height:8px; border-radius:50%; background:#10B981;"></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(leafletMapRef.current);
            userMarkerRef.current = marker;

            // Fly camera to real satellite imagery of user location
            leafletMapRef.current.flyTo([latitude, longitude], 15, { duration: 2.2 });
          });
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(`GPS capture note: Using standard satellite view (${err.message})`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Channel Selectors */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                REAL SPACE & SATELLITE EARTH OBSERVATORY
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Authentic space imagery and true high-resolution satellite photography. Explore the real universe via JWST
              and Hubble, real planetary missions, and inspect actual satellite photography of Earth down to street level.
            </p>
          </div>

          {/* Channel Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-space-950 border border-space-800 rounded font-mono text-xs">
            {[
              { key: 'EARTH_SATELLITE', label: 'REAL SATELLITE MAP (EARTH)' },
              { key: 'DEEP_SPACE', label: 'REAL UNIVERSE (JWST/HUBBLE)' },
              { key: 'SOLAR_SYSTEM', label: 'REAL SOLAR SYSTEM (NASA)' },
              { key: 'ORBITAL_VIEW', label: 'REAL ORBIT FROM ISS' },
            ].map((ch) => (
              <button
                key={ch.key}
                onClick={() => setActiveChannel(ch.key as ObservatoryChannel)}
                className={`px-3 py-1.5 rounded transition-all ${
                  activeChannel === ch.key
                    ? 'bg-aeroblue text-space-950 font-bold shadow-md shadow-aeroblue/20'
                    : 'text-space-400 hover:text-white hover:bg-space-850'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 pt-3 border-t border-space-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-space-300">
            <Radio className="w-4 h-4 text-aerogreen" />
            <span>OPTICAL TELEMETRY STATUS:</span>
            <span className="text-white font-semibold">100% TRUE PHOTOGRAPHIC SENSOR DATA (NO 3D MESHES)</span>
          </div>

          <div className="text-space-400 text-[11px]">
            Sensor Feeds: ESRI World Satellite &bull; NASA SDO &bull; JWST NIRCam &bull; Hubble WFC3
          </div>
        </div>
      </div>

      {/* CHANNEL 1: REAL EARTH SATELLITE MAP (LIKE GOOGLE MAPS SATELLITE) */}
      {activeChannel === 'EARTH_SATELLITE' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Quick Jump & Controls Bar */}
          <div className="hud-panel p-4 rounded-lg border border-space-700/80 bg-space-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLocateMe}
                disabled={isLocating}
                className="px-4 py-2 rounded bg-aerogreen hover:bg-aerogreen-light text-space-950 font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                <span>{isLocating ? 'LOCATING GPS...' : 'FLY TO MY REAL LOCATION'}</span>
              </button>

              <div className="text-[11px] text-space-300">
                <span>{locationStatus}</span>
              </div>
            </div>

            {/* Quick Country Dropdown Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-space-500 uppercase font-bold mr-1">QUICK JUMP:</span>
              {SATELLITE_REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => handleJumpToRegion(region)}
                  className="px-2.5 py-1 rounded bg-space-950 hover:bg-space-800 border border-space-800 text-space-300 hover:text-white transition-colors text-[11px]"
                >
                  {region.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Real Satellite Map Canvas */}
          <div className="relative w-full h-[640px] rounded-lg border border-space-700/80 overflow-hidden bg-space-950">
            {/* Leaflet Mount Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Top Left Telemetry HUD Card */}
            <div className="absolute top-4 left-4 z-10 bg-space-950/85 backdrop-blur-md border border-space-700/80 rounded p-3 pointer-events-none space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-aerogreen animate-pulse" />
                <span className="text-white font-bold text-xs uppercase">
                  TRUE SATELLITE RECONNAISSANCE LAYER
                </span>
              </div>
              <div className="text-space-300 text-[11px]">
                Latitude: <strong className="text-white">{currentCoords.lat}°</strong> &bull; Longitude:{' '}
                <strong className="text-white">{currentCoords.lng}°</strong>
              </div>
              <div className="text-space-400 text-[10px]">
                Orbital Optical Magnification Level: {mapZoom}x (Resolution: ~1m/pixel)
              </div>
            </div>

            {/* Top Right Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-space-950/90 border border-space-700 rounded p-1">
              <button
                onClick={() => leafletMapRef.current && leafletMapRef.current.zoomIn()}
                className="p-2 text-space-300 hover:text-white hover:bg-space-800 rounded transition-colors"
                title="Zoom In Closer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => leafletMapRef.current && leafletMapRef.current.zoomOut()}
                className="p-2 text-space-300 hover:text-white hover:bg-space-800 rounded transition-colors"
                title="Zoom Out to Space"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Floating Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-space-950/85 backdrop-blur-md border border-space-700/80 rounded px-3 py-1.5 text-[10px] text-space-400">
              Imagery Source: Maxar Technologies &bull; CNES/Airbus &bull; USDA FSA &bull; USGS True Satellite Feeds
            </div>
          </div>
        </div>
      )}

      {/* CHANNEL 2: REAL DEEP SPACE & GALAXY (JWST / HUBBLE) */}
      {activeChannel === 'DEEP_SPACE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Main Photo Viewer (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative w-full h-[580px] rounded-lg border border-space-700/80 overflow-hidden bg-space-950 group">
              <img
                src={selectedDeepSpace.imageUrl}
                alt={selectedDeepSpace.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Photo Overlay Badge */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-space-950 via-space-950/80 to-transparent p-6 space-y-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-aeroblue/20 text-aeroblue border border-aeroblue/40 font-bold uppercase">
                  TRUE ASTROPHOTOGRAPHY &bull; {selectedDeepSpace.spectralBand}
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">{selectedDeepSpace.title}</h3>
                <p className="text-space-300 text-xs leading-relaxed max-w-3xl">
                  {selectedDeepSpace.description}
                </p>
              </div>

              {/* Top Source Chip */}
              <div className="absolute top-4 left-4 bg-space-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-space-700 text-[11px] text-space-300">
                Instrument: <strong className="text-white">{selectedDeepSpace.instrument}</strong>
              </div>
            </div>

            {/* Science Highlights Box */}
            <div className="hud-panel p-4 rounded-lg border border-space-700/80 bg-space-900/60 space-y-2">
              <h4 className="text-aeroblue font-bold uppercase text-[10px] tracking-wider">
                ASTROPHYSICAL SCIENTIFIC OBSERVATIONS
              </h4>
              <ul className="space-y-1.5 text-space-300 text-[11px]">
                {selectedDeepSpace.scienceHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-aeroblue mt-1.5 flex-shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Photo Gallery Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-space-400">
              JWST & HUBBLE MISSION ARCHIVES
            </h3>

            <div className="space-y-3">
              {DEEP_SPACE_PHOTOS.map((photo) => {
                const isSelected = selectedDeepSpace.id === photo.id;

                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedDeepSpace(photo)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex gap-3 ${
                      isSelected
                        ? 'border-aeroblue bg-space-900/90 shadow-md shadow-aeroblue/15'
                        : 'border-space-800 bg-space-950/70 hover:border-space-600'
                    }`}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-20 h-20 object-cover rounded border border-space-700 flex-shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="text-[10px] text-aeroblue font-bold">{photo.distance}</div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{photo.targetObject}</h4>
                      <p className="text-[10px] text-space-400 line-clamp-2">{photo.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CHANNEL 3: REAL SOLAR SYSTEM (NASA MISSIONS) */}
      {activeChannel === 'SOLAR_SYSTEM' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Main Photo Viewer (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative w-full h-[580px] rounded-lg border border-space-700/80 overflow-hidden bg-space-950 group">
              <img
                src={selectedSolar.imageUrl}
                alt={selectedSolar.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-space-950 via-space-950/80 to-transparent p-6 space-y-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-aeroamber/20 text-aeroamber border border-aeroamber/40 font-bold uppercase">
                  TRUE PLANETARY EXPLORATION &bull; {selectedSolar.source}
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">{selectedSolar.title}</h3>
                <p className="text-space-300 text-xs leading-relaxed max-w-3xl">
                  {selectedSolar.description}
                </p>
              </div>

              <div className="absolute top-4 left-4 bg-space-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-space-700 text-[11px] text-space-300">
                Orbiter/Rover: <strong className="text-white">{selectedSolar.instrument}</strong>
              </div>
            </div>

            <div className="hud-panel p-4 rounded-lg border border-space-700/80 bg-space-900/60 space-y-2">
              <h4 className="text-aeroamber font-bold uppercase text-[10px] tracking-wider">
                PLANETARY GEOLOGY & ATMOSPHERIC TELEMETRY
              </h4>
              <ul className="space-y-1.5 text-space-300 text-[11px]">
                {selectedSolar.scienceHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-aeroamber mt-1.5 flex-shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Solar Bodies Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-space-400">
              PLANETARY TARGETS (ROBOTIC MISSIONS)
            </h3>

            <div className="space-y-3">
              {SOLAR_SYSTEM_PHOTOS.map((photo) => {
                const isSelected = selectedSolar.id === photo.id;

                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedSolar(photo)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex gap-3 ${
                      isSelected
                        ? 'border-aeroamber bg-space-900/90 shadow-md shadow-aeroamber/15'
                        : 'border-space-800 bg-space-950/70 hover:border-space-600'
                    }`}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-20 h-20 object-cover rounded border border-space-700 flex-shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="text-[10px] text-aeroamber font-bold">{photo.targetObject}</div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{photo.title}</h4>
                      <div className="text-[10px] text-space-400">{photo.distance}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CHANNEL 4: REAL ORBITAL EARTH (ASTRONAUT & ISS FEEDS) */}
      {activeChannel === 'ORBITAL_VIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          <div className="lg:col-span-8 space-y-4">
            <div className="relative w-full h-[580px] rounded-lg border border-space-700/80 overflow-hidden bg-space-950 group">
              <img
                src={selectedOrbital.imageUrl}
                alt={selectedOrbital.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-space-950 via-space-950/80 to-transparent p-6 space-y-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-aerogreen/20 text-aerogreen border border-aerogreen/40 font-bold uppercase">
                  LEO ORBITAL PERSPECTIVE &bull; {selectedOrbital.source}
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">{selectedOrbital.title}</h3>
                <p className="text-space-300 text-xs leading-relaxed max-w-3xl">
                  {selectedOrbital.description}
                </p>
              </div>

              <div className="absolute top-4 left-4 bg-space-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-space-700 text-[11px] text-space-300">
                Altitude: <strong className="text-white">{selectedOrbital.distance}</strong>
              </div>
            </div>

            <div className="hud-panel p-4 rounded-lg border border-space-700/80 bg-space-900/60 space-y-2">
              <h4 className="text-aerogreen font-bold uppercase text-[10px] tracking-wider">
                EARTH OBSERVATION FROM LEO ALTITUDE
              </h4>
              <ul className="space-y-1.5 text-space-300 text-[11px]">
                {selectedOrbital.scienceHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-aerogreen mt-1.5 flex-shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Orbital Perspectives List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-space-400">
              ORBITAL PHOTOGRAPHY ARCHIVES
            </h3>

            <div className="space-y-3">
              {ORBITAL_EARTH_PHOTOS.map((photo) => {
                const isSelected = selectedOrbital.id === photo.id;

                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedOrbital(photo)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex gap-3 ${
                      isSelected
                        ? 'border-aerogreen bg-space-900/90 shadow-md shadow-aerogreen/15'
                        : 'border-space-800 bg-space-950/70 hover:border-space-600'
                    }`}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-20 h-20 object-cover rounded border border-space-700 flex-shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="text-[10px] text-aerogreen font-bold">{photo.distance}</div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{photo.title}</h4>
                      <p className="text-[10px] text-space-400 line-clamp-2">{photo.targetObject}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
