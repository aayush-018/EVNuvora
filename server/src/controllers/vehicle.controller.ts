import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle.service';

export class VehicleController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const vehicles = await VehicleService.listByUser(userId);
      res.json({
        success: true,
        data: vehicles,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const vehicle = await VehicleService.create(userId, req.body);
      res.status(201).json({
        success: true,
        data: vehicle,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const vehicleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!vehicleId) {
        res.status(400).json({ success: false, error: { message: 'Vehicle ID is required' } });
        return;
      }
      await VehicleService.delete(userId, vehicleId);
      res.json({
        success: true,
        data: { message: 'Vehicle deleted successfully' },
      });
    } catch (err) {
      next(err);
    }
  }
}
