export type TRL = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type ExportCompliance = 'ITAR_FREE' | 'EAR99' | 'ITAR_CONTROLLED';

export type SubsystemCategory =
  | 'ADCS'
  | 'PROPULSION'
  | 'POWER_EPS'
  | 'AVIONICS_OBC'
  | 'TELEMETRY_COMMS'
  | 'OPTICAL_PAYLOAD'
  | 'THERMAL_STRUCTURE'
  | 'GROUND_SEGMENT';

export type DataInterface = 'CAN' | 'SPI' | 'I2C' | 'RS422' | 'RS485' | 'SpaceWire' | 'Ethernet' | 'PCIe';

export type FormFactor = '0.5U' | '1U' | '2U' | '3U' | '6U' | '12U' | '16U' | 'ESPA' | 'CUSTOM';

export interface ComponentSpec {
  id: string;
  name: string;
  modelCode: string;
  category: SubsystemCategory;
  manufacturer: string;
  country: string;
  flagCode: string; // ISO country code e.g. 'US', 'DE', 'FR', 'JP', 'GB'
  trl: TRL;
  flightHeritage: {
    missionsFlown: number;
    cumulativeOrbitHours: number;
    verifiedBy: string;
  };
  exportCompliance: ExportCompliance;
  leadTimeWeeks: number;
  priceUsd: number | null; // null if RFQ only
  inStock: boolean;
  stockCount: number;
  formFactor: FormFactor;
  massGrams: number;
  dimensionsMm: [number, number, number]; // [X, Y, Z]
  powerAvgWatts: number;
  powerPeakWatts: number;
  voltageInputV: string;
  interfaces: DataInterface[];
  radiationToleranceKrad: number;
  operatingTempMinC: number;
  operatingTempMaxC: number;
  keyFeatures: string[];
  description: string;
  datasheetUrl?: string;
  cadFileAvailable: boolean;
}

export interface LaunchRideshare {
  id: string;
  vehicle: string;
  provider: string;
  missionName: string;
  targetOrbit: 'LEO_SSO' | 'LEO_MID_INC' | 'POLAR' | 'GEO_TRANSFER' | 'LUNAR';
  orbitAltitudeKm: number;
  launchDate: string;
  launchSite: string;
  massCapacityKg: number;
  remainingCapacityKg: number;
  pricePerKgUsd: number;
  status: 'SCHEDULED' | 'BOARDING_OPEN' | 'FINAL_CALL' | 'CONFIRMED';
  standardDeployer: string;
}

export interface GroundStationPass {
  id: string;
  stationName: string;
  operator: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  dishDiameterMeters: number;
  frequencyBands: ('UHF' | 'VHF' | 'S_BAND' | 'X_BAND' | 'KA_BAND')[];
  costPerMinuteUsd: number;
  availableSchedules: string[];
  maxElevationAngleDeg: number;
}

export interface MissionArchitecture {
  id: string;
  missionName: string;
  orbitType: 'LEO_SSO' | 'LEO_EQUATORIAL' | 'POLAR' | 'MEO' | 'GEO';
  altitudeKm: number;
  lifetimeYears: number;
  busSize: FormFactor;
  maxMassLimitGrams: number;
  selectedComponents: ComponentSpec[];
  customMassAllowanceGrams: number;
  notes: string;
}

export interface RFQItem {
  componentId: string;
  componentName: string;
  manufacturer: string;
  quantity: number;
  targetDeliveryDate: string;
  notes: string;
}

export interface RFQRequest {
  id: string;
  title: string;
  customerName: string;
  customerOrg: string;
  email: string;
  items: RFQItem[];
  escrowMilestoneTerms: {
    advancePercentage: number;
    environmentalTestPercentage: number;
    deliveryPercentage: number;
  };
  specialRequirements: string;
  status: 'PENDING_SUPPLIER_REVIEW' | 'PROPOSAL_RECEIVED' | 'CONTRACT_SIGNING' | 'FULFILLED';
  createdAt: string;
  totalEstimatedUsd: number;
}
