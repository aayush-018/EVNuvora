/**
 * EV connector types available in India.
 * 
 * This is the single source of truth for connector information
 * used by both the mobile app and the backend.
 */

import { ConnectorType } from '../types/user.types';

export interface ConnectorInfo {
  type: ConnectorType;
  displayName: string;
  shortName: string;
  chargingType: 'AC' | 'DC';
  typicalPowerKw: number[];     // Common power ratings
  description: string;
  commonVehicles: string[];     // Example vehicles in India
  standard: string;
}

/**
 * All connector types supported in the Indian EV market.
 * 
 * This list covers the major connector types you'll find at
 * charging stations across India. The most common are Type 2 (AC)
 * and CCS2 (DC fast charging).
 */
export const CONNECTOR_INFO: Record<ConnectorType, ConnectorInfo> = {
  type2: {
    type: 'type2',
    displayName: 'Type 2 (Mennekes)',
    shortName: 'Type 2',
    chargingType: 'AC',
    typicalPowerKw: [3.3, 7.4, 11, 22],
    description: 'Standard AC connector used by most Indian EVs. Good for regular charging at home or office.',
    commonVehicles: ['Tata Nexon EV', 'MG ZS EV', 'Hyundai Kona', 'BYD Atto 3'],
    standard: 'IEC 62196-2',
  },
  ccs2: {
    type: 'ccs2',
    displayName: 'CCS2 (Combined Charging System)',
    shortName: 'CCS2',
    chargingType: 'DC',
    typicalPowerKw: [25, 50, 60, 120, 150],
    description: 'DC fast charging connector. Charges your EV much faster than AC. Found at highway stations and commercial chargers.',
    commonVehicles: ['Tata Nexon EV', 'MG ZS EV', 'Hyundai Ioniq 5', 'Kia EV6', 'BMW iX'],
    standard: 'IEC 62196-3',
  },
  chademo: {
    type: 'chademo',
    displayName: 'CHAdeMO',
    shortName: 'CHAdeMO',
    chargingType: 'DC',
    typicalPowerKw: [25, 50],
    description: 'Japanese DC fast charging standard. Less common in India but found at some older stations.',
    commonVehicles: ['Nissan Leaf', 'Some electric buses'],
    standard: 'IEC 62196-3',
  },
  iec60309: {
    type: 'iec60309',
    displayName: 'IEC 60309 (Industrial Blue)',
    shortName: 'Industrial',
    chargingType: 'AC',
    typicalPowerKw: [3.3, 7.4],
    description: 'Industrial-grade AC socket. Found at many older public AC charging stations in India.',
    commonVehicles: ['Most EVs with portable charger adapters'],
    standard: 'IEC 60309',
  },
  indian_socket: {
    type: 'indian_socket',
    displayName: '15A Indian Socket',
    shortName: '15A Socket',
    chargingType: 'AC',
    typicalPowerKw: [2.5, 3.3],
    description: 'Standard 15-amp Indian power socket. Slowest charging option but available everywhere. Uses the portable charger that comes with most EVs.',
    commonVehicles: ['Any EV with included portable charger'],
    standard: 'IS 1293',
  },
  gbt_ac: {
    type: 'gbt_ac',
    displayName: 'GB/T AC',
    shortName: 'GB/T AC',
    chargingType: 'AC',
    typicalPowerKw: [3.3, 7],
    description: 'Chinese AC charging standard. Found on some Chinese-origin EVs sold in India.',
    commonVehicles: ['BYD e6', 'Some MG models'],
    standard: 'GB/T 20234.2',
  },
  gbt_dc: {
    type: 'gbt_dc',
    displayName: 'GB/T DC',
    shortName: 'GB/T DC',
    chargingType: 'DC',
    typicalPowerKw: [30, 60, 120],
    description: 'Chinese DC fast charging standard. Used by BYD and some fleet vehicles in India.',
    commonVehicles: ['BYD e6', 'BYD Atto 3 (some variants)'],
    standard: 'GB/T 20234.3',
  },
};

/** All connector type identifiers */
export const ALL_CONNECTOR_TYPES: ConnectorType[] = Object.keys(CONNECTOR_INFO) as ConnectorType[];

/** Only AC connectors */
export const AC_CONNECTOR_TYPES: ConnectorType[] = ALL_CONNECTOR_TYPES.filter(
  (t) => CONNECTOR_INFO[t].chargingType === 'AC'
);

/** Only DC connectors */
export const DC_CONNECTOR_TYPES: ConnectorType[] = ALL_CONNECTOR_TYPES.filter(
  (t) => CONNECTOR_INFO[t].chargingType === 'DC'
);
