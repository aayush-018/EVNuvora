import { query } from '../config/database';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../utils/errors';
import { Booking, BookingStatus, CancellationInitiator } from '@EVNuvora/shared';

// Allowed state transitions for EVNuvora Booking State Machine
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled', 'expired'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'disputed'],
  rejected: [],
  cancelled: [],
  expired: [],
  completed: [],
  disputed: ['completed'],
};

export class BookingService {
  /**
   * Create a new booking request.
   */
  static async createBooking(
    driverId: string,
    chargerId: string,
    connectorId: string,
    startTimeStr: string,
    endTimeStr: string,
    driverNote?: string
  ): Promise<Booking> {
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new BadRequestError('Invalid date format for booking slot');
    }
    if (startTime >= endTime) {
      throw new BadRequestError('Start time must precede end time');
    }
    if (startTime < new Date()) {
      throw new BadRequestError('Booking start time cannot be in the past');
    }

    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    await query('BEGIN');
    try {
      // 1. Fetch charger & connector specifications
      const chargerRes = await query(
        `SELECT c.id, c.name, c.price_per_unit, c.parking_fee, c.is_reservable, c.status,
                conn.id as connector_id, conn.connector_type, conn.power_kw
         FROM chargers c
         JOIN charger_connectors conn ON conn.charger_id = c.id
         WHERE c.id = $1 AND conn.id = $2`,
        [chargerId, connectorId]
      );

      if (chargerRes.rows.length === 0) {
        throw new NotFoundError('Charger or connector not found');
      }

      const charger = chargerRes.rows[0];
      if (charger.status !== 'approved' || !charger.is_reservable) {
        throw new BadRequestError('This charger is not currently accepting slot reservations');
      }

      // 2. Conflict checking — prevent double-booking for the exact connector
      const overlapRes = await query(
        `SELECT id FROM bookings
         WHERE charger_id = $1 AND connector_id = $2
           AND status IN ('pending', 'confirmed', 'in_progress')
           AND NOT (end_time <= $3 OR start_time >= $4)`,
        [chargerId, connectorId, startTime, endTime]
      );

      if (overlapRes.rows.length > 0) {
        throw new ConflictError('This charging connector is already reserved for the selected time window');
      }

      // 3. Exact paise price calculation
      // For per_kwh or per_hour: base estimated cost calculated in paise
      const hours = durationMinutes / 60;
      const breakdownBase = Math.round(Number(charger.price_per_unit) * hours);
      const breakdownParkingFee = charger.parking_fee ? Number(charger.parking_fee) : 0;
      const breakdownServiceFee = Math.round(breakdownBase * 0.05); // 5% platform fee
      const totalAmount = breakdownBase + breakdownParkingFee + breakdownServiceFee;

      // 4. Insert booking record
      const bookingRes = await query(
        `INSERT INTO bookings (
          driver_id, charger_id, connector_id, start_time, end_time, duration_minutes,
          total_amount, breakdown_base, breakdown_parking_fee, breakdown_service_fee,
          status, driver_note
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11
        ) RETURNING id, created_at, updated_at`,
        [
          driverId,
          chargerId,
          connectorId,
          startTime,
          endTime,
          durationMinutes,
          totalAmount,
          breakdownBase,
          breakdownParkingFee,
          breakdownServiceFee,
          driverNote || null,
        ]
      );
      const booking = bookingRes.rows[0];

      // 5. Add status history audit
      await query(
        `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by)
         VALUES ($1, NULL, 'pending', $2)`,
        [booking.id, driverId]
      );

      await query('COMMIT');

      return await this.getById(booking.id, driverId);
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }

