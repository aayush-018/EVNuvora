/**
 * User-related types shared between frontend and backend.
 */

/** Roles a user can have. A user can be both a driver AND a host. */
export type UserRole = 'driver' | 'host' | 'admin' | 'driver_host';

/** Public user profile information */
export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

/** Vehicle owned by a driver */
export interface Vehicle {
  id: string;
  userId: string;
  make: string;          // e.g., "Tata"
  model: string;         // e.g., "Nexon EV Max"
  year: number;
  batteryCapacityKwh: number | null;  // e.g., 40.5
  rangeKm: number | null;             // Manufacturer-claimed range
  connectorTypes: ConnectorType[];     // Compatible connectors
  isDefault: boolean;    // Primary vehicle for quick searches
  createdAt: string;
}

/** Connector type identifier */
export type ConnectorType =
  | 'type2'          // Type 2 (Mennekes) - AC
  | 'ccs2'           // CCS2 - DC fast charging
  | 'chademo'        // CHAdeMO - DC
  | 'iec60309'       // Industrial Blue - AC
  | 'indian_socket'  // 15A Indian domestic socket - AC slow
  | 'gbt_ac'         // GB/T AC
  | 'gbt_dc';        // GB/T DC

/** Auth tokens returned on login */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/** Registration request */
export interface RegisterRequest {
  email: string;
  phone?: string;
  fullName: string;
  password: string;
  role: 'driver' | 'host' | 'driver_host';
}

/** Login request */
export interface LoginRequest {
  email: string;
  password: string;
}
