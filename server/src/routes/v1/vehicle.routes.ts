import { Router } from 'express';
import { VehicleController } from '../../controllers/vehicle.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createVehicleSchema } from '../../schemas/vehicle.schema';

const router = Router();

router.use(authenticate);

router.get('/', VehicleController.list);
router.post('/', validate({ body: createVehicleSchema }), VehicleController.create);
router.delete('/:id', VehicleController.delete);

export default router;
