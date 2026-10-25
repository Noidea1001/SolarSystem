'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Navigation,
  Search,
  Layers,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Compass,
  MapPin,
  Crosshair,
  Globe,
  Sun,
  Moon,
  X,
} from 'lucide-react';

interface CountryQuickLink {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

const QUICK_COUNTRIES: CountryQuickLink[] = [
  { id: 'khm', name: 'Cambodia', lat: 12.5657, lng: 104.991, zoom: 7 },
  { id: 'angkor', name: 'Angkor Wat', lat: 13.4125, lng: 103.867, zoom: 15 },
  { id: 'pp', name: 'Phnom Penh', lat: 11.5564, lng: 104.9282, zoom: 13 },
  { id: 'usa', name: 'United States', lat: 37.0902, lng: -95.7129, zoom: 5 },
  { id: 'fra', name: 'France', lat: 46.2276, lng: 2.2137, zoom: 6 },
  { id: 'jpn', name: 'Japan', lat: 36.2048, lng: 138.2529, zoom: 6 },
  { id: 'chn', name: 'China', lat: 35.8617, lng: 104.1954, zoom: 5 },
  { id: 'ind', name: 'India', lat: 20.5937, lng: 78.9629, zoom: 5 },
  { id: 'tha', name: 'Thailand', lat: 15.87, lng: 100.9925, zoom: 6 },
  { id: 'vnm', name: 'Vietnam', lat: 14.0583, lng: 108.2772, zoom: 6 },
  { id: 'sgp', name: 'Singapore', lat: 1.3521, lng: 103.8198, zoom: 12 },
  { id: 'deu', name: 'Germany', lat: 51.1657, lng: 10.4515, zoom: 6 },
  { id: 'gbr', name: 'United Kingdom', lat: 55.3781, lng: -3.436, zoom: 6 },
  { id: 'aus', name: 'Australia', lat: -25.2744, lng: 133.7751, zoom: 5 },
  { id: 'bra', name: 'Brazil', lat: -14.235, lng: -51.9253, zoom: 5 },
];

interface GoogleMapsEarthExplorerProps {
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  onReturnToSpace: () => void;
}

export default function GoogleMapsEarthExplorer({
  initialLat = 12.5657,
  initialLng = 104.991,
  initialZoom = 7,
  onReturnToSpace,
}: GoogleMapsEarthExplorerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<'google-hybrid' | 'esri-satellite' | 'google-roads'>('google-hybrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: initialLat,
    lng: initialLng,
    zoom: initialZoom,
  });
  const [gpsStatus, setGpsStatus] = useState<string>('Ready to pinpoint your real GPS position');
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet on client-side
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        minZoom: 2,
        maxZoom: 19,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // Define Tile Layers
      const googleHybrid = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps Satellite Imagery',
      });

      const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      });

      const esriLabels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      });

      const googleRoads = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps',
      });

      // Default to Google Hybrid (Real Satellite + Country Names & Borders)
      googleHybrid.addTo(map);
      layerGroupRef.current = { googleHybrid, esriSatellite, esriLabels, googleRoads };

      // Map Move Listener
      map.on('move', () => {
        const c = map.getCenter();
        const z = map.getZoom();
        setCurrentCoords({ lat: c.lat, lng: c.lng, zoom: z });
      });

      // Custom pulsing marker icon for countries
      const createBeaconIcon = (label: string, isCambodia: boolean) => {
        return L.divIcon({
          className: 'custom-map-beacon',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
              <div style="
                background: ${isCambodia ? 'rgba(8, 47, 73, 0.95)' : 'rgba(15, 23, 42, 0.9)'};
                color: ${isCambodia ? '#38bdf8' : '#f8fafc'};
                border: 1.5px solid ${isCambodia ? '#38bdf8' : '#64748b'};
                border-radius: 6px;
                padding: 3px 8px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.5px;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                margin-bottom: 4px;
              ">
                ${label.toUpperCase()}
              </div>
              <div style="
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: ${isCambodia ? '#38bdf8' : '#94a3b8'};
                border: 2px solid #ffffff;
                box-shadow: 0 0 10px ${isCambodia ? '#38bdf8' : '#64748b'};
              "></div>
            </div>
          `,
          iconSize: [120, 40],
          iconAnchor: [60, 36],
        });
      };

      // Add Country Hub Markers
      QUICK_COUNTRIES.forEach((c) => {
        const isKh = c.id === 'khm' || c.id === 'angkor' || c.id === 'pp';
        const marker = L.marker([c.lat, c.lng], {
          icon: createBeaconIcon(c.name, isKh),
        }).addTo(map);

        marker.on('click', () => {
          map.flyTo([c.lat, c.lng], c.zoom, { duration: 1.5 });
        });
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialLat, initialLng, initialZoom]);

  // Switch Layer
  const handleSwitchLayer = (type: 'google-hybrid' | 'esri-satellite' | 'google-roads') => {
    setActiveLayer(type);
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const { googleHybrid, esriSatellite, esriLabels, googleRoads } = layerGroupRef.current;
    mapInstanceRef.current.removeLayer(googleHybrid);
    mapInstanceRef.current.removeLayer(esriSatellite);
    mapInstanceRef.current.removeLayer(esriLabels);
    mapInstanceRef.current.removeLayer(googleRoads);

    if (type === 'google-hybrid') {
      googleHybrid.addTo(mapInstanceRef.current);
    } else if (type === 'esri-satellite') {
      esriSatellite.addTo(mapInstanceRef.current);
      esriLabels.addTo(mapInstanceRef.current);
    } else if (type === 'google-roads') {
      googleRoads.addTo(mapInstanceRef.current);
    }
  };

  // Fly to country
  const handleFlyTo = (c: CountryQuickLink) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([c.lat, c.lng], c.zoom, { duration: 1.8 });
  };

  // Search handler (Geocoding via Nominatim OpenStreetMap API)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    try {
      setGpsStatus(`Searching for: ${searchQuery}...`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        mapInstanceRef.current.flyTo([lat, lon], 12, { duration: 2.0 });
        setGpsStatus(`Centered on: ${item.display_name.split(',')[0]}`);
      } else {
        setGpsStatus(`No location found for "${searchQuery}".`);
      }
    } catch {
      setGpsStatus('Search query timed out. Please try again.');
    }
  };

  // Pinpoint Real GPS Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by this browser');
      return;
    }

    setIsLocating(true);
    setGpsStatus('Acquiring high-precision GPS lock on your location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsStatus(`Locked: ${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E (±${Math.round(accuracy)}m)`);

        if (mapInstanceRef.current) {
          import('leaflet').then((L) => {
            if (userMarkerRef.current) {
              mapInstanceRef.current.removeLayer(userMarkerRef.current);
            }

            const gpsIcon = L.divIcon({
              className: 'gps-user-beacon',
              html: `
                <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                  <div style="
                    background: rgba(6, 78, 59, 0.95);
                    color: #34d399;
                    border: 2px solid #10b981;
                    border-radius: 6px;
                    padding: 3px 8px;
                    font-size: 11px;
                    font-weight: 800;
                    white-space: nowrap;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.8);
                    margin-bottom: 4px;
                  ">
                    YOUR CURRENT GPS LOCATION
                  </div>
                  <div style="
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #10b981;
                    border: 2.5px solid #ffffff;
                    box-shadow: 0 0 16px #10b981;
                  "></div>
                </div>
              `,
              iconSize: [180, 50],
              iconAnchor: [90, 44],
            });

            userMarkerRef.current = L.marker([latitude, longitude], { icon: gpsIcon }).addTo(mapInstanceRef.current);
            mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 2.2 });
          });
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsStatus(`GPS Fallback to Cambodia: ${err.message}`);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([12.5657, 104.991], 8, { duration: 1.8 });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-950 font-mono select-none">
      {/* Fullscreen Interactive Leaflet Satellite Map */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Top Glassmorphic Navigation Bar */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Brand & Mode Switch */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-space-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-space-700/80 shadow-2xl">
          <div className="w-7 h-7 rounded-lg bg-aeroblue/20 border border-aeroblue/40 flex items-center justify-center text-aeroblue">
            <Globe className="w-4 h-4 text-aeroblue" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>TERRESTRIAL SATELLITE EXPLORER</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-aeroblue/20 text-aeroblue-light rounded border border-aeroblue/40">
                GOOGLE MAPS SATELLITE
              </span>
            </div>
            <div className="text-[10px] text-space-400">HIGH-RESOLUTION TRUE PHOTOGRAPHIC EARTH MAP</div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pointer-events-auto relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-space-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search country, province, city, landmark (e.g. Cambodia, Angkor Wat, Paris)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-space-950/90 backdrop-blur-md border border-space-700/80 rounded-xl pl-9 pr-20 py-2 text-xs text-white placeholder-space-500 focus:outline-none focus:border-aeroblue shadow-2xl"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded bg-space-800 hover:bg-space-700 text-aeroblue font-bold text-[10px] transition-colors"
          >
            GO
          </button>
        </form>

        {/* Return to 3D Space Simulation Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onReturnToSpace}
            className="px-3.5 py-2 rounded-xl bg-aeroamber hover:bg-aeroamber-light text-space-950 font-bold text-xs transition-all flex items-center gap-2 shadow-xl shadow-aeroamber/25 cursor-pointer"
            title="Return to 3D Outer Space Simulation"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETURN TO 3D SPACE VIEW</span>
          </button>
        </div>
      </div>

      {/* Quick Country Fly-to Bar */}
      <div className="absolute top-20 inset-x-4 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-space-950/90 backdrop-blur-md p-1.5 rounded-xl border border-space-700/80 shadow-2xl overflow-x-auto max-w-full text-xs">
          <span className="text-[10px] text-space-400 font-bold px-2 uppercase">QUICK FLY-TO:</span>
          {QUICK_COUNTRIES.slice(0, 10).map((c) => (
            <button
              key={c.id}
              onClick={() => handleFlyTo(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                c.id === 'khm' || c.id === 'angkor'
                  ? 'bg-aeroblue/20 text-aeroblue-light border border-aeroblue/40 hover:bg-aeroblue/30'
                  : 'bg-space-900 text-space-300 hover:text-white hover:bg-space-800 border border-space-800'
              }`}
            >
              <MapPin className="w-3 h-3 text-aeroblue" />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Left GPS HUD */}
      <div className="absolute bottom-6 left-4 z-20 pointer-events-none max-w-sm">
        <div className="pointer-events-auto bg-space-950/90 backdrop-blur-md p-3.5 rounded-xl border border-space-700/80 space-y-2.5 shadow-2xl text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-aerogreen animate-pulse" />
              <span className="text-white font-bold text-xs uppercase">ORBITAL TELEMETRY</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-space-900 text-space-300 border border-space-800">
              ZOOM: {Math.round(currentCoords.zoom)}x
            </span>
          </div>

          {/* Pinpoint GPS Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="w-full py-2.5 px-3 rounded-lg bg-aerogreen hover:bg-aerogreen-light text-space-950 font-bold transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-aerogreen/20"
          >
            <Navigation className="w-4 h-4" />
            <span>PINPOINT MY LIVE GPS LOCATION</span>
          </button>
          <div className="text-[10px] text-space-400 text-center leading-relaxed">{gpsStatus}</div>

          {/* Coordinate Readout */}
          <div className="p-2 bg-space-900 rounded border border-space-800 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-space-400">LATITUDE:</span>
              <span className="text-white font-bold">{currentCoords.lat.toFixed(5)}° N</span>
            </div>
            <div className="flex justify-between">
              <span className="text-space-400">LONGITUDE:</span>
              <span className="text-white font-bold">{currentCoords.lng.toFixed(5)}° E</span>
            </div>
            <div className="flex justify-between">
              <span className="text-space-400">MAP ENGINE:</span>
              <span className="text-aeroblue font-bold">GOOGLE SATELLITE + HYBRID LABELS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Layer Switcher & Zoom Controls on Right */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        {/* Layer Selector */}
        <div className="pointer-events-auto flex items-center gap-1 bg-space-950/90 backdrop-blur-md p-1.5 rounded-xl border border-space-700/80 shadow-2xl text-xs">
          <button
            onClick={() => handleSwitchLayer('google-hybrid')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeLayer === 'google-hybrid'
                ? 'bg-aeroblue text-space-950'
                : 'text-space-400 hover:text-white hover:bg-space-900'
            }`}
          >
            GOOGLE SATELLITE HYBRID
          </button>

          <button
            onClick={() => handleSwitchLayer('esri-satellite')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeLayer === 'esri-satellite'
                ? 'bg-aeroblue text-space-950'
                : 'text-space-400 hover:text-white hover:bg-space-900'
            }`}
          >
            NASA/ESRI TRUE COLOR
          </button>

          <button
            onClick={() => handleSwitchLayer('google-roads')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeLayer === 'google-roads'
                ? 'bg-aeroblue text-space-950'
                : 'text-space-400 hover:text-white hover:bg-space-900'
            }`}
          >
            STREETS & BORDERS
          </button>
        </div>

        {/* Zoom In / Out Buttons */}
        <div className="pointer-events-auto flex items-center gap-1 bg-space-950/90 backdrop-blur-md p-1.5 rounded-xl border border-space-700/80 shadow-2xl">
          <button
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomIn()}
            className="p-2 rounded-lg bg-space-900 hover:bg-space-800 text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomOut()}
            className="p-2 rounded-lg bg-space-900 hover:bg-space-800 text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
