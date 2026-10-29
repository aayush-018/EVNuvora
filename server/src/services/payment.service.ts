import crypto from 'crypto';
import { query } from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Payment, PaymentOrderResponse, PaymentStatus } from '@EVNuvora/shared';
import { env } from '../config/env';

export class PaymentService {
  /**
   * Create a payment order for a booking.
   * Works in sandbox/simulation mode or with Razorpay credentials.
   */
  static async createOrder(bookingId: string, userId: string): Promise<PaymentOrderResponse> {
    const bRes = await query('SELECT * FROM bookings WHERE id = $1 AND driver_id = $2', [bookingId, userId]);
    if (bRes.rows.length === 0) {
      throw new NotFoundError('Booking not found');
    }

    const booking = bRes.rows[0];
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      throw new BadRequestError('Cannot initiate payment for a cancelled or completed booking');
    }

    // Check existing payment
    const existingPay = await query('SELECT * FROM payments WHERE booking_id = $1', [bookingId]);
    if (existingPay.rows.length > 0 && existingPay.rows[0].status === 'captured') {
      throw new BadRequestError('Payment has already been captured for this booking');
    }

    // Generate Razorpay Order ID (or sandbox order ID)
    const providerOrderId = `order_${crypto.randomBytes(12).toString('hex')}`;
    const amount = Number(booking.total_amount);

    if (existingPay.rows.length > 0) {
      await query(
        `UPDATE payments
         SET provider_order_id = $1, amount = $2, status = 'created', updated_at = NOW()
         WHERE booking_id = $3`,
        [providerOrderId, amount, bookingId]
      );
    } else {
      await query(
        `INSERT INTO payments (booking_id, amount, currency, status, provider_order_id)
         VALUES ($1, $2, 'INR', 'created', $3)`,
        [bookingId, amount, providerOrderId]
      );
    }

    return {
      orderId: providerOrderId,
      amount,
      currency: 'INR',
      bookingId,
      providerKeyId: env.RAZORPAY_KEY_ID || 'rzp_test_sandbox_dummy_key',
    };
  }

  /**
   * Verify signature and capture payment.
   */
  static async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    method?: string
  ): Promise<Payment> {
    const payRes = await query('SELECT * FROM payments WHERE provider_order_id = $1', [orderId]);
    if (payRes.rows.length === 0) {
      throw new NotFoundError('Payment order not found');
    }

    const pay = payRes.rows[0];

    // If sandbox key, accept simulation signatures
    if (env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        throw new BadRequestError('Invalid payment signature verification failed');
      }
    }

    await query('BEGIN');
    try {
      const updatedPay = await query(
        `UPDATE payments
         SET provider_payment_id = $1,
             provider_signature = $2,
             method = COALESCE($3, 'upi'),
             status = 'captured',
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [paymentId, signature, method || 'upi', pay.id]
      );

      // Auto-confirm the booking on successful capture
      await query(
        `UPDATE bookings
         SET status = 'confirmed', updated_at = NOW()
         WHERE id = $1 AND status = 'pending'`,
        [pay.booking_id]
      );

      await query(
        `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by, reason)
         VALUES ($1, 'pending', 'confirmed', 'system', 'Payment verified and captured via Razorpay')`,
        [pay.booking_id]
      );

      await query('COMMIT');

      const p = updatedPay.rows[0];
      return {
        id: p.id,
        bookingId: p.booking_id,
        amount: Number(p.amount),
        currency: 'INR',
        status: p.status,
        providerOrderId: p.provider_order_id,
        providerPaymentId: p.provider_payment_id,
        method: p.method,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }
}
