/**
 * Payment-related types shared between frontend and backend.
 */

/** Payment lifecycle */
export type PaymentStatus =
  | 'created'     // Order created, awaiting payment
  | 'authorized'  // Payment authorized but not captured
  | 'captured'    // Payment successfully captured
  | 'failed'      // Payment failed
  | 'refunded'    // Fully refunded
  | 'partially_refunded'; // Partially refunded

/** Refund status */
export type RefundStatus =
  | 'initiated'
  | 'processing'
  | 'completed'
  | 'failed';

/** A payment record */
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;           // In paise
  currency: 'INR';
  status: PaymentStatus;
  providerOrderId: string;
  providerPaymentId: string | null;
  method: string | null;     // 'upi', 'card', 'netbanking', etc.
  createdAt: string;
  updatedAt: string;
}

/** Create a payment order (sent to backend) */
export interface CreatePaymentOrderRequest {
  bookingId: string;
}

/** Payment order response (from backend) */
export interface PaymentOrderResponse {
  orderId: string;           // Provider order ID
  amount: number;            // In paise
  currency: 'INR';
  bookingId: string;
  providerKeyId: string;     // Public key for SDK
}

/** Verify payment (sent from mobile after provider SDK completes) */
export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

/** A refund record */
export interface Refund {
  id: string;
  paymentId: string;
  bookingId: string;
  amount: number;            // In paise
  reason: string;
  status: RefundStatus;
  providerRefundId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Host earnings summary */
export interface HostEarnings {
  totalEarnings: number;       // In paise
  pendingPayout: number;       // In paise
  completedPayouts: number;    // In paise
  totalBookings: number;
  completedBookings: number;
  thisMonthEarnings: number;   // In paise
  lastMonthEarnings: number;   // In paise
}
