'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, RotateCcw, Maximize2, Cpu, Zap, Eye, Compass } from 'lucide-react';

interface SatelliteViewer3DProps {
  selectedSubsystem?: string | null;
  onSelectSubsystem?: (name: string) => void;
  busType?: string;
}

export default function SatelliteViewer3D({
  selectedSubsystem,
  onSelectSubsystem,
  busType = '6U CubeSat Architecture',
}: SatelliteViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState({
    yaw: 14.2,
    pitch: -2.8,
    roll: 0.4,
    sunAngle: 42.1,
    solarPowerW: 58.4,
    busTempC: 18.2,
  });

  const sceneStateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    chassisGroup: THREE.Group;
    parts: { [key: string]: { mesh: THREE.Object3D; originalPos: THREE.Vector3; explodedPos: THREE.Vector3 } };
    materials: THREE.MeshStandardMaterial[];
    isDragging: boolean;
    prevMouseX: number;
    prevMouseY: number;
    rotationX: number;
    rotationY: number;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060911);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(7, 5, 8);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x223254, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(12, 16, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const earthAlbedoLight = new THREE.DirectionalLight(0x0ea5e9, 0.8);
    earthAlbedoLight.position.set(-8, -10, -6);
    scene.add(earthAlbedoLight);

    // Grid Floor / Orbital reference plane
    const gridHelper = new THREE.GridHelper(16, 20, 0x1e2b45, 0x101726);
    gridHelper.position.y = -3.5;
    scene.add(gridHelper);

    // Starfield particles in the background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 80;
      starPositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x94a7dd,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Materials
    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: 0x222a38,
      metalness: 0.85,
      roughness: 0.25,
    });

    const goldFoilMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.3,
    });

    const solarCellMaterial = new THREE.MeshStandardMaterial({
      color: 0x071b3b,
      metalness: 0.7,
      roughness: 0.1,
      emissive: 0x031026,
    });

    const copperMaterial = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.9,
      roughness: 0.35,
    });

    const lensMaterial = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85,
    });

    const chassisGroup = new THREE.Group();
    scene.add(chassisGroup);

    const parts: { [key: string]: { mesh: THREE.Object3D; originalPos: THREE.Vector3; explodedPos: THREE.Vector3 } } = {};

    // 1. Structure Frame (6U Chassis: 1x2x3 Units approximately 1.2 x 2.4 x 3.6 in scaled 3D units)
    const frameGroup = new THREE.Group();
    const frameGeometry = new THREE.BoxGeometry(1.4, 3.2, 2.2);
    const frameEdges = new THREE.EdgesGeometry(frameGeometry);
    const frameLine = new THREE.LineSegments(
      frameEdges,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
    );
    frameGroup.add(frameLine);

    // Rib brackets
    const bracketGeo = new THREE.BoxGeometry(1.36, 0.08, 2.16);
    for (let y = -1.2; y <= 1.2; y += 0.8) {
      const rib = new THREE.Mesh(bracketGeo, aluminumMaterial);
      rib.position.y = y;
      frameGroup.add(rib);
    }
    chassisGroup.add(frameGroup);
    parts['Chassis'] = {
      mesh: frameGroup,
      originalPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0, 0, 0),
    };

    // 2. Solar Arrays (Left and Right Wings)
    const leftSolar = new THREE.Group();
    const panelGeo = new THREE.BoxGeometry(0.04, 3.0, 1.8);
    const panelMesh = new THREE.Mesh(panelGeo, solarCellMaterial);
    leftSolar.add(panelMesh);
    // Golden backside
    const backGeo = new THREE.BoxGeometry(0.01, 3.0, 1.8);
    const backMesh = new THREE.Mesh(backGeo, goldFoilMaterial);
    backMesh.position.x = -0.02;
    leftSolar.add(backMesh);
    leftSolar.position.set(-1.6, 0, 0);
    chassisGroup.add(leftSolar);
    parts['Solar Wing A'] = {
      mesh: leftSolar,
      originalPos: new THREE.Vector3(-1.6, 0, 0),
      explodedPos: new THREE.Vector3(-3.2, 0, 0),
    };

    const rightSolar = new THREE.Group();
    const rPanelMesh = new THREE.Mesh(panelGeo, solarCellMaterial);
    rightSolar.add(rPanelMesh);
    const rBackMesh = new THREE.Mesh(backGeo, goldFoilMaterial);
    rBackMesh.position.x = 0.02;
    rightSolar.add(rBackMesh);
    rightSolar.position.set(1.6, 0, 0);
    chassisGroup.add(rightSolar);
    parts['Solar Wing B'] = {
      mesh: rightSolar,
      originalPos: new THREE.Vector3(1.6, 0, 0),
      explodedPos: new THREE.Vector3(3.2, 0, 0),
    };

    // 3. Optical Payload (Earth Observation Telescope)
    const payloadGroup = new THREE.Group();
    const lensCylinder = new THREE.CylinderGeometry(0.42, 0.42, 1.4, 24);
    const payloadBody = new THREE.Mesh(lensCylinder, aluminumMaterial);
    payloadBody.rotation.x = Math.PI / 2;
    payloadGroup.add(payloadBody);

    const aperture = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 24), lensMaterial);
    aperture.rotation.x = Math.PI / 2;
    aperture.position.z = 0.72;
    payloadGroup.add(aperture);

    payloadGroup.position.set(0, 0.6, 0.4);
    chassisGroup.add(payloadGroup);
    parts['Optical Payload'] = {
      mesh: payloadGroup,
      originalPos: new THREE.Vector3(0, 0.6, 0.4),
      explodedPos: new THREE.Vector3(0, 1.8, 1.8),
    };

    // 4. ADCS Block (Reaction Wheels & Star Tracker)
    const adcsGroup = new THREE.Group();
    const adcsBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), aluminumMaterial);
    adcsGroup.add(adcsBox);

    // 3 Reaction Wheels
    for (let r = 0; r < 3; r++) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), copperMaterial);
      if (r === 0) wheel.rotation.z = Math.PI / 2;
      if (r === 1) wheel.rotation.x = Math.PI / 2;
      wheel.position.set((r - 1) * 0.25, 0.35, 0);
      adcsGroup.add(wheel);
    }
    adcsGroup.position.set(0, -0.6, 0.3);
    chassisGroup.add(adcsGroup);
    parts['ADCS Reaction Wheels'] = {
      mesh: adcsGroup,
      originalPos: new THREE.Vector3(0, -0.6, 0.3),
      explodedPos: new THREE.Vector3(0, -1.8, 1.8),
    };

    // 5. Avionics OBC + EPS Stack
    const avionicsGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const pcb = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.06, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x054f31, metalness: 0.3, roughness: 0.6 })
      );
      pcb.position.y = (i - 1) * 0.25;
      avionicsGroup.add(pcb);
    }
    avionicsGroup.position.set(0, 0, -0.4);
    chassisGroup.add(avionicsGroup);
    parts['Avionics & EPS Stack'] = {
      mesh: avionicsGroup,
      originalPos: new THREE.Vector3(0, 0, -0.4),
      explodedPos: new THREE.Vector3(0, 0, -2.2),
    };

    // 6. Electric Propulsion Thruster (Nozzle at Base)
    const thrusterGroup = new THREE.Group();
    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 16, 1, true), copperMaterial);
    nozzle.rotation.x = Math.PI;
    nozzle.position.y = -1.6;
    thrusterGroup.add(nozzle);
    chassisGroup.add(thrusterGroup);
    parts['Propulsion Unit'] = {
      mesh: thrusterGroup,
      originalPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0, -1.8, 0),
    };

    sceneStateRef.current = {
      scene,
      camera,
      renderer,
      chassisGroup,
      parts,
      materials: [aluminumMaterial, goldFoilMaterial, solarCellMaterial, copperMaterial, lensMaterial],
      isDragging: false,
      prevMouseX: 0,
      prevMouseY: 0,
      rotationX: 0.3,
      rotationY: 0.6,
    };

    // Interaction Handlers
    const onMouseDown = (e: MouseEvent) => {
      if (!sceneStateRef.current) return;
      sceneStateRef.current.isDragging = true;
      sceneStateRef.current.prevMouseX = e.clientX;
      sceneStateRef.current.prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!sceneStateRef.current || !sceneStateRef.current.isDragging) return;
      const deltaX = e.clientX - sceneStateRef.current.prevMouseX;
      const deltaY = e.clientY - sceneStateRef.current.prevMouseY;

      sceneStateRef.current.rotationY += deltaX * 0.008;
      sceneStateRef.current.rotationX += deltaY * 0.008;

      sceneStateRef.current.prevMouseX = e.clientX;
      sceneStateRef.current.prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      if (!sceneStateRef.current) return;
      sceneStateRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!sceneStateRef.current) return;
      const cam = sceneStateRef.current.camera;
      const zoomFactor = e.deltaY * 0.005;
      cam.position.z = Math.min(Math.max(cam.position.z + zoomFactor, 3.5), 18);
    };

    const onResize = () => {
      if (!container || !sceneStateRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      sceneStateRef.current.camera.aspect = w / h;
      sceneStateRef.current.camera.updateProjectionMatrix();
      sceneStateRef.current.renderer.setSize(w, h);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.01;

      if (sceneStateRef.current) {
        const { chassisGroup, rotationX, rotationY, parts } = sceneStateRef.current;

        // Auto slow rotation when user is not dragging
        if (!sceneStateRef.current.isDragging) {
          sceneStateRef.current.rotationY += 0.002;
        }

        chassisGroup.rotation.x = THREE.MathUtils.lerp(chassisGroup.rotation.x, rotationX, 0.1);
        chassisGroup.rotation.y = THREE.MathUtils.lerp(chassisGroup.rotation.y, rotationY, 0.1);

        // Smoothly lerp exploded/collapsed part positions
        Object.values(parts).forEach((p) => {
          const target = isExploded ? p.explodedPos : p.originalPos;
          p.mesh.position.lerp(target, 0.08);
        });

        renderer.render(scene, camera);
      }
    };

    animate();

    // Telemetry updates simulation
    const telemetryInterval = setInterval(() => {
      setTelemetry((prev) => ({
        yaw: Number((prev.yaw + (Math.random() - 0.5) * 0.2).toFixed(2)),
        pitch: Number((prev.pitch + (Math.random() - 0.5) * 0.1).toFixed(2)),
        roll: Number((prev.roll + (Math.random() - 0.5) * 0.05).toFixed(2)),
        sunAngle: Number((40 + Math.sin(Date.now() / 8000) * 15).toFixed(1)),
        solarPowerW: Number((54 + Math.sin(Date.now() / 8000) * 8).toFixed(1)),
        busTempC: Number((18 + Math.cos(Date.now() / 12000) * 3).toFixed(1)),
      }));
    }, 1500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(telemetryInterval);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [isExploded]);

  // Wireframe toggle effect
  useEffect(() => {
    if (!sceneStateRef.current) return;
    sceneStateRef.current.materials.forEach((m) => {
      m.wireframe = wireframeMode;
    });
  }, [wireframeMode]);

  const handleResetCamera = () => {
    if (!sceneStateRef.current) return;
    sceneStateRef.current.rotationX = 0.3;
    sceneStateRef.current.rotationY = 0.6;
    sceneStateRef.current.camera.position.set(7, 5, 8);
    sceneStateRef.current.camera.lookAt(0, 0, 0);
  };

  return (
    <div className="relative w-full h-[520px] rounded-lg bg-space-950 border border-space-700/80 overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-aerogreen animate-pulse" />
          <span className="text-xs uppercase tracking-wider text-space-300 font-mono">
            3D DIGITAL TWIN &bull; HIGH-PRECISION CAD
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white tracking-tight">{busType}</h3>
        <p className="text-xs text-space-400 font-mono mt-0.5">
          Form Factor: 6U Standard (100 x 226 x 340 mm) &bull; Mass: 4.85 kg
        </p>
      </div>

      {/* Quick Action Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setIsExploded(!isExploded)}
          className={`px-3 py-1.5 text-xs font-mono rounded border transition-all flex items-center gap-1.5 ${
            isExploded
              ? 'bg-aeroblue/20 border-aeroblue text-aeroblue-light'
              : 'bg-space-900/80 border-space-700 text-space-300 hover:border-space-500'
          }`}
          title="Toggle Subsystem Exploded Assembly"
        >
          <Layers className="w-3.5 h-3.5" />
          {isExploded ? 'COLLAPSE BUS' : 'EXPLODE SUBSYSTEMS'}
        </button>

        <button
          onClick={() => setWireframeMode(!wireframeMode)}
          className={`px-3 py-1.5 text-xs font-mono rounded border transition-all flex items-center gap-1.5 ${
            wireframeMode
              ? 'bg-aeroblue/20 border-aeroblue text-aeroblue-light'
              : 'bg-space-900/80 border-space-700 text-space-300 hover:border-space-500'
          }`}
          title="Toggle Wireframe CAD Mesh"
        >
          <Cpu className="w-3.5 h-3.5" />
          {wireframeMode ? 'SOLID' : 'WIREFRAME'}
        </button>

        <button
          onClick={handleResetCamera}
          className="p-1.5 text-xs rounded border border-space-700 bg-space-900/80 text-space-300 hover:border-space-500 transition-all"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subsystem quick tags list */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 max-w-xl">
        {[
          'Chassis',
          'Solar Wing A',
          'Solar Wing B',
          'Optical Payload',
          'ADCS Reaction Wheels',
          'Avionics & EPS Stack',
          'Propulsion Unit',
        ].map((part) => (
          <button
            key={part}
            onClick={() => onSelectSubsystem && onSelectSubsystem(part)}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-space-900/90 border border-space-700/80 text-space-300 hover:text-white hover:border-aeroblue/60 transition-colors"
          >
            {part}
          </button>
        ))}
      </div>

      {/* Telemetry Status Widget */}
      <div className="absolute bottom-4 right-4 bg-space-900/90 backdrop-blur-md border border-space-700/80 rounded px-3 py-2 text-right font-mono text-[11px] space-y-1">
        <div className="text-space-400 border-b border-space-800 pb-1 flex justify-between gap-4">
          <span>POINTING KNOWLEDGE</span>
          <span className="text-aerogreen">LOCKED</span>
        </div>
        <div className="flex justify-between gap-4 text-space-300">
          <span className="text-space-400">Y / P / R:</span>
          <span>
            {telemetry.yaw}° / {telemetry.pitch}° / {telemetry.roll}°
          </span>
        </div>
        <div className="flex justify-between gap-4 text-space-300">
          <span className="text-space-400">SOLAR POWER:</span>
          <span className="text-aeroblue-light">{telemetry.solarPowerW} W</span>
        </div>
        <div className="flex justify-between gap-4 text-space-300">
          <span className="text-space-400">EQUILIBRIUM TEMP:</span>
          <span>+{telemetry.busTempC} °C</span>
        </div>
      </div>
    </div>
  );
}
