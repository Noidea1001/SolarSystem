import { CelestialBodyPhysics } from '../data/celestialBodies';

const J2000_EPOCH_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const MS_PER_DAY = 86400000;
const AU_IN_KM = 149597870.7;
const SPEED_OF_LIGHT_KMS = 299792.458;

/**
 * Returns the exact number of Julian days elapsed since the J2000.0 astronomical epoch.
 */
export function getDaysSinceJ2000(date: Date): number {
  return (date.getTime() - J2000_EPOCH_MS) / MS_PER_DAY;
}

/**
 * Solves Kepler's Equation M = E - e * sin(E) via Newton-Raphson iteration
 * and computes the true orbital angle and 3D heliocentric position (including eccentricity & inclination).
 */
export function computeKeplerianPosition3D(
  body: CelestialBodyPhysics,
  daysSinceJ2000: number
): { x: number; y: number; z: number; trueAnomalyRad: number; currentRadiusAU: number } {
  const meanMotionRadPerDay = (2 * Math.PI) / body.realPeriodDays;
  const L0Rad = (body.meanLongitudeJ2000Deg * Math.PI) / 180;
  const direction = body.category === 'comet' && body.isRetrograde ? -1 : 1;

  // Mean anomaly M
  let M = (L0Rad + direction * meanMotionRadPerDay * daysSinceJ2000) % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;

  const e = body.eccentricity || 0;

  // Solve M = E - e * sin(E)
  let E = M;
  for (let i = 0; i < 6; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }

  // True anomaly nu
  const sinNu = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const cosNu = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const nu = Math.atan2(sinNu, cosNu);

  // Scaled 3D heliocentric distance
  const rFactor = 1 - e * Math.cos(E);
  const r3D = body.orbitRadius3D * rFactor;
  const currentRadiusAU = body.orbitRadiusAU * rFactor;

  const incRad = ((body.inclinationDeg || 0) * Math.PI) / 180;

  const x = r3D * Math.cos(nu);
  const z = r3D * Math.sin(nu) * Math.cos(incRad);
  const y = r3D * Math.sin(nu) * Math.sin(incRad);

  return {
    x,
    y,
    z,
    trueAnomalyRad: nu,
    currentRadiusAU,
  };
}

/**
 * Generates an array of 3D points representing the complete elliptical & inclined orbit path.
 */
export function generateEllipticalOrbitPoints(
  body: CelestialBodyPhysics,
  segments = 160
): { x: number; y: number; z: number }[] {
  const points: { x: number; y: number; z: number }[] = [];
  const e = body.eccentricity || 0;
  const incRad = ((body.inclinationDeg || 0) * Math.PI) / 180;

  for (let i = 0; i <= segments; i++) {
    const E = (i / segments) * 2 * Math.PI;
    const sinNu = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
    const cosNu = (Math.cos(E) - e) / (1 - e * Math.cos(E));
    const nu = Math.atan2(sinNu, cosNu);
    const rFactor = 1 - e * Math.cos(E);
    const r3D = body.orbitRadius3D * rFactor;

    points.push({
      x: r3D * Math.cos(nu),
      y: r3D * Math.sin(nu) * Math.sin(incRad),
      z: r3D * Math.sin(nu) * Math.cos(incRad),
    });
  }

  return points;
}

/**
 * Computes physical interplanetary distance, light-travel time, and spacecraft transit time
 * between two celestial bodies at a given simulation timestamp.
 */
export function computeInterplanetaryTelemetry(
  bodyA: CelestialBodyPhysics,
  bodyB: CelestialBodyPhysics,
  daysSinceJ2000: number
): {
  distanceAU: number;
  distanceMillionKm: number;
  lightTimeFormatted: string;
  lightTimeSeconds: number;
   spacecraftDaysEstimate: number;
} {
  // Position in true Astronomical Units
  const posA = computeTrueAUPosition(bodyA, daysSinceJ2000);
  const posB = computeTrueAUPosition(bodyB, daysSinceJ2000);

  const dx = posB.x - posA.x;
  const dy = posB.y - posA.y;
  const dz = posB.z - posA.z;

  const distanceAU = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const distanceKm = distanceAU * AU_IN_KM;
  const distanceMillionKm = distanceKm / 1e6;

  const lightTimeSeconds = distanceKm / SPEED_OF_LIGHT_KMS;
  const mins = Math.floor(lightTimeSeconds / 60);
  const secs = Math.floor(lightTimeSeconds % 60);
  const hours = Math.floor(mins / 60);

  let lightTimeFormatted = `${mins}m ${secs}s`;
  if (hours > 0) {
    lightTimeFormatted = `${hours}h ${mins % 60}m ${secs}s`;
  }

  // Assuming high-energy interplanetary cruise velocity of ~28 km/s (New Horizons / Parker scale)
  const spacecraftDaysEstimate = Math.max(1, Math.round(distanceKm / (28 * 86400)));

  return {
    distanceAU,
    distanceMillionKm,
    lightTimeFormatted,
    lightTimeSeconds,
    spacecraftDaysEstimate,
  };
}

function computeTrueAUPosition(body: CelestialBodyPhysics, daysSinceJ2000: number) {
  const meanMotionRadPerDay = (2 * Math.PI) / body.realPeriodDays;
  const L0Rad = (body.meanLongitudeJ2000Deg * Math.PI) / 180;
  let M = (L0Rad + meanMotionRadPerDay * daysSinceJ2000) % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;

  const e = body.eccentricity || 0;
  let E = M;
  for (let i = 0; i < 5; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }

  const sinNu = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const cosNu = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const nu = Math.atan2(sinNu, cosNu);
  const rAU = body.orbitRadiusAU * (1 - e * Math.cos(E));
  const incRad = ((body.inclinationDeg || 0) * Math.PI) / 180;

  return {
    x: rAU * Math.cos(nu),
    y: rAU * Math.sin(nu) * Math.sin(incRad),
    z: rAU * Math.sin(nu) * Math.cos(incRad),
  };
}

/**
 * Computes the real-time Day/Night Solar Terminator polygon coordinates [lat, lng][]
 * for rendering the night shadow over the 2D Google Maps Satellite view.
 */
export function computeSolarTerminatorPolygon(date: Date = new Date()): [number, number][] {
  const days = getDaysSinceJ2000(date);
  // Solar declination approximation
  const meanLongDeg = (280.46 + 0.9856474 * days) % 360;
  const meanAnomalyRad = (((357.528 + 0.9856003 * days) % 360) * Math.PI) / 180;
  const eclipticLongRad =
    ((meanLongDeg + 1.915 * Math.sin(meanAnomalyRad) + 0.02 * Math.sin(2 * meanAnomalyRad)) * Math.PI) / 180;
  const obliquityRad = (23.439 * Math.PI) / 180;
  const sunDecRad = Math.asin(Math.sin(obliquityRad) * Math.sin(eclipticLongRad));

  // Subsolar longitude from UTC time
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const subsolarLng = (12 - utcHours) * 15;

  const latLngs: [number, number][] = [];
  const tanDec = Math.tan(sunDecRad) || 0.0001;

  for (let lng = -180; lng <= 180; lng += 4) {
    const haRad = ((lng - subsolarLng) * Math.PI) / 180;
    const latRad = Math.atan(-Math.cos(haRad) / tanDec);
    const latDeg = (latRad * 180) / Math.PI;
    latLngs.push([latDeg, lng]);
  }

  // Close polygon around the night pole
  const nightPoleLat = sunDecRad > 0 ? -90 : 90;
  latLngs.push([nightPoleLat, 180]);
  latLngs.push([nightPoleLat, -180]);

  return latLngs;
}
