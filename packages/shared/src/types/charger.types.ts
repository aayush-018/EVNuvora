/**
 * Charger-related types shared between frontend and backend.
 */

import { ConnectorType } from './user.types';

/** Charger listing status — follows an approval workflow */
export type ChargerStatus =
  | 'draft'           // Host is still editing
  | 'pending_review'  // Submitted for admin review
  | 'approved'        // Live and visible to drivers
  | 'rejected'        // Admin rejected (reason provided)
  | 'suspended'       // Admin suspended (safety/fraud concern)
  | 'deactivated';    // Host voluntarily took it offline

/** Whether the charger is public or shared/private */
export type ListingType = 'public' | 'shared' | 'private';

/** AC, DC, or both */
export type ChargingType = 'AC' | 'DC' | 'AC_DC';

/** How the price is calculated */
export type PricingModel = 'per_kwh' | 'per_hour' | 'per_slot' | 'fixed';

/** Where availability information comes from */
export type AvailabilitySource =
  | 'api_confirmed'       // Charging network API
  | 'hardware_confirmed'  // Charger hardware reports status
  | 'host_confirmed'      // Host manually updated
  | 'user_reported'       // A driver reported the status
  | 'unknown';            // No status information

/** Verification status for a charger */
export type VerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected';

/** A connector on a charger */
export interface ChargerConnector {
  id: string;
  chargerId: string;
  connectorType: ConnectorType;
  powerKw: number;          // Power rating in kilowatts
  quantity: number;         // How many of this connector type
  isOperational: boolean;   // Currently working?
}

/** Operating hours for a day */
export interface DayHours {
  isOpen: boolean;
  openTime?: string;   // "06:00" in 24h format
  closeTime?: string;  // "22:00"
}

/** Operating hours for the week */
export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

/** A charger listing */
export interface Charger {
  id: string;
  hostId: string;
  hostName: string;
  name: string;
  address: string;               // Full address (hidden for private until booking)
  approximateArea: string;       // Neighborhood name for private listings
  latitude: number;
  longitude: number;
  listingType: ListingType;
  status: ChargerStatus;
  chargingType: ChargingType;
  connectors: ChargerConnector[];
  pricingModel: PricingModel;
  pricePerUnit: number;          // In paise (integer)
  parkingFee: number | null;     // In paise, if applicable
  operatingHours: OperatingHours;
  accessInstructions: string | null; // Only shown to confirmed bookers
  isReservable: boolean;
  verificationStatus: VerificationStatus;
  photos: ChargerPhoto[];
  averageRating: number | null;
  totalReviews: number;
  distanceKm: number | null;    // Calculated field from search
  availabilityStatus: 'available' | 'in_use' | 'offline' | 'unknown';
  availabilitySource: AvailabilitySource;
  availabilityUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A photo attached to a charger listing */
export interface ChargerPhoto {
  id: string;
  chargerId: string;
  url: string;
  caption: string | null;
  isPrimary: boolean;
  createdAt: string;
}

/** Charger search parameters */
export interface ChargerSearchParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;          // Default 10km
  connectorTypes?: ConnectorType[];
  chargingType?: ChargingType;
  minPowerKw?: number;
  maxPricePerUnit?: number;   // In paise
  listingType?: ListingType;
  isReservable?: boolean;
  availabilityStatus?: 'available' | 'in_use';
  sortBy?: 'distance' | 'price' | 'rating';
  page?: number;
  limit?: number;             // Default 20, max 50
}

/** Charger search result — slightly trimmed version for list/map view */
export interface ChargerSearchResult {
  id: string;
  name: string;
  approximateArea: string;
  latitude: number;
  longitude: number;
  listingType: ListingType;
  chargingType: ChargingType;
  connectors: Pick<ChargerConnector, 'connectorType' | 'powerKw' | 'quantity'>[];
  pricingModel: PricingModel;
  pricePerUnit: number;
  isReservable: boolean;
  verificationStatus: VerificationStatus;
  primaryPhotoUrl: string | null;
  averageRating: number | null;
  totalReviews: number;
  distanceKm: number;
  availabilityStatus: 'available' | 'in_use' | 'offline' | 'unknown';
  availabilitySource: AvailabilitySource;
  availabilityUpdatedAt: string | null;
}
