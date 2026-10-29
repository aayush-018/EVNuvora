/**
 * Booking state machine constants.
 * 
 * These define which actions are valid at each booking state,
 * and who is allowed to perform them.
 */

import { BookingStatus, BookingActions } from '../types/booking.types';

/**
 * Which actions are available for each booking status.
 * The frontend uses this to show/hide buttons.
 * The backend uses this to validate state transitions.
 */
export const BOOKING_ACTIONS: Record<BookingStatus, {
  driver: BookingActions;
  host: BookingActions;
}> = {
  pending: {
    driver: {
      canApprove: false,
      canReject: false,
      canCancel: true,     // Driver can cancel their own request
      canCheckIn: false,
      canCheckOut: false,
      canDispute: false,
      canReview: false,
    },
    host: {
      canApprove: true,    // Host can approve the request
      canReject: true,     // Host can reject the request
      canCancel: false,
      canCheckIn: false,
      canCheckOut: false,
      canDispute: false,
      canReview: false,
    },
  },
  confirmed: {
    driver: {
      canApprove: false,
      canReject: false,
      canCancel: true,     // Driver can cancel (may have fee)
      canCheckIn: true,    // Driver manually starts session
      canCheckOut: false,
      canDispute: false,
      canReview: false,
    },
    host: {
      canApprove: false,
      canReject: false,
      canCancel: true,     // Host can cancel (different policy)
      canCheckIn: false,
      canCheckOut: false,
      canDispute: false,
      canReview: false,
    },
  },
  rejected: {
    driver: {
      canApprove: false, canReject: false, canCancel: false,
      canCheckIn: false, canCheckOut: false, canDispute: false, canReview: false,
    },
    host: {
      canApprove: false, canReject: false, canCancel: false,
      canCheckIn: false, canCheckOut: false, canDispute: false, canReview: false,
    },
  },
  cancelled: {
    driver: {
      canApprove: false, canReject: false, canCancel: false,
      canCheckIn: false, canCheckOut: false, canDispute: false, canReview: false,
    },
    host: {
      canApprove: false, canReject: false, canCancel: false,
      canCheckIn: false, canCheckOut: false, canDispute: false, canReview: false,
    },
  },
  expired: {
    driver: {
      canApprove: false, canReject: false, canCancel: false,
      canCheckIn: false, canCheckOut: false, canDispute: false, canReview: false,
    },
    host: {
      canApprove: false, canReject: false, canCancel: false,
      canCheckIn: false, canCheckOut: false, canDispute: false, canReview: false,
    },
  },
  in_progress: {
    driver: {
      canApprove: false,
      canReject: false,
      canCancel: false,
      canCheckIn: false,
      canCheckOut: true,   // Driver ends session
      canDispute: true,    // Driver can report issues
      canReview: false,
    },
    host: {
      canApprove: false,
      canReject: false,
      canCancel: false,
      canCheckIn: false,
      canCheckOut: false,
      canDispute: true,
      canReview: false,
    },
  },
  completed: {
    driver: {
      canApprove: false,
      canReject: false,
      canCancel: false,
      canCheckIn: false,
      canCheckOut: false,
      canDispute: false,
      canReview: true,     // Driver can leave a review
    },
    host: {
      canApprove: false, canReject: false, canCancel: false,
      canCheckIn: false, canCheckOut: false, canDispute: false, canReview: false,
    },
  },
  disputed: {
    driver: {
      canApprove: false, canReject: false, canCancel: false,
      canCheckIn: false, canCheckOut: false, canDispute: false, canReview: false,
    },
    host: {
      canApprove: false, canReject: false, canCancel: false,
      canCheckIn: false, canCheckOut: false, canDispute: false, canReview: false,
    },
  },
};

/** How long (in hours) before an unresponded booking expires */
export const BOOKING_EXPIRY_HOURS = 24;

/** Minimum booking duration in minutes */
export const MIN_BOOKING_DURATION_MINUTES = 30;

/** Maximum booking duration in minutes */
export const MAX_BOOKING_DURATION_MINUTES = 480; // 8 hours

/** How far in advance (in days) a booking can be made */
export const MAX_ADVANCE_BOOKING_DAYS = 7;
