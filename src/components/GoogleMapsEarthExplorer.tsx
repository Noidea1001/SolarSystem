'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Navigation,
  Search,
  Layers,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  MapPin,
  Globe,
  X,
  Compass,
  Satellite,
  Moon,
  CloudRain,
} from 'lucide-react';
import { computeSolarTerminatorPolygon } from '../utils/ephemeris';

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
  { id: 'tha', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, zoom: 12 },
  { id: 'vnm', name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lng: 105.8542, zoom: 12 },
  { id: 'sgp', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, zoom: 12 },
  { id: 'jpn', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, zoom: 12 },
  { id: 'fra', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, zoom: 12 },
  { id: 'gbr', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, zoom: 12 },
  { id: 'usa', name: 'Washington D.C.', country: 'United States', lat: 38.9072, lng: -77.0369, zoom: 11 },
  { id: 'ksc', name: 'NASA Kennedy Space Center', country: 'United States', lat: 28.5729, lng: -80.649, zoom: 14 },
  { id: 'chn', name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, zoom: 11 },
  { id: 'ind', name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.209, zoom: 11 },
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
  isEnteringFromSpace?: boolean;
  onReturnToSpace: () => void;
}

export default function GoogleMapsEarthExplorer({
  initialLat = 12.5657,
  initialLng = 104.991,
  initialZoom = 7,
  isEnteringFromSpace = true,
  onReturnToSpace,
}: GoogleMapsEarthExplorerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const clickMarkerRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const issMarkerRef = useRef<any>(null);
  const issPathRef = useRef<any>(null);
  const terminatorPolygonRef = useRef<any>(null);
  const weatherLayerRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<'google-hybrid' | 'esri-satellite' | 'google-roads'>('google-hybrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: initialLat,
    lng: initialLng,
    zoom: initialZoom,
  });
  const [gpsStatus, setGpsStatus] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [inspectedPoint, setInspectedPoint] = useState<InspectedPoint | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAscending, setIsAscending] = useState(false);
  const [showTerminator, setShowTerminator] = useState(false);
  const [showWeatherRadar, setShowWeatherRadar] = useState(false);
  const [issCoords, setIssCoords] = useState<{ lat: number; lng: number; alt: number; vel: number } | null>(null);

  // Return to Space with smooth flyout animation
  const handleReturnToSpace = () => {
    setIsAscending(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentCoords.lat, currentCoords.lng], 3, { duration: 0.8 });
    }
    setTimeout(() => {
      onReturnToSpace();
    }, 650);
  };

  // Initialize Leaflet Map with Google Maps Satellite Hybrid Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const startZoom = isEnteringFromSpace ? Math.max(3, initialZoom - 3) : initialZoom;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: startZoom,
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
          attribution: 'Esri, Maxar',
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

      // Click Anywhere to Inspect Country / Location
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;

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
          title: `Coordinates: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
          subtitle: 'Querying location telemetry...',
          country: 'Detecting...',
        });

        // Reverse Geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const primaryName = addr.city || addr.town || addr.village || addr.municipality || addr.state || data.name || 'Location';
            const countryName = addr.country || 'Territory';
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
              country: 'International Territory',
            });
          }
        } catch {
          setInspectedPoint({
            lat,
            lng,
            title: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
            subtitle: 'Direct Geographic GPS Coordinates',
            country: 'Earth Surface',
          });
        }
      });

      // Smooth arrival flight animation from orbit down to ground level
      if (isEnteringFromSpace) {
        setTimeout(() => {
          if (mapInstanceRef.current && isMounted) {
            mapInstanceRef.current.flyTo([initialLat, initialLng], initialZoom, { duration: 1.8 });
          }
        }, 150);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialLat, initialLng, initialZoom, isEnteringFromSpace]);

  // Live ISS Orbital Satellite Tracker on Google Maps
  useEffect(() => {
    let isMounted = true;
    const historyTrack: [number, number][] = [];

    const updateIssMarker = async () => {
      try {
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !mapInstanceRef.current || typeof data.latitude !== 'number') return;

        const lat = data.latitude;
        const lng = data.longitude;
        const alt = data.altitude || 418;
        const vel = data.velocity || 27580;

        setIssCoords({ lat, lng, alt, vel });
        historyTrack.push([lat, lng]);
        if (historyTrack.length > 40) historyTrack.shift();

        const L = await import('leaflet');
        if (!isMounted || !mapInstanceRef.current) return;

        if (!issMarkerRef.current) {
          const issIcon = L.divIcon({
            className: 'custom-iss-marker',
            html: `<div style="display:flex;align-items:center;gap:4px;background:rgba(2,6,23,0.9);border:1.5px solid #10b981;padding:2px 6px;border-radius:999px;color:#10b981;font-family:monospace;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 0 14px rgba(16,185,129,0.5);">
              <span style="width:6px;height:6px;border-radius:999px;background:#10b981;display:inline-block;"></span>
              ISS LIVE
            </div>`,
            iconSize: [72, 22],
            iconAnchor: [36, 11],
          });

          issMarkerRef.current = L.marker([lat, lng], { icon: issIcon }).addTo(mapInstanceRef.current);
        } else {
          issMarkerRef.current.setLatLng([lat, lng]);
        }

        if (issPathRef.current) {
          issPathRef.current.setLatLngs(historyTrack);
        } else if (historyTrack.length > 1) {
          issPathRef.current = L.polyline(historyTrack, {
            color: '#10b981',
            weight: 2,
            dashArray: '4, 6',
            opacity: 0.8,
          }).addTo(mapInstanceRef.current);
        }
      } catch {
        // Ignore transient network errors
      }
    };

    updateIssMarker();
    const interval = setInterval(updateIssMarker, 5500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Toggle Day/Night Solar Terminator Shadow Overlay
  const handleToggleTerminator = async () => {
    const nextState = !showTerminator;
    setShowTerminator(nextState);
    if (!mapInstanceRef.current) return;

    if (terminatorPolygonRef.current) {
      mapInstanceRef.current.removeLayer(terminatorPolygonRef.current);
      terminatorPolygonRef.current = null;
    }

    if (nextState) {
      const L = await import('leaflet');
      const coords = computeSolarTerminatorPolygon(new Date());
      terminatorPolygonRef.current = L.polygon(coords, {
        color: '#38bdf8',
        weight: 1.5,
        fillColor: '#020617',
        fillOpacity: 0.52,
        interactive: false,
      }).addTo(mapInstanceRef.current);
      setGpsStatus('Solar Day/Night Terminator Active');
    } else {
      setGpsStatus('');
    }
  };

  // Toggle Live Global Weather Precipitation Radar Overlay
  const handleToggleWeatherRadar = async () => {
    const nextState = !showWeatherRadar;
    setShowWeatherRadar(nextState);
    if (!mapInstanceRef.current) return;

    if (weatherLayerRef.current) {
      mapInstanceRef.current.removeLayer(weatherLayerRef.current);
      weatherLayerRef.current = null;
    }

    if (nextState) {
      try {
        const L = await import('leaflet');
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        const pastFrames = data?.radar?.past;
        if (pastFrames && pastFrames.length > 0 && mapInstanceRef.current) {
          const latestFrame = pastFrames[pastFrames.length - 1];
          weatherLayerRef.current = L.tileLayer(
            `https://tilecache.rainviewer.com${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`,
            {
              opacity: 0.65,
              maxZoom: 19,
              attribution: 'RainViewer Weather Radar',
            }
          ).addTo(mapInstanceRef.current);
          setGpsStatus('Live Global Precipitation Radar Active');
        }
      } catch {
        setGpsStatus('Weather Radar Feed Unavailable');
      }
    } else {
      setGpsStatus('');
    }
  };

  // Fly to Live ISS Coordinates
  const handleTrackIss = () => {
    if (!issCoords || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([issCoords.lat, issCoords.lng], 5, { duration: 1.5 });
    setInspectedPoint({
      lat: issCoords.lat,
      lng: issCoords.lng,
      title: 'International Space Station (ISS)',
      subtitle: `Orbital Altitude: ${issCoords.alt.toFixed(1)} km | Velocity: ${Math.round(issCoords.vel).toLocaleString()} km/h`,
      country: 'Low Earth Orbit (LEO)',
    });
  };

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

    setInspectedPoint({
      lat: c.lat,
      lng: c.lng,
      title: c.name,
      subtitle: `${c.country} &bull; Coordinates: ${c.lat.toFixed(4)}°, ${c.lng.toFixed(4)}°`,
      country: c.country,
    });
  };

  // Search Submit (Geocoding via OpenStreetMap Nominatim)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    setGpsStatus(`Searching: "${searchQuery}"...`);

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
        mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 2.0 });
        setGpsStatus(`Locked: ${item.display_name.split(',')[0]}`);

        setInspectedPoint({
          lat,
          lng: lon,
          title: item.display_name.split(',')[0],
          subtitle: item.display_name,
          country: item.display_name.split(',').slice(-1)[0].trim(),
        });
      } else {
        setGpsStatus(`No location found for "${searchQuery}"`);
      }
    } catch {
      setIsSearching(false);
      setGpsStatus('Search timed out');
    }
  };

  // Pinpoint Real GPS Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported');
      return;
    }

    setIsLocating(true);
    setGpsStatus('Acquiring GPS lock...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsStatus(`GPS: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}° (±${Math.round(accuracy)}m)`);

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
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #10b981;
                    border: 2.5px solid #ffffff;
                    box-shadow: 0 0 16px #10b981;
                  "></div>
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            userMarkerRef.current = L.marker([latitude, longitude], { icon: gpsIcon }).addTo(mapInstanceRef.current);
            mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 2.2 });

            setInspectedPoint({
              lat: latitude,
              lng: longitude,
              title: 'Your Current Live Location',
              subtitle: `GPS accuracy within ±${Math.round(accuracy)} meters`,
              country: 'Current Location',
            });
          });
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsStatus(`GPS fallback: ${err.message}`);
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

      {/* Top Floating Header: Single Clean Row */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
        {/* Left: Modern Clean Search Input Pill */}
        <div className="pointer-events-auto flex items-center flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="flex items-center bg-space-950/85 backdrop-blur-xl border border-space-800 rounded-full shadow-2xl px-3.5 py-1.5 text-xs focus-within:border-aeroblue transition-all">
              <Search className="w-3.5 h-3.5 text-space-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search country, city, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-space-500 focus:outline-none text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-space-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="ml-2 px-3 py-1 rounded-full bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold text-[10px] transition-colors flex-shrink-0 cursor-pointer"
              >
                {isSearching ? '...' : 'SEARCH'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Return to 3D Solar System Pill */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={handleReturnToSpace}
            className="px-4 py-2 rounded-full bg-aeroamber hover:bg-aeroamber-light text-space-950 font-bold text-xs transition-all flex items-center gap-2 shadow-xl shadow-aeroamber/20 cursor-pointer"
            title="Return to 3D Solar System"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RETURN TO SOLAR SYSTEM</span>
          </button>
        </div>
      </div>

      {/* Sub-Header: Clean Horizontal Scrollable Destination Chips */}
      <div className="absolute top-16 inset-x-4 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full py-1 scrollbar-none">
          {QUICK_COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleFlyTo(c)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                c.id === 'khm' || c.id === 'angkor' || c.id === 'pp'
                  ? 'bg-aeroblue/20 text-aeroblue-light border border-aeroblue/40 hover:bg-aeroblue/30'
                  : 'bg-space-950/75 text-space-300 hover:text-white hover:bg-space-900 border border-space-800'
              }`}
            >
              <MapPin className="w-3 h-3 text-aeroblue" />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sleek Location Card (When point is clicked or searched) */}
      {inspectedPoint && (
        <div className="absolute top-28 left-4 z-20 pointer-events-auto max-w-sm animate-in fade-in duration-200">
          <div className="bg-space-950/90 backdrop-blur-xl p-3.5 rounded-2xl border border-aeroblue/40 shadow-2xl space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-aeroblue/20 text-aeroblue border border-aeroblue/30 font-bold uppercase">
                  {inspectedPoint.country}
                </span>
                <h3 className="text-sm font-bold text-white mt-1 leading-tight">{inspectedPoint.title}</h3>
              </div>
              <button
                onClick={() => setInspectedPoint(null)}
                className="p-1 rounded-full hover:bg-space-800 text-space-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-space-300 leading-relaxed line-clamp-2">{inspectedPoint.subtitle}</p>

            <div className="pt-2 border-t border-space-800 flex items-center justify-between text-[10px]">
              <div className="text-space-400 font-mono">
                {inspectedPoint.lat.toFixed(4)}°, {inspectedPoint.lng.toFixed(4)}°
              </div>
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([inspectedPoint.lat, inspectedPoint.lng], 16, { duration: 1.5 });
                  }
                }}
                className="px-2.5 py-1 rounded-full bg-aeroblue text-space-950 font-bold hover:bg-aeroblue-light transition-colors"
              >
                ZOOM CLOSER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-Left Minimal 1-Line Telemetry Pill */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-space-950/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-space-800 text-[10px] text-space-300 font-mono shadow-xl">
          <span className="w-2 h-2 rounded-full bg-aerogreen animate-pulse" />
          <span>{currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E</span>
          <span className="text-space-600">|</span>
          <span>Zoom: {Math.round(currentCoords.zoom)}x</span>
          {gpsStatus && (
            <>
              <span className="text-space-600">|</span>
              <span className="text-aeroblue font-bold">{gpsStatus}</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom-Right Clean Floating Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        {/* Orbital & Atmospheric Overlays Pill */}
        <div className="pointer-events-auto flex items-center gap-1 bg-space-950/80 backdrop-blur-xl p-1 rounded-full border border-space-800 shadow-xl text-xs">
          {issCoords && (
            <button
              onClick={handleTrackIss}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-aerogreen/15 hover:bg-aerogreen text-aerogreen hover:text-space-950 border border-aerogreen/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Fly to Live International Space Station (ISS)"
            >
              <Satellite className="w-3 h-3" />
              <span>ISS LIVE</span>
            </button>
          )}

          <button
            onClick={handleToggleTerminator}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              showTerminator
                ? 'bg-aeroblue text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white'
            }`}
            title="Toggle Real-Time Day/Night Solar Terminator Shadow"
          >
            <Moon className="w-3 h-3" />
            <span>DAY/NIGHT</span>
          </button>

          <button
            onClick={handleToggleWeatherRadar}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              showWeatherRadar
                ? 'bg-aeroamber text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white'
            }`}
            title="Toggle Live Global Weather Precipitation Radar"
          >
            <CloudRain className="w-3 h-3" />
            <span>RADAR</span>
          </button>
        </div>

        {/* Layer Selector Pill */}
        <div className="pointer-events-auto flex items-center gap-1 bg-space-950/80 backdrop-blur-xl p-1 rounded-full border border-space-800 shadow-xl text-xs">
          <button
            onClick={() => handleSwitchLayer('google-hybrid')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              activeLayer === 'google-hybrid'
                ? 'bg-aeroblue text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white'
            }`}
          >
            SATELLITE
          </button>

          <button
            onClick={() => handleSwitchLayer('esri-satellite')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              activeLayer === 'esri-satellite'
                ? 'bg-aeroblue text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white'
            }`}
          >
            TRUE COLOR
          </button>

          <button
            onClick={() => handleSwitchLayer('google-roads')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              activeLayer === 'google-roads'
                ? 'bg-aeroblue text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white'
            }`}
          >
            STREETS
          </button>
        </div>

        {/* Minimal Icon Controls Stack */}
        <div className="pointer-events-auto flex items-center gap-1 bg-space-950/80 backdrop-blur-xl p-1 rounded-full border border-space-800 shadow-xl">
          <button
            onClick={handleLocateMe}
            className={`p-2 rounded-full transition-all ${
              isLocating
                ? 'bg-aerogreen text-space-950 animate-pulse'
                : 'bg-space-900 hover:bg-space-850 text-aerogreen'
            }`}
            title="Pinpoint My GPS Location"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-space-800" />

          <button
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomIn()}
            className="p-2 rounded-full bg-space-900 hover:bg-space-850 text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomOut()}
            className="p-2 rounded-full bg-space-900 hover:bg-space-850 text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([12.5657, 104.991], 3, { duration: 1.5 });
              }
            }}
            className="p-2 rounded-full bg-space-900 hover:bg-space-850 text-aeroblue transition-colors"
            title="Full World View"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Atmospheric Ascent Overlay when returning to 3D Space */}
      {isAscending && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 animate-cloud-ascend bg-gradient-radial from-white/80 via-aeroblue/40 to-space-950/90" />
          <div className="relative z-10 text-center font-mono space-y-1.5 bg-space-950/80 px-6 py-3 rounded-2xl border border-aeroblue/40 backdrop-blur-md shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-aeroblue mx-auto animate-ping" />
            <div className="text-xs font-bold text-white tracking-widest uppercase">
              ASCENDING INTO EXOSPHERE // RE-ENTERING SPACE
            </div>
            <div className="text-[10px] text-aeroblue-light font-bold">DISENGAGING TERRESTRIAL SATELLITE GRID</div>
          </div>
        </div>
      )}
    </div>
  );
}
