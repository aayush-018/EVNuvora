import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// In production, ensure admin role. For initial setup, authenticated access permitted.
router.get('/stats', AdminController.getStats);
router.get('/chargers', AdminController.listChargers);
router.patch('/chargers/:id/moderate', authenticate, requireRole('admin'), AdminController.moderateCharger);

export default router;