  /**
   * Transition booking state with strict validation.
   */
  static async transitionStatus(
    bookingId: string,
    targetStatus: BookingStatus,
    userId: string,
    reason?: string,
    initiator?: CancellationInitiator
  ): Promise<Booking> {
    await query('BEGIN');
    try {
      const bRes = await query(
        `SELECT b.*, c.host_id
         FROM bookings b
         JOIN chargers c ON c.id = b.charger_id
         WHERE b.id = $1`,
        [bookingId]
      );

      if (bRes.rows.length === 0) {
        throw new NotFoundError('Booking not found');
      }

      const booking = bRes.rows[0];
      const currentStatus: BookingStatus = booking.status;
      const isDriver = userId === booking.driver_id;
      const isHost = userId === booking.host_id;

      if (!isDriver && !isHost) {
        throw new ForbiddenError('You are not authorized to update this booking');
      }

      // Check state machine
      const allowed = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(targetStatus)) {
        throw new BadRequestError(`Cannot transition booking from '${currentStatus}' to '${targetStatus}'`);
      }

      // Permission constraints per role
      if (targetStatus === 'confirmed' || targetStatus === 'rejected') {
        if (!isHost) throw new ForbiddenError('Only the host can confirm or reject a booking');
      }
      if (targetStatus === 'in_progress' || targetStatus === 'completed') {
        if (!isDriver && !isHost) throw new ForbiddenError('Permission denied');
      }

      await query(
        `UPDATE bookings
         SET status = $1,
             cancellation_reason = COALESCE($2, cancellation_reason),
             cancellation_initiator = COALESCE($3, cancellation_initiator),
             updated_at = NOW()
         WHERE id = $4`,
        [targetStatus, reason || null, initiator || null, bookingId]
      );

      await query(
        `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [bookingId, currentStatus, targetStatus, userId, reason || null]
      );

      await query('COMMIT');
      return await this.getById(bookingId, userId);
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }

  /**
   * List bookings for a driver.
   */
  static async listDriverBookings(driverId: string): Promise<Booking[]> {
    const res = await query(
      `SELECT b.*, u.email as driver_email, p.full_name as driver_name,
              c.name as charger_name, conn.connector_type, pay.id as payment_id
       FROM bookings b
       JOIN users u ON u.id = b.driver_id
       LEFT JOIN user_profiles p ON p.user_id = u.id
       JOIN chargers c ON c.id = b.charger_id
       JOIN charger_connectors conn ON conn.id = b.connector_id
       LEFT JOIN payments pay ON pay.booking_id = b.id
       WHERE b.driver_id = $1
       ORDER BY b.start_time DESC`,
      [driverId]
    );

    return res.rows.map(this.mapBookingRow);
  }

  /**
   * List bookings for a host (all chargers owned by this host).
   */
  static async listHostBookings(hostId: string): Promise<Booking[]> {
    const res = await query(
      `SELECT b.*, u.email as driver_email, p.full_name as driver_name,
              c.name as charger_name, conn.connector_type, pay.id as payment_id
       FROM bookings b
       JOIN users u ON u.id = b.driver_id
       LEFT JOIN user_profiles p ON p.user_id = u.id
       JOIN chargers c ON c.id = b.charger_id
       JOIN charger_connectors conn ON conn.id = b.connector_id
       LEFT JOIN payments pay ON pay.booking_id = b.id
       WHERE c.host_id = $1
       ORDER BY b.start_time DESC`,
      [hostId]
    );

    return res.rows.map(this.mapBookingRow);
  }

  /**
   * Get single booking details.
   */
  static async getById(bookingId: string, userId?: string): Promise<Booking> {
    const res = await query(
      `SELECT b.*, u.email as driver_email, p.full_name as driver_name,
              c.name as charger_name, conn.connector_type, pay.id as payment_id
       FROM bookings b
       JOIN users u ON u.id = b.driver_id
       LEFT JOIN user_profiles p ON p.user_id = u.id
       JOIN chargers c ON c.id = b.charger_id
       JOIN charger_connectors conn ON conn.id = b.connector_id
       LEFT JOIN payments pay ON pay.booking_id = b.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError('Booking not found');
    }

    return this.mapBookingRow(res.rows[0]);
  }

  private static mapBookingRow(row: any): Booking {
    return {
      id: row.id,
      driverId: row.driver_id,
      driverName: row.driver_name || 'Driver',
      chargerId: row.charger_id,
      chargerName: row.charger_name,
      connectorId: row.connector_id,
      connectorType: row.connector_type,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: row.duration_minutes,
      totalAmount: Number(row.total_amount),
      breakdownBase: Number(row.breakdown_base),
      breakdownParkingFee: Number(row.breakdown_parking_fee),
      breakdownServiceFee: Number(row.breakdown_service_fee),
      status: row.status,
      cancellationReason: row.cancellation_reason,
      cancellationInitiator: row.cancellation_initiator,
      hostNote: row.host_note,
      driverNote: row.driver_note,
      paymentId: row.payment_id || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
