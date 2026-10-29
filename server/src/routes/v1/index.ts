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
import bookingRoutes from './booking.routes';

const router = Router();

// Health check — no authentication required
router.use('/health', healthRoutes);

// Phase 2 Routes: Auth, User Profiles, Vehicles
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);

// Phase 3 & 5 Routes: Chargers & PostGIS Spatial Search
router.use('/chargers', chargerRoutes);

// Phase 6 & 7 Routes: Bookings State Machine & Payments
router.use('/bookings', bookingRoutes);

export { router as v1Routes };
