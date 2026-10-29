import { Router } from 'express';
import { ChargerController } from '../../controllers/charger.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { chargerSearchQuerySchema, createChargerSchema, updateAvailabilitySchema } from '../../schemas/charger.schema';

const router = Router();

// Public discovery endpoints
router.get('/search', validate({ query: chargerSearchQuerySchema }), ChargerController.search);
router.get('/:id', ChargerController.getById);

// Host protected actions
router.post(
  '/',
  authenticate,
  requireRole('host', 'driver_host', 'admin'),
  validate({ body: createChargerSchema }),
  ChargerController.create
);

router.patch(
  '/:id/availability',
  authenticate,
  requireRole('host', 'driver_host', 'admin'),
  validate({ body: updateAvailabilitySchema }),
  ChargerController.updateAvailability
);

export default router;
