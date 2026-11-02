'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Navigation,
  Search,
  Layers,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Globe,
  X,
  Compass,
  Moon,
  CloudRain,
  Eye,
  EyeOff,
} from 'lucide-react';
import { computeSolarTerminatorPolygon } from '../utils/ephemeris';

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
  onPrepareReturnToSpace?: () => void;
}

export default function GoogleMapsEarthExplorer({
  initialLat = 12.5657,
  initialLng = 104.991,
  initialZoom = 7,
  isEnteringFromSpace = true,
  onReturnToSpace,
  onPrepareReturnToSpace,
}: GoogleMapsEarthExplorerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const clickMarkerRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
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

  // Clean UI / Minimalist Map Mode
  const [isUiHidden, setIsUiHidden] = useState(false);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const interactTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAscendingRef = useRef(false);

  // Return to Space with smooth flyout animation
  const handleReturnToSpace = () => {
    if (isAscendingRef.current) return;
    isAscendingRef.current = true;
    setIsAscending(true);
    onPrepareReturnToSpace?.();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentCoords.lat, currentCoords.lng], 2, { duration: 0.75 });
    }
    setTimeout(() => {
      onReturnToSpace();
    }, 700);
  };

  // Zoom Out Handler with Auto-Switch to 3D Round Earth
  const handleZoomOutOrReturn = () => {
    if (!mapInstanceRef.current || isAscendingRef.current) return;
    const currentZ = mapInstanceRef.current.getZoom();
    if (currentZ <= 3.6) {
      handleReturnToSpace();
    } else {
      mapInstanceRef.current.zoomOut();
    }
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

      // User interaction listener to auto-fade UI during pan/zoom for clean immersion
      const triggerInteraction = () => {
        setIsMapInteracting(true);
        if (interactTimeoutRef.current) clearTimeout(interactTimeoutRef.current);
        interactTimeoutRef.current = setTimeout(() => {
          setIsMapInteracting(false);
        }, 2200);
      };

      map.on('movestart', triggerInteraction);
      map.on('zoomstart', triggerInteraction);

      // Map Move Telemetry Listener
      map.on('move', () => {
        const c = map.getCenter();
        const z = map.getZoom();
        setCurrentCoords({ lat: c.lat, lng: c.lng, zoom: z });
      });

      // Auto-switch to 3D Solar System round Earth when user zooms out to planetary scale
      const checkZoomOutThreshold = () => {
        if (!mapInstanceRef.current || isAscendingRef.current) return;
        const z = mapInstanceRef.current.getZoom();
        if (z <= 3.3) {
          handleReturnToSpace();
        }
      };

      map.on('zoomend', checkZoomOutThreshold);
      map.on('zoom', () => {
        if (!mapInstanceRef.current || isAscendingRef.current) return;
        const z = mapInstanceRef.current.getZoom();
        if (z <= 3.1) {
          handleReturnToSpace();
        }
      });

      // Scroll wheel listener: returning to 3D spherical Earth on wheel zoom-out at planetary scale
      const containerEl = mapContainerRef.current;
      const onContainerWheel = (e: WheelEvent) => {
        if (e.deltaY > 0 && mapInstanceRef.current && !isAscendingRef.current) {
          const z = mapInstanceRef.current.getZoom();
          if (z <= 3.6) {
            e.preventDefault();
            handleReturnToSpace();
          }
        }
      };

      if (containerEl) {
        containerEl.addEventListener('wheel', onContainerWheel, { passive: false });
      }

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
    <div
      className={`relative w-screen h-screen overflow-hidden bg-space-950 font-mono select-none transition-all duration-700 ease-in-out ${
        isAscending
          ? 'scale-[0.45] rounded-full opacity-0 shadow-[0_0_120px_rgba(56,189,248,0.95)] pointer-events-none'
          : 'scale-100 rounded-none opacity-100'
      }`}
    >
      {/* Fullscreen Interactive Leaflet Satellite Map */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Discrete Floating "Show HUD" Pill when UI is explicitly hidden */}
      {isUiHidden && (
        <div className="absolute top-4 right-4 z-30 pointer-events-auto animate-in fade-in duration-200">
          <button
            onClick={() => setIsUiHidden(false)}
            className="flex items-center gap-1.5 bg-space-950/85 hover:bg-space-900 border border-aeroblue/50 text-aeroblue px-3.5 py-1.5 rounded-full backdrop-blur-xl text-[11px] font-bold shadow-2xl transition-all cursor-pointer"
            title="Restore Navigation Controls"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>SHOW HUD</span>
          </button>
        </div>
      )}

      {/* Top Floating Header: Clean, Minimalist, Auto-Hiding during Pan/Zoom */}
      <div
        className={`absolute top-2 sm:top-4 inset-x-2 sm:inset-x-4 z-20 flex items-center justify-between gap-1.5 sm:gap-3 pointer-events-none transition-all duration-300 ${
          isUiHidden || isMapInteracting || isAscending
            ? 'opacity-0 pointer-events-none -translate-y-3'
            : 'opacity-100 pointer-events-auto translate-y-0'
        }`}
      >
        {/* Left: Search Input Pill */}
        <div className="pointer-events-auto flex items-center gap-2 flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <div className="flex items-center bg-space-950/85 backdrop-blur-xl border border-space-800 rounded-full shadow-2xl px-2.5 sm:px-3.5 py-1.5 text-xs focus-within:border-aeroblue transition-all">
              <Search className="w-3.5 h-3.5 text-space-400 mr-1.5 sm:mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search country, city, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-space-500 focus:outline-none text-[11px] sm:text-xs"
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
                className="ml-1 sm:ml-2 px-2.5 sm:px-3 py-1 rounded-full bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold text-[9px] sm:text-[10px] transition-colors flex-shrink-0 cursor-pointer"
              >
                {isSearching ? '...' : 'SEARCH'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Clear View & Return to 3D Solar System Pill */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Clear View / Hide HUD Button */}
          <button
            onClick={() => setIsUiHidden(true)}
            className="p-1.5 sm:p-2 rounded-full bg-space-950/85 hover:bg-space-900 border border-space-800 text-space-400 hover:text-white backdrop-blur-xl transition-all cursor-pointer shadow-xl"
            title="Clear View (Hide HUD overlays)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          {/* Return to 3D Solar System Button */}
          <button
            onClick={handleReturnToSpace}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-aeroamber hover:bg-aeroamber-light text-space-950 font-bold text-[11px] sm:text-xs transition-all flex items-center gap-1.5 sm:gap-2 shadow-xl shadow-aeroamber/20 cursor-pointer"
            title="Return to 3D Round Earth in Solar System (or Zoom Out)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RETURN TO 3D EARTH</span>
            <span className="sm:hidden">3D EARTH</span>
          </button>
        </div>
      </div>

      {/* Sleek Location Card (When point is clicked or searched) */}
      {inspectedPoint && (
        <div
          className={`absolute top-28 left-4 z-20 pointer-events-auto max-w-sm transition-all duration-300 ${
            isUiHidden || isMapInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
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
                className="p-1 rounded-full hover:bg-space-800 text-space-400 hover:text-white cursor-pointer"
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
                className="px-2.5 py-1 rounded-full bg-aeroblue text-space-950 font-bold hover:bg-aeroblue-light transition-colors cursor-pointer"
              >
                ZOOM CLOSER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-Left Minimal 1-Line Telemetry Pill */}
      <div
        className={`absolute bottom-4 left-4 z-20 pointer-events-none transition-all duration-300 ${
          isUiHidden || isMapInteracting || isAscending ? 'opacity-0' : 'opacity-100'
        }`}
      >
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
      <div
        className={`absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none transition-all duration-300 ${
          isUiHidden || isMapInteracting || isAscending ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Orbital & Atmospheric Overlays Pill */}
        <div className="pointer-events-auto flex items-center gap-1 bg-space-950/80 backdrop-blur-xl p-1 rounded-full border border-space-800 shadow-xl text-xs">
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
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              activeLayer === 'google-hybrid'
                ? 'bg-aeroblue text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white'
            }`}
          >
            SATELLITE
          </button>

          <button
            onClick={() => handleSwitchLayer('esri-satellite')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              activeLayer === 'esri-satellite'
                ? 'bg-aeroblue text-space-950 shadow-sm'
                : 'text-space-400 hover:text-white'
            }`}
          >
            TRUE COLOR
          </button>

          <button
            onClick={() => handleSwitchLayer('google-roads')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
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
            className={`p-2 rounded-full transition-all cursor-pointer ${
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
            className="p-2 rounded-full bg-space-900 hover:bg-space-850 text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomOutOrReturn}
            className="p-2 rounded-full bg-space-900 hover:bg-space-850 text-white transition-colors cursor-pointer"
            title="Zoom Out (or Zoom Out to 3D Round Earth)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReturnToSpace}
            className="p-2 rounded-full bg-space-900 hover:bg-space-850 text-aeroblue transition-colors cursor-pointer"
            title="Switch to 3D Spherical Earth in Space"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Seamless Transition Overlay to 3D Round Earth */}
      {isAscending && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-end pb-12 overflow-hidden animate-in fade-in duration-200">
          <div className="relative z-10 text-center font-mono bg-space-950/85 px-5 py-2 rounded-full border border-aeroblue/40 backdrop-blur-md shadow-2xl">
            <div className="text-[11px] font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-aeroblue animate-ping" />
              <span>TRANSITIONING TO 3D ROUND EARTH</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
