/**
 * API v1 route registry.
 * 
 * All versioned API routes are registered here.
 * The '/api/v1' prefix is added by the main app.
 */

import { Router } from 'express';
import { healthRoutes } from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vehicleRoutes from './vehicle.routes';
import chargerRoutes from './charger.routes';

const router = Router();

// Health check — no authentication required
router.use('/health', healthRoutes);

// Phase 2 Routes: Auth, User Profiles, Vehicles
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);

// Phase 3 Routes: Chargers & PostGIS Spatial Search
router.use('/chargers', chargerRoutes);

// Future Phase Routes:
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/reviews', reviewRoutes);
// router.use('/favorites', favoriteRoutes);
// router.use('/reports', reportRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/support', supportRoutes);
// router.use('/admin', adminRoutes);

export { router as v1Routes };
