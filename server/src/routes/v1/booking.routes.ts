import { Router } from 'express';
import { BookingController } from '../../controllers/booking.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Driver bookings
router.get('/driver', BookingController.listDriver);
router.post('/', BookingController.create);
router.get('/:id', BookingController.getById);
router.patch('/:id/status', BookingController.updateStatus);

// Host bookings
router.get('/host/all', BookingController.listHost);

// Payments (Phase 7)
router.post('/:id/payment-order', BookingController.createPaymentOrder);
router.post('/payments/verify', BookingController.verifyPayment);

export default router;
