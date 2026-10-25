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
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface CountryQuickLink {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  zoom: number;
}

const QUICK_COUNTRIES: CountryQuickLink[] = [
  { id: 'khm', name: 'Cambodia', country: 'Cambodia', lat: 12.5657, lng: 104.991, zoom: 7 },
  { id: 'angkor', name: 'Angkor Wat', country: 'Cambodia', lat: 13.4125, lng: 103.867, zoom: 15 },
  { id: 'pp', name: 'Phnom Penh', country: 'Cambodia', lat: 11.5564, lng: 104.9282, zoom: 13 },
  { id: 'jpn', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, zoom: 12 },
  { id: 'usa', name: 'Washington D.C.', country: 'United States', lat: 38.9072, lng: -77.0369, zoom: 11 },
  { id: 'ksc', name: 'NASA Kennedy Space Center', country: 'United States', lat: 28.5729, lng: -80.649, zoom: 14 },
  { id: 'fra', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, zoom: 12 },
  { id: 'gbr', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, zoom: 12 },
  { id: 'chn', name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, zoom: 11 },
  { id: 'ind', name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.209, zoom: 11 },
  { id: 'tha', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, zoom: 12 },
  { id: 'vnm', name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lng: 105.8542, zoom: 12 },
  { id: 'sgp', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, zoom: 12 },
  { id: 'egy', name: 'Cairo Pyramids', country: 'Egypt', lat: 29.9792, lng: 31.1342, zoom: 14 },
  { id: 'aus', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, zoom: 12 },
  { id: 'bra', name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, zoom: 12 },
];

