export type SpectralBand =
  | 'OPTICAL_RGB'
  | 'NEAR_INFRARED'
  | 'MID_INFRARED'
  | 'ULTRAVIOLET'
  | 'X_RAY'
  | 'GAMMA_RAY'
  | 'RADIO';

export interface AstronomicalTarget {
  id: string;
  name: string;
  constellation: string;
  distanceLightYears: number;
  apparentMagnitude?: number;
  rightAscension: string;
  declination: string;
  redshift?: number;
  discoveryYear: number;
  primaryInstrument: string;
}

export interface PlanetaryMetrics {
  name: string;
  massKg: string;
  equatorialRadiusKm: number;
  orbitalPeriodEarthDays: number;
  semiMajorAxisAU: number;
  surfaceGravityMs2: number;
  escapeVelocityKmS: number;
  meanTemperatureC: number;
  albedo: number;
}
