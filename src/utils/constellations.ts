import * as THREE from 'three';

export interface ConstellationStar {
  name: string;
  raHours: number; // Right Ascension in hours [0, 24]
  decDeg: number;  // Declination in degrees [-90, +90]
}

export interface ConstellationDef {
  id: string;
  name: string;
  khmerName: string;
  centerRaHours: number;
  centerDecDeg: number;
  stars: Record<string, ConstellationStar>;
  lines: [string, string][]; // pairs of star keys
}

export const MAJOR_CONSTELLATIONS: ConstellationDef[] = [
  {
    id: 'orion',
    name: 'Orion (The Hunter)',
    khmerName: 'ផ្កាយព្រានប្រមាញ់ (Orion)',
    centerRaHours: 5.5,
    centerDecDeg: 5.0,
    stars: {
      betelgeuse: { name: 'Betelgeuse', raHours: 5.92, decDeg: 7.41 },
      rigel: { name: 'Rigel', raHours: 5.24, decDeg: -8.20 },
      bellatrix: { name: 'Bellatrix', raHours: 5.42, decDeg: 6.35 },
      saiph: { name: 'Saiph', raHours: 5.79, decDeg: -9.67 },
      alnitak: { name: 'Alnitak', raHours: 5.68, decDeg: -1.94 },
      alnilam: { name: 'Alnilam', raHours: 5.60, decDeg: -1.20 },
      mintaka: { name: 'Mintaka', raHours: 5.53, decDeg: -0.30 },
    },
    lines: [
      ['betelgeuse', 'bellatrix'],
      ['betelgeuse', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['mintaka', 'alnilam'],
      ['alnilam', 'alnitak'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
      ['saiph', 'rigel'],
    ],
  },
  {
    id: 'ursa_major',
    name: 'Ursa Major (Big Dipper)',
    khmerName: 'ផ្កាយនង្គ័ល (Ursa Major)',
    centerRaHours: 11.5,
    centerDecDeg: 55.0,
    stars: {
      dubhe: { name: 'Dubhe', raHours: 11.06, decDeg: 61.75 },
      merak: { name: 'Merak', raHours: 11.03, decDeg: 56.38 },
      phecda: { name: 'Phecda', raHours: 11.90, decDeg: 53.69 },
      megrez: { name: 'Megrez', raHours: 12.25, decDeg: 57.03 },
      alioth: { name: 'Alioth', raHours: 12.90, decDeg: 55.96 },
      mizar: { name: 'Mizar', raHours: 13.40, decDeg: 54.92 },
      alkaid: { name: 'Alkaid', raHours: 13.79, decDeg: 49.31 },
    },
    lines: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
    ],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia (The Queen)',
    khmerName: 'ផ្កាយមហេសី (Cassiopeia)',
    centerRaHours: 1.0,
    centerDecDeg: 60.0,
    stars: {
      caph: { name: 'Caph', raHours: 0.15, decDeg: 59.15 },
      schedar: { name: 'Schedar', raHours: 0.68, decDeg: 56.54 },
      gamma_cas: { name: 'Navi', raHours: 0.94, decDeg: 60.72 },
      ruchbah: { name: 'Ruchbah', raHours: 1.43, decDeg: 60.23 },
      segin: { name: 'Segin', raHours: 1.90, decDeg: 63.67 },
    },
    lines: [
      ['caph', 'schedar'],
      ['schedar', 'gamma_cas'],
      ['gamma_cas', 'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },
  {
    id: 'crux',
    name: 'Crux (Southern Cross)',
    khmerName: 'ផ្កាយឈើឆ្កាងខាងត្បូង (Crux)',
    centerRaHours: 12.5,
    centerDecDeg: -60.0,
    stars: {
      acrux: { name: 'Acrux', raHours: 12.44, decDeg: -63.10 },
      mimosa: { name: 'Mimosa', raHours: 12.79, decDeg: -59.69 },
      gacrux: { name: 'Gacrux', raHours: 12.52, decDeg: -57.11 },
      imai: { name: 'Imai', raHours: 12.25, decDeg: -58.75 },
    },
    lines: [
      ['acrux', 'gacrux'],
      ['mimosa', 'imai'],
    ],
  },
  {
    id: 'cygnus',
    name: 'Cygnus (Northern Cross)',
    khmerName: 'ផ្កាយក្ងានសួគ៌ (Cygnus)',
    centerRaHours: 20.5,
    centerDecDeg: 42.0,
    stars: {
      deneb: { name: 'Deneb', raHours: 20.69, decDeg: 45.28 },
      sadr: { name: 'Sadr', raHours: 20.37, decDeg: 40.26 },
      albireo: { name: 'Albireo', raHours: 19.51, decDeg: 27.96 },
      gienah: { name: 'Gienah', raHours: 20.77, decDeg: 33.97 },
      fawaris: { name: 'Fawaris', raHours: 19.75, decDeg: 45.13 },
    },
    lines: [
      ['deneb', 'sadr'],
      ['sadr', 'albireo'],
      ['fawaris', 'sadr'],
      ['sadr', 'gienah'],
    ],
  },
  {
    id: 'scorpius',
    name: 'Scorpius (The Scorpion)',
    khmerName: 'ផ្កាយខ្យាដំរី (Scorpius)',
    centerRaHours: 16.8,
    centerDecDeg: -30.0,
    stars: {
      antares: { name: 'Antares', raHours: 16.49, decDeg: -26.43 },
      graffias: { name: 'Graffias', raHours: 16.09, decDeg: -19.80 },
      dschubba: { name: 'Dschubba', raHours: 16.01, decDeg: -22.62 },
      sargas: { name: 'Sargas', raHours: 17.62, decDeg: -43.00 },
      shaula: { name: 'Shaula', raHours: 17.56, decDeg: -37.10 },
    },
    lines: [
      ['graffias', 'dschubba'],
      ['dschubba', 'antares'],
      ['antares', 'sargas'],
      ['sargas', 'shaula'],
    ],
  },
  {
    id: 'taurus',
    name: 'Taurus (The Bull)',
    khmerName: 'ផ្កាយគោឧសភ (Taurus)',
    centerRaHours: 4.6,
    centerDecDeg: 16.5,
    stars: {
      aldebaran: { name: 'Aldebaran', raHours: 4.60, decDeg: 16.51 },
      elnath: { name: 'Elnath', raHours: 5.44, decDeg: 28.61 },
      tianguan: { name: 'Tianguan', raHours: 5.63, decDeg: 21.14 },
      hyadum: { name: 'Hyadum', raHours: 4.33, decDeg: 15.63 },
    },
    lines: [
      ['aldebaran', 'elnath'],
      ['aldebaran', 'tianguan'],
      ['aldebaran', 'hyadum'],
    ],
  },
];

export function raDecToSphereVector(raHours: number, decDeg: number, radius: number): THREE.Vector3 {
  const theta = (raHours / 24) * Math.PI * 2;
  const phi = ((90 - decDeg) / 180) * Math.PI;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

export function buildConstellationLinesMesh(radius: number = 320): THREE.LineSegments {
  const linePoints: number[] = [];

  MAJOR_CONSTELLATIONS.forEach((c) => {
    c.lines.forEach(([s1Key, s2Key]) => {
      const s1 = c.stars[s1Key];
      const s2 = c.stars[s2Key];
      if (s1 && s2) {
        const v1 = raDecToSphereVector(s1.raHours, s1.decDeg, radius);
        const v2 = raDecToSphereVector(s2.raHours, s2.decDeg, radius);
        linePoints.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      }
    });
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.LineSegments(geometry, material);
}
