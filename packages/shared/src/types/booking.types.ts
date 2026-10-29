/**
 * Booking-related types shared between frontend and backend.
 */

/** Booking lifecycle states */
export type BookingStatus =
  | 'pending'       // Driver requested, waiting for host
  | 'confirmed'     // Host approved
  | 'rejected'      // Host declined
  | 'cancelled'     // Either party cancelled
  | 'expired'       // No response within time limit
  | 'in_progress'   // Driver checked in, charging
  | 'completed'     // Charging session finished
  | 'disputed';     // Issue raised

/** Who cancelled the booking */
export type CancellationInitiator = 'driver' | 'host' | 'admin' | 'system';

/** A booking */
export interface Booking {
  id: string;
  driverId: string;
  driverName: string;
  chargerId: string;
  chargerName: string;
  connectorId: string;
  connectorType: string;
  startTime: string;        // ISO 8601
  endTime: string;          // ISO 8601
  durationMinutes: number;
  totalAmount: number;      // In paise
  breakdownBase: number;    // Base charge in paise
  breakdownParkingFee: number; // Parking fee in paise
  breakdownServiceFee: number; // Platform fee in paise
  status: BookingStatus;
  cancellationReason: string | null;
  cancellationInitiator: CancellationInitiator | null;
  hostNote: string | null;
  driverNote: string | null;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Create a booking request */
export interface CreateBookingRequest {
  chargerId: string;
  connectorId: string;
  startTime: string;  // ISO 8601
  endTime: string;    // ISO 8601
  driverNote?: string;
}

/** A record of a booking status change */
export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedBy: string;       // User ID or 'system'
  reason: string | null;
  createdAt: string;
}

/** Actions available for a booking based on current state and user role */
export interface BookingActions {
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canDispute: boolean;
  canReview: boolean;
}

/**
 * Valid state transitions.
 * Key = current status, Value = array of valid next statuses.
 */
export const BOOKING_STATE_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled', 'expired'],
  confirmed: ['cancelled', 'in_progress'],
  rejected: [],      // Terminal state
  cancelled: [],     // Terminal state
  expired: [],       // Terminal state
  in_progress: ['completed', 'disputed'],
  completed: [],     // Terminal state
  disputed: ['completed'], // Admin resolves
};
