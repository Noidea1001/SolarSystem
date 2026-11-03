'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { X, Scale, ArrowLeftRight, Compass } from 'lucide-react';
import { CELESTIAL_BODIES_PHYSICS, CelestialBodyPhysics } from '../data/celestialBodies';

function RotatingPlanetGlobe({ body, size }: { body: CelestialBodyPhysics; size: number }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const renderSize = Math.max(24, Math.min(size, 145));

    container.innerHTML = '';

    const scene = new THREE.Scene();
    const fov = 42;
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    camera.position.z = body.id === 'saturn' ? 3.8 : 2.65;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(renderSize, renderSize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(4, 2, 4);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const geometry = new THREE.SphereGeometry(1, 48, 48);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(body.textureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.75,
      metalness: 0.08,
    });

    const planetMesh = new THREE.Mesh(geometry, material);
    if (body.axialTiltDeg) {
      planetMesh.rotation.z = (body.axialTiltDeg * Math.PI) / 180;
    }
    scene.add(planetMesh);

    let ringsMesh: THREE.Mesh | null = null;
    if (body.id === 'saturn') {
      const ringGeo = new THREE.RingGeometry(1.22, 2.15, 64);
      const ringTex = textureLoader.load('/textures/planets/saturn_ring.png');
      ringTex.colorSpace = THREE.SRGBColorSpace;
      const ringMat = new THREE.MeshStandardMaterial({
        map: ringTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      ringsMesh = new THREE.Mesh(ringGeo, ringMat);
      ringsMesh.rotation.x = Math.PI / 2;
      planetMesh.add(ringsMesh);
    }

    let isRunning = true;
    let animId: number;

    // Calm, slow realistic planetary rotation
    const animate = () => {
      if (!isRunning) return;
      planetMesh.rotation.y += 0.003;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (ringsMesh) {
        ringsMesh.geometry.dispose();
        (ringsMesh.material as THREE.Material).dispose();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [body.id, body.textureUrl, body.axialTiltDeg, size]);

  const renderSize = Math.max(24, Math.min(size, 145));

  return (
    <div
      style={{
        width: `${renderSize}px`,
        height: `${renderSize}px`,
        filter: `drop-shadow(0 0 16px ${body.colorHex}55)`,
      }}
      className="relative flex items-center justify-center transition-all duration-300"
    >
      <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
}

interface PlanetComparisonModalProps {
  initialPrimaryId?: string;
  onClose: () => void;
  onFocusPlanet: (body: CelestialBodyPhysics) => void;
}

export default function PlanetComparisonModal({
  initialPrimaryId = 'earth',
  onClose,
  onFocusPlanet,
}: PlanetComparisonModalProps) {
  const [bodyAId, setBodyAId] = useState<string>(initialPrimaryId);
  const [bodyBId, setBodyBId] = useState<string>(initialPrimaryId === 'jupiter' ? 'earth' : 'jupiter');

  const bodyA = CELESTIAL_BODIES_PHYSICS.find((b) => b.id === bodyAId) || CELESTIAL_BODIES_PHYSICS[2];
  const bodyB = CELESTIAL_BODIES_PHYSICS.find((b) => b.id === bodyBId) || CELESTIAL_BODIES_PHYSICS[5];

  const maxDiameter = Math.max(bodyA.diameterKm, bodyB.diameterKm, 1);
  const scaleA = Math.max(22, Math.round((bodyA.diameterKm / maxDiameter) * 140));
  const scaleB = Math.max(22, Math.round((bodyB.diameterKm / maxDiameter) * 140));

  const diameterRatio = (bodyA.diameterKm / bodyB.diameterKm).toFixed(2);
  const gravityRatio = (bodyA.surfaceGravityMs2 / Math.max(bodyB.surfaceGravityMs2, 0.0001)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/75 backdrop-blur-md p-3 sm:p-4 font-mono text-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-space-950/95 border border-space-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-space-800 bg-space-900/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-aeroblue flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-white truncate">
              PLANETARY SCALE &amp; ASTROPHYSICS COMPARATOR
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-space-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Selector Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
            <div className="sm:col-span-5">
              <label className="text-[10px] text-space-400 uppercase block mb-1">PRIMARY BODY</label>
              <select
                value={bodyAId}
                onChange={(e) => setBodyAId(e.target.value)}
                className="w-full bg-space-900 border border-space-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aeroblue"
              >
                {CELESTIAL_BODIES_PHYSICS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.diameterKm.toLocaleString()} km)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1 flex justify-center pt-4">
              <button
                onClick={() => {
                  const temp = bodyAId;
                  setBodyAId(bodyBId);
                  setBodyBId(temp);
                }}
                className="p-2 rounded-full bg-space-900 hover:bg-space-800 border border-space-800 text-aeroblue transition-colors cursor-pointer"
                title="Swap Bodies"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="sm:col-span-5">
              <label className="text-[10px] text-space-400 uppercase block mb-1">COMPARISON BODY</label>
              <select
                value={bodyBId}
                onChange={(e) => setBodyBId(e.target.value)}
                className="w-full bg-space-900 border border-space-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aeroblue"
              >
                {CELESTIAL_BODIES_PHYSICS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.diameterKm.toLocaleString()} km)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Proportional Scale Spheres */}
          <div className="bg-space-900/60 border border-space-850 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-around gap-6 min-h-[190px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-[145px] flex items-center justify-center">
                <RotatingPlanetGlobe body={bodyA} size={scaleA} />
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-xs">{bodyA.name.split(' (')[0]}</div>
                <div className="text-[10px] text-space-400">{bodyA.diameterKm.toLocaleString()} km</div>
              </div>
            </div>

            <div className="text-center space-y-1 px-3 py-2 rounded-xl bg-space-950/80 border border-space-800">
              <div className="text-[9px] text-space-400 uppercase">RELATIVE RATIO</div>
              <div className="text-sm font-bold text-aeroblue">{diameterRatio}x Diameter</div>
              <div className="text-[10px] text-aeroamber">{gravityRatio}x Surface Gravity</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-[145px] flex items-center justify-center">
                <RotatingPlanetGlobe body={bodyB} size={scaleB} />
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-xs">{bodyB.name.split(' (')[0]}</div>
                <div className="text-[10px] text-space-400">{bodyB.diameterKm.toLocaleString()} km</div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Telemetry Table */}
          <div className="grid grid-cols-3 gap-2 text-[11px] bg-space-900/40 p-3.5 rounded-xl border border-space-850">
            <div className="font-bold text-aeroblue">{bodyA.name.split(' (')[0]}</div>
            <div className="text-center text-space-400 text-[10px] uppercase">PARAMETER</div>
            <div className="text-right font-bold text-aeroamber">{bodyB.name.split(' (')[0]}</div>

            <div className="h-px bg-space-800 col-span-3 my-0.5" />

            <div>{bodyA.surfaceGravityMs2} m/s²</div>
            <div className="text-center text-space-400 text-[10px]">SURFACE GRAVITY</div>
            <div className="text-right">{bodyB.surfaceGravityMs2} m/s²</div>

            <div>{bodyA.escapeVelocityKmS} km/s</div>
            <div className="text-center text-space-400 text-[10px]">ESCAPE VELOCITY</div>
            <div className="text-right">{bodyB.escapeVelocityKmS} km/s</div>

            <div>{bodyA.orbitRadiusAU} AU</div>
            <div className="text-center text-space-400 text-[10px]">SOLAR DISTANCE</div>
            <div className="text-right">{bodyB.orbitRadiusAU} AU</div>

            <div>{bodyA.realPeriodDays.toLocaleString()} days</div>
            <div className="text-center text-space-400 text-[10px]">ORBITAL PERIOD</div>
            <div className="text-right">{bodyB.realPeriodDays.toLocaleString()} days</div>

            <div>{bodyA.axialTiltDeg}°</div>
            <div className="text-center text-space-400 text-[10px]">AXIAL OBLIQUITY</div>
            <div className="text-right">{bodyB.axialTiltDeg}°</div>

            <div>{bodyA.meanTempC}</div>
            <div className="text-center text-space-400 text-[10px]">MEAN TEMPERATURE</div>
            <div className="text-right">{bodyB.meanTempC}</div>
          </div>

          {/* Quick Camera Focus Buttons */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 pt-1">
            <button
              onClick={() => {
                onFocusPlanet(bodyA);
                onClose();
              }}
              className="flex-1 py-2 px-2.5 sm:px-3 rounded-xl bg-space-900 hover:bg-space-800 border border-space-800 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[10px] sm:text-xs"
            >
              <Compass className="w-3.5 h-3.5 text-aeroblue flex-shrink-0" />
              <span className="truncate">FOCUS {bodyA.name.split(' (')[0].toUpperCase()}</span>
            </button>

            <button
              onClick={() => {
                onFocusPlanet(bodyB);
                onClose();
              }}
              className="flex-1 py-2 px-2.5 sm:px-3 rounded-xl bg-space-900 hover:bg-space-800 border border-space-800 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[10px] sm:text-xs"
            >
              <Compass className="w-3.5 h-3.5 text-aeroamber flex-shrink-0" />
              <span className="truncate">FOCUS {bodyB.name.split(' (')[0].toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
