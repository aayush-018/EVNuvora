import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getPlatformStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  static async listChargers(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as any;
      const chargers = await AdminService.listChargersForModeration(status);
      res.json({ success: true, data: chargers });
    } catch (err) {
      next(err);
    }
  }

  static async moderateCharger(req: Request, res: Response, next: NextFunction) {
    try {
      const chargerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!chargerId) {
        res.status(400).json({ success: false, error: { message: 'Charger ID is required' } });
        return;
      }
      const { action } = req.body;
      const result = await AdminService.moderateCharger(chargerId, action);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
