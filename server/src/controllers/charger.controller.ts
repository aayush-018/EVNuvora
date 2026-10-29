import { Request, Response, NextFunction } from 'express';
import { ChargerService } from '../services/charger.service';

export class ChargerController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await ChargerService.search(req.query as any);
      res.json({
        success: true,
        data: results.chargers,
        pagination: {
          total: results.total,
          page: results.page,
          limit: results.limit,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const chargerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!chargerId) {
        res.status(400).json({ success: false, error: { message: 'Charger ID is required' } });
        return;
      }
      const viewerId = req.user?.userId;
      const charger = await ChargerService.getById(chargerId, viewerId);
      res.json({
        success: true,
        data: charger,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.userId;
      const charger = await ChargerService.create(hostId, req.body);
      res.status(201).json({
        success: true,
        data: charger,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.userId;
      const chargerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!chargerId) {
        res.status(400).json({ success: false, error: { message: 'Charger ID is required' } });
        return;
      }
      const { status, source } = req.body;
      await ChargerService.updateAvailability(chargerId, hostId, status, source);
      res.json({
        success: true,
        data: { message: 'Availability status updated successfully' },
      });
    } catch (err) {
      next(err);
    }
  }
}
