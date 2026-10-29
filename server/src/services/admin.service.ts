import { query } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { ChargerStatus } from '@EVNuvora/shared';

export class AdminService {
  /**
   * Get platform overview metrics.
   */
  static async getPlatformStats(): Promise<{
    totalUsers: number;
    totalDrivers: number;
    totalHosts: number;
    totalChargers: number;
    pendingReviews: number;
    totalBookings: number;
    completedBookings: number;
    totalRevenuePaise: number;
  }> {
    const usersRes = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'driver' OR role = 'driver_host') as drivers,
        COUNT(*) FILTER (WHERE role = 'host' OR role = 'driver_host') as hosts
       FROM users`
    );

    const chargersRes = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending_review' OR verification_status = 'pending') as pending
       FROM chargers`
    );

    const bookingsRes = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as gmv
       FROM bookings`
    );

    const u = usersRes.rows[0];
    const c = chargersRes.rows[0];
    const b = bookingsRes.rows[0];

    return {
      totalUsers: parseInt(u.total, 10),
      totalDrivers: parseInt(u.drivers, 10),
      totalHosts: parseInt(u.hosts, 10),
      totalChargers: parseInt(c.total, 10),
      pendingReviews: parseInt(c.pending, 10),
      totalBookings: parseInt(b.total, 10),
      completedBookings: parseInt(b.completed, 10),
      totalRevenuePaise: parseInt(b.gmv, 10),
    };
  }

  /**
   * List chargers requiring moderation or active in review queue.
   */
  static async listChargersForModeration(statusFilter?: ChargerStatus) {
    const filter = statusFilter ? 'WHERE c.status = $1' : '';
    const params = statusFilter ? [statusFilter] : [];

    const res = await query(
      `SELECT c.id, c.name, c.address, c.approximate_area, c.listing_type, c.status,
              c.verification_status, c.charging_type, c.price_per_unit, c.created_at,
              u.email as host_email, p.full_name as host_name,
              COALESCE(
                (SELECT json_agg(json_build_object(
                  'connectorType', conn.connector_type,
                  'powerKw', conn.power_kw,
                  'quantity', conn.quantity
                )) FROM charger_connectors conn WHERE conn.charger_id = c.id),
                '[]'::json
              ) as connectors
       FROM chargers c
       JOIN users u ON u.id = c.host_id
       LEFT JOIN user_profiles p ON p.user_id = u.id
       ${filter}
       ORDER BY c.created_at DESC
       LIMIT 50`,
      params
    );

    return res.rows;
  }

  /**
   * Approve or reject a charger listing.
   */
  static async moderateCharger(
    chargerId: string,
    action: 'approve' | 'reject' | 'suspend'
  ) {
    const statusMap: Record<string, { status: ChargerStatus; verification: string }> = {
      approve: { status: 'approved', verification: 'verified' },
      reject: { status: 'rejected', verification: 'rejected' },
      suspend: { status: 'suspended', verification: 'rejected' },
    };

    const target = statusMap[action] || { status: 'approved', verification: 'verified' };
    const res = await query(
      `UPDATE chargers
       SET status = $1,
           verification_status = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, status, verification_status`,
      [target.status, target.verification, chargerId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError('Charger listing not found');
    }

    return res.rows[0];
  }
}
