/**
 * Common types used across the application.
 */

/** Standard paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/** Standard API success response */
export interface ApiResponse<T = void> {
  success: true;
  data: T;
  message?: string;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>; // Field-level validation errors
  };
}

/** Review submitted by a driver */
export interface Review {
  id: string;
  bookingId: string;
  chargerId: string;
  driverId: string;
  driverName: string;
  driverAvatarUrl: string | null;
  rating: number;          // 1-5
  comment: string | null;
  hostResponse: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Create review request */
export interface CreateReviewRequest {
  bookingId: string;
  rating: number;   // 1-5
  comment?: string;
}

/** Report a problem */
export interface CreateReportRequest {
  chargerId?: string;
  bookingId?: string;
  category: ReportCategory;
  description: string;
}

/** Report categories */
export type ReportCategory =
  | 'wrong_location'
  | 'charger_not_found'
  | 'charger_broken'
  | 'unsafe_location'
  | 'pricing_mismatch'
  | 'host_issue'
  | 'access_denied'
  | 'other';

/** Notification */
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, string> | null;  // e.g., { bookingId: "..." }
  isRead: boolean;
  createdAt: string;
}

/** Notification types for routing */
export type NotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'payment_success'
  | 'payment_failed'
  | 'refund_update'
  | 'charger_approved'
  | 'charger_rejected'
  | 'review_received'
  | 'support_update'
  | 'general';
