import { query } from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Vehicle, ConnectorType } from '@EVNuvora/shared';

export interface CreateVehicleInput {
  make: string;
  model: string;
  year: number;
  batteryCapacityKwh?: number;
  rangeKm?: number;
  connectorTypes: ConnectorType[];
  isDefault?: boolean;
}

export class VehicleService {
  static async listByUser(userId: string): Promise<Vehicle[]> {
    const res = await query(
      `SELECT v.id, v.user_id, v.make, v.model, v.year, v.battery_capacity_kwh, v.range_km, v.is_default, v.created_at,
              COALESCE(ARRAY_AGG(c.connector_type) FILTER (WHERE c.connector_type IS NOT NULL), '{}') as connectors
       FROM vehicles v
       LEFT JOIN vehicle_connectors c ON c.vehicle_id = v.id
       WHERE v.user_id = $1
       GROUP BY v.id
       ORDER BY v.is_default DESC, v.created_at DESC`,
      [userId]
    );

    return res.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      make: row.make,
      model: row.model,
      year: row.year,
      batteryCapacityKwh: row.battery_capacity_kwh ? Number(row.battery_capacity_kwh) : null,
      rangeKm: row.range_km ? Number(row.range_km) : null,
      connectorTypes: row.connectors,
      isDefault: row.is_default,
      createdAt: row.created_at,
    }));
  }

  static async create(userId: string, input: CreateVehicleInput): Promise<Vehicle> {
    await query('BEGIN');
    try {
      if (input.isDefault) {
        await query('UPDATE vehicles SET is_default = false WHERE user_id = $1', [userId]);
      } else {
        const countRes = await query('SELECT COUNT(*) as count FROM vehicles WHERE user_id = $1', [userId]);
        if (Number(countRes.rows[0].count) === 0) {
          input.isDefault = true;
        }
      }

      const vehicleRes = await query(
        `INSERT INTO vehicles (user_id, make, model, year, battery_capacity_kwh, range_km, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, user_id, make, model, year, battery_capacity_kwh, range_km, is_default, created_at`,
        [
          userId,
          input.make,
          input.model,
          input.year,
          input.batteryCapacityKwh || null,
          input.rangeKm || null,
          input.isDefault || false,
        ]
      );
      const vehicle = vehicleRes.rows[0];

      if (input.connectorTypes && input.connectorTypes.length > 0) {
        for (const connector of input.connectorTypes) {
          await query(
            `INSERT INTO vehicle_connectors (vehicle_id, connector_type) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [vehicle.id, connector]
          );
        }
      }

      await query('COMMIT');

      return {
        id: vehicle.id,
        userId: vehicle.user_id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        batteryCapacityKwh: vehicle.battery_capacity_kwh ? Number(vehicle.battery_capacity_kwh) : null,
        rangeKm: vehicle.range_km ? Number(vehicle.range_km) : null,
        connectorTypes: input.connectorTypes || [],
        isDefault: vehicle.is_default,
        createdAt: vehicle.created_at,
      };
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }

  static async delete(userId: string, vehicleId: string): Promise<void> {
    const res = await query('DELETE FROM vehicles WHERE id = $1 AND user_id = $2 RETURNING id', [vehicleId, userId]);
    if (res.rows.length === 0) {
      throw new NotFoundError('Vehicle not found');
    }
  }
}