interface InspectedPoint {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  country: string;
}

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
  const clickMarkerRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<'google-hybrid' | 'esri-satellite' | 'google-roads'>('google-hybrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: initialLat,
    lng: initialLng,
    zoom: initialZoom,
  });
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('Ready to pinpoint your real GPS position');
  const [isLocating, setIsLocating] = useState(false);
  const [inspectedPoint, setInspectedPoint] = useState<InspectedPoint | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Leaflet Map with Google Maps Satellite Hybrid Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        minZoom: 2,
        maxZoom: 20,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // Add distance scale bar
      L.control.scale({ imperial: true, metric: true, position: 'bottomleft' }).addTo(map);

      // 1. Google Maps Hybrid (Authentic satellite photography + country borders + names + roads)
      const googleHybrid = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: 'Google Maps Satellite',
      });

      // 2. ESRI / Maxar True Color Satellite
      const esriSatellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        }
      );

      const esriLabels = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
        }
      );

      // 3. Google Standard Street Map
      const googleRoads = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: 'Google Maps',
      });

      // Default to Google Satellite Hybrid
      googleHybrid.addTo(map);
      layerGroupRef.current = { googleHybrid, esriSatellite, esriLabels, googleRoads };

      // Map Move Telemetry Listener
      map.on('move', () => {
        const c = map.getCenter();
        const z = map.getZoom();
        setCurrentCoords({ lat: c.lat, lng: c.lng, zoom: z });
      });

      // Cursor Coordinates Tracker
      map.on('mousemove', (e: any) => {
        setCursorCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      // Click Anywhere to Inspect Country / Location
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;

        // Custom pulsing crosshair pin
        const inspectIcon = L.divIcon({
          className: 'inspect-location-beacon',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
              <div style="
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #f59e0b;
                border: 2.5px solid #ffffff;
                box-shadow: 0 0 16px #f59e0b;
              "></div>
              <div style="
                position: absolute;
                top: -6px;
                left: -6px;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 2px dashed #f59e0b;
                animation: spin 6s linear infinite;
              "></div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        if (clickMarkerRef.current) {
          map.removeLayer(clickMarkerRef.current);
        }
        clickMarkerRef.current = L.marker([lat, lng], { icon: inspectIcon }).addTo(map);

        setInspectedPoint({
          lat,
          lng,
          title: `Telemetry Coordinates: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
          subtitle: 'Querying orbital reverse geocoding telemetry...',
          country: 'Detecting territory...',
        });

        // Reverse Geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const primaryName = addr.city || addr.town || addr.village || addr.municipality || addr.state || data.name || 'Terrestrial Location';
            const countryName = addr.country || 'International Territory';
            const detailStr = [addr.county, addr.state, addr.country].filter(Boolean).join(', ');

            setInspectedPoint({
              lat,
              lng,
              title: primaryName,
              subtitle: detailStr || data.display_name,
              country: countryName,
            });
          } else {
            setInspectedPoint({
              lat,
              lng,
              title: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
              subtitle: 'Open Oceanic or Remote Terrestrial Coordinates',
              country: 'International Waters / Territory',
            });
          }
        } catch {
          setInspectedPoint({
            lat,
            lng,
            title: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
            subtitle: 'Direct Geographic GPS Coordinates',
            country: 'Global Earth Surface',
          });
        }
      });

      // Quick Country Hub Markers
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

      QUICK_COUNTRIES.forEach((c) => {
        const isKh = c.id === 'khm' || c.id === 'angkor' || c.id === 'pp';
        const marker = L.marker([c.lat, c.lng], {
          icon: createBeaconIcon(c.name, isKh),
        }).addTo(map);

        marker.on('click', () => {
          map.flyTo([c.lat, c.lng], c.zoom, { duration: 1.6 });
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

  // Switch Tile Layer
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

  // Fly to country preset
  const handleFlyTo = (c: CountryQuickLink) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([c.lat, c.lng], c.zoom, { duration: 1.8 });
  };

  // Search Submit (Geocoding via OpenStreetMap Nominatim)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    setGpsStatus(`Searching orbital database for: "${searchQuery}"...`);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      setIsSearching(false);

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        mapInstanceRef.current.flyTo([lat, lon], 12, { duration: 2.0 });
        setGpsStatus(`Target Acquired: ${item.display_name.split(',')[0]}`);

        setInspectedPoint({
          lat,
          lng: lon,
          title: item.display_name.split(',')[0],
          subtitle: item.display_name,
          country: item.display_name.split(',').slice(-1)[0].trim(),
        });
      } else {
        setGpsStatus(`No location found for "${searchQuery}".`);
      }
    } catch {
      setIsSearching(false);
      setGpsStatus('Search query timed out. Please check network.');
    }
  };

  // Pinpoint Real GPS Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by this browser');
      return;
    }

    setIsLocating(true);
    setGpsStatus('Acquiring high-precision GPS lock on your coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsStatus(`GPS Locked: ${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E (accuracy ±${Math.round(accuracy)}m)`);

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

            setInspectedPoint({
              lat: latitude,
              lng: longitude,
              title: 'Your Current Live Location',
              subtitle: `GPS Accuracy within ±${Math.round(accuracy)} meters`,
              country: 'Current Location',
            });
          });
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsStatus(`GPS fallback to Cambodia: ${err.message}`);
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
              <span>GOOGLE MAPS EARTH SATELLITE</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-aeroblue/20 text-aeroblue-light rounded border border-aeroblue/40">
                100% REAL IMAGERY
              </span>
            </div>
            <div className="text-[10px] text-space-400">HIGH-RESOLUTION TRUE PHOTOGRAPHIC MAP & BORDERS</div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pointer-events-auto relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-space-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search country, province, city, landmark (e.g. Cambodia, Angkor Wat, Tokyo, Paris)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-space-950/90 backdrop-blur-md border border-space-700/80 rounded-xl pl-9 pr-20 py-2 text-xs text-white placeholder-space-500 focus:outline-none focus:border-aeroblue shadow-2xl"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-12 top-2.5 p-0.5 text-space-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold text-[10px] transition-colors"
          >
            {isSearching ? '...' : 'SEARCH'}
          </button>
        </form>

        {/* Primary View Mode Switcher: Google Maps Satellite vs 3D Space */}
        <div className="pointer-events-auto flex items-center gap-2 bg-space-950/90 backdrop-blur-md p-1 rounded-xl border border-space-700/80 shadow-2xl">
          <div className="px-3 py-1.5 rounded-lg bg-aeroblue text-space-950 font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <Globe className="w-3.5 h-3.5" />
            <span>GOOGLE MAPS SATELLITE</span>
          </div>

          <button
            onClick={onReturnToSpace}
            className="px-3 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-aeroamber hover:text-white border border-aeroamber/40 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Switch to 3D Deep Space & Solar System Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-aeroamber" />
            <span>3D COSMIC SPACE VIEW</span>
          </button>
        </div>
      </div>

      {/* Quick Country Fly-to Bar */}
      <div className="absolute top-20 inset-x-4 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-space-950/90 backdrop-blur-md p-1.5 rounded-xl border border-space-700/80 shadow-2xl overflow-x-auto max-w-full text-xs">
          <span className="text-[10px] text-space-400 font-bold px-2 uppercase whitespace-nowrap">QUICK EXPLORE:</span>
          {QUICK_COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleFlyTo(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                c.id === 'khm' || c.id === 'angkor' || c.id === 'pp'
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

      {/* Click-to-Inspect Location Card */}
      {inspectedPoint && (
        <div className="absolute top-36 left-4 z-20 pointer-events-auto max-w-sm">
          <div className="bg-space-950/95 backdrop-blur-md p-4 rounded-xl border border-aeroblue/40 shadow-2xl space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-aeroblue/20 text-aeroblue border border-aeroblue/30 font-bold uppercase">
                  {inspectedPoint.country}
                </span>
                <h3 className="text-sm font-bold text-white mt-1 leading-tight">{inspectedPoint.title}</h3>
              </div>
              <button
                onClick={() => setInspectedPoint(null)}
                className="p-1 rounded hover:bg-space-800 text-space-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-space-300 leading-relaxed line-clamp-3">{inspectedPoint.subtitle}</p>

            <div className="pt-2 border-t border-space-800 flex items-center justify-between text-[10px]">
              <div className="text-space-400">
                LAT: <span className="text-white font-bold">{inspectedPoint.lat.toFixed(4)}°</span> | LNG:{' '}
                <span className="text-white font-bold">{inspectedPoint.lng.toFixed(4)}°</span>
              </div>
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([inspectedPoint.lat, inspectedPoint.lng], 16, { duration: 1.5 });
                  }
                }}
                className="px-2 py-1 rounded bg-aeroblue text-space-950 font-bold hover:bg-aeroblue-light transition-colors"
              >
                ZOOM CLOSER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Left GPS HUD */}
      <div className="absolute bottom-6 left-4 z-20 pointer-events-none max-w-sm">
        <div className="pointer-events-auto bg-space-950/90 backdrop-blur-md p-3.5 rounded-xl border border-space-700/80 space-y-2.5 shadow-2xl text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-aerogreen animate-pulse" />
              <span className="text-white font-bold text-xs uppercase">GEOGRAPHIC TELEMETRY</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-space-900 text-space-300 border border-space-800 font-bold">
              ZOOM: {Math.round(currentCoords.zoom)}x
            </span>
          </div>

          {/* Pinpoint GPS Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="w-full py-2.5 px-3 rounded-lg bg-aerogreen hover:bg-aerogreen-light text-space-950 font-bold transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-aerogreen/20 cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>{isLocating ? 'LOCKING GPS SATELLITES...' : 'PINPOINT MY LIVE GPS LOCATION'}</span>
          </button>
          <div className="text-[10px] text-space-400 text-center leading-relaxed">{gpsStatus}</div>

          {/* Coordinate Readout */}
          <div className="p-2 bg-space-900 rounded border border-space-800 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-space-400">CENTER LATITUDE:</span>
              <span className="text-white font-bold">{currentCoords.lat.toFixed(5)}° N</span>
            </div>
            <div className="flex justify-between">
              <span className="text-space-400">CENTER LONGITUDE:</span>
              <span className="text-white font-bold">{currentCoords.lng.toFixed(5)}° E</span>
            </div>
            {cursorCoords && (
              <div className="flex justify-between text-aeroblue">
                <span className="text-space-400">CURSOR POSITION:</span>
                <span className="font-bold">
                  {cursorCoords.lat.toFixed(4)}°, {cursorCoords.lng.toFixed(4)}°
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-space-400">SATELLITE SOURCE:</span>
              <span className="text-aeroblue font-bold">GOOGLE HYBRID (METRIC ACCURACY)</span>
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
                ? 'bg-aeroblue text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white hover:bg-space-900'
            }`}
          >
            GOOGLE SATELLITE HYBRID
          </button>

          <button
            onClick={() => handleSwitchLayer('esri-satellite')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeLayer === 'esri-satellite'
                ? 'bg-aeroblue text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white hover:bg-space-900'
            }`}
          >
            NASA/ESRI TRUE COLOR
          </button>

          <button
            onClick={() => handleSwitchLayer('google-roads')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeLayer === 'google-roads'
                ? 'bg-aeroblue text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white hover:bg-space-900'
            }`}
          >
            STREETS & BORDERS
          </button>
        </div>

        {/* Zoom In / Out / Reset View */}
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
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([12.5657, 104.991], 3, { duration: 1.5 });
              }
            }}
            className="p-2 rounded-lg bg-space-900 hover:bg-space-800 text-aeroblue transition-colors"
            title="Full Global Earth View"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
