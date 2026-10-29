import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { PaymentService } from '../services/payment.service';

export class BookingController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const { chargerId, connectorId, startTime, endTime, driverNote } = req.body;
      const booking = await BookingService.createBooking(
        driverId,
        chargerId,
        connectorId,
        startTime,
        endTime,
        driverNote
      );
      res.status(201).json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  }

  static async listDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const bookings = await BookingService.listDriverBookings(driverId);
      res.json({ success: true, data: bookings });
    } catch (err) {
      next(err);
    }
  }

  static async listHost(req: Request, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.userId;
      const bookings = await BookingService.listHostBookings(hostId);
      res.json({ success: true, data: bookings });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!bookingId) {
        res.status(400).json({ success: false, error: { message: 'Booking ID is required' } });
        return;
      }
      const booking = await BookingService.getById(bookingId, req.user!.userId);
      res.json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!bookingId) {
        res.status(400).json({ success: false, error: { message: 'Booking ID is required' } });
        return;
      }
      const { status, reason, initiator } = req.body;
      const updated = await BookingService.transitionStatus(
        bookingId,
        status,
        req.user!.userId,
        reason,
        initiator
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async createPaymentOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!bookingId) {
        res.status(400).json({ success: false, error: { message: 'Booking ID is required' } });
        return;
      }
      const order = await PaymentService.createOrder(bookingId, req.user!.userId);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, paymentId, signature, method } = req.body;
      const payment = await PaymentService.verifyPayment(orderId, paymentId, signature, method);
      res.json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  }
}
