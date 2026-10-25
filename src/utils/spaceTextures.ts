import * as THREE from 'three';

// Generates high-resolution photographic canvas textures for space exploration
export function createRealisticEarthDayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Ocean Depth Gradient (Deep ocean trench to coastal continental shelf)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#04162e');
  oceanGrad.addColorStop(0.3, '#072044');
  oceanGrad.addColorStop(0.5, '#0b2d5c');
  oceanGrad.addColorStop(0.7, '#072044');
  oceanGrad.addColorStop(1, '#04162e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Shallow turquoise coastal shelves
  const drawCoastalShelf = (x: number, y: number, w: number, h: number, pts: [number, number][]) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => {
      const cx = x + px * w;
      const cy = y + py * h;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(14, 116, 144, 0.4)';
    ctx.fill();
  };

  // Landmass Polygon Renderer with Vegetation & Mountain Topography
  const drawLandmass = (
    x: number,
    y: number,
    w: number,
    h: number,
    pts: [number, number][],
    baseColor = '#1f4429',
    desertColor = '#a87a48'
  ) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => {
      const cx = x + px * w;
      const cy = y + py * h;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.fillStyle = baseColor;
    ctx.fill();

    // Desert / arid core
    ctx.save();
    ctx.clip();
    const desertGrad = ctx.createRadialGradient(x + w * 0.5, y + h * 0.45, 10, x + w * 0.5, y + h * 0.45, w * 0.4);
    desertGrad.addColorStop(0, desertColor);
    desertGrad.addColorStop(0.6, 'rgba(168, 122, 72, 0.4)');
    desertGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = desertGrad;
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    // National borders and coastline stroke
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  // 2. Continents (Realistic NASA Blue Marble Topography)
  // North America
  drawCoastalShelf(180, 130, 480, 360, [[0.2, 0.1], [0.65, 0.05], [0.9, 0.25], [0.75, 0.6], [0.55, 0.95], [0.35, 0.7], [0.1, 0.3]]);
  drawLandmass(200, 140, 450, 340, [
    [0.2, 0.1], [0.65, 0.05], [0.88, 0.22], [0.78, 0.52], [0.65, 0.6],
    [0.58, 0.85], [0.52, 0.98], [0.42, 0.88], [0.35, 0.65], [0.12, 0.35], [0.08, 0.18]
  ], '#224d2c', '#a88548');

  // South America & Amazon Basin
  drawLandmass(460, 470, 270, 410, [
    [0.32, 0.05], [0.78, 0.22], [0.95, 0.42], [0.72, 0.72], [0.45, 0.98], [0.28, 0.72], [0.22, 0.32]
  ], '#15401e', '#7c6339');

  // Eurasia (Europe + Asia + Indochina/Cambodia)
  drawLandmass(840, 110, 960, 400, [
    [0.05, 0.38], [0.18, 0.12], [0.38, 0.04], [0.78, 0.04], [0.96, 0.22],
    [0.88, 0.62], [0.76, 0.76], [0.62, 0.82], [0.48, 0.66], [0.32, 0.72], [0.22, 0.54], [0.08, 0.6]
  ], '#284f2c', '#9e7945');

  // Southeast Asia & Cambodia Cluster (Mekong Basin, Tonle Sap)
  drawLandmass(1380, 370, 200, 180, [
    [0.15, 0.08], [0.65, 0.15], [0.85, 0.55], [0.68, 0.88], [0.38, 0.95], [0.18, 0.65]
  ], '#1b4d24', '#88743a');

  // Africa & Sahara Desert
  drawLandmass(870, 340, 390, 440, [
    [0.1, 0.08], [0.78, 0.08], [0.92, 0.32], [0.72, 0.72], [0.48, 0.96], [0.26, 0.72], [0.06, 0.32]
  ], '#26421e', '#c29355'); // Prominent Sahara sand gold

  // Australia & Outback
  drawLandmass(1520, 530, 340, 260, [
    [0.22, 0.08], [0.72, 0.08], [0.92, 0.42], [0.82, 0.88], [0.42, 0.94], [0.14, 0.68]
  ], '#453820', '#b8582b'); // Red Ochre Outback

  // Polar Ice Caps (Greenland & Antarctica)
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, canvas.width, 45); // Arctic
  ctx.fillRect(0, canvas.height - 75, canvas.width, 75); // Antarctica
  // Greenland
  drawLandmass(520, 40, 200, 110, [[0.2, 0.1], [0.8, 0.1], [0.9, 0.8], [0.3, 0.9]], '#f8fafc', '#e2e8f0');

  // Coordinate Reference Grid (Like Google Earth Satellite Graticule)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.lineWidth = 1;
  for (let lat = 0; lat <= canvas.height; lat += canvas.height / 12) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(canvas.width, lat);
    ctx.stroke();
  }
  for (let lng = 0; lng <= canvas.width; lng += canvas.width / 24) {
    ctx.beginPath();
    ctx.moveTo(lng, 0);
    ctx.lineTo(lng, canvas.height);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// Generates the NASA Black Marble Night Lights Texture (Electric City Lights where it's night)
export function createRealisticEarthNightTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Pitch-black night oceans and unpopulated areas
  ctx.fillStyle = '#020307';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Helper to paint realistic glowing urban clusters & road corridors
  const paintCityCluster = (cx: number, cy: number, radius: number, density: number, color = '#fef08a') => {
    const radGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
    radGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    radGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.6)');
    radGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.25)');
    radGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // High density city lights
    ctx.fillStyle = color;
    for (let i = 0; i < density; i++) {
      const rx = cx + (Math.random() - 0.5) * radius * 1.6;
      const ry = cy + (Math.random() - 0.5) * radius * 1.6;
      ctx.fillRect(rx, ry, Math.random() > 0.5 ? 2 : 1, Math.random() > 0.5 ? 2 : 1);
    }
  };

  // 1. Southeast Asia & Cambodia Night Lights
  paintCityCluster(1440, 420, 28, 90, '#fef08a'); // Phnom Penh / Mekong Delta
  paintCityCluster(1415, 410, 22, 60, '#fde047'); // Siem Reap / Battambang
  paintCityCluster(1420, 395, 38, 140, '#ffffff'); // Bangkok
  paintCityCluster(1455, 435, 36, 130, '#ffffff'); // Ho Chi Minh City
  paintCityCluster(1425, 480, 28, 110, '#fef08a'); // Singapore & Kuala Lumpur

  // 2. East Asia
  paintCityCluster(1580, 280, 48, 260, '#ffffff'); // Tokyo & Osaka Megalopolis
  paintCityCluster(1510, 310, 45, 240, '#fef08a'); // Shanghai & Yangtze River Delta
  paintCityCluster(1480, 260, 40, 200, '#fef08a'); // Beijing
  paintCityCluster(1530, 280, 30, 160, '#fef08a'); // Seoul

  // 3. Europe (High Density Night Lights)
  paintCityCluster(1020, 220, 50, 300, '#fef08a'); // Western Europe (London, Paris, Benelux, Germany)
  paintCityCluster(1050, 260, 35, 180, '#fde047'); // Italy & Mediterranean
  paintCityCluster(1140, 190, 35, 160, '#fde047'); // Moscow

  // 4. North America
  paintCityCluster(380, 240, 60, 320, '#ffffff'); // East Coast Megalopolis (NYC, DC, Boston)
  paintCityCluster(330, 260, 45, 220, '#fef08a'); // Midwest / Chicago
  paintCityCluster(240, 280, 42, 200, '#ffffff'); // West Coast (Los Angeles, SF, Seattle)

  // 5. India & Middle East
  paintCityCluster(1300, 370, 55, 280, '#fef08a'); // Indo-Gangetic Plain & Mumbai
  paintCityCluster(1180, 340, 35, 140, '#fef08a'); // Nile Delta & Cairo
  paintCityCluster(1240, 360, 30, 130, '#fde047'); // UAE Dubai & Persian Gulf

  // Random secondary settlements and coastal road ribbons
  ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * (canvas.height * 0.7) + canvas.height * 0.15;
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// Generates the True Optical Sun Texture from NASA SDO
export function createRealisticSunTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Intense nuclear plasma gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.3, '#fbbf24');
  grad.addColorStop(0.5, '#fef08a');
  grad.addColorStop(0.7, '#fbbf24');
  grad.addColorStop(1, '#d97706');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Solar magnetic granules
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.arc(rx, ry, Math.random() * 5 + 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sunspot magnetic active regions (Umbra and Penumbra)
  const drawSunspot = (x: number, y: number, r: number) => {
    // Penumbra (brownish amber)
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Umbra (dark core)
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.5, r * 0.3, 0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  drawSunspot(320, 220, 16);
  drawSunspot(345, 225, 9);
  drawSunspot(680, 270, 20);
  drawSunspot(710, 280, 12);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}
