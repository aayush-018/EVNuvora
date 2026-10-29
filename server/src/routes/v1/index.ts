/**
 * API v1 route registry.
 * 
 * All versioned API routes are registered here.
 * The '/api/v1' prefix is added by the main app.
 */

import { Router } from 'express';
import { healthRoutes } from './health.routes';

const router = Router();

// Health check — no authentication required
router.use('/health', healthRoutes);

// Future routes will be added here as we build each phase:
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/vehicles', vehicleRoutes);
// router.use('/chargers', chargerRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/reviews', reviewRoutes);
// router.use('/favorites', favoriteRoutes);
// router.use('/reports', reportRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/support', supportRoutes);
// router.use('/admin', adminRoutes);

export { router as v1Routes };
